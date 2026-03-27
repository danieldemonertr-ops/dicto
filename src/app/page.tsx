import Link from "next/link";
import { auth } from "@/lib/auth";
import { LandingNav } from "./LandingNav";
import { FeaturesSection } from "./FeaturesSection";
import { TestimonialSection } from "./TestimonialSection";
import { PricingSection } from "./PricingSection";
import { FooterSection } from "./FooterSection";

// ─── Header ───────────────────────────────────────────────────────────────────
async function LandingHeader() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  return <LandingNav isLoggedIn={isLoggedIn} />;
}

// ─── Seção: Hero ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-4 pt-28 pb-32 gap-6 overflow-hidden"
      style={{
        background: "#ffffff",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%23e5e7eb' stroke-width='0.6'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Green blob */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 900px 650px at 50% 25%, rgba(29,158,117,0.11) 0%, transparent 65%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border"
          style={{
            background: "rgba(29,158,117,0.08)",
            borderColor: "rgba(29,158,117,0.25)",
            color: "#1D9E75",
          }}
        >
          🤖 Powered by Claude AI
        </span>

        <h1
          className="text-5xl md:text-6xl font-bold leading-tight"
          style={{ color: "#111312" }}
        >
          Treine sua comunicação para o{" "}
          <span style={{ color: "#1D9E75" }}>momento que importa</span>
        </h1>

        <p
          className="text-lg md:text-xl max-w-xl leading-relaxed"
          style={{ color: "#6B7280" }}
        >
          Simule entrevistas, seminários e apresentações com IA — e receba feedback
          específico por resposta
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Link
            href="/hub"
            className="px-8 py-4 rounded-full text-base font-semibold transition-opacity hover:opacity-90 text-white shadow-md"
            style={{ background: "#1D9E75" }}
          >
            Começar agora →
          </Link>
          <Link
            href="/#planos"
            className="px-8 py-4 rounded-full text-base font-medium transition-colors hover:bg-gray-100 border"
            style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
          >
            Ver planos
          </Link>
        </div>

        <p className="text-sm mt-2" style={{ color: "#9CA3AF" }}>
          ✓ Personalizado por vaga &nbsp;·&nbsp; ✓ Feedback em segundos &nbsp;·&nbsp; ✓ Sem coach caro
        </p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Home() {
  return (
    <div style={{ background: "var(--color-bg)" }} className="overflow-x-hidden">
      <LandingHeader />
      <Hero />
      <FeaturesSection />
      <TestimonialSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
}
