> 버전: v0.8.2 · 작성일: 2026-11-13 · 상태: ORDER-02 끝([PUSH] 8f64e36), ORDER-03 진행 중(2026-11-14)
>
> 실제로 한 일과 검증 결과를 적는다. core I-n ↔ Phase ↔ tauri 카드 대응은 `ITEMS-MAP.md`에, 요구와 판정 방법은 core `specs/v0.8.2/ITEMS.md`와 카드 4절에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.8.2/reports/`에 있다.

# PROGRESS — workbench-tauri v0.8.2

## Phase별 진행

### Phase 1 — ORDER-01 (I-26·I-12): v0.8.2 시작, 기본 글자 크기 14px, 탭 스크롤 위치 기억

- **에이전트 환경** (2026-11-13, leader-core)
  - 무엇을 했나: v0.8.1 끝 구성을 그대로 쓴다(사용자 2026-11-13 "v0.8.1 구성 그대로", core ORDER-01 3.1). 새로 띄우지 않았고 모델도 그대로다. w0:p1의 herdr 이름이 비어 있어 leader-core가 `tauri-leader`로 다시 붙였다.
  - 결과: workspace `w0`, 탭 넷(`tauri-leader`·`tauri-writer`·`tauri-coder`·`tauri-checker`), worktree 없음. `herdr agent list`·`herdr tab list --workspace w0` 근거는 ORDER-01 보고에 붙인다(tauri-leader).
  - 검증: 모델·effort는 `HERDR-SETUP.md` 1장 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.8.2 시작 문서와 루트 AGENTS.md** (2026-11-13, writer)
  - 무엇을 했나: `specs/v0.8.2/`에 HERDR-SETUP(v0.8.1판에서 버전·경로·날짜, 카드·보고 앞붙이 `v082-`, 보안 설정 예외(core COMMON 3절: Phase 3 본문 HTML 정화 규칙, Phase 6·7 HTML 미리보기 프레임), 0장 leader-core 패널·이름 다시 붙임)·ITEMS-MAP(core I-1~I-26 ↔ 그룹 ↔ core Phase ↔ tauri 카드, I-4·I-5 거둠)·PROGRESS를 상태 "초안"으로 쓰고 `reports/`·`verify/`(`.gitkeep`)를 만들었다(ORDER-01 3.1). 루트 `AGENTS.md`의 제목 `(v0.8.2)`, 1장 현재 상태, 0장 경로, 카드·보고 앞붙이 `v082-`, "core ITEMS 우선"(v0.8.2, I-1~I-26, I-4·I-5 거둠)·"HERDR 구성은 core가 정한다"(근거 core v0.8.2 ORDER-01 3.1) 근거 표기, 3A.4·8장 verify 경로를 고쳤다. 규칙 자체는 그대로다.
  - 결과: v0.8.2에는 tauri PLAN을 두지 않고 ITEMS-MAP이 Phase 대응을 맡는다(core PLAN이 Phase를 정함). v0.8.1 HERDR-SETUP의 "커밋되지 않은 `README.md` 수정" 문장은 작업 폴더가 깨끗해 뺐다. 루트 `AGENTS.md` 0장 2번은 `PLAN.md` 대신 `ITEMS-MAP.md`를 가리킨다.
  - 검증: V0. `git grep -n "v0\.8\.1\|v081" -- AGENTS.md`에 남은 것은 10행(checker 모델을 v0.8.1에서 바꾼 기록, "v0.8.1 구성 그대로" 인용)·42행(v0.8.1 종료) — 지난 버전 사실 기록뿐이다(보고 `C:\Users\nampl\AppData\Local\Temp\v082-W-01-report.md`). 커밋 `78845ca`.
  - 특이사항: 없음.
- **K-01 앱 버전 0.8.2·I-26·I-12 (ORDER-01)** (2026-11-13, coder, 커밋 `9599bcb`)
  - 무엇을 했나:
    - 버전: `src-tauri/tauri.conf.json` 0.8.1 → 0.8.2, `src/shell/about.test.ts` 기대값. v0.8.1 버전 커밋 `b6c8683`이 바꾼 자리는 이 둘과 `docs/BUILD.md`이고, `docs/BUILD.md`·`README.md`는 ORDER-07에서 한다. `package.json`·`Cargo.toml`에는 앱 버전 자리가 없다. `git grep -n "0\.8\.1"`에 남은 것은 의존 크레이트 버전, 출처 경로, 옛 설정 형식을 가리키는 주석·테스트 이름, `src/` 주석의 "v0.8.1 I-n" 표기다.
    - I-26: 기본값 `buffer_font_size` 15→14, `preview_font_size` 16→14(`PREVIEW_BASE_FONT_SIZE`), `ui_font_size` 16 그대로. 본문 너비·바깥 여백은 기존 `prem`(px/16 × 글자 크기)이라 코드를 바꾸지 않고 14px에서 700·14px가 된다. 간격 넷을 모두 글자 크기에 비례하게(`scaledGap` = 설정값 × 글자 크기 / 14) 하고 새 기본값 7·14·5.25·3.5px, 단위 0.25px(범위 0~48)로 정했다. 간격 키 이름을 `preview_*_spacing`으로 바꾸고, 옛 키 `preview_*_gap`은 새 키가 없을 때만 0.8.1 화면 px가 나오게 바꿔 읽는다(다음 저장 때 새 키로 쓰고 주석·알 수 없는 키·옛 줄 보존, Load Defaults는 옛 키도 지움). 설명 문구에서 "at a 16px preview font" 문장을 뺐다.
    - I-12: 원인은 `shell/Pane.tsx` PaneBody가 `item.replaceChildren(dom)`으로 탭 요소를 뺐다 넣을 때 Chromium이 스크롤 위치를 버리는 것이다. 0.8.1에서 편집 탭이 남을 때가 있던 것은 CodeMirror의 focus 복원(`@codemirror/view` `dist/index.js:4989-4991`, `:5297-5302`) 때문이다. 고침은 pane 몸통의 capture scroll 리스너로 요소별 마지막 위치를 적고(`src/shell/view-scroll.ts`, WeakMap) 탭 요소를 넣은 직후 되돌리는 것이다. HTML 미리보기는 프레임이 다시 로드될 때 앱이 `previewScrollTo` 메시지를 보내고, 머리 스크립트가 `e.source===parent`만 받는다(`src/editor/html.ts`). `Pane.tsx:434` 주석을 고쳤다.
  - 결과: 같은 pane·분할 pane·다른 pane으로 옮김이 한 길이다. 미리보기 안쪽 가로 스크롤 위치는 되돌리지 않는다. 앱 재시작 때 복원 없음. 보안 설정은 그대로다(`tauri.conf.json`은 version 한 줄).
  - 검증: V1. `npm.cmd run test` 315/315, `npm.cmd run typecheck` 0, `cargo check`·`cargo clippy -- -D warnings` 0(보고 `C:\Users\nampl\AppData\Local\Temp\v082-K-01-report.md`). 새 테스트 `src/settings/model.test.ts:93`(옛 간격 옮기기), `src/shell/view-scroll.test.ts`(위치 되돌림).
  - 특이사항: coder가 한도로 한 번 멈췄다가 leader-core 지시로 이어서 끝냈다.
- **C-01 checker 리뷰(K-01)** [PASS] (2026-11-13)
  - 무엇을 했나: K-01 diff를 리뷰했다(I-26 기본값·간격 비례·옛 키 변환·Load Defaults·설명 문구, I-12 되돌림이 Outline 클릭·`#id`·위치로 열기·M-1·R-01을 덮지 않는지, HTML 메시지 출처 검사, 보안 설정 diff, 버전 자리). 같은 카드로 V3 측정 스크립트(`specs/v0.8.2/verify/ORDER-01/run.mjs`·`measure.mjs`, fixture)를 썼다.
  - 결과: 리뷰 PASS. 측정 스크립트는 leader 검토에서 REWORK(앱에 없는 전역·경로를 지어냄, 측정이 안 돼도 PASS가 나는 길) → C-01-R1.
  - 검증: V1 리뷰(`npm.cmd run typecheck` 0, `npm.cmd run test` 315/315), 스크립트 V0(`node --check`, `--dry-run`)(보고 `C:\Users\nampl\AppData\Local\Temp\v082-C-01-report.md`).
  - 특이사항: 없음.
