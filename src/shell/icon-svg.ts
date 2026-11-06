/** Preserve transparent areas while letting the theme color every painted SVG shape. */
export function themedSvg(svg: string | undefined): string {
  return (svg ?? "").replace(/\b(fill|stroke)="(?!none")[^"]*"/g, '$1="currentColor"');
}
