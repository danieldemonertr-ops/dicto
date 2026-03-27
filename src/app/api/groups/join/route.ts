import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/groups/join — entra no grupo pelo código de convite
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode?.trim()) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });

  const group = await prisma.group.findUnique({ where: { inviteCode: inviteCode.trim() } });
  if (!group) return NextResponse.json({ error: "Código inválido" }, { status: 404 });

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Você já faz parte deste grupo" }, { status: 409 });

  await prisma.groupMember.create({
    data: { groupId: group.id, userId: session.user.id, role: "MEMBER" },
  });

  return NextResponse.json({ groupId: group.id, groupName: group.name });
}
