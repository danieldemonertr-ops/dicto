"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CONTEXTO_OPTIONS = [
  { value: "TURMA", label: "Turma da faculdade", emoji: "🎓" },
  { value: "GRUPO_ESTUDO", label: "Grupo de estudo", emoji: "📚" },
  { value: "CA", label: "Centro Acadêmico", emoji: "🏛️" },
  { value: "REPUBLICA", label: "República", emoji: "🏠" },
  { value: "EVENTO", label: "Evento de integração", emoji: "🎉" },
  { value: "OUTRO", label: "Outro", emoji: "✨" },
];

const NUMERO_OPTIONS = [
  { value: "MENOS_5", label: "Menos de 5", emoji: "👥" },
  { value: "5_A_20", label: "Entre 5 e 20", emoji: "👨‍👩‍👧‍👦" },
  { value: "MAIS_20", label: "Mais de 20", emoji: "🏟️" },
];

const TOM_OPTIONS = [
  { value: "DESCONTRAIDO", label: "Descontraído e acessível", desc: "Leve, próximo, informal" },
  { value: "PROFISSIONAL", label: "Profissional e sério", desc: "Direto, organizado, respeitoso" },
  { value: "CURIOSO", label: "Curioso e engajado", desc: "Entusiasta, cheio de perguntas" },
];

export default function ApresentacaoPessoalNovaPage() {
  const router = useRouter();
  const [contexto, setContexto] = useState("");
  const [numeroPessoas, setNumeroPessoas] = useState("");
  const [tom, setTom] = useState("");
  const [destaques, setDestaques] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = contexto && numeroPessoas && tom;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/simulation/apresentacao-pessoal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contexto, numeroPessoas, tom, destaques: destaques.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { if (data.error === "limit") { router.push("/settings/billing"); return; } setError("Algo deu errado."); setLoading(false); return; }
      router.push(`/simulador/${data.sessionId}/simulacao`);
    } catch { setError("Erro de conexão."); setLoading(false); }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md flex flex-col gap-8">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-textSecondary)" }}>Apresentação Pessoal</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>Configure sua simulação</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>A IA cria situações reais de apresentação para o seu contexto.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Contexto */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Qual é o contexto? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {CONTEXTO_OPTIONS.map((opt) => {
                const isSelected = contexto === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setContexto(opt.value)}
                    className="flex items-center gap-2 rounded-xl p-3 text-left text-sm transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, color: isSelected ? "var(--color-primary)" : "var(--color-textPrimary)", boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)" }}>
                    <span>{opt.emoji}</span><span className="text-xs font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Número de pessoas */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Quantas pessoas estarão presentes? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="flex gap-2">
              {NUMERO_OPTIONS.map((opt) => {
                const isSelected = numeroPessoas === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setNumeroPessoas(opt.value)}
                    className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center text-xs font-medium transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, color: isSelected ? "var(--color-primary)" : "var(--color-textSecondary)" }}>
                    <span className="text-lg">{opt.emoji}</span>{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tom */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Qual tom você quer passar? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="flex flex-col gap-2">
              {TOM_OPTIONS.map((opt) => {
                const isSelected = tom === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setTom(opt.value)}
                    className="flex flex-col rounded-xl p-4 text-left transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)" }}>
                    <span className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>{opt.label}</span>
                    <span className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destaques (opcional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Tem algo específico que quer destacar?
              <span className="ml-1 text-xs font-normal" style={{ color: "var(--color-textSecondary)" }}>(opcional)</span>
            </label>
            <textarea value={destaques} onChange={(e) => setDestaques(e.target.value)} rows={2}
              placeholder="Ex: minha cidade, meu hobby, minha área de interesse..."
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition focus:ring-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }} />
          </div>

          {error && <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>{error}</p>}
          <button type="submit" disabled={!canSubmit || loading}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--color-primary)", color: "white" }}>
            {loading ? "Gerando situações com IA..." : "Iniciar apresentação →"}
          </button>
        </form>
      </div>
    </main>
  );
}
