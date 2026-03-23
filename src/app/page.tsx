import Link from "next/link";

// ─── Seção: Hero ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 gap-6">
      <span
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
        style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
      >
        🤖 Powered by Claude AI
      </span>

      <h1
        className="text-5xl md:text-6xl font-bold leading-tight max-w-2xl"
        style={{ color: "var(--color-textPrimary)" }}
      >
        Pratique sua entrevista{" "}
        <span style={{ color: "var(--color-primary)" }}>antes do dia</span>{" "}
        que importa.
      </h1>

      <p
        className="text-lg md:text-xl max-w-xl leading-relaxed"
        style={{ color: "var(--color-textSecondary)" }}
      >
        O Dicto simula entrevistas de estágio reais com perguntas personalizadas
        por vaga e empresa — e entrega feedback específico e acionável em minutos.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <Link
          href="/simular"
          className="px-8 py-4 rounded-full text-base font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
        >
          Simular agora — é grátis →
        </Link>
        <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
          Sem cadastro obrigatório
        </p>
      </div>

      {/* Social proof */}
      <p className="text-sm mt-4" style={{ color: "var(--color-textSecondary)" }}>
        ✓ Personalizado por vaga &nbsp;·&nbsp; ✓ Feedback em segundos &nbsp;·&nbsp; ✓ Sem coach caro
      </p>
    </section>
  );
}

// ─── Seção: Features ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    emoji: "🎯",
    title: "Personalizado para a sua vaga",
    description:
      "Digite a vaga, a empresa e seu nível de experiência. A IA gera 6 perguntas reais — do jeito que o recrutador perguntaria.",
  },
  {
    emoji: "💬",
    title: "Uma pergunta por vez",
    description:
      "Sem pressão de ver tudo de uma vez. Responda no seu ritmo, como numa entrevista de verdade. Sem distrações.",
  },
  {
    emoji: "📊",
    title: "Feedback objetivo e acionável",
    description:
      "Score de 0 a 100, ponto forte específico e o que melhorar — com linguagem direta. Sem elogio vazio.",
  },
  {
    emoji: "🔄",
    title: "Pratique quantas vezes quiser",
    description:
      "Cada simulação é única. Mude a empresa, mude a vaga. Quanto mais você pratica, mais natural fica no dia real.",
  },
];

function Features() {
  return (
    <section className="px-4 py-20">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Tudo que você precisa para chegar preparado
          </h2>
          <p className="text-base" style={{ color: "var(--color-textSecondary)" }}>
            Sem fonoaudiólogo caro. Sem curso genérico. Só prática real.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 flex flex-col gap-3"
              style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
            >
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="text-base font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-textSecondary)" }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Seção: Screenshots ──────────────────────────────────────────────────────
const SCREENS = [
  {
    label: "1. Configure",
    title: "Informe a vaga e empresa",
    preview: (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium" style={{ color: "var(--color-textSecondary)" }}>Vaga</div>
          <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}>Estágio em Marketing</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium" style={{ color: "var(--color-textSecondary)" }}>Empresa</div>
          <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}>Google</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium" style={{ color: "var(--color-textSecondary)" }}>Nível de experiência</div>
          <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}>Nenhuma experiência</div>
        </div>
        <div className="rounded-xl py-2.5 text-center text-sm font-semibold mt-1" style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}>
          Iniciar simulação →
        </div>
      </div>
    ),
  },
  {
    label: "2. Responda",
    title: "Uma pergunta por vez",
    preview: (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-between items-center">
          <div className="text-xs" style={{ color: "var(--color-textSecondary)" }}>Estágio em Marketing · Google</div>
          <div className="text-xs font-semibold" style={{ color: "var(--color-textSecondary)" }}>2/6</div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
          <div className="h-full rounded-full" style={{ width: "33%", background: "var(--color-primary)" }} />
        </div>
        <div className="rounded-xl p-3" style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
          <div className="text-xs font-semibold mb-1" style={{ color: "var(--color-primary)" }}>Pergunta 2</div>
          <div className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>Por que você quer trabalhar no Google?</div>
        </div>
        <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-textSecondary)", minHeight: 64 }}>
          Sempre admirei a cultura de inovação do Google...
        </div>
        <div className="rounded-xl py-2.5 text-center text-sm font-semibold" style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}>
          Próxima pergunta →
        </div>
      </div>
    ),
  },
  {
    label: "3. Receba feedback",
    title: "Score e insights acionáveis",
    preview: (
      <div className="flex flex-col gap-3 p-4 items-center">
        <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
          <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={40} cy={40} r={32} fill="none" stroke="var(--color-border)" strokeWidth={6} />
            <circle cx={40} cy={40} r={32} fill="none" stroke="var(--color-primary)" strokeWidth={6}
              strokeDasharray={201} strokeDashoffset={36} strokeLinecap="round" />
          </svg>
          <div className="absolute text-center">
            <span className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>82</span>
            <span className="text-xs block" style={{ color: "var(--color-textSecondary)" }}>/100</span>
          </div>
        </div>
        <div className="w-full rounded-xl p-3" style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
          <div className="text-xs font-semibold mb-1" style={{ color: "var(--color-primary)" }}>💪 PONTO FORTE</div>
          <div className="text-xs" style={{ color: "var(--color-textPrimary)" }}>Comunicação clara e interesse genuíno pela vaga.</div>
        </div>
        <div className="w-full rounded-xl p-3" style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
          <div className="text-xs font-semibold mb-1" style={{ color: "#FBBF24" }}>🎯 O QUE MELHORAR</div>
          <div className="text-xs" style={{ color: "var(--color-textPrimary)" }}>Traga exemplos concretos nas suas respostas.</div>
        </div>
        <div className="w-full rounded-xl py-2 text-center text-xs font-semibold" style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}>
          Praticar novamente
        </div>
      </div>
    ),
  },
];

