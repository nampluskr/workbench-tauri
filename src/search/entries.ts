import { pathCrumb } from "../editor/breadcrumbs.ts";
import { baseName } from "../workspace/paths.ts";

/** What `search_names` (name_search.rs) streams: name matches of files and folders. */
export type SearchEntry = { path: string; isDir: boolean; size?: number; modified?: number | null }; // bytes; ms since the epoch
export type SearchEvent = { kind: "entry"; entry: SearchEntry } | { kind: "done" | "limit" } | { kind: "error"; message: string };

/** core v0.8.3 I-26, the Path cell: the folder the entry is in, under the searched folder (empty for the folder itself). */
export function entryDir(root: string, path: string): string {
  const rel = pathCrumb(root, path);
  return rel.slice(0, Math.max(0, rel.lastIndexOf("\\")));
}

/** core v0.8.3 I-26, the Size cell: whole bytes under 1 KB, whole KB (rounded down) under 1 MB, then MB with one decimal; 1 KB = 1024 B. A folder has none. */
export function sizeText(entry: SearchEntry): string {
  const bytes = entry.size;
  if (entry.isDir || bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.floor(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** core v0.8.3 I-26, the Modified cell: `YYYY-MM-DD HH:mm` in local time; empty when the time could not be read. */
export function modifiedText(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "";
  const date = new Date(ms), two = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())} ${two(date.getHours())}:${two(date.getMinutes())}`;
}

/** U-22: the Open File picker lists the files among the Search results: icon name, name, path under the searched folder. */
export type FileRow = { path: string; name: string; rel: string };
export function fileRow(entry: SearchEntry, root: string): FileRow | null {
  return entry.isDir ? null : { path: entry.path, name: baseName(entry.path), rel: pathCrumb(root, entry.path) };
}
