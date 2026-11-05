# Phase 5 끝 V3 실측 (카드 v02-M5, SPEC R-3·R-18~R-24·R-26~R-28·R-30, Phase 4에서 미룬 R-13·R-14 트리·탭 부분과 `statusbar.group_gap`, 남은 R-7 행, 03-tauri R-08·R-15)

> **차단 결함 먼저.** repo의 소스로 새로 만든 exe(2026-11-06 03:15:06)는 **창이 비어 있다**(시작 때 예외로 화면이 그려지지 않음). 아래 모든 판정은 그 결함을 한 토큰만 막은 **사본 exe**로 쟀다(0장). 고치지 않았고 repo 파일은 바꾸지 않았다.

## 0. 차단 결함: 만든 exe가 빈 창으로 뜬다

| 항목 | 내용 |
| --- | --- |
| 증상 | 창은 뜨지만 `#root`가 비어 있다(사이드바·트리·탭 바·상태 표시줄 없음). `src-tauri/target/debug/workbench-tauri.exe`를 실행해 CDP로 `document.getElementById('root').innerHTML.length`를 읽으면 0. |
| 원인(증거) | 시작 중 `Uncaught TypeError: Cannot read properties of undefined (reading 'replaceChildren')`(페이지의 `error` 이벤트를 `Page.addScriptToEvaluateOnNewDocument`로 받아 기록). 번들(`dist/assets/index-*.js`)의 `function PaneBody(){let e;return createRenderEffect(()=>{… e.replaceChildren(…)}),(()=>{…e=t…})()}` — `createRenderEffect`가 `e`(=`body`)에 요소가 들어가기 **전에** 바로 한 번 돌아 `undefined.replaceChildren`이 난다. |
| 위치 | `src/shell/Pane.tsx:45` (`PaneBody`의 `createRenderEffect` 안 `body.replaceChildren(...)`, 요소 대입은 47행의 `ref={body}`). `src/index.tsx`는 `render()` 뒤의 `watchUserKeymap()`·`guardClose()`가 건너뛰어지고 `finally`의 `show()`만 실행된다. |
| 왜 지금까지 안 보였나 | Phase 5 카드(P5-1·P5-2·P5-3)는 모두 "앱 실행 안 함"(V1)이었고, 이 결함은 P5-1이 `Pane.tsx`를 만든 뒤 처음 앱을 띄운 이 측정에서 드러났다. 이전 exe(01:48)는 Phase 5 소스보다 오래되었다. |
| 막지 않은 방법(시도 후 포기) | CDP `Fetch`로 번들을 가로채 고치려 했으나 `tauri.localhost` 사용자 프로토콜 응답은 `Fetch` 도메인에 잡히지 않았다(0건). |
| 측정에 쓴 우회 | scratch 폴더에 `src`를 복사해 `Pane.tsx`의 한 토큰만 `body?.replaceChildren(`로 바꾸고 `vite build` → `TAURI_CONFIG`로 `frontendDist`를 그 결과물(`src-tauri/target/wb-m5/patched-dist`)로 돌려 `tauri build --debug --no-bundle`. 결과 exe를 `%TEMP%\wb-v02-m5\app\workbench-tauri.exe`에 복사해 이 exe만 썼다. 다른 코드는 같다. **repo의 파일(`src/`·`src-tauri/`·`specs/` 등)은 바꾸지 않았다.** 측정 끝에 repo 소스 그대로 다시 `tauri build`를 돌려 `target/debug`의 exe를 원래대로 되돌렸다(10장). |
| 필요한 것 | `Pane.tsx`의 효과를 요소가 생긴 뒤에 돌게 하는 수정(고치는 방법은 구현 담당이 정한다). 아래 결과는 "이 한 줄만 막힌 앱"의 결과이므로, 수정이 다르면 `PaneBody`·탭 표시 쪽(R-26, R-27, R-28) 한 번 다시 확인이 필요하다. |

## 1. 측정 조건

