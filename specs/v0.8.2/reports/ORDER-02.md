[DONE] ORDER-02 tauri

> 화면 측정은 COMMON 8절 끝·ORDER-02 8.2절(사용자 2026-11-14)대로 Phase 7로 옮겼다. 이 카드에서 앱을 띄워 잰 것은 8.1의 #12(I-27)뿐이다.

## 완료 기준

| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 I-15 여백 | md·ipynb 본문 시작선 같음, 여백은 700px 밖, 폭과 근거 | 충족(코드·리뷰). V3는 Phase 7에서 잼 | `src/shell/markdown-preview.ts`(md·ipynb만 `.markdown-body.left-margin`), `src/app.css`(`padding-left: var(--markdown-preview-left-margin)`, 본문 `max-width` 700 밖), `src/spec/metrics.ts`(`markdown_preview.left_margin` 64/14 × 글자 크기). 폭·근거는 "tauri가 고른 것". checker C-02 2.1 PASS |
| 2 I-15 실행 번호 | `[n]`이 코드 셀 왼쪽 여백, 위 줄 없음, 없으면 `[ ]`, 찾기 제외 | 충족(코드·리뷰). V3는 Phase 7에서 잼 | `.nb-count`를 `position:absolute; right:100%`로 셀 왼쪽 여백·첫 코드 줄 높이에, `cell.count ?? " "` → `[ ]`, `preview-search.ts` `SKIP`에 `.nb-count`(그대로), `user-select:none`. 실행 번호 구조를 보던 기존 테스트는 없었다. C-02 2.1 |
| 3 I-13 | 줄 번호 끔: 에디터 글자 시작 px = 미리보기 고정 왼쪽 여백 78px. 켬: Phase 1 끝과 같음 | 충족(코드·리뷰). V3는 Phase 7에서 잼 | `src/editor/extensions.ts`: `&.cm-no-line-numbers .cm-line` padding-left = `calc(container_padding + left_margin)` = 14 + 64 = 78px(14px). 줄 번호를 켰을 때 규칙은 그대로. 사용자 결정 2026-11-14 "78px로 같게"(leader-core [UNBLOCK], core ITEMS I-13 고침). C-02 2.2 |
| 4 I-16 | md·ipynb 표 너비 = 본문 너비, CSV 내용만큼, 넓은 표 모양 | 충족(코드·리뷰). V3는 Phase 7에서 잼 | `markdownTree`가 md·ipynb markdown 셀 표만 `div.table-wrap`으로 감쌈, `.table-wrap > table { width:100% }`. CSV `table.csv-table`·결과창 HTML 표는 그대로. 넓은 표는 "tauri가 고른 것". C-02 2.3 |
| 5 I-17 | 기본 86, 코드·결과창·표 12.04px, 인라인 12.25px, 저장값 유지 | 충족(V1). V3는 Phase 7에서 잼 | `preview_code_font_size` 기본 86(`src/settings/model.ts`, `metrics.ts` 기본 인자). 표(`table:not(.csv-table)`)·결과창 `pre`가 `--preview-code-font-size`, 인라인 87.5% 그대로. 테스트 `src/settings/model.test.ts`(85→86 두 곳, 저장된 85 유지). C-02 2.4 |
| 6 I-21 | Settings에 줄 높이(기본 1.45), 코드 블록·셀·결과창 = 글자 × 값, 범위·이유 | 충족(V1). V3는 Phase 7에서 잼 | `preview_code_line_height`, `.markdown-body pre { line-height: var(--preview-code-line-height) }`. 테스트 `src/settings/model.test.ts:76`(기본 1.45, 1.0~3.0, 0.05 단계, 틀린 값 → 기본, 저장). C-02 2.5 |
| 7 I-22 | 앞뒤 빈 줄(공백 줄 포함) 안 그림, 복사 = 보이는 글자, 가운데 빈 줄·결과창 그대로, 파일 불변 | 충족(V1) | `src/editor/code-block.ts` `trimBlankLines`, `addCodeHeaders`가 잘라낸 글자로 `code.textContent`와 복사 버튼을 맞춤, 결과창(`pre`에 `code` 없음)은 닿지 않음, 파일은 읽기만. 테스트 `src/editor/code-block.test.ts:5`(앞·뒤·공백·탭·CRLF 줄, 가운데 빈 줄 유지, 들여쓰기 유지, 전부 빈 줄 → ""). C-02 2.6 |
| 8 I-23 | 켬: 1부터 번호, 에디터 줄 번호 색, 복사·찾기에 번호 없음. 끔(기본): Phase 1 끝 모양 | 충족(V1). V3는 Phase 7에서 잼 | `preview_code_line_numbers`(기본 false). 번호 칸 `div.code-line-numbers[aria-hidden][data-lines]`를 `::before{content:attr(data-lines)}`로 그려 텍스트 노드가 없음, 색 `--editor-line-number`, 꺼짐이면 `display:none`. 테스트 `src/editor/code-block.test.ts:13`. C-02 2.7 |
| 9 설정 파일 | 새 설정 둘이 지금 저장 방식으로 | 충족(V1) | `src/settings/model.test.ts:76`(저장 때 주석·알 수 없는 키 보존, Load Defaults가 두 키를 지움) |
| 10 테스트 | 전체 test·typecheck, 보안 diff 버전 한 줄 | 충족 | `npm.cmd run test` 318/318, `npm.cmd run typecheck` 0(coder K-02, 커밋 `090e5d1` 전 1회). `git diff c0609e5 -- src-tauri/tauri.conf.json src-tauri/capabilities` → `"version"` 한 줄. Rust 안 건드림 → cargo 안 돌림 |
| 11 I-27 원인 | 두 경우의 원인, 소스 줄 근거 | 충족 | 원인은 **측정 오류**다(앱 코드 아님). 아래 "I-27 원인" |
| 12 I-27 화면 | 새로 띄운 앱에서 경우마다 5회 유지(±1px) + 분할 pane 한 번 | 충족 | 15/15 유지, 분할 pane 유지. 아래 "#12 측정 값" |

