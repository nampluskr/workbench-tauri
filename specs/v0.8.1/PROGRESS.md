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

### Phase 2 — 트리 드래그 앤 드롭

- **K-02 I-3 트리 드래그 (ORDER-02)** (2026-11-13, coder, 커밋 `0c858aa`)
  - 무엇을 했나: `src/shell/ProjectTree.tsx`·`Pane.tsx`, `src/workspace/actions.ts`·`context.ts`·`ops.ts`·`ops.test.ts`, `src/spec/metrics.ts`, `src/app.css`를 고쳤다. 탭 드래그의 놓을 곳 판정·표시(`hitTest`, `.drop-overlay`, `.tab.drop-left`, `.tab-bar-drop`), `drop.ts place()`, `pasteJobs`·`targetDir`, Rust `rename_path`(배타 `MoveFileExW`)·`paste_paths(cut=false)`·`paths_exist`, 이름 바꾸기의 `followMove`를 재사용했다.
  - 결과: Zed 소스(로컬 사본 `zed-src-4304dec7`, 읽기만)로 확인한 동작을 따랐다.
    - 놓을 곳 표시: 대상 폴더 행과 그 아래 행에 `drop_target.background`, 테두리 투명. 파일 위면 그 파일이 든 폴더, 행 아래 빈 곳이면 루트, 접힌 경로 조각이면 그 조각 폴더가 대상이다(`project_panel.rs:6201-6226`, `6052-6059`, `7990-8001`, `6902-6965`).
    - 옮길 것이 하나도 없으면(자기 자신·하위 폴더·이미 든 폴더) 표시하지 않고 놓아도 아무 일 없다. 하위 폴더는 ORDER 3.1 결정이다(Zed는 막지 않고 파일 시스템 오류 알림).
    - 같은 이름이면 옮기지 않고 Zed 문구로 알린다("Failed to move `{from}` to `{to}`. A file or folder already exists there.", `8429-8435`).
    - Ctrl을 누른 채 놓으면 복사, 같은 이름이면 copy 이름(`5203-5206`). 여러 개는 marked 안을 누르면 marked 전부(다른 끄는 폴더 안 항목·루트는 뺌). sticky 행은 끌기·놓기 안 됨.
    - 닫힌 폴더 위에 500ms 머물면 펼침(`6428`), 가장자리 스크롤은 목록 높이 5% 안 8px·15% 안 5px를 16ms마다(`7600-7631`). 새 상수 `PROJECT_PANEL_DRAG_EXPAND_DELAY_MS`·`PROJECT_PANEL_DRAG_SCROLL`.
    - pane에 놓기: 누른 항목 하나를 일반 탭으로 열고 포커스, 놓을 곳은 R-10 판정(`workspace/pane.rs:4048-4146`).
    - 탐색기에서 끌어 넣기: 복사, 파일 하나면 열기(`getCurrentWebview().onDragDropEvent`, 위치는 물리 px / `devicePixelRatio`).
    - 끌기 시작은 수치 없이 "누른 행의 사각형 밖으로 나가면"이다(gpui 크레이트가 사본에 없어 Zed 문턱 미확인).
  - 검증: V1. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 289/289(새 테스트 2개, `ops.test.ts`). Rust는 고치지 않았다. `tauri.conf.json`·capability 변경 없음(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-02-report.md`).
  - 특이사항: 되돌리기는 카드 3.4(단축키 추가 안 함)와 부딪쳐 넣지 않고 leader-core에 물었다(→ K-02b). 끄는 동안 따라다니는 그림·커서 모양, Ctrl 복사 하나가 copy 이름일 때 이름 바꾸기 입력 열기, 한 개 끌 때 marked로 바꾸기는 생략했다.
- **C-03 checker 검토(K-02)** [REWORK] (2026-11-13)
  - 무엇을 했나: `0c858aa`를 검토했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 289/289, `git diff de17d49 -- src-tauri/tauri.conf.json src-tauri/capabilities` 출력 없음.
  - 결과: 데이터 손실·열린 탭·클릭 회귀·탐색기 놓기·보안·하드코딩은 통과. 지적 셋:
    - F-1(필수): `dropEntry`가 새로 열리는 파일에도 "이미 열린 탭 옮기기" 보정을 써서, 탭 위에 놓으면 한 칸 왼쪽에 들어간다(탭 [A,B,C,D] 활성 B, 새 X를 D 위에 → [A,B,X,C,D], R-10은 [A,B,C,X,D]).
    - F-2(권고): 가장자리 자동 스크롤 중 놓을 곳이 갱신되지 않아, 멈춘 채 스크롤한 뒤 놓으면 이전 폴더로 옮겨진다.
    - F-3(권고): `pointerup`이 오지 않으면(`pointercancel`·포커스 잃음) window 리스너가 남는다.
  - 검증: V1 검토(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-03-report.md`).
  - 특이사항: 끌다가 처음 누른 행에 돌아와 놓으면 click이 따라오는지는 코드로 단정 못 해 V3에서 볼 것으로 남겼다.
