[DONE] ORDER-16 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| U-14 | 세 줄 커서 → `Shift+→` 세 번 → 셋 다 세 글자, `Shift+←` → 두 글자, `→` → 커서 셋이 선택 끝으로·커서 수 3(V1, V3) | 충족 | V1 `src/editor/extensions.test.ts`(EditorState 세 범위 0-3·7-10·14-17 → 0-2… → 커서 2·9·16). V3 `specs/v0.6/verify/ORDER-16/v3.json` u14: `Ctrl+Alt+↓`×2로 커서 셋 → `Shift+→`×3 abc/ghi/mno → `Shift+←` ab/gh/mn → `→` 커서 @2/@13/@24(3개) → `Shift+End` 셋 다 줄 끝까지 → `Ctrl+Shift+→` 셋 다 단어. `Ctrl+Shift+↓`로 만든 커서도 같음. `u14-shift-right3.png` |
| U-15 | 편집 탭 본문 포커스 캡처에 점선이 없다, 계산 `outline` none(V3, 마크다운·코드 탭) | 충족 | u15: `.cm-editor.cm-focused` outline-style none(`u15-code-focused.png`). 마크다운 탭은 같은 `.cm-editor` 규칙이고 `u17-md-plus2-preview.png`에 점선 없음. 미리보기·Search·Extensions·Keymap 탭 본문은 이미 outline none(코드 확인) |
| U-16 | Sidebar 검색란 오른쪽 `Ctrl+F` 표시가 없다(V3), Sidebar로 가는 `Ctrl+F` 바인딩이 없다(V1), 편집 영역 `Ctrl+F`는 찾기 줄(V3) | 충족 | V1 `src/keymap/keyboard.test.ts`(Sidebar 컨텍스트 `ctrl-f` → none, `sidebar::Search` 없음, Editor `ctrl-f` → `editor::Find`). V3 u16: `.menu-shortcut` 없음, 글자를 넣으면 × 보이고 누르면 비워짐(`u16-sidebar-search.png`), Sidebar 목록 포커스에서 `Ctrl+F` → 찾기 줄 안 열림·포커스 그대로, 편집 영역 `Ctrl+F` → 찾기 줄 열림 |
| U-17 | 편집 탭 `Ctrl+=` 두 번 → 편집 글꼴 두 단계 커짐, 메뉴 줄·Sidebar·상태 바 글꼴과 창 배율 그대로, `Ctrl+-` → 한 단계 작아짐, `Ctrl+0` → 원래 크기(V1, V3) | 충족 | V1 `src/editor/font-size.test.ts`(+1·−1·최소 6·최대 100·reset → 설정 값), `keyboard.test.ts`(키 → action, 숫자 패드 포함). V3 u17: 15px(줄 24.3·줄 번호 24.3) → `Ctrl+=`×2 17px(27.5·27.5) → `Ctrl+-` 16px(25.9·25.9) → `Ctrl+0` 15px; Sidebar 14px·상태 바 12px·탭 14px·트리 14px·`devicePixelRatio` 1·`innerWidth` 1440·zoom 1 모두 그대로; 숫자 패드 + → 16, − → 15, `Ctrl+Shift+=` → 16. `u17-code-plus2.png` |
| U-17 | 모든 편집 탭(마크다운·코드)에 같은 크기, 미리보기 글꼴 그대로, 줄 번호·찾기 일치·편집↔미리보기 연계가 맞다 | 충족 | u17markdownSplit: 마크다운 편집 17px·줄 번호 27.5 맞음, 미리보기 본문 16px 전후 같음, 크기 바꾼 뒤 편집 "## Section 4" 클릭 → 미리보기 active-block "Section 4"(`u17-md-plus2-preview.png`). 크기 변수가 `:root` 하나라 나눈 Pane의 편집기도 같은 값(이번 측정은 편집기 하나와 미리보기 Pane) |
| U-18 | 켬·끔 확대 캡처, 켰을 때 아이콘 색·테두리 색·두께·모서리(V3) | 충족 | u18: 끔 — 아이콘 rgb(88,88,90), 테두리 없음, 22×22. 켬 — 아이콘 rgb(92,120,226) = `--text-accent`, 테두리 1px solid rgb(125,130,232) = `--border-focused`, 모서리 4px, 22×22 그대로. `u18-lock-off.png`, `u18-lock-on.png`(6배 확대) |

