> 버전: v0.2 · 작성일: 2026-11-05 · 상태: 진행 중
>
> 실제로 한 일과 검증 결과를 기록한다. 계획은 `PLAN.md`에, 설계 결정은 `DECISIONS.md`에, 요구는 `SPEC.md`에 있다. 기존 기록은 지우지 않고 뒤에 더한다. 지난 버전의 기록은 `specs/v0.1/PROGRESS.md`에 있다(읽기만 한다).

# PROGRESS — workbench-tauri v0.2

## Phase별 진행

### Phase 1 — 뼈대: v0.1 PoC 화면 정리와 L-22 이후 치수

**판정** — R-10 충족(2026-11-05). 시작 상태의 치수는 V2 덤프로, Dock 폭 끌기(최소·최대)와 더블클릭 복귀는 V3로 판정했다. 지금 화면에 해당 요소가 없는 ID는 아래 "다음 Phase로 넘긴 것"에 적었다(leader 카드 W-v02-P1 지시).

**무엇을**
- 카드 v02-P1-1(구현 담당, V2)
  - `src/App.tsx`를 새로 썼다.
    - 사이드바: 헤더(창 끌기), 빈 폴더 목록 자리, 푸터. 푸터 왼쪽에 사이드바 토글, 오른쪽 끝에 폴더 추가가 있다(A-11.8).
    - 왼쪽 Dock: 빈 프로젝트 패널 자리와 크기 조절 손잡이.
    - Pane 하나: 탭 바는 [← →][빈 채움][+ 분할 최대화]이고 탭은 0개다. 본문은 비어 있다.
    - 상태 표시줄: 왼쪽 묶음에 프로젝트 패널 토글이 있다(사이드바 열림 상태, A-11.8).
    - 버튼 8개는 모두 비활성(`disabled`)이다(SPEC R-10, Q-B). 키맵 컨텍스트 `Workspace`·`Pane`은 유지했다.
  - `src/shell/Icon.tsx`(신규): SVG를 Vite `import.meta.glob(?raw)`로 인라인으로 넣는 `Icon`과 비활성 `IconButton`. `stroke="currentColor"`라 테마 글자색을 따른다.
  - `src/shell/dock.ts`(신규): 손잡이를 끌면 Dock 폭이 바뀌고, 더블클릭하면 기본 폭으로 돌아간다(L-32). 폭은 adopted stylesheet에 쓴다(인라인 style 아님). 하한·상한(L-31)은 CSS `min-width`·`max-width`로 건다.
  - `src/spec/metrics.ts`: R-10 ID를 더했다(`sidebar.footer.*`, `buttons.height.default`, `dock.resize_handle_width`·`dock.min_width`, `tab.end_buttons_area.*`, `tab.bar_icon_size`, `statusbar.padding_y`·`button_height`·`group_gap`·`item_gap`·`icon_size`). v0.1 고정 아이콘 전용이던 `icons.size.small`은 뺐다.
  - `src/app.css`: 뼈대 규칙을 다시 썼다. 탭 바 테두리는 양 끝 영역에 L-27, 채움에 L-63 `tab.border_width`를 쓴다. 두 Pane 규칙과 `.tab*` 규칙은 지웠다. 색은 기존 테마 토큰 변수만 쓴다.
  - `src/assets/icons/`(신규): Lucide SVG 8개와 `LICENSE-LUCIDE`. 앱 번들 자산이라 CSP·capability·의존성·Rust는 바꾸지 않았다.
- 카드 v02-P1-1-R1(구현 담당, V0): V3에서 나온 `dock.min_width` 불일치를 고쳤다. 포인터가 Dock 왼쪽을 넘으면 `dock.ts`가 음수 width를 써서 CSS가 선언을 버리고 기본 폭 240으로 돌아갔다. width를 0 아래로 내려가지 않게 자르고, 6까지는 CSS `min-width`가 맡는다.
- 카드 v02-M1·v02-M1-R1(V3 측정 담당): Phase 끝 V3 실측. 측정 드라이버 `tools/measure-m1.mjs`는 일회성이라 측정 뒤 지웠다(`tools/`에 남기지 않음).
- 카드 C-20(`check`): Phase 1 diff 검토와 전체 테스트 1회.

**들여온 Lucide 아이콘(D-20)** — Lucide 1.43.0, 파일 이름은 gpui-kit-assets 0.8.1의 kebab-case 규칙을 따랐다. 사용처는 gpui v0.3 `src/ui/layout.rs`와 같다.

| gpui `IconName` | 파일 | 쓰는 곳 |
| --- | --- | --- |
| PanelLeft | `panel-left.svg` | 사이드바 푸터 토글. 사이드바 닫힘 상태의 상태 표시줄 토글에도 쓴다(R-17) |
| Folder | `folder.svg` | 사이드바 푸터 폴더 추가. 닫힘 상태의 상태 표시줄 폴더 추가와 폴더 줄(R-11)에도 쓴다 |
| ArrowLeft / ArrowRight | `arrow-left.svg` / `arrow-right.svg` | 탭 바 ← / → |
| Plus | `plus.svg` | 탭 바 + |
| PanelRight | `panel-right.svg` | 탭 바 분할 |
| Maximize | `maximize.svg` | 탭 바 최대화 |
| FolderOpen | `folder-open.svg` | 상태 표시줄 프로젝트 패널 토글 |

- 라이선스 `LICENSE-LUCIDE`(ISC)를 원본 그대로 같은 폴더에 두었다.
- D-20 목록 가운데 아직 이 화면에 쓰이지 않는 `FolderClosed`, `File`, `Pin`, `Minimize`, `Close`, `Eye`, `BookOpen`, `Menu`는 들여오지 않았다. 쓰는 Phase에서 들여온다.

**지운 코드와 테스트** — 모두 v0.1 PoC 화면에서만 쓰였고 그 화면을 빼면서 고아가 됐다. 기능과 함께 지우는 것이라 `AGENTS.md` 9장의 "테스트를 통과시키기 위한 테스트 삭제"가 아니다(리더 결정(사용자 위임 2026-11-05), PLAN Phase 1).
- `src/workbench/store.ts`: 예제 탭 2개, 두 Pane 상태, 탭 이동.
- `src/workbench/panes.ts`: 두 Pane 사이 탭 이동 `moveTab`.
- `src/workbench/panes.test.ts`: `moveTab` 테스트. 테스트 수가 18개에서 17개로 줄었다.
- `src/editor/sample.ts`: index.html·style.css 예제 본문.
- catppuccin 고정 아이콘(`App.tsx`의 `HTML_ICON`, `.tab-icon` 규칙).

**남긴 고아 코드** — 지금 앱이 쓰지 않지만 Phase 5 R-26(최소 탭)에서 다시 쓴다.
- `src/syntax/highlight.ts`(`syntaxHighlighting`).
- `src/editor/extensions.ts`(`editorExtensions`, 편집기 E-0xx 규격). `BUFFER_FONT_FAMILY`를 쓰는 곳은 이것뿐이다.
- `src/syntax/grammar.ts`·`incremental.ts`는 테스트가 계속 쓰고, 테마·키맵 엔진·zlext 로드는 앱이 계속 쓴다. 고아가 아니다.

**leader 결정(2026-11-05)**
- 상태 표시줄 좌우 padding: L-28 원문은 "padding Base04"라고만 하고 toml에는 `statusbar.padding_y`만 있어, 좌우 값의 근거가 없다. 좌우는 0으로 두고 **스펙 미확정**으로 남긴다. 그래서 왼쪽 버튼이 사이드바 경계(x=300)에 붙어 있다. gpui v0.3은 사방 4다. 좌우 값을 넣으려면 gpui에서 toml ID를 먼저 정해 복사해야 한다(AGENTS 3장).
- 아이콘 획 두께: gpui와 같은 Lucide 원본 SVG(`stroke-width` 2, viewBox 24)를 그대로 쓰고, toml `icons.stroke_width`는 적용하지 않는다. 아이콘 모양은 SPEC 공통 판정 방식에서 판정하지 않는 항목이다.

**검증**
- 구현 담당 확인(v02-P1-1): `npm run typecheck` 에러 0, `npm run test` 17/17, `cargo check` 경고 0, `npm run tauri build -- --debug --no-bundle` 성공.
- V2 덤프(v02-P1-1, 창 1440×852, dpr 1, Mocha, 시작 상태, 조작 없음): 31행을 대조했다. 30행 통과, `tab.border_width`(채움 아래 테두리, L-63) 1행 불일치(측정 0). metrics.ts를 고칠 때 그 줄을 실수로 지운 것이 원인이라 되살렸고, 1회 실행 규칙에 따라 다시 띄우지 않고 V3로 넘겼다.
  - 통과한 ID: `sidebar.default_width`, `sidebar.header_height`, `sidebar.footer.{height,padding,gap,border_top,icon_size}`, `window.border_{sidebar_right,sidebar_header_bottom,workspace_top,workspace_bottom,dock_left}`, `project_panel.default_width`, `dock.resize_handle_width`, `dock.min_width`(computed 값), `tab.bar_height`, `tab.end_buttons_area.{padding_x,gap,border_bottom,border_start_right,border_end_left}`, `tab.bar_icon_size`, `statusbar.{height,padding_y,button_height,icon_size}`, `statusbar.group_gap`·`item_gap`(computed 값), 구조(Pane 1·탭 0·img 0, 버튼 disabled 8/8), 콘솔·Log 메시지 0.
  - V2 실행 경위: 기존 앱 인스턴스(PID 26396)가 debug exe를 잡고 있어 빌드가 막혔다. 임시 폴더 빌드는 WebView2를 공유해 CDP 포트가 열리지 않아 실패했다. 사용자 승인으로 PID 26396을 종료한 뒤 정상 경로로 1회 실행해 덤프했다. 실행은 실패 1회를 포함해 2회다.
- V3 실측(`specs/v0.2/verify/phase1.md`, 창 논리 1440×852, 100%, Mocha, 1920×1080 주 모니터, PID·HWND 고정, 입력마다 전경 확인)
  - v02-M1: `tab.border_width` 1px 통과, L-31 상한(본문 1140 − 손잡이 6 = 1134) 통과, 1134px 상태에서 더블클릭 → 240(L-32) 통과. `dock.min_width`는 불일치였다(기대 6, 측정 240). 원인은 위 R1의 음수 width다.
  - v02-M1-R1(불일치 항목만 재측정): 왼쪽 끝까지 끌면 6px 통과, 6px 상태에서 더블클릭 → 240 통과. 불일치 0.
  - 표기 정정: 카드가 더블클릭 기본 폭을 L-30이라 적었으나 SPEC대로 L-32다(L-30은 손잡이 폭).
  - 앱 데이터 폴더 `%APPDATA%\workbench-tauri`는 없어서 백업·복원할 것이 없었다. 시험 폴더는 쓰지 않았다.
- 검토 C-20(`check`): PASSED. R-10 대응, 수치 하드코딩 없음(metrics.ts 41개 키가 toml에 실재), 인라인 style 없음, CSP·capability·의존성 무변경, 삭제 코드가 고아이고 남긴 코드가 Phase 5용임, 아이콘 8개 모두 사용 중이고 `LICENSE-LUCIDE` 동봉, Solid props 구조 분해 없음, 측정 전용 코드 없음을 확인했다.
  - 전체 테스트 1회: `npm.cmd run typecheck` 에러 0, `npm.cmd run test` 17/17, `cargo check` 경고 0.

**다음 Phase로 넘긴 것**
- 사이드바 닫힘 상태(A-11.9)의 상태 표시줄 왼쪽 버튼 배치: 사이드바 토글이 생기는 Phase 4(R-17)에서 V3로 잰다.
- `statusbar.group_gap`·`statusbar.item_gap`의 실제 간격: 지금은 묶음·항목이 하나뿐이라 computed 값만 확인했다. 항목 간격은 닫힘 상태 왼쪽 묶음에 버튼이 둘이 되는 Phase 4(R-17)에서, 묶음 간격은 오른쪽 묶음(커서 위치)이 생기는 Phase 5(R-26)에서 잰다.
- 지금 요소가 없어 적용하지 않은 ID
  - `sidebar.min_width`·`sidebar.max_width`: 사이드바 크기 조절 손잡이의 위치·폭이 원문에서 미확인이다(A-11.12). 손잡이 스펙이 정해지면 넣는다.
  - `sidebar.item_row.height`, `sidebar.project_header.padding_left`·`padding_right`: 폴더 줄이 생기는 Phase 4(R-11·R-12)에서 넣는다.
  - `tab.content_height`, `tab.padding_x`, `tab.gap`, `tab.active_padding_bottom`, `tab.max_title_chars`: 탭이 생기는 Phase 5(R-26)에서 넣는다.
- 상태 표시줄 좌우 padding: 위 leader 결정대로 스펙 미확정이다.

### Phase 2 — 키맵 로더·액션·컨텍스트

