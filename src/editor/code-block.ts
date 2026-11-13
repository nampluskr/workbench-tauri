/** core v0.8.2 I-22: a code block's text without the blank lines (only spaces or tabs) at its start and end; blank lines inside stay. */
export function trimBlankLines(text: string): string {
  const lines = text.split("\n");
  const blank = (line: string) => /^[ \t]*\r?$/.test(line);
  let start = 0, end = lines.length;
  while (start < end && blank(lines[start])) start++;
  while (end > start && blank(lines[end - 1])) end--;
  return lines.slice(start, end).join("\n");
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
