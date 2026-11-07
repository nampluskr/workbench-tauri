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

갈래가 정해 갈래 문서에 남기라고 한 것 중 core D-9의 것은 아래 D-2에 있다. core D-8의 복사본 폴더 경로, 복사본이 없을 때의 모습, 다시 채우는 방법, 복사 출처는 아래 D-6에 있다(Phase 7). core D-10의 굵기·스타일 파일과 버전은 아래 D-1에 있다.

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
- 없을 때의 모습: 교체한 자리는 같은 크기의 빈 칸이다. 버튼·툴팁·접근성 이름·기능은 그대로이고 앱은 죽지 않는다. 폴더 전체가 없으면 glob이 빈 객체가 되고, SVG 하나가 빠지면 그 자리만 빈 칸이다. 유지한 자리(자체 `file.svg`, Windows 창 버튼 글리프)는 그대로 보인다. 자체 `file.svg`는 Phase 7(K-20)에서 아이콘 테마로 바꾸며 지웠다(D-6, `SPEC.md` R-1·R-3).

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

### D-4. 사용자 settings.json 처리 (두 갈래 기준)

**결정**

- 파일: `%APPDATA%\workbench-tauri\settings.json`. 형식과 키 이름은 Zed settings.json과 같다(JSONC). Zed 파일은 읽거나 쓰지 않는다.
- 읽기: 파일이나 키가 없으면 지금 상수가 기본값이다. 잘못된 값은 그 키만 기본값으로 읽는다. 문법이 깨진 파일은 기본값으로 읽되 GUI 저장으로 덮어쓰지 않는다(저장 거부).
- 쓰기: 디스크 원문을 다시 읽고 바꾼 최상위 키의 값 범위만 바꾼다. 다른 키·주석·BOM·줄바꿈은 그대로다. 같은 키가 여럿이면 모두 바꾼다.
- 저장: 읽을 때의 원문(expected)과 디스크를 비교해 다르면 거부하고, 새로 만든 임시 파일에 쓰고 sync한 뒤 교체 직전에 다시 비교하고 원자 교체한다(`src-tauri/src/user_file.rs`, keymap.json과 같은 모듈). Rust 명령은 경로 인자를 받지 않고 고정 파일만 다룬다.
- 다시 읽기: 기존 폴더 감시기가 settings.json 변경을 알리면 두 창이 다시 읽어 바로 적용한다.

**이유**

설정 파일은 사용자가 직접 고치는 JSONC라 주석과 다른 키를 잃으면 데이터 손실이다. 잘못된 키 하나 때문에 다른 설정까지 버리지 않는다. 두 갈래가 같은 파일 형식·처리를 가져야 한다(core D-15).

**출처**

core-leader 결정(2026-11-07, core D-13 위임): tauri 방식을 두 갈래 기준으로 정함. tauri-coder K-10-R1 보고, tauri-checker C-22(PASS).

### D-5. Settings 창 capability

**결정**

- 새 capability `src-tauri/capabilities/settings.json`을 `windows: ["settings"]`(Settings 창 label)에만 건다.
- 권한: `core:window`의 show, minimize, toggle-maximize, close, is-maximized, start-dragging, internal-toggle-maximize와 `core:event`의 listen, unlisten뿐이다.
- 창 만들기, 메인 창 포커스, 파일 읽기·쓰기는 고정 동작의 Rust 명령으로 하므로 범용 JS 권한(파일·셸·오프너 등)은 주지 않는다.
- main의 `default` capability와 CSP·devCsp는 바꾸지 않았다.

**이유**

Settings 창은 자기 타이틀 바(창 버튼·끌기)와 설정 변경 이벤트만 필요하다. 루트 `AGENTS.md` 5장(쓰는 권한만 개별 허용, CSP 끄지 않음).

**출처**

tauri-leader 승인(K-10-R1 카드, settings 창 label에 필요한 권한만), tauri-coder K-10-R1 보고, tauri-checker C-22(PASS).

### D-6. core D-8 테마·아이콘 테마 복사본의 위치와 없을 때의 모습

**결정**

