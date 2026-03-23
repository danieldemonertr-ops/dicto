// ─── tokens:check — garante que nenhum hex está hardcoded nos componentes ────
// Run: npm run tokens:check

import fs from "fs";
import path from "path";
import { colors } from "./tokens";

const SRC_DIR = path.resolve(__dirname, "../");
const ALLOWED_FILES = [
  "design-system/tokens.ts",
  "design-system/generate-css.ts",
  "design-system/check-tokens.ts",
];

const hexPattern = /#([0-9a-fA-F]{3,8})\b/g;
const tokenValues = new Set(Object.values(colors).map((v) => v.toLowerCase()));

function walkDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", ".next", "generated"].includes(entry.name)) {
      files.push(...walkDir(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx|css)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walkDir(SRC_DIR);
let violations = 0;

for (const file of files) {
  const rel = path.relative(SRC_DIR, file);
  if (ALLOWED_FILES.some((a) => rel.includes(a))) continue;

  const content = fs.readFileSync(file, "utf-8");
  const matches = [...content.matchAll(hexPattern)];

  for (const match of matches) {
    const hex = `#${match[1]}`.toLowerCase();
    // allow hex values that ARE defined in tokens (used inside globals.css var declarations)
    if (tokenValues.has(hex)) continue;
    console.error(`❌  Hardcoded hex "${hex}" in ${rel} (line ~${content.slice(0, match.index).split("\n").length})`);
    violations++;
  }
}

if (violations > 0) {
  console.error(`\n${violations} violation(s) found. Use tokens from design-system/tokens.ts instead.`);
  process.exit(1);
} else {
  console.log("✅  No hardcoded hex values found.");
}
