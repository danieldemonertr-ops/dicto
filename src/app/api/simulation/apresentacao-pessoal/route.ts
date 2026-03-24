import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApresentacaoPessoalQuestions } from "@/lib/claude";
import { checkUsageLimit } from "@/lib/limits";

const schema = z.object({
  contexto: z.enum(["TURMA", "GRUPO_ESTUDO", "CA", "REPUBLICA", "EVENTO", "OUTRO"]),
  numeroPessoas: z.enum(["MENOS_5", "5_A_20", "MAIS_20"]),
  tom: z.enum(["DESCONTRAIDO", "PROFISSIONAL", "CURIOSO"]),
  destaques: z.string().max(300).optional(),
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

  const questions = await generateApresentacaoPessoalQuestions(cfg);

  const CONTEXTO_LABEL: Record<string, string> = {
    TURMA: "Turma da faculdade", GRUPO_ESTUDO: "Grupo de estudo",
    CA: "Centro Acadêmico", REPUBLICA: "República",
    EVENTO: "Evento de integração", OUTRO: "Outro contexto",
  };

  const simSession = await prisma.simulationSession.create({
    data: {
      userId, tipo: "APRESENTACAO_PESSOAL", config: cfg,
      jobTitle: "Apresentação Pessoal", company: CONTEXTO_LABEL[cfg.contexto] ?? cfg.contexto,
      questions: { create: questions.map((question, i) => ({ question, orderIndex: i })) },
    },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  return NextResponse.json({
    sessionId: simSession.id,
    questions: simSession.questions.map((q) => ({ id: q.id, question: q.question })),
  });
}
