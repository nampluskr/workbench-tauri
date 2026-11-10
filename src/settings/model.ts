import { stripJsonc } from "../keymap/user.ts";
import type { KeymapSection } from "../keymap/engine.ts";
import type { MenuItem } from "../shell/menu.ts";
import { DEFAULT_THEME } from "../theme/registry.ts";

export const SETTINGS_BINDINGS: KeymapSection[] = [{ context: "Workspace", bindings: { "ctrl-,": "zed::OpenSettings" } }];

// I-3: editor_theme and preview_theme follow theme until set (parseSettings), so the defaults repeat its default.
export const DEFAULTS = { theme: DEFAULT_THEME as string, icon_theme: "Zed (Default)", editor_theme: DEFAULT_THEME as string, preview_theme: DEFAULT_THEME as string, ui_font_size: 16, buffer_font_size: 15, preview_font_size: 16,
  // I-9: the Markdown preview's line and block gaps, in px (they match the Zed values at the 16px preview size).
  preview_paragraph_line_gap: 8, preview_paragraph_gap: 16, preview_list_line_gap: 8, preview_list_gap: 12,
  // I-5 ~ I-8, I-10: the editor body's view settings.
  editor_line_height: 1.6, editor_line_numbers: true, editor_word_wrap: true, editor_indent_guides: true, editor_render_whitespace: false };
export type Settings = typeof DEFAULTS;
export type SettingKey = keyof Settings;
export type SettingValue = string | number | boolean;
export const isToggleKey = (key: SettingKey): boolean => typeof DEFAULTS[key] === "boolean";
// core v0.7 I-8: a multiple of the font size, 0.1 steps, 1.0 to 3.0. A file value outside this is invalid (the default); the Settings screen moves a typed value to the nearest one.
export const nearestLineHeight = (value: number): number => Math.min(3, Math.max(1, Math.round(value * 10) / 10));
// core v0.7 I-9: whole pixels, 0 to 48, for the four preview gaps. Same handling as the line height.
export const isGapKey = (key: SettingKey): boolean => key.startsWith("preview_") && key.endsWith("_gap");
export const nearestGap = (value: number): number => Math.min(48, Math.max(0, Math.round(value)));
export const settingStep = (key: SettingKey): number => key === "editor_line_height" ? 0.1 : 1;
/** The number a Settings stepper or input saves: a step away from `current`, or the typed value, kept to the key's own range. */
export const settingNumber = (key: SettingKey, value: number): number =>
  key === "editor_line_height" ? nearestLineHeight(value) : isGapKey(key) ? nearestGap(value) : value;