- **leader-core 결정: 되돌리기 넣음** (2026-11-13, leader-core)
  - 무엇을 했나: K-02 "미정"에 답했다. ITEMS I-3이 "되돌리기는 Zed와 같게"이고, 카드 3.4는 잘라내기/붙여넣기만 다룬다고 정했다.
  - 결과: 되돌리기를 넣는다(→ K-02b). 새 상수 둘(머물면 펼침 지연, 가장자리 스크롤)은 leader-core가 core `spec/zed-metrics.toml`에 넣는다.
  - 검증: 없음(결정).
  - 특이사항: 없음.
- **K-02b I-3 트리 드래그 되돌리기** (2026-11-13, coder, 커밋 `2c9d3ef`)
  - 무엇을 했나: `src/workspace/undo.ts`(새)·`undo.test.ts`(새), `actions.ts`, `src/shell/tree-commands.ts`, `src/keymap/builtin.ts`·`builtin.test.ts`, `src/spec/metrics.ts`, `src-tauri/src/files.rs`·`lib.rs`를 고쳤다. Rust 새 명령 `trash_for_undo(path) -> id`(휴지통 전후 목록 차로 id)·`restore_trashed(id)`. 의존성 `trash = 5.2.9`는 이미 있던 것이다.
  - 결과:
    - 키: ProjectPanel 문맥에서만 `ctrl-z` → `project_panel::Undo`, `ctrl-shift-z` → `project_panel::Redo`(Zed `default-windows.json:1024-1025`). 편집기 Undo와 겹치지 않고, 이름 입력 중엔 아무것도 안 한다.
    - 기록 단위: 한 번의 drop이 한 단계(트리 옮기기·Ctrl 복사·탐색기 끌어 넣기). 이름 바꾸기·삭제·붙여넣기·복제는 기록하지 않는다. 이력은 창에 하나, 한도 10,000단계(`undo.rs:335`).
    - 역동작: 옮김 → 되돌려 옮김(배타, 열린 탭 따라감), 만든 복사본 → 확인창 한 번 뒤 휴지통, 휴지통 복사본 → 원래 자리로 복원. 실패한 역동작은 그 단계를 버리고, 확인창 거절은 남긴다. 되돌릴 자리·복원 자리에 무언가 있으면 하지 않는다.
    - 알림: "Undo Failed"/"Redo Failed" + Zed 문구(`undo.rs:672-867`).
    - 상수 표(leader-core가 core toml에 넣을 것). 앱 쪽 이름은 `src/spec/metrics.ts`의 `PROJECT_PANEL_DRAG_EXPAND_DELAY_MS`·`PROJECT_PANEL_DRAG_SCROLL`·`PROJECT_PANEL_UNDO_LIMIT`다.

      | 상수 | 값 | Zed 소스 |
      |---|---|---|
      | 머물면 펼침 지연 | 500 ms | `project_panel.rs:6428` |
      | 가장자리 near 구역 / 한 번 이동 | 5% / 8 px | `project_panel.rs:7600-7601`, `7604-7605` |
      | 가장자리 far 구역 / 한 번 이동 | 15% / 5 px | `project_panel.rs:7602-7603`, `7606-7607` |
      | 스크롤 간격 | 16 ms | `project_panel.rs:7631` |
      | 되돌리기 이력 한도 | 10,000 단계 | `undo.rs:335` |

  - 검증: V1. `npm.cmd run typecheck` 0, `npm.cmd run test` 291/291, `cargo clippy -- -D warnings` 통과, `cargo test` 22 통과(첫 실행에서 손대지 않은 `folder_watch::tests::missing_root_is_watched_after_creation_and_recreation` 1회 실패, 다시 돌려 통과 — 타이밍 흔들림으로 봄). 키맵 R-1 테스트는 v0.4 고정 표를 두고 새 두 줄을 근거 주석과 함께 더했다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-02b-report.md`).
  - 특이사항: 우클릭 메뉴 Undo/Redo 항목(Zed `project_panel.rs:1240-1244`)과, 저장 안 한 탭이 있는 복사본을 휴지통에 보낼 때 Zed의 dirty 안내는 넣지 않았다.
- **K-02-R1 C-03 F-1~F-3** (2026-11-13, coder, 커밋 `53de8d5`)
  - 무엇을 했나: `src/workspace/drop.ts`·`drop.test.ts`·`context.ts`, `src/shell/ProjectTree.tsx`를 고쳤다.
    - F-1: `drop.ts`에 `entryIndex(index, at, existed)`. 그 pane에 같은 path 탭이 이미 있었으면 `index > at`일 때 1 빼고, 새 탭이면 `where.index` 그대로.
    - F-2: `edgeScroll`은 속도가 바뀔 때만 타이머를 다시 만들고, 틱마다 `scrollTop` 이동 → `onScroll()` → `aim()`으로 마지막 포인터 좌표의 놓을 곳을 다시 계산한다.
    - F-3: 누를 때 window에 `pointercancel`(capture)·`blur`, 끌기 시작 뒤 `lostpointercapture`를 달고 셋 다 `finish(false, false)`.
    - 끌기가 시작된 뒤 끝나면 `dragEnded`를 켜고 다음 틱에 끈다. 행·조각·고정 행의 click은 이때 무시한다(탭 드래그·Sidebar와 같은 방식).
  - 결과: 새 파일을 탭 위에 놓으면 그 탭 앞(R-10)에 들어간다.
  - 검증: V1. `npm.cmd run typecheck` 오류 0, `node --test src/workspace/drop.test.ts` 5/5(새 테스트 1개, C-03 재현 그대로)(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-02-R1-report.md`).
  - 특이사항: 없음.
