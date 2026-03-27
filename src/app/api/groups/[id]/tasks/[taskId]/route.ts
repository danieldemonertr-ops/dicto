import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/groups/[id]/tasks/[taskId] — update status or assignee
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Não é membro" }, { status: 403 });

  const task = await prisma.groupTask.findFirst({ where: { id: taskId, groupId: id } });
  if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });

  const { status, assignedToId } = await req.json();

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (assignedToId !== undefined) updates.assignedToId = assignedToId;

  const updated = await prisma.groupTask.update({
    where: { id: taskId },
    data: updates,
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy:  { select: { id: true, name: true, email: true } },
    },
  });

  const actorName = (await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  }))?.name ?? "Alguém";

  // Log status change
  if (status === "DONE") {
    await prisma.groupActivityLog.create({
      data: { groupId: id, taskId, actorId: session.user.id, action: "TASK_COMPLETED", detail: task.title },
    });
    // Notify group
    const members = await prisma.groupMember.findMany({
      where: { groupId: id, userId: { not: session.user.id } },
      select: { userId: true },
    });
    await prisma.notification.createMany({
      data: members.map((m) => ({
        userId:  m.userId,
        title:   "Atividade concluída!",
        body:    `${actorName} concluiu: "${task.title}"`,
        groupId: id,
        taskId,
      })),
    });
  }

  // Log assignment change
  if (assignedToId !== undefined && assignedToId !== task.assignedToId) {
    await prisma.groupActivityLog.create({
      data: { groupId: id, taskId, actorId: session.user.id, action: "TASK_ASSIGNED", detail: assignedToId ?? null },
    });
    if (assignedToId && assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId:  assignedToId,
          title:   "Você foi responsabilizado",
          body:    `${actorName} atribuiu a você: "${task.title}"`,
          groupId: id,
          taskId,
        },
      });
    }
  }

  return NextResponse.json(updated);
}
