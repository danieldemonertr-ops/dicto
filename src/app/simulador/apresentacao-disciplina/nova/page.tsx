"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DURACAO_OPTIONS = [
  { value: "ATE_5", label: "Até 5 min" },
  { value: "5_A_10", label: "5 a 10 min" },
  { value: "10_A_20", label: "10 a 20 min" },
  { value: "MAIS_20", label: "Mais de 20 min" },
];

const FORMATO_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individual", emoji: "🙋" },
  { value: "GRUPO", label: "Em grupo", emoji: "👥" },
];

const PERGUNTAS_OPTIONS = [
  { value: "SEMPRE", label: "Sim, sempre", emoji: "🎯" },
  { value: "AS_VEZES", label: "Às vezes", emoji: "🤔" },
  { value: "RARAMENTE", label: "Raramente", emoji: "😌" },
];

export default function ApresentacaoDisciplinaNovaPage() {
  const router = useRouter();
  const { status } = useSession();
  const [disciplina, setDisciplina] = useState("");
  const [tema, setTema] = useState("");
  const [duracao, setDuracao] = useState("");
  const [formato, setFormato] = useState("");
  const [perguntasProfessor, setPerguntasProfessor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("dicto_form_pendente");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.tipo !== "APRESENTACAO_DISCIPLINA") return;
      if (saved.disciplina) setDisciplina(saved.disciplina);
      if (saved.tema) setTema(saved.tema);
      if (saved.duracao) setDuracao(saved.duracao);
      if (saved.formato) setFormato(saved.formato);
      if (saved.perguntasProfessor) setPerguntasProfessor(saved.perguntasProfessor);
      sessionStorage.removeItem("dicto_form_pendente");
    } catch { /* noop */ }
  }, []);

  const canSubmit = disciplina.trim() && tema.trim() && duracao && formato && perguntasProfessor;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    if (status === "unauthenticated") {
      try {
        sessionStorage.setItem("dicto_form_pendente", JSON.stringify({
          tipo: "APRESENTACAO_DISCIPLINA",
          disciplina: disciplina.trim(), tema: tema.trim(), duracao, formato, perguntasProfessor,
        }));
      } catch { /* noop */ }
      router.push("/login?callbackUrl=" + encodeURIComponent("/simulador/apresentacao-disciplina/nova"));
      return;
    }

    setLoading(true); setError("");
    try {
      const res = await fetch("/api/simulation/apresentacao-disciplina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplina: disciplina.trim(), tema: tema.trim(), duracao, formato, perguntasProfessor }),
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
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-textSecondary)" }}>Apresentação de Disciplina</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>Configure sua simulação</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>A IA simula abertura, desenvolvimento, pergunta do professor e encerramento.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Disciplina */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Qual é a disciplina? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <input type="text" placeholder="Ex: Cálculo I, Marketing Digital" value={disciplina} onChange={(e) => setDisciplina(e.target.value)} required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }} />
          </div>

          {/* Tema */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Qual é o tema da apresentação? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <input type="text" placeholder="Ex: Derivadas, Comportamento do Consumidor (ou 'A definir')" value={tema} onChange={(e) => setTema(e.target.value)} required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }} />
          </div>

          {/* Duração */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Quanto tempo você tem? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {DURACAO_OPTIONS.map((opt) => {
                const isSelected = duracao === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setDuracao(opt.value)}
                    className="rounded-xl py-3 px-4 text-sm font-medium text-center transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, color: isSelected ? "var(--color-primary)" : "var(--color-textPrimary)", boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)" }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formato */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>É individual ou em grupo? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="flex gap-2">
              {FORMATO_OPTIONS.map((opt) => {
                const isSelected = formato === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setFormato(opt.value)}
                    className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center text-xs font-medium transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, color: isSelected ? "var(--color-primary)" : "var(--color-textSecondary)" }}>
                    <span className="text-lg">{opt.emoji}</span>{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Perguntas do professor */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>O professor costuma fazer perguntas? <span style={{ color: "var(--color-error)" }}>*</span></label>
            <div className="flex gap-2">
              {PERGUNTAS_OPTIONS.map((opt) => {
                const isSelected = perguntasProfessor === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setPerguntasProfessor(opt.value)}
                    className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center text-xs font-medium transition-all"
                    style={{ background: "var(--color-surface)", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, color: isSelected ? "var(--color-primary)" : "var(--color-textSecondary)" }}>
                    <span className="text-lg">{opt.emoji}</span>{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>{error}</p>}
          <button type="submit" disabled={!canSubmit || loading || status === "loading"}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--color-primary)", color: "white" }}>
            {loading ? "Gerando simulação com IA..." : "Iniciar simulação →"}
          </button>
        </form>
      </div>
    </main>
  );
}
