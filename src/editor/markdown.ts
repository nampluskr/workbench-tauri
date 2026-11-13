import MarkdownIt from "markdown-it";
import { mathPlugin } from "./math.ts";
import { hasPreview } from "./preview-kind.ts";
import { MARKDOWN_PREVIEW_HEADING_SLUG_MAX_DUPLICATES } from "../spec/metrics.ts";

// Markdown preview rendering (R-11, D-10): markdown-it. Every block carries the source lines it came from (data-line,
// data-line-end: 0-based start, end exclusive) for I-083 / I-084. Table alignment is a class, not a style attribute.
// core v0.8.2 I-24: HTML in the text passes through as HTML. Nothing here makes it safe: the caller sanitizes the result with
// DOMPurify by the lists below before it goes into the page.

/**
 * core v0.8.2 I-24: the only tags and attributes a Markdown body keeps (markdown-it's own output and plain text HTML). Not in it,
 * so removed: script, style, iframe, form and its controls, object / embed, audio / video / source, svg, math, map / area, link,
 * meta, base; every on* attribute, style, id, name, srcset, and any data-* but the three this file writes.
 * An <img> src is then made a local file or removed (markdownTree); a link is only followed by classifyLink.
 */
export const MARKDOWN_HTML_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span", "br", "hr", "blockquote", "pre", "code", "kbd", "samp", "var",
  "em", "strong", "b", "i", "u", "s", "del", "ins", "mark", "small", "sub", "sup", "abbr", "cite", "q", "dfn", "time", "ruby", "rt", "rp", "wbr",
  "a", "img", "ul", "ol", "li", "dl", "dt", "dd", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "details", "summary", "figure", "figcaption", "center", "font"];
export const MARKDOWN_HTML_ATTR = ["href", "title", "src", "alt", "width", "height", "align", "valign", "colspan", "rowspan", "scope", "span",
  "start", "type", "reversed", "open", "class", "lang", "dir", "color", "size", "border", "cellpadding", "cellspacing",
  "data-line", "data-line-end", "data-heading"];

export type Heading = { level: number; text: string; line: number; html: boolean };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
/** The text of an HTML heading: from after its open tag (`rest` starts inside that tag) to its close tag, tags dropped. */
const htmlHeadingText = (rest: string): string => (/^[^>]*>([\s\S]*?)(?:<\/h[1-6]|$)/i.exec(rest)?.[1] ?? "")
  .replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name]);

const md = new MarkdownIt({ html: true, linkify: false, typographer: false }).use(mathPlugin); // I-4: `$…$` split here, drawn by the preview
md.core.ruler.push("source_lines_and_align", (state) => {
  // I-24: every heading, `#` or HTML, is numbered in document order (data-heading; a notebook goes on over its cells, so `env.headings`
  // comes in holding the earlier cells' ones). The Outline lists the same headings and scrolls to one by this number or by its line.
  const headings: Heading[] = (state.env.headings ??= []);
  state.tokens.forEach((token, i) => {
    // An HTML block is written out as it is, so its lines go into its text: on its first tag (the block: position link, M-1) and on
    // each heading tag (its own line). A comment is skipped. Written first in the tag, they win over the same attributes typed there.
    // shortcut: an <h1> typed inside a paragraph or a table cell (inline HTML) is drawn but gets no number: it is not in the Outline.
    if (token.type === "html_block" && token.map) {
      const [start, end] = token.map;
      token.content = token.content.replace(/<!--[\s\S]*?(?:-->|$)|<([a-z][a-z0-9]*)(?=[\s/>])/gi, (match, tag: string | undefined, at: number, all: string) => {
        if (!tag) return match;
        const first = all.slice(0, at).trim() === "";
        const level = /^h([1-6])$/i.exec(tag)?.[1];
        if (!first && !level) return match;
        const line = start + all.slice(0, at).split("\n").length - 1;
        let attrs = ` data-line="${first ? start : line}" data-line-end="${first ? end : line + 1}"`;
        if (level) {
          attrs += ` data-heading="${headings.length}"`;
          headings.push({ level: Number(level), text: htmlHeadingText(all.slice(at + match.length)), line, html: true });
        }
        return match + attrs;
      });
      return;
    }
    if (token.map && token.nesting !== -1) {
      token.attrSet("data-line", String(token.map[0]));
      token.attrSet("data-line-end", String(token.map[1]));
    }
    if (token.type === "heading_open" && token.map) {
      token.attrSet("data-heading", String(headings.length));
      headings.push({ level: Number(token.tag.slice(1)), text: state.tokens[i + 1]?.content ?? "", line: token.map[0], html: false });
    }
    // GFM table cells come with style="text-align:…" (L-107 keeps the alignment): a class instead.
    if ((token.type === "th_open" || token.type === "td_open") && token.attrs) {
      const align = token.attrGet("style")?.match(/text-align:\s*(left|center|right)/)?.[1];
      token.attrs = token.attrs.filter(([name]) => name !== "style");
      if (align) token.attrSet("class", `align-${align}`);
    }
  });
});
const escape = md.utils.escapeHtml;

