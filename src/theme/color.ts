// Color helpers for theme JSON (T-01.7: "#RRGGBB" or "#RRGGBBAA"; 6 digits = alpha 1).

export interface Rgba {
  r: number;
  g: number;
  b: number;
  /** 0..1 */
  a: number;
}

export function parseColor(value: string): Rgba | null {
  const m = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(value.trim());
  if (!m) return null;
  const hex = m[1];
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: m[2] ? parseInt(m[2], 16) / 255 : 1 };
}

/** Source-over composite of `top` on an opaque `bottom`; result alpha 1. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const mix = (t: number, b: number) => Math.round(t * top.a + b * (1 - top.a));
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 };
}

const h2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function toHex(c: Rgba): string {
  const base = `#${h2(c.r)}${h2(c.g)}${h2(c.b)}`;
  return c.a >= 1 ? base : base + h2(c.a * 255);
}

/** CSS color string that keeps the alpha. */
export function toCss(c: Rgba): string {
  return c.a >= 1 ? toHex(c) : `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.round(c.a * 1000) / 1000})`;
}
