import type { KeymapSection } from "../keymap/engine.ts";

export const EXTENSIONS_BINDINGS: KeymapSection[] = [
  { context: "Workspace", bindings: { "ctrl-shift-x": "zed::Extensions" } },
];
export const CATEGORIES = ["All", "Themes", "Icon Themes"] as const;
export const INSTALL_FILTERS = ["All", "Installed", "Not Installed"] as const;
export type Category = typeof CATEGORIES[number];
export type InstallFilter = typeof INSTALL_FILTERS[number];
/** What an extension provides; Zed shows one tag per kind (the capture's "Themes" tag). */
export type Kind = Exclude<Category, "All">;
export type Extension = { id: string; name: string; version: string; author: string; description: string; repository: string; kinds: Kind[] };
/** The extension.toml keys a card shows. */
export type Manifest = Omit<Extension, "kinds">;

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", '"': '"', "\\": "\\" };

/** One TOML value at `at`: a basic or literal string, or an array of them. Returns it and the index after it. */
function value(text: string, at: number): [string | string[], number] {
  const quote = text[at];
  if (quote === '"' || quote === "'") {
    let out = "";
    for (let i = at + 1; i < text.length && text[i] !== "\n"; i++) {
      const c = text[i];
      if (c === quote) return [out, i + 1];
      if (c !== "\\" || quote === "'") { out += c; continue; }
      const next = text[++i];
      const hex = text.slice(i + 1, i + 5);
      if (next in ESCAPES) out += ESCAPES[next];
      else if (next === "u" && /^[0-9a-f]{4}$/i.test(hex)) { out += String.fromCharCode(parseInt(hex, 16)); i += 4; }
      else throw new Error("bad escape");
    }
    throw new Error("unterminated string");
  }
  if (quote !== "[") throw new Error("unsupported value");
  const items: string[] = [];
  for (let i = at + 1; i < text.length; ) {
    if (/[\s,]/.test(text[i])) i++;
    else if (text[i] === "#") i = text.indexOf("\n", i) < 0 ? text.length : text.indexOf("\n", i);
    else if (text[i] === "]") return [items, i + 1];
    else {
      const [item, next] = value(text, i);
      if (typeof item !== "string") throw new Error("nested array");
      items.push(item);
      i = next;
    }
  }
  throw new Error("unterminated array");
}

/**
 * The top-level keys of an extension.toml (before the first [table]) that hold strings or string arrays; keys with
 * numbers or booleans (`schema_version = 1`) are ignored. `authors` are joined with ", " the way Zed lists them. A file that does not parse, or has no `name`, gives
 * undefined, so only its card drops.
 * shortcut: not a full TOML parser (no inline tables, numbers or multi-line strings); extend when a card needs them.
 */
export function parseManifest(source: string): Manifest | undefined {
  const text = source.replace(/^﻿/, "");
  const keys = new Map<string, string | string[]>();
  try {
    let i = 0;
    while (i < text.length) {
      const start = i;
      i = text.indexOf("\n", i) < 0 ? text.length : text.indexOf("\n", i) + 1;
      const line = text.slice(start, i).trim();
      if (!line || line.startsWith("#")) continue;
      if (line.startsWith("[")) break;
      const key = /^([A-Za-z0-9_-]+)\s*=\s*/.exec(line);
      if (!key) return undefined;
      const from = start + text.slice(start).indexOf(key[0]) + key[0].length;
      if (!`"'[`.includes(text[from] ?? "")) continue; // a number, boolean or inline table: not shown, skip the line
      const [v, next] = value(text, from);
      const restEnd = text.indexOf("\n", next) < 0 ? text.length : text.indexOf("\n", next);
      if (text.slice(next, restEnd).replace(/#.*$/, "").trim()) return undefined; // something after the value
      keys.set(key[1], v);
      i = restEnd + 1;
    }
  } catch { return undefined; }
  const str = (key: string) => { const v = keys.get(key); return typeof v === "string" ? v : ""; };
  const authors = keys.get("authors");
  if (!str("name")) return undefined;
  return { id: str("id") || str("name"), name: str("name"), version: str("version"), description: str("description"), repository: str("repository"),
    author: Array.isArray(authors) ? authors.join(", ") : str("author") };
}

/**
 * The extensions that came with the app (the copied sets, never an installed Zed folder). `manifests` maps the path of
 * each extension.toml to its text; `files` lists the copied theme files. An extension is tagged Themes when it has json
 * files under `themes/`, Icon Themes when it has them under `icon_themes/`; one with neither has no card. The built-in
 * themes (One, Ayu, Gruvbox, Zed (Default)) have no extension.toml: Zed does not list them as extensions either.
 */
export function bundledExtensions(manifests: Record<string, string>, files: readonly string[]): Extension[] {
  const rows: Extension[] = [];
  for (const [path, source] of Object.entries(manifests)) {
    const manifest = parseManifest(source);
    if (!manifest) continue;
    const dir = path.replace(/[^/]*$/, "");
    const kinds = ([["themes/", "Themes"], ["icon_themes/", "Icon Themes"]] as const)
      .filter(([folder]) => files.some((file) => file.startsWith(dir + folder) && file.endsWith(".json")))
      .map(([, kind]) => kind);
    if (kinds.length) rows.push({ ...manifest, kinds });
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export function filterExtensions(rows: Extension[], search: string, category: Category, installed: InstallFilter): Extension[] {
  if (installed === "Not Installed") return [];
  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return rows.filter((row) => (category === "All" || row.kinds.includes(category)) &&
    words.every((word) => `${row.name} ${row.description} ${row.author}`.toLowerCase().includes(word)));
}

export const emptyExtensions = (search: string, installed: InstallFilter): string =>
  `No ${installed === "Installed" ? "installed " : installed === "Not Installed" ? "uninstalled " : ""}extensions${search.trim() ? ` that match "${search.trim()}"` : ""}`;
