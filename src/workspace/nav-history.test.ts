import test from "node:test";
import assert from "node:assert/strict";
import { isFarJump, MAX_NAVIGATION_HISTORY_LEN, NavHistory, navigateHistory, type NavEntry } from "./nav-history.ts";

// A Pane with file tabs and a cursor each, wired the way context.ts wires it: leaving a tab records where it was, a far
// cursor move records the place it left (Zed Item::deactivated / Editor::push_to_nav_history).
function pane() {
  const nav = new NavHistory();
  const cursor = new Map<string, { line: number; column: number }>();
  let active: string | null = null;
  const here = (): NavEntry | undefined => (active ? { path: active, ...cursor.get(active)! } : undefined);
  const activate = (path: string) => {
    if (active && active !== path && cursor.has(active)) nav.push(here()!); // the editor that stops being active remembers its place
    if (!cursor.has(path)) cursor.set(path, { line: 1, column: 1 });
    active = path;
  };
  const host = {
    here,
    show(entry: NavEntry) {
      const switched = active !== entry.path;
      activate(entry.path); // a closed tab is opened again from its path
      const now = cursor.get(entry.path)!;
      if (!switched && now.line === entry.line && now.column === entry.column) return false;
      cursor.set(entry.path, { line: entry.line, column: entry.column });
      return true;
    },
  };
  return {
    nav,
    open: activate,
    jump(line: number, column = 1) {
      const from = cursor.get(active!)!;
      if (isFarJump(from.line, line)) nav.push({ path: active!, ...from });
      cursor.set(active!, { line, column });
    },
    close(path: string) { cursor.delete(path); if (active === path) active = null; },
    goBack: () => navigateHistory(nav, "back", host),
    goForward: () => navigateHistory(nav, "forward", host),
    at: () => `${active} ${cursor.get(active!)!.line}:${cursor.get(active!)!.column}`,
  };
}

test("I-10: Go Back / Go Forward follow Zed's recorded run (zed-tip-back.png sequence)", () => {
  const p = pane();
  p.open("AGENTS.md");
  p.jump(5, 23); // 4 rows: not recorded
  p.open("App.tsx");
  p.jump(66); // 65 rows: the place it left (1:1) is recorded
  assert.deepEqual([p.nav.canGoBack, p.nav.canGoForward], [true, false]);
  p.goBack();
  assert.equal(p.at(), "App.tsx 1:1");
  p.goBack();
  assert.equal(p.at(), "AGENTS.md 5:23");
  p.goForward();
  assert.equal(p.at(), "App.tsx 1:1");
  p.goForward();
  assert.equal(p.at(), "App.tsx 66:1");
  p.jump(75); // 9 rows: not recorded
  p.goBack();
  assert.equal(p.at(), "App.tsx 1:1");
});

test("I-10: a new place after Go Back clears Forward; the same file and row is kept once; a closed tab is reopened", () => {
  const p = pane();
  p.open("a");
  p.jump(50);
  p.jump(100); // records a@50
  p.goBack();
  assert.equal(p.at(), "a 50:1");
  assert.equal(p.nav.canGoForward, true);
  p.jump(200); // a new move from a@50: Forward is gone
  assert.equal(p.nav.canGoForward, false);
  p.nav.push({ path: "A", line: 50, column: 7 }); // same file (case-insensitive) and row replaces the older entry
  assert.equal(p.nav.backward.filter((e) => e.line === 50).length, 1);
  p.open("b");
  p.close("a");
  p.goBack(); // the entry of the closed tab
  assert.match(p.at(), /^(a|A) /);
});

test("I-10: an entry at the place we already are is skipped, the stack is capped and deleted files leave it", () => {
  const p = pane();
  p.open("a");
  p.nav.push({ path: "a", line: 30, column: 1 });
  p.nav.push({ path: "a", line: 1, column: 1 }); // the place we are at: popped first, moves nothing, so the next one is tried
  p.goBack();
  assert.equal(p.at(), "a 30:1");
  const full = new NavHistory();
  for (let line = 1; line <= MAX_NAVIGATION_HISTORY_LEN + 5; line++) full.push({ path: "x", line, column: 1 });
  assert.equal(full.backward.length, MAX_NAVIGATION_HISTORY_LEN);
  assert.equal(full.backward[0].line, 6);
  full.removePath("X");
  assert.equal(full.backward.length, 0);
  assert.equal(isFarJump(1, 11), true); // ten rows apart
  assert.equal(isFarJump(1, 10), false);
});
