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

### Phase 4 — Outline 사이드 바

- **K-04 I-4 (ORDER-04)** (2026-11-13, coder, 커밋 `e25a4ac`)
  - 무엇을 했나: `src/shell/Outline.tsx`·`src/syntax/outline.ts`·`outline.test.ts`를 새로 두고, `App.tsx`·`app.css`, `shell/status.ts`·`status.test.ts`·`panels.ts`·`dock.ts`·`Icon.tsx`·`markdown-preview.ts`, `syntax/assets.ts`·`document.ts`·`highlight.ts`, `editor/markdown.ts`·`markdown-it.d.ts`, `theme/apply.ts`, `spec/metrics.ts`, `workspace/context.ts`·`state-file.ts`·`store.ts`·`workspace.test.ts`를 고쳤다. 편집기 하이라이터의 SyntaxDocument 트리(다시 파싱하지 않음), Zed `outline.scm` 15개, 미리보기와 같은 markdown-it, `parseDocSliced`·`PARSE_SLICE_MS`, `MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS`, 트리 행 클래스(치수·정렬선·hover·selected·글자색), `.dock-left` 경계 규칙과 `.dock-resize-handle`, state.json 저장 방식(`window.sidebar`와 같게), 미리보기 블록 표시·원본 커서 이동을 재사용했다.
  - 결과:
    - 자리: `.workspace-body`에서 `.dock-left` 뒤·`PaneArea` 앞의 `aside.outline-bar`. dock과 따로 열고 닫는다. 처음 상태는 닫힘.
    - 상태 표시줄 순서: 트리, 구분선, Outline, 구분선, Search, Lock Preview.
    - 목록: 마크다운 H1~H6(코드 블록 `#` 제외), ipynb markdown 셀 제목(클릭하면 JSON 줄로), 코드 15개 언어(지역 변수·필드·속성 제외). 이름은 키워드를 빼고 이름만(`impl Display for Foo` → "Display for Foo").
    - 클릭: 편집 탭은 커서를 이름 시작에 두고 그 줄을 화면 가운데로, 포커스. 마크다운 미리보기는 제목 블록을 위끝으로 스크롤하고 블록 표시·원본 커서 이동(블록 클릭과 같음). ipynb 미리보기는 n번째 markdown 셀 제목을 위끝으로.
    - 따라가기·갱신: 커서 위치 행이 선택 배경. 갱신은 파싱 커밋(ipynb는 텍스트 변경) 뒤 200ms.
    - 성능: 닫혀 있으면 계산하지 않는다. 최상위 노드가 32개를 넘으면 노드마다 질의하고 8ms마다 메인 스레드를 돌려준다. 새 입력이 오면 진행 중인 계산은 버린다. node 측정 TypeScript 6,301줄·1,800항목 ≈45ms, Python 7,201줄 ≈20ms, Markdown 7,201줄 ≈10ms.
    - tauri가 고른 것:
      - 명령 ID `outline_panel::Toggle`(키 없음). 툴팁·aria-label은 닫힘 "Outline", 열림 "Close Outline". View 메뉴 항목은 두지 않았다.
      - 처음 너비 240px = `PROJECT_PANEL_DEFAULT_WIDTH`(left dock 기본과 같음, 시안 250과 다름). 최소·최대는 dock과 같은 규칙. 손잡이 더블클릭도 240.
      - 저장 `windows[0].outline = { open, width }`(모르는 키 보존). 키가 없거나 잘못되면 `{ open: false, width: 240 }`.
      - 빈 문구 "No outline"(도구 탭·Search·이미지·PDF·outline.scm 없는 언어·다른 미리보기·항목 0개 모두).
      - 머리 줄: list_tree 아이콘과 "Outline · 파일 이름", 높이 tab.bar_height(32), 아래 1px border.
      - 배지 글자 표: 제목 H1~H6, 클래스 C, 메서드 m, 함수 f, struct·union S, enum E, enum 멤버 e, interface·trait I, impl i, module·namespace N, type alias T, 변수·상수 v, 매크로 M, 키 k, TOML 표 [], CSS 선택자 s, CSS @ 규칙 @, HTML 요소 <>, 테스트 t. 색은 UI 테마 syntax 키(K-04 보고의 표).
      - 접힌 부모: 커서가 접힌 항목 안에 있으면 그 접힌 부모 행이 선택 배경이고 저절로 펼치지 않는다. 접힌 상태는 문서마다 기억한다.
      - 시안과 다른 곳: 클릭 선택 테두리 없음(행은 포커스를 받지 않음), 마우스 올림은 트리 `.tree-row:hover` 그대로.
      - 시안 값 11개(`outline.header.padding_left` 10·`padding_right` 8·`gap` 6, `outline.list.padding_top` 4, `outline.badge.size` 15·`corner_radius` 3·`font_size` 11·`heading_font_size` 9·`heading_letter_spacing` −0.3·`font_weight` 600·`background_mix` 22%)는 toml에 없어 `metrics.ts`에 주석과 함께 CSS 변수로 두었다.
  - 검증: V1. `npx tsc --noEmit` 오류 0, `npm.cmd run test` 301/301, `npx vite build` 오류 없음. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-04-report.md`).
  - 특이사항:
    - 생략: View 메뉴 항목·단축키·필터·정렬·행 키보드 이동(카드 3.5 범위 밖), HTML·CSV·SVG·Mermaid 미리보기 탭의 Outline(빈 목록).
    - `shortcut:` ipynb는 갱신마다 JSON 전체를 파싱하고, 바뀐 최상위 노드만 다시 질의하지 않는다.
- **checker 한도로 대리 검토** (2026-11-13, leader-core 결정)
  - 무엇을 했나: checker 한도가 이어져 ORDER-03과 같은 결정(leader-core 2026-11-13)으로 C-07·C-08을 Claude Code 서브 에이전트(새 컨텍스트)에 맡겼다.
  - 결과: herdr 구성은 바꾸지 않았다.
  - 검증: 없음(결정).
  - 특이사항: 대리 검토자는 coder와 같은 모델 계열이라 독립성이 낮다.
- **C-07 대리 검토(K-04)** [REWORK] (2026-11-13, Claude Code 서브 에이전트)
  - 무엇을 했나: `e25a4ac`를 검토했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 301/301. 15개 언어의 `outline.scm`을 분류 표와 하나씩 대조했다.
  - 결과: 꼭 고칠 것 둘, 권고 여덟.
    - R-1: 출처가 없는 탭(Search·이미지·`.txt`·CSV 미리보기)으로 200ms 안에 바꾸면 대기 중인 계산이 끝나 앞 문서의 Outline이 다시 나타난다.
    - R-2: 편집 탭 없는 노트북 미리보기에서 원본 view가 200ms보다 늦게 생기면 다시 보기가 한 번만 돌아 계속 "No outline"이다.
    - A-1: dock과 Outline 너비가 서로를 계산에 넣지 않아 편집 영역이 0까지 줄 수 있다.
    - A-2: 최상위 노드 하나짜리 큰 파일(JSON·YAML·HTML·큰 클래스 하나)은 질의를 한 번에 동기로 한다.
    - A-3: 출처 비교가 Tab 객체 기준이라 고정·이름 바꾸기·끌어 옮기기 때 목록이 깜박이고 다시 계산한다.
    - A-4: 다른 편집기의 커밋·노트북 커서 이동이 진행 중인 계산을 처음부터 다시 시작시킨다.
    - A-5: 노트북 미리보기가 앞일 때 원본이 바뀌어도 갱신되지 않는다.
    - A-6: C++ 클래스 안 포인터 반환 메서드 선언이 빠진다.
    - A-7: 노트북 줄 계산이 셀 줄 수의 제곱으로 늘고, 한 문자열 source 안에 같은 단계 제목이 둘이면 계층이 뒤집힌다.
    - A-8: 행이 키보드로 닿지 않는다(AGENTS 4.3과 부딪칠 수 있음, leader 판단).
  - 검증: V1 검토(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-07-report.md`).
  - 특이사항: 검토하지 않은 것 — 앱 화면, `maxStartDepth: 0`의 실제 순회, `list_tree.svg`가 허용 복사본 목록에 있는지.
