import { parseKeys, type Action, type KeymapSection } from "./engine.ts";
import { stripJsonc } from "./user.ts";

export type BindingRow = { action: Action; keys: string; context: string; source: "Default" | "User" };
export const isUserKeymapPath = (path: string): boolean => /[\\/]workbench-tauri[\\/]keymap\.json$/i.test(path);
export const KEYMAP_EDITOR_BINDINGS: KeymapSection[] = [
  { context: "Workspace", bindings: { "ctrl-k ctrl-s": "zed::OpenKeymap" } },
  { context: "KeymapEditor", bindings: { "ctrl-e": "keymap_editor::EditInJson", "ctrl-k": "keymap_editor::CreateKeybinding" } },
];
export const actionLabel = (action: Action): string => {
  const name = Array.isArray(action) ? action[0] : action;
  return name === null ? "<null>" : name.replace(/::/g, ": ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
};

export function keymapRows(builtin: KeymapSection[], user: string | null, actions: string[]): BindingRow[] {
  const rows: BindingRow[] = [];
  const sections = user?.trim() ? JSON.parse(stripJsonc(user.replace(/^\uFEFF/, ""))) : [];
  if (!Array.isArray(sections)) throw new Error("Keymap must be an array.");
  for (const [source, list] of [["Default", builtin], ["User", sections]] as const) {
    for (const section of list) {
      if (!section || typeof section !== "object" || Array.isArray(section) || (section.context != null && typeof section.context !== "string") ||
        (section.bindings != null && (typeof section.bindings !== "object" || Array.isArray(section.bindings)))) throw new Error("Invalid keymap section.");
      for (const [keys, action] of Object.entries(section.bindings ?? {})) {
        if (action !== null && typeof action !== "string" && !(Array.isArray(action) && typeof action[0] === "string")) throw new Error("Invalid keymap action.");
        rows.push({ keys, action: action as Action, context: section.context ?? "", source });
      }
    }
  }
  for (const action of actions) if (!rows.some((r) => (Array.isArray(r.action) ? r.action[0] : r.action) === action)) rows.push({ action, keys: "", context: "", source: "Default" });
  return rows.sort((a, b) => actionLabel(a.action).localeCompare(actionLabel(b.action)));
}

export const filterBindings = (rows: BindingRow[], query: string): BindingRow[] => {
  const terms = query.toLowerCase().trim().split(/\s+/);
  return rows.filter((row) => terms.every((term) => `${actionLabel(row.action)} ${Array.isArray(row.action) ? row.action[0] : row.action}`.toLowerCase().includes(term)));
};

// shortcut: append overrides to preserve JSONC bytes; add targeted edits if repeated changes make files unwieldy.
/** Append overrides: the user's original bytes, including comments and unknown fields, stay intact. */
export function appendBinding(text: string | null, context: string, keys: string, action: Action, previous?: BindingRow): string {
  const strokes = parseKeys(keys);
  if (!keys.trim() || strokes.some((s) => !s || /[\r\n]/.test(s))) throw new Error("Record a keybinding first.");
  let original = text ?? "[]";
  if (!original.replace(/^\uFEFF/, "").trim()) original += "[]";
  const existing = keymapRows([], original, []);
  let depth = 0;
  let end = -1;
  for (let i = 0; i < original.length; i++) {
    const c = original[i];
    if (c === '"') {
      while (++i < original.length) { if (original[i] === "\\") i++; else if (original[i] === '"') break; }
    } else if (c === "/" && original[i + 1] === "/") {
      while (i < original.length && original[i] !== "\n") i++;
    } else if (c === "/" && original[i + 1] === "*") {
      i = original.indexOf("*/", i + 2) + 1;
    } else if (c === "[") depth++;
    else if (c === "]" && --depth === 0) { end = i; break; }
  }
  if (end < 0) throw new Error("Invalid keymap file.");
  const overrides: KeymapSection[] = [];
  const current = previous && existing.filter((row) => row.context === previous.context && parseKeys(row.keys).join(" ") === parseKeys(previous.keys).join(" ")).at(-1);
  if (previous?.keys && (parseKeys(previous.keys).join(" ") !== strokes.join(" ") || previous.context !== context) &&
    (!current || JSON.stringify(current.action) === JSON.stringify(previous.action))) {
    overrides.push({ ...(previous.context ? { context: previous.context } : {}), bindings: { [previous.keys]: null } });
  }
  overrides.push({ ...(context ? { context } : {}), bindings: { [strokes.join(" ")]: action } });
  const prefix = original.slice(0, end);
  const clean = stripJsonc(prefix).replace(/^\uFEFF/, "").trimEnd();
  const comma = clean.endsWith("[") || clean.endsWith(",") ? "" : ",";
  const newline = original.includes("\r\n") ? "\r\n" : "\n";
  return prefix + newline + comma + overrides.map((s) => JSON.stringify(s, null, 2).replace(/\n/g, newline)).join("," + newline) + newline + original.slice(end);
}
