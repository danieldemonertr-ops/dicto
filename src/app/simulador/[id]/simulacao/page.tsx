"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

type Question = { id: string; question: string };

const TIPO_URLS: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "/simulador/nova",
  SEMINARIO_INDIVIDUAL: "/simulador/seminario/nova",
  APRESENTACAO_DISCIPLINA: "/hub/apresentacao",
  TRABALHO_GRUPO: "/simulador/trabalho-grupo/nova",
};

export default function SimulacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAbandon, setShowAbandon] = useState(false);
  const [tipoHref, setTipoHref] = useState("/simulador/nova");
  const [isGuest, setIsGuest] = useState(false);
  const [showLoginWall, setShowLoginWall] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const [simRes, sessionRes] = await Promise.all([
          fetch(`/api/simulation/${sessionId}`),
          fetch("/api/auth/session"),
        ]);
        if (!simRes.ok) { router.push("/simulador/nova"); return; }
        const data = await simRes.json();
        setQuestions(data.questions ?? []);
        setJobTitle(data.jobTitle ?? "");
        setCompany(data.company ?? "");
        setTipoHref(TIPO_URLS[data.tipo] ?? "/simulador/nova");
        const sessionData = await sessionRes.json();
        setIsGuest(!sessionData?.user);
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
    if (!answer.trim() || saving) return;
    setSaving(true);
    await fetch(`/api/simulation/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion.id, answer }),
    });
    if (!isLast) {
      setSaving(false);
      setAnswer("");
      setCurrentIndex((i) => i + 1);
    } else {
      if (isGuest) {
        // Dispara em background — o FeedbackClient vai retentar se necessário
        fetch(`/api/simulation/${sessionId}/complete`, { method: "POST" }).catch(() => {});
        setSaving(false);
        setShowLoginWall(true);
      } else {
        fetch(`/api/simulation/${sessionId}/complete`, { method: "POST" }).catch(() => {});
        router.push(`/simulador/${sessionId}/feedback`);
      }
    }
  }

  function handleSkip() {
    if (isLast) {
      if (isGuest) {
        fetch(`/api/simulation/${sessionId}/complete`, { method: "POST" }).catch(() => {});
        setShowLoginWall(true);
      } else {
        fetch(`/api/simulation/${sessionId}/complete`, { method: "POST" }).catch(() => {});
        router.push(`/simulador/${sessionId}/feedback`);
      }
    } else {
      setAnswer("");
      setCurrentIndex((i) => i + 1);
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

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Abandon modal */}
      {showAbandon && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowAbandon(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <p className="text-base font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Abandonar entrevista?
              </p>
              <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
                {currentIndex} de {questions.length} perguntas respondidas.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--color-primary)", color: "#111312" }}
              >
                Continuar depois →
              </button>
              <button
                onClick={() => router.push(tipoHref)}
                className="w-full rounded-xl py-3 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-error)" }}
              >
                Descartar e começar nova
              </button>
              <button
                onClick={() => setShowAbandon(false)}
                className="w-full py-2 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-textSecondary)" }}
              >
                Voltar para a entrevista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login wall — aparece após última resposta para usuários convidados */}
      {showLoginWall && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-7 flex flex-col gap-5"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-lg)" }}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-4xl">🎉</span>
              <p className="text-lg font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Exercício concluído!
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-textSecondary)" }}>
                Faça login para ver seu resultado detalhado com o feedback da IA.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`/login?callbackUrl=/simulador/${sessionId}/feedback`}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-center transition-opacity hover:opacity-90"
                style={{ background: "var(--color-primary)", color: "white" }}
              >
                Fazer login para ver o resultado →
              </a>
              <button
                onClick={() => router.push("/hub")}
                className="w-full py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-textSecondary)" }}
              >
                Voltar ao início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header / progress */}
      <header className="px-4 pt-6 pb-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium truncate" style={{ color: "var(--color-textSecondary)" }}>
              {jobTitle}{company ? ` · ${company}` : ""}
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <p className="text-xs font-medium" style={{ color: "var(--color-textSecondary)" }}>
                {currentIndex + 1}/{questions.length}
              </p>
              <button
                onClick={() => setShowAbandon(true)}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--color-textSecondary)" }}
              >
                Sair
              </button>
            </div>
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
              disabled={!answer.trim() || saving}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              {saving ? "Salvando..." : isLast ? "Ver meu feedback →" : "Próxima pergunta →"}
            </button>

            <button
              onClick={handleSkip}
              disabled={saving}
              className="w-full py-2.5 text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-30"
              style={{ color: "var(--color-textSecondary)" }}
            >
              Pular esta pergunta
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
