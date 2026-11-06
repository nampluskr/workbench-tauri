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
| I-010 | Ctrl+PageUp | Pane | 탭 순서로 이전 이동 | `Pane` | `pane::ActivatePreviousItem` |
| I-010 | Ctrl+PageDown | Pane | 탭 순서로 다음 이동 | `Pane` | `pane::ActivateNextItem` |
| I-014 | Ctrl+K Shift+Enter | Pane | 핀 고정/해제. 임시 탭 유지와 다른 기능이다 | `Pane` | `pane::TogglePinTab` |
| I-018 | Ctrl+\ | Editor | 오른쪽으로 분할 | `Editor` | `pane::SplitRight` |
| I-019 | Ctrl+K Up | Pane | 위로 분할 | `Pane` | `pane::SplitUp` |
| I-019 | Ctrl+K Down | Pane | 아래로 분할 | `Pane` | `pane::SplitDown` |
| I-019 | Ctrl+K Left | Pane | 왼쪽으로 분할 | `Pane` | `pane::SplitLeft` |
| I-019 | Ctrl+K Right | Pane | 오른쪽으로 분할 | `Pane` | `pane::SplitRight` |
| I-020 | Ctrl+K Ctrl+Up | Workspace | 그 방향 Pane으로 포커스 이동 | `Workspace` | `workspace::ActivatePaneUp` |
| I-020 | Ctrl+K Ctrl+Down | Workspace | 그 방향 Pane으로 포커스 이동 | `Workspace` | `workspace::ActivatePaneDown` |
| I-020 | Ctrl+K Ctrl+Left | Workspace | 그 방향 Pane으로 포커스 이동 | `Workspace` | `workspace::ActivatePaneLeft` |
| I-020 | Ctrl+K Ctrl+Right | Workspace | 그 방향 Pane으로 포커스 이동 | `Workspace` | `workspace::ActivatePaneRight` |
| I-737 | Shift+Escape | 전역 | 확대(`ToggleZoom`) | `Workspace` | `workspace::ToggleZoom` |
| I-044 | Ctrl+Shift+V | Editor, 확장자 md | 미리보기 열기(같은 Pane) | `Editor && extension == md` | `markdown::OpenPreview` |
| I-044 | Ctrl+K V | Editor, 확장자 md | 옆 Pane에 열기 | `Editor && extension == md` | `markdown::OpenPreviewToTheSide` |
| I-045 | Ctrl+Shift+V | MarkdownPreview | 미리보기를 닫고 원문으로 돌아가기 | `MarkdownPreview` | `markdown::CloseAndReturnToEditor` |

- 개정 2026-11-06(카드 W-v04-P2b, leader 결정(사용자 위임 2026-11-06)): I-059 2행을 더해 74행이다. 근거는 01-zed `02-INTERACTION.md` I-059("들여쓰기 / 내어쓰기. 편집기에서 Tab을 포커스 이동으로 바꾸지 않는다")다. Phase 2 V3 재측정에서 편집기의 Tab이 포커스를 옮기는 것이 발견됐다. 01-zed에 두 액션 이름이 없어 `leader`가 준 이름을 쓰고 아래 "지은 이름" 표에 적었다. 기존 행은 고치지 않았다.
- 개정 2026-11-06(카드 W-v04-P3a, Phase 3 시작): v0.4 Phase 3 키 16행을 더해 90행이다. 기존 행은 고치지 않았다.
  - 근거: 01-zed `02-INTERACTION.md` 1절 키 표 I-010, I-014, I-018, I-019, I-020, I-044, I-045와 3.1.4절 I-737. 키·원문 컨텍스트·원문 동작은 원문 그대로다. I-019·I-020의 "방향키"는 네 방향마다 한 행씩 두었다.
  - 액션 이름: 01-zed 9.2절 I-477·I-478(`pane::ActivatePreviousItem`·`pane::ActivateNextItem`), L-241·I-577(`pane::TogglePinTab`), I-396~I-399(`pane::Split*`), L-245·I-476(`workspace::ToggleZoom`), I-474·I-475(`markdown::OpenPreview`·`markdown::OpenPreviewToTheSide`), 11절 I-587(`markdown::CloseAndReturnToEditor`).
  - I-020의 `workspace::ActivatePane*` 넷은 01-zed에 이름이 없다. v0.2 D-2 규칙대로 gpui `src/keymap/builtin.rs`의 이름을 쓰고 아래 "지은 이름" 표에 적었다.
  - 내장 컨텍스트: I-737 원문 "전역"은 gpui `builtin.rs`와 같은 `Workspace`로 둔다. I-044 원문 "Editor, 확장자 md"는 키맵 엔진에 `확장자 == md` 술어가 없어 `Editor`로 두고, 실행부가 마크다운 파일일 때만 동작해야 한다(v0.2 PROGRESS 남은 것 `src/keymap/engine.ts` 술어 한계). I-045 `MarkdownPreview`는 원문 이름 그대로이며 미리보기 탭이 이 컨텍스트를 가져야 한다.
  - 개정 2026-11-06(카드 W-v04-P3b, leader 결정(사용자 위임 2026-11-06)): I-044 두 행의 내장 컨텍스트를 `Editor && extension == md`로 고쳤다. 원문 컨텍스트 "Editor, 확장자 md"를 그대로 옮기려고 키맵 엔진에 `key == value` 술어를 더한다(v0.2 D-3, v0.2 INTENT 결정 기록 10 "내장 키맵이 쓰면 그때 더한다"). 위 "`Editor`로 두고 실행부가 마크다운일 때만 동작" 설명은 이 개정으로 바뀐다.
  - 넣지 않은 것: I-046·I-047(미리보기 스크롤 키, SPEC R-11 범위에 명시 없음), I-012·I-734(탭 순서 옮기기 키, SPEC R-8·R-14 목록 밖), I-015·I-016(모든 탭·왼쪽·오른쪽·깨끗한 탭 닫기, SPEC 범위 밖), I-011(Ctrl+Tab 전환기, SPEC S-6), I-017(탐색 이력, SPEC 범위 밖), I-021·I-733·I-736(원문 "제외").

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
| `workspace::ActivatePaneUp` | I-020 (개정 2026-11-06, gpui `builtin.rs` 이름) |
| `workspace::ActivatePaneDown` | I-020 (개정 2026-11-06, gpui `builtin.rs` 이름) |
| `workspace::ActivatePaneLeft` | I-020 (개정 2026-11-06, gpui `builtin.rs` 이름) |
| `workspace::ActivatePaneRight` | I-020 (개정 2026-11-06, gpui `builtin.rs` 이름) |

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

**Phase 3 시작 고정 목록** (2026-11-06, 카드 W-v04-P3a)

R-8·R-9·R-10 항목 ID별 기대 동작 — 01-zed `02-INTERACTION.md` 2절(I-060~I-066), 3절(I-067~I-076), 3.1절(I-706~I-739)의 규칙 문구를 출처 링크만 빼고 그대로 옮겼다. 수치는 문구 속 원문 값이고, 구현은 오른쪽 스펙 ID를 쓴다. "처리"는 이번 Phase에서의 처리다.
- 넣음: 이 Phase에서 만들고 판정한다.
- 충족(Phase 2): Phase 2에서 이미 만들고 판정했다.
- 원문 제외: 01-zed가 "제외"로 적었다.
- SPEC에서 뺌: v0.4 SPEC·INTENT가 뺐다.

