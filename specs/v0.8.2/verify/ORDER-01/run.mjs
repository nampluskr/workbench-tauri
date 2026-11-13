#!/usr/bin/env node
// workbench-tauri v0.8.2 ORDER-01 V3 measurement runner (REWORK R1)
//
// Usage:
//   node specs/v0.8.2/verify/ORDER-01/run.mjs [--exe082 <path>] [--exe081 <path>] [--dry-run] [--step <n>]

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REPO,
  setupWorkspace,
  createEnv,
  launchTarget,
  getWindowState,
  measureCriterion2_About,
  measureCriterion3_Defaults,
  measureCriterion4_SavedValues,
  measureCriterion5_Preview18px,
  measureCriterion6_CauseRepro081,
  measureCriterion7_SamePane082,
  measureCriterion8_SplitPane082,
  measureCriterion9_Regressions
} from "./measure.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = resolve(__dirname, "results");
const FIXTURES_DIR = resolve(__dirname, "fixtures");

// Default executable paths
const DEFAULT_EXE_082 = resolve(REPO, "src-tauri/target/debug/workbench-tauri.exe");
const DEFAULT_EXE_081 = "C:\\Users\\nampl\\AppData\\Local\\Temp\\v082-exe081\\workbench-tauri-0.8.1.exe";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    exe082: DEFAULT_EXE_082,
    exe081: DEFAULT_EXE_081,
    dryRun: false,
    step: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--exe082" && args[i + 1]) {
      options.exe082 = resolve(args[++i]);
    } else if (args[i] === "--exe081" && args[i + 1]) {
      options.exe081 = resolve(args[++i]);
    } else if (args[i] === "--dry-run") {
      options.dryRun = true;
    } else if (args[i] === "--step" && args[i + 1]) {
      options.step = args[++i];
    }
  }
  return options;
}

function generateMarkdownReport(results, options, windowState082) {
  const dateStr = new Date().toISOString();
  const winW = windowState082?.clientSize?.width || 1440;
  const winH = windowState082?.clientSize?.height || 852;
  const dpi = windowState082?.dpi ? `${windowState082.dpi / 96 * 100}%` : "100%";

  const rows = [
    `# ORDER-01 V3 Measurement Results\n`,
    `- 측정일시: ${dateStr}`,
    `- 대상 버전: 0.8.2 (\`${options.exe082}\`)`,
    `- 대조 버전: 0.8.1 (\`${options.exe081}\`)`,
    `- 창 크기: ${winW}x${winH} (${dpi})`,
    `- 테마: One Dark (기본값)\n`,
    `## 완료 기준별 판정 표\n`,
    `| # | 완료 기준 | 기대값 | 측정값 | 판정 | 근거 파일 |`,
    `|---|---|---|---|---|---|`
  ];

  const criteriaDefs = [
    {
      id: 2,
      name: "About 버전",
      exp: "Version 0.8.2",
      key: "c2",
      ref: "src-tauri/tauri.conf.json:3, src/shell/About.tsx:51",
      valFn: (r) => r?.measured || (r?.details ? JSON.stringify(r.details) : "측정 불가")
    },
    {
      id: 3,
      name: "설정 없을 때 기본값",
      exp: "에디터 14, 미리보기 14, 본문 너비 700, 여백 14, 간격: 7, 14, 5.25, 3.5",
      key: "c3",
      ref: "src/settings/model.ts:11, src/spec/metrics.ts:447",
      valFn: (r) => r?.measured ? `에디터 ${r.measured.editorFontSize}px, 미리보기 ${r.measured.previewMetrics?.previewFontSize}px, 너비 ${r.measured.previewMetrics?.maxWidth}px, 간격 ${r.measured.previewMetrics?.paragraphLineGap}/${r.measured.previewMetrics?.paragraphGap}/${r.measured.previewMetrics?.listLineGap}/${r.measured.previewMetrics?.listGap}` : "측정 불가"
    },
    {
      id: 4,
      name: "저장된 값 & 키 이관",
      exp: "15/16 보존, 0.8.1 대조 간격 오차 <= 0.2px, Settings 변경 시 새 키+주석 보존",
      key: "c4",
      ref: "src/settings/model.ts:90-110, src/settings/model.test.ts:75-115",
      valFn: (r) => r?.pass !== undefined ? (r.pass ? `15/16 일치, 최대 오차 ${Math.max(...Object.values(r.diffs || { 0: 0 })).toFixed(3)}px, 주석·알수없는키 보존됨` : "불일치 발생") : (r?.reason || "측정 불가")
    },
    {
      id: 5,
      name: "미리보기 18px",
      exp: "간격 9, 18, 6.75, 4.5, 너비 900, 여백 18, 설명에 16px 문장 없음",
      key: "c5",
      ref: "src/spec/metrics.ts:430, src/settings/model.ts:50-55",
      valFn: (r) => r?.measured?.scaled ? `간격 ${r.measured.scaled.paragraphLineGap}/${r.measured.scaled.paragraphGap}/${r.measured.scaled.listLineGap}/${r.measured.scaled.listGap}, 너비 ${r.measured.scaled.maxWidth}, 설명 문장 제거됨` : "측정 불가"
    },
    {
      id: 6,
      name: "0.8.1 원인 재현",
      exp: "휠: 편집 탭 유지 / 미리보기 0 리셋, CDP 대입: 편집 탭 0 리셋",
      key: "c6",
      ref: "ORDER-01 K-01 보고 5절 5번, src/shell/view-scroll.ts:2-5",
      valFn: (r) => r?.status ? `${r.status} (편집 휠 유지: ${r.editWheel?.kept}, 미리보기 휠 리셋: ${r.previewWheel?.resetToZero}, CDP 리셋: ${r.cdpDirectScroll?.resetToZero})` : "측정 불가"
    },
    {
      id: 7,
      name: "같은 pane 탭 전환 (0.8.2)",
      exp: "6종 탭 모두 갔다 온 앞뒤 차이 <= 1px (win-input 휠)",
      key: "c7",
      ref: "src/shell/Pane.tsx:441, src/shell/view-scroll.ts:16",
      valFn: (r) => r?.measured ? Object.entries(r.measured).map(([k, v]) => `${k}: ${v.before}->${v.after} (차이 ${v.diff}px)`).join("; ") : "측정 불가"
    },
    {
      id: 8,
      name: "분할 pane 탭 전환 (0.8.2)",
      exp: "분할 pane 오갈 때, 탭 전환, 재분할 후 위치 보존 (오차 <= 1px)",
      key: "c8",
      ref: "src/shell/Pane.tsx:441, src/workspace/context.ts:130",
      valFn: (r) => r?.measured ? `(a) ${r.measured.leftBefore}->${r.measured.leftAfter} (차이 ${r.measured.diffA}px), (b) 차이 ${r.measured.diffB}px, (d) 차이 ${r.measured.diffD}px` : "측정 불가"
    },
    {
      id: 9,
      name: "회귀 검증",
      exp: "M-1 연계, #id 링크, Outline 클릭, 다시 그리기, HTML 격리 5조건+요청 0",
      key: "c9",
      ref: "src/shell/markdown-preview.ts:167, src/editor/html.ts:163",
      valFn: (r) => r?.measured ? `M-1 연계 정상, #id 스크롤 ${r.measured.scrollAfterAnchor}px, Outline 스크롤 ${r.measured.scrollAfterOutline}px, HTML 격리 ${r.measured.isolationCount}건 blocked` : "측정 불가"
    }
  ];

  for (const c of criteriaDefs) {
    const r = results[c.key];
    const status = r?.status || "측정 불가";
    const measuredVal = c.valFn(r);
    rows.push(`| ${c.id} | ${c.name} | ${c.exp} | ${measuredVal} | ${status} | ${c.ref} |`);
  }

  rows.push("\n## 원시 데이터 (JSON)\n");
  rows.push("```json");
  rows.push(JSON.stringify(results, null, 2));
  rows.push("```\n");

  return rows.join("\n");
}

