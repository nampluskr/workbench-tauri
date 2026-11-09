> 버전: v0.6 · 작성일: 2026-11-10 · 상태: 초안
>
> 이번 버전의 목적과 범위를 담는다. 설계 결정은 `DECISIONS.md`에, 요구와 판정 방법은 `SPEC.md`에, Phase 순서는 `PLAN.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, 실제 진행은 `PROGRESS.md`에 둔다. 변하지 않는 의도는 루트 `INTENT.md`에 있다. 지난 버전 기록은 `specs/v0.1/`·`v0.2/`·`v0.4/`·`v0.5/`에 있다(읽기만 한다).

# INTENT — workbench-tauri v0.6

## 목적·범위·기대 결과

- 목적: workbench-core v0.6 `ITEMS.md`의 항목 I-1~I-20을 workbench-tauri에 반영한다. tauri 하나를 확장의 바탕이 되는 앱으로 완성도를 높인다(core `specs/v0.6/INTENT.md`).
- 범위
  - core의 지시 카드(`D:\projects\workbench-core\specs\v0.6\orders\ORDER-<nn>.md`)를 받아 이 레포에서 진행한다(core D-2).
  - I-1~I-20을 이 레포의 요구 R-1~R-20으로 옮기고(`SPEC.md`), core PLAN Phase 2~10에 대응하는 Phase로 둔다(`PLAN.md`).
  - Phase는 하나씩 진행하고, 사용자가 그 Phase를 마무리한 뒤 다음 카드를 받는다(core D-5).
  - 이 워크스페이스의 herdr 에이전트 환경을 core D-4대로 꾸린다(`HERDR-SETUP.md`).
- 기대 결과
  - R-1~R-20이 `SPEC.md`의 판정 방법대로 충족되었거나, 충족하지 못한 이유가 `PROGRESS.md`에 남아 있다(core 루트 INTENT 원칙).
  - Phase마다 이 레포 `specs/v0.6/reports/ORDER-<nn>.md`에 core 보고가 있다(core D-2).
  - 이 워크스페이스에 `tauri-writer`·`tauri-coder`·`tauri-checker`가 core D-4 구성으로 떠 있다.

## 배경

- v0.5는 2026-11-08에 끝났다. 사용자는 목표의 약 90%에 이르렀다고 판단했고, 나머지는 다음 버전으로 넘겼다(`specs/v0.5/PROGRESS.md` 버전 종료).
- 사용자가 workbench-gpui를 동결하고 tauri 하나에만 지시하기로 했다(core D-1, 2026-11-09). 두 갈래를 같다고 보던 전제(core v0.5 D-3)는 없다.
- core는 v0.6 항목을 I-1~I-20으로 적고 그룹 G-1~G-9로 묶었다. ITEMS가 SPEC 역할을 한다(core D-3). 후보 C-1~C-9는 사용자 확인 전이라 요구가 아니다.
- 근거 문서: workbench-core `specs/v0.6/INTENT.md`, `specs/v0.6/orders/ORDER-01.md`.

## 제외 범위

core `specs/v0.6/INTENT.md` 제외 범위를 그대로 옮기고, 이 레포에 걸리는 것을 더한다.

- workbench-gpui의 작업. 동결했다(core D-1). gpui 레포는 읽기만 한다.
- 언어 서버(LSP) 연동. 쓰지 않는다(core D-6).
- 사용자 지시(core 카드) 없는 작업. 구현은 카드가 지시한 항목만 한다(core D-2).
- core ITEMS 후보 C-1~C-9. 사용자가 확인해 항목이 되기 전에는 옮기지 않는다.
- 새 파일 형식(PDF·동영상·이미지) 기능: 미정. 이번 버전에 넣을지는 사용자가 정한다(core INTENT 제외 범위).
- workbench-core와 workbench-gpui 레포에 쓰는 것. 읽기만 한다(루트 `AGENTS.md` 레포 규칙).
- `spec/`의 수정(루트 `AGENTS.md` 3장). 원본을 어디에 둘지는 미정이다(사용자가 정함, ORDER-01 5장).