/** L-110: the leading `---` block, if the file starts with one: its inner lines and the line after the closing `---`. */
export function frontmatterOf(text: string): { lines: string[]; end: number } | null {
  const lines = text.split("\n");
  if (lines[0]?.trimEnd() !== "---") return null;
  const close = lines.findIndex((line, i) => i > 0 && line.trimEnd() === "---");
  return close < 0 ? null : { lines: lines.slice(1, close), end: close + 1 };
}

/**
 * L-110: a two-column table only when every line is `key: value` that does not start with a space (both not empty);
 * anything else (an empty line, an indented line, a list) shows the block as it is.
 * shortcut: no YAML parser (D-10): nested YAML is never a table; add one only if such files must render as Zed does.
 */
export function frontmatterRows(lines: string[]): [string, string][] | null {
  if (lines.length === 0) return null;
  const rows: [string, string][] = [];
  for (const line of lines) {
    const m = /^(\S[^:]*?):\s+(\S.*)$/.exec(line.trimEnd());
    if (!m) return null;
    rows.push([m[1], m[2]]);
  }
  return rows;
}

/** The text markdown-it gets: the frontmatter lines blanked, so its line numbers stay the file's. */
function withoutFrontmatter(text: string, front: { end: number }): string {
  const lines = text.split("\n");
  return [...lines.slice(0, front.end).map(() => ""), ...lines.slice(front.end)].join("\n");
}

/** HTML of the whole preview (not sanitized). `headings` gets the text's headings added, numbered on from the ones it holds. */
export function renderMarkdown(text: string, headings: Heading[] = []): string {
  const front = frontmatterOf(text);
  if (!front) return md.render(text, { headings });
  const rest = withoutFrontmatter(text, front);
  const at = `data-line="0" data-line-end="${front.end}"`;
  const rows = frontmatterRows(front.lines);
  const head = rows
    ? `<div class="frontmatter" ${at}>${rows.map(([k, v]) => `<div class="fm-key">${escape(k)}</div><div class="fm-value">${escape(v)}</div>`).join("")}</div>`
    : `<pre class="frontmatter-raw" ${at}><code>${escape(front.lines.join("\n"))}</code></pre>`;
  return head + md.render(rest, { headings });
}

/**
 * core v0.8.1 I-4: the headings markdown-it finds (so the preview draws the same ones; a `#` in a code block is not one), in the
 * order renderMarkdown numbers them. core v0.8.2 I-24: the HTML headings of the body are among them (`html`).
 */
export function markdownHeadings(text: string): Heading[] {
  const headings: Heading[] = [];
  const front = frontmatterOf(text);
  md.parse(front ? withoutFrontmatter(text, front) : text, { headings });
  return headings;
}

/** I-083: of the blocks (start, end exclusive), the innermost one holding `line`; -1 when none. */
export function blockAt(blocks: { start: number; end: number }[], line: number): number {
  let best = -1;
  blocks.forEach((b, i) => {
    if (b.start <= line && line < b.end && (best < 0 || b.end - b.start <= blocks[best].end - blocks[best].start)) best = i;
  });
  return best;
}

