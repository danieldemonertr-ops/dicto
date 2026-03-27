import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/claude";

// POST /api/training-plan — cria plano de treino com IA
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { title, targetDate } = await req.json();
  if (!title?.trim() || !targetDate) {
    return NextResponse.json({ error: "Título e data são obrigatórios" }, { status: 400 });
  }

  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return NextResponse.json({ error: "Data deve ser futura" }, { status: 400 });
  if (diffDays > 90) return NextResponse.json({ error: "Máximo 90 dias" }, { status: 400 });

  // Gera o plano com Claude
  const prompt = `Você é um coach de oratória para universitários brasileiros.
O usuário precisa se preparar para: "${title}"
Data do evento: ${target.toLocaleDateString("pt-BR")} (${diffDays} dias a partir de hoje)

Crie um plano de treino dia a dia com ${diffDays} dias.
Responda APENAS com um JSON array no formato:
[
  { "day": 1, "focus": "titulo curto (max 5 palavras)", "description": "instrução específica de 1 frase" },
  ...
]

Regras:
- Foque nos primeiros dias em conteúdo/estrutura, depois em prática vocal, depois em simulações completas
- Os últimos 2 dias devem ser revisão geral e simulação final
- Linguagem jovem e direta (público 18-24 anos)
- Máximo ${diffDays} itens no array`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return NextResponse.json({ error: "Erro ao gerar plano" }, { status: 500 });

  const days: { day: number; focus: string; description: string }[] = JSON.parse(jsonMatch[0]);

  // Desativa planos anteriores ativos
  await prisma.trainingPlan.updateMany({
    where: { userId: session.user.id, isActive: true },
    data: { isActive: false },
  });

  const plan = await prisma.trainingPlan.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      targetDate: target,
      days: {
        create: days.map((d) => {
          const date = new Date(today);
          date.setDate(today.getDate() + d.day - 1);
          return {
            dayNumber: d.day,
            date,
            focus: d.focus,
            description: d.description,
          };
        }),
      },
    },
    include: { days: { orderBy: { dayNumber: "asc" } } },
  });

  return NextResponse.json(plan, { status: 201 });
}

// GET /api/training-plan — plano ativo do usuário
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: { days: { orderBy: { dayNumber: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plan ?? null);
}
