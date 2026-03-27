"use client";

import { useState } from "react";
import Link from "next/link";
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

interface Task {
  id: string;
  title: string;
  deadline: string | null;
  assignedToId: string | null;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  createdAt: string;
  assignedTo: Member | null;
  createdBy: Member;
}

interface LogEntry {
  id: string;
  action: "GROUP_CREATED" | "MEMBER_ADDED" | "TASK_CREATED" | "TASK_ASSIGNED" | "TASK_COMPLETED";
  detail: string | null;
  createdAt: string;
  actor: Member;
  task: { id: string; title: string } | null;
}

interface Group {
  id: string;
  name: string;
  discipline: string | null;
  imageUrl: string | null;
  deliveryDate: string | null;
  members: GroupMemberItem[];
}

interface Props {
  group: Group;
  initialTasks: Task[];
  initialLogs: LogEntry[];
  myUserId: string;
  myRole: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FF5722", "#FF9800", "#E91E63", "#00BCD4"];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function nameInitial(u: Member | null) {
  if (!u) return "?";
  return (u.name ?? u.email ?? "?")[0].toUpperCase();
}

function displayName(u: Member | null, myUserId?: string) {
  if (!u) return "Sem responsável";
  const base = u.name?.split(" ")[0] ?? u.email ?? "Usuário";
  return u.id === myUserId ? `${base} (você)` : base;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `há ${d}d`;
  if (h > 0) return `há ${h}h`;
  if (m > 0) return `há ${m}min`;
  return "agora";
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function daysUntil(iso: string | null) {
  if (!iso) return null;
  const diff = new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

function logLabel(log: LogEntry) {
  const actor = log.actor.name?.split(" ")[0] ?? log.actor.email ?? "Alguém";
  switch (log.action) {
    case "GROUP_CREATED":   return `${actor} criou o grupo`;
    case "MEMBER_ADDED":    return `${actor} entrou no grupo`;
    case "TASK_CREATED":    return `${actor} criou "${log.task?.title ?? log.detail}"`;
    case "TASK_ASSIGNED":   return `${actor} se responsabilizou por "${log.task?.title}"`;
    case "TASK_COMPLETED":  return `${actor} concluiu "${log.task?.title ?? log.detail}"`;
    default:                return `${actor} fez algo`;
  }
}

function logIcon(action: LogEntry["action"]) {
  switch (action) {
    case "GROUP_CREATED":  return "🎉";
    case "MEMBER_ADDED":   return "👋";
    case "TASK_CREATED":   return "📋";
    case "TASK_ASSIGNED":  return "✋";
    case "TASK_COMPLETED": return "✅";
    default:               return "📌";
  }
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({ tasks, groupDelivery }: { tasks: Task[]; groupDelivery: string | null }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map date strings → task counts
  const taskDays: Record<string, { count: number; hasUrgent: boolean }> = {};
  for (const t of tasks) {
    if (!t.deadline || t.status === "DONE") continue;
    const key = new Date(t.deadline).toDateString();
    const d = daysUntil(t.deadline) ?? 999;
    if (!taskDays[key]) taskDays[key] = { count: 0, hasUrgent: false };
    taskDays[key].count++;
    if (d <= 3) taskDays[key].hasUrgent = true;
  }

  const deliveryKey = groupDelivery ? new Date(groupDelivery).toDateString() : null;

  const cells: (number | null)[] = [
    ...Array((firstDay + 6) % 7).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <p className="text-sm font-semibold capitalize" style={{ color: "#111312" }}>{monthName}</p>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#6B7280" }}>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#5DE08A" }} />
            tarefa
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#F59E0B" }} />
            urgente
          </span>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-3">
        {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-xs pb-1 font-medium" style={{ color: "#9CA3AF" }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;

          const date = new Date(year, month, day);
          const key = date.toDateString();
          const isToday = day === today.getDate();
          const info = taskDays[key];
          const isDelivery = key === deliveryKey;

          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                style={{
                  background: isToday ? "#5DE08A" : "transparent",
                  color: isToday ? "#111312" : isDelivery ? "#EF4444" : "#374151",
                  fontWeight: isToday || isDelivery ? 700 : 400,
                  outline: isDelivery && !isToday ? "2px solid #EF4444" : "none",
                  outlineOffset: 1,
                }}
              >
                {day}
              </div>
              {(info || isDelivery) && (
                <div className="w-1.5 h-1.5 rounded-full" style={{
                  background: info?.hasUrgent ? "#F59E0B" : isDelivery ? "#EF4444" : "#5DE08A",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend: upcoming */}
      {(() => {
        const upcoming = tasks
          .filter((t) => t.deadline && t.status !== "DONE")
          .filter((t) => { const d = daysUntil(t.deadline); return d !== null && d >= 0 && d <= 7; })
          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
          .slice(0, 2);
        if (!upcoming.length) return null;
        return (
          <div className="border-t mx-4 mb-4 pt-3 flex flex-col gap-2" style={{ borderColor: "#F3F4F6" }}>
            {upcoming.map((t) => {
              const d = daysUntil(t.deadline);
              return (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <p className="text-xs truncate" style={{ color: "#374151" }}>{t.title}</p>
                  <span
                    className="text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded-full"
                    style={{
                      background: d! <= 1 ? "#FEE2E2" : d! <= 3 ? "#FEF3C7" : "#F3F4F6",
                      color: d! <= 1 ? "#EF4444" : d! <= 3 ? "#D97706" : "#6B7280",
                    }}
                  >
                    {d === 0 ? "hoje" : d === 1 ? "amanhã" : `em ${d}d`}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  myUserId,
  groupId,
  onUpdate,
}: {
  task: Task;
  myUserId: string;
  groupId: string;
  onUpdate: (updated: Task) => void;
}) {
  const [loading, setLoading] = useState(false);
  const d = daysUntil(task.deadline);
  const isVolunteer = !task.assignedToId;
  const isAssignedToMe = task.assignedToId === myUserId;

  async function markDone() {
    if (loading || task.status === "DONE") return;
    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    setLoading(false);
    if (res.ok) onUpdate(await res.json());
  }

  async function claimTask() {
    if (loading || task.assignedToId) return;
    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: myUserId, status: "IN_PROGRESS" }),
    });
    setLoading(false);
    if (res.ok) onUpdate(await res.json());
  }

  const statusColor = task.status === "DONE"
    ? { bg: "#D1FAE5", text: "#166534", label: "Concluída" }
    : task.status === "IN_PROGRESS"
    ? { bg: "#DBEAFE", text: "#1D40AF", label: "Em andamento" }
    : { bg: "#F3F4F6", text: "#6B7280", label: "Aberta" };

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${task.status === "DONE" ? "#D1FAE5" : "#E5E7EB"}`,
        opacity: task.status === "DONE" ? 0.75 : 1,
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Complete checkbox */}
        <button
          onClick={markDone}
          disabled={loading || task.status === "DONE"}
          className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
          style={{
            background: task.status === "DONE" ? "#5DE08A" : "transparent",
            border: `2px solid ${task.status === "DONE" ? "#5DE08A" : "#D1D5DB"}`,
          }}
        >
          {task.status === "DONE" && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-snug"
            style={{
              color: "#111312",
              textDecoration: task.status === "DONE" ? "line-through" : "none",
            }}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Status badge */}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: statusColor.bg, color: statusColor.text }}>
              {statusColor.label}
            </span>

            {/* Deadline */}
            {task.deadline && d !== null && (
              <span
                className="text-xs font-medium"
                style={{ color: d <= 1 ? "#EF4444" : d <= 3 ? "#D97706" : "#9CA3AF" }}
              >
                📅 {d === 0 ? "hoje" : d === 1 ? "amanhã" : d < 0 ? `${Math.abs(d)}d atraso` : formatDate(task.deadline)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Assignee row */}
      <div className="flex items-center justify-between gap-2">
        {task.assignedTo ? (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: avatarColor(task.assignedTo.id) }}
            >
              {nameInitial(task.assignedTo)}
            </div>
            <span className="text-xs" style={{ color: "#6B7280" }}>
              {displayName(task.assignedTo, myUserId)}
            </span>
          </div>
        ) : (
          <span className="text-xs italic" style={{ color: "#9CA3AF" }}>Sem responsável</span>
        )}

        {/* Action buttons */}
        {isVolunteer && task.status !== "DONE" && (
          <button
            onClick={claimTask}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: "rgba(93,224,138,0.12)", color: "#166534" }}
          >
            ✋ Pegar tarefa
          </button>
        )}
        {isAssignedToMe && task.status !== "DONE" && (
          <button
            onClick={markDone}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: "#5DE08A", color: "#111312" }}
          >
            Concluir
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Log entry ────────────────────────────────────────────────────────────────

function LogItem({ log }: { log: LogEntry }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid #F3F4F6" }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
        style={{ background: "#F7F7F2" }}>
        {logIcon(log.action)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: "#374151" }}>{logLabel(log)}</p>
        <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{timeAgo(log.createdAt)}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AtividadesClient({ group, initialTasks, initialLogs, myUserId, myRole }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  function updateTask(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    router.refresh();
  }

  const activeTasks = tasks.filter((t) => t.status !== "DONE");
  const visibleTasks = showAllTasks ? activeTasks : activeTasks.slice(0, 3);
  const visibleLogs  = showAllLogs  ? initialLogs  : initialLogs.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "#111312" }}>Atividades</h1>
        <Link
          href={`/grupos/${group.id}/atividades/nova`}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
          style={{ background: "#5DE08A", color: "#111312" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova
        </Link>
      </div>

      {/* Calendar */}
      <MiniCalendar tasks={tasks} groupDelivery={group.deliveryDate} />

      {/* Active tasks */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "#111312" }}>
            Atividades
            {activeTasks.length > 0 && (
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#6B7280" }}>
                {activeTasks.length}
              </span>
            )}
          </h2>
        </div>

        {activeTasks.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm" style={{ color: "#6B7280" }}>Nenhuma atividade aberta</p>
            <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Crie a primeira atividade do grupo</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {visibleTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  myUserId={myUserId}
                  groupId={group.id}
                  onUpdate={updateTask}
                />
              ))}
            </div>

            {activeTasks.length > 3 && (
              <button
                onClick={() => setShowAllTasks((v) => !v)}
                className="text-sm font-medium text-center py-1 transition-opacity hover:opacity-70"
                style={{ color: "#5DE08A" }}
              >
                {showAllTasks ? "Mostrar menos" : `Ver todas as ${activeTasks.length} atividades →`}
              </button>
            )}
          </>
        )}
      </section>

      {/* Completed tasks (collapsed) */}
      {tasks.filter((t) => t.status === "DONE").length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold" style={{ color: "#9CA3AF" }}>
            Concluídas ({tasks.filter((t) => t.status === "DONE").length})
          </h2>
          <div className="flex flex-col gap-2">
            {tasks
              .filter((t) => t.status === "DONE")
              .slice(0, 3)
              .map((t) => (
                <TaskCard key={t.id} task={t} myUserId={myUserId} groupId={group.id} onUpdate={updateTask} />
              ))}
          </div>
        </section>
      )}

      {/* History */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "#111312" }}>Histórico</h2>

        {initialLogs.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
            <p className="text-sm" style={{ color: "#9CA3AF" }}>Nenhuma atividade registrada ainda</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
            <div className="px-4">
              {visibleLogs.map((log) => (
                <LogItem key={log.id} log={log} />
              ))}
            </div>

            {initialLogs.length > 5 && (
              <button
                onClick={() => setShowAllLogs((v) => !v)}
                className="w-full text-sm font-medium py-3 text-center transition-opacity hover:opacity-70"
                style={{ color: "#5DE08A", borderTop: "1px solid #F3F4F6" }}
              >
                {showAllLogs ? "Mostrar menos" : `Ver tudo (${initialLogs.length}) →`}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
