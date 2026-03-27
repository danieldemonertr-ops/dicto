import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/groups/[id] — detalhes do grupo
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, currentStreak: true, longestStreak: true, points: true, lastActivityAt: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      projects: { include: { parts: true }, orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({ ...group, myRole: membership.role });
}
