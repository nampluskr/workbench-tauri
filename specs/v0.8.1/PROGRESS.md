> 버전: v0.8.1 · 작성일: 2026-11-13 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서와 core I-n 대응은 `PLAN.md`에, 요구와 판정 방법은 core `specs/v0.8.1/ITEMS.md`와 카드 4절에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.8.1/reports/`에 있다.

# PROGRESS — workbench-tauri v0.8.1

## Phase별 진행

### Phase 1 — v0.8.1 시작, 트리 이름 입력 글자 크기와 트리 글자색

- **에이전트 환경** (2026-11-13, leader-core)
  - 무엇을 했나: leader-core가 workspace `w0`(workbench-tauri)에 탭 넷을 에이전트 이름으로 두고(`w0:t1` tauri-leader, `w0:t2` tauri-writer, `w0:t3` tauri-coder, `w0:t4` tauri-checker) 에이전트 넷(`w0:p1`~`w0:p4`)을 `HERDR-SETUP.md` 1장 구성으로 띄웠다(사용자 2026-11-13, core ORDER-01 3.1).
  - 결과: worktree 없음. `herdr agent list`·`herdr tab list --workspace w0` 근거는 ORDER-01 보고에 붙인다(tauri-leader).
  - 검증: 모델·effort는 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.8.1 문서와 루트 AGENTS.md** (2026-11-13, writer, 커밋 `798d696`)
  - 무엇을 했나: `specs/v0.8.1/`에 PLAN(core I-1~I-13 ↔ Phase 1~7 대응, Phase 1 작업 카드 표)·HERDR-SETUP·PROGRESS를 상태 "초안"으로 쓰고, `reports/`·`verify/` 폴더(`.gitkeep`)를 만들었다(ORDER-01 3.1). 루트 `AGENTS.md`의 레포 규칙 절 "HERDR 구성은 core가 정한다"(v0.8.1 구성)·"core ITEMS 우선"(v0.8.1, I-1~I-13), 제목 `(v0.8.1)`, 0장 경로, 카드 파일 이름 `v081-`, 1장 현재 상태, 3A.4·8장 `specs/v0.8.1/verify` 경로를 고쳤다. 규칙 자체는 그대로다.
  - 결과: HERDR-SETUP은 v0.8판에서 구성(coder Opus 5.5 medium, checker agy `claude-sonnet-5-5-high`), 레이아웃(`w0`, leader-core 띄움), 카드·보고 파일 이름(`v081-`), 경로, core 근거(core v0.8.1 `orders/COMMON.md`), 리뷰 독립성 문장을 바꿨다.
  - 검증: V0. v0.8 구성 문자열(coder 모델·checker 모델·카드 파일 앞붙이) 셋을 `AGENTS.md`·`specs/v0.8.1`에서 `git grep --untracked`로 찾아 출력 없음(보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-01-report.md`).
  - 특이사항: 없음.
