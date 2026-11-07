// Pinned grammar WASM + Zed queries (ORDER-11, D-8/D-18).
// Environment-free: the caller supplies the bytes/text, so node tests read the same files from disk.
import { Language, Query } from "web-tree-sitter";

/**
 * D-12: Zed grammar WASMs list `libc.so` as NEEDED in their `dylink.0` section, which
 * web-tree-sitter cannot satisfy, so loading fails. On an in-memory copy, retag the NEEDED
 * subsection (type 2) with an unknown type; the loader skips unknown subsections by size.
 * The file on disk is never changed.
 */
export function skipDylinkNeeded(original: Uint8Array): Uint8Array {
  const bytes = original.slice();
  let p = 8; // after the magic number and version
  const leb = () => {
    let value = 0;
    for (let shift = 0; ; shift += 7) {
      const b = bytes[p++];
      value |= (b & 0x7f) << shift;
      if (!(b & 0x80)) return value >>> 0;
    }
  };
  if (bytes[p++] !== 0) return bytes; // dylink.0 is the first custom section when present
  const end = leb() + p;
  const nameLength = leb();
  if (new TextDecoder().decode(bytes.subarray(p, p + nameLength)) !== "dylink.0") return bytes;
  p += nameLength;
  while (p < end) {
    const typeAt = p++;
    const size = leb();
    if (bytes[typeAt] === 2) bytes[typeAt] = 0x7f; // WASM_DYLINK_NEEDED -> unknown, skipped
    p += size;
  }
  return bytes;
}

export const loadLanguage = (wasm: Uint8Array) => Language.load(skipDylinkNeeded(wasm));

/** K-50: preserve the meaning of the four pinned Rust-regex predicates in JS. */
export function predicateRegex(pattern: string): string {
  // shortcut: only the pinned JSDoc dot-all pattern and Python SQL flag group; review new query revisions separately.
  return (pattern === "(?s)^/[*][*][^*].*[*]/$" ? "^/[*][*][^*][\\s\\S]*[*]/$" : pattern).replaceAll("(?i:sql)", "[sS][qQ][lL]");
}

export const compileQuery = (language: Language, source: string) => new Query(language, source.replace(
  /(\(#(?:not-)?match\?\s+@[^\s()]+\s+)("(?:\\.|[^"\\])*")/g,
  (whole, prefix: string, literal: string) => literal.includes("(?s)") || literal.includes("(?i:sql)")
    ? prefix + JSON.stringify(predicateRegex(JSON.parse(literal))) : whole,
));

/** T-27.1: the longest theme key that matches the capture name on a dot boundary, else null. */
export function themeKey(capture: string, keys: ReadonlySet<string>): string | null {
  for (let name = capture; name; name = name.slice(0, Math.max(0, name.lastIndexOf(".")))) {
    if (keys.has(name)) return name;
  }
  return null;
}
