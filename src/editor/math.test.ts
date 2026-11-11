import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { renderMarkdown } from "./markdown.ts";
import { texOf } from "./math.ts";
import { previewKind } from "./preview-kind.ts";

/** The formula elements `src` becomes, as `class:text`. */
const formulas = (src: string): string[] => [...renderMarkdown(src).matchAll(/<(?:span|div) class="(math-inline|math-display)"[^>]*>(.*?)<\/(?:span|div)>/gs)].map((m) => `${m[1]}:${m[2]}`);

test("I-4: `$…$` and `$$…$$` become formulas", () => {
  assert.deepEqual(formulas("a $E=mc^2$ b"), ["math-inline:$E=mc^2$"]);
  assert.deepEqual(formulas("$x$ and $y$"), ["math-inline:$x$", "math-inline:$y$"]);
  assert.deepEqual(formulas("a $$x$$ b"), ["math-display:$$x$$"]);
  assert.deepEqual(formulas("$$\\int_0^1 x\\,dx$$"), ["math-display:$$\\int_0^1 x\\,dx$$"]);
  assert.deepEqual(formulas("$$\n\\begin{matrix} a & b \\\\ c & d \\end{matrix}\n$$"), ["math-display:$$\n\\begin{matrix} a &amp; b \\\\ c &amp; d \\end{matrix}\n$$"]);
  assert.match(renderMarkdown("para\n\n$$\nx\n$$\n"), /<div class="math-display" data-line="2" data-line-end="5">/); // a display block keeps its source lines
  assert.equal(texOf("$x$", false), "x");
  assert.equal(texOf("$$x$$", true), "x");
});

test("I-4: money, spaces, escapes, code and unterminated `$` are not formulas", () => {
  for (const src of ["`$x$`", "``a $x$ b``", "```\n$x$\n```", "    $x$", "\\$5", "\\$x$", "$5 and $6", "$ x $", "$x $", "$x$5", "$x", "$$x", "$$\nx", "price $5", "$"]) {
    assert.deepEqual(formulas(src), [], src);
  }
  assert.deepEqual(formulas("$5 and $6 and $x$"), ["math-inline:$x$"]); // the first `$` decides: a bad closer does not reach for the next
  assert.deepEqual(formulas("$a \\$ b$"), ["math-inline:$a \\$ b$"]); // `\$` inside does not close
});

test("I-4: a broken formula does not stop the rest of the document", () => {
  assert.deepEqual(formulas("$\\frac{$ then $x$"), ["math-inline:$\\frac{$", "math-inline:$x$"]); // split here; KaTeX reports the first one
  assert.throws(() => katex.renderToString("\\frac{", { throwOnError: true }), /KaTeX parse error/);
});

test("I-4: with trust off KaTeX makes no link, no attribute from TeX, no request", () => {
  const options = { output: "mathml", throwOnError: true, trust: false, strict: "ignore" } as const;
  for (const tex of ["\\href{https://example.com}{x}", "\\url{https://example.com}", "\\includegraphics{https://example.com/a.png}", "\\htmlClass{evil}{x}", "\\htmlStyle{color:red}{x}"]) {
    const out = katex.renderToString(tex, options).replace(/<annotation.*<\/annotation>/s, ""); // the annotation holds the TeX as text
    assert.doesNotMatch(out, /href=|src=|<a |example.com|style=|class="evil"/, tex);
  }
  assert.match(katex.renderToString("E=mc^2", { ...options, displayMode: true }), /^<span class="katex"><math [^>]*display="block"/); // MathML only: no fonts, no HTML tree
});

test("I-5: `.mmd` and `.mermaid` files have a preview", () => {
  assert.equal(previewKind("C:\\a\\flow.mmd"), "mermaid");
  assert.equal(previewKind("flow.MERMAID"), "mermaid");
  assert.equal(previewKind("flow.mmd.txt"), null);
});
