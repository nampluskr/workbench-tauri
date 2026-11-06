> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 초안
>
> R-1~R-23을 어떤 Phase 순서로 만족시킬지 적는다. Phase는 workbench-core v0.5 `PLAN.md`의 Phase와 번호를 같게 둔다. 요구와 판정 방법은 `SPEC.md`에, 결정은 `DECISIONS.md`와 core `DECISIONS.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, 실제 진행은 `PROGRESS.md`에 있다.

# PLAN — workbench-tauri v0.5

## 읽는 법과 이 순서에 걸린 규칙

**번호 표기**

- `R-n`은 이 레포 `SPEC.md`의 요구이고, 번호는 core ITEMS의 `I-n`과 같다(R-1 = I-1).
- `D-n`은 이 레포 `DECISIONS.md`의 결정(v0.5에는 없음), `core D-n`은 workbench-core `specs/v0.5/DECISIONS.md`의 결정이다. `G-n`은 core ITEMS의 그룹이다.
- 이 레포의 Phase 번호는 core Phase 번호와 같다. Phase n은 core 카드 `ORDER-<n>`(두 자리)을 받아 진행한다.
- 수치는 `spec/zed-metrics.toml`의 항목 ID로만 적는다(루트 `AGENTS.md` 3장).

**Phase 순서의 이유**

- 순서는 core PLAN을 그대로 따른다. 이유는 core PLAN "Phase 순서의 이유"에 있다(창 크기가 모든 비교의 조건, 글꼴이 글자 폭을 바꿈, 아이콘·메뉴가 테마 선택보다 먼저, 구문 강조가 맨 끝).
- 갈래 Phase를 더 나누지 않는다. 한 Phase 안의 작업 카드 나눔은 leader가 정한다.

**대응 표**

| 이 레포 Phase | core Phase (카드) | 그룹 | 요구 |
|---|---|---|---|
| Phase 1 — 갈래 준비 | Phase 1 (ORDER-01) | 없음 | 없음 |
| Phase 2 — 창 | Phase 2 (ORDER-02) | G-5 | R-6 (I-6) |
| Phase 3 — 편집 영역과 글꼴 | Phase 3 (ORDER-03) | G-6 | R-7 · R-8 · R-9 · R-13 · R-14 (I-7 · I-8 · I-9 · I-13 · I-14) |
| Phase 4 — 글자 표시 | Phase 4 (ORDER-04) | G-8 | R-20 (I-20) |
| Phase 5 — 아이콘 모양 | Phase 5 (ORDER-05) | G-1 | R-1 · R-18 (I-1 · I-18) |
| Phase 6 — 타이틀 바 메뉴 | Phase 6 (ORDER-06) | G-2 | R-2 · R-17 (I-2 · I-17) |
| Phase 7 — 테마·아이콘 테마 | Phase 7 (ORDER-07) | G-3 | R-3 · R-4 (I-3 · I-4) |
| Phase 8 — 상태 바 | Phase 8 (ORDER-08) | G-4 | R-5 · R-19 · R-22 (I-5 · I-19 · I-22) |
| Phase 9 — 탭 바와 편집 영역 상단 | Phase 9 (ORDER-09) | G-7 | R-10 · R-11 · R-12 · R-16 · R-23 (I-10 · I-11 · I-12 · I-16 · I-23) |
| Phase 10 — 폴더 보기 패널 | Phase 10 (ORDER-10) | G-9 | R-21 (I-21) |
| Phase 11 — 구문 강조 | Phase 11 (ORDER-11) | G-10 | R-15 (I-15) |
| Phase 12 — 사용자 일괄 확인 | Phase 12 (ORDER-12) | 없음 | V4가 있는 R-14 · R-15, v0.4 V4 목록 |

R-1~R-23은 모두 위 표의 한 Phase에 대응한다.

**모든 Phase에 걸리는 규칙**

- 시작: core-leader가 보낸 `ORDER-<n>` 카드를 받은 뒤에만 그 Phase를 시작한다(core D-3).
- 카드: leader가 서브 에이전트 카드를 쓰고 검증 수준을 지정한다(루트 `AGENTS.md` 3A, `HERDR-SETUP.md` 5장).
- 화면: V2·V3와 배율 변경은 core-leader의 `[SCREEN-OK]`를 받은 뒤에만 한다(core D-1·D-4).
- 공통 전제와 다르면 혼자 맞추지 않고 `[BLOCKED]`로 보고한다(core D-3).
- 의존성 추가·변경, CSP·capability 완화는 승인을 받는다(루트 `AGENTS.md` 9장).
- Phase 끝 순서
  1. checker가 diff를 검토하고 카드 검증 수준만큼 빌드·테스트를 하며, V3 대상이면 화면 차례를 받아 측정해 `specs/v0.5/verify/`에 남긴다.
  2. writer가 `PROGRESS.md`에 무엇을·결과·검증을 기록하고, 측정으로 판단할 수 없는 항목을 V4 목록에 쌓는다.
  3. leader가 `specs/v0.5/reports/ORDER-<n>.md`를 쓰고 core-leader에게 경로를 보낸다.
  4. leader가 커밋한다. push는 core-leader 판정 뒤 사용자가 정한다(ORDER-01 7장).
- Phase를 마치는 조건: 대응 R-n마다 SPEC 판정 방법대로 충족이거나, 충족하지 못한 이유가 PROGRESS에 있다(core PLAN "넘어가는 조건").

---

## Phase 1 — 갈래 준비

**목적** — v0.4를 닫고, v0.5 문서를 쓰고, core D-2의 서브 에이전트 환경을 꾸린다.

**대응** — 요구 없음 · core D-2 · core D-3 · core D-7 · core D-11

**완료 조건**
- `specs/v0.4/PROGRESS.md` "버전 종료"에 사용자 판단이 있고, 그 커밋에 태그 `v0.4`가 있다(ORDER-01 3.0).
- `specs/v0.5/`에 INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP·PROGRESS가 있다.
- `tauri-writer`·`tauri-coder`·`tauri-checker`가 떠 있고 탭 배치가 control·docs·impl·check다.
- `specs/v0.5/reports/ORDER-01.md`가 있다.

---

## Phase 2 — 창

**목적** — 앱이 1440×852로 작업 영역 가운데에 열리게 해서 뒤 Phase의 Zed 비교 조건을 맞춘다.

**대응** — R-6

**완료 조건**
- R-6이 SPEC 판정 방법대로 충족이다.

---

## Phase 3 — 편집 영역과 글꼴

**목적** — 글꼴을 Zed와 같게 하고, 편집 영역의 경계, 줄바꿈, 스크롤바, 현재 줄 강조를 Zed와 같게 한다.

**대응** — R-7 · R-8 · R-9 · R-13 · R-14 · core D-10

**완료 조건**
- R-14를 먼저 끝낸다. core D-10의 글꼴 파일과 라이선스 파일이 커밋되어 있고, 버전과 넣은 굵기·스타일이 `DECISIONS.md`에 있다.
- R-7, R-8, R-9, R-13, R-14가 SPEC 판정 방법대로 충족이다.

---

## Phase 4 — 글자 표시

**목적** — 경로의 역슬래시가 `\`로 보이게 한다.

**대응** — R-20

**완료 조건**
- R-20이 SPEC 판정 방법대로 충족이다. tauri는 지금도 파일 트리에서 `\`로 보이므로, Phase 3 글꼴 변경 뒤 그대로인지를 보고에 적는다.

---

## Phase 5 — 아이콘 모양

**목적** — UI 아이콘을 Zed 원본으로 바꾸고, 상태 바 왼쪽 버튼 아이콘을 Zed와 같게 한다.

**대응** — R-1 · R-18 · core D-9

**완료 조건**
- `DECISIONS.md`에 core D-9의 복사 출처 커밋, `.gitignore` 폴더 경로, 복사본이 없을 때의 모습, 다시 채우는 방법이 있다.
- R-1, R-18이 SPEC 판정 방법대로 충족이다.

---

## Phase 6 — 타이틀 바 메뉴

**목적** — "v" 메뉴를 만들어 동작하게 하고, `≡` 메뉴를 Zed 순서로 두 갈래 같게 맞춘다.

**대응** — R-2 · R-17

**완료 조건**
- R-2, R-17이 SPEC 판정 방법대로 충족이다.
- R-2의 Themes·Icon Themes가 Phase 7 전까지 무엇을 하는지 보고에 있다.

---

## Phase 7 — 테마·아이콘 테마

**목적** — Zed의 테마와 아이콘 테마를 골라 쓸 수 있게 한다.

**대응** — R-3 · R-4 · core D-8

**완료 조건**
- `DECISIONS.md`에 core D-8의 복사 대상, 출처, `.gitignore` 폴더 경로, 다시 채우는 방법이 있다.
- R-3, R-4가 SPEC 판정 방법대로 충족이다.
- R-2의 Themes·Icon Themes가 이 선택 화면을 연다.

---

## Phase 8 — 상태 바

**목적** — 상태 바에 위치와 파일 형식을 보이고, 왼쪽 버튼의 구성과 켜짐 표시를 Zed와 같게 한다.

**대응** — R-5 · R-19 · R-22

**완료 조건**
- R-5, R-19, R-22가 SPEC 판정 방법대로 충족이다.
- 열린 탭이 없을 때의 Zed 상태 바 표시(R-5)가 보고에 있다.
- 진단(R-22, I-22)은 범위에서 빼지 않는다. 지금 이 레포에 프로젝트 검색과 진단(언어 서버) 기능이 없어 구현이 막히면, 이 Phase에서 그때 `[BLOCKED]`로 이유를 보고와 PROGRESS에 남긴다(core D-12, ORDER-01-R1 3장 5).

---

## Phase 9 — 탭 바와 편집 영역 상단

**목적** — 뒤로·앞으로 버튼, 탭 툴팁, 탭 넘침, 탭 바 오른쪽 버튼, 경로 줄을 Zed와 같게 한다.

**대응** — R-10 · R-11 · R-12 · R-16 · R-23

**완료 조건**
- R-10, R-11, R-12, R-16, R-23이 SPEC 판정 방법대로 충족이다.
- 코드 파일에서 Zed 경로 줄이 보이는 내용(R-12)이 보고에 있다.

---

## Phase 10 — 폴더 보기 패널

**목적** — 폴더 보기 패널의 폭, 간격, 선택 표시를 Zed 사이드바와 같게 한다.

**대응** — R-21

**완료 조건**
- R-21이 SPEC 판정 방법대로 충족이다.

---

## Phase 11 — 구문 강조

**목적** — Zed가 지원하는 파일 형식 전체에 구문 강조를 한다.

**대응** — R-15

**완료 조건**
- 보고에 Zed가 지원하는 파일 형식 목록과 형식별 결과 표가 있다.
- R-15가 SPEC 판정 방법대로 충족이다.

---

## Phase 12 — 사용자 일괄 확인

**목적** — 측정으로 판단할 수 없는 시각 품질(V4)을 사용자가 확인한다. v0.4에서 넘긴 V4 목록도 함께 본다.

**대응** — V4가 있는 R-14 · R-15, 사용자가 다시 보기를 원하는 R-n, `specs/v0.4/PROGRESS.md` "V4 사용자 확인 목록"

**완료 조건**
- 사용자 판단이 `PROGRESS.md`에 있다.
- 고칠 것으로 지적된 항목이 core에 새 항목으로 넘어갔거나, 다음 버전으로 넘긴다는 판단이 PROGRESS "버전 종료"에 있다.

---

## 진행 현황

| Phase | 대응 R | 상태 | 커밋 | 비고 |
| --- | --- | --- | --- | --- |
| Phase 1 — 갈래 준비 | 없음 | doing | - | 없음 |
| Phase 2 — 창 | R-6 | todo | - | 없음 |
| Phase 3 — 편집 영역과 글꼴 | R-7 · R-8 · R-9 · R-13 · R-14 | todo | - | 없음 |
| Phase 4 — 글자 표시 | R-20 | todo | - | 없음 |
| Phase 5 — 아이콘 모양 | R-1 · R-18 | todo | - | 없음 |
| Phase 6 — 타이틀 바 메뉴 | R-2 · R-17 | todo | - | 없음 |
| Phase 7 — 테마·아이콘 테마 | R-3 · R-4 | todo | - | 없음 |
| Phase 8 — 상태 바 | R-5 · R-19 · R-22 | todo | - | 없음 |
| Phase 9 — 탭 바와 편집 영역 상단 | R-10 · R-11 · R-12 · R-16 · R-23 | todo | - | 없음 |
| Phase 10 — 폴더 보기 패널 | R-21 | todo | - | 없음 |
| Phase 11 — 구문 강조 | R-15 | todo | - | 없음 |
| Phase 12 — 사용자 일괄 확인 | V4 | todo | - | 없음 |

- 상태: todo | doing | done
