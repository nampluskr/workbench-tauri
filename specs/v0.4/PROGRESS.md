> 버전: v0.4 · 작성일: 2026-11-06 · 상태: 진행 중
>
> 실제로 한 일과 검증 결과를 기록한다. 계획은 `PLAN.md`에, 설계 결정은 `DECISIONS.md`에, 요구는 `SPEC.md`에 있다. 기존 기록은 지우지 않고 뒤에 더한다. 지난 버전의 기록은 `specs/v0.2/PROGRESS.md`에 있다(읽기만 한다).

# PROGRESS — workbench-tauri v0.4

## Phase별 진행

### Phase 1 — 정리와 일치: clippy, 편집기 커서 폭·열 선택, 스펙 ID 없는 값

**Phase 1 시작 고정 목록** (2026-11-06, 카드 W-v04-P1a)

clippy 기준선(R-1)

| 명령 | 경고 수 | 기록한 사람·날짜 |
| --- | --- | --- |
| `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` | 경고 2건(impl-core v04-P1-C1), 고친 뒤 0건 | impl-core, leader 전달(2026-11-06) |

R-13 요청 대상 목록 — v0.2 PROGRESS "버전 종료"의 "스펙 ID가 없어 기본값으로 둔 값"과 "스펙 미확정·원문 추정"에서 골랐다. "근거"는 01-zed에 그 요소의 값이 원문(소스 인용)으로 있는지다.

| 항목 | 01-zed 근거 ID | 원문 값 | 근거 | 처리 |
| --- | --- | --- | --- | --- |
| 사이드바 항목 아이콘과 이름 사이 간격 | A-12.1 | 값 없음. 아이콘은 우리 앱이 더한 것이다(A-12.1 "우리 앱 값") | 없음 | 기본값 유지 |
| 빈 상태·경로 없음 패널의 문구·버튼 크기·여백·글자 | A-16.1, A-16.2 | 문구와 버튼 구성만 있고 치수가 없다 | 없음 | 기본값 유지 |
| 타이틀 바 폴더 이름 버튼 글자 크기 | L-88, L-05 | L-88에 크기가 없다. L-05 "라벨 기본 = Default(14)"는 일반 규칙이다 | 일반 규칙만 | 적용(L-05): 기존 `typography.size.default`. 새 키 없음(리더 결정(사용자 위임 2026-11-06)) |
| 타이틀 바 폴더 이름 버튼 좌우 padding | L-88 | 값 없음 | 없음 | 기본값 유지 |
| 가로 메뉴 이름 버튼 좌우 padding | I-321 | 글자 12·버튼 사이 gap 4만 있다(이미 `menu.horizontal.item_font_size`·`menu.horizontal.item_gap`). "버튼 hitbox는 아이콘 크기와 같지 않다"뿐 padding 값이 없다 | 없음 | 기본값 유지 |
| ☰ 버튼 모서리 | I-321, L-85 | "Subtle 버튼"뿐 모서리 값이 없다 | 없음 | 기본값 유지 |
| 트리 이름 글자 크기 | L-36, L-05 | L-36은 줄 높이 24만. 글자 크기는 L-05 일반 규칙 Default(14)뿐이다 | 일반 규칙만 | 적용(L-05): 기존 `typography.size.default`. 새 키 없음(리더 결정(사용자 위임 2026-11-06)) |
| 인라인 입력칸 글자 크기 | P-019 | 높이 24만(이미 `inline_input.height`) | 없음 | 기본값 유지 |
| 입력 배너 글자 크기 | P-021, L-05 | P-021 "글자 Small(14px)". L-05는 Small = 12다. 두 원문이 어긋난다 | 충돌 | 기본값 유지(ambiguous). gpui `spec/ambiguous.md` 1절에 `P-021` 행을 더하고 이 레포 `spec/ambiguous.md`로 복사했다(SHA-256 같음 `05c7b066…639ac5`, 리더 결정(사용자 위임 2026-11-06)) |
| 탭 제목 글자 크기 | L-61~L-69, L-05 | 탭 절에 크기가 없다. L-05 일반 규칙 Default(14)뿐이다 | 일반 규칙만 | 적용(L-05): 기존 `typography.size.default`. 새 키 없음(리더 결정(사용자 위임 2026-11-06)) |
| 트리·입력칸·배너·탭 제목 글자 색 | A-12.1, L-47, P-021 | 테마 토큰(`text`, `text.muted`, `status.*`)이다 | 토큰 | toml 대상 아님. 토큰 CSS 변수로 쓴다 |
| 접힌 경로 활성 조각 밑줄 | L-43 | 조각 padding 2(이미 `project_panel.collapsed_path.padding_x`)와 hover 배경만 있고 밑줄이 없다 | 없음 | 기본값 유지(밑줄 근거 없음) |
| 빈 탭 목록 자리 | L-70 | 마지막 탭 뒤 빈 드롭 영역 24(이미 `tab.overflow.empty_drop_width`)뿐, 탭이 없을 때의 자리 표시는 없다 | 없음 | 기본값 유지 |
| 사이드바 최소·최대 폭 | L-33 | 범위 200~800 | 있음 | 이미 `sidebar.min_width`·`sidebar.max_width`가 있다. 새 키 없음 |
| 사이드바 폭 조절 핸들 | A-11.12, A-40.12 | 위치·너비·커서·더블클릭을 "확인하지 못했다" | 없음 | 기본값 유지(핸들 없음) |
| 상태 표시줄 좌우 padding | L-28 | 값 없음 | 없음 | 기본값 유지 |
| 트리 아이콘 크기 | L-40 | Medium 16 "(추정)", `spec/ambiguous.md`에 있음 | 추정 | 기본값 유지 |
| 컨텍스트 메뉴 항목 높이 | I-508 | 약 25 "추정", `spec/ambiguous.md`에 있음 | 추정 | 기본값 유지 |

