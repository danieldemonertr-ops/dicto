"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PillMorphTabs } from "@/components/ui/pill-morph-tabs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupCard {
  id: string;
  name: string;
  discipline: string | null;
  imageUrl: string | null;
  deliveryDate: string | null;
  memberCount: number;
}

interface SimCard {
  id: string;
  tipo: string;
  score: number | null;
  createdAt: Date | string;
}

interface DashboardHubProps {
  greeting: string;
  currentStreak: number;
  totalSims: number;
  points: number;
  groups: GroupCard[];
  recentSims: SimCard[];
  usedTipos: string[];
  isEntrevistaBreve: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = "#5DE08A";
const BG = "#F7F7F2";
const SURFACE = "#FFFFFF";
const TEXT = "#111312";
const TEXT_SEC = "#6B7280";
const BORDER = "#E5E7EB";

const ACTIVITY_TYPES = [
  {
    tipo: "ENTREVISTA_ESTAGIO",
    href: "/simulador/nova",
    emoji: "💼",
    label: "Entrevista de estágio",
    desc: "Simule perguntas reais da sua vaga",
    tag: "Carreira",
  },
  {
    tipo: "APRESENTACAO_DISCIPLINA",
    href: "/hub/apresentacao",
    emoji: "📋",
    label: "Apresentação de trabalhos",
    desc: "Prepare sua fala com ajuda da IA",
    tag: "Acadêmico",
  },
  {
    tipo: "SEMINARIO_INDIVIDUAL",
    href: "/simulador/seminario/nova",
    emoji: "🎤",
    label: "Seminário",
    desc: "Domine a fala e as perguntas da banca",
    tag: "Acadêmico",
  },
  {
    tipo: "TRABALHO_GRUPO",
    href: "/simulador/trabalho-grupo/nova",
    emoji: "👥",
    label: "Trabalho em grupo",
    desc: "Treine sua parte sem depender do grupo",
    tag: "Acadêmico",
  },
];

const TIPO_LABELS: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "Entrevista de estágio",
  SEMINARIO_INDIVIDUAL: "Seminário individual",
  APRESENTACAO_DISCIPLINA: "Apresentação de trabalhos",
  TRABALHO_GRUPO: "Trabalho em grupo",
};

const TIPO_BACK_URLS: Record<string, string> = {
  ENTREVISTA_ESTAGIO: "/simulador/nova",
  SEMINARIO_INDIVIDUAL: "/simulador/seminario/nova",
  APRESENTACAO_DISCIPLINA: "/hub/apresentacao",
  TRABALHO_GRUPO: "/simulador/trabalho-grupo/nova",
};

type Tab = "home" | "praticar" | "desafios";

// ─── Group cover helpers ──────────────────────────────────────────────────────

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
  return COVER_MAP[imageUrl ?? ""] ?? { emoji: "👥", bg: `${PRIMARY}22` };
}

