export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center flex flex-col gap-4"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
      >
        <div className="text-4xl">📬</div>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
          Verifique seu e-mail
        </h1>
        <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
          Enviamos um link de acesso para o seu e-mail. Clique nele para entrar no Dicto.
        </p>
      </div>
    </main>
  );
}
