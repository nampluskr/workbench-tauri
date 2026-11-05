import { shortcutFor } from "../keymap/display.ts";
import { focusStack, keymap } from "../keymap/keyboard.ts";
import { TOOLTIP_CURSOR_OFFSET, TOOLTIP_DELAY_MS } from "../spec/metrics.ts";

// One tooltip for the whole window (D-5): a DOM box, shown after a delay at the pointer position (R-6).

/** One row: the title, plus the shortcut of `action` when the keymap has one, plus an optional meta line. */
export type Tip = { title: string; action?: string; meta?: string };
/** Several rows are drawn one under the other with a line between (L-232). Null means no tooltip now (L-205). */
export type TipSpec = Tip | Tip[] | null;

const specs = new WeakMap<Element, () => TipSpec>();
/** Give `el` a tooltip. The function runs when the tooltip is about to show, so it can read current state. */
export function tooltip(el: Element, spec: () => TipSpec): void {
  specs.set(el, spec);
}

type Size = { w: number; h: number };
type Point = { x: number; y: number };

/**
 * L-208~L-210: 1px right/below the pointer; past the right edge it flips to the left (clamped at 0),
 * past the bottom edge to above. `size` includes the transparent margin, `view` is the WebView inner size.
 */
export function placeTooltip(pointer: Point, size: Size, view: Size): Point {
  let { x, y } = { x: pointer.x + TOOLTIP_CURSOR_OFFSET.x, y: pointer.y + TOOLTIP_CURSOR_OFFSET.y };
  if (x + size.w > view.w) x = Math.max(0, pointer.x - size.w - TOOLTIP_CURSOR_OFFSET.x);
  if (y + size.h > view.h) y = pointer.y - size.h - TOOLTIP_CURSOR_OFFSET.y;
  return { x, y };
}

function element(tag: string, className: string, text?: string): HTMLElement {
  const el = document.createElement(tag);
  el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function row(tip: Tip): HTMLElement {
  const head = element("div", "tooltip-head");
  head.append(element("span", "tooltip-title", tip.title));
  const chunks = tip.action ? shortcutFor(keymap, tip.action, focusStack()) : undefined;
  if (chunks) {
    const shortcut = element("span", "tooltip-shortcut");
    // The plain spaces keep textContent readable ("Ctrl-K Ctrl-O"); flex layout ignores them.
    chunks.forEach((chunk, i) => shortcut.append(...(i ? [" "] : []), element("span", "tooltip-key", chunk)));
    head.append(" ", shortcut);
  }
  const el = element("div", "tooltip-row");
  el.append(head);
  if (tip.meta) el.append(element("div", "tooltip-meta", tip.meta));
  return el;
}

export function installTooltips(): void {
  // Position goes through an adopted sheet, not an inline style (AGENTS 5).
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  const outer = element("div", "tooltip");
  outer.hidden = true;
  document.body.append(outer);

  let owner: Element | null = null;
  let timer = 0;
  let pointer: Point = { x: 0, y: 0 };

  const hide = () => {
    clearTimeout(timer);
    outer.hidden = true;
  };
  // Leaving the element forgets it, so coming back starts a new delay; a press or scroll only hides (L-207).
  const reset = () => {
    hide();
    owner = null;
  };

  function show(target: Element): void {
    const spec = specs.get(target)?.();
    if (!spec) return;
    const rows = Array.isArray(spec) ? spec : [spec];
    const box = element("div", rows.length > 1 ? "tooltip-box multi" : "tooltip-box");
    box.append(...rows.map(row));
    outer.replaceChildren(box);
    outer.hidden = false;
    // Measure at the origin so the width is not squeezed by the window edge, then place (L-210).
    sheet.replaceSync(".tooltip { left: 0px; top: 0px; }");
    const { width, height } = outer.getBoundingClientRect();
    const at = placeTooltip(pointer, { w: width, h: height }, { w: innerWidth, h: innerHeight });
    sheet.replaceSync(`.tooltip { left: ${at.x}px; top: ${at.y}px; }`);
  }

  const ownerOf = (target: EventTarget | null): Element | null => {
    for (let el = target instanceof Element ? target : null; el; el = el.parentElement) if (specs.has(el)) return el;
    return null;
  };

  document.addEventListener(
    "pointermove",
    (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      const next = ownerOf(e.target);
      if (next === owner) return;
      reset();
      owner = next;
      // The position is read when the timer fires, so it is where the pointer is then (L-208).
      if (next) timer = window.setTimeout(() => show(next), TOOLTIP_DELAY_MS);
    },
    true,
  );
  document.addEventListener("pointerdown", hide, true);
  document.addEventListener("wheel", hide, { capture: true, passive: true });
  document.addEventListener("scroll", hide, true);
  document.documentElement.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
}
