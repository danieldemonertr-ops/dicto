import { Plan } from "@prisma/client";
import { hasAccess } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

// ─── Limites por plano ────────────────────────────────────────────────────────
// FREE: 2 simulações/mês | TRIAL: ilimitado | PRO: ilimitado

export const PLAN_LIMITS: Record<Plan, { simulationsPerMonth: number }> = {
  FREE: { simulationsPerMonth: 2 },
  TRIAL: { simulationsPerMonth: Infinity },
  PRO: { simulationsPerMonth: Infinity },
};

type UserForLimit = {
  id: string;
  plan: Plan;
  trialEndsAt: Date | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  simulationsThisMonth: number;
  simulationsResetAt: Date;
};

export type LimitCheckResult =
  | { allowed: true }
  | { allowed: false; reason: "trial_expired" | "limit_reached" };

/** Verifica se o usuário pode iniciar mais uma simulação */
export async function checkUsageLimit(user: UserForLimit): Promise<LimitCheckResult> {
  // Trial expirado e não PRO → bloqueia
  if (user.plan === Plan.TRIAL && !hasAccess(user)) {
    return { allowed: false, reason: "trial_expired" };
  }

  // PRO ou TRIAL ativo → sempre libera
  if (hasAccess(user)) return { allowed: true };

  // FREE — verifica e reseta contador mensal se necessário
  const now = new Date();
  const resetAt = new Date(user.simulationsResetAt);
  const needsReset =
    now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();

  let count = user.simulationsThisMonth;

  if (needsReset) {
    await prisma.user.update({
      where: { id: user.id },
      data: { simulationsThisMonth: 0, simulationsResetAt: now },
    });
    count = 0;
  }

  const limit = PLAN_LIMITS[Plan.FREE].simulationsPerMonth;
  if (count >= limit) return { allowed: false, reason: "limit_reached" };

  return { allowed: true };
}

/** Incrementa contador de uso após simulação concluída */
export async function incrementUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { simulationsThisMonth: { increment: 1 } },
  });
}
