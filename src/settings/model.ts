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

/** The names a theme or icon theme setting may take: the registries in src/theme (a name outside them is invalid). */
export type Choices = { theme: readonly string[]; icon_theme: readonly string[] };

export function validSetting(key: SettingKey, value: unknown, choices: Choices): boolean {
  if (key === "theme" || key === "icon_theme") return typeof value === "string" && choices[key].includes(value);
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function parseSettings(text: string | null, choices: Choices): Settings {
  let raw: Record<string, unknown> = {};
  try { if (text?.trim()) raw = object(text); } catch { /* Invalid files use defaults without rewriting them. */ }
  return Object.fromEntries(Object.entries(DEFAULTS).map(([key, fallback]) => [key, validSetting(key as SettingKey, raw[key], choices) ? raw[key] : fallback])) as Settings;
}

export const filterSettings = (query: string) => ROWS.filter((row) =>
  query.toLowerCase().trim().split(/\s+/).every((term) => `Appearance ${row.section} ${row.name} ${row.description}`.toLowerCase().includes(term)));

export const settingMenu = (key: "theme" | "icon_theme", current: string, change: (value: string) => void, choices: Choices): MenuItem[] =>
  choices[key].map((name) => ({ label: name, checked: name === current, run: () => change(name) }));

/** Replace top-level value spans only; preserve comments, unknown keys, BOM and whitespace. */
export function updateSetting(text: string | null, key: SettingKey, value: string | number, choices: Choices): string {
  if (!validSetting(key, value, choices)) throw new Error(`Invalid ${key}.`);
  const original = text ?? "{}\n";
  const newline = original.includes("\r\n") ? "\r\n" : "\n";
  const entry = JSON.stringify(key) + ": " + JSON.stringify(value);
  // A file with nothing but comments and blanks (a new or emptied settings.json) gets the object after them.
  if (stripJsonc(original).replace(/^﻿/, "").trim() === "") {
    return original + (original && !/\n$/.test(original) ? newline : "") + `{${newline}  ${entry}${newline}}${newline}`;
  }
  object(original); // Refuse to overwrite malformed files.
  const allTokens = [...original.matchAll(/"(?:\\.|[^"\\])*"|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|[{}\[\],:]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g)];
  const tokens = allTokens
    .filter((token) => !token[0].startsWith("//") && !token[0].startsWith("/*") && token[0] !== "\uFEFF");
  const spans: { start: number; end: number }[] = [];
  let depth = 0;
  let end = -1;
  let open = -1; // the top-level "{"
  let firstKey = -1; // index of the first top-level key
  let last: { text: string; end: number } | undefined; // the token just before the closing "}"
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (depth === 1 && token[0].startsWith('"') && tokens[i + 1]?.[0] === ":") {
      if (firstKey < 0) firstKey = token.index!;
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
    } else if (token[0] === "{") { if (depth++ === 0) open = token.index!; }
    else if (token[0] === "}" && --depth === 0) {
      end = token.index!;
      last = { text: tokens[i - 1][0], end: tokens[i - 1].index! + tokens[i - 1][0].length };
      break;
    }
  }
  if (end < 0) throw new Error("Invalid settings file.");
  const encoded = JSON.stringify(value);
  let result = original;
  for (const span of spans.reverse()) {
    const comments = allTokens.filter((token) => token.index! >= span.start && token.index! < span.end && (token[0].startsWith("/*") || token[0].startsWith("//"))).map((token) => token[0]);
    const newline = original.includes("\r\n") ? "\r\n" : "\n";
    result = result.slice(0, span.start) + encoded + (comments.length ? newline + comments.join(newline) + newline : "") + result.slice(span.end);
  }
  if (!spans.length) result = appendEntry(original, { open, end, last: last!, firstKey }, entry, newline);
  object(result);
  return result;
}

/**
 * Add `entry` as the last member of the top-level object, the way an editor would: the previous last value gets its
 * comma, the new line copies the first key's indentation and a trailing comma if the file uses one. Comments stay.
 * An object on one line stays on one line; an empty one opens up.
 */
function appendEntry(text: string, at: { open: number; end: number; last: { text: string; end: number }; firstKey: number }, entry: string, newline: string): string {
  const { open, end, last, firstKey } = at;
  const empty = last.text === "{";
  const trailing = last.text === ",";
  if (!empty && !text.slice(open, end).includes("\n")) {
    return text.slice(0, last.end) + (trailing ? ` ${entry},` : `, ${entry}`) + text.slice(last.end);
  }
  let indent = "  ";
  if (firstKey >= 0) {
    const lead = text.slice(text.lastIndexOf("\n", firstKey - 1) + 1, firstKey);
    if (!lead.trim()) indent = lead;
  }
  const line = indent + entry + (trailing ? "," : "");
  const lineStart = text.lastIndexOf("\n", end - 1) + 1;
  let result: string;
  if (lineStart > open && !text.slice(lineStart, end).trim()) {
    result = text.slice(0, lineStart) + line + newline + text.slice(lineStart); // "}" has its own line
  } else {
    let blanks = end; // the blanks before "}" turn into the new line
    while (blanks > last.end && /\s/.test(text[blanks - 1])) blanks--;
    result = text.slice(0, blanks) + newline + line + newline + text.slice(end);
  }
  return empty || trailing ? result : result.slice(0, last.end) + "," + result.slice(last.end);
}
