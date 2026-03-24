"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

type Question = { id: string; question: string };

export default function SimulacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/simulation/${sessionId}`);
        if (!res.ok) { router.push("/simulador/nova"); return; }
        const data = await res.json();
        setQuestions(data.questions ?? []);
        setJobTitle(data.jobTitle ?? "");
        setCompany(data.company ?? "");
      } catch {
        router.push("/simulador/nova");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId, router]);

  const isLast = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentIndex];

  async function handleNext() {
    if (!answer.trim() || saving || completing) return;

    if (!isLast) {
      setSaving(true);
      await fetch(`/api/simulation/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.id, answer }),
      });
      setSaving(false);
      setAnswer("");
      setCurrentIndex((i) => i + 1);
    } else {
      setCompleting(true);
      await fetch(`/api/simulation/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.id, answer }),
      });
      await fetch(`/api/simulation/${sessionId}/complete`, { method: "POST" });
      router.push(`/simulador/${sessionId}/feedback`);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <p className="text-sm animate-pulse" style={{ color: "var(--color-textSecondary)" }}>
          Carregando perguntas...
        </p>
      </main>
    );
  }

  if (completing) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full animate-pulse" style={{ background: "var(--color-primary)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
            Analisando suas respostas...
          </p>
          <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>
            O recrutador IA está avaliando seu desempenho
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Progress bar */}
      <header className="px-4 pt-6 pb-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: "var(--color-textSecondary)" }}>
              {jobTitle} · {company}
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--color-textSecondary)" }}>
              {currentIndex + 1}/{questions.length}
            </p>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "var(--color-primary)" }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <div
            className="rounded-2xl p-6 flex flex-col gap-3"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
              Pergunta {currentIndex + 1}
            </p>
            <p className="text-base font-medium leading-relaxed" style={{ color: "var(--color-textPrimary)" }}>
              {currentQuestion?.question}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite sua resposta aqui..."
              rows={5}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-textPrimary)",
                background: "var(--color-surface)",
              }}
            />

            <button
              onClick={handleNext}
              disabled={!answer.trim() || saving || completing}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              {saving
                ? "Salvando..."
                : isLast
                ? "Ver meu feedback →"
                : "Próxima pergunta →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
