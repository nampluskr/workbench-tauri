// checker script: build markdown table fragments for REPORT.md from the dump files in this folder.
import fs from "node:fs";
const P = "D:/projects/workbench-tauri/specs/v0.1/verify/phase2/";
const rd = (f) => JSON.parse(fs.readFileSync(P + f, "utf8"));
let out = "";

// ---- tokens ----
const tc = rd("r8-token-compare.json");
const names = { "Catppuccin Mocha": "Mocha", "Catppuccin Latte": "Latte", "One Light": "One Light" };
out += "| 토큰 | Mocha 기대(원본 JSON/T-26) → 덤프 applied | Latte 기대 → 덤프 applied | One Light 기대 → 덤프 applied | 판정 |\n| --- | --- | --- | --- | --- |\n";
const tokens = tc[0].rows.map((r) => r.token);
for (const tok of tokens) {
  const cells = tc.map((t) => {
    const r = t.rows.find((x) => x.token === tok);
    const tag = r.basis === "json" ? "" : r.basis.startsWith("T-26.3") ? " (T-26.3)" : " (T-26.8)";
    return `\`${r.expected}\`${tag} → \`${r.dumpApplied}\``;
  });
  const ok = tc.every((t) => t.rows.find((x) => x.token === tok).verdict === "충족");
  out += `| \`${tok}\` | ${cells.join(" | ")} | ${ok ? "충족" : "불충족"} |\n`;
}
fs.writeFileSync(P + "frag-tokens.md", out);

// ---- screen samples ----
const sampleTable = (key, s4) => {
  const j = rd(`r8-${key}-screen.json`);
  let t = "| 샘플 | 기대(토큰 계산) | 앱 픽셀(CDP 스크린샷) | 토큰 대비 최대 채널 차 | 기준 견본 픽셀(같은 토큰 CSS) | 견본 대비 차 | 판정 | 증거 |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n";
  const order = ["S-1", "S-2", "S-3", "S-4", "S-5", "S-6", "S-7", "S-8", "S-9", "S-10a", "S-10i", "S-11", "S-12", "S-13"];
  const cal = j.calibration;
  for (const id of order) {
    if (id === "S-4") {
      t += `| S-4 최소화 hover | \`${s4.expected}\` | \`${s4.actual}\` (모니터 캡처, 실제 hover) | ${s4.dTok} | \`${s4.ref}\` | ${s4.dRef} | ${s4.dRef <= 1 ? "충족" : "불충족"} | ${s4.file} |\n`;
      continue;
    }
    if (id === "S-8") {
      const rows = Object.entries(j.cdp).filter(([k]) => k.startsWith("S-8 "));
      const dmax = Math.max(...rows.map(([, v]) => v.maxChannelDiff));
      const near = rows.map(([, v]) => { const exp = [1, 3, 5].map((i) => parseInt(j.expected['S-8'].slice(i, i + 2), 16)); const cs = v.actual.split(' | ').map((x) => x.split(':')[1]); const d = (c) => Math.max(...[1, 3, 5].map((i, k) => Math.abs(parseInt(c.slice(i, i + 2), 16) - exp[k]))); return cs.sort((p, q) => d(p) - d(q))[0]; });
      t += `| S-8 영역 사이 선 (타이틀 바 아래·상태 표시줄 위·사이드바 오른쪽·왼쪽 Dock 오른쪽, 4곳) | \`${j.expected['S-8']}\` | ${near.map((c) => '`' + c + '`').join(', ')} | ${dmax} | (견본 비교 없음 — 토큰 대비 ±1 안) | - | ${rows.every(([, v]) => v.verdict === '충족') ? '충족' : '불충족'} | r8-${key}-screen.json (borderScan) |
`;
      continue;
    }
    const lookup = id === "S-6" ? "S-5" : id;
    const a = j.cdp[id];
    const c = cal[lookup];
    const label = { "S-1": "S-1 타이틀 바(활성)", "S-2": "S-2 타이틀 바(비활성)", "S-3": "S-3 창 버튼 글리프(최소화 글리프 가장 진한 픽셀)", "S-5": "S-5 사이드바", "S-6": "S-6 왼쪽 Dock", "S-7": "S-7 상태 표시줄", "S-9": "S-9 Pane 탭 바", "S-10a": "S-10 활성 탭", "S-10i": "S-10 비활성 탭", "S-11": "S-11 편집기 바탕", "S-12": "S-12 현재 줄", "S-13": "S-13 선택 영역" }[id];
    const dRef = c ? c.maxChannelDiff : "-";
    const verdict = c ? (c.verdict === "충족" ? "충족" : "불충족") : (a.verdict === "충족" ? "충족" : "불충족");
    t += `| ${label} | \`${a.expected}\` | \`${a.actual}\` | ${a.maxChannelDiff} | ${c ? "`" + c.reference + "`" : "-"} | ${dRef} | ${verdict} | r8-${key}-screen.json |\n`;
  }
  return t;
};
fs.writeFileSync(P + "frag-samples-mocha.md", sampleTable("mocha", { expected: "#21212e", actual: "#21212d", dTok: 1, ref: "#21212d", dRef: 0, file: "r4-hover-min.png" }));
fs.writeFileSync(P + "frag-samples-latte.md", sampleTable("latte", { expected: "#d2d6e0", actual: "#d3d6de", dTok: 2, ref: "#d4d6df", dRef: 1, file: "r8-latte-s4-hover.png, r8-latte-s4-swatch-cdp.png" }));
console.log(fs.readFileSync(P + "frag-samples-mocha.md", "utf8"));
console.log(fs.readFileSync(P + "frag-samples-latte.md", "utf8"));
