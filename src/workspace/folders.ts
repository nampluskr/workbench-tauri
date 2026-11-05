import { folderName, parentName, pathKey } from "./paths.ts";

/** One registered folder. Keys other than these three belong to a newer app version and are kept as they are (A-20). */
export type Folder = { id: string; path: string; added_at: string; [extra: string]: unknown };

/** A-12.6: a name that two or more folders share gets the name of the folder above it appended. */
export function displayNames(paths: string[]): { name: string; parent: string }[] {
  const names = paths.map(folderName);
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

/** A-13.6: swap with the neighbor; unchanged at the ends. */
export function move(folders: Folder[], id: string, dir: 1 | -1): Folder[] {
  const from = folders.findIndex((f) => f.id === id);
  const to = from + dir;
  if (from < 0 || to < 0 || to >= folders.length) return folders;
  const next = [...folders];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** A-17.3: the keyboard cursor stops at the ends; from no cursor Down goes to the first and Up to the last. */
export function moveCursor(folders: Folder[], cursor: string | null, dir: 1 | -1): string | null {
  if (folders.length === 0) return null;
  const from = folders.findIndex((f) => f.id === cursor);
  if (from < 0) return (dir === 1 ? folders[0] : folders[folders.length - 1]).id;
  return folders[Math.min(folders.length - 1, Math.max(0, from + dir))].id;
}
