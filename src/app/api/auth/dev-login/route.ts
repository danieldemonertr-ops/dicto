import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

// Endpoint de login automático — APENAS em desenvolvimento/localhost
// Cria sessão Auth.js diretamente no banco, sem email ou OAuth
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Não disponível em produção" }, { status: 403 });
  }

  const TEST_EMAIL = "teste@dicto.app";

  // Cria ou encontra o usuário de teste
  let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        name: "Usuário Teste",
        plan: Plan.TRIAL,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        onboardingCompletedAt: new Date(),
      },
    });
  }

  // Cria sessão Auth.js válida no banco
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.session.upsert({
    where: { sessionToken },
    create: { sessionToken, userId: user.id, expires },
    update: { expires },
  });

  // Lê callbackUrl para redirecionar após login
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") ?? "/dashboard";
  const redirectUrl = callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  const response = NextResponse.redirect(new URL(redirectUrl, request.url));

  // Define o cookie de sessão igual ao Auth.js (sem __Secure- em dev)
  response.cookies.set("authjs.session-token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });

  return response;
}