- 더한 toml 키: 없음. 원문 근거가 있는 항목은 이미 toml에 ID가 있거나(사이드바 최소·최대 폭) 일반 규칙의 기존 ID(`typography.size.default`)뿐이었다.
- `spec/ambiguous.md`: gpui에 `P-021` 한 줄을 더하고 이 레포로 복사했다(W-v04-P1b).
- gpui `spec/zed-metrics.toml`을 바꾸지 않았으므로 복사도 하지 않았다. 두 파일의 SHA-256이 같다(`d3ba752d…a436f`, 2026-11-06).
- 검증: V0. 01-zed 원문 대조, toml grep, `sha256sum`.

**v04-P1-C1 clippy 경고 0건 (R-1)** (2026-11-06)
- 무엇을 했나: `impl-core`가 clippy 기준선을 재고 경고 2건을 고쳤다. `src-tauri/src/files.rs` 79행 `manual_unwrap_or_default`(confirm 작업 실패 때 `false`를 `unwrap_or_default()`로), 288행 `useless_conversion`(`DeleteFile: true.into()` → `true`).
- 결과: 경고 2건 → 0건. 동작 변경 없음(`bool` 기본값이 `false`). 새 `#[allow]` 없음.
- 검증: V0. `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` 통과, `cargo check` 경고 0, `cargo test` 14 통과.
- 특이사항: 없음.

**v04-P1-1·P1-2·P1-3 커서 폭, Ctrl+Shift 열 선택, 글자 크기 (R-12, R-13)** (2026-11-06)
- 무엇을 했나
  - P1-1(`impl`): `src/spec/metrics.ts`에 `editor.cursor_width`(E-012), `src/editor/extensions.ts` 테마 `.cm-cursor`의 `borderLeftWidth`를 그 변수로. `rectangularSelection`의 `eventFilter`를 왼쪽 버튼 + Ctrl + Shift로(E-047 첫 항목), `EditorState.allowMultipleSelections.of(true)`(없으면 CM6가 열 선택 범위를 하나로 줄인다. 이 앱은 basicSetup을 쓰지 않는다).
  - P1-2(`impl`): `crosshairCursor`를 뺐다(아래 leader 결정). `typography.size.default`(L-05)를 `metrics.ts`에 더하고 `src/app.css`의 `.tree-label`(트리 이름)·`.tab-title`(탭 제목)·`.project-name`(타이틀 바 폴더 이름)에 썼다(R-13, 리더 결정(사용자 위임 2026-11-06)). 세 곳은 16px 상속에서 14px로 작아졌다.
  - P1-3(`impl`, F-1 수정): `EditorView.clickAddsSelectionRange.of((e) => e.altKey)`를 더했다. 근거는 E-046(Alt+클릭 = 커서 추가, `multi_cursor_modifier` 기본 `"alt"`). CM6는 이 facet이 없으면 Windows에서 Ctrl을 "범위 더하기"로 읽어 Ctrl+Shift 끌기가 끌기 전 선택을 남겼다. 다중 커서 수정 키를 Alt로 고정해 Ctrl+Shift 끌기는 새 열 범위만 남는다. 부수 효과로 Ctrl+클릭은 범위를 더하지 않고 Alt+클릭이 더한다(Zed 기본과 같다).
- 결과
  - R-12: 커서 폭과 Ctrl+Shift 끌기 열 선택이 Zed 값과 같다. Alt+Shift 끌기·가운데 버튼 끌기는 넣지 않았다(D-11). 이미 된 3건(E-002·E-015·E-030)은 손대지 않았다.
  - R-13: gpui toml에 더한 키 0건. L-05 일반 규칙으로 기존 `typography.size.default`를 세 요소에 적용했다. 입력 배너 글자 크기는 원문 충돌(P-021 "Small(14px)" 대 L-05 Small 12)이라 기본값 그대로이고, gpui `spec/ambiguous.md`에 기록했다(gpui 커밋 `8eb170e`, 이 레포 `spec/ambiguous.md` 복사본 SHA-256 같음). 나머지 항목은 위 고정 목록대로 기본값 유지다.
