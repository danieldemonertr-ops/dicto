import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { daysLeftInTrial, isTrialActive } from "@/lib/subscription";
import { DashboardHeader } from "./DashboardHeader";
import { DailyCheckin } from "./DailyCheckin";
import { DashboardHub } from "./DashboardHub";

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      plan: true,
      trialEndsAt: true,
      onboardingCompletedAt: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      points: true,
      currentStreak: true,
      profile: { select: { objetivoImediato: true } },
    },
  });

  if (!user?.onboardingCompletedAt) redirect("/onboarding/contexto");

  // Fetch data in parallel
  const [simulations, totalSims, groupMembers] = await Promise.all([
    prisma.simulationSession.findMany({
      where: { userId: session.user.id, completedAt: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, tipo: true, score: true, createdAt: true },
    }),
    prisma.simulationSession.count({ where: { userId: session.user.id } }),
    prisma.groupMember.findMany({
      where: { userId: session.user.id },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            discipline: true,
            imageUrl: true,
            deliveryDate: true,
            _count: { select: { members: true } },
          },
        },
      },
      take: 10,
    }),
  ]);

  const firstName = user.name?.split(" ")[0] ?? "estudante";
  const trialActive = isTrialActive(user);
  const daysLeft = trialActive ? daysLeftInTrial(user) : 0;
  const showTrialBanner = trialActive && daysLeft > 0;
  const isEntrevistaBreve = user.profile?.objetivoImediato === "ENTREVISTA_BREVE";
  const isFirstAccess = totalSims === 0;

  const greeting = isFirstAccess
    ? `Olá, ${firstName}! Vamos começar?`
    : `Bem-vindo de volta, ${firstName}!`;

  const groups = groupMembers.map((gm) => ({
    id: gm.group.id,
    name: gm.group.name,
    discipline: gm.group.discipline,
    imageUrl: gm.group.imageUrl,
    deliveryDate: gm.group.deliveryDate ? gm.group.deliveryDate.toISOString() : null,
    memberCount: gm.group._count.members,
  }));

  const usedTipos = simulations.map((s) => s.tipo);

  return (
    <main className="min-h-screen" style={{ background: "#F7F7F2" }}>
      <DailyCheckin />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <DashboardHeader
        name={user.name ?? firstName}
        email={user.email ?? session.user.email ?? undefined}
      />

      {/* ── Trial banner ───────────────────────────────────────────────── */}
      {showTrialBanner && (
        <div
          className="px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: "var(--color-warningBg)", borderBottom: "1px solid var(--color-warning)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-warningText)" }}>
            ⏳ Você tem{" "}
            <strong>
              {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
            </strong>{" "}
            de acesso gratuito restantes.
          </p>
          <Link
            href="/settings/billing"
            className="text-xs font-semibold whitespace-nowrap rounded-lg px-3 py-1.5 transition-opacity hover:opacity-80"
            style={{ background: "var(--color-warning)", color: "var(--color-warningText)" }}
          >
            Fazer upgrade
          </Link>
        </div>
      )}

      {/* ── Hub ────────────────────────────────────────────────────────── */}
      <DashboardHub
        greeting={greeting}
        currentStreak={user.currentStreak ?? 0}
        totalSims={totalSims}
        points={user.points ?? 0}
        groups={groups}
        recentSims={simulations}
        usedTipos={usedTipos}
        isEntrevistaBreve={isEntrevistaBreve}
      />
    </main>
  );
}
