"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DURACAO_OPTIONS = [
  { value: "ATE_10", label: "Até 10 min" },
  { value: "10_A_20", label: "10 a 20 min" },
  { value: "20_A_40", label: "20 a 40 min" },
  { value: "MAIS_40", label: "Mais de 40 min" },
];

const PERGUNTAS_OPTIONS = [
  { value: "SIM", label: "Sim", emoji: "🙋" },
  { value: "NAO_SEI", label: "Não sei", emoji: "🤷" },
  { value: "NAO", label: "Não", emoji: "🙅" },
];

const DOMINIO_OPTIONS = [
  { value: "POUCO", label: "Conheço pouco", desc: "Ainda estou estudando o assunto" },
  { value: "RAZOAVEL", label: "Conheço razoavelmente", desc: "Entendo o básico, mas tenho dúvidas" },
  { value: "BEM", label: "Domino bem", desc: "Estou confortável com o tema" },
];

export default function SeminarioNovaPage() {
  const router = useRouter();
  const { status } = useSession();
  const [disciplina, setDisciplina] = useState("");
  const [tema, setTema] = useState("");
  const [duracao, setDuracao] = useState("");
  const [perguntasTurma, setPerguntasTurma] = useState("");
  const [usaSlides, setUsaSlides] = useState<boolean | null>(null);
  const [dominioTema, setDominioTema] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("dicto_form_pendente");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.tipo !== "SEMINARIO_INDIVIDUAL") return;
      if (saved.disciplina) setDisciplina(saved.disciplina);
      if (saved.tema) setTema(saved.tema);
      if (saved.duracao) setDuracao(saved.duracao);
      if (saved.perguntasTurma) setPerguntasTurma(saved.perguntasTurma);
      if (saved.usaSlides !== undefined) setUsaSlides(saved.usaSlides);
      if (saved.dominioTema) setDominioTema(saved.dominioTema);
      sessionStorage.removeItem("dicto_form_pendente");
    } catch { /* noop */ }
  }, []);

  const canSubmit = disciplina.trim() && tema.trim() && duracao && perguntasTurma && usaSlides !== null && dominioTema;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    if (status === "unauthenticated") {
      try {
        sessionStorage.setItem("dicto_form_pendente", JSON.stringify({
          tipo: "SEMINARIO_INDIVIDUAL",
          disciplina: disciplina.trim(), tema: tema.trim(), duracao, perguntasTurma, usaSlides, dominioTema,
        }));
      } catch { /* noop */ }
      router.push("/login?callbackUrl=" + encodeURIComponent("/simulador/seminario/nova"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/simulation/seminario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplina: disciplina.trim(), tema: tema.trim(), duracao, perguntasTurma, usaSlides, dominioTema }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "limit") { router.push("/settings/billing"); return; }
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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Header */}
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-textSecondary)" }}>
            Seminário Individual
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Configure sua simulação
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
            A IA vai simular abertura, perguntas do professor e da turma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Disciplina */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Qual é a disciplina? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Sociologia, Direito Constitucional, Filosofia"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
            />
          </div>

          {/* Tema */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Qual é o tema do seminário? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Teorias da Desigualdade Social"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
            />
          </div>

          {/* Duração */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Quanto tempo você tem? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURACAO_OPTIONS.map((opt) => {
                const isSelected = duracao === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuracao(opt.value)}
                    className="rounded-xl py-3 px-4 text-sm font-medium text-center transition-all"
                    style={{
                      background: "var(--color-surface)",
                      border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                      color: isSelected ? "var(--color-primary)" : "var(--color-textPrimary)",
                      boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Perguntas da turma */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Haverá perguntas da turma? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <div className="flex gap-2">
              {PERGUNTAS_OPTIONS.map((opt) => {
                const isSelected = perguntasTurma === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPerguntasTurma(opt.value)}
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

          {/* Usa slides */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Você vai usar slides? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <div className="flex gap-2">
              {[{ value: true, label: "Sim", emoji: "📊" }, { value: false, label: "Não", emoji: "🗣️" }].map((opt) => {
                const isSelected = usaSlides === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setUsaSlides(opt.value)}
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

          {/* Domínio do tema */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Qual é o seu nível de domínio do tema? <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <div className="flex flex-col gap-2">
              {DOMINIO_OPTIONS.map((opt) => {
                const isSelected = dominioTema === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDominioTema(opt.value)}
                    className="flex flex-col rounded-xl p-4 text-left transition-all"
                    style={{
                      background: "var(--color-surface)",
                      border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                      boxShadow: isSelected ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)",
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>{opt.label}</span>
                    <span className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading || status === "loading"}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--color-primary)", color: "white" }}
          >
            {loading ? "Gerando simulação com IA..." : "Iniciar simulação →"}
          </button>
        </form>
      </div>
    </main>
  );
}
