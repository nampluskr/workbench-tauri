> 버전: v0.6 · 작성일: 2026-11-10 · 상태: 초안
>
> workbench-tauri가 v0.6에서 정한 설계 결정을 기록한다. core 결정은 workbench-core `specs/v0.6/DECISIONS.md`(D-1~D-8)에 있고, 여기서는 다시 쓰지 않고 `core D-n`으로 가리킨다. 목적과 범위는 `INTENT.md`에 있다.

# DECISIONS — workbench-tauri v0.6

## 따르는 core 결정

이 레포는 아래 core 결정을 그대로 따른다. 내용은 `D:\projects\workbench-core\specs\v0.6\DECISIONS.md`의 해당 절을 본다.

| core 결정 | 이 레포에서 쓰는 곳 |
|---|---|
| core D-1 tauri에만 지시, gpui 동결 | `INTENT.md` 제외 범위, 루트 `AGENTS.md` 1장 |
| core D-2 지시 카드와 보고 파일, 화면 차례 | `HERDR-SETUP.md` 5장, `PLAN.md` |
| core D-3 ITEMS가 SPEC 역할 | `SPEC.md`(I-n을 R-n으로 옮기고 판정 방법은 그대로) |
| core D-4 에이전트 구성은 v0.5 그대로 | `HERDR-SETUP.md` 1·2장, 루트 `AGENTS.md` 레포 규칙 |
| core D-5 Phase는 하나씩, 사용자 마무리 뒤 다음 | `PLAN.md` 모든 Phase에 걸리는 규칙 |
| core D-6 문서 편집·보기 위주, LSP 없음, 기능 축소 | `SPEC.md` R-4~R-7·R-16, `PLAN.md` Phase 2 |
| core D-7 문서 편집 기능은 VS Code와 비슷하게 | `SPEC.md` R-17, `PLAN.md` Phase 9 |
| core D-8 ponytail 원칙, 지금 되는 동작 유지 | `PLAN.md` 구현 원칙 |
| core D-9 tauri 지침은 core v0.6을 따른다(gpui는 항목이 가리킬 때만, Zed와 다르게 할 수 있음, `spec/` 원본은 core) | 루트 `INTENT.md`, 루트 `AGENTS.md` 레포 규칙·1·3·5·9장, `INTENT.md` 제외 범위, `HERDR-SETUP.md` 1·4장·5.5 |

## 이 레포의 결정

없음. Phase 1에서 이 레포가 따로 정한 설계 결정은 없다. Phase 2 이후 정하면 `D-1`부터 절을 더한다.

## 미결 사항

없음. ORDER-01에서 남긴 넷(`spec/` 원본 위치, 루트 `INTENT.md`의 gpui·Zed 원칙, "core ITEMS 우선"의 근거)은 core D-9로 정해져 루트 `INTENT.md`·`AGENTS.md`에 반영했다(사용자 2026-11-10, core D-9).