- 창 논리 1440×852(`innerWidth`×`innerHeight`), 배율 100%(`devicePixelRatio` 1, 창 DPI 96), 주 모니터 1920×1080(작업 영역 1920×1032), 테마 Catppuccin Mocha(기본). 창은 위치만 (0,0)으로 올렸다(크기 그대로).
- 입력: `tools/win-input.ps1`(SendInput). `-ProcessId`로 앱을 고정했고 입력마다 전경 확인(스크립트 내장). 확인창(TaskDialog)에는 `-TargetHwnd`로 그 창을 고정했다. 값은 CDP(`getBoundingClientRect`·`getComputedStyle`·DOM·`document.activeElement`·키 이벤트 시각)로 읽었다.
- 확인창·선택 창: UI Automation(`System.Windows.Automation`)으로 문구·버튼·포커스를 읽었다. TaskDialog의 버튼은 DirectUI `Pane`이라 Invoke 패턴이 없어 **UIA가 준 사각형 가운데를 실제 마우스로 눌렀다**. OS 폴더 선택 창의 입력칸·버튼도 패턴이 없어 **실제 키 입력(경로 입력 + Enter)**으로 다뤘다.
- 한글 조합: **Microsoft 한글 입력기로 실제 입력**했다(Hangul 키로 켜고 `g k s r m f`로 `한글`). CDP `imeSetComposition`으로 대체하지 않았다.
- 기대값: `specs/v0.2/SPEC.md`·`spec/zed-metrics.toml`·`docs/refs/01-zed`. 허용 오차 `verification.tolerance.dimension` 1px(이번에는 치수가 정수로 맞아 오차를 쓸 일이 없었다).
- 시험 폴더·파일은 `%TEMP%\wb-v02-m5\`(접두어 `wb-v02-m5-`는 삭제 시험 파일), 다른 볼륨 대상은 `D:\projects\workbench-tauri\src-tauri\target\wb-m5\`(gitignore 안)에만 만들었다. 사용자 폴더는 등록하지 않았다. 앱 데이터 폴더 `%APPDATA%\workbench-tauri`는 측정 전에 없었다.
- 도구 변경: `tools/win-input.ps1`에 키 이름(`backspace`·`insert`·`.`·`,`·`/`·`\`), `click`의 `-Mods`(shift/ctrl/alt 누른 채 클릭), `middleclick`, `type`(유니코드 문자 입력)을 더했다(일반 동작). 일회성 측정 스크립트(UI Automation 도우미·세션 스크립트·집계)는 `tools/`에 남기지 않았다.

## 2. 요약

- 판정 행 263개: **통과 234, 불일치 14, 측정 불가 2, 판정 불가 1, 관찰 1, 측정값 11**(측정값은 원문에 기준 수치가 없어 기록하면 충족인 행: R-30 지연·시간 등, SPEC 공통 판정 방식).
- 불일치 14행은 서로 다른 **결함 5건**이다(+ 0장 차단 결함). 고치지 않았고 `leader`에게 보고한다.

| # | 결함 | SPEC | 근거 행 | 한 줄 원인(증거에서 추정한 것은 "추정") |
| --- | --- | --- | --- | --- |
| B-0 | **exe가 빈 창** | 전체 | 0장 | `Pane.tsx:45`의 `createRenderEffect`가 `body` 대입 전에 실행 |
| F-1 | **이름을 바꿔도 열린 탭의 제목이 옛 이름으로 남는다** | R-26 | S4a "이름 변경 때 탭 경로가 새 경로로" | 탭 클릭 뒤 트리 선택은 새 이름(`Alpha-renamed.txt`)이라 내부 경로는 바뀌었으나, 화면 제목만 옛 이름(`Alpha.txt`). `context.ts` `followMove`가 같은 탭 객체의 `path`를 제자리에서 바꾸고(`tab.path = …`) `Pane.tsx`의 `<For each={tabs()}>`는 같은 객체를 다시 그리지 않으며 `tab.path`는 반응형이 아니다(추정) |
| F-2 | **우클릭 메뉴의 단축키가 02 11.2와 다른 별칭 키로 표시** | R-23 | S4c 메뉴 6행("단축키 표시") | 표시는 Copy `Ctrl-Insert`(기대 Ctrl-C), Paste `Shift-Insert`(Ctrl-V), Trash `Backspace`(Delete), Delete `Ctrl-Backspace`(Ctrl-Delete). 내장 키맵에서 같은 액션의 여러 키 가운데 나중 별칭이 보임(추정: `shortcutFor`가 마지막 바인딩을 고른다). 나머지 항목·순서·구분선·비활성은 모든 메뉴에서 맞음 |
| F-3 | **붙여넣기·복제 결과 경로에 `\\?\`가 붙어 만든 파일이 열리지도 선택되지도 않는다** | R-22 (I-097) | S4c 4행 | 코어가 돌려준 경로 실측: `duplicate_path` → `\\?\C:\Users\…\diag copy.txt`. `files.rs:144-145`가 `fs::canonicalize`로 대상 경로를 만들어 확장 경로(`\\?\`)가 나온다(추정). 프런트는 트리·탭 경로(`C:\…`)와 비교하므로 `showCreated`의 탭 열기·`reveal`이 모두 빗나가고, 잘라내 옮긴 열린 탭의 새 경로도 같은 형식이라 그 탭을 눌러도 트리가 따라오지 않는다 |
| F-4 | **다른 볼륨 이동(C:→D:)이 언제나 실패한다**(데이터 손실 없음) | R-22 | S4c "다른 볼륨 이동", S5 "O4" | 알림 `Could not paste the item.`, C: 원본 그대로, D:에는 빈 예약 파일조차 안 생김. 코어는 `MoveFileExW` 실패가 "다른 장치"일 때만 복사 뒤 삭제 경로로 가는데(`files.rs:157-160`), `io::Error::from(windows::core::Error)`는 `from_raw_os_error(HRESULT)`라(`windows-result 0.4.1 error.rs:169-173`) `raw_os_error()`가 17이 아니고 `kind()`도 `AlreadyExists`가 되지 않는다(추정). 같은 원인으로 **같은 폴더에 같은 이름이 있는 곳으로 잘라 붙이기**도 ' copy' 이름 대신 실패 알림(관찰, 아래). 같은 볼륨 이동·모든 복사는 정상 |
| F-5 | **한글 조합 중 Esc 한 번이 입력 행 전체를 취소** | R-20 (03-tauri R-08) | S4e "조합 중 Escape" | 조합 중 keydown(229, `isComposing`)은 무시했지만(통과) Microsoft 한글 입력기는 조합을 확정한 **뒤** `isComposing=false`인 `Escape` keydown을 한 번 더 보내고(`compositionend` 다음) 앱은 그것을 취소로 처리한다. Enter도 같은 모양(두 번째 `Enter`)이나 결과가 완성된 이름 확정이라 통과로 적었다 |

- 측정 불가: `statusbar.group_gap`(오른쪽 묶음이 여전히 없음), Ctrl+Alt+R 실입력(R 키가 WebView까지 오지 않음. 앱 안 배선은 합성 키로 통과).
- 판정 불가: Trash가 휴지통에 도착하는지(이 PC의 C:·D: 휴지통이 꺼져 있음).
- 관찰은 8장.

## 3. 시험 전후 상태

| 대상 | 측정 전 | 측정 뒤(복구) |
| --- | --- | --- |
| `%APPDATA%\workbench-tauri` | 없음(`Test-Path` false) | 지움(없음). 시험 중 만든 `state.json`·`keymap.json`만 있었다 |
| `%TEMP%\wb-v02-m5` | 없음 | 지움(없음) |
| `src-tauri\target\wb-m5` | 없음 | 지움(없음). 안에 `vol`·`vol-big`(다른 볼륨 대상)과 `patched-dist`(0장 우회)가 있었다 |
| 휴지통 | 시험 항목 0개 | 시험 항목 0개. 이 PC는 모든 볼륨이 "삭제 즉시 파일 제거"라 `Trash`한 시험 항목이 휴지통에 남지 않았다(이름 목록: 없음). 휴지통 설정은 바꾸지 않았다 |
| 내가 연 창 | — | 탐색기 창(ops-d·ops-g)·메모장 창을 내가 연 것만 `WM_CLOSE`로 닫음. 사용자가 원래 열어 둔 `설정` 창 등은 건드리지 않았다 |
| 한글 입력기 상태 | 영문 | 영문(Hangul 키를 켠 만큼 껐다. 입력기 상태는 앱 창별이라 앱을 끝내면 남지 않음) |
| `workbench-tauri.exe` 프로세스 | 0 | 0 |
| `tools/win-input.ps1` | — | 위 1장의 일반 동작을 더한 채 둠(추적 파일 변경) |

## 4. 시나리오 증거

### 4.1 R-27 시나리오 A-33.2 (S2, 스크린샷 `phase5/r27-step0~3.png`)

| 단계 | 실제 입력 | 탭 DOM 덤프 | 판정 |
| --- | --- | --- | --- |
| 0 시작 | 없음 | 탭 0개(빈 탭 바: 시작 540·목록 601·끝 1353, 높이 32) | 통과 |
| 1 | `README.md` 한 번 클릭 | `[{README.md, active, preview, font-style italic}]` | 통과 |
| 2 | `notes.txt` 한 번 클릭 | 같은 자리 교체: `[{notes.txt, preview, italic}]` | 통과 |
| 3 | `notes.txt` 더블클릭 | `[{notes.txt, preview false, font-style normal}]`, 포커스 편집기 | 통과 |

### 4.2 R-28 시나리오 A-33.4 (S3, 스크린샷 `phase5/r28-step0~5.5.png`)

0 시작(`state.json`에 proj-a 하나) → 1 푸터 `Add Project` 실제 클릭 → 실제 폴더 선택 창에 경로 입력 + Enter로 proj-b 등록(목록 맨 아래, 활성) → 2 proj-b에서 `b1.txt`·`b3.txt` 탭 → 3 proj-a로 전환(proj-b 탭 안 보임), `README.md`·`notes.txt` 탭 → 4 전환을 오가도 탭이 따로 유지(proj-b `b1.txt,b3.txt*` / proj-a `README.md,notes.txt*`, 탭 내용도 폴더별) → 5 proj-b 우클릭 `Remove` → 목록에서만 빠짐, **디스크의 proj-b는 이름·크기(16 B)·내용 해시·수정 시각 전후 동일**, proj-a 탭 그대로. 같은 세션에서 R-14: 해제한 폴더를 같은 경로로 다시 등록하면(선택 창 응답은 페이지가 대신 돌려줌, 창은 열리지 않음) **탭 0개, 트리 루트만 펼침** = 해제 때 문맥(탭 포함)이 버려진다. 프로젝트 패널 루트 우클릭 `Remove from Project`(세 번째 해제 경로)로 proj-a를 해제하면 proj-b가 활성이 되고 proj-a 디스크는 그대로. 단계별 표는 S3.

## 5. 판정 표

표의 "판정" 열은 통과 / 불일치 / 측정 불가 / 판정 불가 / 관찰 / 측정값이다. 세션은 앱을 한 번씩 새로 띄워 시험 폴더와 `state.json`을 미리 만들어 놓고 시작했다. 같은 행을 스크립트의 기대값 오기로 다시 돌린 경우는 마지막 실행만 적었다.


## S1 — R-18 트리 치수·순서, R-19 누르기·키 (가상 스크롤 포함)


### R-18 트리 치수·순서

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| L-41 활성 폴더 루트가 맨 위, 펼친 채 | 첫 행 proj-a, aria-level 1, aria-expanded true | proj-a, level 1, expanded true | 통과 |
| 순서: 폴더 먼저, 대소문자 무시 자연 정렬 | proj-a / docs\guides\rust / docs-mixed / many / nest / src / Alpha.txt / bad.txt / beta.txt / config.toml / file2.txt / file10.txt / index.html / noread.txt / notes.txt / other.txt / README.md | proj-a / docs\guides\rust / docs-mixed / many / nest / src / Alpha.txt / bad.txt / beta.txt / config.toml / file2.txt / file10.txt / index.html / noread.txt / notes.txt / other.txt / README.md | 통과 |
| L-42 자식 폴더 하나뿐인 경로를 한 줄로(docs\guides\rust), 자식 하나가 파일이면 합치지 않음(docs-mixed) | docs\guides\rust 한 줄 / docs-mixed 별도 줄 | docs\guides\rust / docs-mixed | 통과 |
| 시작 포커스 | 트리·탭 어느 곳에도 포커스 없음(body) | BODY. | 통과 |
| L-43 project_panel.collapsed_path.padding_x | 2px 좌우, 조각 3개 | docs 2px/2px, guides 2px/2px, rust 2px/2px | 통과 |
| L-36 project_panel.item.height | 26px (행 26개 전부) | 26 | 통과 |
| 행 사이 간격(위치가 높이 단위) | 연속 행 top 차 26 | 26 | 통과 |
| L-36 project_panel.item.content_height | 24px | 24 | 통과 |
| L-48 project_panel.item.border_width / border_right_width | 위·아래·왼쪽 1px, 오른쪽 2px | 1px/1px/1px/2px | 통과 |
| L-37 project_panel.item.padding_x / gap | 좌우 6px, 간격 4px | 6px/6px/4px | 통과 |
| L-40(판정 안 함, 기록) 아이콘 크기 icons.size.medium(L-06) | 16×16 | 16x16 | 통과 |
| L-37 project_panel.indent_step (들여쓰기 단계) | 깊이 k 행의 아이콘 x = 행 왼쪽 + 1 + (aria-level−1)×20 + 6 | docs\guides\rust:2→27 docs-mixed:2→27 many:2→27 nest:2→27 l1:3→47 l2:4→67 l3:5→87 l4:6→107 leaf.txt:7→127 d.txt:6→107 c.txt:5→87 b.txt:4→67 a.txt:3→47 src:2→27 Alpha.txt:2→27 bad.txt:2→27 beta.txt:2→27 config.toml:2→27 file2.txt:2→27 file10.txt:2→27 index.html:2→27 noread.txt:2→27 notes.txt:2→27 other.txt:2→27 README.md:2→27 | 통과 |
| 들여쓰기 span 개수·폭 | 깊이 단계 수 = aria-level−1, 폭 20 | 1:0×- 2:1×20 2:1×20 2:1×20 2:1×20 3:2×20 4:3×20 5:4×20 6:5×20 7:6×20 6:5×20 5:4×20 | 통과 |
| L-38 안내선 개수 | 조상 단계 수(aria-level−1) | 1:0 2:1 2:1 2:1 2:1 3:2 4:3 5:4 6:5 7:6 6:5 5:4 | 통과 |
| L-38 안내선 x = 깊이×indent_step + indent_guide.offset_x | k×20+15 (행 왼쪽 바깥 기준, 테두리 1px 안쪽 보정 1) | l4#0:15 l4#1:35 l4#2:55 l4#3:75 l4#4:95 leaf.txt#0:15 leaf.txt#1:35 leaf.txt#2:55 leaf.txt#3:75 leaf.txt#4:95 leaf.txt#5:115 — 행 안쪽 기준 실제 값 목록은 위 첫 항목 | 통과 |
| L-38 안내선 폭 | 1px | 1px | 통과 |
| L-38 위아래 여백 indent_guide.padding_y | 첫 줄 top 4px, 마지막 줄 bottom 4px, 나머지 0 | first: 4px,4px,4px,4px,4px,4px / last: 4px,4px,4px,4px,4px,4px / 중간 top: 0px | 통과 |
| role/aria 속성 | 모든 행 role=treeitem, aria-level, 폴더만 aria-expanded | role·level 전부 있음, 폴더 행만 expanded | 통과 |
| D-9 전체 높이 = 행 수 × item.height | 행 수 184 × 26 = 4784 | spacer 4784 — DOM 행 41 | 통과 |
| D-9 DOM에는 보이는 범위 ±10행만 | 보이는 31행 + 앞뒤 10 이내(최대 51), 전체 184보다 훨씬 적음 | DOM 행 41 (처음 proj-a, 마지막 m033.txt) | 통과 |
| D-9 행 위치가 26 단위 | 모든 행의 (top − 스크롤 영역 top + scrollTop) mod 26 = 0 | 0 | 통과 |
| 휠 스크롤 뒤 DOM 행 수·위치(5회) | DOM 행 ≤ 52, 위치 mod 26 = 0 | st=100 dom=45 proj-a…m037.txt \| st=200 dom=48 proj-a…m040.txt \| st=300 dom=51 docs\guides\rust…m044.txt \| st=400 dom=51 x.txt…m048.txt \| st=300 dom=51 docs\guides\rust…m044.txt | 통과 |
| End 뒤 마지막 행이 DOM에 있고 선택 | 마지막 행 aria-selected, DOM 행 ≤ 범위 | scrollTop 3996/3996, 마지막 README.md, DOM 41, 선택 README.md | 통과 |
| L-48 패널 포커스 + 선택 행 테두리 = panel_focused_border(border.focused) | rgb(180, 190, 254) | rgb(180, 190, 254)/rgb(180, 190, 254)/rgb(180, 190, 254)/rgb(180, 190, 254) — :focus-within true | 통과 |
| L-48 패널 포커스가 없으면 테두리는 투명(배경색) | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0)/rgba(0, 0, 0, 0) (포커스 pane) | 통과 |

### R-19 누르기·키

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| I-089 폴더 한 번 클릭 = 펼침 | src aria-expanded true, aria-selected true, 자식 lib.rs·main.rs·util 보임 | exp true, sel true, 아래 행: util, lib.rs, main.rs, Alpha.txt | 통과 |
| 클릭 뒤 포커스 위치 | 프로젝트 패널(편집기 아님) | panel | 통과 |
| 폴더 다시 클릭 = 접힘 | src aria-expanded false | exp false | 통과 |
| I-089 Alt+클릭 = 하위 전체 펼침 | nest, l1, l2, l3, l4 모두 펼침 + leaf.txt 보임 | 펼친 폴더: proj-a, nest, l1, l2, l3, l4; leaf.txt 보임 true | 통과 |
| Alt+클릭 다시 = 하위 전체 접힘 | nest 접힘, l1~l4 행 없음 | nest exp false, 남은 펼침: proj-a, l1 행 false | 통과 |
| I-087 파일 한 번 클릭 = 임시 탭, 편집기에 포커스 안 줌 | 탭 notes.txt(p) 하나, 포커스 panel | 탭 notes.txt*(p), 포커스 panel | 통과 |
| I-087 더블클릭 = 일반 탭 + 편집기 포커스 | 탭 other.txt 일반(*), 포커스 editor | 탭 other.txt*, 포커스 editor | 통과 |
| I-087 가운데 클릭 = 일반 탭 + 편집기 포커스 | 탭 beta.txt 일반(*), 포커스 editor | 탭 other.txt,beta.txt*, 포커스 editor | 통과 |
| I-090 Shift+클릭 = 범위 선택 | Alpha.txt~config.toml (bad.txt, beta.txt 포함 4개) | Alpha.txt,bad.txt,beta.txt,config.toml | 통과 |
| I-090 Ctrl+클릭 = 개별 추가 | 범위 + file10.txt | Alpha.txt,bad.txt,beta.txt,config.toml,file10.txt | 통과 |
| I-090 Ctrl+클릭 = 개별 해제 | beta.txt 빠짐 | Alpha.txt,bad.txt,config.toml,file10.txt | 통과 |
| I-030 Up = 위 항목 선택 | 15→14 | 15→14 | 통과 |
| I-030 Down ×2 | 15→16 | 15→16 | 통과 |
| I-088 End = 마지막 행 | 16 | 16 | 통과 |
| gpui 판단 표 끝에서 돌지 않음(Down) | 마지막 행 그대로 | 16 | 통과 |
| I-088 Home = 첫 행(루트) | 0 | 0 | 통과 |
| 끝에서 돌지 않음(Up) | 첫 행 그대로 | 0 | 통과 |
| I-030 Up/Down/Home/End는 파일을 열지 않음 | 탭 목록 불변 (other.txt*,beta.txt,Alpha.txt(p)) | other.txt*,beta.txt,Alpha.txt(p) | 통과 |
| I-089 Left = 펼친 폴더를 접음 | src 접힘, 선택 유지 | src exp false, 선택 src | 통과 |
| I-089 Right = 닫힌 폴더를 펼침 | src 펼침 | src exp true | 통과 |
| I-089 Right = 이미 펼쳤으면 다음 항목 선택 | util(첫 자식) | util | 통과 |
| I-031 Left = 파일·닫힌 폴더에서 부모로 | src | src | 통과 |
| I-043 Shift+Down = 범위 확장 | src, util, lib.rs 3개 연속 | src,util,lib.rs | 통과 |
| I-043 Shift+Up = 범위 줄임 | 2개 | src,util | 통과 |
| I-032 Ctrl+Right = 전체 펼침 | 모든 폴더 펼침(루트, rust, docs-mixed, only, many, nest, l1~l4, src, util) | proj-a,docs\guides\rust,docs-mixed,only,many,nest,l1,l2,l3,l4,src,util — 전체 184행; 화면 위쪽 DOM 41행과 End 뒤 DOM의 펼침 폴더를 합쳐 판정(가상 스크롤) | 통과 |
| I-032 Ctrl+Left = 루트만 남기고 전체 접음 | 루트만 펼침 | proj-a — 선택: proj-a | 통과 |
| I-033 Space = 파일을 임시 탭으로 열고 트리에 포커스 유지 | 활성 탭 config.toml(p), 포커스 panel | 탭 other.txt,beta.txt,config.toml*(p), 포커스 panel | 통과 |
| I-033 Space = 폴더면 토글 | src 접힘 | src exp false | 통과 |

## S2 — R-26 탭·R-27 시나리오 A-33.2·R-24 자동 표시·R-13/R-14 폴더별 문맥·R-7 툴팁·statusbar.group_gap


### R-26 탭

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 탭이 없을 때 탭 바는 시작·끝 영역과 빈 목록 자리를 그대로 둔다 | 탭 0개, 시작·목록·끝 영역 모두 있고 목록 폭 > 0 | 탭 0; 시작 540,33,61,32; 목록 601,33,752,32; 끝 1353,33,87,32; 목록 아래 선 1px | 통과 |
| I-062 일반 탭이 있을 때 다른 파일 한 번 클릭 = 새 임시 탭이 활성 탭 바로 뒤 | notes.txt, other.txt(p)* 순서, 일반 탭은 낮아지지 않음 | notes.txt,other.txt*(p) | 통과 |
| pane.max_preview_tabs=1: 임시 탭 교체 | other.txt 자리에 file2.txt(p), 총 2개 | notes.txt,file2.txt*(p) | 통과 |
| I-062·I-063 임시 탭이 열려 있을 때 다른 파일을 더블클릭 | 더블클릭의 첫 클릭이 임시 탭 자리를 재사용하고 둘째 클릭이 일반으로 승격: notes.txt, index.html* | notes.txt,index.html* — 첫 클릭(임시 열기)이 기존 임시 탭 file2.txt를 교체하는 것은 I-062와 같은 흐름 | 통과 |
| I-087 가운데 클릭은 임시 탭을 건드리지 않고 일반 탭을 활성 탭 바로 뒤에 추가 | notes.txt, index.html, other.txt*, file2.txt(p) 또는 활성 뒤 삽입(임시 탭 유지) | notes.txt,index.html,file2.txt(p),other.txt* | 통과 |
| I-063 임시 탭으로 열린 파일을 더블클릭 = 일반 탭으로 승격(탭 수 불변) | 탭 수 불변(앞 단계에서 other.txt를 더해 4개), file2.txt가 임시가 아님 | ["notes.txt","index.html","file2.txt*","other.txt"] | 통과 (기대값 보정: 스크립트의 '탭 3개'가 앞 단계 중간 클릭 추가 전 값이었음. 측정값은 file2.txt가 활성·임시 표시 없음·탭 4개 그대로) |
| L-63 탭 테두리 (탭 5개, 활성 1번째 notes.txt) | L-63 표: 1:010 2:011 3:011 4:011 5:011 (왼쪽·오른쪽·아래 선 1/0) | 1:010 2:011 3:011 4:011 5:011 — 선 = 폭 1 + 색 border, 0 = 폭 1 투명(여백) | 통과 |
| L-23 tab.content_height / 탭 바 높이 | 내용 31px, 탭(아래 선 포함) 32px | 내용 31, 탭 32 | 통과 |
| L-24 tab.padding_x / tab.gap | 좌우 padding 4px, gap 4px | 4px/4px/4px | 통과 |
| L-63 tab.border_width, tab.active_padding_bottom | 선 폭 1px, 활성 탭 아래 여백 1px(선 없음) | 폭: 1/1/1 | 통과 |
| L-63 탭 테두리 (탭 5개, 활성 2번째 index.html) | L-63 표: 1:001 2:110 3:011 4:011 5:011 (왼쪽·오른쪽·아래 선 1/0) | 1:001 2:110 3:011 4:011 5:011 — 선 = 폭 1 + 색 border, 0 = 폭 1 투명(여백) | 통과 |
| L-63 탭 테두리 (탭 5개, 활성 3번째 file2.txt) | L-63 표: 1:001 2:101 3:110 4:011 5:011 (왼쪽·오른쪽·아래 선 1/0) | 1:001 2:101 3:110 4:011 5:011 — 선 = 폭 1 + 색 border, 0 = 폭 1 투명(여백) | 통과 |
| L-63 탭 테두리 (탭 5개, 활성 4번째 beta.txt) | L-63 표: 1:001 2:101 3:101 4:110 5:011 (왼쪽·오른쪽·아래 선 1/0) | 1:001 2:101 3:101 4:110 5:011 — 선 = 폭 1 + 색 border, 0 = 폭 1 투명(여백) | 통과 |
| L-63 탭 테두리 (탭 5개, 활성 5번째 other.txt) | L-63 표: 1:001 2:101 3:101 4:101 5:110 (왼쪽·오른쪽·아래 선 1/0) | 1:001 2:101 3:101 4:101 5:110 — 선 = 폭 1 + 색 border, 0 = 폭 1 투명(여백) | 통과 |
| gpui 판단 표 깨진 UTF-8 바이트는 대체 문자로 | ok �� end (U+FFFD 2개) | "ok �� end" — 0xFF 0xFE → 2개 | 통과 |
| 읽지 못하면 빈 읽기 전용 탭 | 탭은 열리고 내용 비어 있음(읽기 전용은 입력이 막히는 것으로 판정: 위 행) | {"tabs":7,"text":"","ro":"true"} — CM6 readOnly는 contenteditable을 끄지 않아 속성은 true(관찰). 입력 차단은 notes.txt 사례에서 확인 | 통과 |
| D-10 읽기 전용: 글자 입력해도 문서·디스크가 바뀌지 않음 | 문서 텍스트 동일, 디스크 해시 동일 | 문서 "text of notes.txtsecond line" → "text of notes.txtsecond line"; 해시 11f7bd82a37d5139 → 11f7bd82a37d5139; 포커스 editor | 통과 |
| Q-C 구문 강조: toml·html만 | toml·html은 강조 span 있음, txt·md는 없음 | toml {"spans":12,"classes":6}, html {"spans":38,"classes":6}, txt {"spans":0,"classes":0}, md {"spans":0,"classes":0} | 통과 |

### R-27 시나리오 A-33.2

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 1. README.md 한 번 클릭 | 임시 탭 1개, 제목 README.md, 기울임(font-style italic) | [{"title":"README.md","active":true,"preview":true,"italic":"italic"}] | 통과 |
| 2. 다른 파일(notes.txt) 한 번 클릭 | 같은 자리에서 교체: 탭 1개, 제목 notes.txt, 임시(기울임) | [{"title":"notes.txt","active":true,"preview":true,"italic":"italic"}] | 통과 |
| 3. 더블클릭 | 일반 탭: 탭 1개, notes.txt, 임시 아님(font-style normal), 편집기 포커스 | [{"title":"notes.txt","active":true,"preview":false,"italic":"normal"}] 포커스 editor | 통과 |

### R-24 자동 표시

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 관찰: 루트 행 클릭 | (기록) 루트도 폴더 행이라 클릭으로 접힘 | aria-expanded false, 행 1개 | 측정값 |
| 사전: 전체 접힘, 선택 root | 펼친 폴더 proj-a만 | proj-a | 통과 |
| I-096 활성 파일이 notes.txt로 바뀌면 트리가 그 항목을 보이고 선택 | 선택 notes.txt, 포커스는 트리가 아님 | 선택 notes.txt, 포커스 pane | 통과 |
| I-096 깊은 파일(leaf.txt, 깊이 7)의 탭 활성 → 조상 폴더 모두 펼침 | nest, l1, l2, l3, l4 aria-expanded true + leaf.txt aria-selected | 펼침 proj-a,nest,l1,l2,l3,l4; 선택 leaf.txt | 통과 |
| I-096 트리에 포커스를 가져오지 않음 | document.activeElement가 프로젝트 패널·트리 안이 아님 | pane | 통과 |

### R-13/R-14 폴더별 문맥

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| A-13.3 폴더를 바꾸면 트리가 그 폴더 루트 하나로 바뀐다 | 첫 행 proj-b, proj-a의 행·탭 없음 | proj-b; 탭 []; 펼침 proj-b | 통과 |
| A-15.6 전환 뒤 포커스는 사이드바 | sidebar | sidebar | 통과 |
| A-15.2 펼침·선택·스크롤·탭이 전환해도 유지(proj-a) | {"open":"many","sel":"m010.txt","tabs":"notes.txt,README.md,leaf.txt,m010.txt*(p),config.toml,index.html,file2.txt,beta.txt,other.txt,bad.txt,noread.txt","scrollTop":300,"root":"docs\\guides\\rust"} | {"open":"many","sel":"m010.txt","tabs":"notes.txt,README.md,leaf.txt,m010.txt*(p),config.toml,index.html,file2.txt,beta.txt,other.txt,bad.txt,noread.txt","scrollTop":300,"root":"docs\\guides\\rust"} | 통과 |
| A-15.1 proj-b의 탭·펼침·선택도 유지 | {"open":"proj-b,sub","sel":"b1.txt","tabs":"b1.txt*","scrollTop":0,"root":"proj-b"} | {"open":"proj-b,sub","sel":"b1.txt","tabs":"b1.txt*","scrollTop":0,"root":"proj-b"} | 통과 |
| A-15.1 탭이 폴더마다 따로 | proj-a 탭 [notes.txt,README.md,leaf.txt,m010.txt*(p),config.toml,index.html,file2.txt,beta.txt,other.txt,bad.txt,noread.txt], proj-b 탭 [b1.txt*] | 서로 다른 목록 | 통과 |

### R-7 프로젝트 패널 항목 툴팁

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| L-49·L-247 hover 지연 project_panel.name_tooltip_delay | 1500ms 안에는 안 뜨고(0.9s 시점 hidden), 마지막 마우스 이동 뒤 약 1500ms에 뜸 | 0.9s 시점 hidden=true; 표시까지 1495ms (마지막 mousemove 기준) | 통과 |
| L-247 문구 = 항목의 절대 경로, 홈은 ~ | ~\AppData\Local\Temp\wb-v02-m5\fx\proj-a\many\m020.txt | ~\AppData\Local\Temp\wb-v02-m5\fx\proj-a\many\m020.txt — 항목 C:\Users\nampl\AppData\Local\Temp\wb-v02-m5\fx\proj-a\many\m020.txt | 통과 |

### statusbar.group_gap

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| L-29 statusbar.group_gap | 8px (왼쪽·오른쪽 묶음 사이) | computed column-gap 8px; 묶음 1개(group grow:300:1140) — Phase 5 뒤에도 오른쪽 묶음(커서 위치 L-256)이 없어 두 묶음 사이 간격이 그려지지 않는다. computed 값만 확인 | 측정 불가 |

## S2b — R-3 Delete·Ctrl+N 깊이 규칙과 나중 바인딩(사용자 keymap.json)


### R-3 Delete 키 깊이 규칙

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| R-3 Ctrl+N: 사이드바 포커스에서는 아무 일 없음, 패널에서는 새 파일 입력 행 | 사이드바 입력 행 없음 / 패널 입력 행 있음(폴더 뒤 파일 자리) | 사이드바 false; 패널 입력 행 위치 6 | 통과 |
| R-3·I-702 같은 컨텍스트에 두 번 묶은 키는 나중 바인딩이 이김 | ctrl-shift-m → 나중 것(NewDirectory): 입력 행이 맨 앞(행 1) | 입력 행 위치 1 | 통과 |
| R-3 패널 포커스 + 루트 선택 + Delete = 아무 일도 하지 않음 | 확인창 없음, 사이드바 3개 그대로, 디스크 불변 | 창 2→2, 사이드바 3개, 디스크 차이 0건 | 통과 |
| R-3 패널 포커스 + 루트 아닌 항목 + Delete = 휴지통 확인창(사이드바 해제 아님) | 확인창 1개, 사이드바 3개 그대로 | 확인창 1개(#32770), 사이드바 3개 | 통과 |
| R-3 확인창 Esc 뒤 디스크 불변 | other.txt 그대로 | 차이 0건 | 통과 |
| R-3 사이드바 포커스 + Delete = 등록 해제(확인창 없음) | proj-c 목록에서 빠짐(2개), 확인창 없음, 디스크 불변 | 포커스 sidebar; 사이드바 proj-a,proj-b; 창 2개; 디스크 차이 0건 | 통과 |

## S3 — R-28 시나리오 A-33.4(실제 폴더 선택 창 1회 등록), R-14 해제


### R-28 시나리오 A-33.4

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 0. 시작: state.json에 proj-a 하나 | 사이드바 proj-a* | proj-a* | 통과 |
| 1. 푸터 Add Project → 실제 폴더 선택 창 | 앱 소유 대화상자 1개 | 1개 #32770:폴더 선택 | 통과 |
| 1a. 선택 창 제목·소유 | 제목 '폴더 선택', 앱 프로세스 소유 #32770 | '폴더 선택' #32770 | 통과 |
| 1a. 경로 입력 + Enter로 선택 창 닫힘 | 창이 닫히고 폴더가 등록됨 | Enter 2번 뒤 선택 창 0개 | 통과 |
| 1b. 고른 폴더 proj-b가 목록 맨 아래에 붙고 활성 | proj-a, proj-b* | proj-a,proj-b* — 선택 창 남음 0개 | 통과 |
| 2. proj-b에서 b1.txt·b3.txt 탭을 연다 | 탭 b1.txt, b3.txt* | b1.txt,b3.txt* | 통과 |
| 3a. proj-a로 전환: proj-b의 탭이 보이지 않음 | 탭 목록 비어 있음 | (없음) | 통과 |
| 3b. proj-a에서 README.md·notes.txt 탭을 연다 | 탭 README.md, notes.txt* | README.md,notes.txt* | 통과 |
| 4. 전환해도 탭이 따로 유지 | proj-b b1.txt,b3.txt* / proj-a README.md,notes.txt* (활성 탭 포함 그대로) | b b1.txt,b3.txt* / a README.md,notes.txt* / b b1.txt,b3.txt* | 통과 |
| 4a. 탭 내용도 폴더별 | proj-b 활성 탭 b3.txt의 내용 'b3' | b3 | 통과 |
| 5a. proj-b 우클릭 메뉴 | Move Up / Move Down / Remove | Move Up / Move Down / Remove | 통과 |
| 5b. Remove = 목록에서만 빼기(확인창 없음) | proj-a* 하나, 선택 창·확인창 없음, 활성은 proj-a | proj-a* | 통과 |
| 5c. 해제한 proj-b가 디스크에 그대로 | 4 items, 3 files, 16 B 전후 동일(이름·크기·내용 해시·수정 시각) | 4 items, 3 files, 16 B; 차이 0건 | 통과 |
| 5d. proj-a의 탭은 그대로 | README.md, notes.txt* | README.md,notes.txt* | 통과 |

### R-14 해제와 탭

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| A-13.4·R-14 해제한 폴더의 탭은 함께 닫힘 — 같은 경로를 다시 등록하면 새 문맥 | proj-b 탭 없음(b1.txt·b3.txt 사라짐), 트리는 루트만 펼침(sub 접힘) | 선택 요청 1회(응답 대체); 사이드바 proj-a,proj-b*; 탭 []; 펼침 proj-b; 선택 - — 선택 창의 결과값만 페이지가 대신 돌려줌(창 안 열림) | 통과 |
| I-555 프로젝트 패널 루트 우클릭 → Remove from Project | 메뉴에 Remove from Project 있음 | New FileCtrl-N / New FolderAlt-N / Reveal in File ExplorerCtrl-Alt-R / Open in Default AppCtrl-Shift-Enter / CutCtrl-X / CopyCtrl-Insert / Duplicate / PasteShift-Insert / Copy PathAlt-Shift-C / Copy Relative PathCtrl-K Ctrl-Shift-C / Add Folders to Project… / Remove from Project / Expand AllCtrl-Right / Collapse AllCtrl-Left | 통과 |
| R-14 ③ 루트 Remove from Project = 활성 폴더(proj-a)를 해제, 디스크 그대로 | proj-b* 하나, proj-a 폴더 디스크 불변 | proj-b*; proj-a 차이 0건 ; 확인창 0개 — A-13.5: 활성 폴더 해제 뒤 아래 항목, 없으면 위 항목을 활성화 | 통과 |

### 실행 기록

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 진짜 선택 창 열기(이 표의 마지막 실행) | 1회(등록) | 1회 | 통과 (앞선 실행에서 도우미 오류로 6번 더 열림: 10장) |

## S4a — R-20 인라인 입력(Ctrl+N·Alt+N·F2/Enter·Esc·포커스 잃음·배너), 긴 탭 제목(L-26)


### R-20 인라인 입력

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| I-036 Ctrl+N: 새 파일 입력 행이 폴더들 뒤 첫 자리(gpui 판단 표) | 폴더 3개(1..3) 바로 뒤 = 행 4 | 입력 행 위치 4; 앞 행 zz-folder, 뒤 행 .hidden | 통과 |
| P-019·P-020 입력칸 inline_input.height / border_* | 입력칸 높이 24, 테두리 위·아래·왼쪽 1, 오른쪽 2, 행 높이 26 유지 | 입력칸 24, 행 26, 테두리 1px/1px/1px/2px | 통과 |
| P-019 입력칸에 포커스, 빈 값 | document.activeElement = 입력칸, value 빈 문자열 | focused true, value "" | 통과 |
| L-48/P-020 포커스 테두리 색 | rgb(180, 190, 254) | rgb(180, 190, 254) | 통과 |
| 입력칸 안의 방향키·Backspace·Space·Ctrl+C/V는 입력칸이 처리(키맵 우회) | 트리 선택·확장 불변, 입력칸에 편집 결과가 반영됨 | value "ab cab  c"; 선택 행 ops-a — 입력 순서: abc,←,Backspace(a·c→ac?),Home,End… 마지막 값 참고 | 통과 |
| I-035 Escape = 입력을 버리고 패널로 포커스 복귀 | 입력 행 사라짐, 디스크 불변, 포커스 panel, 선택 원복 | 입력 행 false; 포커스 panel; 선택 ops-a; 디스크 차이 0건 | 통과 |
| P-022 Enter = 파일 생성(크기 0), 입력 행 사라짐 | 디스크에 created-by-ctrl-n.txt(0 B), 트리에 그 행, 선택됨 | 디스크 0 B; 트리 true; 선택 created-by-ctrl-n.txt | 통과 |
| I-097 생성한 파일 = 일반 탭 + 편집기 포커스 | 탭 created-by-ctrl-n.txt 일반, 포커스 editor | 탭 existing.txt(p),created-by-ctrl-n.txt*, 포커스 editor | 통과 |
| I-036 Alt+N: 새 폴더 입력 행은 맨 앞(루트 바로 아래) | 행 1 | 행 1 | 통과 |
| 새 폴더 생성 | 디스크에 new-dir 폴더, 선택됨, 포커스 panel | 디스크 true; 선택 new-dir; 포커스 panel | 통과 |
| P-022 a/b/c.txt는 사이 폴더도 만든다 | sub1\sub2\deep.txt | 디스크 true | 통과 |
| P-022 새 항목 입력이 /로 끝나면 폴더 생성 | slash-dir 폴더 | true | 통과 |
| P-022 새 항목 입력이 \로 끝나면 폴더 생성 | back-dir 폴더 | true | 통과 |
| P-022 Windows: 이름 끝 마침표를 모두 지운다 | dots.txt (dots.txt... 아님) | dots.txt | 통과 |
| P-021 같은 이름 오류 문구 | File or directory 'memo.txt' already exists at location. Please choose a different name. | File or directory 'memo.txt' already exists at location. Please choose a different name. | 통과 |
| P-021 배너 inline_input.banner.padding_y/padding_x/border | 4/8/1px | 4px/4px, 8px/8px, 1px | 통과 |
| 오류 색: 입력 행 테두리·배너 글자·배너 테두리 = status.error | rgb(243, 139, 168) | 행 rgb(243, 139, 168), 배너 글자 rgb(243, 139, 168), 배너 테두리 rgb(243, 139, 168) | 통과 |
| P-022 같은 이름은 Enter로 확정되지 않고 입력칸 유지 | 입력칸 그대로, memo.txt 안 바뀜 | 입력칸 true; memo.txt 내용 "memo text\n" | 통과 |
| P-021·P-022 앞뒤 공백 경고 문구 | File or directory name contains leading or trailing whitespace. | File or directory name contains leading or trailing whitespace. | 통과 |
| 경고 색 = status.warning | rgb(249, 226, 175) | 행 rgb(249, 226, 175), 배너 글자 rgb(249, 226, 175) | 통과 |
| 금지 문자(:) 이름은 Enter로 확정되지 않음 | 입력칸 유지, 디스크에 bad:name 없음 | 입력칸 true; 없음 | 통과 |
| I-092 포커스를 잃으면 확정을 시도 — 확정되는 이름 | blur-ok.txt 생성, 입력칸 사라짐, 편집기 포커스를 주지 않음 | 디스크 true; 입력칸 false; 포커스 BODY. | 통과 |
| I-092 포커스를 잃으면 확정을 시도 — 안 되는 이름(예약 장치 con)은 버림 | con 없음, 입력칸 사라짐 | 없음; 입력칸 false | 통과 |
| I-091 F2: 파일은 확장자를 뺀 이름만 선택 | value memo.txt, 선택 0~4 | value memo.txt, 0~4 | 통과 |
| 이름 변경 확정 | renamed.txt 있음, memo.txt 없음, 내용 보존, 선택 renamed.txt, 포커스 panel | true/false; 내용 "memo text\n"; 선택 renamed.txt; 포커스 panel | 통과 |
| I-091 Enter(ProjectPanel 바인딩): 폴더는 이름 전체 선택 | value rename-me, 선택 0~9 | value rename-me, 0~9 | 통과 |
| I-091 앞의 점은 확장자가 아님(.hidden 전체 선택) | 선택 0~7 | value .hidden, 0~7 | 통과 |
| I-091·A-14 루트는 이름을 바꿀 수 없음 | F2에 입력칸 안 열림 | 입력칸 false | 통과 |
| R-26 이름 변경 뒤 탭 클릭이 가리키는 경로(내부 경로가 새 경로인가) | 트리 선택이 Alpha-renamed.txt | 탭 제목 [Alpha.txt,blur-ok.txt,dots.txt,deep.txt,created-by-ctrl-n.txt] → 탭 클릭 뒤 선택 Alpha-renamed.txt | 통과 |
| R-26 이름 변경 때 탭 경로가 새 경로로 | 탭 제목 Alpha-renamed.txt(활성), Alpha.txt 탭 없음, 트리 선택 동일 | 탭 Alpha.txt*,blur-ok.txt,dots.txt,deep.txt,created-by-ctrl-n.txt; 선택 Alpha-renamed.txt | 불일치 |
| 이름 변경도 같은 이름이면 오류 배너 + Enter 거부(덮어쓰지 않음) | 배너 오류 문구, existing.txt 그대로 | File or directory 'Alpha-renamed.txt' already exists at location. Please choose a different name.; existing.txt true | 통과 |

### R-26 탭

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| L-26 tab.max_title_chars=24: 긴 제목 말줄임 | a-very-long-file-name-fo… | a-very-long-file-name-fo… — 원래 48자 | 통과 |

## S4e — 03-tauri R-08 한글 조합(Microsoft 한글 입력기 실제 입력)


### 03-tauri R-08 한글 조합

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 사전: Microsoft 한글 입력기가 실제로 조합 중 | 'r' 키 → 'ㄱ' | value "ㄱ.txt" (hangul 키 1번) | 통과 |
| 조합 중 입력 값 | 한글.txt(마지막 글자 글 조합 중) | value "한글.txt" | 통과 |
| 조합 중 Enter | 조합 중(keydown 229, isComposing true)에는 확정하지 않는다. 마지막 글자(글)가 잘리거나 겹치지 않는다 | 이벤트 keydown\|Process\|229\|true\|\|한글.txt\| ; compositionupdate\|\|\|\|글\|한글.txt\| ; beforeinput\|\|\|true\|글\|한글.txt\|insertCompositionText ; input\|\|\|true\|글\|한글.txt\|insertCompositionText ; compositionend\|\|\|\|글\|한글.txt\| ; keydown\|Enter\|13\|false\|\|한글.txt\|; 입력칸 없음; 디스크 한글.txt,한글메모.txt — IME가 Enter를 먼저 조합 확정에 쓰고 keyup/뒤 keydown이 어떻게 오는지 기록 | 통과 (관찰: 한 번의 Enter로 조합 확정과 이름 확정이 함께 일어남 — 입력기가 조합을 끝낸 뒤 isComposing=false인 Enter keydown을 한 번 더 보내기 때문) |
| 조합 중 Enter 최종 결과(디스크) | 조합 중(keydown 229, isComposing true)에는 확정하지 않는다. 마지막 글자(글)가 잘리거나 겹치지 않는다 | 한글.txt,한글메모.txt | 통과 (관찰: 한 번의 Enter로 조합 확정과 이름 확정이 함께 일어남 — 입력기가 조합을 끝낸 뒤 isComposing=false인 Enter keydown을 한 번 더 보내기 때문) |
| 조합 중 Escape | 조합 중 Esc가 입력 행을 취소하지 않는다(03-tauri R-08, SPEC R-20 마지막 항목) | 조합 중 값 "한.txt"; 이벤트 keydown\|Process\|229\|true\|\|한.txt\| ; compositionupdate\|\|\|\|한\|한.txt\| ; beforeinput\|\|\|true\|한\|한.txt\|insertCompositionText ; input\|\|\|true\|한\|한.txt\|insertCompositionText ; compositionend\|\|\|\|한\|한.txt\| ; keydown\|Escape\|27\|false\|\|한.txt\|; 이후 입력칸 없음(취소됨) — IME가 Esc를 조합 취소에 쓰는지 앱까지 전달되는지 기록 | 불일치 (조합 중 keydown 229는 무시했지만, 입력기가 조합을 확정한 뒤 isComposing=false인 Escape keydown을 한 번 더 보내 입력 행 전체가 취소됨) |
| 조합 중 방향키는 트리 선택을 바꾸지 않는다 | 선택 <input> 그대로 | 선택 <input>; 입력칸 "한.txt"; 이벤트 keydown\|Process\|229\|true\|\|한.txt\| ; compositionupdate\|\|\|\|한\|한.txt\| ; beforeinput\|\|\|true\|한\|한.txt\|insertCompositionText ; input\|\|\|true\|한\|한.txt\|insertCompositionText ; compositionend\|\|\|\|한\|한.txt\| ; keydown\|ArrowDown\|40\|false\|\|한.txt\| ; keydown\|ArrowUp\|38\|false\|\|한.txt\| ; keydown\|ArrowLeft\|37\|false\|\|한.txt\| | 통과 |

## S4b — R-21 휴지통·영구 삭제 확인창(UI Automation)·실패 알림


### R-21 휴지통·영구 삭제

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 사전: 측정 PC의 작업 드라이브에 휴지통이 있는가 (SPEC R-21 판정 방법 마지막 줄) | C:(시험 폴더)·D:(저장소)에 휴지통이 켜져 있어야 휴지통 도착을 판정할 수 있다(SPEC R-21 판정 방법 마지막 줄) | 레지스트리 HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\BitBucket\Volume\{볼륨 GUID}\NukeOnDelete = 1 (C:·D:·E:·I: 전부) = '휴지통으로 이동하지 않고 삭제 즉시 파일 제거'. C:\$Recycle.Bin 안에는 desktop.ini뿐, 셸의 휴지통 항목 0개 | 판정 불가 (Trash 호출 뒤 디스크에서 사라지는 것까지만 판정. 시스템 설정은 바꾸지 않음. gpui v0.3 Q-16과 같은 사정) |
| A-14.4 Delete(패널 포커스) = 확인창 | TaskDialog 1개 | #32770 제목 'workbench-tauri' | 통과 |
| A-14.7 문구 | Do you want to trash `wb-v02-m5-trash-1.txt`? | Do you want to trash `wb-v02-m5-trash-1.txt`? | 통과 |
| D-12 창 제목 = workbench-tauri | workbench-tauri | workbench-tauri | 통과 |
| A-14.7 버튼 = Trash 와 취소 | Trash, 취소(OS 언어의 Cancel) | Trash, 취소 | 통과 |
| 03-tauri R-15 기본 버튼 = 취소(포커스) | 포커스가 취소 버튼 | 포커스 Window:workbench-tauri,Pane:,Pane:취소 | 통과 |
| TaskDialog UI Automation 전체 | (기록) | Window:workbench-tauri \| Pane:workbench-tauri \| Pane: \| Pane: \| Image:MainInstructionIcon \| Text:Do you want to trash `wb-v02-m5-trash-1.txt`? \| Text: \| Pane:Trash \| Pane:취소 | 측정값 |
| Esc = 취소(대화상자 닫힘, 디스크·휴지통 불변) | 대화상자 0개, 파일 그대로, 휴지통 목록 같음 | 대화상자 0개; 디스크 차이 0건; 휴지통 같음 | 통과 |
| I-039 Backspace도 휴지통 확인창 | TaskDialog 1개 | 있음 | 통과 |
| 03-tauri R-15 Enter = 기본 버튼(취소)이라 삭제하지 않음 | 대화상자 닫힘, 파일 그대로 | 대화상자 0개; 디스크 차이 0건; 휴지통 같음 | 통과 |
| I-040 shift+delete = 영구 삭제 확인창(문구·버튼) | Are you sure you want to permanently delete `wb-v02-m5-del-1.txt`? / This cannot be undone. / Delete+취소 | Are you sure you want to permanently delete `wb-v02-m5-del-1.txt`? / This cannot be undone. \| 버튼 Delete,취소 \| 포커스 Window:workbench-tauri,Pane:,Pane:취소 | 통과 |
| I-040 ctrl+delete = 영구 삭제 확인창(문구·버튼) | Are you sure you want to permanently delete `wb-v02-m5-del-1.txt`? / This cannot be undone. / Delete+취소 | Are you sure you want to permanently delete `wb-v02-m5-del-1.txt`? / This cannot be undone. \| 버튼 Delete,취소 \| 포커스 Window:workbench-tauri,Pane:,Pane:취소 | 통과 |
| I-040 ctrl+backspace = 영구 삭제 확인창(문구·버튼) | Are you sure you want to permanently delete `wb-v02-m5-del-1.txt`? / This cannot be undone. / Delete+취소 | Are you sure you want to permanently delete `wb-v02-m5-del-1.txt`? / This cannot be undone. \| 버튼 Delete,취소 \| 포커스 Window:workbench-tauri,Pane:,Pane:취소 | 통과 |
| 영구 삭제 확인창 취소 3번 뒤 디스크·휴지통 불변 | 같음 | 디스크 0건 변경; 휴지통 같음 | 통과 |
| A-14.3 Trash 확인 = 휴지통으로 이동 | 디스크에서 trash-3.txt 사라짐, 휴지통 목록에 생김 | 디스크 - wb-v02-m5-trash-3.txt; 휴지통 + — 휴지통 도착은 판정 불가(위 사전 행) | 통과 |
| D-17 삭제 뒤 선택 = 같은 자리의 행 | 행 16 자리의 항목(wb-v02-m5-trash-open.txt) 선택 | 선택 wb-v02-m5-trash-open.txt | 통과 |
| 확인 뒤 포커스·알림 | 알림 없음, 대화상자 닫힘 | 알림 없음; 창 0개 | 통과 |
| gpui 판단 표 열린 파일을 지워도 탭은 그대로 | 탭 trash-open.txt 남음, 트리에서는 사라짐 | 탭 wb-v02-m5-trash-open.txt*,wb-v02-m5-trash-3.txt(p); 트리 false; 휴지통 false | 통과 |
| 폴더 휴지통 문구 | Do you want to trash `wb-v02-m5-trash-dir`? | Do you want to trash `wb-v02-m5-trash-dir`? | 통과 |
| 폴더 휴지통 이동(내용 포함) | 디스크에서 폴더 사라짐, 휴지통에 폴더 | 디스크 false; 휴지통  — 휴지통 도착은 판정 불가 | 통과 |
| A-14.3 Delete 확인 = 영구 삭제 | 디스크에서 사라지고 휴지통에는 없음 | 디스크 - wb-v02-m5-del-2.txt; 휴지통 변화 없음 | 통과 |
| A-14.9 여러 항목: 본문 'the following N files?' + 이름 목록 | Do you want to trash the following 3 files? + wb-v02-m5-multi-1.txt, wb-v02-m5-multi-2.txt, wb-v02-m5-multi-3.txt | Do you want to trash the following 3 files? ⏎ wb-v02-m5-multi-1.txt ⏎ wb-v02-m5-multi-2.txt ⏎ wb-v02-m5-multi-3.txt | 통과 |
| A-14.9·P-015 넘치는 목록: 10개까지 + '.. 2 files not shown' | permanently delete the following 12 files? + 이름 10개 + '.. 2 files not shown' | Are you sure you want to permanently delete the following 12 files? ⏎ s01.txt ⏎ s02.txt ⏎ s03.txt ⏎ s04.txt ⏎ s05.txt ⏎ s06.txt ⏎ s07.txt ⏎ s08.txt ⏎ s09.txt ⏎ s10.txt ⏎ .. 2 files not shown / This cannot be undone. (이름 10개) | 통과 |
| 두 번 취소 뒤 디스크·휴지통 불변 | 같음 | 디스크 0건; 휴지통 같음 | 통과 |
| A-14.11 잠긴 파일 휴지통 실패 알림 | Failed to trash 1 of 1 file(s). , 파일 그대로 | 알림 Failed to trash 1 of 1 file(s).; 디스크 0건; 휴지통 같음 | 통과 |
| A-14.11 잠긴 파일 영구 삭제 실패 알림 | Failed to delete 1 of 1 file(s). , 파일 그대로 | 알림 Failed to delete 1 of 1 file(s).; 파일 true | 통과 |
| A-14.11 일부 실패: 알림은 하나, 성공한 것은 처리 | Failed to trash 1 of 2 file(s). , ok-with-locked.txt는 휴지통, locked-c.txt는 그대로 | 선택 locked-c.txt,ok-with-locked.txt; 알림 Failed to trash 1 of 2 file(s).; ok false, locked-c true; 휴지통 false | 통과 |

### 실행 기록

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 휴지통에 남은 시험 항목(이름 목록만 보고, 지우거나 복원하지 않음) | — |  | 측정값 |

## S4c — R-22 복사·잘라내기·붙여넣기·복제·경로 복사·다른 볼륨, R-23 우클릭 메뉴 구성


### R-23 우클릭 메뉴

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| I-660 파일 구성(항목·순서·구분선·비활성) | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Rename / Trash / Delete | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Rename / Trash / Delete — 선택 plain.txt | 통과 |
| I-660 파일 단축키 표시 | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-C / Paste Ctrl-V [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Rename F2 / Trash Delete / Delete Ctrl-Delete | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-Insert / Paste Shift-Insert [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Rename F2 / Trash Backspace / Delete Ctrl-Backspace | 불일치 |
| I-560 우클릭한 항목이 선택이 된다 | plain.txt 선택 | plain.txt | 통과 |
| I-535 마크다운 파일(Open Markdown Preview 비활성, D-15) 구성(항목·순서·구분선·비활성) | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / Open Markdown Preview [disabled] / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Rename / Trash / Delete | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / Open Markdown Preview [disabled] / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Rename / Trash / Delete | 통과 |
| I-535 마크다운 파일(Open Markdown Preview 비활성, D-15) 단축키 표시 | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-C / Paste Ctrl-V [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Rename F2 / Trash Delete / Delete Ctrl-Delete | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-Insert / Paste Shift-Insert [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Rename F2 / Trash Backspace / Delete Ctrl-Backspace | 불일치 |
| I-661 폴더(루트 아님) 구성(항목·순서·구분선·비활성) | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Rename / Trash / Delete / --- / Expand All / Collapse All | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Rename / Trash / Delete / --- / Expand All / Collapse All | 통과 |
| I-661 폴더(루트 아님) 단축키 표시 | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-C / Paste Ctrl-V [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Rename F2 / Trash Delete / Delete Ctrl-Delete | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-Insert / Paste Shift-Insert [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Rename F2 / Trash Backspace / Delete Ctrl-Backspace | 불일치 |
| I-537 접힌 경로(docs \ guides) 폴더: Unfold Directory 구성(항목·순서·구분선·비활성) | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Unfold Directory / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Rename / Trash / Delete / --- / Expand All / Collapse All | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Unfold Directory / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Rename / Trash / Delete / --- / Expand All / Collapse All — 접힌 줄에서 우클릭 | 통과 |
| I-537 접힌 경로(docs \ guides) 폴더: Unfold Directory 단축키 표시 | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-C / Paste Ctrl-V [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Rename F2 / Trash Delete / Delete Ctrl-Delete | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-Insert / Paste Shift-Insert [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Rename F2 / Trash Backspace / Delete Ctrl-Backspace | 불일치 |
| I-662 루트 구성(항목·순서·구분선·비활성) | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Add Folders to Project… / Remove from Project / --- / Expand All / Collapse All | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Add Folders to Project… / Remove from Project / --- / Expand All / Collapse All | 통과 |
| I-662 루트 단축키 표시 | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-C / Paste Ctrl-V [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Expand All Ctrl-Right / Collapse All Ctrl-Left | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-Insert / Paste Shift-Insert [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Expand All Ctrl-Right / Collapse All Ctrl-Left | 불일치 |
| I-559 빈 공간 우클릭 = 루트 메뉴 구성(항목·순서·구분선·비활성) | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Add Folders to Project… / Remove from Project / --- / Expand All / Collapse All | New File / New Folder / --- / Reveal in File Explorer / Open in Default App / --- / Cut / Copy / Duplicate / Paste / --- / Copy Path / Copy Relative Path / --- / Add Folders to Project… / Remove from Project / --- / Expand All / Collapse All — 빈 공간 y=483 (마지막 행 아래 423) | 통과 |
| I-559 빈 공간 우클릭 = 루트 메뉴 단축키 표시 | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-C / Paste Ctrl-V [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Expand All Ctrl-Right / Collapse All Ctrl-Left | New File Ctrl-N / New Folder Alt-N / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Cut Ctrl-X / Copy Ctrl-Insert / Paste Shift-Insert [disabled] / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / Expand All Ctrl-Right / Collapse All Ctrl-Left | 불일치 |
| I-559 빈 공간 우클릭 시 선택 | 루트 선택 | ops-c | 통과 |
| I-562 여러 항목을 표시해도 메뉴 구성은 같음, 표시 유지 | 파일 메뉴와 같은 항목, 선택 dup-me.txt·plain.txt | 같음; 선택 dup-me.txt,plain.txt | 통과 |
| I-042·I-502 menu: 메뉴 위치 = 선택 행 왼쪽 아래 + (menu.context.keyboard_offset_x, _y) | (2, 2) | (2, 2) | 통과 |
| I-042·I-502 shift+f10: 메뉴 위치 = 선택 행 왼쪽 아래 + (menu.context.keyboard_offset_x, _y) | (2, 2) | (2, 2) | 통과 |

### R-22 복사·잘라내기·붙여넣기·복제·경로 복사

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| I-037·D-17 붙여넣기 이름: 대상에 같은 이름이 있으면 ' copy' | target-dir에 src-a copy.txt가 생기고 기존 src-a.txt(다른 내용)는 그대로 | target-dir: dupname.txt, existing.txt, src-a copy.txt, src-a.txt; 기존 해시 ee2d3f6ba44b24db → ee2d3f6ba44b24db | 통과 |
| gpui v0.3 P3-D1 덮어쓰지 않음 + 내용 같음 | 원본과 복사본 내용 해시 같음, 원본 불변 | 원본 d5e03b62706ecf70, 복사본 d5e03b62706ecf70 | 통과 |
| gpui v0.3 P3-D2 NTFS 추가 스트림·수정 시각 보존 | meta 스트림 'stream-data-a', 수정 시각 2021-03-04T05:06:07.0000000Z | meta 'stream-data-a', 2021-03-04T05:06:07.0000000Z | 통과 |
| I-097 붙여넣기로 생긴 파일 = 일반 탭, 포커스는 패널, 마지막 항목 선택 | 탭 src-a copy.txt 일반, 포커스 panel, 선택 src-a copy.txt | 탭 src-a.txt*(p); 포커스 panel; 선택 target-dir | 불일치 |
| 붙여넣기 이름 ' copy 1' | src-a copy 1.txt | src-a copy 1.txt, src-a copy.txt, src-a.txt | 통과 |
| 폴더 복사(루트에 붙임): 이름 'fold copy', 내용 전부 | fold copy\top.txt, fold copy\inner\deep.txt 내용 같음 | 있음 true; 64896f89fd111900 vs 64896f89fd111900 | 통과 |
| 폴더 복사 두 번째: 'fold copy 1' | fold copy 1 | fold, fold copy, fold copy 1 | 통과 |
| I-543 Duplicate(메뉴): 같은 폴더에 ' copy', 일반 탭, 마지막 항목 선택 | dup-me copy.txt 생성, 내용 같음, 탭 열림 | true; 탭 src-a.txt*(p); 선택 dup-me.txt | 불일치 |
| Duplicate 두 번째: ' copy 1' | dup-me copy 1.txt | dup-me copy 1.txt, dup-me copy.txt, dup-me.txt | 통과 |
| I-037 잘라내기+붙여넣기(같은 볼륨 다른 폴더) | src-b.txt가 target-dir로 이동(내용 같음), 원본 없음 | 원본 false; 대상 e20c8a96a1d5b838 (원래 e20c8a96a1d5b838) | 통과 |
| R-26 이동하면 열린 탭 경로가 따라감 | src-b.txt 탭이 그대로(새 경로) | src-b.txt* | 통과 |
| 같은 폴더에 잘라 붙이면 아무 일도 하지 않음 | 디스크 불변, 알림 없음 | 차이 0건; 알림 없음 | 통과 |
| 폴더를 자기 안에 붙이기는 실패(알림 하나, 디스크 불변) | Could not paste the item. , 차이 0 | 알림 Could not paste the item.; 차이 0건 | 통과 |
| 코어 duplicate_path가 돌려주는 경로 형식 (프런트가 트리·탭 경로와 비교하는 값) | 트리·탭과 같은 형식 C:\Users\… (앞에 \\?\ 없음) | \\?\C:\Users\nampl\AppData\Local\Temp\wb-v02-m5\ops\ops-c\diag copy.txt — files.rs transfer()가 fs::canonicalize 결과로 대상 경로를 만든다 | 불일치 |
| R-26·R-24 잘라내기로 옮긴 파일의 탭을 누르면 트리가 새 위치를 펼쳐 선택 | target-dir 펼침 + src-b.txt 선택 | 선택 [fold]; target-dir true | 불일치 |
| I-037 잘라내기: 대상에 같은 이름이 있으면(덮어쓰지 않고) ' copy' 이름으로 이동 | dupname copy.txt로 이동, 기존 dupname.txt(target dupname) 그대로 | target-dir: dupname.txt; 원본 true; 알림 Could not paste the item.; 기존 내용 "target dupname\n" | 관찰 (SPEC에 이 경우의 결과가 정해져 있지 않음. 코드 의도는 ' copy' 이름이나 실제로는 덮어쓰지 않고 실패 알림만 냄. 원인은 다른 볼륨 이동 불일치와 같은 곳) |
| AUDIT 3 회피: 복사 실패(원본 잠김)는 알림으로 알린다 | Could not paste the item. 알림 하나 | 알림 Could not paste the item. — 관찰: 대상에 남은 부분 복사본 0 B 파일(코드 주석: 실패 시 부분 복사본은 지우지 않음) | 통과 |
| gpui P3-D1 원본은 그대로 | locked-src.txt 내용 보존 | 크기 14 B | 통과 |
| AUDIT 3 회피: 잘라내기 실패는 알림 + 클립보드(실패한 원본) 유지 | 알림 Could not paste the item. , 원본 그대로, Paste 비활성 아님 | 알림 Could not paste the item.; 원본 true; Paste	Shift-Insert | 통과 |
| I-041·I-548 Shift+Alt+C = 절대 경로(OS 클립보드) | C:\Users\nampl\AppData\Local\Temp\wb-v02-m5\ops\ops-c\plain.txt | C:\Users\nampl\AppData\Local\Temp\wb-v02-m5\ops\ops-c\plain.txt | 통과 |
| I-549 Ctrl+K Ctrl+Shift+C = 상대 경로 | plain.txt | plain.txt | 통과 |
| 여러 항목: 줄바꿈으로 이음 | C:\Users\nampl\AppData\Local\Temp\wb-v02-m5\ops\ops-c\dup-me.txt\nC:\Users\nampl\AppData\Local\Temp\wb-v02-m5\ops\ops-c\plain.txt | "C:\\Users\\nampl\\AppData\\Local\\Temp\\wb-v02-m5\\ops\\ops-c\\dup-me.txt\r\nC:\\Users\\nampl\\AppData\\Local\\Temp\\wb-v02-m5\\ops\\ops-c\\plain.txt" | 통과 |
| 루트의 상대 경로 = 폴더 이름 | ops-c | ops-c | 통과 |
| gpui P3-D1·D2 다른 볼륨 이동(C: → D:) | 원본 없음, D:에 cross.txt와 cross-dir 전체(내용 해시 같음), 알림 없음 | C:원본 true/true; D:대상 false/false; 알림 Could not paste the item. — 원본은 그대로 남았고 D:에는 아무것도(빈 예약 파일도) 생기지 않는다 = 데이터 손실은 없음. 이동이 시작되기 전에 실패 | 불일치 |
| 다른 볼륨 이동 실패 뒤 원본 불변 | C: 원본 목록·크기·수정 시각 전후 동일 | 차이 0건 | 통과 |
| 다른 볼륨 복사(C: → D:, Ctrl+C·Ctrl+V) | D:에 cross.txt와 cross-dir 전체, 해시 같음, 원본 그대로 | D: true/true; 해시 d35f9ef84cd82317 (원래 d35f9ef84cd82317); 폴더 차이 0건; 원본 true/true | 통과 |
| gpui P3-D2 다른 볼륨 복사 결과의 NTFS 추가 스트림·수정 시각 보존 | cross.txt 2021-03-04T05:06:07.0000000Z stream-data-cross ; c1.txt 2021-03-04T05:06:07.0000000Z - ; c2.txt 2021-03-04T05:06:07.0000000Z - | cross.txt 2021-03-04T05:06:07.0000000Z stream-data-cross ; c1.txt 2021-03-04T05:06:07.0000000Z - ; c2.txt 2021-03-04T05:06:07.0000000Z - | 통과 |
| L-247 홈 밖 경로(D:)의 항목 툴팁은 ~ 없이 절대 경로 | D:\projects\workbench-tauri\src-tauri\target\wb-m5\vol\vol-d\v1.txt | D:\projects\workbench-tauri\src-tauri\target\wb-m5\vol\vol-d\v1.txt | 통과 |

## S4d — R-23 메뉴 항목 실행, Reveal in File Explorer·Open in Default App(창 열림·닫음)


### R-23 메뉴 항목 실행

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| New File(메뉴) → 입력 행 | 입력 행 열림(선택 항목의 폴더=루트), 포커스 입력칸 | {"s":0,"e":0,"v":"","focus":true} | 통과 |
| New File(폴더 dest에서) → 입력 행이 dest 안(펼치고) | dest 아래에 <input> | dest / <input> / keep.txt | 통과 |
| Esc 뒤 임시로 펼친 dest 접힘 | dest 접힘(keep.txt 안 보임) | ops-d,dest,docs\guides,wide,note-a.txt,note-b.txt,README.md,to-move.txt | 통과 |
| New Folder(메뉴) | 입력 행이 dest 아래 | dest / <input> / keep.txt | 통과 |
| Rename(메뉴) | 입력칸에 note-a.txt, 선택 0~6(확장자 뺌) | {"s":0,"e":6,"v":"note-a.txt","focus":true} | 통과 |
| I-544 클립보드가 비었을 때 Paste 비활성 | Paste disabled | {"label":"Paste","disabled":true} | 통과 |
| Cut 뒤 Paste 활성 | Paste enabled | {"label":"Paste","disabled":false} | 통과 |
| Paste(메뉴): 잘라낸 파일을 dest로 | to-move.txt가 dest 안으로 이동 | 원본 false; dest true | 통과 |
| Copy·Duplicate(메뉴) | note-a copy.txt 생성 | note-a copy.txt,note-a.txt | 통과 |
| Copy Path(메뉴) | C:\Users\nampl\AppData\Local\Temp\wb-v02-m5\ops\ops-d\note-b.txt | C:\Users\nampl\AppData\Local\Temp\wb-v02-m5\ops\ops-d\note-b.txt | 통과 |
| Copy Relative Path(메뉴) | note-b.txt | note-b.txt | 통과 |
| Trash(메뉴) → 확인창 | TaskDialog 1개 | 1개 | 통과 |
| Delete(메뉴) → 확인창 | TaskDialog 1개 | 1개 | 통과 |
| 두 확인창 취소 뒤 디스크 불변 | 차이 0 | 0건 | 통과 |
| 사전: 접힌 경로 한 줄 | docs\guides 한 줄 | docs\guides | 통과 |
| Unfold Directory: 두 줄로 펼침 | docs, guides 각각 한 줄 | docs | 통과 |
| I-539 Unfold 뒤 docs 메뉴에 Fold Directory | Fold Directory 있음, Unfold 없음 | New Folder,Fold Directory | 통과 |
| Fold Directory: 다시 한 줄 | docs\guides | docs\guides | 통과 |
| Expand All(폴더 wide): 하위 전체 펼침 | wide, inner, deeper 펼침(w3.txt 보임) | ops-d,wide,inner,deeper | 통과 |
| Collapse All(폴더 wide): 하위 전체 접힘 | wide 접힘, inner·w3.txt 없음 | dest,docs\guides,wide | 통과 |
| Expand All(루트) | 모든 폴더 펼침 | ops-d:true,dest:true,docs\guides:true,wide:true,inner:true,deeper:true | 통과 |
| Collapse All(루트): 루트만 남김 | 루트만 펼침 | ops-d | 통과 |
| D-15 Open Markdown Preview(비활성)를 눌러도 아무 일 없음 | 메뉴 열린 채 그대로·탭·창 불변 | 비활성 true; 탭 true; 창 22→22 | 통과 |
| I-554 Add Folders to Project…(루트 메뉴) = 폴더 등록과 같은 동작 | 선택 요청 1회, 사이드바에 extra-folder 추가·활성 | 요청 1회(응답 대체); ops-d,extra-folder* | 통과 |

### R-23 Reveal·Open in Default App

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| I-533 Reveal in File Explorer(메뉴) → 탐색기 창 | note-a.txt가 있는 폴더 ops-d를 보여 주는 탐색기 창이 열림(닫음) | 새 최상위 창 CabinetWClass:ops-d - 파일 탐색기(pid 13672); 셸 창 위치 ops-d\|file:///C:/Users/nampl/AppData/Local/Temp/wb-v02-m5/ops/ops-d — 닫음 1개, 남음 0 | 통과 |
| I-534 Open in Default App(메뉴, .txt) → 기본 앱 창 | 기본 앱(.txt) 창이 열림(닫음) | 새 최상위 창 Notepad:note-a.txt - 메모장(pid 1996) — 닫음 1개, 남음 0 | 통과 |
| P5-3 Ctrl+Alt+R(패널 포커스) → 탐색기 | 패널 포커스에서 Ctrl+Alt+R이 탐색기를 연다 | 실제 입력(SendInput)으로는 R 키 keydown이 WebView에 도달하지 않음(페이지가 받은 것: Control, Alt뿐. 같은 방식의 Ctrl+Alt+J는 j까지 도달). 앱 배선 대조: 패널 포커스에서 CDP 합성 Ctrl+Alt+R(keydown r:true:true)을 보내면 `ops-g - 파일 탐색기` 창이 열림(닫음) | 측정 불가 (실입력). 앱 안 배선은 합성 키로 통과. 이 PC에서 R 키만 앱에 오지 않는 원인은 앱 밖(다른 프로그램의 전역 단축키로 추정, 확인 못 함) |
| P5-3 Ctrl+Shift+Enter(패널 포커스) → 기본 앱 | 기본 앱 창이 열림(닫음) | 새 최상위 창 Notepad:note-a.txt - 메모장(pid 29672) — 닫음 1개, 남음 0 | 통과 |
| 폴더에 대한 Reveal | 탐색기가 열림(닫음) | 새 최상위 창 CabinetWClass:ops-d - 파일 탐색기(pid 13672); 셸 ops-d\|file:///C:/Users/nampl/AppData/Local/Temp/wb-v02-m5/ops/ops-d — 닫음 1개 | 통과 |
| 열린 창 정리 | 내가 연 창만 닫음, 앱 프로세스는 그대로 | 남은 탐색기 창(사용자가 원래 열어 둔 것 포함) 0개; 앱 창 2개 | 측정값 |

## S5 — R-30 큰 파일 열기·재귀 복사·다른 볼륨 복사/이동 중 입력 응답


### R-30 UI가 막히지 않음

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 시험 크기(leader 고정) | 큰 파일 10MB HTML 1개, 큰 폴더 파일 2,000개 × 100KB | HTML 10485817 B; 폴더 2000개 항목 204800000 B | 통과 |
| 기준: 아무 작업도 없을 때(트리 키 이동 지연, 하트비트 최대 간격) | (기록, 기준 없음) | Up/Down 5회 키→선택 변화 0.7~1 ms(중앙 0.9); 하트비트(10 ms 주기) 최대 간격 12 ms | 측정값 |
| 큰 파일(10MB HTML) 열기 중 트리 키 이동·메뉴 열기에 응답 | (기록, 기준 없음) 선택했던 행 big10mb.html | Up/Down 14회 중 14회 응답, 키→선택 변화 18.4~2797.7 ms(중앙 1731); Shift+F10 메뉴 열림 지연 2414.6, 1482.5 ms; 하트비트 최대 간격 2945 ms (50 ms 초과 2번, 100 ms 초과 1번) — 파일 표시 true, 탭 big10mb.html*(p) | 측정값 |
| 큰 파일 열기 중 개별 지연(ms, 키 순서) | (기록) | 18.4, 2797.7, 2663.1, 2535.5, 2135.1, 1997.2, 1860.4, 1731, 1605.3, 1211, 1076.8, 949.8, 825.7, 694.9 | 측정값 |
| 재귀 복사(2,000개 × 100KB = 200MB) 진행 중 트리 키 이동·메뉴 열기에 응답 | (기록, 기준 없음) | 복사 완료까지 11609 ms; Up/Down 60회 중 60회 응답, 키→선택 변화 0.5~1.1 ms(중앙 0.7); Shift+F10 메뉴 열림 지연 3.5, 2.4, 2.3 ms; 하트비트 최대 간격 13 ms (50 ms 초과 0번, 100 ms 초과 0번) | 측정값 |
| 복사 결과 완전성 | 'bigdir copy'에 파일 2,000개, 크기 같음 | 항목 2000개, 크기 일치 true | 통과 |
| 재귀 복사 중 개별 지연(ms, 키 순서) | (기록) | 0.5, 0.7, 0.8, 0.7, 1, 0.7, 0.6, 0.5, 0.7, 0.7, 0.6, 0.6, 0.7, 1, 0.7, 0.6, 0.7, 0.6, 0.6, 0.7, 0.9, 0.7, 0.8, 1.1, 0.7, 0.7, 0.9, 0.6, 0.7, 0.8, 0.7, 0.7, 0.5, 0.7, 0.6, 0.6, 0.5, 0.5, 0.6, 0.7, 0.7, 0.6, 0.7, 0.8, 0.6, 0.7, 0.7, 0.5, 0.6, 0.6, 0.7, 0.7, 0.7, 0.8, 0.6, 0.8, 0.6, 0.5, 0.6, 0.6 | 측정값 |
| 다른 볼륨 복사(C: → D:, 200MB; 이동은 아래 O4처럼 시작 즉시 실패해 복사로 대신 잼) 진행 중 트리 키 이동·메뉴 열기에 응답 | (기록, 기준 없음) 선택한 행 bigdir copy | 복사 완료(트리에 나타남)까지 1873 ms; Up/Down 60회 중 60회 응답, 키→선택 변화 0.5~1.4 ms(중앙 0.7); Shift+F10 메뉴 열림 지연 2.9, 2.2, 2.2 ms; 하트비트 최대 간격 13 ms (50 ms 초과 0번, 100 ms 초과 0번) | 측정값 |
| 다른 볼륨 복사 결과: 원본 그대로, 대상에 전부(내용 해시 같음) | C: 원본 있음, D:에 2,000개 + 해시 전부 같음 | C: true; D: 2000개, 해시 일치 true; 알림 없음 | 통과 |
| 다른 볼륨 복사 중 개별 지연(ms, 키 순서) | (기록) | 0.5, 0.5, 0.7, 0.6, 0.8, 0.6, 0.6, 0.8, 0.6, 0.8, 0.8, 0.5, 0.8, 0.7, 0.6, 0.6, 0.6, 0.6, 0.7, 0.7, 0.9, 0.6, 0.6, 0.7, 0.7, 1.4, 0.6, 0.7, 0.8, 0.7, 0.9, 0.6, 0.6, 1.1, 0.5, 0.7, 0.7, 0.6, 0.7, 0.6, 0.7, 0.6, 0.6, 0.8, 0.5, 0.7, 0.6, 0.7, 0.7, 0.6, 0.6, 0.7, 0.7, 1, 0.6, 0.7, 0.6, 0.6, 0.6, 0.6 | 측정값 |
| R-22 다른 볼륨 이동(C: → D:, 200MB 폴더) 시도 | 이동이 끝나 원본이 사라지고 D:에 전부 생김. 원본이 바뀔 때의 보호(gpui P3-D1)는 이동이 시작되어야 시험할 수 있다 | 원본 true; 대상 false; 알림 Could not paste the item.; 원본 f0000.bin 102423 B(원래 102400) — 원본 변경(f0000.bin에 바이트 추가)은 붙여넣기 2.5초 뒤에 했지만 이동은 시작 즉시 실패해 원본 변경 보호는 판정 불가 | 불일치 |

## 6. R-30 측정값 요약 (S5, 두 번 쟀다)

시험 크기는 leader가 고정한 값이다(큰 파일 = 10MB HTML 1개 = 10,485,817 B, 큰 폴더 = 파일 2,000개 × 100KB = 204,800,000 B). 지연은 페이지 안에서 잰 값이다. 키 입력의 `KeyboardEvent.timeStamp`(OS 입력 시각)부터 트리 `aria-selected`가 바뀌거나 메뉴 DOM이 생길 때까지, 그리고 10 ms 주기 하트비트의 최대 간격(메인 스레드가 얼마나 멈췄는지)이다. 측정 코드는 CDP로 페이지에 꽂았고 앱에는 없다. 원문에 기준이 없어 측정값을 적으면 충족이다(SPEC R-30, Q-J).

| 작업(그동안 실제 입력으로 ↑/↓ 키 14~60번과 Shift+F10 메뉴 열기) | 1회째 | 2회째 |
| --- | --- | --- |
| 기준: 아무 작업 없음 | 키→선택 0.6~2.3 ms, 하트비트 최대 12 ms | 0.7~1 ms, 12 ms |
| **10MB HTML 열기**(Space) | 14/14 응답, 키→선택 **5.2~2,617 ms**(중앙 1,594), 메뉴 열림 **2,238·1,347 ms**, 하트비트 최대 **2,762 ms**(50 ms 초과 2번·100 ms 초과 1번) | 14/14, **18.4~2,798 ms**(중앙 1,731), 메뉴 **2,415·1,483 ms**, 하트비트 최대 **2,945 ms** |
| 재귀 복사 200MB(`bigdir`→`bigdir copy`, 파일 2,000개) | 완료까지 11,912 ms, 60/60 응답, 키→선택 0.5~1.2 ms(중앙 0.7), 메뉴 3.2·2.5·3.2 ms, 하트비트 최대 28 ms(50 ms 초과 0번) | 11,609 ms, 60/60, 0.5~1.1 ms, 메뉴 3.5·2.4·2.3 ms, 최대 13 ms |
| 다른 볼륨 **복사** C:→D: 200MB | 완료 1,849 ms, 메뉴 2.1·2.3·2 ms, 하트비트 최대 23 ms(키→선택은 폴더를 바꾸며 트리 요소가 새로 생겨 관찰이 끊겨 못 쟀음) | 완료 1,873 ms, 60/60, 0.5~1.4 ms, 메뉴 2.9·2.2·2.2 ms, 최대 13 ms |
| 다른 볼륨 **이동** C:→D: | 시작 즉시 실패(F-4), 원본 그대로 | 같음 |

- 복사 결과 확인: `bigdir copy`는 항목 2,000개·크기 전부 일치(C:), D:의 복사본은 항목 2,000개·내용 해시 전부 일치, 알림 없음.
- 읽기·복사·이동의 코어 명령이 비동기라 재귀 복사·다른 볼륨 복사 중에는 입력이 거의 지연되지 않았다(0.5~1.4 ms). 반면 **큰 파일을 열 때는 파일을 읽은 뒤 약 2.8~2.9 s 동안 메인 스레드가 멈춘다**(원인은 가르지 않았다: 디코딩·CM6 문서 만들기·구문 강조 가운데 어느 것인지 이 측정으로는 모른다).

## 7. R-21 확인창 UI Automation 덤프 (03-tauri R-15)

- Trash 확인창(한 항목): `Window:workbench-tauri | Pane:workbench-tauri | Pane: | Pane: | Image:MainInstructionIcon | Text:Do you want to trash \`wb-v02-m5-trash-1.txt\`? | Text: | Pane:Trash | Pane:취소`. 창 제목 `workbench-tauri`, 포커스는 `취소`(`Pane:취소` `HasKeyboardFocus`), `Esc`와 `Enter`(기본 버튼) 모두 취소, `Trash` 버튼을 눌러야 지움. 스크린샷 `phase5/r21-trash-dialog.png`.
- 영구 삭제: 본문 ``Are you sure you want to permanently delete `…`?`` + 보조 `This cannot be undone.`, 버튼 `Delete`·`취소`, 기본 포커스 `취소`. `Shift+Delete`·`Ctrl+Delete`·`Ctrl+Backspace` 세 키 모두 같은 확인창(키를 바꿔도 건너뛰지 않음). `phase5/r21-delete-dialog.png`.
- 여러 항목: 본문 `… the following 3 files?` + 이름 목록, 12개는 이름 10개 + `.. 2 files not shown`. `phase5/r21-multi-dialog.png`, `r21-overflow-dialog.png`.
- 실패 알림: 잠긴 파일 `Failed to trash 1 of 1 file(s).`·`Failed to delete 1 of 1 file(s).`, 일부 실패 `Failed to trash 1 of 2 file(s).`(성공한 것은 처리됨, 알림은 하나). `phase5/r21-failure-toast.png`.

