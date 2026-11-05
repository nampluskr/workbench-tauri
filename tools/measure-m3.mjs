// Phase 3 measurement M-3 (SPEC R-11): incremental parse time on a ~10MB HTML document. The app is not launched.
// Same web-tree-sitter + installed Zed HTML grammar as the app; the app's own editTree/parseDoc are reused
// (Node 22 strips the TypeScript types), so the edit path is the one CM6 transactions take.
// Usage: node tools/measure-m3.mjs [out.md]   -> prints the markdown tables, writes them to out.md when given.
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import { ChangeSet, Text } from "@codemirror/state";
import { Parser } from "web-tree-sitter";
import { loadLanguage } from "../src/syntax/grammar.ts";
import { editTree, parseDoc } from "../src/syntax/incremental.ts";

const TARGET_BYTES = 10 * 1024 * 1024;
const WARMUP = 3;
const RUNS = 30;

// Well-formed HTML: one <section> per 100 rows so the tree is deep and wide, not a flat list.
// `marks` records the offset just after "text " of chosen rows: a text node to type into.
function buildHtml() {
  const parts = ["<!DOCTYPE html>\n<html>\n<head><title>m3</title></head>\n<body>\n"];
  let size = parts[0].length;
  const rows = [];
  for (let i = 0; size < TARGET_BYTES; i++) {
    let row = "";
    if (i % 100 === 0) row += `<section id="s${i / 100}">\n`;
    const head = `<div class="row"><a href="/p/${i}">link ${i}</a> <span class="t">text `;
    row += head + `${i}</span> <b>bold ${i}</b></div>\n`;
    if (i % 100 === 99) row += "</section>\n";
    rows.push({ start: size, headLength: (i % 100 === 0 ? `<section id="s${i / 100}">\n`.length : 0) + head.length });
    parts.push(row);
    size += row.length;
  }
  // Close a section left open by the last row, then the document.
  parts.push(rows.length % 100 ? "</section>\n</body>\n</html>\n" : "</body>\n</html>\n");
  const html = parts.join("");
  const at = (r) => rows[r].start + rows[r].headLength;
  return { html, rows: rows.length, marks: { start: at(0), middle: at(rows.length >> 1), end: at(rows.length - 1) } };
}

const ms = (a, b) => Number(b - a) / 1e6;
const median = (xs) => [...xs].sort((a, b) => a - b)[xs.length >> 1];
const fmt = (n) => n.toFixed(3);

const wasm = new Uint8Array(readFileSync(`${process.env.LOCALAPPDATA}/Zed/extensions/installed/html/grammars/html.wasm`));
await Parser.init();
const parser = new Parser();
parser.setLanguage(await loadLanguage(wasm));

const built = buildHtml();
let doc = Text.of(built.html.split("\n"));
const input = { chars: built.html.length, bytes: Buffer.byteLength(built.html), lines: doc.lines, rows: built.rows };

let t0 = process.hrtime.bigint();
let tree = parseDoc(parser, doc, null);
const full = { ms: ms(t0, process.hrtime.bigint()), root: tree.rootNode.type, hasError: tree.rootNode.hasError, children: tree.rootNode.childCount };

// One typed character at `pos`: CM6-style change -> Tree.edit -> parse(old tree). Returns timings.
function typeChar(pos) {
  const changes = ChangeSet.of({ from: pos, insert: "a" }, doc.length);
  const next = changes.apply(doc);
  const a = process.hrtime.bigint();
  editTree(tree, changes, doc, next);
  const b = process.hrtime.bigint();
  const fresh = parseDoc(parser, next, tree);
  const c = process.hrtime.bigint();
  tree.delete();
  tree = fresh;
  doc = next;
  return { edit: ms(a, b), parse: ms(b, c), total: ms(a, c) };
}

const incr = {};
for (const [name, base] of Object.entries(built.marks)) {
  const samples = [];
  for (let i = 0; i < WARMUP + RUNS; i++) {
    const s = typeChar(base + i); // successive typing: each char lands after the previous one
    if (i >= WARMUP) samples.push(s);
  }
  const col = (k) => samples.map((s) => s[k]);
  incr[name] = {
    pos: base,
    parse: [median(col("parse")), Math.min(...col("parse")), Math.max(...col("parse"))],
    edit: [median(col("edit")), Math.min(...col("edit")), Math.max(...col("edit"))],
    total: [median(col("total")), Math.min(...col("total")), Math.max(...col("total"))],
    root: tree.rootNode.type,
    hasError: tree.rootNode.hasError,
  };
}

const cpus = os.cpus();
const label = { start: "맨 앞", middle: "가운데", end: "끝" };
const md = `## 측정 조건

| 항목 | 값 |
| --- | --- |
| CPU | ${cpus[0].model.trim()} (${cpus.length} 논리 코어) |
| Node | ${process.version} (${process.platform} ${process.arch}) |
| web-tree-sitter | ${JSON.parse(readFileSync("node_modules/web-tree-sitter/package.json", "utf8")).version} |
| 문법 | 설치된 Zed HTML 확장 \`html.wasm\` (dylink 우회: \`src/syntax/grammar.ts\`의 \`loadLanguage\`) |
| 입력 | 올바른 HTML ${input.chars.toLocaleString()}자(${(input.bytes / 1048576).toFixed(2)} MiB), ${input.lines.toLocaleString()}줄, 행 ${input.rows.toLocaleString()}개(\`<section>\` 100행마다, 행당 \`div\`·\`a\`·\`span\`·\`b\`) |
| 편집 경로 | 앱과 같은 \`editTree\` → \`Tree.edit\`, \`parseDoc\`(CM6 \`Text\`, 4096자 청크 콜백)로 이전 트리를 넘겨 파싱 |
| 편집 | 위치마다 텍스트 노드 안에 한 글자 \`a\`를 연속 입력(각 글자는 앞 글자 바로 뒤). 버리는 워밍업 ${WARMUP}회 + 측정 ${RUNS}회 |
| 시간 | \`process.hrtime.bigint\`, ms. "증분 파싱" = \`parse\` 호출만, "편집+파싱" = \`Tree.edit\` + \`parse\` |

## 첫 전체 파싱

| 루트 노드 | hasError | 루트 자식 수 | 시간(ms) |
| --- | --- | --- | --- |
| \`${full.root}\` | ${full.hasError} | ${full.children} | ${fmt(full.ms)} |

## 한 글자 입력의 증분 파싱 시간 (ms, ${RUNS}회)

| 위치 | 오프셋 | 증분 파싱 중앙값 | 최소 | 최대 | 편집+파싱 중앙값 | \`Tree.edit\` 중앙값 | 입력 후 루트 | hasError |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${Object.entries(incr)
  .map(([k, v]) => `| ${label[k]} | ${v.pos.toLocaleString()} | ${fmt(v.parse[0])} | ${fmt(v.parse[1])} | ${fmt(v.parse[2])} | ${fmt(v.total[0])} | ${fmt(v.edit[0])} | \`${v.root}\` | ${v.hasError} |`)
  .join("\n")}
`;

console.log(md);
if (process.argv[2]) writeFileSync(process.argv[2], md);
tree.delete();
