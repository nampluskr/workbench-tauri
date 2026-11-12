import { SearchQuery } from "@codemirror/search";
import { repaint, textMatches } from "../editor/preview-find.ts";
import { wholeWordOn, wholeWordTest } from "../editor/search.ts";
import { iconElement } from "./icon-svg.ts";

// core v0.8.1 I-9: the find bar of a Markdown / notebook / CSV / TSV preview. It is the editor tab's bar (the same .document-search
// parts, labels and keys) without the replace row, select-all and find-in-selection, as Zed's preview bar. Matches are marked with the
// CSS Custom Highlight API, so the preview DOM is never changed (the position link, copy and the Outline scroll stay as they are).

// Text under these is not looked at: the code block header (language, Copy), a notebook cell's [n], and what is not shown as text.
const SKIP = ".code-block-header, .nb-count, style, script, annotation";
// Text in different blocks is joined with a line break, so a match never runs from one block into the next.
const BLOCKS = "p, li, h1, h2, h3, h4, h5, h6, td, th, pre, blockquote, div, dt, dd, math, text, foreignObject";

// Every preview's marks share the two highlights; each preview adds and removes its own ranges.
const others = new Highlight(), current = new Highlight();
current.priority = 1;
CSS.highlights.set("preview-find", others);
CSS.highlights.set("preview-find-current", current);

type Segment = { node: Text; start: number };

/** The previewed text, blocks on lines of their own, with where each text node starts in it. */
function collect(body: HTMLElement): { text: string; segments: Segment[] } {
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, { acceptNode: (node) => node.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const segments: Segment[] = [];
  let text = "", block: Element | null | undefined;
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    if (!node.data) continue;
    const at = node.parentElement?.closest(BLOCKS);
    if (text && at !== block) text += "\n";
    block = at;
    segments.push({ node, start: text.length });
    text += node.data.replace(/\r/g, " "); // CM reads \r as a line break; one character for one keeps the offsets
  }
  return { text, segments };
}

/** A DOM range over text offsets `from`..`to` (segments in order). */
function rangeOf(segments: Segment[], from: number, to: number): Range {
  const range = new Range();
  // The last segment starting at or before `pos` (`end`: before it), by binary search.
  const at = (pos: number, end: boolean) => {
    let lo = 0, hi = segments.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (end ? segments[mid].start < pos : segments[mid].start <= pos) lo = mid; else hi = mid - 1; }
    return segments[lo];
  };
  const start = at(from, false), end = at(to, true);
  range.setStart(start.node, from - start.start);
  range.setEnd(end.node, Math.min(to - end.start, end.node.length));
  return range;
}

export type PreviewSearch = { run: (action: string) => boolean; dispose: () => void };