| ID | 원문 규칙 | 요구 | 스펙 ID | 처리 |
| --- | --- | --- | --- | --- |
| I-060 | **임시(preview) 탭**: 다음 탐색 때 교체되는 탭. **일반 탭**: 계속 남는 탭. **핀 탭**: 탭 바 앞쪽에 고정하고 일반 닫기에서 보호하는 탭. 마크다운의 "Preview X.md" 제목은 렌더링 종류를 뜻하며 이 세 상태와 별개다 (L-69) | R-8 | 없음 | 넣음 |
| I-061 | `preview_tabs.enabled` = true, `enable_preview_from_project_panel` = true. 트리에서 한 번 눌러 열면 임시 탭이다. `enable_preview_from_file_finder`는 false이므로 "파일 선택기 열기도 모두 임시"라고 쓰면 틀린다 (L-132) | R-8 | 없음 | 충족(v0.2 R-26). 파일 선택기는 INTENT 제외 범위 |
| I-062 | Pane마다 임시 탭 id를 **하나** 가진다. 다른 임시 파일을 열면 기존 임시 탭을 닫고 **그 자리(인덱스)를 재사용**한다. 모든 Pane을 통틀어 하나는 아니다 | R-8 | `pane.max_preview_tabs` | 넣음(Pane마다로 넓힘. 수정한 임시 탭은 교체하지 않는다, Phase 2 v04-P2-2) |
| I-063 | 편집기의 **편집 이벤트**가 임시 상태를 푼다 (항목이 보존을 요청하는 예외는 있다). 탭 더블클릭, 트리의 비임시 열기(더블클릭·가운데 클릭)도 일반 탭으로 바꾼다 | R-8 | 없음 | 넣음(편집 이벤트·트리 열기는 Phase 2·v0.2에서 충족, 탭 더블클릭을 더한다). 탭 한 번 누르기는 승격하지 않는다 |
| I-064 | 원문 편집기 탭의 임시 제목은 **기울임꼴**이다. 마크다운 미리보기 탭은 별도 렌더링이라 같은 기울임이라고 일반화하지 않는다 (L-68) | R-8 | 없음 | 충족(v0.2 R-26). 미리보기 탭은 R-11에서 따로 |
| I-065 | 핀은 임시 상태를 풀고 `pinned_tab_count` 경계 안으로 탭을 옮긴다. Ctrl+K Shift+Enter로 토글. 더블클릭(임시→일반)과 핀을 섞지 않는다 | R-8 | 없음 | 넣음 |
| I-066 | Ctrl+W·Ctrl+F4는 핀 탭을 닫지 않는다. 가운데 클릭도 핀 탭은 닫지 않는다. `show_pinned_tabs_in_separate_row` 기본 false라 같은 줄에 둔다 | R-8 | 없음 | 넣음(핀 부분. 닫기 키 자체는 Phase 2 충족) |
| I-067 | 위치를 지정하지 않으면 **활성 탭 바로 다음**에 넣되 핀 영역 뒤쪽 경계를 지킨다. 임시 탭 교체는 이전 임시 위치를 재사용하는 별도 경로다 | R-8 | 없음 | 넣음 |
| I-068 | 같은 Pane에서 이미 열린 탭을 찾아 활성화한다. 비임시 열기이면 기존 임시 상태도 푼다. 다른 Pane까지 중복을 막지는 않는다 (`reveal_if_open` 기본 false) | R-8 | 없음 | 넣음(Pane마다로 넓힘) |
| I-069 | 수정 표시(점)와 닫기 저장 확인이 기본 동작이다. 수정된 탭을 닫으면 **Save / Don't Save / Cancel** 확인. 같은 버퍼가 다른 곳에 남아 있으면 확인을 건너뛰는 예외가 있다 | R-6, R-9 | 없음 | 충족(Phase 2). "같은 버퍼가 다른 곳에 남아 있으면 건너뜀"은 분할(같은 파일 두 뷰, D-8)과 함께 넣음 |
| I-070 | 둘 이상이면 **Save all / Discard all / Cancel** 일괄 선택 | R-6 | 없음 | 충족(Phase 2) |
| I-071 | 수정됨은 Accent 색 점, 충돌은 Warning 색 점, 깨끗하면 없음. 제목 뒤 별표가 아니다 (L-65) | R-2 | `tab.indicator_size` | 충족(Phase 2) |
| I-072 | `activate_on_close` 기본 `history`: 최근 활성 이력의 탭을 고르고, 이력이 없으면 왼쪽 이웃 | R-6 | 없음 | 충족(Phase 2 v04-M2-R1). 분할 뒤에는 Pane마다 |
| I-073 | `close_position` = right, `show_close_button` = hover. 버튼으로 닫아도 저장 확인을 거친다 (L-66) | R-6 | `tab.end_slot.*` | 충족(Phase 2). 핀 탭은 닫기 대신 핀 아이콘(L-66)을 넣음 |
| I-074 | 같은 Pane 안 재정렬, 다른 Pane으로 이동, 분할 드롭 영역으로 새 Pane 만들기. Windows에서 Ctrl+드래그는 복제(분할 가능한 항목). 드롭 위치 강조를 그린다 | R-10 | 3.1.2절 | 넣음 |
| I-075 | 일반 탭은 닫기 의도(저장 확인 포함)로 닫는다. 핀 탭은 무시. 수정된 탭도 강제 폐기가 아니다 | R-8 | 없음 | 넣음(핀 무시. 일반 탭은 Phase 2 충족) |
| I-076 | Ctrl+Tab 계열은 **최근 사용 순(MRU)**이고 Ctrl+PageUp/PageDown은 **위치 순서**다. 둘을 구별한다 | R-8 | 없음 | Ctrl+PageUp/PageDown 넣음. MRU 전환기는 SPEC에서 뺌(S-6) |
| I-706 | 탭 바 오른쪽 버튼은 Pane에 포커스가 있거나 그 Pane의 컨텍스트 메뉴가 포커스를 가진 때 그려진다. 순서는 `+`(New…), 분할(Split 아이콘), 확대(Zoom In/Out). 버튼 사이 gap은 Base04 = 4px. 분할 버튼은 클릭하면 바로 나누지 않고 **오른쪽 위 기준 팝업**을 연다 | R-9 | `tab.end_buttons_area.*` | 분할·확대 버튼과 그리는 조건 넣음. `+`(New…)는 SPEC에서 뺌(새 버퍼 S-4) |
| I-707 | 분할 팝업의 순서는 **Split Right → Split Left → Split Up → Split Down**. 분할할 수 있는 활성 항목이면 기본 방식은 `ClonePane`. 분할할 수 없는 항목이지만 탭이 2개 이상이면 `MovePane`. 빈 Pane이거나 분할 불가 단일 항목이면 분할 버튼이 **비활성** | R-9 | 없음 | 넣음 |
| I-708 | `ClonePane`은 Pane의 모든 탭을 복사하지 않고 **활성 항목 하나**의 복제본만 새 Pane에 연다. 원래 Pane의 탭은 그대로 두고 새 Pane에는 탐색 이력을 갈라서 넘긴다. 일반 편집기는 분할할 수 있다. 빈 Pane이거나 분할 불가이면 이 명령은 새 Pane을 만들지 않는다 | R-9 | 없음 | 넣음(탐색 이력은 v0.4에 없어 넘길 것 없음) |
| I-709 | 분할 방식은 셋이다: `ClonePane`(기본), `EmptyPane`(빈 Pane), `MovePane`(활성 항목 이동). `MovePane`에서 원래 Pane의 탭이 1개 이하이면 반대편에 빈 Pane을 만들고 원래 항목에 포커스를 남겨, 항목이 요청한 방향으로 옮겨 간 것과 같은 배치가 된다 | R-9 | 없음 | 넣음 |
| I-710 | 명시적 Split Right/Left/Up/Down은 설정의 영향을 받지 않는다. **SplitHorizontal만** `pane_split_direction_horizontal`(기본 down)을, **SplitVertical만** `pane_split_direction_vertical`(기본 right)을 따른다 | R-9 | 없음 | 넣음(명시적 네 방향만. SplitHorizontal·SplitVertical은 키·메뉴 진입점이 없다) |
| I-711 | ☰ View의 Split Up/Down/Left/Right(9.2절)도 기본 `ClonePane`이다. 탭 바 분할 팝업의 `MovePane` 분기(분할 불가 항목)와 구별한다 | R-9, R-14 | 없음 | 넣음 |
| I-712 | 분할 드롭 판정은 **탭 바를 뺀 Pane 본문 영역**의 크기를 기준으로 한다. 임계값 d = min(폭, 높이) × `drop_target_size` (기본 **0.2**). x < d, x > 폭 − d, y < d, y > 높이 − d 중 하나이면 가장자리 후보이고, 등호 경계는 중앙이다 | R-10 | `pane.drop_target_size_ratio` | 넣음 |
| I-713 | 가장자리 후보에서는 위·오른쪽·아래·왼쪽 변까지의 거리 중 **가장 작은 쪽**을 방향으로 고른다. 모서리를 네 구역으로 나누는 우선순위는 없다. 거리가 같을 때의 선택은 실행 검증을 못 해서 확정하지 않는다. 분할이 허용되지 않는 Pane이면 이 갱신을 건너뛴다 | R-10 | 없음 | 넣음(거리가 같을 때의 순서는 원문 미확정, 구현 순서를 PROGRESS에 기록) |
| I-714 | 본문 오버레이는 `drop_target_background`로 칠한 절대 배치 직사각형이다. 중앙이면 본문 전체, 방향 분할이면 해당 쪽 **절반(50%)**을 덮는다. **판정 폭 20%와 보이는 폭 50%는 서로 다르다.** 본문 오버레이에는 테두리·모서리 지정이 없다 | R-10 | `pane.directional_drop_overlay_ratio` | 넣음 |
| I-715 | 탭 위에 놓으면 분할 방향을 지우고 **그 탭의 위치**에 넣거나 옮긴다. 같은 Pane이면 재정렬, 다른 Pane이면 이동. 표시는 배경 `drop_target_background`, 경계 `drop_target_border`, 그리고 드래그 시작 위치보다 앞이면 탭 **왼쪽 2px**, 뒤이면 **오른쪽 2px** 선. 포인터가 탭 절반을 넘었는지로 선 위치를 정하지 않는다 | R-10 | `pane.tab_drop_line_width` | 넣음 |
| I-716 | 탭 바의 남는 영역에 놓으면 **맨 끝에 넣고 분할하지 않는다.** 영역 최소 폭 1.5rem(rem 16이면 24px), 높이는 탭 높이(32px) | R-10 | `pane.tab_bar_end_drop_min_width` | 넣음 |
| I-717 | 본문 **중앙**에 놓으면 기존 Pane의 활성 위치로 이동. **가장자리**에 놓으면 그 방향에 새 빈 Pane을 만들고 항목을 옮긴다. 활성 항목이 자기 드롭 처리(`handle_drop`)를 가지고 있으면 그것이 먼저다. 드래그한 임시 탭은 **일반 탭으로 바뀐다** | R-10 | 없음 | 넣음 |
| I-718 | Windows에서 놓을 때 **Ctrl을 누르고 있으면 복제** 경로를 쓴다. 복제할 수 있는 항목에만 적용하고 불가하면 이동으로 되돌린다. 복제 항목은 위치 지정 없이 추가되므로 일반 이동의 위치 삽입과 똑같다고 가정하지 않는다 | R-10 | 없음 | 넣음 |
| I-719 | 같은 Pane 안에서 일반 탭을 핀 구역으로 옮기면 핀 개수가 늘고, 핀을 일반 구역으로 옮기면 줄어든다. 핀 여부는 **새 위치**로 판단한다. 핀은 파일의 속성이 아니라 Pane 앞쪽 연속 구간의 경계다 | R-8, R-10 | 없음 | 넣음 |
| I-720 | 다른 Pane으로 옮긴 탭은 대상의 핀 구역에 놓였을 때 핀으로 처리한다. 출발지에서 핀이던 탭을 새 Pane의 0번 위치에 놓을 때도 핀이 유지된다. 일반 구간으로 옮기면 무조건 핀을 유지하지는 않는다. 핀 바 전용 드롭 영역은 핀 경계로 옮긴 뒤 명시적으로 핀 처리한다 | R-8, R-10 | 없음 | 넣음(핀 바 전용 드롭 영역은 `show_pinned_tabs_in_separate_row` false라 없다, I-066) |
| I-721 | 프로젝트 패널에서 드래그하면 **선택 항목 하나**(`active_selection`)만 쓴다 | — | 없음 | SPEC에서 뺌(INTENT 결정 9, D-9) |
| I-722 | 트리 드롭으로 열기: 포커스를 주고, **임시 탭을 허용하지 않고**(일반 탭), 활성화한다 | — | 없음 | SPEC에서 뺌(INTENT 결정 9, D-9) |
| I-723 | 루트는 Pane 하나이거나 재귀적인 Axis다. Left/Right는 가로(Horizontal) 나열, Up/Down은 세로(Vertical) 나열. 같은 축이면 형제 위치에 끼우고, 다른 축이면 그 잎을 새 Axis로 감싼다. 왼쪽·위는 기존 항목 앞, 오른쪽·아래는 뒤에 둔다 | R-9 | 없음 | 넣음 |
| I-724 | 새 형제를 끼우면 **그 Axis의 flex를 모두 1로 초기화**한다. 기존 비율을 유지한 채 대상 하나만 반으로 가르는 방식이 아니다. 자식 길이 ≈ 그룹 축 길이 × flex[i] ÷ 자식 수 (px로 반올림). 저장된 flex의 길이나 합이 올바르지 않으면 모두 1로 복구한다 | R-9 | 없음 | 넣음(저장된 flex 복구는 상태 저장이 없어 해당 없음) |
| I-725 | 분할선 **1px**, 색 `pane_group_border`. 마우스 반응 영역은 **4px**(경계 앞뒤 2px). 가로 나열은 `ResizeColumn` 커서, 세로 나열은 `ResizeRow` 커서 | R-9 | `pane.split_line_thickness`, `pane.split_line_mouse_hitbox` | 넣음 |
| I-726 | 드래그 최소 **폭 80px**(가로 나열), **높이 100px**(세로 나열). 인접 Pane이 최소치에 닿으면 더 먼 형제까지 변화량을 넘긴다 | R-9 | `pane.min_drag_width`, `pane.min_drag_height` | 넣음 |
| I-727 | 분할선 **더블클릭**(클릭 횟수 2 이상)은 그 Axis의 형제 flex를 모두 1로 만들어 **균등화**하고 저장한다. 중첩된 모든 그룹을 재귀적으로 초기화하는 명령과 다르다. 마우스를 놓으면 드래그 상태가 풀린다 | R-9 | 없음 | 넣음("저장"은 상태 저장이 없어 메모리 상태만) |
| I-728 | `close_pane_if_empty` 기본 true: 마지막 항목이 사라지면 그 Pane이 그룹에서 빠지고, 형제가 하나만 남으면 부모를 접으며 그 그룹의 비율을 초기화한다. **유일한 루트 Pane은 남아** 빈 편집 영역이 된다. 마지막 탭을 닫는 것을 창 닫기로 구현하지 않는다 | R-9 | 없음 | 넣음 |
| I-729 | 활성 표시 기본값 `border_size` = 0.0, `inactive_opacity` = 1.0: **기본으로 포커스 테두리나 비활성 흐림을 더하지 않는다** | R-9 | 없음 | 넣음(아무것도 더하지 않는다. 사용자 설정으로 켜는 경로는 설정이 없어 해당 없음) |
| I-730 | 확대(Zoom) 버튼: 기본 `Maximize` 아이콘, 확대 상태에서는 선택 표시 + `Minimize` 아이콘. 툴팁 Zoom In/Zoom Out, 키 Shift+Escape. 확대는 창 최대화·글꼴 확대와 별개이며, 확대한 대상은 원래 그룹에서 숨기고 확대 화면으로 다룬다 | R-9 | `pane.zoomed_padding`, `pane.zoomed_border` | 넣음 |
| I-731 | 편집기 Ctrl+\ / Pane Ctrl+K Up·Down·Left·Right: Split Right / Split Up·Down·Left·Right. 기본 `ClonePane` | R-9, R-14 | 없음 | 넣음 |
| I-732 | 작업 영역 Ctrl+K Ctrl+방향키: 방향으로 Pane 포커스 이동. 가운데의 인접 Pane을 먼저 찾고 Dock·사이드바 경계까지 간다 | R-9, R-14 | 없음 | 넣음 |
| I-733 | 작업 영역 Ctrl+K Shift+방향키: Pane 배치 교환 | — | 없음 | 원문 제외 |
| I-734 | Pane Ctrl+Shift+PageUp / PageDown: 같은 Pane 안에서 탭을 왼쪽·오른쪽으로 옮기기 | — | 없음 | SPEC에서 뺌(SPEC R-8·R-14 키 목록 밖) |
| I-735 | Pane Ctrl+W / Ctrl+F4, Ctrl+K W: 활성 탭 닫기 / 모든 탭 닫기. `close_pinned = false`. 마지막 항목이 사라지면 Pane 제거 규칙(I-728) 적용 | R-6, R-9 | 없음 | Ctrl+W·Ctrl+F4는 충족(Phase 2), I-728 연결은 넣음. Ctrl+K W(모든 탭 닫기)는 SPEC에서 뺌 |
| I-736 | Pane Ctrl+K Ctrl+W / Ctrl+Shift+Alt+W: 모든 탭과 Pane 닫기 / 비활성 탭과 Pane 닫기 | — | 없음 | 원문 제외 |
| I-737 | 전역 Shift+Escape: 확대(`ToggleZoom`). 편집기 Ctrl+K Z의 가운데 정렬 레이아웃과 별개 | R-9, R-14 | 없음 | 넣음 |
| I-738 | `MoveItemToPane` / `MoveItemToPaneInDirection`: **기본 키 없음** | — | 없음 | 넣지 않음(원문 "키 없음", 진입점 없음) |
| I-739 | `SplitAndMove`방향 / `JoinIntoNext` / `JoinAll` / 다음·이전 Pane 활성화: **기본 키 없음** | — | 없음 | 넣지 않음(원문 "키 없음", 진입점 없음) |

