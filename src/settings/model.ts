import { stripJsonc } from "../keymap/user.ts";
import type { KeymapSection } from "../keymap/engine.ts";
import type { MenuItem } from "../shell/menu.ts";
import { DEFAULT_THEME } from "../theme/registry.ts";
import { PREVIEW_BASE_FONT_SIZE } from "../spec/metrics.ts";

export const SETTINGS_BINDINGS: KeymapSection[] = [{ context: "Workspace", bindings: { "ctrl-,": "zed::OpenSettings" } }];

// I-3: editor_theme and preview_theme follow theme until set (parseSettings), so the defaults repeat its default.
export const DEFAULTS = { theme: DEFAULT_THEME as string, icon_theme: "Zed (Default)", editor_theme: DEFAULT_THEME as string, preview_theme: DEFAULT_THEME as string, ui_font_size: 16, buffer_font_size: 14, preview_font_size: PREVIEW_BASE_FONT_SIZE, // core v0.8.2 I-26
  // core v0.8.2 I-26: the preview's line and block gaps in px at the 14px preview font, scaling with it: Zed 1.27.0 measured at 16px
  // (core v0.8.1 I-8: 8, 16, 6, 4) times 14/16. New key names, so the 0.8.1 *_gap values in a file are read apart (oldGaps).
  preview_paragraph_line_spacing: 7, preview_paragraph_spacing: 14, preview_list_line_spacing: 5.25, preview_list_spacing: 3.5,
  // I-5 ~ I-8, I-10: the editor body's view settings.
  editor_line_height: 1.6, editor_line_numbers: true, editor_word_wrap: true, editor_indent_guides: true, editor_render_whitespace: false,
  // core v0.8.1 I-10: the editor and preview code fonts (one list, CODE_FONTS) and the code block size in % of the preview font size.
  // core v0.8.2 I-17: 86% is 12.04px at the 14px preview font (was 85). A saved value stays as it is.
  buffer_font_family: "JetBrains Mono", preview_code_font_family: "JetBrains Mono", preview_code_font_size: 86,
  // core v0.8.2 I-21 / I-23: the preview code line height (GitHub's 1.45) and the preview code line numbers (off: the 0.8.1 look).
  preview_code_line_height: 1.45, preview_code_line_numbers: false };
export type Settings = typeof DEFAULTS;
export type SettingKey = keyof Settings;
export type SettingValue = string | number | boolean;
export const isToggleKey = (key: SettingKey): boolean => typeof DEFAULTS[key] === "boolean";
// core v0.7 I-8: a multiple of the font size, 0.1 steps, 1.0 to 3.0. A file value outside this is invalid (the default); the Settings screen moves a typed value to the nearest one.
export const nearestLineHeight = (value: number): number => Math.min(3, Math.max(1, Math.round(value * 10) / 10));
// core v0.7 I-9, v0.8.2 I-26: quarter pixels (a default is 5.25), 0 to 48, for the four preview gaps. Same handling as the line height.
export const isGapKey = (key: SettingKey): boolean => key.startsWith("preview_") && key.endsWith("_spacing");
export const nearestGap = (value: number): number => Math.min(48, Math.max(0, Math.round(value * 4) / 4));
// core v0.8.1 I-10: whole percents, 50 to 150, for the preview code block size. Same handling as the line height.
export const nearestPercent = (value: number): number => Math.min(150, Math.max(50, Math.round(value)));
// core v0.8.2 I-21: the editor Line Height's range (1.0 to 3.0) in 0.05 steps, since the 1.45 default is not a 0.1 step. Same handling as the line height.
export const nearestCodeLineHeight = (value: number): number => Math.min(3, Math.max(1, Math.round(value * 20) / 20));
export const settingStep = (key: SettingKey): number => key === "editor_line_height" ? 0.1 : key === "preview_code_line_height" ? 0.05 : 1;
/** The number a Settings stepper or input saves: a step away from `current`, or the typed value, kept to the key's own range. */
export const settingNumber = (key: SettingKey, value: number): number =>
  key === "editor_line_height" ? nearestLineHeight(value) : key === "preview_code_line_height" ? nearestCodeLineHeight(value)
    : isGapKey(key) ? nearestGap(value) : key === "preview_code_font_size" ? nearestPercent(value) : value;
