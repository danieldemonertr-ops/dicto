import Stripe from "stripe";

// Stripe SDK v20 — API version 2026-02-25.clover
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});