R-14 ☰ 메뉴 행 목록 — 02 9.2절과 대조했다. 메뉴에는 동작하는 항목만 두고(v0.2 D-13), 구분선은 살아남은 그룹 사이에만 둔다(I-306). "v0.4"는 v0.4에서 새로 동작하게 된 항목이다.

| 메뉴 | 순서 | 항목 | 원문 ID | 액션 | 표시 키(9.2절) | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| 앱 이름 | 1 | Quit workbench-tauri | I-341 | `zed::Quit` | Ctrl+Q | v0.2 |
| File | 1 | Open Folder... | I-346 | `workspace::Open` | 9.2절 대로 | v0.2 |
| File | 2 | 구분선 | I-351 | — | — | v0.2 |
| File | 3 | Save | I-352 | `workspace::Save` | Ctrl+S | v0.4(Phase 2) |
| File | 4 | 구분선 | I-355 | — | — | v0.4(Phase 2) |
| File | 5 | Close Editor | I-356 | `pane::CloseActiveItem`(`close_pinned = true`) | 없음 | v0.4(Phase 2). 메뉴로 닫으면 핀 탭도 닫힌다 |
| File | 6 | Close Window | I-358 | `workspace::CloseWindow` | Ctrl+Shift+W | v0.2 |
| Edit | 1 | Undo | I-359 | `editor::Undo` | Ctrl+Z | v0.4(Phase 2에서 동작) |
| Edit | 2 | Redo | I-360 | `editor::Redo` | Ctrl+Y / Ctrl+Shift+Z | v0.4(Phase 2에서 동작) |
| View | 1 | Toggle Left Dock | I-391 | `workspace::ToggleLeftDock` | Ctrl+B | v0.2 |
| View | 2 | Toggle Folder Sidebar † | I-472 | `multi_workspace::ToggleWorkspaceSidebar` | Ctrl+Alt+J | v0.2 |
| View | 3 | Focus Folder Sidebar † | I-473 | `multi_workspace::FocusWorkspaceSidebar` | Ctrl+Alt+; | v0.2 |
| View | 4 | Split Up | I-396 | `pane::SplitUp` | Ctrl+K Up | v0.4 |
| View | 5 | Split Down | I-397 | `pane::SplitDown` | Ctrl+K Down | v0.4 |
| View | 6 | Split Left | I-398 | `pane::SplitLeft` | Ctrl+K Left | v0.4 |
| View | 7 | Split Right | I-399 | `pane::SplitRight` | Ctrl+K Right / Ctrl+\ | v0.4 |
| View | 8 | Maximize Pane † | I-476 | `workspace::ToggleZoom` | Shift+Escape | v0.4 |
| View | 9 | 구분선 | I-400 | — | — | v0.2 |
| View | 10 | Project Panel | I-401 | `project_panel::ToggleFocus` | Ctrl+Shift+E | v0.2 |
| View | 11 | Open Markdown Preview † | I-474 | `markdown::OpenPreview` | Ctrl+Shift+V (확장자 md인 편집기) | v0.4 |
| View | 12 | Open Markdown Preview to the Side † | I-475 | `markdown::OpenPreviewToTheSide` | Ctrl+K V (확장자 md인 편집기) | v0.4 |
| Go | 1 | Previous Tab † | I-477 | `pane::ActivatePreviousItem` | Ctrl+PageUp | v0.4 |
| Go | 2 | Next Tab † | I-478 | `pane::ActivateNextItem` | Ctrl+PageDown | v0.4 |
| Window | 1 | Minimize | I-445 | `zed::Minimize` | 없음 | v0.2 |
| Window | 2 | Zoom | I-446 | `zed::Zoom` | 없음 | v0.2 |

