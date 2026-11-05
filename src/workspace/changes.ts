import { baseName, pathKey } from "./paths.ts";
import { joinPath, parentOf, sortChildren, type Child } from "./tree.ts";

// Pure parts of following the disk (R-25): which folders to read again, which read folders are gone, how to replace a text.

/**
 * The read folders that a batch of changed paths touches: the folder of each path (its entry list changed) and the path
 * itself when it is a read folder (it may be what changed). A rename arrives as two paths, the old and the new; both
 * count. Paths outside the tree and folders never read are left out; the names come back as the listing spells them.
 */
export function eventDirs(root: string, paths: Iterable<string>, listed: Iterable<string>): string[] {
  const byKey = new Map<string, string>();
  for (const dir of listed) byKey.set(pathKey(dir), dir);
  const rootKey = pathKey(root);
  const out = new Set<string>();
  for (const raw of paths) {
    const key = pathKey(raw);
    if (key !== rootKey && !key.startsWith(rootKey.endsWith("\\") ? rootKey : rootKey + "\\")) continue;
    for (const candidate of [key, pathKey(parentOf(rootKey, key))]) {
      const dir = byKey.get(candidate);
      if (dir !== undefined) out.add(dir);
    }
  }
  return [...out];
}

/** Read folders (not the root) that their parent's fresh list no longer has; their state is to be forgotten. */
export function goneDirs(root: string, listing: ReadonlyMap<string, Child[]>): string[] {
  const gone: string[] = [];
  for (const dir of listing.keys()) {
    if (dir === root) continue;
    const parent = listing.get(parentOf(root, dir));
    if (parent && !parent.some((child) => child.is_dir && joinPath(parentOf(root, dir), child.name) === dir)) gone.push(dir);
  }
  return gone;
}

/** The one change that turns `before` into `after`: what is left after cutting the common start and end (never inside a surrogate pair). */
export function diffRange(before: string, after: string): { from: number; to: number; insert: string } {
  const max = Math.min(before.length, after.length);
  let start = 0;
  while (start < max && before.charCodeAt(start) === after.charCodeAt(start)) start++;
  if (start > 0 && isHigh(before.charCodeAt(start - 1))) start--;
  let end = 0;
  while (end < max - start && before.charCodeAt(before.length - 1 - end) === after.charCodeAt(after.length - 1 - end)) end++;
  if (end > 0 && isLow(before.charCodeAt(before.length - end))) end--;
  return { from: start, to: before.length - end, insert: after.slice(start, after.length - end) };
}
const isHigh = (c: number) => c >= 0xd800 && c <= 0xdbff;
const isLow = (c: number) => c >= 0xdc00 && c <= 0xdfff;

export const underOrSame = (dir: string, path: string): boolean => path === dir || path.startsWith(dir.endsWith("\\") ? dir : dir + "\\");

/**
 * The lists of the read folders after `from` became `to`: the item has its new name in the list of its folder (or moved
 * to the list of its new folder), and the lists read below it are kept under their new paths. A frame drawn between the
 * rename and the next read then shows the item where it is (R-25).
 */
export function followListing(root: string, listing: ReadonlyMap<string, Child[]>, from: string, to: string): Map<string, Child[]> {
  const next = new Map<string, Child[]>();
  for (const [dir, list] of listing) next.set(underOrSame(from, dir) ? to + dir.slice(from.length) : dir, list);
  const [oldParent, newParent] = [parentOf(root, from), parentOf(root, to)];
  const entry = listing.get(oldParent)?.find((child) => joinPath(oldParent, child.name) === from);
  if (entry) {
    next.set(oldParent, next.get(oldParent)!.filter((child) => child !== entry));
    const target = next.get(newParent);
    if (target) next.set(newParent, sortChildren([...target.filter((child) => joinPath(newParent, child.name) !== to), { name: baseName(to), is_dir: entry.is_dir }]));
  }
  return next;
}
