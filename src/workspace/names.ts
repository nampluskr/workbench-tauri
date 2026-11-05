// Names typed into the inline input (P-019~P-022, I-091, I-092): what Enter makes of the text, and the banner under the row.

export const WARN_WHITESPACE = "File or directory name contains leading or trailing whitespace.";
export const existsError = (name: string) => `File or directory '${name}' already exists at location. Please choose a different name.`;

export type Validation = { kind: "warning" | "error"; text: string };
/** What the input means once confirmed: path pieces under the parent, and whether the last one is a folder. */
export type Confirmed = { parts: string[]; isDir: boolean };

const isSep = (c: string) => c === "/" || c === "\\";
const trimEnd = (s: string, drop: (c: string) => boolean) => {
  let end = s.length;
  while (end > 0 && drop(s[end - 1])) end--;
  return s.slice(0, end);
};

const RESERVED = new Set(["CON", "PRN", "AUX", "NUL", ...Array.from({ length: 9 }, (_, i) => `COM${i + 1}`), ...Array.from({ length: 9 }, (_, i) => `LPT${i + 1}`)]);

/** Whether `p` can be one path piece on Windows: no separators, drive/stream colons, forbidden characters, device names, trailing dot. */
export function validComponent(p: string): boolean {
  if (p.trim() === "" || p === "." || p === ".." || p.endsWith(".")) return false;
  if ([...p].some((c) => isSep(c) || ":<>\"|?*".includes(c) || c.charCodeAt(0) < 0x20)) return false;
  return !RESERVED.has(p.split(".")[0].trimEnd().toUpperCase());
}

/**
 * P-022 Enter rules. A new item ending in `/` or `\` becomes a folder; trailing dots are all dropped (Windows); `a/b/c.rs`
 * is split into pieces so the folders in between are made; a rename is never split. Null means "keep the input open".
 */
export function confirmName(input: string, isNew: boolean, newIsDir: boolean): Confirmed | null {
  let s = input;
  let isDir = newIsDir;
  if (isNew && s !== "" && isSep(s[s.length - 1])) {
    isDir = true;
    s = trimEnd(s, isSep);
  }
  s = trimEnd(s, (c) => c === ".");
  if (s.trim() === "") return null;
  const parts = isNew ? s.split(/[/\\]/).filter((p) => p !== "") : [s];
  return parts.length > 0 && parts.every(validComponent) ? { parts, isDir } : null;
}

/** P-021, on every change: a name that is taken is an error, leading or trailing blanks a warning, else nothing. */
export function validationFor(input: string, last: string, taken: boolean): Validation | null {
  if (taken) return { kind: "error", text: existsError(last) };
  return input !== input.trim() ? { kind: "warning", text: WARN_WHITESPACE } : null;
}

/** P-019: a rename selects the name without its extension for a file, the whole name for a folder (a leading dot is not an extension). */
export function renameSelection(name: string, isDir: boolean): [number, number] {
  const dot = name.lastIndexOf(".");
  return [0, !isDir && dot > 0 ? dot : name.length];
}

/**
 * An Escape this soon after a composition ended is the IME's own: Microsoft's Korean IME ends the composition and then sends
 * an Escape with isComposing already false (measured, F-5). It cancels the composition only, not the row.
 */
// shortcut: a fixed window, not a measured one; a person cannot press a second key this fast. Widen it if an IME is slower.
export const COMPOSITION_END_ESCAPE_MS = 100;

/** R-20: while an IME composes, Enter and Escape belong to it; otherwise Enter confirms and Escape cancels. */
export function inputKeyAction(e: { key: string; isComposing: boolean; keyCode: number }, sinceCompositionEnd = Infinity): "commit" | "cancel" | null {
  if (e.isComposing || e.keyCode === 229) return null;
  if (e.key === "Escape") return sinceCompositionEnd < COMPOSITION_END_ESCAPE_MS ? null : "cancel";
  return e.key === "Enter" ? "commit" : null;
}
