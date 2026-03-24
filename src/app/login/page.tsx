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
  }, []);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", { email, callbackUrl });
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
      >
        <div className="text-center flex flex-col gap-1">
          <p className="text-2xl font-bold">🎙️</p>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Entre para começar seu treino
          </h1>
          {contextoPendente ? (
            <p className="text-sm mt-1" style={{ color: "var(--color-primary)" }}>
              Você escolheu: <strong>{contextoPendente.label}</strong>
            </p>
          ) : (
            <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
              Treine sua comunicação para o momento que importa
            </p>
          )}
        </div>

        {/* Google */}
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="var(--color-googleBlue)"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="var(--color-googleGreen)"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="var(--color-googleYellow)"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="var(--color-googleRed)"/>
          </svg>
          Continuar com Google
        </button>

        <div className="flex items-center gap-3">
          <hr className="flex-1" style={{ borderColor: "var(--color-border)" }} />
          <span className="text-xs" style={{ color: "var(--color-textSecondary)" }}>ou</span>
          <hr className="flex-1" style={{ borderColor: "var(--color-border)" }} />
        </div>

        {/* Email magic link */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
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
              background: "var(--color-surface)",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
          >
            {loading ? "Enviando..." : "Entrar com e-mail"}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: "var(--color-textSecondary)" }}>
          Ao entrar, você concorda com os{" "}
          <span className="underline cursor-pointer">Termos de Uso</span>
        </p>

        {/* Botão de teste — só aparece em localhost */}
        {isLocalhost && (
          <div className="pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
            <a
              href={`/api/auth/dev-login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)", color: "var(--color-textSecondary)" }}
            >
              🧪 Entrar como teste (só em localhost)
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
