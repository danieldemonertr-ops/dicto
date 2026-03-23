import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas protegidas — não importar Auth.js aqui (evita burst >1MB no Vercel free)
const PROTECTED = ["/dashboard", "/app", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((path) => pathname.startsWith(path));

  if (!isProtected) return NextResponse.next();

  // Auth.js v5 session token (cookie name muda conforme NODE_ENV)
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*", "/settings/:path*"],
};
