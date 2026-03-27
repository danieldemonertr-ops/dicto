"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";

interface ContextoPendente {
  tipo: string;
  label: string;
  onboarding: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [contextoPendente, setContextoPendente] = useState<ContextoPendente | null>(null);
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get("callbackUrl");
      if (cb && cb.startsWith("/")) setCallbackUrl(cb);

      const rawCtx = sessionStorage.getItem("dicto_contexto_pendente");
      if (rawCtx) setContextoPendente(JSON.parse(rawCtx));

      setIsLocalhost(window.location.hostname === "localhost");
    } catch {
      // sessionStorage pode estar indisponível (SSR ou modo privado)
    }

    fetch("/api/health", { method: "GET" }).catch(() => { /* silencioso */ });
  }, []);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", { email, callbackUrl, redirect: false });
    setLoading(false);
    setSent(true);
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none fixed top-0 left-0 w-[480px] h-[480px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #5DE08A 0%, transparent 70%)", transform: "translate(-40%, -40%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #5DE08A 0%, transparent 70%)", transform: "translate(40%, 40%)" }}
      />

      <div className="w-full max-w-[400px] flex flex-col gap-6 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold mb-1"
            style={{ background: "var(--color-primary)", color: "#111312" }}
          >
            D
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Bem-vindo ao Dicto
          </h1>
          <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
            {contextoPendente
              ? <>Você escolheu: <strong style={{ color: "var(--color-primary)" }}>{contextoPendente.label}</strong></>
              : "Treine sua comunicação para o momento que importa"}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 rounded-xl border py-3 text-sm font-medium transition-all hover:shadow-sm active:scale-[0.99]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-textPrimary)",
              background: "var(--color-bg)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-3">
            <hr className="flex-1" style={{ borderColor: "var(--color-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-textSecondary)" }}>ou</span>
            <hr className="flex-1" style={{ borderColor: "var(--color-border)" }} />
          </div>

          {/* Email magic link */}
          {sent ? (
            <div
              className="rounded-xl p-4 text-center flex flex-col gap-1"
              style={{ background: "rgba(93,224,138,0.1)", border: "1px solid rgba(93,224,138,0.3)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                Verifique seu e-mail ✉️
              </p>
              <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>
                Enviamos um link de acesso para <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--color-textSecondary)" }}>
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 transition"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-textPrimary)",
                    background: "var(--color-bg)",
                    focusRingColor: "var(--color-primary)",
                  } as React.CSSProperties}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "var(--color-primary)", color: "#111312" }}
              >
                {loading ? "Enviando link..." : "Entrar com e-mail →"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs" style={{ color: "var(--color-textSecondary)" }}>
          Ao entrar, você concorda com os{" "}
          <span className="underline cursor-pointer hover:opacity-70 transition-opacity">Termos de Uso</span>
        </p>

        {/* Botão de teste — só aparece em localhost */}
        {isLocalhost && (
          <a
            href={`/api/auth/dev-login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-surface)",
              border: "1px dashed var(--color-border)",
              color: "var(--color-textSecondary)",
            }}
          >
            🧪 Entrar como teste (só em localhost)
          </a>
        )}
      </div>
    </main>
  );
}
