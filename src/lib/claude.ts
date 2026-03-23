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

/** Gera 6 perguntas de entrevista personalizadas */
export async function generateQuestions(
  jobTitle: string,
  company: string,
  experienceLevel: string
): Promise<string[]> {
  const level = EXPERIENCE_MAP[experienceLevel] ?? "alguma experiência";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Você é um recrutador sênior da empresa "${company}" entrevistando um candidato para a vaga de "${jobTitle}". O candidato tem ${level}.

Gere exatamente 6 perguntas de entrevista realistas, progressivas e personalizadas para essa vaga e empresa. As perguntas devem cobrir: motivação, experiência/projetos, habilidades técnicas relevantes, comportamento sob pressão, trabalho em equipe e ambições futuras.

Responda APENAS com as 6 perguntas, uma por linha, sem numeração, sem introdução e sem explicação.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const questions = text
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => q.length > 10)
    .slice(0, 6);

  return questions;
}

/** Analisa todas as respostas e retorna score + feedback */
export async function analyzeAnswers(
  jobTitle: string,
  company: string,
  qa: { question: string; answer: string }[]
): Promise<{ score: number; strongPoint: string; improvementPoint: string }> {
  const pairs = qa
    .map((item, i) => `Pergunta ${i + 1}: ${item.question}\nResposta: ${item.answer}`)
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Você avaliou a entrevista de um candidato para a vaga de "${jobTitle}" na empresa "${company}".

${pairs}

Avalie o desempenho geral do candidato e responda EXATAMENTE neste formato JSON (sem markdown, sem explicação extra):
{"score": <número de 0 a 100>, "strongPoint": "<ponto forte específico em 1 frase>", "improvementPoint": "<ponto de melhora acionável em 1 frase>"}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

  try {
    const parsed = JSON.parse(text);
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
      strongPoint: parsed.strongPoint ?? "Boa comunicação geral.",
      improvementPoint: parsed.improvementPoint ?? "Aprofunde exemplos concretos.",
    };
  } catch {
    return { score: 50, strongPoint: "Boa comunicação geral.", improvementPoint: "Aprofunde exemplos concretos." };
  }
}
