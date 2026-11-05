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

없음.

### Phase 4 — 사이드바 폴더 등록·선택·해제와 상태 저장

없음.

### Phase 5 — 프로젝트 패널 트리·파일 작업·최소 탭과 시나리오

없음.

### Phase 6 — 디스크 감시

없음.

## 사용자 요청 작업

없음.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
