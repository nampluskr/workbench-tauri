> 버전: v0.8 · 작성일: 2026-11-10 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서와 core I-n 대응은 `PLAN.md`에, 요구와 판정 방법은 core `specs/v0.8/ITEMS.md`와 카드 4절에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.8/reports/`에 있다.

# PROGRESS — workbench-tauri v0.8

## Phase별 진행

### Phase 1 — v0.8 시작, 미리보기 공통과 CSV·TSV 표

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: workspace `wY`(workbench-tauri)에 탭 넷을 에이전트 이름으로 두고(`wY:t1` tauri-leader, `wY:t2` tauri-writer, `wY:t3` tauri-coder, `wY:t4` tauri-checker) 서브 에이전트 셋(`tauri-writer` `wY:p2`, `tauri-coder` `wY:p3`, `tauri-checker` `wY:p4`)을 `HERDR-SETUP.md` 1장 명령으로 띄웠다. control은 `wY:p1`이다.
  - 결과: worktree 없음. `herdr agent list`·`herdr tab list` 근거는 ORDER-01 보고에 붙인다(tauri-leader).
  - 검증: 모델·effort는 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.8 문서와 루트 AGENTS.md** (2026-11-10, 진행 중)
  - 무엇을 했나: `specs/v0.8/`에 PLAN(core I-n 대응)·HERDR-SETUP·PROGRESS를 상태 "초안"으로 쓰고, `reports/`·`verify/` 폴더(`.gitkeep`)를 만들었다(ORDER-01 3.1). 루트 `AGENTS.md`의 레포 규칙 절 아래에서 제목 `(v0.8)`, 0장 경로, 카드 파일 이름 `v08-`, 1장 현재 상태("v0.8 진행 중"), 3장 core 리더 이름(`leader-core`), 3A.4·8장의 `specs/v0.8/verify` 경로를 고쳤다.
  - 결과: HERDR-SETUP은 v0.7판에서 레이아웃(`wY`, 탭 이름 = 에이전트 이름), 카드·보고 파일 이름(`v08-`), 경로, core 리더 이름(`leader-core`), core 근거(core v0.8 `orders/COMMON.md`)만 바꾸고 구성은 그대로다. 레포 규칙 절의 문장은 그대로다.
  - 검증: V0. 문서만 바뀌어 `git grep` 하나만 실행했다(W-01 보고).
  - 특이사항: 없음.
- **K-01 미리보기 공통·I-10·I-7·버전 0.8.0** (2026-11-10, 진행 중)
