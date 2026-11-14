import test from "node:test";
import assert from "node:assert/strict";
import { applyMetrics } from "./metrics.ts";

test("wait for the bundled font before publishing the metrics", async (t) => {
  let loaded = false;
  let finishLoad!: () => void;
  const fontReady = new Promise<void>((resolve) => { finishLoad = resolve; });
  const sheets: object[] = [];
  const document = {
    fonts: { load: async () => { await fontReady; loaded = true; } },
    adoptedStyleSheets: sheets,
  };
  let css = "";
  for (const [name, value] of Object.entries({
    document,
    CSSStyleSheet: class { replaceSync(value: string) { css = value; } },
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, name, previous);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
  const applying = applyMetrics();
  assert.equal(document.adoptedStyleSheets.length, 0);
  finishLoad();
  await applying;
  assert.equal(document.adoptedStyleSheets.length, 1);
  assert.ok(loaded);
  assert.match(css, /--editor-line-number-font-size: 12px;/); // core v0.8.3 I-11
  await applyMetrics(20, 18);
  assert.equal(document.adoptedStyleSheets.length, 1, "font changes reuse the metric sheet");
  assert.match(css, /--units-rem-size: 20px; --typography-ui-font-size: 20px; --typography-buffer-font-size: 18px;/);
  // core v0.8.2 I-26: the four gaps are px at a 14px preview font and scale with it.
  const gaps = { paragraphLine: 7, paragraph: 14, listLine: 5.25, list: 3.5 };
  await applyMetrics(16, 14, 14, 14, 1.6, gaps);
  assert.match(css, /--preview-paragraph-line-gap: 7px; --preview-paragraph-gap: 14px; --preview-list-line-gap: 5.25px; --preview-list-gap: 3.5px;/);
  await applyMetrics(16, 14, 14, 28, 1.6, gaps);
  assert.match(css, /--preview-paragraph-line-gap: 14px; --preview-paragraph-gap: 28px; --preview-list-line-gap: 10.5px; --preview-list-gap: 7px;/);

  // core v0.8.3 I-9 / I-12: the text start with line numbers off (the preview body's left) and on (the gutters' width), from the published
  // values. The layout itself is CSS (editor/extensions.ts): gutters = max(body start, left padding + digits * 1ch + least right padding).
  const CH = 0.6; // JetBrains Mono: every glyph advances 0.6em
  const px = (name: string, previewFontSize: number): number => {
    const value = css.match(new RegExp(`--${name}: ([^;]+);`))![1];
    const scaled = value.match(/^calc\(([\d.]+) \* var\(--typography-preview-font-size\)\)$/);
    return scaled ? Number(scaled[1]) * previewFontSize : parseFloat(value);
  };
  const starts = async (lineNumberSize: number, bufferFontSize: number, previewFontSize: number, lines: number) => {
    await applyMetrics(16, bufferFontSize, bufferFontSize, previewFontSize, 1.6, gaps, { editor: "JetBrains Mono", preview: "JetBrains Mono", previewPercent: 86, previewLineHeight: 1.45, previewLineNumbers: false, lineNumberSize });
    const off = px("markdown-preview-container-padding", previewFontSize) + px("markdown-preview-left-margin", previewFontSize);
    const digits = Math.max(String(lines).length, px("editor-gutter-min-line-number-digits", 0));
    const gutter = px("editor-gutter-padding-left", 0) + digits * CH * px("editor-line-number-font-size", 0) + px("editor-gutter-padding-right", 0);
    return [off, Math.max(off, gutter)].map((value) => Math.round(value * 100) / 100);
  };
  assert.deepEqual(await starts(12, 14, 14, 100), [58, 58]); // the defaults: 10 + 28.8 + 19.2
  assert.deepEqual(await starts(16, 16, 14, 100), [58, 58]); // line numbers 16px (editor font 16): 10 + 38.4 + 9.6
  assert.deepEqual(await starts(12, 14, 18, 100), [74.57, 74.57]); // preview font 18px: 18 + 56.57, right of the number 35.77
  assert.deepEqual(await starts(12, 14, 14, 100000), [58, 61.2]); // six digits do not fit: 10 + 43.2 + 8, the text moves 3.2px
});
