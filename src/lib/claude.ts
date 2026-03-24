import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type ExperienceLevelLabel = "sem experiência" | "alguma experiência" | "experiente";

const EXPERIENCE_MAP: Record<string, ExperienceLevelLabel> = {
  NO_EXPERIENCE: "sem experiência",
  SOME_EXPERIENCE: "alguma experiência",
  EXPERIENCED: "experiente",
};

const PESQUISA_MAP: Record<string, string> = {
  SIM_BASTANTE: "pesquisou bastante sobre a empresa",
  UM_POUCO: "pesquisou um pouco sobre a empresa",
  NAO_AINDA: "ainda não pesquisou sobre a empresa",
};

// ─── Demo mode ───────────────────────────────────────────────────────────────

const DEMO_QUESTIONS = [
  "Me fale sobre você e o que te motivou a escolher essa área.",
  "Por que você quer fazer estágio nessa empresa especificamente?",
  "Quais são seus maiores pontos fortes e como eles se aplicam a essa vaga?",
  "Descreva uma situação em que você teve que entregar algo sob pressão. Como lidou?",
  "Conte sobre uma experiência de trabalho em equipe — o que funcionou e o que você faria diferente.",
  "Você tem alguma pergunta para nós sobre a vaga ou a empresa?",
];

const DEMO_FEEDBACK = {
  score: 74,
  strongPoint:
    "Você demonstrou entusiasmo genuíno pela área e clareza ao se apresentar — qualidades que recrutadores valorizam desde os primeiros minutos.",
  improvementPoint:
    "Traga exemplos concretos com números sempre que possível: em vez de 'trabalhei bem em equipe', diga 'coordenei um grupo de 4 pessoas e entregamos o projeto 2 dias antes do prazo'.",
  dicaAcionavel:
    "Antes da sua próxima entrevista, prepare 2 ou 3 histórias reais usando o método STAR (Situação, Tarefa, Ação, Resultado) para responder perguntas comportamentais com confiança.",
  resumoGeral:
    "Candidato demonstra potencial claro e motivação genuína. Com mais exemplos concretos e pesquisa aprofundada sobre a empresa, tem tudo para se destacar no processo seletivo.",
};

const DEMO_SEMINARIO_QUESTIONS = [
  "Como você abre e contextualiza o tema do seu seminário para a turma?",
  "Qual é a tese central ou argumento principal do seu seminário?",
  "Cite um dado, autor ou exemplo concreto que sustente sua tese principal.",
  "Como você explicaria a relação entre seu tema e os debates contemporâneos na disciplina?",
  "Se um colega te perguntasse 'mas por que isso importa para nós hoje?', o que você responderia?",
  "Como você encerraria o seminário deixando o tema ressoando na memória da turma?",
];

const DEMO_SEMINARIO_FEEDBACK: FeedbackResult = {
  score: 71,
  strongPoint:
    "Você apresentou a tese com clareza e sustentou com exemplos pertinentes — demonstrando domínio básico do tema.",
  improvementPoint:
    "A gestão das perguntas ainda precisa de mais segurança: ao ser questionado, tente reformular a pergunta em voz alta antes de responder.",
  dicaAcionavel:
    "Antes do seminário real, ensaie em voz alta a abertura e o encerramento pelo menos 3 vezes — são os momentos mais lembrados pela turma e pelo professor.",
  resumoGeral:
    "O aluno demonstra compreensão satisfatória do conteúdo e estrutura razoável de apresentação. Com maior domínio das perguntas críticas e encerramento mais marcante, a nota pode subir consideravelmente.",
};

function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

