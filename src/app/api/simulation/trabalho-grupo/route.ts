import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTrabalhoGrupoQuestions } from "@/lib/claude";
import { checkUsageLimit } from "@/lib/limits";

const schema = z.object({
  disciplina: z.string().min(2).max(100),
  tema: z.string().min(2).max(200),
  tamanhoGrupo: z.enum(["2", "3", "4", "5_MAIS"]),
  suaParte: z.string().min(5).max(500),
  duracao: z.enum(["ATE_3", "3_A_7", "7_A_15"]),
  posicao: z.enum(["ABRE", "DESENVOLVE", "FECHA"]),
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

  const questions = await generateTrabalhoGrupoQuestions(cfg);

  const simSession = await prisma.simulationSession.create({
    data: {
      userId, tipo: "TRABALHO_GRUPO", config: cfg,
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
