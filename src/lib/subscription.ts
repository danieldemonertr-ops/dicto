import { Plan } from "@prisma/client";

type UserSubscription = {
  plan: Plan;
  trialEndsAt: Date | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: Date | null;
};

/** Trial ainda está dentro do prazo de 14 dias */
export function isTrialActive(user: UserSubscription): boolean {
  if (user.plan !== Plan.TRIAL) return false;
  if (!user.trialEndsAt) return false;
  return user.trialEndsAt > new Date();
}

/** Usuário tem assinatura PRO ativa */
export function isSubscribed(user: UserSubscription): boolean {
  if (user.plan !== Plan.PRO) return false;
  if (!user.stripeSubscriptionId) return false;
  if (!user.stripeCurrentPeriodEnd) return false;
  return user.stripeCurrentPeriodEnd > new Date();
}

/** Tem acesso completo (trial ativo OU PRO assinado) */
export function hasAccess(user: UserSubscription): boolean {
  return isTrialActive(user) || isSubscribed(user);
}

/** Dias restantes no trial (0 se expirado ou não for trial) */
export function daysLeftInTrial(user: UserSubscription): number {
  if (!isTrialActive(user) || !user.trialEndsAt) return 0;
  const diff = user.trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
