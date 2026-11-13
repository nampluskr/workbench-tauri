import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import DOMPurify from "dompurify";
import { csvTable } from "../editor/csv.ts";
import { blockAt, classifyLink, headingSlugs, localImagePath, renderMarkdown, type LinkTarget } from "../editor/markdown.ts";
import { classifyHtmlLink, htmlPreviewDoc, PREVIEW_CSP, PREVIEW_HANG_MS, PREVIEW_HOST_AVOID_MS, PREVIEW_PING_MS, previewHost, recordRecovery, type PreviewHost } from "../editor/html.ts";
import { NOTEBOOK_HTML_FORBID_ATTR, NOTEBOOK_HTML_FORBID_TAGS, parseNotebook, type NotebookOutput } from "../editor/notebook.ts";
import { svgElement } from "../editor/svg.ts";
import type { PreviewKind } from "../editor/preview-kind.ts";
import { CODE_BLOCK_COPIED_MS, MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS } from "../spec/metrics.ts";
import { languages, loadSyntax } from "../syntax/assets.ts";
import { codeBlockHighlights } from "../syntax/document.ts";
import { onPreviewThemeChange, previewAppearance, previewColors, previewSyntaxKeys } from "../theme/apply.ts";
import { syntaxClass } from "../theme/theme.ts";
import { drawMath, drawMermaid } from "./rich-blocks.ts";
import { iconElement } from "./icon-svg.ts";
import { createPreviewSearch } from "./preview-search.ts";
import { notify } from "./toast.ts";
import { tooltip } from "./tooltip.ts";

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

/**
 * core v0.8.1 I-12: each code block (fenced, indented, ipynb code cell; not a mermaid block, the frontmatter or an output) goes in a
 * box under a header row: the language (empty when none is given) and a Copy button for the block's text as it is. The box takes
 * the block's source lines (markdown-it puts them on the code of a fence, on the pre of an indented block) for the position link.
 */
function addCodeHeaders(body: HTMLElement): void {
  for (const code of body.querySelectorAll<HTMLElement>("pre:not(.frontmatter-raw) > code:not(.language-mermaid)")) {
    const pre = code.parentElement!;
    const box = makeNode("div", "code-block");
    for (const name of ["data-line", "data-line-end"]) for (const el of [pre, code]) {
      const value = el.getAttribute(name);
      if (value === null) continue;
      box.setAttribute(name, value);
      el.removeAttribute(name);
    }
    const text = code.textContent ?? "";
    const label = "Copy Code";
    const button = makeNode("button", "icon-button code-block-copy");
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", label);
    button.append(iconElement("copy"));
    tooltip(button, () => ({ title: label }));
    let timer = 0;
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // not a click on the block: the source selection stays
      invoke("write_clipboard_text", { text }).then(() => {
        clearTimeout(timer);
        button.replaceChildren(iconElement("check"));
        button.setAttribute("aria-label", "Copied");
        timer = window.setTimeout(() => { button.replaceChildren(iconElement("copy")); button.setAttribute("aria-label", label); }, CODE_BLOCK_COPIED_MS);
      }, (error) => notify([String(error)]));
    });
    const header = makeNode("div", "code-block-header");
    header.append(makeNode("span", "code-block-language", /(?:^|\s)language-(\S+)/.exec(code.className)?.[1] ?? ""), button);
    pre.replaceWith(box);
    box.append(header, pre);
  }
}

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

/** `reveal` (core v0.8.1 I-4, an Outline click): scroll a heading to the top, by its source line, or for a notebook by its order among the cells' headings. */
export type Preview = { element: HTMLElement; changed: () => void; cursor: (line: number) => void; reveal: (line: number, heading?: number) => void; find: (action: string) => boolean; dispose: () => void };

let previewFrames = 0; // ids of HTML preview documents (src-tauri preview.rs)
const hostAvoidUntil: Record<PreviewHost, number> = { preview: 0, preview1: 0, preview2: 0 }; // I-14: until when each host's renderer is taken as stuck

