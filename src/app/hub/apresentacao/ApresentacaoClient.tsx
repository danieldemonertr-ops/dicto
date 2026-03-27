"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Modo = "INDIVIDUAL" | "GRUPO";
type Duracao = "ATE_5" | "5_A_10" | "10_A_20" | "MAIS_20";
type PerguntasProf = "SEMPRE" | "AS_VEZES" | "RARAMENTE";

const DURACAO_OPTS: { value: Duracao; label: string }[] = [
  { value: "ATE_5", label: "Menos de 5 min" },
  { value: "5_A_10", label: "5 a 10 min" },
  { value: "10_A_20", label: "10 a 20 min" },
  { value: "MAIS_20", label: "Mais de 20 min" },
];

const PROF_OPTS: { value: PerguntasProf; label: string; emoji: string }[] = [
  { value: "SEMPRE", label: "Sempre", emoji: "🎯" },
  { value: "AS_VEZES", label: "Às vezes", emoji: "🤔" },
  { value: "RARAMENTE", label: "Raramente", emoji: "😌" },
];

type TempoPratica = "HOJE" | "ALGUNS_DIAS" | "ESTA_SEMANA" | "MAIS_SEMANA";

const TEMPO_PRATICA_OPTS: { value: TempoPratica; label: string; desc: string; emoji: string }[] = [
  { value: "HOJE", label: "Hoje mesmo", desc: "Tenho poucas horas disponíveis", emoji: "⚡" },
  { value: "ALGUNS_DIAS", label: "Alguns dias", desc: "2 a 3 dias para praticar", emoji: "📅" },
  { value: "ESTA_SEMANA", label: "Esta semana", desc: "4 a 7 dias disponíveis", emoji: "🗓️" },
  { value: "MAIS_SEMANA", label: "Mais de uma semana", desc: "Tenho bastante tempo", emoji: "🎯" },
];

const TOPICOS_SUGERIDOS = [
  "Introdução e contextualização",
  "Fundamentos teóricos",
  "Metodologia / Como foi desenvolvido",
  "Resultados e análise",
  "Conclusão e próximos passos",
  "Referências e fontes",
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
      <div
        className="h-1 rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: "var(--color-primary)" }}
      />
    </div>
  );
}

function generatePlanItems(tempo: TempoPratica | "" | undefined, dateStr?: string): { label: string; exercicio: string }[] {
  // Use date if provided, otherwise use tempoPratica
  if (dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 2) {
      return [
        { label: "Hoje", exercicio: "Simulação completa — início ao fim com feedback da IA" },
        { label: "Véspera", exercicio: "Revisão dos pontos difíceis e treino do encerramento" },
      ];
    }
    if (daysUntil <= 7) {
      return [
        { label: "Hoje", exercicio: "Exploração do tema e estrutura da apresentação" },
        { label: `Em ${Math.ceil(daysUntil / 2)} dias`, exercicio: "Prática das transições entre tópicos" },
        { label: "Véspera", exercicio: "Simulação completa com perguntas do professor" },
      ];
    }
  }
  // Based on tempoPratica
  if (!tempo || tempo === "HOJE") {
    return [
      { label: "Agora", exercicio: "1 simulação completa com o conteúdo que você tem" },
      { label: "Antes de dormir", exercicio: "Revisão rápida dos pontos em que travou" },
    ];
  }
  if (tempo === "ALGUNS_DIAS") {
    return [
      { label: "1º dia", exercicio: "Estruturar e praticar a abertura + desenvolvimento" },
      { label: "2º dia", exercicio: "Focar nos pontos mais difíceis de explicar" },
      { label: "Véspera", exercicio: "Simulação completa do início ao fim" },
    ];
  }
  if (tempo === "ESTA_SEMANA") {
    return [
      { label: "Início da semana", exercicio: "Estruturar o conteúdo e praticar as seções" },
      { label: "Meio da semana", exercicio: "Treinar transições e encaixe das partes" },
      { label: "Véspera", exercicio: "Simulação completa com perguntas da banca" },
    ];
  }
  return [
    { label: "Semana 1", exercicio: "Entender e estruturar o conteúdo a fundo" },
    { label: "Semana 2", exercicio: "Praticar cada seção separada com feedback da IA" },
    { label: "Últimos dias", exercicio: "Simulação completa e revisão do feedback" },
  ];
}

