"use client";

import { useState } from "react";
import { Plan } from "@prisma/client";

type Props = {
  plan: Plan;
  subscribed: boolean;
  trialActive: boolean;
  daysLeft: number;
  simulationsUsed: number;
  simulationsLimit: number | null;
  periodEnd: string | null;
  success: boolean;
  canceled: boolean;
};

export function BillingClient({
  plan,
  subscribed,
  trialActive,
  daysLeft,
  simulationsUsed,
  simulationsLimit,
  periodEnd,
  success,
  canceled,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  const planLabel = {
    FREE: "Gratuito",
    TRIAL: "Trial",
    PRO: "PRO",
  }[plan];

  return (
    <main className="min-h-screen px-4 py-12" style={{ background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-lg flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Plano e cobrança
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
            Gerencie sua assinatura do Dicto.
          </p>
        </div>

        {/* Feedback de redirecionamento Stripe */}
        {success && (
          <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "var(--color-successBg)", color: "var(--color-successText)" }}>
            ✅ Assinatura ativada! Bem-vindo ao Dicto PRO.
          </div>
        )}
        {canceled && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--color-warningBg)", color: "var(--color-warningText)" }}>
            Pagamento cancelado. Sua assinatura não foi alterada.
          </div>
        )}

        {/* Card de plano atual */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: "var(--color-textSecondary)" }}>
              Plano atual
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
            >
              {planLabel}
            </span>
          </div>

          {/* Status */}
          {trialActive && (
            <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
              Trial ativo — <strong>{daysLeft} {daysLeft === 1 ? "dia" : "dias"}</strong> restantes.
            </p>
          )}
          {subscribed && periodEnd && (
            <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
              Renova em <strong>{new Date(periodEnd).toLocaleDateString("pt-BR")}</strong>.
            </p>
          )}
          {plan === Plan.FREE && (
            <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
              Simulações este mês:{" "}
              <strong>
                {simulationsUsed}/{simulationsLimit}
              </strong>
            </p>
          )}

          {/* CTA */}
          {!subscribed && (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
            >
              {loading ? "Aguarde..." : "Assinar Dicto PRO — R$ 19,90/mês"}
            </button>
          )}

          {subscribed && (
            <button
              onClick={handlePortal}
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold border transition-colors disabled:opacity-60 hover:bg-gray-50"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}
            >
              {loading ? "Aguarde..." : "Gerenciar assinatura"}
            </button>
          )}
        </div>

        {/* Tabela de planos */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
            Comparar planos
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--color-textSecondary)" }}>
                <th className="text-left py-1 font-medium">Recurso</th>
                <th className="text-center py-1 font-medium">Gratuito</th>
                <th className="text-center py-1 font-medium">PRO</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--color-textPrimary)" }}>
              {[
                ["Simulações/mês", "2", "Ilimitadas"],
                ["Feedback por IA", "✓", "✓"],
                ["Histórico completo", "—", "✓"],
                ["Perguntas personalizadas", "✓", "✓"],
                ["Preço", "Grátis", "R$ 19,90/mês"],
              ].map(([feature, free, pro]) => (
                <tr key={feature} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td className="py-2">{feature}</td>
                  <td className="text-center py-2">{free}</td>
                  <td className="text-center py-2 font-medium">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