- 검증: V1. 카드마다 `npm.cmd run typecheck` 통과, `npm.cmd run test` 72/72. 한 줄 설정이라 새 테스트는 두지 않았다(SPEC R-12 판정 방법, 루트 `AGENTS.md` 4.4).
- 특이사항
  - `.cm-cursor`의 `margin-left`는 CM6 기본 −0.6px 그대로다. 스펙 값이 없어 추정하지 않았다.
  - 인라인 이름 입력(`.tree-input`)의 글자 크기는 이번에 바꾸지 않았다(고정 목록 "기본값 유지").

**leader 결정 — 십자 커서 제거** (2026-11-06)
- 무엇을 했나: P1-1이 더한 `crosshairCursor({ key: "Control" })`를 빼게 했다(P1-2).
- 결과: Ctrl·Ctrl+Shift·끌기 중에 십자 커서가 나오지 않는다.
- 검증: V3(v04-M1 3.3절, 관측 6회 모두 `cm-crosshair` 없음·`cursor` auto).
- 특이사항: E-047에 십자 커서 근거가 없다. 리더 결정(사용자 위임 2026-11-06).

**v04-M1·M1-R1 Phase 1 끝 V3 실측** (2026-11-06)
- 무엇을 했나: V3 측정 담당이 레포 소스로 새로 만든 debug exe를 창 논리 1440×852, DPI 96에서 실제 OS 입력(PID 고정, 전경 가드)으로 재고 CDP로 값을 읽었다. 1차(M1)에서 F-1을 찾고, P1-3 수정 뒤 F-1 항목만 다시 쟀다(M1-R1).
- 결과
  - M1: 판정 15행 가운데 통과 14, 불일치 1(F-1: Ctrl+Shift 끌기 뒤 범위 7개 — 열 범위 6개 + 끌기 전 커서). `.cm-cursor` 2px, 열 범위 줄 3~8 모두 5→15열, 십자 커서 없음, 트리 이름·탭 제목·폴더 이름 14px.
  - M1-R1: 판정 4행 모두 통과. Ctrl+Shift 끌기 뒤 열 범위 6개만, Ctrl+클릭은 범위를 더하지 않음(1개), Alt+클릭은 더함(2개), 일반 클릭 1개. F-1 해소.
  - 결과 파일: `specs/v0.4/verify/phase1.md`(1~7장), 스크린샷 `phase1-columns.png`.
- 검증: V3.
- 특이사항: 앱 실행은 M1 2회(첫 실행은 측정 스크립트의 속성 이름 오류로 입력 전에 끝남, 판정은 둘째 실행만), M1-R1 1회. `state.json`은 백업·복구했고 SHA-256이 같다. 시험 폴더 삭제, `tools/` 변경 없음(`drag`에 `-Mods`를 받게 한 임시 사본은 scratch에만).

**C-v04-P1 Phase 1 끝 검토** (2026-11-06)
- 무엇을 했나: `check`가 Phase 1 diff와 보고서를 검토하고 전체 테스트를 1회 돌렸다.
- 결과: PASSED. 지적 없음(참고 3건: E-046로 F-1을 한 줄로 고친 것, `P-021` ambiguous 등재, V3 안전 수칙 준수).
- 검증: `npm.cmd run typecheck` 통과, `npm.cmd run test` 72/72, `cargo check` 경고 0, `cargo test` 14 통과, `cargo clippy --all-targets -- -D warnings` 통과.
- 특이사항: 없음.

**Phase 1 판정** (2026-11-06)
- 결과: R-1, R-12, R-13 충족. V3 불일치 0(F-1 해소).
- 검증: 위 항목들.
- 특이사항: V4 목록에 1건을 더했다(아래).

### Phase 2 — 탭 편집과 저장

**R-1 기대 바인딩 표(v0.4)(Phase 2 시작 때 고정, 2026-11-06, 카드 W-v04-P2a)**

- v0.4 SPEC에는 R-1(키맵 표)이 없다. 이 표는 v0.2 R-1 기대 표를 v0.4 키로 넓힌 것이고, `src/keymap/builtin.test.ts`가 읽는 형식(v0.2와 같은 제목·열)을 따른다. v0.4 SPEC R-14가 이 표를 판정에 쓴다.
- 출처
  - v0.2 `specs/v0.2/PROGRESS.md` Phase 2의 R-1 기대 표 64행(2026-11-06 개정 포함). 행은 고치지 않고 그대로 옮겼다.
  - 01-zed `02-INTERACTION.md` 1절 키 표의 I-005(Ctrl+S만, SPEC R-4), I-008, I-056(실행 취소·다시 실행만). 액션 이름은 같은 문서 9.2절 I-352(`workspace::Save`), 8절 L-240(`pane::CloseActiveItem`), 9.2절 I-359(`editor::Undo`)·I-360(`editor::Redo`)에 있다.
