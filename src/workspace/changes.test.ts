import test from "node:test";
import assert from "node:assert/strict";
import { diffRange, eventDirs, followListing, goneDirs } from "./changes.ts";
import type { Child } from "./tree.ts";

const R = "D:\\proj";

test("R-25: the folders to read again are the folders of the changed paths, deduplicated, only those read", () => {
  const listed = [R, `${R}\\src`, `${R}\\docs`];
  const dirs = (paths: string[]) => eventDirs(R, paths, listed).sort();
  assert.deepEqual(dirs([`${R}\\src\\a.rs`, `${R}\\src\\b.rs`]), [`${R}\\src`], "two files, one folder, read once");
  assert.deepEqual(dirs([`${R}\\src`]), [R, `${R}\\src`], "a read folder that changed itself, and the folder holding it");
  assert.deepEqual(dirs([`${R}\\deep\\er\\x`, "E:\\other\\x", `${R}2\\x`]), [], "never read, outside, a sibling whose name starts the same");
  assert.deepEqual(dirs(["\\\\?\\d:\\PROJ\\Src\\a.rs"]), [`${R}\\src`], "prefix and case of the event do not matter; the listing's spelling comes back");
  assert.deepEqual(eventDirs("D:\\", ["D:\\x.txt"], ["D:\\"]), ["D:\\"], "a file in a drive root");
});

test("R-25: a rename is two paths; both folders are read, one when they are the same", () => {
  const listed = [R, `${R}\\src`, `${R}\\docs`];
  assert.deepEqual(eventDirs(R, [`${R}\\src\\old.rs`, `${R}\\docs\\new.rs`], listed).sort(), [`${R}\\docs`, `${R}\\src`], "moved across folders");
  assert.deepEqual(eventDirs(R, [`${R}\\src\\old.rs`, `${R}\\src\\new.rs`], listed), [`${R}\\src`], "renamed in place");
});

test("R-25: a read folder that its parent no longer lists is gone, with what was read below it", () => {
  const f = (name: string, is_dir: boolean): Child => ({ name, is_dir });
  const listing = new Map<string, Child[]>([
    [R, [f("docs", true), f("a", false)]],
    [`${R}\\docs`, [f("guides", true)]],
    [`${R}\\docs\\guides`, []],
    [`${R}\\src`, []], // src is not in the list of R any more
    [`${R}\\a`, []], // a is a file now
  ]);
  assert.deepEqual(goneDirs(R, listing).sort(), [`${R}\\a`, `${R}\\src`]);
});

test("R-25: a reloaded text is one change from the first to the last difference, never inside a surrogate pair", () => {
  const apply = (a: string, b: string) => {
    const c = diffRange(a, b);
    return a.slice(0, c.from) + c.insert + a.slice(c.to);
  };
  for (const [a, b] of [["abcdef", "abXdef"], ["abc", "abcd"], ["abcd", "abc"], ["same", "same"], ["", "x"], ["x", ""], ["aaa", "aaaaa"], ["a😀b", "a😁b"], ["😀", "😁"]]) assert.equal(apply(a, b), b, `${a} -> ${b}`);
  assert.deepEqual(diffRange("one\ntwo\nthree", "one\n2\nthree"), { from: 4, to: 7, insert: "2" });
  assert.deepEqual(diffRange("same", "same"), { from: 4, to: 4, insert: "" });
  assert.deepEqual(diffRange("a😀b", "a😁b"), { from: 1, to: 3, insert: "😁" }, "the whole pair is replaced");
});

test("R-25: after a rename the list of its folder has the new name and the lists below it have the new keys, at once", () => {
  const f = (name: string, is_dir: boolean): Child => ({ name, is_dir });
  const listing = new Map<string, Child[]>([
    [R, [f("docs", true), f("src", true), f("a.txt", false)]],
    [`${R}\\docs`, [f("g.md", false)]],
    [`${R}\\docs\\sub`, [f("x", false)]],
  ]);
  const renamed = followListing(R, listing, `${R}\\docs`, `${R}\\manual`);
  assert.deepEqual(renamed.get(R)?.map((c) => c.name), ["manual", "src", "a.txt"], "same kind, sorted again");
  assert.deepEqual([...renamed.keys()].sort(), [R, `${R}\\manual`, `${R}\\manual\\sub`]);
  assert.equal(renamed.get(`${R}\\manual`)?.[0].name, "g.md");
  assert.equal(listing.get(R)?.[0].name, "docs", "the old map is not touched");
  const moved = followListing(R, listing, `${R}\\a.txt`, `${R}\\src\\a.txt`);
  assert.deepEqual(moved.get(R)?.map((c) => c.name), ["docs", "src"], "left the old folder");
  assert.equal(moved.has(`${R}\\src`), false, "a folder never read gets no list of its own");
  const intoRead = followListing(R, new Map([...listing, [`${R}\\src`, [f("m.rs", false)]]]), `${R}\\a.txt`, `${R}\\src\\a.txt`);
  assert.deepEqual(intoRead.get(`${R}\\src`)?.map((c) => c.name), ["a.txt", "m.rs"], "entered the new folder");
});
