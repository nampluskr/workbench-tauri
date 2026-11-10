[DONE] ORDER-17 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| U-19 | 세 줄 커서 `↓` → 셋 다 한 줄 아래(같은 열), `Shift+↓` → 셋 다 한 줄씩 선택, `↑` → 셋 다 위로, 커서 수 유지, 짧은 줄을 지나면 원하는 열 복귀(V1, V3) | 충족 | V1 `src/editor/extensions.test.ts`(1·3·5행 4열 커서: ↓·↑·Shift+↓/↑·PageDown·Ctrl+Shift+Home·Ctrl+End). V3 `specs/v0.6/verify/ORDER-17/v3.json` u19: L1c4·L2c2·L3c4 → `↓` L2c2·L3c4·L4c2 → `↓` L3c4·L4c2·L5c4(짧은 줄 지나 4열 복귀) → `↑↑` 시작으로 → `Shift+↓` 셋 다 한 줄 선택(3개) → `Shift+↑`×2 셋 다 위로 → `Ctrl+Shift+End` 하나로 합쳐짐 → `Ctrl+End` 커서 하나. `u19-after.png` |
| U-20 | 켬·끔 확대 캡처를 사용자 그림과 나란히, 켰을 때 바깥 테두리 없음, 아이콘 사각형·글자 색이 같은 값(V3) | 충족(Catppuccin) / 아이콘 테마별 다름(아래 미정) | `v3.json` u20(Catppuccin Latte): 켬 — 아이콘 테마의 `markdown.svg`(`M↓` 둥근 사각형), 테두리 0px, 8배 확대 픽셀 주색 (63,158,181) 하나(사각형·글자 같은 색, 사용자 그림 (32,159,181)과 같은 청록 계열), 22×22 그대로; 끔 — codicon `markdown`, rgb(88,88,90). `u20-catppuccin-off.png`·`u20-catppuccin-on.png`(그림 `lock-preview-want.png`와 같은 모양). `v3-zed-default.json`: 기본 아이콘 테마 Zed (Default)에서는 .md 아이콘이 책 모양이라 켬이 책 모양 강조색(rgb(92,120,226))이 된다(`u20-zed-default-on.png`) |
| U-21 | 검색어를 넣고 폴더 항목 hover 상태에서 두 "×"의 가운데 x·아이콘 크기가 같다, Sidebar 넓힘·좁힘에서도(V3) | 충족 | `v3.json` u21: 검색란 × / 폴더 항목 × 가운데 x — 기본 184/184, 넓힘 263/263, 좁힘 132/132, 버튼 폭 14/14, 보이는 아이콘(svg) 14px. `u21-w200.png`, `u21-wide.png`, `u21-narrow.png` |
| U-22 | "+" → 메뉴 세 항목과 단축키(V3), New File → 이름 입력 상태(V3), Open File(메뉴·`Ctrl-E`) → 선택 창, `read` → read가 든 파일만·폴더 없음, `Enter` → 열림(V1, V3), Search → Search 탭(V3) | 충족 | V1 `src/search/entries.test.ts`(read 결과에서 파일만, 이름·상대 경로). V3 `v3-u19-u22.json`(최종 빌드) u22r: 메뉴 "New File Ctrl-N / Open File Ctrl-E / --- / Search Ctrl-Shift-F" 모두 14px(`u22-plus-menu.png`); New File → 트리 이름 입력란(`u22-new-file.png`); Open File 메뉴·`Ctrl+E` 둘 다 열림, Esc 닫힘; `read` → `readme.md | readme.md`, `my_read.txt | sub\my_read.txt`(폴더 `readers` 없음, `u22-open-file-read.png`); `↓`·`Enter` → my_read.txt 탭 열림·창 닫힘; Search → Search 탭 |

### 키맵 표 (편집 영역, U-19)
| 키 | 편집 영역 동작 | VS Code 동작 | 원래 동작 |
|---|---|---|---|
| `↑` / `↓` | 모든 커서 한 줄, 각 커서의 원하는 열 유지, 같은 자리면 합쳐짐 | 같음 | 브라우저 기본(커서 하나로 합쳐짐) |
| `Shift+↑` / `Shift+↓` | 모든 선택 한 줄 넓힘·줄임 | 같음 | 브라우저 기본 |
| `PageUp` / `PageDown`, `Shift+PageUp` / `Shift+PageDown` | 모든 커서·선택을 한 쪽만큼 | 같음 | 브라우저 기본 |
| `Ctrl+Home` / `Ctrl+End` | 문서 처음·끝, 커서 하나로 합쳐짐 | 같음 | 같음 |
| `Ctrl+Shift+Home` / `Ctrl+Shift+End` | 각 범위를 문서 처음·끝까지 넓혀 겹치면 하나로 | 같음 | 주 범위만 남기고 나머지 버렸음 → 고침 |
- 앱 키맵의 `Ctrl+Shift+Up/Down`·`Ctrl+Alt+Up/Down`·`Alt+Up/Down`은 그대로. U-22로 `Ctrl+E`(Workspace, `file_finder::Toggle`)를 더했다. Keymap 편집기 탭 안의 `Ctrl+E`(`keymap_editor::EditInJson`)는 더 깊은 컨텍스트라 그쪽이 그대로 이긴다.

