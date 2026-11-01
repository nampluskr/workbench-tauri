// Zed-style selection shape (E-015): the selected rows are merged into one
// outline; outer (convex) corners use radius r = 0.15 x line height and inner
// (concave) corners use 2r. Drawn as an SVG path on a CM6 layer below the text.
import { layer, RectangleMarker, type EditorView, type LayerMarker } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

const SVG_NS = "http://www.w3.org/2000/svg";

interface Row {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface Point {
  x: number;
  y: number;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Rows (stacked rectangles) -> outline polygons, clockwise in screen space. */
export function rowsToPolygons(rows: Row[]): Point[][] {
  const sorted = rows.filter((r) => r.right - r.left > 0.01).sort((a, b) => a.top - b.top);
  const groups: Row[][] = [];
  for (const row of sorted) {
    const g = groups[groups.length - 1];
    const prev = g?.[g.length - 1];
    if (prev && Math.abs(row.top - prev.bottom) < 0.5) g.push(row);
    else groups.push([row]);
  }
  return groups.map((g) => {
    const pts: Point[] = [
      { x: g[0].left, y: g[0].top },
      { x: g[0].right, y: g[0].top },
    ];
    for (let i = 1; i < g.length; i++) {
      if (Math.abs(g[i].right - g[i - 1].right) > 0.01) {
        pts.push({ x: g[i - 1].right, y: g[i].top }, { x: g[i].right, y: g[i].top });
      }
    }
    const last = g[g.length - 1];
    pts.push({ x: last.right, y: last.bottom }, { x: last.left, y: last.bottom });
    for (let i = g.length - 1; i >= 1; i--) {
      if (Math.abs(g[i].left - g[i - 1].left) > 0.01) {
        pts.push({ x: g[i].left, y: g[i].top }, { x: g[i - 1].left, y: g[i].top });
      }
    }
    return pts.filter((p, i) => {
      const q = pts[(i + pts.length - 1) % pts.length];
      return Math.abs(p.x - q.x) > 0.01 || Math.abs(p.y - q.y) > 0.01;
    });
  });
}

/** Rounded SVG path for a polygon: convex corners radius r, concave 2r. */
export function roundedPath(pts: Point[], radius: number): string {
  const n = pts.length;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const d1 = { x: cur.x - prev.x, y: cur.y - prev.y };
    const d2 = { x: next.x - cur.x, y: next.y - cur.y };
    const l1 = Math.hypot(d1.x, d1.y);
    const l2 = Math.hypot(d2.x, d2.y);
    const convex = d1.x * d2.y - d1.y * d2.x > 0;
    const want = convex ? radius : radius * 2;
    const r = Math.min(want, l1 / 2, l2 / 2);
    const a = { x: cur.x - (d1.x / l1) * r, y: cur.y - (d1.y / l1) * r };
    const b = { x: cur.x + (d2.x / l2) * r, y: cur.y + (d2.y / l2) * r };
    parts.push(`${i === 0 ? "M" : "L"} ${r3(a.x)} ${r3(a.y)}`);
    parts.push(`A ${r3(r)} ${r3(r)} 0 0 ${convex ? 1 : 0} ${r3(b.x)} ${r3(b.y)}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

class SelectionShapeMarker implements LayerMarker {
  constructor(
    readonly paths: string[],
    readonly fill: string,
  ) {}

  draw(): HTMLElement {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "zl-selectionShape");
    this.render(svg);
    return svg as unknown as HTMLElement;
  }

  update(dom: HTMLElement): boolean {
    this.render(dom as unknown as SVGSVGElement);
    return true;
  }

  eq(other: LayerMarker): boolean {
    return (
      other instanceof SelectionShapeMarker &&
      other.fill === this.fill &&
      other.paths.length === this.paths.length &&
      other.paths.every((p, i) => p === this.paths[i])
    );
  }

  private render(svg: SVGSVGElement) {
    svg.replaceChildren(
      ...this.paths.map((d) => {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", d);
        // Via CSSOM so the fill can be a CSS variable (theme token).
        path.style.setProperty("fill", this.fill);
        return path;
      }),
    );
  }
}

/** Selection layer drawing the Zed-style shape for every non-empty range. */
export function selectionShape(opts: { radius: () => number; fill: string }): Extension {
  return layer({
    above: false,
    class: "zl-selectionLayer",
    markers(view: EditorView) {
      const paths: string[] = [];
      for (const range of view.state.selection.ranges) {
        if (range.empty) continue;
        const rows = RectangleMarker.forRange(view, "zl-sel", range).map((m) => ({
          left: m.left,
          right: m.left + (m.width ?? 0),
          top: m.top,
          bottom: m.top + m.height,
        }));
        for (const poly of rowsToPolygons(rows)) {
          if (poly.length >= 4) paths.push(roundedPath(poly, opts.radius()));
        }
      }
      return paths.length ? [new SelectionShapeMarker(paths, opts.fill)] : [];
    },
    update(update) {
      return update.docChanged || update.selectionSet || update.viewportChanged || update.geometryChanged;
    },
  });
}
