"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PillMorphTabs } from "@/components/ui/pill-morph-tabs";

// ─── Cover helpers ────────────────────────────────────────────────────────────

const COVER_MAP: Record<string, { emoji: string; bg: string }> = {
  green: { emoji: "🌿", bg: "#D1FAE5" },
  blue: { emoji: "🌊", bg: "#DBEAFE" },
  purple: { emoji: "🔮", bg: "#EDE9FE" },
  orange: { emoji: "🔥", bg: "#FED7AA" },
  pink: { emoji: "🌸", bg: "#FCE7F3" },
  yellow: { emoji: "⭐", bg: "#FEF3C7" },
  red: { emoji: "🎯", bg: "#FEE2E2" },
  teal: { emoji: "💎", bg: "#CCFBF1" },
};

function getCover(imageUrl: string | null) {
  return COVER_MAP[imageUrl ?? ""] ?? { emoji: "👥", bg: "#D1FAE5" };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  currentStreak: number;
  longestStreak: number;
  points: number;
  lastActivityAt: Date | string | null;
}

interface GroupMemberItem {
  userId: string;
  role: string;
  user: Member;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  discipline: string | null;
  imageUrl: string | null;
  deliveryDate: Date | string | null;
  inviteCode: string;
  currentStreak: number;
  longestStreak: number;
  members: GroupMemberItem[];
}

interface Props {
  group: Group;
  myRole: string;
  myUserId: string;
}

// ─── Add member (Duolingo-style modal) ───────────────────────────────────────

type UserResult = { id: string; name: string | null; email: string | null };

// Mock users shown initially before any search
const MOCK_USERS: UserResult[] = [
  { id: "mock-1", name: "Ana Silva",      email: "ana.silva@uni.edu.br" },
  { id: "mock-2", name: "Bruno Costa",    email: "bruno.costa@gmail.com" },
  { id: "mock-3", name: "Carla Mendes",   email: "carla.m@outlook.com" },
  { id: "mock-4", name: "Diego Ferreira", email: "d.ferreira@email.com" },
  { id: "mock-5", name: "Elena Santos",   email: "elena.s@uni.edu.br" },
];

