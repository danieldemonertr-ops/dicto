import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ResultadoClient } from "./ResultadoClient";

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.simulationSession.findUnique({
    where: { id: sessionId },
    select: {
      jobTitle: true,
      company: true,
      score: true,
      strongPoint: true,
      improvementPoint: true,
      completedAt: true,
    },
  });

  if (!session) notFound();
  if (!session.completedAt) redirect(`/simular/${sessionId}`);

  return (
    <ResultadoClient
      sessionId={sessionId}
      jobTitle={session.jobTitle}
      company={session.company}
      score={session.score!}
      strongPoint={session.strongPoint!}
      improvementPoint={session.improvementPoint!}
    />
  );
}
