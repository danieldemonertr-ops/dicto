// ─── Dicto Design System — Single Source of Truth ───────────────────────────
// Zero hex hardcoded nos componentes. Sempre use os tokens deste arquivo.

export const colors = {
  primary: "#5DE08A",      // verde Dicto
  bg: "#F7F7F2",           // fundo off-white
  surface: "#FFFFFF",      // cards
  textPrimary: "#111312",  // texto principal
  textSecondary: "#6B7280",// texto secundário
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#22C55E",
} as const;

export const radius = {
  sm: "0.375rem",   // 6px
  md: "0.75rem",    // 12px
  lg: "1rem",       // 16px
  full: "9999px",
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
  16: "4rem",
  24: "6rem",
} as const;

export const typography = {
  fontSans: "var(--font-geist-sans), system-ui, sans-serif",
  sizeXs: "0.75rem",
  sizeSm: "0.875rem",
  sizeMd: "1rem",
  sizeLg: "1.125rem",
  sizeXl: "1.25rem",
  size2xl: "1.5rem",
  size3xl: "1.875rem",
  size4xl: "2.25rem",
  size5xl: "3rem",
  weightNormal: "400",
  weightMedium: "500",
  weightSemibold: "600",
  weightBold: "700",
} as const;

export const shadow = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
} as const;

export const tokens = { colors, radius, spacing, typography, shadow } as const;
export type Tokens = typeof tokens;
