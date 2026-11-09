import { EditorView } from "@codemirror/view";
import { EDITOR_UNDO_GROUP_INTERVAL_MS } from "../spec/metrics.ts";

const pending = new WeakMap<HTMLElement, { text: string; until: number; composition: boolean }>();

/** A handled IME shortcut may still emit one non-cancelable composition character. */
export function rememberImeShortcut(event: KeyboardEvent, stroke: string): void {
  if (event.key !== "Process" || !(event.ctrlKey || event.altKey)) return;
  const content = event.target instanceof Element ? event.target.closest<HTMLElement>(".cm-content") : null;
  const text = stroke.replace(/^(?:(?:ctrl|alt|shift|win)-)+/, "");
  if (content && text.length === 1) {
    // Bound the one-shot guard by the existing short editor input grouping interval.
    pending.set(content, { text, until: Date.now() + EDITOR_UNDO_GROUP_INTERVAL_MS, composition: false });
  }
}

export const imeShortcutInput = [
  EditorView.domEventObservers({ beforeinput(event, view) {
    const input = pending.get(view.contentDOM);
    if (!input) return;
    if (event.inputType === "insertCompositionText" && event.data === input.text) input.composition = true;
    else pending.delete(view.contentDOM);
  } }),
  EditorView.inputHandler.of((view, _from, _to, text) => {
    const input = pending.get(view.contentDOM);
    pending.delete(view.contentDOM);
    return !!input && input.composition && Date.now() <= input.until && text === input.text;
  }),
];