- "키", "원문 컨텍스트", "원문 동작"은 원문 그대로 옮겼다. I-008의 원문 컨텍스트 "Pane, Workspace"는 두 컨텍스트에 각각 한 행씩 둔다.
- 넣지 않은 것: I-005의 Ctrl+N·Ctrl+Shift+S(SPEC R-4), I-056의 Ctrl+C·Ctrl+X·Ctrl+V(카드 범위 밖. 편집기 복사·붙여넣기는 WebView 기본 동작이다). v0.4의 나머지 키(I-010, I-014, I-018~I-020, I-086)는 Phase 3에서 이 표에 개정으로 더한다(SPEC R-14).
- 64 + 8 = 72행이다.

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
| I-005 | Ctrl+S | Workspace | 저장 | `Workspace` | `workspace::Save` |
| I-008 | Ctrl+W | Pane, Workspace | 활성 탭 닫기. `close_pinned=false`라 핀 탭은 보호 | `Pane` | `pane::CloseActiveItem` |
| I-008 | Ctrl+W | Pane, Workspace | 활성 탭 닫기. `close_pinned=false`라 핀 탭은 보호 | `Workspace` | `pane::CloseActiveItem` |
| I-008 | Ctrl+F4 | Pane, Workspace | 활성 탭 닫기. `close_pinned=false`라 핀 탭은 보호 | `Pane` | `pane::CloseActiveItem` |
| I-008 | Ctrl+F4 | Pane, Workspace | 활성 탭 닫기. `close_pinned=false`라 핀 탭은 보호 | `Workspace` | `pane::CloseActiveItem` |
| I-056 | Ctrl+Z | Editor | 실행 취소 | `Editor` | `editor::Undo` |
| I-056 | Ctrl+Y | Editor | 다시 실행 | `Editor` | `editor::Redo` |
| I-056 | Ctrl+Shift+Z | Editor | 다시 실행 | `Editor` | `editor::Redo` |
| I-059 | Tab | Editor | 들여쓰기. 편집기에서 Tab을 포커스 이동으로 바꾸지 않는다 | `Editor` | `editor::Tab` |
| I-059 | Shift+Tab | Editor | 내어쓰기. 편집기에서 Tab을 포커스 이동으로 바꾸지 않는다 | `Editor` | `editor::Backtab` |

- 개정 2026-11-06(카드 W-v04-P2b, leader 결정(사용자 위임 2026-11-06)): I-059 2행을 더해 74행이다. 근거는 01-zed `02-INTERACTION.md` I-059("들여쓰기 / 내어쓰기. 편집기에서 Tab을 포커스 이동으로 바꾸지 않는다")다. Phase 2 V3 재측정에서 편집기의 Tab이 포커스를 옮기는 것이 발견됐다. 01-zed에 두 액션 이름이 없어 `leader`가 준 이름을 쓰고 아래 "지은 이름" 표에 적었다. 기존 행은 고치지 않았다.

**우리가 지은 액션 이름(D-2)** — v0.2 표와 같다. 이번에 더한 행의 액션(`workspace::Save`, `pane::CloseActiveItem`, `editor::Undo`, `editor::Redo`)은 01-zed에 이름이 있어(I-352, L-240, I-359, I-360) 이 표에 넣지 않는다.

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
| `editor::Tab` | I-059 (개정 2026-11-06, leader 지정) |
| `editor::Backtab` | I-059 (개정 2026-11-06, leader 지정) |

**R-5 인코딩 시험 바이트 위치** (2026-11-06, 카드 W-v04-P2a)
- 시험 바이트(인코딩·BOM·줄 끝별)는 `test-fixtures/encoding/`에 둔다. 만드는 쪽은 `impl-core`다. 디코딩(`node --test`)과 인코딩(`cargo test`)이 같은 파일을 읽는다(PLAN Phase 2 완료 조건). 파일 목록은 만든 카드의 기록에 적는다.

