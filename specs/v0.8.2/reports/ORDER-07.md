[DONE] ORDER-07 tauri

> 카드: core `D:\projects\workbench-core\specs\v0.8.2\orders\ORDER-07.md`(8·9절 더함) · 보낸 이: tauri-leader · 2026-11-14
> 코드 커밋 `1f9bd3a`(K-08), 빌드 문서 커밋 `782a003`(K-09). 측정: release exe 사본 `%TEMP%\v082-exe082\workbench-tauri.exe`, 격리 APPDATA·WebView2, 창 1440×852(클라이언트), 1920×1080 100%. 테마는 줄마다 `specs/v0.8.2/verify/ORDER-07/out/result.json`의 `theme`(기본 One Light, O5-1-dark만 One Dark).

## 완료 기준

| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 I-6 HTML | HTML 미리보기 탭 Outline 제목 트리, 항목 클릭 → 프레임 스크롤 앞뒤, 어긋남 동작 보고 | 충족 | V1 `src/syntax/outline.test.ts:190`. V3 O7-6.1: Outline 7줄(Pair Document·Section 1~6), Section 5 클릭 scrollY 0 → 1245(최대 스크롤), 선택 줄 Section 5. 어긋남은 "tauri가 고른 것" |
| 2 I-7 HTML | 프레임 클릭 → 그 곳이 든 제목 줄 표시, Outline 이동 뒤에도 | 충족 | V1 같은 테스트. V3 O7-6.2: 문단 클릭 → 선택 "Section 3.1"; O7-6.1 이동 뒤 선택 "Section 5" |
| 3 I-19 | 포커스 프레임 안·밖 `Ctrl`+`+`/`0`, CSS 없는·자체 CSS 페이지, 방식 보고 | 충족 | V3 O7-6.3 네 줄(실제 SendInput `ctrl+=`): 미리보기 14 → 15px, 프레임 root `zoom` 1 → 1.07143, 문단 높이 plain 21 → 22.5, styled(페이지 18px) 25 → 26.78; `ctrl+0` zoom 1. 방식은 "tauri가 고른 것" |
| 4 I-25 | 프레임 안·밖 `Ctrl+F` → 앱 찾기 바, 개수·다음·스크롤, WebView 찾기 창 없음, 범위 보고 | 충족 | V1 `src/editor/preview-find.test.ts:48`. V3 O7-6.4-in·out: 찾기 바 뜸·입력 칸 포커스, 1/2 → 다음 2/2, scrollY 0 → 1290, Esc로 닫힘. O7-6.4-webview-find: 앱 프로세스 트리의 보이는 최상위 창이 앞뒤 같음(찾기 창 없음), 모니터 캡처 `out/O7-6.4-webview-find-monitor.png` |
| 5 꾸며 낸 메시지 | 메시지 종류마다 최악의 일, 틀린 출처·모양·명령 이름 거절 | 충족 | 아래 "프레임 → 앱 메시지" 표. V1 `src/editor/html.test.ts:198`(허용 10줄, 거절 20줄). C-08 [PASS] |
| 6 링크 보장 | 앱 → 프레임 메시지에 링크 확인용 값 없음, v0.8.1 I-24 테스트 그대로 통과 | 충족 | V1 `src/editor/html.test.ts:258`(모든 앱 → 프레임 메시지에 토큰 없음, 보내는 곳 `post` 한 곳). 기존 테스트 무수정(diff는 import 2줄과 새 테스트뿐) |
| 7 격리 | 앱 CSP·capability diff 없음, `sandbox` 그대로, 격리 테스트 통과, 메시지 처리 diff 위치 | 충족 | `git diff --stat -- src-tauri` 변경 없음, `sandbox`·`PREVIEW_CSP` 줄 무변경. 메시지 처리 diff 위치는 아래 표. V3 R-html-scripts: 프레임 target Network에서 prefetch·preload·EventSource 모두 `blockedReason: csp` |
| 8 빌드 | 설치 파일·exe, ProductVersion 0.8.2, README·BUILD | 충족 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.2_x64-setup.exe` 10,589,344 B, `src-tauri\target\release\workbench-tauri.exe` 21,532,160 B, 둘 다 2026-11-14 05:06:58, ProductVersion·FileVersion 0.8.2. `docs/BUILD.md` 4B절, README 실행 절(`782a003`, C-09 [PASS]). 빌드 직전 `workbench-tauri` 프로세스 0개 |
| 9 전체 회귀 | 6절 목록 모든 줄에 결과 | 충족 | 아래 "전체 회귀" 표, 38줄 모두 통과 |
| 10 테스트 | 전체 테스트, typecheck 0, cargo check·clippy | 충족 | `npm.cmd run test` 339/339, typecheck 0, `cargo check` 경고 0, `cargo clippy -- -D warnings` exit 0 |

## 미뤄 둔 화면 측정 (ORDER-02~06 6절, 9.2)

캡처는 모두 `specs/v0.8.2/verify/ORDER-07/out/`. 값의 원본은 `out/result.json`(첫 실행 `out/result-run1.json`).

| 카드·기준 | 기대 | 측정 | 판정 | 캡처 |
|---|---|---|---|---|
| O2 #1·3 | md·ipynb 본문 시작선, 줄 번호 끈 에디터 글자 시작 78px | md 78, ipynb 78, 에디터 78 | 통과 | O2-1-nb-start, O2-3-editor-no-linenumbers |
| O2 #2 / 9.2 | `[n]`·`[ ]` 위치, 64px 여백 안 | `[1]`·`[ ]` 여백 64px 안 | 통과 | O2-2-notebook |
| O2 #4 | 표 너비 = 본문 너비(md·ipynb), CSV는 내용 너비 | md 653=653, ipynb 668=668, CSV 192 < 700 | 통과 | O2-4-csv |
| O2 #5·6 | 코드 블록·결과창·표 글자 12.04px·줄 높이 | 12.04 / 17.46 (md pre·td, nb pre·output) | 통과 | — |
| O2 #8 | 줄 번호 켬: 1부터, 번호 색 = 에디터 줄 번호 색 | md 1~4, nb 1, rgb(180,180,187) 같음 | 통과 | O2-8-md-linenumbers, O2-8-nb-linenumbers |
| O3 #1 | 사용자 노트북 첫 줄 제목, 본문 HTML 든 md | 첫 셀 H1 "LLM LangChain", 본문 `<h2>` 19.6px | 통과 | O3-1-user-notebook, O3-1-bodyhtml |
| O3 8절 | 정화된 `.markdown-body`에 script·style·iframe·form·onclick·onerror·javascript:·외부 img 없음 | 모두 0(`<style>`은 앱이 그린 Mermaid SVG 안 하나뿐, img는 로컬 `http://asset.localhost`) | 통과 | O3-8-sanitize-dump.html |
| O3 #6 | md → `.html`, md → `.ipynb`, HTML → `.ipynb` 미리보기 | 셋 모두 미리보기 탭 | 통과 | O3-6-html-to-ipynb |
| O4 #1 | HTML 편집 탭 Outline 제목 트리 | Pair Document·Section 1~6 | 통과 | O4-1-html-edit-outline |
| O4 #2 | ipynb 문단 클릭 뒤 Outline 선택 | 클릭 "Section B", Outline 이동 "Section C" | 통과 | O4-2-ipynb-click |
| O4 #4 | 우클릭 메뉴(숫자·색 켬) | Show Icons·Show Numbers·Expand All·Collapse All 등 메뉴 뜸(캡처) | 통과 | O4-4-outline-menu-numbers-colors |
| O4 #6 | H1~H3 글자색 Outline·미리보기 | 기대 색과 같음(H1 rgb(211,96,79) 등) | 통과 | O4-6-heading-colors |
| O4 #8 | 미리보기 꺾쇠 접기, Outline 같은 항목 상태 | false→true→false, Outline이 매번 따라감, 숨은 블록 28↔23 | 통과 | O4-8-preview-fold |
| O4 9.2 꺾쇠 | 여백 안, 제목 첫 줄 높이 | 꺾쇠 오른쪽 758 = 글자 시작 758, 가운데 y 180.6(줄 167.4~191.9 안) | 통과 | O4-9.2-chevron |
| O4 9.2 긴 번호 | `2.1.1.1.1` 줄 모양 | 번호 오른쪽 613.1 < 이름 왼쪽 617.1, 넘침 없음 | 통과 | O4-9.2-longnum |
| O4 9.2 빈 셀 | 접힌 ipynb 빈 markdown 셀 틈 | 앞뒤 틈 10.5 / 10.5 | 통과 | O4-9.2-emptycell-folded |
| O4 9.2 mermaid | 접힌 섹션 안 mermaid 숨음 | 접힌 블록 안 SVG 5, 편 뒤 168×152로 보임 | 통과 | O4-9.2-mermaid |
| O4 9.2 첫 열림 | Outline 열린 채 H1 문서 첫 미리보기 접힘 | Outline 레벨 [1,2×6], 미리보기 접힌 블록 28, H3 보임 0 | 통과(모습 보고) | O4-9.2-firstopen |
| O4 9.2 큰 파일 | Outline 여는 시간 | 1836ms(더블클릭 뒤 1.8s 기다림 포함), 앱 응답함. 시험 파일은 생성한 `big.md`(제목 2001개) — v0.8.1 Outline 시험 파일을 찾지 못함 | 통과 | O4-9.2-big |
| O5 #1 | 켜진 칸 계산값 One Light·One Dark | 22×22, 모서리 4px, 배경 rgb(250,250,250)·rgb(40,44,51), 안쪽 그림자 | 통과 | O5-1-light, O5-1-dark |
| O5 #3 | 상태 표시줄(오른쪽 셋·구분선), `Edit` 누르면 에디터만 | 왼쪽 5·오른쪽 UI/Edit/View·구분선 4, 사이드 바 열림 때 토글 두 군데; Edit → 에디터 rgb(250,250,250)→rgb(40,44,51), UI·미리보기 그대로 | 통과 | O5-3-statusbar, O5-3-window-sidebar-open |
| O5 #6 | 설정 없이 첫 화면 One Light | One Light | 통과 | O5-6-first-screen-onelight |
| O5 #7 | Themes… 다크·라이트 나눔 | 21개, 구분선 1 | 통과 | O5-7-themes |
| O5 #8·9 | Welcome 가운데, "No File"·"No outline", 최근 폴더 줄로 열기 | 내용 상자 가운데 차이: `.welcome` 기준 dx 0·dy 0, pane 기준 dx 0·dy 16, 아이콘 256px 원본 45px로 그림, "No File" 14px; 최근 폴더 `ws` 줄 → 트리 뜸·Welcome 사라짐 | 통과 | O5-8-welcome, zed-G1-welcome-zed.png(나란히), O5-9-nofile, O5-8-after-recent |
| O6 #1 | CSS 없는 HTML = md 계산값 | 글꼴·14px·문단 21/14·목록 19.25·하위 28px·본문 700·글자 시작 78·표 700·코드 12.04/17.46·h1~h3 24.5/19.6/16.8 모두 같음 | 통과 | O6-1-md, O6-1-html(같은 pane 너비 두 장) |
| O6 #2 | 자체 CSS 페이지 속성 우선 | 18px, rgb(200,30,30), h1 rgb(0,128,0) | 통과 | O6-2-styled |
| O6 #3 | Settings 글자 크기 → HTML 본문 | 14 → 15px | 통과 | O6-3-after-settings |
| O6 #4 | 코드 블록, 복사 → 클립보드 | python, 강조 10곳, 클립보드 = 보이는 글자 | 통과 | O6-4-html-code-block |
| O6 #5 | 외부 요청 0 | 0 | 통과 | — |
| O6 #7 | v0.8.1 시안 페이지 | 본문 700, viewport 760 — 대조는 leader-core | 통과(캡처) | O6-7-mockup |
| O6 9.2 글꼴 | `data:` 글꼴 로드 | IBM Plex Sans·JetBrains Mono 로드됨 | 통과 | O6-9.2-font |
| O6 9.2 cssRules | release에서 규칙을 모음 | 바탕 스타일 877,087자, `@layer` 규칙 129, `:root`/body 규칙 있음 | 통과 | — |
| 9.2 다시 그리기 | HTML 편집 탭 글자 입력 → 미리보기 다시 그림 | 기본 글꼴(0.88MB): load 301.2ms / previewReady 298.4ms. D2Coding(프레임 스타일 5.95MB): 522.9ms / 503.9ms | 값 보고 | — |