function isCreditError(err: unknown): boolean {
  if (err && typeof err === "object" && "status" in err) {
    const e = err as { status: number; message?: string };
    return e.status === 400 && (e.message ?? "").includes("credit balance is too low");
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────

/** Gera 6 perguntas de entrevista personalizadas */
export async function generateQuestions(
  jobTitle: string,
  company: string,
  experienceLevel: string,
  pesquisaEmpresa?: string | null
): Promise<string[]> {
  if (isDemoMode()) return DEMO_QUESTIONS;

  const level = EXPERIENCE_MAP[experienceLevel] ?? "alguma experiência";
  const pesquisa = pesquisaEmpresa ? PESQUISA_MAP[pesquisaEmpresa] ?? "" : "";

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Você é um recrutador sênior da empresa "${company}" conduzindo uma entrevista real para a vaga de "${jobTitle}".

Perfil do candidato: ${level}${pesquisa ? `, ${pesquisa}` : ""}.

Gere exatamente 6 perguntas seguindo esta estrutura obrigatória:
1. Apresentação pessoal — "Me fale sobre você" (adaptada ao nível)
2. Motivação — por que essa empresa e essa vaga especificamente
3. Competência técnica — relacionada diretamente à área de "${jobTitle}"
4. Comportamental — situação passada usando método STAR
5. Soft skill — relevante para "${jobTitle}" (ex: comunicação, gestão de tempo, adaptabilidade)
6. Espaço para o candidato perguntar algo à empresa

As perguntas devem soar naturais como um recrutador real falaria. Adapte a exigência ao nível do candidato.
${pesquisaEmpresa === "NAO_AINDA" ? "O candidato não pesquisou a empresa — calibre as perguntas de motivação de forma mais aberta." : ""}

Retorne JSON: { "perguntas": ["...", "...", "...", "...", "...", "..."] }`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.perguntas) && parsed.perguntas.length >= 6) {
          return parsed.perguntas.slice(0, 6);
        }
      }
    } catch {
      // fallback para parsing por linha
    }

    const questions = text
      .split("\n")
      .map((q) => q.trim().replace(/^[\d\-\.\)\*]+\s*/, ""))
      .filter((q) => q.length > 10)
      .slice(0, 6);

    return questions.length >= 6 ? questions : DEMO_QUESTIONS;
  } catch (err) {
    if (isCreditError(err)) return DEMO_QUESTIONS;
    throw err;
  }
}

export type FeedbackResult = {
  score: number;
  strongPoint: string;
  improvementPoint: string;
  dicaAcionavel: string;
  resumoGeral: string;
};

/** Analisa todas as respostas — 3 dimensões: Clareza (30), Relevância (35), Confiança (35) */
export async function analyzeAnswers(
  jobTitle: string,
  company: string,
  qa: { question: string; answer: string }[]
): Promise<FeedbackResult> {
  if (isDemoMode()) return DEMO_FEEDBACK;

  const pairs = qa
    .map((item, i) => `Pergunta ${i + 1}: ${item.question}\nResposta: ${item.answer}`)
    .join("\n\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 768,
      messages: [
        {
          role: "user",
          content: `Você é um recrutador avaliando um candidato ao estágio em "${jobTitle}" na empresa "${company}".

Perguntas e respostas da entrevista:
${pairs}

Avalie o candidato em 3 dimensões:
- Clareza (0-30): respondeu de forma direta e compreensível
- Relevância (0-35): respostas conectadas à vaga e à empresa
- Confiança (0-35): demonstrou segurança e preparo

Nota: a pergunta 6 (espaço para o candidato perguntar) vale mais quando o candidato perguntou algo relevante sobre a empresa ou vaga.

Responda EXATAMENTE neste formato JSON (sem markdown, sem texto extra):
{
  "score": <soma das 3 dimensões, 0-100>,
  "pontoForte": "<o que o candidato fez muito bem, em 1 frase específica>",
  "pontoMelhoria": "<o que mais prejudicou a candidatura, em 1 frase>",
  "dicaAcionavel": "<o que fazer diferente na entrevista real, em 1 frase concreta e prática>",
  "resumoGeral": "<avaliação do recrutador em 2 frases diretas>"
}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
        strongPoint: parsed.pontoForte ?? "Boa comunicação geral.",
        improvementPoint: parsed.pontoMelhoria ?? "Aprofunde exemplos concretos.",
        dicaAcionavel: parsed.dicaAcionavel ?? "Prepare histórias reais com método STAR.",
        resumoGeral: parsed.resumoGeral ?? "Candidato com potencial. Continue praticando.",
      };
    } catch {
      return DEMO_FEEDBACK;
    }
  } catch (err) {
    if (isCreditError(err)) return DEMO_FEEDBACK;
    throw err;
  }
}

