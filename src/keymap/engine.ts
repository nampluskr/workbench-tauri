// Keymap engine (D-4): context depth, null unbinding, chords, display-key lookup.
// Rules: 01-zed I-001, I-702, I-703, I-704. Zed keymap file loading (I-700) is out of scope.

export type Action = string | [name: string, args: unknown] | null; // null unbinds (I-703)
export type Source = "default" | "overlay" | "user";
export type ContextNode = ReadonlySet<string>;
export type Dispatch = { type: "match"; action: NonNullable<Action> } | { type: "pending" } | { type: "none" };

// Lower rank = higher priority. Only used to limit what a `null` may unbind (I-703).
const RANK: Record<Source, number> = { user: 0, overlay: 1, default: 2 };

type Entry = { strokes: string[]; action: Action; test: ((node: ContextNode) => boolean) | null; source: Source };

// --- keystroke normalization -------------------------------------------------

export type KeyEventLike = { key: string; code: string; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean };

const MODIFIER_KEYS = new Set(["Control", "Alt", "Shift", "Meta"]);
const NO_LOGICAL_KEY = new Set(["Process", "Unidentified", "Dead"]);

function keyName(e: KeyEventLike): string {
  // Numpad +/- are zoom keys too; recognise them even if `key` is odd.
  if (e.code === "NumpadAdd") return "+";
  if (e.code === "NumpadSubtract") return "-";
  // IME / non-Latin layouts: `key` is not ASCII, so use the physical key from `code`.
  if (NO_LOGICAL_KEY.has(e.key) || (e.key.length === 1 && e.key > "~")) {
    const m = /^(?:Key([A-Z])|Digit(\d))$/.exec(e.code);
    if (m) return (m[1] ?? m[2]).toLowerCase();
  }
  // Synthetic input may have an empty `code`; `key` alone decides.
  return e.key === " " ? "space" : e.key.toLowerCase().replace(/^arrow/, "");
}

/** Canonical stroke such as "ctrl-shift-p", or null for a bare modifier press. */
export function strokeOf(e: KeyEventLike): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null;
  const key = keyName(e);
  // A shifted symbol ("+" from Shift+=) already carries the shift.
  const shift = e.shiftKey && !(key.length === 1 && !/[a-z0-9]/.test(key));
  return [e.ctrlKey && "ctrl", e.altKey && "alt", shift && "shift", e.metaKey && "win", key].filter(Boolean).join("-");
}

/** Canonicalize a binding string: "Ctrl-K V" -> ["ctrl-k", "v"]. */
function parseKeys(keys: string): string[] {
  return keys.trim().split(/\s+/).map((stroke) => {
    const mods = new Set<string>();
    let rest = stroke.toLowerCase();
    for (let m; (m = /^(ctrl|alt|shift|win|cmd|meta|super)-(?=.)/.exec(rest)); rest = rest.slice(m[0].length)) {
      mods.add(m[1] === "cmd" || m[1] === "meta" || m[1] === "super" ? "win" : m[1]);
    }
    return ["ctrl", "alt", "shift", "win"].filter((m) => mods.has(m)).concat(rest).join("-");
  });
}

// --- context predicates ------------------------------------------------------

// shortcut: identifiers, `!`, `&&`, `||`, parentheses only; no `>` child or `key == value` (Zed has both). Add when a binding needs them.
function parsePredicate(source: string): (node: ContextNode) => boolean {
  const tokens = source.match(/&&|\|\||[!()]|[\w-]+/g) ?? [];
  let pos = 0;
  const or = (): ((n: ContextNode) => boolean) => {
    let left = and();
    while (tokens[pos] === "||") { pos++; const [l, r] = [left, and()]; left = (n) => l(n) || r(n); }
    return left;
  };
  const and = (): ((n: ContextNode) => boolean) => {
    let left = unary();
    while (tokens[pos] === "&&") { pos++; const [l, r] = [left, unary()]; left = (n) => l(n) && r(n); }
    return left;
  };
  const unary = (): ((n: ContextNode) => boolean) => {
    const t = tokens[pos++];
    if (t === "!") { const inner = unary(); return (n) => !inner(n); }
    if (t === "(") { const inner = or(); pos++; return inner; }
    if (!t || /^(&&|\|\||\))$/.test(t)) throw new Error(`bad context predicate: ${source}`);
    return (n) => n.has(t);
  };
  const result = or();
  if (pos !== tokens.length) throw new Error(`bad context predicate: ${source}`);
  return result;
}

/** Depth of the deepest stack node the predicate matches (1-based), 0 for no match. */
function depthOf(test: (node: ContextNode) => boolean, stack: ContextNode[]): number {
  for (let i = stack.length - 1; i >= 0; i--) if (test(stack[i])) return i + 1;
  return 0;
}

const sameAction = (a: Action, b: Action) => JSON.stringify(a) === JSON.stringify(b);

// --- keymap ------------------------------------------------------------------

export class Keymap {
  private entries: Entry[] = []; // registration order = tie-break order (I-702)

  add(source: Source, bindings: { keys: string; action: Action; context?: string }[]): void {
    for (const b of bindings) {
      this.entries.push({
        strokes: parseKeys(b.keys),
        action: b.action,
        test: b.context ? parsePredicate(b.context) : null,
        source,
      });
    }
  }

  /** Resolve the strokes typed so far against the context stack (root -> focused). */
  dispatch(strokes: string[], stack: ContextNode[]): Dispatch {
    const matches: { entry: Entry; depth: number; index: number }[] = [];
    let pending = false;
    this.entries.forEach((entry, index) => {
      // A binding without context counts as the deepest one (I-702).
      const depth = entry.test ? depthOf(entry.test, stack) : stack.length;
      if (entry.test && depth === 0) return;
      if (!entry.strokes.slice(0, strokes.length).every((s, i) => s === strokes[i])) return;
      if (entry.strokes.length === strokes.length) matches.push({ entry, depth, index });
      else if (entry.action !== null) pending = true;
    });
    // Deeper context first, then later registration (I-702).
    matches.sort((a, b) => b.depth - a.depth || b.index - a.index);
    // A `null` unbinds everything after it in this order whose source is not higher priority (I-703).
    let unbindFromRank = Infinity;
    for (const { entry } of matches) {
      if (entry.action === null) unbindFromRank = Math.min(unbindFromRank, RANK[entry.source]);
      else if (RANK[entry.source] < unbindFromRank) return { type: "match", action: entry.action };
    }
    return pending ? { type: "pending" } : { type: "none" };
  }

  /** Key shown in menus/tooltips for an action (I-704): the last binding of that exact action that is not shadowed here. */
  keyFor(action: Action, stack: ContextNode[]): string | undefined {
    let found: string | undefined;
    for (const entry of this.entries) {
      if (!sameAction(entry.action, action)) continue;
      const result = this.dispatch(entry.strokes, stack);
      if (result.type === "match" && sameAction(result.action, action)) found = entry.strokes.join(" ");
    }
    return found;
  }
}