export function createPreview(hooks: PreviewHooks): Preview {
  const element = document.createElement("div");
  element.className = "markdown-preview";
  element.tabIndex = -1;
  element.dataset.keymapContext = "MarkdownPreview"; // I-045 / I-086
  const body = document.createElement("div");
  body.className = "markdown-body";
  element.append(body);
  // I-1 / v0.8.1 I-7: an HTML file is one frame filling the tab, its document served by the preview scheme (editor/html.ts).
  // allow-scripts only: an opaque origin, no form, popup, modal or top navigation (M-12). Never allow-same-origin with it.
  const frame = document.createElement("iframe");
  const frameId = `p${++previewFrames}`;
  let frameUrl = convertFileSrc(frameId, "preview"); // every host serves the same documents: the host is picked at each render
  let frameScroll = 0; // reported by the frame document (headStart)
  let ours = false; // the frame's current document is the preview's own: it said so (headStart) before its load
  let recoveries: number[] = []; // times this render's document was shown again after a navigation
  let stopped = false;
  let host: PreviewHost = "preview";
  let pingSince = 0; // I-14: when the first ping still unanswered was sent, 0 for none
  let hung = false; // the frame was taken out for a stuck renderer, until the next render
  let wasStuck = false; // I-14: once stuck, this preview draws on preview2 only (previewHost)
  let waitTimer = 0; // a render waiting for preview2's avoidance to end
  const showFrame = () => { pingSince = 0; frame.src = frameUrl; };
  const linkToken = crypto.randomUUID(); // I-24: only the frame's head script knows it (headStart)
  const onFrameMessage = (e: MessageEvent) => {
    if (e.source !== frame.contentWindow) return;
    const link: unknown = e.data?.previewLink;
    if (link && typeof link === "object" && "token" in link && link.token === linkToken && "href" in link && typeof link.href === "string") {
      const target = classifyHtmlLink(link.href, hooks.sourcePath(), "alt" in link && link.alt === true);
      if (target) hooks.link(target);
    }
    if (e.data?.previewReady === true) ours = true;
    if (e.data?.previewPong === true) pingSince = 0;
    const y: unknown = e.data?.previewScrollY;
    if (typeof y === "number") frameScroll = y;
  };
  if (hooks.kind === "html") {
    element.classList.add("html-preview");
    frame.className = "html-frame";
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("csp", PREVIEW_CSP);
    // A page script that navigates its frame cannot be stopped first (opaque origin: no Navigation API events). What it lands on
    // (a CSP error page, or the empty document WebView2 commits for the scheme's 204) is replaced by the preview again, each
    // time; a page that keeps navigating gets a bounded number of these (recordRecovery), then a notice until the next render.
    // A load of the preview's own document is never a navigation away: a render, a page reload, or the frame being loaded again
    // because the tab view was taken out of the DOM and put back (Pane.tsx). Only those documents send previewReady.
    frame.addEventListener("load", () => {
      pingSince = 0; // a new document (a render, or the tab view put back): its answers start now, so a quick tab switch is no hang
      const own = ours;
      ours = false;
      if (own || !frame.src || stopped) return;
      const next = recordRecovery(recoveries, performance.now());
      if (next) { recoveries = next; showFrame(); return; }
      stopped = true;
      notify(["This HTML page keeps navigating away.", "Its preview stops until the file or the theme changes."]);
    });
    window.addEventListener("message", onFrameMessage);
    body.append(frame);
  }
  // I-14: a shown frame is pinged; a page stuck in a loop never answers. Its frame is taken out, so its renderer can end, and
  // its host is avoided by the previews drawn next (previewHost): a new frame on that host would join the stuck process.
  // Other previews on the same host are stuck with it and each finds it by its own ping.
  // Only while the app window has focus (hasFocus is true with focus inside the frame too): a frame of a window behind others
  // answers late enough to raise a false notice (v3.json c6); a loop is still found within PREVIEW_HANG_MS of coming back.
  const pinger = hooks.kind !== "html" ? 0 : window.setInterval(() => {
    if (stopped || !frame.isConnected || document.visibilityState !== "visible" || !document.hasFocus()) { pingSince = 0; return; }
    const now = performance.now();
    if (pingSince && now - pingSince >= PREVIEW_HANG_MS) {
      hung = true;
      wasStuck = true;
      hostAvoidUntil[host] = now + PREVIEW_HOST_AVOID_MS;
      const note = document.createElement("p");
      note.textContent = "This HTML page is not responding. Its preview stops until the file or the theme changes.";
      body.replaceChildren(note);
      return;
    }
    if (!pingSince) pingSince = now;
    frame.contentWindow?.postMessage({ previewPing: true }, "*");
  }, PREVIEW_PING_MS);
  // core v0.8.1 I-9: find only where the preview is text of the app's own (not HTML, SVG or a Mermaid file).
  const search = ["markdown", "ipynb", "csv", "tsv"].includes(hooks.kind) ? createPreviewSearch(element, body) : null;
  let timer = 0;
  let lastLine = -1;
  let generation = 0;

  // The HTML frame after preview_set: on the host previewHost picks, or, for a once-stuck preview while preview2 is avoided,
  // once that ends (the notice stays until then; a frame put on preview2 now would keep its stuck process alive).
  const show = (id: number) => {
    clearTimeout(waitTimer);
    if (id !== generation) return; // disposed, or a newer render is on its way
    const pick = previewHost(performance.now(), hostAvoidUntil, wasStuck);
    if (typeof pick === "number") { waitTimer = window.setTimeout(() => show(id), pick); return; }
    recoveries = [];
    stopped = false;
    host = pick;
    frameUrl = convertFileSrc(frameId, host);
    if (hung) { hung = false; body.replaceChildren(frame); }
    showFrame();
  };

  const render = () => {
    const text = hooks.text();
    if (text === null) return;
    if (hooks.kind === "html") {
      const html = htmlPreviewDoc(text, hooks.sourcePath(), convertFileSrc, { ...previewColors, appearance: previewAppearance }, frameScroll, linkToken);
      const id = ++generation;
      invoke("preview_set", { id: frameId, html }).then(() => {
        show(id);
      }, (error) => notify(["Failed to show the HTML preview", String(error)]));
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
    addCodeHeaders(body);
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

  /** core v0.8.1 I-22: `#id` scrolls to the heading with that id (headingSlugs), as an Outline click does; an unknown id does nothing. */
  function revealAnchor(id: string): void {
    const notebook = hooks.kind === "ipynb"; // a notebook's headings are counted over its markdown cells, as reveal counts them
    const headings = [...body.querySelectorAll<HTMLElement>(notebook ? ".nb-markdown :is(h1, h2, h3, h4, h5, h6)" : ":is(h1, h2, h3, h4, h5, h6)[data-line]")];
    const at = headingSlugs(headings.map((h) => h.textContent ?? "")).indexOf(id);
    if (at >= 0) preview.reveal(notebook ? 0 : Number(headings[at].dataset.line), notebook ? at : undefined);
  }

  element.addEventListener("click", (e) => {
    const a = (e.target as Element).closest("a");
    if (a) {
      e.preventDefault();
      const href = a.getAttribute("href");
      const target = href ? classifyLink(href, hooks.sourcePath(), e.altKey) : null;
      if (target?.kind === "anchor") revealAnchor(target.id);
      else if (target) hooks.link(target);
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
    reveal: (line, heading) => {
      if (heading === undefined) highlight(line, false); // the block mark of I-083, as a click on the block gives
      const target = heading === undefined ? body.querySelector<HTMLElement>(".active-block")
        : body.querySelectorAll<HTMLElement>(".nb-markdown :is(h1, h2, h3, h4, h5, h6)")[heading];
      target?.scrollIntoView({ block: "start" });
    },
    find: (action) => search?.run(action) ?? false,
    dispose: () => {
      search?.dispose(); stopTheme(); clearTimeout(timer); clearTimeout(waitTimer); clearInterval(pinger); generation++;
      if (hooks.kind !== "html") return;
      // I-7: the frame's document goes with the tab, so its timers stop.
      window.removeEventListener("message", onFrameMessage);
      frame.remove();
      invoke("preview_drop", { id: frameId }).catch(() => {}); // a stale entry only costs memory
    },
  };
  return preview;
}
