// Theme engine (SPEC R-8, 03-tauri R-11): theme JSON -> merge with T-26
// fallbacks -> CSS custom properties on :root (CSSOM only, CSP-safe).
import catppuccin from "./assets/catppuccin/catppuccin-mauve.json";
import one from "./assets/one/one.json";
import { parseColor, toCss } from "./color";
import { FALLBACKS, TARGET_TOKENS, cssVar, type TargetToken } from "./tokens";

interface ThemeJson {
  name: string;
  appearance: "light" | "dark";
  style: Record<string, unknown> & { players?: Array<Record<string, string | null>> };
}
interface FamilyJson {
  name: string;
  themes: ThemeJson[];
}

export type ThemeName = "Catppuccin Mocha" | "Catppuccin Latte" | "One Light";

/** D-11 targets (sources: public/licenses/NOTICE.md, D-14). */
export const THEME_NAMES: ThemeName[] = ["Catppuccin Mocha", "Catppuccin Latte", "One Light"];

function findTheme(name: ThemeName): ThemeJson | null {
  const families: FamilyJson[] = [catppuccin as unknown as FamilyJson, one as unknown as FamilyJson];
  for (const f of families) {
    const t = f.themes.find((x) => x.name === name);
    if (t) return t;
  }
  return null;
}

export interface ResolvedToken {
  token: TargetToken;
  /** "json" | "fallback:T-26.n" | "missing" */
  source: string;
  value: string | null;
}

/** Raw JSON value for a token path (supports players[0].x). */
function rawValue(style: ThemeJson["style"], token: string): string | null | undefined {
  const m = /^players\[(\d+)\]\.(.+)$/.exec(token);
  if (m) {
    const p = style.players?.[Number(m[1])];
    if (!p) return undefined;
    return m[2] in p ? p[m[2]] : undefined;
  }
  if (!(token in style)) return undefined;
  const v = style[token];
  return v === null ? null : typeof v === "string" ? v : undefined;
}

export function resolveTheme(name: ThemeName): { appearance: "light" | "dark"; tokens: ResolvedToken[] } | null {
  const theme = findTheme(name);
  if (!theme) return null;
  const tokens = TARGET_TOKENS.map((token): ResolvedToken => {
    const v = rawValue(theme.style, token);
    if (typeof v === "string") return { token, source: "json", value: v };
    const rule = FALLBACKS[token];
    if (rule) {
      const value =
        "color" in rule.from ? rule.from.color : (rawValue(theme.style, rule.from.token) ?? null);
      return { token, source: `fallback:${rule.id}`, value: typeof value === "string" ? value : null };
    }
    return { token, source: "missing", value: null };
  });
  return { appearance: theme.appearance, tokens };
}

export interface SyntaxStyle {
  color: string | null;
  font_style: string | null;
  font_weight: number | null;
}

/** The theme's `syntax` map (03-THEME-ICONS T-06, T-27). */
export function themeSyntax(name: ThemeName): Record<string, SyntaxStyle> {
  const t = findTheme(name);
  const raw = (t?.style as { syntax?: Record<string, Partial<SyntaxStyle>> } | undefined)?.syntax ?? {};
  const out: Record<string, SyntaxStyle> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k] = { color: v?.color ?? null, font_style: v?.font_style ?? null, font_weight: v?.font_weight ?? null };
  }
  return out;
}

type Listener = (name: ThemeName, appearance: "light" | "dark") => void;
const listeners: Listener[] = [];
let current: { name: ThemeName; appearance: "light" | "dark" } | null = null;

export function onThemeChange(fn: Listener): void {
  listeners.push(fn);
}

export function currentTheme() {
  return current;
}

export interface ApplyTiming {
  readMs: number;
  mergeMs: number;
  cssMs: number;
  listenersMs: number;
}

/**
 * Apply a theme. Steps (timed for SPEC R-8): read JSON, merge with
 * fallbacks, write CSS variables, notify listeners (CM6 reconfigure etc.).
 */
export function applyTheme(name: ThemeName): { ok: boolean; error?: string; timing?: ApplyTiming } {
  const t0 = performance.now();
  const theme = findTheme(name);
  const t1 = performance.now();
  if (!theme) return { ok: false, error: `theme not bundled: ${name}` };
  const resolved = resolveTheme(name)!;
  const t2 = performance.now();
  const root = document.documentElement.style;
  for (const t of resolved.tokens) {
    const c = t.value ? parseColor(t.value) : null;
    if (c) root.setProperty(cssVar(t.token), toCss(c));
    else root.removeProperty(cssVar(t.token));
  }
  root.setProperty("color-scheme", resolved.appearance);
  const t3 = performance.now();
  current = { name, appearance: resolved.appearance };
  for (const fn of listeners) fn(name, resolved.appearance);
  const t4 = performance.now();
  return {
    ok: true,
    timing: { readMs: t1 - t0, mergeMs: t2 - t1, cssMs: t3 - t2, listenersMs: t4 - t3 },
  };
}
