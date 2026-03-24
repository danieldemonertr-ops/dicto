import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FeedbackClient } from "./FeedbackClient";

const TIPO_LABELS: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "Entrevista de Estágio",
  SEMINARIO_INDIVIDUAL: "Seminário Individual",
  APRESENTACAO_DISCIPLINA: "Apresentação de Disciplina",
  APRESENTACAO_PESSOAL: "Apresentação Pessoal",
  TRABALHO_GRUPO: "Trabalho em Grupo",
};

const TIPO_BACK_URLS: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "/simulador/nova",
  SEMINARIO_INDIVIDUAL: "/simulador/seminario/nova",
  APRESENTACAO_DISCIPLINA: "/simulador/apresentacao-disciplina/nova",
  APRESENTACAO_PESSOAL: "/simulador/apresentacao-pessoal/nova",
  TRABALHO_GRUPO: "/simulador/trabalho-grupo/nova",
};

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  const session = await prisma.simulationSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true, tipo: true, config: true,
      jobTitle: true, company: true,
      score: true, strongPoint: true, improvementPoint: true,
      dicaAcionavel: true, resumoGeral: true, completedAt: true,
    },
  });

  if (!session) notFound();
  if (!session.completedAt) redirect(`/simulador/${sessionId}/simulacao`);

  const cfg = session.config as Record<string, string> | null;

  // Monta título e subtítulo conforme o tipo
  let displayTitle = session.jobTitle;
  let displaySubtitle = session.company;

  if (session.tipo === "SEMINARIO_INDIVIDUAL" || session.tipo === "APRESENTACAO_DISCIPLINA") {
    displayTitle = cfg?.tema ?? session.jobTitle;
    displaySubtitle = cfg?.disciplina ?? session.company;
  } else if (session.tipo === "APRESENTACAO_PESSOAL") {
    displayTitle = "Apresentação Pessoal";
    displaySubtitle = session.company; // já é o label do contexto
  } else if (session.tipo === "TRABALHO_GRUPO") {
    displayTitle = cfg?.suaParte ?? session.jobTitle;
    displaySubtitle = `${cfg?.disciplina ?? session.company} · Trabalho em Grupo`;
  }

  return (
    <FeedbackClient
      sessionId={session.id}
      tipo={session.tipo}
      tipoLabel={TIPO_LABELS[session.tipo] ?? session.tipo}
      backUrl={TIPO_BACK_URLS[session.tipo] ?? "/dashboard"}
      jobTitle={displayTitle}
      company={displaySubtitle}
      score={session.score ?? 0}
      strongPoint={session.strongPoint ?? ""}
      improvementPoint={session.improvementPoint ?? ""}
      dicaAcionavel={session.dicaAcionavel ?? ""}
      resumoGeral={session.resumoGeral ?? ""}
    />
  );
}
