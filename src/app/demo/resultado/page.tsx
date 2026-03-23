import { ResultadoClient } from "@/app/simular/[sessionId]/resultado/ResultadoClient";

// Rota de demonstração — dados mockados para screenshots e preview
export default function DemoResultadoPage() {
  return (
    <ResultadoClient
      sessionId="demo"
      jobTitle="Estágio em Marketing"
      company="Google"
      score={82}
      strongPoint="Sua comunicação foi clara e você demonstrou genuíno interesse pela empresa e pela vaga."
      improvementPoint="Traga exemplos concretos de projetos ou situações reais para embasar suas respostas."
    />
  );
}
