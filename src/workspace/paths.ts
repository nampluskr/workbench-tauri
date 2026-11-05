// A-28: the one way registered folder paths are written and compared.

type Split = { root: string; parts: string[] };

/** Drive root "D:\" or UNC root "\\server\share\", and the segments after it; null when not an absolute path. */
function split(path: string): Split | null {
  const drive = /^([A-Za-z]):\\(.*)$/.exec(path);
  const unc = /^\\\\([^\\]+)\\([^\\]+)(?:\\(.*))?$/.exec(path);
  let root: string;
  let rest: string;
  if (drive) {
    root = `${drive[1].toUpperCase()}:\\`; // A-28.4
    rest = drive[2];
  } else if (unc && unc[1] !== "." && unc[1] !== "?") {
    root = `\\\\${unc[1]}\\${unc[2]}\\`;
    rest = unc[3] ?? "";
  } else {
    return null; // relative, "C:foo", "\foo", device paths (A-28.6)
  }
  const parts: string[] = [];
  for (const segment of rest.split("\\")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return { root, parts };
}

/** A-28.1~A-28.6. Null means the path cannot be registered. */
export function normalizePath(raw: string): string | null {
  let path = raw.replaceAll("/", "\\"); // A-28.1
  if (path.startsWith("\\\\?\\UNC\\")) {
    path = "\\\\" + path.slice(8); // A-28.2
  } else if (path.startsWith("\\\\?\\")) {
    path = path.slice(4);
    if (!/^[A-Za-z]:\\/.test(path)) return null; // other \\?\ forms (devices, volumes) are not registered
  }
  const s = split(path);
  return s && s.root + s.parts.join("\\"); // A-28.3: a root keeps its "\", other paths lose it
}

/** A-28.5: normalized, case-insensitive. A path that does not normalize compares as it is. */
export const pathKey = (path: string): string => (normalizePath(path) ?? path).toLowerCase();

/** The folder's own name; a drive or share root is shown as the root itself. */
export function folderName(path: string): string {
  const s = split(path);
  return s ? (s.parts.at(-1) ?? s.root) : path;
}

/** The name of the folder just above (A-12.6): the root for a top-level folder, "" for a root. */
export function parentName(path: string): string {
  const s = split(path);
  if (!s || s.parts.length === 0) return "";
  return s.parts.at(-2) ?? s.root;
}

/** L-88: the title bar shows at most `max` characters of the name, then an ellipsis. */
export const truncateName = (name: string, max: number): string => (name.length > max ? name.slice(0, max) + "…" : name);

/** The last piece of a path. */
export const baseName = (path: string): string => path.slice(path.lastIndexOf("\\") + 1);

/** L-247: the path with the home folder written as `~` (compared without case). */
export function tildePath(path: string, home: string | null): string {
  if (home === null) return path;
  const [p, h] = [path.toLowerCase(), home.toLowerCase()];
  if (p === h) return "~";
  const prefix = h.endsWith("\\") ? h : h + "\\";
  return p.startsWith(prefix) ? "~\\" + path.slice(prefix.length) : path;
}
