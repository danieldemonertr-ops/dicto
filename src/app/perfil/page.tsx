import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BADGE_META } from "@/lib/gamification";
import { DashboardHeader } from "@/app/dashboard/DashboardHeader";
import Link from "next/link";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      username: true,
      bio: true,
      points: true,
      currentStreak: true,
      longestStreak: true,
      lastActivityAt: true,
      badges: { select: { badge: true, earnedAt: true }, orderBy: { earnedAt: "desc" } },
      _count: { select: { simulations: true } },
    },
  });

  if (!user) redirect("/login");

  const firstName = user.name?.split(" ")[0] ?? "você";
  const allBadgeTypes = Object.keys(BADGE_META) as (keyof typeof BADGE_META)[];
  const earnedSet = new Set(user.badges.map((b) => b.badge));

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <DashboardHeader name={user.name ?? firstName} email={user.email ?? undefined} />

      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-6">

        {/* ── Perfil card ── */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-textPrimary)" }}>
                {user.name ?? firstName}
              </h1>
              {user.username && (
                <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
                  @{user.username}
                </p>
              )}
              {user.bio && (
                <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--color-textSecondary)" }}>
                  {user.bio}
                </p>
              )}
            </div>
            <Link
              href="/settings/profile"
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:opacity-70 whitespace-nowrap"
              style={{ borderColor: "var(--color-border)", color: "var(--color-textSecondary)" }}
            >
              Editar
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Sequência", value: `${user.currentStreak}🔥`, sub: `recorde: ${user.longestStreak}` },
              { label: "Pontos", value: user.points.toLocaleString("pt-BR"), sub: "acumulados" },
              { label: "Simulações", value: user._count.simulations, sub: "no total" },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="rounded-xl p-3 flex flex-col items-center gap-0.5"
                style={{ background: "var(--color-bg)" }}
              >
                <p className="text-lg font-bold" style={{ color: "var(--color-textPrimary)" }}>
                  {value}
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--color-textPrimary)" }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-textSecondary)" }}>
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Badges ── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: "var(--color-textPrimary)" }}>
              Conquistas ({user.badges.length}/{allBadgeTypes.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {allBadgeTypes.map((type) => {
              const meta = BADGE_META[type];
              const earned = earnedSet.has(type);
              return (
                <div
                  key={type}
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{
                    background: earned ? "var(--color-surface)" : "var(--color-bg)",
                    border: `1px solid ${earned ? "var(--color-border)" : "transparent"}`,
                    opacity: earned ? 1 : 0.45,
                  }}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-textPrimary)" }}>
                      {meta.name}
                    </p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--color-textSecondary)" }}>
                      {meta.desc}
                    </p>
                    {earned && (
                      <p className="text-xs mt-1 font-medium" style={{ color: "var(--color-primary)" }}>
                        ✓ Conquistado
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