- **V3 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: `53de8d5` debug exe를 1920×1080·100%, 창 1440×852, One Dark, 픽스처 `o2ws`로 띄워 CDP 마우스·키로 쟀다(`specs/v0.8.1/verify/ORDER-02/v3.json`, PNG, `measure.mjs`). 탐색기 놓기(#7)는 실제 OLE 끌기를 SendInput으로 했고, 놓기 직전 그 점이 앱 창인지 확인한다(`v3-c7.json`, `measure-c7.mjs`, `ext-drop.ps1`, `drag-src.ps1`).
  - 결과: 판정은 C-04에 있다.
  - 검증: V3.
  - 특이사항: 탐색기 놓기는 처음엔 놓는 점이 다른 창에 가려 취소됐고, 앱을 앞으로 가져와 다시 했다. 1차 스크립트 문제로 다시 쟀다. `v3.json`의 `c7_explorer`(ERR)는 그 기록이 남은 것이고 `v3-c7.json`이 대체한다.
- **C-04 checker 검토(K-02b·K-02-R1)와 V3 판정** [PASS] (2026-11-13)
  - 무엇을 했나: `0c858aa..53de8d5`를 검토하고 V3 결과 파일을 판정했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 292/292, `git diff de17d49 -- src-tauri/tauri.conf.json src-tauri/capabilities` 출력 없음, `cargo clippy -- -D warnings` 경고 0.
  - 결과:
    - 검토: 기록 단위·키 문맥·이력·덮어쓰지 않음·Rust 새 명령 안전성·키맵 테스트 두 줄, F-1~F-3·click 무시 모두 통과. 권고 셋:
      - R-1: `trash_with_id`의 경로 비교가 대소문자에 걸리면, 이미 휴지통에 간 항목을 "Failed to trash"로 알리고 그 단계를 버린다.
      - R-2: `existed`가 같은 path의 마크다운 미리보기 탭도 세어 F-1 어긋남이 다시 날 수 있다.
      - R-3: Undo가 확인창을 기다리는 동안 새 drop이 기록되면 순서가 바뀔 수 있다(낮은 위험).
    - V3: #2·#3·#4·#5·#6·#7·#8 통과, 불일치 없음.
      - #2 옮기기(파일·폴더·여러 개를 루트로), 내용 보존.
      - #3 놓을 곳 표시: 대상 폴더 행과 그 아래 행, 배경 `rgba(131, 137, 148, 0.5)` = 토큰 `#83899480`. 놓을 수 없는 곳은 표시 없음.
      - #4 막기: 자기 자신·하위·이미 든 폴더는 디스크 변화 없음, 같은 이름은 Zed 문구 알림·기존 내용 그대로.
      - #5 열린 탭: 경로·툴팁·저장 안 한 편집 유지, 옮기기 되돌리기·다시 하기, 편집기 포커스의 Ctrl+Z는 트리를 안 건드림.
      - #6 놓아 열기: 본문 가운데, 탭 앞, 가장자리 분할. 폴더는 열리지 않음.
      - #7 탐색기: 파일·폴더 복사, 같은 이름은 `ext copy.txt`, 원본 그대로.
      - #8 회귀: 짧은 클릭·흔들린 클릭·여러 개·F2/Esc·우클릭·탭 드래그·sticky, 가장자리 스크롤 뒤 표시된 폴더 = 놓인 폴더.
  - 검증: V1 검토 + V3 판정(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-04-report.md`).
  - 특이사항:
    - `cargo test`는 21 통과 1 실패(`files::tests::cross_volume_cut_files_preserves_content_and_streams`). checker 샌드박스가 `src-tauri\target` 쓰기를 막아 `CARGO_TARGET_DIR`를 돌렸고, 그 테스트가 `CARGO_MANIFEST_DIR/target` 아래에 쓰다 거부된 환경 문제로 판단했다.
    - 측정 약함: #6 F-1 분기(`where.index > at`)는 V3가 건드리지 않아 단위 테스트로만 확인했다. #8 고정 행 끌기는 목표가 자기 하위라 판별력이 없어 코드로 통과했다. #3의 접힌 경로 조각·루트 배경·테두리 투명은 코드 확인이다.
    - 측정하지 않음: 가운데 클릭, `pointercancel`·`blur`로 끝나기, 처음 누른 행에 놓았을 때 click 무시, 탐색기 같은 이름 폴더, 탐색기 끌기 중 놓을 곳 표시.
- **K-02-R2 C-04 권고 R-1·R-2** (2026-11-13, coder, 커밋 `ca2b33a`)
  - 무엇을 했나: `src/workspace/context.ts`, `src-tauri/src/files.rs`를 고쳤다.
    - R-2: `dropEntry`의 `existed`를 열기 전 path 일치로 세지 않고, 연 뒤 활성 탭의 `file`이 열기 전 목록에 있었는지로 센다. `openTab`이 탭을 다시 쓰면 file 객체가 그대로이고 새로 만들면 새 file이라, 소스 탭·마크다운 미리보기 탭·도구 탭 어느 규칙으로 맞췄든 `openTab`이 실제로 한 일과 같다.
    - R-1: `trash_with_id`에서 휴지통 항목의 원래 경로를 `same_path`(대소문자 무시, `name_search.rs`와 같은 소문자 비교)로 맞춘다. Rust 테스트 `trash_lookup_ignores_letter_case`를 더했다.
    - R-3: 하지 않았다(카드 지시).
  - 결과: 같은 path의 미리보기 탭만 있는 pane에 소스 파일을 탭 위에 놓아도 F-1 어긋남이 다시 나지 않는다. 경로 표기의 대소문자가 달라도 휴지통 id를 찾는다.
  - 검증: V1(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-02-R2-report.md`). tauri-leader가 `ca2b33a`에서 전체 검증: `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 292/292, `cargo clippy -- -D warnings` 경고 0, `cargo test` 23 통과 0 실패(C-04 때 checker 샌드박스에서 실패한 `cross_volume_cut_files_preserves_content_and_streams`도 통과 — target 쓰기 거부가 원인이었음).
  - 특이사항: R-2는 pane·탭 신호와 `openFile`을 거쳐야 해서 순수 계산으로 빼지 않았고 TS 테스트를 더하지 않았다. 자리 계산은 기존 `drop.test.ts` "I-3: a tree file dropped on a tab…"이 덮는다.
- **W-03 ORDER-02 PROGRESS·PLAN 기록** (2026-11-13, writer)
  - 무엇을 했나: 위 Phase 2 항목을 각 보고 파일·V3 결과 파일·leader-core 결정에서 옮겨 적고, `PLAN.md`에 Phase 2 작업 카드 표를 더했다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-03-report.md`).
  - 특이사항: Phase 2에서 남은 것.
    - 복사 되돌리기(확인창 → 휴지통, 다시 하기 → 복원)는 확인창이 네이티브 창이라 V3로 재지 못하고 코드 검토로만 판정했다.
    - 우클릭 메뉴 Undo/Redo 항목은 넣지 않았다(미정, leader-core).
    - 폴더를 pane에 끌면 놓을 곳 표시는 뜨지만 놓으면 아무 일 없다. Zed가 이때 표시하는지는 소스로 확정하지 못했다.
    - 탐색기에서 같은 이름을 놓으면 Zed는 Replace/Cancel을 묻지만, tauri는 묻지 않고 copy 이름으로 복사한다(ORDER "덮어쓰지 않음" 결정, Replace가 덮어쓰기라서).

