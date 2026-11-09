[DONE] ORDER-05 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-9 | 파일·미리보기·그 밖의 탭 메뉴를 Zed와 캡처로 비교해 항목·순서·구분선·단축키가 같다 | 미충족 아님 — 사용자 확인 대기(Zed 비교 캡처는 사용자가 Zed를 닫은 뒤) | core-leader 2026-11-10 답대로 문서 기준으로 구현하고 tauri 캡처만 남겼다. tauri 메뉴는 승인 목록과 같다: `specs/v0.6/verify/ORDER-05/single.json` menu_md_file·menu_py_file·menu_preview·menu_tool, `single-menu-*.png`. 근거 문서: 미리보기 탭 core `specs/v0.6/refs/I-9-zed.png`(Zed 1.27), 파일 탭 경로 묶음 `docs/refs/01-zed/02-INTERACTION.md:975-1033`(I-663 표 I-570~I-587) |
| I-9 | 항목마다 눌렀을 때 Zed와 같은 탭이 닫히거나 바뀐다 | 충족(문서 기준) | 메뉴로 Close Others(`single.json` closeOthersMenu: 4개 → main.ts만), Show Source(미리보기 닫고 notes.md 활성), Make Tab Read-Only(입력 막힘, 라벨 Make Tab Editable로 전환, `probe.json`), Copy Relative Path(붙여넣기 "app.py"), Reveal In Project Panel(트리에서 main.ts 선택). 동작은 I-570~I-587 표와 같다(C-09 코드 검토: Close는 핀도 닫고 나머지 닫기는 핀을 남김, 수정 탭은 저장 확인) |
| I-9 | 단축키도 같게 동작한다 | 충족 | 실제 SendInput(`chords.json`): Ctrl-K T(Close Right: 3 → notes.md), Ctrl-K E(Close Left: 3 → main.ts), Ctrl-Alt-Shift-T(Close Others), Ctrl-K U(Close Clean: 깨끗한 탭 모두 닫힘), Ctrl-K Shift-Enter(Pin), Ctrl-K W(Close All, 핀 탭 main.ts 남음), Ctrl-Shift-E(Reveal In Project Panel), Ctrl-K Ctrl-T(테마 선택 창, 기존) |
| I-12 | A·B·C 선택 뒤 뒤로 B, 뒤로 A, 앞으로 B (V3, V1 테스트) | 충족 | `single.json` nav: start main.ts → back1 app.py → back2 notes.md → fwd1 app.py. V1 `src/workspace/nav-history.test.ts` 5 통과 |
| I-12 | 문서 안 커서를 크게 옮긴 뒤 뒤로를 눌러도 이전 탭으로 | 충족 | main.ts에서 Ctrl+End 뒤 Alt+Left → app.py(같은 문서 안 이동 없음, `single.json` nav.back1). 문서 안 위치 기록 코드 삭제(NavEntry·isFarJump·MIN_NAVIGATION_HISTORY_ROW_DELTA 등, K-06) |
| I-12 | 닫힌 탭은 건너뛴다 | 충족 | app.py를 닫은 뒤 main.ts에서 뒤로 → notes.md(`single.json` nav.backSkipsClosed) |
| I-12 | 이 PC Zed 탐색 기록 동작 확인 | 미충족 아님 — 사용자 확인 대기 | 아래 미정 |
| I-16 | 마크다운·파이썬·그 밖의 코드 파일에서 커서를 제목·클래스·함수 안에 두어도 상대 경로만, `›` 뒤 없음 | 충족 | 폴더 하나 `single.json`: notes.md(## Section A 안)·app.py(def bar 안)·main.ts → `notes.md`·`app.py`·`main.ts`. 캡처 `single-crumb-*.png` |
| I-16 | 폴더 하나·여럿 모두, 드라이브 문자 없음 | 충족 | 폴더 둘 `multi.json`: `notes.md`·`app.py`·`main.ts`·`sub\lib.rs`·`other.md`(두 번째 폴더). 드라이브 문자·루트 이름 접두사 없음. 캡처 `multi-crumb-*.png` |

## 탭 종류별 메뉴 (tauri, 문서 기준)
- 미리보기 탭: Close / Close Others / ─ / Close Left / Close Right / ─ / Close Clean / Close All / ─ / Make Tab Read-Only / ─ / Pin Tab / ─ / Show Source (`I-9-zed.png` 그대로)
- 파일 탭: 위 다섯 묶음(Close … Pin Tab) / ─ / Copy Path · Copy Relative Path / ─ / Reveal in File Explorer · Reveal In Project Panel / (마크다운 편집 탭만) ─ / Open Markdown Preview (`02-INTERACTION.md` I-663)
- 그 밖의 탭(Search·Extensions·Keymap Editor 등): 닫기 세 묶음 / ─ / Pin Tab (core-leader 답)
- 이 PC Zed에서 탭 종류별로 실제로 어떻게 다른지는 확인하지 못했다(미정).

## 검증
- coder K-06(typecheck, node 테스트 31), K-07(typecheck, node 테스트 28+2), K-07-R1(실제 modifier 순서 회귀 테스트, node 테스트 19).
- checker C-09(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 210 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드 검토·V3 판정 PASS, 지적 없음.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]` 두 차례): debug exe, 임시 APPDATA, One Light, 임시 폴더. SendInput으로 조작하고 CDP로 값을 읽었다.
- 결과 파일: `specs/v0.6/verify/ORDER-05/` `single.json`, `multi.json`, `probe.json`, `chords.json`, `single-crumb-*.png`, `multi-crumb-*.png`, `single-menu-*.png`. (`single.json`의 readOnly·copyRelative 줄과 `probe.json`의 ctrlK 줄은 leader 스크립트 오류로 무효이고, 같은 항목을 `probe.json`·`chords.json`에서 다시 쟀다.)

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: 문서 안 위치 탐색 기록(NavEntry·NavMode·isFarJump·MIN_NAVIGATION_HISTORY_ROW_DELTA·placeOf·jumped·noHistory·닫힌 탭 다시 열기), 경로 줄 제목·심볼 계층(`src/editor/headings.ts`·테스트, `src/syntax/outline.test.ts`, markdownCrumbs·elideCrumbs·symbolsAtCursor·SyntaxDocument.symbols·outline 쿼리 로딩, `›` CSS).
- 남긴 것: 커서 위치 훅(상태 표시·Go to Line·마크다운 편집↔미리보기 위치 연계가 씀), 구문 강조 파싱, grammar 자산의 outline 쿼리 컴파일 검증 테스트(앱은 로딩하지 않음).
- 더한 것: `src/shell/tab-menu.ts`(탭 종류별 메뉴·닫기 대상 계산)와 테스트, 탭 단위 Make Tab Read-Only/Editable, Pane 단축키(Ctrl-K E/T/U/W/P/R, Ctrl-Alt-Shift-T, Ctrl-Shift-E, Ctrl-Shift-V). 새 의존성·capability 없음(Reveal in File Explorer는 기존 opener `revealItemInDir` 권한 사용).
- 하지 않은 것: Go to Line 이동 기록(후보 C-7), 경로 줄 자리·탭 바 모양 변경.
- 남은 위험: Reveal in File Explorer와 Copy Path(절대 경로)는 탐색기 창·클립보드를 쓰므로 화면으로 누르지 않고 코드로 확인했다. 여러 수정 탭 닫기는 탭마다 저장 확인을 차례로 묻는다.

## 바꾼 파일
- 코드 커밋 `39d639e`: `src/shell/tab-menu.ts`(새)·`tab-menu.test.ts`(새), `src/shell/Pane.tsx`, `src/shell/AppMenu.tsx`, `src/shell/menu.ts`, `src/workspace/tabs.ts`·`tabs.test.ts`, `src/workspace/context.ts`, `src/workspace/nav-history.ts`·`nav-history.test.ts`, `src/keymap/keyboard.ts`·`keyboard.test.ts`, `src/editor/extensions.ts`·`extensions.test.ts`, `src/editor/file-view.ts`, `src/editor/breadcrumbs.ts`·`breadcrumbs.test.ts`, `src/editor/headings.ts`·`headings.test.ts`(지움), `src/syntax/assets.ts`, `src/syntax/document.ts`, `src/syntax/highlight.ts`, `src/syntax/outline.test.ts`(지움), `src/app.css`
- 기록 커밋 `5498979`: `specs/v0.6/PROGRESS.md`(Phase 5 절), `specs/v0.6/verify/ORDER-05/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- I-9 Zed 비교 캡처(파일 탭·미리보기 탭·그 밖의 탭)와 탭 종류별 메뉴 차이, I-12 이 PC Zed 탐색 기록 동작 확인: 이 PC Zed(1.27, PID 13116)가 사용자 것으로 떠 있고 `--user-data-dir`를 줘도 떠 있는 인스턴스로 넘어가 따로 띄울 수 없다. 사용자 Zed는 쓰지 않았다(core-leader 답). → 사용자(Zed를 닫은 뒤 비교 캡처)
- 사용자 Zed 최근 작업 영역 기록의 'o5'(임시 폴더): Zed CLI 시도 중 사용자 Zed에 'o5' 폴더 창이 한 번, 빈 창이 한 번 열렸고 leader가 그 두 창만 닫았다. 기록은 고치지 않았다. → 사용자
- ORDER-02 보고의 남은 위험 "SendInput `ctrl+k ctrl+t`로 테마 선택 창이 열리지 않음"은 앱 결함이 아니라 leader 스크립트가 `tools/win-input.ps1 -Keys`에 키를 여러 인자로 넘긴 탓이었다(K-07-R1에서 확인, 이번 재측정에서 Ctrl-K Ctrl-T 동작). → 기록만(조치 없음)
- V3 중 WebView 클립보드 읽기 권한 창이 한 번 떴다(leader 스크립트의 `navigator.clipboard.readText`). 허용·차단을 누르지 않았고 거부로 끝났다. WebView 데이터 폴더(`%LOCALAPPDATA%\dev.workbench.tauri`, 사용자 앱과 같은 폴더)에 그 결정이 남았는지는 확인하지 않았다. → core-leader

## BLOCKED
- 없음(Zed 확인은 [BLOCKED] 뒤 core-leader 답으로 미정 처리)