/**
 * core v0.8.1 I-22: the ids of `#id` links, one per heading in document order (Zed util/src/markdown.rs generate_heading_slug and
 * markdown/src/parser.rs build_heading_slugs). The trimmed text keeps letters, digits, `-` and `_` (lowercased), a space becomes
 * `-`, anything else is dropped. A repeated id gets `-1`, `-2`... (skipping ids already taken); null for no id.
 */
export function headingSlugs(texts: string[]): (string | null)[] {
  const taken = new Set<string>();
  const counts = new Map<string, number>();
  return texts.map((text) => {
    const base = [...text.trim()].map((c) => (/[\p{Alphabetic}\p{N}_-]/u.test(c) ? [...c.toLowerCase()][0] : c === " " ? "-" : "")).join("");
    let n = counts.get(base) ?? 0;
    let slug = n === 0 ? base : `${base}-${n}`;
    for (n++; taken.has(slug); n++) {
      if (n >= MARKDOWN_PREVIEW_HEADING_SLUG_MAX_DUPLICATES) { slug = ""; break; }
      slug = `${base}-${n}`;
    }
    counts.set(base, n);
    if (!slug) return null;
    taken.add(slug);
    return slug;
  });
}

export type LinkTarget = { kind: "preview" | "open"; path: string } | { kind: "external"; url: string } | { kind: "anchor"; id: string };

/** `raw` (decoded, no query) as an absolute Windows path: taken as it is when absolute, else relative to the source file's folder. */
function resolveLocal(raw: string, sourcePath: string): string {
  const parts = /^[a-z]:[\\/]/i.test(raw) ? [] : sourcePath.split("\\").slice(0, -1); // absolute Windows path, else relative
  for (const piece of raw.split(/[\\/]/)) {
    if (piece === "" || piece === ".") continue;
    if (piece === "..") {
      if (parts.length > 1) parts.pop();
    } else parts.push(piece);
  }
  return parts.join("\\");
}

/**
 * core v0.8 I-3: the local file a preview image points at (relative to the Markdown file, or absolute; M-8: anywhere), or
 * null for a URL of any scheme (http, https, data, file...) or a malformed escape: those images are not shown.
 */
export function localImagePath(src: string, sourcePath: string): string | null {
  if ((/^[a-z][a-z0-9+.-]*:/i.test(src) && !/^[a-z]:[\\/]/i.test(src)) || src.startsWith("//")) return null;
  try {
    return resolveLocal(decodeURIComponent(src.replace(/[?#].*$/, "")), sourcePath);
  } catch {
    return null;
  }
}

/**
 * I-085 / core v0.8.2 I-20: what a clicked preview link does, the same in every preview. http(s) opens outside. A local file
 * (relative to the source file's folder, or absolute) that has a preview (preview-kind.ts) opens in its preview; with Alt it opens
 * as an editor tab ("open", whatever Lock Preview says: followLink). Other local files open as editor tabs. `#x` scrolls to a
 * heading of this preview. Null (nothing) for an empty link, `//host`, a malformed %-escape and every other scheme (file:,
 * javascript:, mailto:...).
 */
export function classifyLink(href: string, sourcePath: string, alt: boolean): LinkTarget | null {
  const v = href.replace(/[\t\n\r]/g, "").trim(); // as a browser reads a URL
  if (v === "" || v.startsWith("//")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v) && !/^[a-z]:[\\/]/i.test(v)) return /^https?:\/\//i.test(v) ? { kind: "external", url: v } : null;
  try {
    if (v.startsWith("#")) return { kind: "anchor", id: decodeURIComponent(v.slice(1)) };
    const path = resolveLocal(decodeURIComponent(v.replace(/[?#].*$/, "")), sourcePath);
    return { kind: !alt && hasPreview(path) ? "preview" : "open", path };
  } catch {
    return null;
  }
}