- **K-04-R1 C-07 R-1·R-2·A-1·A-3~A-7** (2026-11-13, coder, 커밋 `3736c06`)
  - 무엇을 했나: `src/shell/Outline.tsx`·`dock.ts`, `src/syntax/outline.ts`·`outline.test.ts`, `src/app.css`, `src/workspace/context.ts`를 고쳤다.
  - 결과:
    - R-1: 출처가 null로 바뀌면 `cancel()`(타이머 지우기 + generation 올리기).
    - R-2: `context.ts`에 `changedDoc` 신호. 원본 텍스트가 바뀔 때와 첫 읽기로 view가 생길 때 알린다. 한 번만 돌던 다시 보기 타이머는 지웠다.
    - A-1: `.workspace-body`에 `--dock-left-width`·`--outline-bar-width`를 두고, 둘 다 열렸을 때 각자 max-width = 100% − dock.resize_handle_width − 상대 폭. 새 수치 없음.
    - A-3: 출처 비교를 `tab.file`·`view`로. 머리 줄 이름은 활성 탭 path에서 읽는다.
    - A-4: 예약한 mark(`wanted`)와도 비교해 진행 중인 계산을 버리지 않는다.
    - A-5: 노트북 출처는 `changedDoc`을 따른다.
    - A-6: `pointer_declarator` 안이 `function_declarator`면 method, 아니면 필드(제외).
    - A-7: 조각 시작 줄을 누적 줄 수로 구하고, 한 문자열 source 안의 제목 자리를 줄 수만큼 건너뛰어 순서·형제 관계를 지킨다.
  - 검증: V1. `npx tsc --noEmit` 오류 0, `npm.cmd run test` 302/302. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-04-R1-report.md`).
  - 특이사항:
    - A-2 하지 않음: 한 단계 아래로 쪼개려면 사이 노드에서 시작하는 패턴을 노드마다 따로 돌려야 하고, 비용이 실제로 주는지 앱 측정 없이 알 수 없으며, 결과가 같은지 지킬 테스트도 몇 줄로 안 된다. 긴 작업이 질의인지 DOM 행 갱신인지도 구분되지 않았다.
    - A-8 하지 않음: 카드 지시(leader-core 판단).
    - A-1 남은 위험: 두 바의 지정 폭 합이 본문보다 크면 둘 다 상대 폭만큼 줄어 합이 본문보다 꽤 작아질 수 있다(창 360에서 240+240 → 각 114). 편집 영역은 0이 되지 않는다.
- **V3 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: 최종 `3736c06` debug exe를 띄워 쟀다(`specs/v0.8.1/verify/ORDER-04/` `v3.json`·`v3-b.json`, PNG, `measure.mjs`·`measure-b.mjs`, 시안은 Edge headless로 그린 `mockup-F.png`).
  - 결과: 판정은 C-08에서 한다. 측정값:
    - 상태 표시줄: Close Left Dock | Outline | Search·Lock Preview. Outline을 열고 dock을 닫아도 Outline은 남는다.
    - 치수: 행 26, 들여쓰기 20, 정렬선 1px x15, 꺾쇠 16, 배지 15(제목 9px·코드 11px), 여백 6, 간격 4.
    - 경계·너비: 1px border(dock과 같음), hover 무변화. 끌기 240→299, 다시 열어도 299·열림.
    - 마크다운 H1~H4 계층, 코드 블록 `#` 제외. ipynb 제목 셋, 클릭 → JSON 줄.
    - py·ts·rs 계층, 지역 변수 없음. plain.txt는 "No outline".
    - 이동: 클릭 → 편집 줄(포커스), 미리보기는 제목으로 스크롤.
    - 따라가기·갱신: 커서를 따라간다. 제목을 더하면 220ms 뒤 목록에 나오고 되돌리면 사라진다. 접힌 부모가 선택 배경.
    - 탭 바꾸기: 그 문서의 목록, Search 탭은 빈 목록.
    - 성능: 6,000줄 TS 입력 → 목록 559ms, 긴 작업 137ms 하나. 큰 마크다운 234ms, 긴 작업 없음. 12,001줄 JSON(6,000행) 입력 중 긴 작업 132ms 하나.
    - R-1: 디바운스 안에 Search 탭으로 → "No outline". R-2: 편집 탭 없는 노트북 미리보기 목록 셋.
    - A-1: Outline을 끝까지 끌어도 편집 영역 6px(손잡이 폭)이 남는다.
    - 회귀: Outline을 닫은 처음 화면 배치가 처음과 같다.
  - 검증: V3.
  - 특이사항: 1차 스크립트(`measure.mjs`)의 화면 밖 줄 클릭·줄 가운데 삽입·꺾쇠 위 클릭 문제를 `measure-b.mjs`로 다시 쟀다.
- **C-08 대리 R1 검토·V3 판정** [1부 REWORK(경미), 2부 PASS] (2026-11-13, Claude Code 서브 에이전트)
  - 무엇을 했나: `3736c06`의 R1 변경을 검토하고 `verify/ORDER-04/`의 V3 결과를 판정했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 302/302.
  - 결과:
    - 1부 R1 검토 REWORK, 경미 1건. R-1·R-2·A-3~A-7은 원인에서 고쳐졌다.
      - R1-1: dock·Outline 너비 변수에 max-width로 잘리기 전의 포인터 폭이 들어간다. 그래서 한쪽(dock)을 한계 너머로 끌면 다른 쪽(Outline)이 줄고, 손을 떼도 줄어든 채 남아 저장 너비와 어긋난다.
    - 2부 V3 #1~#12 PASS. 불일치는 없고, 시안과 다른 값은 너비 250 → 240 하나다(이유 기록됨).
  - 검증: V1 검토·V3 판정(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-08-report.md`).
  - 특이사항: 근거가 약한 것 —
    - #7 미리보기 이동은 마지막 제목만 눌러 "제목으로 스크롤"과 "맨 아래로 스크롤"이 구분되지 않는다.
    - #8 목록이 짧아 목록 따라 스크롤을 재지 못했다.
    - #10 Outline을 닫은 기준선과 비교하지 않았다.
    - #11 `6bcb72b`와 직접 대조한 자료가 없다.
    - #6 콘솔 오류를 모으지 않았다.
    - `mockup-F.png`가 verify 폴더에 없었다.
- **K-04-R2 C-08 R1-1** (2026-11-13, coder, 커밋 `3296af0`)
  - 무엇을 했나: `src/shell/dock.ts`를 고쳤다. 기존 `rule`·adopted sheet·`getBoundingClientRect` 재기를 재사용했다.
  - 결과: `onpointermove`에서 포인터 폭을 먼저 적용하고 min/max-width로 잘린 실제 폭을 잰 뒤, 그 값으로 너비와 `.workspace-body` 변수를 다시 쓴다. `setWidth`에도 같은 실제 폭이 간다. 한쪽을 한계 너머로 끌어도 다른 쪽의 max-width가 줄지 않고, 저장 너비와 화면이 같다. dock 혼자·Sidebar 동작은 그대로다.
  - 검증: V1. `npx tsc --noEmit` 오류 0, `npm.cmd run test` 302/302. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-04-R2-report.md`).
  - 특이사항: 이동마다 레이아웃을 한 번 더 강제한다.
- **다시 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: `3296af0` debug exe로 R1-1과 C-08의 약한 항목을 다시 쟀다(`verify/ORDER-04/` `v3-c.json`·`v3-c2.json`·`measure-c.mjs`). 전체 검증 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 302/302.
  - 결과:
    - R1-1: dock 손잡이를 한계 너머로 끌면 dock은 994에서 멈추고 Outline은 240 그대로다. 손을 뗀 뒤도 같고 저장 너비는 240이다.
    - 콘솔: 코드·텍스트·노트북·큰 JSON을 여는 동안 콘솔 오류 0(`v3-c.json`).
    - #7: big.md 미리보기에서 가운데 제목 "Section 150"·"Section 40"을 누르면 그 제목이 미리보기 맨 위에 온다(top 0, scrollTop 18166·4856, `v3-c2.json`).
    - #8: big.md 편집기를 휠로 내려 아래 줄을 누르면 목록 scrollTop 288 → 2342, 선택 "Section 118"이 목록 안에 보인다.
    - `mockup-F.png`: 두 번째 측정이 verify 폴더를 비울 때 지워졌던 것을 다시 그렸다.
  - 검증: V3.
  - 특이사항:
    - 이 실행에서 CDP 키 입력이 편집기에 닿지 않았다(원인 미확인, 앱 동작과 무관 — 같은 키가 앞 실행에서는 동작했다). 그래서 미리보기 열기는 눈 버튼으로, 커서 이동은 마우스로 했다.
    - doc.md는 미리보기에서 짧아(문단이 합쳐짐) 스크롤 판정에 big.md를 썼다.
- **W-05 ORDER-04 PROGRESS·PLAN 기록** (2026-11-13, writer)
  - 무엇을 했나: 위 Phase 4 항목을 K-04·C-07·K-04-R1 보고 파일·V3 결과·leader-core 결정과 카드에서 옮겨 적고, `PLAN.md`에 Phase 4 작업 카드 표를 더했다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-05-report.md`).
  - 특이사항:
    - A-2(최상위 노드 하나짜리 큰 파일 질의 쪼개기)·A-8(행 키보드 접근)은 하지 않았다 — leader-core 판단.
    - `outline.*` 시안 값 11개의 toml 반영 여부 — leader-core.
    - 배지 글자·색 표와 "No outline" 문구는 사용자 확인(Phase 7 뒤).
- **W-05-R1 ORDER-04 PROGRESS 마무리** (2026-11-13, writer)
  - 무엇을 했나: C-08 "판정 대기" 줄을 C-08 보고로 채우고, K-04-R2와 다시 측정 항목을 더했다. `PLAN.md` Phase 4 표에 K-04-R2 행을 더했다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-05-R1-report.md`).
  - 특이사항: 없음.

### Phase 5 — 코드 글꼴·크기, 코드 블록 음영, 머리 줄, Licenses

