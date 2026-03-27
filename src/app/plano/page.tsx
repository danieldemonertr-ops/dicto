import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/app/dashboard/DashboardHeader";
import { PlanoClient } from "./PlanoClient";

export default async function PlanoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: { days: { orderBy: { dayNumber: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const firstName = user?.name?.split(" ")[0] ?? "você";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <DashboardHeader name={user?.name ?? firstName} email={user?.email ?? undefined} />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <PlanoClient plan={plan} today={today.toISOString()} />
      </div>
    </main>
  );
}
