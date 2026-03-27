import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/app/dashboard/DashboardHeader";
import { BackButton } from "@/components/ui/back-button";
import { NovaAtividadeClient } from "./NovaAtividadeClient";

export default async function NovaAtividadePage({
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
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!group) redirect("/grupos");

  return (
    <main className="min-h-screen" style={{ background: "#F7F7F2" }}>
      <DashboardHeader
        name={currentUser?.name ?? "Usuário"}
        email={currentUser?.email ?? undefined}
      />
      <div className="mx-auto max-w-lg px-4 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton label="Atividades" />
        </div>

        <NovaAtividadeClient
          group={group}
          myUserId={session.user.id}
        />
      </div>
    </main>
  );
}