### Phase 3 — 탭: Lock Preview 임시 탭, Search 탭 여러 개, 마지막 탭 잘림

- **K-03 I-5·I-6·I-13 (ORDER-03)** (2026-11-13, coder, 커밋 `58a522c`)
  - 무엇을 했나: `src/workspace/context.ts`·`tab-view.ts`·`tabs.test.ts`·`tab-view.test.ts`, `src/search/Search.tsx`, `src/shell/Pane.tsx`를 고쳤다. `openTab`(`PANE_MAX_PREVIEW_TABS`, 교체·고정 규칙), openSource/openView의 replaced 해제 방식, `keepTab`(탭 제목 더블클릭), `openTool`, `truncateName`(`TAB_MAX_TITLE_CHARS`)을 재사용했다.
  - 결과:
    - I-5: `openPreview(ctx, from, path, side, focus = true, temporary = false)`의 `temporary`를 탭의 `preview`와 `openTab`의 preview 인자로 넘긴다. `temporary`를 넘기는 곳은 트리 열기(`openFile(preview=true)`, 한 번 클릭·Space)뿐이다. 더블클릭·가운데 클릭은 임시 탭을 고정으로 바꾸고, 탭 제목 더블클릭은 기존 `keepTab`이 한다. 눈 버튼·`markdown::OpenPreview`·트리 메뉴·미리보기 안 링크·ORDER-02 `dropEntry`는 그대로 고정 탭이다. Lock Preview가 꺼져 있으면 openPreview로 가지 않는다.
    - I-6: Search 탭 path는 `Search:<n>`(앱이 켜진 동안 늘어나는 번호, 화면에 안 보임)이라 열 때마다 새 탭이다. 제목은 검색할 때(Enter, 토글로 다시 검색) 그 검색어이고, 입력 중에는 바뀌지 않는다. 툴팁은 "Search"(I-11 그대로). Settings·Keymap Editor·Extensions·Licenses는 고정 path라 하나만 열린다.
    - I-13 원인: `Pane.tsx`의 버튼 영역(`.tab-bar-edge.end`)은 포커스된 pane에만 그려진다. 포커스가 pane 밖(트리 등)일 때 탭을 클릭하면 `activateTab`이 버튼 영역이 없는 폭으로 `scrollIntoView`를 한 뒤 `focusPane` → focusin으로 버튼 영역이 나타나 탭 줄이 그만큼 줄고, 활성 탭의 닫기 x가 잘린다. 스크롤 effect는 active·tabs만 따라가 다시 돌지 않는다. 창 너비 변경도 같다. 원인은 탭 종류가 아니라 포커스에 따라 나타나는 버튼 영역이다.
    - I-13 고침: `.tab-list`에 ResizeObserver를 달아 줄 폭이 바뀌면(버튼 영역이 나타나거나 사라질 때, 창·pane 너비가 바뀔 때) 같은 `scrollActive()`를 다시 부른다. 언마운트 때 disconnect한다. 버튼 영역을 늘 그리는 방법은 I-706(포커스된 pane에만 버튼)을 바꾸게 되어 고르지 않았다.
  - 검증: V1. `npx tsc --noEmit` 오류 0, `npm run test` 294/294. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-03-report.md`).
  - 특이사항: 휠로 활성 탭을 화면 밖으로 밀어 둔 상태에서 줄 폭이 바뀌면 활성 탭으로 다시 스크롤된다(창 너비가 바뀌어도 맞춘다는 요구와 같은 동작).
- **V3 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: `58a522c`를 띄워 쟀다(`specs/v0.8.1/verify/ORDER-03/` `v3.json`·`v3-c8-drop.json`, PNG, `measure.mjs`·`measure-c8-drop.mjs`).
  - 결과: 판정은 C-06에서 한다. 측정값:
    - #1 트리에서 m1·m2·m3를 한 번씩 클릭 → 미리보기 탭 하나, 제목 이탤릭.
    - #2 다시 클릭·탭 제목 더블클릭·가운데 클릭으로 고정되고, 다음 클릭은 새 탭.
    - #3 csv·ipynb도 같은 규칙. Lock Preview를 끄면 v0.8처럼 임시 편집 탭. Ctrl+Shift+V·Ctrl+K V·눈 버튼·View 메뉴는 고정 미리보기 탭.
    - #4·#5 Search 버튼/Ctrl+Shift+F로 탭 셋, 검색어 m1·long-file-name-1·data, 결과 1·7·1. 탭을 오가도 그대로이고 제목 = 검색어. Extensions는 두 번 열어도 하나.
    - #7 탭 16개 넘게 넘친 pane, 트리 포커스에서 마지막 탭 클릭: 편집·미리보기·도구 탭 모두 닫기 x 오른쪽 1348 < 버튼 영역 왼쪽 1353. 창 너비를 1124로 줄인 뒤 1032 < 1037.
    - #8 회귀: 탭 휠 스크롤, 탭 메뉴, 탭 드래그 R-10, 트리 파일을 탭 위에 놓기(Lock 끔 → 그 탭 앞 일반 탭, 켬 → 고정 미리보기 탭), 임시 편집 탭, 미리보기 위치 연계(Section 6), 분할 pane 탭 바.
  - 검증: V3.
  - 특이사항:
    - 앱 창이 앞에 없으면 WebView 포커스 이벤트가 오지 않아 버튼 영역이 나타나지 않는다. I-13 측정은 창을 앞으로 가져온 뒤 했다.
    - Search는 파일 이름 검색이라 이름으로 검색했다.
    - 창 너비는 win-input resize로 바뀌지 않아 SetWindowPos로 바꿨다.
- **checker 한도와 leader-core 결정** (2026-11-13, leader-core, 위임)
  - 무엇을 했나: checker(agy)가 사용 한도(약 3h35m)에 걸려 C-05를 진행하지 못해 leader-core에 [BLOCKED]를 보냈다.
  - 결과: 결정 (c). 한도가 풀릴 때까지 검토·V3 판정은 tauri-leader가 구현에 참여하지 않은 Claude Code 서브 에이전트(새 컨텍스트)에 맡긴다. herdr 구성은 바꾸지 않는다. 다음 카드부터 tauri-checker로 돌아간다.
  - 검증: 없음(결정).
  - 특이사항: 대리 검토자는 coder와 같은 모델 계열이라 독립성이 낮다.
- **C-05 대리 검토(K-03)** [PASS] (2026-11-13, Claude Code 서브 에이전트)
  - 무엇을 했나: `58a522c`를 검토했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 294/294.
  - 결과: 막는 지적 없음. 권고 둘:
    - R-1: 휠로 밀어 둔 탭 줄이 포커스 이동(버튼 영역이 나타남)으로 활성 탭 쪽으로 되돌아간다.
    - R-2: 원본이 dirty면 임시 미리보기 탭이 다음 트리 열기로 바뀌지 않는다.
  - 검증: V1 검토(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-05-report.md`).
  - 특이사항: 없음.