## 카드가 보고하라고 한 것
- U-20 아이콘·색: 켜짐에만 Left Dock 트리와 같은 `FileIcon`(아이콘 테마의 `.md` 아이콘과 그 색)을 그린다. Catppuccin Latte에서는 `icon-themes/catppuccin-icons/icons/latte/markdown.svg`(sapphire `#209fb5` 계열)라 사용자 그림과 같다. 새 색·토큰 없음. 꺼짐은 지금 codicon `markdown`·보통 색 그대로(꺼짐도 같은 사각형으로 바꿀지는 정하지 않음, 아래 미정).
- U-21 기준: 폴더 항목 hover ×(`.sidebar-item .tab-close`)에 검색란 ×를 맞췄다(기존 `--tab-end-slot-*`, `--sidebar-item-*` 변수).
- U-22 New File: 트리 선택이 있으면 그 폴더(파일이면 부모), 없으면 폴더 루트에 만든다. Open File은 Search 탭과 같은 `search_names`(Sidebar 선택 폴더와 하위, 이름 부분 일치, 띄엄띄엄 일치 없음)를 공용 `src/search/names.ts`로 나눠 쓰고, 폴더는 빼고 파일만 보인다. `Ctrl-E` 겹침은 위 키맵 표.

## 검증
- coder K-21(U-19~U-22, 카드에 U-21·U-22가 더해질 때마다 이어서), K-21-R1(U-21 4px 어긋남: `.icon-button` 규칙이 같은 특이도로 뒤에 와 검색란 버튼 폭이 22px로 남음 → 선택자 올림·아이콘 상자 맞춤). K-21-R1 중 coder가 `app.css`를 한 번 잘못 덮어써 되돌린 뒤 다시 넣었고, leader가 diff로 K-21 변경 두 개만 있는 것을 확인했다.
- checker C-23(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 235 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과. 코드 검토 지적 없음, V3 U-19~U-22 PASS(U-20 Zed (Default)는 "그림과 다름(테마별)").
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`, U-21 수정 때문에 두 번): debug exe(`src-tauri/target/debug`), 임시 APPDATA·임시 WebView 데이터 폴더, One Light(아이콘 테마 Catppuccin Latte, U-20은 Zed (Default)도), 1440×852. SendInput, CDP, 픽셀은 CDP 캡처를 `tools/png.mjs`로. 시스템 클립보드는 건드리지 않았다. 사용자 테스트 앱(PID 31992)은 건드리지 않았다(측정 때마다 이미 실행 중이 아니었다).
- leader 스크립트 오류로 무효인 줄: 첫 측정의 u19 Shift 줄(타이밍), `v3.json`의 u22(U-21 뒤 포커스가 Sidebar라 탭 바 오른쪽 버튼이 숨는 원래 동작) — `v3-u19-u22.json`(최종 빌드)이 대신한다.
- 결과 파일: `specs/v0.6/verify/ORDER-17/` `v3.json`, `v3-u19-u22.json`, `v3-zed-default.json`, `u19-after.png`, `u20-catppuccin-off.png`, `u20-catppuccin-on.png`, `u20-zed-default-off.png`, `u20-zed-default-on.png`, `u21-w200.png`, `u21-wide.png`, `u21-narrow.png`, `u22-plus-menu.png`, `u22-new-file.png`, `u22-after-newfile-esc.png`, `u22-open-file-read.png`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: U-18 Lock Preview 바깥 테두리 규칙, 별도 `Mod-Home/End` 키맵 항목(같은 키를 `multiCursorKeys`로 옮김), Search.tsx 안의 이름 검색 호출·열기(공용 모듈로 옮김).
- 더한 것: CM 위·아래·쪽·문서 경계 키, 켜짐 `FileIcon`, 검색란 × 정렬 규칙, "+" 메뉴, `src/shell/FileFinder.tsx`(Open File), `src/search/names.ts`·`entries.ts`, `Ctrl+E`. 새 의존성·새 색·새 수치·spec/ 수정·Rust 변경 없음.
- 하지 않은 것: Search Symbols·New Terminal·New Center Terminal(카드대로), Open File 결과 순위·글자 강조, View 메뉴 항목.
- 남은 위험:
  - Open File은 입력이 120ms 멈춘 뒤 찾고, 앞 100개 파일에서 멈춘다(코드에 `shortcut:` 주석).
  - `Ctrl+E`는 `BROWSER_KEYS`에 넣지 않았다(V3에서 WebView가 가로채지 않음을 확인).
  - "+" 버튼은 Pane에 포커스가 있을 때만 보이는 기존 동작이라, 포커스가 Sidebar·트리에 있으면 숨는다.

## 바꾼 파일
- 코드 커밋 `4432a6a`: `src/editor/extensions.ts`·`extensions.test.ts`, `src/app.css`, `src/shell/Icon.tsx`, `src/shell/status.ts`, `src/shell/Sidebar.tsx`, `src/shell/Pane.tsx`, `src/shell/picker.css`, `src/shell/FileFinder.tsx`(새), `src/App.tsx`, `src/search/Search.tsx`, `src/search/names.ts`(새), `src/search/entries.ts`(새)·`entries.test.ts`(새)
- 기록 커밋 `ea24475`: `specs/v0.6/PROGRESS.md`("사용자 요청 작업" 절 ORDER-17 소절), `specs/v0.6/verify/ORDER-17/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- U-20 켜짐 아이콘이 아이콘 테마를 따른다: Catppuccin에서는 그림과 같은 `M↓` 청록 사각형, 기본 Zed (Default)에서는 책 모양 강조색. 테마와 관계없이 `M↓`로 고정할지(그러려면 Catppuccin 아이콘 사본 하나를 고정으로 써야 함), 꺼짐도 같은 사각형 모양으로 할지 → 사용자

## BLOCKED
- 없음
