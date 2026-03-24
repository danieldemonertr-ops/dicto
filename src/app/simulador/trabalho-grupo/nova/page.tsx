"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TAMANHO_OPTIONS = [
  { value: "2", label: "2 pessoas" },
  { value: "3", label: "3 pessoas" },
  { value: "4", label: "4 pessoas" },
  { value: "5_MAIS", label: "5 ou mais" },
];

const DURACAO_OPTIONS = [
  { value: "ATE_3", label: "Até 3 min" },
  { value: "3_A_7", label: "3 a 7 min" },
  { value: "7_A_15", label: "7 a 15 min" },
];

const POSICAO_OPTIONS = [
  { value: "ABRE", label: "Abro o trabalho", emoji: "🚀", desc: "Apresento o grupo e contextualize o tema" },
  { value: "DESENVOLVE", label: "Desenvolvo uma parte", emoji: "📝", desc: "Apresento minha parte no meio" },
  { value: "FECHA", label: "Fecho o trabalho", emoji: "🏁", desc: "Faço a conclusão e encerramento" },
];

export default function TrabalhoGrupoNovaPage() {
  const router = useRouter();
  const [disciplina, setDisciplina] = useState("");
  const [tema, setTema] = useState("");
  const [tamanhoGrupo, setTamanhoGrupo] = useState("");
  const [suaParte, setSuaParte] = useState("");
  const [duracao, setDuracao] = useState("");
  const [posicao, setPosicao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = disciplina.trim() && tema.trim() && tamanhoGrupo && suaParte.trim() && duracao && posicao;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/simulation/trabalho-grupo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplina: disciplina.trim(), tema: tema.trim(), tamanhoGrupo, suaParte: suaParte.trim(), duracao, posicao }),
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
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-textSecondary)" }}>Trabalho em Grupo</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>Configure sua simulação</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
            A IA treina <strong>sua parte</strong> — transições, conteúdo e respostas ao professor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Disciplina */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Qual é a disciplina? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <input type="text" placeholder="Ex: Gestão de Projetos, Biologia Celular" value={disciplina} onChange={(e) => setDisciplina(e.target.value)} required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }} />
          </div>

          {/* Tema */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Qual é o tema do trabalho? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <input type="text" placeholder="Ex: Gestão Ágil de Projetos" value={tema} onChange={(e) => setTema(e.target.value)} required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }} />
          </div>

          {/* Tamanho do grupo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Quantas pessoas no grupo? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {TAMANHO_OPTIONS.map((opt) => {
                const isSelected = tamanhoGrupo === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setTamanhoGrupo(opt.value)}
                    className="rounded-xl py-3 text-xs font-medium text-center transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, color: isSelected ? "var(--color-primary)" : "var(--color-textPrimary)", boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)" }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sua parte */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Qual é a sua parte? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <textarea value={suaParte} onChange={(e) => setSuaParte(e.target.value)} rows={3}
              placeholder="Ex: Vou falar sobre o método Scrum e como ele é aplicado em equipes de desenvolvimento"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition focus:ring-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }} />
          </div>

          {/* Duração */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Quanto tempo você tem para falar? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="flex gap-2">
              {DURACAO_OPTIONS.map((opt) => {
                const isSelected = duracao === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setDuracao(opt.value)}
                    className="flex-1 rounded-xl py-3 text-sm font-medium text-center transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, color: isSelected ? "var(--color-primary)" : "var(--color-textPrimary)", boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)" }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posição */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Você abre, desenvolve ou fecha a apresentação? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="flex flex-col gap-2">
              {POSICAO_OPTIONS.map((opt) => {
                const isSelected = posicao === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setPosicao(opt.value)}
                    className="flex items-start gap-3 rounded-xl p-4 text-left transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)" }}>
                    <span className="text-xl mt-0.5">{opt.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>{opt.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>{error}</p>}
          <button type="submit" disabled={!canSubmit || loading}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--color-primary)", color: "white" }}>
            {loading ? "Gerando simulação com IA..." : "Iniciar simulação →"}
          </button>
        </form>
      </div>
    </main>
  );
}
