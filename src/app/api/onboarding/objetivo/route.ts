import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  objetivo: z.enum(["ENTREVISTA_BREVE", "PREPARACAO", "APRESENTACAO", "EXPLORANDO"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // Salva objetivo e marca onboarding como concluído
  await prisma.$transaction([
    prisma.userProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        contextos: [],
        objetivoImediato: parsed.data.objetivo,
      },
      update: {
        objetivoImediato: parsed.data.objetivo,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompletedAt: new Date() },
    }),
  ]);

  const redirectTo =
    parsed.data.objetivo === "ENTREVISTA_BREVE" ? "/simular" : "/dashboard";

  return NextResponse.json({ ok: true, redirectTo });
}