- 출처·태그·커밋: Zed `4304dec732a75505066de5ce2dbbfb2bec369498`(Ayu·Gruvbox, Zed (Default) 문자열 표), `catppuccin/zed` `v0.2.27`(`83fe57ba…`), `huacnlee/zed-theme-macos-classic` `v0.4.0`(`22266e11…`), `catppuccin/zed-icons` `v1.24.0`(`fe864c99…`). 확장 셋의 버전은 이 PC에 설치된 확장의 `extension.toml`과 같다. 표 전체는 `SPEC.md` R-4 "복사본 출처".
- 위치: 테마는 `src/theme/assets/zed/`·`catppuccin/`·`macos-classic/`, 아이콘 테마는 `src/assets/icon-themes/catppuccin-icons/`·`zed/`. 모두 `.gitignore`에 걸려 커밋하지 않는다. 커밋된 One 테마(`src/theme/assets/one/`)는 그대로 둔다. 라이선스 파일은 각 폴더에 둔다.
- 다시 채우기: `tools/fetch-zed-icons.ps1`(Phase 5)을 먼저, 그다음 레포 루트에서 `pwsh -NoProfile -File tools/fetch-zed-themes.ps1`을 실행하고 다시 빌드한다.
- 읽는 방식: 빌드 때 eager glob. 앱은 실행 중에 내려받지 않고 이 PC의 Zed 설치 폴더를 읽지 않는다(설치된 확장을 `zlext`로 읽던 테마 코드는 없앴다).
- 없을 때의 모습: 테마는 One Dark·One Light만, 아이콘 테마는 빠진 것만 목록에서 빠지고 모두 없으면 파일 트리가 UI 폴더·파일 아이콘으로 그린다. Extensions 카드와 Licenses 항목은 그 묶음만 빠진다. 앱은 죽지 않는다.

**이유**

두 갈래 저장소가 공개라 복사본을 커밋하지 않는다(core D-8). 고정 커밋·태그로 받아 두 갈래가 같은 버전을 쓰고, 빌드 때 glob이라 복사본 여부가 빌드 때 정해져 실행 중 읽기 오류가 없다.

**출처**

core D-8, core ORDER-07 2장, tauri-coder K-17·K-18·K-20·K-21 보고(2026-11-07).

### D-7. Extensions 탭에 기본 묶음 카드를 두지 않는다

**결정**

Extensions 탭은 복사한 확장 셋(Catppuccin, Catppuccin Icons, macOS Classic Theme)만 `extension.toml` 카드로 보인다. One·Ayu·Gruvbox 테마와 Zed (Default) 아이콘 테마는 카드가 없다. K-12의 One Dark·One Light·Zed (Default) 카드는 없앴다.

**이유**

Zed의 Extensions 화면은 확장 패키지만 나열하고 본체 내장 테마·아이콘 테마는 나오지 않는다(`docs/refs/01-zed/02-INTERACTION.md` 16절 첫 문단). 기본 묶음은 `extension.toml`이 없는 본체 자원이라(One·Ayu·Gruvbox는 Zed `assets/themes/`, Zed (Default)는 코드 상수) 카드를 만들려면 값을 지어내야 한다. core D-15 "이 앱에 들어 있는 확장 자원만"의 확장은 복사한 셋이다. Zed 캡처는 스크롤돼 있어 "목록 전체에 내장 카드가 없다"는 것은 문서에 의존한다.

core 결정(2026-11-07, 사용자 위임 core D-13, 두 갈래 공통)으로 확정: `extension.toml`이 있는 확장(Catppuccin 0.2.27, Catppuccin Icons 1.24.0, macOS Classic 0.4.0)만 카드이고 내장 테마는 보이지 않는다.

**출처**

tauri-coder K-21 보고(2026-11-07), core D-15, core ORDER-07 3.3.

### D-8. 테마에 빠진 토큰은 같은 밝기의 One 값으로 근사한다

**결정**

테마 JSON에 토큰이 없으면 JSON 값 → 같은 테마의 파생 값(T-26.3·T-26.4) → 같은 밝기의 One 테마 값(dark → One Dark, light → One Light) → 고정 값(T-26.13) 순서로 채운다(`resolveTokens(style, base?)`). 테마별로 쓰인 대체는 `SPEC.md` R-4 "빠진 토큰과 대체 순서".