// ─── Seminário Individual ────────────────────────────────────────────────────

const DURACAO_MAP: Record<string, string> = {
  ATE_10: "até 10 minutos",
  "10_A_20": "10 a 20 minutos",
  "20_A_40": "20 a 40 minutos",
  MAIS_40: "mais de 40 minutos",
};

const DOMINIO_MAP: Record<string, string> = {
  POUCO: "conhece pouco o tema",
  RAZOAVEL: "conhece razoavelmente o tema",
  BEM: "domina bem o tema",
};

const PERGUNTAS_TURMA_MAP: Record<string, string> = {
  SIM: "haverá perguntas da turma",
  NAO_SEI: "pode ou não haver perguntas da turma",
  NAO: "não haverá perguntas da turma",
};

export type SeminarioConfig = {
  disciplina: string;
  tema: string;
  duracao: string;
  perguntasTurma: string;
  usaSlides: boolean;
  dominioTema: string;
};

/** Gera 6 rodadas para simulação de seminário individual */
export async function generateSeminarioQuestions(cfg: SeminarioConfig): Promise<string[]> {
  if (isDemoMode()) return DEMO_SEMINARIO_QUESTIONS;

  const duracao = DURACAO_MAP[cfg.duracao] ?? cfg.duracao;
  const dominio = DOMINIO_MAP[cfg.dominioTema] ?? cfg.dominioTema;
  const perguntas = PERGUNTAS_TURMA_MAP[cfg.perguntasTurma] ?? cfg.perguntasTurma;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Você é um simulador de seminários acadêmicos universitários.
Disciplina: "${cfg.disciplina}". Tema: "${cfg.tema}". Duração: ${duracao}.
O aluno ${dominio}. ${perguntas}.${cfg.usaSlides ? " O aluno usará slides." : ""}

Gere exatamente 6 situações/perguntas seguindo esta estrutura obrigatória:
1. Peça ao aluno que abra e contextualize o tema para a turma
2. Peça que apresente a tese central ou argumento principal do seminário
3. Peça que cite um dado, autor ou exemplo concreto que sustente a tese
4. Faça uma pergunta crítica e aprofundada como um professor de "${cfg.disciplina}" faria sobre "${cfg.tema}"
5. Faça uma pergunta mais simples e curiosa como um colega de turma faria
6. Peça que encerre o seminário de forma marcante

Calibre a dificuldade das perguntas 4 e 5 ao nível de domínio do aluno (${dominio}).
${cfg.dominioTema === "POUCO" ? "Como o aluno conhece pouco o tema, as perguntas devem ser mais básicas e introdutórias." : ""}

Retorne JSON: { "perguntas": ["...", "...", "...", "...", "...", "..."] }`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.perguntas) && parsed.perguntas.length >= 6) {
          return parsed.perguntas.slice(0, 6);
        }
      }
    } catch { /* fallback */ }

    const questions = text
      .split("\n")
      .map((q) => q.trim().replace(/^[\d\-\.\)\*]+\s*/, ""))
      .filter((q) => q.length > 10)
      .slice(0, 6);

    return questions.length >= 6 ? questions : DEMO_SEMINARIO_QUESTIONS;
  } catch (err) {
    if (isCreditError(err)) return DEMO_SEMINARIO_QUESTIONS;
    throw err;
  }
}

/** Analisa seminário — 3 dimensões: Domínio (40), Estrutura (30), Gestão de perguntas (30) */
export async function analyzeSeminarioAnswers(
  cfg: SeminarioConfig,
  qa: { question: string; answer: string }[]
): Promise<FeedbackResult> {
  if (isDemoMode()) return DEMO_SEMINARIO_FEEDBACK;

  const pairs = qa
    .map((item, i) => `Situação ${i + 1}: ${item.question}\nResposta: ${item.answer}`)
    .join("\n\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 768,
      messages: [
        {
          role: "user",
          content: `Você é um professor universitário avaliando um seminário acadêmico.
Disciplina: "${cfg.disciplina}". Tema: "${cfg.tema}".${cfg.usaSlides ? " O aluno usou slides." : ""}

Situações e respostas do aluno:
${pairs}

Avalie em 3 dimensões:
- Domínio do conteúdo (0-40): demonstrou conhecimento sólido do tema
- Estrutura da fala (0-30): organização, progressão lógica, abertura e encerramento${cfg.usaSlides ? ", uso de slides" : ""}
- Gestão de perguntas (0-30): respondeu com segurança e coerência às perguntas do professor e da turma

Use linguagem acadêmica condizente com o contexto universitário.
${cfg.dominioTema === "POUCO" ? "O aluno declarou conhecer pouco o tema — seja encorajador e didático no feedback." : ""}

Responda EXATAMENTE neste formato JSON (sem markdown, sem texto extra):
{
  "score": <soma das 3 dimensões, 0-100>,
  "pontoForte": "<o que demonstrou maior domínio acadêmico, em 1 frase>",
  "pontoMelhoria": "<a maior lacuna técnica ou argumentativa, em 1 frase>",
  "dicaAcionavel": "<uma ação específica para melhorar antes do seminário real, em 1 frase concreta>",
  "resumoGeral": "<avaliação do professor em 2 frases com tom acadêmico>"
}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
        strongPoint: parsed.pontoForte ?? "Demonstrou compreensão adequada do tema.",
        improvementPoint: parsed.pontoMelhoria ?? "Aprofunde os argumentos com referências acadêmicas.",
        dicaAcionavel: parsed.dicaAcionavel ?? "Ensaie a abertura e o encerramento em voz alta.",
        resumoGeral: parsed.resumoGeral ?? "Seminário com potencial. Continue praticando.",
      };
    } catch {
      return DEMO_SEMINARIO_FEEDBACK;
    }
  } catch (err) {
    if (isCreditError(err)) return DEMO_SEMINARIO_FEEDBACK;
    throw err;
  }
}

