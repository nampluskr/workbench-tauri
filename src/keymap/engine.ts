// Keymap rule engine (SPEC R-7, D-5). Implements the Zed rules from
// 02-INTERACTION, written from the spec text (no Zed code):
//  - I-001 chords: space-separated keystrokes are pressed in sequence.
//  - I-702 conflicts: deeper matching focus context wins; at equal depth the
//    binding registered later wins; a binding without context is deepest.
//  - I-703 unbinding (action null): disables lower-priority candidates of the
//    same keystrokes. Candidates are ordered by the I-702 rule (depth, then
//    registration); a null disables every candidate after it, even in a
//    shallower context, whose source rank is the same or lower. A shallower
//    null cannot disable a deeper binding (that binding comes first).
//    Source rank: user > base (VSCode overlay) > default; used only for null.
//    (Matches Zed's behaviour per 01-zed I-703 and the Phase 2 check; no Zed
//    code was copied.)
//  - I-704 displayed key: among bindings with the same action and arguments,
//    drop keys shadowed by another action in the current context; take the last.
import { matchesAt, parsePredicate, type ContextEntry, type Predicate } from "./context.ts";

export type Source = "default" | "base" | "user";
const RANK: Record<Source, number> = { default: 0, base: 1, user: 2 };

export interface BindingInput {
  /** Keystrokes, e.g. "ctrl-k v" (Zed format, lower case). */
  keys: string;
  /** Action name; null = unbind (I-703). */
  action: string | null;
  args?: unknown;
  context?: string;
  source?: Source;
}

interface Binding {
  keys: string[];
  action: string | null;
  args: unknown;
  context: string | null;
  predicate: Predicate | null;
  source: Source;
  order: number;
}

export type Resolution =
  | { kind: "action"; action: string; args: unknown; binding: { keys: string; context: string | null; source: Source } }
  | { kind: "pending"; prefix: string }
  | { kind: "none" };

const MOD_ORDER = ["ctrl", "alt", "shift", "super"];

/** Canonical keystroke: modifiers in a fixed order, then the key. */
export function normalizeKeystroke(ks: string): string {
  const parts = ks.trim().toLowerCase().split("-");
  // "ctrl--" (minus key) splits into [..., "", ""].
  let key = parts.pop() ?? "";
  if (key === "" && parts[parts.length - 1] === "") {
    parts.pop();
    key = "-";
  }
  const mods = MOD_ORDER.filter((m) => parts.includes(m));
  return [...mods, key].join("-");
}

function splitKeys(keys: string): string[] {
  return keys.trim().split(/\s+/).map(normalizeKeystroke);
}

/** Structural equality of JSON action arguments (object key order ignored). */
export function sameArgs(a: unknown, b: unknown): boolean {
  a = a ?? null;
  b = b ?? null;
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as unknown[];
    return a.length === bb.length && a.every((v, i) => sameArgs(v, bb[i]));
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const ak = Object.keys(ao);
  const bk = Object.keys(bo);
  return ak.length === bk.length && ak.every((k) => k in bo && sameArgs(ao[k], bo[k]));
}

export class Keymap {
  private bindings: Binding[] = [];
  private pending: string[] = [];

  add(...inputs: BindingInput[]): void {
    for (const b of inputs) {
      this.bindings.push({
        keys: splitKeys(b.keys),
        action: b.action,
        args: b.args ?? null,
        context: b.context ?? null,
        predicate: b.context ? parsePredicate(b.context) : null,
        source: b.source ?? "default",
        order: this.bindings.length,
      });
    }
  }

  clear(): void {
    this.bindings = [];
    this.pending = [];
  }

  pendingPrefix(): string {
    return this.pending.join(" ");
  }

  /** Depth of the deepest matching context (1-based); no context = path length (I-702). */
  private depth(b: Binding, path: ContextEntry[]): number {
    if (!b.predicate) return path.length;
    for (let i = path.length - 1; i >= 0; i--) if (matchesAt(b.predicate, path, i)) return i + 1;
    return 0;
  }

  /** Bindings for exactly `seq` that win after I-702/I-703, best first. */
  private candidates(seq: string[], path: ContextEntry[]) {
    const matching = this.bindings
      .filter((b) => b.keys.length === seq.length && b.keys.every((k, i) => k === seq[i]))
      .map((b) => ({ b, depth: this.depth(b, path) }))
      .filter((x) => x.depth > 0);
    // I-702 order: deeper first, then later registration first.
    matching.sort((p, q) => q.depth - p.depth || q.b.order - p.b.order);
    // I-703: walking that order, a null disables every later candidate (any
    // depth) whose source rank is the same or lower. A null is never a winner.
    const live: typeof matching = [];
    let nullRank = -1;
    for (const x of matching) {
      if (x.b.action === null) {
        nullRank = Math.max(nullRank, RANK[x.b.source]);
        continue;
      }
      if (RANK[x.b.source] <= nullRank) continue;
      live.push(x);
    }
    return live;
  }