- **K-05 I-10·I-11·I-12 (ORDER-05)** (2026-11-13, coder, 커밋 `4572b27`)
  - 무엇을 했나: `src/app.css`, `src/editor/extensions.ts`, `src/settings/load.ts`·`model.ts`·`model.test.ts`, `src/shell/about.ts`·`about.test.ts`·`app-menus.test.ts`·`licenses.ts`·`markdown-preview.ts`, `src/spec/metrics.ts`를 고치고 `public/fonts/{jetbrains-mono,hack,ubuntu-mono,d2coding}/`를 새로 두었다. Settings 드롭다운·숫자 입력, `updateSettings` 저장 방식(주석·모르는 키 보존), `applyMetrics`의 descent 측정·`remeasureForFont`, `.icon-button`·tooltip·notify, Rust `write_clipboard_text`(About Copy와 같은 경로), `FONT_LICENSES`·`FONTS`, 테마 토큰 `--panel-background`를 재사용했다.
  - 결과:
    - 글꼴:

      | 글꼴 | 출처 | 버전 | 라이선스 | 넣은 벌 | 형식 |
      |---|---|---|---|---|---|
      | JetBrains Mono | GitHub JetBrains/JetBrainsMono release v2.304 (`fonts/webfonts/`) | 2.304 | OFL-1.1(`OFL.txt`) | Regular·Italic·Bold·BoldItalic | woff2(배포본) |
      | Hack | GitHub source-foundry/Hack release v3.003 webfonts(전체판) | 3.003 | MIT + Bitstream Vera License(`LICENSE.md`) | Regular·Italic·Bold·BoldItalic | woff2(배포본) |
      | Ubuntu Mono | assets.ubuntu.com ubuntu-font-family-0.83 | 묶음 0.83(name table 0.80) | Ubuntu Font Licence 1.0(`LICENCE.txt`) | R·RI·B·BI | TTF(원본) |
      | D2Coding | GitHub naver/d2codingfont release VER1.3.2 | 1.3.2(Build 20180524) | OFL-1.1(`OFL.txt`, zip에 없어 저장소에서) | Regular만 | TTF(원본) |

      - 빌드 크기 `dist/fonts/`: jetbrains-mono 385,167 / hack 442,860 / ubuntu-mono 828,245 / d2coding 4,190,355 B.
      - D2Coding Regular만: 한 벌이 4.0 MB(한글 26,188 글리프)라 Bold(4.2 MB)를 더하면 두 배가 된다. 굵게·기울임은 브라우저 합성이고, 배포본에 Italic은 원래 없다.
      - Ubuntu Mono·D2Coding을 TTF 그대로 둔 이유: Ubuntu Mono는 공식 배포가 TTF뿐이고 UFL의 수정본 조건에 형식 변환이 드는지 불분명하다. D2Coding은 OFL Reserved Font Name이라 변환본이 이름을 쓸 수 없는 수정본이 될 수 있다(woff2였다면 1.49 MB).
    - 설정 키: `buffer_font_family`(Settings > Editor "Font Family"), `preview_code_font_family`("Code Font Family"), `preview_code_font_size`("Code Font Size", 50~150 정수 %, 기본 85). 목록 = JetBrains Mono(기본)·Hack·Ubuntu Mono·D2Coding·Lilex. 목록 밖 이름·잘못된 값은 기본값.
    - 코드 크기 = 미리보기 글자 크기(Ctrl+= 임시 크기 포함) × % / 100. 16px·85% = 13.6px. 모든 미리보기 `pre`·`.nb-count`·`.nb-error-title`에 적용, 인라인 코드 크기는 L-109 그대로.
    - 글꼴 적용: 에디터 `--editor-font-family`, 미리보기 코드 `--preview-code-font-family`(값 `"<글꼴>", "Malgun Gothic", monospace`). `--buffer-font-family`는 Lilex 그대로(브레드크럼·검색 결과 이름·경로·Settings 절 제목). 글꼴을 `document.fonts.load`로 기다린 뒤 잰다.
    - 음영(I-11): 배경 `panel.background`, 테두리 없음. 번들 테마 21개 모두 `panel.background` ≠ `editor.background`. 지난 1px `border.variant` 테두리와 `markdown_preview.code_block.border`는 지웠다.
    - 머리 줄(I-12): 언어(펜스 info 첫 낱말, ipynb는 노트북 언어) + 복사 버튼. 언어 없는 블록은 언어 칸을 비운다. 복사는 `code`의 원문을 쓰고, 아이콘이 `copy` → `check`로 바뀌었다가 2초 뒤 돌아온다(`CODE_BLOCK_COPIED_MS` 2000, tauri 값). mermaid·수식·ipynb 출력·raw 셀·앞머리에는 머리 줄이 없다.
    - capability·CSP·의존성 변경 없음.
  - 검증: V1. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 303/303, `npm.cmd run build` 성공. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-05-report.md`).
  - 특이사항:
    - `editor.gutter.padding_left/right`(I-14)는 Lilex 15px에서 잰 고정 px라 다른 글꼴에서는 Zed와 다를 수 있다(기존 shortcut 주석).
    - 머리 줄 높이·글자 크기는 스펙 ID 없는 tauri 선택(L-07·L-05 재사용)이다.
- **checker 한도로 대리 검토** (2026-11-13, leader-core 결정)
  - 무엇을 했나: checker 한도가 이어져 C-09·C-10을 Claude Code 서브 에이전트(새 컨텍스트)에 맡겼다.
  - 결과: herdr 구성은 바꾸지 않았다.
  - 검증: 없음(결정).
  - 특이사항: 대리 검토자는 coder와 같은 모델 계열이라 독립성이 낮다.
- **C-09 대리 검토(K-05)** [REWORK] (2026-11-13, Claude Code 서브 에이전트)
  - 무엇을 했나: `4572b27`을 검토했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 303/303. 의존성·CSP·capability 변경 없음을 diff로 확인했다. 앱은 띄우지 않았다.
  - 결과: 꼭 고칠 것 하나, 권고 넷.
    - M-1: `.markdown-body .code-block`과 `.markdown-body > :first-child`의 명시도가 같아, 문서 첫 블록이 코드 블록이면 위 여백 16px이 생긴다(커밋 전 0px).
    - R-1: ipynb 글자 출력·traceback·raw 셀·앞머리 `pre`도 코드 셀과 같은 음영을 받는다(회귀는 아님).
    - R-2: 끌어 선택해 복사하면 머리 줄 언어 이름이 섞인다.
    - R-3: Ubuntu Mono에 `copyright.txt`가 없다.
    - R-4: `applyMetrics` 기본 인자가 DEFAULTS를 따로 적는다.
  - 검증: V1 검토(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-09-report.md`).
  - 특이사항: 검토하지 않은 것 — 화면 결과(V3 대상), 글꼴 바이너리 해시 대조(이름·크기만 확인).
- **K-05-R1 C-09 M-1·R-2·R-3** (2026-11-13, coder, 커밋 `7d28b4b`)
  - 무엇을 했나: `src/app.css`, `src/shell/licenses.ts`·`app-menus.test.ts`를 고치고 `public/fonts/ubuntu-mono/copyright.txt`를 더했다.
  - 결과:
    - M-1: 선택자를 `.markdown-body :where(.code-block)`로 바꿔 `.markdown-body > :first-child { margin-top: 0 }`이 이긴다. 첫 블록이 아닐 때 여백·음영·모서리는 그대로다.
    - R-2: `.code-block-header`에 `user-select: none`.
    - R-3: 공식 묶음의 `copyright.txt`(155 B, 원본과 `cmp` 같음)를 두고 Licenses의 `LICENCE.txt` 바로 뒤에 넣었다.
  - 검증: V1. `npm.cmd run typecheck` 오류 0, 관련 테스트(`licenses`·`app-menus`·`about`) 9/9. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-05-R1-report.md`).
  - 특이사항: R-1·R-4는 카드대로 하지 않았다.
- **V3 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: `7d28b4b` debug exe를 띄워 쟀다(`specs/v0.8.1/verify/ORDER-05/` `v3.json`·`v3-b.json`·`v3-c.json`, PNG, `themes/`, `measure.mjs`·`measure-b.mjs`·`measure-c.mjs`). 전체 검증 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 303/303.
  - 결과: 판정은 C-10에서 한다. 측정값:
    - 기본값: JetBrains Mono, 코드 블록 13.6px(본문 16px의 85%).
    - 다섯 글꼴(편집기·미리보기)이 바로 반영된다. 미리보기 20px → 코드 17px, 120% 설정도 반영된다.
    - 인라인 코드는 글꼴만 따른다(14px 그대로).
    - ipynb 셀·출력·오류·`[3]`이 코드 글꼴이고, 셀 머리 줄은 python.
    - 브레드크럼·검색 결과 이름·경로는 Lilex.
    - 한글 주석: JetBrains Mono에서는 Malgun Gothic 7글리프, D2Coding에서는 D2Coding.
    - 글꼴 요청은 tauri.localhost만(외부 0).
    - 긴 줄 끝 클릭 → 1:91(Ubuntu Mono·JetBrains Mono).
    - 잘못된 값 → 기본값, 앱 정상.
    - 테마 21개 모두 코드 블록 배경 ≠ 페이지 배경.
    - 머리 줄: python/빈 글자, mermaid·수식에는 없음, 높이 22·글자 12px.
    - 복사(마우스·Enter): 클립보드 = 원문(탭·한글·끝 줄바꿈).
    - Outline 클릭 → 제목 위끝(코드 블록 40개 문서).
    - CSV·HTML·SVG 미리보기 정상, 에디터 Ctrl+= 15→16px.
    - About 목록에 글꼴 넷, Licenses 탭에 라이선스 넷 + Ubuntu `copyright.txt`.
    - R1 뒤: 첫 코드 블록 margin 0, 머리 줄 user-select none.
    - 글꼴 빌드 크기 5,846,782 B(`dist/fonts` 넷).
  - 검증: V3.
  - 특이사항: 라이선스 탭은 가상 스크롤이라 스크롤하며 표지를 찾았다.
- **C-10 대리 R1 검토·V3 판정** [1부 PASS, 2부 PASS] (2026-11-13, Claude Code 서브 에이전트)
  - 무엇을 했나: `7d28b4b`의 R1 변경을 검토하고 `verify/ORDER-05/`의 V3 결과를 판정했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 303/303. 측정 스크립트를 읽고 JSON 키가 무엇을 재는지 대조했다. 앱은 띄우지 않았다.
  - 결과:
    - 1부 R1 검토 PASS. 새 결함 없음.
      - M-1: `:where(.code-block)`로 명시도를 낮춰 first-child margin 0(`v3-c.json` 첫 블록 0px, 둘째 16px).
      - R-2: 머리 줄 `user-select: none`.
      - R-3: `copyright.txt`를 두고 Licenses의 `LICENCE.txt` 뒤에 넣었다.
    - 2부 V3 #1~#13 PASS, 불일치 0.
  - 검증: V1 검토·V3 판정(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-10-report.md`).
  - 특이사항: 근거가 약한 것 —
    - #3 글꼴·크기 변경은 `settings.json`을 직접 써서 바꿨다. Settings 화면 조작은 V1 테스트로만 확인했다.
    - #4 Settings 절 제목 Lilex는 코드 확인이다.
    - #6 Network 기록이 앱 시작 뒤에 켜져 처음 받은 글꼴은 기록에 없다. `@font-face` src가 모두 앱 내부 경로라는 코드 확인으로 보충했다.
    - #7 잘못된 값은 실행 중 다시 읽기로 넣었다(시작 경로는 재지 않음).
    - #9 Mermaid 문법 오류일 때 머리 줄 없음은 코드 확인이다.
    - #11 위치 연계는 미리보기 → 편집기 방향만 쟀다. 수식은 캡처로 판정했다.
  - V4 사용자 확인(Phase 7 뒤): 테마 21개 음영 대비·구문 색 가독성, ipynb 출력 음영.