// ─── Apresentação de Disciplina ──────────────────────────────────────────────

export type ApresentacaoDisciplinaConfig = {
  disciplina: string;
  tema: string;
  duracao: string;
  formato: string; // "INDIVIDUAL" | "GRUPO"
  perguntasProfessor: string; // "SEMPRE" | "AS_VEZES" | "RARAMENTE"
};

const DEMO_APRES_DISCIPLINA_QUESTIONS = [
  "Você tem 30 segundos. Como você abre sua apresentação de forma que prenda a atenção da turma?",
  "Explique o ponto principal do seu tema como se eu não soubesse absolutamente nada sobre o assunto.",
  "Dê um exemplo prático e concreto do que você acabou de explicar.",
  "Por que esse tema é relevante nos dias de hoje? Qual é a sua aplicação no mundo real?",
  "Como você fecha sua apresentação de uma forma que o professor e a turma vão lembrar?",
];

const DEMO_APRES_DISCIPLINA_FEEDBACK: FeedbackResult = {
  score: 72,
  strongPoint: "Você estruturou bem a abertura e trouxe um exemplo concreto que facilitou o entendimento do conteúdo.",
  improvementPoint: "O encerramento foi fraco — finalizou sem uma mensagem conclusiva clara, o que dispersa a atenção da turma.",
  dicaAcionavel: "Prepare uma frase de encerramento memorável antes da apresentação real — algo que resuma o tema em uma ideia central.",
  resumoGeral: "O aluno demonstrou domínio razoável do conteúdo e boa capacidade de exemplificação. Com um encerramento mais assertivo e respostas mais seguras às perguntas, a nota pode subir consideravelmente.",
};

const FORMATO_MAP: Record<string, string> = { INDIVIDUAL: "individual", GRUPO: "em grupo" };
const PERGUNTAS_PROF_MAP: Record<string, string> = {
  SEMPRE: "sempre faz perguntas",
  AS_VEZES: "às vezes faz perguntas",
  RARAMENTE: "raramente faz perguntas",
};
const DURACAO_APRES_MAP: Record<string, string> = {
  ATE_5: "até 5 minutos",
  "5_A_10": "5 a 10 minutos",
  "10_A_20": "10 a 20 minutos",
  MAIS_20: "mais de 20 minutos",
};

