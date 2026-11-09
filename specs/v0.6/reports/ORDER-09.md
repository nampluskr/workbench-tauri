[BLOCKED] ORDER-09 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-17 | 표의 찾기·바꾸기·일치 선택 기능(`Ctrl+F`·`Ctrl+H`·`F3`/`Shift+F3`·`Enter`/`Shift+Enter`·`Alt+C/W/R`·바꾸기 `Enter`/`Ctrl+Alt+Enter`·`Alt+Enter`·`Ctrl+D`·`Ctrl+Shift+L`·`Ctrl+K Ctrl+D`)이 workbench-kit과 같다, 모두 바꾸기 뒤 `Ctrl+Z` 한 번으로 복원(V1 로직 테스트) | BLOCKED(사용자 승인 대기) | `@codemirror/search` 필요(아래 BLOCKED). 더하지도 직접 만들지도 않았다(core-leader 2026-11-10) |
| I-17 | 표의 나머지 기능을 단축키로 실행해 workbench-kit(VS Code)과 같은 결과 | 충족 | `specs/v0.6/verify/ORDER-09/v3-2.json`: `Ctrl+A` 전체 선택, `Ctrl+L` 줄+줄바꿈 선택, `Alt+클릭` 커서 2개, `Ctrl+Alt+Down`×2 커서 3개, `Esc` 커서 하나. VS Code 기본 동작과 같음(C-13). workbench-kit은 띄우지 않고 VS Code 기본 동작·workbench-kit 소스로 비교했다 |
| I-17 | Edit 메뉴 항목마다 메뉴로 실행해 같은 결과 | 충족(Find·Replace·Add Next Occurrence는 BLOCKED, Paste는 미정) | 메뉴 Undo/Redo(`v3-2.json` menuUndoRedo), Toggle Line Comment(`lineComment` afterMenuToggle `# x = 2`), Toggle Block Comment·Copy·Cut·Select All·Add Cursor Above/Below는 단축키와 같은 명령(코드 확인, C-13). 메뉴 Copy → 클립보드 "const a = 1;\n"(PowerShell `Get-Clipboard`로 읽음, `v3.json`). 메뉴 Paste는 아래 미정. Find·Replace·Add Next Occurrence는 비활성(검색 모듈 대기) |
| I-17 | 찾기 창 자리·모양을 workbench-kit 캡처와 비교 | BLOCKED(사용자 승인 대기) | 찾기 창이 검색 모듈 기능이다 |
| I-17 | Edit 메뉴의 항목·순서·구분선·단축키 표시가 기대 2와 같다 | 충족 | `v3-2.json` editMenu: Undo Ctrl+Z, Redo Ctrl+Y / ─ / Cut Ctrl+X, Copy Ctrl+C, Paste Ctrl+V / ─ / Find Ctrl+F, Replace Ctrl+H / ─ / Toggle Line Comment Ctrl+/, Toggle Block Comment Shift+Alt+A / ─ / Select All Ctrl+A, Add Next Occurrence Ctrl+D, Add Cursor Above Ctrl+Alt+Up, Add Cursor Below Ctrl+Alt+Down. `edit-menu.png`. 기준 `workbench-kit/src/core/menu.ts` DEFAULT_EDIT_ITEMS |
| I-17 | 경로 줄 미리보기 아이콘 오른쪽에 codicon `search` 아이콘, 누르면 찾기 창 열기/닫기 | 아이콘 충족 / 열기·닫기 BLOCKED(사용자 승인 대기) | 아이콘 있음(비활성, 툴팁 "Find in Explorer" = workbench-kit `src/core/layout.ts` 문구), `icon-md.png`, `icon-code.png`, `icon-tooltip.png`. 찾기 창이 없어 동작은 승인 뒤 연결 |
| I-17 | 아이콘 라이선스(codicon, CC BY 4.0)가 Licenses 화면에 있다 | 충족 | `v3-2.json` licenses: `../assets/codicons/NOTICE.txt`(search.svg from @vscode/codicons 0.0.46-24, Copyright Microsoft) + `../licenses/codicons-0.0.46-24-CC-BY-4.0.txt`(Attribution 4.0 International 본문) |
| I-17 | 겹친 단축키가 편집 영역에서 VS Code 동작을 하고, 원래 동작이 어디로 갔는지 보고 | 충족(검색 키는 BLOCKED) | 아래 "겹치는 단축키" 표. 기존 앱 바인딩을 없앤 키는 없다 |
| I-17 | 마크다운·코드 파일에서 찾기 아이콘이 경로 줄 오른쪽 끝(마크다운은 눈 아이콘 오른쪽) | 충족 | `v3-2.json`: main.ts·app.py 아이콘 x 1410–1432, 경로 줄 끝 1410(오른쪽 끝); notes.md Preview Markdown 1387–1409, 찾기 1410–1432(눈 오른쪽). `icon-code.png`, `icon-md.png` |
| I-19(Phase 6 줄) | 편집 영역에서 `Ctrl+F`를 누르면 문서 안 찾기가 열린다 | BLOCKED(사용자 승인 대기) | 지금은 아무것도 열리지 않고 Sidebar 입력란으로도 가지 않는다(`v3-2.json` ctrlF_editor: 포커스 cm-content, 패널 없음). Sidebar 포커스의 `Ctrl+F`는 그대로 Sidebar 입력란(ORDER-06) |

