import { MATH_DISPLAY, MATH_INLINE, texOf } from "../editor/math.ts";
import { previewAppearance } from "../theme/apply.ts";

// core v0.8 I-4 / I-5: formulas and diagrams of a rendered preview. Until they are drawn the source stays in place
// (`$x$` text, the mermaid code block); KaTeX and Mermaid are imported only when a document has one (M-3), and `current`
// says whether the render that asked is still the newest (a late result must not replace newer content).

const firstLine = (e: unknown) => String(e instanceof Error ? e.message : e).split("\n")[0];

const note = (className: string, text: string): HTMLElement => {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
};

/**
 * Formulas as MathML (the WebView draws it itself: no KaTeX CSS, no font files, nothing to download). `trust: false` keeps
 * `\href`, `\url`, `\includegraphics` and `\htmlClass` from making links or attributes, and KaTeX escapes all text it writes,
 * so its string goes in as it is (DOMPurify would drop `<semantics>`/`<annotation>` and leave the TeX as stray text).
 * A formula KaTeX cannot parse keeps its source, in the error colour, with the message after it.
 */
export async function drawMath(body: HTMLElement, current: () => boolean): Promise<void> {
  const nodes = [...body.querySelectorAll<HTMLElement>(`.${MATH_INLINE}, .${MATH_DISPLAY}`)];
  if (!nodes.length) return;
  const { default: katex } = await import("katex");
  if (!current()) return;
  for (const el of nodes) {
    const display = el.classList.contains(MATH_DISPLAY);
    try {
      el.innerHTML = katex.renderToString(texOf(el.textContent ?? "", display), { output: "mathml", displayMode: display, throwOnError: true, trust: false, strict: "ignore" });
    } catch (e) {
      el.classList.add("math-error");
      el.append(note("math-error-note", ` ${firstLine(e).replace(/^KaTeX parse error: /, "")}`));
    }
  }
}

const DIAGRAM_CACHE_MAX = 32;
const diagrams = new Map<string, string>(); // theme + source -> svg: a re-render of an unchanged diagram does not wait for Mermaid

/** The Mermaid svg in a box. `securityLevel: "strict"` has Mermaid sanitize it (DOMPurify) and drop click callbacks; its links lose their href here. */
function diagramBox(svg: string, code: HTMLElement): HTMLElement {
  const box = document.createElement("div");
  box.className = "mermaid-diagram";
  for (const name of ["data-line", "data-line-end"]) { // the block keeps its place for the position link
    const value = code.getAttribute(name);
    if (value !== null) box.setAttribute(name, value);
  }
  box.innerHTML = svg;
  // The `<a>` stays: Mermaid puts a node's position (transform) and class on it. Without a href it is no link, and the preview's click handler skips it.
  for (const link of box.querySelectorAll("a")) for (const name of ["href", "xlink:href", "target"]) link.removeAttribute(name);
  return box;
}

let diagramId = 0;

/** ```` ```mermaid ```` blocks as diagrams: dark preview theme -> Mermaid `dark`, otherwise `default`. A syntax error keeps the block and says why in one line. */
export async function drawMermaid(body: HTMLElement, current: () => boolean): Promise<void> {
  const blocks = [...body.querySelectorAll<HTMLElement>("pre > code.language-mermaid")];
  if (!blocks.length) return;
  const theme = previewAppearance === "dark" ? "dark" : "default";
  const todo: HTMLElement[] = [];
  for (const code of blocks) {
    const svg = diagrams.get(`${theme}\n${code.textContent}`);
    if (svg === undefined) todo.push(code);
    else code.parentElement?.replaceWith(diagramBox(svg, code));
  }
  if (!todo.length) return;
  const { default: mermaid } = await import("mermaid");
  if (!current()) return;
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme, suppressErrorRendering: true });
  for (const code of todo) {
    const pre = code.parentElement;
    const source = code.textContent ?? "";
    try {
      const { svg } = await mermaid.render(`mermaid-diagram-${++diagramId}`, source);
      if (diagrams.size >= DIAGRAM_CACHE_MAX) diagrams.delete(diagrams.keys().next().value!);
      diagrams.set(`${theme}\n${source}`, svg);
      if (!current() || !pre?.isConnected) return;
      pre.replaceWith(diagramBox(svg, code));
    } catch (e) {
      if (!current() || !pre?.isConnected) return;
      const line = document.createElement("p");
      line.className = "mermaid-error";
      line.textContent = firstLine(e);
      pre.after(line);
    }
  }
}