export const THEME_KEYS = ["theme", "editor_theme", "preview_theme"] as const;
// core v0.8.1 I-10: the bundled code fonts (public/fonts), the first is the default. A name outside the list is invalid.
export const CODE_FONTS = ["JetBrains Mono", "Hack", "Ubuntu Mono", "D2Coding", "Lilex"] as const;
const FONT_KEYS: readonly string[] = ["buffer_font_family", "preview_code_font_family"];
export type ChoiceKey = (typeof THEME_KEYS)[number] | "icon_theme" | "buffer_font_family" | "preview_code_font_family";
export const isChoiceKey = (key: SettingKey): key is ChoiceKey => key === "icon_theme" || FONT_KEYS.includes(key) || (THEME_KEYS as readonly string[]).includes(key);
const choiceList = (key: ChoiceKey, choices: Choices): readonly string[] => key === "icon_theme" ? choices.icon_theme : FONT_KEYS.includes(key) ? CODE_FONTS : choices.theme;
// I-4: three categories. Labels follow Zed's settings UI; descriptions follow VS Code's setting descriptions (Zed page_data.rs words them differently).
export const CATEGORIES = ["UI", "Editor", "Preview"] as const;
export const ROWS: { key: SettingKey; name: string; description: string; category: (typeof CATEGORIES)[number] }[] = [
  { key: "theme", name: "Theme", description: "Specifies the color theme used in the workbench.", category: "UI" },
  { key: "icon_theme", name: "Icon Theme", description: "Specifies the file icon theme used in the workbench.", category: "UI" },
  { key: "ui_font_size", name: "Font Size", description: "Controls the font size in pixels used in the UI.", category: "UI" },
  { key: "editor_theme", name: "Theme", description: "Specifies the color theme used in the editor.", category: "Editor" },
  { key: "buffer_font_family", name: "Font Family", description: "Controls the font family.", category: "Editor" },
  { key: "buffer_font_size", name: "Font Size", description: "Controls the font size in pixels.", category: "Editor" },
  { key: "editor_line_height", name: "Line Height", description: "Controls the line height as a multiple of the font size.", category: "Editor" },
  { key: "editor_line_numbers", name: "Line Numbers", description: "Controls the display of line numbers.", category: "Editor" },
  { key: "editor_word_wrap", name: "Word Wrap", description: "Controls whether long lines wrap in Markdown files. Code files never wrap.", category: "Editor" },
  { key: "editor_indent_guides", name: "Indent Guides", description: "Controls whether the editor should render indent guides.", category: "Editor" },
  { key: "editor_render_whitespace", name: "Render Whitespace", description: "Controls whether the editor renders spaces, tabs and line breaks as symbols.", category: "Editor" },
  { key: "preview_theme", name: "Theme", description: "Specifies the color theme used in the Markdown preview.", category: "Preview" },
  { key: "preview_font_size", name: "Font Size", description: "Controls the font size in pixels used in the Markdown preview.", category: "Preview" },
  { key: "preview_code_font_family", name: "Code Font Family", description: "Controls the font family of code blocks and inline code in the Markdown preview.", category: "Preview" },
  { key: "preview_code_font_size", name: "Code Font Size", description: "Controls the font size of code blocks as a percentage of the preview font size.", category: "Preview" },
  { key: "preview_code_line_height", name: "Code Line Height", description: "Controls the line height of code blocks as a multiple of the code font size.", category: "Preview" },
  { key: "preview_code_line_numbers", name: "Code Line Numbers", description: "Controls the display of line numbers in code blocks.", category: "Preview" },
  { key: "preview_paragraph_line_spacing", name: "Paragraph Line Spacing", description: "Controls the space in pixels between wrapped lines of a paragraph.", category: "Preview" },
  { key: "preview_paragraph_spacing", name: "Paragraph Spacing", description: "Controls the space in pixels between paragraphs.", category: "Preview" },
  { key: "preview_list_line_spacing", name: "List Line Spacing", description: "Controls the space in pixels between wrapped lines of a list item.", category: "Preview" },
  { key: "preview_list_spacing", name: "List Item Spacing", description: "Controls the space in pixels between list items.", category: "Preview" },
];

