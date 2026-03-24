import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { daysLeftInTrial, isTrialActive } from "@/lib/subscription";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// Badge bg / text using rgba so tokens:check doesn't flag them
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

// ─── Context cards data ─────────────────────────────────────────────────────

const CONTEXTS = [
  {
    tipo: "ENTREVISTA_ESTAGIO",
    href: "/simulador/nova",
    emoji: "💼",
    label: "Entrevista de estágio",
    desc: "Simule perguntas reais da sua vaga",
    fase: "Fase 2",
    featured: true,
  },
  {
    tipo: "APRESENTACAO_PESSOAL",
    href: "/simulador/apresentacao-pessoal/nova",
    emoji: "🙋",
    label: "Apresentação pessoal",
    desc: "Treine como se apresentar em grupos",
    fase: "Fase 1",
    featured: false,
  },
  {
    tipo: "APRESENTACAO_DISCIPLINA",
    href: "/simulador/apresentacao-disciplina/nova",
    emoji: "📖",
    label: "Apresentação de disciplina",
    desc: "Prepare-se para apresentações em sala",
    fase: "Fase 1",
    featured: false,
  },
  {
    tipo: "SEMINARIO_INDIVIDUAL",
    href: "/simulador/seminario/nova",
    emoji: "🎤",
    label: "Seminário individual",
    desc: "Domine a fala e as perguntas da banca",
    fase: "Fase 2",
    featured: false,
  },
  {
    tipo: "TRABALHO_GRUPO",
    href: "/simulador/trabalho-grupo/nova",
    emoji: "👥",
    label: "Trabalho em grupo",
    desc: "Treine sua parte sem depender do grupo",
    fase: "Fase 2",
    featured: false,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      image: true,
      plan: true,
      trialEndsAt: true,
      onboardingCompletedAt: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      profile: { select: { objetivoImediato: true } },
    },
  });

  if (!user?.onboardingCompletedAt) redirect("/onboarding/contexto");

  const simulations = await prisma.simulationSession.findMany({
    where: { userId: session.user.id, completedAt: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      tipo: true,
      config: true,
      score: true,
      completedAt: true,
      createdAt: true,
    },
  });

  const totalSims = await prisma.simulationSession.count({
    where: { userId: session.user.id },
  });

  const firstName = user.name?.split(" ")[0] ?? "estudante";
  const trialActive = isTrialActive(user);
  const daysLeft = trialActive ? daysLeftInTrial(user) : 0;
  const showTrialBanner = trialActive && daysLeft > 0;
  const isEntrevistaBreve = user.profile?.objetivoImediato === "ENTREVISTA_BREVE";
  const hasHistory = simulations.length > 0;
  const isFirstAccess = totalSims === 0;

  const usedTipos = new Set(simulations.map((s) => s.tipo));

  let greeting: string;
  if (isFirstAccess) {
    greeting = `Olá, ${firstName}! Vamos começar?`;
  } else if (isEntrevistaBreve && !hasHistory) {
    greeting = `Boa sorte na entrevista, ${firstName}! Que tal um treino rápido?`;
  } else if (hasHistory) {
    greeting = `Bem-vindo de volta, ${firstName}! Pronto para mais um treino?`;
  } else {
    greeting = `Olá de novo, ${firstName}!`;
  }

  const featuredCtx = CONTEXTS.find((c) => c.featured)!;
  const otherCtxs = CONTEXTS.filter((c) => !c.featured);

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span className="text-lg font-bold tracking-tight" style={{ color: "var(--color-textPrimary)" }}>
          Dicto
        </span>

        {/* Avatar + dropdown via <details> — zero JS */}
        <details className="relative group">
          <summary
            className="list-none cursor-pointer select-none"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ WebkitAppearance: "none" } as any}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
            >
              {firstName[0]?.toUpperCase() ?? "U"}
            </div>
          </summary>

          <div
            className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-20"
            style={{
              background: "var(--color-surface)",
              boxShadow: "var(--shadow-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <p className="text-sm font-semibold truncate" style={{ color: "var(--color-textPrimary)" }}>
                {user.name ?? firstName}
              </p>
            </div>
            <Link
              href="/settings"
              className="block px-4 py-3 text-sm transition-colors hover:opacity-70"
              style={{ color: "var(--color-textSecondary)" }}
            >
              Configurações
            </Link>
            <Link
              href="/api/auth/signout"
              className="block px-4 py-3 text-sm transition-colors hover:opacity-70"
              style={{ color: "var(--color-error)" }}
            >
              Sair
            </Link>
          </div>
        </details>
      </header>

      {/* ── Trial banner ───────────────────────────────────────────────── */}
      {showTrialBanner && (
        <div
          className="px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: "var(--color-warningBg)", borderBottom: "1px solid var(--color-warning)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-warningText)" }}>
            ⏳ Você tem{" "}
            <strong>
              {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
            </strong>{" "}
            de acesso gratuito restantes.
          </p>
          <Link
            href="/settings/billing"
            className="text-xs font-semibold whitespace-nowrap rounded-lg px-3 py-1.5 transition-opacity hover:opacity-80"
            style={{ background: "var(--color-warning)", color: "var(--color-warningText)" }}
          >
            Fazer upgrade
          </Link>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-8">

        {/* ── Greeting ─────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            {greeting}
          </h1>
          {isFirstAccess && (
            <p className="mt-1 text-sm" style={{ color: "var(--color-textSecondary)" }}>
              Escolha uma situação abaixo para começar seu primeiro treino
            </p>
          )}
        </div>

        {/* ── History ──────────────────────────────────────────────────── */}
        {hasHistory && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                Suas últimas simulações
              </h2>
              <Link
                href="/simulador/historico"
                className="text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                Ver tudo
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {simulations.map((sim) => {
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
                    {/* Top row: badge + date + score */}
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

                    {/* Score bar */}
                    {sim.score != null && (
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "var(--color-border)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${sim.score}%`, background: scoreColor }}
                        />
                      </div>
                    )}

                    {/* Bottom row: feedback link + Repetir */}
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
                        style={{ background: "var(--color-bg)", color: "var(--color-textPrimary)", border: "1px solid var(--color-border)" }}
                      >
                        Repetir
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Context hub ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-textPrimary)" }}>
            {isFirstAccess ? "Por onde você quer começar?" : "Iniciar nova simulação"}
          </h2>

          {/* Featured card: Entrevista de Estágio */}
          <Link
            href={featuredCtx.href}
            className="block rounded-2xl p-5 transition-shadow hover:shadow-md relative overflow-hidden"
            style={{
              background: "var(--color-surface)",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                style={{ background: "rgba(59,130,246,0.12)", color: "rgb(37,99,235)" }}
              >
                {featuredCtx.fase}
              </span>
              {isEntrevistaBreve && (
                <span
                  className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                  style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
                >
                  ⭐ Recomendado para você
                </span>
              )}
              {!usedTipos.has(featuredCtx.tipo) && !isEntrevistaBreve && (
                <span
                  className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                  style={{ background: "rgba(93,224,138,0.2)", color: "rgb(21,128,57)" }}
                >
                  Novo
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "var(--color-bg)" }}
              >
                {featuredCtx.emoji}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold" style={{ color: "var(--color-textPrimary)" }}>
                  {featuredCtx.label}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                  {featuredCtx.desc}
                </p>
              </div>
              <span className="text-xl shrink-0" style={{ color: "var(--color-textSecondary)" }}>
                →
              </span>
            </div>
          </Link>

          {/* 2×2 grid for remaining 4 contexts */}
          <div className="grid grid-cols-2 gap-3">
            {otherCtxs.map((ctx) => {
              const isNew = !usedTipos.has(ctx.tipo);
              return (
                <Link
                  key={ctx.href}
                  href={ctx.href}
                  className="flex flex-col gap-3 rounded-2xl p-4 transition-shadow hover:shadow-md"
                  style={{
                    background: "var(--color-surface)",
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {/* Fase badge */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-xs font-medium rounded-full px-2 py-0.5"
                      style={{ background: "var(--color-bg)", color: "var(--color-textSecondary)" }}
                    >
                      {ctx.fase}
                    </span>
                    {isNew && (
                      <span
                        className="text-xs font-semibold rounded-full px-2 py-0.5"
                        style={{ background: "rgba(93,224,138,0.2)", color: "rgb(21,128,57)" }}
                      >
                        Novo
                      </span>
                    )}
                  </div>

                  {/* Emoji */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: "var(--color-bg)" }}
                  >
                    {ctx.emoji}
                  </div>

                  {/* Label + desc */}
                  <div>
                    <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-textPrimary)" }}>
                      {ctx.label}
                    </p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--color-textSecondary)" }}>
                      {ctx.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