- **C-01-R1 측정 스크립트 다시 쓰기** (2026-11-13~14, checker)
  - 무엇을 했나: 지어낸 전역·경로를 없애고 실제 입력(CDP 키·클릭, `tools/win-input.ps1` 휠)과 `src/` 선택자(출처 `파일:줄`)로 바꿨다. 측정값이 없으면 "측정 불가", 0.8.1·0.8.2를 차례로 띄움, dry-run은 결과 파일을 쓰지 않음.
  - 결과: 스크립트 고침.
  - 검증: V0. `node --check` 2건, `--dry-run` 통과(보고 `C:\Users\nampl\AppData\Local\Temp\v082-C-01-R1-report.md`).
  - 특이사항: 화면 차례에서 #2·#3를 한 번씩 돌렸으나 요소를 찾지 못해 측정 불가였다(`specs/v0.8.2/verify/ORDER-01/results/run-step2.txt`·`run-step3.txt`, `v3-step2.json`·`v3-step3.json`).
- **측정 범위 줄임** (2026-11-14, 사용자 요청 작업 — 계획 밖)
  - 무엇을 했나: 사용자가 화면 측정을 줄였다(core COMMON 8절, ORDER-01 6절 "고친 기록"·7절 "필요한 테스트 목록"). ORDER-01 화면 측정은 #2·#3·#7·#8 넷만 하고, #4·#5는 단위 테스트, #6은 소스 줄 근거, #9는 기존 테스트·리뷰·보안 설정 `git diff`로 판정한다. 0.8.1 나란히 측정·원인 재현·18px 화면은 하지 않는다.
  - 결과: 측정 대상이 넷으로 줄었다.
  - 검증: 없음(범위 결정).
  - 특이사항: 없음.
