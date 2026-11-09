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

## 이 레포의 결정

없음. Phase 1에서 이 레포가 따로 정한 설계 결정은 없다. Phase 2 이후 정하면 `D-1`부터 절을 더한다.

## 미결 사항

- `spec/`(Zed 실측 명세) 원본의 위치: 루트 `AGENTS.md`는 "`spec/`의 원본은 `workbench-gpui`다"라고 적었고, core 루트 INTENT는 "Zed 실측 명세의 원본은 이 프로젝트(core)에 둔다"고 한다. gpui는 동결이다. 사용자가 정한다(ORDER-01 5장).
- 루트 `INTENT.md`의 "workbench-gpui와 같아야 한다", "두 갈래는 같은 앱이다"가 core D-1(gpui 동결)과 맞지 않는다. 루트 `INTENT.md`를 고칠지는 사용자가 정한다.
- 루트 `INTENT.md`의 "Zed와 같아야 한다"가 core D-6·D-7과 Zed와 다르게 하는 항목(R-14·R-15·R-16·R-17)과 맞지 않는다. 루트 `INTENT.md`를 고칠지는 사용자가 정한다.
- 루트 `AGENTS.md` "core ITEMS 우선" 규칙의 근거: v0.5에서는 core v0.5 D-12였다. core v0.6 DECISIONS에는 같은 결정이 없다. v0.6에도 같은 근거로 둘지는 사용자(core-leader)가 정한다.
