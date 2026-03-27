import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/app/dashboard/DashboardHeader";
import { BackButton } from "@/components/ui/back-button";
import { GroupClient } from "./GroupClient";

export default async function GroupPage({
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
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              currentStreak: true,
              longestStreak: true,
              points: true,
              lastActivityAt: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!group) redirect("/grupos");

  const firstName = currentUser?.name?.split(" ")[0] ?? "você";

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <DashboardHeader
        name={currentUser?.name ?? firstName}
        email={currentUser?.email ?? undefined}
      />

      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton label="Voltar" />
        </div>

        <GroupClient
          group={group}
          myRole={membership.role}
          myUserId={session.user.id}
        />
      </div>
    </main>
  );
}