function GroupCardItem({ group }: { group: GroupCard }) {
  const cover = getCover(group.imageUrl);
  const deliveryDateStr = group.deliveryDate
    ? new Date(group.deliveryDate).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
    : null;

  return (
    <Link
      href={`/grupos/${group.id}`}
      className="flex-shrink-0 rounded-2xl overflow-hidden flex flex-col transition-opacity hover:opacity-80"
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        width: "calc(50vw - 28px)",
        minWidth: 148,
        maxWidth: 200,
        scrollSnapAlign: "start",
      }}
    >
      {/* Discipline hat */}
      {group.discipline && (
        <div
          className="px-3 py-1.5 text-[10px] font-semibold truncate"
          style={{ background: cover.bg, color: "#374151" }}
        >
          {group.discipline}
        </div>
      )}

      {/* Cover image area */}
      <div
        className="flex items-center justify-center text-3xl"
        style={{ background: cover.bg, height: 72 }}
      >
        {cover.emoji}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: TEXT }}>
          {group.name}
        </p>
        <p className="text-xs" style={{ color: TEXT_SEC }}>
          {group.memberCount} {group.memberCount === 1 ? "membro" : "membros"}
        </p>
        {deliveryDateStr && (
          <p className="text-[10px] mt-auto pt-1 font-medium" style={{ color: TEXT_SEC }}>
            📅 {deliveryDateStr}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(totalMins: number): string {
  if (totalMins < 60) return `${totalMins}min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatRelative(date: Date | string): string {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "agora mesmo";
  if (diffMins < 60) return `há ${diffMins} min`;
  const diffH = Math.floor(diffMins / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "há 1 dia";
  if (diffD < 7) return `há ${diffD} dias`;
  return `há ${Math.floor(diffD / 7)} semanas`;
}

// ─── Streak Carousel (coverflow / wheel) ─────────────────────────────────────

function StreakCarousel({
  currentStreak,
  totalSims,
  points,
}: {
  currentStreak: number;
  totalSims: number;
  points: number;
}) {
  const [active, setActive] = useState(0);
  const estimatedMins = totalSims * 15;

  const cards = [
    { icon: "🔥", value: String(currentStreak),                                    label: "Dias seguidos" },
    { icon: "🎯", value: String(totalSims),                                         label: "Exercícios feitos" },
    { icon: "⏱",  value: formatTime(estimatedMins),                                 label: "Tempo praticado" },
    { icon: "⭐", value: points >= 1000 ? `${(points/1000).toFixed(1)}k` : String(points), label: "Pontos acumulados" },
  ];

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % cards.length), 2500);
    return () => clearInterval(t);
  }, []);

  // Coverflow: rotateY first (rotates the coordinate system), then translateX along
  // the rotated axis → cards arc around a circle. perspective on the wrapper activates 3D.
  function cardStyle(index: number) {
    const total = cards.length;
    let diff = ((index - active) % total + total) % total;
    if (diff > Math.floor(total / 2)) diff -= total; // range: -1, 0, 1, (2)

    const angle  = diff * 40;          // degrees — how far around the arc
    const offset = diff * 140;         // px — lateral spread along the arc
    const scale  = diff === 0 ? 1 : 0.82;
    const opacity = diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.78 : 0;
    const zIndex  = diff === 0 ? 3 : Math.abs(diff) === 1 ? 2 : 0;

    return {
      transform: `rotateY(${angle}deg) translateX(${offset}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
    };
  }

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "linear-gradient(135deg,#1D9E75,#5DE08A)" }}
    >
      {/* 3D stage: perspective here, preserve-3d on the track */}
      <div
        className="relative mt-5"
        style={{ height: 190, overflow: "hidden", perspective: "1200px" }}
      >
        {/* Track — preserve-3d so child rotateY is in 3D space */}
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="absolute rounded-2xl flex flex-col items-center justify-center gap-2"
              style={{
                width: 200,
                top: 0,
                bottom: 0,
                left: "50%",
                marginLeft: -100,          // center the 200px card on the axis
                background: "rgba(255,255,255,0.22)",
                transformOrigin: "center center",
                ...cardStyle(i),
              }}
            >
              <span style={{ fontSize: 30 }}>{card.icon}</span>
              <p style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, color: "#111312" }}>
                {card.value}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(17,19,18,0.68)" }}>
                {card.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 py-4">
        {cards.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              height: 6,
              width: i === active ? 18 : 6,
              background: i === active ? "rgba(17,19,18,0.55)" : "rgba(17,19,18,0.22)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({
  greeting,
  currentStreak,
  totalSims,
  points,
  groups,
  recentSims,
  usedTiposSet,
}: {
  greeting: string;
  currentStreak: number;
  totalSims: number;
  points: number;
  groups: GroupCard[];
  recentSims: SimCard[];
  usedTiposSet: Set<string>;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <p className="text-lg font-semibold" style={{ color: TEXT }}>
        {greeting}
      </p>

      {/* ── Streak carousel ─────────────────────────────────────────────── */}
      <StreakCarousel
        currentStreak={currentStreak}
        totalSims={totalSims}
        points={points}
      />

      {/* ── Meus Grupos ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: TEXT }}>
            Meus Grupos
          </h2>
          <Link
            href="/grupos"
            className="text-xs font-medium"
            style={{ color: PRIMARY }}
          >
            Ver todos →
          </Link>
        </div>

        {groups.length === 0 ? (
          <Link
            href="/grupos/novo"
            className="rounded-2xl p-4 flex items-center gap-3 transition-opacity hover:opacity-80"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: BG }}
            >
              👥
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: TEXT }}>Criar um grupo</p>
              <p className="text-xs" style={{ color: TEXT_SEC }}>Pratique com seus amigos</p>
            </div>
            <span style={{ color: TEXT_SEC }}>→</span>
          </Link>
        ) : (
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {groups.map((g) => (
              <GroupCardItem key={g.id} group={g} />
            ))}

            {/* "+" card */}
            <Link
              href="/grupos/novo"
              className="flex-shrink-0 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-opacity hover:opacity-80"
              style={{
                background: BG,
                border: `1.5px dashed ${BORDER}`,
                width: "calc(50vw - 28px)",
                minWidth: 148,
                maxWidth: 200,
                scrollSnapAlign: "start",
                minHeight: 180,
              }}
            >
              <span className="text-2xl font-light" style={{ color: TEXT_SEC }}>+</span>
              <p className="text-xs text-center" style={{ color: TEXT_SEC }}>Novo grupo</p>
            </Link>
          </div>
        )}
      </section>

      {/* ── Minhas Atividades ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: TEXT }}>
            Minhas Atividades
          </h2>
          {recentSims.length > 0 && (
            <Link
              href="/simulador/historico"
              className="text-xs font-medium"
              style={{ color: PRIMARY }}
            >
              Histórico →
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {ACTIVITY_TYPES.map((act) => {
            const used = usedTiposSet.has(act.tipo);
            return (
              <Link
                key={act.tipo}
                href={act.href}
                className="rounded-2xl p-4 flex items-center gap-4 transition-shadow hover:shadow-md"
                style={{
                  background: SURFACE,
                  border: `1px solid ${used ? `${PRIMARY}55` : BORDER}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: used ? `${PRIMARY}22` : BG,
                  }}
                >
                  {act.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold leading-snug" style={{ color: TEXT }}>
                      {act.label}
                    </p>
                    {used && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${PRIMARY}33`, color: "#166534" }}
                      >
                        Feito
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: TEXT_SEC }}>
                    {act.desc}
                  </p>
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: BG }}
                >
                  <span className="text-sm" style={{ color: TEXT_SEC }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ─── Praticar tab ─────────────────────────────────────────────────────────────

function PraticarTab({ usedTiposSet, isEntrevistaBreve }: { usedTiposSet: Set<string>; isEntrevistaBreve: boolean }) {
  const featured = ACTIVITY_TYPES[0]; // Entrevista
  const others = ACTIVITY_TYPES.slice(1);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: TEXT_SEC }}>
        Escolha uma situação para praticar
      </p>

      {/* Featured */}
      <Link
        href={featured.href}
        className="block rounded-3xl p-5 transition-shadow hover:shadow-md"
        style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-0.5"
            style={{ background: `${PRIMARY}33`, color: "#166534" }}
          >
            {isEntrevistaBreve ? "⭐ Recomendado" : "Carreira"}
          </span>
          {!usedTiposSet.has(featured.tipo) && (
            <span
              className="text-xs font-semibold rounded-full px-2.5 py-0.5"
              style={{ background: `${PRIMARY}22`, color: "#166534" }}
            >
              Novo
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: BG }}
          >
            {featured.emoji}
          </div>
          <div className="flex-1">
            <p className="text-base font-bold" style={{ color: TEXT }}>{featured.label}</p>
            <p className="text-sm mt-0.5" style={{ color: TEXT_SEC }}>{featured.desc}</p>
          </div>
          <span className="text-xl shrink-0" style={{ color: TEXT_SEC }}>→</span>
        </div>
      </Link>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {others.map((act) => {
          const isNew = !usedTiposSet.has(act.tipo);
          return (
            <Link
              key={act.tipo}
              href={act.href}
              className="flex flex-col gap-3 rounded-2xl p-4 transition-shadow hover:shadow-md"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="text-xs font-medium rounded-full px-2 py-0.5"
                  style={{ background: BG, color: TEXT_SEC }}
                >
                  {act.tag}
                </span>
                {isNew && (
                  <span
                    className="text-xs font-semibold rounded-full px-2 py-0.5"
                    style={{ background: `${PRIMARY}22`, color: "#166534" }}
                  >
                    Novo
                  </span>
                )}
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: BG }}
              >
                {act.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold leading-snug" style={{ color: TEXT }}>{act.label}</p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: TEXT_SEC }}>{act.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Desafios tab ─────────────────────────────────────────────────────────────

function DesafiosTab() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
        style={{ background: `${PRIMARY}22` }}
      >
        🏆
      </div>
      <div>
        <h2 className="text-xl font-bold" style={{ color: TEXT }}>Desafios</h2>
        <p className="text-sm mt-2 max-w-xs" style={{ color: TEXT_SEC }}>
          Compete com outros usuários, suba no ranking e ganhe badges exclusivos.
        </p>
      </div>
      <span
        className="text-sm font-semibold px-4 py-2 rounded-full"
        style={{ background: `${PRIMARY}22`, color: "#166534" }}
      >
        Em breve 🚀
      </span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DashboardHub({
  greeting,
  currentStreak,
  totalSims,
  points,
  groups,
  recentSims,
  usedTipos,
  isEntrevistaBreve,
}: DashboardHubProps) {
  const [tab, setTab] = useState<Tab>("home");
  const usedTiposSet = new Set(usedTipos);

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div
        className="sticky top-[57px] z-10 px-4 py-2"
        style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}
      >
        <PillMorphTabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          bg={BG}
          pillColor={PRIMARY}
          activeTextColor={TEXT}
          inactiveTextColor={TEXT_SEC}
          items={[
            { value: "home", label: "Home" },
            { value: "praticar", label: "Praticar" },
            { value: "desafios", label: "Desafios" },
          ]}
        />
      </div>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        {tab === "home" && (
          <HomeTab
            greeting={greeting}
            currentStreak={currentStreak}
            totalSims={totalSims}
            points={points}
            groups={groups}
            recentSims={recentSims}
            usedTiposSet={usedTiposSet}
          />
        )}
        {tab === "praticar" && (
          <PraticarTab usedTiposSet={usedTiposSet} isEntrevistaBreve={isEntrevistaBreve} />
        )}
        {tab === "desafios" && <DesafiosTab />}
      </div>
    </div>
  );
}
