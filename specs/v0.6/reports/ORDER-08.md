[DONE] ORDER-08 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-14 | `≡`을 누르면 메뉴 줄 맨 앞이 File이고 workbench-tauri가 없다 | 충족 | `specs/v0.6/verify/ORDER-08/nofolder.json`·`folder.json` menuBar.names ["File","Edit","View","Go","Window","Help"], `folder-menu-file.png` |
| I-14 | File 메뉴 맨 아래 "Quit", 단축키 표시 `Ctrl-Q` | 충족 | menuBar.file 마지막 "Quit Ctrl-Q"(앞에 구분선, File의 기존 묶음 방식) |
| I-14 | 메뉴나 `Ctrl-Q`로 앱이 끝나고, 저장하지 않은 문서가 있으면 묻는다 | 충족 | `quit.json`: app.py 편집 뒤 Ctrl-Q → "Warning" 저장 확인 창(`folder-quit-ask-screen.png`, 창 영역만 자름), Esc(취소) 뒤 앱 살아 있음, 편집을 되돌린 뒤 File → Quit → 앱 종료(aliveAfterQuit false). 동작은 기존 `zed::Quit`(저장 확인 흐름) 그대로 |
| I-14 | 나머지 메뉴의 순서와 항목은 v0.5와 같다 | 충족 | 앱 이름 메뉴만 지우고 File에 Quit만 더함(`src/shell/app-menus.ts`, 테스트 `app-menus.test.ts`). C-12 코드 검토 같음 |
| I-15 | 폴더를 열었을 때와 열지 않았을 때 모두 왼쪽에 `≡`만 | 충족 | `nofolder-titlebar.png`, `folder-titlebar.png`(화면에 ≡만). JSON의 `.title-left` 글자 "workbench-tauri"는 닫힌 About `<dialog>`가 DOM에 있어서이고 화면에는 보이지 않는다 |
| I-15 | `≡`을 누르면 I-14 메뉴 줄, 나머지(오른쪽 "v" 메뉴, 창 버튼)는 v0.5와 같다 | 충족 | menuBar(위), titleRight ["Open Application Menu","User menu","Minimize","Maximize","Close"]. 창 끌기 영역(`data-tauri-drag-region`) 유지 |
| I-20 | View Dependency Licenses → 대화 상자 없이 "Licenses" 탭, 내용은 v0.5와 같다 | 충족 | `folder.json` licenses: dialogOpen false, 탭 ["Licenses"] 활성, 본문이 ORDER-03 캡처와 같음(sameAsOrder03 true, 276,249자), `folder-licenses-tab.png`, `licenses-text.txt`. v0.5와 다른 점은 v0.6 변경: Phase 2에서 regex 라이선스 두 개(`regex-1.13.1-Apache-2.0.txt`, `regex-1.13.1-MIT.txt`) 삭제, Phase 3에서 `frontend-dependencies.txt` 추가 |
| I-20 | 탭을 닫을 수 있고, 연 채로 다른 탭으로 옮겨 다닐 수 있다 | 충족 | app.py 열기 → 활성 app.py, Licenses 누르면 다시 Licenses; 가운데 클릭으로 닫힘(afterClose ["app.py"]), 다시 열림(reopenAfterClose) |
| I-20 | 한 번 더 누르면 새 탭이 생기지 않고 열린 탭이 선택된다 | 충족 | reopen: 탭 ["Licenses","app.py"] 그대로, 활성 Licenses |

## 검증
- coder K-10: typecheck, node 테스트 22(메뉴·탭).
- checker C-12(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 215 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드·문서 검토·V3 판정 PASS, 지적 없음.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light. SendInput, CDP. 세션: 폴더 없음 1, 폴더 있음 1, Quit 다시 재기 1(leader 스크립트가 저장 확인 창을 이름으로 못 찾아 첫 시도 무효).
- 결과 파일: `specs/v0.6/verify/ORDER-08/` `nofolder.json`, `folder.json`, `quit.json`, `licenses-text.txt`, `nofolder-titlebar.png`, `nofolder-menu-file.png`, `folder-titlebar.png`, `folder-menu-file.png`, `folder-licenses-tab.png`, `folder-quit-ask-screen.png`, `quit-titlebar.png`, `quit-menu-file.png`. (`folder.json`의 quitDirtyAsk·quitMenu 줄은 무효.)

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: 앱 이름 메뉴(`Quit workbench-tauri`), 타이틀 바 폴더 이름(ProjectName·`PROJECT_NAME_MAX_CHARS`·appMenuExpanded·project-name CSS), Licenses 대화 상자(`<dialog>`·showModal·제목·Close 버튼·전용 포커스 복원·notices signal·dialog CSS).
- 더한 것: File → Quit 한 줄(기존 `zed::Quit`·Ctrl-Q), Licenses를 `openTool` 탭으로 여는 몇 줄. 새 의존성 없음.
- 함께 고친 문서: `docs/refs/01-zed/01-LAYOUT.md` L-51 "제외 (결정 목록에 없음)" → "**포함** (core v0.6 I-13, D-9)", L-127 우리 값 "… / 제외 (L-51)" → "… / true (L-51)"(writer W-11, core-leader 2026-11-10 지시, 같은 코드 커밋 `bf5a51d`). 편집기 sticky scroll(E-024)은 편집기 것이라 그대로.
- 하지 않은 것: 탭 오른쪽 클릭 메뉴 변경(Licenses 탭에 "그 밖의 탭" 메뉴가 그대로 걸림).
- 남은 위험: 폴더 이름이 빠진 자리의 창 끌기·두 번 눌러 최대화는 코드(drag region 유지)로만 확인했다.

## 바꾼 파일
- 코드·문서 커밋 `bf5a51d`: `src/shell/app-menus.ts`, `src/shell/app-menus.test.ts`, `src/shell/TitleBar.tsx`, `src/shell/AppMenu.tsx`, `src/app.css`, `src/spec/metrics.ts`, `docs/refs/01-zed/01-LAYOUT.md`
- 기록 커밋 `ffd51ae`: `specs/v0.6/PROGRESS.md`(Phase 7 끝 W-11 줄, Phase 8 절), `specs/v0.6/verify/ORDER-08/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 없음

## BLOCKED
- 없음
