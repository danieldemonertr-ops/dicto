import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  questionId: z.string().cuid(),
  answer: z.string().min(1).max(5000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { questionId, answer } = parsed.data;

  // Garante que a pergunta pertence à sessão
  const question = await prisma.simulationQuestion.findFirst({
    where: { id: questionId, sessionId },
  });
  if (!question) {
    return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 404 });
  }

  // Upsert da resposta
  await prisma.simulationAnswer.upsert({
    where: { questionId },
    create: { questionId, answer },
    update: { answer },
  });

  return NextResponse.json({ ok: true });
}