## 전체 회귀 (release exe, 한 줄에 한 번)

| 줄 | 결과 |
|---|---|
| 미리보기 열림: 마크다운·ipynb·HTML·CSV·TSV·SVG·Mermaid | 통과(7) |
| md 편집↔미리보기 위치 연계와 표시 | 통과 |
| `#id` 링크 이동 | 통과(대상이 문서 끝이라 최대 스크롤 1241) |
| 미리보기 찾기 md·ipynb | 통과(1/2, 1/6) |
| 탭 스크롤 위치(9.3, ORDER-02 세 경우 한 번씩) | 통과: md→code 600→600, HTML 미리보기→md 600→600, HTML 미리보기→code 1200→1200 |
| 코드 블록 복사·빈 줄 숨김·줄 번호 켬/끔 | 통과 |
| 본문 HTML 문서·로컬 링크 세 조합 | 통과 |
| Outline 키보드 이동·우클릭 메뉴·숫자·제목 색·섹션 접기 연동 | 통과 |
| 상태 표시줄 다섯·다크/라이트 셋·Themes…·Welcome·"No File" | 통과(Welcome GET STARTED는 Open Settings 줄만 실행 — 아래 "측정 불가") |
| HTML 미리보기 같은 모양·코드 블록 복사·외부 요청 0·스크립트 페이지 | 통과 |
| 트리 선택·이름 바꾸기·끌어 놓기 | 통과 |
| Settings 열기·값 바꾸기·저장 | 통과 |
| Help → About | 통과("Version 0.8.2") |

