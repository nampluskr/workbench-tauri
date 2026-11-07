import { createSignal } from "solid-js";
import { buildIconThemes, type IconSource } from "./icon-themes.ts";

// Copied icons (core D-8/D-9, .gitignore folders; tools/fetch-zed-icons.ps1 and fetch-zed-themes.ps1). Missing copies
// give empty globs: those themes drop out of the list. Asset paths below are relative to src/assets/.
// Zed (Default) icons are drawn in the icon color (raw SVG); Catppuccin ones keep their own colors (T-20.7, T-31.8).
// "?no-inline": the CSP has no data: in img-src.
const zedSvgs = import.meta.glob<string>("../assets/zed-icons/file_icons/*.svg", { query: "?raw", import: "default", eager: true });
const imageUrls = import.meta.glob<string>("../assets/icon-themes/catppuccin-icons/icons/**/*.svg", { query: "?no-inline", import: "default", eager: true });
const jsons = import.meta.glob<string>("../assets/icon-themes/**/*.json", { query: "?raw", import: "default", eager: true });

const ASSETS = "../assets/";
const virtual = (path: string) => path.slice(ASSETS.length);
export type IconAsset = { kind: "svg"; text: string } | { kind: "image"; url: string };
const assets = new Map<string, IconAsset>([
  ...Object.entries(zedSvgs).map(([p, text]): [string, IconAsset] => [virtual(p), { kind: "svg", text }]),
  ...Object.entries(imageUrls).map(([p, url]): [string, IconAsset] => [virtual(p), { kind: "image", url }]),
]);

// A theme JSON under icon_themes/ is relative to the extension root (its parent); any other is relative to its folder.
const sources: IconSource[] = Object.entries(jsons).map(([path, json]) => {
  const file = virtual(path);
  const inExtension = /\/icon_themes\/[^/]+$/.test(file);
  return { json, root: file.replace(inExtension ? /\/icon_themes\/[^/]+$/ : /\/[^/]+$/, "") };
});

export const iconThemes = buildIconThemes(sources, new Set(assets.keys()));
export const iconThemeNames = iconThemes.map((t) => t.name);
export const assetOf = (path: string): IconAsset | undefined => assets.get(path);

/** The icon theme being drawn: the saved setting, or the one a picker is previewing. */
export const [appliedIconTheme, setAppliedIconTheme] = createSignal("Zed (Default)");
