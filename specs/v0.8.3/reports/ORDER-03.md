[DONE] ORDER-03 tauri

## 완료 기준
| # | 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|---|
| 1 | I-8 글자 | 3.1 표의 모든 줄이 새 글자, 옛 글자는 화면 글자에 없음, 기존 테스트 새 글자로 통과 | 충족 (화면은 Phase 5에서 잼) | `App.tsx`(Open Folder), `workspace/recent.ts:29,34`(Recent Folders), `shell/tree-menu.ts:71-72`(Open Folder... / Close Folder), `shell/FileFinder.tsx:102`(Search files...), `shell/tab-menu.ts:43`(Reveal in Tree Sidebar), `shell/app-menus.ts:39-41`(Toggle Tree Sidebar / Toggle Folder Sidebar / Toggle Outline Sidebar `outline_panel::Toggle`), `shell/ProjectPanel.tsx:24`(No Folder). `git grep` 옛 글자 열 가지 + "Focus Folder Sidebar"·"Project Panel" 메뉴 글자 → `src/`·`index.html` 화면 글자 0건. 남은 곳(아래 표)은 동작 이름·이름·CSS·주석·키 표시 테스트 입력뿐. `app-menus`·`status`·`tab-menu`·`recent` 테스트 새 글자로 통과 |
| 2 | I-8 그대로 | 동작 이름·상태 파일 키·CSS 클래스·Keymap 편집기 표시 그대로 | 충족 | `git diff dbd269e..a35322e -- src`에서 `::`가 든 줄은 글자만 바뀐 같은 action 줄, `builtin.ts` 키 줄, 없앤 버튼·메뉴 줄뿐. `panels.ts`(`commands.set`)·`keymap/edit.ts` diff 없음. `state-file.ts`·`app.css`는 주석 한 줄씩 |
| 3 | I-4 기본 키 | 없앤 넷·더한 셋, `Pane` `ctrl-shift-e` 그대로, 포커스 명령 둘 남음, View 메뉴, Tree 버튼 여닫기만 | 충족 (키 동작은 Phase 5에서 잼) | `keymap/builtin.ts:78-81`(`ctrl-alt-1` ToggleWorkspaceSidebar, `ctrl-alt-2` ToggleLeftDock, `ctrl-alt-3` outline_panel::Toggle, 옛 넷 없음). `shell/tab-menu.ts:22` 그대로. 포커스 명령 `shell/panels.ts:67,69` 등록 그대로(사용자 keymap.json 키 동작). View 메뉴에서 "Focus Folder Sidebar"·"Project Panel" 뺌. `shell/status.ts:31` Tree 버튼은 늘 `workspace::ToggleLeftDock`. `builtin.test.ts`(v0.4 표에서 넷 빼고 셋 더해 대조)·`app-menus.test.ts`·`status.test.ts` 통과 |
| 4 | I-4 겹침 | 확인 요청의 답 | 충족 | 아래 "tauri가 고른 것" — 기본 키·브라우저·Windows 키와 겹침 없음. AltGr·입력 칸 두 가지는 미정 |
| 5 | I-5 툴팁 | 세 버튼 글자가 두 상태에서 같음 | 충족 (툴팁 화면은 Phase 5에서 잼) | `shell/status.ts:30-32` "Toggle Folder"·"Toggle Tree"·"Toggle Outline". 툴팁 = 글자 + 키(`IconButton`, Ctrl-Alt-1/2/3). `status.test.ts` 열림·닫힘 조합 16가지에서 글자·동작이 같음 |
| 6 | I-3 | 바닥 줄에 토글 버튼 없음 | 충족 (화면은 Phase 5에서 잼) | `App.tsx:41-47` 토글 버튼·두 줄 툴팁 없앰, 왼쪽은 빈 `.group.grow`로 남아 Open Folder가 오른쪽 끝. 이 버튼만 쓰던 `toggleSidebar` import, `Icon.tsx`의 `tips` prop·`Tip` import 정리(다른 사용처 없음). 상태 표시줄 Folder 버튼 그대로 |
| 7 | 회귀 | 닿는 테스트·typecheck, 보안 diff | 충족 | `node --test` 9개 파일(app-menus, status, tab-menu, recent, keymap builtin·display·user·keyboard, tooltip) → 32 pass 0 fail, `npm.cmd run typecheck` 0(`%TEMP%\v083-K-03-tests.txt`). `git diff d8f9438 --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` → ORDER-01의 버전 한 줄뿐, 이 카드 `src-tauri` diff 없음 |

옛 낱말이 남은 곳(화면 글자 아님):

