// ─── Design System Helpers ────────────────────────────────────────────────────

import { tokens } from "./tokens";

type ColorKey = keyof typeof tokens.colors;
type RadiusKey = keyof typeof tokens.radius;
type SpacingKey = keyof typeof tokens.spacing;
type ShadowKey = keyof typeof tokens.shadow;

export function colorVar(key: ColorKey): string {
  return `var(--color-${key})`;
}

export function radiusVar(key: RadiusKey): string {
  return `var(--radius-${key})`;
}

export function spacingVar(key: SpacingKey): string {
  return `var(--spacing-${key})`;
}

export function shadowVar(key: ShadowKey): string {
  return `var(--shadow-${key})`;
}

// Generic helper to turn any token key into a CSS variable name
export function tokenKeyToCssVar(category: string, key: string): string {
  return `var(--${category}-${key})`;
}
