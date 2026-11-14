import { Compartment, Facet, type Extension } from "@codemirror/state";
import { EditorView, ViewPlugin, gutter, highlightActiveLineGutter, lineNumbers } from "@codemirror/view";
import type { ContextNode } from "../keymap/engine.ts";
import { DEFAULTS } from "../settings/model.ts";
import { indentGuides } from "./indent-guides.ts";
import { renderWhitespace } from "./whitespace.ts";

/** Core v0.7 I-5 ~ I-7, I-10: how the editor body shows its text. Settings values, or the Ctrl+Alt+L / Alt+Z temporary ones. */
export type ViewOptions = { lineNumbers: boolean; wordWrap: boolean; indentGuides: boolean; renderWhitespace: boolean };

let options: ViewOptions = { lineNumbers: DEFAULTS.editor_line_numbers, wordWrap: DEFAULTS.editor_word_wrap, indentGuides: DEFAULTS.editor_indent_guides, renderWhitespace: DEFAULTS.editor_render_whitespace };

const markdown = Facet.define<boolean, boolean>({ combine: (values) => values.some(Boolean) });
const section = new Compartment();
const parts = (isMarkdown: boolean, o: ViewOptions): Extension => [
  // core v0.8.3 I-12: the empty gutter fills up to the text start (extensions.ts); it draws the active line's element only
  o.lineNumbers ? [lineNumbers(), highlightActiveLineGutter(), gutter({ class: "cm-gutter-fill" })] : EditorView.editorAttributes.of({ class: "cm-no-line-numbers" }), // I-27 inset: extensions.ts
  isMarkdown && o.wordWrap ? EditorView.lineWrapping : [], // I-7: code never wraps
  o.indentGuides ? indentGuides : [],
  o.renderWhitespace ? renderWhitespace : [],
];

// Every live view, shown or not, so a changed option and a changed line height reach a tab that is not on screen.
const views = new Set<EditorView>();
const track = ViewPlugin.define((view) => { views.add(view); return { destroy: () => void views.delete(view) }; });
export const eachView = (run: (view: EditorView) => void) => views.forEach(run);

export const viewOptionExtensions = (extension: string): Extension => {
  const isMarkdown = /^(md|markdown)$/.test(extension);
  return [markdown.of(isMarkdown), track, section.of(parts(isMarkdown, options))];
};

export function setViewOptions(next: ViewOptions): void {
  options = next;
  for (const view of views) view.dispatch({ effects: section.reconfigure(parts(view.state.facet(markdown), next)) });
}

export type ToggleOption = "lineNumbers" | "wordWrap";

/** I-6: Ctrl+Alt+L works in any focused editor; I-7: Alt+Z only in a Markdown editor (a code editor never wraps). */
export const toggleApplies = (stack: readonly ContextNode[], option: ToggleOption): boolean =>
  stack.some((node) => node.has("Editor") && (option === "lineNumbers" || node.has("extension=md") || node.has("extension=markdown")));
