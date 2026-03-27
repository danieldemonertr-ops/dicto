"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "@phosphor-icons/react";

interface HubClientProps {
  isLoggedIn: boolean;
}

export function HubClient({ isLoggedIn }: HubClientProps) {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      {/* ── Header convidado ── */}
      <header
        className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <span className="text-lg font-bold" style={{ color: "var(--color-textPrimary)" }}>
          Dicto
        </span>

        <div className="flex items-center gap-3">
          {/* Sininho desativado */}
          <button
            disabled
            className="w-9 h-9 flex items-center justify-center rounded-full opacity-30 cursor-default"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            aria-label="Notificações indisponíveis no modo convidado"
          >
            <Bell size={18} weight="bold" />
          </button>

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-black/5"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-textPrimary)" }}
          >
            Faça login
          </Link>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <div className="flex-1 px-5 py-8 flex flex-col items-center">
        <div className="w-full max-w-sm flex flex-col gap-8">
          {/* Intro */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(107,114,128,0.1)", color: "var(--color-textSecondary)" }}
              >
                👤 Modo convidado
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
              O que você quer praticar?
            </h1>
            <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
              Comece agora, sem precisar de conta
            </p>
          </div>

          {/* Opções */}
          <div className="flex flex-col gap-3">
            {/* Apresentação de trabalhos */}
            <button
              onClick={() => router.push("/hub/apresentacao")}
              className="w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-all hover:shadow-md active:scale-[0.99]"
              style={{
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "var(--color-bg)" }}
              >
                📋
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                  Apresentação de trabalhos
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                  Prepare sua fala com ajuda da IA
                </p>
              </div>
              <span className="text-base shrink-0" style={{ color: "var(--color-textSecondary)" }}>→</span>
            </button>

            {/* Entrevista de estágio */}
            <button
              onClick={() => router.push("/simulador/nova")}
              className="w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-all hover:shadow-md active:scale-[0.99]"
              style={{
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "var(--color-bg)" }}
              >
                💼
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                  Entrevista de estágio
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                  Simule perguntas reais da sua vaga
                </p>
              </div>
              <span className="text-base shrink-0" style={{ color: "var(--color-textSecondary)" }}>→</span>
            </button>
          </div>


        </div>
      </div>
    </main>
  );
}