- 같은 액션에 키가 여럿이면 화면에는 하나만 보인다(I-307, I-704 마지막 바인딩). Redo·Split Right의 표시 키는 R-1 v0.4 표의 순서로 정해진다.
- 9.2절 가운데 v0.4에도 동작하지 않아 넣지 않는 항목: File의 New·New Window·Open File...·Open Recent…·Add Folder to Project…·Save As…·Save All, Edit의 Cut·Copy·Copy and Trim·Paste·Find·Replace·Toggle Line Comment, Selection 전체, View의 Zoom In·Zoom Out·Reset Zoom·Reset All Zoom·Toggle All Docks, Go의 Back·Forward·Command Palette...·Go to File...·Go to Line/Column..., 앱 이름의 나머지, Help 전체.
- Open Markdown Preview 두 항목은 활성 편집기가 마크다운 파일이 아니면 비활성으로 둘지 숨길지를 9.2절이 적지 않았다(보고 참조).

**v04-P3-1 임시·일반·핀 탭, 탭 이동 키, 키맵 `key == value` 술어 (R-8, R-1 v0.4 표 Phase 3 16행)** (2026-11-06)
- 무엇을 했나: `impl`이 `tabs.ts`(+test)·`context.ts`·`store.ts`·`Pane.tsx`·`app-menus.ts`·`Icon.tsx`·`app.css`·`engine.ts`(+test)·`builtin.ts`·`file-view.ts`·`extensions.ts`를 고치고 Lucide `pin.svg`를 더했다.
- 결과
  - 임시 탭(I-061~I-064): 임시 탭 교체는 그 자리를 다시 쓰고, 수정한 임시 탭은 교체하지 않는다(P2-2). 탭 더블클릭으로 일반 탭이 되고, 한 번 누르기는 활성화만 한다.
  - 핀 탭(I-065·I-066·I-075·L-66·L-241): `pane::TogglePinTab`(Ctrl+K Shift+Enter). 핀 영역은 목록 앞쪽에 이어진 핀 탭이다. 핀이면 임시 상태를 풀고 핀 영역 끝으로, 해제면 핀 영역 바로 뒤로 옮긴다. Ctrl+W·Ctrl+F4·가운데 클릭은 핀 탭을 닫지 않고, ☰ File > Close Editor만 닫는다(I-356). 핀 탭의 끝 슬롯은 닫기 대신 Pin 버튼(툴팁 `Unpin Tab`, 활성 탭이면 단축키)이고 hover 없이 늘 보인다.
  - 새 탭 위치(I-067): 활성 탭 바로 다음, 핀 영역 뒤쪽 경계보다 앞에는 넣지 않는다. 같은 Pane 중복 열기(I-068)는 기존 `openTab`대로다.
  - 탭 이동(I-010·I-076): `pane::ActivatePreviousItem`·`ActivateNextItem`(Ctrl+PageUp/PageDown)은 위치 순서로 움직이고 양 끝에서 돈다.
  - 탭 우클릭(S-7·I-577): v0.2 공통 메뉴에 `Pin Tab`/`Unpin Tab` 한 항목, 단축키는 `pane::TogglePinTab` 표시.
  - 키맵 엔진: `key == value` 술어를 더했다(leader 결정, 아래). 편집기는 `data-keymap-context="Editor extension=<확장자>"`를 단다. `!=`·`>`는 없다(`shortcut:` 주석 `src/keymap/engine.ts`).
  - 내장 키맵에 R-1 v0.4 표 Phase 3 16행을 넣었다. 분할·확대·미리보기 액션은 다음 카드까지 빈 명령으로 등록했고 P3-2·P3-4가 실행부를 붙였다(P3-5에서 빈 명령 0 확인).
- 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 96/97(R-1 표 2행 불일치로 BLOCKED, 아래 결함 이력). 새 테스트: tabs 2, engine 1.
- 특이사항: 없음.

**v04-P3-2 분할·크기 조절·확대·같은 파일 두 뷰 (R-9, D-8, 03-tauri R-01)** (2026-11-06)
- 무엇을 했나: `impl`이 새 파일 `src/workspace/split.ts`(+test)와 Lucide `minimize.svg`를 더하고, `context.ts`(Pane 단위)·`Pane.tsx`를 다시 쓰고 `App.tsx`·`AppMenu.tsx`·`app-menus.ts`·`Icon.tsx`·`file-view.ts`·`watch.ts`·`metrics.ts`·`theme.ts`(+test, 토큰 `pane_group.border`)·`app.css`를 고쳤다.
- 결과
  - 구조(D-8): 폴더 문맥마다 분할 트리 하나, 활성 Pane, 확대 상태. 잎은 탭·활성 탭·I-072 이력(Pane마다), 갈래는 축·자식·flex. 저장·복원하지 않는다(INTENT 제외 범위).
  - 분할(I-706~I-711·I-723·I-724·L-244): Ctrl+\ (Editor)와 Ctrl+K 방향키(Pane)는 늘 ClonePane. 활성 항목이 없으면 새 Pane을 만들지 않는다. 탭 바 분할 버튼은 오른쪽 위 기준 팝업(Split Right → Left → Up → Down), 툴팁 `Split Pane`. 같은 축이면 형제로 끼우고 그 갈래 flex를 모두 1로, 다른 축이면 새 갈래로 감싼다.
  - Pane 정리(I-728): 마지막 탭이 사라진 Pane은 빠지고 유일한 루트 Pane은 남는다.
  - 탭 바 끝 버튼(+ / 분할 / 확대)은 그 Pane에 포커스가 있거나 그 Pane의 메뉴가 열렸을 때만 그린다(I-706).
  - 같은 파일 두 Pane(D-8): 파일 하나에 Doc 하나, 탭마다 EditorView. 한 뷰의 변경은 다른 뷰에 전달되고, 받은 쪽 임시 탭은 승격하지 않는다. Doc은 마지막 뷰가 닫힐 때 닫히고, 같은 파일을 다른 탭이 보이면 닫기 질문을 건너뛴다(I-069).
  - 03-tauri R-01: 옮긴 탭은 같은 Tab 객체·같은 `file.view`이고 `PaneBody`가 DOM을 붙이기만 한다.
  - 포커스 이동(I-732): Ctrl+K Ctrl+방향키 `workspace::ActivatePane*`. Dock·사이드바까지 가는 부분은 넣지 않았다.
  - 분할선·크기 조절(I-725~I-727): 두께 `pane.split_line_thickness`, 색 `--pane-group-border`(없으면 `border`, T-26.4), 잡는 폭 `pane.split_line_mouse_hitbox`, 최소 `pane.min_drag_width`·`pane.min_drag_height`, 더블클릭 균등화. 비율은 adopted sheet의 `flex-grow` 규칙이다(인라인 style 아님).
  - 확대(I-730·I-737·L-17·L-245): Shift+Escape 또는 확대 버튼. `pane.zoomed_padding` 여백과 `pane.zoomed_border` 테두리로 본문 위에 덮어 그린다. 버튼은 Maximize/`Zoom In`, 확대 중 Minimize·선택 배경/`Zoom Out`.
