"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "ENTREVISTA_ESTAGIO", label: "Entrevista de estágio", emoji: "💼" },
  { value: "SEMINARIO", label: "Seminário ou apresentação acadêmica", emoji: "🎤" },
  { value: "TCC", label: "Defesa de TCC", emoji: "🎓" },
  { value: "ENTREVISTA_EMPREGO", label: "Entrevista de emprego", emoji: "🏢" },
  { value: "OUTRO", label: "Outro", emoji: "✨" },
];

interface ContextoPendente {
  tipo: string;
  label: string;
  onboarding: string;
}

export function ContextoClient() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [contextoPendente, setContextoPendente] = useState<ContextoPendente | null>(null);
  const router = useRouter();

  // Lê o contexto salvo no hub e pré-seleciona a opção correspondente
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("dicto_contexto_pendente");
      if (raw) {
        const parsed: ContextoPendente = JSON.parse(raw);
        setContextoPendente(parsed);
        if (parsed.onboarding) {
          setSelected([parsed.onboarding]);
        }
      }
    } catch {
      // sessionStorage indisponível
    }
  }, []);

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleContinue() {
    if (selected.length === 0 || loading) return;
    setLoading(true);
    await fetch("/api/onboarding/contexto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contextos: selected }),
    });
    router.push("/onboarding/perfil");
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
            <span>Etapa 1 de 3</span>
            <span>33%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: "33%", background: "var(--color-primary)" }}
            />
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Para que você vai usar o Dicto?
          </h1>
          {contextoPendente ? (
            <p className="text-sm mt-1" style={{ color: "var(--color-primary)" }}>
              Você escolheu <strong>{contextoPendente.label}</strong> — pode mudar se quiser.
            </p>
          ) : (
            <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
              Vamos personalizar sua experiência. Pode marcar mais de um.
            </p>
          )}
        </div>

        {/* Opções */}
        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="flex items-center gap-4 rounded-xl p-4 text-left transition-all"
                style={{
                  background: "var(--color-surface)",
                  border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                  boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)",
                }}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-textPrimary)" }}
                >
                  {opt.label}
                </span>
                <div className="ml-auto">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{
                      background: isSelected ? "var(--color-primary)" : "transparent",
                      border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={selected.length === 0 || loading}
          className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: "var(--color-primary)", color: "white" }}
        >
          {loading ? "Salvando..." : "Continuar →"}
        </button>
      </div>
    </main>
  );
}
