import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SimulacaoClient } from "./SimulacaoClient";

export default async function SimulacaoPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.simulationSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { answer: true },
      },
    },
  });

  if (!session) notFound();

  // Já completada → vai para resultado
  if (session.completedAt) {
    redirect(`/simular/${sessionId}/resultado`);
  }

  const questions = session.questions.map((q) => ({
    id: q.id,
    question: q.question,
    answered: !!q.answer?.answer,
  }));

  return (
    <SimulacaoClient
      sessionId={sessionId}
      jobTitle={session.jobTitle}
      company={session.company}
      questions={questions}
    />
  );
}
