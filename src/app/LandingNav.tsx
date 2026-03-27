"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Props = {
  isLoggedIn: boolean;
};

export function LandingNav({ isLoggedIn }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("click", onClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClickOutside);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md"
        style={{ borderBottom: "1px solid #f0f0ee" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight flex-shrink-0"
            style={{ color: "#111312" }}>
            Dicto
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium"
            style={{ color: "#6B7280" }}>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Início
            </Link>
            <Link href="/#planos" className="hover:text-gray-900 transition-colors">
              Planos
            </Link>
            <Link href="/em-breve" className="hover:text-gray-900 transition-colors">
              Soluções
            </Link>
          </nav>

          {/* Right CTAs — desktop */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 text-white"
                style={{ background: "#5DE08A", color: "#111312" }}
              >
                Começar agora →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-gray-900"
                  style={{ color: "#6B7280" }}
                >
                  Entrar
                </Link>
                <Link
                  href="/hub"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 text-white shadow-sm"
                  style={{ background: "#1D9E75" }}
                >
                  Começar agora
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "#6B7280" }}
            aria-label="Abrir menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h16" /><path d="M4 18h16" /><path d="M4 6h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-50 bg-white flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid #f0f0ee" }}>
            <span className="text-xl font-bold" style={{ color: "#111312" }}>Dicto</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#6B7280" }}
              aria-label="Fechar menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-4 py-6 text-lg font-medium">
            <Link href="/" onClick={() => setMenuOpen(false)}
              className="px-3 py-3 rounded-xl transition-colors hover:bg-gray-50"
              style={{ color: "#374151" }}>
              Início
            </Link>
            <Link href="/#planos" onClick={() => setMenuOpen(false)}
              className="px-3 py-3 rounded-xl transition-colors hover:bg-gray-50"
              style={{ color: "#374151" }}>
              Planos
            </Link>
            <Link href="/em-breve" onClick={() => setMenuOpen(false)}
              className="px-3 py-3 rounded-xl transition-colors hover:bg-gray-50"
              style={{ color: "#374151" }}>
              Soluções
            </Link>
          </nav>

          <div className="mt-auto px-4 pb-10 flex flex-col gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                className="w-full py-3.5 rounded-xl text-center font-semibold"
                style={{ background: "#5DE08A", color: "#111312" }}>
                Começar agora →
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="w-full py-3.5 rounded-xl text-center font-semibold border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#E5E7EB", color: "#374151" }}>
                  Entrar
                </Link>
                <Link href="/hub" onClick={() => setMenuOpen(false)}
                  className="w-full py-3.5 rounded-xl text-center font-semibold text-white"
                  style={{ background: "#1D9E75" }}>
                  Começar agora
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