/** The find bar of the preview `element` (the scroller) over `body`. */
export function createPreviewSearch(element: HTMLElement, body: HTMLElement): PreviewSearch {
  let query = new SearchQuery({ search: "", literal: true });
  // `painted` is what this preview has in the shared highlights; it is kept apart from `ranges`, which a new search replaces first.
  let ranges: Range[] = [], painted: Range[] = [], index = -1, invalid = false;

  const make = (className: string, tag = "div") => {
    const el = document.createElement(tag);
    el.className = className;
    return el;
  };
  const dom = make("document-search preview-search");
  dom.dataset.keymapContext = "EditorSearch";
  dom.setAttribute("role", "search");
  const row = make("document-search-row"), field = make("document-search-field");
  const find = document.createElement("input");
  find.placeholder = "Find";
  find.setAttribute("aria-label", "Find");
  find.addEventListener("input", () => { query = new SearchQuery({ ...query, search: find.value }); search(true); });
  field.append(find);
  const button = (parent: HTMLElement, icon: string, label: string, run: () => void) => {
    const el = document.createElement("button");
    el.type = "button";
    el.title = label;
    el.setAttribute("aria-label", label);
    el.append(iconElement(icon));
    el.addEventListener("click", run);
    parent.append(el);
    return el;
  };
  const options = ([["case_sensitive", "Match Case (Alt+C)", "caseSensitive"], ["whole_word", "Match Whole Word (Alt+W)", "wholeWord"], ["regex", "Use Regular Expression (Alt+R)", "regexp"]] as const)
    .map(([icon, label, option]) => [button(field, icon, label, () => toggle(option)), option] as const);
  row.append(field, make("document-search-separator", "span"));
  button(row, "chevron_left", "Previous Match (Shift+F3)", () => step(-1));
  button(row, "chevron_right", "Next Match (F3)", () => step(1));
  const count = make("document-search-count", "span");
  count.setAttribute("aria-live", "polite");
  row.append(count);
  button(row, "close", "Close (Escape)", () => close()).className = "document-search-close";
  dom.append(row);

  // Not isConnected: a preview tab that is not shown is out of the document, and its bar is still open (a re-render there must count again).
  const isOpen = () => dom.parentNode === element;
  const clear = () => { painted = repaint(others, current, painted, [], -1); };
  /** Marks, count and toggles from `ranges` and `index`. */
  const paint = (scroll: boolean) => {
    painted = repaint(others, current, painted, ranges, index);
    count.textContent = invalid ? "Invalid regex" : `${index + 1}/${ranges.length}`;
    find.setAttribute("aria-invalid", String(invalid));
    for (const [el, option] of options) el.setAttribute("aria-pressed", String(option === "wholeWord" ? wholeWordOn(query) : query[option]));
    const r = ranges[index];
    if (!scroll || !r) return;
    // Bring the match to the middle of what the bar leaves visible, when it is not in view.
    const rect = r.getBoundingClientRect(), box = element.getBoundingClientRect(), top = dom.getBoundingClientRect().bottom;
    if (rect.top < top || rect.bottom > box.bottom) element.scrollTop += (rect.top + rect.bottom - top - box.bottom) / 2;
    if (rect.left < box.left || rect.right > box.right) element.scrollLeft += (rect.left + rect.right - box.left - box.right) / 2;
  };
  /** Finds again over the preview as it is now; `restart` (a new query) goes to the first match, otherwise the current one is kept. */
  const search = (restart: boolean) => {
    const { text, segments } = collect(body);
    const found = textMatches(text, query);
    invalid = found === null;
    ranges = (found ?? []).map(({ from, to }) => rangeOf(segments, from, to));
    index = ranges.length ? (restart ? 0 : Math.min(Math.max(index, 0), ranges.length - 1)) : -1;
    paint(restart);
  };
  const step = (by: number) => {
    if (!ranges.length) return;
    index = (index + by + ranges.length) % ranges.length;
    paint(true);
  };
  const toggle = (option: "caseSensitive" | "wholeWord" | "regexp") => {
    query = new SearchQuery({ ...query, ...(option === "wholeWord" ? { test: wholeWordOn(query) ? undefined : wholeWordTest } : { [option]: !query[option] }) });
    search(true);
  };
  // A re-render (an edit of the source), or a formula, diagram or code colour drawn later, replaces the text the ranges point at.
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; if (isOpen()) search(false); });
  });
  const open = () => {
    // As the editor's bar: a selection on one line becomes the query.
    const selection = getSelection(), seed = selection?.toString() ?? "";
    if (seed && !seed.includes("\n") && selection?.anchorNode && body.contains(selection.anchorNode)) { query = new SearchQuery({ ...query, search: seed }); find.value = seed; }
    if (!isOpen()) {
      element.prepend(dom);
      observer.observe(body, { childList: true, subtree: true, characterData: true });
    }
    search(true);
    find.focus();
    find.select();
  };
  const close = () => {
    if (!isOpen()) return false;
    observer.disconnect();
    clear();
    ranges = [];
    dom.remove();
    element.focus();
    return true;
  };

  return {
    run: (action) => {
      switch (action) {
        case "editor::Find": open(); return true;
        case "editor::FindNext": case "editor::FindPrevious":
          if (!isOpen()) { open(); return true; } // marks show only with the bar, so F3 opens it
          step(action === "editor::FindNext" ? 1 : -1);
          return true;
        case "editor::SearchCaseSensitive": case "editor::SearchWholeWord": case "editor::SearchRegexp":
          if (!isOpen()) return false;
          toggle(action === "editor::SearchCaseSensitive" ? "caseSensitive" : action === "editor::SearchWholeWord" ? "wholeWord" : "regexp");
          return true;
        case "editor::Cancel": return close();
        default: return false;
      }
    },
    dispose: () => { observer.disconnect(); clear(); },
  };
}
