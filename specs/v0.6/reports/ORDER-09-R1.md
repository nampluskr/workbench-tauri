[DONE] ORDER-09-R1 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-17 | 표의 기능마다 단축키로 실행해 workbench-kit(또는 VS Code)과 같은 결과 | 충족 | `specs/v0.6/verify/ORDER-09-R1/v3.json`(main.ts `const foo = 1; / let Foo = foo + foobar; / foo(foo);`): Ctrl+F → 입력 "foo" "5 of 6"; Enter "6 of 6", Shift+Enter "5 of 6", F3 "6 of 6", Shift+F3 "5 of 6"; Alt+C 켬 → "4 of 5"(Foo 빠짐), Alt+W 켬 → "4 of 5"(foobar 빠짐), Alt+R 토글 후 원복; Alt+Enter → 일치 6개 모두 선택·창 닫힘·편집기 포커스; Ctrl+H → 바꾸기 줄. `v3-2.json`: 바꾸기 Enter → 첫 foo만 bar, "1 of 5"; Ctrl+D 1→2→3 선택; Ctrl+K Ctrl+D → 3개 유지·마지막 선택을 다음 일치로; Ctrl+Shift+L → 단어·대소문자 일치 foo 5개. VS Code 기본 동작과 같다(Ctrl+D/Ctrl+K Ctrl+D는 대소문자·단어 일치, 비교 앱은 띄우지 않음 → 미정) |
| I-17 | 모두 바꾸기 뒤 `Ctrl+Z` 한 번으로 모두 되돌아간다 | 충족 | `v3.json` replace: Ctrl+Alt+Enter → `const bar … bar(bar);`, Esc 뒤 Ctrl+Z 한 번 → 원본(afterOneUndo). V1 `src/editor/search.test.ts`(정규식 전체 치환 후 undo 한 번) |
| I-17 | Edit 메뉴 항목마다 메뉴로 실행해 같은 결과 | 충족 | `v3.json` menu: Find `Ctrl+F`·Replace `Ctrl+H`·Add Next Occurrence `Ctrl+D` 활성. Find → 찾기 창(포커스 Find, 바꾸기 줄 숨김), Replace → 바꾸기 줄 보임, `v3-2.json` menuAddNext 1→2 선택(Ctrl+D와 같음). 나머지 Edit 항목은 ORDER-09 그대로, Paste는 아래 미정 |
| I-17 | 찾기 창 자리·모양을 workbench-kit 캡처와 비교 | 충족(workbench-kit 캡처 없음, 미정) | 편집 영역 오른쪽 위 겹침 창: panelRect l950 t111 r1431 b155 / editorRect l440 t110 r1440 b821(`v3.json`), `find-panel.png`, `replace-panel.png`, `find-panel-md.png`. 순서: Toggle Replace(>)·찾기 입력·Aa·ab·.*·일치 수·↑·↓·×, 바꾸기 줄 입력·Replace·All. workbench-kit은 Monaco 기본 찾기 위젯(`src/core/texteditor.ts`, 재배치 설정 없음)이라 소스 기준으로 같은 자리·구성 |
| I-17 | 경로 줄 미리보기 아이콘 오른쪽 codicon `search` 아이콘, 누르면 열림, 다시 누르면 닫힘 | 충족 | 자리는 ORDER-09 `icon-md.png` 그대로. `v3.json` icon: disabled false, 첫 클릭 → 창 열림(`icon-open.png`), 두 번째 → 닫힘. 툴팁 "Find in Explorer"는 바꾸지 않음 |
| I-17 | 겹친 단축키가 편집 영역에서 VS Code 동작 | 충족 | 아래 "겹치는 단축키" 표(ORDER-09 표의 BLOCKED 줄을 바꿈). 기존 앱 바인딩을 없앤 키는 없다. C-15 키맵 검토 지적 없음 |
| I-19 | 편집 영역 `Ctrl+F` → 문서 안 찾기, Sidebar 포커스 `Ctrl+F` → Sidebar 입력란 | 충족 | `v3.json` ctrlF: 창 열림·포커스 Find; sidebarCtrlF: 트리 행에서 Ctrl+F → 포커스 Sidebar(project-panel), 편집기 찾기 창 안 열림 |

