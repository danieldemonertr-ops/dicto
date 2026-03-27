import { prisma } from "./prisma";
import { BadgeType } from "@prisma/client";

// ─── Streak helpers ───────────────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

// ─── Points per score ─────────────────────────────────────────────────────────

export function pointsForSimulation(score: number | null): number {
  if (score == null) return 25;
  if (score >= 80) return 100;
  if (score >= 60) return 50;
  return 25;
}

// ─── Daily check-in (streak + +10 pts) ───────────────────────────────────────

export async function processDailyCheckin(userId: string): Promise<{
  streakUpdated: boolean;
  newStreak: number;
  pointsEarned: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActivityAt: true },
  });
  if (!user) return { streakUpdated: false, newStreak: 0, pointsEarned: 0 };

  const now = new Date();

  // Already checked in today → no update
  if (user.lastActivityAt && isSameDay(user.lastActivityAt, now)) {
    return { streakUpdated: false, newStreak: user.currentStreak, pointsEarned: 0 };
  }

  let newStreak: number;
  if (!user.lastActivityAt) {
    newStreak = 1;
  } else if (isYesterday(user.lastActivityAt)) {
    newStreak = user.currentStreak + 1;
  } else {
    newStreak = 1; // streak broken
  }

  const newLongest = Math.max(newStreak, user.longestStreak);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityAt: now,
        points: { increment: 10 },
      },
    }),
    prisma.pointEvent.create({
      data: { userId, points: 10, reason: "daily_checkin" },
    }),
  ]);

  return { streakUpdated: true, newStreak, pointsEarned: 10 };
}

// ─── Award points for simulation ─────────────────────────────────────────────

export async function processSimulationPoints(
  userId: string,
  score: number | null,
  durationMs?: number
): Promise<{ pointsEarned: number }> {
  const pts = pointsForSimulation(score);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: pts } },
    }),
    prisma.pointEvent.create({
      data: { userId, points: pts, reason: "simulation_complete" },
    }),
  ]);
  return { pointsEarned: pts };
}

// ─── Badge definitions ────────────────────────────────────────────────────────

export const BADGE_META: Record<
  BadgeType,
  { emoji: string; name: string; desc: string }
> = {
  BATMAN: { emoji: "🦇", name: "Batman", desc: "Fez atividade entre 22h e 6h" },
  GALO: { emoji: "🐓", name: "Galo", desc: "Fez atividade entre 5h e 8h" },
  POLVO: { emoji: "🐙", name: "Polvo", desc: "3 tipos diferentes de atividade no mesmo dia" },
  MARATONISTA: { emoji: "🏃", name: "Maratonista", desc: "30 dias de streak" },
  SPEEDRUN: { emoji: "⚡", name: "Speedrun", desc: "Completou simulação em menos de 5 minutos" },
  SEM_DORMIR: { emoji: "☕", name: "Sem Dormir", desc: "Atividade em 3 turnos no mesmo dia" },
  CHAD: { emoji: "💪", name: "Chad", desc: "100 simulações no total" },
  NPC_NAO: { emoji: "🎯", name: "NPC Não", desc: "Feedback acima de 90 pontos" },
  GIGACHAD: { emoji: "👑", name: "GigaChad", desc: "Streak de 100 dias" },
  MAIN_CHARACTER: { emoji: "⭐", name: "Main Character", desc: "Perfil completamente personalizado" },
  SKILL_ISSUE_RESOLVIDO: {
    emoji: "📈",
    name: "Skill Issue Resolvido",
    desc: "Melhorou o score em 30+ pontos entre duas simulações",
  },
};

// ─── Check and award badges after simulation ──────────────────────────────────

export async function checkAndAwardBadges(
  userId: string,
  opts: {
    score?: number | null;
    durationMs?: number;
    completedAt?: Date;
  }
): Promise<BadgeType[]> {
  const earned: BadgeType[] = [];

  const [user, existing, totalSims, todaySims] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, username: true, bio: true, image: true },
    }),
    prisma.userBadge.findMany({ where: { userId }, select: { badge: true } }),
    prisma.simulationSession.count({ where: { userId, completedAt: { not: null } } }),
    prisma.simulationSession.findMany({
      where: {
        userId,
        completedAt: { gte: startOfDay(new Date()) },
      },
      select: { tipo: true },
    }),
  ]);

  if (!user) return [];
  const existingSet = new Set(existing.map((b) => b.badge));

  function candidate(badge: BadgeType, condition: boolean) {
    if (condition && !existingSet.has(badge)) earned.push(badge);
  }

  const hour = (opts.completedAt ?? new Date()).getHours();

  candidate("BATMAN", hour >= 22 || hour < 6);
  candidate("GALO", hour >= 5 && hour < 8);
  candidate("MARATONISTA", (user.currentStreak ?? 0) >= 30);
  candidate("GIGACHAD", (user.currentStreak ?? 0) >= 100);
  candidate("CHAD", totalSims >= 100);
  candidate("NPC_NAO", (opts.score ?? 0) >= 90);

  if (opts.durationMs != null) {
    candidate("SPEEDRUN", opts.durationMs <= 5 * 60 * 1000);
  }

  // Polvo: 3 different tipos today
  const tiposHoje = new Set(todaySims.map((s) => s.tipo));
  candidate("POLVO", tiposHoje.size >= 3);

  // Main character: has username, bio, and image
  candidate(
    "MAIN_CHARACTER",
    !!(user.username && user.bio && user.image)
  );

  if (earned.length > 0) {
    await prisma.userBadge.createMany({
      data: earned.map((badge) => ({ userId, badge })),
      skipDuplicates: true,
    });
  }

  return earned;
}