const AVATAR_COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FF5722", "#FF9800", "#E91E63", "#00BCD4"];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function AddMemberModal({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search — only when query >= 2 chars
  useEffect(() => {
    if (query.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) setSearchResults(await res.json());
      } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const displayUsers = query.trim().length >= 2 ? searchResults : MOCK_USERS;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleConfirm() {
    if (selected.size === 0 || adding || done) return;
    setAdding(true);
    const realIds = [...selected].filter((id) => !id.startsWith("mock-"));
    await Promise.all(
      realIds.map((userId) =>
        fetch(`/api/groups/${groupId}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }).catch(() => {})
      )
    );
    setAdding(false);
    setDone(true);
    setTimeout(onClose, 1000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{ background: "#FFFFFF", maxHeight: "88dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-2 flex flex-col gap-4">
          <button
            onClick={onClose}
            className="self-start p-1 -ml-1 transition-opacity hover:opacity-60"
            style={{ color: "#9CA3AF" }}
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <h2 className="text-xl font-bold text-center leading-snug" style={{ color: "#111312" }}>
            Adicione amigos e<br />pratiquem juntos!
          </h2>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none"
              style={{
                borderColor: "#E5E7EB",
                background: "#F9FAFB",
                color: "#111312",
              }}
            />
          </div>
          {query.length > 0 && query.length < 2 && (
            <p className="text-xs mt-1.5 pl-1" style={{ color: "#9CA3AF" }}>
              Digite pelo menos 2 caracteres para buscar
            </p>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {searching ? (
            <p className="text-sm text-center py-8" style={{ color: "#9CA3AF" }}>Buscando...</p>
          ) : displayUsers.length === 0 && query.length >= 2 ? (
            <p className="text-sm text-center py-8" style={{ color: "#9CA3AF" }}>Nenhum usuário encontrado</p>
          ) : (
            displayUsers.map((u) => {
              const isSelected = selected.has(u.id);
              const name = u.name ?? u.email ?? "Usuário";
              const initial = name[0].toUpperCase();
              const color = getAvatarColor(u.id);
              const subtitle = u.id.startsWith("mock-") ? u.email : u.email;

              return (
                <button
                  key={u.id}
                  onClick={() => toggle(u.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100"
                  style={{ borderBottom: "1px solid #F3F4F6" }}
                >
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg text-white flex-shrink-0"
                    style={{ background: color }}
                  >
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold" style={{ color: "#111312" }}>{name}</p>
                    {subtitle && (
                      <p className="text-xs truncate" style={{ color: "#6B7280" }}>{subtitle}</p>
                    )}
                  </div>

                  {/* Checkbox */}
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: isSelected ? "#5DE08A" : "transparent",
                      border: isSelected ? "2px solid #5DE08A" : "2px solid #D1D5DB",
                    }}
                  >
                    {isSelected && (
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7.5l3 3 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* CTA */}
        <div className="px-5 py-4" style={{ borderTop: "1px solid #F3F4F6" }}>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0 || adding || done}
            className="w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "#5DE08A", color: "#111312" }}
          >
            {done ? (
              "Adicionado! ✓"
            ) : adding ? (
              <span className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "120ms" }} />
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "240ms" }} />
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                {selected.size > 0
                  ? `ADICIONAR ${selected.size} MEMBRO${selected.size > 1 ? "S" : ""}`
                  : "SELECIONE MEMBROS"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddMemberSection({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-semibold border transition-opacity hover:opacity-80 mt-2"
        style={{ borderColor: "#5DE08A", color: "#111312", background: "rgba(93,224,138,0.07)" }}
      >
        + Adicionar membro
      </button>
      {open && <AddMemberModal groupId={groupId} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

function InfoTab({ group, myUserId, myRole }: { group: Group; myUserId: string; myRole: string }) {
  const [copied, setCopied] = useState(false);
  const cover = getCover(group.imageUrl);
  const deliveryStr = group.deliveryDate
    ? new Date(group.deliveryDate).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    : null;

  async function copyInviteCode() {
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cover + header */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
      >
        {/* Discipline tag */}
        {group.discipline && (
          <div
            className="px-4 py-2 text-xs font-semibold"
            style={{ background: cover.bg, color: "#374151" }}
          >
            {group.discipline}
          </div>
        )}

        {/* Cover area */}
        <div
          className="flex items-center justify-center text-5xl"
          style={{ background: cover.bg, height: 100 }}
        >
          {cover.emoji}
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#111312" }}>
              {group.name}
            </h1>
            {group.description && (
              <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
                {group.description}
              </p>
            )}
          </div>

          {deliveryStr && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#6B7280" }}>
              <span>📅</span>
              <span>Entrega: <strong style={{ color: "#111312" }}>{deliveryStr}</strong></span>
            </div>
          )}

          {group.currentStreak > 0 && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#6B7280" }}>
              <span>🔥</span>
              <span><strong style={{ color: "#111312" }}>{group.currentStreak}</strong> dias de streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Código de convite */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between gap-3"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: "#6B7280" }}>Código de convite</p>
          <p className="text-sm font-mono font-semibold mt-0.5 truncate" style={{ color: "#111312" }}>
            {group.inviteCode}
          </p>
        </div>
        <button
          onClick={copyInviteCode}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70 whitespace-nowrap"
          style={{
            background: copied ? "#5DE08A" : "#E5E7EB",
            color: copied ? "#111312" : "#111312",
          }}
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>

      {/* Members list */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold" style={{ color: "#111312" }}>
          Membros ({group.members.length})
        </h2>

        <div className="flex flex-col gap-2">
          {[...group.members]
            .sort((a, b) => b.user.currentStreak - a.user.currentStreak)
            .map((m, idx) => {
              const isMe = m.userId === myUserId;
              const name = m.user.name ?? m.user.email ?? "Usuário";
              const firstName = name.split(" ")[0];

              return (
                <div
                  key={m.userId}
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: isMe ? "rgba(93,224,138,0.06)" : "#FFFFFF",
                    border: `1px solid ${isMe ? "rgba(93,224,138,0.3)" : "#E5E7EB"}`,
                  }}
                >
                  {/* Rank */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : "#F7F7F2",
                      color: idx < 3 ? "#fff" : "#6B7280",
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#111312" }}>
                      {firstName}{isMe ? " (você)" : ""}
                      {m.role === "ADMIN" && (
                        <span className="ml-1.5 text-xs font-normal" style={{ color: "#6B7280" }}>admin</span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: "#6B7280" }}>
                      {m.user.points.toLocaleString("pt-BR")} pts
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-base">{m.user.currentStreak > 0 ? "🔥" : "💤"}</span>
                    <span className="text-sm font-bold" style={{ color: "#111312" }}>
                      {m.user.currentStreak}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {myRole === "ADMIN" && <AddMemberSection groupId={group.id} />}
    </div>
  );
}

// ─── Atividades tab ───────────────────────────────────────────────────────────

function AtividadesTab({ groupId }: { groupId: string }) {
  return (
    <Link
      href={`/grupos/${groupId}/atividades`}
      className="flex flex-col items-center gap-6 py-16 text-center transition-opacity hover:opacity-80"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: "#D1FAE5" }}
      >
        📋
      </div>
      <div>
        <h2 className="text-base font-semibold" style={{ color: "#111312" }}>Ver atividades do grupo</h2>
        <p className="text-sm mt-2 max-w-xs" style={{ color: "#6B7280" }}>
          Calendário, tarefas e histórico do grupo
        </p>
      </div>
      <span
        className="text-sm font-semibold px-5 py-2.5 rounded-xl"
        style={{ background: "#5DE08A", color: "#111312" }}
      >
        Abrir atividades →
      </span>
    </Link>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function GroupClient({ group, myRole, myUserId }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <PillMorphTabs
        bg="#F7F7F2"
        pillColor="#5DE08A"
        activeTextColor="#111312"
        inactiveTextColor="#6B7280"
        items={[
          {
            value: "info",
            label: "Info do grupo",
            panel: (
              <div className="pt-5">
                <InfoTab group={group} myUserId={myUserId} myRole={myRole} />
              </div>
            ),
          },
          {
            value: "atividades",
            label: "Atividades",
            panel: (
              <div className="pt-5">
                <AtividadesTab groupId={group.id} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