- **C-06 대리 V3 판정** [조건부 PASS] (2026-11-13, Claude Code 서브 에이전트)
  - 무엇을 했나: `verify/ORDER-03/`의 V3 결과를 판정했다.
  - 결과: #1~#9 통과. 조건: 첫 실행 캡처에서 상태 표시줄·메뉴로 새 탭을 열 때 잘림이 보여, 창을 앞에 두고 다시 잴 것.
  - 검증: V3 판정(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-06-report.md`).
  - 특이사항:
    - #2 "같은 파일을 따로 한 번 더 클릭"하면 고정되지 않는다. 편집 탭 규칙과 같지만 ITEMS 문장과 달라 사용자 확인으로 넘긴다.
    - #3 눈 버튼·View 메뉴는 이미 있던 고정 탭을 다시 활성화한 것이라 측정이 약하다.
- **다시 측정 1** (2026-11-13, tauri-leader)
  - 무엇을 했나: 창을 앞에 두고 C-06 조건 항목을 다시 쟀다(`verify/ORDER-03/v3-c7b.json`·`measure-c7b.mjs`·`c7b-*.png`).
  - 결과: 상태 표시줄 Search·User 메뉴 Extensions·View 메뉴 Open Preview로 연 새 탭 모두 닫기 x 오른쪽 ≈1348 < 버튼 영역 왼쪽 1353. 첫 실행의 잘림은 창이 뒤에 있던 측정 문제였다.
  - 검증: V3.
  - 특이사항: 없음.
- **K-03-R1 C-05 권고 R-1·R-2** (2026-11-13, coder, 커밋 `ef330b3`)
  - 무엇을 했나:
    - R-1: `follow` 플래그. 휠로 탭 줄을 밀면 줄 폭이 바뀌어도 다시 스크롤하지 않고, 활성 탭이 바뀌거나 탭을 누르면 다시 따라간다.
    - R-2: 임시 미리보기 탭의 keep을 `!t.markdown && dirty`로 바꿨다.
  - 결과: 휠로 밀어 둔 탭 줄이 포커스 이동으로 되돌아가지 않는다. 원본이 dirty여도 임시 미리보기 탭은 다음 트리 열기로 바뀐다.
  - 검증: V1(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-03-R1-report.md`).
  - 특이사항: 없음.