## 기대와 다른 것

- 없음(앱 쪽). 첫 실행에서 "문제" 17줄·측정 못 함 6줄이 나왔으나 모두 프로브 원인(접힌 섹션 안을 잼, `offsetParent`로 보임 판정, `asset.localhost`를 외부로 셈, 리소스 타이밍을 요청으로 셈 등)이라 프로브를 고쳐 그 줄만 한 번 다시 쟀다. D2Coding 다시 그리기만 프로브가 두 번 멈춰 같은 절차의 단독 스크립트(`specs/v0.8.2/verify/ORDER-07/redraw-d2coding.mjs`)로 쟀다.

## 측정 불가

- Welcome GET STARTED의 "Open Folder" 줄: 네이티브 폴더 대화상자가 떠 프로브가 안전하게 닫지 못함. "Open Settings" 줄만 실행.
- `sendBeacon`: 프레임 target Network에 보냄·막힘 어느 이벤트도 남지 않아 이 방법으로는 나갔는지 보이지 않음(v0.8.1 결론은 그대로, 이번에 새로 증명하지 못함).

## 검증

- `npm.cmd run test` 339/339, `npm.cmd run typecheck` 0(K-08), `cargo check` 경고 0, `cargo clippy -- -D warnings` exit 0, `npm.cmd run tauri build` exit 0(76초, K-09, 로그 `%TEMP%\v082-K-09-build.log`).
- 리뷰: C-08 [PASS](메시지 처리 diff, 격리 조건 카드에 옮겨 적음), C-09 [PASS](BUILD·README).
- 화면: 프로브 `specs/v0.8.2/verify/ORDER-07/probe.mjs`(ORDER-02 leader 프로브 방식: 클릭 전 `elementFromPoint`, 탭 4개 이하, 활성 탭 기록, 키는 `tools/win-input.ps1` SendInput). 세션 2회 + 다시 재기. 결과 `out/result.json` 90줄 통과.

