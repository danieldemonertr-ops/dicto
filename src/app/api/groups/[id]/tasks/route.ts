import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET /api/groups/[id]/tasks ───────────────────────────────────────────────

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
  if (!membership) return NextResponse.json({ error: "Não é membro" }, { status: 403 });

  const [tasks, logs] = await Promise.all([
    prisma.groupTask.findMany({
      where: { groupId: id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy:  { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ status: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
    }),
    prisma.groupActivityLog.findMany({
      where: { groupId: id },
      include: {
        actor: { select: { id: true, name: true, email: true } },
        task:  { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return NextResponse.json({ tasks, logs });
}

// ─── POST /api/groups/[id]/tasks ──────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Não é membro" }, { status: 403 });

  const { title, deadline, assignedToId } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });

  // Validate assignee is a group member (if provided)
  if (assignedToId) {
    const assigneeMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: assignedToId } },
    });
    if (!assigneeMembership) return NextResponse.json({ error: "Usuário não é membro do grupo" }, { status: 400 });
  }

  const task = await prisma.groupTask.create({
    data: {
      groupId:     id,
      title:       title.trim(),
      deadline:    deadline ? new Date(deadline) : null,
      assignedToId: assignedToId ?? null,
      createdById: session.user.id,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy:  { select: { id: true, name: true, email: true } },
    },
  });

  // Log: task created
  await prisma.groupActivityLog.create({
    data: {
      groupId: id,
      taskId:  task.id,
      actorId: session.user.id,
      action:  "TASK_CREATED",
      detail:  title.trim(),
    },
  });

  // Log: task assigned (if assignee was set at creation)
  if (assignedToId) {
    await prisma.groupActivityLog.create({
      data: {
        groupId: id,
        taskId:  task.id,
        actorId: session.user.id,
        action:  "TASK_ASSIGNED",
        detail:  assignedToId,
      },
    });
  }

  // Notifications: all group members except creator get notified
  const members = await prisma.groupMember.findMany({
    where: { groupId: id, userId: { not: session.user.id } },
    select: { userId: true },
  });

  const creatorName = task.createdBy.name ?? task.createdBy.email ?? "Alguém";

  await prisma.notification.createMany({
    data: members.map((m) => ({
      userId:  m.userId,
      title:   "Nova atividade no grupo",
      body:    `${creatorName} criou: "${title.trim()}"`,
      groupId: id,
      taskId:  task.id,
    })),
  });

  // If a specific assignee was set, send them a dedicated notification
  if (assignedToId && assignedToId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId:  assignedToId,
        title:   "Você foi responsabilizado",
        body:    `${creatorName} atribuiu a você: "${title.trim()}"`,
        groupId: id,
        taskId:  task.id,
      },
    });
  }

  return NextResponse.json(task, { status: 201 });
}
