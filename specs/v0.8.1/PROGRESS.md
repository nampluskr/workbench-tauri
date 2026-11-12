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
- **W-01 v0.8.1 문서와 루트 AGENTS.md** (2026-11-13, writer)
  - 무엇을 했나: `specs/v0.8.1/`에 PLAN(core I-1~I-13 ↔ Phase 1~7 대응, Phase 1 작업 카드 표)·HERDR-SETUP·PROGRESS를 상태 "초안"으로 쓰고, `reports/`·`verify/` 폴더(`.gitkeep`)를 만들었다(ORDER-01 3.1). 루트 `AGENTS.md`의 레포 규칙 절 "HERDR 구성은 core가 정한다"(v0.8.1 구성)·"core ITEMS 우선"(v0.8.1, I-1~I-13), 제목 `(v0.8.1)`, 0장 경로, 카드 파일 이름 `v081-`, 1장 현재 상태, 3A.4·8장 `specs/v0.8.1/verify` 경로를 고쳤다. 규칙 자체는 그대로다.
  - 결과: HERDR-SETUP은 v0.8판에서 구성(coder Opus 5.5 medium, checker agy `claude-sonnet-5-5-high`), 레이아웃(`w0`, leader-core 띄움), 카드·보고 파일 이름(`v081-`), 경로, core 근거(core v0.8.1 `orders/COMMON.md`), 리뷰 독립성 문장을 바꿨다.
  - 검증: V0. v0.8 구성 문자열(coder 모델·checker 모델·카드 파일 앞붙이) 셋을 `AGENTS.md`·`specs/v0.8.1`에서 `git grep --untracked`로 찾아 출력 없음(보고 `C:\Users\nampl\AppData\Local\Temp\v081-W-01-report.md`).
  - 특이사항: 없음.
