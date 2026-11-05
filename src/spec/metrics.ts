// Zed metrics mirrored from spec/zed-metrics.toml (D-1). Keys are the toml item IDs
// (`section.key`); each becomes a CSS variable `--section-key` with `.`/`_` -> `-`.
const METRICS = {
  "typography.buffer_font_size": "15px", // L-08
  "editor.gutter.min_line_number_digits": "4", // E-002
  "editor.gutter.padding_left_ch": "3", // E-003
  "editor.gutter.padding_right_ch": "4", // E-004
  "editor.line_height.comfortable_multiplier": "1.618", // E-010
  "editor.selection.corner_radius_multiplier": "0.15", // E-015
  "scrollbar.width.editor": "15px", // E-030
} as const;

// System monospace stand-in; Lilex is out of scope (INTENT).
export const BUFFER_FONT_FAMILY = "Consolas, monospace";

/** Publish the metrics as CSS variables on :root (constructable sheet, no inline style). */
export function applyMetrics(): void {
  const vars = Object.entries(METRICS).map(
    ([id, value]) => `--${id.replace(/[._]/g, "-")}: ${value};`,
  );

  // E-005: gutter margin = |descent| of the buffer font. CSS cannot read it.
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${METRICS["typography.buffer_font_size"]} ${BUFFER_FONT_FAMILY}`;
  const descent = Math.abs(ctx.measureText("0").fontBoundingBoxDescent);
  vars.push(`--editor-gutter-margin: ${descent}px;`);

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`:root { ${vars.join(" ")} }`);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}
