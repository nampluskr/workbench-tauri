> 버전: v0.1 · 작성일: 2026-11-05 · 상태: 진행 중
>
> 실제로 한 일과 검증 결과를 기록한다. 계획은 `PLAN.md`에, 설계 결정은 `DECISIONS.md`에 있다. 기존 기록은 지우지 않고 뒤에 더한다. 이전 PoC의 기록은 태그 `legacy-v0.1-poc`(9f83f8d)에만 있다.

# PROGRESS — workbench-tauri v0.1

## Phase별 진행

### Phase 0 — 프로젝트 뼈대

없음.

### Phase 1 — 프레임워크·편집기 기반 PoC

없음.

### Phase 2 — 창·단위·테마·키맵 기반

없음.

### Phase 3 — 문법 WASM 로드 PoC와 P0 정리

없음.

## 사용자 요청 작업

### W-1 이전 PoC 보관과 삭제 (2026-11-04)

- 요청: v0.1을 같은 범위로 처음부터 다시 쓴다. 이전 PoC는 태그로만 남긴다.
- 조치
  - 태그 `legacy-v0.1-poc`를 9f83f8d에 달았다.
  - 이전 코드와 문서 253개 파일을 지웠다(커밋 e35eb6a).
- 결과: 남은 파일은 `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `INTENT.md`, `LICENSE` 다섯 개다.
- 검증: 커밋 통계가 253 files changed, 30291 deletions다. 태그가 9f83f8d를 가리킨다(`git rev-parse`).
- 상태: 완료.

### W-2 workbench-gpui 자산 들여오기 (2026-11-04)

- 요청: workbench-gpui의 `spec/`(수치 스펙)과 `docs/refs/`(Zed 명세)를 그대로 들여온다.
- 조치: gpui 자산 12개를 복사하고 `.gitignore`를 한 줄 고쳤다(커밋 616cda5).
  - `spec/` 셋
  - `docs/refs/01-zed/` 넷
  - `docs/refs/03-tauri/README.md`
  - `docs/refs/04-COMPARISON.md`
  - `docs/refs/README.md`
  - 기준 화면 PNG 둘
- 결과
  - `spec/`의 원본은 workbench-gpui로 둔다(D-1).
  - `docs/refs/README.md`의 `02-gpui/` 링크는 이 레포에서 끊겨 있다. `AGENTS.md`는 gpui 레포 경로로 참조한다.
- 검증: 복사한 12개 파일의 해시가 gpui 원본과 일치했다.
- 상태: 완료.

### W-3 루트 AGENTS.md 다시 쓰기와 INTENT 원칙 추가 (2026-11-04)

- 요청: 루트 `AGENTS.md`를 v0.1 재작성에 맞게 다시 쓰고, 루트 `INTENT.md`에 ponytail 원칙 두 줄을 더한다.
- 조치
  - `AGENTS.md`의 레포 규칙과 "에이전트 공통 지침" 0·1·2·3·3A·4·5·8·9장을 다시 썼다.
  - V2는 사용자 결정으로 되살렸다. 예외 조건은 조작 없는 1회 덤프다.
  - `INTENT.md`의 "변하지 않는 원칙"에 두 줄을 더했다.
  - 고친 차례: W-3, W-3-R1, W-3-R2.
- 결과: 커밋 b3f6d6d.
- 검증
  - `check` C-1은 REWORK였다(지적 10건). W-3-R1·R2로 고쳤다.
  - C-2는 PASS였다(10건 모두 해소, 새 문제 없음).
- 상태: 완료.

### W-4a 버전 INTENT (2026-11-04)

- 요청: `specs/v0.1/INTENT.md`를 쓴다.
- 조치
  - 초안을 썼다.
  - W-4a-R1에서 사용자 답을 반영했다: E-032 판정 제외, Markdown·JSON 판정 포함, 제외 셋 확정, 줄 수 비교 대상.
- 결과: 확정, 커밋 5708518.
- 검증
  - C-3은 REWORK였다(지적 3건: 제외 범위의 미정 문장, E-032 위치, R-19 범위).
  - C-4는 PASS였다(3건 해소).
- 상태: 완료.

### W-4b 버전 DECISIONS (2026-11-04)

- 요청: `specs/v0.1/DECISIONS.md`를 쓴다. 이전 D-1~D-16을 골라 새 번호로 다시 쓰고, 2026-11-04 사용자 결정을 넣는다.
- 조치
  - D-1~D-19를 썼다.
  - 이전 결정은 9개를 그대로 잇고, 4개를 고쳐 잇고, 3개를 버렸다.
  - W-4b-R1에서 미결 넷을 반영했다: 확장 루트 하나, cargo 정션 테스트, E-032 관찰값 기록 안 함, 이전 D-1·D-2 버림.
  - C-5 권고대로 "이전 결정 처리 표"를 "미결 사항" 앞으로 옮겼다.
- 결과: 확정, 커밋 c9eec6f.
- 검증: C-5는 PASS였다. 권고 1건(절 순서)은 반영했다.
- 상태: 완료.

### W-4c 버전 SPEC (2026-11-05)

- 요청: `specs/v0.1/SPEC.md`를 쓴다. 수치는 toml ID로만 적고, 측정 전용 코드에 기대는 판정은 쓰지 않는다.
- 조치
  - R-1~R-12를 썼다.
  - W-4c-R1에서 사용자 답을 반영했다.
    - 판정 제외: L-84 닫기 버튼 색, 테마 전환 시간, 10MB 장식 갱신 시간
    - V2 시작 상태를 요구로 둠
    - V3 대조 창 논리 1440x852
    - V1 프런트엔드 테스트 `node --test`
- 결과: 확정, 커밋 1fb6cde.
- 검증: C-6은 PASS였다(지적 없음).
- 상태: 완료.

### W-4d 버전 PLAN (2026-11-05)

- 요청: `specs/v0.1/PLAN.md`를 쓴다. 이전 PLAN의 Phase 나눔을 참고하되 ponytail로 줄인다.
- 조치
  - Phase 0~3과 진행 현황 표를 썼다.
  - W-4d-R1에서 사용자 답을 반영했다: Markdown·JSON 설치는 Phase 3 전, 미해결 실패 규칙 유지, 담당 이름은 HERDR-SETUP에서, CSP 세 항목은 Phase 3, 커밋은 Phase 끝 1회.
- 결과: 확정, 커밋 1a15baa.
- 검증: C-7은 PASS였다(지적 없음).
- 상태: 완료.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
