[DONE] ORDER-04 tauri

V3는 debug exe로 쟀다(구현 `e25a4ac` 뒤 R1 `3736c06`로 전체 다시, R2 `3296af0`로 R1-1과 약한 항목 다시). 주 모니터 1920×1080 100%, 창 1440×852, One Dark(One Light 한 번), CDP 마우스·키(창을 앞으로 가져온 뒤). 앱 데이터·WebView 데이터·픽스처 `o4ws`는 scratchpad의 별도 폴더. 근거는 `specs/v0.8.1/verify/ORDER-04/`(`v3.json`, `v3-b.json`, `v3-c.json`, `v3-c2.json`, PNG, `mockup-F.png`(시안 F를 Edge headless로 그림), `measure.mjs`·`measure-b.mjs`·`measure-c.mjs`).

**검토·판정은 대리다**: tauri-checker(agy) 사용 한도(07:32에 풀림)로 leader-core 결정(2026-11-13, ORDER-03과 같음)대로 구현에 참여하지 않은 Claude Code 서브 에이전트(새 컨텍스트)가 C-07(코드 검토)·C-08(R1 검토·V3 판정)을 했다. 같은 Claude 계열이라 독립성이 낮다.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 자리·버튼 | left dock과 편집 영역 사이, 트리 \| Outline \| Search 눈(구분선 둘), 버튼으로 보이기·감추기, dock 닫아도 남음, 두 테마 | 충족 | `v3.json` `c11_initial.status` ["Close Left Dock","\|","Outline","\|","Search","Lock Preview"], 처음 닫힘. `c1_open`: 바 x 440(dock 200+240 뒤)·편집 영역 680부터, 버튼 `aria-pressed` true. `c1_open.dockClosed`: dock 숨김·Outline 남음. 캡처 `c1-onedark.png`·`c1-onelight.png`·`c1-dock-closed.png` |
| 2 시안 대조 | 시안 F와 나란히, 행·들여쓰기·정렬선·꺾쇠·배지 계산값 | 충족(너비 하나 다름) | `mockup-F.png` ↔ `c1-onedark.png`. 시안 F(시안 소스 `D.A`·F 설명) ↔ 앱(`c2_metrics`, `v3-b.json` `code_badge`): 행 26 ↔ 26, 들여쓰기 20 ↔ 20, 정렬선 1px·x 15 ↔ 1px·15px, 꺾쇠 16 ↔ 16, 아이콘 칸 16 ↔ 16, 배지 15 ↔ 15×15, 코드 배지 11px ↔ 11px 600, 제목 배지 9px ↔ 9px, 좌우 여백 6 ↔ 6, 간격 4 ↔ 4, 글꼴 IBM Plex Sans 14px ↔ 같음, 머리 줄 — ↔ 32(탭 줄과 같은 선). **너비 250 ↔ 240**: 처음 너비를 left dock 기본(`project_panel.default_width` L-32, 240)과 같게 했다 |
| 3 경계·너비 | 경계가 dock 경계와 같은 색·굵기, 올려도 안 바뀜, 끌어서 바뀜, 다시 열어도 유지 | 충족 | `c3_border_resize`: Outline `1px rgb(70,75,87)` = dock `1px rgb(70,75,87)`, 손잡이 올림 전후 값 같음(배경 투명, cursor col-resize). 끌기 240 → 299. 다시 연 앱 `c3_restart` {open true, width 299}, state.json `outline` {open:true,width:299}. dock과 함께 열려 끝까지 끌어도 편집 영역 6px(손잡이 폭) 남음(`v3-b.json` `a1_widths`), dock을 한계 너머로 끌어도 Outline 240 그대로(`v3-c.json` `r1_1_dock_past_max`) |
| 4 마크다운 | `#`~`####` 계층, `#` 없음, 배지 H1~H4, 코드 블록 `#` 제외 | 충족 | `c4_markdown`: Guide(H1) > Install(H2) > Windows(H3) > Path(H4), Usage(H2) > Keys(H3) — 이름에 `#` 없음, 코드 블록 안 `# not a heading` 없음. V1 `src/syntax/outline.test.ts` |
| 5 ipynb | markdown 셀 제목만, 코드 셀 없음, 누르면 JSON 줄 | 충족 | `c5_ipynb`: Analysis(H1) > Load data(H2) > Clean(H3), 코드 셀의 `# a comment`·`class Model` 없음. "Load data" 클릭 → 편집기 줄 `"## Load data"`, 포커스. 편집 탭 없이 연 노트북 미리보기도 목록 셋(`v3-b.json` `r2_notebook_preview`). V1 테스트 |
| 6 코드 | Python·TS·Rust 계층, 지역 변수 없음, 15개 언어 테스트, 지원 안 하는 파일 빈 목록·오류 없음 | 충족 | `c6_code`: py C GaussianMixture > m fit·m _e_step, f helper(지역 `local`·`tmp` 없음); ts C Store > m add, f make, I Shape(필드 `count`·지역 없음); rs S Point, i Point > m len, f main, E Kind > e A·e B. `plain.txt` "No outline". 열기 중 콘솔 오류 0(`v3-c.json` `c6_console`). V1: 15개 언어 각 항목 1개 이상(`outline.test.ts`) |
| 7 이동 | 클릭 → 편집 탭 그 줄 스크롤·커서, 미리보기 앞일 때 클릭 → 그 제목으로 스크롤 | 충족 | `c7_click_editor`: "Usage" → 커서 줄 `## Usage`, 편집기 포커스, 줄이 화면 가운데(343/711). `v3-c2.json` `c7_preview_middle`(big.md 미리보기): "Section 150" → 제목 top 0(scrollTop 18166), "Section 40" → top 0(4856) |
| 8 따라가기·갱신 | 커서 위치 항목 표시·목록 따라 스크롤, 더하고 지우면 바뀜, 탭 바꾸면 그 문서 | 충족 | `v3-b.json` `small_md`: 이동 뒤 선택 "Windows", `## Added Section` 넣고 220ms 뒤 목록에 나타나고 선택, 되돌리면 사라짐. `v3-c2.json` `c8_follow_scroll`: big.md 아래 줄로 커서 → 목록 scrollTop 288 → 2342, 선택 "Section 118"이 목록 안에 보임. `c8_tab_switch`: rs 탭 → rs 목록, Search 탭 → "No outline". 입력 직후(디바운스 안) Search 탭으로 바꿔도 앞 목록이 남지 않음(`v3-b.json` `r1_stale`) |
| 9 접기 | 꺾쇠로 접고 펼침, 접힌 항목 안 커서 → 접힌 부모 표시 | 충족 | `v3-b.json` `small_md.folded`: Install 접기 → Windows·Path 숨음, 커서가 Path에 있을 때 선택 = Install(접힌 부모), 다시 펼침. tauri가 정한 동작: 접힌 부모 행이 선택 배경, 저절로 펼치지 않음, 접힌 상태는 문서가 열려 있는 동안 유지 |
| 10 성능 | 5,000줄 넘는 코드·큰 마크다운에서 입력이 눈에 띄게 느려지지 않음(측정값) | 충족(위험 한 줄) | `v3-b.json` `big`: big.ts 6,000줄·1,800항목 — 30자 입력 중 긴 작업 137ms 1회, 입력 → 새 함수 목록 반영 559ms; big.md 약 6,300줄·300항목 — 긴 작업 없음, 반영 234ms. `a2_big_json` 12,001줄 JSON·6,000행 — 20자 입력 중 긴 작업 132ms 1회. Outline이 닫혀 있으면 계산하지 않는다(코드). 남은 위험: 최상위 노드 하나짜리 큰 파일(JSON·YAML·HTML·큰 클래스 하나)은 질의 한 번이 한 조각이고 행을 가상화하지 않아 입력 중 130ms대 멈춤이 한 번 생긴다(C-07 A-2, 하지 않음 — 이유는 아래) |
| 11 회귀 | left dock·Sidebar·탭·분할·상태 표시줄 오른쪽·Lock Preview·Search 그대로, Outline 닫은 처음 화면 = `6bcb72b`(버튼 순서 말고) | 충족 | `c11_regress`: Lock Preview 켜고 끄기, Outline 닫음, 배치 {sidebar 0·200, dock 200·240, 편집 영역 440·1000} = `c11_initial`과 같음(Outline 버튼이 새로 들어간 순서만 다름). Search 버튼 → Search 탭(`c8_tab_switch`). 캡처 `c11-initial-closed.png`. `6bcb72b` 앱을 따로 띄워 대조하지는 않았다(처음 상태는 Outline 닫힘 = v0.8 배치와 같은 DOM 폭) |
| 12 테스트 | 목록 뽑기 테스트, 전체 통과, typecheck 0 | 충족 | `3296af0`에서 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 302/302. `outline.test.ts` 7개(15개 언어, 계층, 마크다운 코드 블록, ipynb 코드 셀, C++ 포인터 메서드, 노트북 같은 단계 제목 순서), `workspace.test.ts`(outline 저장), `status.test.ts`(버튼 순서) |