## 겹치는 단축키 (앱 키맵 Zed 기준 ↔ VS Code, 편집 영역)
| 키 | 지금까지 앱 바인딩(컨텍스트) | 편집 영역의 새 동작 | 원래 동작 |
|---|---|---|---|
| Ctrl+Z / Ctrl+Y | editor::Undo / Redo(Editor) | 같음 | 그대로 |
| Ctrl+X / C / V | ProjectPanel의 Cut/Copy/Paste, menu의 Ctrl+C=Cancel; 편집기는 CM6 기본 | 편집기는 CM6 기본(메뉴에도 연결) | 트리·메뉴에서 그대로 |
| Ctrl+F | Sidebar의 sidebar::Search; 브라우저 기본 막힘 | 찾기 창 — BLOCKED(지금 동작 없음) | Sidebar에서 그대로 |
| Ctrl+H, Shift+F3, Ctrl+D, Ctrl+Shift+L | 없음 | BLOCKED(지금 동작 없음) | 해당 없음 |
| F3 | 없음, 브라우저 기본 막힘 | BLOCKED(지금 동작 없음) | 해당 없음 |
| Alt+C / Alt+W / Alt+R, Ctrl+Alt+Enter, Alt+Enter | 없음 | BLOCKED(찾기 창 안 키) | 해당 없음 |
| Ctrl+K Ctrl+D | 없음(Ctrl+K는 다른 chord 앞 키) | BLOCKED(지금 동작 없음) | Ctrl+K chord들 그대로 |
| Ctrl+A | 없음(입력란·편집기 기본) | editor::SelectAll | 해당 없음 |
| Ctrl+L | 없음 | editor::SelectLine | 해당 없음 |
| Ctrl+Alt+Up / Down | 없음 | editor::AddCursorAbove / Below | 해당 없음(창 이동은 Ctrl+K Ctrl+Up/Down 그대로) |
| Esc | 편집기 CM6 simplifySelection, menu::Cancel | 같음 | 그대로 |
| Ctrl+/ | 없음 | editor::ToggleComment | 해당 없음 |
| Shift+Alt+A | 없음 | editor::ToggleBlockComment | 해당 없음 |
| Alt+클릭 | CM6 clickAddsSelectionRange | 같음 | 그대로 |

