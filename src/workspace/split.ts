// The split tree of one folder's center area (R-9, D-8, 02-INTERACTION 3.1). Leaves are Panes; a group lays its
// children side by side ("h": Left/Right) or stacked ("v": Up/Down). Pure functions; the DOM and the tabs live elsewhere.

export type Dir = "up" | "down" | "left" | "right";
export type Axis = "h" | "v";
/** `flex` is relative (mean 1). It is changed in place by resizing; structure changes make new groups. */
export type Group<P> = { id: number; axis: Axis; children: Node<P>[]; flex: number[] };
export type Node<P> = P | Group<P>;

let nextGroup = 1;
const group = <P>(axis: Axis, children: Node<P>[]): Group<P> => ({ id: nextGroup++, axis, children, flex: children.map(() => 1) });

export const isGroup = <P>(node: Node<P>): node is Group<P> => typeof node === "object" && node !== null && "children" in node && "axis" in node;
export const axisOf = (dir: Dir): Axis => (dir === "left" || dir === "right" ? "h" : "v");

/** The Panes in reading order (left to right, top to bottom). */
export const leaves = <P>(node: Node<P>): P[] => (isGroup(node) ? node.children.flatMap(leaves) : [node]);

/**
 * I-723 / I-724: put `fresh` next to `target`. In a group of the same axis it becomes a sibling and every flex of that
 * group goes back to 1; otherwise the target leaf is wrapped in a new group. Left and Up go before, Right and Down after.
 */
export function split<P>(root: Node<P>, target: P, dir: Dir, fresh: P): Node<P> {
  const axis = axisOf(dir);
  const pair = (): Node<P>[] => (dir === "left" || dir === "up" ? [fresh, target] : [target, fresh]);
  const visit = (node: Node<P>): Node<P> => {
    if (node === target) return group(axis, pair());
    if (!isGroup(node)) return node;
    const at = node.children.indexOf(target);
    if (at >= 0 && node.axis === axis) {
      const children = [...node.children];
      children.splice(at, 1, ...pair());
      return { ...group(axis, children), id: node.id };
    }
    const children = node.children.map(visit);
    return children.every((c, i) => c === node.children[i]) ? node : { ...node, children };
  };
  return visit(root);
}

/**
 * I-728: take a Pane out. A group left with one child folds into its parent's place, and the group that took it in
 * gets every flex back to 1. Null when `target` was the root itself (the caller keeps the only Pane).
 */
export function remove<P>(root: Node<P>, target: P): Node<P> | null {
  const visit = (node: Node<P>): Node<P> | null => {
    if (node === target) return null;
    if (!isGroup(node)) return node;
    let folded = false;
    const children: Node<P>[] = [];
    const flex: number[] = [];
    node.children.forEach((child, i) => {
      const next = visit(child);
      if (next === null) return;
      if (isGroup(next) && next.children.length === 1) {
        children.push(next.children[0]);
        folded = true;
      } else children.push(next);
      flex.push(node.flex[i]);
    });
    if (children.length === node.children.length && children.every((c, i) => c === node.children[i])) return node;
    return { ...node, children, flex: folded ? children.map(() => 1) : flex };
  };
  const result = visit(root);
  return result !== null && isGroup(result) && result.children.length === 1 ? result.children[0] : result;
}

/** I-726: the smallest length a node can take along `axis` (nested groups add up along their axis, else the largest). */
export function minLength<P>(node: Node<P>, axis: Axis, min: { w: number; h: number }): number {
  if (!isGroup(node)) return axis === "h" ? min.w : min.h;
  const parts = node.children.map((c) => minLength(c, axis, min));
  return node.axis === axis ? parts.reduce((a, b) => a + b, 0) : Math.max(...parts);
}

/**
 * I-726: drag the divider after child `index` by `delta` px. The side that shrinks gives from the nearest child first,
 * down to its minimum, then from the next ones further away; the other side grows by what was given.
 */
export function resize(lengths: number[], mins: number[], index: number, delta: number): number[] {
  const out = [...lengths];
  const give = (from: number, step: 1 | -1, want: number) => {
    let left = want;
    for (let j = from; j >= 0 && j < out.length && left > 0; j += step) {
      const take = Math.min(left, Math.max(out[j] - mins[j], 0));
      out[j] -= take;
      left -= take;
    }
    return want - left;
  };
  if (delta > 0) out[index] += give(index + 1, 1, delta);
  else if (delta < 0) out[index + 1] += give(index, -1, -delta);
  return out;
}

/** Lengths as flex values with mean 1 (I-724: equal children are all 1). */
export const toFlex = (lengths: number[]): number[] => {
  const sum = lengths.reduce((a, b) => a + b, 0);
  return sum > 0 ? lengths.map((l) => (l * lengths.length) / sum) : lengths.map(() => 1);
};

/**
 * I-707: the split button's way. A splittable active item clones; an item that cannot be split moves when there are two
 * or more tabs; an empty Pane, or one unsplittable item, cannot split (the button is disabled).
 */
export function splitMode(hasItem: boolean, splittable: boolean, tabCount: number): "clone" | "move" | null {
  if (!hasItem) return null;
  if (splittable) return "clone";
  return tabCount >= 2 ? "move" : null;
}

export type Rect<K> = { key: K; left: number; top: number; right: number; bottom: number };

/**
 * I-732: the Pane to focus in `dir`. Candidates lie wholly past the edge on that side. The one under the point just past
 * the middle of the edge wins; else the nearest, then the one overlapping the edge most.
 * shortcut: equal candidates keep reading order (the first in `rects` wins); I-713 leaves ties open in the source.
 */
export function inDirection<K>(rects: Rect<K>[], from: K, dir: Dir): K | null {
  const r = rects.find((x) => x.key === from);
  if (!r) return null;
  const eps = 0.5;
  const past = (c: Rect<K>) =>
    dir === "right" ? c.left >= r.right - eps : dir === "left" ? c.right <= r.left + eps : dir === "down" ? c.top >= r.bottom - eps : c.bottom <= r.top + eps;
  const candidates = rects.filter((c) => c.key !== from && past(c));
  if (candidates.length === 0) return null;
  const horizontal = dir === "left" || dir === "right";
  const mid = horizontal ? (r.top + r.bottom) / 2 : (r.left + r.right) / 2;
  const span = (c: Rect<K>) => (horizontal ? [c.top, c.bottom] : [c.left, c.right]);
  const gap = (c: Rect<K>) => (dir === "right" ? c.left - r.right : dir === "left" ? r.left - c.right : dir === "down" ? c.top - r.bottom : r.top - c.bottom);
  const overlap = (c: Rect<K>) => {
    const [a, b] = span(c);
    const [ra, rb] = horizontal ? [r.top, r.bottom] : [r.left, r.right];
    return Math.min(b, rb) - Math.max(a, ra);
  };
  const minGap = Math.min(...candidates.map(gap));
  const near = candidates.filter((c) => gap(c) <= minGap + eps);
  const under = near.find((c) => span(c)[0] <= mid && mid < span(c)[1]);
  if (under) return under.key;
  return near.reduce((best, c) => (overlap(c) > overlap(best) ? c : best)).key;
}
