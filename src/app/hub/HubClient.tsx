"use client";

import { useRouter } from "next/navigation";

// Mapeamento: tipo → URL da entry form
const TIPO_TO_URL: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "/simulador/nova",
  APRESENTACAO_DISCIPLINA: "/simulador/apresentacao-disciplina/nova",
  APRESENTACAO_PESSOAL: "/simulador/apresentacao-pessoal/nova",
  SEMINARIO_INDIVIDUAL: "/simulador/seminario/nova",
  TRABALHO_GRUPO: "/simulador/trabalho-grupo/nova",
};

// Mapeamento: tipo do hub → valor da opção no onboarding/contexto (usado pós-login)
const HUB_TO_ONBOARDING: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "ENTREVISTA_ESTAGIO",
  APRESENTACAO_DISCIPLINA: "SEMINARIO",
  APRESENTACAO_PESSOAL: "SEMINARIO",
  SEMINARIO_INDIVIDUAL: "SEMINARIO",
  TRABALHO_GRUPO: "SEMINARIO",
};

const ACADEMIC_CONTEXTS = [
  {
    tipo: "APRESENTACAO_DISCIPLINA",
    emoji: "📖",
    label: "Apresentação de disciplina",
    desc: "Prepare sua fala para a aula",
  },
  {
    tipo: "APRESENTACAO_PESSOAL",
    emoji: "🙋",
    label: "Apresentação pessoal",
    desc: "Treine como se apresentar em grupos",
  },
  {
    tipo: "SEMINARIO_INDIVIDUAL",
    emoji: "🎤",
    label: "Seminário",
    desc: "Domine o conteúdo e as perguntas",
  },
  {
    tipo: "TRABALHO_GRUPO",
    emoji: "👥",
    label: "Trabalho individual / em grupo",
    desc: "Treine sua parte sem depender do grupo",
  },
];

const CAREER_CONTEXTS = [
  {
    tipo: "ENTREVISTA_ESTAGIO",
    emoji: "💼",
    label: "Entrevista de estágio",
    desc: "Simule perguntas reais da sua vaga",
  },
];

export function HubClient() {
  const router = useRouter();

  function handleSelect(tipo: string, label: string) {
    // Salva contexto para uso no onboarding (pós-login)
    try {
      sessionStorage.setItem(
        "dicto_contexto_pendente",
        JSON.stringify({ tipo, label, onboarding: HUB_TO_ONBOARDING[tipo] })
      );
    } catch { /* noop */ }
    // Vai direto para a entry form — login será pedido só ao submeter
    const url = TIPO_TO_URL[tipo] ?? "/simulador/nova";
    router.push(url);
  }

  return (
    <main
      className="min-h-screen px-4 py-12 flex flex-col items-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-lg flex flex-col gap-8">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--color-textPrimary)" }}
          >
            Dicto
          </span>
          <h1
            className="text-2xl font-bold mt-1"
            style={{ color: "var(--color-textPrimary)" }}
          >
            O que vai fazer no Dicto?
          </h1>
          <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
            Escolha uma situação para começar
          </p>
        </div>

        {/* Grupo: Carreira */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-textSecondary)" }}>
            Carreira
          </p>
          {CAREER_CONTEXTS.map((ctx) => (
            <button
              key={ctx.tipo}
              onClick={() => handleSelect(ctx.tipo, ctx.label)}
              className="w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-shadow hover:shadow-md"
              style={{
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "var(--color-bg)" }}
              >
                {ctx.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                  {ctx.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>
                  {ctx.desc}
                </p>
              </div>
              <span className="text-lg shrink-0" style={{ color: "var(--color-textSecondary)" }}>→</span>
            </button>
          ))}
        </div>

        {/* Grupo: Vida acadêmica */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-textSecondary)" }}>
            Vida acadêmica
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ACADEMIC_CONTEXTS.map((ctx) => (
              <button
                key={ctx.tipo}
                onClick={() => handleSelect(ctx.tipo, ctx.label)}
                className="flex flex-col gap-3 rounded-2xl p-4 text-left transition-shadow hover:shadow-md"
                style={{
                  background: "var(--color-surface)",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "var(--color-bg)" }}
                >
                  {ctx.emoji}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-textPrimary)" }}>
                    {ctx.label}
                  </p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--color-textSecondary)" }}>
                    {ctx.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Link voltar */}
        <p className="text-center text-sm" style={{ color: "var(--color-textSecondary)" }}>
          Já tem conta?{" "}
          <a href="/login" className="underline font-medium" style={{ color: "var(--color-primary)" }}>
            Entrar
          </a>
        </p>
      </div>
    </main>
  );
}
