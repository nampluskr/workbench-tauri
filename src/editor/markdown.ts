import MarkdownIt from "markdown-it";
import { previewKind } from "./preview-kind.ts";

// Markdown preview rendering (R-11, D-10): markdown-it with HTML pass-through off. Every block carries the source lines it
// came from (data-line, data-line-end: 0-based start, end exclusive) for I-083 / I-084. Table alignment is a class, not
// a style attribute. The caller sanitizes the result with DOMPurify before it goes into the page.

const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
md.core.ruler.push("source_lines_and_align", (state) => {
  for (const token of state.tokens) {
    if (token.map && token.nesting !== -1) {
      token.attrSet("data-line", String(token.map[0]));
      token.attrSet("data-line-end", String(token.map[1]));
    }
    // GFM table cells come with style="text-align:…" (L-107 keeps the alignment): a class instead.
    if ((token.type === "th_open" || token.type === "td_open") && token.attrs) {
      const align = token.attrGet("style")?.match(/text-align:\s*(left|center|right)/)?.[1];
      token.attrs = token.attrs.filter(([name]) => name !== "style");
      if (align) token.attrSet("class", `align-${align}`);
    }
  }
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

/** HTML of the whole preview. The frontmatter lines are blanked for markdown-it so its line numbers stay the file's. */
export function renderMarkdown(text: string): string {
  const front = frontmatterOf(text);
  if (!front) return md.render(text);
  const lines = text.split("\n");
  const rest = [...lines.slice(0, front.end).map(() => ""), ...lines.slice(front.end)].join("\n");
  const at = `data-line="0" data-line-end="${front.end}"`;
  const rows = frontmatterRows(front.lines);
  const head = rows
    ? `<div class="frontmatter" ${at}>${rows.map(([k, v]) => `<div class="fm-key">${escape(k)}</div><div class="fm-value">${escape(v)}</div>`).join("")}</div>`
    : `<pre class="frontmatter-raw" ${at}><code>${escape(front.lines.join("\n"))}</code></pre>`;
  return head + md.render(rest);
}

/** I-083: of the blocks (start, end exclusive), the innermost one holding `line`; -1 when none. */
export function blockAt(blocks: { start: number; end: number }[], line: number): number {
  let best = -1;
  blocks.forEach((b, i) => {
    if (b.start <= line && line < b.end && (best < 0 || b.end - b.start <= blocks[best].end - blocks[best].start)) best = i;
  });
  return best;
}

export type LinkTarget = { kind: "preview" | "open"; path: string } | { kind: "external"; url: string } | { kind: "anchor"; id: string };

/**
 * I-085: what a preview link does. A URL with `://` (or mailto:) opens outside. A local Markdown file opens in a preview,
 * relative to the source file's folder; with Alt that is skipped and the file opens as an editor tab. Other local files
 * open as editor tabs. `#x` scrolls to a heading of this preview.
 */
export function classifyLink(href: string, sourcePath: string, alt: boolean): LinkTarget {
  if (href.includes("://") || /^mailto:/i.test(href)) return { kind: "external", url: href };
  if (href.startsWith("#")) return { kind: "anchor", id: decodeURIComponent(href.slice(1)) };
  const raw = decodeURIComponent(href.replace(/[?#].*$/, ""));
  const parts = /^[a-z]:[\\/]/i.test(raw) ? [] : sourcePath.split("\\").slice(0, -1); // absolute Windows path, else relative
  for (const piece of raw.split(/[\\/]/)) {
    if (piece === "" || piece === ".") continue;
    if (piece === "..") {
      if (parts.length > 1) parts.pop();
    } else parts.push(piece);
  }
  const path = parts.join("\\");
  return { kind: !alt && previewKind(path) === "markdown" ? "preview" : "open", path };
}
