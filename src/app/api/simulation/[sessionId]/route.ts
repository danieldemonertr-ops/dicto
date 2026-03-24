import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const session = await prisma.simulationSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    id: session.id,
    jobTitle: session.jobTitle,
    company: session.company,
    score: session.score,
    strongPoint: session.strongPoint,
    improvementPoint: session.improvementPoint,
    dicaAcionavel: session.dicaAcionavel,
    resumoGeral: session.resumoGeral,
    completedAt: session.completedAt,
    questions: session.questions.map((q) => ({ id: q.id, question: q.question })),
  });
}