- **W-06 ORDER-05 PROGRESS·PLAN 기록** (2026-11-13, writer)
  - 무엇을 했나: 위 Phase 5 항목을 K-05·C-09·K-05-R1 보고 파일·V3 결과·leader-core 결정과 카드에서 옮겨 적고, `PLAN.md`에 Phase 5 작업 카드 표를 더했다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-06-report.md`).
  - 특이사항:
    - R-1(ipynb 출력에도 음영)은 사용자 확인(Phase 7 뒤).
    - R-4는 하지 않았다.
    - About 목록의 Ubuntu Mono 저작권 줄은 2011(글꼴 name table), `copyright.txt`는 2010,2011이다. 바꾸지 않았다.
    - D2Coding(4 MB)을 처음 고르면 읽는 동안 에디터 글꼴 변경이 잠깐 늦다.

### Phase 6 — 미리보기 제목·목록 간격, 미리보기 찾기

- **Zed 실측 I-8** (2026-11-13, tauri-leader)
  - 무엇을 했나: Zed 1.27.0(c84af5b)에서 시험 파일 `spacing.md`와 `INTENT.md` 사본을 미리보기로 열어 캡처했다(`specs/v0.8.1/verify/ORDER-06/` `zed-spacing-1/2/3.png`·`zed-intent.png`, 창 조작 `zed-window.ps1`, 잉크 줄 분석 `rows.mjs`). 설정 그대로, 테마 One Light, ui_font_size 16, 창 1440×852(클라이언트 1424×836). 같은 글자 줄끼리 잉크 위끝 간 거리로 비교했다.
  - 결과: Zed 값(px) — H1·H2 가로선→문단 19, H3~H6→문단 19/20/19/19, 문단→H2~H6 32/32/31/30/30, H1/H2 글자→가로선 10/6, 붙은 항목 26, 감싼 줄 22, 중첩 21/26/31, 번호 26, 느슨한 항목 42, 문단→첫 항목 38, 문단→문단 38, 목록 끝→다음 문단 33~35, 느슨한 목록 끝→문단 50. 가로선 H1·H2 1px. tauri 고치기 전 값은 `tauri-before.json`·`tauri-before-spacing-*.png`.
  - 검증: V3 측정(판정은 C-11).
  - 특이사항:
    - `--user-data-dir`로 따로 띄우려 했으나(`zed-capture.ps1`) CLI가 사용자 Zed에 새 창을 열었다. 그래서 카드 2절이 허락한 "사용자 Zed에서 새 창"으로 쟀다. 쓴 창 둘(spacing.md·INTENT.md)만 닫았고 사용자 창(workbench-core)은 그대로다.
    - Zed 설정·테마는 바꾸지 않았다. tauri를 사용자 테마 One Light에 맞췄다.
    - 첫 시험 파일은 빈 줄로 나뉜 목록이 하나의 느슨한 목록이 되어 다시 썼다.
- **K-06a I-9 미리보기 찾기 (ORDER-06)** (2026-11-13, coder, 커밋 `9630b01`)
  - 무엇을 했나: `src/editor/preview-find.ts`·`preview-find.test.ts`, `src/shell/preview-search.ts`를 새로 두고 `src/shell/markdown-preview.ts`·`Pane.tsx`, `src/workspace/context.ts`, `src/keymap/builtin.ts`, `src/app.css`를 고쳤다. CM `SearchQuery`(`literal: true`), `search.ts`의 `wholeWordTest`·`wholeWordOn`(I-20 단어 규칙), `.document-search` DOM·CSS·아이콘·문구, `EditorSearch` 키맵 문맥과 `editor::*` 명령 ID를 재사용했다.
  - 결과:
    - 대상: md·markdown·ipynb·csv·tsv. html·htm·svg·mmd·mermaid 미리보기와 이미지·PDF 탭에서는 Ctrl+F가 아무 일도 하지 않는다(`Preview.find`가 false).
    - 키: 미리보기 안 `MarkdownPreview` 문맥(Ctrl+F·F3·Shift+F3·Esc), 바 입력칸 `EditorSearch` 문맥(Enter·Shift+Enter·Alt+C·W·R·Esc). 바가 닫힌 채 F3·Shift+F3를 누르면 바가 열린다.
    - 표시: CSS Custom Highlight API. 공유 하이라이트 `preview-find`(`--ghost-element-selected`)·`preview-find-current`(`--players-0-selection`, priority 1)에 미리보기마다 자기 Range만 넣고 뺀다. DOM은 고치지 않는다.
    - 찾는 글자: body의 텍스트 노드. `.code-block-header`·`.nb-count`(`[n]`)·`style`·`script`·`annotation`은 뺀다. 블록 경계에는 줄바꿈을 넣어 블록을 건너 이어지는 결과가 없다.
    - 다시 계산: 바가 열린 동안 body의 MutationObserver(microtask로 묶음). 개수 문구 `n/m`·`0/0`·`Invalid regex`는 편집 탭과 같다.
    - 스크롤: 지금 찾은 곳이 바 아래 보이는 영역 밖일 때만 가운데로 옮긴다. 넓은 CSV는 가로도 옮긴다.
    - 바꾸기 줄·Select All·Find in Selection은 넣지 않았다(Zed 미리보기 바에도 없음).
  - 검증: V1. `npx tsc --noEmit` 오류 0, 관련 테스트 43/43·15/15. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-06a-report.md`).
  - 특이사항: 문서가 아주 크면 바가 열린 동안 편집할 때마다 전체를 다시 찾는다.
- **K-06b I-8 제목·목록 간격 (ORDER-06)** (2026-11-13, coder, 커밋 `9630b01`)
  - 무엇을 했나: `src/spec/metrics.ts`에 `markdown_preview.h1~h6.margin_top`·`margin_bottom` 12개(`prem`, 출처 주석 Zed 1.27.0 실측)를 더하고 `src/app.css`·`src/settings/model.ts`·`model.test.ts`를 고쳤다. v0.7 I-9 Settings 변수(`--preview-list-gap`·`--preview-list-line-gap`)를 재사용했다.
  - 결과:

    | 관계 | Zed | 고치기 전 | 고친 뒤 기대 | 무엇으로 |
    |---|---|---|---|---|
    | H1·H2 가로선 → 문단 | 19 | 7 | 19 | h1·h2 margin-bottom 12 |
    | H3 / H4 / H5 / H6 → 문단 | 19 / 20 / 19 / 19 | 8 / 8 / 9 / 7 | 같음 | margin-bottom 11 / 12 / 10 / 12 |
    | 문단 → H2 | 32 | 26 | 32 | h2 margin-top 22 |
    | 문단 → H3 / H4 / H5 / H6 | 32 / 31 / 30 / 30 | 25 / 24 / 23 / 23 | 같음 | h3~h6 margin-top 23 |
    | 붙은 항목 → 다음 | 26 | 36 | 26 | 줄 22(1em + 6) + 간격 4 |
    | 감싼 항목 1줄 → 2줄 | 22 | 24 | 22 | list line gap 6 |
    | 중첩 부모→자식 / 자식→자식 / 끝→다음 부모 | 21 / 26 / 31 | 23 / 36 / 41 | 같음 | flow-root, 중첩 목록 끝 4 |
    | 번호 목록 → 다음 | 26 | 36 | 26 | |
    | 느슨한 항목 → 다음 | 42 | 40 | 42 | 항목 안 문단 16 + 간격 4 |
    | 문단 → 첫 항목 | 38 | 40 | 39 | 그대로 |
    | 문단 → 문단 | 38 | 40 | 40 | 바꾸지 않음 |

    - CSS: `li { display: list-item flow-root }`, `li > :is(ul, ol)` 아래 margin = `--preview-list-gap`, `li:last-child > :last-child` 아래 margin 0(목록 뒤 간격 그대로), `.nb-markdown > :first-child { margin-top: 0 }`.
    - 기본값: `preview_list_line_gap` 8 → 6, `preview_list_gap` 12 → 4. 키·범위(0~48)·설정 화면은 그대로이고, 사용자 파일에 있는 값(옛 기본값 포함)을 그대로 쓴다.
    - H1 위 여백은 시험 파일에 H1 앞 문단이 없어 재지 않았으므로 0이다. H2 글자→가로선 7(Zed 6)은 두었다.
  - 검증: V1. `npx tsc --noEmit` 오류 0, `node --test src/settings/*.test.ts src/spec/metrics.test.ts` 12/12. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-06b-report.md`).
  - 특이사항: `display: list-item flow-root`는 Chromium 115+에서 된다.
- **K-06-R1 찾기 표시 지우기** (2026-11-13, coder, 커밋 `63edec6`)
  - 무엇을 했나: V3에서 검색어를 바꾸거나 닫아도 앞 표시가 남는 것을 찾아 고쳤다. `src/editor/preview-find.ts`에 순수 함수 `repaint`를 더하고 `src/shell/preview-search.ts`·`preview-find.test.ts`를 고쳤다.
  - 결과:
    - 원인: `search()`가 `ranges`를 새 Range로 바꾼 뒤에 `paint()` 안 `clear()`가 `ranges`를 지웠다. 그래서 공유 하이라이트에 앞 Range가 남았다(current가 6, 7, 8…로 늘고, 닫은 뒤 apple×5가 남음).
    - 고친 것: 넣은 Range를 `painted`에 따로 두고, 검색어·토글 변경, 지금 찾은 곳 이동, 다시 그림, 바 닫기, 탭 닫기 모두 `repaint`가 `painted`를 빼고 새로 넣는다. current는 늘 0개 또는 1개다.
  - 검증: V1. `npx tsc --noEmit` 오류 0, `node --test src/editor/preview-find.test.ts` 3/3(새 테스트: 앞 표시가 남지 않음, F3 뒤 current 1개, 닫으면 다른 미리보기 Range는 남음). 보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-06-R1-report.md`.
  - 특이사항: 없음.
