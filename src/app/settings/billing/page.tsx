import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isSubscribed, isTrialActive, daysLeftInTrial } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/limits";
import { BillingClient } from "./BillingClient";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      trialEndsAt: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      simulationsThisMonth: true,
    },
  });
  if (!user) redirect("/login");

  const params = await searchParams;
  const subscribed = isSubscribed(user);
  const trialActive = isTrialActive(user);
  const daysLeft = daysLeftInTrial(user);
  const limit = PLAN_LIMITS[user.plan].simulationsPerMonth;

  return (
    <BillingClient
      plan={user.plan}
      subscribed={subscribed}
      trialActive={trialActive}
      daysLeft={daysLeft}
      simulationsUsed={user.simulationsThisMonth}
      simulationsLimit={limit === Infinity ? null : limit}
      periodEnd={user.stripeCurrentPeriodEnd?.toISOString() ?? null}
      success={params.success === "1"}
      canceled={params.canceled === "1"}
    />
  );
}