## 8. 관찰 (판정 아님)

1. 프로젝트 패널 **루트 행을 누르면 루트가 접힌다**(`aria-expanded` false, 행 1개). P5-1 보고의 "루트(접지 않음)"는 `Ctrl+Left`(루트만 남기고 접기)에만 맞다. Zed도 루트를 접을 수 있어 판정하지 않았다.
2. **같은 이름이 있는 폴더로 잘라 붙이기**: 이동도 ' copy' 이름도 없이 `Could not paste the item.` 알림만 낸다. 코드의 의도(다음 이름 고르기)는 F-4와 같은 오류 변환 때문에 동작하지 않는 것으로 보인다. SPEC에 이 경우의 결과가 정해져 있지 않다.
3. **복사가 원본 잠김으로 실패하면 대상에 0 B 예약 파일이 남는다**(`other-folder\locked-src.txt` 0 B). `files.rs` `reserve`의 `shortcut:` 주석이 말한 한계 그대로다.
4. 임시 탭이 열려 있을 때 **다른 파일을 더블클릭**하면 첫 클릭이 임시 탭 자리를 재사용하고(I-062) 둘째 클릭이 승격하므로 기존 임시 탭은 사라진다. 가운데 클릭은 임시 탭을 건드리지 않는다.
5. CM6 `readOnly`는 `contenteditable`을 끄지 않아 속성은 `true`이고(입력만 막힘) 읽지 못한 파일의 탭도 같다.
6. 한글 입력기에서 **Enter 한 번이 조합 확정과 이름 확정을 함께** 한다(두 번째 `Enter` keydown이 `isComposing=false`로 온다). 마지막 글자가 잘리거나 겹치지는 않았다(`한글.txt`).
7. **Trash가 휴지통을 거치지 않았다**: 이 PC는 C:·D:·E:·I: 전부 휴지통이 "삭제 즉시 파일 제거"로 설정되어 있다. 앱은 `trash` 호출 뒤 성공으로 보고한다.
8. OS 폴더 선택 창의 입력칸·버튼은 UI Automation 패턴이 없다(`Pane`): 이 PC에서 자동 조작은 실제 키 입력으로만 됐다.
9. 측정 PC에서 **Ctrl+Alt+R의 R 키만 WebView에 도달하지 않는다**(`Ctrl+Alt+J`는 도달). 앱 밖 전역 단축키가 먹는 것으로 보이나 원인은 확인하지 못했다.