### I-27 원인 (#11)

- 근거: tauri-analyst 분석 `C:\Users\nampl\AppData\Local\Temp\v082-analyst\I-27-analysis.md`(사용자 2026-11-14 지시, leader-core 전달). 앱 실제 편집기 코드(`createFileView` + `src/shell/view-scroll.ts`)와 프레임 로직을 창 없는 Edge에서 같은 절차로 돌리면 매번 유지됐다. 되돌아온 뒤 스크롤러에 쓰는 곳은 `src/shell/Pane.tsx:450-451`(`replaceChildren` 뒤 `restoreScroll`) 한 번뿐이었다.
- 0이 나온 이유: ORDER-01 프로브(`verify/ORDER-01/leader-probe/probe.mjs:43-52`)는 탭이 보이는지 확인하지 않고 탭 사각형 가운데를 눌렀다. 탭 10개가 탭 막대를 넘쳐(막대는 `overflow:hidden`, `src/app.css:395`, 활성 탭만 보이게 스크롤 `src/shell/Pane.tsx:315-321`) `a.md`·`Preview a.md`·`code.py`가 막대 왼쪽 밖에 있었고(`verify/ORDER-01/leader-probe/out/c7-last.png`), 그 좌표의 클릭은 뒤로/앞으로 버튼·프로젝트 패널에 떨어졌다. 0이 된 네 회차는 모두 이 세 탭을 눌러야 하는 회차였다. 프로브의 `scroller()`가 "pane에서 보이는 첫 스크롤러"를 읽어 재려던 탭이 아닌 탭의 값을 읽은 회차도 있었다(편집 탭의 "앞" 값이 800·700·2400으로 들쭉날쭉).
- 확인: 프로브를 고쳐(아래) 다시 재니 모두 유지됐다. 0을 만드는 앱 코드가 없으므로 **앱 코드 변경 없음**. 원인 재현 단위 테스트는 만들지 않았다 — 앱 쪽 실패가 재현되지 않는다(8.1 "되는 경우에만").