**R-1 기대 바인딩 표(Phase 2 시작 때 고정, 2026-11-05, 카드 W-v02-P2a)**

- 출처
  - 01-zed `02-INTERACTION.md` 1절 키 표(Windows 기본 + VSCode 덧씌움 적용 결과, I-001·I-700)의 I-022~I-024, I-030~I-037, I-039~I-043.
  - 같은 문서의 I-310(9.1절), I-341·I-358(9.2절), I-517(11.1절).
  - `04-APP-SPEC.md`의 A-13.1·A-17.3~A-17.6.
- "키", "원문 컨텍스트", "원문 동작"은 원문 그대로 옮겼다. 원문에 컨텍스트가 없는 행은 "원문에 없음"이라고 적었다.
- "내장 컨텍스트"는 내장 키맵에 넣을 컨텍스트다.
  - 사이드바는 `Sidebar`, 메뉴는 `menu`다(D-3).
  - 원문 "작업 영역"·"창"은 `Workspace`다.
  - 원문에 없는 행(I-341·I-358)은 컨텍스트 없이 넣는다. gpui `src/keymap/builtin.rs`와 같다.
- 액션 이름은 D-2를 따른다.
  - 01-zed에 이름이 있으면 그 이름을 쓴다.
  - 없으면 gpui가 지은 이름을 쓴다(gpui `specs/v0.2/PROGRESS.md`, `src/keymap/mod.rs` `ACTIONS`).
  - 우리가 지은 이름은 아래 따로 둔 표에 있다.
- 행은 키 하나에 하나씩이다. gpui `specs/v0.2/verify/phase1/r1-bindings.md`의 60행에 gpui v0.2 D-2 이후 변경(A-18.11)으로 더한 I-341·I-358 2행을 붙여 62행이다.
- 같은 바인딩이 여러 행에 나온다. I-030·I-035의 `menu` 행과 I-517 행이 그렇다. 프로젝트 패널 요소는 `ProjectPanel`·`menu`·`not_editing`을 함께 컨텍스트로 갖는다(I-002).
- 표에 없는 키: I-310의 "열린 채 F10 = 닫기, Left/Right = 이전·다음 메뉴"는 메뉴 자체의 동작이라 R-8에서 다룬다. I-038은 원문이 "제외"다.
- 개정 2026-11-06(카드 W-v02-P5a, leader 결정(사용자 위임 2026-11-06)): I-532·I-533 2행을 더해 64행이다. 근거는 01-zed `02-INTERACTION.md` 우클릭 메뉴 표(I-532·I-533)의 키이고, gpui v0.3 `builtin.rs`와 같다. 두 액션 이름은 01-zed에 있어 아래 "지은 이름" 표에는 넣지 않는다. 기존 행은 고치지 않았다.

| ID | 키 | 원문 컨텍스트 | 원문 동작 | 내장 컨텍스트 | 액션 |
| --- | --- | --- | --- | --- | --- |
| I-022 | Ctrl+B | Workspace | 왼쪽 Dock 열기/닫기 | `Workspace` | `workspace::ToggleLeftDock` |
| I-023 | Ctrl+Shift+E | Workspace | 프로젝트 패널 포커스 토글 | `Workspace` | `project_panel::ToggleFocus` |
| I-024 | Ctrl+Alt+J | Workspace | 사이드바 표시 토글 | `Workspace` | `multi_workspace::ToggleWorkspaceSidebar` |
| I-024 | Ctrl+Alt+; | Workspace | 사이드바 포커스 | `Workspace` | `multi_workspace::FocusWorkspaceSidebar` |
| A-13.1 / A-17.6 | Ctrl+K Ctrl+O | 창 | 폴더 추가(등록). Zed에서는 `workspace::Open`이고 우리는 "폴더 등록"에 쓴다 | `Workspace` | `workspace::Open` |
| I-310 | F10 | 작업 영역 | 앱 메뉴 열기 | `Workspace` | `app_menu::Toggle` |
| I-341 | Ctrl+Q | 원문에 없음 | Quit <앱 이름> | 없음 | `zed::Quit` |
| I-358 | Ctrl+Shift+W | 원문에 없음 | Close Window | 없음 | `workspace::CloseWindow` |
| A-17.3 | Up | 사이드바 | 항목 이동 | `Sidebar` | `menu::SelectPrevious` |
| A-17.3 | Down | 사이드바 | 항목 이동 | `Sidebar` | `menu::SelectNext` |
| A-17.4 | Enter | 사이드바 | 선택한 폴더 활성화 | `Sidebar` | `menu::Confirm` |
| A-17.5 | Delete | 사이드바 | Remove (A-13.4) | `Sidebar` | `project_panel::RemoveFromProject` |
| I-030 | Up | ProjectPanel + menu | 이전 항목 선택 | `menu` | `menu::SelectPrevious` |
| I-030 | Down | ProjectPanel + menu | 다음 항목 선택 | `menu` | `menu::SelectNext` |
| I-030 | Home | ProjectPanel + menu | 처음 항목 선택 | `menu` | `menu::SelectFirst` |
| I-030 | End | ProjectPanel + menu | 끝 항목 선택 | `menu` | `menu::SelectLast` |
| I-030 | Tab | ProjectPanel + menu | 전역 menu의 다음 선택 | `menu` | `menu::SelectNext` |
| I-030 | Shift+Tab | ProjectPanel + menu | 전역 menu의 이전 선택 | `menu` | `menu::SelectPrevious` |
| I-031 | Left | ProjectPanel | 선택 항목 접기 | `ProjectPanel` | `project_panel::CollapseSelectedEntry` |
| I-031 | Right | ProjectPanel | 선택 항목 펼치기 | `ProjectPanel` | `project_panel::ExpandSelectedEntry` |
| I-032 | Ctrl+Left | ProjectPanel | 전체 접기 | `ProjectPanel` | `project_panel::CollapseAllEntries` |
| I-032 | Ctrl+Right | ProjectPanel | 전체 펼치기 | `ProjectPanel` | `project_panel::ExpandAllEntries` |
| I-033 | Space | ProjectPanel, 이름 편집 중 아님 | 파일 열기: 임시 탭으로 열고 트리에 포커스를 남긴다 | `ProjectPanel && not_editing` | `project_panel::Open` |
| I-034 | Enter | ProjectPanel | 이름 변경 (Windows 기본) | `ProjectPanel` | `project_panel::Rename` |
| I-034 | F2 | ProjectPanel | 이름 변경 | `ProjectPanel` | `project_panel::Rename` |
| I-035 | Enter | 이름 입력, ProjectPanel + menu | 확정 | `menu` | `menu::Confirm` |
| I-035 | Escape | 이름 입력, ProjectPanel + menu | 취소 | `menu` | `menu::Cancel` |
| I-036 | Ctrl+N | ProjectPanel | 새 파일 | `ProjectPanel` | `project_panel::NewFile` |
| I-036 | Alt+N | ProjectPanel | 새 폴더 | `ProjectPanel` | `project_panel::NewDirectory` |
| I-037 | Ctrl+C | ProjectPanel | 복사 (파일·폴더) | `ProjectPanel` | `project_panel::Copy` |
| I-037 | Ctrl+Insert | ProjectPanel | 복사 (파일·폴더) | `ProjectPanel` | `project_panel::Copy` |
| I-037 | Ctrl+X | ProjectPanel | 잘라내기 (파일·폴더) | `ProjectPanel` | `project_panel::Cut` |
| I-037 | Ctrl+V | ProjectPanel | 붙여넣기 (파일·폴더) | `ProjectPanel` | `project_panel::Paste` |
| I-037 | Shift+Insert | ProjectPanel | 붙여넣기 (파일·폴더) | `ProjectPanel` | `project_panel::Paste` |
| I-039 | Delete | ProjectPanel | 휴지통으로 보냄 (`skip_prompt=false`: 확인 있음) | `ProjectPanel` | `project_panel::Trash` |
| I-039 | Backspace | ProjectPanel | 휴지통으로 보냄 (`skip_prompt=false`: 확인 있음) | `ProjectPanel` | `project_panel::Trash` |
| I-040 | Shift+Delete | ProjectPanel | 영구 삭제 (확인 있음) | `ProjectPanel` | `project_panel::Delete` |
| I-040 | Ctrl+Delete | ProjectPanel | 영구 삭제 (확인 있음) | `ProjectPanel` | `project_panel::Delete` |
| I-040 | Ctrl+Backspace | ProjectPanel | 영구 삭제 (확인 있음) | `ProjectPanel` | `project_panel::Delete` |
| I-041 | Shift+Alt+C | ProjectPanel | 경로 복사 | `ProjectPanel` | `workspace::CopyPath` |
| I-041 | Ctrl+K Ctrl+Shift+C | ProjectPanel | 상대 경로 복사 | `ProjectPanel` | `workspace::CopyRelativePath` |
| I-042 | Menu 키 | ProjectPanel | 우클릭 메뉴 열기 | `ProjectPanel` | `project_panel::DeployContextMenu` |
| I-042 | Shift+F10 | ProjectPanel | 우클릭 메뉴 열기 | `ProjectPanel` | `project_panel::DeployContextMenu` |
| I-043 | Shift+Up | ProjectPanel | 선택 범위 확장 | `ProjectPanel` | `project_panel::SelectPreviousExtend` |
| I-043 | Shift+Down | ProjectPanel | 선택 범위 확장 | `ProjectPanel` | `project_panel::SelectNextExtend` |
| I-532 | Ctrl+Alt+R | ProjectPanel (우클릭 메뉴, 로컬 폴더) | Reveal in File Explorer | `ProjectPanel` | `project_panel::RevealInFileManager` |
| I-533 | Ctrl+Shift+Enter | ProjectPanel (우클릭 메뉴, 로컬 폴더) | Open in Default App | `ProjectPanel` | `project_panel::OpenWithSystem` |
| I-517 | Down | 원문에 없음 (우클릭 메뉴 공통) | 다음 | `menu` | `menu::SelectNext` |
| I-517 | Tab | 원문에 없음 (우클릭 메뉴 공통) | 다음 | `menu` | `menu::SelectNext` |
| I-517 | Ctrl-N | 원문에 없음 (우클릭 메뉴 공통) | 다음 | `menu` | `menu::SelectNext` |
| I-517 | Up | 원문에 없음 (우클릭 메뉴 공통) | 이전 | `menu` | `menu::SelectPrevious` |
| I-517 | Shift-Tab | 원문에 없음 (우클릭 메뉴 공통) | 이전 | `menu` | `menu::SelectPrevious` |
| I-517 | Ctrl-P | 원문에 없음 (우클릭 메뉴 공통) | 이전 | `menu` | `menu::SelectPrevious` |
| I-517 | Home | 원문에 없음 (우클릭 메뉴 공통) | 처음 | `menu` | `menu::SelectFirst` |
| I-517 | PageUp | 원문에 없음 (우클릭 메뉴 공통) | 처음 | `menu` | `menu::SelectFirst` |
| I-517 | Shift-PageUp | 원문에 없음 (우클릭 메뉴 공통) | 처음 | `menu` | `menu::SelectFirst` |
| I-517 | End | 원문에 없음 (우클릭 메뉴 공통) | 끝 | `menu` | `menu::SelectLast` |
| I-517 | PageDown | 원문에 없음 (우클릭 메뉴 공통) | 끝 | `menu` | `menu::SelectLast` |
| I-517 | Shift-PageDown | 원문에 없음 (우클릭 메뉴 공통) | 끝 | `menu` | `menu::SelectLast` |
| I-517 | Enter | 원문에 없음 (우클릭 메뉴 공통) | 실행 | `menu` | `menu::Confirm` |
| I-517 | Escape | 원문에 없음 (우클릭 메뉴 공통) | 닫기 | `menu` | `menu::Cancel` |
| I-517 | Ctrl-C | 원문에 없음 (우클릭 메뉴 공통) | 닫기 | `menu` | `menu::Cancel` |
| I-517 | Right | 원문에 없음 (우클릭 메뉴 공통) | 하위 메뉴 열기 | `menu` | `menu::SelectChild` |
| I-517 | Left | 원문에 없음 (우클릭 메뉴 공통) | 상위로 | `menu` | `menu::SelectParent` |

**우리가 지은 액션 이름(D-2)** — 01-zed에 이름이 없어 지은 것이다. gpui v0.2가 지은 16개(gpui `src/keymap/mod.rs` `ACTIONS`의 두 번째 값이 true인 것)와 같다. 표의 나머지 액션은 01-zed·02-gpui에 나온 이름이다.

