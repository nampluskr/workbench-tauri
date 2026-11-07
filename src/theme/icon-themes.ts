// Icon theme lists and the file/folder icon lookup (T-11, T-22, T-32.10, T-32.11). Pure: the lists are built from JSON text.
import { selectorOrder } from "./registry.ts";

export const ZED_DEFAULT_ICON_THEME = "Zed (Default)";

type Dir = { collapsed?: string; expanded?: string };
export type IconTheme = {
  name: string;
  appearance: "light" | "dark";
  dir: Dir;
  namedDirs: Map<string, Dir>;
  stems: Map<string, string>;
  suffixes: Map<string, string>;
  /** Icon key -> asset path (see `resolveAsset`). */
  icons: Map<string, string>;
};
export type IconSource = { json: string; root: string };

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/**
 * A theme's icon path -> an asset path. Paths are relative to the theme's root (`root`, "/"-separated, no drive).
 * Absolute paths, URLs and backslashes are rejected, so is a path that climbs above the asset space, and the
 * result must be one of `assets` (the copied icon folders), so nothing else can be reached (T-32.11).
 * shortcut: ".." is allowed inside the asset space because the generated Zed (Default) JSON points at ../../zed-icons.
 */
export function resolveAsset(root: string, path: unknown, assets: ReadonlySet<string>): string | undefined {
  if (typeof path !== "string" || path.includes("\\") || path.includes("\0") || /^\/|^[a-z][a-z0-9+.-]*:/i.test(path)) return undefined;
  const parts = root.split("/").filter(Boolean);
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") { if (!parts.pop()) return undefined; } else parts.push(part);
  }
  const resolved = parts.join("/");
  return assets.has(resolved) ? resolved : undefined;
}

const stringMap = (value: unknown): Map<string, string> =>
  new Map(Object.entries(record(value)).filter((e): e is [string, string] => typeof e[1] === "string"));

/** Every valid icon theme of every source, in selector order (T-21.3, same as themes). Bad files and themes are skipped. */
export function buildIconThemes(sources: IconSource[], assets: ReadonlySet<string>): IconTheme[] {
  const seen = new Set<string>();
  const out: IconTheme[] = [];
  const asset = (root: string, value: unknown) => resolveAsset(root, value, assets);
  const dir = (root: string, value: unknown): Dir => {
    const d = record(value);
    return { collapsed: asset(root, d.collapsed), expanded: asset(root, d.expanded) };
  };
  for (const { json, root } of sources) {
    let file: Record<string, unknown>;
    try { file = record(JSON.parse(json)); } catch { continue; }
    if (!Array.isArray(file.themes)) continue;
    for (const entry of file.themes) {
      const t = record(entry);
      if (typeof t.name !== "string" || !t.name || seen.has(t.name) || (t.appearance !== "light" && t.appearance !== "dark")) continue;
      seen.add(t.name);
      const icons = new Map<string, string>();
      for (const [key, value] of Object.entries(record(t.file_icons))) {
        const path = asset(root, record(value).path);
        if (path) icons.set(key, path);
      }
      out.push({
        name: t.name, appearance: t.appearance, dir: dir(root, t.directory_icons),
        namedDirs: new Map(Object.entries(record(t.named_directory_icons)).map(([name, value]) => [name, dir(root, value)])),
        stems: stringMap(t.file_stems), suffixes: stringMap(t.file_suffixes), icons,
      });
    }
  }
  return selectorOrder(out);
}

/** The theme to draw with: the named one, else Zed (Default) (T-32.19); undefined when neither exists. */
const current = (list: IconTheme[], name: string) =>
  list.find((t) => t.name === name) ?? list.find((t) => t.name === ZED_DEFAULT_ICON_THEME);

/**
 * T-22.1-T-22.6: the icon key of a file name, then the asset path. A theme's tables sit on top of Zed (Default)'s
 * (T-32.10); a key the theme has no icon for falls back to Zed (Default); an undefined key (`bak` -> `backup`) or
 * no key at all gives the default file icon (K-17).
 */
export function fileIcon(list: IconTheme[], themeName: string, fileName: string): string | undefined {
  const theme = current(list, themeName);
  const zed = list.find((t) => t.name === ZED_DEFAULT_ICON_THEME);
  if (!theme) return undefined;
  const tables = [theme, ...(zed && zed !== theme ? [zed] : [])];
  // The merged tables (T-32.10): the theme's entry wins over Zed (Default)'s, stems before suffixes.
  const pick = (table: "stems" | "suffixes", name: string) => tables.map((t) => t[table].get(name)).find(Boolean);
  const find = (name: string) => pick("stems", name) ?? pick("suffixes", name);
  let key = find(fileName);
  // T-22.2: a.stories.tsx -> stories.tsx -> tsx (also .data.json -> data.json -> json, .bashrc -> bashrc)
  for (let rest = fileName; key === undefined && rest.includes("."); ) {
    rest = rest.slice(rest.indexOf(".") + 1);
    if (rest) key = find(rest);
  }
  // T-22.3: Dockerfile.prod -> Dockerfile
  const dot = fileName.indexOf(".");
  if (key === undefined && dot > 0) key = find(fileName.slice(0, dot));
  for (const name of [key, "default"]) {
    for (const t of tables) { const path = name === undefined ? undefined : t.icons.get(name); if (path) return path; }
  }
  return undefined;
}

/** T-22.7-T-22.10: named folder icon of the theme, of Zed (Default), then the plain folder icon of each. */
export function dirIcon(list: IconTheme[], themeName: string, folderName: string, expanded: boolean): string | undefined {
  const theme = current(list, themeName);
  const zed = list.find((t) => t.name === ZED_DEFAULT_ICON_THEME);
  if (!theme) return undefined;
  const side = (d: Dir | undefined) => (expanded ? d?.expanded : d?.collapsed);
  const name = folderName.trim();
  return side(theme.namedDirs.get(name)) ?? side(zed?.namedDirs.get(name)) ?? side(theme.dir) ?? side(zed?.dir);
}