### #12 측정 값

- 조건: 1920×1080 100%(dpi 96), 창 클라이언트 1440×852, One Dark(설정 파일 없음 기본), exe `src-tauri/target/debug/workbench-tauri.exe`(`090e5d1` debug 빌드), 실행마다 새 격리 APPDATA·WebView2 폴더, 열린 탭 넷(`a.md`·`code.py`·`test.html`·`Preview test.html`).
- 입력: 실제 휠(`tools/win-input.ps1 -Action wheel`, SendInput, 전경 확인) 6칸, 탭 이동은 CDP 마우스 클릭.
- 프로브 고침(분석 4.1): 클릭 전 `scrollIntoView` 뒤 `elementFromPoint`가 대상 안이 아니면 실패, 탭 수 넷으로 줄임, 회차마다 활성 탭 제목(떠나기 전·다른 탭·돌아온 뒤)을 판정에 넣음, `.cm-scroller` scrollTop 쓰기 스택과 프레임 메시지 순서를 CDP로 기록(실패 때만 남김 — 실패 없음).
- 앱을 새로 5번 띄워 매번 세 경우를 처음 떠나는 상태에서 쟀다.

| 경우 | 통과 | 앞→뒤 (실행 1~5) |
|---|---|---|
| 마크다운 편집 탭 `a.md` → `code.py` → 돌아옴 | 5/5 | 600→600 ×5 |
| HTML 미리보기 → `a.md` → 돌아옴 | 5/5 | 600→600 ×5 |
| HTML 미리보기 → `code.py` → 돌아옴 | 5/5 | 1200→1200 ×5 |
| 분할 pane(실행 5): 왼쪽 `code.py` 내림 → View > Open Preview to the Side로 분할 → 오른쪽 탭을 내려 씀 → 왼쪽 탭으로 돌아옴 | 1/1 | 앞 600, 분할 직후 600, 오른쪽 200, 돌아온 뒤 600 |

- 활성 탭 제목이 모든 회차에서 기대대로였다(재려던 탭·경유 탭·재려던 탭).
- 원시: `specs/v0.8.2/verify/ORDER-02/leader-probe/out/result.json`, 실행 출력 `out-run1.txt`, 캡처 `out/split-s5.png`. 프로브 `leader-probe/probe.mjs`(ORDER-01 프로브 복사).

## 검증

- `npm.cmd run test` 318/318, `npm.cmd run typecheck` 0 (coder K-02 출력, `090e5d1` 전 1회. checker는 다시 돌리지 않음 — COMMON 8절).
- 보안 설정: `git diff c0609e5 -- src-tauri/tauri.conf.json src-tauri/capabilities` → version 한 줄.
- `npm.cmd run tauri build -- --debug --no-bundle` 성공(`090e5d1`).
- 화면: #12만(위). 1~6·8의 V3는 Phase 7에서 잼.
- checker C-02 diff 리뷰 PASS(보고 `C:\Users\nampl\AppData\Local\Temp\v082-C-02-report.md`).

## 지운 것·더한 것·하지 않은 것

- 더함: `src/editor/code-block.ts`(+test), 새 설정 `preview_code_line_height`·`preview_code_line_numbers`, `div.table-wrap`, `.markdown-body.left-margin`. 지움: 안 쓰게 된 `editor.no_line_numbers.*` 값 두 개(`metrics.ts`).
- 하지 않음: I-27 앱 코드 고침(원인이 측정 오류), 분석 4.2 HTML 프레임 순서 문제 고침(leader-core 지시), 6절 화면 측정(Phase 7), HTML 미리보기 프레임·`editor/html.ts`.
- 남은 위험: 원시 HTML `<pre><code>` 안에 태그가 있고 앞뒤 빈 줄이 있으면 잘라낸 글자로 바꿀 때 안쪽 태그가 글자로 평평해진다(I-22 구현). 지금 정화 규칙에서 그런 블록이 남는지는 ORDER-03(I-24)에서 본다.

