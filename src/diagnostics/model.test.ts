import test from "node:test";
import assert from "node:assert/strict";
import { DIAGNOSTICS, DIAGNOSTICS_CONTROLS } from "./model.ts";
import { commands, keymap } from "../keymap/keyboard.ts";

test("K-27: empty diagnostics retains the Zed title, success icon and toolbar order without diagnostic handlers", () => {
  assert.deepEqual(DIAGNOSTICS, { key: "Project Diagnostics", title: "No problems", icon: "check", iconSuccess: true, message: "No problems in workspace" });
  assert.deepEqual(DIAGNOSTICS_CONTROLS.map((control) => [control.name, control.label]), [
    ["chevron_down_up", "Collapse All Files"], ["magnifying_glass", "Buffer Search"],
    ["zed_assistant", "Inline Assist"], ["arrow_circle", "Refresh Diagnostics"], ["warning", "Exclude Warnings"],
  ]);
  assert.equal(DIAGNOSTICS_CONTROLS.at(-1)?.warning, true);
  assert.ok(DIAGNOSTICS_CONTROLS.every((control) => !("onClick" in control)));
  assert.deepEqual(keymap.dispatch(["ctrl-shift-m"], [new Set(["Workspace"])]), { type: "match", action: "diagnostics::Deploy" });
  assert.equal(typeof commands.get("diagnostics::Deploy"), "function");
});