**v04-P2-C1 코어: 인코딩 저장, 원자적 저장 공통화, 확인창 버튼 (R-4·R-5·R-6)** (2026-11-06)
- 무엇을 했나: `impl-core`가 `encoding_rs` =0.8.44를 설치하고(crates.io 최신 안정판, D-2), `src-tauri/src/text_io.rs`와 명령 `save_text(path, text, encoding, lineEnding)`·`confirm_buttons(title, main, content, buttons)`를 더했다. `state.rs`의 쓰기·교체·재시도를 한 함수로 나눠 `state.json`과 파일 저장이 같이 쓴다(D-4). 시험 바이트 `test-fixtures/encoding/`(아래)와 `.gitattributes`(시험 바이트 변환 막기)를 만들었다.
- 결과
  - `save_text`: 줄 끝 적용 → 인코딩 → CP949 손실 검사 → 원자적 저장, 쓴 바이트를 돌려준다. 실패는 `kind`·`chars`(손실 글자) 또는 `message`·`kept_tmp`(남긴 임시 파일 경로)다.
  - 임시 파일은 대상 폴더에 `create_new`로 만들고 `sync_all` 뒤 교체한다. 교체 실패 때 원본이 있으면 임시 파일을 지우고, 원본이 없으면 남겨 경로를 알린다. 재시도는 `state.rs` 앱 상수(`app.state_replace_retry_*`)를 같이 쓴다.
  - `confirm_buttons`: 사용자 버튼 최대 3개, 기본 버튼은 마지막(취소), Esc·표시 실패도 마지막 인덱스다. 기존 `confirm`(삭제 확인창) 경계는 그대로다.
  - 시험 바이트: `utf8-lf.txt`, `utf8-crlf.txt`, `utf8-bom.txt`, `utf16le-bom.txt`, `utf16be-bom.txt`, `cp949.txt`(본문 `한글 A\n둘째 줄\n`, CRLF 파일은 CRLF), `unmappable.txt`(UTF-8 `😀₩¥`). 디코딩 테스트(`node --test`, `src/editor/text-io.test.ts`)와 인코딩 테스트(`cargo test`, `text_io::tests`)가 같은 파일을 읽는다.
- 검증: V1. `cargo test` 17 통과(시험 바이트 왕복, CP949 손실 거부, 교체 실패 때 원본 유지·임시 삭제, 원본 소실 때 임시 보존, 대상 없음 `MoveFileExW`). `cargo clippy --all-targets -- -D warnings` 경고 0, `cargo check` 경고 0.
- 특이사항: 03-tauri R-15는 코드로 버튼 배열·기본 버튼·Esc·실패 처리를 확인했고, 실제 창은 V3(v04-M2)에서 쟀다.

**v04-P2-1 프런트엔드: 탭 편집·저장·닫기·충돌 (R-2~R-7)** (2026-11-06)
- 무엇을 했나: `impl`이 새 파일 `src/editor/text-io.ts`, `src/workspace/doc.ts`, `src/workspace/closing.ts`(각 테스트)와 Lucide `close.svg`를 더하고, `file-view.ts`·`extensions.ts`·`context.ts`·`watch.ts`·`store.ts`·`tabs.ts`·`Pane.tsx`·`Icon.tsx`·`app-menus.ts`·`builtin.ts`·`keyboard.ts`·`metrics.ts`·`theme.ts`·`app.css`를 고쳤다.
- 결과
  - R-2: 읽기 전용을 Compartment로 풀었다(읽지 못한 파일만 읽기 전용). 수정 판정 `isDirty`(충돌 → 수정, 지워짐 → 비지 않으면 수정, 그 밖은 문서 ≠ 저장 기준 텍스트). 수정 점은 시작 슬롯 안 `tab.indicator_size` 원, 색 `--text-accent`(새 토큰 `text.accent`), 충돌이면 `--warning`. 사람의 편집(userEvent)일 때만 임시 탭을 승격한다(I-063). `editor.tab_size`는 `EditorState.tabSize`로 준다. IME는 CM6 기본이다.
  - R-3: 탭 문서마다 순서 번호 하나를 열기·다시 읽기·저장이 공유하고 마지막 요청만 반영한다. 저장 때문에 버린 읽기는 저장 뒤 한 번 다시 읽는다. 닫힌 탭의 결과는 버린다.
  - R-4: Ctrl+S `workspace::Save`. 깨끗한 탭은 쓰지 않는다. 저장 중 경로가 바뀌면 깨끗해지지 않는다. 자기 저장 뒤 기준 해시 = 쓴 바이트의 SHA-256이다. 실패는 E-083 문구 알림이다.
  - R-5: 디코딩은 BOM → UTF-8(fatal) → `TextDecoder("euc-kr")`. CP949 디코딩이 node 22와 WebView2에서 모두 WHATWG 표로 된다(`cp949.txt` 시험 통과). 원본 바이트 해시는 `crypto.subtle` SHA-256.
  - R-6: E-081(경로는 폴더 기준 상대 경로, `editor.confirm_close.path_max_chars`로 앞쪽을 자름), E-082(창 닫기·Quit·Close Window, 모든 폴더 문맥의 탭), E-083, 창 제목 `Warning`. 닫기 경로는 Ctrl+W·Ctrl+F4·닫기 버튼(hover 때만 보임)·가운데 클릭이 모두 같은 확인을 거친다. 닫은 뒤 활성은 I-072 `history`. 닫기 버튼 툴팁 `Close Tab`(L-240).
  - R-7: `judgeDisk` — 같은 해시 → 변화 없음, 다름 + 깨끗 → 다시 읽기, 다름 + 수정 → 충돌, 없음 → 지워짐(취소선). E-084 Overwrite / Discard Edits / Cancel, E-085 Save(다시 만듦) / Close / Cancel.
  - ☰ File 메뉴: Save(I-352, Ctrl+S 표시), Close Editor(I-356, `close_pinned = true`라 단축키 표시 없음).
