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

없음.

### Phase 3 — 탭 기능: 임시·핀 탭, 분할, 탭 드래그, 마크다운 미리보기

없음.

## V4 사용자 확인 목록

버전 끝에 한꺼번에 받는다(`PLAN.md`). Phase마다 쌓는다.

1. (Phase 1) 줄 높이가 고정된 곳(트리 행, 탭 내용, 타이틀 바 폴더 이름 버튼)에서 14px로 바꾼 글자가 잘려 보이지 않는지. V3에서 `scrollHeight`와 `clientHeight`가 같았다(트리 이름 20/20, 탭 제목 31/31, 폴더 이름 버튼 22/22). 눈으로 본 판정은 아니다.

## 사용자 요청 작업

없음.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