function object(text: string): Record<string, unknown> {
  const value: unknown = JSON.parse(stripJsonc(text.replace(/^\uFEFF/, "")));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Settings must be an object.");
  return value as Record<string, unknown>;
}

/** The names a theme or icon theme setting may take: the registries in src/theme (a name outside them is invalid). */
export type Choices = { theme: readonly string[]; icon_theme: readonly string[] };

export function validSetting(key: SettingKey, value: unknown, choices: Choices): boolean {
  if (isChoiceKey(key)) return typeof value === "string" && choiceList(key, choices).includes(value);
  if (isToggleKey(key)) return typeof value === "boolean";
  if (key === "editor_line_height") return typeof value === "number" && value === nearestLineHeight(value);
  if (key === "preview_code_line_height") return typeof value === "number" && value === nearestCodeLineHeight(value);
  if (isGapKey(key)) return typeof value === "number" && value === nearestGap(value);
  if (key === "preview_code_font_size") return typeof value === "number" && value === nearestPercent(value);
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
  return { ...out, ...oldGaps(raw, choices) } as Settings;
}

/** core v0.8.2 I-26: the 0.8.1 gap keys, read where a file has no valid new key. */
const OLD_GAP_KEYS: Partial<Record<SettingKey, string>> = { preview_paragraph_line_spacing: "preview_paragraph_line_gap", preview_paragraph_spacing: "preview_paragraph_gap",
  preview_list_line_spacing: "preview_list_line_gap", preview_list_spacing: "preview_list_gap" };

/**
 * core v0.8.2 I-26: a 0.8.1 gap value (whole px 0 to 48) as the new setting that draws the same px at the file's preview font size.
 * 0.8.1 drew the paragraph gaps as fixed px and the list gaps as px at a 16px font scaling with it; its default font was 16, now 14.
 */
function oldGaps(raw: Record<string, unknown>, choices: Choices): Partial<Settings> {
  const size = (fallback: number) => validSetting("preview_font_size", raw.preview_font_size, choices) ? raw.preview_font_size as number : fallback;
  const out: Partial<Record<SettingKey, number>> = {};
  for (const [key, old] of Object.entries(OLD_GAP_KEYS) as [SettingKey, string][]) {
    const value = raw[old];
    if (validSetting(key, raw[key], choices) || typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 48) continue;
    const drawn = old.startsWith("preview_list") ? value * size(16) / 16 : value;
    out[key] = nearestGap(drawn * PREVIEW_BASE_FONT_SIZE / size(PREVIEW_BASE_FONT_SIZE));
  }
  return out as Partial<Settings>;
}

/** I-17: the keys of every row in a category, which Load Defaults deletes (with their 0.8.1 names); other categories and unknown keys are not in it. */
export const categoryKeys = (category: (typeof CATEGORIES)[number]): string[] =>
  ROWS.filter((row) => row.category === category).flatMap((row) => [row.key, ...(OLD_GAP_KEYS[row.key] ? [OLD_GAP_KEYS[row.key]!] : [])]);

export const filterSettings = (query: string) => ROWS.filter((row) =>
  query.toLowerCase().trim().split(/\s+/).every((term) => `${row.category} ${row.name} ${row.description}`.toLowerCase().includes(term)));