**이유**

macOS Classic에는 앱이 쓰는 토큰이 여럿 없고, 이전 코드는 이때 테마 적용이 실패했다. Zed도 테마 JSON을 기본(fallback) 테마 위에 덮지만 그 기본 테마 값(Zed `fallback_themes.rs`)은 One과 완전히 같지 않다. Zed 코드를 복사하지 않고, 커밋된 One 값으로 근사한다. V2에서 어긋나면 다시 정한다.

core 결정(2026-11-07, 사용자 위임 core D-13)으로 이 순서(JSON → T-26 파생 → 같은 appearance One 값 → 고정 값)를 두 갈래 공통으로 쓴다.

**출처**

tauri-coder K-18·K-19 보고(2026-11-07), core ORDER-07 3.1, core-leader 결정(2026-11-07).

### D-9. 선택기 퍼지 검색은 자체 구현이다

**결정**

테마·아이콘 테마 선택기의 검색은 `src/shell/picker.ts`의 간단한 퍼지 검색이다: 글자가 순서대로 들어 있으면 맞고, 연속 일치와 단어 첫 글자에 점수를 더하며, 같은 점수는 목록 순서를 따른다. 한계는 `shortcut:` 주석으로 남겼다.

**이유**

앱에 퍼지 검색이 없었고(Settings·Keymap·Extensions는 부분 문자열 검색) 의존성을 더하지 않는다. 목록이 21종·9종이라 단순 구현으로 충분하다. Zed fuzzy와 동점 순서는 다를 수 있다.

**출처**

tauri-coder K-19 보고(2026-11-07).

### D-10. 스펙 toml에 없는 Picker 값은 01-LAYOUT 4.13 본문 값을 쓴다

**결정**

`spec/zed-metrics.toml`에 없는 Picker 값 — 그림자 4겹(elevation_3), 창 높이 마진 160, 행 높이 계산용 줄 높이 1.618, 빈 결과 위아래 8, 체크 아이콘 16 — 은 `docs/refs/01-zed/01-LAYOUT.md` 4.13 본문 값을 쓴다. 그림자는 `src/shell/picker.css`, 나머지는 `src/spec/metrics.ts`에 "toml에 없음" 주석과 함께 둔다.

**이유**

추정한 값이 아니라 실측 문서에 있는 값이다. `spec/`은 gpui가 원본이라 이 레포에서 고치지 않는다(루트 `AGENTS.md` 3장). core 결정(2026-11-07, 사용자 위임 core D-13): 원본 소유자 gpui writer가 이 값에 toml ID를 붙여 올리고, tauri는 그 ID로 바꿔 참조한다. gpui toml 갱신 대기 — 올라오면 `spec/`을 다시 복사하고 `metrics.ts`·`picker.css`를 ID 참조로 바꾼다. → K-23(커밋 `9509ae4`)에서 gpui `spec/` 세 파일을 복사하고 선택기 값을 toml ID 참조로 바꿨다.

**출처**

tauri-coder K-19 보고(2026-11-07), 루트 `AGENTS.md` 3장.

### D-11. Project Search 의존성과 검색 범위

**결정**

- 직접 의존성 두 개를 정확한 버전으로 더한다(`src-tauri/Cargo.toml`).

| crate | 버전 | 배포본 라이선스 | 쓰는 곳 |
|---|---|---|---|
| `ignore` | `=0.4.34` | Unlicense OR MIT | 폴더 순회, `.gitignore`·숨김 규칙, Include/Exclude glob(`ignore::overrides`) |
| `regex` | `=1.13.1` | MIT OR Apache-2.0 | 대소문자·단어 단위·정규식 일치 |

