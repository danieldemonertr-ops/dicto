"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({ fallbackHref = "/", label = "Voltar" }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm hover:opacity-70 transition-opacity text-left"
      style={{ color: "var(--color-textSecondary)" }}
    >
      ← {label}
    </button>
  );
}
