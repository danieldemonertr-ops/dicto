"use client";

import { useState } from "react";
import Link from "next/link";

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="8" fill="#1D9E75" fillOpacity="0.12" />
    <path d="M4.5 8.25l2.25 2.25 4.5-4.5" stroke="#1D9E75" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CHECK_WHITE = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.2)" />
    <path d="M4.5 8.25l2.25 2.25 4.5-4.5" stroke="#fff" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CHECK_GRAY = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="8" fill="#F3F4F6" />
    <path d="M4.5 8.25l2.25 2.25 4.5-4.5" stroke="#9CA3AF" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const proMonthly = "R$ 19,90";
  const proAnnual = "R$ 14,90";
  const proPrice = annual ? proAnnual : proMonthly;
  const proPeriod = annual ? "por mês · cobrado anualmente" : "por mês";

  return (
    <section id="planos" className="px-4 py-20" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Preço simples, sem surpresas
          </h2>
          <p className="text-base" style={{ color: "var(--color-textSecondary)" }}>
            Comece grátis. Faça upgrade quando quiser praticar mais.
          </p>
        </div>

        {/* Toggle mensal / anual */}
        <div className="flex items-center justify-center gap-3">
          <span
            className="text-sm font-medium"
            style={{ color: annual ? "#9CA3AF" : "#111312" }}
          >
            Mensal
          </span>
          <button
            onClick={() => setAnnual((v) => !v)}
            aria-label="Alternar entre mensal e anual"
            className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ background: annual ? "#1D9E75" : "#D1D5DB" }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
              style={{ transform: annual ? "translateX(24px)" : "translateX(0)" }}
            />
          </button>
          <span
            className="text-sm font-medium flex items-center gap-1.5"
            style={{ color: annual ? "#111312" : "#9CA3AF" }}
          >
            Anual
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(29,158,117,0.1)", color: "#1D9E75" }}
            >
              até 25% off
            </span>
          </span>
        </div>

        {/* Cards — mobile: horizontal scroll (Gratuito first), desktop: 3-col grid */}
        <p className="sm:hidden text-center text-xs pb-1" style={{ color: "var(--color-textSecondary)" }}>
          ← arraste para ver outros planos →
        </p>
        <div className="flex overflow-x-auto gap-4 pb-3 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:pb-0 items-stretch">

          {/* ── Gratuito ─────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-7 flex-shrink-0 w-[82vw] sm:w-auto snap-center flex flex-col gap-5 border"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold" style={{ color: "var(--color-textSecondary)" }}>
                Gratuito
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                  R$ 0
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                para sempre
              </p>
            </div>

            <ul className="flex flex-col gap-2.5 flex-1">
              {[
                "2 simulações por mês",
                "Perguntas personalizadas por IA",
                "Feedback por resposta",
                "Score 0–100",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-textPrimary)" }}>
                  {CHECK}
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/hub"
              className="w-full rounded-xl py-3 text-sm font-semibold text-center transition-colors border mt-auto"
              style={{
                borderColor: "#E5E7EB",
                color: "#374151",
                background: "#F9FAFB",
              }}
            >
              Começar grátis
            </Link>
          </div>

          {/* ── PRO (destaque) ────────────────────────────────────── */}
          <div
            className="rounded-2xl p-7 flex-shrink-0 w-[82vw] sm:w-auto snap-center flex flex-col gap-5 relative overflow-hidden"
            style={{
              background: "#5DE08A",
              boxShadow: "0 8px 32px rgba(93,224,138,0.35)",
            }}
          >
            {/* Badge recomendado */}
            <div
              className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.12)", color: "#fff" }}
            >
              ⭐ Recomendado
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.6)" }}>PRO</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold" style={{ color: "#111312" }}>{proPrice}</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.55)" }}>{proPeriod}</p>
              {annual && (
                <p className="text-xs font-semibold mt-1" style={{ color: "rgba(0,0,0,0.7)" }}>
                  Economize R$ 60 por ano
                </p>
              )}
            </div>

            <ul className="flex flex-col gap-2.5 flex-1">
              {[
                "Simulações ilimitadas",
                "Perguntas personalizadas por IA",
                "Feedback por resposta",
                "Score 0–100",
                "Histórico completo",
                "Cancele quando quiser",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#111312" }}>
                  {CHECK_WHITE}
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/settings/billing"
              className="w-full rounded-xl py-3 text-sm font-semibold text-center transition-opacity hover:opacity-90 mt-auto"
              style={{ background: "#111312", color: "#5DE08A" }}
            >
              Assinar PRO
            </Link>
          </div>

          {/* ── Empresa ──────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-7 flex-shrink-0 w-[82vw] sm:w-auto snap-center flex flex-col gap-5 border"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold" style={{ color: "var(--color-textSecondary)" }}>
                Empresa
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                  Sob consulta
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                para equipes com 10+ usuários
              </p>
            </div>

            <ul className="flex flex-col gap-2.5 flex-1">
              {[
                "Tudo do plano PRO",
                "Painel de gestão da equipe",
                "Relatórios de progresso",
                "Integração com plataformas LMS",
                "Suporte dedicado via WhatsApp",
                "Onboarding personalizado",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-textPrimary)" }}>
                  {CHECK_GRAY}
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="mailto:contato@dicto.app"
              className="w-full rounded-xl py-3 text-sm font-semibold text-center transition-colors border mt-auto hover:bg-gray-50"
              style={{
                borderColor: "#E5E7EB",
                color: "#374151",
                background: "#F9FAFB",
              }}
            >
              Falar com a gente
            </a>
          </div>

        </div>

        <p className="text-center text-sm" style={{ color: "var(--color-textSecondary)" }}>
          Novos usuários ganham <strong>14 dias de acesso PRO gratuito</strong> ao criar conta.
        </p>
      </div>
    </section>
  );
}