## 9. 사용자 확인 필요 (V4)

측정으로 판단할 수 없는 시각 품질이다.
1. 트리 이름·입력칸·배너·탭 제목의 글자 크기·색, 활성 조각 밑줄, 빈 탭 목록 자리 모양(ID 없는 값, P5-1·P5-2 보고).
2. 입력 배너가 목록 마지막 보이는 행에서 잘리는지(`shortcut:` 주석에 적힌 한계): 이번에 시험하지 않았다.
3. 확인창은 OS 기본 TaskDialog(제목·경고 아이콘·버튼 모양)이고 버튼 글자는 OS 언어(`취소`)다.
4. 사이드바 폴더 아이콘-이름 간격 0(Phase 4에서 넘어온 항목)이 `phase5/r21-trash-dialog.png`에서도 붙어 보인다.

## 10. 정직하게 남길 것과 복구

- **앱 실행 약 45회**(정확히 세지 않음). 유효한 세션은 약 22회이고 나머지는 빈 창 진단(0장), 스크립트 오류 재실행, 진단용 짧은 실행이다. "필요 최소"를 넘었다.
- **OS 폴더 선택 창이 7번 열렸다**(전부 S3의 A-33.4 한 번의 등록을 위해). UI Automation 도우미가 창 안 요소를 못 찾아 1·2번째는 스크립트가 멈추며 앱을 끝내 닫혔고, 3~6번째는 스크립트가 `Esc`로 취소했으며, 7번째에서 실제 키 입력으로 등록에 성공했다. 앞의 6번은 등록·`state.json`·목록 변화가 없었다.
- 측정 중 **내 스크립트의 기대값 오기**로 불일치처럼 보인 행이 여러 번 있었고(루트 행이 접힌 채로 시작, 같은 이름 행 둘 중 앞의 것을 눌러 엉뚱한 파일을 잘라냄, 열린 탭 목록 기대 개수, 한글 이름에 Ctrl+A 사용 등) 스크립트를 고쳐 다시 돌렸다. 표에는 마지막 실행만 있다. 두 군데(S2 "I-063 …승격", S4c "잘라내기 같은 이름")는 기대값·판정을 위 표에서 보정했고 그 사실을 행에 적었다. 측정값 자체는 바꾸지 않았다.
- **실제 입력이 아닌 대체**: ① 해제한 폴더 재등록의 선택 창 응답(페이지 `fetch` 덮어쓰기, 창 열리지 않음: S3 R-14, S4d "Add Folders to Project…"), ② Ctrl+Alt+R의 앱 배선 확인(CDP 합성 키, 0장·S4d), ③ 큰 파일·복사 중 지연의 시각 측정(페이지에 꽂은 관찰자, 입력 자체는 실제). 한글 조합은 대체 없이 실제 입력기로 했다.
- **복구**: 시험 폴더(`%TEMP%\wb-v02-m5`, `src-tauri\target\wb-m5`)와 `%APPDATA%\workbench-tauri`를 지웠고 사본 exe(`%TEMP%\wb-v02-m5\app`)와 임시 빌드 로그·원본 exe 백업도 지웠다. **`target/debug/workbench-tauri.exe`는 0장 우회 빌드(03:2x)로 덮어쓰여 있었으므로 repo 소스 그대로 `tauri build --debug --no-bundle`를 다시 돌려 되돌렸다**(빈 창 그대로). repo `dist/`는 `tauri build`의 `beforeBuildCommand`가 두 번 다시 만들었다(gitignore).
- `specs/v0.2/verify/phase5.md`와 `specs/v0.2/verify/phase5/`(스크린샷 39장, 창 크기로 잘라 저장)를 새로 썼고 `tools/win-input.ps1`만 고쳤다. 그 밖의 추적 파일은 바꾸지 않았다(`git status`로 확인).
- 하지 못한 것: R-20 입력 배너가 마지막 보이는 행에서 잘리는지(위 V4 2번), 이 카드 밖인 R-25(바깥 변경 감시, Phase 6).