export const settingMenu = (key: ChoiceKey, current: string, change: (value: string) => void, choices: Choices): MenuItem[] =>
  choiceList(key, choices).map((name) => ({ label: name, checked: name === current, run: () => change(name) }));

/**
 * Several keys in one write, so the file watcher never reads a half-changed state. core v0.8.2 I-26: the first write also puts in the
 * new keys of the 0.8.1 gaps as read from the file before it (oldGaps), so from then on they scale with a changed font size.
 */
export function updateSettings(text: string | null, values: Partial<Record<SettingKey, SettingValue>>, choices: Choices): string {
  let raw: Record<string, unknown> = {};
  try { if (stripJsonc(text ?? "").replace(/^﻿/, "").trim()) raw = object(text!); } catch { /* updateSetting refuses a malformed file */ }
  return Object.entries({ ...oldGaps(raw, choices), ...values }).reduce<string | null>((acc, [key, value]) => updateSetting(acc, key as SettingKey, value, choices), text) ?? "";
}

const TOKEN = /"(?:\\.|[^"\\])*"|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|[{}\[\],:]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g;

/**
 * I-17: delete the top-level members named in `keys` (the default is then used, as in VS Code). Everything else stays: other keys,
 * every comment (a comment line above a deleted key stays too; only a "// note" on the deleted member's own line goes with it),
 * BOM and line endings. A member alone on its lines takes those lines; a deleted last member takes the comma before it; a trailing
 * comma stays as it was. A malformed file throws.
 */
export function removeSettings(text: string | null, keys: readonly string[]): string {
  let result = text ?? "";
  if (stripJsonc(result).replace(/^\uFEFF/, "").trim() === "") return result;
  object(result);
  for (const key of keys) for (let next = removeOne(result, key); next !== result; next = removeOne(result, key)) result = next;
  object(result);
  return result;
}

/** Remove the last top-level member named `key`, or return the text unchanged. */
function removeOne(text: string, key: string): string {
  const tokens = [...text.matchAll(TOKEN)].filter((token) => !token[0].startsWith("//") && !token[0].startsWith("/*"));
  let depth = 0;
  let hit: { start: number; end: number; comma?: number; before: RegExpMatchArray } | undefined;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (depth === 1 && token[0].startsWith('"') && tokens[i + 1]?.[0] === ":") {
      let j = i + 2;
      for (let nested = 0; j < tokens.length; j++) {
        const t = tokens[j][0];
        if (nested === 0 && (t === "," || t === "}")) break;
        if (t === "{" || t === "[") nested++;
        else if (t === "}" || t === "]") nested--;
      }
      if (JSON.parse(token[0]) === key) hit = { start: token.index!, end: tokens[j - 1].index! + tokens[j - 1][0].length, comma: tokens[j][0] === "," ? tokens[j].index! : undefined, before: tokens[i - 1] };
      i = j - 1;
    } else if (token[0] === "{") depth++;
    else if (token[0] === "}") depth--;
  }
  if (!hit) return text;
  const { start, end, comma, before } = hit;
  const stop = comma === undefined ? end : comma + 1;
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const eol = text.indexOf("\n", stop) < 0 ? text.length : text.indexOf("\n", stop);
  const ownLines = !text.slice(lineStart, start).trim() && /^[ \t]*(\/\/[^\r\n]*)?\r?$/.test(text.slice(stop, eol));
  let cut: [number, number];
  if (ownLines) cut = [lineStart, Math.min(eol + 1, text.length)];
  else if (comma !== undefined) { let e = stop; while (text[e] === " " || text[e] === "\t") e++; cut = [start, e]; }
  else cut = [before[0] === "," ? before.index! : start, end];
  const result = text.slice(0, cut[0]) + text.slice(cut[1]);
  // The last member on its own lines is gone: the comma that ended the member before it goes too.
  if (ownLines && comma === undefined && before[0] === ",") return result.slice(0, before.index!) + result.slice(before.index! + 1);
  return result;
}

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
  const allTokens = [...original.matchAll(TOKEN)];
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