## 검증
- `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 302/302(`3296af0`). `npm.cmd run tauri build -- --debug --no-bundle` 성공.
- 화면 차례 세 번(`e25a4ac` 측정, `3736c06` 전체 다시, `3296af0` R1-1·약한 항목 다시), 매번 `[SCREEN-REQ]`/`[SCREEN-OK]`/`[SCREEN-DONE]`.
- 측정 메모: 1차 스크립트의 문제(화면 밖 줄·행 클릭, 꺾쇠 위 클릭, 줄 가운데 삽입, 짧은 doc.md 미리보기)로 `measure-b.mjs`·`measure-c.mjs`로 다시 쟀다. 마지막 실행에서는 CDP 키 입력이 편집기에 닿지 않아(원인 미확인; 같은 키는 앞 실행에서 동작) 미리보기 열기는 눈 버튼, 커서 이동은 마우스로 했다. `mockup-F.png`는 두 번째 측정이 verify 폴더를 비워 지워진 것을 다시 그렸다.
- **대리 검토**: C-07 REWORK(R-1 앞 문서 목록이 다른 탭에 남음, R-2 노트북 미리보기 빈 목록; 권고 A-1~A-8) → K-04-R1; C-08 1부 REWORK 경미(R1-1) → K-04-R2, 2부 V3 #1~#12 PASS(약한 항목은 위에서 다시 잼). 보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-07-report.md`·`v081-C-08-report.md`.

