import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  curso: z.string().min(1),
  semestre: z.string().min(1),
  nivelAutopercebido: z.enum(["INICIANTE", "EM_DESENVOLVIMENTO", "CONFIANTE"]),
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

  const formado = parsed.data.semestre === "FORMADO";

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      contextos: [],
      curso: parsed.data.curso,
      semestre: parsed.data.semestre,
      formado,
      nivelAutopercebido: parsed.data.nivelAutopercebido,
    },
    update: {
      curso: parsed.data.curso,
      semestre: parsed.data.semestre,
      formado,
      nivelAutopercebido: parsed.data.nivelAutopercebido,
    },
  });

  return NextResponse.json({ ok: true });
}