export async function generateApresentacaoDisciplinaQuestions(cfg: ApresentacaoDisciplinaConfig): Promise<string[]> {
  if (isDemoMode()) return DEMO_APRES_DISCIPLINA_QUESTIONS;

  const duracao = DURACAO_APRES_MAP[cfg.duracao] ?? cfg.duracao;
  const formato = FORMATO_MAP[cfg.formato] ?? cfg.formato;
  const perguntas = PERGUNTAS_PROF_MAP[cfg.perguntasProfessor] ?? cfg.perguntasProfessor;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Você é um simulador de apresentações acadêmicas universitárias.
Disciplina: "${cfg.disciplina}". Tema: "${cfg.tema}". Duração: ${duracao}. Formato: ${formato}.
O professor ${perguntas}.
${cfg.tema === "A definir" ? "O aluno ainda não definiu o tema — gere perguntas genéricas sobre a disciplina." : ""}

Gere exatamente 5 situações seguindo esta estrutura obrigatória:
1. Situação de abertura — peça ao aluno que abra a apresentação em até 30 segundos
2. Situação de desenvolvimento — peça que explique o ponto principal como se o ouvinte não soubesse nada
3. Pedido de exemplo prático e concreto sobre o tema
4. Pergunta realista que um professor de "${cfg.disciplina}" faria sobre "${cfg.tema}" (varie a cada simulação)
5. Situação de encerramento — peça que feche de forma memorável

Adapte o nível de detalhe pedido à duração (${duracao}).
Retorne JSON: { "perguntas": ["...", "...", "...", "...", "..."] }`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.perguntas) && parsed.perguntas.length >= 5) return parsed.perguntas.slice(0, 5);
      }
    } catch { /* fallback */ }
    return DEMO_APRES_DISCIPLINA_QUESTIONS;
  } catch (err) {
    if (isCreditError(err)) return DEMO_APRES_DISCIPLINA_QUESTIONS;
    throw err;
  }
}

export async function analyzeApresentacaoDisciplina(cfg: ApresentacaoDisciplinaConfig, qa: { question: string; answer: string }[]): Promise<FeedbackResult> {
  if (isDemoMode()) return DEMO_APRES_DISCIPLINA_FEEDBACK;

  const pairs = qa.map((item, i) => `Situação ${i + 1}: ${item.question}\nResposta: ${item.answer}`).join("\n\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 768,
      messages: [{
        role: "user",
        content: `Você é um professor universitário avaliando a apresentação de um aluno.
Disciplina: "${cfg.disciplina}". Tema: "${cfg.tema}". Formato: ${FORMATO_MAP[cfg.formato] ?? cfg.formato}.

Situações e respostas do aluno:
${pairs}

Avalie em 3 dimensões:
- Estrutura (0-35): abertura clara, desenvolvimento lógico, encerramento
- Clareza do conteúdo (0-35): explicou o tema de forma compreensível
- Segurança (0-30): respondeu bem à pergunta do professor

Responda EXATAMENTE neste formato JSON (sem markdown):
{
  "score": <soma, 0-100>,
  "pontoForte": "<o que foi bem na apresentação, 1 frase>",
  "pontoMelhoria": "<maior gap técnico ou de estrutura, 1 frase>",
  "dicaAcionavel": "<o que fazer diferente na próxima, 1 frase concreta>",
  "resumoGeral": "<avaliação do professor em 2 frases>"
}`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
        strongPoint: parsed.pontoForte ?? "Boa estrutura geral.",
        improvementPoint: parsed.pontoMelhoria ?? "Aprofunde o desenvolvimento do conteúdo.",
        dicaAcionavel: parsed.dicaAcionavel ?? "Prepare o encerramento com antecedência.",
        resumoGeral: parsed.resumoGeral ?? "Apresentação com potencial.",
      };
    } catch { return DEMO_APRES_DISCIPLINA_FEEDBACK; }
  } catch (err) {
    if (isCreditError(err)) return DEMO_APRES_DISCIPLINA_FEEDBACK;
    throw err;
  }
}

// ─── Apresentação Pessoal ────────────────────────────────────────────────────

export type ApresentacaoPessoalConfig = {
  contexto: string; // "TURMA" | "GRUPO_ESTUDO" | "CA" | "REPUBLICA" | "EVENTO" | "OUTRO"
  numeroPessoas: string; // "MENOS_5" | "5_A_20" | "MAIS_20"
  tom: string; // "DESCONTRAIDO" | "PROFISSIONAL" | "CURIOSO"
  destaques?: string;
};

const DEMO_APRES_PESSOAL_QUESTIONS = [
  "Me apresente como se você acabou de entrar na sala e todos te olharam. O que você diz nos primeiros 30 segundos?",
  "Alguém te pergunta: 'O que você faz além da faculdade?' Como você responde de forma que crie uma conexão?",
  "Como você explicaria em uma frase por que escolheu esse curso — de um jeito que seja honesto e interessante?",
  "A pessoa ao seu lado te pergunta o que você espera desse semestre. O que você responde?",
];

const DEMO_APRES_PESSOAL_FEEDBACK: FeedbackResult = {
  score: 78,
  strongPoint: "Você foi direto e criou identificação logo de cara — sua abertura foi natural e não forçada.",
  improvementPoint: "Adicione um detalhe pessoal único para ser mais memorável. Todos dizem 'gosto de música'; o que te diferencia?",
  dicaAcionavel: "Na próxima vez, termine sua apresentação com uma pergunta para a outra pessoa — isso cria conexão imediata e tira o foco de você.",
  resumoGeral: "Apresentação pessoal clara e com boa autenticidade. Com um elemento mais memorável e o hábito de engajar o outro no final, você vai criar conexões muito mais fortes.",
};

const CONTEXTO_MAP: Record<string, string> = {
  TURMA: "turma da faculdade",
  GRUPO_ESTUDO: "grupo de estudo",
  CA: "Centro Acadêmico",
  REPUBLICA: "república",
  EVENTO: "evento de integração",
  OUTRO: "contexto universitário",
};
const NUMERO_PESSOAS_MAP: Record<string, string> = {
  MENOS_5: "menos de 5 pessoas",
  "5_A_20": "entre 5 e 20 pessoas",
  MAIS_20: "mais de 20 pessoas",
};
const TOM_MAP: Record<string, string> = {
  DESCONTRAIDO: "descontraído e acessível",
  PROFISSIONAL: "profissional e sério",
  CURIOSO: "curioso e engajado",
};

export async function generateApresentacaoPessoalQuestions(cfg: ApresentacaoPessoalConfig): Promise<string[]> {
  if (isDemoMode()) return DEMO_APRES_PESSOAL_QUESTIONS;

  const contexto = CONTEXTO_MAP[cfg.contexto] ?? cfg.contexto;
  const numero = NUMERO_PESSOAS_MAP[cfg.numeroPessoas] ?? cfg.numeroPessoas;
  const tom = TOM_MAP[cfg.tom] ?? cfg.tom;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Você é um simulador de situações sociais universitárias.
Contexto: ${contexto}, para ${numero}, tom desejado: ${tom}.
${cfg.destaques ? `O aluno quer destacar: "${cfg.destaques}".` : ""}

Gere exatamente 4 situações/perguntas reais que esse estudante enfrentaria ao se apresentar.
Cada situação deve ser direta, no tom ${tom}, e simular um momento real.
Use linguagem informal e universitária.
Retorne JSON: { "perguntas": ["...", "...", "...", "..."] }`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.perguntas) && parsed.perguntas.length >= 4) return parsed.perguntas.slice(0, 4);
      }
    } catch { /* fallback */ }
    return DEMO_APRES_PESSOAL_QUESTIONS;
  } catch (err) {
    if (isCreditError(err)) return DEMO_APRES_PESSOAL_QUESTIONS;
    throw err;
  }
}