- 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 91/91(새 테스트: text-io 3, doc 8, closing 7, tabs 1, theme 토큰 1행).
- 특이사항: undo 묶음 간격(E-059c)은 `@codemirror/commands`가 없어 이 카드에서 막혔다(BLOCKED). 사용자가 의존성을 승인해 P2-2에서 넣었다.

**v04-P2-2 되돌리기, R-1 v0.4 표, 폴더 해제 질문, 수정 임시 탭 보호 (R-2·R-6, 데이터 손실 보강)** (2026-11-06)
- 무엇을 했나: `impl`이 `@codemirror/commands` 6.11.1을 `--save-exact`로 설치하고(사용자 승인 2026-11-06, D-2) `history({ newGroupDelay: EDITOR_UNDO_GROUP_INTERVAL_MS })`(`editor.undo.group_interval`, E-059c)를 넣었다. `editor::Undo`·`editor::Redo`는 CM6 `undo`·`redo`를 부른다. CM6 `historyKeymap`은 넣지 않았다(키는 앱 키맵 하나로만).
- 결과
  - 의존성: `@codemirror/commands` 6.11.1과 함께 들어온 하위 의존성 `@codemirror/language` 6.13.1, `@lezer/common` 1.5.5, `@lezer/highlight` 1.2.5, `@lezer/lr` 1.4.12(D-2 표). 기존 `@codemirror/state`·`view`는 그대로다.
  - R-1: v0.4 키를 `BUILTIN`에 합쳤고 `builtin.test.ts`가 이 문서의 "R-1 기대 바인딩 표(v0.4)"를 읽는다.
  - 폴더 해제(데이터 손실 보강): `removeFolder`가 그 폴더 문맥의 탭으로 `confirmClose`(E-081/E-082)를 거친다. 세 경로(사이드바 Delete·Remove, 루트 Remove from Project, 경로 없음 패널 Remove)가 모두 이 한 지점을 지난다.
  - 임시 탭 교체(데이터 손실 보강): `openTab`에 `keep` 인자를 더해 수정·충돌·지워진(비지 않은) 임시 탭은 교체하지 않는다. 한계: 그 사이 임시 탭이 `pane.max_preview_tabs`보다 많아질 수 있다.
- 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 92/92.
- 특이사항: `editor::Redo` 표시 키는 표 순서상 Ctrl+Shift+Z가 된다. 지금 Redo를 보이는 메뉴·툴팁은 없다.

**결함과 수정 이력**
- F-1(I-063, R-2, v04-M2 발견): 임시 탭에서 첫 글자를 치면 일반 탭으로 바뀌는 순간 편집기가 포커스를 잃어 이어 치는 글자·Backspace·Ctrl+Z가 무시됐다. 원인은 승격이 탭 배열을 새로 만들어 `PaneBody`가 같은 편집기 DOM을 뗐다 붙인 것이다. v04-P2-3(`impl`)이 `src/shell/Pane.tsx` `PaneBody`에서 보이는 DOM이 바뀔 때만 `replaceChildren`을 부르게 고쳤다(공통 지점). v04-M2-R1에서 해소를 쟀다. 검증 V1(typecheck, test 92/92) + V3.
- I-059 Tab 포커스 이동(v04-M2-R1 발견): 편집기에서 Tab이 문서를 바꾸지 않고 포커스를 다음 버튼으로 옮겼다. R-1 표에 I-059 2행을 개정으로 더하고(W-v04-P2b), v04-P2-4(`impl`)가 `src/editor/indent.ts`(+test)로 `editor::Tab`·`editor::Backtab`을 만들었다. `editor.tab_size` 공백 들여쓰기, Shift+Tab 내어쓰기, userEvent를 달아 history·승격에 들어간다. 구문 들여쓰기 위치(E-056)는 없어 늘 다음 탭 위치다(`shortcut:` 주석, `indent.ts`). v04-M2-R2에서 쟀다. 검증 V1(typecheck, test 94/94) + V3.
- 폴더 해제·임시 탭 교체 때 묻지 않고 버리는 데이터 손실: v04-P2-1이 범위 밖으로 보고했고 v04-P2-2가 위처럼 보강했다. v04-M2에서 쟀다.

