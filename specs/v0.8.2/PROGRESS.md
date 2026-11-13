> 버전: v0.8.2 · 작성일: 2026-11-13 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. core I-n ↔ Phase ↔ tauri 카드 대응은 `ITEMS-MAP.md`에, 요구와 판정 방법은 core `specs/v0.8.2/ITEMS.md`와 카드 4절에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.8.2/reports/`에 있다.

# PROGRESS — workbench-tauri v0.8.2

## Phase별 진행

### Phase 1 — ORDER-01 (I-26·I-12): v0.8.2 시작, 기본 글자 크기 14px, 탭 스크롤 위치 기억

- **에이전트 환경** (2026-11-13, leader-core)
  - 무엇을 했나: v0.8.1 끝 구성을 그대로 쓴다(사용자 2026-11-13 "v0.8.1 구성 그대로", core ORDER-01 3.1). 새로 띄우지 않았고 모델도 그대로다. w0:p1의 herdr 이름이 비어 있어 leader-core가 `tauri-leader`로 다시 붙였다.
  - 결과: workspace `w0`, 탭 넷(`tauri-leader`·`tauri-writer`·`tauri-coder`·`tauri-checker`), worktree 없음. `herdr agent list`·`herdr tab list --workspace w0` 근거는 ORDER-01 보고에 붙인다(tauri-leader).
  - 검증: 모델·effort는 `HERDR-SETUP.md` 1장 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.8.2 시작 문서와 루트 AGENTS.md** (2026-11-13, writer)
  - 무엇을 했나: `specs/v0.8.2/`에 HERDR-SETUP(v0.8.1판에서 버전·경로·날짜, 카드·보고 앞붙이 `v082-`, 보안 설정 예외(core COMMON 3절: Phase 3 본문 HTML 정화 규칙, Phase 6·7 HTML 미리보기 프레임), 0장 leader-core 패널·이름 다시 붙임)·ITEMS-MAP(core I-1~I-26 ↔ 그룹 ↔ core Phase ↔ tauri 카드, I-4·I-5 거둠)·PROGRESS를 상태 "초안"으로 쓰고 `reports/`·`verify/`(`.gitkeep`)를 만들었다(ORDER-01 3.1). 루트 `AGENTS.md`의 제목 `(v0.8.2)`, 1장 현재 상태, 0장 경로, 카드·보고 앞붙이 `v082-`, "core ITEMS 우선"(v0.8.2, I-1~I-26, I-4·I-5 거둠)·"HERDR 구성은 core가 정한다"(근거 core v0.8.2 ORDER-01 3.1) 근거 표기, 3A.4·8장 verify 경로를 고쳤다. 규칙 자체는 그대로다.
  - 결과: v0.8.2에는 tauri PLAN을 두지 않고 ITEMS-MAP이 Phase 대응을 맡는다(core PLAN이 Phase를 정함). v0.8.1 HERDR-SETUP의 "커밋되지 않은 `README.md` 수정" 문장은 작업 폴더가 깨끗해 뺐다. 루트 `AGENTS.md` 0장 2번은 `PLAN.md` 대신 `ITEMS-MAP.md`를 가리킨다.
  - 검증: V0. `git grep -n "v0\.8\.1\|v081" -- AGENTS.md`에 남은 것은 10행(checker 모델을 v0.8.1에서 바꾼 기록, "v0.8.1 구성 그대로" 인용)·42행(v0.8.1 종료) — 지난 버전 사실 기록뿐이다(보고 `C:\Users\nampl\AppData\Local\Temp\v082-W-01-report.md`).
  - 특이사항: 없음.
