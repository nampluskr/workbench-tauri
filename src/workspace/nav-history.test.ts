import test from "node:test";
import assert from "node:assert/strict";
import { MAX_NAVIGATION_HISTORY_LEN, NavHistory, navigateHistory } from "./nav-history.ts";

// Selection and closing follow context.ts; cursor changes never enter navigation history.
function pane() {
  const nav = new NavHistory<string>();
  const cursor = new Map<string, number>();
  let active: string | undefined;
  function select(path: string) {
    if (active !== undefined && active !== path && cursor.has(active) && nav.mode === "normal") nav.push(active);
    nav.retain([...cursor.keys()], path);
    active = path;
  }
  const host = {
    here: () => active,
    show(path: string) {
      if (!cursor.has(path)) return false;
      select(path);
      return true;
    },
  };
  return {
    nav,
    open(path: string) { if (!cursor.has(path)) cursor.set(path, 1); select(path); },
    jump(line: number) { cursor.set(active!, line); },
    close(path: string) {
      cursor.delete(path);
      if (active === path) active = [...cursor.keys()].at(-1);
      nav.retain([...cursor.keys()], active);
    },
    goBack: () => navigateHistory(nav, "back", host),
    goForward: () => navigateHistory(nav, "forward", host),
    at: () => [active, cursor.get(active!)],
  };
}

test("I-12: A B C, back B, back A, forward B; cursor jumps do not become destinations", () => {
  const p = pane();
  p.open("A");
  p.jump(50);
  p.open("B");
  p.jump(200);
  p.open("C");
  p.jump(500);
  p.goBack();
  assert.deepEqual(p.at(), ["B", 200]);
  p.goBack();
  assert.deepEqual(p.at(), ["A", 50]);
  assert.equal(p.nav.canGoBack, false);
  p.goForward();
  assert.deepEqual(p.at(), ["B", 200]);
  p.goForward();
  assert.deepEqual(p.at(), ["C", 500]);
  assert.equal(p.nav.canGoForward, false);
});

test("I-12: repeated selection is ignored; revisiting a tab preserves earlier visits", () => {
  const p = pane();
  p.open("A");
  p.open("A");
  assert.equal(p.nav.canGoBack, false);
  p.open("B");
  p.open("A");
  p.open("A");
  p.goBack();
  assert.deepEqual(p.at(), ["B", 1]);
  p.goBack();
  assert.deepEqual(p.at(), ["A", 1]);
  p.goForward();
  assert.deepEqual(p.at(), ["B", 1]);
  p.goForward();
  assert.deepEqual(p.at(), ["A", 1]);
  p.goBack();
  p.open("C");
  assert.equal(p.nav.canGoForward, false);
});

test("I-12: closed tabs are skipped in both directions and cannot leave enabled dead ends", () => {
  const p = pane();
  for (const path of ["A", "B", "C"]) p.open(path);
  p.close("B");
  p.goBack();
  assert.deepEqual(p.at(), ["A", 1]);
  p.goForward();
  assert.deepEqual(p.at(), ["C", 1]);
  p.close("A");
  assert.equal(p.nav.canGoBack, false);
  p.open("D");
  p.goBack();
  p.close("D");
  assert.equal(p.nav.canGoForward, false);
  assert.deepEqual(p.at(), ["C", 1]);
});

test("I-12: history is bounded and an unavailable destination does not add a forward entry", () => {
  const nav = new NavHistory<number>();
  for (let i = 0; i < MAX_NAVIGATION_HISTORY_LEN + 5; i++) nav.push(i);
  assert.equal(nav.backward.length, MAX_NAVIGATION_HISTORY_LEN);
  assert.equal(nav.backward[0], 5);
  navigateHistory(nav, "back", { here: () => -1, show: () => false });
  assert.equal(nav.canGoBack, false);
  assert.equal(nav.canGoForward, false);
  assert.equal(nav.mode, "normal");
});

test("I-12: tab identity survives renames and distinguishes source and preview tabs", () => {
  const source = { path: "A.md" }, preview = { path: "A.md" };
  const nav = new NavHistory<typeof source>();
  nav.push(source);
  source.path = "renamed.md";
  nav.retain([source, preview], preview);
  let active = preview;
  navigateHistory(nav, "back", { here: () => active, show: (tab) => { active = tab; return true; } });
  assert.equal(active, source);
  assert.deepEqual(nav.forward, [preview]);
});
