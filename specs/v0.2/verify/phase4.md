# Phase 4 끝 V3 실측 (카드 v02-M4, SPEC R-11~R-17·R-29, Phase 3에서 미룬 ☰ 메뉴 Phase 4 항목과 R-7 툴팁)

## 측정 조건

- 창 논리 1440x852(`innerWidth`×`innerHeight`, CDP), 배율 100%(`devicePixelRatio` 1, 창 DPI 96), 주 모니터 1920x1080, 작업 영역 1920x1032. 테마는 기본(Catppuccin Mocha: `text` = rgb(205, 214, 244)). 라이트 테마는 이 Phase 목록에 없어 재지 않았다.
- 앱: `npm.cmd run tauri build -- --debug --no-bundle`로 이 측정 앞에서 새로 만든 `src-tauri/target/debug/workbench-tauri.exe`(2026-11-06 01:48:11). 이전 exe는 Phase 4 소스보다 오래되어 쓰지 않았다.
- 입력은 `tools/win-input.ps1`(SendInput)에 `-ProcessId`로 대상을 고정했고 입력마다 전경 확인(스크립트 내장 검사). 값은 CDP로 읽었다(`getBoundingClientRect`·`getComputedStyle`·DOM·`document.activeElement`). 페이지 안 기록기·덮어쓰기는 CDP로 꽂았고 앱 코드에는 없다.
- OS 폴더 선택 창: 실제로 연 것은 등록 1회·취소 1회(D-15, Q-15). 창 안은 UI Automation(`폴더:` 편집창에 값 쓰기, `폴더 선택`·`취소` 버튼 Invoke)으로 다뤘다. 그 밖의 등록 사례는 선택 창의 **결과값만 페이지 쪽에서 대신 돌려줬다**(`window.fetch`를 CDP로 덮어 `plugin:dialog|open` 요청에 경로를 답함). 창은 열리지 않지만 그 뒤의 경로(정규화, `check_folder`, 알림, 목록, `state.json`)는 실제 앱 코드다. 어느 행이 어느 쪽인지 표에 적었다.
- 기대값: `specs/v0.2/SPEC.md`·`spec/zed-metrics.toml`·`docs/refs/01-zed`(A-12·A-16·A-17). 허용 오차는 `verification.tolerance.dimension` 1px.
- 시험 폴더: `%TEMP%\wb-v02-m4\fx\`(alpha·beta·gamma·같은 이름 `docs` 둘(`same\a\docs`·`same\b\docs`)·`nest\outer`와 그 안 `inner`·`later`(나중에 이름을 바꾼 폴더)·존재하지 않는 경로·파일 하나(`file\single.txt`)·긴 이름 둘(95자, 47자)·`many\m01..m30`·`pick\picked`·`pick\e1..e4`). 사용자 폴더는 등록하지 않았다.
- 입력 도구 변경(`tools/win-input.ps1`): 키 이름 `delete`·`del` 한 줄 추가(일반 동작). 일회성 측정 스크립트는 `tools/`에 남기지 않았다.

## 요약

- 통과: R-11~R-17·R-29의 이 Phase 몫 전부, ☰ 메뉴 Phase 4 항목, R-7의 Phase 4 몫. 아래 표 판정 열 기준 불일치 0건.
- 불일치: 없음. 주의·관찰은 "관찰"과 "사용자 확인 필요"에 적었다(고치지 않음).
- 측정 불가: `statusbar.group_gap`(왼쪽 묶음 하나뿐), 실제 작업 표시줄 닫기(`WM_CLOSE` 대체로 쟀다), 프로젝트 패널 `Remove` 버튼 누르기(미측정).
- 사용자 확인 필요(V4): 목록 스크롤바 모양, 빈 상태·경로 없음 패널의 문구·버튼 모양, 아이콘-이름 간격(아래).

## 시험 전후 상태

| 대상 | 측정 전 | 측정 뒤(복구) |
| --- | --- | --- |
| `%APPDATA%\workbench-tauri` | 없음(`Test-Path` false) | 지움(없음). 마지막 확인: 폴더 없음, `workbench-tauri.exe` 프로세스 0 |
| `%TEMP%\wb-v02-m4` | 없음 | 지움(없음) |

앱은 시작할 때 이 폴더를 만들지 않았다(S1 시작 직후 폴더 없음). 쓰기가 일어나야 `state.json`이 생겼다.

## R-11. 폴더 추가

실제 선택 창 두 번(등록 1, 취소 1)과 응답 대체 사례를 구분한다.

| 사례 | 방식 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| 등록 | **실제 창.** 푸터 `Add Project`를 실제로 클릭 → 창 `폴더 선택`(앱 프로세스 소유, 전경) → `폴더:`에 `…\fx\pick\picked` 쓰고 `폴더 선택` Invoke | 맨 아래에 붙고 활성 | 항목 `picked` 하나, `sidebar-item active cursor`, 타이틀 바 `picked`. `state.json`: `folders[0]`의 `id` UUID v4, `added_at` `2026-11-05T16:53:35.328Z`(UTC ISO), `active_folder_id` 같은 id. 파일 수정 시각 = `added_at` + 530 ms | 통과 |
| 등록 폴더 디스크 | 위 전후 | 읽기만 | `picked` 4항목·파일 2·60 바이트·해시 `0cef609f9221ea70` 전후 같음 | 통과 |
| 취소 | **실제 창.** `Add Project` 클릭 → `취소` Invoke | 아무 일 없음 | 항목·`state.json`·앱 데이터 폴더 목록 전부 같음, 알림 없음, 창 목록에 선택 창 없음 | 통과 |
| 파일 경로(`file\single.txt`) | 응답 대체 | `Cannot open this folder.` 알림만 | 알림 그 문구, 목록·`state.json` 불변 | 통과 |
| 없는 경로 | 응답 대체 | 같음 | 같음 | 통과 |
| 상대 경로(`docs\x`) | 응답 대체 | 같음(A-28) | 같음 | 통과 |
| 읽을 수 없는 폴더 | 응답 대체. 폴더에 ACL `deny (RD)`(Node `readdir` EPERM 확인), 끝나고 ACL 되돌림 | 같음 | 알림 `Cannot open this folder.`, 목록 불변 | 통과 |
| 새 폴더 alpha, beta | 응답 대체 | 맨 아래에 붙고 활성 | 순서 `picked, alpha, beta`, 활성은 마지막에 고른 것, `id`·`added_at` 형식 모두 v4·ISO | 통과 |
| 중복(대소문자 + 끝 `\`) | 응답 대체(S1) | 새 항목 없음, 기존 활성 | 항목 3개 그대로, `alpha` 활성, `state.json` 폴더 3개 | 통과 |
| 중복(`/` 구분자) | 응답 대체(S1) | 같음 | 항목 3개, `beta` 활성 | 통과 |
| 중복(미리 만든 `state.json`, 세션 S7) | 응답 대체. 시작 `[alpha, beta]` | 같음 | `BETA\`(대문자+끝 `\`) → 항목 2개, beta 활성. `alpha`(`/` 구분자) → 항목 2개, alpha 활성 | 통과 |
| 진입 경로 ☰ File → `Open Folder...` | 실제 클릭, 응답 대체 | 등록 | `e1` 붙음·활성, 선택 요청 1 | 통과 |
| 진입 경로 푸터 `Add Project` | 실제 클릭, 응답 대체 | 등록 | `e2` | 통과 |
| 진입 경로 `Ctrl+K Ctrl+O` | 실제 키, 응답 대체 | 등록 | `e3` | 통과 |
| 진입 경로 상태 표시줄 `Add Project`(사이드바 닫힘) | 실제 클릭, 응답 대체 | 등록 | `e4` | 통과 |
| 진입 경로 빈 상태 패널 `Open Project` | 실제 클릭, 응답 대체 | 선택 창 요청 | 요청 1, 고른 `picked` 등록·활성 | 통과 |
| capability | 코드 확인 | 선택에 쓰는 권한만 | `src-tauri/capabilities/default.json`의 dialog 권한은 `dialog:allow-open` 하나 | 통과 |

## R-12. 항목 모양과 상태

목록 폭은 `state.json`의 420이 적용되어 `.sidebar` 420px(기본 300px는 S1에서 확인), 항목 39개(S2).

| 스펙 ID | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| `sidebar.item_row.height` | 31 | 39행 전부 31, 행 사이 간격 0(목록 높이 합 1209 = 39×31) | 통과 |
| `sidebar.project_header.padding_left` | 8 | computed 8px, 아이콘 x = 8 | 통과 |
| `sidebar.project_header.padding_right` | 6 | computed 6px | 통과 |
| `sidebar.item.icon_size` | 14 | 14×14, 세로 중앙(행 y 33~64, 아이콘 y 41.5~55.5) | 통과 |
| `sidebar.item.focus_border_width` | 1 | 커서 행 `box-shadow: rgb(180, 190, 254) 0 0 0 1px inset` | 통과 |
| A-12.1 이름 한 줄·말줄임 | 넘치면 `…` | 95자 이름 `text-overflow: ellipsis`, `scrollWidth > clientWidth`, 행 높이 31 그대로 | 통과 |
| A-12.1 기본 색 | `text.muted`, 아이콘 `icon.muted` | rgb(186, 194, 222) / rgb(127, 132, 156) = 토큰 변수 값 | 통과 |
| A-12.2 활성(선택) | 배경 `ghost_element.selected`, 글자 `text` | rgba(111, 114, 141, 0.4) / rgb(205, 214, 244) = 토큰 값 | 통과 |
| A-12.3 hover(실제 마우스) | 배경 `ghost_element.hover`, 글자 `text` | rgba(69, 71, 90, 0.3) / rgb(205, 214, 244) | 통과 |
| A-12.4 누름(실제 버튼 누른 채 4 s, 그 동안 읽음) | 배경 `ghost_element.active` | rgba(88, 91, 112, 0.6). 두 칸 아래에서 놓으면 `click` 대상이 `sidebar-list`(활성 안 바뀜) | 통과 |
| A-12.5 키보드 포커스 | 목록에 포커스 있을 때 `border.focused` 1px 링 | 목록 포커스 때 커서 행에 링. 시작 직후(포커스 없음)는 `box-shadow: none` | 통과 |
| A-12.6 같은 이름 | 이름 뒤 `text.muted`로 바로 위 폴더 | `docs · a`, `docs · b`(`.sidebar-item-parent` 색 rgb(186, 194, 222)) | 통과 |
| A-12.7 경로 없음 | `text.disabled`·`icon.disabled` | rgb(108, 112, 134) / rgb(108, 112, 134), `missing` 활성이어도 글자 색 같음 | 통과 |
| A-12.8 툴팁 | 없음 | 실제 hover 1.5 s에도 툴팁 DOM 없음 | 통과 |

스크린샷(`specs/v0.2/verify/phase4/`): `r12-hover.png`, `r12-pressed.png`, `r12-cursor-ring.png`, `r12-overview.png`, `r16-missing-panel.png`. 색은 화면 픽셀이 아니라 토큰 변수 덤프로 판정했다(공통 판정 방식).

## R-13. 활성화와 타이틀 바

| 사례 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 항목 실제 클릭 | 활성 + 타이틀 바 이름 | `outer` 클릭 → `outer*`, 타이틀 `outer`, `state.json` 활성 `outer`(700 ms 안) | 통과 |
| 키보드 커서가 활성과 따로 | Up/Down은 커서만 | 커서 `outer`→Down `inner`→Down `never-created`→Up `inner`. 그 동안 활성은 `outer`, 타이틀 `outer` | 통과 |
| Enter | 커서 항목 활성 | `inner` 활성, 타이틀 `inner`, `state.json` 활성 `inner` | 통과 |
| 활성화 뒤 포커스 | 사이드바에 그대로 | `document.activeElement`가 계속 `sidebar-list` | 통과 |
| 끝에서 멈춤(A-17.3) | 순환 없음 | 42번 Down → 커서 `m30`(마지막), 활성 안 바뀜, 행이 목록 안에 완전히 보임(행 아래 821 = 목록 아래 821). 45번 Up → `alpha`(첫), `scrollTop` 0 | 통과 |
| 활성 변경 뒤 쓰기 | 디바운스 뒤 `state.json` 반영 | S1: 실제 클릭으로 `picked` 활성 → `state.json` 활성 `picked`, 클릭 후 506 ms에 수정 시각이 바뀜(디바운스 `app.state_save_debounce` 500) | 통과 |
| 타이틀 이름 말줄임 | 40자 + `…` | 47자 이름 → 41자(`title-truncation-name-0123456789-abcdefg…`), 95자 이름 → 41자 | 통과 |
| 폴더 없음 | `Open Recent Project`(Muted) | 이름 `Open Recent Project`, 클래스 `empty`, 색 rgb(186, 194, 222) = `text.muted`(폴더 있을 때는 rgb(205, 214, 244) = `text`) | 통과 |
| 타이틀 이름 툴팁 | `Recent Projects`, 단축키 없음 | 실제 hover 뒤 `Recent Projects`, 키 없음 | 통과 |
| 눌러도 무동작 | 무동작 | 눌러 보지 않음. 코드 확인: `TitleBar.tsx`의 `ProjectName`에 클릭 처리 없음 | 통과(코드) |

폴더별 트리 펼침·선택·탭 유지는 Phase 5에서 판정한다(PROGRESS).

## R-14. 등록 해제와 디스크

시험 폴더 전체(`%TEMP%\wb-v02-m4\fx`, 파일·폴더 이름, 크기, 수정 시각)를 시작 전에 한 번 잰 값과 비교했다. 시작 상태 `[beta, gamma, alpha, docs]`, 활성 beta.

| 단계 | DOM | `state.json` | 디스크 | 판정 |
| --- | --- | --- | --- | --- |
| 전 | 4개 | `beta, gamma, alpha, docs` / 활성 beta | 185항목(파일 87, 폴더 98), 2036 바이트, 최신 수정 2026-11-05T17:07:29.301Z, 해시 `b585e4fccad4c628` | - |
| ① 우클릭 → `Remove`, 활성(맨 위) 해제 | `gamma*, alpha, docs`, 타이틀 gamma | `gamma, alpha, docs` / 활성 gamma(아래 항목) | 전과 같음 | 통과 |
| ② 마지막 항목을 클릭해 활성화 → `Delete`, 활성(맨 아래) 해제 | `gamma, alpha*`, 타이틀 alpha | `gamma, alpha` / 활성 alpha(위 항목) | 같음 | 통과 |
| ② 커서 Up(활성 아닌 `gamma`) → `Delete` | `alpha*` | `alpha` / 활성 alpha(안 바뀜) | 같음 | 통과 |
| ① 마지막 항목 우클릭 → 메뉴는 `Remove` 하나 → `Remove` | 항목 0, 빈 상태 패널, 타이틀 `Open Recent Project` | `folders: []`, 활성 null | 같음 | 통과 |
| 후 | - | - | 185항목, 2036 바이트, 같은 최신 수정 시각, 해시 `b585e4fccad4c628` — 파일 목록·크기·수정 시각 전부 전과 같음 | 통과 |

- 확인창은 나오지 않았다(클릭·키 한 번에 즉시 제거).
- 해제한 폴더의 탭 닫기와 프로젝트 패널 루트 `Remove from Project`(세 번째 경로)는 Phase 5 몫이다.

## R-15. 순서 바꾸기

| 사례 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 가운데 항목 우클릭 | `Move Up`, `Move Down`, 구분선, `Remove` | 그대로, 비활성 없음 | 통과 |
| 맨 위 항목 | `Move Up` 비활성 | `Move Up` `aria-disabled` | 통과 |
| 맨 아래 항목 | `Move Down` 비활성 | `Move Down` `aria-disabled` | 통과 |
| 폴더 하나 | `Remove`만 | `["Remove"]` | 통과 |
| 빈 공간, `Add Project` 버튼, `Toggle Sidebar` 버튼 우클릭 | 메뉴 없음 | 메뉴 없음(셋 다) | 통과 |
| 단축키 | 없음 | 항목에 단축키 글자 없음 | 통과 |
| `Move Down`(alpha) 후 `Move Up`(gamma) | 한 칸씩 | `[alpha,beta,gamma,docs]` → `[beta,alpha,gamma,docs]` → `[beta,gamma,alpha,docs]`, 활성 beta 그대로, `state.json` `folders` 순서 같음 | 통과 |
| 재시작 | 순서·활성 복원 | 다시 띄운 뒤 DOM `beta*, gamma, alpha, docs`, 타이틀 beta | 통과 |

우클릭하면 키보드 커서가 그 항목으로 옮겨가고 활성은 그대로다(관찰). 스크린샷 `r15-context-menu.png`.

## R-16. 예외 상태

| 사례 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 빈 상태 (등록 없이 시작, 해제로 비움) | 목록 비고 패널에 문구 + `Open Project` 하나 | 항목 0, 패널 텍스트 `Choose one of the options below to use the Project Panel` + 버튼 `Open Project` 하나 | 통과 |
| `Open Project` 버튼 | 선택 창을 연다 | 클릭 → 선택 창 요청 1(응답 대체), 고른 폴더 등록 | 통과 |
| 시작 때 없는 경로 | `text.disabled`, 활성화하면 안내 + Remove 버튼 | 항목 `missing`(R-12 색), 활성화하면 패널 `This folder no longer exists.` + 버튼 `Remove` 하나 | 통과 |
| 실행 중 사라짐(A-16.3) | 같은 안내 | 폴더 이름을 `later.moved`로 바꾸고 클릭 → 패널 문구, 항목 `missing`. 다른 항목을 활성화해도 표시는 남음. 이름을 되돌리고 `later`를 다시 클릭 → 표시·패널 사라짐 | 통과 |
| 안쪽·바깥 폴더(A-16.5) | 독립 항목, 둘 다 가능 | `outer`, `inner` 둘 다 목록에 있고 각각 활성화됨(타이틀 outer/inner) | 통과 |
| 많은 폴더(A-16.7) | 세로 스크롤 | 39개(후에 43개): `overflow-y: auto`, `scrollHeight` 1209 > `clientHeight` 788. 실제 휠 한 칸당 `scrollTop` +100(0→100→200→300), 위로 5칸 값 → 0. 키보드로 끝까지 가면 `scrollTop` 421(= 최대) | 통과 |

`Remove` 버튼(패널)을 눌러 보지는 않았다. 스크린샷 `r16-empty-state.png`, `r16-missing-panel.png`, `r16-vanished-at-runtime.png`, `r16-many-scrolled.png`, `r13-title-truncated.png`.

## R-17. 표시·포커스 키

시작: 사이드바 열림, Dock 열림, 포커스는 가운데 Pane(클릭). 실제 키.

| 단계 | 사이드바 | Dock | `activeElement` | 상태 표시줄 | 판정 |
| --- | --- | --- | --- | --- | --- |
| 0 Pane 클릭 | 열림 | 열림 | `pane` | `Close Left Dock` | - |
| 1 `Ctrl+Alt+J`(Pane에서) | 닫힘 | 열림 | `pane` | `Open Folder Sidebar` / `Add Project` / `Close Left Dock` | 통과 |
| 2 `Ctrl+Alt+J` | 열림 | 열림 | `sidebar-list` | `Close Left Dock` | 통과 |
| 3 `Ctrl+Alt+J`(안에서) | 닫힘 | 열림 | `pane`(이전 위치) | 위와 같은 셋 | 통과 |
| 4 `Ctrl+Alt+;`(닫힘) | 열림 | 열림 | `sidebar-list` | `Close Left Dock` | 통과 |
| 5 `Ctrl+Alt+;`(안에서) | 열림 | 열림 | `pane`(이전 포커스, 닫지 않음) | 같음 | 통과 |
| 6 `Ctrl+Alt+;`(밖에서) | 열림 | 열림 | `sidebar-list` | 같음 | 통과 |
| 7 `Ctrl+B`(목록 포커스) | 열림 | 닫힘 | `sidebar-list` | `Project Panel` | 통과 |
| 8 `Ctrl+B` | 열림 | 열림 | `sidebar-list` | `Close Left Dock` | 통과 |
| 9 `Ctrl+Shift+E`(목록에서) | 열림 | 열림 | `project-panel` | 같음 | 통과 |
| 10 `Ctrl+Shift+E`(패널 안) | 열림 | 열림 | `sidebar-list`(이전 포커스, 패널 안 닫음) | 같음 | 통과 |
| 11 `Ctrl+Shift+E` | 열림 | 열림 | `project-panel` | 같음 | 통과 |
| 12 `Ctrl+B`(패널 포커스) | 열림 | 닫힘 | `pane` | `Project Panel` | 통과 |
| 13 `Ctrl+Shift+E`(Dock 닫힘) | 열림 | 열림 | `project-panel` | `Close Left Dock` | 통과 |

푸터(사이드바 열림): `Toggle Sidebar`(왼쪽 x=4)·`Add Project`(오른쪽, 폭 420에서 x=393 → 오른쪽 끝 여백 4). 상태 표시줄에는 프로젝트 패널 토글만. 스크린샷 `r17-sidebar-closed.png`, `r17-dock-hidden.png`.

사이드바 닫힘 상태 상태 표시줄(A-11.9): 순서 `Open Folder Sidebar`(x 0) → `Add Project`(x 26) → `Close Left Dock`(x 52).

| 스펙 ID | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| `statusbar.item_gap` | 4 | 버튼 사이 4.00, 4.00 | 통과 |
| `statusbar.button_height` | 22 | 22×22 | 통과 |
| `statusbar.icon_size` | 14 | 14×14(셋) | 통과 |
| `statusbar.height`, `statusbar.padding_y` | 30, 4 | 상태 표시줄 h 30(y 822), 버튼 y 826 = +4 | 통과 |
| `statusbar.group_gap` | 8 | 왼쪽 묶음 하나뿐이라 간격이 그려지지 않는다 | 측정 불가(Phase 5 R-26에서 오른쪽 묶음이 생기면) |

## R-29. state.json 저장·복원

### 쓰기

| 사례 | 측정 | 판정 |
| --- | --- | --- |
| 등록 뒤 쓰기 지연 | 등록 `added_at` → 파일 수정 530 ms. 활성 변경(실제 클릭) → 506 ms | 통과(디바운스 500) |
| 필드 | `version` 1, `windows[0]`에 `id`, `folders[]`(`id`·`path`·`added_at`), `active_folder_id`, `sidebar.width`. 순서 = `folders` 배열 순서 | 통과 |
| 종료 직전 쓰기 | 아래 닫기 5경로 | 통과 |
| 정상 종료 뒤 앱 데이터 폴더 | `state.json`만, `.tmp` 없음 | 통과 |

### 재시작 전후

| 세션 | 재시작 전 `state.json` | 재시작 뒤 복원(DOM) | 판정 |
| --- | --- | --- | --- |
| S1 (등록·활성 변경) | 폴더 `picked, alpha, beta`, 활성 `picked`, 폭 300 | `picked*, alpha, beta`, 타이틀 `picked`, 폭 300, 알림 없음. 시작이 `state.json`을 고쳐 쓰지 않음(텍스트 동일) | 통과 |
| S3 (순서 변경) | 폴더 `beta, gamma, alpha, docs`, 활성 beta | 같은 순서·활성 | 통과 |
| S2 (폭 420, 알 수 없는 키) | 폭 420 | `.sidebar` 폭 420px로 시작, 쓴 뒤에도 420 | 통과 |

### state.json 사례 (미리 만든 파일로 시작)

| 사례 | 시작 파일 | 시작 결과 | 변경 뒤 | 판정 |
| --- | --- | --- | --- | --- |
| 알 수 없는 키(S2) | 39개 폴더, 활성 alpha, 폭 420, 최상위 `future_top`, 창 `future_win`, 폴더 `future_folder`(alpha), `sidebar.future_side` | 항목 39, 알림 없음, 폭 420 | 폴더 4개 더 등록하고 활성이 바뀐 뒤: 네 군데 알 수 없는 키 모두 그대로, 앞 39개 폴더 항목 바이트 동일, 새 4개가 뒤에 붙음 | 통과 |
| 깨진 `state.json` + 올바른 `.tmp`(C2) | `{ "version": 1, ... BROKEN`, `.tmp` 3개 폴더·활성 beta·폭 360, 옛 `state.json.bad-20260101/02/03-000000` 셋 | 알림 `Could not read the window state.`, `.tmp` 내용으로 복원(`alpha, beta*, gamma`, 폭 360). 깨진 파일은 `state.json.bad-20261106-021222`로 옮겨짐, 옛 셋 중 가장 오래된 것(`20260101`)이 지워져 최근 3개만 남음 | 클릭 뒤 `state.json` 생성(832 B), `.tmp` 사라짐, `gamma` 활성 반영 | 통과 |
| 둘 다 깨짐(C3) | `state.json`·`.tmp` 모두 깨진 텍스트 | 알림, 빈 상태(항목 0, 폭 300, 타이틀 `Open Recent Project`), `state.json.bad-20261106-021653` 생성, `.tmp` 남음 | 폴더 등록 뒤 `state.json` 생성(424 B, 폴더 1개), `.tmp`는 교체되어 사라짐 | 통과 |
| `version` 초과(C4) | `version` 2, 폴더 2개, 알 수 없는 키 | 항목 2, 알림 없음 | 클릭으로 활성을 바꿔도 `state.json` 불변, 종료 뒤에도 사전 파일과 바이트 동일 | 통과 |
| `.tmp`만(C6) | `state.json` 없음, `.tmp`에 3개 폴더·활성 gamma·폭 500 | 알림 없음, `alpha, beta, gamma*`, 폭 500 | 클릭 뒤 `state.json` 생성, `.tmp` 사라짐, 활성 alpha | 통과 |
| 이상한 값(C5) | 활성 id가 없는 id, 폭 150, 중복 id 항목, `path`가 숫자인 항목, 둘째 창 | 알림 없음, `alpha, beta, gamma`, 활성 첫 폴더 alpha, 폭 300 | 쓴 뒤: 폴더 3개(중복·잘못된 항목은 빠짐), 활성 beta, 폭 300, 둘째 창(`w2`)은 그대로 | 통과 |
| 같은 이름·없는 경로(S2) | `docs`(a, b), `never-created` | R-12·R-16 표 | - | 통과 |

### 닫기 경로 (등록 직후 500 ms 안)

시작 `state.json`은 폴더 하나(alpha). 각 경로마다 새 폴더를 등록(선택 창 응답 대체)하고 곧바로 닫았다. "등록"은 목록에 항목이 생긴 페이지 시각(`REG`)이고, 값은 같은 PC 시계의 `Date.now()`다. 파일 수정 시각이 `REG + 500 ms`보다 훨씬 이르면 디바운스가 아니라 닫기 직전 쓰기가 쓴 것이다.

| 경로 | 닫기 입력 | 등록→닫기 입력 | 등록→`state.json` 수정 | 닫기 입력→프로세스 소멸 | 결과 | 판정 |
| --- | --- | --- | --- | --- | --- | --- |
| 타이틀 바 닫기 | 실제 마우스 클릭(포인터가 단추 위로 올 때 등록을 일으킴) | 75 ms(`REG` 1793899731178 → `CLICK` …253) | 80 ms | 89 ms | `[alpha, gamma]`, 활성 gamma, `.tmp` 없음 | 통과 |
| ☰ File → Close Window | 실제 클릭 3번(☰·File·항목), 마지막 항목 위로 포인터가 올 때 등록 | 72 ms(`REG` …111 → `CLICK` …183) | 78 ms | 111 ms | `[alpha, sub]`, 활성 sub | 통과 |
| `Ctrl+Q` | 실제 키 `Ctrl+K`, `Ctrl+O`, `Ctrl+Q`를 80 ms 간격으로 | 107 ms(`REG` …282 → `KEY q` …389) | 111 ms | 69 ms | `[alpha, beta]`, 활성 beta | 통과 |
| `Alt+F4` | 실제 키 `Ctrl+K`, `Ctrl+O`, `Alt+F4`를 80 ms 간격으로 | 86 ms(`REG` …404 → `KEY F4` …490) | 90 ms | 94 ms | `[alpha, docs]`, 활성 docs | 통과 |
| 작업 표시줄 닫기(대체: `PostMessage WM_CLOSE`를 앱 창에) | 등록 뒤 116 ms에 보냄(두 번째 실행에서 잼) | 116 ms | 134 ms(두 번째 실행), 140 ms(첫 번째 실행) | 998 ms(두 번째 실행) | `[alpha, docs]`, 활성 docs | 통과 |

- 다섯 경로 모두 `state.json`에 새 폴더가 들어갔고(수정 시각이 디바운스 500 ms보다 이름), `.tmp`가 남지 않았고, `workbench-tauri.exe`가 사라졌고, 그 프로세스의 자식 6개(WebView2)도 남지 않았다. 닫기 입력은 앱 코드의 `onCloseRequested` 한 지점으로 들어간다(코드: `store.ts`의 `guardClose`).
- 작업 표시줄 닫기는 실제로 눌러 보지 않았다(작업 표시줄의 썸네일 닫기·창 닫기 메뉴를 입력 도구로 안정적으로 겨냥할 수 없어서). 같은 닫기 요청이 창에 도착하는 `WM_CLOSE`로 대체했고, 이것은 작업 표시줄 경로의 대용이다.
- `WM_CLOSE`는 프로세스 소멸까지 약 1 s 걸렸다. 다른 네 경로는 70~110 ms다(관찰, 판정 대상 아님).

## R-7 (Phase 4 몫)과 ☰ 메뉴

툴팁은 실제 hover 뒤 `.tooltip` DOM 텍스트다.

| 요소 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 푸터 `Add Project` | `Add Project` / `Ctrl-K Ctrl-O` | `Add Project`, 키 `Ctrl-K` `Ctrl-O` | 통과 |
| 푸터 사이드바 토글(열림) | 두 줄: `Toggle Sidebar` `Ctrl-Alt-J` / `Focus Sidebar` `Ctrl-Alt-;` | 두 줄(`tooltip-box multi`), 키 `Ctrl-Alt-J`·`Ctrl-Alt-;` | 통과 |
| 상태 표시줄 프로젝트 패널 토글(Dock 열림) | `Close Left Dock` / `Ctrl-B` | 그대로 | 통과 |
| 같은 토글(Dock 닫힘) | `Project Panel` / `Ctrl-Shift-E` | 그대로 | 통과 |
| 상태 표시줄 `Open Folder Sidebar`(사이드바 닫힘) | `Open Folder Sidebar` / `Ctrl-Alt-J` | 그대로 | 통과 |
| 상태 표시줄 `Add Project`(사이드바 닫힘) | `Add Project` / `Ctrl-K Ctrl-O` | 그대로 | 통과 |
| 타이틀 바 폴더 이름 | `Recent Projects` / 없음 | 그대로 | 통과 |
| 사이드바 폴더 항목 | 툴팁 없음 | 1.5 s 머물러도 없음 | 통과 |

☰ 메뉴(실제 클릭으로 열어 DOM 덤프):

| 메뉴 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| 막대 | `workbench-tauri`, `File`, `View`, `Window` | 같음 | 통과 |
| File | `Open Folder...`, 구분선, `Close Window` | `Open Folder...` `Ctrl-K Ctrl-O` / 구분선 / `Close Window` `Ctrl-Shift-W` | 통과 |
| View | `Toggle Left Dock`, `Toggle Folder Sidebar`, `Focus Folder Sidebar`, 구분선, `Project Panel` | `Ctrl-B` / `Ctrl-Alt-J` / `Ctrl-Alt-;` / 구분선 / `Ctrl-Shift-E` | 통과 |
| 동작: File → `Open Folder...` | 폴더 선택 | 실제 클릭 → 선택 요청 1 → 등록 | 통과 |
| 동작: View → `Toggle Left Dock` 두 번 | Dock 닫힘·열림, 메뉴 닫힘 | 닫힘 → 열림, 포커스 `pane`, 메뉴 닫힘 | 통과 |
| 동작: View → `Focus Folder Sidebar` | 사이드바 포커스 | `sidebar-list` | 통과 |
| 동작: View → `Project Panel` | 패널 포커스 | `project-panel` | 통과 |
| 동작: View → `Toggle Folder Sidebar` 두 번 | 닫힘·열림 | 닫힘(포커스 `pane`) → 열림(포커스 `sidebar-list`) | 통과 |

스크린샷 `menu-file.png`, `menu-view.png`.

## 비활성이던 버튼들의 클릭 동작

| 요소 | 클릭 | 결과 | 판정 |
| --- | --- | --- | --- |
| 푸터 `Toggle Sidebar` | 실제 클릭 | 사이드바 닫힘, 상태 표시줄에 버튼 셋 | 통과 |
| 상태 표시줄 `Open Folder Sidebar` | 실제 클릭 | 사이드바 열림, 포커스 `sidebar-list` | 통과 |
| 상태 표시줄 `Close Left Dock` | 실제 클릭 | Dock 닫힘, 라벨 `Project Panel` | 통과 |
| 상태 표시줄 `Project Panel` | 실제 클릭 | Dock 열림, 포커스 `project-panel`, 라벨 `Close Left Dock` | 통과 |
| 푸터·상태 표시줄 `Add Project` | 실제 클릭 | R-11 표 | 통과 |
| 탭 바 끝 버튼 다섯(`Go Back`, `Go Forward`, `New…`, `Split Pane`, `Zoom In`) | 실제 클릭 다섯 번 | 모두 `disabled`, 목록·`state.json`·알림 변화 없음 | 통과(여전히 비활성) |

## 관찰

1. 목록을 마우스로 눌러도 포커스가 목록으로 들어가 키보드 커서 링이 보인다(`focus-visible` 구분 없음). 클릭한 직후에도 링이 보이는 것이 의도인지 판단은 사람 몫이다.
2. 시작 때 `state.json`에서 걸러낸 항목(중복 id, `path`가 문자열이 아닌 것)은 다음 쓰기에서 파일에서 빠진다(C5). 알 수 없는 *키*는 보존된다(S2).
3. `version`이 앱보다 클 때는 알림 없이 쓰기만 건너뛴다(C4). SPEC은 읽기만 한다고 했을 뿐 알림은 요구하지 않는다.
4. `WM_CLOSE` 경로의 프로세스 소멸이 약 1 s로 다른 경로(70~110 ms)보다 길다.
5. 탭 바 끝 버튼 아이콘 색(computed)이 `text.muted`와 같은 rgb(186, 194, 222)다(`icon.disabled`는 rgb(108, 112, 134)). Phase 1 R-10 요소라 이 Phase 판정에 넣지 않았다.
6. 창은 실행마다 위치가 달라진다. 한 번(S2) 클라이언트 아래쪽(y 1061)이 작업 표시줄 아래(작업 영역 높이 1032)에 걸려 아래쪽 단추를 못 눌러, 앱 창 위치만 `SetWindowPos`로 올렸다(크기는 그대로, 측정값에 영향 없음).

## 사용자 확인 필요 (V4)

스크린샷(`r16-missing-panel.png` 등)에서 보이는 것들이다. 앞 보고(v02-P4-1 판단 3)의 "ID 없는 값"이다.

1. 목록 세로 스크롤바가 OS 기본의 밝은 모양이라 다크 테마에서 눈에 띈다.
2. 빈 상태·경로 없음 패널의 문구와 버튼이 브라우저 기본 모양(여백 없음, 밝은 기본 버튼)이다.
3. 폴더 아이콘과 이름 사이 간격이 0이다.
4. 타이틀 바 폴더 이름 버튼의 글자 크기·좌우 여백이 기본값이다.

## 과정에서 생긴 일 (정직하게)

- **의도하지 않은 실제 선택 창.** 선택 창 응답을 대체하려고 처음에 `__TAURI_INTERNALS__.invoke`를 덮어쓰려 했는데 읽기 전용이라 조용히 실패했고, 그 상태로 등록 키를 보내 실제 창이 여러 번 열렸다. 그때 쌓인 창(약 15개)을 UI Automation으로 전부 취소했다(등록 없음, 목록·`state.json` 불변을 확인). 대체 방식을 CDP `Fetch`로 바꿨으나 새로 띄운 앱에서는 그 요청이 가로채지지 않는 경우가 있어(원인 미확인) 3번 더 실제 창이 열렸고 그때마다 취소했다. 마지막으로 페이지의 `window.fetch` 덮어쓰기로 바꾼 뒤에는 한 번도 실제 창이 열리지 않았다(요청 수 대조). 정리하면 지정한 "등록 1·취소 1" 외에 의도치 않은 실제 창이 약 18번 열렸다가 취소로 닫혔다.
- 타이틀 바 닫기 경로의 첫 시도 몇 번은 포인터가 이미 단추 위에 있어 `pointerover`가 일어나지 않아 등록이 일어나지 않았다(닫기만 됨). 포인터를 다른 곳으로 옮긴 뒤 다시 쟀고, 위 표는 유효한 실행만 적었다.
- 입력 중 한 번 UI Automation 스크립트가 "전경이 다른 앱(프로세스 15872)"이라며 멈췄다(전경을 앱이 쥐지 않은 시점에 앱을 새로 띄운 직후). 입력은 보내지 않았고 몇 초 뒤 전경이 앱으로 돌아와 이어갔다. 다른 프로세스는 건드리지 않았다.
- 앱 실행 횟수: 유효 측정 세션 15회(S1·S2·S3·C2~C6·닫기 5·탭 바 확인·S7)와 S1·S3의 재시작 2회, 그 밖에 진단·실패 재실행까지 합쳐 약 32회. "사례별 필요 최소"를 넘었다.
- 끝난 뒤 `%TEMP%\wb-v02-m4`와 `%APPDATA%\workbench-tauri`를 지웠다(둘 다 측정 전에 없었다).
