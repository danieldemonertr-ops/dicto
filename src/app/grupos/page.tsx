import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/app/dashboard/DashboardHeader";
import Link from "next/link";
import { GruposClient } from "./GruposClient";

export default async function GruposPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          _count: { select: { members: true } },
          members: {
            include: {
              user: { select: { name: true, currentStreak: true, lastActivityAt: true } },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const groups = memberships.map((m) => ({
    ...m.group,
    myRole: m.role,
  }));

  const firstName = user?.name?.split(" ")[0] ?? "você";

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <DashboardHeader name={user?.name ?? firstName} email={user?.email ?? undefined} />

      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Grupos
          </h1>
          <Link
            href="/grupos/novo"
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)" }}
          >
            + Criar grupo
          </Link>
        </div>

        <GruposClient groups={groups} />
      </div>
    </main>
  );
}
