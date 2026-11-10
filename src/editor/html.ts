import { localImagePath } from "./markdown.ts";

// core v0.8 I-1: HTML preview. The page is shown in `<iframe sandbox="allow-same-origin" srcdoc>` (no scripts, forms, popups or
// navigation, M-12). Here the text is made inert a second time and every local file it names is pointed at the asset protocol
// (M-8: relative to the HTML file, or absolute, anywhere). Internet resources are dropped: no request is the rule, CSP only backs it.

type Convert = (path: string) => string; // local path -> asset URL (convertFileSrc), injected so this file runs under node

const clean = (value: string) => value.replace(/[\t\n\r]/g, "").trim();

/** The URL a resource attribute becomes: `#id` as it is, a local file as its asset URL, null (drop it) for anything else (any scheme, `//host`, javascript:, empty). */
export function resourceUrl(value: string, sourcePath: string, convert: Convert): string | null {
  const v = clean(value);
  if (v === "") return null;
  if (v.startsWith("#")) return v;
  const path = localImagePath(v, sourcePath);
  return path === null ? null : convert(path);
}

/**
 * CSS text with `@import` removed and every `url(...)` pointed at its asset URL (`url("")` for what is dropped).
 * shortcut: the inside of a linked CSS file is not rewritten (its relative url() cannot resolve against an asset URL, M-7);
 * add a read-and-rewrite step for linked CSS only if such pages must show their CSS images.
 */
export function rewriteCss(css: string, sourcePath: string, convert: Convert): string {
  return css
    .replace(/@import\b[^;{}]*;?/gi, "")
    .replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]*))\s*\)/gi, (_, a, b, c) => `url("${resourceUrl(a ?? b ?? c ?? "", sourcePath, convert) ?? ""}")`);
}

/** A `srcset` value with each candidate pointed at its asset URL; candidates that are dropped leave out. */
export function rewriteSrcset(value: string, sourcePath: string, convert: Convert): string {
  const kept: string[] = [];
  for (const candidate of value.split(",")) {
    const [url, ...descriptor] = candidate.trim().split(/\s+/);
    const to = url ? resourceUrl(url, sourcePath, convert) : null;
    if (to) kept.push([to, ...descriptor].join(" "));
  }
  return kept.join(", ");
}

const DROP_TAGS = "script, base, iframe, frame, frameset, embed, object, applet";
const URL_ATTRS = new Set(["src", "href", "xlink:href", "poster", "data", "background", "action", "formaction"]);
/**
 * An attribute that makes the preview navigate (a link, a form target): dropped whole, `#id` too, because in a srcdoc frame
 * `#id` resolves against the app's own URL and loads the app page into the preview. `#id` references that do not navigate
 * (`<use href="#id">`) are kept by resourceUrl.
 */
export const navigates = (tag: string, attr: string): boolean => (attr === "href" || attr === "xlink:href") && (tag === "a" || tag === "area") || attr === "action" || attr === "formaction";

/** The inert document for `srcdoc`: HTML `text` of the file at `sourcePath`, parsed and rewritten (the DOMParser tree is never in the page). */
export function htmlSrcdoc(text: string, sourcePath: string, convert: Convert): string {
  const doc = new DOMParser().parseFromString(text, "text/html");
  for (const el of doc.querySelectorAll(DROP_TAGS)) el.remove();
  for (const el of doc.querySelectorAll('meta[http-equiv="refresh" i]')) el.remove();
  for (const link of doc.querySelectorAll("link")) {
    if (!link.relList.contains("stylesheet")) link.remove();
    else for (const name of ["crossorigin", "integrity"]) link.removeAttribute(name); // an asset URL is cross-origin: a CORS-mode request would fail
  }
  for (const style of doc.querySelectorAll("style")) style.textContent = rewriteCss(style.textContent ?? "", sourcePath, convert);
  for (const el of doc.querySelectorAll("*")) {
    for (const { name, value } of [...el.attributes]) {
      const n = name.toLowerCase();
      if (n.startsWith("on") || n === "ping") el.removeAttribute(name);
      else if (n === "style") el.setAttribute(name, rewriteCss(value, sourcePath, convert));
      else if (n === "srcset") {
        const set = rewriteSrcset(value, sourcePath, convert);
        if (set) el.setAttribute(name, set);
        else el.removeAttribute(name);
      } else if (URL_ATTRS.has(n)) {
        const to = navigates(el.localName, n) ? null : resourceUrl(value, sourcePath, convert);
        if (to) el.setAttribute(name, to);
        else el.removeAttribute(name);
      }
    }
  }
  return (doc.doctype ? "<!DOCTYPE html>" : "") + doc.documentElement.outerHTML;
}