- **K-01 앱 버전 0.8.1·I-1·I-2 (ORDER-01)** (2026-11-13, coder, 커밋 `b6c8683`)
  - 무엇을 했나:
    - 버전: `src-tauri/tauri.conf.json` 0.8.0 → 0.8.1, `src/shell/about.test.ts` 고정값 두 곳, `docs/BUILD.md` 125행 예시. 설치 파일 이름·제품 버전은 `tauri.conf.json` 한 곳에서 나온다. `docs/BUILD.md`의 나머지 0.8.0은 0.8.0 빌드 기록이라 그대로, `README.md:10`은 ORDER-07에서 한다.
    - I-1: 원인은 `.tree-input`이 `.tree-label` 밖에서 `font: inherit`로 본문 크기(16px)를 받은 것이다. `src/app.css`에 `.tree-row .tree-input { font-size: var(--typography-size-default) }`(14px, 특이성 0,2,0)를 더했다. Sidebar 폴더 이름 입력은 `.sidebar-item`의 `--sidebar-item-font-size`(14px)를 물려받아 이미 같아서 고치지 않았다.
    - I-2: Zed 소스(커밋 `14b7b0e`, 읽기만)를 확인했다. 이름 색은 `project_panel.rs:7202-7203` `entry_git_aware_label_color(…, is_marked)` → `items.rs:2256-2262` `entry_label_color`(true `Default`, false `Muted`) → `color.rs:92-93`(`text`·`text_muted`). 마우스 올림은 배경만 바뀌고(`project_panel.rs:6153-6163`), 활성 편집기 파일은 reveal 때 marked가 된다(`7278-7281`, `7299-7303`). 접힌 경로 조각·구분자도 같은 색이다. 이름 입력칸은 single-line Editor라 `editor.foreground`다(`editor.rs:11635-11636`). 폴더·파일 구분은 없다.
    - 첫 규칙: `.tree-row { color: var(--text-muted) }`, `.tree-row.selected, .tree-row.marked`에 `color: var(--text)`, `.tree-input { color: var(--editor-foreground) }`.
  - 결과: 글꼴·굵기·크기·아이콘 색은 그대로다. git 상태·진단 색은 넣지 않았다.
  - 검증: V1. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 287/287(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-01-report.md`).
  - 특이사항: Zed는 수식키 없이 폴더를 누르면 marks를 비운다(`project_panel.rs:6576-6577`). tauri는 그 폴더를 `selected`로 두므로 첫 규칙에서는 글자가 `text`가 되었다(→ K-01-R1).
- **C-01 checker 검토(W-01·K-01)** [PASS] (2026-11-13)
  - 무엇을 했나: `798d696`·`b6c8683`과 그 위의 `0895dc7`(K-01-R1)을 HEAD 기준으로 검토했다. 명령은 `git grep`·`git show --stat`·`git status -s`·`git log`만 썼다.
  - 결과: 막는 문제 없음. 지적 F-1: `.tree-input { color }`가 `.tree-row` 밖에 있어 Sidebar 폴더 이름 입력 글자색도 `--text`에서 `--editor-foreground`로 바뀐다(ORDER-01 3.3 "Sidebar 글자색 변경 안 함"과 어긋남) → K-01-R2.
  - 검증: V1 검토(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-01-report.md`).
  - 특이사항: checker는 이 PC에서 Zed 소스를 열지 못했다. 줄 번호는 coder 보고를 따랐다.
- **V3 첫 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: `b6c8683` 기준으로 트리 글자색을 쟀다.
  - 결과: 맨 클릭한 폴더 글자가 `text`라서 Zed와 달랐다. 사용자 캡처의 선택 폴더 `spec`은 One Light `#58585a`(`text.muted`)다.
  - 검증: V3.
  - 특이사항: K-01-R1로 다시 지시했다.