- **V3 측정 — leader 프로브** (2026-11-14, tauri-leader)
  - 무엇을 했나: checker 스크립트가 측정 불가라 v0.8.1 ORDER-09 스크립트의 동작한 절차로 leader 프로브(`specs/v0.8.2/verify/ORDER-01/leader-probe/probe.mjs`)를 따로 써서 쟀다. 조건: 1920×1080 100%, 창 클라이언트 1440×852, One Dark(설정 파일 없음), `9599bcb` debug exe, 격리 APPDATA·WebView2 폴더. #7은 실제 휠 6칸(SendInput, 전경 확인), 탭 이동은 CDP 마우스 클릭, HTML은 프레임 CDP 대상의 `scrollY`.
  - 결과:
    - #2 충족: About "Version 0.8.2"(`leader-probe/out/c2-about-run1.png`).
    - #3 충족: 에디터 `.cm-content` 14px, `.markdown-body` 14px, 본문 최대 너비 700px, 바깥 여백 14px(`leader-probe/out-run2.txt` `c3_defaults`, `out/c3-preview.png`).
    - #7 일부 미충족: `code.py` 편집, 마크다운·ipynb·CSV 미리보기는 앞뒤 같다. 마크다운 편집 탭(`a.md`)은 각 실행에서 그 탭을 처음 내렸다 떠난 때만 0이 됐고(run2 800→0, run3 700→0, 같은 run3의 다섯째 경우 2400 유지), HTML 미리보기는 회차마다 갈렸다(run2 1200→0, run3 1200 유지·1800→0). 0은 3초 뒤에도 그대로다(`out-run2.txt`·`out-run3.txt`).
    - #8 측정 안 함: 프로브가 분할을 만들지 못했고(`.pane` 1개, `c8_split` error) 고치던 중 사용자가 측정을 중지했다.
  - 검증: V3(보고 `specs/v0.8.2/reports/ORDER-01.md`). #4·#5·#6·#9·#10은 단위 테스트·코드 근거·`git diff`로 충족. 측정 스크립트·결과·보고는 커밋 `c4a9593`.
  - 특이사항: 측정 중지는 사용자 요청 작업이다(2026-11-14 "phase-1 테스트를 중지하고 다음 단계로", leader-core 전달). 0이 된 두 경우의 원인(마크다운 편집 탭은 CodeMirror 첫 측정 때의 위치 다시 쓰기, HTML은 `load` 때 보내는 `previewScrollTo`와 프레임 준비의 경합으로 짐작)은 확인·고치지 않았다. 보고는 [BLOCKED]로 냈다.
