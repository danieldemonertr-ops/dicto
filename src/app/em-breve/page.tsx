import Link from "next/link";

export default function EmBrevePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 text-center"
      style={{ background: "#ffffff" }}
    >
      {/* Blob decorativo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 700px 500px at 50% 40%, rgba(29,158,117,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
        <span className="text-6xl">🚀</span>

        <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "#111312" }}>
          Em Breve
        </h1>

        <p className="text-lg leading-relaxed" style={{ color: "#6B7280" }}>
          Estamos trabalhando em algo incrível para você. Novas soluções chegando em breve!
        </p>

        <Link
          href="/"
          className="mt-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#1D9E75" }}
        >
          ← Voltar para o início
        </Link>
      </div>
    </main>
  );
}