- 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 102/102. 새 테스트: split 5, theme 토큰 1행.
- 특이사항: `+`(New…) 버튼은 비활성 그대로(S-4). SplitHorizontal/Vertical(진입점 없음, I-710), I-733·I-738·I-739는 넣지 않았다.

**v04-P3-3 탭 드래그 (R-10, D-9, 03-tauri R-09)** (2026-11-06)
- 무엇을 했나: `impl`이 새 파일 `src/workspace/drop.ts`(+test)를 더하고 `context.ts`(`dropTab`)·`Pane.tsx`·`metrics.ts`·`theme.ts`(+test, 토큰 `drop_target.background`·`drop_target.border`)·`app.css`를 고쳤다.
- 결과
  - 드래그(D-9): `pointerdown` → `setPointerCapture` → `pointermove` → `pointerup`. `draggable`·`DataTransfer`는 쓰지 않는다. Escape는 취소. 끌기는 누른 뒤 처음 움직일 때 시작한다(아래 shortcut 위치).
  - 대상 판정: 탭 위(I-715)는 그 탭 자리에 넣고 `pane.tab_drop_line_width` 선(`--drop-target-border`)과 배경(`--drop-target-background`). 탭 바 남는 영역(I-716, 최소 `pane.tab_bar_end_drop_min_width`)은 맨 끝에 넣는다. 본문(I-712~I-714·I-717)은 d = min(폭, 높이) × `pane.drop_target_size_ratio` 안쪽이면 가장자리(새 Pane으로 분할, 오버레이 `pane.directional_drop_overlay_ratio`), 아니면 중앙(활성 탭 다음 자리, 오버레이 본문 전체).
  - 옮기기: 같은 Tab 객체·같은 EditorView(03-tauri R-01). 끈 임시 탭은 일반 탭이 된다(I-717). 비워진 출발 Pane은 닫힌다(I-728).
  - 복제(I-718): 놓을 때 Ctrl이면 같은 Doc의 새 뷰를 위치 지정 없이(I-067) 연다.
  - 핀 경계(I-719·I-720): 새 위치로 핀 여부를 정하고, 영역 끝 경계면 원래 상태를 유지한다.
  - 프로젝트 패널에서 끌어 열기는 없다(D-9).
- 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 105/105. 새 테스트: drop 3, theme 토큰 2행.
- 특이사항: 편집기 DOM 경로가 `.pane-body > .pane-item > .cm-editor`로 한 단계 깊어졌다(오버레이를 본문 안 형제로 두려고). 드래그 중 고스트·커서 모양은 원문에 없어 넣지 않았다.

**v04-P3-4 마크다운 미리보기 (R-11, D-2·D-10, 03-tauri R-04·R-32)** (2026-11-06)
- 무엇을 했나: `impl`이 `markdown-it` 15.0.3과 `dompurify` 3.4.17을 `--save-exact`로 설치하고(사용자 승인 2026-11-06, D-2), 새 파일 `src/editor/markdown.ts`(+test)·`src/editor/markdown-it.d.ts`·`src/shell/markdown-preview.ts`와 Lucide `eye.svg`·`file-doc.svg`를 더했다. `context.ts`·`tabs.ts`·`file-view.ts`·`Pane.tsx`·`tree-menu.ts`·`Icon.tsx`·`metrics.ts`·`theme.ts`(+test, 토큰 `toolbar.background`)·`app.css`를 고쳤다.
- 결과
  - 의존성: 하위 의존성은 `argparse` 3.0.4, `entities` 8.1.0(`markdown-it` 아래 중첩), `linkify-it` 6.1.0, `mdurl` 2.1.0, `punycode.js` 2.3.1, `uc.micro` 3.0.0, `dompurify`의 선택 의존성 `@types/trusted-types` 2.0.7이다(`package-lock.json`, D-2 표). `dompurify`는 자체 타입을 쓴다.
  - 미리보기 버튼(E-038·E-039): 마크다운 편집기 탭(.md/.markdown)에만 편집기 툴바 상자(`toolbar.*`, `--toolbar-background`)를 두고 그 안에 `Eye` 버튼 하나. 툴팁 `Preview Markdown` + 단축키 + 메타 `Alt-Click to open in a split`.
  - 열기(I-077~I-080·L-69): 같은 Pane에 `Preview {파일명}` 탭(24자 말줄임, FileDoc 아이콘), 포커스는 미리보기. 같은 원문의 미리보기가 있으면 활성화만 한다. 옆에 열기(Alt+Click·Ctrl+K V)는 오른쪽 이웃 Pane, 없으면 오른쪽 분할, 포커스는 원문에 남는다. 프로젝트 패널 우클릭 `Open Markdown Preview`를 켰다(v0.2 D-15를 바꿈, D-10).
  - 실시간 반영(I-082): 원문 변경 → `markdown_preview.parse_debounce` 뒤 다시 렌더. 미리보기는 원문 파일의 숨은 뷰 하나를 갖고(같은 Doc), 원문 탭을 닫아도 살아 있다. 원문을 Don't Save로 닫으면 숨은 뷰가 디스크 내용을 다시 읽는다. 미리보기는 닫기 질문을 하지 않는다.
  - 렌더(D-10): `markdown-it`(`html: false`, linkify·typographer 끔) → `DOMPurify.sanitize(…, { FORBID_ATTR: ["style"], ALLOW_DATA_ATTR: true })`. 블록마다 `data-line`·`data-line-end`. 표 정렬은 `align-center`/`align-right` 클래스.
  - frontmatter(L-110·L-111): 모든 줄이 `키: 값`이면 2열 grid, 아니면 코드 상자(`pre.frontmatter-raw`).
  - I-083: 원문 커서 줄을 가진 가장 안쪽 블록에 `active-block` 클래스와 `scrollIntoView({ block: "nearest" })`. I-084: 본문 블록 클릭 → 원문 선택을 그 블록 첫 줄로, 포커스는 옮기지 않는다.
  - I-085: 로컬 .md는 미리보기로, Alt면 편집기 탭으로, 그 밖 로컬 파일은 편집기 탭으로, `#…` 앵커는 아무것도 하지 않는다. 외부 링크는 `openUrl`로 부르게 했으나 capability가 없어 막혔다(BLOCKED, 아래 leader 결정).
  - I-086·I-045: 미리보기에서 Ctrl+Shift+V는 원문 탭을 먼저 열고(닫혔으면 같은 Doc의 새 뷰) 미리보기를 닫는다.
  - 미리보기 탭은 Clone하지 않는다. 분할 버튼은 탭이 2개 이상이면 Move, 하나면 비활성이다(I-707).
- 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 110/110. 새 테스트: markdown 5(frontmatter 판별, 블록 줄 번호, 표 정렬 클래스, 원문 HTML이 글자로 나옴, 링크 분류), theme 토큰 1행. DOMPurify는 DOM이 필요해 V3에서 판정했다.
- 특이사항: 툴바(E-038)는 v0.4 범위에 따로 없어 마크다운 편집기 탭에만 버튼 하나로 두었다(V4).