- **leader-core 판정과 [PUSH]** (2026-11-14, leader-core)
  - 무엇을 했나: ORDER-01 보고를 판정하고 [PUSH]를 주었다. push `c0609e5..c4a9593`.
  - 결과: Phase 1 닫힘. I-26 충족, I-12 일부 미충족. 남은 두 경우(#7의 0이 된 경우 고침, #8 분할 pane 측정)를 언제 할지는 leader-core가 사용자에게 물어 정한다.
  - 검증: 없음(판정).
  - 특이사항: 없음.
- **W-02 ORDER-01 PROGRESS·ITEMS-MAP 기록** (2026-11-14, writer)
  - 무엇을 했나: 위 K-01~[PUSH] 항목을 각 보고·커밋에서 옮겨 적고, 상태 줄과 `ITEMS-MAP.md` I-12·I-26 상태를 판정대로 고쳤다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령은 `git log`·`git show --stat`만, 보고 `C:\Users\nampl\AppData\Local\Temp\v082-W-02-report.md`).
  - 특이사항: 없음.

### Phase 2 — ORDER-02 (I-13·I-15·I-16·I-17·I-21·I-22·I-23): 여백·표·코드 블록

- **시작** (2026-11-14, leader-core → tauri-leader): 카드 core `D:\projects\workbench-core\specs\v0.8.2\orders\ORDER-02.md`, 항목 I-13·I-15·I-16·I-17·I-21·I-22·I-23. 화면 측정은 leader 프로브 방식으로 하고 checker는 diff 리뷰만 한다(leader-core 지시).
- **ORDER-02 바뀜** (2026-11-14, 사용자 요청 작업 — 계획 밖, leader-core 전달): 화면 측정을 Phase 7로 모음(core COMMON 8절 끝), I-27 더함(core ORDER-02 8절).
- **K-02 I-13·I-15·I-16·I-17·I-21·I-22·I-23 (ORDER-02)** (2026-11-14, coder, 커밋 `090e5d1`): 코드 변경(`src/editor/code-block.ts`·`.test.ts` 새로, `src/shell/markdown-preview.ts`, `src/app.css`, `src/settings/model.ts`·`model.test.ts`·`load.ts`, `src/spec/metrics.ts`, `src/editor/extensions.ts`). 검증 V1: `npm.cmd run test` 318/318, typecheck 0(보고 `C:\Users\nampl\AppData\Local\Temp\v082-K-02-report.md`).
- **W-03 herdr 구성 바뀜 반영** (2026-11-14, writer): `HERDR-SETUP.md` 0·1·2·4장과 루트 `AGENTS.md` "HERDR 구성은 core가 정한다" 문장에 `tauri-analyst`(w0:p5, Claude Code Fable 5.2 medium, I-27 원인 분석만)와 coder 모델 Fable 5.2(사용자 2026-11-14, leader-core 전달)를 적었다. 검증 V0(보고 `C:\Users\nampl\AppData\Local\Temp\v082-W-03-report.md`).
- **C-02 checker 리뷰(K-02)** [PASS] (2026-11-14): K-02 diff와 보안 설정 `git diff c0609e5 -- src-tauri/tauri.conf.json src-tauri/capabilities`를 읽었다. 테스트·typecheck는 다시 돌리지 않고 coder 출력(318/318, 0)을 근거로 했다(core COMMON 8절). 검증 V0(보고 `C:\Users\nampl\AppData\Local\Temp\v082-C-02-report.md`).
- **I-13 [BLOCKED] → [UNBLOCK]** (2026-11-14, 사용자 결정, leader-core 전달): "78px로 같게(지금 구현 그대로)". I-15 여백 64px, 줄 번호를 끈 에디터 여백 78px(core ITEMS I-13 "정한 것 더함" 고침). 코드는 바꾸지 않았다.
- **I-27 탭 스크롤 위치 — 남은 두 경우** (2026-11-14, 사용자 요청 작업 — 계획 밖, core ORDER-02 8절로 더해짐)
  - 무엇을 했나: `tauri-analyst`가 원인을 분석했다(`C:\Users\nampl\AppData\Local\Temp\v082-analyst\I-27-analysis.md`). 앱 코드에서 위치를 0으로 만드는 곳은 없고, ORDER-01 프로브가 탭 막대 밖으로 밀린 탭의 좌표를 눌러 클릭이 빗나간 것이었다. leader-core 지시로 coder는 고치지 않고 tauri-leader가 프로브를 고쳤다: 클릭 전 `elementFromPoint` 확인, 탭 `scrollIntoView`, 탭 4개, 매 단계 활성 탭 기록, scrollTop 쓰기·프레임 메시지 기록.
  - 결과: V3 #12(debug exe `090e5d1`, One Dark 기본, 창 1440×852): 새로 띄운 앱 5회 × 세 경우 15/15 유지(`a.md`→`code.py` 600→600, HTML 미리보기→`a.md` 600→600, HTML 미리보기→`code.py` 1200→1200). 분할 pane 600→600(분할 직후 600). 결론: 측정 오류이고 앱 코드는 바꾸지 않았다.
  - 검증: V3(`specs/v0.8.2/verify/ORDER-02/leader-probe/out/result.json`, `split-s5.png`).
  - 특이사항: 실험 고침·vitest는 analyst가 `%TEMP%\v082-analyst\wt` worktree에서만 했다(HERDR-SETUP 0장 예외).
- **W-04 ORDER-02 기록** (2026-11-14, writer): 위 K-02 커밋·C-02·I-13·I-27 항목, HERDR-SETUP worktree 예외, ITEMS-MAP I-12·I-13·I-15·I-16·I-17·I-21·I-22·I-23 상태와 I-27 행을 적었다. 검증 V0(보고 `C:\Users\nampl\AppData\Local\Temp\v082-W-04-report.md`).
- **leader-core 판정·[PUSH]** (2026-11-14): `c4a9593..8f64e36` push. #1~#12 충족, #1~#6·#8 V3는 Phase 7로, I-27은 측정 오류이고 앱 코드 변경 없음, tauri가 고른 것을 받아들임.

### Phase 3 — ORDER-03 (I-24·I-20): 본문 HTML 태그, 로컬 문서 링크

- **시작** (2026-11-14, leader-core → tauri-leader): 카드 core `D:\projects\workbench-core\specs\v0.8.2\orders\ORDER-03.md`, 항목 I-24·I-20. 8절이 더해짐(화면 측정은 Phase 7로, #9 `<pre><code>` 안쪽 태그와 빈 줄 자르기). 사용자가 Phase 7까지 leader-core에 위임했다(2026-11-14). checker는 diff 리뷰만 한다.