**leader 결정** (2026-11-06, 리더 결정(사용자 위임 2026-11-06))
- 다시 읽기(깨끗한 탭의 바깥 변경, Discard Edits) 뒤 Ctrl+Z를 누르면 직전 텍스트로 돌아가고 수정 상태가 된다. Zed도 다시 읽기가 undo 기록에 남으므로 같게 유지한다.
- E-083 `{오류}` 자리에는 OS 오류 글을 그대로 넣는다(예: OS 언어 문구와 `(os error -2147024864)`).
- 원문 `{오류}` 자리의 앱 문구: CP949 손실은 `these characters cannot be saved in CP949: <글자들>`, 임시 파일을 남겼으면 ` The new contents are kept in <경로>`를 붙인다(v04-P2-1).

**v04-M2·M2-R1·M2-R2 Phase 2 끝 V3 실측** (2026-11-06)
- 무엇을 했나: V3 측정 담당이 레포 소스로 새로 만든 debug exe를 창 논리 1440×852, DPI 96, 키보드 `0x0412`에서 실제 OS 입력(PID·HWND 고정, 전경 가드)으로 쟀다. 값은 CDP(탭·편집기·알림), UI Automation(TaskDialog), 디스크 바이트로 읽었다. 1차(M2) 뒤 F-1과 미측정 항목(M2-R1), I-059(M2-R2)만 다시 쟀다.
- 결과
  - M2: 판정 81행 가운데 통과 77, 기록 3(10MB), 불일치 1(F-1).
    - 인코딩 왕복 6종(UTF-8 무BOM LF·CRLF, BOM, UTF-16 LE·BE, CP949): 한 글자 고쳐 저장한 뒤 바이트가 모두 기대와 같고, 수정 점이 사라지고, 충돌·`.tmp`가 없다. 깨끗한 탭 Ctrl+S는 바이트·수정 시각 그대로. CP949 밖 글자(😀)는 저장 거부 알림과 디스크 불변.
    - 03-tauri R-15: TaskDialog 제목 `Warning`, 문구, 버튼 순서(E-081~E-085), 기본 버튼 Cancel, Esc = Cancel, 답마다의 결과가 모두 맞다. 닫기 경로(Ctrl+W·Ctrl+F4·가운데 클릭·닫기 버튼, Alt+F4·Ctrl+Q·제목 줄 닫기, 폴더 해제 3경로)가 모두 같은 질문을 거친다. UIA는 앱에서 처음 뜬 창의 본문만 주어, 문구는 종류마다 찍은 스크린샷 7장(`phase2-e081.png` 등)을 글자 단위로 대조했다.
    - 잠긴 파일 저장: `Unable to save file: …` 알림, 원본 유지, `.tmp` 없음. 닫기 질문의 E-083 답마다 결과 맞음.
    - 충돌(Warning 점)·지워진 파일(취소선, 수정 점)·같은 내용 바깥 덮어쓰기는 변경 아님·자기 저장 뒤 충돌 없음·깨끗한 탭 자동 다시 읽기·수정 임시 탭 교체 안 됨.
    - 탭 모양: 시작 슬롯 12×12, 끝 슬롯 14×14, 닫기 아이콘 14, 점 10px, 점 색이 `--text-accent`/`--warning` 토큰과 같음, 닫기 버튼 hover 때만.
    - undo/redo: Ctrl+Z·Ctrl+Y·Ctrl+Shift+Z 동작, 묶음 간격은 100ms·250ms가 한 묶음, 350ms가 두 묶음(`editor.undo.group_interval`).
    - IME(Microsoft 한글 입력기): 조합 뒤 Enter·Esc·Left·Right·Up·Down·Space 7가지 모두 편집기와 네이티브 textarea가 같은 결과(잘림·겹침 없음, 03-tauri R-08).
    - 10MB HTML(10,485,817 B, 03-tauri R-10): 열기 584ms. 한 글자 입력 12번의 키 → 문서 반영 중앙값 16.3ms(최대 35.4), 그려짐(두 프레임 뒤) 중앙값 63.7ms(최대 135.0). 같은 길이 바꾸기 133.7 / 46.8 / 39.4ms(위·가운데·끝, 각 1번). 원문에 통과 기준이 없어 기록으로 충족이다.
  - M2-R1: 9행 모두 통과. F-1 해소(승격 뒤 `activeElement` = `.cm-content`, 글자·Backspace·Ctrl+Z 반영), I-072 history(a → c → b에서 b를 닫으면 c, 이어 c를 닫으면 a), E-055 `tabSize` 4·탭 문자 폭 = 공백 4칸.
  - M2-R2: 11행 모두 통과. 편집기 Tab은 공백 4칸 들여쓰기·줄 끝은 다음 정지점까지, Shift+Tab 내어쓰기, 여러 줄 선택 들여쓰기·내어쓰기, Tab 뒤 Ctrl+Z 한 번에 되돌림, 포커스 유지. 트리의 Tab은 기존 `menu::SelectNext`/`SelectPrevious` 그대로.
  - 결과 파일: `specs/v0.4/verify/phase2.md`(6장 재측정, 7장 재측정 R2), 스크린샷 7장.
