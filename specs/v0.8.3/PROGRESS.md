> 버전: v0.8.3 · 작성일: 2026-11-14 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. core I-n ↔ Phase ↔ tauri 카드 대응은 `ITEMS-MAP.md`에, 요구와 판정 방법은 core `specs/v0.8.3/ITEMS.md`와 카드 4절에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.8.3/reports/`에 있다.

# PROGRESS — workbench-tauri v0.8.3

## v0.8.3 시작

- 시작: 2026-11-14. core v0.8.2는 2026-11-14에 끝났다(tauri `origin/master` = `d8f9438`).
- 범위: v0.8.2까지 만든 것의 버그 수정과 UI 다듬기(core ITEMS I-1~I-17). core PLAN은 카드 5장이다(`ITEMS-MAP.md` 2장).
- 화면 측정은 ORDER-05에 모은다. ORDER-01~04는 단위 테스트·typecheck·코드 리뷰로 판정한다(core COMMON 8절).
- 보안 설정은 `d8f9438`과 같게 둔다(core COMMON 3절).

## Phase별 진행

### Phase 1 — ORDER-01 (I-2·I-13·I-15): v0.8.3 시작, 구분선 두께·색, 상태 표시줄 위치 표시

- **에이전트 환경** (2026-11-14, leader-core)
  - 무엇을 했나: v0.8.2 마지막 구성으로 워크스페이스 `workbench-tauri`(w15)에 띄웠다(사용자 2026-11-14 "tauri herdr 환경을 구성해 주세요", core ORDER-01 3.1). `tauri-leader` w15:p1, `tauri-writer` w15:p2, `tauri-coder` w15:p3, `tauri-checker` w15:p4. `tauri-analyst`는 띄우지 않았다.
  - 결과: `HERDR-SETUP.md` 1·2장. `herdr agent list` 근거는 ORDER-01 보고에 붙인다(tauri-leader).
  - 검증: 모델·effort는 `HERDR-SETUP.md` 1장 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.8.3 시작 문서와 루트 AGENTS.md** (2026-11-14, writer)
  - 무엇을 했나: `specs/v0.8.3/`에 HERDR-SETUP(v0.8.2판에서 버전·경로·패널 w15·leader-core `w14:p1`, 카드·보고 앞붙이 `v083-`, 보안 설정 기준 `d8f9438`·허락 카드 없음, 화면 검증은 ORDER-05에서만, 5.5에 서브 에이전트 허락 창 승인 규칙과 checker 카드에 core 내용 옮겨 적기)·ITEMS-MAP(core I-1~I-17 ↔ 그룹 ↔ core Phase ↔ tauri 카드, I-2·I-13·I-15 진행 중, 나머지 대기)·PROGRESS를 상태 "초안"으로 쓰고 `reports/`·`verify/`(`.gitkeep`)를 만들었다(ORDER-01 3.1). 루트 `AGENTS.md`의 제목 `(v0.8.3)`, 1장 현재 상태, 0장 경로, 카드·보고 앞붙이 `v083-`, "core ITEMS 우선"(v0.8.3, I-1~I-17)·"HERDR 구성은 core가 정한다"(v0.8.3 구성 = v0.8.2 마지막 구성, 근거 core v0.8.3 ORDER-01 3.1), 3A.4·8장 verify 경로를 고치고, 레포 규칙 절에 "서브 에이전트 허락 승인" 한 줄을 더했다. 다른 규칙은 그대로다.
  - 결과: v0.8.2처럼 tauri PLAN을 두지 않고 ITEMS-MAP이 Phase 대응을 맡는다. "HERDR 구성" 문장에서 v0.8.2의 `tauri-analyst` "I-27 분석만"을 "필요할 때만, 실험은 worktree에서만"으로 바꿨다.
  - 검증: V0. `git grep` 결과는 보고 `C:\Users\nampl\AppData\Local\Temp\v083-W-01-report.md`. 커밋 `3faa224`.
  - 특이사항: 없음.
- **K-01 앱 버전 0.8.3·I-2·I-13·I-15 (ORDER-01)** (2026-11-14, coder, 커밋 `8aa9073`)
  - 무엇을 했나:
    - 버전: `src-tauri/tauri.conf.json` 0.8.2 → 0.8.3, `src/shell/about.test.ts` 기대값 두 곳. `package.json`·`Cargo.toml`에는 앱 버전 자리가 없다. README·`docs/BUILD.md`는 ORDER-05에서 한다.
    - I-2: 세 선을 쓰는 CSS 자리에 `max(1px, …)`를 걸었다 — `.split-handle`(`--split-line` = `max(1px, var(--pane-split-line-thickness))`, 좌우 너비·상하 높이)·`.status-divider`(`src/app.css`), `.picker-divider`(`src/shell/picker.css`). `spec/metrics.ts` 값은 그대로다(`--picker-input-divider-width`는 선택기 입력 줄 테두리도 써서 값을 바꾸면 카드 밖 선까지 바뀜). 잡는 영역 `::before`는 그려지는 두께 `--split-line` 기준으로 가운데에 오고, `--pane-split-line-mouse-hitbox` 값은 그대로다.
    - I-13: 구분선은 한 요소로 두고 배경을 탭 줄 높이에서 끊긴 그라디언트로 그린다 — `linear-gradient(var(--pane-group-border) var(--tab-bar-height), var(--split-line-body) 0)`(위는 UI 색, 아래는 본문 구간 색). 끌기·두 번 누르기와 잡는 영역이 한 요소에 걸려 있어 쪼개지 않았다. 테마를 걸 때(`theme/apply.ts`) 영역 쌍 셋의 본문 색을 `:root` 변수 `--split-line-edit-edit`·`--split-line-edit-view`·`--split-line-view-view`로 내고, `Pane.tsx`가 좌우 구분선에 양쪽 창의 영역을 `data-areas`로 적어 CSS가 변수를 고른다. 색 규칙은 순수 함수 `splitLineColor`(`src/shell/split-line.ts`, 새로) — 본문 구간·좌우 분할·양쪽 문서 창·두 창의 `pane_group.border`(없으면 `border`)가 같을 때만 그 색, 나머지는 UI 색. 인라인 style 없음. 테마를 바꾸면 변수가, 활성 탭이 바뀌면 `data-areas`가 따라 바뀐다.
    - I-13 shortcut: 구분선 한쪽이 다시 나뉜 그룹(중첩 분할)이면 문서 창으로 치지 않아 UI 색이다(`Pane.tsx` `areaOf`의 `shortcut:` 주석). 그 선에도 테마 색이 필요하면 선에 닿는 pane을 모두 걷도록 넓힌다. checker는 "그 밖은 모두 UI 테마 색" 범위에 맞다고 판정했다.
    - I-15: 미리보기 탭(마크다운·ipynb·HTML) 위치를 `{줄}`만(`src/workspace/context.ts`), 편집 탭·도구 탭(`toolPosition`)은 그대로. `src/editor/filetypes.json`에 "Jupyter Notebook"(`ipynb`) 한 건만 더했다(편집·미리보기 탭 같은 경로). Outline은 `Outline.tsx:180` `Number(position?.split(":")[0])`라 새 글자 `"8"`에서도 같은 줄 8을 낸다(미리보기 위치를 `:`로 읽는 곳은 이 한 곳, `src` grep).
  - 결과: 보안 설정 diff는 `tauri.conf.json` 버전 한 줄뿐(`git diff d8f9438 -- src-tauri/tauri.conf.json src-tauri/capabilities`). 새 테스트 `src/shell/split-line.test.ts`(경우 여섯 + 테마 변경). 기존 `status.test.ts`·`filetype.test.ts`를 새 값으로 고쳤다.
  - 검증: V1 + V0. `node --test src/shell/split-line.test.ts src/shell/about.test.ts src/shell/status.test.ts src/editor/filetype.test.ts` 9/9, `npm.cmd run typecheck` 0(출력 `C:\Users\nampl\AppData\Local\Temp\v083-K-01-tests.txt`, 보고 `...\v083-K-01-report.md`). Rust를 건드리지 않아 `cargo`는 돌리지 않았다. 전체 테스트는 ORDER-05.
  - 특이사항: 없음.
- **C-01 checker 리뷰(K-01)** [PASS] (2026-11-14, checker)
  - 무엇을 했나: K-01 diff를 리뷰했다(버전 자리, I-2 세 선의 `max(1px, …)`와 잡는 영역 가운데 계산, I-13 색 규칙·`areaOf`가 도구 탭·Welcome에서 null인지·`--tab-bar-height`가 실제 탭 줄 높이 변수와 같은지·`pane_group.border` 대체, 중첩 분할 shortcut, I-15 위치 글자·`.ipynb` 한 건·Outline 읽기, 보안 설정 diff).
  - 결과: PASS. Settings는 별도 창이라 pane 도구 탭이 아니고, `settings.json` 파일 탭은 문서 편집 탭이라 `"edit"`로 치는 것이 맞다고 봤다.
  - 검증: V0 코드 리뷰(앱 실행·테스트 재실행 없음, coder 출력 근거)(보고 `C:\Users\nampl\AppData\Local\Temp\v083-C-01-report.md`).
  - 특이사항: 없음.
- **화면으로 잴 것 (ORDER-05로 넘김, core COMMON 8절)**
  - About에 0.8.3.
  - I-2: UI 글자 15px, 좌우 분할 50:50에서 창 너비 짝수·홀수일 때 pane 구분선 1px, 상하 분할도 같음. 상태 표시줄 왼쪽 선·테마 선택기 가로선이 보임.
  - I-13: 같은 라이트 미리보기 둘 사이 본문 구간이 라이트 테두리 색, 다크 편집 + 라이트 미리보기 사이는 UI 색(픽셀 색). 탭 줄 구간 경계가 탭 줄 높이와 맞음.
  - I-15: 마크다운·ipynb·HTML 미리보기와 편집 탭의 위치 글자, Outline 지금 위치 표시.
- **상태**: ORDER-01 보고 보냄, leader-core `[PUSH]` 대기.
