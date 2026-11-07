// Picker logic without DOM (P-001, P-004, P-005): the modal in Picker.tsx and the theme pickers share it.

/** One modal's content and behavior; only these differ between Select Theme and Select Icon Theme (K-20). */
export type PickerConfig = {
  placeholder: string;
  items: readonly string[];
  /** The item that carries the check mark and is selected on open. */
  checked: string;
  /** Install button in the footer, right-aligned (P-010). */
  footer: { label: string; run: () => void };
  /** The selection moved to `item` (arrow keys, hover, a new first match): show it without saving. */
  preview: (item: string) => void;
  /** Enter or click on `item`. The modal is already closed. */
  confirm: (item: string) => void | Promise<void>;
  /** Closed without confirming (Escape, outside click, the same toggle key, the footer button): undo the preview. */
  revert: () => void;
};

export type Match = { item: string; positions: number[] };

const isWordStart = (text: string, at: number) => at === 0 || !/[\p{L}\p{N}]/u.test(text[at - 1]);

/**
 * Fuzzy filter: the query's letters (spaces ignored, case ignored) must appear in order. Best score first,
 * list order on ties; an empty query keeps the whole list. `positions` are the matched indexes, for the highlight.
 * shortcut: leftmost-greedy positions and a simple score, not Zed's fuzzy crate; exact tie order may differ.
 */
export function fuzzyFilter(items: readonly string[], query: string): Match[] {
  const needle = query.replace(/\s+/g, "").toLowerCase();
  if (!needle) return items.map((item) => ({ item, positions: [] }));
  const found: { match: Match; score: number; order: number }[] = [];
  items.forEach((item, order) => {
    const hay = item.toLowerCase();
    const positions: number[] = [];
    let from = 0;
    for (const ch of needle) {
      const at = hay.indexOf(ch, from);
      if (at < 0) return;
      positions.push(at);
      from = at + ch.length;
    }
    let score = -item.length * 0.01 - positions[0] * 0.1;
    positions.forEach((at, i) => {
      score += 1 + (i > 0 && at === positions[i - 1] + 1 ? 2 : 0) + (isWordStart(item, at) ? 3 : 0);
    });
    found.push({ match: { item, positions }, score, order });
  });
  return found.sort((a, b) => b.score - a.score || a.order - b.order).map((f) => f.match);
}

/** P-004: moving past either end wraps to the other. */
export const moveSelection = (length: number, index: number, direction: 1 | -1): number =>
  length === 0 ? 0 : (index + direction + length) % length;

type KeyLike = { key: string; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; metaKey: boolean; isComposing?: boolean };
export type PickerKey = "previous" | "next" | "first" | "last" | "confirm";

/**
 * P-005 as the built-in `menu` context binds it: Up, Ctrl-P, Shift-Tab previous; Down, Ctrl-N, Tab next;
 * Home and PageUp first; End and PageDown last; Enter confirm. Escape is the dialog's own cancel.
 * Ctrl-C is left to the input (copy): Zed's Editor context sits deeper than Picker and wins there.
 */
export function pickerKey(e: KeyLike): PickerKey | undefined {
  if (e.isComposing || e.altKey || e.metaKey) return undefined;
  const key = e.key.toLowerCase();
  if (e.ctrlKey) return e.shiftKey ? undefined : key === "p" ? "previous" : key === "n" ? "next" : undefined;
  switch (key) {
    case "arrowup": return e.shiftKey ? undefined : "previous";
    case "arrowdown": return e.shiftKey ? undefined : "next";
    case "tab": return e.shiftKey ? "previous" : "next";
    case "home": case "pageup": return e.shiftKey ? undefined : "first";
    case "end": case "pagedown": return e.shiftKey ? undefined : "last";
    case "enter": return e.shiftKey ? undefined : "confirm";
    default: return undefined;
  }
}
