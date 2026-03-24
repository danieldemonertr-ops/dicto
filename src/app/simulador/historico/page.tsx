import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// ─── Helpers (same as dashboard) ────────────────────────────────────────────

function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "agora mesmo";
  if (diffMins < 60) return `há ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "há 1 dia";
  if (diffDays < 7) return `há ${diffDays} dias`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "há 1 semana";
  return `há ${diffWeeks} semanas`;
}

const TIPO_LABELS: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "Entrevista de estágio",
  SEMINARIO_INDIVIDUAL: "Seminário individual",
  APRESENTACAO_DISCIPLINA: "Apresentação de disciplina",
  APRESENTACAO_PESSOAL: "Apresentação pessoal",
  TRABALHO_GRUPO: "Trabalho em grupo",
};

const TIPO_BACK_URLS: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "/simulador/nova",
  SEMINARIO_INDIVIDUAL: "/simulador/seminario/nova",
  APRESENTACAO_DISCIPLINA: "/simulador/apresentacao-disciplina/nova",
  APRESENTACAO_PESSOAL: "/simulador/apresentacao-pessoal/nova",
  TRABALHO_GRUPO: "/simulador/trabalho-grupo/nova",
};

const TIPO_BADGE: Record<string, { bg: string; color: string }> = {
  ENTREVISTA_ESTAGIO: { bg: "rgba(59,130,246,0.12)", color: "rgb(37,99,235)" },
  SEMINARIO_INDIVIDUAL: { bg: "rgba(139,92,246,0.12)", color: "rgb(109,40,217)" },
  APRESENTACAO_DISCIPLINA: { bg: "rgba(20,184,166,0.12)", color: "rgb(15,118,110)" },
  APRESENTACAO_PESSOAL: { bg: "rgba(249,115,22,0.12)", color: "rgb(194,65,12)" },
  TRABALHO_GRUPO: { bg: "rgba(34,197,94,0.12)", color: "rgb(21,128,57)" },
};

const CONTEXTO_LABELS: Record<string, string> = {
  TURMA: "Para a turma",
  GRUPO_ESTUDO: "Grupo de estudo",
  CENTRO_ACADEMICO: "Centro Acadêmico",
  REPUBLICA: "República",
  EVENTO: "Evento de integração",
  OUTRO: "Outro contexto",
};

function getSimTitle(tipo: string, config: unknown): string {
  const c = (config ?? {}) as Record<string, string>;
  switch (tipo) {
    case "ENTREVISTA_ESTAGIO":
      return [c.vaga, c.empresa].filter(Boolean).join(" — ") || "Entrevista";
    case "SEMINARIO_INDIVIDUAL":
    case "APRESENTACAO_DISCIPLINA":
      return [c.disciplina, c.tema].filter(Boolean).join(" — ") || "Apresentação";
    case "APRESENTACAO_PESSOAL":
      return CONTEXTO_LABELS[c.contexto] ?? "Apresentação pessoal";
    case "TRABALHO_GRUPO":
      return [c.disciplina, c.suaParte || c.tema].filter(Boolean).join(" — ") || "Trabalho em grupo";
    default:
      return "Simulação";
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function HistoricoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const simulations = await prisma.simulationSession.findMany({
    where: { userId: session.user.id, completedAt: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      tipo: true,
      config: true,
      score: true,
      completedAt: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Link
          href="/dashboard"
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-textSecondary)" }}
        >
          ← Dashboard
        </Link>
        <span className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
          Histórico de simulações
        </span>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-4">
        {simulations.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: "var(--color-surface)",
              border: "1px dashed var(--color-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
              Nenhuma simulação concluída ainda.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-sm font-semibold rounded-xl px-4 py-2 transition-opacity hover:opacity-80"
              style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
            >
              Começar agora →
            </Link>
          </div>
        ) : (
          simulations.map((sim) => {
            const badge = TIPO_BADGE[sim.tipo] ?? TIPO_BADGE.ENTREVISTA_ESTAGIO;
            const label = TIPO_LABELS[sim.tipo] ?? sim.tipo;
            const title = getSimTitle(sim.tipo, sim.config);
            const relDate = sim.createdAt ? formatRelativeDate(new Date(sim.createdAt)) : "—";
            const backUrl = TIPO_BACK_URLS[sim.tipo] ?? "/simulador/nova";
            const scoreColor =
              sim.score == null
                ? "var(--color-textSecondary)"
                : sim.score >= 75
                ? "var(--color-primary)"
                : sim.score >= 50
                ? "var(--color-warning)"
                : "var(--color-error)";

            return (
              <div
                key={sim.id}
                className="rounded-2xl p-4 flex flex-col gap-3"
                style={{
                  background: "var(--color-surface)",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5">
                    <span
                      className="text-xs font-semibold rounded-full px-2.5 py-0.5 w-fit"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {label}
                    </span>
                    <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-textPrimary)" }}>
                      {title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>
                      {relDate}
                    </p>
                  </div>

                  {sim.score != null && (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-2xl font-bold leading-none" style={{ color: scoreColor }}>
                        {sim.score}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-textSecondary)" }}>
                        /100
                      </span>
                    </div>
                  )}
                </div>

                {sim.score != null && (
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--color-border)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${sim.score}%`, background: scoreColor }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/simulador/${sim.id}/feedback`}
                    className="text-xs transition-opacity hover:opacity-70"
                    style={{ color: "var(--color-textSecondary)" }}
                  >
                    Ver feedback →
                  </Link>
                  <Link
                    href={backUrl}
                    className="text-xs font-semibold rounded-lg px-3 py-1.5 transition-opacity hover:opacity-80"
                    style={{
                      background: "var(--color-bg)",
                      color: "var(--color-textPrimary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    Repetir
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
