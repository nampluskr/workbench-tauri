[DONE] ORDER-07 tauri

## 완료 기준
| # | 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|---|
| 1 | I-30 | `.list-table` 줄 마우스 올림 바탕, 고른 색·짝수 줄 색 값, 두 표 같은 규칙, `th` 제외, 포커스 테두리 그대로 (V0) | 충족 (화면은 USER-TEST) | `src/app.css:599` `.list-table tbody tr:hover { background: var(--element-hover) }`. 짝수 줄 규칙(`app.css:598`, `--element-background`)과 특이도가 같고(0,2,2) 그 뒤라 짝수 줄 위에서도 이김. 색(`src/theme/assets/one/one.json`): One Light 짝수 줄 `#ebebecff` → 올림 `#dfdfe0ff`, One Dark `#2e343eff` → `#363c46ff`. 두 표가 같은 클래스(`src/search/Search.tsx:85` `list-table search-table`, `src/shell/KeymapEditor.tsx:100` `list-table keymap-table`), 표별 CSS에 줄 바탕 규칙 없음. 선택자 `tbody tr`이라 `thead`의 `th`에는 걸리지 않음. 포커스는 `outline`(`app.css:600`)이라 바탕과 겹치지 않음, TSX 변경 없음 |
| 2 | I-31 | Zen에서 `app_menu::Toggle`이 메뉴를 열지 않음(열린 상태·`menu` 컨텍스트 없음), 보통 모드 그대로, 다른 경로 (V0) | 충족 | `src/shell/panels.ts:86` `chain("app_menu::Toggle", () => zenMode() && !menuOpen(), () => {})` — Zen이고 메뉴가 닫혀 있으면 아무것도 하지 않음 → `openMenu`가 불리지 않아 `isOpen()` 거짓, `hooks.context`(`src/shell/AppMenu.tsx:170`)가 `menu` 컨텍스트를 붙이지 않음 → 화살표·Enter·Esc는 원래 자리로. 그 밖(보통 모드, Zen에서 우클릭 메뉴가 열린 때)은 원래 처리(`AppMenu.tsx:152`). 더해서 Zen을 켤 때 열린 앱 메뉴를 닫음(`AppMenu.tsx:99` `closeAppMenu`, `panels.ts:81`) — 우클릭 메뉴는 닫지 않음. 다른 경로는 "tauri가 고른 것" |
| 3 | I-32 | 폴더 0개일 때 "No Folder", Tree와 같은 부품·모양, 우클릭 메뉴 그대로, 검색 0개는 그대로 (V0) | 충족 (화면은 USER-TEST) | `src/shell/Sidebar.tsx:173-174` `.sidebar-list` 안 `<Show when={folders().length === 0}><div class="outline-empty">No Folder</div></Show>` — Tree(`src/shell/ProjectPanel.tsx:29`)와 같은 요소·클래스·글자. 자리: `app.css:753` 선택자를 `:is(.project-panel, .sidebar-list):has(> .outline-empty)`로 넓혀 같은 위쪽 여백(`--outline-list-padding-top`), 흐린 색·글자 크기·좌우 여백은 `.outline-empty`(`app.css:754`) 그대로(Tree 쪽 특이도·모양 그대로). 조건이 걸러진 목록(`visible()`)이 아니라 열린 폴더 전체라 검색 0개에는 나오지 않음. 글자에 자기 `onContextMenu`가 없어 목록의 처리(`Sidebar.tsx:147`)로 올라가 빈 곳 메뉴가 열림 |
| 4 | release | 설치 파일 경로·크기, 버전 0.8.3 (V0) | 충족 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.3_x64-setup.exe` 10,592,019 B, `src-tauri\target\release\workbench-tauri.exe` 21,535,232 B, 둘 다 2026-11-14 22:45:11, ProductVersion·FileVersion 0.8.3. 기준 커밋 `61f1626`, exit 0, 73.3초. ORDER-06 빌드 대비 설치 파일 +788 B, exe 같은 크기(`dist/` +383 B, `index` 청크 4,640.06 → 4,640.36 kB라 새 프런트엔드가 들어감). `docs/BUILD.md` 4C절 반영(`7ec013b`) |
| 5 | 회귀 | 닿는 테스트 + typecheck, 보안 diff (V1 + V0) | 충족 | `npm.cmd run typecheck` exit 0(덧붙임 뒤 다시 한 번도 0). 고친 소스(`app.css`·`Sidebar.tsx`·`panels.ts`·`AppMenu.tsx`)를 불러오거나 읽는 테스트 파일이 없어 `node --test`는 돌리지 않음(깨질 기존 테스트 없음). Rust 변경 없음 → cargo 안 돌림. `git diff 6347c11 --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` 빈 결과. 출력 `%TEMP%\v083-K-09-tests.txt` |

## 검증
- 위 #5(coder, 커밋 전, 앞에서 실행). 전체 `npm run test`·새 단위 테스트 없음(카드 7절).
- checker 코드 리뷰 C-08 PASS(I-30 순서·특이도·`th` 제외, I-31 `chain` 감싸는 순서·`panels.ts` → `AppMenu.tsx` import에 순환과 Settings 창 영향 없음·`closeAppMenu`가 우클릭 메뉴를 닫지 않음, I-32 조건·우클릭·Tree 모양 그대로). 테스트 재실행 없음.
- release 빌드 한 번(#4). 앱 실행·화면 측정 없음.

## 지운 것·더한 것·하지 않은 것
- 더함: CSS 한 줄(I-30), `chain` 한 줄과 `closeAppMenu`(I-31), `<Show>` 한 줄과 선택자 넓힘(I-32). 지운 것 없음.
- 하지 않음: Zen `F10`의 새 메뉴 모양·안내, 검색 결과 0개 표시, PDF(v0.8.4), 새 테스트.
- 카드보다 하나 더 함(tauri-leader 판단): 보통 모드에서 앱 메뉴를 연 채 `F11`을 누르면 Zen에서 메뉴가 열린 채 숨던 경로를 막음(I-31 "보이지 않게 열린 상태도 없어야 한다"). 우클릭 메뉴를 연 채 `F11`은 지금처럼 메뉴가 보이는 채 Zen으로 바뀜(I-28 그대로).
- 남은 위험: I-30 One Light에서 두 색 차이가 작음(`#ebebec` → `#dfdfe0`) — 짝수 줄 위에서 충분히 눈에 띄는지 사용자 확인. 더 진한 `element.active`/`element.selected`(One Light `#cacaca`)는 CSS 변수로 나와 있지 않아 쓰려면 토큰을 더해야 함.

