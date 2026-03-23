"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = { id: string; question: string; answered: boolean };

type Props = {
  sessionId: string;
  jobTitle: string;
  company: string;
  questions: Question[];
};

export function SimulacaoClient({ sessionId, jobTitle, company, questions }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(
    () => questions.findIndex((q) => !q.answered) === -1 ? 0 : questions.findIndex((q) => !q.answered)
  );
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  const total = questions.length;
  const current = questions[currentIndex];
  const isLast = currentIndex === total - 1;
  const progress = ((currentIndex) / total) * 100;

  async function saveAnswer() {
    if (!answer.trim()) return;
    setSaving(true);

    await fetch(`/api/simulation/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: current.id, answer: answer.trim() }),
    });

    setSaving(false);
    setAnswer("");

    if (isLast) {
      setCompleting(true);
      await fetch(`/api/simulation/${sessionId}/complete`, { method: "POST" });
      router.push(`/simular/${sessionId}/resultado`);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  if (completing) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center flex flex-col gap-3">
          <div className="text-4xl animate-pulse">🤖</div>
          <p className="text-base font-medium" style={{ color: "var(--color-textPrimary)" }}>
            Analisando suas respostas...
          </p>
          <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
            A IA está preparando seu feedback personalizado.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Header com progresso */}
      <header className="w-full px-4 pt-6 pb-4 flex flex-col gap-3 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: "var(--color-textSecondary)" }}>
              {jobTitle} · {company}
            </p>
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--color-textSecondary)" }}>
            {currentIndex + 1}/{total}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "var(--color-primary)" }}
          />
        </div>
      </header>

      {/* Card da pergunta */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
              Pergunta {currentIndex + 1}
            </p>
            <p className="text-lg font-medium leading-relaxed" style={{ color: "var(--color-textPrimary)" }}>
              {current.question}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite sua resposta aqui..."
              rows={6}
              className="w-full rounded-2xl border px-5 py-4 text-sm resize-none outline-none focus:ring-2 focus:ring-offset-1 transition"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-textPrimary)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
              }}
            />

            <button
              onClick={saveAnswer}
              disabled={!answer.trim() || saving}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
            >
              {saving ? "Salvando..." : isLast ? "Finalizar simulação →" : "Próxima pergunta →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
