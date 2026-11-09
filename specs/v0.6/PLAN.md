> 버전: v0.6 · 작성일: 2026-11-10 · 상태: 초안
>
> R-1~R-20을 어떤 Phase 순서로 만족시킬지 적는다. Phase는 workbench-core v0.6 `PLAN.md`의 Phase와 번호를 같게 둔다. 요구와 판정 방법은 `SPEC.md`에, 결정은 `DECISIONS.md`와 core `DECISIONS.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, 실제 진행은 `PROGRESS.md`에 있다.

# PLAN — workbench-tauri v0.6

## 읽는 법과 이 순서에 걸린 규칙

**번호 표기**

- `R-n`은 이 레포 `SPEC.md`의 요구이고, 번호는 core ITEMS의 `I-n`과 같다(R-1 = I-1).
- `D-n`은 이 레포 `DECISIONS.md`의 결정(지금은 없음), `core D-n`은 workbench-core `specs/v0.6/DECISIONS.md`의 결정이다. `G-n`은 core ITEMS의 그룹이다.
- 이 레포의 Phase 번호는 core Phase 번호와 같다. Phase n은 core 카드 `ORDER-<nn>`(두 자리)을 받아 진행한다. 같은 Phase 안의 재지시는 `ORDER-<nn>-R<n>`이다.
- 수치는 `spec/zed-metrics.toml`의 항목 ID로만 적는다(루트 `AGENTS.md` 3장).

**Phase 순서의 이유**

- 순서는 core PLAN을 그대로 따른다. 이유는 core PLAN "Phase 순서의 이유"에 있다(기능 축소가 먼저, 배포는 축소 뒤, 문서 안 찾기는 내용 검색을 없앤 뒤, 미리보기 버튼은 진단 버튼을 없앤 뒤).
- 이 레포가 Phase를 더 나누지 않는다. 한 Phase 안의 작업 카드 나눔은 `tauri-leader`가 정한다.
- Phase 11 이후는 미정이다(core PLAN). core가 Phase를 더하면 이 표에 더한다.

**대응 표**

| 이 레포 Phase | core Phase (카드) | 그룹 | 요구 |
|---|---|---|---|
| Phase 1 — tauri 준비 | Phase 1 (ORDER-01) | 없음 | 없음 |
| Phase 2 — 기능 축소 | Phase 2 (ORDER-02) | G-2 | R-4 · R-5 · R-6 · R-7 (I-4 · I-5 · I-6 · I-7) |
| Phase 3 — 배포 | Phase 3 (ORDER-03) | G-1 | R-1 · R-2 · R-3 (I-1 · I-2 · I-3) |
| Phase 4 — 스크롤바 | Phase 4 (ORDER-04) | G-3 | R-8 (I-8) |
| Phase 5 — 탭 바와 편집 영역 상단 | Phase 5 (ORDER-05) | G-4 | R-9 · R-12 · R-16 (I-9 · I-12 · I-16) |
| Phase 6 — Sidebar | Phase 6 (ORDER-06) | G-5 | R-10 · R-11 · R-19 (I-10 · I-11 · I-19) |
| Phase 7 — Left Dock 트리 | Phase 7 (ORDER-07) | G-6 | R-13 (I-13) |
| Phase 8 — 타이틀 바 메뉴 | Phase 8 (ORDER-08) | G-7 | R-14 · R-15 · R-20 (I-14 · I-15 · I-20) |
| Phase 9 — 문서 편집 기본 기능 | Phase 9 (ORDER-09) | G-8 | R-17 (I-17) |
| Phase 10 — 상태 바 미리보기 버튼 | Phase 10 (ORDER-10) | G-9 | R-18 (I-18) |

R-1~R-20은 모두 위 표의 한 Phase에 대응한다. 사용자가 확인하며 그룹에 더한 항목(core ITEMS 새 I-n)은 같은 Phase의 R-n으로 더한다.

**모든 Phase에 걸리는 규칙**

- 진행(core D-5)
  - 한 번에 Phase 하나만 진행한다.
  - core-leader가 보낸 `ORDER-<nn>` 카드를 받은 뒤에만 그 Phase를 시작한다. 보고를 보낸 뒤에는 다음 카드를 기다리고, 다음 Phase를 스스로 시작하지 않는다.
  - 사용자가 그 Phase를 마무리한다는 판단이 core PROGRESS에 있어야 다음 Phase 카드를 받는다.
  - 사용자가 추가 수정을 요청하면 같은 Phase의 `ORDER-<nn>-R<n>`으로 온다.
- 카드: leader가 서브 에이전트 카드를 쓰고 검증 수준을 지정한다(루트 `AGENTS.md` 3A, `HERDR-SETUP.md` 5장).
- 화면: V2·V3와 배율 변경은 core-leader의 `[SCREEN-OK]`를 받은 뒤에만 한다(core D-2, `HERDR-SETUP.md` 5.3).
- 전제와 다르거나 구현할 수 없으면 혼자 맞추지 않고 `[BLOCKED]`로 보고한다(core PLAN 판정).
- 의존성 추가·변경, CSP·capability 완화는 승인을 받는다(루트 `AGENTS.md` 9장).
- Phase 끝 순서
  1. checker가 diff를 검토하고 카드 검증 수준만큼 빌드·테스트를 하며, V3 대상이면 화면 차례를 받아 측정해 `specs/v0.6/verify/`에 남긴다.
  2. writer가 `PROGRESS.md`에 무엇을·결과·검증을 기록한다.
  3. leader가 `specs/v0.6/reports/ORDER-<nn>.md`를 쓰고 core-leader에게 경로를 보낸다.
  4. leader가 커밋한다. push는 core-leader 판정 뒤 사용자가 정한다.
- Phase를 마치는 조건: 대응 R-n마다 SPEC 판정 방법대로 충족이거나 충족하지 못한 이유가 PROGRESS에 있고, 사용자가 그 Phase를 마무리한다고 판단했다(core D-5).

**구현 원칙 (core D-8) — 모든 Phase, 모든 카드에 걸린다**

- 항목을 다 만족하는 가장 작은 변경을 고른다. 항목에 없는 기능·옵션·설정·추상화는 더하지 않는다.
- 지우는 것이 더하는 것보다 낫다. 없애는 항목(G-2 등)은 화면만 숨기지 않고 코드·키맵·의존성까지 지운다.
- 이미 레포에 있는 코드·부품·의존성을 먼저 쓰고, 몇 줄로 되는 일에 새 의존성을 더하지 않는다.
- 새로 만든 로직(검색 맞추기, 찾기·바꾸기, 순서 바꾸기 등)에는 작은 테스트를 하나 남긴다.
- 고치는 곳이 닿는 호출부·테스트를 함께 맞춘다. 작게 고친다는 이유로 일을 덜 끝내지 않는다.
- 항목이 바꾸라고 하지 않은 지금 동작은 그대로 둔다. 특히 마크다운 편집 탭과 미리보기 탭 사이의 위치 연계와 표시는 유지한다(ITEMS I-18).
- 보고에는 무엇을 지웠고 무엇을 더했는지, 하지 않은 것과 남은 위험을 한두 줄로 적는다.

---

## Phase 1 — tauri 준비

**목적** — v0.6 문서를 쓰고, core D-4의 에이전트 환경을 꾸려 Phase 2 이후 카드를 받을 준비를 한다.

**대응** — 요구 없음 · core D-1 · core D-2 · core D-4 · core D-5 · core D-8

**완료 조건**
- `specs/v0.6/`에 INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP·PROGRESS가 있다.
- `tauri-writer`·`tauri-coder`·`tauri-checker`가 이름을 붙여 떠 있고 탭 배치가 control·docs·impl·check다.
- `specs/v0.6/reports/ORDER-01.md`가 있다.
- 사용자가 Phase 1을 마무리한다고 판단했다(core PROGRESS).

---

## Phase 2 — 기능 축소

**목적** — 언어 서버를 쓰지 않고, Project Search를 이름 검색 "Search"로 바꾸고, Diagnostics를 없애고, 테마 받기·추가를 없앤다.

**대응** — R-4 · R-5 · R-6 · R-7 · core D-6 · core D-8

**완료 조건**
- R-4·R-5·R-6·R-7이 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 확인하며 더한 축소 항목도 같은 Phase에서 충족되었다.
- 사용자가 Phase 2를 마무리한다고 판단했다.

---

## Phase 3 — 배포

**목적** — 코드 서명 없음과 경고 넘기는 법, 설치 파일 버전 `0.6.0`, 개인 용도와 Licenses 확인을 정리한다.

**대응** — R-1 · R-2 · R-3

**완료 조건**
- R-1·R-2·R-3이 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 Phase 3을 마무리한다고 판단했다.

---

## Phase 4 — 스크롤바

**목적** — 모든 스크롤바를 gpui 기준의 테마 색·두께·모양으로 한꺼번에 같게 한다.

**대응** — R-8 · core D-1(gpui는 읽기·측정만)

**완료 조건**
- R-8이 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 Phase 4를 마무리한다고 판단했다.

---

## Phase 5 — 탭 바와 편집 영역 상단

**목적** — 탭 오른쪽 클릭 메뉴를 Zed와 같게 하고, 뒤로·앞으로가 탭 사이를 오가게 하며, 경로 줄을 모든 파일에서 상대 경로만 보이게 한다.

**대응** — R-9 · R-12 · R-16 · core D-6

**완료 조건**
- R-9·R-12·R-16이 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 Phase 5를 마무리한다고 판단했다.

---

## Phase 6 — Sidebar

**목적** — Sidebar 폴더 항목 메뉴를 Rename 하나로 줄이고 닫기 "x"와 끌어서 순서 바꾸기를 넣는다. 경계선으로 너비를 바꾸게 하고, 맨 위에 "Search" 입력란을 둔다.

**대응** — R-10 · R-11 · R-19

**완료 조건**
- R-10·R-11·R-19가 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 Phase 6을 마무리한다고 판단했다.

---

## Phase 7 — Left Dock 트리

**목적** — 트리를 스크롤해도 맨 위 폴더 이름이 Zed처럼 고정되어 보이게 한다.

**대응** — R-13

**완료 조건**
- R-13이 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 Phase 7을 마무리한다고 판단했다.

---

## Phase 8 — 타이틀 바 메뉴

**목적** — `≡` 메뉴의 앱 이름 메뉴를 없애고 File부터 보이게 하며, 타이틀 바 왼쪽에 `≡` 아이콘만 두고, Dependency Licenses를 탭으로 연다.

**대응** — R-14 · R-15 · R-20 · core D-6

**완료 조건**
- R-14·R-15·R-20이 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 Phase 8을 마무리한다고 판단했다.

---

## Phase 9 — 문서 편집 기본 기능

**목적** — 열린 문서 안에서 찾기·바꾸기·여러 곳 선택을 VS Code와 비슷한 기능과 단축키로 쓰게 하고, Edit 메뉴와 경로 줄 찾기 아이콘을 맞춘다.

**대응** — R-17 · core D-6 · core D-7

**완료 조건**
- R-17이 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 Phase 9를 마무리한다고 판단했다.

---

## Phase 10 — 상태 바 미리보기 버튼

**목적** — 상태 바의 진단 버튼 자리에 마크다운 자동 미리보기 버튼(Lock Preview)을 둔다.

**대응** — R-18 · core D-8(편집·미리보기 연계 유지)

**완료 조건**
- R-18이 SPEC 판정 방법대로 충족되었거나 못한 이유가 PROGRESS에 있다.
- 사용자가 Phase 10을 마무리한다고 판단했다.
