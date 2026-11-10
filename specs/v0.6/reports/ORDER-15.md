[DONE] ORDER-15 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| U-11 | "않는다" 세 번 있는 문서에서 커서를 하나에 두면 셋 모두 강조, 공백이면 없음, `foo`도 같음(`foobar`의 `foo`는 제외)(V3, V1 가능하면) | 충족 | `specs/v0.6/verify/ORDER-15/v3.json` markdown.korean: "않는다" 3개 강조(`md-word-korean.png`); u11code: 커서 `foo` → 단어 `foo` 3개(`foobar` 안 `foo` 제외), 공백 → 0(`code-word-foo.png`); u11selection: "con" 선택 → 같은 글자 2곳. 강조 색 rgb(202,202,202) = `--ghost-element-selected`. 찾기 줄에 일치가 있으면 단어 강조가 투명해져 찾기 강조가 우선(u11withFind, `code-word-with-find.png`). V1: CM 내부 동작이라 단위 테스트는 두지 않음(Ctrl+Shift+L 커서 단어 테스트가 같은 단어 경계 규칙을 씀) |
| U-12 | 두 번 눌러 고른 단어·끌어 고른 영역·찾기 줄 현재 일치의 배경색이 같다(V3 값·캡처) | 충족 | `v3-u12.json`(글자 없는 위쪽 픽셀, 활성 줄): 찾기 현재 일치 (207,209,237) = 두 번 눌러 (207,209,237) = 끌어 (207,209,237) = 여러 커서(Ctrl+D 두 번) (207,209,237). 활성 줄 (239,239,240) 그대로. 캡처 `u12-find-current.png`, `u12-dblclick.png`, `u12-drag.png`, `u12-multi.png`, `u12-keyboard.png`, `u12-active-line.png` |
| U-13 | `Ctrl+D` 두 번 → 선택 2개, `Ctrl+Shift+L` → 같은 글자 모두(커서만 포함), `Ctrl+Shift+Down` 두 번 → 커서 3개 같은 열(V1 키맵 테스트, V3) | 충족 | V1 `src/keymap/builtin.test.ts`(Editor에서 커서 추가, ProjectPanel에서는 없음, Ctrl+Alt 그대로), `src/editor/search.test.ts`(커서만 Ctrl+Shift+L: `foo foobar foo` → 2, "않는다" 3, 단어 밖 false). V3 u13: Ctrl+D 1 → 2, Ctrl+Shift+L(커서만) → foo 3개, Ctrl+Shift+Down 두 번 → 커서 3개 모두 열 2(`code-ctrl-shift-down.png`), Ctrl+Shift+Up → 2개, Ctrl+Alt+Down 그대로, 트리 포커스에서 Ctrl+Shift+Down → 편집기 커서 1개 그대로·포커스 트리 |
| 공통 | 마크다운 편집 탭·코드 탭 둘 다, 편집↔미리보기 위치 연계 그대로(한 번) | 충족 | main.ts(코드)·notes.md(마크다운) 둘 다 위 측정. 미리보기를 옆에 열고 편집 "## Section 4" 클릭 → 미리보기 active-block "Section 4"(markdown.previewActiveBlock) |

### 키맵 표 (Editor 컨텍스트)
| 키 | 편집 영역 동작 | 원래 동작 |
|---|---|---|
| `Ctrl+D` | 커서 단어 선택 → 누를 때마다 다음 같은 글자 추가(ORDER-09-R1 그대로) | 같음 |
| `Ctrl+Shift+L` | 선택이 있으면 같은 글자 모두(그대로). 커서만 있으면 커서 단어와 같은 단어(단어 경계·대소문자 구분) 모두 — **이번에 고침** | 커서만 있으면 아무 일 없었음 |
| `Ctrl+Shift+Up` / `Ctrl+Shift+Down` | **새로**: 위·아래 줄 같은 열에 커서 추가(`editor::AddCursorAbove/Below`) | 앱 키맵에 없었음. 브라우저 기본(단락 끝까지 선택 넓히기)이 빠진다 |
| `Ctrl+Alt+Up` / `Ctrl+Alt+Down` | 그대로 | 같음 |
- 편집 영역 밖(트리 등)의 `Ctrl+Shift+Up/Down`은 바꾸지 않았다(Editor 컨텍스트에만 추가).

