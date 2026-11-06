import DOMPurify from "dompurify";
import { blockAt, classifyLink, renderMarkdown, type LinkTarget } from "../editor/markdown.ts";
import { MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS } from "../spec/metrics.ts";

// The body of a Markdown preview tab (R-11, D-10). Rendered with markdown-it, sanitized with DOMPurify (no script, no
// event attributes, no style attribute; data-line attributes stay), then put in the tab's element.
// shortcut: images stay invisible: CSP img-src only allows the app and extension schemes (S-9). Widen it, with
// approval, if documents with images must show them.

export type PreviewHooks = {
  text: () => string | null; // the source document now, null while it is not read yet
  sourcePath: () => string;
  /** I-084: a click on a block moves the source selection to its first line (0-based). */
  line: (line: number) => void;
  /** I-085 */
  link: (target: LinkTarget) => void;
};

export type Preview = { element: HTMLElement; changed: () => void; cursor: (line: number) => void; dispose: () => void };

export function createPreview(hooks: PreviewHooks): Preview {
  const element = document.createElement("div");
  element.className = "markdown-preview";
  element.tabIndex = -1;
  element.dataset.keymapContext = "MarkdownPreview"; // I-045 / I-086
  const body = document.createElement("div");
  body.className = "markdown-body";
  element.append(body);
  let timer = 0;
  let lastLine = -1;

  const render = () => {
    const text = hooks.text();
    if (text === null) return;
    body.innerHTML = DOMPurify.sanitize(renderMarkdown(text), { FORBID_ATTR: ["style"], ALLOW_DATA_ATTR: true });
    if (lastLine >= 0) highlight(lastLine, false);
  };
  const blocks = () => [...body.querySelectorAll<HTMLElement>("[data-line]")];

  /** I-083: the block holding the source cursor is marked, and scrolled into view when it is not. */
  function highlight(line: number, scroll: boolean): void {
    lastLine = line;
    const list = blocks();
    const at = blockAt(list.map((el) => ({ start: Number(el.dataset.line), end: Number(el.dataset.lineEnd) })), line);
    for (const el of body.querySelectorAll(".active-block")) el.classList.remove("active-block");
    const el = list[at];
    if (!el) return;
    el.classList.add("active-block");
    if (scroll) el.scrollIntoView({ block: "nearest" });
  }

  element.addEventListener("click", (e) => {
    const a = (e.target as Element).closest("a");
    if (a) {
      e.preventDefault();
      const href = a.getAttribute("href");
      if (href) hooks.link(classifyLink(href, hooks.sourcePath(), e.altKey));
      return;
    }
    const block = (e.target as Element).closest<HTMLElement>("[data-line]");
    if (block) hooks.line(Number(block.dataset.line));
  });

  render();
  return {
    element,
    // I-082: a change re-renders after the parse debounce; one already waiting is not scheduled again.
    changed: () => {
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        render();
      }, MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS);
    },
    cursor: (line) => highlight(line, true),
    dispose: () => clearTimeout(timer),
  };
}
