import { convertFileSrc } from "@tauri-apps/api/core";
import DOMPurify from "dompurify";
import { csvTable } from "../editor/csv.ts";
import { blockAt, classifyLink, localImagePath, renderMarkdown, type LinkTarget } from "../editor/markdown.ts";
import { htmlSrcdoc } from "../editor/html.ts";
import { svgElement } from "../editor/svg.ts";
import type { PreviewKind } from "../editor/preview-kind.ts";
import { MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS } from "../spec/metrics.ts";
import { languages, loadSyntax } from "../syntax/assets.ts";
import { codeBlockHighlights } from "../syntax/document.ts";
import { previewSyntaxKeys } from "../theme/apply.ts";
import { syntaxClass } from "../theme/theme.ts";

// The body of a Markdown preview tab (R-11, D-10). Rendered with markdown-it, sanitized with DOMPurify (no script, no
// event attributes, no style attribute; data-line attributes stay), then put in the tab's element.
// I-3: images are rewritten while the sanitized tree is still inert: a local file (relative to the Markdown file, or absolute)
// goes through the asset protocol; an image of any URL scheme is removed, so no request and no broken-image box.

export type PreviewHooks = {
  kind: PreviewKind;
  text: () => string | null; // the source document now, null while it is not read yet
  sourcePath: () => string;
  /** I-084: a click on a block moves the source selection to its first line (0-based). */
  line: (line: number) => void;
  /** I-085 */
  link: (target: LinkTarget) => void;
};

/** I-7: the table of a CSV / TSV text, built with the DOM and textContent only (a cell is never read as HTML). Styled as a Markdown table. */
function csvNodes(text: string, delimiter: string): HTMLElement[] {
  const parsed = csvTable(text, delimiter);
  if (!parsed) return [];
  const table = document.createElement("table");
  table.className = "csv-table"; // cell line breaks show as breaks (I-7)
  const line = (parent: HTMLElement, cell: "th" | "td", values: string[]) => {
    const tr = parent.appendChild(document.createElement("tr"));
    for (const value of values) tr.appendChild(document.createElement(cell)).textContent = value;
  };
  line(table.createTHead(), "th", parsed.header);
  const body = table.createTBody();
  for (const row of parsed.rows) line(body, "td", row);
  if (!parsed.note) return [table];
  const note = document.createElement("p");
  note.textContent = parsed.note;
  return [table, note];
}

export type Preview = { element: HTMLElement; changed: () => void; cursor: (line: number) => void; dispose: () => void };

export function createPreview(hooks: PreviewHooks): Preview {
  const element = document.createElement("div");
  element.className = "markdown-preview";
  element.tabIndex = -1;
  element.dataset.keymapContext = "MarkdownPreview"; // I-045 / I-086
  const body = document.createElement("div");
  body.className = "markdown-body";
  element.append(body);
  // I-1: an HTML file is one sandboxed frame (allow-same-origin only: no script, form, popup or navigation, M-12) filling the tab.
  const frame = document.createElement("iframe");
  if (hooks.kind === "html") {
    element.classList.add("html-preview");
    frame.className = "html-frame";
    frame.setAttribute("sandbox", "allow-same-origin");
    body.append(frame);
  }
  let timer = 0;
  let lastLine = -1;
  let generation = 0;

  const render = () => {
    const text = hooks.text();
    if (text === null) return;
    if (hooks.kind === "html") {
      // The new document starts at the top: put the scroll back once it has loaded.
      const top = frame.contentWindow?.scrollY ?? 0;
      frame.addEventListener("load", () => frame.contentWindow?.scrollTo(0, top), { once: true });
      frame.srcdoc = htmlSrcdoc(text, hooks.sourcePath(), convertFileSrc);
      return;
    }
    if (hooks.kind === "svg") {
      // I-6: a file that is not an SVG shows a short note instead of a picture.
      const svg = svgElement(text);
      const note = document.createElement("p");
      note.textContent = "Not a valid SVG";
      body.replaceChildren(svg ?? note);
      return;
    }
    if (hooks.kind !== "markdown") {
      body.replaceChildren(...csvNodes(text, hooks.kind === "tsv" ? "\t" : ","));
      return;
    }
    const tree = DOMPurify.sanitize(renderMarkdown(text), { FORBID_ATTR: ["style"], ALLOW_DATA_ATTR: true, RETURN_DOM_FRAGMENT: true });
    for (const image of tree.querySelectorAll("img")) {
      const path = localImagePath(image.getAttribute("src") ?? "", hooks.sourcePath());
      if (path) image.setAttribute("src", convertFileSrc(path));
      else image.remove();
    }
    body.replaceChildren(tree);
    if (lastLine >= 0) highlight(lastLine, false);
    void colorCodeBlocks(++generation);
  };

  /** K-53: fenced code blocks get the editor's syntax colours after the render (class only, built with the DOM, not HTML). */
  async function colorCodeBlocks(id: number): Promise<void> {
    for (const code of body.querySelectorAll<HTMLElement>("pre > code[class*='language-']")) {
      const name = /(?:^|\s)language-(\S+)/.exec(code.className)?.[1];
      const text = code.textContent ?? "";
      if (!name) continue;
      const found = await codeBlockHighlights(name, text, languages, loadSyntax, previewSyntaxKeys).catch(() => []);
      if (id !== generation || !code.isConnected) return; // a newer render replaced these blocks
      let at = 0;
      const nodes: (string | HTMLElement)[] = [];
      for (const span of found) {
        if (span.from > at) nodes.push(text.slice(at, span.from));
        const el = document.createElement("span");
        el.className = syntaxClass(span.key);
        el.textContent = text.slice(span.from, span.to);
        nodes.push(el);
        at = span.to;
      }
      if (found.length) code.replaceChildren(...nodes, text.slice(at));
    }
  }
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
    dispose: () => { clearTimeout(timer); generation++; },
  };
}
