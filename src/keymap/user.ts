import type { Keymap, KeymapSection } from "./engine.ts";

// User keymap.json (R-2, D-4, D-14): Zed's array-of-sections shape, JSONC allowed.
export const ERR_LOAD = "Failed to load keymap file"; // K-091
export const errNotFound = (name: string) => `Action '${name}' not found`; // K-085

/** Remove line and block comments and trailing commas, leaving string contents alone. */
export function stripJsonc(text: string): string {
  const out: string[] = [];
  let comma = -1; // index in `out` of a comma that only blanks/comments have followed so far
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
      out.push(text.slice(i, j + 1));
      comma = -1;
      i = j;
    } else if (c === "/" && text[i + 1] === "/") {
      while (i + 1 < text.length && text[i + 1] !== "\n") i++;
    } else if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      if (end < 0) { out.push(text.slice(i)); break; } // unterminated: JSON.parse rejects it
      out.push(" ");
      i = end + 1;
    } else {
      if (c === ",") comma = out.length;
      else if ((c === "}" || c === "]") && comma >= 0) { out[comma] = ""; comma = -1; }
      else if (!/\s/.test(c)) comma = -1;
      out.push(c);
    }
  }
  return out.join("");
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Valid sections plus one error line per bad item. A bad item is left out; the rest still applies (D-14). */
export function parseUserKeymap(text: string, isKnown: (name: string) => boolean): { sections: KeymapSection[]; errors: string[] } {
  const sections: KeymapSection[] = [];
  const errors: string[] = [];
  text = text.replace(/^﻿/, "");
  if (!text.trim()) return { sections, errors };
  let value: unknown;
  try {
    value = JSON.parse(stripJsonc(text));
  } catch {
    return { sections, errors: [ERR_LOAD] };
  }
  if (!Array.isArray(value)) return { sections, errors: [ERR_LOAD] };
  for (const section of value) {
    const context = isObject(section) ? section.context : undefined;
    if (!isObject(section) || !(context == null || typeof context === "string") || (section.bindings !== undefined && !isObject(section.bindings))) {
      errors.push(ERR_LOAD);
      continue;
    }
    const bindings: KeymapSection["bindings"] = {};
    for (const [keys, action] of Object.entries(section.bindings ?? {})) {
      if (action === null) bindings[keys] = null; // unbind (I-703)
      else if (typeof action !== "string") errors.push(ERR_LOAD); // actions take no arguments, so [name, args] is rejected
      else if (!isKnown(action)) errors.push(errNotFound(action));
      else bindings[keys] = action;
    }
    sections.push({ context: context as string | null | undefined, bindings });
  }
  return { sections, errors };
}

/** Lay the user's keymap over the others (A-27.1). Returns the error lines, empty when all is well. */
export function applyUserKeymap(keymap: Keymap, text: string, isKnown: (name: string) => boolean): string[] {
  const { sections, errors } = parseUserKeymap(text, isKnown);
  for (const section of sections) {
    try {
      keymap.addSections("user", [section]);
    } catch {
      errors.push(ERR_LOAD); // unparsable context predicate; nothing of this section was added
    }
  }
  return errors;
}
