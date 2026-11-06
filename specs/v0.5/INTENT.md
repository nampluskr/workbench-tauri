> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 확정 (core-leader 판정, 사용자 위임 2026-11-06)
>
> 이번 버전의 목적과 범위를 담는다. 설계 결정은 `DECISIONS.md`에, 요구와 판정 방법은 `SPEC.md`에, Phase 순서는 `PLAN.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, 실제 진행은 `PROGRESS.md`에 둔다. 변하지 않는 의도는 루트 `INTENT.md`에 있다. 지난 버전의 기록은 `specs/v0.1/`·`specs/v0.2/`·`specs/v0.4/`에 있다(읽기만 한다).

# INTENT — workbench-tauri v0.5

## 목적·범위·기대 결과

- 목적: workbench-core v0.5 `ITEMS.md`의 항목 I-1~I-23(사용자가 두 갈래 UI를 테스트하고 요청한 수정·추가·변경)을 workbench-tauri에 반영한다.
- 범위
  - core의 지시 카드(`D:\projects\workbench-core\specs\v0.5\orders\ORDER-<n>.md`)를 받아 이 레포에서 진행한다(core D-3).
  - I-1~I-23을 이 레포의 요구 R-1~R-23으로 옮기고(`SPEC.md`), core PLAN Phase 2~11에 대응하는 Phase로 만든다(`PLAN.md`).
  - core D-8·D-9의 Zed 테마·아이콘 테마·UI 아이콘 복사본은 `.gitignore` 폴더에 두고, core D-10의 글꼴은 커밋한다.
  - 이 워크스페이스의 herdr 서브 에이전트 환경을 core D-2대로 꾸린다(`HERDR-SETUP.md`).
  - Phase 12(사용자 일괄 확인)에서 v0.5 V4 항목과 v0.4에서 넘긴 V4 목록(`specs/v0.4/PROGRESS.md` "V4 사용자 확인 목록")을 함께 본다(사용자 2026-11-06, ORDER-01 3.0).
- 기대 결과
  - R-1~R-23이 `SPEC.md`의 판정 방법대로 충족되었거나, 충족하지 못한 이유가 `PROGRESS.md`에 남아 있다(core 루트 INTENT 원칙).
  - Phase마다 이 레포 `specs/v0.5/reports/ORDER-<n>.md`에 core 보고가 있다(core D-3).
  - 이 워크스페이스에 `tauri-writer`·`tauri-coder`·`tauri-checker`가 core D-2 구성으로 떠 있다.

## 배경

- 사용자가 2026-11-06에 두 갈래 UI를 테스트하고 Zed와 비교해 항목 I-1~I-23을 요청했다. core는 이것을 `ITEMS.md`에 그룹 G-1~G-10으로 묶었고, ITEMS가 SPEC 역할을 한다(core D-11).
- 두 갈래 UI는 같은 수준·같은 외형·같은 기능이라고 전제하고, core는 두 갈래 공통의 수정·개선·변경을 지시한다(core D-3).
- 세 레포가 같은 버전 번호로 움직이도록 이번 버전을 v0.5로 한다(core `specs/v0.5/INTENT.md` 배경). 이 레포에는 v0.3 폴더가 없다(v0.4 INTENT).
- v0.4는 사용자 판단으로 종료했다. "v0.4를 종료한다. 사용자 확인(V4) 항목은 v0.5 Phase 12에서 함께 본다."(사용자 2026-11-06, core-leader 전달, ORDER-01 3.0)
- 근거 문서: workbench-core `specs/v0.5/INTENT.md`, `specs/v0.5/orders/ORDER-01.md`.

## 제외 범위

- core 카드에 없는 기능의 추가. 구현은 카드가 지시한 항목만 한다(core D-3).
- workbench-core와 workbench-gpui 레포에 쓰는 것. 읽기만 한다(core D-7).
- `spec/`의 수정(원본은 workbench-gpui, 루트 `AGENTS.md` 3장).
- Zed 테마·아이콘·글꼴의 복사·내려받기를 해당 Phase 전에 하는 것(D-8·D-9는 Phase 7·5, D-10은 Phase 3, ORDER-01 7장).
- 그 밖: 없음. 루트 `INTENT.md` "다루지 않는 것"과 부딪치는 I-2·I-22는 core ITEMS가 우선하므로(core D-12, 사용자 2026-11-06) 제외하지 않고 `SPEC.md` R-2·R-22로 둔다.