## 카드가 보고하라고 한 것
- U-11 강조 색: `--ghost-element-selected`(One Light rgb(202,202,202)) — 찾기 줄 "다른 일치"(`.cm-searchMatch`)와 같은 토큰이고, 현재 선택·현재 일치(`--players-0-selection`)보다 옅다.
- U-12 해석: core-leader 해석(찾기 줄 현재 일치 색)대로 했다. 처음에는 계산값이 이미 같았지만(둘 다 `--players-0-selection`) 화면 픽셀이 달라, 보이는 색을 같게 하려고 세 번 고쳤다:
  1. 반투명 활성 줄 배경(`.cm-line` 자체)이 글자 뒤에 그려지는 선택 레이어를 덮어 선택이 옅게 보였다(선택 (230,230,238) vs 찾기 (200,202,235)) → 활성 줄 배경을 `.cm-activeLine::before`(z-index −100, 선택 레이어 아래)로 옮겼다(K-19-R1).
  2. 그때 줄 자체 배경 규칙이 비어 CodeMirror 기본 테마의 파란 활성 줄(rgba(204,238,255,0.267))이 드러난 회귀 → `.cm-activeLine` 배경 투명(K-19-R2).
  3. 찾기 현재 일치는 언제나 편집기 선택과 같은 범위라(`@codemirror/search`가 일치 범위 = 선택 범위일 때만 `.cm-searchMatch-selected`를 붙임), 선택 레이어 위에 같은 색이 한 겹 더 쌓여 진했다((182,186,234) vs (207,209,237)) → `.cm-searchMatch-selected` 배경 투명(K-19-R3). 이제 현재 일치의 보이는 색은 선택 색 하나다.
  새 색 값은 없다. 포커스를 잃었을 때의 선택 색 규칙은 그대로다.
- Edit 메뉴 Add Cursor Above·Below 표시: `Ctrl+Alt+Up/Down` 그대로 둔다(VS Code Windows 메뉴 표시와 같음, `Ctrl+Shift+Up/Down`은 같은 동작의 두 번째 키).

## 검증
- coder K-19(U-11·U-13, U-12 계산값 확인), K-19-R1·R2·R3(U-12 화면 색): typecheck, 관련 node 테스트(builtin·search·keyboard·app-menus·extensions) 통과.
- checker C-21(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 229 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과(첫 실행에서 타이머 지연 1건, 다시 실행해 통과 — ORDER-11 때와 같은 시간 의존 테스트로 보이며 Rust 변경 없음). 코드 검토 지적 없음, V3 PASS. 도중에 checker가 허용 목록 밖 명령(`node -e`)으로 허가 창에서 멈춰, leader가 거절하고 파일을 읽어 판정하게 했다.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`, U-12 수정 때문에 네 번 받음): debug exe(`src-tauri/target/debug`), 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 1440×852. SendInput, CDP, 픽셀은 CDP 캡처에서 `tools/png.mjs`로 읽음. 시스템 클립보드는 건드리지 않았다. 사용자 테스트 앱(PID 11564)은 건드리지 않았다(매 측정 전후 실행 중 확인).
- 결과 파일: `specs/v0.6/verify/ORDER-15/` `v3.json`(최종 빌드 전체 재측정; 그 안의 u12 줄은 픽셀을 글자 위에서 뽑아 판정에 쓰지 않음), `v3-u12.json`(최종 U-12 픽셀), `code-*.png`, `md-word-korean.png`, `u12-*.png`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 더한 것: `highlightSelectionMatches`(커서 단어), `.cm-selectionMatch` 색 규칙, `Ctrl+Shift+Up/Down` Editor 바인딩, 커서만 있을 때 `Ctrl+Shift+L`, 활성 줄 `::before`.
- 바꾼 것: `.cm-activeLine`(자체 배경 투명, 색은 `::before`), `.cm-searchMatch-selected`(배경 투명).
- 하지 않은 것: 새 의존성·새 색·spec/ 수정 없음. 포커스 잃은 선택 색, Edit 메뉴 단축키 표시 변경 없음.
- 남은 위험:
  - 활성 줄 색이 `.cm-activeLine`의 `::before`에 있다. 활성 줄 배경을 덤프로 읽을 때는 `getComputedStyle(el, "::before")`로 읽어야 한다.
  - `::before`(z −100)가 CodeMirror 레이어 아래라는 가정은 V3 픽셀로 확인했다(One Light). 다른 테마는 재지 않았다.
  - `Ctrl+Shift+Up/Down`에 묶여 있던 브라우저 기본 선택 넓히기가 편집기에서 빠진다.

## 바꾼 파일
- 코드 커밋 `f5fa2ba`: `src/editor/extensions.ts`, `src/editor/search.ts`·`search.test.ts`, `src/keymap/builtin.ts`·`builtin.test.ts`, `src/app.css`
- 기록 커밋 `4d773c0`: `specs/v0.6/PROGRESS.md`("사용자 요청 작업" 절 ORDER-15 소절), `specs/v0.6/verify/ORDER-15/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 없음(이번 카드).

## BLOCKED
- 없음
