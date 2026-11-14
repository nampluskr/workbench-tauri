import type { KeymapSection } from "../keymap/engine.ts";
import type { IconName } from "../shell/Icon.tsx";
import { folderName, pathKey } from "./paths.ts";

// core v0.8.2 I-3: the Welcome screen (Zed crates/workspace/src/welcome.rs) and its recent folders, without DOM.

/** Zed WelcomePage::render shows `.take(5)` recent projects. */
export const RECENT_MAX = 5;

/** Actions take no arguments here, so Zed's `["welcome::OpenRecentProject", index]` is one action per row. */
export const recentAction = (index: number): string => `welcome::OpenRecentProject${index + 1}`;
/** Ctrl-1 ~ Ctrl-5 open the recent folders, only with focus in the Welcome screen (Zed's `Welcome` key context). */
export const WELCOME_BINDINGS: KeymapSection[] = [{ context: "Welcome", bindings: Object.fromEntries(Array.from({ length: RECENT_MAX }, (_, i) => [`ctrl-${i + 1}`, recentAction(i)])) }];

/** An opened folder goes first; the same folder is in the list once; the oldest drop off past RECENT_MAX. */
export function addRecent(list: readonly string[], path: string): string[] {
  return [path, ...removeRecent(list, path)].slice(0, RECENT_MAX);
}
export const removeRecent = (list: readonly string[], path: string): string[] => list.filter((p) => pathKey(p) !== pathKey(path));
/** Zed's recent list leaves out projects whose path is gone: `exists[i]` is paths_exist's answer for `list[i]`. */
export const dropMissing = (list: readonly string[], exists: readonly boolean[]): string[] => list.filter((_, i) => exists[i] !== false);

/** Only with no folder open, and not over a tab of the folderless Pane (Settings JSON, Keymap, Extensions). */
export const showWelcome = (folderCount: number, hasTab: boolean): boolean => folderCount === 0 && !hasTab;

export type WelcomeRow = { icon: IconName; label: string; action: string; keys?: string[] };
export type WelcomeSection = { title: string; rows: WelcomeRow[] };

/** GET STARTED, and RECENT FOLDERS when there are any. `keysFor` reads the keymap, so a user binding shows. */
export function welcomeSections(recent: readonly string[], keysFor: (action: string) => string[] | undefined): WelcomeSection[] {
  const row = (icon: IconName, label: string, action: string): WelcomeRow => ({ icon, label, action, keys: keysFor(action) });
  return [
    { title: "Get Started", rows: [row("folder_open", "Open Folder", "workspace::Open"), row("settings", "Open Settings", "zed::OpenSettings")] },
    ...(recent.length ? [{ title: "Recent Folders", rows: recent.slice(0, RECENT_MAX).map((path, i) => row("folder", folderName(path), recentAction(i))) }] : []),
  ];
}

/** Up / Down over `count` rows, wrapping; from no selection (-1) Down takes the first row and Up the last. */
export const stepRow = (count: number, index: number, dir: 1 | -1): number =>
  count === 0 ? -1 : index < 0 ? (dir > 0 ? 0 : count - 1) : (index + dir + count) % count;