### 키맵 표 (편집 영역)
| 키 | 편집 영역 동작 | 원래 동작 |
|---|---|---|
| `←` / `→` | 모든 커서 한 글자 이동(범위는 가장자리로 접힘) | 네이티브, 커서가 하나로 줄어듦 |
| `Shift+←` / `Shift+→` | 모든 범위 한 글자 넓힘·줄임 | 네이티브, 하나로 줄어듦 |
| `Ctrl+←` / `Ctrl+→`, `Ctrl+Shift+←` / `Ctrl+Shift+→` | 모든 커서 단어 단위 이동·선택 | 네이티브 |
| `Home` / `End`, `Shift+Home` / `Shift+End` | 모든 커서 줄 경계(들여쓰기 끝 먼저) 이동·선택 | 네이티브 |
| `Ctrl+=`, `Ctrl+Shift+=`, 숫자 패드 `+` | `zed::IncreaseBufferFontSize`(편집 글꼴 +1px) — Workspace 전역 | WebView 확대(막혀 있었음) |
| `Ctrl+-`, 숫자 패드 `-` | `zed::DecreaseBufferFontSize`(−1px) | WebView 축소(막혀 있었음) |
| `Ctrl+0`(숫자 패드 0, NumLock) | `zed::ResetBufferFontSize`(설정 `buffer_font_size`로) | WebView 배율 초기화 → 이제 막음 |
| `Ctrl+F`(Sidebar 포커스) | 바인딩 지움 → 아무 일 없음(브라우저 찾기도 `BROWSER_KEYS`로 막힘) | `sidebar::Search`(검색란으로) |

## 카드가 보고하라고 한 것
- U-14 원인: 편집기에 CodeMirror `defaultKeymap`이 없고 앱 키맵에도 이 키들이 없어, 브라우저가 네이티브로 캐럿을 옮겼고 CM이 그 결과를 범위 하나로 읽어 커서가 하나로 줄었다(앱 키맵이 덮은 것은 아님). `@codemirror/commands` 명령을 기존 CM 키맵 자리에 더했다(앱 키맵 표가 아니라 CM 키맵 소속, 기존 주석 I-048~I-055 방식).
- U-15: 원인은 CM 기본 테마의 `.cm-editor.cm-focused { outline: 1px dotted }`. 편집기 테마에서 `outline: none`으로 덮었다.
- U-16: Sidebar 포커스에서 `Ctrl+F` → 아무 일도 없다(새 동작 없음). `sidebar::Search` 명령은 다른 곳이 쓰지 않아 함께 지웠다.
- U-17 따른 것: core 확정 값(1px, 최소 6px, 최대 100px; Zed 값으로 알려졌지만 소스 미확인 — 코드 주석에 출처). 저장하지 않음(Zed 키맵 문서 I-386~I-388 `persist = false`). `Ctrl+0`은 설정 `buffer_font_size`(기본 15)로 되돌리고 브라우저 배율 초기화는 막았다. 설정과의 연결: `buffer_font_size`가 기준값이고, 설정 파일에서 이 값이 바뀌면 일시 변경을 버리고 새 설정 값으로 간다(Zed 처리 방식은 소스 미확인이라 coder 결정). 편집기만 새 변수 `--editor-buffer-font-size`를 쓰고, Search 탭 이름·경로는 `--typography-buffer-font-size`(설정 값) 그대로. 키는 Zed처럼 Workspace 전역에 묶었다(포커스가 Sidebar여도 편집 글꼴만 바뀜).
- U-18 토큰: 아이콘 `--text-accent`(기존 켜짐 표시 그대로), 테두리 색 `--border-focused`, 두께 `--project-panel-item-border-width`(1px), 모서리 `--settings-control-corner-radius`(4px). 배경은 더하지 않았다(그림에도 없음). 다른 상태 바 버튼은 그대로이고 바꿀 점은 없다고 봤다.