export async function analyzeApresentacaoPessoal(cfg: ApresentacaoPessoalConfig, qa: { question: string; answer: string }[]): Promise<FeedbackResult> {
  if (isDemoMode()) return DEMO_APRES_PESSOAL_FEEDBACK;

  const pairs = qa.map((item, i) => `Situação ${i + 1}: ${item.question}\nResposta: ${item.answer}`).join("\n\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 768,
      messages: [{
        role: "user",
        content: `Você é um coach de comunicação avaliando a apresentação pessoal de um universitário.
Contexto: ${CONTEXTO_MAP[cfg.contexto] ?? cfg.contexto}. Tom desejado: ${TOM_MAP[cfg.tom] ?? cfg.tom}.

Situações e respostas:
${pairs}

Avalie em 3 dimensões:
- Clareza (0-33): se apresentou de forma compreensível e organizada
- Autenticidade (0-33): soou natural, genuíno, não forçado
- Memorabilidade (0-34): há algo que faria essa pessoa ser lembrada

Use linguagem próxima, encorajadora e prática — o tom de um coach, não de um professor.
Responda EXATAMENTE neste formato JSON (sem markdown):
{
  "score": <soma, 0-100>,
  "pontoForte": "<frase curta e específica sobre o que foi bem>",
  "pontoMelhoria": "<frase curta e específica sobre o que melhorar>",
  "dicaAcionavel": "<instrução prática para a próxima vez>",
  "resumoGeral": "<2 frases avaliando o conjunto>"
}`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
        strongPoint: parsed.pontoForte ?? "Apresentação natural e direta.",
        improvementPoint: parsed.pontoMelhoria ?? "Adicione um elemento pessoal único.",
        dicaAcionavel: parsed.dicaAcionavel ?? "Termine com uma pergunta para a outra pessoa.",
        resumoGeral: parsed.resumoGeral ?? "Boa apresentação. Continue praticando.",
      };
    } catch { return DEMO_APRES_PESSOAL_FEEDBACK; }
  } catch (err) {
    if (isCreditError(err)) return DEMO_APRES_PESSOAL_FEEDBACK;
    throw err;
  }
}

