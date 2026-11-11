import type MarkdownIt from "markdown-it";

// core v0.8 I-4: `$…$` (inline) and `$$…$$` (display) in Markdown. This is only the split: a token becomes an element that
// holds the source text (`$x$`, shown as it is until KaTeX is loaded); the preview swaps it for the formula (markdown-preview.ts).
// Code spans and code blocks never reach these rules (markdown-it has taken them already); `\$` is consumed by its `escape` rule.
// shortcut: `\(…\)`, macros and equation numbers are not supported (M-7).

export const MATH_INLINE = "math-inline";
export const MATH_DISPLAY = "math-display";

const isSpace = (code: number) => code === 0x20 || code === 0x09 || code === 0x0a;
const isDigit = (code: number) => code >= 0x30 && code <= 0x39;

/** Where the closing `$` (or `$$`) of a formula opened at `from` is, or -1: the first unescaped one, and it must be a valid closer. */
function closerAt(src: string, from: number, max: number, double: boolean): number {
  for (let i = from; i < max; i++) {
    const code = src.charCodeAt(i);
    if (code === 0x5c) { i++; continue; } // `\x` is one unit: `\$` does not close
    if (code !== 0x24) continue;
    if (double) return src.charCodeAt(i + 1) === 0x24 && i > from ? i : -1;
    // `$ x$` (space before) and `$5 and $6` (digit after) are not formulas: the first `$` decides, no looking further.
    return isSpace(src.charCodeAt(i - 1)) || isDigit(src.charCodeAt(i + 1)) ? -1 : i;
  }
  return -1;
}

export function mathPlugin(md: MarkdownIt): void {
  md.inline.ruler.before("escape", "math_inline", (state, silent) => {
    const src = state.src;
    const start = state.pos;
    if (src.charCodeAt(start) !== 0x24) return false;
    const double = src.charCodeAt(start + 1) === 0x24;
    const open = start + (double ? 2 : 1);
    if (open >= state.posMax || (!double && isSpace(src.charCodeAt(open)))) return false;
    const close = closerAt(src, open, state.posMax, double);
    if (close < 0) return false;
    if (!silent) {
      const token = state.push("math_inline", "", 0);
      token.content = src.slice(start, close + (double ? 2 : 1)); // with the delimiters
      token.markup = double ? "$$" : "$";
    }
    state.pos = close + (double ? 2 : 1);
    return true;
  });

  // A display formula alone on its lines: `$$ x $$`, or `$$` … `$$` over several lines (the closing `$$` ends a line).
  md.block.ruler.before("fence", "math_block", (state, startLine, endLine, silent) => {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const line = (n: number) => state.src.slice(state.bMarks[n] + state.tShift[n], state.eMarks[n]).trimEnd();
    const first = line(startLine);
    if (!first.startsWith("$$")) return false;
    let last = startLine;
    if (!(first.length > 3 && first.endsWith("$$"))) { // not a one-line `$$ x $$`: look for the closing line
      while (++last < endLine && !line(last).endsWith("$$"));
      if (last >= endLine) return false;
    }
    if (silent) return true;
    const lines: string[] = [];
    for (let n = startLine; n <= last; n++) lines.push(line(n));
    const token = state.push("math_block", "div", 0);
    token.content = lines.join("\n");
    token.map = [startLine, last + 1];
    state.line = last + 1;
    return true;
  });

  const escape = md.utils.escapeHtml;
  md.renderer.rules.math_inline = (tokens, i) => {
    const { content, markup } = tokens[i];
    return `<span class="${markup === "$$" ? MATH_DISPLAY : MATH_INLINE}">${escape(content)}</span>`;
  };
  md.renderer.rules.math_block = (tokens, i, _options, _env, self) =>
    `<div class="${MATH_DISPLAY}"${self.renderAttrs(tokens[i])}>${escape(tokens[i].content)}</div>\n`;
}

/** The TeX inside the delimiters of a formula element's source text (`$x$` or `$$x$$`). */
export const texOf = (source: string, display: boolean): string => source.slice(display ? 2 : 1, display ? -2 : -1);
