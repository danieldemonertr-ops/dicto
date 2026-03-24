import Stripe from "stripe";

// Stripe SDK v20 — API version 2026-02-25.clover
// Fallback vazio evita erro no build quando a variável não está configurada.
// Chamadas reais falharão com "Invalid API Key" se STRIPE_SECRET_KEY não existir em produção.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_build_placeholder", {
  apiVersion: "2026-02-25.clover",
});
