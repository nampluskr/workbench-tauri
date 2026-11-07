import { buildRegistry } from "./registry.ts";

// One glob for every theme file: committed `one/` plus the .gitignore copies (tools/fetch-zed-themes.ps1).
// shortcut: raw text is bundled and parsed once at startup (~340 KB); switch to lazy per-file imports if themes grow large.
export const themeFiles = import.meta.glob<string>("./assets/**/*.json", { query: "?raw", import: "default", eager: true });
export const registry = buildRegistry(themeFiles);
export const themeNames = registry.map((t) => t.name);