  /** Resolve a complete keystroke sequence without touching the pending state. */
  resolveSequence(seq: string[], path: ContextEntry[]): Resolution {
    const norm = seq.map(normalizeKeystroke);
    const best = this.candidates(norm, path)[0];
    if (best && best.b.action !== null) {
      return {
        kind: "action",
        action: best.b.action,
        args: best.b.args,
        binding: { keys: best.b.keys.join(" "), context: best.b.context, source: best.b.source },
      };
    }
    // A prefix is pending only if a longer sequence starting with it still has
    // a live winner after I-703 (a chord unbound with null does not count).
    const longer = new Map<string, string[]>();
    for (const b of this.bindings) {
      if (b.keys.length > norm.length && norm.every((k, i) => b.keys[i] === k)) {
        longer.set(b.keys.join(" "), b.keys);
      }
    }
    const isPrefix = [...longer.values()].some((keys) => this.candidates(keys, path).length > 0);
    return isPrefix ? { kind: "pending", prefix: norm.join(" ") } : { kind: "none" };
  }

  /** Feed one keystroke (I-001 chord state machine). */
  press(keystroke: string, path: ContextEntry[]): Resolution {
    const ks = normalizeKeystroke(keystroke);
    if (this.pending.length) {
      const r = this.resolveSequence([...this.pending, ks], path);
      if (r.kind === "pending") {
        this.pending.push(ks);
        return r;
      }
      this.pending = [];
      if (r.kind === "action") return r;
      // Not a continuation: handle the key on its own.
    }
    const r = this.resolveSequence([ks], path);
    if (r.kind === "pending") this.pending = [ks];
    return r;
  }

  /** I-704: keystrokes to show for an action in the current context, or null. */
  displayKeys(action: string, args: unknown, path: ContextEntry[]): string | null {
    const same = this.bindings.filter(
      (b) => b.action === action && sameArgs(b.args, args) && this.depth(b, path) > 0,
    );
    for (let i = same.length - 1; i >= 0; i--) {
      const keys = same[i].keys;
      // Reachable through real input: each proper prefix must wait for the
      // next key (an exact match on a prefix runs that action instead).
      let reachable = true;
      for (let n = 1; n < keys.length && reachable; n++) {
        reachable = this.resolveSequence(keys.slice(0, n), path).kind === "pending";
      }
      if (!reachable) continue;
      const r = this.resolveSequence(keys, path);
      if (r.kind === "action" && r.action === action && sameArgs(r.args, args)) {
        return keys.join(" ");
      }
    }
    return null;
  }
}

/** Fallback when `code` is empty or unknown: derive the key from `key`. */
function keyFromKeyValue(k: string): string | null {
  if (/^[a-zA-Z0-9]$/.test(k)) return k.toLowerCase();
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(k)) return k.toLowerCase();
  const map: Record<string, string> = {
    "=": "=", "+": "=", "-": "-", ",": ",", ".": ".", "/": "/", "\\": "\\", ";": ";", "'": "'",
    "[": "[", "]": "]", "`": "`", " ": "space", Enter: "enter", Tab: "tab", Escape: "escape",
    Backspace: "backspace", Delete: "delete", Insert: "insert", Home: "home", End: "end",
    PageUp: "pageup", PageDown: "pagedown", ArrowLeft: "left", ArrowRight: "right",
    ArrowUp: "up", ArrowDown: "down",
  };
  return map[k] ?? null;
}

/** Zed-format keystroke for a DOM KeyboardEvent (layout-independent via `code`). */
export function keystrokeFromEvent(e: {
  key: string;
  code: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}): string | null {
  const code = e.code;
  let key: string | null = null;
  if (/^Key[A-Z]$/.test(code)) key = code.slice(3).toLowerCase();
  else if (/^Digit[0-9]$/.test(code)) key = code.slice(5);
  else if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) key = code.toLowerCase();
  else {
    const map: Record<string, string> = {
      Equal: "=",
      Minus: "-",
      NumpadAdd: "+",
      NumpadSubtract: "-",
      Comma: ",",
      Period: ".",
      Slash: "/",
      Backslash: "\\",
      Semicolon: ";",
      Quote: "'",
      BracketLeft: "[",
      BracketRight: "]",
      Backquote: "`",
      Space: "space",
      Enter: "enter",
      NumpadEnter: "enter",
      Tab: "tab",
      Escape: "escape",
      Backspace: "backspace",
      Delete: "delete",
      Insert: "insert",
      Home: "home",
      End: "end",
      PageUp: "pageup",
      PageDown: "pagedown",
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
    };
    key = map[code] ?? null;
  }
  if (key === null) key = keyFromKeyValue(e.key);
  if (key === null) return null; // modifier-only or unknown key
  const mods: string[] = [];
  if (e.ctrlKey) mods.push("ctrl");
  if (e.altKey) mods.push("alt");
  if (e.shiftKey) mods.push("shift");
  if (e.metaKey) mods.push("super");
  return [...mods, key].join("-");
}