function Screenshots() {
  return (
    <section className="px-4 py-20">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Veja como é simples
          </h2>
          <p className="text-base" style={{ color: "var(--color-textSecondary)" }}>
            Três telas. Zero complicação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {SCREENS.map((screen) => (
            <div key={screen.label} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
                >
                  {screen.label}
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                {screen.title}
              </p>
              <div
                className="rounded-2xl overflow-hidden border"
                style={{
                  background: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {screen.preview}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Seção: Como funciona ─────────────────────────────────────────────────────
const STEPS = [
  { step: "1", title: "Configure a simulação", desc: "Informe a vaga, empresa e seu nível de experiência." },
  { step: "2", title: "Responda as perguntas", desc: "6 perguntas personalizadas pela IA, uma por vez." },
  { step: "3", title: "Receba seu feedback", desc: "Score, ponto forte e o que melhorar — em segundos." },
];

function HowItWorks() {
  return (
    <section className="px-4 py-20" style={{ background: "var(--color-surface)" }}>
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Como funciona
          </h2>
          <p className="text-base" style={{ color: "var(--color-textSecondary)" }}>
            Do zero ao feedback em menos de 10 minutos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {STEPS.map((s) => (
            <div key={s.step} className="flex-1 flex flex-col items-center text-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
              >
                {s.step}
              </div>
              <h3 className="text-base font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                {s.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/simular"
            className="inline-block px-8 py-4 rounded-full text-base font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
          >
            Começar agora →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Seção: Pricing ───────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    highlight: false,
    features: [
      "2 simulações por mês",
      "Perguntas personalizadas",
      "Feedback por IA",
      "Score 0–100",
    ],
    cta: "Começar grátis",
    href: "/simular",
  },
  {
    name: "PRO",
    price: "R$ 19,90",
    period: "por mês",
    highlight: true,
    features: [
      "Simulações ilimitadas",
      "Perguntas personalizadas",
      "Feedback por IA",
      "Score 0–100",
      "Histórico completo",
      "Cancele quando quiser",
    ],
    cta: "Assinar PRO",
    href: "/settings/billing",
  },
];

function Pricing() {
  return (
    <section className="px-4 py-20">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Preço simples, sem surpresas
          </h2>
          <p className="text-base" style={{ color: "var(--color-textSecondary)" }}>
            Comece grátis. Faça upgrade quando quiser praticar mais.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-7 flex flex-col gap-5"
              style={{
                background: plan.highlight ? "var(--color-primary)" : "var(--color-surface)",
                boxShadow: "var(--shadow-lg)",
                border: plan.highlight ? "none" : "1px solid var(--color-border)",
              }}
            >
              <div className="flex flex-col gap-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: plan.highlight ? "var(--color-textPrimary)" : "var(--color-textSecondary)" }}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: plan.highlight ? "var(--color-textPrimary)" : "var(--color-textSecondary)" }}>
                    /{plan.period}
                  </span>
                </div>
              </div>

              <ul className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--color-textPrimary)" }}
                  >
                    <span style={{ color: plan.highlight ? "var(--color-textPrimary)" : "var(--color-primary)" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className="w-full rounded-xl py-3 text-sm font-semibold text-center transition-opacity hover:opacity-80 mt-auto"
                style={{
                  background: plan.highlight ? "var(--color-textPrimary)" : "var(--color-primary)",
                  color: plan.highlight ? "var(--color-surface)" : "var(--color-textPrimary)",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm" style={{ color: "var(--color-textSecondary)" }}>
          Novos usuários ganham <strong>14 dias de acesso PRO gratuito</strong> ao criar conta.
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="px-4 py-10 text-center flex flex-col gap-2"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
        Dicto
      </p>
      <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>
        O fonoaudiólogo e coach de oratória no bolso do universitário.
      </p>
      <div className="flex items-center justify-center gap-4 mt-2 text-xs" style={{ color: "var(--color-textSecondary)" }}>
        <Link href="/simular" className="hover:underline">Simular</Link>
        <Link href="/login" className="hover:underline">Entrar</Link>
        <Link href="/settings/billing" className="hover:underline">Planos</Link>
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--color-textSecondary)" }}>
        © {new Date().getFullYear()} Dicto. Feito com IA para quem quer a vaga.
      </p>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ background: "var(--color-bg)" }}>
      <Hero />
      <Features />
      <Screenshots />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
}
