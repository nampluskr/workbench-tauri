import type { KeymapSection } from "../keymap/engine.ts";

export const EXTENSIONS_BINDINGS: KeymapSection[] = [
  { context: "Workspace", bindings: { "ctrl-shift-x": "zed::Extensions" } },
];
export const CATEGORIES = ["All", "Themes", "Icon Themes"] as const;
export const INSTALL_FILTERS = ["All", "Installed", "Not Installed"] as const;
export type Category = typeof CATEGORIES[number];
export type InstallFilter = typeof INSTALL_FILTERS[number];
export type Extension = { id: string; name: string; version: string; author: string; description: string; category: Exclude<Category, "All"> };

const text = (value: unknown): string => typeof value === "string" ? value : "";
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

/** Only copied assets are supplied here; installed Zed extensions are never scanned. */
export function bundledExtensions(themes: Record<string, string>, hasZedIcons: boolean): Extension[] {
  const rows: Extension[] = [];
  for (const [path, source] of Object.entries(themes).sort(([a], [b]) => a.localeCompare(b))) {
    let family: Record<string, unknown>;
    try { family = record(JSON.parse(source)); } catch { continue; }
    if (!Array.isArray(family.themes)) continue;
    for (const [index, value] of family.themes.entries()) {
      const theme = record(value);
      const name = text(theme.name);
      if (!name) continue;
      rows.push({ id: `${path}:${index}`, name, category: "Themes",
        version: text(theme.version) || text(family.version), author: text(theme.author) || text(family.author),
        description: text(theme.description) || text(family.description) });
    }
  }
  if (hasZedIcons) rows.push({ id: "zed-icons", name: "Zed (Default)", category: "Icon Themes", version: "", author: "", description: "" });
  return rows;
}

export function filterExtensions(rows: Extension[], search: string, category: Category, installed: InstallFilter): Extension[] {
  if (installed === "Not Installed") return [];
  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return rows.filter((row) => (category === "All" || category === row.category) &&
    words.every((word) => `${row.name} ${row.description} ${row.author}`.toLowerCase().includes(word)));
}

export const emptyExtensions = (search: string, installed: InstallFilter): string =>
  `No ${installed === "Installed" ? "installed " : installed === "Not Installed" ? "uninstalled " : ""}extensions${search.trim() ? ` that match "${search.trim()}"` : ""}`;
