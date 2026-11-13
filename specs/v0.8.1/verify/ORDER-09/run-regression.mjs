// v0.8.1 ORDER-09: Master regression test runner for release exe.
// Runs the adapted regression test suites sequentially and evaluates against debug criteria.
//
// Usage:
//   node specs/v0.8.1/verify/ORDER-09/run-regression.mjs [exePath] [options]
//
// Options:
//   --suite=all|rep|o2|o3|o4|o5|o6|o7|o8   Run specific suite (default: all)
//   --dry-run                              Print execution plan without launching apps
//   --compare                              Evaluate existing results against criteria without running tests
//   --help                                 Show usage help

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { evaluateCriteria, formatMarkdownTable } from "./compare-criteria.mjs";

const REPO = "D:/projects/workbench-tauri";
const DEFAULT_RELEASE_EXE = resolve(REPO, "src-tauri/target/release/workbench-tauri.exe");
const REGRESS_DIR = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress");

mkdirSync(REGRESS_DIR, { recursive: true });

// Parse command line arguments
let exePath = process.env.TAURI_EXE || DEFAULT_RELEASE_EXE;
let suite = "all";
let dryRun = false;
let compareOnly = false;

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === "--dry-run") {
    dryRun = true;
  } else if (arg === "--compare") {
    compareOnly = true;
  } else if (arg.startsWith("--suite=")) {
    suite = arg.split("=")[1].toLowerCase();
  } else if (arg === "--help" || arg === "-h") {
    console.log(`
v0.8.1 ORDER-09 Regression Runner
Usage: node run-regression.mjs [exePath] [options]

Options:
  --suite=<suite>   Suite to run: rep, o2, o3, o4, o5, o6, o7, o8, all (default: all)
  --dry-run         Show test plan without running apps
  --compare         Only evaluate existing JSON outputs in regress/ against criteria
  --help            Show this help message
`);
    process.exit(0);
  } else if (!arg.startsWith("--")) {
    exePath = resolve(arg);
  }
}

const SUITES = [
  {
    name: "rep",
    script: "regress-rep.mjs",
    output: "v3-regress-rep.json",
    desc: "ORDER-07 #11 release representative regression (I-1~I-13, preview kinds)"
  },
  {
    name: "o2",
    script: "regress-o2.mjs",
    output: "v3-o2.json",
    desc: "Phase 2 (USER-TEST #4, #5, #6, #7, #8, #9: tree drag, guards, tabs, ext-drop, undo)"
  },
  {
    name: "o3",
    script: "regress-o3.mjs",
    output: "v3-o3.json",
    desc: "Phase 3 (USER-TEST #7 drop, #10 Lock temp/keep, #11 Search tabs, I-13 last tab)"
  },
  {
    name: "o4",
    script: "regress-o4.mjs",
    output: "v3-o4.json",
    desc: "Phase 4 (USER-TEST #13 Outline bar/resize, #15 Outline kinds/jump, #16 cursor follow/edit)"
  },
  {
    name: "o5",
    script: "regress-o5.mjs",
    output: "v3-o5.json",
    desc: "Phase 5 (USER-TEST #18 5 fonts/D2Coding, #19 code shading/copy, #20 licenses)"
  },
  {
    name: "o6",
    script: "regress-o6.mjs",
    output: "v3-o6.json",
    desc: "Phase 6 (USER-TEST #23 I-9 preview find bar Ctrl+F, toggles, navigation)"
  },
  {
    name: "o7",
    script: "regress-o7.mjs",
    output: "v3-o7.json",
    desc: "Phase 7 (USER-TEST #25 unstyled HTML theme, network isolation, link navigate)"
  },
  {
    name: "o8",
    script: "regress-o8.mjs",
    output: "v3-o8.json",
    desc: "Phase 8 (ORDER-08 I-14 loop recovery/hang notice, I-15 WebRTC/links leak block)"
  }
];

if (compareOnly) {
  console.log("=== Evaluating Existing Regression Results ===");
  const results = evaluateCriteria();
  console.log(formatMarkdownTable(results));
  process.exit(0);
}

const targetSuites = suite === "all" ? SUITES : SUITES.filter((s) => s.name === suite);
if (targetSuites.length === 0) {
  console.error(`[ERROR] Unknown suite: ${suite}. Valid options: all, ${SUITES.map((s) => s.name).join(", ")}`);
  process.exit(1);
}

console.log("==================================================================");
console.log(" v0.8.1 ORDER-09 Regression Test Suite Runner");
console.log(" Target EXE: " + exePath);
console.log(" Target Suites: " + targetSuites.map((s) => s.name).join(", "));
console.log(" Output Directory: " + REGRESS_DIR);
console.log("==================================================================");

if (dryRun) {
  console.log("\n[DRY-RUN] Execution Plan:");
  for (const s of targetSuites) {
    console.log(`  - Suite [${s.name}]: node ${s.script} "${exePath}"`);
    console.log(`    Output: ${s.output} (${s.desc})`);
  }
  console.log("\n[DRY-RUN] To execute, run without --dry-run.");
  process.exit(0);
}

if (!existsSync(exePath)) {
  console.error(`[ERROR] Release executable not found at: ${exePath}`);
  console.error("Please build release exe first (cargo build --release) or specify a valid path.");
  process.exit(1);
}

for (const s of targetSuites) {
  const scriptPath = resolve(REPO, `specs/v0.8.1/verify/ORDER-09/${s.script}`);
  console.log(`\n>>> Starting Suite [${s.name}]: ${s.desc}`);
  console.log(`    Command: node ${scriptPath} "${exePath}"`);
  try {
    execFileSync("node", [scriptPath, exePath], {
      stdio: "inherit",
      env: { ...process.env, TAURI_EXE: exePath }
    });
    console.log(`<<< Completed Suite [${s.name}] successfully.`);
  } catch (e) {
    console.error(`[FAIL] Suite [${s.name}] failed: ${e.message}`);
  }
}

console.log("\n==================================================================");
console.log(" Regression Execution Finished. Evaluating Criteria Summary...");
console.log("==================================================================\n");

const results = evaluateCriteria();
const table = formatMarkdownTable(results);
console.log(table);

try {
  writeFileSync(resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress/regression-summary.md"), table);
  console.log("\nDetailed markdown table saved in verify/ORDER-09/regress/regression-summary.md");
} catch (e) {
  console.warn(`[WARN] Could not write regression-summary.md: ${e.message}`);
}
