import { createStore } from "solid-js/store";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { syntaxHighlighting } from "../syntax/highlight.ts";
import { editorExtensions } from "../editor/extensions.ts";
import { SAMPLE_CSS, SAMPLE_CSS_TITLE, SAMPLE_HTML, SAMPLE_TITLE } from "../editor/sample.ts";
import { moveTab, type Pane } from "./panes.ts";

// Views live outside Solid: one EditorView per tab, created once (R-1). Panes only
// hold tab ids, and the view's DOM node is re-attached when a tab changes pane.
export const views = new Map<string, EditorView>();
export const titles = new Map<string, string>();

function openTab(id: string, title: string, doc: string, extra: Extension = []): void {
  titles.set(id, title);
  views.set(id, new EditorView({ state: EditorState.create({ doc, extensions: [editorExtensions, extra] }) }));
}

openTab(SAMPLE_TITLE, SAMPLE_TITLE, SAMPLE_HTML, syntaxHighlighting("html"));
openTab(SAMPLE_CSS_TITLE, SAMPLE_CSS_TITLE, SAMPLE_CSS);

const [state, setState] = createStore<{ panes: Pane[] }>({
  panes: [
    { tabs: [SAMPLE_TITLE, SAMPLE_CSS_TITLE], active: SAMPLE_TITLE },
    { tabs: [], active: null },
  ],
});

export const panes = () => state.panes;

export function activate(pane: number, id: string): void {
  setState("panes", pane, "active", id);
}

export function moveToPane(id: string, from: number, to: number): void {
  const view = views.get(id)!;
  // Detaching the DOM resets scroll offsets; restore them after re-attaching.
  const snapshot = view.scrollSnapshot();
  setState("panes", moveTab(state.panes, id, from, to));
  view.dispatch({ effects: snapshot });
  view.focus();
}
