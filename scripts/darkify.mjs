// One-shot script: rewrites Tailwind class names across src/ for the new dark
// theme. Uses whole-word matches (\b boundaries) and sorts replacements by
// length descending so longer class names are swapped before their shorter
// prefixes. Run once with:
//   node scripts/darkify.mjs

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

// Light → dark token mapping. Anything not listed here is left alone.
const MAP = {
  // Page + card backgrounds
  "bg-slate-50": "bg-slate-950",
  "bg-white": "bg-slate-900",
  "bg-slate-100": "bg-slate-800",
  "bg-slate-200": "bg-slate-700",
  "bg-black/40": "bg-black/60",

  // Text
  "text-slate-900": "text-slate-100",
  "text-slate-800": "text-slate-100",
  "text-slate-700": "text-slate-200",
  "text-slate-600": "text-slate-300",
  "text-slate-500": "text-slate-400",
  "text-slate-400": "text-slate-500",

  // Borders + rings
  "border-slate-100": "border-slate-800",
  "border-slate-200": "border-slate-700",
  "border-red-100": "border-red-500/30",
  "ring-slate-100": "ring-slate-800",
  "ring-slate-200": "ring-slate-700",
  "divide-slate-100": "divide-slate-800",
  "divide-slate-200": "divide-slate-700",

  // Brand (navy)
  "bg-brand-50": "bg-brand-500/15",
  "bg-brand-100": "bg-brand-500/25",
  "text-brand-700": "text-brand-300",
  "text-brand-800": "text-brand-200",
  "ring-brand-200": "ring-brand-500/40",
  "ring-brand-300": "ring-brand-500/50",
  "hover:bg-brand-50": "hover:bg-brand-500/15",
  "hover:bg-brand-100": "hover:bg-brand-500/25",
  "hover:ring-brand-200": "hover:ring-brand-500/40",
  "hover:text-brand-700": "hover:text-brand-300",
  "hover:text-brand-800": "hover:text-brand-200",
  "focus:ring-brand-500": "focus:ring-brand-400",

  // Accents — emerald
  "bg-emerald-50": "bg-emerald-500/15",
  "bg-emerald-100": "bg-emerald-500/20",
  "text-emerald-600": "text-emerald-400",
  "text-emerald-700": "text-emerald-300",
  "ring-emerald-200": "ring-emerald-500/40",
  "hover:bg-emerald-50": "hover:bg-emerald-500/15",

  // Accents — amber / orange
  "bg-amber-50": "bg-amber-500/15",
  "text-amber-600": "text-amber-400",
  "text-amber-700": "text-amber-300",
  "ring-amber-200": "ring-amber-500/40",
  "bg-orange-50": "bg-orange-500/15",
  "text-orange-500": "text-orange-400",
  "text-orange-600": "text-orange-400",
  "ring-orange-200": "ring-orange-500/40",

  // Accents — red
  "bg-red-50": "bg-red-500/15",
  "bg-red-100": "bg-red-500/20",
  "text-red-600": "text-red-400",
  "text-red-700": "text-red-300",
  "ring-red-200": "ring-red-500/40",
  "hover:bg-red-50": "hover:bg-red-500/15",
  "hover:bg-red-100": "hover:bg-red-500/20",
  "hover:text-red-600": "hover:text-red-400",

  // Accents — blue
  "bg-blue-50": "bg-blue-500/15",
  "text-blue-600": "text-blue-400",

  // Hover/active backgrounds
  "hover:bg-slate-50": "hover:bg-slate-800/60",
  "hover:bg-slate-100": "hover:bg-slate-800",
  "active:bg-slate-100": "active:bg-slate-800",
  "active:bg-slate-200": "active:bg-slate-700",
  "hover:text-slate-900": "hover:text-slate-100",
  "hover:text-slate-600": "hover:text-slate-300",

  // Placeholders
  "placeholder:text-slate-400": "placeholder:text-slate-500",
  "placeholder:text-slate-600": "placeholder:text-slate-500",

  // Header bg (sticky)
  "bg-white/90": "bg-slate-950/90",
  "bg-white/95": "bg-slate-950/95",
  "bg-slate-50/50": "bg-slate-950/50",
  "bg-brand-50/40": "bg-brand-500/10",
};

const KEYS = Object.keys(MAP).sort((a, b) => b.length - a.length);

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const PATTERNS = KEYS.map((k) => ({
  re: new RegExp(`(?<![\\w-:/])${escapeRegex(k)}(?![\\w-:/])`, "g"),
  out: MAP[k],
}));

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (name === "node_modules" || name === ".git" || name === "dist") continue;
      walk(p);
    } else if (extname(p) === ".jsx") {
      transform(p);
    }
  }
}

function transform(path) {
  const orig = readFileSync(path, "utf8");
  let next = orig;
  for (const { re, out } of PATTERNS) next = next.replace(re, out);
  if (next !== orig) {
    writeFileSync(path, next);
    console.log("rewrote", path);
  }
}

walk("src");
console.log("done");