| 남은 것 | 종류 |
|---|---|
| `project_panel::*`, `pane::RevealInProjectPanel`, `project_panel::RemoveFromProject`, `workspace::ToggleLeftDock` | 동작 이름(명령 ID) |
| `ProjectPanel` | keymap context·컴포넌트·파일 이름 |
| `.project-panel`, `.dock-left` | CSS 클래스 |
| `displayChunks("ctrl-alt-j")`·`("ctrl-alt-;")` | 키 표시 형식 테스트의 입력(기본 키와 무관) |
| `app.css` Left Dock 주석 한 줄 | 주석 |

## 검증
- 위 #7 명령. checker 코드 리뷰 C-03 PASS(표 열 줄 대조, 포커스 명령 등록, 지운 prop 사용처, 바닥 줄 배치, 테스트 기대값 변경이 규칙은 그대로·예시만 바꿈). 테스트 재실행 없음.
- 앱 실행·화면 측정 없음(ORDER-05로). 새 테스트 없음(카드대로).

## 지운 것·더한 것·하지 않은 것
- 지움: 기본 키 넷, View 메뉴 포커스 두 줄, Folder Sidebar 안 토글 버튼과 그 `tips` prop. 더함: 기본 키 셋, View 메뉴 한 줄.
- 고친 기존 테스트: `display.test.ts`·`user.test.ts`의 `ctrl-b` 예시 → `ctrl-alt-2`/`ctrl-alt-1`, `keyboard.test.ts`의 입력 칸 Workspace 키 예시 `ctrl-b` → `ctrl-w`(같은 규칙).
- 남은 위험: 아래 미정 둘(AltGr, 입력 칸).

## tauri가 고른 것
- I-4 겹침 확인:
  1. 다른 기본 키와 겹침 없음 — 모든 context(`BUILTIN`, 에디터·상태 표시줄·탭·이동·Welcome·Settings·Extensions·테마·Keymap 편집기)에서 `ctrl-alt-<숫자>`는 새 셋뿐. Welcome의 `ctrl-1`~는 Alt가 없어 다른 키. WebView2 브라우저 키(`BROWSER_KEYS`)·Windows 전역 키에도 Ctrl+Alt+숫자 없음(사용자가 바로 가기에 직접 붙인 전역 핫키는 OS가 먼저 가져감).
  2. AltGr(= Ctrl+Alt): `keymap/engine.ts:32-34`가 ASCII 밖 글자는 물리 키로 읽어, 독일어 자판 AltGr+2(`²`)·AltGr+3(`³`)처럼 ASCII 밖 글자를 내는 자판에서는 편집기에서 그 글자 대신 Sidebar가 여닫힌다. 스페인어 AltGr+1·2·3(`|`·`@`·`#`)처럼 ASCII 글자는 `ctrl-alt-@` 등으로 읽혀 안 걸리고 글자가 들어간다. 한국어·미국 자판은 문제없다. 옛 `ctrl-alt-j`·`ctrl-alt-;`, 지금 있는 `ctrl-alt-l`도 같은 성질이라 새 종류의 문제는 아니다. 고치지 않음.
  3. 입력 칸: `keymap/keyboard.ts:81`이 `<input>`에서 Ctrl+Alt 조합을 AltGr 글자 입력으로 보고 넘기는 기존 규칙 때문에, 입력 칸(Folder 찾기, Tree 이름 바꾸기, 파일 찾기 등)에 포커스가 있으면 새 키 셋이 동작하지 않는다. 옛 `Ctrl+B`는 입력 칸에서도 Tree를 여닫았다. 편집기(CodeMirror)에서는 동작한다. 고치지 않음(AltGr 규칙을 건드려야 함).

## 바꾼 파일
- 코드 `a35322e`: `src/App.tsx`, `src/keymap/builtin.ts`, `src/shell/status.ts`, `src/shell/app-menus.ts`, `src/shell/tab-menu.ts`, `src/shell/tree-menu.ts`, `src/shell/FileFinder.tsx`, `src/shell/ProjectPanel.tsx`, `src/shell/Icon.tsx`, `src/workspace/recent.ts`, `src/app.css`(주석), `src/workspace/state-file.ts`(주석), 테스트 `src/shell/app-menus.test.ts`·`status.test.ts`·`tab-menu.test.ts`, `src/workspace/recent.test.ts`, `src/keymap/builtin.test.ts`·`display.test.ts`·`user.test.ts`·`keyboard.test.ts`

## 미정
- AltGr이 ASCII 밖 글자를 내는 자판(독일어 등)에서 편집기의 AltGr+1·2·3 글자 입력이 Sidebar 여닫기에 먹힘 — 받아들일지, 고칠지(엔진의 물리 키 규칙) leader-core(사용자 확인 때).
- 입력 칸에 포커스가 있을 때 Ctrl+Alt+1·2·3이 동작하지 않음(옛 Ctrl+B는 됐음) — 받아들일지, 입력 칸에서도 이 셋만 보낼지 leader-core.

## BLOCKED
- 없음
