[DONE] ORDER-11 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| U-1 | 결과 줄이 상대 경로이고 왼쪽 정렬(V3) | 충족 | `specs/v0.6/verify/ORDER-11/v3.json` searchA: `work-deep.ts \| sub\work-deep.ts`, `work-a.txt \| work-a.txt`, `.search-file-header` text-align left, `search-tab-a.png` |
| U-1 | Sidebar에서 폴더 A를 고르고 검색하면 A 밖 결과가 없다(V1, V3) | 충족 | V1 `src/workspace/workspace.test.ts`(선택 폴더·선택 없음·빈 목록). V3: A 선택 → A 결과 2개(`v3.json`), B 선택 → `work-b.txt` 하나(`v3-searchB.json`, `search-tab-b.png`) |
| U-1 | Search 탭 네 모서리가 둥글다(V3) | 충족 | `.project-search-tab` 네 모서리 6px = `--editor-search-input-corner-radius`(0.375rem, 같은 앱 찾기 입력 칸 반지름), `overflow: hidden`. `search-tab-a.png` |
| U-2 | A·B·C, B 활성 → 뒤로 A → 뒤로 C → 앞으로 A(V1, V3) | 충족 | V1 `src/workspace/nav-history.test.ts`. V3 `v3.json` tabsNav: 순서 x·y·z, y 활성 → Alt+Left x → Alt+Left z → Alt+Right x; 툴바 Go Back(x → z)·Go Forward(z → x)도 같다. 키맵·Go 메뉴 action 이름 그대로 |
| U-3 | 타이틀 바 줄 Sidebar 위 테두리 없는 입력란, Sidebar 맨 위 줄 비움(V3) | 충족 | `v3.json` sidebarIdle: 입력란 t6–b26(타이틀 바 t0–b32와 같은 줄), Sidebar 너비 안 l8–r191, border 0 none·outline none; 헤더 b33 바로 아래 첫 폴더 t33(별도 검색 줄 없음). `sidebar-idle.png` |
| U-3 | 글자를 넣으면 "x", 누르면 비워짐, `Ctrl+F` 표시(V3) | 충족 | 빈 값: "Ctrl+F"(기존 단축키 표시 `shortcutFor`·`menu-shortcut` 재사용, 구분자만 +), "work" 입력: Ctrl+F 숨고 x(Clear folder search)만, x 누름 → 값 "", 목록 2개 복원, 입력란 포커스. `sidebar-typed.png` |
| U-3 | 입력란 밖 타이틀 바 빈 자리 끌기·두 번 누르기 그대로(코드 확인 V1) | 충족 | `.sidebar-header`·`.title-bar` 모두 `data-tauri-drag-region` 유지(`v3.json` headerDrag·titleDrag true, C-16 코드 검토). 실제 끌기는 하지 않음 |
| U-4 | 폴더를 고른 뒤 편집 영역을 눌러도 선택 강조가 남는다(V3) | 충족 | `v3.json` selectionKept: 편집기 포커스 상태에서 `.sidebar-item.active` 배경 rgb(202,202,202) = `--ghost-element-selected`. `sidebar-selected-editor-focus.png` |
| U-4 | `work`를 넣으면 이름의 `work`만 색이 다르다(V3) | 충족 | `.sidebar-match` "work" rgb(92,120,226) = `--text-accent`, 나머지 글자 rgb(36,37,41). `sidebar-typed.png` |
| U-5 | 메뉴 줄·메뉴 항목 글꼴 크기 = 기본 UI 글꼴 크기(V1, V3) | 충족 | `.menu-name`·`.menu` → `--typography-ui-font-size`(`src/app.css`), V3 menuName 16px·menuItem 16px·변수 16px. `menu-file.png` |

