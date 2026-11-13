/** core v0.8.2 I-22: a code block's text without the blank lines (only spaces or tabs) at its start and end; blank lines inside stay. */
export function trimBlankLines(text: string): string {
  return trimBlankLinesIn([text])[0];
}

/**
 * I-22 for a code element that holds tags (HTML typed in the body, core v0.8.2 I-24): `parts` are its text nodes in order; each
 * comes back without what falls in the blank lines at the start and end of the whole text, so the tags around them stay.
 */
export function trimBlankLinesIn(parts: string[]): string[] {
  const lines = parts.join("").split("\n");
  const blank = (line: string) => /^[ \t]*\r?$/.test(line);
  let start = 0, end = lines.length;
  while (start < end && blank(lines[start])) start++;
  while (end > start && blank(lines[end - 1])) end--;
  const from = lines.slice(0, start).join("\n").length + (start ? 1 : 0);
  const to = from + lines.slice(start, end).join("\n").length;
  let at = 0;
  return parts.map((part) => {
    const offset = at;
    at += part.length;
    return part.slice(Math.max(from - offset, 0), Math.max(to - offset, 0));
  });
}

/**
 * core v0.8.2 I-22 / I-23: what a code block shows. `text` is the code's text and what Copy writes; `numbers` (1 at the first shown
 * line) goes in an attribute drawn by CSS, so it is never text: not in find, copy or a mouse selection.
 */
export function codeBlockParts(source: string): { text: string; numbers: string } {
  const text = trimBlankLines(source);
  const count = text ? text.split("\n").length : 0;
  return { text, numbers: Array.from({ length: count }, (_, i) => String(i + 1)).join("\n") };
}

/** A code block's language, from its `language-…` class (markdown-it's, and an HTML page's own, core v0.8.2 I-14); "" when it names none: the header then has the Copy button only. */
export const codeLanguage = (className: string): string => /(?:^|\s)language-(\S+)/.exec(className)?.[1] ?? "";
