import test from "node:test";
import assert from "node:assert/strict";
import { inDirection, isGroup, leaves, minLength, remove, resize, split, splitMode, toFlex, type Node } from "./split.ts";

type P = { name: string };
const p = (name: string): P => ({ name });
/** "h(a,v(b,c))" for checking shapes. */
const shape = (n: Node<P>): string => (isGroup(n) ? `${n.axis}(${n.children.map(shape).join(",")})` : n.name);

test("I-723 / I-724: same axis adds a sibling and resets flex; another axis wraps the leaf; left/up go before", () => {
  const [a, b, c, d] = ["a", "b", "c", "d"].map(p);
  let root: Node<P> = split(a, a, "right", b);
  assert.equal(shape(root), "h(a,b)");
  if (isGroup(root)) root.flex = [1.5, 0.5];
  root = split(root, a, "left", c);
  assert.equal(shape(root), "h(c,a,b)");
  assert.deepEqual(isGroup(root) && root.flex, [1, 1, 1]);
  root = split(root, b, "up", d);
  assert.equal(shape(root), "h(c,a,v(d,b))");
  assert.deepEqual(leaves(root).map((x) => x.name), ["c", "a", "d", "b"]);
});

test("I-728: removing folds a one-child group into its parent, which goes back to equal flex; the root Pane is never removed", () => {
  const [a, b, c] = ["a", "b", "c"].map(p);
  const root = split(split(a, a, "right", b), b, "down", c); // h(a,v(b,c))
  if (isGroup(root)) root.flex = [0.4, 1.6];
  const r1 = remove(root, c)!;
  assert.equal(shape(r1), "h(a,b)");
  assert.deepEqual(isGroup(r1) && r1.flex, [1, 1]);
  assert.equal(shape(remove(r1, a)!), "b");
  assert.equal(remove(a, a), null);
  const three = split(split(a, a, "right", b), b, "right", c); // h(a,b,c)
  if (isGroup(three)) three.flex = [0.5, 1, 1.5];
  assert.deepEqual((remove(three, b) as { flex: number[] }).flex, [0.5, 1.5]); // no fold: the others keep their share
});

test("I-726: a drag gives from the nearest child down to its minimum, then from the next; nested minimums add up", () => {
  assert.deepEqual(resize([200, 200, 200], [80, 80, 80], 0, 150), [350, 80, 170]);
  assert.deepEqual(resize([200, 200, 200], [80, 80, 80], 1, -500), [80, 80, 440]);
  assert.deepEqual(resize([100, 300], [80, 80], 0, -50), [80, 320]);
  const [a, b, c] = ["a", "b", "c"].map(p);
  const nested = split(split(a, a, "right", b), b, "down", c); // h(a, v(b,c))
  assert.equal(minLength(nested, "h", { w: 80, h: 100 }), 160);
  assert.equal(minLength(nested, "v", { w: 80, h: 100 }), 200);
  assert.deepEqual(toFlex([100, 300]), [0.5, 1.5]);
});

test("I-707: clone a splittable item, move an unsplittable one when there are two tabs, else no split", () => {
  assert.equal(splitMode(true, true, 1), "clone");
  assert.equal(splitMode(true, false, 2), "move");
  assert.equal(splitMode(true, false, 1), null);
  assert.equal(splitMode(false, false, 0), null);
});

test("I-732: focus moves to the Pane past the edge, under the edge's middle first, else the nearest", () => {
  // a | b over c (b top-right, c bottom-right), d below everything on the left
  const rects = [
    { key: "a", left: 0, top: 0, right: 100, bottom: 200 },
    { key: "b", left: 101, top: 0, right: 200, bottom: 90 },
    { key: "c", left: 101, top: 91, right: 200, bottom: 200 },
    { key: "d", left: 0, top: 201, right: 200, bottom: 300 },
  ];
  assert.equal(inDirection(rects, "a", "right"), "c"); // the middle of a's right edge (y 100) is in c
  assert.equal(inDirection(rects, "b", "left"), "a");
  assert.equal(inDirection(rects, "c", "down"), "d");
  assert.equal(inDirection(rects, "d", "up"), "a"); // a and c are as near and the middle (x 100) is in neither: a overlaps more
  assert.equal(inDirection(rects, "a", "left"), null);
});
