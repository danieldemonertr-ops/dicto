import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <div className="text-center flex flex-col items-center gap-6">
        <h1 className="text-5xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
          Dicto
        </h1>
        <p className="text-xl max-w-sm" style={{ color: "var(--color-textSecondary)" }}>
          Simule sua entrevista de estágio com IA antes do dia que importa.
        </p>
        <Link
          href="/simular"
          className="px-8 py-4 rounded-full text-base font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
        >
          Iniciar simulação grátis →
        </Link>
        <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>
          Sem cadastro · 100% personalizado · Feedback em segundos
        </p>
      </div>
    </main>
  );
}