export const THEME_KEYS = ["theme", "editor_theme", "preview_theme"] as const;
export type ChoiceKey = (typeof THEME_KEYS)[number] | "icon_theme";
export const isChoiceKey = (key: SettingKey): key is ChoiceKey => key === "icon_theme" || (THEME_KEYS as readonly string[]).includes(key);
// I-4: three categories. Labels follow Zed's settings UI; descriptions follow VS Code's setting descriptions (Zed page_data.rs words them differently).
export const CATEGORIES = ["UI", "Editor", "Preview"] as const;
export const ROWS: { key: SettingKey; name: string; description: string; category: (typeof CATEGORIES)[number] }[] = [
  { key: "theme", name: "Theme", description: "Specifies the color theme used in the workbench.", category: "UI" },
  { key: "icon_theme", name: "Icon Theme", description: "Specifies the file icon theme used in the workbench.", category: "UI" },
  { key: "ui_font_size", name: "Font Size", description: "Controls the font size in pixels used in the UI.", category: "UI" },
  { key: "editor_theme", name: "Theme", description: "Specifies the color theme used in the editor.", category: "Editor" },
  { key: "buffer_font_size", name: "Font Size", description: "Controls the font size in pixels.", category: "Editor" },
  { key: "editor_line_height", name: "Line Height", description: "Controls the line height as a multiple of the font size.", category: "Editor" },
  { key: "editor_line_numbers", name: "Line Numbers", description: "Controls the display of line numbers.", category: "Editor" },
  { key: "editor_word_wrap", name: "Word Wrap", description: "Controls whether long lines wrap in Markdown files. Code files never wrap.", category: "Editor" },
  { key: "editor_indent_guides", name: "Indent Guides", description: "Controls whether the editor should render indent guides.", category: "Editor" },
  { key: "editor_render_whitespace", name: "Render Whitespace", description: "Controls whether the editor renders spaces, tabs and line breaks as symbols.", category: "Editor" },
  { key: "preview_theme", name: "Theme", description: "Specifies the color theme used in the Markdown preview.", category: "Preview" },
  { key: "preview_font_size", name: "Font Size", description: "Controls the font size in pixels used in the Markdown preview.", category: "Preview" },
  { key: "preview_paragraph_line_gap", name: "Paragraph Line Spacing", description: "Controls the space in pixels between wrapped lines of a paragraph.", category: "Preview" },
  { key: "preview_paragraph_gap", name: "Paragraph Spacing", description: "Controls the space in pixels between paragraphs.", category: "Preview" },
  { key: "preview_list_line_gap", name: "List Line Spacing", description: "Controls the space in pixels between wrapped lines of a list item.", category: "Preview" },
  { key: "preview_list_gap", name: "List Item Spacing", description: "Controls the space in pixels between list items.", category: "Preview" },
];

function object(text: string): Record<string, unknown> {
  const value: unknown = JSON.parse(stripJsonc(text.replace(/^\uFEFF/, "")));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Settings must be an object.");
  return value as Record<string, unknown>;
}

/** The names a theme or icon theme setting may take: the registries in src/theme (a name outside them is invalid). */
export type Choices = { theme: readonly string[]; icon_theme: readonly string[] };

export function validSetting(key: SettingKey, value: unknown, choices: Choices): boolean {
  if (isChoiceKey(key)) return typeof value === "string" && (key === "icon_theme" ? choices.icon_theme : choices.theme).includes(value);
  if (isToggleKey(key)) return typeof value === "boolean";
  if (key === "editor_line_height") return typeof value === "number" && value === nearestLineHeight(value);
  if (isGapKey(key)) return typeof value === "number" && value === nearestGap(value);
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function parseSettings(text: string | null, choices: Choices): Settings {
  let raw: Record<string, unknown> = {};
  try { if (text?.trim()) raw = object(text); } catch { /* Invalid files use defaults without rewriting them. */ }
  const out: Record<string, unknown> = {};
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    const own = key === "editor_theme" || key === "preview_theme" ? out.theme : fallback; // theme comes first in DEFAULTS
    out[key] = validSetting(key as SettingKey, raw[key], choices) ? raw[key] : own;
  }
  return out as Settings;
}

export const filterSettings = (query: string) => ROWS.filter((row) =>
  query.toLowerCase().trim().split(/\s+/).every((term) => `${row.category} ${row.name} ${row.description}`.toLowerCase().includes(term)));

export const settingMenu = (key: ChoiceKey, current: string, change: (value: string) => void, choices: Choices): MenuItem[] =>
  (key === "icon_theme" ? choices.icon_theme : choices.theme).map((name) => ({ label: name, checked: name === current, run: () => change(name) }));

/** Several keys in one write, so the file watcher never reads a half-changed state. */
export const updateSettings = (text: string | null, values: Partial<Record<SettingKey, SettingValue>>, choices: Choices): string =>
  Object.entries(values).reduce<string | null>((acc, [key, value]) => updateSetting(acc, key as SettingKey, value, choices), text) ?? "";

/** Replace top-level value spans only; preserve comments, unknown keys, BOM and whitespace. */
export function updateSetting(text: string | null, key: SettingKey, value: SettingValue, choices: Choices): string {
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