## tauri가 고른 것
- **I-30 색**: `element.hover`(`--element-hover`, 이미 `TARGET_TOKENS`에 있어 `:root`에 나옴, `src/theme/theme.ts:63`). 카드의 예를 따름. 두 색 모두 UI 테마 값(표는 편집기 테마 범위 밖, `src/theme/apply.ts:29`).
- **I-31 자리**: `AppMenu.tsx`가 아니라 `panels.ts`에 둠 — `AppMenu.tsx`는 Settings 창도 불러오므로, 거기서 `panels.ts`를 불러오면 Settings 창에 `workspace::ToggleZenMode` 등 명령 여섯이 새로 등록됨. `panels.ts`가 `AppMenu.tsx`를 불러와 원래 처리가 먼저 등록되고 `chain`이 감쌈. Settings 창은 `panels.ts`를 불러오지 않아 그 창의 `F10`은 원래 것.
- **I-31 다른 경로**: 메뉴 줄 버튼 클릭(`AppMenu.tsx:314`)은 Zen에서 `display: none`(`app.css:461`)·제목 줄 높이 0(`app.css:459`)이라 누를 수 없음. 메뉴 이름 클릭·올림, `menu::SelectChild`/`SelectParent`는 메뉴가 이미 열려 있을 때만 `openMenu`를 부름. Alt 키는 메뉴를 여는 처리 없음(`src/keymap/keyboard.ts:110`은 Alt keyup 기본 동작만 막음). 사용자 키맵이 `app_menu::Toggle`을 다른 키에 묶어도 같은 명령이라 함께 막힘. 앱 메뉴를 연 채 `F11` → 위 덧붙임으로 막음. 남은 경로 없음.
- **I-31 Zen 전환 때 포커스**: `closeAppMenu`는 `closeMenu(true)`(Esc와 같음)라 포커스를 메뉴를 열기 전 자리로 돌려줌. Zen을 끌 때도 불리지만 Zen에서는 앱 메뉴가 열릴 수 없어 아무 일도 없음.
- **I-32 Zen**: Zen은 `.sidebar-header`·`.sidebar-footer`만 숨김(`app.css:464`). 목록과 "No Folder"는 그대로 보이고, 조건이 검색어와 무관해 I-23(`shownQuery`)의 영향이 없어 보통 모드와 같음.

## 알릴 것
- 빌드 직전(22:43) 떠 있던 사용자 테스트 앱 PID 35052(`%TEMP%\v083-app\workbench-tauri-0.8.3-order06.exe` 복사본)가 빌드 뒤(22:47쯤) 없음. 복사본 파일은 그대로 있음. coder가 이 카드에서 실행한 것은 `Get-Process`, `npm.cmd run tauri build`, `Get-Item`/`Get-ChildItem`, 문서 고치기뿐이고 `Stop-Process`·`taskkill` 같은 종료 명령은 쓰지 않았음. release 빌드는 `src-tauri\target\release`에만 쓴다. 언제·왜 닫혔는지는 모름(사용자가 닫았을 수 있음).

## 바꾼 파일
- 코드 `61f1626`(K-09): `src/app.css`, `src/shell/AppMenu.tsx`, `src/shell/Sidebar.tsx`, `src/shell/panels.ts`
- 빌드 문서 `7ec013b`(K-10): `docs/BUILD.md` 4C절
- 이 보고·PROGRESS·ITEMS-MAP은 그 뒤 커밋

## 미정
- 없음(I-30 색의 보임새는 사용자 확인 때 봄)

## BLOCKED
- 없음
