"use client";

import { useRouter } from "next/navigation";

type PaywallGateProps = {
  reason: "trial_expired" | "limit_reached";
  children?: React.ReactNode;
};

const COPY = {
  trial_expired: {
    emoji: "⏰",
    title: "Seu período de trial acabou",
    description:
      "Você usou seus 14 dias gratuitos. Assine o Dicto PRO para continuar praticando sem limites.",
    cta: "Assinar por R$ 19,90/mês",
  },
  limit_reached: {
    emoji: "🚀",
    title: "Você atingiu o limite do plano gratuito",
    description:
      "O plano gratuito permite 2 simulações por mês. Faça upgrade para praticar sem limites e acessar seu histórico completo.",
    cta: "Fazer upgrade para PRO",
  },
} as const;

export function PaywallGate({ reason, children }: PaywallGateProps) {
  const router = useRouter();
  const copy = COPY[reason];

  if (children) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center flex flex-col gap-5"
        style={{
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="text-5xl">{copy.emoji}</div>

        <div className="flex flex-col gap-2">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--color-textPrimary)" }}
          >
            {copy.title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-textSecondary)" }}>
            {copy.description}
          </p>
        </div>

        <button
          onClick={() => router.push("/settings/billing")}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
        >
          {copy.cta}
        </button>

        <button
          onClick={() => router.push("/")}
          className="text-xs underline"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
