import { CONFIRM_CLOSE_PATH_MAX_CHARS } from "../spec/metrics.ts";
import type { Doc, SaveError } from "./doc.ts";

// Saving and closing with questions (R-4, R-6, R-7, D-6). The questions are TaskDialogs; `ask` gives the index of the
// chosen button, the last one being Cancel (also when the dialog could not be shown). No Tauri here, so it is testable.

export type Ask = (main: string, content: string | null, buttons: string[]) => Promise<number>;
/** A tab as the questions see it: its file and its path relative to the folder (E-081). */
export type Closing = { doc: Doc; label: string };

/** shortcut: app constant, not a spec ID (gpui src/ui/metrics.rs timing). Make it a setting if people ask for one. */
export const CLOSE_SAVE_WAIT_LIMIT_MS = 10_000;

/** E-081: the path keeps its end, cut at the front to the limit (the ellipsis counts). */
export function shortPath(path: string, max = CONFIRM_CLOSE_PATH_MAX_CHARS): string {
  const chars = [...path];
  return chars.length <= max ? path : "…" + chars.slice(chars.length - (max - 1)).join("");
}

export const saveErrorText = (error: SaveError): string =>
  `Unable to save file: ${
    error.kind === "unmappable"
      ? `these characters cannot be saved in CP949: ${Array.isArray(error.chars) ? error.chars.join(" ") : error.chars}`
      : error.message + (error.kept_tmp ? ` The new contents are kept in ${error.kept_tmp}` : "")
  }`; // E-083

export type Saved = "saved" | "skipped" | "cancelled" | "close" | { failed: SaveError };

/**
 * Ctrl+S on one tab (I-005). Deleted on disk asks E-085, a conflict asks E-084, a clean tab is not written (D-4).
 * "close": E-085 Close was chosen; the caller closes the tab.
 */
export async function saveDoc(doc: Doc, ask: Ask): Promise<Saved> {
  if (!doc.base) return "skipped"; // never read: there is nothing to save back
  if (doc.disk === "deleted") {
    const answer = await ask("This file has been deleted on disk since you started editing it. Do you want to recreate it?", null, ["Save", "Close", "Cancel"]);
    if (answer === 1) return "close";
    if (answer !== 0) return "cancelled";
  } else if (doc.disk === "conflict") {
    const answer = await ask("This file has changed on disk since you started editing it. Do you want to overwrite it?", null, ["Overwrite", "Discard Edits", "Cancel"]);
    if (answer === 1) {
      await doc.read(true);
      return "skipped";
    }
    if (answer !== 0) return "cancelled";
  } else if (!doc.dirty) {
    return "skipped";
  }
  const result = await doc.write();
  return result.ok ? "saved" : { failed: result.error };
}

/** core v0.8.3 I-7: Close Others / Close All close folder by folder, each asking as it does alone; the first one kept (Cancel) stops, so the ones after it stay too. */
export async function closeEach<T>(items: T[], close: (item: T) => Promise<boolean>): Promise<void> {
  for (const item of items) if (!(await close(item))) return;
}

const timeout = (ms: number) => new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms));

/**
 * R-6: may these tabs close? One modified tab asks E-081, several E-082; Save writes each first. A failed save asks E-083,
 * a save that does not end within the wait limit or a tab edited again while it saved keeps the tabs open (D-6).
 */
export async function confirmClose(tabs: Closing[], ask: Ask, waitMs = CLOSE_SAVE_WAIT_LIMIT_MS): Promise<boolean> {
  const dirty = tabs.filter((t) => t.doc.dirty);
  if (dirty.length === 0) return true;
  const answer =
    dirty.length === 1
      ? await ask(`\`${shortPath(dirty[0].label)}\` contains unsaved edits. Do you want to save it?`, null, ["Save", "Don't Save", "Cancel"])
      : await ask("Do you want to save changes to the following files?", dirty.map((t) => t.label).join("\n"), ["Save all", "Discard all", "Cancel"]);
  if (answer === 1) return true;
  if (answer !== 0) return false;
  for (const { doc } of dirty) {
    const saved = await Promise.race([saveDoc(doc, ask), timeout(waitMs)]);
    if (saved === "timeout" || saved === "cancelled") return false;
    if (typeof saved === "object") {
      if ((await ask(saveErrorText(saved.failed), null, ["Close Without Saving", "Cancel"])) !== 0) return false;
      continue;
    }
    if (saved !== "close" && doc.dirty) return false; // edited again while it was saved
  }
  return true;
}