## 지운 것·더한 것·하지 않은 것

- 더함: 프레임 → 앱 봉투 `previewAct`(키 7개 허용 목록·제목 순번·찾기 글자), 앱 → 프레임 `previewZoom`·`previewReveal`·`previewFindRead`·`previewFind`, 찾기 바를 `FindTarget`으로 떼어 냄(md·ipynb·csv는 `domFind`).
- 하지 않음: 프레임 안 선택 글자를 찾기 첫 검색어로, `keymap.json`에서 바꾼 키를 프레임 안에 적용, 프레임 안 `Alt+C/W/R`, 찾기 바가 열린 동안 페이지가 바꾼 글자 다시 찾기.
- 남은 위험: 프레임 → 앱 `text`는 페이지가 고른 글자(최대 500만 자) + 사용자가 넣은 나쁜 정규식이면 앱이 한동안 느려질 수 있다. `zoom`이라 CSS 없는 HTML은 테두리 1px·고정 여백도 함께 커진다(md는 글자에서 나온 값만).

## tauri가 고른 것

- I-19 키우는 방식: 프레임 문서 root CSS `zoom` = 지금 미리보기 글자 크기 ÷ Settings 크기. `px`·`rem`·`em` 어느 것으로 정한 페이지든 함께 커진다. 바탕 모양은 Settings 크기로 넣고 그 위에 zoom을 걸어 `Ctrl`+`+`마다 문서를 다시 만들지 않는다.
- I-25 찾는 범위: 프레임 문서에서 지금 그려진 글자 노드(스크립트가 그려 넣은 글자, SVG `<text>` 포함). 안 찾음: `display:none`·`visibility:hidden`·`content-visibility`로 숨은 글자, shadow DOM, canvas, 입력 칸 값, `::before` 등 생성 글자, 코드 블록 머리 줄, `<template>`·`<noscript>`, 500만 자 뒤. 표시는 CSS Custom Highlight(페이지 DOM 안 바꿈). WebView 찾기 창은 프레임 안 keydown(`isTrusted`)에서 기본 동작을 막는다 — 앱 전체 브라우저 설정은 바꾸지 않았다.
- I-6 제목 어긋남: Outline은 원본 기준. 프레임 문서를 만들 때 원본 h1~h6에 순번 `data-preview-heading`을 붙인다. 스크립트가 만든 제목은 Outline에 없고 그 아래 클릭은 바로 앞 원본 제목 줄을 표시한다. 스크립트가 지운 제목은 Outline 줄이 남고 누르면 프레임은 그대로, 선택 표시만 옮긴다. 범위 밖 순번은 선택 없음. 한계: 깨진 마크업을 HTML 파서와 tree-sitter가 다르게 읽으면 그 뒤 순번이 밀린다(`shortcut:` 주석).

