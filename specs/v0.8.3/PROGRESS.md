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
  - 검증: V0. `git grep` 결과는 보고 `C:\Users\nampl\AppData\Local\Temp\v083-W-01-report.md`. 커밋은 tauri-leader.
  - 특이사항: 없음.
- **K-01 앱 버전 0.8.3·I-2·I-13·I-15 (ORDER-01)** (coder)
  - 무엇을 했나:
  - 결과:
  - 검증:
  - 특이사항:
- **C-01 checker 리뷰(K-01)** (checker)
  - 무엇을 했나:
  - 결과:
  - 검증:
  - 특이사항:
