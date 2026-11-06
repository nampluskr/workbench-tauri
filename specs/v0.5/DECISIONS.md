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

갈래가 정해 갈래 문서에 남기라고 한 것 중 core D-9의 것은 아래 D-2에 있다. core D-8의 복사본 폴더 경로, 복사본이 없을 때의 모습, 다시 채우는 방법, 복사 출처는 미정이다. Phase 7에서 정해 이 문서에 더한다. core D-10의 굵기·스타일 파일과 버전은 아래 D-1에 있다.

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

### D-2. core D-9 Zed UI 아이콘 복사본의 위치와 없을 때의 모습

**결정**

- 출처: Zed `zed-industries/zed` 커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`의 `assets/icons/` 전체(UI SVG 299개, `file_icons/` 96개, `knockouts/`, `LICENSES`)와 루트 `LICENSE-GPL`·`LICENSE-APACHE`.
- 위치: `src/assets/zed-icons/`. `.gitignore`에 `src/assets/zed-icons/`를 더해 커밋하지 않는다. 라이선스 파일도 같은 폴더에 둔다.
- 다시 채우기: 레포에 커밋한 `tools/fetch-zed-icons.ps1`(PowerShell 7)을 레포 루트에서 실행한 뒤 다시 빌드한다. 스크립트는 TEMP 임시 폴더에 위 커밋을 sparse checkout(`blob:none`, depth 1)으로 받아 아이콘 폴더와 두 라이선스만 덮어쓰고, 커밋·개수·라이선스를 확인하며, 끝나면 임시 폴더를 지운다.
- 읽는 방식: SVG를 Vite eager raw glob으로 빌드 때 넣고, 그릴 때만 고정색을 `currentColor`로 바꾼다(`src/shell/icon-svg.ts`, 테스트 `src/shell/icon-svg.test.ts`). 원본 파일은 고치지 않는다. CSP·의존성은 바꾸지 않는다.
- 없을 때의 모습: 교체한 자리는 같은 크기의 빈 칸이다. 버튼·툴팁·접근성 이름·기능은 그대로이고 앱은 죽지 않는다. 폴더 전체가 없으면 glob이 빈 객체가 되고, SVG 하나가 빠지면 그 자리만 빈 칸이다. 유지한 자리(자체 `file.svg`, Windows 창 버튼 글리프)는 그대로 보인다.

**이유**

두 갈래 저장소가 공개라 Zed 아이콘을 커밋하지 않는다(core D-9). 빈 칸은 대체 그림을 직접 그리지 않으면서(core D-9) 레이아웃과 기능을 지킨다. eager glob이라 복사본 여부가 빌드 때 정해지고 실행 중 읽기 오류가 없다.

**출처**

core D-9·D-13, `SPEC.md` R-1, tauri-coder K-08 보고(2026-11-07, 복사본 있음·없음 각각 typecheck·test 114/114·디버그 빌드 통과).

### D-3. 등록 폴더 목록 아이콘을 Zed `folder.svg`로

**결정**

사이드바의 등록 폴더 목록(`src/shell/Sidebar.tsx`)은 자체 `folder.svg` 대신 Zed `folder.svg`(IconName `Folder`)를 쓴다. 자체 `folder.svg`는 지웠다.

**이유**

Zed 일반 프로젝트 label에는 아이콘이 없다(Zed `4304dec732` `crates/sidebar/src/sidebar.rs:708~711`). 아이콘을 빼면 레이아웃이 바뀌어 Phase 5 범위 밖이다(폴더 보기 패널 모양은 R-21, Phase 10). 그래서 자리는 두고 모양을 gpui 갈래(`D:\projects\workbench-gpui\src\ui\folders.rs:781`, Zed `folder`)와 같게 맞춰 두 갈래 대응 표가 같은 자리에 다른 아이콘을 고르지 않게 했다(ORDER-05 3.1).

**출처**

tauri-leader 결정(사용자 위임 core D-13, ORDER-05, 2026-11-07), tauri-coder K-08-R1 보고.

에이전트 운영의 리더 결정(카드·보고 파일 위치, 카드 ID 체계)은 설계 결정이 아니라서 `HERDR-SETUP.md` 5장에 둔다.

## 미결 사항

- core D-8 복사본의 `.gitignore` 폴더 경로, 복사본이 없을 때 앱의 모습, 다시 채우는 방법, 복사 출처(Phase 7).