## 검증
- coder K-20(U-14~U-16), K-20-R1(U-17·U-18), K-20-R2(U-17 줄 번호): typecheck, 관련 node 테스트 통과.
- U-17은 처음에 Zed 값 근거가 없어 [BLOCKED]로 core-leader에게 알렸고, core 확정 값을 받아 이어서 했다.
- leader V3에서 찾은 버그: 이미 열린 편집기에서 글꼴을 바꾸면 줄 번호 칸이 옛 줄 높이(24.3)에 남아 글줄(27.5)과 어긋났다. 원인은 CSS 변수만 바꾸면 CM이 줄 높이 지도를 다시 재지 않는 것. K-20-R2가 빈 `Compartment`를 새 빈 테마로 다시 설정해(공개 API) 다시 재게 했고, 재측정에서 줄 번호가 맞았다.
- checker C-22(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 233 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과. 코드 검토 지적 없음, V3 U-14~U-18 PASS.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe(`src-tauri/target/debug`), 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 1440×852. SendInput, CDP. 시스템 클립보드는 건드리지 않았다. 사용자 테스트 앱(PID 19268)은 건드리지 않았다(측정 때마다 이미 실행 중이 아니었다). U-17·U-18이 더해지는 동안 받은 화면 차례 하나는 앱을 띄우지 않고 돌려주었다.
- 결과 파일: `specs/v0.6/verify/ORDER-16/` `v3.json`(최종 빌드), `u14-shift-right3.png`, `u15-code-focused.png`, `u16-sidebar-search.png`, `u17-code-plus2.png`, `u17-md-plus2-preview.png`, `u18-lock-off.png`, `u18-lock-on.png`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: `SIDEBAR_BINDINGS`와 `sidebar::Search` 명령·등록, Sidebar `Ctrl+F` 표시와 `.sidebar-search .menu-shortcut` 규칙, 쓰지 않게 된 import.
- 더한 것: CM 좌우·Home/End·단어 이동/선택 키, 편집기 포커스 outline none, `src/editor/font-size.ts`·글꼴 크기 상수(core 확정 출처)·`--editor-buffer-font-size`·글꼴 크기 키·`BROWSER_KEYS`의 `ctrl-0`·높이 다시 재기, Lock Preview 켜짐 테두리. 새 의존성·새 색·spec/ 수정 없음.
- 하지 않은 것: 위/아래 화살표의 여러 커서 처리(카드 밖, 지금도 네이티브라 여러 커서에서 누르면 하나로 줄 수 있음), View 메뉴 Zoom In/Out/Reset 항목(이 앱 메뉴에 없음), 글꼴 크기 저장.
- 남은 위험:
  - 단일 커서의 `Home`도 이제 CM 동작(들여쓰기 끝 먼저)이고, 단어 경계가 네이티브와 조금 다를 수 있다.
  - 나눈 Pane에 편집기 둘을 띄운 상태의 글꼴 크기는 따로 재지 않았다(같은 `:root` 변수라 같은 값).

## 바꾼 파일
- 코드 커밋 `bf86cdc`: `src/editor/extensions.ts`·`extensions.test.ts`, `src/editor/font-size.ts`(새)·`font-size.test.ts`(새), `src/keymap/keyboard.ts`·`keyboard.test.ts`, `src/workspace/folders.ts`, `src/shell/Sidebar.tsx`, `src/shell/status.ts`, `src/settings/load.ts`, `src/App.tsx`, `src/spec/metrics.ts`, `src/app.css`
- 기록 커밋 `91dd3c1`: `specs/v0.6/PROGRESS.md`("사용자 요청 작업" 절 ORDER-16 소절), `specs/v0.6/verify/ORDER-16/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- U-18 테두리 색 `--border-focused`(One Light rgb(125,130,232))가 "옅은 강조색"으로 충분한지(더 옅게 하려면 다른 기존 토큰을 골라야 한다) → 사용자
- U-17에서 설정 `buffer_font_size`가 바뀔 때 일시 변경을 버리는 처리(coder 결정, Zed 소스 미확인) → core-leader
- 여러 커서에서 위/아래 화살표도 모든 커서에 걸게 할지 → 사용자

## BLOCKED
- 없음(U-17 값은 core 확정으로 풀림)