**v04-P3-5 ☰ 메뉴·툴팁, 외부 링크 (R-14, I-085)** (2026-11-06)
- 무엇을 했나: `impl`이 `app-menus.ts`에 Phase 3 시작 고정 목록의 R-14 메뉴 행을 넣고, `context.ts` `followLink`의 외부 링크 실패를 `notify`로 알리게 했다. `impl-core`가 `src-tauri/capabilities/default.json`에 `opener:allow-open-url`(`http://*`·`https://*`)을 더했다(leader 결정, 아래).
- 결과
  - 막대: [workbench-tauri] [File] [Edit] [View] [Go] [Window]. Edit(Undo, Redo)와 Go(Previous Tab, Next Tab)가 새로 생겼다. View는 Split 넷·Maximize Pane·Open Markdown Preview 두 항목이 더해졌다.
  - Open Markdown Preview 두 항목은 활성 Pane의 활성 탭이 마크다운 편집기가 아니면 비활성이고, 키보드 이동(I-515)이 건너뛴다.
  - 표시 키: Save `Ctrl-S`, Undo `Ctrl-Z`, Redo `Ctrl-Shift-Z`, Split Up/Down/Left `Ctrl-K Up/Down/Left`, Split Right `Ctrl-\`, Maximize Pane `Shift-Escape`, Open Markdown Preview `Ctrl-Shift-V`, to the Side `Ctrl-K V`, Previous/Next Tab `Ctrl-PageUp`/`Ctrl-PageDown`(I-704 마지막 바인딩).
  - 툴팁(02 8절): L-240·L-241·L-243·L-244·L-245·E-039, L-236·L-237을 대조만 했다(P3-1~P3-4에서 넣음).
  - 사용자 `keymap.json`: 새 액션이 모두 `commands`에 있어 바꾸거나 `null`로 풀 수 있다. `Editor && extension == md` 컨텍스트도 쓸 수 있다.
  - 외부 링크: http(s)는 `openUrl`로 열고, 허용 밖 스킴(`mailto:` 등)과 실패는 opener 오류 글 그대로 알림이다(원문에 문구 없음).
- 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 110/110.
- 특이사항: 없음.

**결함과 수정 이력**
- P3-1 R-1 표 컨텍스트(v04-P3-1 BLOCKED): leader 결정대로 I-044 두 키를 `Editor && extension == md`로 넣었는데 R-1 v0.4 표의 두 행은 `Editor`였다. writer가 표를 개정했고(W-v04-P3b, 위 표 아래 개정 설명) 코드 변경 없이 R-1 테스트가 통과했다.
- F-1(R-10, I-715, v04-M3 발견): 눌렀던 자기 탭에서 시작해 작은 걸음으로 끌면 삽입선이 안 그려지고 탭 표시(`data-index`·`active`)가 낡았다. 원인은 `lineOn`이 대상이 없는 순간 `d.target!.pane`을 읽어 TypeError를 던져 Solid 갱신이 끊긴 것이다. v04-P3-6이 판정을 순수 함수 `lineSide`(drop.ts, +test)로 옮겼다.
- F-2(R-9·R-10, 03-tauri R-01, v04-M3 발견): 글자를 선택한 직후 탭을 다른 Pane·가장자리로 옮기면 선택이 `[114,117]` → `[0,0]`이 됐다. 원인(CM6 소스 판독)은 떼었다 붙인 뒤 CM이 낡은 DOM 선택 복사본과 같다고 보고 선택을 다시 쓰지 않은 것이다. v04-P3-6이 공통 지점 `PaneBody`에서 붙인 뒤 `contentDOM`에 `blur` 이벤트를 보내게 했다. CM 내부 동작(blur → 선택 복사본 비움)에 기대므로 CM을 올리면 다시 확인한다.
- F-3(R-11, I-078, v04-M3 발견): Alt+Click으로 옆에 열면 `activeElement`가 `BODY`였다(툴바 버튼이 다시 그려지며 사라짐). v04-P3-6이 `openPreview` 옆 열기 경로 끝에서 `focusPane(from)`을 부르게 했다.
- F-4(R-9, I-730·I-732, v04-M3 발견): 확대 중 Ctrl+K Ctrl+방향키가 무동작이었다(확대한 Pane의 사각형이 본문 전체라 이웃이 없음). v04-P3-6이 Pane 자리(트리 속 부모 요소)의 사각형으로 판정하게 했다. 이웃으로 옮기면 확대가 풀리고, 이웃이 없으면 확대를 유지한다.
- 관찰 1(v04-M3 메모): 탭을 누르거나 탭 메뉴를 닫으면 포커스가 `SECTION.pane`이라 편집기를 다시 눌러야 입력됐다. v04-P3-6이 탭 mousedown의 기본 동작을 막고, 클릭은 `activateTab` 뒤 `focusPane`, 우클릭은 Pane 밖 포커스면 그 편집기에 먼저 포커스를 준다(메뉴는 닫힐 때 열 때의 포커스로, I-610 / A-19.4). 01-zed에 탭 클릭의 포커스를 적은 행을 찾지 못해 leader 지시(Zed처럼)대로 했다.
- 관찰 2(D-8, v04-M3 메모): 같은 파일 두 Pane에서 Ctrl+Z가 친 쪽 뷰에서만 동작했다. v04-P3-6이 파일의 첫 뷰(keeper)에만 undo 기록을 두고 다른 뷰의 편집을 `addToHistory`로 넘기며, Undo·Redo는 어느 뷰에서 눌러도 keeper에서 실행하게 했다. 한계는 `shortcut:` 주석(`src/workspace/context.ts`): keeper 탭을 닫으면 기록도 사라지고 다음 뷰는 자기 편집만 되돌린다.
- 관찰 3(I-051·I-053, v04-M3 범위 밖 관찰): 500줄 파일에서 Ctrl+End가 37줄로 갔다. v04-P3-6이 CM6 편집기 keymap에 `Mod-Home`/`Mod-End`(`cursorDocStart`/`cursorDocEnd`)와 Shift 변형(`selectDocStart`/`selectDocEnd`)을 걸었다(extensions.ts, 새 의존성 없음). I-048~I-055처럼 편집기 자체 키라 R-1 표는 개정하지 않았다.
- v04-P3-6 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 111/111(새 테스트 `lineSide` 1). F-2·F-3·F-4·관찰 1~3은 코드 확인, 해소는 v04-M3-R1에서 쟀다.

**leader 결정** (2026-11-06, 리더 결정(사용자 위임 2026-11-06))
- 확장자 술어: 키맵 엔진에 `key == value` 술어를 더하고 I-044 두 키의 내장 컨텍스트를 원문대로 `Editor && extension == md`로 둔다(v0.2 D-3 "내장 키맵이 쓰면 그때 더한다", v0.2 INTENT 결정 기록 10).
- Edit 메뉴: Undo·Redo를 v0.4 항목으로 넣는다(Phase 2에서 동작, 9.2절).
- Open Markdown Preview 두 메뉴 항목: 활성 탭이 마크다운 편집기가 아니면 숨기지 않고 비활성으로 둔다.
- 외부 링크: capability `opener:allow-open-url`을 http·https만 허용해 더한다. CSP는 바꾸지 않는다.
- 끌기 시작 임계: 01-zed에 값이 없어 넣지 않고 그대로 둔다(V4).

**v04-M3·M3-R1 Phase 3 끝 V3 실측** (2026-11-06)
- 무엇을 했나: V3 측정 담당이 레포 소스로 새로 만든 debug exe를 창 논리 1440×852, DPI 96, 키보드 `0x0412`에서 실제 OS 입력(PID·HWND 고정, 전경 가드)으로 쟀다. 값은 CDP(DOM·계산 스타일·CM6 상태)와 UI Automation(닫기 질문)으로 읽었다. 1차(M3) 뒤 P3-6 수정을 넣은 exe로 불일치와 관찰만 다시 재고 고친 코드가 닿은 영역의 회귀를 보았다(M3-R1).
- 결과
  - M3: 판정 348행 가운데 통과 325, 기록 13, 불일치 8행(원인 4건 F-1~F-4), 측정 불가(환경) 2.
    - R-8: 임시·일반·핀 탭 규칙(I-061~I-068·I-075·I-076), 핀 아이콘 `icons.size.small`·끝 슬롯 `tab.end_slot.*`·hover 없이 보임, 핀 보호와 Close Editor, Ctrl+PageUp/Down 순서·순환·포커스, 탭 우클릭 문구·단축키.
    - R-9: 분할선 두께·색 토큰·잡는 폭·커서, 4방향 분할·ClonePane·MovePane·비활성, flex 균등, 크기 조절 최소(중첩·불균등, 먼 형제로 넘김), 더블클릭 균등화, 확대 여백·테두리·툴팁, 방향 포커스 이동, Pane 제거·루트 유지, 같은 파일 두 Pane.
    - R-10: 삽입선·대상 탭 배경, 바 끝 영역, 오버레이(중앙 전체·가장자리 `pane.directional_drop_overlay_ratio`, 판정 폭 `pane.drop_target_size_ratio` ±1.5px), 가장자리 분할·중앙 이동·Ctrl 복제·Escape 취소·제자리 놓기, 임시 탭 승격, 핀 경계, 편집기 DOM 객체·`isConnected`·스크롤.
    - R-11: 값이 있는 `markdown_preview` 항목 전부, 툴바(E-038·E-039), 탭 제목·아이콘·24자, frontmatter 표/코드 상자, 스크립트·`on*`·`style` 0·CSP 위반 0, 표 정렬 클래스, `data-line`, 갱신 207~233ms(중앙값 221.3ms, `parse_debounce` 200ms), I-078·I-079·I-083·I-084·I-085(로컬 .md·Alt·파일·`mailto:` 알림)·I-086, Don't Save 뒤 디스크 내용, 프로젝트 패널 우클릭.
    - R-14: 아래 Phase 3 판정.
  - M3-R1: 재측정 73행 + 회귀 165행 모두 통과, 불일치 0. F-1~F-4와 관찰 1~3 해소. 회귀에서 불일치로 찍힌 3행 가운데 2행은 관찰 1 수정으로 바뀐 의도한 기대값(탭 메뉴를 닫은 뒤 포커스가 Pane → 편집기), 1행은 지난번과 같은 기록 행이다. 재측정 한 행은 스크립트의 기대값 오류였다(선택이 유지된 채 입력이 대체해 문서 길이 −2가 맞음).
  - 결과 파일: `specs/v0.4/verify/phase3.md`(8장 재측정), 스크린샷 5장(`phase3-markdown-preview.png`, `phase3-tab-drop-line.png`, `phase3-drop-overlay-left.png`, `phase3-zoomed.png`, `phase3-menu-view.png`).
- 검증: V3.
- 특이사항
  - 측정 불가(환경): 외부 링크(I-085)가 기본 브라우저로 열리는지 확인하지 못했다. 이 PC에서는 Windows '연결 프로그램 선택' 창(`OpenWith.exe`)이 뜬다. 앱 없이 `Start-Process`로 같은 URL을 열어도 같아 앱 결함이 아니다. 앱 쪽은 `openUrl`이 오류 없이 지나간 것까지 보았다. `mailto:`는 알림 `Not allowed to open url mailto:a@b.c`로 통과.
  - 미측정(V1로 덮음): I-713 "가운데 점이 닿는 Pane 없음" 경우(`split.test.ts`), I-712 등호 경계(`drop.test.ts`), 오른쪽·위/아래 동거리 모서리(정수 좌표 불가). 관찰 2의 되돌린 뒤 커서·스크롤은 짧은 파일만 쟀다(V4).
  - 기록(불일치 아님): Escape로 끌기를 취소한 뒤 놓으면 눌렀던 탭이 활성이 된다. Ctrl 복제는 활성 탭 바로 다음에 들어간다. 키로 확대를 바꾸면 포인터 아래 이미 뜬 툴팁 문구가 낡는다. 탭 메뉴를 바깥(트리) 클릭으로 닫으면 포커스는 누른 곳에 남는다. 분할 팝업의 Split Right 표시 키는 버튼을 누른 뒤의 포커스(Pane)에서 `Ctrl-K Right`이고 ☰ View는 편집기 포커스에서 `Ctrl-\`다(v0.2 "열 때의 포커스 컨텍스트" 규칙). 편집기 툴바 높이 35px(`toolbar.min_height`는 최소 높이).
  - 앱 실행: M3 최종 일괄 34회(판정), M3-R1 22회, 그 밖에 원인 탐색·도구 디버깅으로 여러 번. 입력이 다른 창으로 간 일은 없다. `state.json`은 매번 복구했고 SHA-256이 같다. 시험 폴더 삭제, `keymap.json` 없음, `tools/` 변경 없음.

**C-v04-P3 Phase 3 끝 검토** (2026-11-06)
- 무엇을 했나: `check`가 Phase 3 작업 트리 전체와 보고서를 검토하고 전체 테스트를 1회 돌렸다.
- 결과: PASSED. 지적 없음(참고 3건: `PaneBody` blur로 F-2 해결, `lineSide` 순수 함수로 F-1 해결, keeper 한계의 `shortcut:` 주석).
- 검증: `npm.cmd run typecheck` 통과, `npm.cmd run test` 111/111, `cargo check` 경고 0, `cargo test` 17 통과, `cargo clippy --all-targets -- -D warnings` 통과. 인라인 `style` 0건, capability 추가는 `opener:allow-open-url`(http·https) 1건, CSP 변경 없음.
- 특이사항: 검토 보고는 `markdown-it`의 하위 `entities`를 6.0.1로 적었다. `package-lock.json`에서 `markdown-it`이 쓰는 것은 중첩된 `node_modules/markdown-it/node_modules/entities` 8.1.0이고, 6.0.1은 원래 있던 루트의 다른 패키지다. D-2 표에는 8.1.0으로 적었다.

**Phase 3 판정** (2026-11-06)
- 결과: R-8 ~ R-11, R-14 충족. V3 불일치 0(F-1~F-4 해소, 관찰 1~3 반영).
- R-14 판정(v04-M3): ☰ 메뉴 막대·행·구분선·표시 키가 위 R-14 ☰ 메뉴 행 목록과 같다(Redo `Ctrl-Shift-Z`, Split Right `Ctrl-\`). Open Markdown Preview 두 항목은 탭 없음·비마크다운 탭·미리보기 탭에서 비활성이고 키보드 이동이 건너뛴다. 메뉴 동작(Split·Maximize Pane·Go·Edit Undo/Redo·File Save·Open Markdown Preview), 새 화면 요소의 툴팁 문구·단축키, 사용자 `keymap.json`으로 새 키를 바꾸고 `null`로 푼 뒤 메뉴·툴팁 표시와 동작, 파일을 지우면 원래 키로 돌아옴이 모두 맞다. Phase 2에서 더한 저장·닫기 키(Ctrl+S, Ctrl+W·Ctrl+F4)와 ☰ File Save·Close Editor도 이 판정에 들었다(PLAN Phase 2 목적 "판정은 R-14, Phase 3").
- PLAN 완료 조건 대조
  - `markdown-it` 15.0.3과 `dompurify` 3.4.17이 설치되어 있다. 하위 의존성은 D-2 표에 개정 줄로 적었다.
  - capability·CSP: **CSP는 바꾸지 않았다. capability는 PLAN의 "변경 없음" 조건과 다르게 `opener:allow-open-url`(`http://*`·`https://*`)을 더했다.** v0.2의 opener 권한(`allow-open-path`·`allow-reveal-item-in-dir`)에는 `allow-open-url`이 없어 외부 링크(I-085)의 `openUrl`이 막혔고, leader가 결정했다(사용자 위임 2026-11-06). 허용 범위는 http·https 두 스킴뿐이다(C-v04-P3 기준 2).
  - 렌더러가 맞추지 못한 `markdown_preview` 값(항목별, `verify/phase3.md` 4장)
    - L-104 제목 위 24·아래 12: 원문이 "추정"이고 toml ID가 없어 넣지 않았다(측정 `margin` 0/0, SPEC 제외 범위 "원문에 추정으로 적힌 값").
    - L-109 코드 블록 배경: 원문에 색이 없어 배경 없음(측정 `rgba(0, 0, 0, 0)`). hover 복사 버튼은 넣지 않았다(측정 `button` 0개).
    - L-111 frontmatter 셀 padding: 원문에 값이 없어 0(측정 `0px`).
    - I-083 블록 강조 모양: 원문에 스타일 값이 없어 `active-block` 클래스만 달고 그리지 않았다(측정 배경 투명·`outline: none`, 화면에 안 보임).
    - I-085 앵커 이동: `#…` 앵커와 줄/열 대상 이동은 넣지 않았다(측정 `#heading-two` 클릭 스크롤 0 → 0, `a.txt#L3`은 파일만 열림).
    - 그 밖: L-103 목록 간격 12는 항목 사이(`li + li`)로 읽었다(읽은 대로 12px, 원문이 어느 간격인지 불명). L-107 셀 선 색은 원문에 색이 없어 `--border`. L-69 같은 이름 겹침 설명은 넣지 않았다.
  - `shortcut:` 주석 위치
    - frontmatter 중첩 YAML 미지원: `src/editor/markdown.ts`(frontmatter 판별 위).
    - 미리보기 이미지 안 보임(S-9): `src/shell/markdown-preview.ts`, `src/app.css`(이미지 숨김 규칙).
    - `markdown-it` 타입 선언: `src/editor/markdown-it.d.ts` 첫 줄.
    - 끌기 시작 임계 없음: `shortcut:` 꼬리표는 없고 `src/shell/Pane.tsx` `startTabDrag` 위 주석("no threshold value in 01-zed")에 적혀 있다. 값이 정해지면 이 함수 한 곳을 바꾼다.
    - 그 밖에 이번 Phase에서 더한 것: I-713 동거리 순서 `src/workspace/split.ts` `inDirection`·`src/workspace/drop.ts` `bodyDrop`, 키맵 술어 범위 `src/keymap/engine.ts`, undo keeper 한계 `src/workspace/context.ts`.
  - I-713 거리가 같을 때의 순서(원문이 확정하지 않음, 구현 순서)
    - 포커스 이동(Ctrl+K Ctrl+방향키, `split.ts` `inDirection`): ① 현재 Pane 변의 가운데 점에서 그 방향으로 바로 닿는 Pane → ② 현재 Pane과 겹치는 길이가 가장 긴 Pane → ③ 읽는 순서(트리의 왼쪽→오른쪽, 위→아래)에서 먼저인 Pane.
    - 드롭 가장자리(`drop.ts` `bodyDrop`): 위 → 오른쪽 → 아래 → 왼쪽(원문이 변을 적은 순서). v04-M3에서 위·왼쪽, 아래·왼쪽 두 쌍을 쟀다(위, 아래가 이김).
