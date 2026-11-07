import type { KeymapSection } from "../keymap/engine.ts";
import { pathKey } from "./paths.ts";

// I-10: a Pane's Go Back / Go Forward history, after Zed's NavHistory (workspace/src/pane.rs) and the editor's jump rule.
// An entry is a place in a file: path and 1-based line and column. An entry whose tab was closed is reopened from its path.

/** pane.rs:323 MAX_NAVIGATION_HISTORY_LEN. */
export const MAX_NAVIGATION_HISTORY_LEN = 1024;
/** editor.rs:307 MIN_NAVIGATION_HISTORY_ROW_DELTA: a cursor move records the place it left only when it crossed this many rows. */
export const MIN_NAVIGATION_HISTORY_ROW_DELTA = 10;

export type NavEntry = { path: string; line: number; column: number };
/** normal: a new place (clears Forward). back / forward: the place being left while that stack is popped goes to the other stack. */
export type NavMode = "normal" | "back" | "forward";

/** navigation.rs:1567: moves of fewer rows (or none) are not recorded. */
export const isFarJump = (fromLine: number, toLine: number): boolean => Math.abs(toLine - fromLine) >= MIN_NAVIGATION_HISTORY_ROW_DELTA;

// pane.rs "Zed default-windows.json Pane context" (lines 518 / 521); the tab bar buttons show these keys.
export const NAV_BINDINGS: KeymapSection[] = [{ context: "Pane", bindings: { "alt-left": "pane::GoBack", "alt-right": "pane::GoForward" } }];

export class NavHistory {
  backward: NavEntry[] = [];
  forward: NavEntry[] = [];
  mode: NavMode = "normal";
  private readonly changed: () => void;
  constructor(changed: () => void = () => {}) { this.changed = changed; }

  get canGoBack(): boolean { return this.backward.length > 0; }
  get canGoForward(): boolean { return this.forward.length > 0; }

  /** pane.rs:4893 push: the same place (file and row) is not kept twice in the stack it goes to. */
  push(entry: NavEntry): void {
    const same = (e: NavEntry) => pathKey(e.path) === pathKey(entry.path) && e.line === entry.line;
    const into = this.mode === "back" ? this.forward : this.backward;
    const kept = into.filter((e) => !same(e));
    if (kept.length >= MAX_NAVIGATION_HISTORY_LEN) kept.shift();
    kept.push(entry);
    if (this.mode === "back") this.forward = kept;
    else this.backward = kept;
    if (this.mode === "normal") this.forward = [];
    this.changed();
  }

  pop(mode: "back" | "forward"): NavEntry | undefined {
    const entry = (mode === "back" ? this.backward : this.forward).pop();
    if (entry) this.changed();
    return entry;
  }

  /** A split's new Pane starts with a copy (pane.rs fork_nav_history). */
  copyFrom(other: NavHistory): void {
    this.backward = [...other.backward];
    this.forward = [...other.forward];
    this.changed();
  }

  /** pane.rs remove_item: a deleted file leaves the history. */
  removePath(path: string): void {
    const keep = (e: NavEntry) => pathKey(e.path) !== pathKey(path);
    this.backward = this.backward.filter(keep);
    this.forward = this.forward.filter(keep);
    this.changed();
  }
}

/** What a Pane gives the walk below (workspace.rs:3269 navigate_history_impl). */
export type NavHost = {
  /** The cursor place of the active tab when it is a file tab; the place Go Back / Forward leaves. */
  here(): NavEntry | undefined;
  /** Activate the tab of `entry.path` (or open the file again from its path) and put the cursor there. True when anything changed. */
  show(entry: NavEntry): boolean;
};

/**
 * Pop entries of the stack until one moves something: an entry that is the place we already are at is dropped and the next
 * one is tried. The place being left is recorded on the opposite stack each time, like Zed's `deactivated` does in GoingBack
 * / GoingForward mode.
 */
export function navigateHistory(nav: NavHistory, mode: "back" | "forward", host: NavHost): void {
  for (;;) {
    const entry = nav.pop(mode);
    if (!entry) return;
    nav.mode = mode;
    try {
      const here = host.here();
      if (here) nav.push(here);
      if (host.show(entry)) return;
    } finally {
      nav.mode = "normal";
    }
  }
}