| 액션 | 쓰는 행 |
| --- | --- |
| `app_menu::Toggle` | I-310 |
| `menu::SelectNext` | A-17.3, I-030, I-517 |
| `menu::SelectPrevious` | A-17.3, I-030, I-517 |
| `menu::SelectFirst` | I-030, I-517 |
| `menu::SelectLast` | I-030, I-517 |
| `menu::Cancel` | I-035, I-517 |
| `menu::SelectChild` | I-517 |
| `menu::SelectParent` | I-517 |
| `project_panel::CollapseSelectedEntry` | I-031 |
| `project_panel::ExpandSelectedEntry` | I-031 |
| `project_panel::CollapseAllEntries` | I-032 |
| `project_panel::ExpandAllEntries` | I-032 |
| `project_panel::Open` | I-033 |
| `project_panel::DeployContextMenu` | I-042 |
| `project_panel::SelectPreviousExtend` | I-043 |
| `project_panel::SelectNextExtend` | I-043 |

**판정** — R-1 충족, R-2 충족(2026-11-06). R-2의 "덮어쓴 키·`null` 키를 눌렀을 때의 실행 효과"는 아래 leader 결정에 따라 Phase 3 이후로 넘겼다.

**무엇을**
- 카드 v02-P2-C1(코어 구현 담당, V1): `src-tauri/src/lib.rs`에 `read_user_keymap` 명령과 앱 데이터 폴더 함수를 더했다.
  - `%APPDATA%\workbench-tauri\keymap.json`(D-6)의 문자열을 준다. 파일이 없으면 `None`, 읽기 실패면 오류 문자열을 준다.
  - JSON 파싱은 하지 않는다(D-4). 폴더를 만들지 않는다.
  - 앱 명령이라 capability를 더하지 않았다. 의존성도 바꾸지 않았다.
- 카드 v02-P2-1(프런트엔드 구현 담당, V1)
  - 새 파일
    - `src/keymap/builtin.ts`: 내장 키맵 데이터(위 기대 표 62행, Zed keymap.json과 같은 구조).
    - `src/keymap/user.ts`: JSONC 걷기, 파싱, 덧씌움, 오류 문구.
    - `src/keymap/load.ts`: `invoke('read_user_keymap')`와 알림.
    - `src/shell/toast.ts`: DOM 알림.
    - 테스트 `src/keymap/builtin.test.ts`, `src/keymap/user.test.ts`.
  - 고친 파일
    - `src/keymap/engine.ts`: `KeymapSection` 타입, `addSections`, `parseKeys` export. Menu 키 별칭(`ContextMenu` → `menu`)을 더했다.
    - `src/keymap/keyboard.ts`: 내장 키맵 등록과 액션 no-op 등록.
    - `src/index.tsx`: `installKeyboard` 앞에서 `await loadUserKeymap()`.
    - `src/app.css`: `.toast`.
  - 섹션 순서: 같은 깊이에서는 나중 바인딩이 이기므로(I-702) gpui `builtin.rs`와 같게 `menu` → 컨텍스트 없음 → `Workspace` → `Sidebar` → `ProjectPanel` → `ProjectPanel && not_editing`으로 두었다.
  - 액션 35개를 모두 no-op로 등록했다. v0.2 화면에 아직 실행부가 있는 액션이 없어서다. 해당 Phase가 `commands.set`으로 실행부를 갈아 끼운다.
  - 사용자 키맵 규칙(gpui `src/keymap/file.rs`와 같다)
    - 최상위가 배열이 아니거나 JSON이 깨지면 `Failed to load keymap file` 한 줄이고, 아무것도 적용하지 않는다.
    - 다음 경우는 그 항목만 `Failed to load keymap file`이다.
      - 섹션이 객체가 아니다.
      - `context` 타입이 틀렸거나 식이 틀렸다.
      - `bindings`가 객체가 아니다.
      - 액션 값이 문자열·`null`이 아니다. 인수 있는 꼴 `[이름, 인수]`도 여기에 든다.
    - 없는 액션은 `Action '{이름}' not found`다.
    - 오류는 항목마다 한 줄이고, 알림 하나에 잇는다. 나머지 바인딩은 적용한다(D-14).
    - 파일이 없으면 알림이 없다. 읽기 실패는 `Failed to load keymap file`이다.
    - 사용자 바인딩은 source `user`라 내장 위에 얹히고, `null`은 낮은 후보를 해제한다(I-703).
    - "알 수 있는 액션"은 `commands`에 등록된 이름, 곧 내장 키맵의 액션 35개다.
  - 알림은 테마 토큰 변수(`--panel-background`, `--text`)와 오른쪽 아래 고정만 쓴다. 누르면 닫힌다. 닫을 방법이 없으면 알림이 남아 있어서 넣었다.
- 카드 v02-P2-1-R1(프런트엔드 구현 담당, V1): V3 불일치를 고쳤다.
  - 원인: `keyboard.ts`의 `contextStack`이 포커스 요소의 조상에서만 `data-keymap-context`를 모았다. `Workspace`는 `App.tsx`의 `.workspace`에만 있었다. 그래서 시작 직후처럼 포커스가 `BODY`이면 `Workspace` 바인딩이 맞지 않았다.
  - `contextStack`이 언제나 `Workspace` 바탕 노드(`WORKSPACE_ROOT`)를 맨 앞에 두게 했다. Zed의 창 바탕 컨텍스트와 같다.
  - 깊이가 어긋나지 않게 `.workspace`의 `data-keymap-context="Workspace"`는 지웠다.
- 카드 v02-M2·v02-M2-R1(V3 측정 담당): Phase 끝 V3 실측.
  - `tools/win-input.ps1`에 키 이름 `;`(VK_OEM_1)와 `menu`/`apps`(VK_APPS)를 더했다. 일반 입력 도구라 남긴다.
  - 일회성 시험 스크립트는 `tools/`에 두지 않았다.
- 카드 C-21(`check`): Phase 2 diff 검토와 전체 테스트 1회.

**컨텍스트 술어(PLAN 완료 조건, D-3)** — 내장 키맵이 쓰는 술어는 식별자(`Workspace`, `Sidebar`, `menu`, `ProjectPanel`, `not_editing`)와 `&&`뿐이고, 컨텍스트 없는 섹션이 하나 있다. `>`·`key == value`는 쓰지 않는다. 그래서 엔진의 술어는 바꾸지 않았고 D-3 술어 테스트도 더하지 않았다.

**leader 결정(사용자 위임 2026-11-05/06)**
- R-2 덮어쓰기·`null` 해제의 키 실행 효과: 내장 액션이 모두 no-op라 지금은 키를 눌러도 결과가 보이지 않는다. 그 동작이 생기는 Phase의 V3에서 확인한다(Phase 3 이후로 넘김). 이번 V3는 알림 문구만 판정했다.
- 알림(toast) 치수: SPEC·toml에 크기·위치·테두리 ID가 없어 문구만 판정한다.
- gpui `ACTIONS`에 있지만 이 레포 기대 표에 없는 액션은 그 동작이 생기는 Phase에서 `commands`에 등록한다. 그 전에는 사용자 `keymap.json`에 써도 `not found`다. 해당 액션은 다음과 같다.
  - `workspace::Save`, `workspace::ToggleZoom`, `workspace::ActivatePane*`
  - `pane::CloseActiveItem`, `pane::TogglePinTab`, `pane::Split*`
  - `markdown::OpenPreview*`, `zed::Minimize`, `zed::Zoom`
  - `project_panel::RevealInFileManager`, `project_panel::OpenWithSystem`(우클릭 메뉴, Phase 5 R-23)

**검증**
- 구현 담당 확인
  - v02-P2-C1: `cargo check` 경고 0, `cargo test` 1/1.
  - v02-P2-1: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 22/22, `cargo check` 경고 0. 새 테스트 5개는 다음과 같다.
    - R-1 대조: `builtin.test.ts`가 이 문서의 기대 표를 읽어 내장 키맵과 줄마다 비교한다. 키는 정규화한다. 표 경계는 "R-1 기대 바인딩 표" 제목과 그 아래 "우리가 지은 액션 이름" 제목이다.
    - JSONC 걷기: 주석, 끝 쉼표, 문자열 안 `//`·`/*`, 이스케이프 따옴표, 닫히지 않은 주석.
    - 덧씌움과 `null` 해제.
    - 없는 액션·형식 오류가 섞인 입력에서 나머지를 적용하는지.
    - 깨진 JSON, 배열이 아닌 최상위, 빈 파일.
  - v02-P2-1-R1: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 22/22.
- R-1(V1): 위 대조 테스트가 통과했다. 기대 표 62행과 내장 키맵이 같고, 표 밖의 내장 바인딩은 없다.
- V3 실측(`specs/v0.2/verify/phase2.md`, 창 논리 1440×852, 100%, 1920×1080, 앱 기본 테마, PID·HWND 고정, 입력마다 전경 확인)
  - v02-M2, R-2 알림 문구 5개 통과. 시험마다 앱을 새로 띄웠다.
    - (a) 덮어쓰기: 알림 없음.
    - (b) `null` 해제: 알림 없음.
    - (c) 없는 액션: `Action 'foo::NoSuchAction' not found`.
    - (d) 주석·끝 쉼표·문자열 안 `//`·`/*`: 알림 없음.
    - (e) 잘린 JSON: `Failed to load keymap file`.
  - v02-M2, 키 이름 인식: `ctrl-alt-;`·`ctrl-k ctrl-o`·`f10`은 키 이름이 제대로 도착했다. 다만 시작 직후 포커스 `BODY`에서는 앱이 막지 않았다(`defaultPrevented` false). 이것이 불일치이고, 원인은 위 R1의 컨텍스트 스택이다.
  - v02-M2, Menu 키: keydown은 내장 바인딩이 없어 막지 않는다. `contextmenu` 이벤트는 막힌다.
  - v02-M2-R1(불일치 항목만 재측정): 세 키 모두 `defaultPrevented` true다. 콘솔 오류 0, 알림 0.
  - 앱 실행 횟수: M2 7회(시험 파일 5, 키 1, Menu 단독 1), R1 1회.
    - Menu 단독 실행은 `f10` 뒤에 Space keydown이 남은 것을 가려내려고 했다. Windows 시스템 메뉴 모드의 부산물로 보인다(추정).
  - 원상복구: 시험 `keymap.json`을 지웠다. 원래 없던 `%APPDATA%\workbench-tauri`도 지웠다. 앱 프로세스는 0이다.
- 검토 C-21(`check`): PASSED.
  - R-1·R-2 대응, 테스트가 PROGRESS 표를 직접 읽는지, JSONC 경계, K-085·K-091 문구를 확인했다.
  - `read_user_keymap`의 경로·분기를 확인했다. unwrap과 경고는 없다.
  - 하드코딩·인라인 style·CSP·capability·의존성 변경이 없다.
  - ponytail과 Solid 반응성에 문제가 없다.
  - 전체 테스트 1회: `npm.cmd run typecheck` 에러 0, `npm.cmd run test` 22/22, `cargo check` 경고 0, `cargo test` 1/1.

**다음 Phase로 넘긴 것**
- R-2 덮어쓰기·`null` 해제의 키 실행 효과: 그 동작이 생기는 Phase의 V3(Phase 3 이후).
- `keymap.json` 변경 감시와 다시 읽기: Phase 3(D-7 `notify`).
- Menu 키 keydown을 막을지: SPEC에 없어 판정하지 않았다. 우클릭 메뉴 키(I-042)는 `ProjectPanel` 컨텍스트라 Phase 5에서 확인한다.

### Phase 3 — 툴팁·메뉴와 단축키 표시

**R-8 메뉴 항목 목록(Phase 3 시작 때 고정, 2026-11-06, 카드 W-v02-P3a)**

- 출처
  - 01-zed `02-INTERACTION.md` 9.2절(최종 메뉴 구조 그림과 메뉴별 표).
  - `04-APP-SPEC.md` A-18.3~A-18.9를 대조했다.
- 고른 기준: v0.2(INTENT 범위)에서 동작하는 항목만 둔다(D-13). SPEC R-8이 기준으로 본 항목(gpui R-8과 같음)과 같다.
- 문구·순서·구분선
  - 9.2절 그대로다. 살아남은 그룹 사이의 구분선만 남기고, 선두·연속·끝 구분선은 없다(I-306).
  - 항목이 없는 메뉴(Edit, Selection, Go, Help)는 메뉴 바에 두지 않는다(D-13, I-306).
- 앱 이름: 첫 메뉴 이름은 `workbench-tauri`, Quit 항목은 `Quit workbench-tauri`다(D-13, A-18.10).
- `†`는 9.2절 범례상 "우리가 추가한 항목" 표시이고 문구가 아니다. 화면 문구에는 넣지 않는다.
- "넣는 Phase" 열: 그 항목의 동작이 생기는 Phase에서 메뉴에 넣는다(D-13, PLAN Phase 3 완료 조건).

메뉴 바: `[workbench-tauri] [File] [View] [Window]`