- 특이사항: V4 목록에 Phase 3 항목을 더해 한 표로 모았다(아래).

## V4 사용자 확인 목록

버전 끝에 한꺼번에 받는다(`PLAN.md`). Phase마다 쌓는다. 아래 표가 사용자에게 올릴 목록이다.

| 번호 | Phase | 확인할 것 | 지금 상태·근거 | 출처 |
| --- | --- | --- | --- | --- |
| 1 | 1 | 줄 높이가 고정된 곳(트리 행, 탭 내용, 타이틀 바 폴더 이름 버튼)에서 14px로 바꾼 글자가 잘려 보이지 않는지 | V3에서 `scrollHeight`와 `clientHeight`가 같았다(트리 이름 20/20, 탭 제목 31/31, 폴더 이름 버튼 22/22). 눈으로 본 판정은 아니다 | v04-M1 |
| 2 | 2 | TaskDialog 문구의 모양: E-081 경로를 감싼 백틱이 창에 그대로 보이는 것, 수준 아이콘·줄바꿈 등 창의 보이는 모양 | 원문 "인라인 코드 표기"를 문자 그대로 옮겼다. 스크린샷 `specs/v0.4/verify/phase2-e081.png` ~ `phase2-e085.png` | v04-M2 |
| 3 | 2 | 긴 경로의 OS 말줄임이 Zed와 같아 보이는지 | E-081 경로가 길면 앱이 앞쪽을 자른 문자열(`editor.confirm_close.path_max_chars`)을 OS TaskDialog가 한 번 더 자체 말줄임한다(`phase2-e081-long-path.png`) | v04-M2 |
| 4 | 3 | 핀 탭의 Pin 버튼이 hover 없이 늘 보이는 것 | L-66은 "닫기 대신 Pin 아이콘"만 적고 보임 조건이 없다 | v04-P3-1 |
| 5 | 3 | Ctrl+PageUp/PageDown이 양 끝에서 도는 것 | 원문 I-010에 끝 처리가 없다 | v04-P3-1 |
| 6 | 3 | 탭 바 끝 버튼(+ / 분할 / 확대) 영역이 포커스 있는 Pane에만 보이는 것 | I-706대로 했다. v0.2에서는 늘 보였고 v0.2 V3 L-27 측정과 달라진다. 포커스 없는 시작 상태에는 끝 영역이 없다 | v04-P3-2 |
| 7 | 3 | ClonePane으로 만든 탭이 원래 임시 탭이어도 일반 탭인 것 | 원문에 없다 | v04-P3-2 |
| 8 | 3 | 탭 끌기 시작 임계가 없는 것(누르고 1px만 움직여도 끌기가 된다) | 01-zed에 값이 없다. leader 결정으로 그대로 둔다 | v04-P3-3, v04-M3 |
| 9 | 3 | 본문 중앙에 놓은 탭과 Ctrl 복제 탭이 대상 Pane의 활성 탭 바로 다음에 들어가는 것 | 원문은 "활성 위치"(I-717)·"위치 지정 없이 추가"(I-718)다 | v04-P3-3, v04-M3 |
| 10 | 3 | 편집기 툴바(E-038)를 마크다운 편집기 탭에만, 미리보기 버튼 하나로 둔 것 | 툴바는 v0.4 범위에 따로 없다. 브레드크럼·Buffer Search·Selection Controls 없음. 다른 탭의 레이아웃은 그대로다 | v04-P3-4 |
| 11 | 3 | 미리보기에서 이미지가 보이지 않는 것 | CSP `img-src`가 막는다(S-9). 깨진 이미지 상자 대신 숨겼다 | v04-P3-4 |
| 12 | 3 | 미리보기의 원문 커서 블록 강조(I-083)가 화면에 보이지 않는 것 | 원문에 스타일 값이 없어 `active-block` 클래스만 단다 | v04-P3-4, v04-M3 |
| 13 | 3 | 미리보기 전체 모양: 제목 위아래 여백 0, 코드 블록 배경·복사 버튼 없음, frontmatter 셀 padding 0, 목록 간격을 항목 사이로 읽은 것, 글꼴 | 원문에 값이 없거나 추정인 항목이다(Phase 3 판정의 렌더러가 맞추지 못한 값). 값이 있는 `markdown_preview` 항목은 V3에서 모두 맞았다. 스크린샷 `phase3-markdown-preview.png` | v04-P3-4, v04-M3 |
| 14 | 3 | 외부 링크 실패 알림 문구가 opener 오류 글 그대로인 것 | 원문에 문구가 없다. 예: `Not allowed to open url mailto:a@b.c` | v04-P3-5, v04-M3 |
| 15 | 3 | 미리보기의 http(s) 링크가 기본 브라우저로 열리는지 | 측정 PC에서는 Windows '연결 프로그램 선택' 창이 떠 확인하지 못했다(앱 없이 같은 URL을 열어도 같음) | v04-M3 |
| 16 | 3 | 같은 파일 두 Pane에서 Undo·Redo 뒤 커서·스크롤이 움직이는 뷰 | 기록을 가진 첫 뷰(keeper) 쪽이 움직이고, 누른 뷰는 변경을 따라 선택만 옮겨진다. 짧은 파일에서만 쟀다(두 뷰 모두 변화 없음) | v04-P3-6, v04-M3-R1 |

