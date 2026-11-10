/** Regexp mode of the Search tab: the page filters names (Rust has no regex crate). Null means an invalid pattern: zero results, no error. */
export function nameRegExp(pattern: string, { caseSensitive, wholeWord }: { caseSensitive: boolean; wholeWord: boolean }): RegExp | null {
  if (!pattern) return null;
  try {
    // shortcut: \w is ASCII, so a whole-word regexp treats Korean letters as boundaries; Rust's plain whole-word is Unicode.
    return new RegExp(wholeWord ? `(?<!\\w)(?:${pattern})(?!\\w)` : pattern, caseSensitive ? "" : "i");
  } catch {
    return null;
  }
}