## 지운 것·더한 것·하지 않은 것
- 더함: `src/shell/Outline.tsx`(바·머리 줄·목록·접기·이동·따라가기), `src/syntax/outline.ts`(Zed `outline.scm` 질의로 항목 뽑기, 마크다운은 미리보기와 같은 markdown-it 제목, ipynb는 markdown 셀 제목), 상태 표시줄 버튼·구분선, `window.outline {open,width}` 저장, dock과 같은 경계·끌기 손잡이. 편집기의 증분 분석 트리를 읽기만 한다(새 파서 없음). 의존성·설정·보안 변경 없음.
- 하지 않음: 필터·정렬·단축키·설정·오른쪽 dock·드래그·breadcrumb(카드 3.5), View 메뉴 항목, 행 키보드 이동(C-07 A-8), 최상위 노드 하나짜리 큰 파일의 질의 쪼개기(C-07 A-2: 한 단계 아래 노드에서 시작하는 패턴을 따로 돌려야 하고 비용이 실제로 주는지 앱 측정 없이 알 수 없어 몇 줄로 안 됨).
- 남은 위험: 위 #10의 130ms대 멈춤(큰 JSON·한 클래스 파일). `changedDoc` 신호로 모든 문서의 입력마다 memo 하나를 다시 본다(Outline이 닫혀 있어도, 비교만). dock과 Outline의 지정 폭 합이 본문보다 크면 둘 다 상대 폭만큼 줄어든다(편집 영역은 0이 되지 않음).

