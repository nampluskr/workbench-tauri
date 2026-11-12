import { isDirPath, parentOf, type Row } from "./tree.ts";

// Decisions of the file actions that need no disk: texts, which folder an action works in, which sources a paste runs.

/** P-015: the longest list of names a confirmation shows; the rest is counted. */
export const LIST_MAX = 10;

export type Prompt = { title: string; main: string; content: string | null; okLabel: string };

/** A-14.7~A-14.9, P-015: the confirmation of Trash and Delete. The names go under the question, one per line. */
export function deletePrompt(names: string[], permanent: boolean, title: string): Prompt {
  const n = names.length;
  const question =
    n === 1
      ? permanent
        ? `Are you sure you want to permanently delete \`${names[0]}\`?`
        : `Do you want to trash \`${names[0]}\`?`
      : permanent
        ? `Are you sure you want to permanently delete the following ${n} files?`
        : `Do you want to trash the following ${n} files?`;
  const lines = n > 1 ? [...names.slice(0, LIST_MAX), ...(n > LIST_MAX ? [`.. ${n - LIST_MAX} files not shown`] : [])] : [];
  return {
    title,
    main: [question, ...lines].join("\n"),
    content: permanent ? "This cannot be undone." : null,
    okLabel: permanent ? "Delete" : "Trash",
  };
}

/** A-14.11. */
export const failureText = (permanent: boolean, failed: number, total: number): string =>
  `Failed to ${permanent ? "delete" : "trash"} ${failed} of ${total} file(s).`;

/** I-549: the path under the registered folder; the folder itself is its name; a path outside stays whole. */
export function relativePath(root: string, rootName: string, path: string): string {
  if (path === root) return rootName;
  const prefix = root.endsWith("\\") ? root : root + "\\";
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

/** The folder New File, New Folder and Paste work in: the selected folder, else the folder of the selected file, else the root. */
export function targetDir(root: string, rows: Row[], selected: string | null): string {
  if (selected === null) return root;
  return isDirPath(rows, selected) ? selected : parentOf(root, selected);
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * The sources a paste runs, in order. Cutting into the folder an item is already in does nothing; a folder never goes
 * into itself (its copy would never end). Those sources are returned as `refused` only when they cannot be pasted.
 */
export function pasteJobs(sources: string[], dir: string, cut: boolean, root: string): { run: string[]; refused: string[] } {
  const run: string[] = [];
  const refused: string[] = [];
  for (const src of sources) {
    if (cut && same(parentOf(root, src), dir)) continue; // already there: nothing to do, nothing failed
    const inside = same(src, dir) || dir.toLowerCase().startsWith(src.toLowerCase().replace(/\\?$/, "\\"));
    (inside ? refused : run).push(src);
  }
  return { run, refused };
}


/**
 * I-3: what a tree drag carries when `pressed` is pressed: the marked items when it is among them, else it alone (Zed
 * DraggedSelection::items). The root does not move, and an item inside another carried folder goes with that folder
 * (Zed disjoint_entries).
 */
export function dragItems(root: string, marked: string[], pressed: string): string[] {
  const items = (marked.includes(pressed) ? marked : [pressed]).filter((p) => p !== root);
  return items.filter((p) => !items.some((q) => q !== p && p.toLowerCase().startsWith(q.toLowerCase().replace(/\\?$/, "\\"))));
}

/**
 * I-3: the items a drop into `dir` moves (or copies, Ctrl): none for an item itself, its own folders, or (a move) the folder
 * it is already in. The tree shows a drop place only while this is not empty for a move.
 */
export const dropJobs = (items: string[], dir: string, copy: boolean, root: string): string[] => pasteJobs(items, dir, !copy, root).run;

/** I-3: Zed explain_move_error's text when the moved item's name is taken in the target folder (it is not overwritten). */
export const moveTakenText = (from: string, to: string): string => `Failed to move \`${from}\` to \`${to}\`. A file or folder already exists there.`;