- **K-06-R2 숨은 미리보기 다시 계산·바 아래 스크롤** (2026-11-13, coder, 커밋 `e845831`)
  - 무엇을 했나: V3에서 같은 pane의 숨은 미리보기가 갱신되지 않는 것(1/6 그대로)과 바가 버튼·제목을 가리는 것을 찾아 고쳤다. `src/shell/preview-search.ts` 한 줄, `src/app.css` 한 규칙.
  - 결과:
    - 원인 1: 바가 열렸는지를 `dom.isConnected`로 판단했다. 같은 pane에서 다른 탭을 보이면 미리보기가 문서에서 빠져(`PaneBody`의 `replaceChildren`) 다시 계산을 건너뛰었다.
    - 고친 것 1: `isOpen = () => dom.parentNode === element`. 숨은 동안 다시 그려져도 바로 다시 계산한다(스크롤은 하지 않음).
    - 고친 것 2: `.markdown-preview:has(> .preview-search)`에 바 높이만큼 `scroll-padding-top`(`.document-search` 크기 변수로 계산). Outline 제목 스크롤(`block: "start"`)과 블록 위치 연계(`nearest`)가 바 아래에서 멈춘다. 바가 닫히면 그대로다.
  - 검증: V1. `npx tsc --noEmit` 오류 0, `node --test src/editor/preview-find.test.ts` 3/3. DOM·레이아웃 동작이라 테스트를 더하지 않았다(코드 확인, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-06-R2-report.md`).
  - 특이사항: 없음.
- **V3 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: tauri에서 같은 `spacing.md`·`INTENT.md`를 One Light·미리보기 16px로 재고(`tauri-after.json`·`tauri-after-spacing-*.png`·`tauri-after-intent.png`, `63edec6`, 간격 코드는 `9630b01` 뒤 그대로), Zed와 나란히 캡처했다(`side-headings/lists/intent-tauri-vs-zed.png`, `measure-spacing.mjs`). 찾기는 `measure-find.mjs`로 `v3-find.json`·`v3-find-md.json`·`v3-find-hl.json`(R1 뒤)·`v3-find-pane.json`(R2 뒤)과 캡처 `c5-md-bar.png`·`c6-korean.png`·`c6-next-far.png`·`c8-side-by-side.png`·`c9-outline-with-bar.png`를 남겼다. 전체 검증 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 306/306(`e845831`).
  - 결과: 판정은 C-11에서 한다. 측정값:
    - 간격(고친 뒤, tauri / Zed): H1·H2 가로선→문단 19/19, 문단→H2~H6 32/32/31/30/30(같음), H3~H6→문단 19/20/19/19(같음), H2 글자→선 7/6, 붙은 항목 26/26, 감싼 줄 22/22, 중첩 21/26/31(같음), 번호 26/26, 느슨한 항목 42/42, 문단→첫 항목 39/38, 문단→문단 40/38, 목록 끝→다음 문단 38~40/33~35, 느슨한 목록 끝→문단 39/50. 가로선 H1·H2 1px #dfdfe0.
    - `size20`(미리보기 20px): h2 margin-top 27.5·bottom 15, li 줄 26. `userListValues`: 설정 파일 12·8 → 변수 12px·8px.
    - 찾기: 종류별 열림(`c5_kinds`), md 열기·토글·범위·다음/이전·Esc·회귀(`v3-find-md.json`), R1 뒤 검색어 바꿈·닫을 때 하이라이트와 나란히 갱신 1/6→1/8(`v3-find-hl.json`), R2 뒤 같은 pane 숨은 미리보기 1/6→1/8·하이라이트 7+1, 바 닫고 복사 원문 같음, 바 열린 채 Outline 제목 클릭 → 제목이 바 아래.
  - 검증: V3.
  - 특이사항:
    - CDP 키가 블록 클릭 뒤 편집기로 가서 미리보기 포커스는 JS로 줬다. `v3-find.json`의 md 부분은 이 포커스 문제로 실패했고 `v3-find-md.json`으로 다시 쟀다.
    - `v3-find-md.json`의 `c8_refresh`(같은 pane)와 `copy` "x"(바가 버튼을 가림)는 R2 전 값이고 R2로 고쳤다.
    - 안쪽 링크(`#id`)는 스크롤되지 않는다. v0.4 `72bdaa7`부터 `anchor` 종류를 처리하는 코드가 없어서다(이 카드 전부터).
    - 문단 간격(40 대 38)·목록 끝→문단(38~40 대 33~35)·느슨한 목록 끝(39 대 50)은 사용자가 말하지 않은 값이라 바꾸지 않았다.
    - `INTENT.md` 나란히 캡처에서 Zed 본문 글자·불릿 들여쓰기가 tauri보다 작게 보인다(카드 범위 밖).
    - PDF·이미지 미리보기의 Ctrl+F(#5)는 파일이 없어 재지 않았다.
- **C-11 대리 검토·V3 판정** [1부 PASS, 2부 PASS] (2026-11-13, Claude Code 서브 에이전트)
  - 무엇을 했나: `07e11d8..e845831`의 src를 검토하고 `verify/ORDER-06/`의 V3 결과를 판정했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 306/306, `git diff 07e11d8 e845831 -- spec` 출력 없음. `rows.mjs`로 Zed·tauri 캡처의 간격을 다시 계산했다. 앱·Zed는 띄우지 않았다.
  - 결과:
    - 1부 코드 검토 PASS. 꼭 고칠 것 없음. 권고 넷:
      - 바가 열린 동안 MutationObserver가 비동기 그리기(코드 블록 색·수식·Mermaid)마다 전체를 다시 계산한다. 코드 블록이 많은 문서에서 입력 중 지연 가능 — 디바운스 권고.
      - 제목 여백 ID(`markdown_preview.h1~h6.margin_*`)는 `spec/zed-metrics.toml`에 없다. 원본 반영은 core.
      - `scroll-padding-top`이 바 높이를 `.document-search` 규칙과 따로 계산해, 그 규칙이 바뀌면 조용히 어긋난다.
      - 숨은 글자(`display:none`, 닫힌 `details`)도 개수에 들어간다.
    - 2부 V3 #1~#10 PASS, 불일치 0. `rows.mjs` 다시 계산이 leader 요약과 0~1px로 일치했다(H2 글자→선 7/6, 문단→첫 항목 39/38 외 0).
  - 검증: V1 검토·V3 판정(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-11-report.md`).
  - 특이사항: 근거가 약한 것 —
    - #5 이미지·PDF 미리보기는 파일이 없어 코드 확인만 했다.
    - 문서 중간 H1 위 여백은 재지 않았다(0 유지).
    - Outline 제목 스크롤은 두 번 다 문서 끝(끝까지 스크롤된 상태)에서만 쟀다. scroll-padding 값이 바 높이와 같은지는 재지 않았다.
    - 수식 `annotation` 제외는 코드 확인이다.
    - ipynb·csv·tsv의 Esc 닫힘, csv·tsv의 검색어 개수는 기록이 없다(같은 코드 경로).
    - 미리보기 20px에서 목록 간격은 px 고정이다(설정 단위가 px). ORDER 3.1 "비율 유지"를 목록에도 적용할지는 leader-core 판단.
- **W-07 ORDER-06 PROGRESS·PLAN 기록** (2026-11-13, writer)
  - 무엇을 했나: 위 Phase 6 항목을 K-06a·K-06b·K-06-R1·K-06-R2 보고 파일, C-11 카드(측정 요약)와 W-07 카드에서 옮겨 적고, `PLAN.md`에 Phase 6 작업 카드 표를 더했다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-07-report.md`).
  - 특이사항: 없음.

### Phase 7 — HTML 미리보기 스크립트 실행, 0.8.1 release 빌드·README

- **K-07a I-7 HTML 미리보기 스크립트 실행 (ORDER-07)** (2026-11-13, coder, 커밋 `4a47bb2`)
  - 무엇을 했나: `src-tauri/src/preview.rs`를 새로 두고 `src-tauri/src/lib.rs`·`tauri.conf.json`, `src/editor/html.ts`·`html.test.ts`, `src/shell/markdown-preview.ts`를 고쳤다(`src/app.css`·`src/theme/apply.ts`는 주석만). 측정용 시험 파일은 `specs/v0.8.1/verify/ORDER-07/fixtures/`. 기존 정화 규칙(`resourceUrl`·`rewriteCss`·`rewriteSrcset`·`localImagePath`), I-11 `defaultStyle`, `convertFileSrc`, Tauri `register_uri_scheme_protocol`, `notify`를 재사용했다.
  - 결과:
    - 방식: v0.8의 `frame.srcdoc`는 앱 CSP(`script-src 'self' 'wasm-unsafe-eval'`)를 물려받아 인라인 스크립트가 돌 수 없다. 그래서 자기 URL을 가진 별도 문서로 바꿨다.
      - Rust `preview` URI 스킴(Windows `http://preview.localhost/<id>`). `preview_set(id, html)`로 맡긴 id 경로에만 200, 그 밖의 경로는 모두 204. 탭을 닫으면 `preview_drop(id)`. 응답 헤더 `Content-Type: text/html; charset=utf-8`, `Cache-Control: no-store`, `Allow-CSP-From: *`.
      - iframe `sandbox="allow-scripts"` 하나(`allow-same-origin` 없음 → 불투명 원점). 폼 전송·`window.open`·모달·`top.location`이 막힌다.
      - 프레임 CSP(`PREVIEW_CSP`)를 `<head>` 첫 요소의 meta와 iframe `csp` 속성(CSP Embedded Enforcement) 두 곳에 건다. `csp` 속성은 `Allow-CSP-From`이 있는 응답만 받아들이므로, 페이지가 프레임을 asset URL(정화·CSP 없는 원본)로 옮기는 탈출을 막는다. PDF 미리보기가 asset iframe을 써서 앱 `frame-src`에서 asset을 뺄 수 없어서다.
      - 정화: `<script>`·`on*`를 지우지 않는다. 링크는 `#id`만 남겨 페이지 안 스크롤로 쓴다. 나머지 규칙(외부·`javascript:`·`file:` URL 제거, 로컬 → asset, `<meta refresh>`·`<base>`·`iframe/embed/object` 제거, 폼 대상 제거)은 그대로. HTML 미리보기는 DOMPurify가 아니라 `DOMParser` 기반 자체 규칙이다(카드 전제 정정).
      - 스크롤 유지: 부모가 불투명 원점 프레임의 `scrollY`를 읽을 수 없어, 문서 머리의 작은 스크립트가 `parent.postMessage({previewScrollY})`로 알린다. 부모는 `e.source === frame.contentWindow`이고 숫자일 때만 쓴다.
      - 멈춤: dispose에서 `frame.remove()`, 메시지 리스너 제거, `preview_drop`.
    - 보안 설정 앞(`20cbbf2`, v0.8 `e46a172`과 같음)·뒤:

      | 항목 | 앞 | 뒤 |
      |---|---|---|
      | `csp`·`devCsp` | `frame-src asset: http://asset.localhost` (나머지 생략) | `frame-src asset: http://asset.localhost preview: http://preview.localhost`, `script-src`·`connect-src` 등 나머지 그대로 |
      | iframe | `sandbox="allow-same-origin"`, `srcdoc` | `sandbox="allow-scripts"`, `csp="<PREVIEW_CSP>"`, `src=http://preview.localhost/p<n>` |
      | 프레임 안 CSP | 없음(앱 CSP 상속) | `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' asset: http://asset.localhost; style-src 'unsafe-inline' asset: http://asset.localhost; img-src data: blob: asset: http://asset.localhost; font-src data: asset: http://asset.localhost; media-src asset: http://asset.localhost; connect-src 'none'; form-action 'none'; base-uri 'none'` (meta + `csp` 속성) |
      | preview 응답 | (없던 스킴) | 저장된 id 200 + `Allow-CSP-From: *`, `Cache-Control: no-store` / 그 밖 204 |
      | 정화: 지우는 태그 | `script`, `base`, `iframe`, `frame`, `frameset`, `embed`, `object`, `applet`, `meta[http-equiv=refresh]`, stylesheet 아닌 `link` | `script`만 빠짐 |
      | 정화: 속성 | `on*`·`ping` 지움, `a/area` href 통째로 지움, action·formaction 지움 | `ping`만 지움(`on*` 남김), `a/area` href는 `#id`만, action·formaction 지움, `script`의 crossorigin·integrity 지움 |

      - capability·의존성 변경 없음(앱 명령 두 개는 app manifest를 쓰지 않아 capability 밖).
    - IPC 하위 프레임 조사(코드·문서): wry 0.57.1은 Windows에서 스크립트를 하위 프레임에도 넣으므로 `__TAURI_INTERNALS__`·`window.ipc`는 프레임에도 있다. 판정은 호출이 막히는지다. `fetch http://ipc.localhost`는 프레임 `connect-src 'none'`이 막고(막히지 않더라도 `Origin: null`은 tauri가 거절), `chrome.webview.postMessage`는 wry가 최상위 `WebMessageReceived`만 등록해 받지 않는다. tauri `is_local_url`이 `http://preview.localhost`를 local로 쳐서 두 경로가 막히는지가 중요했다.
    - 알려진 한계(`shortcut:` 주석): 스크립트가 만든 상대 URL(`img.src = "pic.png"`)은 204라 안 뜬다. 로컬 `type="module"` `<script src>`는 CORS라 안 돈다. 시안의 `file:///` 글꼴은 요청하지 않아 대체 글꼴로 보인다. 무한 루프는 막는 코드가 없다.
  - 검증: V1. `npm run typecheck` 오류 0, `node --test src/editor/html.test.ts` 10/10, `cargo test preview` 1/1, `cargo clippy -- -D warnings` 경고 0. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-07a-report.md`).
  - 특이사항: 스크립트 이동 되돌림이 렌더마다 1회라 같은 렌더에서 두 번째로 이동하면 오류 페이지가 남았다 → K-07a-R1.
- **K-07a-R1 이동 매번 되돌림** (2026-11-13, coder, 커밋 `eb987f2`)
  - 무엇을 했나: V3 이동 측정(R1 전)에서 두 번째 이동 뒤 빈 문서가 남은 것을 고쳤다. `src/shell/markdown-preview.ts`, `src/editor/html.ts`(`recordRecovery`·`PREVIEW_RECOVER_LIMIT`·`PREVIEW_RECOVER_WINDOW_MS`), `html.test.ts`.
  - 결과:
    - 원인: 되돌림이 `recovered` 플래그로 렌더마다 1회였다. 또 스킴의 204가 이동을 막지 못했다. 네트워크 HTTP 응답이면 Chromium은 204에 이동하지 않지만, WebView2 커스텀 스킴 응답에는 이 규칙이 적용되지 않아 빈 문서(`title "preview.localhost"`)를 커밋한다. 불투명 원점 문서는 Navigation API `navigate` 이벤트가 꺼져 있어 프레임 안에서 미리 취소할 수도 없다.
    - 고친 것: 이 미리보기가 시작하지 않은 프레임 load(오류 페이지, 204 빈 문서, `location.reload()` 등)마다 미리보기 문서를 다시 띄운다. 5초(`PREVIEW_RECOVER_WINDOW_MS`) 안에 5번(`PREVIEW_RECOVER_LIMIT`)이면 더 띄우지 않고 토스트 "This HTML page keeps navigating away. / Its preview stops until the file or the theme changes."를 띄운다. 다음 렌더(원본 편집·테마 변경·탭 다시 열기)에서 기록을 비운다. 값은 Zed 값이 아닌 tauri 결정(코드 주석).
    - Rust는 고치지 않았다.
  - 검증: V1. `npm run typecheck` 오류 0, `node --test src/editor/html.test.ts` 11/11(새 테스트: 창 안 5번 허용, 6번째 null, 창 밖 기록 빠짐). 보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-07a-R1-report.md`.
  - 특이사항: 1초보다 조금 느린 주기로 이동하는 페이지는 제한에 걸리지 않고 계속 돌아온다(앱을 바쁘게 만들지 않아 알려진 한계).
- **K-07b 0.8.1 release 빌드·BUILD.md·README** (2026-11-13, coder, 커밋 `970ad01`)
  - 무엇을 했나: HEAD `eb987f2`에서 `npm.cmd run tauri build`(exit 0, 빌드 직전 `workbench-tauri.exe` 프로세스 없음 확인). `docs/BUILD.md`에 "4A. 0.8.1 결과 파일" 절(0.8.0 절 그대로), README "실행" 절을 0.8.1 기준으로 마무리(설치 파일 이름 `workbench-tauri_0.8.1_x64-setup.exe`, 크기 링크는 BUILD.md 4A절, 사용자 요청 2026-11-11).
  - 결과:

    | 파일 | 크기 | 0.8.0 대비 | ProductVersion |
    |---|---|---|---|
    | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.1_x64-setup.exe` | 10,582,363 B | +3,118,616 B(+41.78%) | 0.8.1 |
    | `src-tauri\target\release\workbench-tauri.exe` | 21,538,304 B | +3,248,128 B(+17.76%) | 0.8.1 |

    - 증가는 대부분 ORDER-05 코드 글꼴 넷(`dist/fonts/` 비압축 5,846,782 B, `dist/` 증가의 98.7%).
    - 빌드 71초(cargo release 50.98초). 경고는 기존 종류뿐(Vite 500 kB chunk, web-tree-sitter `[EVAL]` 2건), Rust 경고 없음.
  - 검증: V0 + 빌드. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-07b-report.md`).
  - 특이사항: exe zip은 만들지 않았다(카드에 없음). README 앵커 `#4a-081-결과-파일`은 렌더 확인을 하지 않았다. 빌드 HEAD가 `eb987f2`라 K-07a-R2 뒤 다시 빌드한다.
- **V3 측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: debug exe, 1920×1080 100%, 창 1440×852, One Dark(일부 One Light)에서 `measure.mjs`와 `fixtures/`로 쟀다. 결과 `specs/v0.8.1/verify/ORDER-07/` `v3.json`·`v3-nav.json`·PNG.
  - 결과: 판정은 C-12에서 한다. 측정값:
    - 격리(`isolation.html`): 인라인·로컬 스크립트가 돌고 원본 편집 뒤 다시 그려진다. `parent`/`top`의 document·location, `localStorage`·`sessionStorage`·`indexedDB`·cookie는 SecurityError, `__TAURI__` undefined, ipc fetch 두 가지·`__TAURI_INTERNALS__.invoke`·`chrome.webview.postMessage` 막힘. `__TAURI_INTERNALS__`·`window.ipc`는 존재한다.
    - 인터넷(`network.html`): 표의 모든 행 blocked.
    - 이동(R1 뒤, `v3-nav.json`): 링크 3종·버튼 7종 뒤 모두 원래 문서(`title navigate`, `src …/p1`), 앱 탭·`appUrl` 그대로, `#bottom` scrollY 1272. 계속 이동하는 페이지(`loopnav.html`)는 5번 뒤 토스트로 멈춘다. meta refresh(`refresh.html`) 뒤에도 페이지 그대로.
    - 스타일 없는 HTML: 글자·링크색·color-scheme·배경이 Preview 테마 색이고 테마를 바꾸면 따라 바뀐다. 투명 캔버스 유지. 로컬 CSS 점선 테두리·`pic.png` 32 px.
    - 앱 창 인라인 스크립트는 여전히 막힌다(`script-src-elem` 위반).
    - 시안 `mockups/outline/index.html`: designs 6, svg 500.
    - 무한 루프 중 앱 응답 1 ms(프레임이 별도 렌더러, 프로세스 24→25). 탭을 닫으면 iframe 0.
    - PDF 미리보기 그대로 뜬다.
  - 검증: V3.
  - 특이사항: 처음 이동 측정(R1 전, `v3.json`의 `c5_navigate`·`c5_refresh`)에서 두 번째 이동 뒤 빈 문서가 남아 K-07a-R1을 냈다. 그 기록은 판정에서 뺀다.
- **C-12 검토·V3 판정** [REWORK] (2026-11-13, tauri-checker)
  - 무엇을 했나: 한도가 풀려 대리 검토 대신 tauri-checker가 다시 맡았다. ORDER-07 코드를 검토하고 V3 결과를 판정했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 309/309. `cargo test`·`clippy`는 `target\debug\.cargo-build-lock` 액세스 거부(os error 5)로 돌리지 못해 K-07a 결과를 쓰고 `preview.rs`는 코드로 읽었다.
  - 결과:
    - 코드 검토: 격리 다섯 조건을 깨는 결함은 없다. 앱 `script-src`·`connect-src` 그대로, sandbox `allow-scripts`만, 프레임 CSP 두 곳, 스킴 저장된 id만 200, IPC 경로 막힘(코드·문서), 정화, postMessage 수신 검사, Rust 명령 모두 OK.
    - REWORK A(코드, 중간): 탭 뷰는 DOM에서 뺐다 넣는 방식(`Pane.tsx:434`)이라 탭을 바꿨다 돌아오면 iframe이 다시 불러와져 `load`가 온다. 이 load를 이동으로 보고 다시 띄워 문서가 두 번 뜨고, 5초 안에 5번(두 탭 사이 3왕복)이면 거짓 토스트가 뜨고 진짜 이동도 되돌리지 않게 된다 → K-07a-R2.
    - REWORK B(측정 보강): #2 시안 그림이 보이는 캡처(지금 `c2-mockup-preview.png`는 맨 위 설명 표만), #4 프레임 대상에 붙은 네트워크·`securitypolicyviolation` 기록(지금 기록은 메인 대상만 봐 OOPIF 프레임 요청이 안 들어옴), #8 닫은 뒤 남은 렌더러 프로세스의 CPU·일반 타이머 정지.
    - V3: #3 격리: 앱·#5 이동·#6 보안 설정·#7 v0.8 기능 PASS. #2·#4는 보강 필요, #8은 부분 PASS.
  - 검증: V1 검토·V3 판정(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-12-report.md`).
  - 특이사항:
    - 참고(결함 아님): 스크립트가 만든 `<script src=asset…>`은 디스크 어느 파일이든 스크립트로 실행해 본다(내용은 못 읽고 나갈 길 없음). `<link rel=preconnect|dns-prefetch>`·WebRTC는 CSP가 막지 않아 호스트 이름 수준 누출이 이론상 가능하다(미실측, 낮음).
    - #3은 가능하면 부작용이 보이는 명령(예: 클립보드 쓰기)을 한 번 더 쏴 보라고 했다(선택).
    - #7 Tab으로 프레임 안 포커스는 간접 근거다.
    - 무한 루프에서 앱이 멈추지 않는 것은 WebView2가 `preview.localhost`를 별도 프로세스로 나누는 데 기댄 것이라 보장이 아니다 — 알려진 한계로 적는다.
- **K-07a-R2 탭 전환 이중 로드·거짓 알림** (2026-11-13, coder, 커밋 `267cfa5`)
  - 무엇을 했나: C-12 A를 고쳤다. `src/shell/markdown-preview.ts`(load 판정), `src/editor/html.ts`(`headStart` 스크립트 첫머리에 `previewReady` 알림), `src/editor/html.test.ts`(assert 1줄). 기존 프레임→부모 postMessage 경로(스크롤 `previewScrollY`와 같은 리스너·같은 `e.source === frame.contentWindow` 검사), `recordRecovery`·토스트를 재사용했다.
  - 결과:
    - 원인: 되돌림이 "이 미리보기가 `src`를 정한 직후의 load"(`expected`)만 우리 것으로 봤다. 탭 뷰를 DOM에서 뺐다 넣으면(`Pane.tsx`) 브라우저가 iframe `src`를 다시 불러오는데, 이 load가 이동으로 세어져 또 불러오고 `recordRecovery`에 쌓여 거짓 토스트와 `stopped`가 됐다.
    - 고친 것: 판정 기준을 "지금 프레임에 든 문서가 미리보기 자신의 문서인가"로 바꿨다. 미리보기 문서는 머리 스크립트 첫 줄에서 `parent.postMessage({previewReady:true}, "*")`를 보내고, 부모는 `e.source === frame.contentWindow`이면 `ours = true`로 둔 뒤 프레임 load마다 읽고 비운다. 우리 문서의 load(렌더, 탭 다시 붙임, `location.reload()`)는 아무것도 하지 않는다. 막힌 이동이 남긴 문서(CSP 오류 페이지, 204 빈 문서)는 알림이 없어 K-07a-R1대로 되돌림·횟수 제한. `expected`는 지웠다.
    - 페이지가 `previewReady`를 흉내 내고 이동하면 그 페이지의 오류 페이지가 되돌려지지 않을 뿐이다(격리와 무관).
  - 검증: V1. `npm run typecheck` 오류 0, `node --test src/editor/html.test.ts` 11/11. Rust 변경 없음, 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-07a-R2-report.md`).
  - 특이사항: 프레임의 postMessage가 부모에서 그 프레임의 load보다 먼저 처리된다는 순서를 기대한다. V3 탭 전환 시험으로 확인한다(ORDER-07-R1에서 확인).
- **W-08 ORDER-07 PROGRESS·PLAN 기록(지금까지)** (2026-11-13, writer)
  - 무엇을 했나: 위 Phase 7 항목을 K-07a·K-07a-R1·K-07b·C-12 보고 파일, K-07a-R2 카드와 W-08 카드(V3 요약)에서 옮겨 적고, `PLAN.md`에 Phase 7 작업 카드 표를 더했다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-08-report.md`).
  - 특이사항: 없음.
- **K-07c 0.8.1 release 다시 빌드** (2026-11-13, coder, 커밋 `88e2acf`)
  - 무엇을 했나: HEAD `267cfa5`(K-07a-R2 반영)에서 `npm.cmd run tauri build`(exit 0). 빌드 직전 프로세스는 leader의 debug exe(PID 37392)뿐이고 release exe를 띄운 프로세스는 없어 그대로 두고 빌드했다. `docs/BUILD.md` 4A절 숫자와 "K-07a-R2 반영 다시 빌드" 한 줄, 머리 "고친 날" 줄의 기준 커밋(`eb987f2` → `267cfa5`)을 고쳤다. README는 그대로.
  - 결과:

    | 파일 | 크기 | 0.8.0 대비 | ProductVersion |
    |---|---|---|---|
    | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.1_x64-setup.exe` | 10,579,907 B(2026-11-13 07:44:58) | +3,116,160 B(+41.75%) | 0.8.1 |
    | `src-tauri\target\release\workbench-tauri.exe` | 21,538,304 B(07:44:58) | +3,248,128 B(+17.76%) | 0.8.1 |

    - K-07b 빌드 대비 설치 파일 −2,456 B, exe 같음. 빌드 70초(cargo release 48.09초). 경고는 기존 종류뿐, Rust 경고 없음.
  - 검증: 빌드 + V0. 앱은 실행하지 않았다(보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-07c-report.md`).
  - 특이사항: 없음.
- **V3 보강·release 회귀** (2026-11-13, tauri-leader)
  - 무엇을 했나: C-12 B 보강과 R2 뒤 탭 전환을 debug exe(`267cfa5`)로 `measure-c.mjs`로 재고(`v3-c.json`, `c2-mockup-drawings.png`), #11 전체 회귀를 0.8.1 release exe(`267cfa5`)로 `measure-regress.mjs`로 쟀다(`v3-regress.json`·`v3-regress-fix.json`, `c11-release-regress.png`). 1920×1080 100%, 창 1440×852, One Dark. 교차 원점 프레임 안의 값은 프레임 대상(별도 프로세스)에 CDP로 붙어 읽었다.
  - 결과: 판정은 C-13에서 한다. 측정값:
    - #2 시안: 프레임을 `#designs`로 스크롤해 그림 영역을 캡처했다(`c2-mockup-drawings.png`, 브라우저 캡처 `..\ORDER-04\mockup-F.png`와 나란히), designs 6.
    - #4 인터넷(`b4_frame_network`, 프레임 대상): fetch·XHR·WebSocket·script·img 모두 blocked, 시도마다 `securitypolicyviolation`(connect-src·script-src-elem·img-src), Log에 CSP 위반.
    - #8 멈춤: 일반 타이머 페이지는 닫고 다시 열면 새 문서, 닫은 뒤 7초 동안 CPU를 쓰는 프로세스 0(`b8_stop`). 루프 페이지는 탭을 닫아도 같은 렌더러가 4초에 4.65 CPU-s를 쓴다(`b8_loop_close`, 앱은 응답).
    - 탭 전환(`a_tab_switch`): 6번 오가도 토스트 없음.
    - #11 release 회귀: I-1~I-13 대표 동작과 미리보기 종류(마크다운 위치 연계, 수식·Mermaid, CSV·SVG·ipynb·HTML·이미지·PDF) 모두 기대대로. 표는 `verify/ORDER-07/c13-regress-table.md`(C-13이 JSON에서 정리).
  - 검증: V3.
  - 특이사항:
    - 화면 밖 요소 클릭·키 입력 문맥 문제로 몇 항목을 `v3-regress-fix.json`으로 다시 쟀다.
    - release의 첫 I-3 실패는 펼친 첫 폴더(루트 바로 아래 첫 줄)에 스크롤 0에서도 sticky 행이 겹쳐 놓을 곳이 되지 않는 것이었다. debug exe에서도 같고 ORDER-02부터다.
- **C-13 검토·V3 판정** [REWORK — 재측정 2건, 코드 변경 요구 없음] (2026-11-13, tauri-checker)
  - 무엇을 했나: K-07a-R2·K-07c와 V3 보강·#11 회귀를 판정했다. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 309/309. `cargo test`·`clippy`는 C-12와 같은 사유(`.cargo-build-lock` 액세스 거부)로 돌리지 못했고, `git diff 267cfa5 HEAD -- src src-tauri`가 비어 있고 R2는 Rust를 고치지 않아 K-07a의 Rust 결과(test 1/1, clippy 0)가 그대로라고 봤다.
  - 결과:
    - PASS: B 보강 #2(F안 그림이 `mockup-F.png`와 같은 배치·색·아이콘)·#4(프레임 대상 기록, 요청은 CSP에서 막힘)·#8 일반 타이머, #9 빌드, #10 README, #11 전체 회귀(조건부 — 기대값이 든 표가 verify에 없어 C-13이 만든 표를 `c13-regress-table.md`로 옮김), #12 테스트.
    - A(R2) 코드는 원인에 맞다. 그러나 `a_tab_switch`는 한 바퀴 약 3초라 고치기 전 코드도 통과했을 시험이고, 로드 횟수와 postMessage·load 순서를 증명하지 못한다. R2 뒤 navigate.html 이동·loopnav 제한을 다시 재지 않았다 → 재측정 ①.
    - 루프 CPU는 알려진 한계로 볼 수 있으나, 그 프로세스가 그 뒤 여는 HTML 미리보기도 먹는지 확인이 필요하다(C-12 때 루프 직후 연 미리보기의 프레임 값이 모두 `noFrame`) → 재측정 ②. 실패하면 [BLOCKED]로 사용자 결정.
    - sticky 겹침(I-3)은 결함이 아니다. Zed와 같은 동작(`ProjectTree.tsx:133` "Zed: sticky rows take no drop", R-13 "natural sticky slot")이고 범위 밖이다.
  - 검증: V1 검토·V3 판정(보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-13-report.md`).
  - 특이사항:
    - 페이지가 `location.reload()`로 자기 문서를 계속 다시 부르면 `ours`라 횟수 제한에 안 잡힌다(프레임 안에서만 도는 브라우저와 같은 동작, 결함 아님).
    - 회귀 측정의 `about.ver`는 이름(`"workbench-tauri"`)이라 앱 정보의 버전을 확인하지 못했다(ORDER-07-R1에서 확인).
- **ORDER-07-R1 재측정** (2026-11-13, tauri-leader)
  - 무엇을 했나: C-13 재측정 두 건과 release 앱 정보 버전을 `measure-r1.mjs`로 쟀다(`v3-r1.json`·`v3-r1-about.json`, `r1-after-loop-new-preview.png`·`c9-release-about.png`).
  - 결과:
    - 빠른 탭 전환 10번(2.8초): 토스트 없음, 문서 그대로(`r1_fast_tabs`). 10번 전환 동안 프레임 문서 "Started at"이 1회 바뀌었다.
    - 탭 전환 뒤 버튼 이동 3종 되돌림(`r1_nav_after_tabs`)과 loopnav 5번 제한·토스트(`r1_loopnav_after_tabs`) 그대로.
    - release exe Help → About "Version 0.8.1".
    - 무한 루프 페이지를 닫은 뒤 `page.html`을 열면 iframe(`src` p3)은 있으나 프레임 대상이 없고, 5초 뒤에도 스크립트 결과가 없으며 화면이 빈칸이다(`r1_after_loop_new_preview`). 앱 창·다른 미리보기 종류는 응답하고, 앱을 다시 열면 풀린다 → **[BLOCKED] #8**.
  - 검증: V3.
  - 특이사항: 원인은 닫은 루프 페이지의 렌더러가 계속 바쁘고(CPU 1코어), 그 뒤 연 HTML 미리보기(같은 `preview.localhost` 사이트)가 그 프로세스에 들어가 그려지지 않는 것으로 본다(프레임 대상이 DevTools에 안 잡힘). 고칠 방향 후보: 미리보기마다 다른 호스트 이름(`p<n>.preview.localhost`)으로 사이트를 나눠 새 프로세스에 넣기, 또는 알려진 한계로 받기.
- **leader-core 결정 #8** (2026-11-13)
  - 결함으로 보고 I-7 #8만 BLOCKED로 남긴다. 고치려면 프레임 프로세스 처리로 범위가 커져 사용자가 정한다 — 마지막 보고에서 묻는다. 지금 코드는 되돌리지 않는다(보통 HTML은 동작하고, 앱을 다시 열면 풀린다).
  - 알려진 한계: 무한 루프 페이지를 연 뒤에는 앱을 다시 열 때까지 HTML 미리보기가 빌 수 있고, 그 프로세스가 CPU를 쓴다.
- **K-07d BUILD.md 알려진 한계** (2026-11-13, coder)
  - 무엇을 했나: `docs/BUILD.md` 7절 "알려진 제약" 끝에 한 줄: "0.8.1 HTML 미리보기: 무한 루프(`while(true){}` 등) 페이지를 연 뒤에는 앱을 다시 열 때까지 HTML 미리보기가 빈 화면일 수 있고, 그 페이지의 렌더러 프로세스가 CPU 1코어를 계속 쓴다(ORDER-07 #8, leader-core 결정으로 사용자 확인 대기)."
  - 결과: 문서만 바뀌었다(알려진 한계 자리가 7절에 있어 4A절에는 넣지 않음).
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-K-07d-report.md`).
  - 특이사항: 없음.
- **ORDER-07 보고** (2026-11-13, tauri-leader): `specs/v0.8.1/reports/ORDER-07.md` [BLOCKED] — #8의 한 사례(무한 루프 뒤 새 HTML 미리보기)만 막혔고 나머지 완료 기준은 충족. 미정: 펼친 첫 폴더 위 sticky 겹침을 고칠지(ORDER-02부터), 사용자 확인(V4: 시안·실제 HTML 페이지가 브라우저와 같게 보이는지, 계속 이동 토스트 문구).
- **W-09 ORDER-07 PROGRESS·PLAN 마무리** (2026-11-13, writer)
  - 무엇을 했나: K-07a-R2 항목을 끝난 것으로 고치고, 위 K-07c~ORDER-07 보고 항목을 `reports/ORDER-07.md`, K-07a-R2·K-07c·C-13·K-07d 보고 파일과 W-09 카드에서 옮겨 적었다. `PLAN.md` Phase 7 표에 K-07c·C-13·ORDER-07-R1·K-07d·W-09를 더했다.
  - 결과: 문서만 바뀌었다.
  - 검증: V0(명령 없음, 보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-09-report.md`).
  - 특이사항: 없음.
- **상태**: ORDER-07 보고 [BLOCKED](#8만), leader-core 판정 대기.
