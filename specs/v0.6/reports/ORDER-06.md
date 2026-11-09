[DONE] ORDER-06 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-10 | 오른쪽 클릭하면 "Rename" 하나만, Zed 캡처와 자리·모양 비교 | 충족 | `specs/v0.6/verify/ORDER-06/first.json` menu ["Rename"], `first-menu.png` ↔ core `specs/v0.6/refs/I-10-zed.png`(C-10: 자리·모양 같음, 글자만 Rename). 사용자 Zed는 쓰지 않고 core 참고 캡처로 비교했다 |
| I-10 | Rename하면 바꾼 이름이 보이고 디스크 이름은 그대로, 다시 열어도 유지 | 충족 | apple → "Zebra"(`first.json` rename: list Zebra…, 디스크 `o6\apple` 있음·`o6\Zebra` 없음). 다시 열기 `reopen.json` list에 Zebra, state.json 폴더 항목 `"name":"Zebra"`, path는 `…\o6\apple` 그대로 |
| I-10 | 마우스를 올린 항목에만 x, 누르면 목록에서 빠지고 디스크 그대로 | 충족 | `first.json` hoverX ["Zebra:false","banana:false","cherry:true","date:false"], closeX list에서 cherry 빠짐, 디스크 `o6\cherry` 있음. `first-hover-x.png`, `first-after-close.png` |
| I-10 | 셋 이상에서 맨 아래를 맨 위로 끌면 순서가 바뀌고 다시 열어도 남음 | 충족 | 폴더 넷, date를 맨 위로: ["date","Zebra","banana","cherry"](`first.json` dragBottomToTop, `first-dragged.png`). 다시 열기 `reopen.json` 순서 date·Zebra·banana(cherry는 x로 뺀 뒤) |
| I-11 | 경계선을 끌면 Sidebar 너비가 바뀌고 Left Dock·편집 영역이 그만큼 밀림 | 충족 | `first.json` resize: Sidebar 300→379, Left Dock 300–540 → 379–619, 편집 영역 540 → 619 |
| I-11 | 다시 열어도 너비 유지 | 충족 | 첫 실행 마지막 너비 243 → `reopen.json` layout sidebar 243, state.json `sidebar.width` 243. 두 번째 다시 열기 `reopen-2.json` 246(직전 실행 마지막 값) |
| I-11 | 최소·최대 너비와 두 번 누르기가 Left Dock 경계선과 같다 | 충족 | 같은 `resizeHandle`(`src/shell/dock.ts`)과 CSS 최소 `dock.min_width` 6·최대 `calc(100% − 손잡이 폭)`(L-31) 공유. 두 번 누르기: Sidebar·Left Dock 모두 240(`project_panel.default_width`, L-32)(`reopen-2.json` resizeProbe). 두 번 누른 뒤 다시 끌기가 멈추던 문제(Left Dock도 같았음)를 K-08-R1로 고침: 240→299→358 |
| I-19 | 맨 위 입력란 자리·모양이 Zed 캡처와 같고 안내 글자 "Search" | 충족 | `first.json` searchBox placeholder "Search", 헤더 아래·목록 위(높이 32, 테두리 1, 모서리 6), `first-sidebar-initial.png` ↔ core `refs/I-19-zed.png`(C-10 같음). 값은 spec에 Sidebar 검색 전용 ID가 없어 Extensions 검색 X-46을 썼다 |
| I-19 | Sidebar 포커스에서 Ctrl+F → 입력란 | 충족 | `first.json` ctrlF_sidebar "Search folders"(입력란 aria-label) |
| I-19 | 편집 영역 Ctrl+F는 문서 안 찾기를 연다 | Phase 9에서 확인 | 문서 안 찾기(I-17)는 Phase 9. 이번에는 편집 영역 Ctrl+F가 Sidebar로 가지 않는 것만 확인: `reopen-2.json` ctrlF_editor 포커스 `cm-content` 그대로 |
| I-19 | 트리에 포커스를 두고 Ctrl+F → Sidebar 입력란으로 가지 않음 | 충족 | `first.json` ctrlF_tree 포커스 `project-panel` 그대로. 탭을 누른 뒤에도 그대로(`reopen-2.json` ctrlF_tabbar) |
| I-19 | 폴더 셋 이상에서 이름 일부 → 그 폴더만, Rename 이름으로도, 지우면 모두(V1 거르기 테스트) | 충족 | `first.json` filter: "ebr" → ["Zebra"](Rename 이름), "ana" → ["banana"], 지우면 넷 모두. V1 `src/workspace/workspace.test.ts`(대소문자 무시 부분 일치, 별칭 우선, 비우면 복원) |

