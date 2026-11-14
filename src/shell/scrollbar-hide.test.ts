import test from "node:test";
import assert from "node:assert/strict";
import { autoHides, expired, keyInput, nextExpiry, pointerInput, type ScrollbarState } from "./scrollbar-hide.ts";

test("core v0.8.3 I-1: a scrollbar shows for the area with input and hides after the delay", () => {
  const s: ScrollbarState<string> = { hideAt: new Map(), held: null };
  const shown = () => [...s.hideAt.keys()];
  // Delay 0 never hides; any other delay does.
  assert.deepEqual([autoHides(0), autoHides(1), autoHides(10)], [false, true, true]);
  assert.equal(nextExpiry(s), Infinity);

  // Only the area with input shows; each hides its own delay after its own last input.
  pointerInput(s, "editor", false, 0, 3000);
  assert.deepEqual(shown(), ["editor"]);
  keyInput(s, "tree", 1000, 3000);
  pointerInput(s, null, false, 1500, 3000); // over no scroll area: nothing new shows
  assert.deepEqual(shown(), ["editor", "tree"]);
  assert.equal(nextExpiry(s), 3000);
  assert.deepEqual(expired(s, 2999), []);
  assert.deepEqual(expired(s, 3000), ["editor"]);
  pointerInput(s, "tree", false, 3500, 3000); // more input puts the hiding off
  assert.deepEqual(expired(s, 4000), []);
  assert.deepEqual(expired(s, 6500), ["tree"]);
  assert.deepEqual(shown(), []);

  // The pointer resting on an area's scrollbar keeps it, also through keys elsewhere.
  pointerInput(s, "editor", true, 7000, 3000);
  keyInput(s, "tree", 7000, 3000);
  assert.equal(nextExpiry(s), 10000);
  assert.deepEqual(expired(s, 60000), ["tree"]);
  assert.deepEqual(shown(), ["editor"]);
  assert.equal(nextExpiry(s), Infinity);
  // Off the scrollbar (still in the area, into another area, or out of the window) the delay starts again.
  pointerInput(s, "editor", false, 61000, 3000);
  assert.deepEqual([expired(s, 63999), expired(s, 64000)], [[], ["editor"]]);
  pointerInput(s, "editor", true, 70000, 3000);
  pointerInput(s, "tree", false, 71000, 3000);
  assert.deepEqual(expired(s, 74000), ["editor", "tree"]);
  pointerInput(s, "editor", true, 80000, 3000);
  pointerInput(s, null, false, 81000, 3000);
  assert.deepEqual([expired(s, 83999), expired(s, 84000)], [[], ["editor"]]);
});