- **다시 측정 2** (2026-11-13, tauri-leader)
  - 무엇을 했나: `ef330b3` debug exe로 다시 쟀다(같은 파일 `verify/ORDER-03/v3-c7b.json`). 전체 검증 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 294/294.
  - 결과: 다시 측정 1의 세 경로와 트리 포커스에서 마지막 탭 클릭 모두 닫기 x 오른쪽 ≈1348 < 1353. R-1: 휠로 `scrollLeft` 1318 → 편집기 클릭(버튼 영역 나타남) 뒤 1318 그대로.
  - 검증: V3.
  - 특이사항:
    - #2 다시 클릭 고정은 사용자 확인으로 남긴다(leader-core).
    - 측정하지 않은 것: 긴 검색어 제목 잘림, Search 토글 유지, Settings 두 번 열기(Settings는 별도 창), 탭 바 메뉴로 Search 열기.
- **W-04 ORDER-03 PROGRESS·PLAN 기록** (2026-11-13, writer)
  - 무엇을 했나: 위 Phase 3 항목을 K-03·C-05·C-06·K-03-R1 보고 파일·V3 결과·leader-core 결정과 카드에서 옮겨 적고, `PLAN.md`에 Phase 3 작업 카드 표를 더했다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-04-report.md`, 마무리 W-04-R1 보고 `v081-W-04-R1-report.md`).
  - 특이사항: 없음.
