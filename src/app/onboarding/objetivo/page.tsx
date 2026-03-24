import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ObjetivoClient } from "./ObjetivoClient";

export default async function ObjetivoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true },
  });

  if (user?.onboardingCompletedAt) redirect("/dashboard");

  return <ObjetivoClient />;
}
