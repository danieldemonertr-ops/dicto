"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXPERIENCE_OPTIONS = [
  { value: "NO_EXPERIENCE", label: "Nenhuma experiência" },
  { value: "SOME_EXPERIENCE", label: "Alguma experiência" },
  { value: "EXPERIENCED", label: "Já trabalhei na área" },
];

export default function SimularPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    experienceLevel: "NO_EXPERIENCE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/simulation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.reason === "trial_expired") {
        router.push("/settings/billing");
        return;
      }
      if (data.reason === "limit_reached") {
        router.push("/settings/billing");
        return;
      }
      setError("Algo deu errado. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push(`/simular/${data.sessionId}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Dicto
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--color-textSecondary)" }}>
            Simule sua entrevista antes do dia que importa.
          </p>
        </div>

        <div className="rounded-2xl p-8 flex flex-col gap-5" style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-textPrimary)" }}>
            Configure sua simulação
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                Vaga
              </label>
              <input
                type="text"
                placeholder="Ex: Estágio em Marketing"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                required
                className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-offset-1 transition"
                style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                Empresa
              </label>
              <input
                type="text"
                placeholder="Ex: Google"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
                className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-offset-1 transition"
                style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
                Nível de experiência
              </label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-offset-1 transition appearance-none bg-white"
                style={{ borderColor: "var(--color-border)", color: "var(--color-textPrimary)" }}
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm" style={{ color: "var(--color-error)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-60 mt-1"
              style={{ background: "var(--color-primary)", color: "var(--color-textPrimary)" }}
            >
              {loading ? "Gerando perguntas com IA..." : "Iniciar simulação →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