// ─── Trabalho em Grupo ───────────────────────────────────────────────────────

export type TrabalhoGrupoConfig = {
  disciplina: string;
  tema: string;
  tamanhoGrupo: string; // "2" | "3" | "4" | "5_MAIS"
  suaParte: string;
  duracao: string; // "ATE_3" | "3_A_7" | "7_A_15"
  posicao: string; // "ABRE" | "DESENVOLVE" | "FECHA"
};

const DEMO_TRABALHO_GRUPO_QUESTIONS = [
  "O colega anterior terminou a parte dele. Como você assume a palavra de forma natural e fluida?",
  "Apresente o início da sua parte do trabalho — contextualize o que você vai abordar.",
  "Explique o conceito central da sua parte de forma clara, como se eu fosse o professor avaliando.",
  "O professor interrompe e pergunta especificamente sobre a sua parte. Como você responde com segurança?",
  "Sua parte acabou. Como você passa a palavra para o próximo colega de forma coesa com o que você falou?",
];

const DEMO_TRABALHO_GRUPO_FEEDBACK: FeedbackResult = {
  score: 70,
  strongPoint: "Você explicou sua parte com clareza e trouxe o conteúdo de forma bem estruturada dentro do contexto do grupo.",
  improvementPoint: "As transições precisam de mais fluidez — ao assumir e passar a palavra, conecte explicitamente o que veio antes e o que vem depois.",
  dicaAcionavel: "Prepare uma frase de transição de entrada ('Dando continuidade ao que o [colega] apresentou...') e uma de saída ('Para completar esse raciocínio, o [próximo] vai falar sobre...').",
  resumoGeral: "Contribuição individual sólida com bom domínio do conteúdo. O ponto de melhoria está nas transições, que são o diferencial de uma apresentação em grupo realmente coesa.",
};

const DURACAO_GRUPO_MAP: Record<string, string> = {
  ATE_3: "até 3 minutos",
  "3_A_7": "3 a 7 minutos",
  "7_A_15": "7 a 15 minutos",
};
const POSICAO_MAP: Record<string, string> = { ABRE: "abre o trabalho", DESENVOLVE: "desenvolve uma parte", FECHA: "fecha o trabalho" };

