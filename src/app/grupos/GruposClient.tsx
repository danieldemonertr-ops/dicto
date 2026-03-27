"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Cover helpers ─────────────────────────────────────────────────────────────

const COVER_MAP: Record<string, { emoji: string; bg: string }> = {
  green:  { emoji: "🌿", bg: "#D1FAE5" },
  blue:   { emoji: "🌊", bg: "#DBEAFE" },
  purple: { emoji: "🔮", bg: "#EDE9FE" },
  orange: { emoji: "🔥", bg: "#FED7AA" },
  pink:   { emoji: "🌸", bg: "#FCE7F3" },
  yellow: { emoji: "⭐", bg: "#FEF3C7" },
  red:    { emoji: "🎯", bg: "#FEE2E2" },
  teal:   { emoji: "💎", bg: "#CCFBF1" },
};

function getCover(imageUrl: string | null) {
  return COVER_MAP[imageUrl ?? ""] ?? { emoji: "👥", bg: "#D1FAE5" };
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Group {
  id: string;
  name: string;
  description: string | null;
  discipline: string | null;
  imageUrl: string | null;
  deliveryDate: Date | string | null;
  currentStreak: number;
  inviteCode: string;
  myRole: string;
  _count: { members: number };
}

// ─── Card ──────────────────────────────────────────────────────────────────────

function GroupCard({ g }: { g: Group }) {
  const cover = getCover(g.imageUrl);
  const isCustomImage = g.imageUrl && !COVER_MAP[g.imageUrl];
  const deliveryStr = g.deliveryDate
    ? new Date(g.deliveryDate).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
    : null;

  return (
    <Link
      href={`/grupos/${g.id}`}
      className="rounded-2xl overflow-hidden flex flex-col transition-shadow hover:shadow-md"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      {/* Discipline hat */}
      {g.discipline && (
        <div
          className="px-3 py-1.5 text-[10px] font-semibold truncate"
          style={{ background: cover.bg, color: "#374151" }}
        >
          {g.discipline}
        </div>
      )}

      {/* Cover */}
      <div
        className="flex items-center justify-center text-3xl"
        style={{ background: cover.bg, height: 72 }}
      >
        {isCustomImage ? (
          <img src={g.imageUrl!} alt={g.name} className="w-full h-full object-cover" />
        ) : (
          cover.emoji
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2"
          style={{ color: "var(--color-textPrimary)" }}>
          {g.name}
        </p>
        <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>
          {g._count.members} {g._count.members === 1 ? "membro" : "membros"}
          {g.currentStreak > 0 && ` · 🔥 ${g.currentStreak}`}
        </p>
        {deliveryStr && (
          <p className="text-[10px] mt-auto pt-1 font-medium"
            style={{ color: "var(--color-textSecondary)" }}>
            📅 {deliveryStr}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export function GruposClient({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setJoining(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao entrar"); return; }
      router.push(`/grupos/${data.groupId}`);
      router.refresh();
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Entrar por código */}
      <form
        onSubmit={handleJoin}
        className="rounded-2xl p-4 flex gap-3"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de convite"
          className="flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-textPrimary)",
            background: "var(--color-bg)",
          }}
        />
        <button
          type="submit"
          disabled={joining || !code.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-primary)", color: "#111312" }}
        >
          {joining ? "..." : "Entrar"}
        </button>
      </form>
      {error && <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>}

      {/* Lista de grupos */}
      {groups.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center gap-3">
          <span className="text-4xl">👥</span>
          <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
            Você não faz parte de nenhum grupo ainda.
            <br />
            Crie um ou entre com um código de convite.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {groups.map((g) => (
            <GroupCard key={g.id} g={g} />
          ))}
        </div>
      )}
    </div>
  );
}
