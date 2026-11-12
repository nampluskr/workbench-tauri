> 버전: v0.8.1 · 작성일: 2026-11-13 · 상태: 초안
>
> workbench-core v0.8.1 ITEMS의 I-1~I-13을 어떤 Phase 순서로 반영할지 적는 I-n 대응 문서다. v0.8.1은 INTENT·DECISIONS·SPEC을 쓰지 않는다(core ITEMS 머리말). 요구·결정·판정 방법은 core `specs/v0.8.1/ITEMS.md`의 "정한 것"과 각 카드의 "완료 기준"을, Phase 순서와 이유는 core `specs/v0.8.1/PLAN.md`를, 카드 공통 규칙은 core `specs/v0.8.1/orders/COMMON.md`를 따른다. v0.8 ITEMS 공통 결정 M-1~M-13은 v0.8.1 항목이 바꾸지 않는 한 그대로다(core COMMON 2절). 에이전트 운영은 `HERDR-SETUP.md`에, 실제 진행은 `PROGRESS.md`에, core 보고는 `specs/v0.8.1/reports/`에 있다.

# PLAN — workbench-tauri v0.8.1

## 읽는 법

- 요구 번호는 따로 매기지 않는다. core ITEMS의 `I-n`을 그대로 쓴다(R-n 없음). `G-n`은 core ITEMS의 그룹이다.
- 이 레포의 Phase 번호는 core Phase 번호와 같다. Phase n은 core 카드 `ORDER-<nn>`(두 자리)을 받아 진행하고, 같은 Phase 안의 재지시는 `ORDER-<nn>-R<n>`이다.
- 판정 방법은 core ITEMS와 카드 4절 그대로이고 여기에 옮기지 않는다.
- 한 Phase 안의 작업 카드 나눔은 `tauri-leader`가 정한다.

## Phase 대응 표

| 이 레포 Phase | core Phase (카드) | 그룹 | core 항목 |
|---|---|---|---|
| Phase 1 — v0.8.1 시작, 트리 이름 입력 글자 크기와 트리 글자색 | Phase 1 (ORDER-01) | G-1 | v0.8.1 시작(앱 버전 0.8.1) · I-1 · I-2 |
| Phase 2 — 트리 드래그 앤 드롭 | Phase 2 (ORDER-02) | G-1 | I-3 |
| Phase 3 — 탭: Lock Preview 임시 탭, Search 탭 여러 개, 마지막 탭 잘림 | Phase 3 (ORDER-03) | G-3 | I-5 · I-6 · I-13 |
| Phase 4 — Outline 사이드 바 | Phase 4 (ORDER-04) | G-2 | I-4 |
| Phase 5 — 코드 글꼴·크기, 코드 블록 음영, 머리 줄, Licenses | Phase 5 (ORDER-05) | G-5 | I-10 · I-11 · I-12 |
| Phase 6 — 미리보기 제목·목록 간격, 미리보기 찾기 | Phase 6 (ORDER-06) | G-4 | I-8 · I-9 |
| Phase 7 — HTML 미리보기 스크립트 실행, 0.8.1 release 빌드·README | Phase 7 (ORDER-07) | G-4 | I-7 · 0.8.1 빌드·`docs/BUILD.md`·README 실행 절 |

- 보안 설정(CSP·asset protocol·capability·sandbox)은 Phase 1~6에서 바꾸지 않는다. Phase 7에서만 바꾼다(core PLAN, core COMMON 3절).
- 사용자 확인은 Phase 7 뒤 한 번이다(core PLAN). tauri는 V4를 하지 않는다.

### Phase 1 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| W-01 | v0.8.1 문서(PLAN·HERDR-SETUP·PROGRESS, `reports/`·`verify/`)와 루트 `AGENTS.md` 버전·참조, herdr 구성 | v0.8.1 시작 |
| K-01 | 앱 버전 0.8.1, I-1 트리 이름 입력 글자 크기, I-2 트리 이름 글자색 | v0.8.1 시작 · I-1 · I-2 |
| C-01 | 검토 | v0.8.1 시작 · I-1 · I-2 |
| K-01-R1 | I-2 글자색 조건을 marked·활성 파일 행으로 좁힘(커서만 선택한 행은 muted) | I-2 |
| C-02 | V3 판정 | v0.8.1 시작 · I-1 · I-2 |
| K-01-R2 | 입력칸 `editor.foreground`를 트리 행 안으로만, Sidebar 입력은 `--text` 그대로 | I-1 · I-2 |
| W-02 | PROGRESS(ORDER-01 기록)·PLAN(이 표) | ORDER-01 |

### Phase 2 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| K-02 | 트리 드래그 구현: 트리 안 옮기기(여러 개, 놓을 곳 표시, 덮어쓰지 않음, Ctrl 복사, 머물면 펼침, 가장자리 스크롤), pane에 놓아 열기(R-10), 탐색기에서 복사 | I-3 |
| C-03 | 검토 | I-3 |
| K-02b | 트리 드래그 되돌리기(`project_panel::Undo`/`Redo`), leader-core 결정 | I-3 |
| K-02-R1 | C-03 F-1(탭 위 놓기 자리)·F-2(가장자리 스크롤 중 놓을 곳 다시 계산)·F-3(`pointerup` 없이 끝난 끌기) | I-3 |
| C-04 | 검토·V3 판정 | I-3 |
| K-02-R2 | C-04 권고 R-1(휴지통 항목 찾기 경로 비교)·R-2(`existed`를 소스 탭만으로) | I-3 |
| W-03 | PROGRESS(ORDER-02 기록)·PLAN(이 표) | ORDER-02 |