- 검증: V3.
- 특이사항
  - 미측정: `CLOSE_SAVE_WAIT_LIMIT` 시간 초과(V1 `closing.ts` 테스트로만), 교체 실패 + 원본 없음(V1 `cargo test`로 확인), IME 한자 변환·Shift 조합.
  - E-081 경로 80자 초과는 OS TaskDialog가 자체 말줄임을 해 앱이 보낸 80자 문자열을 화면으로 확인하지 못했다(V1 `shortPath`·코드 확인 범위).
  - 충돌 중인 파일을 저장 기준과 같은 바이트로 되돌려 쓰면 충돌이 사라지고 수정 상태만 남는다(기록).
  - M2 앱 실행 17회 가운데 11회는 측정 스크립트 문제로 다시 돌린 것이고 판정은 마지막 정상 6회만 썼다. `state.json`은 매번 복구했고 SHA-256이 같다. 시험 폴더 삭제, `tools/` 변경 없음.

**C-v04-P2 Phase 2 끝 검토** (2026-11-06)
- 무엇을 했나: `check`가 Phase 2 diff와 보고서를 데이터 손실 방지 중심으로 검토하고 전체 테스트를 1회 돌렸다.
- 결과: PASSED. 지적 없음(참고 3건: `doc.ts` 순서 번호 검사, `PaneBody` DOM 재부착 방지, R-1 v0.4 표 고정).
- 검증: `npm.cmd run typecheck` 통과, `npm.cmd run test` 94/94, `cargo check` 경고 0, `cargo test` 17 통과, `cargo clippy --all-targets -- -D warnings` 통과. 제품 코드 `unwrap()` 0건, 인라인 `style` 0건.
- 특이사항: 없음.

**Phase 2 판정** (2026-11-06)
- 결과: R-2 ~ R-7 충족. V3 불일치 0(F-1 해소, I-059 반영).
- PLAN 완료 조건 대조
  - `encoding_rs` =0.8.44 설치, D-2 표에 있음. `@codemirror/commands` 6.11.1과 하위 의존성도 D-2 표에 있음.
  - R-5 시험 바이트 `test-fixtures/encoding/`를 `node --test`와 `cargo test`가 같이 쓴다.
  - 03-tauri R-15 결과: 위 v04-M2(세 버튼·사용자 문구·기본 취소·Esc·제목 `Warning` 실측, 본문은 스크린샷 대조).
  - 10MB 입력 반영 시간: 위 v04-M2.
  - `shortcut:` 주석 위치: 혼합 줄 끝 통일 `src/editor/text-io.ts` `decode` 안(코어 `src-tauri/src/text_io.rs`에도 있음), `CLOSE_SAVE_WAIT_LIMIT_MS` `src/workspace/closing.ts`, 수정 판정의 Zed 차이 `src/workspace/doc.ts` `isDirty` 위. 그 밖에 구문 들여쓰기 없음 `src/editor/indent.ts` `tab`.
- 특이사항: V4 목록에 2건을 더했다(아래).

### Phase 3 — 탭 기능: 임시·핀 탭, 분할, 탭 드래그, 마크다운 미리보기

없음.

## V4 사용자 확인 목록

버전 끝에 한꺼번에 받는다(`PLAN.md`). Phase마다 쌓는다.

1. (Phase 1) 줄 높이가 고정된 곳(트리 행, 탭 내용, 타이틀 바 폴더 이름 버튼)에서 14px로 바꾼 글자가 잘려 보이지 않는지. V3에서 `scrollHeight`와 `clientHeight`가 같았다(트리 이름 20/20, 탭 제목 31/31, 폴더 이름 버튼 22/22). 눈으로 본 판정은 아니다.
2. (Phase 2) TaskDialog 문구의 모양: E-081 경로를 감싼 백틱(원문 "인라인 코드 표기"를 문자 그대로 옮김)이 창에 그대로 보이는 것, 수준 아이콘·줄바꿈 등 창의 보이는 모양(스크린샷 `specs/v0.4/verify/phase2-e081.png` ~ `phase2-e085.png`).
3. (Phase 2) 긴 경로의 OS 말줄임: E-081 경로가 길면 앱이 앞쪽을 자른 문자열(`editor.confirm_close.path_max_chars`)을 OS TaskDialog가 한 번 더 자체 말줄임한다(`phase2-e081-long-path.png`). Zed와 같아 보이는지.

## 사용자 요청 작업

없음.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