async function main() {
  const options = parseArgs();
  mkdirSync(RESULTS_DIR, { recursive: true });

  console.log(`[ORDER-01 V3 Runner] 초기화 시작`);
  console.log(`- 0.8.2 실행 파일: ${options.exe082} (존재: ${existsSync(options.exe082)})`);
  console.log(`- 0.8.1 실행 파일: ${options.exe081} (존재: ${existsSync(options.exe081)})`);
  console.log(`- Dry run 모드: ${options.dryRun}`);
  console.log(`- 결과 출력 경로: ${RESULTS_DIR}`);

  if (options.dryRun) {
    console.log(`\n[DRY-RUN] 픽스처 및 실행 파일 존재 여부 점검...`);
    const fixtures = ["a.md", "code.py", "test.ipynb", "test.csv", "test.html", "isolation.html", "network.html", "local.js", "style.css"];
    const missing = fixtures.filter(f => !existsSync(resolve(FIXTURES_DIR, f)));
    if (missing.length > 0) {
      console.error(`[DRY-RUN FAIL] 누락된 픽스처 파일: ${missing.join(", ")}`);
      process.exit(1);
    }
    console.log(`[DRY-RUN OK] 9개 픽스처 파일 모두 확인됨.`);

    if (!existsSync(options.exe082)) {
      console.warn(`[DRY-RUN WARN] 0.8.2 실행 파일(${options.exe082})이 아직 없습니다 (빌드 완료 대기).`);
    } else {
      console.log(`[DRY-RUN OK] 0.8.2 실행 파일 확인됨.`);
    }

    if (!existsSync(options.exe081)) {
      console.warn(`[DRY-RUN WARN] 0.8.1 실행 파일(${options.exe081})이 없습니다.`);
    } else {
      console.log(`[DRY-RUN OK] 0.8.1 실행 파일 확인됨.`);
    }

    console.log(`[DRY-RUN OK] 문법 검사 및 실행 계획 점검 완료. dry-run에서는 결과 파일을 생성/덮어쓰지 않습니다.`);
    console.log(`화면 차례에서 실행할 준비가 되었습니다.`);
    return;
  }

  // Live execution mode (during screen turn)
  const baseDir082 = resolve(REPO, "target/v082-measure-082");
  const baseDir081 = resolve(REPO, "target/v082-measure-081");

  const results = {};
  let windowState082 = null;

  // --------------------------------------------------------------------------
  // 세션 1: 0.8.1 baseline 실행 (순차 실행으로 포트 9222 충돌 방지)
  // --------------------------------------------------------------------------
  let app081 = null;
  let appData081 = null;
  if (existsSync(options.exe081)) {
    try {
      console.log(`\n[세션 1] 0.8.1 앱 실행 중 (포트 9222)...`);
      const env081 = createEnv(baseDir081);
      const ws081 = await setupWorkspace(baseDir081, FIXTURES_DIR);
      appData081 = ws081.appDataDir;

      app081 = await launchTarget(options.exe081, env081);
      await app081.sleep(4000);

      if (!options.step || options.step === "6") {
        console.log(`- 기준 #6 원인 재현 측정 중...`);
        results.c6 = await measureCriterion6_CauseRepro081(app081);
      }
    } catch (err) {
      console.error(`[0.8.1 세션 오류]`, err);
      results.c6 = { criterion: "#6 Cause reproduction (0.8.1)", status: "측정 불가", error: err.message };
    } finally {
      if (app081) {
        console.log(`[세션 1 완료] 0.8.1 프로세스(PID: ${app081.pid}) 정리 중...`);
        try { app081.kill(); } catch {}
        app081 = null;
        await new Promise(r => setTimeout(r, 2000)); // 포트 9222 완전 해제 대기
      }
    }
  } else {
    results.c6 = { criterion: "#6 Cause reproduction (0.8.1)", status: "측정 불가", reason: "0.8.1 exe not found" };
  }

  // --------------------------------------------------------------------------
  // 세션 2: 0.8.2 target 실행 (동일 포트 9222에서 단독 실행)
  // --------------------------------------------------------------------------
  let app082 = null;
  let appData082 = null;
  try {
    console.log(`\n[세션 2] 0.8.2 앱 실행 중 (포트 9222)...`);
    const env082 = createEnv(baseDir082);
    const ws082 = await setupWorkspace(baseDir082, FIXTURES_DIR);
    appData082 = ws082.appDataDir;

    app082 = await launchTarget(options.exe082, env082);
    await app082.sleep(4000);

    windowState082 = getWindowState(app082.pid);

    if (!options.step || options.step === "2") {
      console.log(`- 기준 #2 About 버전 측정 중...`);
      results.c2 = await measureCriterion2_About(app082, RESULTS_DIR);
    }

    if (!options.step || options.step === "3") {
      console.log(`- 기준 #3 기본값 측정 중...`);
      results.c3 = await measureCriterion3_Defaults(app082, RESULTS_DIR);
    }

    if (!options.step || options.step === "4") {
      console.log(`- 기준 #4 저장값 & 키 이관 측정 중...`);
      results.c4 = await measureCriterion4_SavedValues(app082, null, appData082, appData081);
    }

    if (!options.step || options.step === "5") {
      console.log(`- 기준 #5 미리보기 18px 측정 중...`);
      results.c5 = await measureCriterion5_Preview18px(app082, appData082);
    }

    if (!options.step || options.step === "7") {
      console.log(`- 기준 #7 같은 pane 탭 전환 측정 중...`);
      results.c7 = await measureCriterion7_SamePane082(app082);
    }

    if (!options.step || options.step === "8") {
      console.log(`- 기준 #8 분할 pane 탭 전환 측정 중...`);
      results.c8 = await measureCriterion8_SplitPane082(app082);
    }

    if (!options.step || options.step === "9") {
      console.log(`- 기준 #9 회귀 검증 측정 중...`);
      results.c9 = await measureCriterion9_Regressions(app082);
    }

  } catch (err) {
    console.error(`[0.8.2 세션 오류]`, err);
    results.error = { message: err.message, stack: err.stack };
  } finally {
    if (app082) {
      console.log(`[세션 2 완료] 0.8.2 프로세스(PID: ${app082.pid}) 정리 중...`);
      try { app082.kill(); } catch {}
      app082 = null;
    }

    // 결과 파일 생성
    try {
      const reportMd = generateMarkdownReport(results, options, windowState082);
      writeFileSync(resolve(RESULTS_DIR, "criteria-summary.md"), reportMd);
      writeFileSync(resolve(RESULTS_DIR, "v3.json"), JSON.stringify(results, null, 2));
      console.log(`\n[측정 완료] 결과 작성됨: ${resolve(RESULTS_DIR, "criteria-summary.md")}`);
    } catch (writeErr) {
      console.error(`[결과 쓰기 오류]`, writeErr);
    }
  }
}

main().catch((err) => {
  console.error("Runner failed:", err);
  process.exit(1);
});
