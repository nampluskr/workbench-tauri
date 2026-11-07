import test from "node:test";
import assert from "node:assert/strict";
import { elideCrumbs, markdownCrumbs, pathCrumb } from "./breadcrumbs.ts";

test("I-12: the path row is relative to the folder, with the folder's name first when several are open", () => {
  const root = "D:\\projects\\workbench-tauri";
  assert.equal(pathCrumb(root, "workbench-tauri", `${root}\\AGENTS.md`, false), "AGENTS.md");
  assert.equal(pathCrumb(root, "workbench-tauri", `${root}\\src\\shell\\Pane.tsx`, false), "src\\shell\\Pane.tsx");
  assert.equal(pathCrumb(root, "workbench-tauri", `${root}\\AGENTS.md`, true), "workbench-tauri\\AGENTS.md");
  assert.equal(pathCrumb("D:\\projects\\workbench-core", "workbench-core", "D:\\projects\\workbench-core\\specs\\v0.5\\ITEMS.md", true), "workbench-core\\specs\\v0.5\\ITEMS.md");
  assert.equal(pathCrumb(root, "workbench-tauri", "C:\\elsewhere\\a.md", true), "C:\\elsewhere\\a.md");
});

test("I-12: Markdown crumbs are the headings that contain the cursor, as written in the source", () => {
  const text = ["# AGENTS", "", "## 레포 규칙", "", "- item", "", "## 다음", "", "### 깊은", "text", "# 새 장"];
  assert.deepEqual(markdownCrumbs(text, 4), ["# AGENTS", "## 레포 규칙"]); // nested
  assert.deepEqual(markdownCrumbs(text, 2), ["# AGENTS", "## 레포 규칙"]); // on the heading itself
  assert.deepEqual(markdownCrumbs(text, 9), ["# AGENTS", "## 다음", "### 깊은"]);
  assert.deepEqual(markdownCrumbs(text, 6), ["# AGENTS", "## 다음"]); // a same-level heading replaces the earlier one
  assert.deepEqual(markdownCrumbs(text, 10), ["# 새 장"]); // a higher one closes the chain
  assert.deepEqual(markdownCrumbs(["intro", "", "# First"], 1), []); // before the first heading: the path only
  assert.deepEqual(markdownCrumbs(["# A", "#### D"], 1), ["# A", "#### D"]); // levels may be skipped
});

test("I-12: setext headings, fenced code, front matter and non-headings are not crumbs", () => {
  assert.deepEqual(markdownCrumbs(["Title", "=====", "text"], 2), []); // Zed's outline query has ATX headings only
  assert.deepEqual(markdownCrumbs(["# Real", "```sh", "# comment", "```", "after"], 4), ["# Real"]);
  assert.deepEqual(markdownCrumbs(["~~~", "## inside", "~~~~", "## real"], 3), ["## real"]); // a longer closing run closes
  assert.deepEqual(markdownCrumbs(["~~~~", "## inside", "~~~", "## still inside"], 3), []); // a shorter one does not
  assert.deepEqual(markdownCrumbs(["---", "# yaml comment", "---", "body"], 3), []);
  assert.deepEqual(markdownCrumbs(["#hashtag", "    # indented code", "# Heading ##", "#"], 2), ["# Heading"]); // closing # run is dropped
  assert.deepEqual(markdownCrumbs(["#", "text"], 1), ["#"]); // an empty heading is just its marker
});

test("I-12: a long row keeps the first six and the last six segments around a ⋯", () => {
  const six = ["a", "b", "c", "d", "e", "f"];
  assert.deepEqual(elideCrumbs([...six, ...six]), [...six, ...six]);
  assert.deepEqual(elideCrumbs([...six, "x", ...six]), [...six, "⋯", ...six]);
});
