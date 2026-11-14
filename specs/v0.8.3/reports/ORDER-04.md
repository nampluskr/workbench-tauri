[DONE] ORDER-04 tauri

## 완료 기준
| # | 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|---|
| 1 | I-6 정렬 | 보이는 이름 기준 오름·내림, 저장, 끌기·새 폴더 뒤, 고른 표시(단위 테스트), 아이콘 C안 SVG | 충족 (네 상태 화면은 Phase 5에서 잼) | 순수 함수 `src/workspace/folders.ts:66-80` `sortFolders`·`isSorted`(이름 `folderLabel` — Rename 이름 우선, 비교 `naturalCmp`). 한 번 정렬 + 저장 `src/workspace/store.ts:255-259` `sortFolderList`(상태 파일 `folders` 순서, 고른 정렬은 저장 안 함). 눌린 칸 `toggled={isSorted(folders(), …)}` 매번 계산(`src/App.tsx:46-48`). 아이콘 `src/shell/Icon.tsx:27-32`(시안 statusbar 03절 C안 path 둘, 선 굵기 1.2). 눌린 칸 모양은 상태 표시줄 규칙을 `:is(.status-bar, .sidebar-footer)`로 넓힘(`src/app.css:310-323`, 값 그대로). 테스트 `src/workspace/workspace.test.ts:152`(Rename 이름, 대소문자, `v2`<`v10`, 한글·영문 — Tree `sortChildren`과 같은 결과, 끌기·새 폴더 뒤 판정) |
| 2 | I-7 메뉴 | 두 메뉴의 줄·구분선·흐림·체크, 여러 폴더 닫기의 확인·취소(단위 테스트), 추가 순 `added_at` | 충족 (메뉴 화면은 Phase 5에서 잼) | 폴더 줄 `src/shell/Sidebar.tsx:25-37`(Close / Close Others — 폴더 1개면 흐림 / Close All / ─ / Rename / ─ / Copy Path / Reveal in File Explorer), 빈 곳 `:39-52`(Open Folder... / Close All / ─ / 이름 정렬 둘 / ─ / 추가 순 둘, `checked: isSorted`). 모든 줄에 `action`이 없어 키 표시 없음. `removeFolder`가 닫았는지 돌려주고(`store.ts:198`), `closeFolders` → `closeEach`(`src/workspace/closing.ts:53-56`)가 목록 순서로 하나씩 닫다 첫 취소에서 멈춤. 테스트 `src/workspace/closing.test.ts:108`. 추가 순은 `added_at`(ISO 글자 비교, `folders.ts:68`) — #1 테스트에 포함 |
| 3 | I-16 제목 줄 | 세 제목 줄 글자·아이콘, Tree 폴더 이름·"Tree", × = 닫기·다른 곳 = 포커스, 툴팁 없음 | 충족 (화면은 Phase 5에서 잼) | 공통 부품 `src/shell/SidebarTitle.tsx`(Outline 제목 줄을 옮김, 클래스 `.outline-header` 그대로). Folder 검색 칸 아래 "Folder" `threads_sidebar_left_open`(`Sidebar.tsx:142`), Tree "Tree · 폴더 이름"/"Tree" `file_tree`(`src/shell/ProjectPanel.tsx:22-23`), Outline 그대로 `list_tree`(`src/shell/Outline.tsx:269`). 올림: 배경 `ghost-element-hover`(= `.tree-row:hover`), 글자 `--text`, × 보임(`app.css:716-719`, 평소 `visibility: hidden`, `tooltip()` 없음). × = `toggleSidebar`/`toggleDock`/`toggleOutline`(버튼·키와 같은 함수). 다른 곳 = `focusSidebar` / `focusPanel`(`project_panel::ToggleFocus`의 포커스 쪽을 뺌, `src/shell/panels.ts:51-62`) / Outline `list.focus()`. 접기·펼치기 없음 |
| 4 | I-17 배치 | 고른 쪽 저장·읽기와 알 수 없는 키 보존(단위 테스트), 요소 순서·체크·열림·너비·손잡이·너비 제한, Custom·너비 되돌리기 없음, 확인 요청 | 충족 (Right 창은 Phase 5에서 잼) | 메뉴 `src/shell/app-menus.ts:66-70` "Left Sidebars"/"Right Sidebars" 체크, Custom 줄·너비 되돌리기(`src/shell/layout.ts` 지움, `resetDockWidth`·`isClassicLayout` 남은 곳 없음). 상태 파일 `windows[0].panel_layout`(`src/workspace/state-file.ts:61,80`, `"right"` 아니면 Left). 테스트 `workspace.test.ts:174`. 배치는 CSS `order`(`App.tsx:56` `sidebars-right`, `app.css:361-367`): 탭·문서 │ Outline │ Tree, Folder Sidebar는 `.workspace` 밖이라 왼쪽 끝. Right의 경계선 `border-left`·손잡이 왼쪽 가장자리(`app.css:366-367`)·끌 때 너비는 오른쪽 끝 기준(`src/shell/dock.ts:28-30`). 너비 제한(`app.css:350-351`)은 쪽과 무관한 식이고 DOM 순서가 그대로라 선택자도 맞음. 열림·닫힘·너비 상태는 건드리지 않음. 상태 표시줄 손대지 않음. `app-menus.test.ts:68` 새 값 |
| 5 | 회귀 | 닿는 테스트·typecheck, 끌어 옮기기·Rename·검색 그대로, 보안 diff | 충족 | `node --test src/workspace/workspace.test.ts src/workspace/closing.test.ts src/shell/app-menus.test.ts src/workspace/recent.test.ts src/workspace/tree.test.ts src/shell/menu.test.ts` → 46 pass 0 fail, `npm.cmd run typecheck` 0(`%TEMP%\v083-K-04-tests.txt`). 끌기(`moveFolder`)·Rename·검색 코드 diff 없음, `removeFolder`의 다른 호출부(Tree 루트 "Close Folder", 키 `project_panel::RemoveFromProject`)는 반환값을 쓰지 않아 그대로(checker 확인). `git diff d8f9438 --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` → ORDER-01의 버전 한 줄뿐, 이 카드 `src-tauri` diff 없음 |