### 프레임 → 앱 메시지와 꾸며 냈을 때 최악의 일

검사(`frameRequest`, `src/editor/html.ts:223-231`): 출처 창이 이 미리보기 프레임 · 토큰 일치(머리 스크립트만 앎, 스크립트는 자신을 지움) · 필드가 토큰 + 하나 · 값 모양.

| 필드 | 허용 값 | 앱이 하는 일 | 최악 |
|---|---|---|---|
| `key` | `zoomIn`·`zoomOut`·`zoomReset`·`find`·`findNext`·`findPrevious`·`cancel` | 앱 안 고정 표로 미리보기 글자 크기 ±1/되돌림, 이 미리보기 찾기 바 열기·다음·이전·닫기. 이름으로 명령을 찾지 않음 | 미리보기 글자 크기 바뀜(6~100px, 저장 안 됨), 찾기 바 열림·닫힘·한 칸 이동 |
| `heading` | -1 이상의 정수 | 이 미리보기 탭의 Outline 선택 줄 | 선택 표시가 다른 줄로·사라짐, 접힌 부모 펴짐. 편집기 선택·스크롤은 그대로 |
| `text` | 문자열(500만 자에서 자름) | 찾기 바가 읽기를 기다릴 때만 개수·표시 위치 계산 | 개수·표시 위치가 달라짐, 위 "남은 위험"의 느려짐 |

