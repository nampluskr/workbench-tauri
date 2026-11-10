import { folderName, parentName, pathKey } from "./paths.ts";

/** One registered folder. Unknown keys belong to a newer app version and are kept as they are (A-20). */
export type Folder = { id: string; path: string; added_at: string; name?: string; [extra: string]: unknown };

export const SIDEBAR_BINDINGS = [{ context: "Sidebar", bindings: { "ctrl-f": "sidebar::Search" } }];
export const folderLabel = (folder: Folder): string => typeof folder.name === "string" && folder.name.trim() ? folder.name : folderName(folder.path);
export const filterFolders = (folders: Folder[], query: string): Folder[] => folders.filter((f) => folderLabel(f).toLowerCase().includes(query.toLowerCase()));

/** ORDER-11 U-1: search only the selected folder, or the first folder when none is selected. */
export function searchRoots(folders: Folder[], activeId: string | null): string[] {
  const folder = folders.find((f) => f.id === activeId) ?? folders[0];
  return folder ? [folder.path] : [];
}

export function folderNameParts(name: string, query: string): { text: string; match: boolean }[] {
  if (!query) return [{ text: name, match: false }];
  const parts = [];
  const lower = name.toLowerCase(), needle = query.toLowerCase();
  let from = 0;
  for (let at; (at = lower.indexOf(needle, from)) >= 0; from = at + query.length) {
    parts.push({ text: name.slice(from, at), match: false }, { text: name.slice(at, at + query.length), match: true });
  }
  parts.push({ text: name.slice(from), match: false });
  return parts;
}

export function rename(folders: Folder[], id: string, name: string): Folder[] {
  return folders.map((f) => f.id === id ? { ...f, name: name.trim() || undefined } : f);
}

/** A-12.6: a name that two or more folders share gets the name of the folder above it appended. */
export function displayNames(paths: string[], names = paths.map(folderName)): { name: string; parent: string }[] {
  const count = new Map<string, number>();
  for (const n of names) count.set(n.toLowerCase(), (count.get(n.toLowerCase()) ?? 0) + 1);
  return paths.map((p, i) => ({ name: names[i], parent: count.get(names[i].toLowerCase())! > 1 ? parentName(p) : "" }));
}

/** A-13.1, A-13.2, A-13.8: a new folder goes last and becomes active; one already registered is only activated. */
export function addOrActivate(folders: Folder[], path: string, make: () => Folder): { folders: Folder[]; activeId: string } {
  const key = pathKey(path);
  const existing = folders.find((f) => pathKey(f.path) === key);
  if (existing) return { folders, activeId: existing.id };
  const folder = make();
  return { folders: [...folders, folder], activeId: folder.id };
}

/** A-13.5: removing the active folder activates the one below it, else the one above, else none. */
export function remove(folders: Folder[], id: string, activeId: string | null): { folders: Folder[]; activeId: string | null } {
  const index = folders.findIndex((f) => f.id === id);
  if (index < 0) return { folders, activeId };
  const rest = folders.filter((f) => f.id !== id);
  return { folders: rest, activeId: activeId !== id ? activeId : ((rest[index] ?? rest[index - 1])?.id ?? null) };
}

/** R-10: drop at the target row's position, as for tabs in the same pane. */
export function move(folders: Folder[], id: string, target: string): Folder[] {
  const from = folders.findIndex((f) => f.id === id);
  const to = folders.findIndex((f) => f.id === target);
  if (from < 0 || to < 0 || from === to) return folders;
  const next = [...folders];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

/** A-17.3: the keyboard cursor stops at the ends; from no cursor Down goes to the first and Up to the last. */
export function moveCursor(folders: Folder[], cursor: string | null, dir: 1 | -1): string | null {
  if (folders.length === 0) return null;
  const from = folders.findIndex((f) => f.id === cursor);
  if (from < 0) return (dir === 1 ? folders[0] : folders[folders.length - 1]).id;
  return folders[Math.min(folders.length - 1, Math.max(0, from + dir))].id;
}
