import { baseName } from "../workspace/paths.ts";

/** I-16: only the path under the open folder; outside files show their name. */
export function pathCrumb(root: string, path: string): string {
  const prefix = root.endsWith("\\") ? root : root + "\\";
  return path.toLowerCase().startsWith(prefix.toLowerCase()) ? path.slice(prefix.length) : baseName(path);
}