| 메뉴 | 순서 | ID | 문구 | 액션 | 넣는 Phase |
| --- | --- | --- | --- | --- | --- |
| workbench-tauri | 1 | I-341 | Quit workbench-tauri | `zed::Quit` | Phase 3 |
| File | 1 | I-346 | Open Folder... | `workspace::Open` | Phase 4 (폴더 등록, A-13.1) |
| File | — | I-349·I-351·I-355 | 구분선 (사이 그룹이 모두 빠져 하나로 줄인다, I-306) | | Phase 4 (위 항목과 함께) |
| File | 2 | I-358 | Close Window | `workspace::CloseWindow` | Phase 3 |
| View | 1 | I-391 | Toggle Left Dock | `workspace::ToggleLeftDock` | Phase 3 |
| View | 2 | I-472 † | Toggle Folder Sidebar | `multi_workspace::ToggleWorkspaceSidebar` | Phase 4 (R-17) |
| View | 3 | I-473 † | Focus Folder Sidebar | `multi_workspace::FocusWorkspaceSidebar` | Phase 4 (R-17) |
| View | — | I-400 | 구분선 | | Phase 3 |
| View | 4 | I-401 | Project Panel | `project_panel::ToggleFocus` | Phase 3 |
| Window | 1 | I-445 | Minimize | `zed::Minimize` | Phase 3 |
| Window | 2 | I-446 | Zoom | `zed::Zoom` | Phase 3 |

- Phase 3 끝의 메뉴
  - `workbench-tauri`: Quit workbench-tauri
  - File: Close Window
  - View: Toggle Left Dock, 구분선, Project Panel
  - Window: Minimize, Zoom
  - File의 구분선은 Open Folder...가 들어오는 Phase 4에서 함께 생긴다. 그 전에는 File 그룹이 하나뿐이라 구분선이 없다.
- 빠진 9.2절 항목: 위 표에 없는 9.2절 항목은 v0.2에서 동작하지 않아 두지 않는다. INTENT 제외 범위의 "☰ 앱 메뉴에서 v0.2에 동작하지 않는 항목"이다. A-18.3~A-18.9의 나머지 항목과 Edit·Selection·Go·Help 메뉴 전체가 여기에 든다.
- 액션 등록
  - `zed::Minimize`·`zed::Zoom`은 R-1 기대 표(내장 키맵)에 없다. 그래서 Phase 2 `commands` 등록 목록에도 없다. 원문 키도 "없음"이다(I-445·I-446).
  - Phase 2 leader 결정대로 이 Phase에서 `commands`에 등록한다.
  - 나머지 액션은 Phase 2에서 no-op로 등록되어 있다. 실행부는 그 동작이 생기는 Phase에서 넣는다.

**gpui v0.2 메뉴 목록과 다른 점** — gpui `specs/v0.2/PROGRESS.md`의 목록과 대조했다.
- gpui Phase 2 구현 결과는 workbench-gpui[Quit workbench-gpui] / File[Close Window] / View[Toggle Left Dock, 구분선, Project Panel] / Window[Minimize, Zoom]였다.
- gpui는 Open Folder...·Toggle Folder Sidebar·Focus Folder Sidebar를 다음 Phase(폴더)로 넘겼다(gpui D-031 ④).
- 항목·순서·구분선은 위 표와 같다. 다른 점은 둘이다.
  - 앱 이름: gpui는 `workbench-gpui`, 이 레포는 `workbench-tauri`다(D-13).
  - Phase 번호: gpui는 메뉴가 Phase 2, 폴더가 Phase 3이었다. 이 레포는 메뉴가 Phase 3, 폴더가 Phase 4다(PLAN).
- gpui `specs/v0.3/PROGRESS.md`에는 ☰ 메뉴 변경 기록이 없다.

**판정** — R-4 ~ R-9 충족(2026-11-06). R-5 대조표의 불일치는 재측정 뒤 0이다. Phase 2에서 미룬 R-2의 키 실행 효과도 이 Phase의 V3에서 확인했다(아래 검증).

**무엇을**
- 카드 v02-P3-C1(코어 구현 담당, V1): `notify` 8.2.1을 설치했다(PLAN 완료 조건, D-7).
  - `src-tauri/Cargo.toml`에 `notify = "=8.2.1"`, `Cargo.lock`도 8.2.1이다.
  - `src-tauri/src/lib.rs`: 앱 데이터 폴더를 감시한다. `keymap.json`의 생성·수정·삭제·이름 변경이면 `user-keymap-changed` 이벤트를 낸다. 파일 이름은 대소문자를 가리지 않고, 다른 파일 이벤트는 거른다.
  - 이벤트 권한은 기존 `core:event:allow-listen`·`allow-unlisten`이라 capability를 더하지 않았다.
- 카드 v02-P3-1(프런트엔드 구현 담당, V1): 툴팁·단축키 표시·다시 읽기.
  - 새 파일: `src/keymap/display.ts`(표시 문자열·키 고르기), `src/shell/tooltip.ts`(전역 DOM 툴팁·배치 계산), 테스트 `display.test.ts`·`tooltip.test.ts`.
  - R-5 표시: 포커스 컨텍스트 스택에서 키를 고르고, 없으면 창 전체에서 고른다(I-307). 형식은 Ctrl→Win→Alt→Shift→키, 구분자 `-`, 첫 글자 대문자, `PageUp`/`PageDown`이다. chord는 키 입력마다 덩어리 하나다. 바인딩이 없으면 단축키 영역이 없다(L-223). 표시를 열 때마다 계산한다.
  - R-6 툴팁: `body` 끝의 전역 `.tooltip` 하나다.
    - `tooltip.delay_default` 뒤에 그 순간 포인터 +`cursor_offset`에 뜬다. 바깥 상자 padding이 투명 여백이다.
    - 벗어남·창 `pointerleave`·blur·`pointerdown`·`wheel`·`scroll`에 사라진다. 누른 뒤에는 벗어났다 돌아올 때까지 다시 뜨지 않는다.
    - 창 오른쪽·아래를 넘으면 뒤집는다(L-210).
    - 위치는 adopted sheet로 준다(인라인 style 없음). 모양 ID는 모두 `metrics.ts`의 CSS 변수다.
  - 메뉴가 열린 동안 ☰ 툴팁이 없는 것(L-205)은 툴팁 spec 함수가 `null`을 돌려주는 것으로 했다.
  - R-4 프런트: `user-keymap-changed`를 받으면 `read_user_keymap`을 다시 불러 user 바인딩을 비우고 다시 얹는다. 파일이 없어지면 내장만 남는다. 읽기가 실패하면 이전 user 바인딩을 그대로 둔다.
  - R-7: 지금 화면의 요소(사이드바 토글·Add Project, 탭 바 버튼, 상태 표시줄 토글)에 문구를 달았다. 비활성 버튼에도 단다. 창 버튼에는 툴팁이 없다.
- 카드 v02-P3-2(프런트엔드 구현 담당, V1): ☰ 앱 메뉴와 메뉴 공통 동작.
  - 새 파일: `src/shell/menu.ts`(항목 이동·순환·팝업 배치), `src/shell/app-menus.ts`(메뉴 정의), `src/shell/AppMenu.tsx`(☰ 버튼·가로 바·팝업·`menu::*` 실행부), 테스트 `menu.test.ts`.
  - Lucide `menu` 아이콘을 더했다: `src/assets/icons/menu.svg`(gpui-kit-assets 0.8.1, ISC, `LICENSE-LUCIDE`는 Phase 1에 동봉). `IconName`에 `menu`를 더했다. Phase 1 "들여온 Lucide 아이콘" 목록의 `Menu`가 이것이다.
  - R-8: 위 "Phase 3 끝의 메뉴" 목록 그대로다. ☰를 누르거나 F10(`app_menu::Toggle`)이면 첫 메뉴가 열리고 ☰ 자리에 가로 바가 나타난다. 이름 hover로 전환하고, Left/Right는 끝에서 순환한다.
  - 실행부: `zed::Quit`·`workspace::CloseWindow`는 창 닫기(창이 하나라 앱 종료), `zed::Minimize`는 최소화, `zed::Zoom`은 최대화 토글이다. `zed::Minimize`·`zed::Zoom`을 `commands`에 등록했다(Phase 2 leader 결정). `workspace::ToggleLeftDock`·`project_panel::ToggleFocus`는 아직 no-op라 메뉴를 닫기만 한다.
  - 포커스: 열 때 저장하고 팝업으로 옮긴다. Escape·Ctrl-C·F10·항목 실행이면 열기 직전 포커스로 되돌린 뒤 실행한다(I-309). 바깥 클릭·포커스 잃음이면 되돌리지 않는다.
  - R-9: 치수 ID는 모두 CSS 변수다. 팝업 위치·창 가장자리 여백은 `placeMenu`가 쓴다. 바탕·그림자는 툴팁과 같은 elevation 규칙이다(I-320).
    - 비활성 항목은 회색이고 hover·클릭·키보드 이동에서 빠진다(지금 비활성 항목은 없다).
    - 닫힘은 바깥 `pointerdown`·Escape·실행·`focusout`이다(I-519). 열린 동안 항목의 액션 키가 맞으면 선택 표시 후 `menu.shortcut_activate_delay` 뒤 닫고 실행한다(I-520, `keyboard.ts`의 `hooks.beforeCommand`).
  - 메뉴 공통 로직은 `menu.ts`, 모양 CSS는 `.menu*` 하나다. Phase 5 우클릭 메뉴가 재사용한다.
  - 메뉴 항목 단축키도 열기 직전 포커스 컨텍스트로 `shortcutFor`를 불러 만든다(R-5).
  - L-232 두 줄 툴팁 간격을 `metrics.ts`의 `tooltip.multi.*` 네 ID로 옮겼다(아래 leader 결정).
- 카드 v02-P3-3(프런트엔드 구현 담당, V1): V3 불일치 4건을 고쳤다.
  - R-5 / I-704 가려진 키: 창 전체 대체가 가려짐 검사 없이 그 액션의 마지막 바인딩을 돌려줬다. 엔진에 `keyForAnywhere`를 더해 대체도 dispatch로 가려짐 검사를 거치게 했다. 스택 없는 `keyFor`는 지웠다. `!(A || B)` 같은 부정 묶음은 보이지 않는다는 한계를 `shortcut:` 주석으로 남겼다(내장·현재 사용에 없음).
  - F10 기본 동작: `BROWSER_KEYS`에 `f10`을 더해 바인딩과 무관하게 막는다. Alt 단독 `keyup`도 막는다.
  - R-9 최대 높이: `.menu`를 `border-box`로 바꾸고 `min-width`를 `menu.min_width + 2 × menu.border_width`로 보정했다.
  - F10으로 열 때 hover 전환: 가로 바 이름 전환을 `pointermove`로 바꾸고, 열 때의 포인터 위치와 좌표가 다를 때만 전환한다.
- 카드 v02-M3·v02-M3-R1(V3 측정 담당): Phase 끝 V3 실측(아래 검증).
  - `tools/win-input.ps1`에 키 이름 `home`·`end`·`pageup`·`pagedown`과 동작 `wheel`을 더했다. 일반 입력 도구라 남긴다. 일회성 스크립트는 `tools/`에 두지 않았다.
- 카드 W-v02-P3b(`writer`): L-232 값 4개를 gpui `spec/zed-metrics.toml` `[tooltip]`에 더하고(gpui 4badee1) 이 레포로 복사했다. 해시가 같다.
- 카드 C-22(`check`): Phase 3 diff 검토와 전체 테스트 1회.

**leader 결정(사용자 위임 2026-11-06)**
- 테마 토큰 4개를 `TARGET_TOKENS`에 더했다(T-40). 세 테마 모두 값이 있다. `theme.test.ts`의 목록도 28개다.
  - `elevated_surface.background`(T-40.6), `border.variant`(T-40.2): 툴팁 바탕·테두리(L-211).
  - `ghost_element.selected`(T-40.5): 키보드 선택·열린 메뉴 이름(I-514).
  - `text.disabled`(T-40.10): 비활성 항목(I-514).
  - `tools/theme-expect.mjs`의 24개 목록은 그대로다. 추가 변수가 거기서 보이지 않을 뿐 충돌은 없다.
- 가로 메뉴 이름 버튼의 좌우 padding과 ☰ 버튼 모서리는 toml에 ID가 없어 0으로 둔다. ID가 생기면 `metrics.ts`로 넣는다.
- ☰ 자리: 메뉴가 열린 동안 가로 바가 ☰ 자리를 대신한다(I-302 해석: 닫힘에는 ☰ 하나, 열리면 가로 바).
- L-232 두 줄 툴팁 간격: 원문 값(줄 사이 4, 둘째 줄 위 padding 4, 선 1px, 제목-키 8)을 gpui spec에 ID 4개로 더한 뒤 복사했다(gpui 4badee1).
  - `tooltip.multi.row_gap`, `tooltip.multi.separator_padding_top`, `tooltip.multi.separator_border_width`, `tooltip.multi.title_shortcut_gap`

