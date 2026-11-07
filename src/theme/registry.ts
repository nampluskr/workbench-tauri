// Theme list built from theme JSON sources (ORDER-07, D-8). Pure, so node tests can feed it plain strings.
import { findTheme } from "./theme.ts";

export type RegisteredTheme = ReturnType<typeof findTheme>;

/** Missing tokens are taken from the One theme of the same appearance (Zed refines its fallback One-like theme). */
export const BASE_THEME = { dark: "One Dark", light: "One Light" } as const;
export const DEFAULT_THEME = BASE_THEME.dark;

/**
 * Every valid theme of every file: broken JSON, nameless or malformed themes and repeated names are skipped.
 * Order is Zed's selector order (T-21.3): dark first, then light, each by plain string comparison.
 */
export function buildRegistry(files: Record<string, string>): RegisteredTheme[] {
  const seen = new Set<string>();
  const out: RegisteredTheme[] = [];
  for (const [, source] of Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    let file: { themes?: unknown };
    try { file = JSON.parse(source); } catch { continue; }
    if (!Array.isArray(file?.themes)) continue;
    for (const entry of file.themes) {
      const name = entry?.name;
      if (typeof name !== "string" || !name || seen.has(name)) continue;
      try { out.push(findTheme({ themes: [entry] }, name)); } catch { continue; }
      seen.add(name);
    }
  }
  const rank = (t: RegisteredTheme) => (t.appearance === "dark" ? 0 : 1);
  return out.sort((a, b) => rank(a) - rank(b) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/** The named theme, or the default One Dark when the name is not in the list. */
export function pickTheme(list: RegisteredTheme[], name: string | undefined): RegisteredTheme {
  const theme = list.find((t) => t.name === name) ?? list.find((t) => t.name === DEFAULT_THEME);
  if (!theme) throw new Error(`default theme missing: ${DEFAULT_THEME}`);
  return theme;
}
