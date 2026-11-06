import test from "node:test";
import assert from "node:assert/strict";
import { Text } from "@codemirror/state";
import { Doc, isDirty, judgeDisk, type Io, type Status } from "./doc.ts";

const T = (s: string) => Text.of(s.split("\n"));
const bytes = (s: string) => new TextEncoder().encode(s) as Uint8Array<ArrayBuffer>;

/** A tab with a fake editor and a disk whose reads and saves the test releases one by one. */
function setup(initial: string | null) {
  let disk = initial;
  let text: Text | null = null;
  const reads: ((value: Uint8Array<ArrayBuffer> | null) => void)[] = [];
  const saves: { text: string; done: (ok: boolean) => void }[] = [];
  const io: Io = {
    read: () => new Promise((resolve) => reads.push(resolve)),
    save: (_, saved) =>
      new Promise((resolve, reject) =>
        saves.push({ text: saved, done: (ok) => (ok ? ((disk = saved), resolve(bytes(saved))) : reject({ kind: "io", message: "denied", kept_tmp: null })) }),
      ),
  };
  const statuses: Status[] = [];
  const doc = new Doc("C:\\w\\a.txt", { text: () => text, set: (s) => void ((text = T(s)), doc.refresh()) }, io, (s) => statuses.push(s));
  const type = (s: string) => {
    text = T(s);
    doc.refresh();
  };
  const release = async (value: string | null = disk) => {
    reads.shift()!(value === null ? null : bytes(value));
    await new Promise((r) => setTimeout(r, 0)); // let the digest and the result run
  };
  const settle = () => new Promise((r) => setTimeout(r, 0));
  return { doc, io, reads, saves, type, release, settle, text: () => text?.toString() ?? null, setDisk: (s: string | null) => (disk = s) };
}

test("R-2: modified while the text differs from the base; a conflict stays through undo; a deleted file is modified while it has text", () => {
  assert.equal(isDirty("ok", T("a"), T("a")), false);
  assert.equal(isDirty("ok", T("ab"), T("a")), true);
  assert.equal(isDirty("conflict", T("a"), T("a")), true);
  assert.equal(isDirty("deleted", T("a"), T("a")), true);
  assert.equal(isDirty("deleted", T(""), T("a")), false);
});

test("R-7: a clean tab reloads, a modified one conflicts, same bytes are no change, gone is deleted", () => {
  assert.deepEqual(judgeDisk(false, "h1", "h2"), { disk: "ok", reload: true });
  assert.deepEqual(judgeDisk(true, "h1", "h2"), { disk: "conflict", reload: false });
  assert.deepEqual(judgeDisk(true, "h1", "h1"), { disk: "ok", reload: false });
  assert.deepEqual(judgeDisk(false, "h1", null), { disk: "deleted", reload: false });
});

test("R-2: type -> modified, back to the base text -> clean, save -> clean", async () => {
  const t = setup("one");
  const read = t.doc.read();
  await t.release();
  await read;
  assert.equal(t.doc.dirty, false);
  t.type("one!");
  assert.equal(t.doc.dirty, true);
  t.type("one");
  assert.equal(t.doc.dirty, false);
  t.type("two");
  const saving = t.doc.write();
  await t.settle();
  t.saves[0].done(true);
  assert.deepEqual(await saving, { ok: true });
  assert.equal(t.doc.dirty, false);
});

test("R-3: of two overlapping reads only the later one counts, whatever order they end in", async () => {
  const t = setup("v1");
  const first = t.doc.read();
  const second = t.doc.read();
  const [answerFirst, answerSecond] = t.reads.splice(0);
  answerSecond(bytes("new"));
  await t.settle();
  answerFirst(bytes("slow old")); // the earlier request ends last
  await Promise.all([first, second]);
  assert.equal(t.text(), "new");
});

test("R-3: a read that started before a save and ends after it is dropped and read again", async () => {
  const t = setup("old");
  const open = t.doc.read();
  await t.release();
  await open;
  t.type("new");
  const stale = t.doc.read(); // e.g. an event from before the save
  const saving = t.doc.write();
  await t.settle();
  t.saves[0].done(true);
  await saving;
  await t.release("old"); // the stale read saw the old bytes
  await stale;
  assert.equal(t.text(), "new");
  assert.equal(t.doc.disk, "ok");
  assert.equal(t.reads.length, 1, "read again after the save");
  await t.release(); // the disk now has "new": same bytes as the base
  assert.equal(t.doc.dirty, false);
  assert.equal(t.doc.disk, "ok");
});

test("R-4 / R-7: the app's own save event is no change; an outside change while modified is a conflict that undo keeps", async () => {
  const t = setup("a");
  const open = t.doc.read();
  await t.release();
  await open;
  t.type("b");
  const saving = t.doc.write();
  await t.settle();
  t.saves[0].done(true);
  await saving;
  const own = t.doc.read();
  await t.release();
  await own;
  assert.equal(t.doc.disk, "ok");
  t.type("bc");
  const outside = t.doc.read();
  await t.release("x");
  await outside;
  assert.equal(t.doc.disk, "conflict");
  t.type("b"); // undo back to the base text
  assert.equal(t.doc.dirty, true);
  assert.equal(t.text(), "b", "the buffer is kept");
});

test("R-7: deleted on disk keeps the buffer; a clean tab follows an outside change", async () => {
  const t = setup("a");
  const open = t.doc.read();
  await t.release();
  await open;
  const changed = t.doc.read();
  await t.release("z");
  await changed;
  assert.equal(t.text(), "z");
  const gone = t.doc.read();
  await t.release(null);
  await gone;
  assert.equal(t.doc.disk, "deleted");
  assert.equal(t.text(), "z");
  assert.equal(t.doc.dirty, true);
});

test("R-4: a rename during the save keeps the tab modified; a closed tab drops its read", async () => {
  const t = setup("a");
  const open = t.doc.read();
  await t.release();
  await open;
  t.type("b");
  const saving = t.doc.write();
  await t.settle();
  t.doc.path = "C:\\w\\renamed.txt";
  t.saves[0].done(true);
  await saving;
  assert.equal(t.doc.dirty, true);
  const late = t.doc.read();
  t.doc.closed = true;
  await t.release("zzz");
  await late;
  assert.equal(t.text(), "b");
});
