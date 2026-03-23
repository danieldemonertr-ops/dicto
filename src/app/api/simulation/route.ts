import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/claude";
import { checkUsageLimit } from "@/lib/limits";
import { ExperienceLevel } from "@prisma/client";

const schema = z.object({
  jobTitle: z.string().min(2).max(100),
  company: z.string().min(2).max(100),
  experienceLevel: z.nativeEnum(ExperienceLevel),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { jobTitle, company, experienceLevel } = parsed.data;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  // Verifica limites se autenticado
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
        trialEndsAt: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        simulationsThisMonth: true,
        simulationsResetAt: true,
      },
    });

    if (user) {
      const check = await checkUsageLimit(user);
      if (!check.allowed) {
        return NextResponse.json({ error: "limit", reason: check.reason }, { status: 403 });
      }
    }
  }

  // Gera perguntas via Claude API
  const questions = await generateQuestions(jobTitle, company, experienceLevel);

  // Persiste sessão + perguntas
  const simSession = await prisma.simulationSession.create({
    data: {
      userId,
      jobTitle,
      company,
      experienceLevel,
      questions: {
        create: questions.map((question, i) => ({
          question,
          orderIndex: i,
        })),
      },
    },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  return NextResponse.json({
    sessionId: simSession.id,
    questions: simSession.questions.map((q) => ({ id: q.id, question: q.question })),
  });
}