### 겹치는 단축키 (ORDER-09 표의 BLOCKED 줄 갱신)
| 키 | 편집 영역·찾기 창의 동작 | 원래 동작 |
|---|---|---|
| Ctrl+F | 찾기 창(editor::Find) | Sidebar에서는 sidebar::Search 그대로 |
| Ctrl+H | 찾기 창 + 바꾸기 줄(editor::Replace) | 없음 |
| F3 / Shift+F3 | 다음 / 이전 일치 | 브라우저 기본 찾기는 계속 막힘 |
| Enter / Shift+Enter (찾기 입력) | 다음 / 이전 일치 | 다른 입력란의 Enter는 그대로 |
| Alt+C / Alt+W / Alt+R (창 안) | 대소문자 / 단어 / 정규식 토글 | 없음 |
| Enter / Ctrl+Alt+Enter (바꾸기 입력) | 하나 바꾸기 / 모두 바꾸기 | 없음 |
| Alt+Enter (창 안) | 일치 모두 선택, 창 닫고 편집기로 | 없음 |
| Ctrl+D | 다음 일치 추가(빈 선택이면 단어 선택) | 없음 |
| Ctrl+Shift+L | 선택과 같은 것 모두 선택 | 없음 |
| Ctrl+K Ctrl+D | 마지막 선택을 빼고 다음 일치 추가 | 다른 Ctrl+K chord 그대로 |
| Esc | 창이 있으면 닫기, 없으면 기존 선택 줄이기 | 메뉴 닫기 그대로 |

## 검증
- coder K-13(구현), K-13-R1(아래 수정): typecheck, 관련 node 테스트(search 4·keyboard 8·app-menus 5·extensions 4·ime 1).
- leader V3 첫 실행에서 찾은 버그: 찾기 입력란에 "foo"를 치면 "o"(글자마다 입력란 전체가 선택됨). 원인은 @codemirror/search `findNext`가 끝에 찾기 입력란을 전체 선택하는 것. K-13-R1이 입력 중 자동 탐색 앞뒤로 입력란 선택 범위를 보관·복원하고, 이 실패를 잡는 테스트를 더했다(수정 전 실패 확인). 재빌드 뒤 V3 다시 측정.
- checker C-15(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 227 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드 검토 지적 없음, V3 판정 15항목 PASS.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`, 버그 수정 때문에 두 번 받음): debug exe, 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 1440×852, 임시 폴더(main.ts·notes.md). SendInput, CDP. 시스템 클립보드는 건드리지 않았다.
- 결과 파일: `specs/v0.6/verify/ORDER-09-R1/` `v3.json`, `v3-2.json`, `find-panel.png`, `find-panel-md.png`, `replace-panel.png`, `icon-open.png`, `ctrl-d.png`. `v3.json`의 ctrlD·menu.addNext 줄은 leader 스크립트가 커서를 단어 밖에 둬서 무효이고 `v3-2.json`이 대신한다. 첫 실행(버그 있는 빌드)의 결과는 덮어썼다.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 더한 것: `@codemirror/search` 6.7.2(사용자 승인, MIT, package.json 1줄·lock 그 패키지 블록 12줄, 하위 의존성 새로 없음), Licenses 본문, 찾기·바꾸기 창(`src/editor/search.ts`), 위 단축키, Edit 메뉴 세 항목·찾기 아이콘 활성. 수치는 spec E-062/E-063/E-065/E-066/E-067과 기존 toolbar·button 변수(spec/ 수정 없음).
- 하지 않은 것: 찾기 아이콘 툴팁 문구·메뉴 Paste 동작 변경(사용자 미정), 다른 의존성.
- 남은 위험: 한글 IME로 찾기 입력란에 치는 것과 작은 Pane에서 창이 좁아질 때 모양은 V3로 재지 않았다. 바꾸기 줄 Enter는 커서가 일치 위에 없으면 먼저 다음 일치로 옮긴다(CodeMirror·VS Code 같은 방식, `v3.json` replace 첫 Enter).

## 바꾼 파일
- 코드 커밋 `bf05328`: `package.json`, `package-lock.json`, `src/licenses/frontend-dependencies.txt`, `src/editor/search.ts`(새), `src/editor/search.test.ts`(새), `src/editor/extensions.ts`, `src/keymap/builtin.ts`, `src/keymap/keyboard.ts`·`keyboard.test.ts`, `src/shell/Pane.tsx`, `src/shell/app-menus.ts`·`app-menus.test.ts`, `src/spec/metrics.ts`, `src/app.css`
- 기록 커밋 `0108da7`: `specs/v0.6/PROGRESS.md`(Phase 9 절 ORDER-09-R1 소절, BLOCKED 문장에 "ORDER-09-R1에서 풀림"), `specs/v0.6/verify/ORDER-09-R1/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- workbench-kit을 띄워 비교 캡처를 남기지 않았다. `--smoke-test`는 띄운 직후 끝나고, 사용자 데이터 폴더를 따로 줄 수 있는지 확실하지 않아 사용자 설정에 쓸 위험이 있었다. 소스(Monaco 기본 찾기 위젯)와 VS Code 기본 동작으로 비교했다. → 사용자
- 찾기 아이콘 툴팁 문구("Find in Explorer", workbench-kit 문구)는 카드대로 바꾸지 않았다(사용자 결정 대기). 메뉴 Paste 권한 창은 `reports/ORDER-10.md` 미정 목록의 세 선택지 그대로. → 사용자
- 그 밖의 v0.6 미정은 `reports/ORDER-10.md` 미정 절 그대로이고, 그중 "ORDER-09 BLOCKED — @codemirror/search 승인" 줄은 이 카드로 풀렸다.

## BLOCKED
- 없음
