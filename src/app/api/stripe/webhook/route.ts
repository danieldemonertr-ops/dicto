import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";
import type Stripe from "stripe";

// Stripe exige o body raw para validar a assinatura
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      // Busca detalhes da subscription para pegar period end
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);

      await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: {
          plan: Plan.PRO,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: periodEnd,
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
      if (!invoice.subscription) break;

      const subscriptionId = invoice.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);

      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          plan: Plan.PRO,
          stripeCurrentPeriodEnd: periodEnd,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);

      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: periodEnd,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: Plan.FREE,
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
