import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota leve que acorda o banco Neon antes do login.
// Chamada silenciosa na página de login para evitar timeout no OAuth callback.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    // Mesmo com erro, retorna 200 — o objetivo é só disparar o warmup
    return NextResponse.json({ ok: false });
  }
}
