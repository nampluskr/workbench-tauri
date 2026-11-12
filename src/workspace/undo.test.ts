import test from "node:test";
import assert from "node:assert/strict";
import { UndoHistory, type Change, type Invert } from "./undo.ts";

const move = (from: string, to: string): Change => ({ kind: "moved", from, to });
// The inverse of a move step: each move back, last first (what actions.ts invert does without the disk).
const back: Invert = async (step) => [...step].reverse().map((c) => (c.kind === "moved" ? move(c.to, c.from) : c));

test("I-3: undo and redo walk the steps through their inverses (Zed undo.rs cursor)", async () => {
  const h = new UndoHistory(10);
  h.record([move("a", "d\\a"), move("b", "d\\b")]);
  const seen: Change[][] = [];
  const spy: Invert = async (step) => (seen.push(step), back(step));
  await h.undo(spy);
  assert.deepEqual(seen[0], [move("a", "d\\a"), move("b", "d\\b")]);
  assert.equal(h.canUndo(), false);
  await h.redo(spy);
  assert.deepEqual(seen[1], [move("d\\b", "b"), move("d\\a", "a")], "redo runs the inverse of what undo did");
  assert.equal(h.canRedo(), false);
  await h.undo(spy);
  h.record([move("c", "e\\c")]);
  assert.equal(h.canRedo(), false, "a new step drops what could be redone");
});

test("I-3: a failed inverse drops its step, a cancelled one keeps it", async () => {
  const h = new UndoHistory(10);
  h.record([move("a", "b")]);
  await h.undo(async () => null);
  assert.equal(h.canUndo(), true, "cancelled (the Recycle Bin confirmation declined): still there");
  await assert.rejects(h.undo(async () => { throw new Error("Failed to move `b`. It no longer exists."); }));
  assert.equal(h.canUndo() || h.canRedo(), false, "failed: gone, nothing is tried again");
  const small = new UndoHistory(2);
  ["1", "2", "3"].forEach((n) => small.record([move(n, "x")]));
  const order: string[] = [];
  const note: Invert = async (step) => (order.push(step[0].kind === "moved" ? step[0].from : ""), step);
  await small.undo(note);
  await small.undo(note);
  assert.equal(small.canUndo(), false);
  assert.deepEqual(order, ["3", "2"], "past the limit the oldest went");
});
