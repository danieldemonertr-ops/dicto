"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface PlanDay {
  id: string;
  dayNumber: number;
  date: string | Date;
  focus: string;
  description: string | null;
  completed: boolean;
}

interface Plan {
  id: string;
  title: string;
  targetDate: string | Date;
  days: PlanDay[];
}

interface Props {
  plan: Plan | null;
  today: string;
}

export function PlanoClient({ plan, today }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/training-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, targetDate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao gerar plano"); return; }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const todayDate = new Date(today);
  const todayStr = todayDate.toDateString();

  if (!plan) {
    return (
      <>
      {loading && <LoadingOverlay message="Gerando plano com IA..." />}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
            Plano de Treino
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
            Informe seu evento e a IA gera um cronograma dia a dia.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Qual é o evento? *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Apresentação de TCC em Marketing"
              className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-textPrimary)",
                background: "var(--color-bg)",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-textPrimary)" }}>
              Data do evento *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              max={new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]}
              className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-textPrimary)",
                background: "var(--color-bg)",
              }}
            />
          </div>

          {error && <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !title.trim() || !targetDate}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            {loading ? "Gerando plano com IA... ✨" : "Gerar plano →"}
          </button>
        </form>
      </div>
      </>
    );
  }

  const completedCount = plan.days.filter((d) => d.completed).length;
  const progress = Math.round((completedCount / plan.days.length) * 100);
  const targetDateObj = new Date(plan.targetDate);
  const daysLeft = Math.ceil((targetDateObj.getTime() - todayDate.getTime()) / 86400000);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold leading-snug" style={{ color: "var(--color-textPrimary)" }}>
            {plan.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textSecondary)" }}>
            {daysLeft > 0 ? `${daysLeft} dias restantes` : "Evento chegou! 🎉"} ·{" "}
            {completedCount}/{plan.days.length} dias concluídos
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="text-xs px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-70 whitespace-nowrap"
          style={{ borderColor: "var(--color-border)", color: "var(--color-textSecondary)" }}
        >
          Novo plano
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: "var(--color-primary)" }}
        />
      </div>

      {/* Days list */}
      <div className="flex flex-col gap-2">
        {plan.days.map((day) => {
          const dayDate = new Date(day.date);
          const isToday = dayDate.toDateString() === todayStr;
          const isPast = dayDate < todayDate;

          return (
            <div
              key={day.id}
              className="rounded-2xl p-4 flex items-start gap-4"
              style={{
                background: isToday
                  ? "rgba(29,158,117,0.06)"
                  : "var(--color-surface)",
                border: `1px solid ${isToday ? "rgba(29,158,117,0.25)" : "var(--color-border)"}`,
                opacity: isPast && !day.completed ? 0.55 : 1,
              }}
            >
              {/* Day number */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: day.completed
                    ? "var(--color-primary)"
                    : isToday
                    ? "rgba(29,158,117,0.15)"
                    : "var(--color-bg)",
                  color: day.completed ? "#fff" : "var(--color-textPrimary)",
                }}
              >
                {day.completed ? "✓" : day.dayNumber}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
                    {day.focus}
                  </p>
                  {isToday && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--color-primary)", color: "#fff" }}
                    >
                      Hoje
                    </span>
                  )}
                </div>
                {day.description && (
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-textSecondary)" }}>
                    {day.description}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: "var(--color-textSecondary)", opacity: 0.6 }}>
                  {dayDate.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
