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

없음.

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
