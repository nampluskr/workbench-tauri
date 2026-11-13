import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import DOMPurify from "dompurify";
import { csvTable } from "../editor/csv.ts";
import { codeBlockParts, codeLanguage, trimBlankLinesIn } from "../editor/code-block.ts";
import { blockAt, classifyLink, headingSlugs, localImagePath, MARKDOWN_HTML_ATTR, MARKDOWN_HTML_TAGS, renderMarkdown, type Heading, type LinkTarget } from "../editor/markdown.ts";
import { classifyHtmlLink, copyRequest, frameBaseStyle, frameMessage, frameRequest, htmlPreviewDoc, PREVIEW_CSP, PREVIEW_HANG_MS, PREVIEW_HOST_AVOID_MS, PREVIEW_PING_MS, previewHost, recordRecovery, type PreviewHost } from "../editor/html.ts";
import { NOTEBOOK_HTML_FORBID_ATTR, NOTEBOOK_HTML_FORBID_TAGS, parseNotebook, type NotebookOutput } from "../editor/notebook.ts";
import { svgElement } from "../editor/svg.ts";
import type { PreviewKind } from "../editor/preview-kind.ts";
import { CODE_BLOCK_COPIED_MS, MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS } from "../spec/metrics.ts";
import { languages, loadSyntax } from "../syntax/assets.ts";
import { foldedBlocks, headingOfBlock, headingSections, unfoldKeys, type Section } from "../syntax/outline.ts";
import { codeBlockHighlights } from "../syntax/document.ts";
import { onPreviewThemeChange, previewAppearance, previewColors, previewSyntaxKeys } from "../theme/apply.ts";
import { syntaxClass } from "../theme/theme.ts";
import { drawMath, drawMermaid } from "./rich-blocks.ts";
import { iconElement } from "./icon-svg.ts";
import { adjustFontSize, previewZoom } from "../settings/load.ts";
import { createPreviewSearch, domFind, type FindTarget } from "./preview-search.ts";
import { notify } from "./toast.ts";
import { tooltip } from "./tooltip.ts";

