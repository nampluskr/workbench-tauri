import { SearchQuery } from "@codemirror/search";
import { FIND_BLOCKS, FIND_SKIP, repaint, textMatches } from "../editor/preview-find.ts";
import { wholeWordOn, wholeWordTest } from "../editor/search.ts";
import { iconElement } from "./icon-svg.ts";

// core v0.8.1 I-9: the find bar of a Markdown / notebook / CSV / TSV preview. It is the editor tab's bar (the same .document-search
// parts, labels and keys) without the replace row, select-all and find-in-selection, as Zed's preview bar. Matches are marked with the
// CSS Custom Highlight API, so the preview DOM is never changed (the position link, copy and the Outline scroll stay as they are).

// Every preview's marks share the two highlights; each preview adds and removes its own ranges.
const others = new Highlight(), current = new Highlight();
current.priority = 1;
CSS.highlights.set("preview-find", others);
CSS.highlights.set("preview-find-current", current);

type Segment = { node: Text; start: number };

/** The previewed text, blocks on lines of their own, with where each text node starts in it. */
function collect(body: HTMLElement): { text: string; segments: Segment[] } {
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, { acceptNode: (node) => node.parentElement?.closest(FIND_SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const segments: Segment[] = [];
  let text = "", block: Element | null | undefined;
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    if (!node.data) continue;
    const at = node.parentElement?.closest(FIND_BLOCKS);
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

type Found = readonly { from: number; to: number }[];

/** What a find bar looks through: a preview's own DOM (domFind), or an HTML preview's frame (core v0.8.2 I-25, markdown-preview.ts). */
export type FindTarget = {
  /** The previewed text as it is now, given to `done` (a frame answers later). */
  read: (done: (text: string) => void) => void;
  /** Marks over offsets of the text last read: `found[index]` is the current one (-1: none), brought into view with `scroll`. */
  mark: (found: Found, index: number, scroll: boolean) => void;
  /** A selection on one line of the previewed text (a new bar starts with it as the query), or "". */
  seed: () => string;
  /** `changed` is called when the previewed text was replaced; null stops that. */
  watch: (changed: (() => void) | null) => void;
};

/** The DOM of the preview `element` (the scroller) over `body`. `show` (core v0.8.2 I-18): the current match is in this node, which may be in a folded section. */
export function domFind(element: HTMLElement, body: HTMLElement, show: (node: Node) => void): FindTarget {
  // `painted` is what this preview has in the shared highlights.
  let segments: Segment[] = [], ranges: Range[] = [], painted: Range[] = [], marked: Found | null = null;
  // A re-render (an edit of the source), or a formula, diagram or code colour drawn later, replaces the text the ranges point at.
  let changed: (() => void) | null = null, queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; changed?.(); });
  });
  return {
    read: (done) => {
      const { text, segments: next } = collect(body);
      segments = next;
      done(text);
    },
    mark: (found, index, scroll) => {
      if (found !== marked) ranges = found.map(({ from, to }) => rangeOf(segments, from, to)); // a step keeps the ranges
      marked = found;
      painted = repaint(others, current, painted, ranges, index);
      const r = ranges[index];
      if (!scroll || !r) return;
      show(r.startContainer);
      // Bring the match to the middle of what the bar leaves visible, when it is not in view.
      const rect = r.getBoundingClientRect(), box = element.getBoundingClientRect(), top = element.querySelector(":scope > .preview-search")?.getBoundingClientRect().bottom ?? box.top;
      if (rect.top < top || rect.bottom > box.bottom) element.scrollTop += (rect.top + rect.bottom - top - box.bottom) / 2;
      if (rect.left < box.left || rect.right > box.right) element.scrollLeft += (rect.left + rect.right - box.left - box.right) / 2;
    },
    seed: () => {
      const selection = getSelection(), seed = selection?.toString() ?? "";
      return seed && !seed.includes("\n") && selection?.anchorNode && body.contains(selection.anchorNode) ? seed : "";
    },
    watch: (fn) => {
      changed = fn;
      if (fn) observer.observe(body, { childList: true, subtree: true, characterData: true }); else observer.disconnect();
    },
  };
}

export type PreviewSearch = { run: (action: string) => boolean; dispose: () => void };

/** The find bar of the preview `element`, looking through `target`. */
export function createPreviewSearch(element: HTMLElement, target: FindTarget): PreviewSearch {
  let query = new SearchQuery({ search: "", literal: true });
  let found: Found = [], index = -1, invalid = false;

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
  /** Marks, count and toggles from `found` and `index`. */
  const paint = (scroll: boolean) => {
    target.mark(found, index, scroll);
    count.textContent = invalid ? "Invalid regex" : `${index + 1}/${found.length}`;
    find.setAttribute("aria-invalid", String(invalid));
    for (const [el, option] of options) el.setAttribute("aria-pressed", String(option === "wholeWord" ? wholeWordOn(query) : query[option]));
  };
  /** Finds again over the preview as it is now; `restart` (a new query) goes to the first match, otherwise the current one is kept. */
  const search = (restart: boolean) => target.read((text) => {
    if (!isOpen()) return; // a frame's answer after the bar was closed
    const result = textMatches(text, query);
    invalid = result === null;
    found = result ?? [];
    index = found.length ? (restart ? 0 : Math.min(Math.max(index, 0), found.length - 1)) : -1;
    paint(restart);
  });
  const step = (by: number) => {
    if (!found.length) return;
    index = (index + by + found.length) % found.length;
    paint(true);
  };
  const toggle = (option: "caseSensitive" | "wholeWord" | "regexp") => {
    query = new SearchQuery({ ...query, ...(option === "wholeWord" ? { test: wholeWordOn(query) ? undefined : wholeWordTest } : { [option]: !query[option] }) });
    search(true);
  };
  const stop = () => { target.watch(null); target.mark(found = [], index = -1, false); };
  const open = () => {
    // As the editor's bar: a selection on one line becomes the query.
    const seed = target.seed();
    if (seed) { query = new SearchQuery({ ...query, search: seed }); find.value = seed; }
    if (!isOpen()) {
      element.prepend(dom);
      target.watch(() => search(false));
    }
    search(true);
    find.focus();
    find.select();
  };
  const close = () => {
    if (!isOpen()) return false;
    stop();
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
    dispose: stop,
  };
}