- **K-01-R1 I-2 글자색 조건 좁힘** (2026-11-13, coder, 커밋 `0895dc7`)
  - 무엇을 했나: 선택 배경 규칙(`.tree-row.selected, .tree-row.marked`)에서 글자색을 뺐다. 대신 `.tree-row.marked, .tree-row.active-file { color: var(--text) }`를 더했다. `src/shell/ProjectTree.tsx`는 행 경로가 활성 Pane 활성 탭의 경로와 같으면(새 항목 입력 행은 빼고) `active-file` 클래스를 단다(`activeTabOf` 재사용).
  - 결과: `text`는 marked 행과 활성 탭 파일 행에만 쓴다. 커서만 선택한 행(맨 클릭 폴더, 키보드 커서)은 `text.muted`다.
  - 검증: V1. `npm.cmd run typecheck` 오류 0, `node --test src/workspace/tree.test.ts` 11/11(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-01-R1-report.md`).
  - 특이사항: 비교가 한 줄이라 테스트를 더하지 않았다(AGENTS 4.4).
- **V3 다시 측정 + C-02 checker V3 판정** [PASS] (2026-11-13)
  - 무엇을 했나: tauri-leader가 `0895dc7` debug exe를 창 1440×852·배율 100%로 띄워 One Dark·One Light에서 쟀다. checker는 결과 파일만 읽고 판정했다. 결과 파일은 `specs/v0.8.1/verify/ORDER-01/v3.json`, PNG, `measure.mjs`다.
  - 결과: #2~#7 PASS.
    - About은 Version 0.8.1이다.
    - 입력칸(이름 바꾸기·새 파일·새 폴더)과 보통 행은 14px이다. 행 높이 26, 글자 시작 x 67로 같다. 이름 바꾸기 글자 세로 위치는 행 단위 0px 차이다.
    - Sidebar 입력은 14px이다.
    - 상태별 글자색은 기대 토큰과 같다. 보통·올림·맨 클릭 폴더·키보드 커서·접힌 경로·sticky는 muted, 활성 파일·marked는 text, 입력칸은 One Dark `editor.foreground`다.
    - 회귀가 없다. 여러 개 선택, 포커스 테두리, 정렬선, 우클릭 메뉴, 접힌 경로, sticky, Enter·Esc, 한글 조합, 오류·경고 테두리가 그대로다.
  - 검증: V3(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-02-report.md`).
  - 특이사항: 두 가지를 이때 재지 못해 K-01-R2 뒤에 다시 쟀다. 하나는 One Light 입력칸 글자색이고, 다른 하나는 F-1(Sidebar 입력이 `rgb(172,178,190)`로 바뀐 것이 이때 실측으로 확인됨)이다.
- **K-01-R2 입력칸 글자색 범위** (2026-11-13, coder, 커밋 `87bb2c1`)
  - 무엇을 했나: `src/app.css`에서 `color: var(--editor-foreground)`를 `.tree-row .tree-input` 규칙으로 옮겼다. `.tree-input`의 글자색은 v0.8 값 `--text`로 되돌렸다.
  - 결과: 트리 입력(새 파일·새 폴더·이름 바꾸기)은 `editor.foreground`다. Sidebar 폴더 이름 입력은 `--text`로 v0.8과 같다. 크기는 그대로다.
  - 검증: V0. `npm.cmd run typecheck` 오류 0(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-01-R2-report.md`).
  - 특이사항: 없음.
- **R2 다시 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: `87bb2c1` 기준으로 트리 입력과 Sidebar 입력의 글자색·크기만 다시 쟀다(`specs/v0.8.1/verify/ORDER-01/v3-r2.json`, `r2-*.png`, `measure-r2.mjs`).
  - 결과:
    - 트리 입력: One Dark `rgb(172,178,190)`(= `editor.foreground`), One Light `rgb(36,37,41)`.
    - Sidebar 입력: One Dark `rgb(220,224,229)`(= `--text`), One Light `rgb(36,37,41)`.
    - 크기는 모두 14px이다.
  - 검증: V3. 전체 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 287/287.
  - 특이사항:
    - 맨 클릭한 폴더의 선택 배경은 Zed에 없다. 카드 범위가 글자색만이라 그대로 두었다.
    - Zed는 폴더 클릭 때 marks를 비워 활성 파일 행도 잠시 muted가 된다. tauri는 활성 파일 행을 늘 text로 둔다. 같게 하려면 새 상태가 필요해서 하지 않았다.
    - Zed 비교 캡처는 사용자 캡처(`D:\projects\workbench-core\specs\v0.8.1\img\G1-*.png`)를 썼다. 사용자의 Zed 테마 설정을 바꾸지 않으려고 Zed를 직접 띄워 찍지 않았다.
- **W-02 ORDER-01 PROGRESS·PLAN 기록** (2026-11-13, writer)
  - 무엇을 했나: 위 K-01~R2 다시 측정 항목을 각 보고 파일에서 옮겨 적고, `PLAN.md` Phase 1 작업 카드 표에 K-01-R1·C-02·K-01-R2·W-02 행을 더했다. C-01은 "검토", C-02는 "V3 판정"이다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-02-report.md`).
  - 특이사항: W-01 항목에 커밋 `798d696`을 더했다.
