import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContextoClient } from "./ContextoClient";

export default async function ContextoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true },
  });

  if (user?.onboardingCompletedAt) redirect("/dashboard");

  return <ContextoClient />;
}
