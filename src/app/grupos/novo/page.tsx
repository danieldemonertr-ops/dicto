"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Predefined group images ──────────────────────────────────────────────────

const GROUP_COVERS = [
  { id: "green",  emoji: "🌿", bg: "#D1FAE5", label: "Verde" },
  { id: "blue",   emoji: "🌊", bg: "#DBEAFE", label: "Azul" },
  { id: "purple", emoji: "🔮", bg: "#EDE9FE", label: "Roxo" },
  { id: "orange", emoji: "🔥", bg: "#FED7AA", label: "Laranja" },
  { id: "pink",   emoji: "🌸", bg: "#FCE7F3", label: "Rosa" },
  { id: "yellow", emoji: "⭐", bg: "#FEF3C7", label: "Amarelo" },
  { id: "red",    emoji: "🎯", bg: "#FEE2E2", label: "Vermelho" },
  { id: "teal",   emoji: "💎", bg: "#CCFBF1", label: "Turquesa" },
];

// ─── Member search helpers ────────────────────────────────────────────────────

type UserResult = { id: string; name: string | null; email: string | null };

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NovoGrupoPage() {
  const router = useRouter();

  const [discipline, setDiscipline] = useState("");
  const [name, setName] = useState("");
  const [selectedCover, setSelectedCover] = useState(GROUP_COVERS[0].id);
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [noDate, setNoDate] = useState(false);
  const [description, setDescription] = useState("");

  // Member selection
  const [memberQuery, setMemberQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<UserResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveName = name.trim() || (discipline.trim() ? `Grupo de ${discipline.trim()}` : "");

  // Debounced member search
  useEffect(() => {
    if (memberQuery.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(memberQuery.trim())}`);
        if (res.ok) setSearchResults(await res.json());
      } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [memberQuery]);

  const displayedUsers: UserResult[] =
    memberQuery.trim().length < 2 ? MOCK_USERS : searchResults;

  function toggleMember(u: UserResult) {
    setSelectedMembers((prev) =>
      prev.find((m) => m.id === u.id)
        ? prev.filter((m) => m.id !== u.id)
        : [...prev, u]
    );
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      const maxW = 400, maxH = 200;
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      setCustomImageUrl(dataUrl);
      setSelectedCover("");
    };
    img.src = URL.createObjectURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveName) { setError("Informe a disciplina ou nome do grupo"); return; }
    setError("");
    setLoading(true);
    try {
      const realMemberIds = selectedMembers
        .filter((m) => !m.id.startsWith("mock-"))
        .map((m) => m.id);

      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: effectiveName,
          discipline: discipline.trim() || null,
          imageUrl: customImageUrl || selectedCover,
          deliveryDate: noDate ? null : (deliveryDate || null),
          description: description.trim() || null,
          memberIds: realMemberIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao criar grupo"); return; }
      router.push(`/grupos/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  const cover = GROUP_COVERS.find((c) => c.id === selectedCover) ?? GROUP_COVERS[0];

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#F7F7F2" }}>
      <div className="mx-auto max-w-lg w-full px-4 py-8 flex flex-col gap-6">
        {/* Back */}
        <div className="flex items-center gap-3">
          <Link href="/grupos" className="text-sm hover:opacity-70" style={{ color: "#6B7280" }}>
            ← Grupos
          </Link>
        </div>

        <h1 className="text-2xl font-bold" style={{ color: "#111312" }}>
          Criar grupo
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Cover preview + picker */}
          <div className="flex flex-col gap-3">
            <div
              className="w-full h-24 rounded-2xl flex items-center justify-center text-4xl overflow-hidden"
              style={{ background: customImageUrl ? "#F3F4F6" : cover.bg }}
            >
              {customImageUrl ? (
                <img src={customImageUrl} alt="Capa do grupo" className="w-full h-full object-cover" />
              ) : (
                cover.emoji
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {GROUP_COVERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelectedCover(c.id); setCustomImageUrl(""); }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                  style={{
                    background: c.bg,
                    outline: selectedCover === c.id && !customImageUrl ? "2px solid #5DE08A" : "2px solid transparent",
                    outlineOffset: 2,
                  }}
                >
                  {c.emoji}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer mt-1" style={{ color: "#6B7280" }}>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <span className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-opacity hover:opacity-70"
                style={{ borderColor: "#E5E7EB", color: "#374151" }}>
                📁 Escolher do computador
              </span>
            </label>
          </div>

          {/* Disciplina */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#111312" }}>
              Disciplina *
            </label>
            <input
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              required
              placeholder="Ex: Marketing Digital"
              className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
              style={{ borderColor: "#E5E7EB", color: "#111312", background: "#FFFFFF" }}
            />
          </div>

          {/* Nome do grupo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#111312" }}>
              Nome do grupo
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={discipline.trim() ? `Grupo de ${discipline.trim()}` : "Nome do grupo (opcional)"}
              className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
              style={{ borderColor: "#E5E7EB", color: "#111312", background: "#FFFFFF" }}
            />
            {!name.trim() && discipline.trim() && (
              <p className="text-xs" style={{ color: "#6B7280" }}>
                Deixe em branco para usar &quot;Grupo de {discipline.trim()}&quot;
              </p>
            )}
          </div>

          {/* Data de entrega */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: "#111312" }}>
              Data de entrega da atividade
            </label>
            <p className="text-xs" style={{ color: "#9CA3AF" }}>
              Ajuda os membros a se organizarem para entregar a tempo
            </p>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              disabled={noDate}
              min={new Date().toISOString().split("T")[0]}
              className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 disabled:opacity-40"
              style={{ borderColor: "#E5E7EB", color: "#111312", background: "#FFFFFF" }}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#6B7280" }}>
              <input
                type="checkbox"
                checked={noDate}
                onChange={(e) => { setNoDate(e.target.checked); if (e.target.checked) setDeliveryDate(""); }}
                className="rounded"
              />
              Sem data definida
            </label>
          </div>

          {/* Adicionar membros */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium" style={{ color: "#111312" }}>
                Adicionar membros
              </label>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                Opcional — você pode adicionar depois
              </p>
            </div>

            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="Buscar colega..."
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB", color: "#111312", background: "#FFFFFF" }}
              />
              {searching && (
                <span className="absolute right-3 top-3 text-xs" style={{ color: "#9CA3AF" }}>···</span>
              )}
            </div>

            {memberQuery.trim().length === 1 && (
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                Digite pelo menos 2 caracteres para buscar
              </p>
            )}

            {/* User list */}
            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
              {displayedUsers.map((u) => {
                const isSelected = selectedMembers.some((m) => m.id === u.id);
                const avatarColor = getAvatarColor(u.id);
                const initial = (u.name ?? u.email ?? "?")[0].toUpperCase();
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleMember(u)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
                    style={{
                      background: isSelected ? "rgba(93,224,138,0.1)" : "#FFFFFF",
                      border: `1px solid ${isSelected ? "#5DE08A" : "#E5E7EB"}`,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                      style={{ background: avatarColor }}
                    >
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#111312" }}>
                        {u.name ?? "Sem nome"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#6B7280" }}>
                        {u.email ?? ""}
                      </p>
                    </div>
                    {/* Checkbox */}
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: isSelected ? "#5DE08A" : "#D1D5DB",
                        background: isSelected ? "#5DE08A" : "transparent",
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#111312" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected chips */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(93,224,138,0.15)", color: "#166534" }}
                  >
                    {m.name ?? m.email}
                    <button
                      type="button"
                      onClick={() => toggleMember(m)}
                      className="ml-0.5 hover:opacity-70"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#111312" }}>
              Descrição <span style={{ color: "#9CA3AF" }}>(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Para o quê é o grupo?"
              rows={3}
              className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 resize-none"
              style={{ borderColor: "#E5E7EB", color: "#111312", background: "#FFFFFF" }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !discipline.trim()}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "#5DE08A", color: "#111312" }}
          >
            {loading ? "Criando..." : `Criar grupo${selectedMembers.length > 0 ? ` com ${selectedMembers.length + 1} pessoas` : ""} →`}
          </button>
        </form>
      </div>
    </main>
  );
}
