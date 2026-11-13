import test from "node:test";
import assert from "node:assert/strict";
import { keepScroll, restoreScroll } from "./view-scroll.ts";

test("core v0.8.2 I-12: a tab scroller gets its last scrolled offsets back after a removal reset them", () => {
  const view = { scrollTop: 0, scrollLeft: 0 };
  const other = { scrollTop: 0, scrollLeft: 0 };
  view.scrollTop = 1500; view.scrollLeft = 30;
  keepScroll({ target: view } as unknown as Event);
  view.scrollTop = 900;
  keepScroll({ target: view } as unknown as Event); // the last scroll event counts
  view.scrollTop = 0; view.scrollLeft = 0; // taken out of the DOM: reset, no scroll event
  restoreScroll(view);
  assert.deepEqual([view.scrollTop, view.scrollLeft], [900, 30]);
  restoreScroll(other); // never scrolled: left alone
  assert.deepEqual([other.scrollTop, other.scrollLeft], [0, 0]);
  keepScroll({ target: null } as unknown as Event); // a scroll of nothing scrollable is ignored
  restoreScroll(undefined);
});