거절(테스트 표): 다른 창, 토큰 없음·틀림, `key`에 `workspace::Save`·`editor::Find`·`constructor`·숫자, `heading`에 소수·-2·NaN·문자열, `text`에 배열, 필드 둘 이상·더 있음·없음, 봉투 없음, 문자열·null, 프레임 없음. 기존 `previewLink`·`previewCopy`·`previewReady`·`previewPong`·`previewScrollY` 처리는 그대로.

### 앱 → 프레임 메시지 (모두 `frameMessage` `src/editor/html.ts:238-245`, 보내는 곳 `post` `src/shell/markdown-preview.ts:331` 하나, 토큰 없음)

`previewPing`(true) · `previewScrollTo`(스크롤 Y) · `previewZoom`(배율) · `previewReveal`(제목 순번) · `previewFindRead`(true) · `previewFind`(`{marks?: from,to 쌍 배열, at, scroll}`, 검색어는 보내지 않음).

### 메시지 처리 diff 위치

- `src/editor/html.ts`: 122 `PREVIEW_HEADING_ATTR`, 183–198 `FRAME_KEYS`·`frameKey`, 202–209 `lastAtOrBefore`, 212 `PREVIEW_FIND_MAX_CHARS`, 223–231 `frameRequest`, 238–245 `frameMessage`, 260–281 `frameScript`, 307 `headStart`에 끼움(링크 스크립트 바로 앞), 334–341 원본 제목 순번.
- `src/shell/markdown-preview.ts`: 331 `post`, 333–344 `frameFind`, 345–355 `onFrameMessage` 새 가지(348 `frameRequest`), 382–383 load 때 스크롤·zoom·찾기, 411 ping, 413–415 찾기 바 연결, 448 렌더 때 zoom, 604–605 글자 크기 바뀔 때 zoom, 618–619 Outline 이동.
- 메시지 밖(보안 설정 아님): `src/app.css` 845·858·859 찾기 바 배치, `src/spec/metrics.ts` `.preview-setting-size`.

## 바꾼 파일

- `1f9bd3a` (K-08): `src/editor/html.ts`·`html.test.ts`, `src/editor/preview-find.ts`·`preview-find.test.ts`, `src/shell/markdown-preview.ts`·`preview-search.ts`·`Outline.tsx`, `src/syntax/outline.ts`·`outline.test.ts`, `src/settings/load.ts`, `src/spec/metrics.ts`, `src/app.css`
- `782a003` (K-09): `docs/BUILD.md`, `README.md`
- 측정 산출물(이 보고와 함께 커밋): `specs/v0.8.2/verify/ORDER-07/`

## 미정

- HTML 다시 그리기 시간(기본 약 0.3s, D2Coding 약 0.52s)으로 글꼴 `data:` 방식을 둘지 — leader-core.
- 사용자 확인 목록 후보(leader-core): CSS 없는 HTML에서 `Ctrl`+`+` 때 테두리·여백도 함께 커지는 모습, Welcome·Zed 캡처 나란히(`out/O5-8-welcome.png`·`out/zed-G1-welcome-zed.png`), v0.8.1 시안 페이지 모습(`out/O6-7-mockup.png`), 첫 열림 접힘 모습(`out/O4-9.2-firstopen.png`).
- `keymap.json`에서 바꾼 키가 프레임 안에서 안 먹는 것을 둘지 — leader-core.
- `sendBeacon` 나감 여부를 다른 방법으로 다시 볼지 — leader-core.

## BLOCKED

없음