---

# 11. 재측정 R1 (카드 v02-M5-R1): 불일치·막혔던 항목만

## 11.1 조건과 결과 요약

- 빌드: 레포 소스 그대로 `npm run tauri build -- --debug --no-bundle`(2026-11-06 05:07:31, 우회 빌드 없음). 실행에 쓴 exe는 그 파일의 복사본이다. 조건·도구·입력 방식은 1~2장과 같다(창 논리 1440×852, 100%, Catppuccin Mocha, `win-input.ps1` SendInput, 값은 CDP·UI Automation, 한글은 Microsoft 한글 입력기 실제 입력). 이번에는 `tools/`를 바꾸지 않았다. 시험 폴더는 `%TEMP%\wb-v02-m5\r1\`, 다른 볼륨 대상은 `D:\projects\workbench-tauri\src-tauri\target\wb-m5\vol-d`이고 끝나고 지웠다. OS 폴더 선택 창은 열지 않았다.
- 판정 행 48개: **통과 39, 불일치 4, 측정값 5**. 불일치 4행은 결함 **F-4의 남은 부분 하나**(단일 파일의 다른 볼륨 이동)다.

| 대상 | 결과 | 근거 |
| --- | --- | --- |
| B-0 시작 화면 | **해결**: 시작 화면이 채워지고(`#root` 채워짐, 사이드바 2·트리 행·탭 바·상태 표시줄·`pane-body`), 시작 코드를 다시 돌려도(페이지 reload) 콘솔 오류·미처리 예외·경고 0건 | 11.2 |
| R-27·R-26·R-28 (레포 빌드) | **같음**: 임시 탭 교체·승격·L-63 테두리 표(첫·마지막 행)·폴더별 탭·해제 후 디스크 그대로 | 11.2 |
| F-1 이름 변경 뒤 탭 제목 | **해결**: 제목이 `renamed-ok.txt`로 바뀌고 옛 제목 탭 없음, 탭을 누르면 트리가 새 이름 선택. 폴더 이름 변경 뒤 그 안 파일의 탭도 새 경로를 따라감 | 11.3 |
| F-2 메뉴 단축키 | **해결**: 파일·md·폴더·접힌 경로·루트·빈 공간 6종 전부 항목·순서·구분선·비활성·단축키가 02 11.2와 정확히 같음(Copy Ctrl-C, Paste Ctrl-V, Trash Delete, Delete Ctrl-Delete) | 11.4 |
| F-3 붙여넣기·복제·이동 따라가기 | **해결**: 만든 파일이 일반 탭·선택·패널 포커스, `duplicate_path`가 `\\?\` 없는 경로를 돌려줌, 잘라내 옮긴 열린 탭을 누르면 트리가 새 위치를 펼쳐 선택 | 11.5 |
| F-4 다른 볼륨 이동 | **일부만 해결**: 폴더 이동(작은 폴더·200MB 2,000개)은 성공(원본 삭제·해시 전부 일치·수정 시각 보존), 이동 중 원본이 바뀌면 원본·복사본을 남기고 오류. **단일 파일 이동은 여전히 실패**(ADS 있음·없음 모두, 알림 `Could not paste the item.`, 원본 그대로, D:에 아무것도 안 생김) | 11.6 |
| 실패한 복사의 0 B 예약 파일 | **해결**: 잠긴 원본 복사가 실패하면 알림 하나, 대상에 `locked-src*` 없음 | 11.6 |
| F-5 한글 조합 중 Esc | **해결**: 조합 중 Esc 한 번은 입력 행을 유지, 조합이 없을 때 Esc는 취소, Enter는 확정 | 11.7 |
| R-30 10MB HTML 열기 | **정지가 사라짐**: 하트비트 최대 간격 50·53 ms(이전 2,762·2,945 ms), 키→선택 변화 최대 8 ms(이전 2.6~2.8 s), 메뉴 열림 8.9 ms 이하(이전 2.2~2.4 s) | 11.8 |

## 11.2 B-0 · 탭 표시(R-27·R-26·R-28)

스크린샷: `phase5/r1-b0-startup.png`, `r1-r27-step3.png`, `r1-r28-switch.png`.

**B-0 시작 화면**

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 레포 소스 그대로 새로 만든 exe(2026-11-06 05:07:31)의 시작 화면(첫 로드, 조작 없음) | #root 채워짐, 사이드바 항목 2, 트리 행 > 0, 탭 바·상태 표시줄·pane-body 있음 | {"root":16347,"sidebar":2,"rows":13,"tabbar":true,"status":true,"paneBody":true,"title":"ops-a"} | 통과 |
| 시작 코드 다시 실행(페이지 reload)의 콘솔 오류·미처리 예외·경고 | 0건, 화면이 다시 채워짐 | 오류·경고 []; {"root":16347,"sidebar":2,"rows":13} | 통과 |

**R-27·R-26 레포 빌드의 탭 표시(핵심 단계)**

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| A-33.2 1. README.md 한 번 클릭 | 임시 탭 1개, README.md, font-style italic | [{"title":"README.md","active":true,"preview":true,"italic":"italic"}] | 통과 |
| A-33.2 2. notes.txt 한 번 클릭 = 같은 자리 교체 | 탭 1개, notes.txt, 임시 | [{"title":"notes.txt","active":true,"preview":true,"italic":"italic"}] | 통과 |
| A-33.2 3. 더블클릭 = 일반 탭 + 편집기 포커스 | 탭 1개, notes.txt, 임시 아님(normal), 포커스 editor | [{"title":"notes.txt","active":true,"preview":false,"italic":"normal"}] 포커스 editor | 통과 |
| R-26 L-63 탭 테두리(탭 2개 = 첫·마지막 행, 활성을 바꿔 가며. 가운데 탭 행은 M5 본 측정에서 통과) | 표대로 | 1:010 011 \| 2:001 110 | 통과 |
| R-26 탭 내용(CM6) 표시 | 활성 탭의 파일 내용이 보임 | 텍스트 5자 | 통과 |

**R-28 레포 빌드의 폴더별 탭(핵심 단계)**

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| A-33.4 전환: proj-b에는 proj-a의 탭이 없음 | 탭 없음 | [] | 통과 |
| A-33.4 전환해도 폴더별 탭이 그대로 | proj-a notes.txt,plain.txt,src-b.txt*,src-a copy.txt,src-a copy 1.txt,dup-me copy.txt,renamed-ok.txt,top.txt / proj-b b1.txt,b3.txt* | a notes.txt,plain.txt,src-b.txt*,src-a copy.txt,src-a copy 1.txt,dup-me copy.txt,renamed-ok.txt,top.txt / b b1.txt,b3.txt* | 통과 |
| A-33.4 하나 해제 → 디스크 그대로 | 사이드바 ops-a만, proj-b 디스크 전후 동일 | 사이드바 ops-a; 차이 0건 | 통과 |

## 11.3 F-1 이름 변경 뒤 탭 제목

스크린샷 `phase5/r1-f1-rename.png`.



| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| R-26 이름 변경 때 열린 탭의 제목이 새 이름으로 | 탭 제목에 renamed-ok.txt, rename-me.txt 없음 | 탭 [notes.txt, plain.txt, renamed-ok.txt]; 디스크 true/false | 통과 |
| 이름 바꾼 탭을 누르면 트리가 새 이름을 선택 | 선택 renamed-ok.txt | 선택 [renamed-ok.txt] | 통과 |
| 폴더 이름 변경 뒤 그 안 파일의 탭을 누르면 트리가 새 경로를 선택 | 선택 top.txt(fold2 안) | 선택 [top.txt]; fold2 true | 통과 |

## 11.4 F-2 우클릭 메뉴 단축키(02 11.2)

스크린샷 `phase5/r1-f2-menu-file.png`. 기대값은 02 11.2 표(I-660~I-662)의 키까지 넣은 전체 목록이고 DOM 덤프와 한 줄씩 정확히 비교했다.



| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| file 메뉴 항목·순서·구분선·비활성·단축키 전부 | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Rename F2 / Trash Delete / Delete Ctrl-Delete | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Rename F2 / Trash Delete / Delete Ctrl-Delete | 통과 |
| md 메뉴 항목·순서·구분선·비활성·단축키 전부 | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Open Markdown Preview [disabled] / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Rename F2 / Trash Delete / Delete Ctrl-Delete | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / Open Markdown Preview [disabled] / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Rename F2 / Trash Delete / Delete Ctrl-Delete | 통과 |
| folder 메뉴 항목·순서·구분선·비활성·단축키 전부 | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Rename F2 / Trash Delete / Delete Ctrl-Delete / --- / Expand All / Collapse All | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Rename F2 / Trash Delete / Delete Ctrl-Delete / --- / Expand All / Collapse All | 통과 |
| folded 메뉴 항목·순서·구분선·비활성·단축키 전부 | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Unfold Directory / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Rename F2 / Trash Delete / Delete Ctrl-Delete / --- / Expand All / Collapse All | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Unfold Directory / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Rename F2 / Trash Delete / Delete Ctrl-Delete / --- / Expand All / Collapse All | 통과 |
| root 메뉴 항목·순서·구분선·비활성·단축키 전부 | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Add Folders to Project… / Remove from Project / --- / Expand All Ctrl-Right / Collapse All Ctrl-Left | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Add Folders to Project… / Remove from Project / --- / Expand All Ctrl-Right / Collapse All Ctrl-Left | 통과 |
| 빈 공간 메뉴(루트 메뉴) 전부 | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Add Folders to Project… / Remove from Project / --- / Expand All Ctrl-Right / Collapse All Ctrl-Left | New File Ctrl-N / New Folder Alt-N / --- / Reveal in File Explorer Ctrl-Alt-R / Open in Default App Ctrl-Shift-Enter / --- / Cut Ctrl-X / Copy Ctrl-C / Duplicate / Paste Ctrl-V [disabled] / --- / Copy Path Alt-Shift-C / Copy Relative Path Ctrl-K Ctrl-Shift-C / --- / Add Folders to Project… / Remove from Project / --- / Expand All Ctrl-Right / Collapse All Ctrl-Left | 통과 |
| 복사한 뒤 Paste는 활성, 키 Ctrl-V | Paste	Ctrl-V (비활성 아님) | Paste	Ctrl-V | 통과 |

## 11.5 F-3 붙여넣기·복제·잘라내 옮기기(I-097)

스크린샷 `phase5/r1-f3-paste.png`.



| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| I-097 붙여넣기: 생긴 파일(src-a copy.txt)이 일반 탭, 포커스 패널, 그 파일 선택 | 탭 src-a copy.txt 일반(*), 포커스 panel, 선택 src-a copy.txt | 파일 true; 탭 notes.txt,plain.txt,src-a.txt(p),src-a copy.txt*,renamed-ok.txt,top.txt; 포커스 panel; 선택 [src-a copy.txt] | 통과 |
| 붙여넣기 두 번째: ' copy 1'도 탭·선택 | src-a copy 1.txt가 일반 탭, 선택 | 탭 notes.txt,plain.txt,src-a.txt(p),src-a copy.txt,src-a copy 1.txt*,renamed-ok.txt,top.txt; 선택 [src-a copy 1.txt] | 통과 |
| I-543·I-097 Duplicate: dup-me copy.txt가 일반 탭, 선택, 포커스 패널 | 탭 dup-me copy.txt*, 선택 dup-me copy.txt, 포커스 panel | 파일 true; 탭 notes.txt,plain.txt,src-a.txt(p),src-a copy.txt,src-a copy 1.txt,dup-me copy.txt*,renamed-ok.txt,top.txt; 선택 [dup-me copy.txt]; 포커스 panel | 통과 |
| 코어 duplicate_path가 돌려주는 경로 형식 | C:\… (\\?\ 없음) | C:\Users\nampl\AppData\Local\Temp\wb-v02-m5\r1\ops-a\diag copy.txt | 통과 |
| 잘라내기 이동: 파일이 target-dir로, 열린 탭은 그대로 | 원본 없음, 대상 있음, 탭 src-b.txt 남음 | 원본 false; 대상 true; 탭 notes.txt,plain.txt,src-b.txt*,src-a copy.txt,src-a copy 1.txt,dup-me copy.txt,renamed-ok.txt,top.txt | 통과 |
| 옮긴 파일의 탭을 누르면 트리가 새 위치를 펼쳐 그 파일을 선택(R-24) | target-dir 펼침, 선택 src-b.txt | 선택 [src-b.txt]; target-dir true | 통과 |

## 11.6 F-4 다른 볼륨 이동(C:→D:)과 실패한 복사의 0 B 파일

스크린샷 `phase5/r1-f4-small-move.png`, `r1-f4-changed.png`. 처음 돌린 한 번은 앞 단계의 알림이 화면에 남아 있어 뒤 단계의 알림 판정이 오염되었다(스크립트가 알림을 지우지 않았음). 알림을 단계마다 지우고 다시 돌린 결과만 적었다.

**F-4 다른 볼륨 이동(C:→D:)**

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 작은 파일 이동 C:→D:(NTFS 스트림·수정 시각 있음) | 원본 없음, D:에 있음, 해시 같음, 알림 없음 | C: true; D: false 해시 - (원래 d35f9ef84cd82317); 알림 Could not paste the item. | 불일치 |
| 이동 결과의 NTFS 추가 스트림·수정 시각 보존 | 2021-03-04T05:06:07.0000000Z stream-data-cross | 없음 | 불일치 |
| 이동 뒤 vol-d 트리: 옮긴 파일이 선택됨 | 선택 cross.txt | 선택 [vol-d] | 불일치 |
| 폴더 이동 C:→D:(하위 폴더 포함) | 원본 폴더 없음, D:에 같은 목록·해시, 수정 시각 보존 | C: false; D: true 차이 0건; 수정 시각 2021-03-04T05:06:07.0000000Z,2021-03-04T05:06:07.0000000Z; 알림 없음 | 통과 |
| ADS 없는 작은 파일 이동 C:→D: | 원본 없음, D:에 있음, 알림 없음 | C: true; D: false; 알림 Could not paste the item. | 불일치 |
| 200MB(2,000×100KB) 폴더 이동 C:→D: | 원본 삭제, D:에 2,000개 + 해시 전부 같음, 알림 없음 | 선택 bigdir; 원본 false; D: 2000개 해시 일치 true; 알림 없음; 약 16352 ms | 통과 |
| 이동 중 원본이 바뀌면 원본·복사본을 남기고 오류(gpui P3-D1) — 1회 | 알림 하나, 원본 2,000개 그대로(바뀐 파일 포함), D:에 복사본 남음 | 선택 bigdir2; 알림 Could not paste the item.; 원본 true 2000개 f0100.bin 102423 B(원래 102400); D:복사본 true 2000개 | 통과 |

**실패한 복사의 0 B 예약 파일**

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 잠긴 원본 복사 실패: 알림 하나 + 대상에 0 B 예약 파일이 남지 않음 | 알림 Could not paste the item., other-folder에 locked-src* 없음 | 알림 Could not paste the item.; other-folder: o.txt; 남은 locked-src 없음 | 통과 |
| 원본 잠긴 파일은 그대로 | locked-src.txt 있음(14 B) | 14 B | 통과 |
| 관찰: 잘라내기 이동 대상에 같은 이름이 있을 때 | (기록) 덮어쓰지 않음 | target-dir: dupname copy.txt, dupname.txt; 원본 false; 알림 없음; 기존 내용 "target dupname\n" | 측정값 |

- F-4 남은 부분의 원인(추정): `files.rs`의 `snapshot(&source)`가 `visit(root, Path::new(""), …)`로 `root.join("")`를 열기 때문에 **파일**이면 경로 끝에 `\`가 붙어 `symlink_metadata`가 실패한다(폴더는 문제없음). 그 호출이 `reserve`보다 앞이라 D:에는 아무것도 만들어지지 않는다. 이동 중 원본이 바뀐 시험(1회): 붙여넣기 약 0.35 s 뒤 원본 `f0100.bin`에 23 B를 덧붙였고, 알림 하나·원본 2,000개 그대로(바뀐 파일 102,423 B)·D:에 복사본 2,000개가 남았다.

## 11.7 F-5 한글 조합 중 Esc·Enter (Microsoft 한글 입력기 실제 입력)

스크린샷 `phase5/r1-f5-esc-composing.png`. 이벤트: 조합 중 Esc → `keydown Process 229 isComposing` · `compositionend` · `keydown Escape isComposing=false`가 오지만 입력 행은 유지된다(앱이 `compositionend` 직후의 같은 키 입력을 취소로 쓰지 않음). 조합이 끝난 다음 Esc는 취소다.

**F-5 한글 조합 중 Esc·Enter (Microsoft 한글 입력기 실제 입력)**

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 사전: 실제 한글 조합 | r 키 → ㄱ(조합 중) | value "ㄱ.txt" | 통과 |
| 조합 중 Esc 한 번 = 조합만 끝나고 입력 행은 유지 | 입력 행 그대로(행 유지), 디스크 불변 | 조합 중 값 "한.txt"; Esc 뒤 입력 행 있음 value "한.txt"; 디스크 불변; 이벤트 keydown\|Process\|229\|true\|\|한.txt ; compositionend\|\|\|\|한\|한.txt ; keydown\|Escape\|27\|false\|\|한.txt | 통과 |
| 조합이 없을 때 Esc = 취소(입력 행 사라짐, 디스크 불변, 패널 포커스) | 입력 행 없음, 디스크 불변 | 입력 행 없음; 디스크 불변; 포커스 panel; 이벤트 keydown\|Escape\|27\|false\|\|한.txt | 통과 |
| 조합 중 Enter 한 번 = 이름 확정(마지막 글자 안 잘림) | 한글.txt로 이름 변경, 입력 행 없음 | 조합 중 값 "한글.txt"; 입력 행 없음; 디스크 a1.txt,a3.txt,a4.txt,a5.txt,zz.txt,한글.txt; 이벤트 keydown\|Process\|229\|true\|\|한글.txt ; compositionend\|\|\|\|글\|한글.txt ; keydown\|Enter\|13\|false\|\|한글.txt | 통과 |
| 한글 모드에서 조합 없이(숫자 7) Esc = 취소 | 입력 행 없음, a3.txt 그대로 | 입력 행 없음; 디스크 a1.txt,a3.txt,a4.txt,a5.txt,zz.txt,한글.txt; 이벤트 keydown\|Escape\|27\|false\|\|7.txt | 통과 |
| 한글 모드에서 조합 없이(숫자 7) Enter = 확정 | 7.txt로 이름 변경 | 디스크 7.txt,a1.txt,a3.txt,a5.txt,zz.txt,한글.txt; 이벤트 keydown\|Enter\|13\|false\|\|7.txt | 통과 |
| 조합 중 방향키는 트리 선택을 바꾸지 않음 | 선택 그대로(<input>) | 선택 <input> → <input> | 통과 |
| 마지막: 입력 행 정리, 디스크 | a5.txt 그대로 | 입력 행 없음; 첫 Esc 뒤 행 취소됨; 디스크 7.txt,a1.txt,a3.txt,a5.txt,zz.txt,한글.txt | 통과 |

## 11.8 R-30 10MB HTML 열기 중 입력 응답

스크린샷 `phase5/r1-r30-big-file.png`. 방법은 6장과 같다(키 입력 시각부터 트리 `aria-selected`·메뉴 DOM까지, 10 ms 하트비트). 기준 없음, 측정값 기록. 처음 돌린 한 번은 방향키 두 번이 한 칸 더 내려 큰 파일이 아닌 `n01.txt`를 열어 버려(폴더가 없어서 행 위치가 달랐음) 무효이고, 선택 행을 `big10mb.html`로 확인하게 고쳐 다시 돌린 두 번만 적었다.

**R-30 10MB HTML 열기 중 입력 응답(레포 빌드)**

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 1회째: 키 응답·메뉴·하트비트(기준 없음, 이전 M5: 최대 정지 2,762·2,945 ms) | (기록) | 선택 big10mb.html; 기준(작업 없음): 키→선택 0.8/0.7/0.6/0.9/0.8 ms, 하트비트 최대 12 ms. 열기 중: Up/Down 14회 중 14회 응답 0.5~8 ms(중앙 0.9); Shift+F10 메뉴 열림 4.5, 4.1 ms; 하트비트 최대 간격 50 ms(50 ms 초과 1번, 100 ms 초과 0번); 파일 표시 true | 측정값 |
| 1회째: 개별 키 지연(ms, 순서) | (기록) | 1, 0.8, 0.6, 0.9, 0.8, 4.1, 8, 0.8, 7.4, 0.7, 0.5, 2.9, 0.8, 1.4 | 측정값 |
| 2회째: 키 응답·메뉴·하트비트(기준 없음, 이전 M5: 최대 정지 2,762·2,945 ms) | (기록) | 선택 big10mb.html; 기준(작업 없음): 키→선택 0.7/0.8/0.7/0.7/0.6 ms, 하트비트 최대 12 ms. 열기 중: Up/Down 14회 중 14회 응답 0.6~7.5 ms(중앙 0.8); Shift+F10 메뉴 열림 8.9, 2.5 ms; 하트비트 최대 간격 53 ms(50 ms 초과 1번, 100 ms 초과 0번); 파일 표시 true | 측정값 |
| 2회째: 개별 키 지연(ms, 순서) | (기록) | 0.9, 7.5, 0.6, 0.8, 3, 0.8, 0.7, 0.8, 1.6, 7.3, 2.6, 0.8, 0.6, 0.7 | 측정값 |

## 11.9 이번 재측정의 관찰과 남긴 것

- 이전에 본 **잠긴 원본 복사 뒤 0 B 파일**과 **같은 이름이 있는 폴더로 잘라 붙이기의 실패**는 이번 빌드에서 모두 사라졌다(앞의 것은 위 표, 뒤의 것은 `dupname copy.txt`로 이동·알림 없음·기존 파일 그대로, 11.6 관찰 행).
- 큰 파일 열기 정지가 없어진 것은 이번 빌드의 코드 변경(`src/syntax/*`가 `M` 상태)과 맞물린 결과로 보이나 원인은 가르지 않았다.
- 정직하게 남길 것: 앱 실행 8회(A 1회, B 2회, C 1회, D 4회 = 무효 3회분 포함: B 첫 실행, D 첫 실행의 2회). 내 스크립트 오류로 무효가 된 두 번(B의 알림 오염, D의 잘못 고른 파일)은 위에 적었고 표에는 유효한 실행만 있다. `Reveal`·`Open` 창은 이번에 열지 않았다. 복구: `%TEMP%\wb-v02-m5`·`src-tauri\target\wb-m5`·`%APPDATA%\workbench-tauri`를 지웠다(없음 확인). `target/debug/workbench-tauri.exe`는 레포 빌드 그대로다.


---

# 12. 재측정 R2 (카드 v02-M5-R2): F-4 남은 항목(C:→D: 단일 파일 이동)

- 빌드: 레포 소스 그대로 `npm run tauri build -- --debug --no-bundle`(2026-11-06 05:27:30, 우회 없음), 앱 1회 실행. 조건·입력 방식은 1·11장과 같다. 코드 확인: `files.rs` `snapshot`이 빈 상대 경로일 때 `root.join(rel)` 대신 `root.to_path_buf()`를 연다(R1에서 추정한 원인 자리).
- 시험: 시험 폴더 `%TEMP%\wb-v02-m5\r2\`의 파일 둘을 각각 ctrl+x → vol-d(`D:\projects\workbench-tauri\src-tauri\target\wb-m5\vol-d`) → ctrl+v. 하나는 NTFS 추가 스트림 `meta`와 수정 시각 2021-03-04 05:06:07Z, 하나는 수정 시각만 같은 일반 파일. 스크린샷 `phase5/r2-f4-file-move.png`.
- 결과: **판정 행 7개 모두 통과, 불일치 0**. 이 절로 F-4(다른 볼륨 이동)는 파일·폴더 모두 해결로 닫힌다. R1의 파생 4행(단일 파일 이동 2행, ADS·수정 시각 보존, 이동 뒤 트리 선택)이 모두 풀렸다.

### F-4 단일 파일 이동 C:→D:

| 스펙 ID·항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| cross.txt(ADS meta + 수정 시각 2021-03-04) cut 붙여넣기 C:→D: | 성공: 알림 없음, C: 원본 삭제, D:에 생김, 본문 해시 같음 | C: false; D: true 해시 fb7290022f315201 (원래 fb7290022f315201); 크기 30/30 B; 알림 없음 | 통과 |
| cross.txt 수정 시각·NTFS 추가 스트림 보존 | 2021-03-04T05:06:07.0000000Z / meta=stream-data-cross | 2021-03-04T05:06:07.0000000Z / meta=stream-data-cross | 통과 |
| cross.txt 이동 뒤 vol-d 트리 선택 | 선택 cross.txt(새 위치) | 선택 [cross.txt]; 포커스 panel | 통과 |
| plain-file.txt(수정 시각 2021-03-04) cut 붙여넣기 C:→D: | 성공: 알림 없음, C: 원본 삭제, D:에 생김, 본문 해시 같음 | C: false; D: true 해시 0e31b4805c16422e (원래 0e31b4805c16422e); 크기 11/11 B; 알림 없음 | 통과 |
| plain-file.txt 수정 시각 보존 | 2021-03-04T05:06:07.0000000Z | 2021-03-04T05:06:07.0000000Z | 통과 |
| plain-file.txt 이동 뒤 vol-d 트리 선택 | 선택 plain-file.txt(새 위치) | 선택 [plain-file.txt]; 포커스 panel | 통과 |
| 이동하지 않은 파일은 그대로 | keep.txt 있음 | true | 통과 |
