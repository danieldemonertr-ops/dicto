"use client";

import * as React from "react";
import Link from "next/link";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  Bell,
  UserCircle,
  GearSix,
  CreditCard,
  BookOpen,
  SignOut,
  CaretDown,
  X,
  Sparkle,
} from "@phosphor-icons/react";

// ─── Fun avatar ────────────────────────────────────────────────────────────────

const FUN_AVATARS = [
  { emoji: "🦊", bg: "#FFF0E0" },
  { emoji: "🐙", bg: "#E8E0FF" },
  { emoji: "🦄", bg: "#F0E0FF" },
  { emoji: "🦁", bg: "#FFF3D0" },
  { emoji: "🐸", bg: "#D8FFE8" },
  { emoji: "🦋", bg: "#E0F0FF" },
  { emoji: "🐢", bg: "#D0FFE8" },
  { emoji: "🐬", bg: "#D0F0FF" },
  { emoji: "🐼", bg: "#F0F0F0" },
  { emoji: "🦉", bg: "#FFE8D0" },
  { emoji: "🐨", bg: "#E8F0FF" },
  { emoji: "🐯", bg: "#FFF0D0" },
];

function getFunAvatar(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return FUN_AVATARS[hash % FUN_AVATARS.length];
}

// ─── Notification popover ──────────────────────────────────────────────────────

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    icon: "🎯",
    title: "Novo tipo disponível",
    desc: "Apresentação para banca já está liberado!",
    time: "Agora",
    unread: true,
  },
  {
    id: 2,
    icon: "📊",
    title: "Seu resultado chegou",
    desc: "Veja o feedback da sua última simulação",
    time: "2 min atrás",
    unread: true,
  },
  {
    id: 3,
    icon: "💡",
    title: "Dica do Dicto",
    desc: "Pratique a respiração antes de apresentações",
    time: "1h atrás",
    unread: false,
  },
];

function NotificationPopover() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"todas" | "nao-lidas">("todas");
  const unreadCount = SAMPLE_NOTIFICATIONS.filter((n) => n.unread).length;

  const shown =
    tab === "nao-lidas"
      ? SAMPLE_NOTIFICATIONS.filter((n) => n.unread)
      : SAMPLE_NOTIFICATIONS;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          className="relative inline-flex items-center justify-center rounded-full w-9 h-9 transition-colors"
          style={{
            background: open ? "var(--color-bg)" : "transparent",
            color: "var(--color-textSecondary)",
          }}
          aria-label="Notificações"
        >
          <Bell size={18} weight="bold" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5">
              <span className="flex h-[10px] w-[10px]">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: "#5DE08A" }}
                />
                <span
                  className="relative inline-flex h-[10px] w-[10px] rounded-full"
                  style={{ background: "#5DE08A" }}
                />
              </span>
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-2xl overflow-hidden"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
            maxHeight: "70dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--color-textPrimary)" }}>
              Notificações
            </span>
            <PopoverPrimitive.Close asChild>
              <button
                className="p-1 rounded-lg transition-colors"
                style={{ color: "var(--color-textSecondary)" }}
              >
                <X size={16} weight="bold" />
              </button>
            </PopoverPrimitive.Close>
          </div>

          {/* Tabs */}
          <div
            className="flex px-4 pt-2 gap-1"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            {(["todas", "nao-lidas"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3 pb-2 text-xs font-medium relative capitalize transition-colors"
                style={{
                  color:
                    tab === t ? "var(--color-textPrimary)" : "var(--color-textSecondary)",
                }}
              >
                {t === "todas" ? "Todas" : "Não lidas"}
                {tab === t && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: "var(--color-primary)" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {shown.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10" style={{ color: "var(--color-textSecondary)" }}>
                <Bell size={32} weight="bold" style={{opacity:0.3}} />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <ul>
                {shown.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-80"
                    style={{
                      background: n.unread ? "rgba(29,158,117,0.04)" : "transparent",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <span className="text-xl mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium leading-snug truncate"
                        style={{ color: "var(--color-textPrimary)" }}
                      >
                        {n.title}
                      </p>
                      <p
                        className="text-xs mt-0.5 leading-snug"
                        style={{ color: "var(--color-textSecondary)" }}
                      >
                        {n.desc}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-textSecondary)", opacity: 0.6 }}>
                        {n.time}
                      </p>
                    </div>
                    {n.unread && (
                      <span
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ background: "#5DE08A" }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

// ─── Avatar dropdown ───────────────────────────────────────────────────────────

interface AvatarMenuProps {
  name: string;
  email?: string;
}

const MENU_ITEMS = [
  { icon: UserCircle, label: "Meu perfil", href: "/perfil" },
  { icon: BookOpen, label: "Histórico de treinos", href: "/simulador/historico" },
  { icon: Sparkle, label: "Plano de Treino", href: "/plano" },
  { icon: GearSix, label: "Configurações", href: "/settings" },
  { icon: CreditCard, label: "Cobrança", href: "/settings/billing" },
];

function AvatarMenu({ name, email }: AvatarMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const seed = email ?? name;
  const avatar = getFunAvatar(seed);
  const firstName = name.split(" ")[0];

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors hover:opacity-80"
        style={{
          background: open ? "var(--color-bg)" : "transparent",
          border: open ? "1px solid var(--color-border)" : "1px solid transparent",
        }}
        aria-label="Menu do usuário"
      >
        {/* Fun avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background: avatar.bg }}
        >
          {avatar.emoji}
        </div>
        <CaretDown
          size={14}
          weight="bold"
          className="transition-transform"
          style={{
            color: "var(--color-textSecondary)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-30"
          style={{
            background: "var(--color-surface)",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* User info */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: avatar.bg }}
              >
                {avatar.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-textPrimary)" }}>
                  {firstName}
                </p>
                {email && (
                  <p className="text-xs truncate" style={{ color: "var(--color-textSecondary)" }}>
                    {email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {MENU_ITEMS.map(({ icon: Icon, label, href }) => (
              <Link
                key={href + label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-70"
                style={{ color: "var(--color-textPrimary)" }}
              >
                <Icon size={16} weight="regular" style={{ color: "var(--color-textSecondary)", flexShrink: 0 }} />
                {label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div style={{ borderTop: "1px solid var(--color-border)" }}>
            <Link
              href="/api/auth/signout"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-70"
              style={{ color: "var(--color-error)" }}
            >
              <SignOut size={16} weight="bold" />
              Sair
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  name: string;
  email?: string;
}

export function DashboardHeader({ name, email }: DashboardHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 px-5 py-3 flex items-center justify-between"
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="text-lg font-bold tracking-tight"
        style={{ color: "var(--color-textPrimary)" }}
      >
        Dicto
      </Link>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-1">
        <NotificationPopover />
        <AvatarMenu name={name} email={email ?? undefined} />
      </div>
    </header>
  );
}
