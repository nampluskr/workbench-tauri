import type { KeymapSection } from "../keymap/engine.ts";

export const MAX_NAVIGATION_HISTORY_LEN = 1024;
export const NAV_BINDINGS: KeymapSection[] = [{ context: "Pane", bindings: { "alt-left": "pane::GoBack", "alt-right": "pane::GoForward" } }];

/** I-12: selected tabs only; entries retain tab identity across renames. */
export class NavHistory<T> {
  backward: T[] = [];
  forward: T[] = [];
  mode: "normal" | "back" | "forward" = "normal";
  private readonly changed: () => void;
  constructor(changed: () => void = () => {}) { this.changed = changed; }

  get canGoBack(): boolean { return this.backward.length > 0; }
  get canGoForward(): boolean { return this.forward.length > 0; }

  push(entry: T): void {
    const into = this.mode === "back" ? this.forward : this.backward;
    if (into.at(-1) !== entry) {
      if (into.length >= MAX_NAVIGATION_HISTORY_LEN) into.shift();
      into.push(entry);
    }
    if (this.mode === "normal") this.forward = [];
    this.changed();
  }

  pop(mode: "back" | "forward"): T | undefined {
    const entry = (mode === "back" ? this.backward : this.forward).pop();
    if (entry !== undefined) this.changed();
    return entry;
  }

  /** Closed tabs leave both stacks; the active tab is never the next destination. */
  retain(open: T[], active: T | undefined): void {
    this.backward = this.backward.filter((entry) => open.includes(entry));
    this.forward = this.forward.filter((entry) => open.includes(entry));
    if (this.mode === "normal") this.skipCurrent(active);
    this.changed();
  }

  skipCurrent(active: T | undefined): void {
    for (const stack of [this.backward, this.forward]) {
      while (stack.length && stack.at(-1) === active) stack.pop();
    }
    this.changed();
  }
}

export function navigateHistory<T>(nav: NavHistory<T>, mode: "back" | "forward", host: {
  here(): T | undefined;
  show(entry: T): boolean;
}): void {
  for (;;) {
    const entry = nav.pop(mode);
    if (entry === undefined) return;
    const here = host.here();
    if (entry === here) continue;
    nav.mode = mode;
    try {
      if (host.show(entry)) {
        if (here !== undefined) nav.push(here);
        nav.skipCurrent(entry);
        return;
      }
    } finally {
      nav.mode = "normal";
    }
  }
}
