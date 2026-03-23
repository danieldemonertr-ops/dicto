// ─── Generate CSS variables from tokens ──────────────────────────────────────
// Run: npm run tokens
// Writes :root { ... } block into src/app/globals.css

import fs from "fs";
import path from "path";
import { colors, radius, spacing, typography, shadow } from "./tokens";

function buildRootBlock(): string {
  const lines: string[] = [":root {"];

  for (const [key, value] of Object.entries(colors)) {
    lines.push(`  --color-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(radius)) {
    lines.push(`  --radius-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(spacing)) {
    lines.push(`  --spacing-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(typography)) {
    lines.push(`  --typography-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(shadow)) {
    lines.push(`  --shadow-${key}: ${value};`);
  }

  lines.push("}");
  return lines.join("\n");
}

const GLOBALS_PATH = path.resolve(__dirname, "../app/globals.css");
const START_MARKER = "/* design-system:start */";
const END_MARKER = "/* design-system:end */";

const rootBlock = `${START_MARKER}\n${buildRootBlock()}\n${END_MARKER}`;

let css = fs.readFileSync(GLOBALS_PATH, "utf-8");

if (css.includes(START_MARKER)) {
  const regex = new RegExp(
    `${START_MARKER}[\\s\\S]*?${END_MARKER}`,
    "g"
  );
  css = css.replace(regex, rootBlock);
} else {
  css = rootBlock + "\n\n" + css;
}

fs.writeFileSync(GLOBALS_PATH, css, "utf-8");
console.log("✅  Design tokens written to globals.css");