## tauri가 고른 것

- **I-15 여백 폭**: 미리보기 글자 14px에서 **64px**, 글자 크기에 비례(`64/14 × 글자 크기`). 근거: JupyterLab `--jp-cell-prompt-width: 64px`(https://github.com/jupyterlab/jupyterlab/blob/main/packages/theme-light-extension/style/variables.css), VS Code notebook 실행 칸 `cellRunGutter 36 + codeCellLeftMargin 8 = 44px`(https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/notebook/browser/notebookOptions.ts). 12.04px 고정폭에서 `[999]`는 약 36px, 오른쪽 간격 10.5px를 더하면 약 47px라 44px에는 안 들어가 JupyterLab 값을 골랐다. 미리보기 고정 왼쪽 여백 = 14 + 64 = 78px.
- **넓은 표**: 표는 본문 너비 100%, 열이 많아 더 넓으면 표만 본문 너비 안에서 가로 스크롤(`div.table-wrap { overflow-x:auto }`, GitHub 방식). 본문 너비는 그대로. 결과창 HTML 표(pandas 등)는 너비를 바꾸지 않고(결과창이 이미 가로 스크롤) 글자 크기만 같은 비율.
- **I-21 범위**: 1.0~3.0(에디터 Line Height와 같음), 단계 **0.05**(에디터는 0.1 — 1.45가 0.1 단계에 없어서). 범위·단계 밖의 파일 값은 기본값으로 읽고, Settings 화면은 가장 가까운 값으로 옮긴다(에디터와 같은 처리).
- **새 설정 키·라벨**: `preview_code_line_height` "Code Line Height" — "Controls the line height of code blocks as a multiple of the code font size." / `preview_code_line_numbers` "Code Line Numbers" — "Controls the display of line numbers in code blocks." Settings > Preview의 Code Font Size 아래.

## 바꾼 파일

- `090e5d1` 코드: `src/app.css`, `src/editor/code-block.ts`·`code-block.test.ts`(새), `src/editor/extensions.ts`, `src/settings/load.ts`·`model.ts`·`model.test.ts`, `src/shell/markdown-preview.ts`, `src/spec/metrics.ts`
- `6460fae` PROGRESS(ORDER-01 채움, ORDER-02 시작), `4bc9aa6` herdr 구성(tauri-analyst, coder Fable 5.2: `AGENTS.md`, `HERDR-SETUP.md`, PROGRESS)
- 측정 프로브·결과·이 보고·PROGRESS·HERDR-SETUP worktree 예외·ITEMS-MAP: 다음 커밋

## 미정

- **분석 4.2 HTML 프레임 순서 문제(가)·(나)** — leader-core 지시로 이 카드에서 고치지 않음. (가) 부모 iframe `load`가 그 문서의 `previewReady`보다 먼저 와서 `ours`가 한 문서 늦고, 첫 로드를 "다른 곳 이동"으로 보고 한 번 더 로드한다(`src/shell/markdown-preview.ts:228-237`). (나) 저장된 문서의 `top`이 낡았을 때 로드 직후 낡은 위치를 한 번 알린다(`src/editor/html.ts:163`). 둘 다 위치를 0으로 만들지는 않는다(#12에서 유지). 고칠지·언제(ORDER-06·07)는 leader-core가 정한다.
- I-22의 원시 HTML `<pre><code>` 안쪽 태그 평평해짐 — ORDER-03(I-24)에서 볼지 leader-core가 정한다.

## BLOCKED

- 없음(I-13은 2026-11-14 사용자 결정으로 풀림).
