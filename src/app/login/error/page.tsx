export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center flex flex-col gap-4"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
      >
        <div className="text-4xl">⚠️</div>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
          Algo deu errado
        </h1>
        <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
          Não foi possível fazer o login. Tente novamente.
        </p>
        <a
          href="/login"
          className="mt-2 rounded-xl py-3 text-sm font-semibold text-center"
          style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
        >
          Voltar ao login
        </a>
      </div>
    </main>
  );
}
