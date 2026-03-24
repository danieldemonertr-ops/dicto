import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  analyzeAnswers, analyzeSeminarioAnswers, SeminarioConfig,
  analyzeApresentacaoDisciplina, ApresentacaoDisciplinaConfig,
  analyzeApresentacaoPessoal, ApresentacaoPessoalConfig,
  analyzeTrabalhoGrupo, TrabalhoGrupoConfig,
} from "@/lib/claude";
import { auth } from "@/lib/auth";
import { incrementUsage } from "@/lib/limits";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const simSession = await prisma.simulationSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { answer: true },
      },
    },
  });

  if (!simSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }
  if (simSession.completedAt) {
    return NextResponse.json({
      score: simSession.score,
      strongPoint: simSession.strongPoint,
      improvementPoint: simSession.improvementPoint,
      dicaAcionavel: simSession.dicaAcionavel,
      resumoGeral: simSession.resumoGeral,
    });
  }

  const qa = simSession.questions
    .filter((q) => q.answer?.answer)
    .map((q) => ({ question: q.question, answer: q.answer!.answer }));

  if (qa.length === 0) {
    return NextResponse.json({ error: "Nenhuma resposta encontrada" }, { status: 400 });
  }

  let feedback;
  const cfg = simSession.config as Record<string, unknown> | null;
  if (simSession.tipo === "SEMINARIO_INDIVIDUAL" && cfg) {
    feedback = await analyzeSeminarioAnswers(cfg as SeminarioConfig, qa);
  } else if (simSession.tipo === "APRESENTACAO_DISCIPLINA" && cfg) {
    feedback = await analyzeApresentacaoDisciplina(cfg as ApresentacaoDisciplinaConfig, qa);
  } else if (simSession.tipo === "APRESENTACAO_PESSOAL" && cfg) {
    feedback = await analyzeApresentacaoPessoal(cfg as ApresentacaoPessoalConfig, qa);
  } else if (simSession.tipo === "TRABALHO_GRUPO" && cfg) {
    feedback = await analyzeTrabalhoGrupo(cfg as TrabalhoGrupoConfig, qa);
  } else {
    feedback = await analyzeAnswers(simSession.jobTitle, simSession.company, qa);
  }
  const { score, strongPoint, improvementPoint, dicaAcionavel, resumoGeral } = feedback;

  await prisma.simulationSession.update({
    where: { id: sessionId },
    data: { score, strongPoint, improvementPoint, dicaAcionavel, resumoGeral, completedAt: new Date() },
  });

  // Incrementa uso se usuário autenticado
  const session = await auth();
  if (session?.user?.id && simSession.userId === session.user.id) {
    await incrementUsage(session.user.id);
  }

  return NextResponse.json({ score, strongPoint, improvementPoint, dicaAcionavel, resumoGeral });
}