- core 승인 문구는 두 crate를 "MIT/Unlicense"로 적었으나, `regex` 1.13.1 배포본의 실제 라이선스는 MIT OR Apache-2.0이다. 실제 배포본 기준으로 적는다.
- 전이 의존성(새로 `Cargo.lock`에 들어온 것): `bstr`, `crossbeam-deque`, `crossbeam-epoch`, `globset`(모두 `ignore`가 씀). `regex` 1.13.1은 이미 lock에 있었고 이번에 직접 의존성이 됐다.
- 라이선스 원문 4개(`ignore`의 MIT·Unlicense, `regex`의 MIT·Apache-2.0)를 배포본과 바이트 단위로 같게 `src/licenses/`에 두고 Licenses 창(Help → View Dependency Licenses) glob에 연결했다.
- 심볼릭 링크·junction은 따라가지 않는다(`follow_links(false)`와 Windows reparse-point 검사). Zed는 링크를 canonicalize해 루트 밖 대상만 외부로 구분하고 루트 안 링크는 따라가므로 이 점이 다르다(Zed `4304dec` `crates/worktree/src/worktree.rs:5562~5625`).
- 결과 상한: 파일 5,000개, 일치 10,000개(Zed `crates/project/src/project_search.rs:166~167`). 상한에 닿으면 표시한다.

**이유**

core D-12(ITEMS가 갈래 지침보다 우선, 목록 밖 의존성 허용)와 core D-17(Project Search 범위)에 따라 실제로 찾는 검색이 필요하다. gitignore 규칙과 glob을 몇 줄로 다시 만들 수 없어 Zed와 같은 동작의 crate를 쓴다. 링크를 따라가지 않는 것은 작업 공간 밖 파일을 읽지 않기 위한 보안 처리다(카드 지시).

**출처**

core D-12·D-17, core-leader 승인(2026-11-07, 사용자 위임 core D-13), tauri-coder K-26 보고(2026-11-07).

### D-12. 상태 바 왼쪽 구분선 값

**결정**

상태 바 왼쪽 구분선(사이드바 토글 뒤, `file_tree` 뒤)은 처음에 Zed 실측값(폭 1px, 높이 16px, 색 `border`, Zed `4304dec` 2026-11-07)으로 넣고, gpui toml ID가 올라온 뒤 `statusbar.left_divider.width`·`statusbar.left_divider.height`(색 `left_divider.color` = `border`)를 참조하도록 바꿨다. 좌표(`x_after_sidebar_toggle` 28, `x_after_file_tree` 59, `y_top` 829)는 코드에 넣지 않고 V3 대조에만 쓴다.

**이유**

toml에 구분선 ID가 없어 사용자 추가 지시(core D-12)로 실측값을 먼저 쓰고, core-leader NOTICE로 gpui 원본에 ID가 생겨 그 ID로 바꿨다(루트 `AGENTS.md` 3장, `spec/`은 gpui 원본을 그대로 복사).

**출처**

사용자 추가 지시(2026-11-07), core-leader NOTICE(2026-11-07), tauri-coder K-25 보고.

### D-13. 마크다운 미리보기 클릭 위치

**결정**

마크다운 미리보기에서 누른 곳의 상태 바 위치는 누른 곳을 포함하는 가장 안쪽 블록의 원본 시작 줄, 열 1이다(`{line}:1 Markdown`). 블록 종류 표는 `SPEC.md` R-5 "마크다운 미리보기 클릭 위치"의 "블록 종류 표 (K-28)"에 있다. 표 셀은 그 행(tr)의 시작 줄이며, 이것은 현재 동작으로 core 확인을 요청했다.

**이유**

미리보기의 글자 하나를 원본 열로 되돌리는 계산은 하지 않고, 이미 있는 블록 `data-line` 대응(I-084)을 그대로 쓴다.

**출처**

core-leader 결정(2026-11-07, 사용자 위임 core D-13), tauri-coder K-24 보고.

에이전트 운영의 리더 결정(카드·보고 파일 위치, 카드 ID 체계)은 설계 결정이 아니라서 `HERDR-SETUP.md` 5장에 둔다.

## 미결 사항

- core D-8 복사본 항목은 D-6에서 정했다(Phase 7).
- core 결정(2026-11-07)으로 정해짐: 탭 파일 아이콘은 그리지 않고 아이콘 테마는 파일 트리에만(`SPEC.md` R-3), D-7 기본 묶음 카드 없음, D-8 두 갈래 공통, 테마·아이콘 테마 목록(Monochrome 포함 9종, dark → light 이름순), 선택기 스크롤바는 목록 위 포인터일 때만.
- D-10 값의 gpui toml ID: K-23에서 반영해 끝났다.
