"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

const EXPERIENCE_OPTIONS = [
  { value: "NO_EXPERIENCE", label: "Nenhuma experiência", desc: "Nunca trabalhei ou estagiei" },
  { value: "SOME_EXPERIENCE", label: "Já fiz cursos e projetos", desc: "Tenho projetos acadêmicos ou pessoais" },
  { value: "EXPERIENCED", label: "Tenho experiência anterior", desc: "Já trabalhei ou estagiei antes" },
];

const PESQUISA_OPTIONS = [
  { value: "SIM_BASTANTE", label: "Sim, bastante", emoji: "💡" },
  { value: "UM_POUCO", label: "Um pouco", emoji: "🔍" },
  { value: "NAO_AINDA", label: "Não ainda", emoji: "😅" },
];

export default function SimuladorNovaPage() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [pesquisaEmpresa, setPesquisaEmpresa] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = jobTitle.trim() && company.trim() && experienceLevel;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          experienceLevel,
          pesquisaEmpresa: pesquisaEmpresa || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "limit") {
          router.push("/settings/billing");
          return;
        }
        setError("Algo deu errado. Tente novamente.");
        setLoading(false);
        return;
      }

      router.push(`/simulador/${data.sessionId}/simulacao`);
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
      setLoading(false);
    }
  }

  return (
    <>
    {loading && <LoadingOverlay message="Gerando perguntas com IA..." />}
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Header */}
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-textSecondary)" }}>
            Nova simulação
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Configure sua entrevista
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
            Quanto mais detalhes, mais realista a simulação.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Vaga */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Qual é a vaga? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Estágio em Marketing, Estágio em TI"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-textPrimary)",
                background: "var(--color-surface)",
              }}
            />
          </div>

          {/* Empresa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Qual é a empresa? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Ambev, Banco Itaú, Startup X"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-textPrimary)",
                background: "var(--color-surface)",
              }}
            />
          </div>

          {/* Nível de experiência */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Qual é o seu nível de experiência? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <div className="flex flex-col gap-2">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const isSelected = experienceLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExperienceLevel(opt.value)}
                    className="flex flex-col rounded-xl p-4 text-left transition-all"
                    style={{
                      background: "var(--color-surface)",
                      border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                      boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)",
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                      {opt.label}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pesquisou sobre a empresa */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Já pesquisou sobre a empresa?
              <span className="ml-1 text-xs font-normal" style={{ color: "var(--color-textSecondary)" }}>
                (opcional)
              </span>
            </label>
            <div className="flex gap-2">
              {PESQUISA_OPTIONS.map((opt) => {
                const isSelected = pesquisaEmpresa === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPesquisaEmpresa(isSelected ? "" : opt.value)}
                    className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center text-xs font-medium transition-all"
                    style={{
                      background: "var(--color-surface)",
                      border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                      color: isSelected ? "var(--color-primary)" : "var(--color-textSecondary)",
                    }}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--color-primary)", color: "white" }}
          >
            {loading ? "Gerando perguntas com IA..." : "Iniciar simulação →"}
          </button>
        </form>
      </div>
    </main>
    </>
  );
}
