import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApresentacaoDisciplinaQuestions } from "@/lib/claude";
import { checkUsageLimit } from "@/lib/limits";

const schema = z.object({
  disciplina: z.string().min(2).max(100),
  tema: z.string().min(2).max(200),
  duracao: z.enum(["ATE_5", "5_A_10", "10_A_20", "MAIS_20"]),
  formato: z.enum(["INDIVIDUAL", "GRUPO"]),
  perguntasProfessor: z.enum(["SEMPRE", "AS_VEZES", "RARAMENTE"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const cfg = parsed.data;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true, trialEndsAt: true, stripeSubscriptionId: true, stripeCurrentPeriodEnd: true, simulationsThisMonth: true, simulationsResetAt: true },
    });
    if (user) {
      const check = await checkUsageLimit(user);
      if (!check.allowed) return NextResponse.json({ error: "limit" }, { status: 403 });
    }
  }

  const questions = await generateApresentacaoDisciplinaQuestions(cfg);

  const simSession = await prisma.simulationSession.create({
    data: {
      userId, tipo: "APRESENTACAO_DISCIPLINA", config: cfg,
      jobTitle: cfg.tema, company: cfg.disciplina,
      questions: { create: questions.map((question, i) => ({ question, orderIndex: i })) },
    },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  return NextResponse.json({
    sessionId: simSession.id,
    questions: simSession.questions.map((q) => ({ id: q.id, question: q.question })),
  });
}