## 검증
- coder K-11(typecheck, node 테스트 19+11+4), K-11-R1·R2(한국어 IME `Ctrl+/`, node 테스트 16, 19).
- checker C-13(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 220 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드 검토·V3 판정 PASS(BLOCKED 항목 제외), 지적 없음. 의존성 파일(`package.json`·lock·`Cargo.toml`·`Cargo.lock`) 변경 없음.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe, 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 임시 폴더(notes.md·app.py·main.ts). SendInput, CDP, 클립보드는 PowerShell `Get-Clipboard`로 읽음. 세션 다섯(첫 세션은 스크립트·권한 창 때문에 일부 무효, 다시 재기, `Ctrl+/` 탐침 셋).
- 한국어 IME에서 찾은 결함: 이 PC 키보드 배치 0x0412에서 `Ctrl+/`가 key `Process`로 와 주석 대신 "/"가 들어갔다(`probe-ctrl-slash.json`). 물리 키로 단축키를 정하고(R1), 직후 IME 조합 글자 한 개를 막아(R2) 고쳤다: 주석만 토글, `Ctrl+Z` 한 번 복원, 한글 입력 정상(`probe-ctrl-slash-after-fix2.json`).
- 결과 파일: `specs/v0.6/verify/ORDER-09/` `v3.json`, `v3-2.json`, `probe-ctrl-slash.json`, `probe-ctrl-slash-after-fix.json`, `probe-ctrl-slash-after-fix2.json`, `edit-menu.png`, `icon-code.png`, `icon-md.png`, `icon-tooltip.png`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 더한 것: Edit 메뉴 13항목(세 항목 비활성), 편집 영역 키 바인딩 여섯(`EDITOR_BINDINGS`), 메뉴 Cut/Copy/Paste 연결, 언어 config 주석 토큰 → CM6 languageData, codicon `search.svg`·NOTICE·CC BY 4.0 본문, 경로 줄 찾기 아이콘(비활성), IME 처리(`src/editor/ime.ts`, Process+Ctrl/Alt 단축키만). 새 의존성 없음.
- 지운 것: 없음.
- 하지 않은 것: 찾기·바꾸기·일치 선택(검색 모듈 승인 대기, 직접 구현 안 함), HTML 안 JS 같은 삽입 언어별 주석 전환(`shortcut:` 주석으로 남김).
- 남은 위험: 메뉴 Paste 권한 창(미정). V3 중 메뉴 Copy 시험이 시스템 클립보드 내용을 "const a = 1;"로 덮어썼다.

## 바꾼 파일
- 코드 커밋 `36f990c`: `src/shell/app-menus.ts`·`app-menus.test.ts`, `src/shell/menu.ts`, `src/shell/AppMenu.tsx`, `src/shell/Pane.tsx`, `src/shell/Icon.tsx`, `src/keymap/builtin.ts`, `src/keymap/keyboard.ts`·`keyboard.test.ts`, `src/keymap/engine.ts`, `src/editor/extensions.ts`·`extensions.test.ts`, `src/editor/file-view.ts`, `src/editor/ime.ts`·`ime.test.ts`(새), `src/syntax/catalog.ts`, `src/assets/codicons/search.svg`·`NOTICE.txt`(새), `src/licenses/codicons-0.0.46-24-CC-BY-4.0.txt`(새)
- 기록 커밋 `4555625`: `specs/v0.6/PROGRESS.md`(Phase 9 절), `specs/v0.6/verify/ORDER-09/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 메뉴 Edit → Paste: WebView2는 메뉴에서 클립보드를 읽지 못해(`execCommand('paste')` 거부) `navigator.clipboard.readText`로 대신하는데, 이것이 WebView 권한 창(클립보드 보기 허용/차단)을 띄운다(V3, 임시 WebView 폴더에서 확인, 누르지 않음). 키보드 `Ctrl+V`는 정상. 지금은 (2) 상태(core-leader). 선택지: (1) `tauri-plugin-clipboard-manager`(npm `@tauri-apps/plugin-clipboard-manager` + Rust crate, Tauri 공식, MIT/Apache-2.0) 추가, (2) 처음 메뉴 Paste 때 권한 창을 받아들임(허용하면 WebView 프로필에 남음), (3) 메뉴 Paste 비활성(I-17 기대 2와 어긋남). → 사용자
- workbench-kit은 띄우지 않았다(소스와 VS Code 기본 동작으로 비교). 실행 비교가 필요하면 → 사용자

## BLOCKED
- 원인: 찾기·바꾸기 창과 일치 선택(`Ctrl+D`·`Ctrl+Shift+L`·`Ctrl+K Ctrl+D`)은 CodeMirror 검색 모듈 없이 몇 줄로 만들 수 없다. 의존성 추가는 사용자 승인 사항이고, 직접 구현은 패키지를 고르면 버려질 코드라 하지 않았다(core-leader 2026-11-10, D-8).
- 필요한 것: `@codemirror/search@6.7.2` 추가 승인.
  - 라이선스 MIT, npm unpacked 137,655바이트.
  - 의존성: `crelt ^1.0.5`(이미 있음), `@codemirror/view ^6.37.0`(있음 6.43.15), `@codemirror/state ^6.0.0`(있음). 새 하위 패키지 없음.
  - 직접 만들 때 규모: TS 약 400~600줄 + 테스트(찾기 창 UI, 일치 강조, 대소문자·단어·정규식, 하나/모두 바꾸기와 한 번 취소, 일치 선택).
- 승인되면 할 일: 패키지 추가(lock 갱신, Licenses에 MIT 본문은 기존 `frontend-dependencies.txt`에 더함) → 찾기·바꾸기 창(편집 영역 오른쪽 위, workbench-kit 모양) → `Ctrl+F`·`Ctrl+H`·`F3`/`Shift+F3`·`Enter`/`Shift+Enter`·`Alt+C/W/R`·바꾸기 `Enter`/`Ctrl+Alt+Enter`·`Alt+Enter`·`Ctrl+D`·`Ctrl+Shift+L`·`Ctrl+K Ctrl+D` → Edit 메뉴 Find·Replace·Add Next Occurrence와 찾기 아이콘 활성(열기/닫기) → 찾기·바꾸기 로직 V1 테스트(모두 바꾸기 뒤 한 번 취소 포함) → V3(workbench-kit 비교 캡처, I-19 편집 영역 `Ctrl+F`).
