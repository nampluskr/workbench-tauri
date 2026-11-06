> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 확정 (core-leader 판정, 사용자 위임 2026-11-06)
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

갈래가 정해 갈래 문서에 남기라고 한 것 중 core D-8·D-9의 복사본 폴더 경로, 복사본이 없을 때의 모습, 다시 채우는 방법, 복사 출처 커밋은 미정이다. 해당 Phase(5·7)에서 정해 이 문서에 더한다. core D-10의 굵기·스타일 파일과 버전은 아래 D-1에 있다.

## 갈래 결정

### D-1. core D-10 글꼴 파일과 읽히는 방식

**결정**

Zed 기본 글꼴 두 가지의 공식 릴리스 woff2와 라이선스 파일을 `public/fonts/`에 넣고 커밋한다. 글꼴 파일은 변환·서브셋하지 않는다.

| 글꼴 | 버전 | 파일(`public/fonts/`) | 라이선스 |
|---|---|---|---|
| IBM Plex Sans | `@ibm/plex-sans@1.1.0` | `ibm-plex-sans/IBMPlexSans-Regular.woff2`(400), `IBMPlexSans-Italic.woff2`(400 italic), `IBMPlexSans-SemiBold.woff2`(600), `IBMPlexSans-SemiBoldItalic.woff2`(600 italic) | `ibm-plex-sans/license.txt`(SIL OFL 1.1, Copyright © 2017 IBM Corp., Reserved Font Name "Plex") |
| Lilex | 2.630 | `lilex/Lilex-Regular.woff2`(400), `Lilex-Italic.woff2`(400 italic), `Lilex-Bold.woff2`(700), `Lilex-BoldItalic.woff2`(700 italic) | `lilex/OFL.txt`(SIL OFL 1.1, Copyright 2019 The Lilex Project Authors) |

받은 곳:

- IBM Plex Sans: 릴리스 https://github.com/IBM/plex/releases/tag/%40ibm/plex-sans%401.1.0 , 파일 https://github.com/IBM/plex/releases/download/%40ibm/plex-sans%401.1.0/ibm-plex-sans.zip 의 `ibm-plex-sans/fonts/complete/woff2/`와 같은 배포의 `license.txt`.
- Lilex: 릴리스 https://github.com/mishamyrt/Lilex/releases/tag/2.630 , 파일 https://github.com/mishamyrt/Lilex/releases/download/2.630/Lilex.zip 의 `webfonts/`. 릴리스 ZIP에 라이선스가 없어 같은 태그의 https://raw.githubusercontent.com/mishamyrt/Lilex/2.630/OFL.txt 를 받았다.

웹뷰에는 `@font-face`가 `public/fonts/`의 파일을 가리켜 읽힌다(Vite public 폴더라 빌드에 그대로 복사된다). CSP는 바꾸지 않는다. `font-src`가 없어 `default-src 'self'`가 적용되고, 레포 파일은 `'self'`로 허용된다.

**이유**

굵기·스타일은 Zed가 번들하는 목록(Zed `14b7b0ef3764d62a85070c8b5ccea105a2ad3235`, `docs/refs/01-zed/03-THEME-ICONS.md` T-15.1·T-15.2·T-17.5·T-17.6)과 같게 골랐다. 두 글꼴 모두 공식 릴리스에 같은 굵기·스타일의 woff2가 있어 그대로 쓴다. 레포 안 파일이라 CSP 완화가 필요 없다.

**출처**

core D-10, `SPEC.md` R-14, tauri-coder K-03 보고(2026-11-07).

에이전트 운영의 리더 결정(카드·보고 파일 위치, 카드 ID 체계)은 설계 결정이 아니라서 `HERDR-SETUP.md` 5장에 둔다.

## 미결 사항

- core D-8·D-9 복사본의 `.gitignore` 폴더 경로, 복사본이 없을 때 앱의 모습, 다시 채우는 방법(Phase 5·7).
- core D-9 복사 출처 Zed 커밋(Phase 5).
