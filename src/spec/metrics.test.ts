import test from "node:test";
import assert from "node:assert/strict";
import { applyMetrics } from "./metrics.ts";

test("E-005: wait for the bundled font before measuring the gutter margin", async (t) => {
  let loaded = false;
  let finishLoad!: () => void;
  const fontReady = new Promise<void>((resolve) => { finishLoad = resolve; });
  const sheets: object[] = [];
  const document = {
    fonts: { load: async () => { await fontReady; loaded = true; } },
    createElement: () => {
      assert.ok(loaded, "canvas measurement must use the loaded font");
      return { getContext: () => ({ font: "", measureText: () => ({ fontBoundingBoxDescent: 3 }) }) };
    },
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
  assert.match(css, /--editor-gutter-margin: 3px;/);
  await applyMetrics(20, 18);
  assert.equal(document.adoptedStyleSheets.length, 1, "font changes reuse the metric sheet");
  assert.match(css, /--units-rem-size: 20px; --typography-ui-font-size: 20px; --typography-buffer-font-size: 18px;/);
  // core v0.8.2 I-26: the four gaps are px at a 14px preview font and scale with it.
  const gaps = { paragraphLine: 7, paragraph: 14, listLine: 5.25, list: 3.5 };
  await applyMetrics(16, 14, 14, 14, 1.6, gaps);
  assert.match(css, /--preview-paragraph-line-gap: 7px; --preview-paragraph-gap: 14px; --preview-list-line-gap: 5.25px; --preview-list-gap: 3.5px;/);
  await applyMetrics(16, 14, 14, 28, 1.6, gaps);
  assert.match(css, /--preview-paragraph-line-gap: 14px; --preview-paragraph-gap: 28px; --preview-list-line-gap: 10.5px; --preview-list-gap: 7px;/);
});
