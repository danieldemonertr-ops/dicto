import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas protegidas — requerem session token
const REQUIRES_LOGIN = ["/dashboard", "/onboarding", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth.js v5 session token (nome muda conforme NODE_ENV)
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;

  // Hub: usuário logado vai direto pro dashboard
  if (pathname === "/hub" || pathname.startsWith("/hub/")) {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Simulador: só /[id]/simulacao e /[id]/feedback precisam de login
  // Entry forms (/nova, /seminario/nova, etc.) são públicos
  if (pathname.startsWith("/simulador/")) {
    const parts = pathname.split("/").filter(Boolean);
    // parts: ['simulador', id, 'simulacao' | 'feedback']
    const isProtected =
      (parts.length >= 3 && (parts[2] === "simulacao" || parts[2] === "feedback")) ||
      pathname.startsWith("/simulador/historico");
    if (!isProtected) return NextResponse.next();
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Demais rotas protegidas
  const needsLogin = REQUIRES_LOGIN.some((p) => pathname.startsWith(p));
  if (!needsLogin) return NextResponse.next();

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/hub",
    "/hub/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/simulador/:path*",
    "/settings/:path*",
  ],
};
