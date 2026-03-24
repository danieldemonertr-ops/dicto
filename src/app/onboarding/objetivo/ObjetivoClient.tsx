"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  {
    value: "ENTREVISTA_BREVE",
    label: "Tenho uma entrevista em breve",
    emoji: "⚡",
    desc: "Quero praticar agora mesmo",
  },
  {
    value: "PREPARACAO",
    label: "Quero me preparar com antecedência",
    emoji: "📅",
    desc: "Ainda tenho tempo, mas quero me adiantar",
  },
  {
    value: "APRESENTACAO",
    label: "Tenho uma apresentação acadêmica",
    emoji: "🎓",
    desc: "TCC, seminário ou banca",
  },
  {
    value: "EXPLORANDO",
    label: "Só estou explorando",
    emoji: "🔍",
    desc: "Curiosidade — quero ver como funciona",
  },
];

export function ObjetivoClient() {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleStart() {
    if (!selected || loading) return;
    setLoading(true);

    const res = await fetch("/api/onboarding/objetivo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objetivo: selected }),
    });

    // Limpa o contexto pendente do hub após onboarding completo
    try { sessionStorage.removeItem("dicto_contexto_pendente"); } catch { /* noop */ }

    const data = await res.json();
    router.push(data.redirectTo ?? "/dashboard");
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Progresso */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs" style={{ color: "var(--color-textSecondary)" }}>
            <span>Etapa 3 de 3</span>
            <span>99%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: "99%", background: "var(--color-primary)" }}
            />
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Qual é o seu objetivo agora?
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
            Vamos te levar direto para o que faz mais sentido.
          </p>
        </div>

        {/* Opções */}
        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className="flex items-start gap-4 rounded-xl p-4 text-left transition-all"
                style={{
                  background: "var(--color-surface)",
                  border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                  boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)",
                }}
              >
                <span className="text-2xl mt-0.5">{opt.emoji}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                    {opt.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                    {opt.desc}
                  </p>
                </div>
                <div className="ml-auto mt-0.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: isSelected ? "var(--color-primary)" : "transparent",
                      border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                    }}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full" style={{ background: "white" }} />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!selected || loading}
          className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: "var(--color-primary)", color: "white" }}
        >
          {loading ? "Preparando..." : "Começar minha simulação →"}
        </button>
      </div>
    </main>
  );
}
