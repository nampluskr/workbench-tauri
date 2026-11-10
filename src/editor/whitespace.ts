import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin, WidgetType, type DecorationSet, type ViewUpdate } from "@codemirror/view";

const space = Decoration.mark({ class: "cm-whitespace-space" });
const tab = Decoration.mark({ class: "cm-whitespace-tab" });

class LineBreakMark extends WidgetType {
  eq() { return true; }
  toDOM() {
    const el = document.createElement("span");
    el.className = "cm-whitespace-break";
    el.textContent = "↵";
    el.setAttribute("aria-hidden", "true");
    return el;
  }
}
const lineBreak = Decoration.widget({ widget: new LineBreakMark(), side: 1 });

function marks(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc;
  for (let pos = view.viewport.from; pos <= view.viewport.to;) {
    const line = doc.lineAt(pos);
    for (const match of line.text.matchAll(/[ \t]/g)) builder.add(line.from + match.index!, line.from + match.index! + 1, match[0] === " " ? space : tab);
    if (line.number < doc.lines) builder.add(line.to, line.to, lineBreak); // the last line has no break
    pos = line.to + 1;
  }
  return builder.finish();
}

/** Core v0.7 I-10: every space `·`, tab `→` and line break `↵` of the viewport lines, drawn by CSS and widgets only (the document text is untouched). */
export const renderWhitespace = [
  ViewPlugin.fromClass(class {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = marks(view); }
    update(update: ViewUpdate) { if (update.docChanged || update.viewportChanged) this.decorations = marks(update.view); }
  }, { decorations: (plugin) => plugin.decorations }),
  EditorView.theme({
    ".cm-whitespace-space, .cm-whitespace-tab": { position: "relative" },
    ".cm-whitespace-space::before, .cm-whitespace-tab::before": { position: "absolute", top: 0, left: 0, color: "var(--editor-invisible)", pointerEvents: "none" },
    ".cm-whitespace-space::before": { content: '"·"', right: 0, textAlign: "center" },
    ".cm-whitespace-tab::before": { content: '"→"' },
    ".cm-whitespace-break": { display: "inline-block", width: 0, overflow: "visible", color: "var(--editor-invisible)", pointerEvents: "none", userSelect: "none" },
  }),
];
