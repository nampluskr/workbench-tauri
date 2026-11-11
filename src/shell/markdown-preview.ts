import { convertFileSrc } from "@tauri-apps/api/core";
import DOMPurify from "dompurify";
import { csvTable } from "../editor/csv.ts";
import { blockAt, classifyLink, localImagePath, renderMarkdown, type LinkTarget } from "../editor/markdown.ts";
import { htmlSrcdoc } from "../editor/html.ts";
import { NOTEBOOK_HTML_FORBID_ATTR, NOTEBOOK_HTML_FORBID_TAGS, parseNotebook, type NotebookOutput } from "../editor/notebook.ts";
import { svgElement } from "../editor/svg.ts";
import type { PreviewKind } from "../editor/preview-kind.ts";
import { MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS } from "../spec/metrics.ts";
import { languages, loadSyntax } from "../syntax/assets.ts";
import { codeBlockHighlights } from "../syntax/document.ts";
import { onPreviewThemeChange, previewAppearance, previewColors, previewSyntaxKeys } from "../theme/apply.ts";
import { syntaxClass } from "../theme/theme.ts";
import { drawMath, drawMermaid } from "./rich-blocks.ts";

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

/** Markdown text as a sanitized tree: images are local files through the asset protocol (I-3), any other image is removed. */
function markdownTree(text: string, sourcePath: string): DocumentFragment {
  const tree = DOMPurify.sanitize(renderMarkdown(text), { FORBID_ATTR: ["style"], ALLOW_DATA_ATTR: true, RETURN_DOM_FRAGMENT: true });
  for (const image of tree.querySelectorAll("img")) {
    const path = localImagePath(image.getAttribute("src") ?? "", sourcePath);
    if (path) image.setAttribute("src", convertFileSrc(path));
    else image.remove();
  }
  return tree;
}

const makeNode = (tag: string, className: string, text?: string): HTMLElement => {
  const el = document.createElement(tag);
  el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};

/** I-2: one output as DOM. Text is textContent; SVG and HTML are sanitized; a picture is a data: <img> (CSP allows data:). */
function outputNode(output: NotebookOutput): HTMLElement | null {
  switch (output.kind) {
    case "text": {
      const pre = makeNode("pre", output.stderr ? "nb-output nb-stderr" : "nb-output", output.text);
      return output.text ? pre : null;
    }
    case "image": {
      const wrap = makeNode("div", "nb-output");
      const img = wrap.appendChild(document.createElement("img"));
      img.src = output.src;
      return wrap;
    }
    case "svg": {
      const svg = svgElement(output.text);
      if (!svg) return outputNode({ kind: "hidden", mime: "image/svg+xml" });
      const wrap = makeNode("div", "nb-output");
      wrap.append(svg);
      return wrap;
    }
    case "html": {
      const wrap = makeNode("div", "nb-output nb-html");
      const tree = DOMPurify.sanitize(output.html, { FORBID_TAGS: NOTEBOOK_HTML_FORBID_TAGS, FORBID_ATTR: NOTEBOOK_HTML_FORBID_ATTR, RETURN_DOM_FRAGMENT: true });
      // Only a picture inside the output itself is kept: any other src is a request.
      for (const image of tree.querySelectorAll("img")) if (!/^data:image\//i.test(image.getAttribute("src") ?? "")) image.remove();
      wrap.append(tree);
      return wrap;
    }
    case "error": {
      const wrap = makeNode("div", "nb-output nb-error");
      wrap.append(makeNode("div", "nb-error-title", output.title));
      if (output.traceback) wrap.append(makeNode("pre", "nb-traceback", output.traceback));
      return wrap;
    }
    case "hidden":
      return makeNode("p", "nb-hidden", `Output not shown (${output.mime})`);
  }
}

/** I-2: the notebook's cells in file order, or one line saying why it is not shown. */
function notebookNodes(text: string, sourcePath: string): HTMLElement[] {
  const notebook = parseNotebook(text);
  if (!notebook.ok) return [makeNode("p", "nb-note", notebook.message)];
  return notebook.cells.map((cell) => {
    const box = makeNode("div", `nb-cell nb-${cell.type}`);
    if (cell.type === "markdown") {
      const tree = markdownTree(cell.source, sourcePath);
      // A cell's line numbers are not the file's (M-1: no position link), so a click on a block must not move the editor.
      for (const block of tree.querySelectorAll("[data-line]")) { block.removeAttribute("data-line"); block.removeAttribute("data-line-end"); }
      box.append(tree);
    } else if (cell.type === "raw") {
      box.append(makeNode("pre", "nb-raw", cell.source));
    } else {
      if (cell.count !== null) box.append(makeNode("div", "nb-count", `[${cell.count}]`));
      const pre = box.appendChild(document.createElement("pre"));
      pre.append(makeNode("code", `language-${notebook.language.replace(/\s+/g, "")}`, cell.source));
      for (const output of cell.outputs) {
        const node = outputNode(output);
        if (node) box.append(node);
      }
    }
    return box;
  });
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
      frame.srcdoc = htmlSrcdoc(text, hooks.sourcePath(), convertFileSrc, { ...previewColors, appearance: previewAppearance });
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
    if (hooks.kind === "ipynb") {
      body.replaceChildren(...notebookNodes(text, hooks.sourcePath()));
      afterRender();
      return;
    }
    if (hooks.kind === "mermaid") {
      // I-5: the whole file is one diagram, drawn like a ```mermaid block (no source lines: no position link, M-1).
      const pre = makeNode("pre", "");
      pre.append(makeNode("code", "language-mermaid", text));
      body.replaceChildren(...(text.trim() ? [pre] : []));
      afterRender();
      return;
    }
    if (hooks.kind !== "markdown") {
      body.replaceChildren(...csvNodes(text, hooks.kind === "tsv" ? "\t" : ","));
      return;
    }
    body.replaceChildren(markdownTree(text, hooks.sourcePath()));
    if (lastLine >= 0) highlight(lastLine, false);
    afterRender();
  };

  /** Code colours (K-53), formulas (I-4) and diagrams (I-5) are put on the fresh tree; a newer render makes older ones stop. */
  function afterRender(): void {
    const id = ++generation;
    const current = () => id === generation;
    void colorCodeBlocks(id);
    void drawMath(body, current);
    void drawMermaid(body, current);
  }

  /** K-53: fenced code blocks get the editor's syntax colours after the render (class only, built with the DOM, not HTML). */
  async function colorCodeBlocks(id: number): Promise<void> {
    for (const code of body.querySelectorAll<HTMLElement>("pre > code[class*='language-']:not(.language-mermaid)")) { // a mermaid block becomes a diagram
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
  // I-11: the frame does not inherit CSS variables, so a changed Preview theme re-renders it (the same debounced path as an edit).
  const stopTheme = hooks.kind === "html" ? onPreviewThemeChange(() => preview.changed()) : () => {};
  const preview: Preview = {
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
    dispose: () => { stopTheme(); clearTimeout(timer); generation++; },
  };
  return preview;
}
