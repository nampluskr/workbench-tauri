import { stripJsonc } from "../keymap/user.ts";
import type { KeymapSection } from "../keymap/engine.ts";
import type { MenuItem } from "../shell/menu.ts";
import { DEFAULT_THEME } from "../theme/registry.ts";

export const SETTINGS_BINDINGS: KeymapSection[] = [{ context: "Workspace", bindings: { "ctrl-,": "zed::OpenSettings" } }];

export const DEFAULTS = { theme: DEFAULT_THEME as string, icon_theme: "Zed (Default)", ui_font_size: 16, buffer_font_size: 15 };
export type Settings = typeof DEFAULTS;
export type SettingKey = keyof Settings;
// Labels and descriptions: Zed 4304dec732, crates/settings_ui/src/page_data.rs (appearance_page).
export const ROWS: { key: SettingKey; name: string; description: string; section: string }[] = [
  { key: "theme", name: "Theme Name", description: "The name of your selected theme.", section: "Theme" },
  { key: "icon_theme", name: "Icon Theme Name", description: "The name of your selected icon theme.", section: "Theme" },
  { key: "buffer_font_size", name: "Font Size", description: "Font size for editor text.", section: "Buffer Font" },
  { key: "ui_font_size", name: "Font Size", description: "Font size for UI elements.", section: "UI Font" },
];

function object(text: string): Record<string, unknown> {
  const value: unknown = JSON.parse(stripJsonc(text.replace(/^\uFEFF/, "")));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Settings must be an object.");
  return value as Record<string, unknown>;
}

/** `themes` is the registry list (src/theme/themes.ts): a theme name outside it is invalid. */
export function validSetting(key: SettingKey, value: unknown, themes: readonly string[]): boolean {
  if (key === "theme") return typeof value === "string" && themes.includes(value);
  if (key === "icon_theme") return value === DEFAULTS.icon_theme;
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function parseSettings(text: string | null, themes: readonly string[]): Settings {
  let raw: Record<string, unknown> = {};
  try { if (text?.trim()) raw = object(text); } catch { /* Invalid files use defaults without rewriting them. */ }
  return Object.fromEntries(Object.entries(DEFAULTS).map(([key, fallback]) => [key, validSetting(key as SettingKey, raw[key], themes) ? raw[key] : fallback])) as Settings;
}

export const filterSettings = (query: string) => ROWS.filter((row) =>
  query.toLowerCase().trim().split(/\s+/).every((term) => `Appearance ${row.section} ${row.name} ${row.description}`.toLowerCase().includes(term)));

export const settingMenu = (key: "theme" | "icon_theme", current: string, change: (value: string) => void, themes: readonly string[]): MenuItem[] =>
  (key === "theme" ? themes : [DEFAULTS.icon_theme]).map((name) => ({ label: name, checked: name === current, run: () => change(name) }));

/** Replace top-level value spans only; preserve comments, unknown keys, BOM and whitespace. */
export function updateSetting(text: string | null, key: SettingKey, value: string | number, themes: readonly string[]): string {
  if (!validSetting(key, value, themes)) throw new Error(`Invalid ${key}.`);
  const original = text ?? "{}\n";
  object(original); // Refuse to overwrite malformed files.
  const allTokens = [...original.matchAll(/"(?:\\.|[^"\\])*"|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|[{}\[\],:]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g)];
  const tokens = allTokens
    .filter((token) => !token[0].startsWith("//") && !token[0].startsWith("/*") && token[0] !== "\uFEFF");
  const spans: { start: number; end: number }[] = [];
  let depth = 0;
  let end = -1;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (depth === 1 && token[0].startsWith('"') && tokens[i + 1]?.[0] === ":") {
      const start = tokens[i + 2].index!;
      let j = i + 2;
      let nested = 0;
      for (; j < tokens.length; j++) {
        const t = tokens[j][0];
        if (nested === 0 && (t === "," || t === "}")) break;
        if (t === "{" || t === "[") nested++;
        else if (t === "}" || t === "]") nested--;
      }
      if (JSON.parse(token[0]) === key) spans.push({ start, end: tokens[j - 1].index! + tokens[j - 1][0].length });
      i = j - 1;
    } else if (token[0] === "{") depth++;
    else if (token[0] === "}" && --depth === 0) { end = token.index!; break; }
  }
  if (end < 0) throw new Error("Invalid settings file.");
  const encoded = JSON.stringify(value);
  let result = original;
  for (const span of spans.reverse()) {
    const comments = allTokens.filter((token) => token.index! >= span.start && token.index! < span.end && (token[0].startsWith("/*") || token[0].startsWith("//"))).map((token) => token[0]);
    const newline = original.includes("\r\n") ? "\r\n" : "\n";
    result = result.slice(0, span.start) + encoded + (comments.length ? newline + comments.join(newline) + newline : "") + result.slice(span.end);
  }
  if (!spans.length) {
    const prefix = original.slice(0, end);
    const clean = stripJsonc(prefix).replace(/^\uFEFF/, "").trimEnd();
    const newline = original.includes("\r\n") ? "\r\n" : "\n";
    result = prefix + newline + (clean.endsWith("{") || clean.endsWith(",") ? "" : ",") + JSON.stringify(key) + ": " + encoded + newline + original.slice(end);
  }
  object(result);
  return result;
}
