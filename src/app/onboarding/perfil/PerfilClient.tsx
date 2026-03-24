"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SEMESTRES = [
  "1º semestre", "2º semestre", "3º semestre", "4º semestre",
  "5º semestre", "6º semestre", "7º semestre", "8º semestre",
  "9º semestre", "10º semestre", "Já me formei",
];

const SEMESTRE_VALUES = ["1","2","3","4","5","6","7","8","9","10","FORMADO"];

const NIVEIS = [
  { value: "INICIANTE", label: "Iniciante", desc: "Fico nervoso e me perco nas palavras" },
  { value: "EM_DESENVOLVIMENTO", label: "Em desenvolvimento", desc: "Me saio bem às vezes, mas preciso melhorar" },
  { value: "CONFIANTE", label: "Confiante", desc: "Me comunico bem, quero só afiar" },
];

export function PerfilClient() {
  const [curso, setCurso] = useState("");
  const [semestre, setSemestre] = useState("");
  const [nivel, setNivel] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canContinue = curso.trim() && semestre && nivel;

  async function handleContinue() {
    if (!canContinue || loading) return;
    setLoading(true);
    await fetch("/api/onboarding/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curso, semestre, nivelAutopercebido: nivel }),
    });
    router.push("/onboarding/objetivo");
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
            <span>Etapa 2 de 3</span>
            <span>66%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: "66%", background: "var(--color-primary)" }}
            />
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Conte um pouco sobre você
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
            Essas informações ajudam a IA a calibrar as perguntas.
          </p>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-5">
          {/* Curso */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Qual é o seu curso?
            </label>
            <input
              type="text"
              placeholder="Ex: Administração, Engenharia de Software..."
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-textPrimary)",
                background: "var(--color-surface)",
              }}
            />
          </div>

          {/* Semestre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Em qual semestre você está?
            </label>
            <select
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition appearance-none"
              style={{
                borderColor: "var(--color-border)",
                color: semestre ? "var(--color-textPrimary)" : "var(--color-textSecondary)",
                background: "var(--color-surface)",
              }}
            >
              <option value="" disabled>Selecione...</option>
              {SEMESTRES.map((label, i) => (
                <option key={SEMESTRE_VALUES[i]} value={SEMESTRE_VALUES[i]}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Nível de comunicação */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Como você avalia sua comunicação hoje?
            </label>
            <div className="flex flex-col gap-2">
              {NIVEIS.map((n) => {
                const isSelected = nivel === n.value;
                return (
                  <button
                    key={n.value}
                    onClick={() => setNivel(n.value)}
                    className="flex flex-col rounded-xl p-4 text-left transition-all"
                    style={{
                      background: "var(--color-surface)",
                      border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                      boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)",
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                      {n.label}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                      {n.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: "var(--color-primary)", color: "white" }}
        >
          {loading ? "Salvando..." : "Continuar →"}
        </button>
      </div>
    </main>
  );
}
