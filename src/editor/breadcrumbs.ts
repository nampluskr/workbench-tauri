// I-12: the path row of an editor tab (Zed editor.rs:11682 breadcrumbs_inner + element.rs:7131 render_breadcrumb_text).
// Segments: the file's path, then the Markdown headings or (other languages) the outline symbols that contain the cursor.

/** element.rs:7134 MAX_SEGMENTS: a longer row keeps the first six and the last six segments with a "⋯" between. */
export const MAX_CRUMB_SEGMENTS = 12;

/**
 * The file's path as Zed's `resolve_file_path` shows it: under the folder, with backslashes; the folder's name first when more
 * than one folder is open. A file outside the folder shows only its name (a single-file worktree in Zed).
 */
export function pathCrumb(root: string, rootName: string, path: string, includeRoot: boolean): string {
  const prefix = root.endsWith("\\") ? root : root + "\\";
  if (!path.startsWith(prefix)) return path.slice(path.lastIndexOf("\\") + 1);
  const rest = path.slice(prefix.length);
  return includeRoot ? `${rootName}\\${rest}` : rest;
}

/**
 * The Markdown headings that contain `cursorLine` (0-based), outermost first, each as the source shows it ("## Title").
 * Zed's markdown outline query (grammars/src/markdown/outline.scm) has ATX headings only, so a setext heading ("Title" over
 * "====") is not a crumb. Fenced code and a leading `---` front matter block hold no headings.
 * shortcut: a heading inside a block quote or list is not a crumb; Zed's tree-sitter sections would not nest it either.
 */
export function markdownCrumbs(lines: string[], cursorLine: number): string[] {
  const stack: { level: number; text: string }[] = [];
  let i = 0;
  if (lines[0]?.trimEnd() === "---") {
    const close = lines.findIndex((line, at) => at > 0 && line.trimEnd() === "---");
    if (close > 0) i = close + 1;
  }
  let fence: { char: string; length: number } | null = null;
  for (; i <= cursorLine && i < lines.length; i++) {
    const line = lines[i];
    const open = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      if (open && open[1][0] === fence.char && open[1].length >= fence.length && line.trim() === open[1]) fence = null;
      continue;
    }
    if (open) { fence = { char: open[1][0], length: open[1].length }; continue; }
    const heading = /^ {0,3}(#{1,6})(?:[ \t]+(.*))?$/.exec(line.trimEnd());
    if (!heading) continue;
    const level = heading[1].length;
    const title = (heading[2] ?? "").replace(/(?:^|[ \t]+)#+$/, "").trim(); // an optional closing run of #
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    stack.push({ level, text: title ? `${heading[1]} ${title}` : heading[1] });
  }
  return stack.map((h) => h.text);
}

/** element.rs:7140: more than MAX_CRUMB_SEGMENTS segments become the first half, "⋯" and the last half. */
export function elideCrumbs<T = string>(segments: T[], gap = "⋯" as T): T[] {
  const half = MAX_CRUMB_SEGMENTS / 2;
  const prefixEnd = Math.min(segments.length, half);
  const suffixStart = Math.max(prefixEnd, segments.length - half);
  return suffixStart > prefixEnd ? [...segments.slice(0, prefixEnd), gap, ...segments.slice(suffixStart)] : segments;
}