## 검증
- coder K-08: typecheck, node 테스트 16(재배치, 표시 이름·path 유지, 거르기, state 왕복, 너비 복원, Ctrl+F 디스패치). K-08-R1: typecheck, workspace 테스트 8.
- checker C-10(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 212 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드 검토·V3 판정 PASS, 지적 없음.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe, 임시 APPDATA, 임시 WebView 데이터 폴더(`WEBVIEW2_USER_DATA_FOLDER`), One Light, 임시 폴더 apple·banana·cherry·date. SendInput으로 조작, CDP로 값 읽기. 첫 실행 1회, 다시 열기 2회(두 번째는 K-08-R1 뒤 끌기 재확인).
- 결과 파일: `specs/v0.6/verify/ORDER-06/` `first.json`, `reopen.json`, `reopen-2.json`, `first-sidebar-initial.png`, `first-menu.png`, `first-renamed.png`, `first-hover-x.png`, `first-dragged.png`, `first-resized.png`, `first-filter-cleared.png`, `first-after-close.png`, `reopen-sidebar.png`. (`first.json` ctrlF_editor 줄은 leader 스크립트가 파일을 못 찾아 무효이고 `reopen-2.json`에서 다시 쟀다. `reopen.json` resizeProbe는 K-08-R1 전 측정이다.)

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: Sidebar 메뉴 Move Up·Move Down·구분선·Remove와 인접 교환 move, Sidebar 전용 너비 스타일시트와 옛 200~800 너비 제한.
- 더한 것: Rename(인라인 입력은 트리 `tree-input`·IME 처리 재사용, state.json 폴더 항목 `name`), hover x(기존 `tab-close`·`removeFolder`), 끌어 순서(탭 끌기 방식 재사용), Sidebar 경계선(기존 `resizeHandle` 공유), Search 입력란과 `sidebar::Search`(Ctrl+F, Sidebar 컨텍스트만), 거르기 한 줄(`toLowerCase().includes` — I-5 맞추기는 Rust `name_search.rs`라 프런트에서 쓸 수 없음). 새 의존성·새 저장 위치 없음.
- 고친 것(카드 밖이지만 공통 함수): `resizeHandle` pointerdown 기본 동작 막기 — 두 번 누른 뒤 끌기가 멈추던 문제가 기존 Left Dock에도 있었다.
- 남은 위험: 너비 최대는 창 크기에 따라 CSS가 제한하므로 작은 창에서 큰 저장 너비는 보이는 너비만 줄어든다. Rename 입력의 한국어 IME 입력은 코드로만 확인했다.

## 바꾼 파일
- 코드 커밋 `dcda7c7`: `src/shell/Sidebar.tsx`, `src/shell/dock.ts`, `src/App.tsx`, `src/app.css`, `src/spec/metrics.ts`, `src/workspace/folders.ts`, `src/workspace/store.ts`, `src/workspace/state-file.ts`, `src/workspace/workspace.test.ts`, `src/keymap/keyboard.ts`, `src/keymap/keyboard.test.ts`
- 기록 커밋 `62e4f64`: `specs/v0.6/PROGRESS.md`(Phase 6 절), `specs/v0.6/verify/ORDER-06/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- Sidebar 검색 입력란 전용 spec 값이 `spec/zed-metrics.toml`에 없어 Extensions 검색(X-46) 값을 썼다. Zed Sidebar 값으로 spec에 넣을지 → core-leader
- 편집 영역 Ctrl+F가 문서 안 찾기를 여는지 → Phase 9(ORDER-09)에서 확인

## BLOCKED
- 없음
