"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string | null;
  email: string | null;
}

interface GroupMemberItem {
  userId: string;
  role: string;
  user: Member;
}

interface Props {
  group: { id: string; name: string; members: GroupMemberItem[] };
  myUserId: string;
}

// ─── Quick task shortcuts ─────────────────────────────────────────────────────

const SHORTCUTS = [
  { icon: "📊", label: "Criar slides" },
  { icon: "📝", label: "Preparar roteiro" },
  { icon: "🖼️", label: "Selecionar imagens" },
  { icon: "📚", label: "Preparar materiais" },
  { icon: "🔍", label: "Revisar referências" },
  { icon: "✂️", label: "Distribuir seções" },
  { icon: "🎤", label: "Ensaiar apresentação" },
  { icon: "📄", label: "Formatar documento" },
  { icon: "📖", label: "Pesquisa bibliográfica" },
  { icon: "🗒️", label: "Redigir relatório" },
];

// ─── Deadline presets ─────────────────────────────────────────────────────────

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const DEADLINE_PRESETS = [
  { label: "Hoje",         value: () => addDays(0) },
  { label: "Amanhã",       value: () => addDays(1) },
  { label: "Em 3 dias",    value: () => addDays(3) },
  { label: "Em 1 semana",  value: () => addDays(7) },
  { label: "Em 2 semanas", value: () => addDays(14) },
];

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FF5722", "#FF9800", "#E91E63", "#00BCD4"];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function displayName(u: Member, myUserId: string) {
  const base = u.name?.split(" ")[0] ?? u.email ?? "Usuário";
  return u.id === myUserId ? `${base} (você)` : base;
}

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i === current ? "#5DE08A" : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NovaAtividadeClient({ group, myUserId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 0: Task title
  const [title, setTitle] = useState("");

  // Step 1: Deadline
  const [deadlinePreset, setDeadlinePreset] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [noDeadline, setNoDeadline] = useState(false);

  // Step 2: Assignee
  // "me" | "member:<id>" | "volunteer"
  const [assignMode, setAssignMode] = useState<"me" | "member" | "volunteer">("volunteer");
  const [assignedMemberId, setAssignedMemberId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otherMembers = group.members.filter((m) => m.userId !== myUserId);
  const myMemberItem = group.members.find((m) => m.userId === myUserId);

  function effectiveDeadline(): string | null {
    if (noDeadline) return null;
    if (customDate) return customDate;
    if (deadlinePreset) return deadlinePreset;
    return null;
  }

  function effectiveAssignee(): string | null {
    if (assignMode === "me") return myUserId;
    if (assignMode === "member") return assignedMemberId;
    return null; // volunteer
  }

  function canProceedStep0() { return title.trim().length >= 2; }
  function canProceedStep1() { return noDeadline || !!effectiveDeadline(); }
  function canSubmit() { return assignMode !== "member" || !!assignedMemberId; }

  async function handleSubmit() {
    if (!canSubmit() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/groups/${group.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          deadline: effectiveDeadline(),
          assignedToId: effectiveAssignee(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao criar atividade"); setLoading(false); return; }
      router.push(`/grupos/${group.id}/atividades`);
      router.refresh();
    } catch {
      setError("Erro ao criar atividade");
      setLoading(false);
    }
  }

  // ─── Step 0: What needs to be done ────────────────────────────────────────

  if (step === 0) return (
    <div className="flex flex-col gap-6">
      <StepDots current={0} total={3} />

      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#111312" }}>O que precisa ser feito?</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Escolha uma sugestão ou escreva livremente</p>
      </div>

      {/* Shortcut grid */}
      <div className="grid grid-cols-2 gap-2">
        {SHORTCUTS.map((s) => (
          <button
            key={s.label}
            onClick={() => setTitle(s.label)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left transition-all"
            style={{
              background: title === s.label ? "rgba(93,224,138,0.12)" : "#FFFFFF",
              border: `1.5px solid ${title === s.label ? "#5DE08A" : "#E5E7EB"}`,
              color: "#111312",
            }}
          >
            <span className="text-xl flex-shrink-0">{s.icon}</span>
            <span className="text-sm font-medium leading-tight">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Or type custom */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: "#111312" }}>
          Ou descreva livremente
        </label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Gravar o vídeo de abertura..."
          rows={3}
          className="rounded-2xl border px-4 py-3 text-sm outline-none resize-none focus:ring-2"
          style={{ borderColor: "#E5E7EB", color: "#111312", background: "#FFFFFF" }}
        />
        <p className="text-xs" style={{ color: "#9CA3AF" }}>{title.trim().length}/100 caracteres</p>
      </div>

      <button
        onClick={() => setStep(1)}
        disabled={!canProceedStep0()}
        className="w-full rounded-2xl py-4 text-sm font-bold transition-all disabled:opacity-40"
        style={{ background: "#5DE08A", color: "#111312" }}
      >
        Continuar →
      </button>
    </div>
  );

  // ─── Step 1: Deadline ──────────────────────────────────────────────────────

  if (step === 1) return (
    <div className="flex flex-col gap-6">
      <StepDots current={1} total={3} />

      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#111312" }}>Quando deve ser concluída?</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          &ldquo;{title}&rdquo;
        </p>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-col gap-2">
        {DEADLINE_PRESETS.map((p) => {
          const val = p.value();
          const isSelected = deadlinePreset === val && !customDate && !noDeadline;
          return (
            <button
              key={p.label}
              onClick={() => { setDeadlinePreset(val); setCustomDate(""); setNoDeadline(false); }}
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-left transition-all flex items-center justify-between"
              style={{
                background: isSelected ? "rgba(93,224,138,0.1)" : "#FFFFFF",
                border: `1.5px solid ${isSelected ? "#5DE08A" : "#E5E7EB"}`,
                color: "#111312",
              }}
            >
              {p.label}
              {isSelected && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5DE08A" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "#111312" }}>Escolher data específica</label>
        <input
          type="date"
          value={customDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => { setCustomDate(e.target.value); setDeadlinePreset(null); setNoDeadline(false); }}
          disabled={noDeadline}
          className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 disabled:opacity-40"
          style={{ borderColor: customDate && !noDeadline ? "#5DE08A" : "#E5E7EB", color: "#111312", background: "#FFFFFF" }}
        />
      </div>

      {/* No deadline toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer" style={{ color: "#6B7280" }}>
        <input
          type="checkbox"
          checked={noDeadline}
          onChange={(e) => { setNoDeadline(e.target.checked); if (e.target.checked) { setDeadlinePreset(null); setCustomDate(""); } }}
          className="rounded"
        />
        <span className="text-sm">Sem prazo definido</span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(0)}
          className="flex-1 rounded-2xl py-4 text-sm font-semibold border transition-opacity hover:opacity-70"
          style={{ borderColor: "#E5E7EB", color: "#6B7280", background: "#FFFFFF" }}
        >
          ← Voltar
        </button>
        <button
          onClick={() => setStep(2)}
          disabled={!canProceedStep1()}
          className="flex-[2] rounded-2xl py-4 text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: "#5DE08A", color: "#111312" }}
        >
          Continuar →
        </button>
      </div>
    </div>
  );

  // ─── Step 2: Assign ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      <StepDots current={2} total={3} />

      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#111312" }}>Quem vai fazer isso?</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          &ldquo;{title}&rdquo;
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Me */}
        <button
          onClick={() => { setAssignMode("me"); setAssignedMemberId(null); }}
          className="rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
          style={{
            background: assignMode === "me" ? "rgba(93,224,138,0.1)" : "#FFFFFF",
            border: `1.5px solid ${assignMode === "me" ? "#5DE08A" : "#E5E7EB"}`,
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "#D1FAE5" }}>
            🙋
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#111312" }}>Eu mesmo</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>Você será o responsável</p>
          </div>
          {assignMode === "me" && (
            <svg className="ml-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5DE08A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          )}
        </button>

        {/* Volunteer */}
        <button
          onClick={() => { setAssignMode("volunteer"); setAssignedMemberId(null); }}
          className="rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
          style={{
            background: assignMode === "volunteer" ? "rgba(93,224,138,0.1)" : "#FFFFFF",
            border: `1.5px solid ${assignMode === "volunteer" ? "#5DE08A" : "#E5E7EB"}`,
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "#FEF3C7" }}>
            🤝
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#111312" }}>Quem quiser pode pegar</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>Qualquer membro pode se responsabilizar</p>
          </div>
          {assignMode === "volunteer" && (
            <svg className="ml-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5DE08A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          )}
        </button>

        {/* Specific member */}
        {otherMembers.length > 0 && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setAssignMode("member")}
              className="rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
              style={{
                background: assignMode === "member" ? "rgba(93,224,138,0.1)" : "#FFFFFF",
                border: `1.5px solid ${assignMode === "member" ? "#5DE08A" : "#E5E7EB"}`,
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "#DBEAFE" }}>
                👤
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#111312" }}>Direcionar para alguém</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  {assignMode === "member" && assignedMemberId
                    ? displayName(group.members.find((m) => m.userId === assignedMemberId)?.user ?? { id: "", name: null, email: null }, myUserId)
                    : "Escolha um membro do grupo"}
                </p>
              </div>
              {assignMode === "member" && assignedMemberId && (
                <svg className="ml-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5DE08A" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              )}
            </button>

            {/* Member list */}
            {assignMode === "member" && (
              <div className="flex flex-col gap-1 ml-2">
                {otherMembers.map((m) => {
                  const isSelected = assignedMemberId === m.userId;
                  const color = avatarColor(m.userId);
                  const name = displayName(m.user, myUserId);
                  const initial = (m.user.name ?? m.user.email ?? "?")[0].toUpperCase();
                  return (
                    <button
                      key={m.userId}
                      onClick={() => setAssignedMemberId(m.userId)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                      style={{
                        background: isSelected ? "rgba(93,224,138,0.08)" : "#FAFAFA",
                        border: `1px solid ${isSelected ? "#5DE08A" : "#F3F4F6"}`,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: color }}>
                        {initial}
                      </div>
                      <span className="text-sm flex-1" style={{ color: "#111312" }}>{name}</span>
                      {m.role === "ADMIN" && (
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>admin</span>
                      )}
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isSelected ? "#5DE08A" : "transparent",
                          border: `2px solid ${isSelected ? "#5DE08A" : "#D1D5DB"}`,
                        }}
                      >
                        {isSelected && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-center" style={{ color: "#EF4444" }}>{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 rounded-2xl py-4 text-sm font-semibold border transition-opacity hover:opacity-70"
          style={{ borderColor: "#E5E7EB", color: "#6B7280", background: "#FFFFFF" }}
        >
          ← Voltar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit() || loading}
          className="flex-[2] rounded-2xl py-4 text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: "#5DE08A", color: "#111312" }}
        >
          {loading ? "Criando..." : "Criar atividade ✓"}
        </button>
      </div>
    </div>
  );
}