export function ApresentacaoClient() {
  const router = useRouter();

  // Form state
  const [step, setStep] = useState(0);
  const [modo, setModo] = useState<Modo | "">("");
  const [disciplina, setDisciplina] = useState("");
  const [tema, setTema] = useState("");
  const [profPerguntas, setProfPerguntas] = useState<PerguntasProf | "">("");
  const [duracao, setDuracao] = useState<Duracao | "">("");
  const [sabeFalar, setSabeFalar] = useState<boolean | null>(null);

  // YES branch
  const [roteiro, setRoteiro] = useState("");

  // NO branch
  const [oQueSabe, setOQueSabe] = useState("");
  const [dificuldades, setDificuldades] = useState("");
  const [topicosSelecionados, setTopicosSelecionados] = useState<string[]>([]);
  const [dataApresentacao, setDataApresentacao] = useState("");

  // Shared (both branches)
  const [tempoPratica, setTempoPratica] = useState<TempoPratica | "">("");

  const [loading, setLoading] = useState(false);

  // maxSteps: YES has 7 steps (0-6), NO has 9 steps (0-8)
  const maxSteps = sabeFalar === null ? 4 : sabeFalar ? 7 : 9;
  const progress = Math.round(((step + 1) / maxSteps) * 100);

  function toggleTopico(t: string) {
    setTopicosSelecionados((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function goBack() {
    if (step === 0) {
      router.push("/hub");
    } else {
      setStep((s) => s - 1);
    }
  }

  async function handleFazerExercicio() {
    setLoading(true);
    const payload = {
      disciplina: disciplina.trim() || "Não informado",
      tema: tema.trim() || "A definir",
      duracao: duracao || "5_A_10",
      formato: modo || "INDIVIDUAL",
      perguntasProfessor: profPerguntas || "AS_VEZES",
    };

    // Persist context so post-login flow can continue
    try {
      sessionStorage.setItem("dicto_apresentacao_pendente", JSON.stringify({
        ...payload,
        ...(sabeFalar ? { roteiro } : {
          topicos: topicosSelecionados.join(", "),
          dataApresentacao,
        }),
      }));
      sessionStorage.setItem("dicto_contexto_pendente", JSON.stringify({
        tipo: "APRESENTACAO_DISCIPLINA",
        label: "Apresentação de trabalhos",
        onboarding: "SEMINARIO",
      }));
    } catch { /* noop */ }

    try {
      const res = await fetch("/api/simulation/apresentacao-disciplina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.push("/login?callbackUrl=/simulador/apresentacao-disciplina/nova");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "limit") { router.push("/settings/billing"); return; }
        router.push("/simulador/apresentacao-disciplina/nova");
        return;
      }
      router.push(`/simulador/${data.sessionId}/simulacao`);
    } catch {
      router.push("/simulador/apresentacao-disciplina/nova");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen px-4 py-8 flex flex-col items-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Nav + progress */}
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 rounded-xl transition-colors hover:bg-black/5 text-lg"
            style={{ color: "var(--color-textSecondary)" }}
            aria-label="Voltar"
          >
            ←
          </button>
          <div className="flex-1">
            <ProgressBar value={progress} />
          </div>
        </div>

        {/* ── STEP 0: Individual ou em grupo ── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Apresentação de trabalhos
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                É individual ou em grupo?
              </h1>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { value: "INDIVIDUAL" as Modo, emoji: "🙋", label: "Trabalho individual", desc: "Você apresenta sozinho" },
                { value: "GRUPO" as Modo, emoji: "👥", label: "Trabalho em grupo", desc: "Cada um apresenta uma parte" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setModo(opt.value); setStep(1); }}
                  className="w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-shadow hover:shadow-md"
                  style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "var(--color-bg)" }}>
                    {opt.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>{opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>{opt.desc}</p>
                  </div>
                  <span style={{ color: "var(--color-textSecondary)" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Informações básicas ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Sobre o trabalho
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Me conta um pouco mais
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                  Disciplina / Matéria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Comunicação Empresarial, TCC, Biologia..."
                  value={disciplina}
                  onChange={(e) => setDisciplina(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                  Tema do trabalho
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sustentabilidade, Inteligência Artificial..."
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                  O professor costuma fazer perguntas?
                </label>
                <div className="flex gap-2">
                  {PROF_OPTS.map((opt) => {
                    const sel = profPerguntas === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProfPerguntas(opt.value)}
                        className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-1 text-center text-xs font-medium transition-all"
                        style={{
                          background: "var(--color-surface)",
                          border: `2px solid ${sel ? "var(--color-primary)" : "var(--color-border)"}`,
                          color: sel ? "var(--color-primary)" : "var(--color-textSecondary)",
                        }}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!disciplina.trim() || !tema.trim() || !profPerguntas}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── STEP 2: Tempo de apresentação ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Tempo disponível
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Quanto tempo você tem para apresentar?
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
                A IA adapta o plano ao seu tempo de fala.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DURACAO_OPTS.map((opt) => {
                const sel = duracao === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuracao(opt.value)}
                    className="rounded-xl py-4 px-4 text-sm font-medium text-center transition-all"
                    style={{
                      background: sel ? "var(--color-primary)" : "var(--color-surface)",
                      border: `2px solid ${sel ? "var(--color-primary)" : "var(--color-border)"}`,
                      color: sel ? "white" : "var(--color-textPrimary)",
                      boxShadow: sel ? "0 0 0 3px rgba(29,158,117,0.12)" : "var(--shadow-sm)",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!duracao}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── STEP 3: Já sabe o que vai falar? ── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Conteúdo
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Você já sabe o que vai falar?
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
                Isso define como a IA vai te ajudar.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSabeFalar(true); setStep(4); }}
                className="w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-shadow hover:shadow-md"
                style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "var(--color-bg)" }}>✅</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>Sim, já sei o que vou falar</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>Tenho um roteiro ou conheço bem o conteúdo</p>
                </div>
                <span style={{ color: "var(--color-textSecondary)" }}>→</span>
              </button>

              <button
                onClick={() => { setSabeFalar(false); setStep(4); }}
                className="w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-shadow hover:shadow-md"
                style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "var(--color-bg)" }}>🤔</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>Ainda não sei direito</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>Preciso organizar o que vou abordar</p>
                </div>
                <span style={{ color: "var(--color-textSecondary)" }}>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4a (YES): Descreva o roteiro ── */}
        {step === 4 && sabeFalar === true && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Roteiro / Conteúdo
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Descreva o que você vai apresentar
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
                Pode ser um resumo, tópicos ou o roteiro completo.
              </p>
            </div>

            <textarea
              placeholder={"Ex:\n— Introdução ao tema\n— Conceitos principais\n— Exemplos práticos\n— Conclusão"}
              value={roteiro}
              onChange={(e) => setRoteiro(e.target.value)}
              rows={7}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 resize-none"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
            />

            <button
              onClick={() => setStep(5)}
              disabled={!roteiro.trim()}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              Gerar plano de exercícios →
            </button>
          </div>
        )}

        {/* ── STEP 5a (YES): Tempo de prática ── */}
        {step === 5 && sabeFalar === true && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Disponibilidade
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Quanto tempo você tem para praticar?
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
                Assim a IA monta um plano que você vai conseguir cumprir de verdade.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {TEMPO_PRATICA_OPTS.map((opt) => {
                const sel = tempoPratica === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { setTempoPratica(opt.value); setStep(6); }}
                    className="w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:shadow-md"
                    style={{
                      background: sel ? "rgba(29,158,117,0.06)" : "var(--color-surface)",
                      border: `2px solid ${sel ? "var(--color-primary)" : "var(--color-border)"}`,
                    }}
                  >
                    <span className="text-2xl shrink-0">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>{opt.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>{opt.desc}</p>
                    </div>
                    <span style={{ color: "var(--color-textSecondary)" }}>→</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 6a (YES): Plano gerado ── */}
        {step === 6 && sabeFalar === true && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Plano personalizado ✨
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Seu plano de prática está pronto
              </h1>
            </div>

            <div
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              {generatePlanItems(tempoPratica).map((item, i, arr) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: "var(--color-primary)" }} />
                    {i < arr.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ minHeight: 20, background: "var(--color-border)" }} />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-textSecondary)" }}>{item.label}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "var(--color-textPrimary)" }}>{item.exercicio}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.2)" }}
            >
              <span className="text-lg shrink-0">💡</span>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-textSecondary)" }}>
                Faça o primeiro exercício agora. Você precisará entrar com sua conta para ver o resultado completo da IA.
              </p>
            </div>

            <button
              onClick={handleFazerExercicio}
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              {loading ? "Preparando exercício..." : "Fazer primeiro exercício →"}
            </button>
          </div>
        )}

        {/* ── STEP 4b (NO): Explorar o tema ── */}
        {step === 4 && sabeFalar === false && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Vamos entender melhor
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Me conta sobre o tema
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
                Assim a IA monta o plano ideal para você.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                  O que você já sabe sobre o tema?
                </label>
                <textarea
                  placeholder="Ex: Sei que é sobre mudanças climáticas, mas não conheço os dados específicos..."
                  value={oQueSabe}
                  onChange={(e) => setOQueSabe(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 resize-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                  Quais partes você acha mais difícil de explicar? <span style={{ color: "var(--color-textSecondary)" }}>(opcional)</span>
                </label>
                <textarea
                  placeholder="Ex: Fico travado na hora de explicar os dados, não sei conectar as partes..."
                  value={dificuldades}
                  onChange={(e) => setDificuldades(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 resize-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(5)}
              disabled={!oQueSabe.trim()}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── STEP 5b (NO): Tópicos sugeridos ── */}
        {step === 5 && sabeFalar === false && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Tópicos sugeridos
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Quais assuntos você vai abordar?
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
                Selecione os tópicos da sua apresentação.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {TOPICOS_SUGERIDOS.map((topico) => {
                const sel = topicosSelecionados.includes(topico);
                return (
                  <button
                    key={topico}
                    type="button"
                    onClick={() => toggleTopico(topico)}
                    className="w-full flex items-center gap-3 rounded-xl p-3.5 text-left transition-all"
                    style={{
                      background: sel ? "rgba(29,158,117,0.06)" : "var(--color-surface)",
                      border: `2px solid ${sel ? "var(--color-primary)" : "var(--color-border)"}`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                      style={{
                        background: sel ? "var(--color-primary)" : "transparent",
                        border: sel ? "none" : "2px solid var(--color-border)",
                      }}
                    >
                      {sel && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: sel ? "var(--color-primary)" : "var(--color-textPrimary)" }}
                    >
                      {topico}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(6)}
              disabled={topicosSelecionados.length === 0}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── STEP 6b (NO): Data de apresentação ── */}
        {step === 6 && sabeFalar === false && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Data de entrega
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Quando é a sua apresentação?
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
                A IA vai montar um plano de exercícios até essa data.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                Data da apresentação
              </label>
              <input
                type="date"
                value={dataApresentacao}
                onChange={(e) => setDataApresentacao(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)", background: "var(--color-surface)" }}
              />
            </div>

            <button
              onClick={() => setStep(7)}
              disabled={!dataApresentacao}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              Ver plano de exercícios →
            </button>
          </div>
        )}

        {/* ── STEP 7b (NO): Tempo de prática ── */}
        {step === 7 && sabeFalar === false && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Disponibilidade
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Quanto tempo você tem para praticar?
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
                Assim a IA monta um plano que você vai conseguir cumprir de verdade.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {TEMPO_PRATICA_OPTS.map((opt) => {
                const sel = tempoPratica === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { setTempoPratica(opt.value); setStep(8); }}
                    className="w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:shadow-md"
                    style={{
                      background: sel ? "rgba(29,158,117,0.06)" : "var(--color-surface)",
                      border: `2px solid ${sel ? "var(--color-primary)" : "var(--color-border)"}`,
                    }}
                  >
                    <span className="text-2xl shrink-0">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>{opt.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-textSecondary)" }}>{opt.desc}</p>
                    </div>
                    <span style={{ color: "var(--color-textSecondary)" }}>→</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 8b (NO): Plano de exercícios ── */}
        {step === 8 && sabeFalar === false && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-textSecondary)" }}>
                Plano personalizado ✨
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                Seu plano de prática até a apresentação
              </h1>
            </div>

            {/* Timeline */}
            <div
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              {generatePlanItems(tempoPratica, dataApresentacao).map((item, i, arr) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                      style={{ background: "var(--color-primary)" }}
                    />
                    {i < arr.length - 1 && (
                      <div className="w-0.5 flex-1 mt-1" style={{ minHeight: 24, background: "var(--color-border)" }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-textSecondary)" }}
                    >
                      {item.label}
                    </p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "var(--color-textPrimary)" }}>
                      {item.exercicio}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.2)" }}
            >
              <span className="text-lg shrink-0">💡</span>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-textSecondary)" }}>
                Faça o primeiro exercício agora. Você precisará entrar com sua conta para ver o resultado completo da IA.
              </p>
            </div>

            <button
              onClick={handleFazerExercicio}
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              {loading ? "Preparando exercício..." : "Fazer primeiro exercício →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
