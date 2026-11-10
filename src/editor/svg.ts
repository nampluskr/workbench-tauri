import DOMPurify from "dompurify";

// core v0.8 I-6: SVG preview. CSP `img-src 'self'` blocks data:/blob: <img>, so the SVG is sanitized and put in the DOM.
// DOMPurify's SVG profile already drops <script>, on* attributes and javascript: URLs; this adds what it keeps by default.

export const SVG_FORBID_TAGS = ["script", "style", "foreignObject"];
export const SVG_FORBID_ATTR = ["style"];

/** An attribute that would fetch something outside the document: an href that is not a `#id`, or a `url(...)` that is not a `#id`. */
export function loadsExternal(name: string, value: string): boolean {
  if (name === "href" || name === "xlink:href") return !value.trim().startsWith("#");
  return /url\(\s*["']?\s*(?!#)/i.test(value);
}

/** The preview element for SVG `text`, or null when it holds no <svg>. */
export function svgElement(text: string): SVGSVGElement | null {
  const strip = (node: Element) => {
    for (const { name, value } of [...node.attributes]) if (loadsExternal(name, value)) node.removeAttribute(name);
  };
  DOMPurify.addHook("afterSanitizeAttributes", strip);
  let html: string;
  try {
    html = DOMPurify.sanitize(text, { USE_PROFILES: { svg: true }, FORBID_TAGS: SVG_FORBID_TAGS, FORBID_ATTR: SVG_FORBID_ATTR });
  } finally {
    DOMPurify.removeHook("afterSanitizeAttributes", strip);
  }
  const template = document.createElement("template");
  template.innerHTML = html;
  const svg = template.content.querySelector("svg");
  if (!svg) return null;
  // A picture is never scaled up: an svg with only a viewBox would fill the width, so it gets the viewBox width (CSS max-width then shrinks big ones).
  const box = svg.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number);
  if (!svg.hasAttribute("width") && box?.length === 4 && box[2] > 0) svg.setAttribute("width", String(box[2]));
  return svg;
}