## tauri가 고른 것
- 명령 ID `outline_panel::Toggle`(키 없음), 툴팁·aria-label 열림 "Close Outline"·닫힘 "Outline"(left dock 버튼 방식), View 메뉴 항목 없음.
- 처음 너비 240 = left dock 기본 너비(시안 250). 최소·최대는 dock과 같은 규칙.
- 저장: state.json `windows[0].outline = { open, width }`(모르는 키 보존, v0.8 파일은 닫힘).
- 빈 상태 문구 "No outline"(도구 탭·Search·이미지·PDF·지원 안 하는 언어·HTML 등 다른 미리보기·항목 0개).
- 머리 줄: `list_tree` 14px, "Outline · 파일 이름", 높이 32(탭 줄과 같은 선), 12px.
- 배지(색은 UI 테마 구문 색, 번들 21개 테마 모두 값 있음):

  | 종류 | 글자 | 색 토큰 |
  |---|---|---|
  | 제목 H1~H6 | H1·H2·H3·H4·H5·H6 | syntax.title·number·string·type·function·keyword(시안 F) |
  | 클래스 | C | syntax.type |
  | 메서드 | m | syntax.function |
  | 함수 | f | syntax.keyword |
  | struct·union | S | syntax.type |
  | enum | E | syntax.type |
  | enum 멤버 | e | syntax.constant |
  | interface·trait·concept | I | syntax.type |
  | impl | i | syntax.type |
  | module·namespace | N | syntax.title |
  | type alias·typedef | T | syntax.type |
  | 변수·상수(최상위) | v | syntax.constant |
  | 매크로 | M | syntax.keyword |
  | 키(JSON·TOML·YAML) | k | syntax.property |
  | TOML 표 | [] | syntax.title |
  | CSS 선택자 | s | syntax.tag |
  | CSS @규칙 | @ | syntax.keyword |
  | HTML 요소 | <> | syntax.tag |
  | 테스트(describe/it/test) | t | syntax.string |
- 접힌 부모: 커서가 접힌 항목 안이면 그 접힌 부모가 선택 배경, 저절로 펼치지 않음, 접힌 상태는 문서가 열려 있는 동안 유지.
- 클릭: 커서를 이름 시작에 두고 그 줄을 화면 가운데로. 미리보기 탭: 제목 블록을 위끝으로(마크다운은 원본 커서도 옮김).
- 시안 수치로 새로 둔 CSS 변수(`src/spec/metrics.ts` `outline.*`, toml에 없음): header padding 10/8·gap 6, list padding_top 4, badge size 15·radius 3·font 11·heading font 9·letter-spacing −0.3·weight 600·background mix 22%.

## 바꾼 파일
- 코드 `e25a4ac`(K-04): `src/shell/Outline.tsx`(새), `src/syntax/outline.ts`(새), `src/syntax/outline.test.ts`(새), `src/App.tsx`, `src/app.css`, `src/shell/status.ts`, `src/shell/status.test.ts`, `src/shell/panels.ts`, `src/shell/dock.ts`, `src/shell/Icon.tsx`, `src/shell/markdown-preview.ts`, `src/syntax/assets.ts`, `src/syntax/document.ts`, `src/syntax/highlight.ts`, `src/editor/markdown.ts`, `src/editor/markdown-it.d.ts`, `src/theme/apply.ts`, `src/spec/metrics.ts`, `src/workspace/context.ts`, `src/workspace/state-file.ts`, `src/workspace/store.ts`, `src/workspace/workspace.test.ts`.
- 코드 `3736c06`(K-04-R1): `src/shell/Outline.tsx`, `src/syntax/outline.ts`, `src/syntax/outline.test.ts`, `src/shell/dock.ts`, `src/app.css`, `src/workspace/context.ts`.
- 코드 `3296af0`(K-04-R2): `src/shell/dock.ts`.
- 문서·검증 `5ca88ec`: `specs/v0.8.1/PLAN.md`·`PROGRESS.md`, `specs/v0.8.1/verify/ORDER-04/`.

## 미정
- 시안 수치 `outline.*` 11개의 core `spec/zed-metrics.toml` 반영 — leader-core.
- 배지 글자·색 표, "No outline" 문구, 처음 너비 240(시안 250) — 사용자 확인(V4, leader-core).
- 행 키보드 접근(C-07 A-8, AGENTS 4.3 접근성 기본) — leader-core.
- 큰 단일 노드 파일의 130ms대 멈춤(C-07 A-2)을 다음에 다룰지 — leader-core.

## BLOCKED
- 없음