## 사용자 요청 작업

없음.

## 버전 종료

- 사용자 종료 판단: "v0.4를 종료한다. 사용자 확인(V4) 항목은 v0.5 Phase 12에서 함께 본다." (사용자 2026-11-06, core-leader 전달, workbench-core `specs/v0.5/orders/ORDER-01.md` 3.0)
- 남은 것:
  - V4 사용자 확인: 위 "V4 사용자 확인 목록"의 16항목을 사용자에게 아직 올리지 않았다. v0.5 Phase 12(사용자 일괄 확인)에서 함께 본다.
    1. 줄 높이가 고정된 곳에서 14px 글자가 잘려 보이지 않는지
    2. TaskDialog 문구의 모양(E-081 백틱, 아이콘·줄바꿈)
    3. 긴 경로의 OS 말줄임이 Zed와 같아 보이는지
    4. 핀 탭의 Pin 버튼이 hover 없이 늘 보이는 것
    5. Ctrl+PageUp/PageDown이 양 끝에서 도는 것
    6. 탭 바 끝 버튼 영역이 포커스 있는 Pane에만 보이는 것
    7. ClonePane으로 만든 탭이 원래 임시 탭이어도 일반 탭인 것
    8. 탭 끌기 시작 임계가 없는 것
    9. 본문 중앙에 놓은 탭과 Ctrl 복제 탭이 활성 탭 바로 다음에 들어가는 것
    10. 편집기 툴바를 마크다운 편집기 탭에만, 미리보기 버튼 하나로 둔 것
    11. 미리보기에서 이미지가 보이지 않는 것(CSP `img-src`)
    12. 미리보기의 원문 커서 블록 강조가 화면에 보이지 않는 것
    13. 미리보기 전체 모양(제목 여백, 코드 블록, frontmatter, 목록 간격, 글꼴)
    14. 외부 링크 실패 알림 문구가 opener 오류 글 그대로인 것
    15. 미리보기의 http(s) 링크가 기본 브라우저로 열리는지
    16. 같은 파일 두 Pane에서 Undo·Redo 뒤 커서·스크롤이 움직이는 뷰
  - 미정: 위 항목의 사용자 판단과, 판단 뒤 고칠 항목을 v0.5에서 다룰지 다음 버전으로 넘길지. v0.5 Phase 12에서 사용자가 정한다.
  - PLAN 완료 조건 "버전 끝 V4 목록을 사용자에게 올렸다"(Phase 3)는 위 사용자 판단에 따라 v0.5 Phase 12로 넘긴다.
