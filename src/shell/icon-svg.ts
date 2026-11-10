/** SVG source by icon name, filled by Icon.tsx; kept here so DOM code (the CM search panel) shares it and tests need no `?raw`. */
export const iconMarkup: Record<string, string> = {};

/** Preserve transparent areas while letting the theme color every painted SVG shape. */
export function themedSvg(svg: string | undefined): string {
  return (svg ?? "").replace(/\b(fill|stroke)="(?!none")[^"]*"/g, '$1="currentColor"');
}

/**
 * I-32: a Zed copy with `width="16" height="16"` and no `viewBox` is not scaled when the icon box is smaller (14px in the find
 * bars): the 16-unit drawing is cut at the box and loses its right and bottom edge. The viewBox makes it scale like the others.
 */
export function scalable(svg: string | undefined): string | undefined {
  if (!svg || /\bviewBox=/.test(svg)) return svg;
  const size = /<svg\b[^>]*\bwidth="(\d+(?:\.\d+)?)"[^>]*\bheight="(\d+(?:\.\d+)?)"/.exec(svg);
  return size ? svg.replace("<svg", `<svg viewBox="0 0 ${size[1]} ${size[2]}"`) : svg;
}

/** The same markup `<Icon>` renders, for DOM-built UI. */
export function iconElement(name: string): HTMLElement {
  const span = document.createElement("span");
  span.className = "icon";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = themedSvg(iconMarkup[name]);
  return span;
}