## 검증
- 위 #5 명령. checker 코드 리뷰 C-04 PASS(layout.ts 잔여 참조 없음, `removeFolder` 호출부, 옛 ID 호환, 제목 줄 mousedown·click 흐름, `.dock-left` 세로 flex의 스크롤·끌기·Rename 영향 없음). 테스트 재실행 없음.
- 앱 실행·화면 측정 없음(ORDER-05로).

## 지운 것·더한 것·하지 않은 것
- 지움: `src/shell/layout.ts`(Classic 너비 되돌리기·Custom 판정). 더함: `SidebarTitle.tsx`, 정렬 순수 함수 둘, `closeEach`, `panel_layout` 상태 키, 새 명령 ID 하나, 아이콘 둘.
- 남은 위험: Right 배치를 CSS `order`로만 해서 키보드 Tab·스크린 리더 순서는 DOM 순서(Tree → Outline → 탭·문서)로 화면과 다르다(checker: 이 앱은 Sidebar 이동을 단축키로 하므로 타당, DOM을 다시 놓으면 편집기·스크롤 상태가 깨짐). Right에서 Outline 손잡이가 pane 오른쪽 끝 위로 손잡이 폭의 절반만큼 걸쳐, 탭 줄 오른쪽 끝 버튼·본문 세로 스크롤바와 겹치는지는 ORDER-05에서 본다. Tree 목록이 제목 줄 아래에서 끝까지 차고 스크롤되는지(`.dock-left`를 세로 flex로 바꿈)도 ORDER-05.

## tauri가 고른 것
- I-17 명령 ID: Left = 옛 `workspace::UseClassicLayout` 그대로(이제 "왼쪽으로"만 — Tree를 열거나 너비를 되돌리지 않음), Right = 새 `workspace::UseRightSidebars`(`src/shell/AppMenu.tsx:151-154`). 사용자 키맵에 옛 ID가 묶여 있어도 그대로 동작하고 뜻은 Left Sidebars. 기본 키맵엔 둘 다 키 없음.
- I-17 확인 요청:
  - Sidebar 경계선(I-13): 걸리는 것 없음 — 경계선은 Sidebar 자신의 `border-left: var(--border)`(UI 테마 색). I-13의 본문 구간 색은 pane 사이 선만이라 무관.
  - 제목 줄(I-16): 걸리는 것 없음 — 각 Sidebar 안에 있어 같이 옮겨 감.
  - 탭 끌어 놓기·pane 분할 놓는 자리: 걸리는 것 없음 — `elementFromPoint`와 pane 자신의 사각형으로 정함(`src/shell/Pane.tsx:181-`), 창 왼쪽 기준 좌표를 쓰는 곳 없음.
  - Zen Mode 탭 줄 빈 곳 창 끌기(Phase 5): 지금 창 끌기 자리는 타이틀바와 Folder 검색 칸뿐이라 배치와 무관. 위 "남은 위험"의 손잡이 겹침만 주의.
- Tree 제목의 "폴더 이름"은 Folder Sidebar에 보이는 이름(Rename 이름 우선, `folderLabel`).
- 빈 곳 메뉴 "Close All"은 폴더가 없어도 흐리게 하지 않음(항목에 없음, 눌러도 아무 일 없음).
- 시안과 어긋난 곳 없음(아이콘 path·라벨 "Sort by Name (A to Z)"/"(Z to A)" 툴팁·메뉴 줄 순서 시안대로).

## 바꾼 파일
- 코드 `5bc2015`: `src/App.tsx`, `src/app.css`, `src/shell/AppMenu.tsx`, `src/shell/Icon.tsx`, `src/shell/Outline.tsx`, `src/shell/ProjectPanel.tsx`, `src/shell/Sidebar.tsx`, `src/shell/SidebarTitle.tsx`(새), `src/shell/app-menus.ts`, `src/shell/dock.ts`, `src/shell/panels.ts`, `src/shell/layout.ts`(지움), `src/workspace/closing.ts`, `src/workspace/folders.ts`, `src/workspace/state-file.ts`, `src/workspace/store.ts`, 테스트 `src/workspace/workspace.test.ts`·`closing.test.ts`, `src/shell/app-menus.test.ts`

## 미정
- 폴더가 0·1개(또는 이름이 모두 같음)일 때 "순서가 그 정렬과 같다"가 오름·내림 둘 다 참이라 정렬 아이콘 둘이 다 눌린 칸, 메뉴 정렬 줄도 다 체크된다. 항목 글 그대로 두었다. 폴더 2개부터만 표시하려면 `isSorted` 한 줄 — leader-core(사용자 확인 때).

## BLOCKED
- 없음
