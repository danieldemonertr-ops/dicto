"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  sessionId: string;
  tipo: string;
  tipoLabel: string;
  backUrl: string;
  jobTitle: string;
  company: string;
  score: number;
  strongPoint: string;
  improvementPoint: string;
  dicaAcionavel: string;
  resumoGeral: string;
  pending?: boolean;
};

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75
      ? "var(--color-primary)"
      : score >= 50
      ? "var(--color-warning)"
      : "var(--color-error)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
      <svg width={128} height={128} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={64} cy={64} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={8} />
        <circle
          cx={64} cy={64} r={radius}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
          {score}
        </span>
        <span className="text-xs block" style={{ color: "var(--color-textSecondary)" }}>
          /100
        </span>
      </div>
    </div>
  );
}

function CopyModal({ text, onClose }: { text: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // usuário copia manualmente
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-lg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
            Compartilhar resultado
          </p>
          <button onClick={onClose} className="text-lg leading-none" style={{ color: "var(--color-textSecondary)" }}>
            ✕
          </button>
        </div>
        <textarea
          readOnly value={text} rows={4}
          className="w-full rounded-xl p-3 text-sm resize-none outline-none"
          style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-textPrimary)" }}
        />
        <button
          onClick={handleCopy}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--color-primary)", color: "white" }}
        >
          {copied ? "Copiado ✓" : "Copiar texto"}
        </button>
      </div>
    </div>
  );
}

export function FeedbackClient({
  sessionId, tipo, tipoLabel, backUrl, jobTitle, company, score,
  strongPoint, improvementPoint, dicaAcionavel, resumoGeral, pending,
}: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const isSeminario = tipo === "SEMINARIO_INDIVIDUAL";
  const isAcademico = ["SEMINARIO_INDIVIDUAL", "APRESENTACAO_DISCIPLINA", "TRABALHO_GRUPO"].includes(tipo);
  const isPessoal = tipo === "APRESENTACAO_PESSOAL";

  const shareText = `Acabei de simular minha entrevista para ${jobTitle} na ${company} com o Dicto e tirei ${score}/100! 🚀\n${typeof window !== "undefined" ? window.location.href : ""}`;

  React.useEffect(() => {
    if (!pending) return;

    // Dispara complete imediatamente ao chegar na página com pending=true.
    // Cobre o caso em que o fetch anterior foi cancelado (navegação) ou
    // que o Vercel matou a função por timeout.
    fetch(`/api/simulation/${sessionId}/complete`, { method: "POST" })
      .then(() => router.refresh())
      .catch(() => {});

    // Continua polling até o resultado aparecer
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [pending, router, sessionId]);

  if (pending) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl animate-spin"
            style={{ background: "var(--color-primary)", animationDuration: "2s" }}
          >
            🧠
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold" style={{ color: "var(--color-textPrimary)" }}>
              Analisando suas respostas...
            </p>
            <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
              O feedback ficará pronto em alguns segundos
            </p>
          </div>
        </div>
      </main>
    );
  }

  async function handleShare() {
    // Tenta Web Share API (mobile nativo)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText, url: window.location.href });
        return;
      } catch { /* cancelado pelo usuário — segue para clipboard */ }
    }
    // Tenta clipboard — mostra feedback inline no botão
    try {
      await navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard bloqueado (ex: iframe, HTTP) — abre modal com texto
      setShowModal(true);
    }
  }

  const scoreLabel =
    score >= 75
      ? "Excelente! Você está bem preparado."
      : score >= 50
      ? "Bom desempenho. Com mais prática, vai arrasar."
      : "Continue praticando — você já deu o primeiro passo.";

  return (
    <>
      {showModal && <CopyModal text={shareText} onClose={() => setShowModal(false)} />}
      <main
        className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="w-full max-w-lg flex flex-col gap-5">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--color-primary)" }}>
              {tipoLabel}
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--color-textSecondary)" }}>
              {isSeminario ? `${company} · ${jobTitle}` : `${jobTitle} · ${company}`}
            </p>
            <h1 className="text-2xl font-bold mt-1" style={{ color: "var(--color-textPrimary)" }}>
              Seu feedback
            </h1>
          </div>

          {/* Score */}
          <div
            className="rounded-2xl p-8 flex flex-col items-center gap-3"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
          >
            <ScoreRing score={score} />
            <p className="text-sm text-center" style={{ color: "var(--color-textSecondary)" }}>
              {scoreLabel}
            </p>
          </div>

          {/* Resumo geral */}
          {resumoGeral && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--color-textSecondary)" }}>
                {isAcademico ? "📋 Avaliação do professor" : isPessoal ? "📋 Avaliação do coach" : "📋 Avaliação do recrutador"}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-textPrimary)" }}>
                {resumoGeral}
              </p>
            </div>
          )}

          {/* Feedback cards */}
          <div className="flex flex-col gap-3">
            <div
              className="rounded-2xl p-5 flex flex-col gap-2"
              style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">💪</span>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
                  Ponto forte
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-textPrimary)" }}>
                {strongPoint}
              </p>
            </div>

            <div
              className="rounded-2xl p-5 flex flex-col gap-2"
              style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-warning)" }}>
                  O que melhorar
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-textPrimary)" }}>
                {improvementPoint}
              </p>
            </div>

            {dicaAcionavel && (
              <div
                className="rounded-2xl p-5 flex flex-col gap-2"
                style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderLeft: "3px solid var(--color-primary)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
                    Dica para amanhã
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-textPrimary)" }}>
                  {dicaAcionavel}
                </p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 pt-1">
            <button
              onClick={handleShare}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              {shareCopied ? "Copiado ✓" : "Compartilhar resultado 🚀"}
            </button>
            <button
              onClick={() => router.push(backUrl)}
              className="w-full rounded-xl py-3.5 text-sm font-semibold border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
            >
              {tipo === "TRABALHO_GRUPO" ? "Fazer mais um exercício" : "Fazer mais um exercício"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--color-textSecondary)" }}
            >
              Ir para o Hub →
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