export async function generateTrabalhoGrupoQuestions(cfg: TrabalhoGrupoConfig): Promise<string[]> {
  if (isDemoMode()) return DEMO_TRABALHO_GRUPO_QUESTIONS;

  const duracao = DURACAO_GRUPO_MAP[cfg.duracao] ?? cfg.duracao;
  const posicao = POSICAO_MAP[cfg.posicao] ?? cfg.posicao;
  const colega = cfg.tamanhoGrupo === "2" ? "seu parceiro" : "o próximo colega";

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Você é um simulador de apresentação em grupo universitária.
Disciplina: "${cfg.disciplina}". Tema geral: "${cfg.tema}".
Parte do usuário: "${cfg.suaParte}". Posição: ${posicao}. Duração: ${duracao}.
Tamanho do grupo: ${cfg.tamanhoGrupo === "5_MAIS" ? "5 ou mais pessoas" : `${cfg.tamanhoGrupo} pessoas`}.

Gere exatamente 5 situações focadas APENAS na parte do usuário:
${cfg.posicao === "ABRE"
  ? "1. Como o usuário ABRE o trabalho do grupo e contextualiza o tema para a turma (não há colega antes)"
  : "1. O colega anterior terminou — como o usuário assume a palavra de forma fluida?"
}
2. Peça que apresente o início da sua parte (${cfg.suaParte})
3. Peça que desenvolva o ponto principal de "${cfg.suaParte}" de forma clara
4. Pergunta do professor especificamente sobre "${cfg.suaParte}" (não sobre o tema geral)
${cfg.posicao === "FECHA"
  ? "5. Como o usuário FECHA o trabalho inteiro de forma marcante e conclusiva"
  : `5. Como o usuário passa a palavra para ${colega} de forma coesa?`
}

As situações devem soar como um contexto real de apresentação em sala de aula.
Retorne JSON: { "perguntas": ["...", "...", "...", "...", "..."] }`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.perguntas) && parsed.perguntas.length >= 5) return parsed.perguntas.slice(0, 5);
      }
    } catch { /* fallback */ }
    return DEMO_TRABALHO_GRUPO_QUESTIONS;
  } catch (err) {
    if (isCreditError(err)) return DEMO_TRABALHO_GRUPO_QUESTIONS;
    throw err;
  }
}

export async function analyzeTrabalhoGrupo(cfg: TrabalhoGrupoConfig, qa: { question: string; answer: string }[]): Promise<FeedbackResult> {
  if (isDemoMode()) return DEMO_TRABALHO_GRUPO_FEEDBACK;

  const pairs = qa.map((item, i) => `Situação ${i + 1}: ${item.question}\nResposta: ${item.answer}`).join("\n\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 768,
      messages: [{
        role: "user",
        content: `Você é um professor avaliando a participação individual de um aluno em um trabalho em grupo.
Disciplina: "${cfg.disciplina}". Parte apresentada: "${cfg.suaParte}". Posição: ${POSICAO_MAP[cfg.posicao] ?? cfg.posicao}.

Situações e respostas:
${pairs}

Avalie em 3 dimensões:
- Clareza da parte (0-35): explicou bem a parte que lhe cabia
- Coesão com o grupo (0-30): as transições foram fluidas e conectadas ao todo do trabalho
- Segurança e preparo (0-35): respondeu bem à pergunta e demonstrou preparo

Responda EXATAMENTE neste formato JSON (sem markdown):
{
  "score": <soma, 0-100>,
  "pontoForte": "<o que o aluno fez bem na sua parte do grupo, 1 frase>",
  "pontoMelhoria": "<o que prejudicou a contribuição dele ao grupo, 1 frase>",
  "dicaAcionavel": "<uma ação específica para melhorar a participação no grupo, 1 frase>",
  "resumoGeral": "<avaliação da contribuição individual em 2 frases>"
}`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
        strongPoint: parsed.pontoForte ?? "Boa clareza na sua parte.",
        improvementPoint: parsed.pontoMelhoria ?? "Melhore as transições entre colegas.",
        dicaAcionavel: parsed.dicaAcionavel ?? "Prepare frases de transição específicas.",
        resumoGeral: parsed.resumoGeral ?? "Contribuição individual sólida.",
      };
    } catch { return DEMO_TRABALHO_GRUPO_FEEDBACK; }
  } catch (err) {
    if (isCreditError(err)) return DEMO_TRABALHO_GRUPO_FEEDBACK;
    throw err;
  }
}