## 카드가 보고하라고 한 것
- U-1 선택된 폴더가 없을 때(또는 선택이 잘못됐을 때): **첫 폴더**만 찾는다. 폴더가 하나도 없으면 빈 범위.
- U-3 "x"·`Ctrl+F`: 빈 값일 때 `Ctrl+F`만, 글자가 있으면 "x"만 보인다(둘을 함께 보이지 않음).
- U-3 "맨 위 줄은 비운다": 검색란이 있던 별도 줄을 없앴다. 빈 높이를 남기라는 말이 없고, 참고 그림에서도 목록이 타이틀 바 줄 바로 아래부터 시작한다.

## 검증
- coder K-14: typecheck, 관련 node 테스트 38(범위 걸러내기, 위치 이동·끝 돌기, 일치 글자 나누기, 기존 탭·키맵·메뉴).
- checker C-16(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 225 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 첫 `cargo test` 실행에서 `folder_watch::tests::missing_root_is_watched_after_creation_and_recreation`이 5초 이벤트 대기 시간 초과로 1건 실패했고, 바로 다시 실행해 21 통과(이번 변경과 무관한 시간 의존 테스트, Rust 코드 변경 없음). 코드 검토 지적 없음, V3 판정 U-1~U-5 PASS.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe, 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 1440×852, 폴더 둘(workbench-a: work-a.txt·sub/work-deep.ts·x/y/z.ts, other-b: work-b.txt). SendInput, CDP. 시스템 클립보드는 건드리지 않았다.
- 결과 파일: `specs/v0.6/verify/ORDER-11/` `v3.json`, `v3-searchB.json`, `sidebar-idle.png`, `sidebar-typed.png`, `sidebar-selected-editor-focus.png`, `search-tab-a.png`, `search-tab-b.png`, `menu-file.png`. `v3.json`의 searchB 줄은 leader 스크립트 오류(B를 고르면 B 작업 영역으로 바뀌어 A의 Search 탭이 없음)로 무효이고 `v3-searchB.json`이 대신한다.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: 탭 연 순서 기록(NavHistory 스택·최대 길이·모드와 Pane의 기록 상태), Sidebar 본문의 검색 줄, 입력란 테두리, 쓰지 않게 된 metrics `menu.item.font_size`·`menu.horizontal.item_font_size`.
- 더한 것: 검색 범위 고르기(`searchRoots`), 폴더 이름 일치 글자 나누기(`folderNameParts`), 검색란 x 버튼·`Ctrl+F` 표시. 새 의존성 없음, Rust 변경 없음, spec/ 수정 없음.
- 하지 않은 것: 참고 그림의 묶음 머리 줄·하위 항목(두 단계 구조)(카드대로 폴더 한 단계 유지).
- 남은 위험: 입력란 밖 타이틀 바 끌기·두 번 눌러 최대화는 코드로만 확인했다. Search 탭은 활성 탭 바로 오른쪽에 열린다(기존 openTool 동작).

## 바꾼 파일
- 코드 커밋 `707edcd`: `src/App.tsx`, `src/app.css`, `src/search/Search.tsx`, `src/search/search.css`, `src/shell/Pane.tsx`, `src/shell/Sidebar.tsx`, `src/spec/metrics.ts`, `src/workspace/context.ts`, `src/workspace/folders.ts`, `src/workspace/nav-history.ts`·`nav-history.test.ts`, `src/workspace/workspace.test.ts`
- 기록 커밋 `34feb52`: `specs/v0.6/PROGRESS.md`("사용자 요청 작업" 절 ORDER-11 소절), `specs/v0.6/verify/ORDER-11/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- I-12 판정 방법("A·B·C 차례로 연 뒤 뒤로 → B")이 이번 U-2로 바뀌었다. core ITEMS 문구를 고칠지 → core-leader
- 그 밖의 v0.6 미정은 `reports/ORDER-10.md` 미정 절 그대로(ORDER-09 `@codemirror/search` 줄은 ORDER-09-R1에서 풀림).

## BLOCKED
- 없음
