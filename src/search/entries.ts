import { pathCrumb } from "../editor/breadcrumbs.ts";
import { baseName } from "../workspace/paths.ts";

/** What `search_names` (name_search.rs) streams: name matches of files and folders. */
export type SearchEntry = { path: string; isDir: boolean };
export type SearchEvent = { kind: "entry"; entry: SearchEntry } | { kind: "done" | "limit" } | { kind: "error"; message: string };

/** U-22: the Open File picker lists the files among the Search results: icon name, name, path under the searched folder. */
export type FileRow = { path: string; name: string; rel: string };
export function fileRow(entry: SearchEntry, root: string): FileRow | null {
  return entry.isDir ? null : { path: entry.path, name: baseName(entry.path), rel: pathCrumb(root, entry.path) };
}
