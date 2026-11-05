import test from "node:test";
import assert from "node:assert/strict";
import { placeTooltip } from "./tooltip.ts";

const view = { w: 1000, h: 600 };
const size = { w: 120, h: 40 };

test("L-208~L-210: 1px from the pointer; flips left past the right edge (clamped at 0), above past the bottom", () => {
  assert.deepEqual(placeTooltip({ x: 100, y: 100 }, size, view), { x: 101, y: 101 });
  // x + w = 1001 > 1000: flip to pointer.x - w - 1
  assert.deepEqual(placeTooltip({ x: 880, y: 100 }, size, view), { x: 759, y: 101 });
  assert.deepEqual(placeTooltip({ x: 879, y: 100 }, size, view), { x: 880, y: 101 }); // 880 + 120 = 1000 still fits
  assert.deepEqual(placeTooltip({ x: 100, y: 560 }, size, view), { x: 101, y: 519 });
  // a box wider than the space on both sides sticks to 0
  assert.deepEqual(placeTooltip({ x: 50, y: 10 }, { w: 200, h: 40 }, { w: 220, h: 600 }), { x: 0, y: 11 });
});