**R-7 행의 판정 시점(PLAN 완료 조건)** — 화면에 아직 없는 요소의 R-7 행은 그 요소가 생기는 Phase에서 판정한다.
- Phase 4: 사이드바 폴더 항목(L-231), 타이틀 바 폴더 이름 Recent Projects(L-226), Open Folder Sidebar(L-251).
- Phase 5: 상태 표시줄 Project Panel 토글(L-253), 프로젝트 패널 항목 경로(L-247).

**검증**
- 구현 담당 확인
  - v02-P3-C1: `cargo check` 경고 0, `cargo test` 2/2(생성·수정·삭제·이름 변경과 무관 이벤트 필터).
  - v02-P3-1: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 25/25, `cargo check` 경고 0. 새 테스트는 표시 문자열·키 고르기·가려짐·창 전체 대체·`clear`, 툴팁 배치·뒤집기·0 고정이다.
  - v02-P3-2: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 28/28. 새 테스트는 `step`의 건너뛰기·순환·선택 불가, 바 순환, `placeMenu` 가장자리다.
  - v02-P3-3: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 29/29. 가려진 키·`null` 해제 표시와 `BROWSER_KEYS` F10 사례를 더했다.
- V3 실측(`specs/v0.2/verify/phase3.md`, 창 논리 1440×852, 100%, 1920×1080, Catppuccin Mocha, 라이트 알파만 One Light, HWND 고정, 입력마다 전경 확인)
  - R-4: 실행 중 `keymap.json` 쓰기 5회가 10~18 ms, 삭제 3회가 13~15 ms에 반영됐다. 툴팁·메뉴 단축키와 실제 키 동작이 모두 바뀌고, 삭제하면 내장으로 돌아간다.
  - R-2에서 미룬 키 실행 효과(Phase 2 "다음 Phase로 넘긴 것")를 이 Phase에서 확인했다.
    - `f10: null`이면 F10에 메뉴가 열리지 않는다.
    - `ctrl-b: app_menu::Toggle`이면 Ctrl+B로 메뉴가 열리고 닫힌다.
  - R-5: 툴팁·메뉴 단축키 DOM과 `builtin.ts`에서 따로 계산한 기대값의 대조표가 모두 일치한다. chord 간격 4, 덩어리 안쪽 여백 2·2.
  - R-6: 지연 505.4~515.5 ms, 위치·투명 여백·좌우와 아래 뒤집기 차이 0, 사라짐(벗어남·누름·휠·blur·창 밖), 모양 ID 전부, 그림자 두 겹(다크 0.06, 라이트 0.03), 두 줄 툴팁 간격 4·4·1·8.
  - R-7: 지금 화면 요소의 문구·키 전부. 비활성 버튼에도 `pointermove`가 와서 툴팁이 뜬다.
  - R-8: 클릭 열기, 가로 바(12px, 간격 4), hover 전환, Left/Right 순환, F10 열기·닫기, 포커스 복원, 항목 문구·순서·구분선, Quit·Close Window·메뉴 연 채 Ctrl+Q 종료, Zoom 토글, Minimize.
  - R-9: 폭 202, 테두리·모서리·패딩·마진·글자·줄 높이·구분선 13, 팝업 위치, 키 전부, 바깥 클릭·포커스 잃음·Escape·Ctrl-C 닫힘, 단축키 실행 51~57 ms, 브라우저 우클릭 메뉴 막힘.
  - v02-M3 불일치 4건
    1. R-5 / I-704: `ctrl-b`를 덮어도 ToggleLeftDock 툴팁·메뉴가 `Ctrl-B`를 보였다.
    2. `f10: null`이면 F10을 막지 않아 Windows 메뉴 모드가 되고 페이지가 응답하지 않았다.
    3. R-9: 메뉴 바깥 높이가 창 높이 × 0.75를 10 넘었다(content-box).
    4. 관찰: 포인터가 가로 바 이름 자리에 있으면 F10으로 연 메뉴가 포인터 밑 메뉴로 바뀌었다.
  - v02-M3-R1(불일치 항목만 재측정): 4건 모두 해소, 불일치 0.
    - 가려진 `Ctrl-B`는 툴팁·메뉴에서 빠지고 실제 Ctrl+B는 메뉴를 연다.
    - `f10: null`에서 F10 `defaultPrevented` true, 응답 유지. Alt 단독도 메뉴 모드가 되지 않는다.
    - 창 안쪽 높이 53에서 바깥 높이 39.75 = 0.75×53, 바깥 폭 최소 202.
    - 포인터를 `Window` 자리에 둔 채 F10이면 첫 메뉴가 유지되고, 포인터를 옮기면 전환된다.
  - 측정 불가(V1 테스트나 다음 Phase가 다룬다): 화면에 없는 R-7 요소(위 판정 시점), `tooltip.meta.font_size`(메타 줄 요소 없음), `PageUp`/`PageDown` 표시, 비활성 메뉴 항목 건너뜀, 입력칸 안 복사·붙여넣기, `scroll` 이벤트 자체, 포커스 복원이 명령보다 먼저인지(명령이 no-op), OS 스냅 팝업.
  - 원상복구: 원래 없던 `%APPDATA%\workbench-tauri`를 시험 뒤 지웠다(앱이 시작 때 이 폴더를 만든다). 앱 프로세스는 0이다.
- 측정 중 생긴 일(v02-M3)
  - 앱 실행 약 28회: "측정 세션당 앱 1회" 원칙(AGENTS 3A.4)을 넘었다. 유효 측정 세션 10회에 스크립트 시험·진단·실패 재실행이 더해졌다. 원인은 아래 사고와 측정 하네스 시행착오다. 재측정 R1은 3회다(키맵 시작 조건별 2회와 스크립트 실수로 다시 한 1회).
  - 최대화 버튼 hover 직후 입력이 앱에 닿지 않고 앱이 사라졌다. 원인은 가리지 못했다(스냅 팝업 추정). 그 결과는 쓰지 않았다.
  - 측정자의 키 순서 실수로 Close Window가 실행돼 앱이 한 번 종료됐다.
  - 응답 없는 Windows 설정 프로세스(`SystemSettings`, 2026-11-04 시작)가 전경을 쥐어 입력이 거부되자, measure가 그 프로세스를 `Stop-Process`로 종료했다. 사용자의 창이었을 수 있다. 이후 카드에서는 다른 프로세스를 종료하지 않는다.
- 검토 C-22(`check`): PASSED.
  - R-4~R-9 대응, `notify` 8.2.1 고정과 감시 필터, I-704·I-307 키 고르기를 확인했다.
  - `metrics.ts`의 키가 모두 `spec/zed-metrics.toml`에 있고, 추가 4개 키가 gpui 원본과 같다.
  - 인라인 style·CSP·capability 변경이 없다. 추가 토큰 4개가 T-40에 있다.
  - ponytail, Solid 반응성, 리스너 해제에 문제가 없다.
  - 전체 테스트 1회: `npm.cmd run typecheck` 에러 0, `npm.cmd run test` 29/29, `cargo check` 경고 0, `cargo test` 2/2.

**다음 Phase로 넘긴 것**
- 화면에 없는 요소의 R-7 행: 위 판정 시점대로 Phase 4·5.
- Open Folder...·File 구분선·Toggle/Focus Folder Sidebar 메뉴 항목: Phase 4(위 R-8 목록).
- `workspace::ToggleLeftDock`·`project_panel::ToggleFocus` 실행부: 그 동작이 생기는 Phase.
- 사이드바(Phase 4)·프로젝트 패널(Phase 5)이 `menu::SelectNext` 등을 같은 이름으로 쓴다. 지금 실행부는 앱 메뉴가 열렸을 때만 동작하므로 그 Phase에서 자기 핸들러를 앞에 잇는다.
- 우클릭 메뉴(Phase 5)는 `menu.ts`·`.menu*`를 재사용하고, `AppMenu.tsx`의 상태를 인스턴스별로 뺀다.
- 요소별 툴팁 지연(`project_panel.name_tooltip_delay`): Phase 5.

### Phase 4 — 사이드바 폴더 등록·선택·해제와 상태 저장

**판정** — R-11 ~ R-17, R-29의 이 Phase 몫 충족(2026-11-06). V3 불일치는 0이다. 트리·탭에 기대는 판정은 Phase 5에서 한다(아래).

**설치한 의존성(PLAN 완료 조건, D-7)**
- `tauri-plugin-dialog` 2.8.4(`Cargo.toml` `=2.8.4`).
- `@tauri-apps/plugin-dialog` 2.8.4(`package.json` 정확히 고정, 크레이트와 같은 버전).
- `windows` =0.62.2에 `Win32_Storage_FileSystem` feature.
- `serde_json` 1.0.154 직접 의존(`=1.0.154`, 아래 leader 결정).

**더한 capability(PLAN 완료 조건)** — `src-tauri/capabilities/default.json`
- `dialog:allow-open`: 폴더 선택 창(A-13.1).
- `core:window:allow-destroy`: 닫기 요청을 막고 쓰기를 마친 뒤 창을 닫는다(A-24.3, 아래 leader 결정).

**무엇을**
- 카드 v02-P4-C1(코어 구현 담당, V1): `src-tauri/src/lib.rs`, 새 `src-tauri/src/state.rs`.
  - 명령 `check_folder`, `paths_exist`, `read_state`, `write_state`. 파일 작업은 `spawn_blocking`에서 한다.
  - `state.json` 원자적 저장(A-24): `.tmp`에 쓰고 `sync_all`, 기존 파일이 있으면 `ReplaceFileW`, 없으면 `MoveFileExW`(`MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH`). 교체 재시도는 `app.state_replace_retry_delay`·`app.state_replace_retry_count`다.
  - 읽기 복구: `state.json`이 깨졌으면 `.tmp`를 쓰고, 깨진 파일은 `state.json.bad-{시각}`으로 옮겨 최근 `app.state_bad_max_keep`개만 남긴다. 알림 문구를 함께 돌려준다.
  - `version`이 앱보다 크면 읽기 전용(`writable` false)이고 쓰기를 막는다.
  - 교체 실패 재시도의 오류 주입 테스트는 생략하고 `shortcut:` 주석으로 한계를 남겼다.
  - dialog 플러그인을 등록했다.
