import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeAnswers } from "@/lib/claude";
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
    });
  }

  const qa = simSession.questions
    .filter((q) => q.answer?.answer)
    .map((q) => ({ question: q.question, answer: q.answer!.answer }));

  if (qa.length === 0) {
    return NextResponse.json({ error: "Nenhuma resposta encontrada" }, { status: 400 });
  }

  const { score, strongPoint, improvementPoint } = await analyzeAnswers(
    simSession.jobTitle,
    simSession.company,
    qa
  );

  await prisma.simulationSession.update({
    where: { id: sessionId },
    data: { score, strongPoint, improvementPoint, completedAt: new Date() },
  });

  // Incrementa uso se usuário autenticado
  const session = await auth();
  if (session?.user?.id && simSession.userId === session.user.id) {
    await incrementUsage(session.user.id);
  }

  return NextResponse.json({ score, strongPoint, improvementPoint });
}
