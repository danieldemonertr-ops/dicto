"use client";

import { useRouter } from "next/navigation";

type Props = {
  sessionId: string;
  jobTitle: string;
  company: string;
  score: number;
  strongPoint: string;
  improvementPoint: string;
};

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? "var(--color-primary)" : score >= 50 ? "#FBBF24" : "var(--color-error)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
      <svg width={128} height={128} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={64} cy={64} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={8} />
        <circle
          cx={64}
          cy={64}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
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

export function ResultadoClient({ sessionId, jobTitle, company, score, strongPoint, improvementPoint }: Props) {
  const router = useRouter();

  const shareText = `Acabei de simular minha entrevista para ${jobTitle} na ${company} com o Dicto e tirei ${score}/100! 🚀`;

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ text: shareText, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(shareText + " " + window.location.href);
      alert("Link copiado!");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--color-textSecondary)" }}>
            {jobTitle} · {company}
          </p>
          <h1 className="text-2xl font-bold mt-1" style={{ color: "var(--color-textPrimary)" }}>
            Resultado da sua simulação
          </h1>
        </div>

        {/* Score */}
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-4"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
        >
          <ScoreRing score={score} />
          <p className="text-sm text-center" style={{ color: "var(--color-textSecondary)" }}>
            {score >= 75
              ? "Excelente! Você está bem preparado."
              : score >= 50
              ? "Bom desempenho. Com mais prática, vai arrasar."
              : "Pratique mais — você já deu o primeiro passo."}
          </p>
        </div>

        {/* Feedback */}
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
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#FBBF24" }}>
                O que melhorar
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-textPrimary)" }}>
              {improvementPoint}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/simular")}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
          >
            Praticar novamente
          </button>

          <button
            onClick={handleShare}
            className="w-full rounded-xl py-3.5 text-sm font-semibold border transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}
          >
            Compartilhar resultado 🚀
          </button>
        </div>
      </div>
    </main>
  );
}