// The body of a Markdown preview tab (R-11, D-10). Rendered with markdown-it, sanitized with DOMPurify, then put in the tab's
// element. core v0.8.2 I-24: HTML typed in the body is drawn, so only the tags and attributes of MARKDOWN_HTML_TAGS / _ATTR stay
// (editor/markdown.ts: no script, style, iframe, form, event or style attribute; stricter than a notebook output's rules).
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
  /** core v0.8.2 I-7: a click in a notebook or HTML preview: the number of the heading whose section holds the clicked block (-1: before the first). */
  heading: (heading: number) => void;
  /** core v0.8.2 I-18: the folded sections of the document, as Outline keys (the Outline's own folds), and a fold or unfold of some. */
  folded: () => ReadonlySet<string>;
  fold: (keys: string[], folded: boolean) => void;
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
function markdownTree(text: string, sourcePath: string, headings?: Heading[]): DocumentFragment {
  const tree = DOMPurify.sanitize(renderMarkdown(text, headings),
    { ALLOWED_TAGS: MARKDOWN_HTML_TAGS, ALLOWED_ATTR: MARKDOWN_HTML_ATTR, ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false, RETURN_DOM_FRAGMENT: true });
  for (const image of tree.querySelectorAll("img")) {
    const path = localImagePath(image.getAttribute("src") ?? "", sourcePath);
    if (path) image.setAttribute("src", convertFileSrc(path));
    else image.remove();
  }
  // core v0.8.2 I-16: a table fills the body; a wider one (many columns) scrolls sideways in this box, the body keeps its width.
  for (const table of tree.querySelectorAll("table")) {
    const wrap = makeNode("div", "table-wrap");
    table.replaceWith(wrap);
    wrap.append(table);
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
 * box under a header row: the language (empty when none is given) and a Copy button for the block's text. The box takes
 * the block's source lines (markdown-it puts them on the code of a fence, on the pre of an indented block) for the position link.
 * core v0.8.2 I-22: the blank lines at the start and end are neither drawn nor copied. I-23: the line numbers sit beside the pre,
 * shown by the Settings (a CSS variable) and drawn from an attribute (codeBlockParts), so they are never text.
 */
const COPY_LABEL = "Copy Code";

/** The box of one code block, in place of its `pre`: the header (language, a Copy button holding `icons`) over [line numbers][pre]. `text` is what the block shows and Copy writes (I-22). */
function codeBox(pre: HTMLElement, code: HTMLElement, ...icons: HTMLElement[]): { box: HTMLElement; button: HTMLElement; text: string } {
  const box = makeNode("div", "code-block");
  const { text, numbers } = codeBlockParts(code.textContent ?? "");
  if (text !== code.textContent) {
    // Cut in the text nodes, so tags inside the code (HTML typed in the body, I-24) stay.
    const walker = code.ownerDocument.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    trimBlankLinesIn(nodes.map((node) => node.data)).forEach((part, i) => { nodes[i].data = part; });
  }
  const button = makeNode("button", "icon-button code-block-copy");
  button.setAttribute("type", "button");
  button.setAttribute("aria-label", COPY_LABEL);
  button.append(...icons);
  const header = makeNode("div", "code-block-header");
  header.append(makeNode("span", "code-block-language", codeLanguage(code.className)), button);
  const gutter = makeNode("div", "code-line-numbers");
  gutter.setAttribute("aria-hidden", "true");
  gutter.dataset.lines = numbers;
  pre.replaceWith(box);
  box.append(header, gutter, pre);
  return { box, button, text };
}

/** K-53: `code` (text only) in the syntax colours of `found` (class only, built with the DOM, not HTML). */
function paintCode(code: HTMLElement, text: string, found: Awaited<ReturnType<typeof codeBlockHighlights>>): void {
  if (!found.length) return;
  let at = 0;
  const nodes: (string | HTMLElement)[] = [];
  for (const span of found) {
    if (span.from > at) nodes.push(text.slice(at, span.from));
    nodes.push(makeNode("span", syntaxClass(span.key), text.slice(span.from, span.to)));
    at = span.to;
  }
  code.replaceChildren(...nodes, text.slice(at));
}

function addCodeHeaders(body: HTMLElement): void {
  for (const code of body.querySelectorAll<HTMLElement>("pre:not(.frontmatter-raw) > code:not(.language-mermaid)")) {
    const pre = code.parentElement!;
    const label = COPY_LABEL;
    const { box, button, text } = codeBox(pre, code, iconElement("copy"));
    for (const name of ["data-line", "data-line-end"]) for (const el of [pre, code]) {
      const value = el.getAttribute(name);
      if (value === null) continue;
      box.setAttribute(name, value);
      el.removeAttribute(name);
    }
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
  }
}

/**
 * core v0.8.2 I-14 / I-16: an HTML page's tables and code blocks as the Markdown preview draws them, in the inert frame document
 * (htmlPreviewDoc): a table in its `.table-wrap`, every `pre` in a code block box, coloured here by its `language-…` class (the
 * frame has no parser). The Copy button holds both icons; the frame's head script shows one and sends the text (headStart).
 * shortcut: a page's own `.code-block` / `.table-wrap` classes get these rules too; rename the frame's classes if pages collide.
 */
async function frameBlocks(doc: Document): Promise<void> {
  for (const table of doc.querySelectorAll("table")) {
    if (table.parentElement?.classList.contains("table-wrap")) continue;
    const wrap = makeNode("div", "table-wrap");
    table.replaceWith(wrap);
    wrap.append(table);
  }
  for (const pre of doc.querySelectorAll<HTMLElement>("pre")) {
    const code = pre.querySelector<HTMLElement>(":scope > code") ?? pre;
    const { button, text } = codeBox(pre, code, iconElement("copy"), iconElement("check"));
    button.setAttribute("title", COPY_LABEL); // the app's tooltip cannot reach into the frame
    const name = codeLanguage(code.className);
    if (name && !code.childElementCount) paintCode(code, text, await codeBlockHighlights(name, text, languages, loadSyntax, previewSyntaxKeys).catch(() => []));
  }
}

// core v0.8.2 I-14: the app's rules an HTML frame gets (frameBaseStyle): the Markdown body's, the code block's and its icons', the Preview theme's syntax colours.
// core v0.8.2 I-25: and the find marks' colours.
const FRAME_RULE = /\.markdown-body|^\.markdown-preview \.cm-syntax-|^\.(code-|icon\b)|^::highlight\(preview-find/;

/** I-14: the frame's base look as it is now: the live rules, with the variables' values at a preview (Preview theme, Settings), and the font families those name. */
function frameLook(): { css: string; families: string[] } {
  const headingColors = document.documentElement.classList.contains("heading-colors"); // core v0.8.2 I-11
  const rules: string[] = [];
  for (const sheet of [...document.styleSheets, ...document.adoptedStyleSheets]) for (const rule of sheet.cssRules) {
    if (!(rule instanceof CSSStyleRule) || !FRAME_RULE.test(rule.selectorText) || rule.selectorText.includes(".html-preview")) continue;
    if (headingColors || !rule.selectorText.includes(".heading-colors")) rules.push(rule.cssText);
  }
  // The preview itself may not be in the document yet. core v0.8.2 I-19: the sizes are the Settings' (spec/metrics.ts), not the
  // Ctrl+= ones: the frame document is zoomed by that ratio as a whole, so a change of it needs no new document.
  const probe = document.body.appendChild(makeNode("div", "markdown-preview preview-setting-size"));
  const style = getComputedStyle(probe);
  const value = (name: string) => style.getPropertyValue(name).trim();
  const css = frameBaseStyle(rules.join(""), value);
  const families = `${value("--ui-font-family")},${value("--preview-code-font-family")}`.split(",").map((name) => name.trim().replace(/^["']|["']$/g, ""));
  probe.remove();
  return { css, families };
}

const fontData = new Map<string, Promise<string>>(); // font file URL -> data: URL
/**
 * I-14: the app's bundled faces of `families` as `@font-face` rules with data: sources. The frame's policy takes fonts from data:
 * and asset: only, and the asset protocol answers CORS for the app's origin alone, so the app reads its own files and hands them over.
 * shortcut: every face of the families rides in each frame document (IBM Plex Sans + JetBrains Mono: about 0.9 MB as base64;
 * D2Coding 5.6 MB); serve them from the preview scheme if rendering gets slow.
 */
async function frameFonts(families: string[]): Promise<string> {
  const faces: Promise<string>[] = [];
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) {
    if (!(rule instanceof CSSFontFaceRule) || !families.includes(rule.style.getPropertyValue("font-family").replace(/^["']|["']$/g, ""))) continue;
    const src = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(rule.style.getPropertyValue("src"))?.[1];
    if (!src) continue;
    const url = new URL(src, sheet.href ?? location.href).href;
    if (!fontData.has(url)) fontData.set(url, fetch(url).then((r) => r.blob()).then((blob) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    })));
    faces.push(fontData.get(url)!.then((data) => rule.cssText.replace(/url\([^)]*\)/, `url("${data}")`), () => "")); // a face that cannot be read is left out: the fallback font shows
  }
  return (await Promise.all(faces)).join("");
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

/** I-2: the notebook's cells in file order, or one line saying why it is not shown. `headings` gets the headings of its markdown cells. */
function notebookNodes(text: string, sourcePath: string, headings: Heading[]): HTMLElement[] {
  const notebook = parseNotebook(text);
  if (!notebook.ok) return [makeNode("p", "nb-note", notebook.message)];
  // I-24: data-heading counts on over the cells (one `headings` for all), as the notebook's Outline does
  return notebook.cells.map((cell) => {
    const box = makeNode("div", `nb-cell nb-${cell.type}`);
    if (cell.type === "markdown") {
      const tree = markdownTree(cell.source, sourcePath, headings);
      // A cell's line numbers are not the file's (M-1: no position link), so a click on a block must not move the editor.
      for (const block of tree.querySelectorAll("[data-line]")) { block.removeAttribute("data-line"); block.removeAttribute("data-line-end"); }
      box.append(tree);
    } else if (cell.type === "raw") {
      box.append(makeNode("pre", "nb-raw", cell.source));
    } else {
      box.append(makeNode("div", "nb-count", `[${cell.count ?? " "}]`)); // core v0.8.2 I-15: in the left margin, [ ] when never run
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

/** `reveal` (core v0.8.1 I-4, an Outline click): scroll a heading to the top, by its source line, or for a notebook by its number among the cells' headings (markdownHeadings). */
/** `folded` (core v0.8.2 I-18): the document's folds changed (hooks.folded), here or in its Outline or another preview of it. */
export type Preview = { element: HTMLElement; changed: () => void; cursor: (line: number) => void; reveal: (line: number, heading?: number) => void; folded: () => void; find: (action: string) => boolean; dispose: () => void };

let previewFrames = 0; // ids of HTML preview documents (src-tauri preview.rs)
const hostAvoidUntil: Record<PreviewHost, number> = { preview: 0, preview1: 0, preview2: 0 }; // I-14: until when each host's renderer is taken as stuck

export function createPreview(hooks: PreviewHooks): Preview {
  const element = document.createElement("div");
  element.className = "markdown-preview";
  element.tabIndex = -1;
  element.dataset.keymapContext = "MarkdownPreview"; // I-045 / I-086
  const body = document.createElement("div");
  body.className = "markdown-body";
  if (hooks.kind === "markdown" || hooks.kind === "ipynb") body.classList.add("left-margin"); // core v0.8.2 I-15
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
  let shownLook = ""; // I-14: the look the last render put in the frame document
  const lookKey = (css: string) => css + previewAppearance + previewColors.text + previewColors.accent;
  // core v0.8.2 I-6 / I-19 / I-25: every message to the frame is one of frameMessage's (none carries linkToken: a page script reads them).
  const post = (message: ReturnType<(typeof frameMessage)[keyof typeof frameMessage]>) => frame.contentWindow?.postMessage(message, "*");
  // core v0.8.2 I-25: the find bar looks through the frame's text: the frame hands it over, the app finds (the bar's own rules) and sends the marks back.
  let findDone: ((text: string) => void) | null = null; // the bar's last read, until the frame answers
  let findChanged: (() => void) | null = null;
  let findSent: unknown = null; // the matches the frame has marked
  const frameFind: FindTarget = {
    read: (done) => { findDone = done; post(frameMessage.findRead()); },
    mark: (found, index, scroll) => {
      post(frameMessage.find(found === findSent ? null : found.flatMap(({ from, to }) => [from, to]), index, scroll)); // a step sends the index only
      findSent = found;
    },
    seed: () => "", // shortcut: a selection inside the frame is not read; let the frame send it with its key if the bar should start with it
    watch: (changed) => { findChanged = changed; },
  };
  const onFrameMessage = (e: MessageEvent) => {
    if (e.source !== frame.contentWindow) return;
    // core v0.8.2 I-7 / I-19 / I-25: one of the frame's fixed requests. A key runs its own entry here, never a name the frame sent.
    const request = frameRequest(e, frame.contentWindow, linkToken);
    if (request && "key" in request) {
      if (request.key === "zoomIn" || request.key === "zoomOut" || request.key === "zoomReset") adjustFontSize("preview", request.key === "zoomIn" ? 1 : request.key === "zoomOut" ? -1 : 0);
      else search?.run({ find: "editor::Find", findNext: "editor::FindNext", findPrevious: "editor::FindPrevious", cancel: "editor::Cancel" }[request.key]);
    } else if (request && "heading" in request) hooks.heading(request.heading);
    else if (request) { const done = findDone; findDone = null; done?.(request.text); }
    const link: unknown = e.data?.previewLink;
    if (link && typeof link === "object" && "token" in link && link.token === linkToken && "href" in link && typeof link.href === "string") {
      const target = classifyHtmlLink(link.href, hooks.sourcePath(), "alt" in link && link.alt === true);
      if (target) hooks.link(target);
    }
    const copy = copyRequest(e, frame.contentWindow, linkToken); // core v0.8.2 I-14: a code block's Copy button
    if (copy !== null) invoke("write_clipboard_text", { text: copy }).catch((error) => notify([String(error)]));
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
      // core v0.8.2 I-12: the document scrolls to the render's position at its load (headStart); a tab view put back reloads it,
      // so it is sent the last position it reported. After a render this is the same or a newer one.
      // core v0.8.2 I-19 / I-25: it is zoomed as the previews are now, and an open find bar looks through the new document.
      if (own) { post(frameMessage.scrollTo(frameScroll)); post(frameMessage.zoom(previewZoom())); findSent = null; findChanged?.(); }
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
    post(frameMessage.ping());
  }, PREVIEW_PING_MS);
  // core v0.8.1 I-9: find where the preview is text of the app's own; core v0.8.2 I-25: and in an HTML page, through its frame (not SVG or a Mermaid file).
  const search = ["markdown", "ipynb", "csv", "tsv"].includes(hooks.kind) ? createPreviewSearch(element, domFind(element, body, (node) => unfold(node)))
    : hooks.kind === "html" ? createPreviewSearch(element, frameFind) : null;
  // core v0.8.2 I-18: the sections of a Markdown or notebook preview fold at their headings. What is kept from a render is one entry
  // per numbered heading (markdownHeadings); a fold change then only walks the blocks.
  let sections: Section[] = [];
  let headingEls: HTMLElement[] = []; // by heading number; a heading that was not drawn has no entry
  let holders = new Set<Element>(); // the elements with a numbered heading inside (a notebook's markdown cell, an HTML block's <div>)
  let parts: HTMLElement[] = []; // what a fold hides or shows, in order
  let blockHeadings: number[] = []; // of each block: the number of the heading it is, or -1
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
      const id = ++generation;
      const { css, families } = frameLook();
      const look = { ...previewColors, appearance: previewAppearance, zoom: previewZoom() }; // I-19
      const scroll = frameScroll;
      shownLook = lookKey(css);
      frameFonts(families)
        .then((fonts) => htmlPreviewDoc(text, hooks.sourcePath(), convertFileSrc, { ...look, base: fonts + css }, scroll, linkToken, frameBlocks))
        .then((html) => id === generation ? invoke("preview_set", { id: frameId, html }).then(() => show(id)) : undefined) // else a newer render is on its way
        .catch((error) => notify(["Failed to show the HTML preview", String(error)]));
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
    const headings: Heading[] = [];
    if (hooks.kind === "ipynb") {
      body.replaceChildren(...notebookNodes(text, hooks.sourcePath(), headings));
      afterRender(headings);
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
    body.replaceChildren(markdownTree(text, hooks.sourcePath(), headings));
    if (lastLine >= 0) highlight(lastLine, false);
    afterRender(headings);
  };

  /** Code colours (K-53), formulas (I-4) and diagrams (I-5) are put on the fresh tree; a newer render makes older ones stop. */
  function afterRender(headings?: Heading[]): void {
    const id = ++generation;
    const current = () => id === generation;
    addCodeHeaders(body);
    if (headings) addFolds(headings);
    void colorCodeBlocks(id);
    void drawMath(body, current);
    void drawMermaid(body, current).then(() => { if (headings && current()) applyFolds(); }); // a diagram is a new block in place of its source
  }

  /** I-18: after a render: each numbered heading gets its chevron (always shown), then the folds are drawn. */
  function addFolds(headings: Heading[]): void {
    sections = headingSections(headings);
    headingEls = [];
    holders = new Set();
    for (const el of body.querySelectorAll<HTMLElement>(":is(h1, h2, h3, h4, h5, h6)[data-heading]:not(.nb-output *)")) { // not a heading of a notebook output
      const number = Number(el.dataset.heading);
      if (!sections[number] || headingEls[number]) continue; // a data-heading typed in the text
      headingEls[number] = el;
      for (let up = el.parentElement; up && up !== body && !holders.has(up); up = up.parentElement) holders.add(up);
      const button = makeNode("button", "heading-fold");
      button.setAttribute("type", "button");
      button.setAttribute("aria-label", "Toggle Section");
      button.addEventListener("click", (e) => {
        e.stopPropagation(); // not a click on the block
        const key = sections[number].key;
        hooks.fold([key], !hooks.folded().has(key));
      });
      el.prepend(button);
    }
    applyFolds();
  }

  /** I-18: the folds as they are now. A block is a child of the body, or of a holder (which is looked into, so every numbered heading is a block). */
  function applyFolds(): void {
    const folded = hooks.folded();
    parts = [];
    const walk = (parent: Element) => { for (const el of parent.children) if (holders.has(el)) walk(el); else parts.push(el as HTMLElement); };
    walk(body);
    const numbers = new Map<Element, number>();
    headingEls.forEach((el, number) => numbers.set(el, number));
    blockHeadings = parts.map((el) => numbers.get(el) ?? -1);
    foldedBlocks(blockHeadings, sections, folded).forEach((hidden, i) => parts[i].toggleAttribute("data-folded", hidden));
    headingEls.forEach((el, number) => {
      const button = el.firstElementChild!;
      const open = String(!folded.has(sections[number].key));
      if (button.getAttribute("aria-expanded") === open) return;
      button.setAttribute("aria-expanded", open);
      button.replaceChildren(iconElement(open === "true" ? "chevron_down" : "chevron_right"));
    });
  }

  /** I-18: the sections folded over `node` are opened (in the Outline and every preview of the document), so it can be scrolled to. */
  function unfold(node: Node | null): void {
    const hidden = (node instanceof Element ? node : node?.parentElement)?.closest<HTMLElement>("[data-folded]");
    const at = hidden ? parts.indexOf(hidden) : -1;
    if (at >= 0) hooks.fold(unfoldKeys(blockHeadings, sections, at), false);
  }

  /** K-53: fenced code blocks get the editor's syntax colours after the render (class only, built with the DOM, not HTML). */
  async function colorCodeBlocks(id: number): Promise<void> {
    for (const code of body.querySelectorAll<HTMLElement>("pre > code[class*='language-']:not(.language-mermaid)")) { // a mermaid block becomes a diagram
      const name = /(?:^|\s)language-(\S+)/.exec(code.className)?.[1];
      const text = code.textContent ?? "";
      if (!name || code.childElementCount) continue; // tags typed inside the code stay as they are (I-24)
      const found = await codeBlockHighlights(name, text, languages, loadSyntax, previewSyntaxKeys).catch(() => []);
      if (id !== generation || !code.isConnected) return; // a newer render replaced these blocks
      paintCode(code, text, found);
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
    if (!scroll) return;
    unfold(el);
    el.scrollIntoView({ block: "nearest" });
  }

  /** core v0.8.1 I-22: `#id` scrolls to the heading with that id (headingSlugs), as an Outline click does; an unknown id does nothing. */
  function revealAnchor(id: string): void {
    const notebook = hooks.kind === "ipynb"; // a notebook's headings are counted over its markdown cells, as reveal counts them
    const headings = [...body.querySelectorAll<HTMLElement>(notebook ? ".nb-markdown :is(h1, h2, h3, h4, h5, h6)[data-heading]" : ":is(h1, h2, h3, h4, h5, h6)[data-line]")];
    const at = headingSlugs(headings.map((h) => h.textContent ?? "")).indexOf(id);
    if (at >= 0) preview.reveal(notebook ? 0 : Number(headings[at].dataset.line), notebook ? Number(headings[at].dataset.heading) : undefined);
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
    // core v0.8.2 I-7: a notebook's blocks have no source line (M-1): the Outline gets the heading the clicked block is under.
    if (hooks.kind !== "ipynb") return;
    const at = parts.findIndex((el) => el.contains(e.target as Node));
    if (at >= 0) hooks.heading(headingOfBlock(blockHeadings, at));
  });

  render();
  // I-11 / core v0.8.2 I-14: the frame does not inherit CSS variables, so a Preview theme or Settings change that gives it another
  // look re-renders it (the same debounced path as an edit).
  // core v0.8.2 I-19: a Ctrl+= size is the frame's zoom alone (the look is the Settings'), so it is sent, not rendered.
  const stopTheme = hooks.kind === "html" ? onPreviewThemeChange(() => { if (lookKey(frameLook().css) !== shownLook) preview.changed(); post(frameMessage.zoom(previewZoom())); }) : () => {};
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
      // core v0.8.2 I-6: an HTML page's headings are in its frame, by their number in the source.
      if (hooks.kind === "html") { if (heading !== undefined) post(frameMessage.reveal(heading)); return; }
      if (heading === undefined) highlight(line, false); // the block mark of I-083, as a click on the block gives
      const target = heading === undefined ? body.querySelector<HTMLElement>(".active-block")
        : body.querySelector<HTMLElement>(`.nb-markdown :is(h1, h2, h3, h4, h5, h6)[data-heading="${heading}"]`); // the number renderMarkdown gave it
      unfold(target);
      target?.scrollIntoView({ block: "start" });
    },
    folded: applyFolds,
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
