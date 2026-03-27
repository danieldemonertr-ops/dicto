import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/groups — lista grupos do usuário
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          members: { include: { user: { select: { name: true, email: true, currentStreak: true, points: true } } } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(memberships.map((m) => ({ ...m.group, myRole: m.role })));
}

// POST /api/groups — cria grupo
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, description, discipline, imageUrl, deliveryDate, memberIds } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  // Build additional member records (exclude creator if accidentally included)
  const extraIds: string[] = Array.isArray(memberIds)
    ? memberIds.filter((id: string) => typeof id === "string" && id !== session.user.id)
    : [];

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      discipline: discipline?.trim() || null,
      imageUrl: imageUrl || null,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      ownerId: session.user.id,
      members: {
        create: [
          { userId: session.user.id, role: "ADMIN" },
          ...extraIds.map((id) => ({ userId: id, role: "MEMBER" as const })),
        ],
      },
    },
  });

  return NextResponse.json(group, { status: 201 });
}
