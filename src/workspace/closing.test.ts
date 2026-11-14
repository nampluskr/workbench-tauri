import test from "node:test";
import assert from "node:assert/strict";
import { closeEach, confirmClose, saveDoc, shortPath, type Ask } from "./closing.ts";
import type { Doc, SaveError } from "./doc.ts";

/** A Doc as the questions use it: state plus a write that the test scripts. */
function fake(state: { dirty?: boolean; disk?: Doc["disk"]; write?: () => Promise<{ ok: true } | { ok: false; error: SaveError }> }) {
  const doc = {
    base: {},
    dirty: state.dirty ?? false,
    disk: state.disk ?? "ok",
    writes: 0,
    reads: [] as boolean[],
    async write() {
      doc.writes++;
      const result = await (state.write?.() ?? Promise.resolve({ ok: true as const }));
      if (result.ok) doc.dirty = false;
      return result;
    },
    async read(force = false) {
      doc.reads.push(force);
      doc.dirty = false;
    },
  };
  return doc as typeof doc & Doc;
}

/** Answers in turn, recording each question's text and buttons. */
function asker(...answers: number[]) {
  const asked: { main: string; content: string | null; buttons: string[] }[] = [];
  const ask: Ask = async (main, content, buttons) => (asked.push({ main, content, buttons }), answers.shift() ?? buttons.length - 1);
  return { ask, asked };
}

test("E-081: the path keeps its end and is cut at the front to the limit", () => {
  assert.equal(shortPath("src\\a.txt", 80), "src\\a.txt");
  const long = "d".repeat(90) + "\\end.txt";
  assert.equal([...shortPath(long, 80)].length, 80);
  assert.ok(shortPath(long, 80).startsWith("…") && shortPath(long, 80).endsWith("\\end.txt"));
});

test("R-6: clean tabs close without a question", async () => {
  const { ask, asked } = asker();
  assert.equal(await confirmClose([{ doc: fake({}), label: "a" }], ask), true);
  assert.equal(asked.length, 0);
});

test("R-6: one modified tab asks E-081; Save writes then closes, Don't Save closes, Cancel stays", async () => {
  for (const [answer, closes, writes] of [[0, true, 1], [1, true, 0], [2, false, 0]] as const) {
    const doc = fake({ dirty: true });
    const { ask, asked } = asker(answer);
    assert.equal(await confirmClose([{ doc, label: "src\\a.txt" }], ask, 50), closes);
    assert.equal(doc.writes, writes);
    assert.deepEqual(asked[0], { main: "`src\\a.txt` contains unsaved edits. Do you want to save it?", content: null, buttons: ["Save", "Don't Save", "Cancel"] });
  }
});

test("R-6: several modified tabs ask E-082 with the file list; Save all writes each", async () => {
  const a = fake({ dirty: true });
  const b = fake({ dirty: true });
  const { ask, asked } = asker(0);
  assert.equal(await confirmClose([{ doc: a, label: "a" }, { doc: fake({}), label: "clean" }, { doc: b, label: "b" }], ask, 50), true);
  assert.deepEqual(asked[0], { main: "Do you want to save changes to the following files?", content: "a\nb", buttons: ["Save all", "Discard all", "Cancel"] });
  assert.deepEqual([a.writes, b.writes], [1, 1]);
});

test("R-6: a failed save asks E-083; Close Without Saving closes, Cancel stays", async () => {
  const failing = () => Promise.resolve({ ok: false as const, error: { kind: "unmappable" as const, chars: ["😀"] } });
  for (const [answer, closes] of [[0, true], [1, false]] as const) {
    const { ask, asked } = asker(0, answer);
    assert.equal(await confirmClose([{ doc: fake({ dirty: true, write: failing }), label: "a" }], ask, 50), closes);
    assert.deepEqual(asked[1], { main: "Unable to save file: these characters cannot be saved in CP949: 😀", content: null, buttons: ["Close Without Saving", "Cancel"] });
  }
});

test("R-6: a save past the wait limit, or an edit during the save, keeps the tab open", async () => {
  const never = () => new Promise<{ ok: true }>(() => {});
  assert.equal(await confirmClose([{ doc: fake({ dirty: true, write: never }), label: "a" }], asker(0).ask, 10), false);
  const doc = fake({ dirty: true });
  doc.write = async () => ({ ok: true }); // written, but the person typed again meanwhile: still modified
  assert.equal(await confirmClose([{ doc, label: "a" }], asker(0).ask, 50), false);
});

test("R-4: a clean tab is not written; R-7: conflict asks E-084, deleted asks E-085", async () => {
  const clean = fake({});
  assert.equal(await saveDoc(clean, asker().ask), "skipped");
  assert.equal(clean.writes, 0);

  const overwrite = fake({ dirty: true, disk: "conflict" });
  const q1 = asker(0);
  assert.equal(await saveDoc(overwrite, q1.ask), "saved");
  assert.deepEqual(q1.asked[0].buttons, ["Overwrite", "Discard Edits", "Cancel"]);
  assert.equal(q1.asked[0].main, "This file has changed on disk since you started editing it. Do you want to overwrite it?");
  const discard = fake({ dirty: true, disk: "conflict" });
  assert.equal(await saveDoc(discard, asker(1).ask), "skipped");
  assert.deepEqual([discard.writes, discard.reads], [0, [true]]);
  assert.equal(await saveDoc(fake({ dirty: true, disk: "conflict" }), asker(2).ask), "cancelled");

  const q2 = asker(0);
  const recreate = fake({ dirty: true, disk: "deleted" });
  assert.equal(await saveDoc(recreate, q2.ask), "saved");
  assert.deepEqual(q2.asked[0].buttons, ["Save", "Close", "Cancel"]);
  assert.equal(q2.asked[0].main, "This file has been deleted on disk since you started editing it. Do you want to recreate it?");
  assert.equal(await saveDoc(fake({ disk: "deleted" }), asker(1).ask), "close");
  assert.equal(await saveDoc(fake({ disk: "deleted" }), asker(2).ask), "cancelled");
});

test("core v0.8.3 I-7: closing several folders asks folder by folder in order; Cancel keeps that folder and the ones after it", async () => {
  const folders = ["a", "b", "c", "d"].map((id) => ({ id, tabs: id === "b" ? [] : [{ doc: fake({ dirty: true }), label: `${id}.txt` }] }));
  const { ask, asked } = asker(1, 2); // a: Don't Save; b has nothing modified; c: Cancel
  const closed: string[] = [];
  await closeEach(folders, async (folder) => (await confirmClose(folder.tabs, ask)) && (closed.push(folder.id), true));
  assert.deepEqual(closed, ["a", "b"]);
  assert.deepEqual(asked.map((q) => q.main), ["`a.txt` contains unsaved edits. Do you want to save it?", "`c.txt` contains unsaved edits. Do you want to save it?"]); // d is never asked
});
