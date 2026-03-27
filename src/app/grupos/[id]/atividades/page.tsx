import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/app/dashboard/DashboardHeader";
import { BackButton } from "@/components/ui/back-button";
import { AtividadesClient } from "./AtividadesClient";

export default async function AtividadesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: session.user.id } },
  });
  if (!membership) redirect("/grupos");

  const group = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      discipline: true,
      imageUrl: true,
      deliveryDate: true,
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!group) redirect("/grupos");

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

  return (
    <main className="min-h-screen" style={{ background: "#F7F7F2" }}>
      <DashboardHeader
        name={currentUser?.name ?? "Usuário"}
        email={currentUser?.email ?? undefined}
      />
      <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton label={group.name} />
        </div>

        <AtividadesClient
          group={{ ...group, deliveryDate: group.deliveryDate?.toISOString() ?? null }}
          initialTasks={tasks.map((t) => ({ ...t, deadline: t.deadline?.toISOString() ?? null, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }))}
          initialLogs={logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))}
          myUserId={session.user.id}
          myRole={membership.role}
        />
      </div>
    </main>
  );
}
