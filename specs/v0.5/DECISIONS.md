> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 초안
>
> workbench-tauri가 v0.5에서 정한 설계 결정을 기록한다. 두 갈래 공통 결정은 workbench-core `specs/v0.5/DECISIONS.md`(D-1~D-11)에 있고, 여기서는 다시 쓰지 않고 `core D-n`으로 가리킨다. 목적과 범위는 `INTENT.md`에 있다.

# DECISIONS — workbench-tauri v0.5

## 따르는 core 결정

이 레포는 아래 core 결정을 그대로 따른다. 내용은 `D:\projects\workbench-core\specs\v0.5\DECISIONS.md`의 해당 절을 본다.

| core 결정 | 이 레포에서 쓰는 곳 |
|---|---|
| core D-1 화면을 다루는 확인은 한 번에 하나 | `HERDR-SETUP.md` 5장 |
| core D-2 갈래 에이전트 구성(leader·writer·coder·checker) | `HERDR-SETUP.md` 1·2장, 루트 `AGENTS.md` 레포 규칙 |
| core D-3 공통 지시 카드와 파일 보고 | `HERDR-SETUP.md` 5장, `PLAN.md` |
| core D-4 SCREEN-REQ·SCREEN-OK·SCREEN-DONE | `HERDR-SETUP.md` 5장 |
| core D-7 자기 워크스페이스만 쓴다 | 루트 `AGENTS.md` 레포 규칙 |
| core D-8 Zed 테마·아이콘 테마 복사(`.gitignore` 폴더) | `SPEC.md` R-3·R-4, `PLAN.md` Phase 7 |
| core D-9 Zed UI 아이콘 복사(`.gitignore` 폴더) | `SPEC.md` R-1·R-18, `PLAN.md` Phase 5 |
| core D-10 Zed 기본 글꼴 커밋 | `SPEC.md` R-14, `PLAN.md` Phase 3 |
| core D-11 ITEMS가 SPEC 역할 | `SPEC.md`(I-n을 R-n으로 옮기고 판정 방법은 그대로) |
| core D-12 core ITEMS가 갈래 지침보다 우선 | 루트 `AGENTS.md` 레포 규칙·3장·5장, 루트 `INTENT.md` "다루지 않는 것", `SPEC.md` R-2·R-22, `PLAN.md` Phase 8 |

갈래가 정해 갈래 문서에 남기라고 한 것(core D-8·D-9의 복사본 폴더 경로, 복사본이 없을 때의 모습, 다시 채우는 방법, 복사 출처 커밋; core D-10의 굵기·스타일 파일과 버전)은 미정이다. 해당 Phase(3·5·7)에서 정해 이 문서에 더한다.

## 갈래 결정

없음.

에이전트 운영의 리더 결정(카드·보고 파일 위치, 카드 ID 체계)은 설계 결정이 아니라서 `HERDR-SETUP.md` 5장에 둔다.

## 미결 사항

- core D-8·D-9 복사본의 `.gitignore` 폴더 경로, 복사본이 없을 때 앱의 모습, 다시 채우는 방법(Phase 5·7).
- core D-9 복사 출처 Zed 커밋(Phase 5).
- core D-10 글꼴 파일의 굵기·스타일과 버전(Phase 3).
- core D-10 글꼴을 웹뷰에 읽히는 방식과, 그에 따른 CSP 변경이 필요한지(Phase 3). CSP를 바꾸면 루트 `AGENTS.md` 5장대로 이 문서에 적고 승인받는다.
