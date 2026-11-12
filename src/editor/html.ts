import { localImagePath } from "./markdown.ts";

// core v0.8 I-1 / v0.8.1 I-7: HTML preview. The page is its own document at `http://preview.localhost/<id>` (src-tauri
// preview.rs) in `<iframe sandbox="allow-scripts" csp=PREVIEW_CSP>`: its scripts run in an opaque origin (no parent DOM, no
// storage, no IPC origin), with no forms, popups, modals or top navigation. Every local file the page names is pointed at the
// asset protocol (M-8: relative to the HTML file, or absolute, anywhere); internet resources are dropped from the markup and
// PREVIEW_CSP blocks what scripts ask for (no request at all, I-7 condition 3).

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

/**
 * The frame document's policy, as its first `<meta>` and as the frame's `csp` attribute (the response must accept it, so the
 * frame cannot be navigated to an asset URL, which has no policy). No connect, frame or worker source and no internet source:
 * scripts, styles, images, fonts and media come inline or from local files only.
 */
export const PREVIEW_CSP = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' asset: http://asset.localhost; style-src 'unsafe-inline' asset: http://asset.localhost; img-src data: blob: asset: http://asset.localhost; font-src data: asset: http://asset.localhost; media-src asset: http://asset.localhost; connect-src 'none'; form-action 'none'; base-uri 'none'";

const DROP_TAGS = "base, iframe, frame, frameset, embed, object, applet";
const URL_ATTRS = new Set(["src", "href", "xlink:href", "poster", "data", "background", "action", "formaction"]);
/**
 * An attribute that makes the preview navigate (a link, a form target): dropped whole, except a link's `#id`, which scrolls
 * within the page (the document has its own URL, so it no longer resolves against the app's). `#id` references that do not
 * navigate (`<use href="#id">`) are kept by resourceUrl.
 */
export const navigates = (tag: string, attr: string, value: string): boolean =>
  (attr === "href" || attr === "xlink:href") && (tag === "a" || tag === "area") ? !clean(value).startsWith("#") : attr === "action" || attr === "formaction";

/** What an attribute becomes: its new value, null to drop it, undefined to keep it as it is (event handlers too: scripts run, I-7). */
export function attributeValue(tag: string, name: string, value: string, sourcePath: string, convert: Convert): string | null | undefined {
  if (name === "ping") return null;
  if (name === "style") return rewriteCss(value, sourcePath, convert);
  if (name === "srcset") return rewriteSrcset(value, sourcePath, convert) || null;
  if (!URL_ATTRS.has(name)) return undefined;
  return navigates(tag, name, value) ? null : resourceUrl(value, sourcePath, convert);
}

/** The applied Preview theme as the HTML preview needs it: the same tokens as the Markdown preview (text, L-108 link colour). */
export type PreviewLook = { appearance: "light" | "dark"; text: string; accent: string };

/**
 * core v0.8 I-11: page defaults from the Preview theme. Every selector is `:where()` (specificity 0), so any rule, `<link>`,
 * `<style>` or `style=` of the page wins (M-7); only the page's own absence of a value shows these. The background is not here:
 * it is the iframe element's (`.html-frame` in app.css), so a page `body { background }` still reaches the canvas. The
 * `color-scheme` must equal the element's (`--preview-color-scheme`), or Chromium paints an opaque canvas over that background.
 */
export function defaultStyle({ appearance, text, accent }: PreviewLook): string {
  return `:where(:root){color-scheme:${appearance}}:where(html){color:${text}}:where(a){color:${accent}}`;
}

/**
 * What goes first in the frame's `<head>`: the policy, the I-11 defaults, and a script that keeps the scroll across re-renders
 * (the parent cannot read a cross-origin frame's scroll: the frame reports it, and the next document starts at `scrollY`).
 */
export function headStart(look: PreviewLook, scrollY: number): string {
  const top = Number.isFinite(scrollY) && scrollY > 0 ? Math.round(scrollY) : 0;
  return `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}"><style>${defaultStyle(look)}</style>`
    + `<script>addEventListener("load",()=>scrollTo(0,${top}));addEventListener("scroll",()=>parent.postMessage({previewScrollY:scrollY},"*"),{passive:true})</script>`;
}

/** `serialized` (an `outerHTML` of a parsed document) with `html` as the first children of `<head>`, ahead of every page element. */
export function withHead(serialized: string, html: string): string {
  // The serializer writes attribute values in double quotes only, so a `>` inside one cannot end the tag early here.
  const head = /^<html(?:"[^"]*"|[^>"])*>\s*<head(?:"[^"]*"|[^>"])*>/i.exec(serialized);
  return head ? head[0] + html + serialized.slice(head[0].length) : html + serialized;
}

/**
 * The frame document: HTML `text` of the file at `sourcePath`, parsed and rewritten (the DOMParser tree is inert and never in the app).
 * shortcut: only the markup's URLs are rewritten; a relative URL a script builds resolves against the preview URL and gets
 * nothing (204). Serve local files from the preview scheme if scripted pages must load them.
 */
export function htmlPreviewDoc(text: string, sourcePath: string, convert: Convert, look: PreviewLook, scrollY: number): string {
  const doc = new DOMParser().parseFromString(text, "text/html");
  for (const el of doc.querySelectorAll(DROP_TAGS)) el.remove();
  for (const el of doc.querySelectorAll('meta[http-equiv="refresh" i]')) el.remove();
  for (const link of doc.querySelectorAll("link")) {
    if (!link.relList.contains("stylesheet")) link.remove();
    else for (const name of ["crossorigin", "integrity"]) link.removeAttribute(name); // an asset URL is cross-origin: a CORS-mode request would fail
  }
  // shortcut: a module `<script src>` always loads in CORS mode and the asset protocol allows only the app's origin, so it does
  // not run; serve local files from the preview scheme if such pages must run.
  for (const script of doc.querySelectorAll("script")) for (const name of ["crossorigin", "integrity"]) script.removeAttribute(name);
  for (const style of doc.querySelectorAll("style")) style.textContent = rewriteCss(style.textContent ?? "", sourcePath, convert);
  for (const el of doc.querySelectorAll("*")) {
    for (const { name, value } of [...el.attributes]) {
      const to = attributeValue(el.localName, name.toLowerCase(), value, sourcePath, convert);
      if (to) el.setAttribute(name, to);
      else if (to !== undefined) el.removeAttribute(name);
    }
  }
  return (doc.doctype ? "<!DOCTYPE html>" : "") + withHead(doc.documentElement.outerHTML, headStart(look, scrollY));
}