- 카드 v02-P4-1(프런트엔드 구현 담당, V1): 사이드바·상태 저장.
  - 새 파일: `src/workspace/{paths.ts, folders.ts, state-file.ts, store.ts, workspace.test.ts}`, `src/shell/{Sidebar.tsx, ProjectPanel.tsx, panels.ts}`.
  - R-11 폴더 추가: 사이드바 푸터·상태 표시줄(사이드바 닫힘)·☰ File → Open Folder...·Ctrl+K Ctrl+O·빈 상태 `Open Project`가 모두 `workspace::Open`이다. 취소는 무반응이다. 고른 경로는 A-28로 정규화해 `check_folder`에 보내고, 실패하면 `Cannot open this folder.` 알림만 낸다. 같은 경로(대소문자·끝 `\` 무시)는 새 항목 없이 기존 항목을 활성화한다. 새 폴더는 맨 아래에 붙고 활성이다(`id`는 `crypto.randomUUID`, `added_at`은 ISO).
  - R-12 항목: Lucide Folder + 이름. 치수는 `sidebar.item_row.height`·`project_header.padding_*`·`item.icon_size`·`item.focus_border_width`다. 활성·hover·누름·키보드 링·경로 없음 상태를 토큰으로 칠한다. 같은 이름이면 ` · 바로 위 폴더`를 붙인다. 툴팁은 없다.
  - R-13 활성: 클릭·Enter·Up/Down. 키보드 커서는 활성과 따로 움직이고 끝에서 멈춘다. 활성화해도 포커스는 그대로다. 폴더별 작업 문맥은 폴더 id로 보관하는 자리만 두었다(해제 때 지운다). 타이틀 바는 활성 폴더 이름(40자 + `…`), 폴더가 없으면 `Open Recent Project`(SPEC R-13), 툴팁 `Recent Projects`, 눌러도 무동작이다.
  - R-14 해제: 우클릭 Remove, 사이드바 포커스의 Delete. 확인창이 없고 디스크를 건드리지 않는다. 다음 활성은 아래, 없으면 위, 없으면 빈 상태다.
  - R-15 순서: 우클릭 메뉴 Move Up / Move Down / 구분선 / Remove. 폴더 하나면 Remove만, 맨 위·맨 아래면 해당 항목 비활성이다. 빈 공간·버튼에는 메뉴가 없다. 우클릭 메뉴는 `AppMenu.tsx`의 같은 구현(`openContextMenu`)이다.
  - R-16 예외: 빈 상태 문구 + `Open Project`, 경로 없음 `This folder no longer exists.` + Remove(시작 때 `paths_exist`, 활성화할 때 다시 확인), 안쪽·바깥 폴더 둘 다 허용, 목록 세로 스크롤.
  - R-17 표시·포커스 키(`panels.ts`): Ctrl+Alt+J, Ctrl+Alt+;, Ctrl+B, Ctrl+Shift+E. 사이드바가 닫히면 상태 표시줄 왼쪽에 사이드바 토글·폴더 추가·프로젝트 패널 토글이 차례로 온다. 프로젝트 패널 토글 문구는 Dock 열림이면 `Close Left Dock`, 닫힘이면 `Project Panel`이다.
  - ☰ 메뉴에 Phase 4 항목을 넣었다(위 R-8 목록의 Open Folder..., File 구분선, Toggle Folder Sidebar, Focus Folder Sidebar).
  - `menu::SelectNext`·`SelectPrevious`·`Confirm`과 `project_panel::RemoveFromProject`는 사이드바 핸들러를 앞에 잇는다(포커스가 목록 안일 때만 동작). Phase 5 프로젝트 패널도 같은 방식으로 잇는다.
  - R-29: 시작 때 `read_state`, 알림이 있으면 띄운다. `windows[0]`의 `folders`·`active_folder_id`·`sidebar.width`를 읽는다(활성 id가 없으면 첫 폴더, 폭이 200~800 밖이면 300). 읽은 객체 전체를 보관하고 그 위에 세 필드만 덮어써 알 수 없는 키를 보존한다(A-20). 변경 뒤 `app.state_save_debounce` 지나면 `write_state`를 부른다. 실패하면 알림을 내고 dirty를 남겨 다음 변경 때 다시 쓴다.
  - 사이드바 폭 손잡이는 없다. 폭은 읽어서 적용하고 그대로 다시 쓴다.
- 카드 v02-P4-2(프런트엔드 구현 담당, V1): A-24.3 모든 닫기 경로의 종료 직전 쓰기.
  - `store.ts`의 `guardClose()`가 `onCloseRequested`에서 기본 닫기를 막고, 대기 중인 디바운스를 지우고, 쓰기 큐를 끝까지 기다린 뒤 `destroy()`로 닫는다. 쓰기가 실패해도 닫는다.
  - Quit·Close Window·타이틀 바 닫기 버튼은 모두 `close()`만 부른다. 그래서 Alt+F4·작업 표시줄 닫기와 같은 한 지점으로 들어간다.
  - 등록이 실패하면 닫기는 막히지 않고 쓰기 보장만 빠진다.
- 카드 v02-M4(V3 측정 담당): Phase 끝 V3 실측(아래 검증). `tools/win-input.ps1`에 키 이름 `delete`·`del`을 더했다. 일회성 스크립트는 `tools/`에 두지 않았다.
- 카드 C-23(`check`): Phase 4 diff 검토와 전체 테스트 1회.

**leader 결정(사용자 위임 2026-11-06)**
- `serde_json` 직접 사용: DECISIONS D-7의 JSON 줄(Q-7)에 개정 줄을 더했다. 코어가 `state.json`·`.tmp`가 올바른 JSON인지 가리고(A-24 복구) `version`을 봐야 해서(쓰기 차단) 파싱이 필요하다.
- `core:window:allow-destroy` 추가: A-24.3을 모든 닫기 경로(Alt+F4·작업 표시줄 포함)에서 보장하려면 `onCloseRequested`로 막고 쓴 뒤 `destroy()`해야 한다.
- 테마 토큰 3개를 `TARGET_TOKENS`에 더했다(31개, `theme.test.ts`도 31개): `border.focused`(A-12.5), `icon.muted`(A-12.1), `icon.disabled`(A-12.7).
- 사이드바 키보드 커서는 끝에서 멈춘다(A-17.3 "항목 이동"). 메뉴의 순환(I-518)과 다르다.
- toml에 ID가 없는 값은 기본값으로 둔다. ID가 생기면 `metrics.ts`로 넣는다.
  - 사이드바 항목 아이콘과 이름 사이 간격: 0.
  - 빈 상태·경로 없음 패널의 문구와 버튼의 크기·여백·글자: 브라우저 기본.
  - 타이틀 바 폴더 이름 버튼의 글자 크기·좌우 padding: 기본·0.

**Phase 5에서 판정하는 것(PLAN 완료 조건)** — 트리·탭에 기대는 판정이다.
- R-13: 폴더별 트리 펼침·선택·탭 유지.
- R-14: 해제 때 그 폴더 탭 닫기, 프로젝트 패널 루트 항목 `Remove from Project`(세 번째 해제 경로).

**Phase 3에서 미룬 것의 판정(PLAN 완료 조건)**
- ☰ 메뉴 Phase 4 항목: File(`Open Folder...` `Ctrl-K Ctrl-O`, 구분선, `Close Window`), View(`Toggle Left Dock`, `Toggle Folder Sidebar` `Ctrl-Alt-J`, `Focus Folder Sidebar` `Ctrl-Alt-;`, 구분선, `Project Panel`)의 문구·키·동작이 통과했다.
- R-7 Phase 4 행 8개가 통과했다: 푸터 Add Project, 푸터 사이드바 토글 두 줄, 상태 표시줄 프로젝트 패널 토글(Dock 열림·닫힘), 상태 표시줄 Open Folder Sidebar(L-251)·Add Project, 타이틀 바 폴더 이름 `Recent Projects`(L-226), 사이드바 폴더 항목 툴팁 없음(L-231).
- 프로젝트 패널 항목 경로(L-247)는 트리가 생기는 Phase 5에서 판정한다.

**검증**
- 구현 담당 확인
  - v02-P4-C1: `cargo check` 경고 0, `cargo test` 5/5(최초 저장·교체, `.tmp` 복구, 손상 파일 이름 충돌·3개 보관, 상위 버전 쓰기 차단).
  - v02-P4-1: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 36/36. 새 테스트 7개는 A-28 정규화·비교, A-12.6 같은 이름, A-13.1·13.2 추가·중복 활성화, A-13.5 다음 활성, A-13.6 이동·A-17.3 커서, A-20 알 수 없는 키 보존·활성 id 보정·version 읽기 전용·깨진 JSON, 파일 없음·폭 범위다.
  - v02-P4-2: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 36/36. 이벤트 처리는 Tauri API 호출이라 단위 테스트가 없다(코드 확인).
- V3 실측(`specs/v0.2/verify/phase4.md`, 스크린샷 `specs/v0.2/verify/phase4/`, 창 논리 1440×852, 100%, 1920×1080, Catppuccin Mocha, 대상 프로세스 고정, 입력마다 전경 확인). 판정 행 약 118개 통과, 불일치 0.
  - R-11: 실제 선택 창으로 등록 1·취소 1. 그 밖의 사례는 선택 창의 결과값만 페이지 쪽에서 대신 돌려줬다(뒤의 정규화·검사·목록·`state.json`은 실제 앱 코드). 파일·없는 경로·상대 경로·읽을 수 없는 폴더는 `Cannot open this folder.`만, 중복 경로 5사례, 진입 경로 5개.
  - R-12: `item_row.height` 31(39행), padding 8/6, 아이콘 14, 링 1px, 상태별 토큰이 CSS 변수 값과 같다. 툴팁 없음.
  - R-13·R-15: 활성 전환, 커서 분리, 끝에서 멈춤, 타이틀 40자 + `…`, Move Up/Down 표시·비활성·순서와 재시작 복원.
  - R-14 해제 전후 디스크 비교(`verify/phase4.md` "R-14" 표): 우클릭 Remove·Delete 두 경로 4단계 모두 시험 폴더가 전과 같다(185항목, 2036 바이트, 최신 수정 시각, 해시 `b585e4fccad4c628`). 확인창은 나오지 않았다.
  - R-16: 빈 상태, 시작 때 없는 경로, 실행 중 사라짐과 복귀, 안쪽·바깥 폴더, 많은 폴더 스크롤.
  - R-17: 키 13단계의 사이드바·Dock 표시와 `activeElement`, 사이드바 닫힘 상태의 상태 표시줄 배치, `statusbar.item_gap` 4·`button_height` 22·`icon_size` 14·`height` 30·`padding_y` 4.
  - R-29 재시작 전후 `state.json`과 복원(`verify/phase4.md` "R-29" 절)
    - S1(등록·활성 변경), S3(순서 변경), S2(폭 420)가 재시작 뒤 같은 목록·순서·활성·폭으로 복원됐다. 시작이 `state.json`을 고쳐 쓰지 않는다.
    - 미리 만든 파일 사례 6개: 알 수 없는 키 네 군데 보존, 깨진 파일 + 올바른 `.tmp`(복구·bad 3개 유지), 둘 다 깨짐(빈 상태), `version` 2(바이트 동일), `.tmp`만, 이상한 값(보정).
    - 닫기 5경로(타이틀 바 닫기, Close Window, Ctrl+Q, Alt+F4, 작업 표시줄 대체)에서 등록 뒤 75~140 ms 안에 닫아도 `state.json`에 새 폴더가 들어갔다. `.tmp`가 남지 않고 프로세스와 WebView2 자식이 모두 사라졌다.
  - 측정 불가
    - `statusbar.group_gap`: 왼쪽 묶음 하나뿐이라 간격이 그려지지 않는다. Phase 5(R-26, 오른쪽 묶음)에서 잰다.
    - 실제 작업 표시줄 닫기: 입력 도구로 겨냥할 수 없어 앱 창에 `WM_CLOSE`를 보내 대체했다(통과, 프로세스 소멸은 약 1 s로 다른 경로의 70~110 ms보다 느림).
    - 미측정: 프로젝트 패널 `Remove` 버튼 누르기, 타이틀 바 폴더 이름 버튼 무동작(코드 확인).
  - 관찰(판정 아님): 마우스로 눌러도 목록에 포커스가 들어가 키보드 링이 보인다. 읽을 때 걸러낸 항목(중복 id, 숫자 `path`)은 다음 쓰기에서 빠진다. `version` 초과 때 알림 없이 쓰기만 건너뛴다. 탭 바 끝 버튼 아이콘 색이 `text.muted`와 같다(Phase 1 요소).
  - 원상복구: 원래 없던 `%TEMP%\wb-v02-m4`와 `%APPDATA%\workbench-tauri`를 지웠다. 앱 프로세스는 0이다. 사용자 폴더는 등록하지 않았다.
- 측정 중 생긴 일(v02-M4)
  - 의도하지 않은 실제 선택 창 약 18번: 선택 창 응답 대체가 처음에 조용히 실패해 지정한 "등록 1·취소 1" 밖의 실제 창이 열렸다. 전부 UI Automation으로 취소했고, 등록·목록·`state.json`이 바뀌지 않은 것을 확인했다. 페이지의 `window.fetch` 덮어쓰기로 바꾼 뒤에는 열리지 않았다.
  - 앱 실행 약 32회(유효 세션 15, 재시작 2, 진단·실패 재실행): "사례별 필요 최소"를 넘었다.
  - 작업 표시줄 닫기는 `WM_CLOSE`로 대체했다(위 측정 불가).
  - 창 아래쪽이 작업 표시줄에 걸려 앱 창 위치만 `SetWindowPos`로 올렸다(크기는 그대로). 다른 프로세스는 건드리지 않았다.
- 검토 C-23(`check`): PASSED.
  - A-24.1~A-24.7·R-29 구현(교체 플래그, `sync_all`, 재시도·bad 보관 상수, version 차단), 프로덕션 코드에 unwrap 없음.
  - 의존성 정확한 버전과 capability 두 개만 추가, `guardClose`가 쓰기 실패에도 창을 닫는지, A-28 경로 비교.
  - 하드코딩·인라인 style 없음, ponytail, Solid 반응성·타이머 정리.
  - 전체 테스트 1회: `npm.cmd run typecheck` 에러 0, `npm.cmd run test` 36/36, `cargo check` 경고 0, `cargo test` 5/5.

**사용자 확인 필요(V4, Phase 종료 때)** — 측정으로 판단할 수 없는 시각 품질이다. 앞의 "ID 없는 값"과 겹친다.
1. 목록 세로 스크롤바가 OS 기본의 밝은 모양이라 다크 테마에서 눈에 띈다.
2. 빈 상태·경로 없음 패널의 문구와 버튼이 브라우저 기본 모양이다.
3. 폴더 아이콘과 이름 사이 간격이 0이다.
4. 타이틀 바 폴더 이름 버튼의 글자 크기·좌우 여백이 기본값이다.

**다음 Phase로 넘긴 것**
- 위 "Phase 5에서 판정하는 것"(R-13 트리·탭, R-14 탭 닫기·`Remove from Project`).
- R-7 프로젝트 패널 항목 경로(L-247).
- `statusbar.group_gap`: Phase 5 R-26.
- Phase 5 단축키(`ProjectPanel` 컨텍스트)는 아직 no-op다. 패널에 포커스가 있으면 그 키들이 기본 동작만 막는다.
- 사이드바 폭 조절(A-11.12)은 이 Phase에서 만들지 않았다.

### Phase 5 — 프로젝트 패널 트리·파일 작업·최소 탭과 시나리오

**판정** — R-3, R-18 ~ R-24, R-26 ~ R-28, R-30 충족(2026-11-06). V3 결함 B-0·F-1~F-5는 재측정 R1·R2 뒤 모두 해소되어 불일치 0이다. Phase 4에서 미룬 R-13·R-14의 트리·탭 부분과 남은 R-7 행도 판정했다. 휴지통 도착은 이 PC 설정 때문에 판정 불가다(아래 측정 불가).

**설치한 의존성(PLAN 완료 조건, D-7·D-19)**
- `trash` 5.2.9(`Cargo.toml` `=5.2.9`).
- `tauri-plugin-opener` 2.7.2(`=2.7.2`).
- `@tauri-apps/plugin-opener` 2.7.2(`package.json` 정확히 고정, 크레이트와 같은 버전).
- `windows` =0.62.2에 `Win32_UI_Controls` feature(`TaskDialogIndirect`).

**더한 capability(PLAN 완료 조건)** — `src-tauri/capabilities/default.json`
- `opener:allow-reveal-item-in-dir`: Reveal in File Explorer.
- `opener:allow-open-path`(`path: "**"`): Open in Default App. 등록 폴더를 미리 알 수 없어 모든 경로 범위다(아래 leader 결정).
- `core:path:allow-resolve-directory`: 홈 폴더 경로를 읽어 항목 툴팁의 `~` 치환에 쓴다(아래 leader 결정).

**R-30 시험 크기(PLAN 완료 조건, leader 고정)** — 큰 파일은 10MB HTML 1개(10,485,817 B), 큰 폴더는 파일 2,000개 × 100KB(204,800,000 B)다.

**무엇을**
- 카드 v02-P5-C1(코어 구현 담당, V1): 새 `src-tauri/src/files.rs`, `lib.rs`.
  - 파일 작업 명령: `list_dir`, `read_file`(바이트 IPC), `create_file`·`create_dir`·`rename_path`, `trash_paths`·`delete_paths`, `paste_paths`, `duplicate_path`, `confirm`(TaskDialog).
  - 붙여넣기·복제 이름은 ` copy`, ` copy 1` 순이고 덮어쓰지 않는다. 같은 폴더에 잘라 붙이면 아무 일도 하지 않는다. 다른 볼륨 이동은 복사 → 원본 대조 → 삭제다(gpui P3-D1·P3-D2). 심볼릭 링크·정션 복사는 재귀 위험을 피하려 오류로 처리한다.
  - opener 플러그인을 등록했다.
- 카드 v02-P5-1(프런트엔드 구현 담당, V1): 트리·탭.
  - 새 파일: `src/workspace/{tree.ts, tabs.ts, context.ts}`, `src/shell/{ProjectTree.tsx, Pane.tsx, tree-commands.ts, chain.ts}`, `src/editor/file-view.ts`, 테스트 `tree.test.ts`·`tabs.test.ts`. Lucide `file.svg`·`folder-closed.svg`를 더했다(D-20, 펼침 화살표는 gpui `panel_view`에 없어 들이지 않음).
  - R-18: 활성 폴더 루트가 맨 위, 자식이 폴더 하나뿐인 폴더는 한 줄로 합친다(`docs \ guides`). 정렬은 폴더 먼저, 대소문자 무시 자연 정렬(gpui `fsops/list.rs`와 같음). 치수는 `project_panel.item.*`·`indent_step`·`indent_guide.*`·`collapsed_path.padding_x`·`icons.size.medium`이다. 가상 스크롤은 고정 행 높이, 보이는 범위 ±10행만 DOM이다. 위치는 adopted sheet로 준다.
  - R-19: 클릭(폴더 토글, Alt+클릭 하위 전체, 파일 한 번 = 임시 탭, 더블클릭·가운데 클릭 = 일반 탭 + 편집기 포커스, Shift·Ctrl+클릭 선택)과 키(Up/Down/Home/End 끝에서 멈춤, Shift+Up/Down, Left/Right, Ctrl+Left/Right, Space). `ProjectPanel` 컨텍스트에 `menu`·`not_editing`을 함께 준다(gpui와 같음).
  - R-26 최소 탭: 임시 탭 `pane.max_preview_tabs` 1(자리 재사용·승격), 일반 탭은 활성 탭 바로 뒤, 제목 24자 말줄임, 임시 탭은 기울임. 탭 테두리는 L-63 표대로다. 내용은 CM6 읽기 전용, html·toml만 강조, UTF-8(깨진 바이트는 대체 문자), 읽지 못하면 빈 읽기 전용 탭이다.
  - R-24: 탭을 열거나 활성 탭이 바뀌면 그 파일의 상위 폴더를 펼치고 선택·스크롤한다(포커스는 옮기지 않음).
  - R-13·R-14: 폴더별 문맥(펼침·읽은 목록·선택·스크롤·탭)을 폴더 id로 보관하고 해제 때 버린다(탭의 CM6 view도 destroy).
  - R-3: 사이드바 Delete = `RemoveFromProject`, 패널 Delete = `project_panel::Trash`의 깊이 규칙을 `builtin.test.ts`에 테스트로 고정했다.
  - R-7: 프로젝트 패널 항목 툴팁 = 항목 경로, 지연 `project_panel.name_tooltip_delay`(툴팁에 항목별 지연 인자를 더함).
- 카드 v02-P5-2(프런트엔드 구현 담당, V1): 파일 작업·우클릭 메뉴.
  - 새 파일: `src/workspace/{names.ts, ops.ts, actions.ts}`, `src/shell/{tree-menu.ts, home.ts}`, 테스트 `names.test.ts`·`ops.test.ts`.
  - R-20 인라인 입력: Ctrl+N·Alt+N(대상 폴더·자리 규칙은 gpui와 같음), Enter·F2 이름 변경(루트 불가). 확정 규칙은 끝 마침표 제거, `/`·`\`로 끝나면 폴더, `a/b/c.rs`는 사이 폴더도 만듦, 빈 이름·Windows 금지 이름은 입력칸 유지, 같은 이름은 거부다. Escape는 버리고, 포커스를 잃으면 확정을 시도한다. 검증 배너(P-021)는 `inline_input.*` ID다.
  - 한글 조합: `isComposing`이거나 keyCode 229이면 Enter·Escape를 처리하지 않는다. `data-text-input` 입력칸의 키는 키맵에 넘기지 않는다.
  - R-21: Delete·Backspace = Trash, Shift+Delete·Ctrl+Delete·Ctrl+Backspace = Delete. 루트만 선택이면 무동작이다. 확인창은 코어 `confirm`(TaskDialog)이고 문구는 A-14.7~A-14.9, 실패 알림은 A-14.11이다.
  - R-22: 복사·잘라내기·붙여넣기·Duplicate·Copy Path·Copy Relative Path. 원본마다 `paste_paths`를 따로 불러 실패한 원본을 가리고, 실패는 알림 하나다.
  - R-23 우클릭 메뉴: 02 11.2·gpui 구성 그대로, Phase 3 공통 메뉴 `openContextMenu`를 재사용했다. Reveal·Open in Default App은 plugin-opener다. 루트 `Remove from Project`는 Phase 4 `removeFolder`를 재사용했다.
  - R-7 남은 행: 항목 툴팁에 홈 폴더 `~` 치환.
  - R-30 프런트: 디스크 호출이 모두 비동기이고 동기 루프가 없다.
- 카드 v02-P5-3(프런트엔드 구현 담당, V1): 내장 키맵 `ProjectPanel`에 `ctrl-alt-r` → `project_panel::RevealInFileManager`, `ctrl-shift-enter` → `project_panel::OpenWithSystem`을 더하고 우클릭 메뉴와 같은 실행부에 이었다. R-1 기대 표 개정(카드 W-v02-P5a, 위 Phase 2 절)과 맞춘 것이다.
- 카드 v02-P5-4(프런트엔드 구현 담당, V1, B-0만 V2 예외 1회): 결함 B-0·F-1·F-2·F-5와 R-30 큰 파일 정지(아래 결함과 수정 이력).
- 카드 v02-P5-C3·v02-P5-C4(코어 구현 담당, V1): 결함 F-3·F-4(아래).
- 카드 v02-M5·v02-M5-R1·v02-M5-R2(V3 측정 담당): Phase 끝 V3 실측과 재측정(아래 검증). `tools/win-input.ps1`에 키 이름(`backspace`·`insert`·`.`·`,`·`/`·`\`), `click -Mods`, `middleclick`, `type`(유니코드 입력)을 더했다. 일반 입력 도구라 남긴다.
- 카드 C-24(`check`): Phase 5 diff 검토와 전체 테스트 1회.

**P3-D 한계 `shortcut:` 주석 위치(PLAN 완료 조건, D-17)** — `src-tauri/src/files.rs`
- `transfer`의 원본 대조 부분(184행): 크기·시각이 같은 변경과 대조 뒤 삭제 전의 변경은 놓칠 수 있다.
- `reserve` 부분(257행): 이름을 확보한 뒤 `fs::copy` 전에 그 이름이 바뀔 수 있다.

**결함과 수정 이력**
- B-0 빈 창(v02-M5가 처음 실행해 발견): `Pane.tsx`의 `PaneBody`가 ref가 들어가기 전에 `createRenderEffect`에서 `body.replaceChildren`을 불러 `render()` 이후가 모두 건너뛰어졌다. Phase 5 구현 카드가 모두 V1(앱 실행 안 함)이라 이 측정이 첫 실행이었다.
  - M5는 scratch 사본에서 그 한 토큰만 막은 우회 빌드로 측정했다(레포 파일 무변경).
  - 수정(v02-P5-4): 효과를 ref 콜백 안에서 만든다. V2 예외 1회로 시작 화면이 채워지고 오류 0건을 확인했다. R1이 레포 빌드로 다시 확인했다.
- F-1 이름을 바꿔도 열린 탭 제목이 옛 이름: `followMove`가 탭 객체를 제자리에서 바꿔 다시 그려지지 않았다. 옮겨진 탭만 새 객체로 바꾼다(v02-P5-4). R1 해소.
- F-2 우클릭 메뉴 단축키가 02 11.2와 다른 별칭: 내장 키맵 `ProjectPanel` 순서를 gpui `builtin.rs`와 같게 했다(I-704 "마지막 바인딩" 규칙은 그대로). `display.test.ts`의 기존 기대값 `Copy → Ctrl-Insert`가 잘못된 별칭을 굳힌 것이라 02 11.2대로 Copy Ctrl-C·Paste Ctrl-V·Trash Delete·Delete Ctrl-Delete로 고쳤다(v02-P5-4). R1 해소.
- F-3 붙여넣기·복제로 만든 파일이 탭으로 열리지도 선택되지도 않음(I-097): 코어가 `\\?\`가 붙은 경로를 돌려줬다. 반환 경로를 입력 대상 폴더 형식으로 두고 verbatim 드라이브·UNC 접두어를 바꾼다(v02-P5-C3). R1 해소.
- F-4 다른 볼륨 이동(C:→D:) 실패(데이터 손실은 없음), 2단계로 고쳤다.
  - 1단계(v02-P5-C3): HRESULT를 Win32 오류로 정규화해 다른 볼륨·이름 충돌을 가린다. 실패한 복사에서 배타 예약한 빈 파일·폴더만 정리한다. R1에서 폴더 이동(작은 폴더와 200MB)은 성공했으나 단일 파일 이동은 여전히 실패했다.
  - 2단계(v02-P5-C4): `snapshot`이 루트 항목에 빈 상대 경로를 붙여 파일 경로 끝에 구분자가 생겨 실패했다. 루트는 원본 경로 그대로 검사한다. C:→D: 단일 파일 이동 회귀 테스트를 더했다. R2 해소.
- F-5 한글 조합 중 Esc 한 번이 입력 행 전체를 취소: Microsoft 한글 입력기가 조합 확정 뒤 `isComposing=false`인 Escape를 한 번 더 보낸다. 입력칸이 `compositionend` 시각을 기억하고 100 ms 안의 Escape를 무시한다(v02-P5-4, 100 ms는 스펙 ID가 아니라 `shortcut:` 주석). R1 해소.
- R-30 큰 파일 열기 정지(M5 측정값, 불일치 판정은 아님): 원인은 tree-sitter 첫 전체 동기 파싱이다(node에서 10MB HTML 전체 파싱 3,381 ms). 파싱을 8 ms 조각으로 나눠 조각마다 메인 스레드를 돌려주고, 뷰마다 새 Parser를 쓴다(v02-P5-4). 강조가 나타나기까지는 약 6 s로 늘었다. 조각 8 ms는 스펙 ID가 아니다(주석).

**leader 결정(사용자 위임 2026-11-06)**
- `opener:allow-open-path`의 `path: "**"` 범위를 받아들인다. Zed Open in Default App과 같은 범위다.
- 테마 토큰 2개를 `TARGET_TOKENS`에 더했다(33개, `theme.test.ts`도 33개): `error`(status.error), `warning`(status.warning). 입력칸 오류·경고 테두리와 배너 색(P-020·P-021)이다.
- R-1 기대 표에 `ctrl-alt-r`·`ctrl-shift-enter` 2행을 개정으로 더했다(I-532·I-533, 위 Phase 2 절).
- 루트 행 클릭이 루트를 접는 것은 그대로 둔다. I-089에 루트 예외가 없다.
- 홈 경로 권한(`core:path:allow-resolve-directory`)을 더해 R-7 항목 툴팁의 `~` 치환을 한다.

**Phase 4에서 미룬 것의 판정(PLAN 완료 조건)**
- R-13 트리·탭: 폴더를 오가도 펼침·선택·`scrollTop`·탭이 폴더별로 유지된다(`verify/phase5.md` S2 "R-13/R-14 폴더별 문맥").
- R-14 탭·세 번째 경로: 해제하면 그 폴더 문맥(탭 포함)이 버려진다(같은 경로로 다시 등록하면 탭 0개, 루트만 펼침). 프로젝트 패널 루트 우클릭 `Remove from Project`로 해제하면 다음 활성 규칙대로 옮겨 가고 디스크는 그대로다(S3 "R-14 해제와 탭").
- R-7 남은 행: 프로젝트 패널 항목 경로(L-247) 툴팁이 `~` 표기, 지연 1495 ms로 통과했다.
- `statusbar.group_gap`: 오른쪽 묶음이 아직 없어 간격이 그려지지 않는다(computed 8px만 확인). 미측정으로 남긴다.

**검증**
- 구현 담당 확인
  - v02-P5-C1: `cargo check` 경고 0, `cargo test` 7/7(이름 규칙·덮어쓰기 금지·재귀 복사·같은 폴더 cut·원본 변경 대조).
  - v02-P5-C3: `cargo check` 경고 0, `cargo test` 10/10(드라이브·UNC 경로 변환, HRESULT 판별, 이름 충돌 이동, 빈 예약 정리).
  - v02-P5-C4: `cargo check` 경고 0, `cargo test` 11/11(수정 전 C:→D: 단일 파일 실패를 재현, 수정 뒤 ADS 있음·없음 모두 이동 성공).
  - v02-P5-1: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 50/50, `vite build` 통과.
  - v02-P5-2: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 65/65, `vite build` 통과.
  - v02-P5-3: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 65/65(R-1 기대 표 대조 포함).
  - v02-P5-4: `npx tsc --noEmit` 오류 0, `npm.cmd run test` 66/66(조각 파싱, F-5 Escape).
- V3 실측(`specs/v0.2/verify/phase5.md`, 스크린샷 `specs/v0.2/verify/phase5/`, 창 논리 1440×852, 100%, 1920×1080, Catppuccin Mocha, 대상 프로세스 고정, 입력마다 전경 확인)
  - v02-M5(우회 빌드): 판정 행 263개 가운데 234개 통과, 불일치 14행 = 결함 F-1~F-5.
  - v02-M5-R1(레포 빌드, 불일치·막힌 항목만): 48개 가운데 39개 통과. B-0·F-1·F-2·F-3·F-5 해소, F-4는 폴더 이동만 해소.
  - v02-M5-R2(레포 빌드): 7개 모두 통과, F-4 단일 파일 이동 해소. 불일치 0.
  - R-3: 사이드바 Delete = 해제, 패널 Delete = 휴지통 확인창, 루트 Delete = 무동작, 같은 컨텍스트에 두 번 묶은 키는 나중 것.
  - R-18·R-19: 치수가 모두 toml 값(행 26, 들여쓰기 20, 안내선 x = 깊이×20+15 등), 가상 스크롤 DOM 41행/전체 184행, 클릭·키 전부.
  - R-20: 생성·이름 변경·취소·포커스 잃음 뒤 디스크와 트리, 선택 범위, 배너 문구·색, 루트 이름 변경 불가.
  - R-21: 확인창 문구·버튼·기본 취소·Esc·Enter, 여러 항목·넘치는 목록, 잠긴 파일 실패 알림, 삭제 뒤 선택.
  - R-22: ` copy`·` copy 1`, 덮어쓰지 않음, NTFS 스트림·수정 시각 보존, 같은 폴더 잘라 붙이기 무동작, 자기 안에 붙이기 실패 알림, 경로 복사, 다른 볼륨 복사·이동(파일·폴더). 이동 중 원본을 바꾼 시험에서 알림 하나, 원본 그대로, 대상에 복사본이 남았다(P3-D1).
  - R-23: 우클릭 메뉴 6종의 항목·순서·구분선·비활성·단축키가 02 11.2와 같다. 키보드 위치, 항목 실행, Reveal·Open in Default App 창이 열린다.
  - R-24, R-26(임시 탭 교체·승격, L-63 테두리 표 전 행, 읽기 전용, UTF-8 대체 문자, html·toml 강조), R-27, R-28.
  - 파일 작업 디스크 비교: 작업마다 전후 디스크(이름·크기·내용 해시·수정 시각)를 비교했다(`verify/phase5.md` S2b·S4a~S4d). 휴지통 목록도 전후로 비교했으나 휴지통이 꺼져 있어 도착은 판정하지 못했다(아래).
  - 두 시나리오 단계별 증거(`verify/phase5.md` 4절, 스크린샷 `r27-step*`·`r28-step*`)
    - A-33.2(R-27): 한 번 클릭 = 임시 탭(기울임) → 다른 파일 한 번 클릭 = 같은 자리 교체 → 더블클릭 = 일반 탭 + 편집기 포커스.
    - A-33.4(R-28): 실제 폴더 선택 창으로 두 번째 폴더 등록 → 폴더별 탭 → 오가도 탭이 따로 유지 → 하나를 해제해도 디스크의 그 폴더는 이름·크기·해시·수정 시각이 같다.
  - 03-tauri R-15 결과(SPEC R-21, `verify/phase5.md` 7절): `TaskDialogIndirect`로 사용자 문구 버튼(`Trash`·`Delete`)과 OS 언어 취소 버튼이 나온다. 기본 포커스는 취소 버튼이고 Enter(기본 버튼)·Esc 모두 취소다. 지우려면 `Trash`·`Delete`를 눌러야 한다. 창 제목은 `workbench-tauri`다. UI Automation 실측이다.
  - 03-tauri R-08 결과(`verify/phase5.md` S4e·11.7, Microsoft 한글 입력기 실제 입력): 조합 중 keydown(229)은 무시된다. 조합 중 Esc 한 번은 조합만 끝내고 입력 행을 남긴다(F-5 수정 뒤). 조합이 없을 때 Esc는 취소, Enter는 확정이다. 조합 중 Enter 한 번은 마지막 글자가 잘리지 않고 이름까지 확정한다(`한글.txt`). 조합 중 방향키는 트리 선택을 바꾸지 않는다.
  - R-30 측정값(원문에 기준이 없어 기록하면 충족, SPEC R-30)
    - 10MB HTML 열기: M5에서 메인 스레드가 약 2.8 s 멈췄다(하트비트 최대 2,762·2,945 ms, 키→선택 최대 2.6~2.8 s). 조각 파싱 뒤 R1에서 하트비트 최대 50·53 ms, 키→선택 14/14 응답 최대 8 ms, 메뉴 열림 2.5~8.9 ms다. 작업 없을 때 하트비트 최대는 12 ms다.
    - 재귀 복사 200MB(2,000×100KB): 11.6~11.9 s 동안 키→선택 0.5~1.2 ms, 하트비트 최대 13~28 ms.
    - 다른 볼륨 복사 200MB: 약 1.85 s 동안 0.5~1.4 ms, 하트비트 최대 13~23 ms.
    - 다른 볼륨 이동 200MB: R1에서 약 16 s에 성공(원본 삭제, 해시 2,000개 일치, 알림 없음). M5에서는 F-4로 시작 즉시 실패해 이동 중 응답을 재지 못했다.
  - 측정 불가·환경
    - 휴지통 도착: 이 PC는 C:·D:·E:·I: 모두 `NukeOnDelete=1`(휴지통 꺼짐)이다. Trash 호출 뒤 디스크에서 사라지는 것까지만 판정했다. 시스템 설정은 바꾸지 않았다(gpui v0.3 Q-16과 같은 사정).
    - Ctrl+Alt+R 실제 입력: R 키가 WebView에 닿지 않았다(같은 방식의 Ctrl+Alt+J는 닿음). 앱 밖 전역 단축키로 추정하나 확인하지 못했다. 패널 포커스에서 CDP 합성 Ctrl+Alt+R이 탐색기를 열어 앱 배선은 통과했다.
    - `statusbar.group_gap`: 오른쪽 묶음이 없어 미측정.
    - 입력 배너가 마지막 보이는 행에서 잘리는지: 시험하지 않았다(V4로).
  - 관찰(판정 아님): 루트 행 클릭이 루트를 접는다(위 leader 결정). 임시 탭이 있을 때 다른 파일 더블클릭의 첫 클릭이 임시 탭 자리를 재사용한다. CM6 `readOnly`라 `contenteditable`은 true다(입력만 막힘). 한글 Enter 한 번이 조합과 이름을 함께 확정한다.
  - 원상복구: 원래 없던 `%TEMP%\wb-v02-m5`·`src-tauri\target\wb-m5`·`%APPDATA%\workbench-tauri`를 지웠다. 우회 빌드로 덮어쓰였던 `target/debug/workbench-tauri.exe`는 레포 소스로 다시 빌드해 되돌렸다. 앱 프로세스는 0이다. M5가 연 탐색기·메모장 창만 닫았다.
- 측정 중 생긴 일(원칙 이탈)
  - v02-M5 앱 실행 약 45회(유효 세션 약 22, 나머지는 빈 창 진단·스크립트 오류 재실행): "필요 최소"를 넘었다. B-0 때문에 레포 빌드가 아닌 우회 빌드로 측정했다. R1은 8회(스크립트 오류로 무효 3회 포함), R2는 1회다.
  - OS 폴더 선택 창 7회: A-33.4의 등록 한 번을 위해 열렸다. 앞 6번은 UI Automation 도우미 실패로 닫히거나 Esc로 취소했고 등록·`state.json` 변화는 없었다. 7번째에 실제 키 입력으로 등록했다.
  - 측정 스크립트의 기대값 오기로 가짜 불일치가 생겨 다시 돌렸다. 표에는 마지막 실행만 있고, 기대값을 보정한 두 행은 그 사실을 행에 적었다.
  - 실제 입력이 아닌 대체: 해제한 폴더 재등록과 `Add Folders to Project…`의 선택 창 응답(페이지 `fetch` 덮어쓰기), Ctrl+Alt+R 배선 확인(CDP 합성 키).
- 검토 C-24(`check`): PASSED.
  - 데이터 손실 방지(배타 이름 확보, 덮어쓰기 금지, 다른 볼륨 원본 대조, 빈 예약 정리 조건, 루트 삭제 차단), `\\?\` 경로 정규화, 프로덕션 코드에 unwrap 없음.
  - 의존성 정확한 버전과 capability 3개(`open-path` `**`는 leader 결정으로 기록), TaskDialog 문구, 가상 스크롤·조각 파싱.
  - `metrics.ts` 112개 키가 toml에 있음, 인라인 style 없음, ponytail, Solid 반응성·뷰·리스너 정리(B-0 수정 포함).
  - 전체 테스트 1회: `npm.cmd run typecheck` 에러 0, `npm.cmd run test` 66/66, `cargo check` 경고 0, `cargo test` 11/11.

**사용자 확인 필요(V4, Phase 종료 때)** — Phase 4 목록에 더한다.
5. 트리 이름·입력칸·배너·탭 제목의 글자 크기·색, 활성 조각 밑줄, 빈 탭 목록 자리(ID 없는 값).
6. 입력 배너가 목록 마지막 보이는 행에서 잘리는지(`shortcut:` 주석의 한계, 시험하지 않음).
7. 확인창이 OS 기본 TaskDialog 모양(제목·경고 아이콘·버튼)이고 취소 버튼 글자가 OS 언어(`취소`)다.

**다음 Phase로 넘긴 것**
- `statusbar.group_gap`: 오른쪽 묶음이 생길 때.
- 바깥 변경 반영(R-25, 트리 펼침·탭 경로가 바깥 이름 변경·삭제를 따라가는 것): Phase 6.
- 하위 폴더 읽기 동시 요청 개수 제한 없음(`shortcut:` 주석), 큰 파일 강조 지연 약 6 s(조각 파싱의 대가).
- 열린 탭 닫기·삭제된 파일 탭 표시는 D-10·D-17대로 그대로 둔다.

### Phase 6 — 디스크 감시

없음.

## 사용자 요청 작업

- Phase 3·4 PROGRESS 보완(2026-11-06): Phase 3·4 커밋(787e793, 2ee70ee)에 PROGRESS 기록이 빠져 후속 커밋으로 보완한다. Phase 3·4 절의 무엇을·결과·검증과 PLAN 진행 현황의 커밋 번호를 채웠다.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
