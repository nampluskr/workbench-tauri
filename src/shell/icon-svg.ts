/** SVG source by icon name, filled by Icon.tsx; kept here so DOM code (the CM search panel) shares it and tests need no `?raw`. */
export const iconMarkup: Record<string, string> = {};

/** Preserve transparent areas while letting the theme color every painted SVG shape. */
export function themedSvg(svg: string | undefined): string {
  return (svg ?? "").replace(/\b(fill|stroke)="(?!none")[^"]*"/g, '$1="currentColor"');
}

/** The same markup `<Icon>` renders, for DOM-built UI. */
export function iconElement(name: string): HTMLElement {
  const span = document.createElement("span");
  span.className = "icon";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = themedSvg(iconMarkup[name]);
  return span;
}
