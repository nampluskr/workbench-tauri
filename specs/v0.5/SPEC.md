> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 확정 (core-leader 판정, 사용자 위임 2026-11-06)
>
> workbench-core v0.5 `ITEMS.md`의 I-1~I-23을 이 레포의 요구 R-1~R-23으로 옮긴다. R-n의 번호는 I-n과 같다(R-1 = I-1). 판정 방법은 ITEMS의 "판정 방법"을 바꾸지 않고 옮긴다(core D-11). 결정은 `DECISIONS.md`와 core `DECISIONS.md`에, Phase 순서는 `PLAN.md`에 있다.

# SPEC — workbench-tauri v0.5

## 공통 판정 조건

- V0~V4는 루트 `AGENTS.md` 3A의 검증 수준이다.
- Zed와 비교하는 판정은 같은 조건(창 1440×852, 화면 배율 100%, 같은 폴더·파일·테마)에서 한다(core ITEMS 머리말, core D-11).
- 화면을 다루는 확인은 core-leader의 차례를 받고 한다(core D-1·D-4, `HERDR-SETUP.md` 5장).
- "확인한 사실"의 tauri 부분은 core-leader가 2026-11-06에 확인한 것이다(core ITEMS). 이 레포에서 따로 다시 확인한 것은 출처에 적는다.
- 참고 화면 경로(`refs/...`)는 workbench-core `specs/v0.5/` 기준이다.

---

## R-1. UI 아이콘 모양을 Zed와 같게 한다

**요구**

UI 전체의 아이콘 모양을 Zed(또는 Zed 화면 캡처)와 같게 한다. Zed 아이콘 원본을 이 레포의 `.gitignore` 폴더에 복사해 그대로 쓴다. 대상은 UI 아이콘 전부다.

**정해진 결과**

아이콘 모양이 Zed와 같다. 지금 tauri는 자체 SVG를 쓴다(`src/assets/icons/*.svg`).

**판정 방법**

UI의 모든 아이콘이 D-9로 복사한 Zed 원본 SVG에서 나온다(코드에서 아이콘 출처 대조). 같은 화면 캡처에서 아이콘 모양이 Zed와 같다. V3.

**출처**

I-1, core D-9, 사용자 2026-11-06.

**아이콘 출처와 복사본**

- 출처: Zed `zed-industries/zed` 커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`의 `assets/icons/`(UI SVG 299개, `file_icons/` 96개, `knockouts/`, `LICENSES`)와 저장소 루트 `LICENSE-GPL`·`LICENSE-APACHE`. 이 PC의 Zed 설치 폴더에서는 읽지 않았다.
- 두는 곳: `src/assets/zed-icons/`. `.gitignore`에 걸려 있어 커밋하지 않는다. 라이선스 파일(`LICENSES`, `LICENSE-GPL`, `LICENSE-APACHE`)도 같은 폴더에 둔다.
- 다시 채우는 방법: 레포 루트에서 PowerShell 7로 `./tools/fetch-zed-icons.ps1`을 실행한 뒤 다시 빌드한다(dev는 재시작). SVG는 빌드 때 eager glob으로 들어가므로 빌드 뒤에 채우면 반영되지 않는다. 스크립트는 위 커밋을 sparse checkout으로 받아 아이콘 폴더와 두 라이선스만 복사하고, 커밋·개수(299/96)·라이선스 존재를 스스로 확인한다. 내려받기는 core-leader 허락(core D-13).
- 그리는 방식: 원본 SVG의 고정색(`black`, `#DCE0E5` 등)을 그릴 때만 `currentColor`로 바꿔 테마 색을 따른다. 원본 파일은 고치지 않는다. 크기는 기존 `.icon` 크기를 그대로 쓴다.
- 복사본이 없을 때: 교체한 자리는 같은 크기의 빈 칸이다. 버튼·툴팁·접근성 이름·기능은 그대로이고 앱은 죽지 않는다. 유지한 자리(아래)는 그대로 보인다. 폴더 전체가 없어도, SVG 한 개만 빠져도 같다(`DECISIONS.md` D-2).

**대응 표**

Zed `IconName`은 `crates/icons/src/icons.rs:9`의 snake_case와 `:314~316`의 경로 규칙으로 `assets/icons/<snake_case>.svg`에 대응한다. Zed 근거는 모두 위 커밋 기준이다. 앱 자리의 줄은 ORDER-05 변경 뒤 기준이다.

| 앱 자리 | Zed IconName | SVG | Zed 근거(파일:줄) |
|---|---|---|---|
| 타이틀 바 앱 메뉴 (`src/shell/AppMenu.tsx:218`) | Menu | `menu.svg` | `crates/title_bar/src/application_menu.rs:192~197` |
| 등록 폴더 사이드바 아래 토글 (`src/App.tsx:24`) | ThreadsSidebarLeftOpen | `threads_sidebar_left_open.svg` | `crates/sidebar/src/sidebar.rs:7475~7495` |
| 사이드바 닫힌 상태의 상태 바 토글 (`src/App.tsx:53`) | ThreadsSidebarLeftClosed | `threads_sidebar_left_closed.svg` | `crates/workspace/src/status_bar.rs:232~263` |
| 사이드바 아래 Add Project (`src/App.tsx:34`) | FolderAdd | `folder_add.svg` | `crates/sidebar/src/sidebar.rs:6772~6775` |
| 상태 바 Add Project (`src/App.tsx:58`) | FolderAdd | `folder_add.svg` | 같은 Add Project 기능, 위 근거 |
| 상태 바 Project Panel / Close Left Dock (`src/App.tsx:63,65`) | FileTree | `file_tree.svg` | `crates/project_panel/src/project_panel.rs:8278~8285`, `crates/workspace/src/dock.rs:1411~1415` |
| 탭 바 뒤로 (`src/shell/Pane.tsx:380`) | ArrowLeft | `arrow_left.svg` | `crates/workspace/src/pane.rs:3508~3527` |
| 탭 바 앞으로 (`src/shell/Pane.tsx:383`) | ArrowRight | `arrow_right.svg` | `crates/workspace/src/pane.rs:3531~3535` |
| 탭 닫기 (`src/shell/Pane.tsx:287`) | Close | `close.svg` | `crates/workspace/src/pane.rs:3053~3058` |
| 고정 탭 해제 (`src/shell/Pane.tsx:274`) | Pin | `pin.svg` | `crates/workspace/src/pane.rs:3037~3044` |
| 미리보기 탭 아이콘 (`src/shell/Pane.tsx:255`) | FileDoc | `file_doc.svg` | `crates/markdown_preview/src/markdown_preview_view.rs:1663~1664` |
| 탭 바 New… (`src/shell/Pane.tsx:392`) | Plus | `plus.svg` | `crates/workspace/src/pane.rs:4364~4367` |
| 탭 바 Split Pane (`src/shell/Pane.tsx:345`) | Split | `split.svg` | `crates/workspace/src/pane.rs:4388~4393` |
| Pane 확대 (`src/shell/Pane.tsx:361`) | Maximize | `maximize.svg` | `crates/workspace/src/pane.rs:4416~4418` |
| Pane 확대 해제 (`src/shell/Pane.tsx:361`) | Minimize | `minimize.svg` | `crates/workspace/src/pane.rs:4419~4420` |
| Markdown 미리보기 버튼 (`src/shell/Pane.tsx:412`) | Eye | `eye.svg` | `crates/zed/src/zed/quick_action_bar/preview.rs:40~44,64~66` |
| 파일 트리 닫힌 폴더 (`src/shell/ProjectTree.tsx:158`) | Folder | `folder.svg` | `crates/project_panel/src/project_panel.rs:7111~7113` → `crates/file_icons/src/file_icons.rs:254~259` |
| 파일 트리 열린 폴더 (`src/shell/ProjectTree.tsx:158`) | FolderOpen | `folder_open.svg` | `crates/file_icons/src/file_icons.rs:261~268` |
| 등록 폴더 목록 (`src/shell/Sidebar.tsx:77`) | Folder | `folder.svg` | 리더 결정(`DECISIONS.md` D-3). gpui `src/ui/folders.rs:781`과 같다 |

- 파일 트리 폴더 두 가지는 Zed 기본 아이콘 테마(`file_icons/folder.svg`·`folder_open.svg`)와 UI SVG가 바이트 단위로 같아(SHA256 `49FFC6E8…845B`, `4E15D512…DBC9`) UI SVG를 쓴다.
- 등록 폴더 목록: Zed 일반 프로젝트 label에는 아이콘이 없다(`crates/sidebar/src/sidebar.rs:708~711`). 아이콘을 빼면 레이아웃이 바뀌어 이번 범위 밖이므로 gpui 갈래와 같은 Zed `folder.svg`로 맞췄다.

**유지한 자리(Zed SVG가 아님)**

| 앱 자리 | 지금 쓰는 것 | 이유 |
|---|---|---|
| Windows 창 최소화·최대화·복원·닫기 (`src/shell/TitleBar.tsx:11~15`) | Segoe Fluent 글리프 | Zed도 Windows에서 SVG가 아닌 Segoe Fluent 글리프 e921/e922/e923/e8bb를 쓴다(`crates/platform_title_bar/src/platforms/platform_windows.rs:15~30,78~83`). |

- 파일 트리 일반 파일: Phase 5에서는 자체 Lucide `src/assets/icons/file.svg`(라이선스 `LICENSE-LUCIDE`)를 유지했다. Phase 7(K-20)에서 Lucide `file.svg`와 `LICENSE-LUCIDE`를 지웠다. 지금 파일 트리의 파일·폴더 아이콘은 아이콘 테마(R-3, 기본 Zed (Default))에서 나온다. 아이콘 테마가 없으면 UI 아이콘(`zed-icons`)의 `file`·`folder`·`folder_open`으로 대체한다.

**확인 결과**

- 코드 출처(V1, tauri-coder K-08·K-08-R1): 복사본 있음·없음 각각 `npm.cmd run typecheck` 통과, `npm.cmd run test` 114/114, `npm.cmd run tauri build -- --debug --no-bundle` 통과. `git status`·`git ls-files src/assets/zed-icons`에 복사본이 없다.
- 화면(V3, tauri-leader 2026-11-07, 클라이언트 1440×852·100%): 상태 바 왼쪽(패널 토글·`folder_add`·`file_tree`), 탭 바(화살표·`+`·분할·확대), 미리보기 탭 아이콘이 Zed와 같은 모양이다(`specs/v0.5/verify/ORDER-05/` tauri-1~3, zed-1·2, zoom-*).
- 조건 차이: 사용자 Zed의 아이콘 테마가 Catppuccin Latte라(설정은 읽기만 하고 바꾸지 않았다) 파일 트리 폴더·파일 아이콘은 화면으로 비교할 수 없어 위 코드 출처(Zed 기본 테마 `file_icons.rs`)로 판정한다. Zed는 Restricted Mode로 열었다(신뢰 목록에 더하지 않았다).
- 판정: checker C-19, `specs/v0.5/verify/ORDER-05/ORDER-05-judgement.md`.

---

## R-2. 타이틀 바 오른쪽 최소화 버튼 앞에 "v" 메뉴를 둔다

**요구**

타이틀 바 오른쪽 최소화 버튼 바로 앞에 "v" 버튼을 둔다. 누르면 Zed처럼 Settings, Keymap, Themes, Icon Themes, Extensions, Panel Layout이 나오고, 각 항목이 Zed처럼 동작한다. 단축키도 Zed와 같다(Settings `Ctrl-,`, Keymap `Ctrl-K Ctrl-S`, Themes `Ctrl-K Ctrl-T`, Extensions `Ctrl-Shift-X`, Panel Layout은 하위 메뉴). Themes·Icon Themes는 R-4·R-3의 선택 화면을 연다.

**정해진 결과**

"v" 메뉴가 Zed와 같은 순서·단축키로 있고 각 항목이 Zed와 같은 화면을 연다. 지금 tauri에는 `v`가 없다.

**판정 방법**

타이틀 바 오른쪽 최소화 버튼 앞에 "v"가 있다. 누르면 Settings, Keymap, Themes, Icon Themes, Extensions, Panel Layout이 Zed와 같은 순서와 단축키로 나온다. 각 항목을 누르거나 단축키를 쓰면 Zed와 같은 화면이 열린다. V3.

**출처**

I-2, 사용자 2026-11-06("'v' 메뉴 동작까지 구현"), core D-12(루트 `INTENT.md` "설정 UI 화면", "오른쪽·하단 Dock", "화면을 추가하는 확장, 온라인 확장 목록"보다 I-2가 우선한다).

**Zed가 여는 것 (ORDER-06 1단계 확인)**

tauri-leader가 2026-11-07 Zed 새 창(`zed -n`, 클라이언트 1440×852, 100%, Restricted Mode)에서 확인했다. 메뉴 정의 근거는 Zed `crates/title_bar/src/title_bar.rs`(커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`) 1374~1415행이다. 전문과 캡처는 `specs/v0.5/reports/ORDER-06-zed.md`, `specs/v0.5/verify/ORDER-06/zed-*.png`에 있다.

| 항목 | 단축키 표시 | Zed가 여는 것 | 저장 위치 |
|---|---|---|---|
| Settings | `Ctrl-,` | 별도 OS 창(검색칸, 범주 15개, 행마다 토글·드롭다운, `Edit in settings.json`) | `%APPDATA%\Zed\settings.json`, 프로젝트 `.zed/settings.json` |
| Keymap | `Ctrl-K Ctrl-S` | 편집 영역 새 탭 "Keymap Editor"(필터, Action·Arguments·Keystrokes·Context·Source 표) | `%APPDATA%\Zed\keymap.json` |
| Themes… | `Ctrl-K Ctrl-T` | 모달 선택기 "Select Theme…" | settings.json `theme` |
| Icon Themes… | 없음 | 모달 선택기 "Select Icon Theme…" | settings.json `icon_theme` |
| Extensions | `Ctrl-Shift-X` | 편집 영역 새 탭 "Extensions"(온라인 목록, 설치·제거) | `%LOCALAPPDATA%\Zed\extensions\` |
| (구분선) | | | |
| Panel Layout | `>` | 하위 메뉴 Classic·Agentic·조건부 Custom | settings.json 패널 위치 |

- AI 기능이 꺼져 있으면 Zed는 Panel Layout과 앞 구분선을 보이지 않는다. 로그인하면 구분선 뒤에 Sign Out이 더 나온다(확인하지 않음).

**1단계 결과 (ORDER-06 1단계)**

1단계 범위는 버튼·메뉴·순서·단축키 표시다. 각 항목이 여는 화면은 2단계(ORDER-06-R1)에서 core가 공통 범위를 정한다.

- 버튼 위치: 타이틀 바 오른쪽, 최소화 버튼 바로 앞(`src/shell/TitleBar.tsx`).
- 버튼 아이콘: Zed `ChevronDown` → `chevron_down.svg`(R-1의 D-9 복사본). 근거 `crates/title_bar/src/title_bar.rs:1262`.
- 버튼·팝업 크기: `titlebar.user_menu.button_width`/`button_height`(I-608) 22px, `button_icon_size`(I-601) 14px, `button_corner_radius`(I-609) 4px, 팝업 오프셋(I-611) x=5·y=0. 팝업 폭·최대 높이(I-612)는 기존 메뉴 스타일과 같은 값이라 그대로 쓴다.
- 항목·순서·단축키 표시: Settings `Ctrl-,`, Keymap `Ctrl-K Ctrl-S`, Themes… `Ctrl-K Ctrl-T`, Icon Themes…(없음), Extensions `Ctrl-Shift-X`, (구분선), Panel Layout(하위 메뉴 Classic·Agentic). 단축키 표시는 기존 `shortcutFor`로 사용자 키맵과 메뉴를 열기 직전의 포커스를 따른다.
- 비활성 처리: 아직 화면이 없는 Settings·Keymap·Themes…·Icon Themes…·Extensions와 Panel Layout 하위 Classic·Agentic은 누를 수 없는 비활성 항목이다. 눌러도 아무 일이 없고 오류를 띄우지 않는다. Panel Layout 자체는 하위 항목을 볼 수 있게 활성이다. 비활성 항목에 새 키 바인딩은 더하지 않았다.
- Themes…·Icon Themes…: Phase 7(R-4·R-3 선택 화면)까지 비활성이다.
- Custom을 넣지 않은 이유: Zed의 Custom은 지금 배치가 Classic·Agentic 어느 것도 아닐 때만 나오는 체크·비활성 표시다(`title_bar.rs` 1388~1415행). tauri에는 그런 배치 상태가 없다.
- Sign In·업데이트·계정 항목은 범위 밖이라 넣지 않았다.
- 화면(V3, tauri-leader 2026-11-07, 1440×852·100%): 판정 checker C-21(`specs/v0.5/verify/ORDER-06/ORDER-06-judgement.md`). "v" 버튼은 최소화 버튼 바로 앞 22×22(`userButton` x=1310, 최소화 x=1332), 아이콘 `chevron_down` 14px. 항목 순서·구분선·단축키 표시 네 개가 Zed와 같다(`tauri-user-menu.png`). Panel Layout 하위 Classic·Agentic이 열린다(`tauri-user-menu-panel-layout.png`). 비활성 항목은 `[disabled]`로 보이고 Settings를 눌러도 앱이 그대로다.
- 하위 메뉴가 열린 채 비활성 형제(Extensions 등)로 포인터를 옮기면 하위 메뉴가 닫힌다(K-09-R3, C-21 지적). 코드·테스트 확인, 화면 재확인은 tauri-leader.

**2단계 (ORDER-06-R1, core D-15)**

화면의 틀(여는 방식, 배치, 검색, 컨트롤 모양, 단축키)은 Zed와 같게, 내용은 이 앱에 실제로 있는 설정·액션·자원만 담는다(core D-15, `D:\projects\workbench-core\specs\v0.5\orders\ORDER-06-R1.md`). 저장 위치는 `%APPDATA%\workbench-tauri`이고 Zed 파일은 읽거나 쓰지 않는다. 두 갈래는 같은 내용을 가진다.

*core-leader 결정 (2026-11-07, core D-13 위임) — 두 갈래 같게*

- Settings 파일: `%APPDATA%\workbench-<갈래>\settings.json`(이 갈래는 `%APPDATA%\workbench-tauri\settings.json`). 형식과 키 이름은 Zed와 같다. 파일이 없거나 값이 없으면 지금 상수가 기본값이다.
- Settings 범주: Appearance 하나. 행 이름·설명은 Zed Settings UI 문구를 쓴다.

| 행 | 키 | 컨트롤 | 값·기본값 |
|---|---|---|---|
| Theme | `theme` | 드롭다운 | 이 갈래에 지금 있는 테마. 기본은 지금 기본값. Phase 7에서 두 갈래 목록이 같아진다 |
| Icon Theme | `icon_theme` | 드롭다운 | 지금은 `Zed (Default)` 하나 |
| UI Font Size | `ui_font_size` | 숫자 | 16 |
| Buffer Font Size | `buffer_font_size` | 숫자 | 15 |

- Panel Layout: 하위 메뉴에 `Classic`만 둔다(Agentic 제거, 이 앱에는 AI·에이전트 패널이 없다).
  - `Classic` = 왼쪽 dock 열기 + dock 폭을 기본 폭으로 되돌리기. 기본 폭은 지금 상수 `project_panel.default_width`(L-32) 240px다.
  - `Custom`(체크·비활성)은 둘 중 하나라도 기본과 다를 때 보인다. 기본이면 `Classic`에 체크한다.

*Settings 창 Zed 실측값*

tauri-leader가 2026-11-07 Zed 캡처 `specs/v0.5/verify/ORDER-06/zed-settings-window.png`(클라이언트 1440×852, 100%)에서 잰 논리 px다(창 왼쪽 위 기준). `spec/zed-metrics.toml`에 없는 값이라 core D-12로 이 실측값을 쓴다. **gpui는 이 표를 읽어 같은 값을 쓴다.** 캡처 한 장에서 잰 값이라 다른 배율·글꼴에서는 다시 잰다.

| 항목 | 값 | 비고 |
|---|---|---|
| 창 보이는 크기 | 900×750 | 캡처의 창 사각형 916×758은 좌우·아래의 보이지 않는 크기 조절 테두리 8px 포함 |
| 타이틀 바 | 위 32px, Zed가 그림 | 최소화·최대화·닫기. 창 모양은 메인 창과 같은 방식 |
| 타이틀 바 아래 경계 | 1px | 본문은 y=33부터 |
| 왼쪽 탐색 폭 | 225 + 오른쪽 경계 1px | 배경은 본문보다 한 단계 밝다(Zed One Dark: 탐색 (47,52,62), 본문 (40,44,51)) |
| 검색칸 | x 10~214(폭 205), 높이 28, 테두리 1px | 본문 위(y=33)에서 10 아래(y 43~70). "Search settings…" |
| 범주 행 | 높이 28, pitch 28 | 첫 행 위 = 검색칸 아래 +12(y 83) |
| 선택 범주 행 | x 10~214, 배경 + 1px 테두리 | |
| 범주 글자 시작 | x 22 | 접기 chevron 포함 |
| 본문 | x 226~899, 폭 674 | |
| 본문 좌우 padding | 32 | 내용 폭 610 |
| 범위 칩 `User` | 글자 y 63~75 | 위 줄 |
| `Edit in settings.json` 버튼 | 높이 22(y 57~78) | 오른쪽 끝 = 내용 오른쪽 |
| 범주 제목 | 글자 y 110~121 | |
| 소제목 줄 | 글자 y 145~157 | 버퍼 글꼴 |
| 소제목 아래 선 | y 166, 1px | |
| 행 사이 구분선 | 1px, 내용 폭 | |
| 구분선 → 행 이름 글자 위 | 24 | |
| 이름 → 설명 첫 줄 | pitch 21 | |
| 설명 줄 | pitch 19 | |
| 마지막 설명 글자 아래 → 다음 구분선 | 20 | |
| 토글 | 32×20 | 오른쪽 끝 = 내용 오른쪽 |
| 드롭다운 | 높이 28, 폭은 글자에 맞춤(예 138) | 오른쪽 끝 = 내용 오른쪽 |
| 숫자 컨트롤 | 높이 28 | Zed 캡처에 없어 드롭다운 높이에 맞춘다 |

*"v" 버튼 Zed 실측*

tauri-leader 2026-11-07, 캡처 `specs/v0.5/verify/ORDER-06/zed-v-menu.png`(1440×852·100%). **gpui는 이 값을 읽어 같은 값을 쓴다.**

| 항목 | 값 | 비고 |
|---|---|---|
| 버튼 | 22×22, 둥근 모서리 | I-608·I-609와 같다 |
| chevron 잉크 폭 | 8 | |
| 버튼 오른쪽 끝 ↔ 최소화 버튼 | 4 | tauri는 0이었다(1단계 V3: 버튼 x=1310~1332, 최소화 x=1332). K-13에서 기존 스펙 `titlebar.right_group.gap`(L-89/I-603) 4px를 `.user-menu-button`의 오른쪽 margin으로 맞췄다. 재확인에서 4(Zed와 같음) |

*Keymap Editor (K-11)*

- 열기: `Ctrl-K Ctrl-S`와 "v" 메뉴 Keymap → `zed::OpenKeymap`. 지금 폴더의 편집 영역에 일반 탭 "Keymap Editor"를 연다. 같은 폴더에 이미 있으면 그 탭을 앞으로 가져온다. 등록 폴더가 없어도 열린다. 저장 확인·폴더 재동기화 대상이 아니다.
- 위 줄: 필터칸 "Filter action names…"(읽기 쉬운 이름과 원래 액션 이름에서 대소문자 구분 없이, 공백으로 나눈 검색어 모두), `Edit in JSON`(`Ctrl-E`), `Create Keybinding`(`Ctrl-K`).
- 표 열: Edit 아이콘(D-9 `pencil.svg`, hover·포커스에서 보임), Action, Arguments, Keystrokes, Context, Source.

| 열 | 표시 |
|---|---|
| Action | 읽기 쉬운 형식. 예 `pane::CloseActiveItem` → `pane: close active item` |
| Arguments | 인자 없음 `<no arguments>`, null `<null>`, 사용자 파일의 배열 인자는 JSON |
| Keystrokes | 기존 표시 형식. 예 `Ctrl-K Ctrl-S`. 바인딩 없는 액션은 빈 칸 |
| Context | 원문. 없으면 `<global>` |
| Source | Default 또는 User |

- 행: 기본 바인딩, 사용자 파일의 바인딩, 키가 없는 등록 액션 전부.
- 편집: Edit 아이콘, 더블클릭, 행에서 Enter로 바인딩 편집 모달을 연다. `Create Keybinding`도 같은 모달이다. Action은 등록 액션 자동완성, Context는 기존 키맵 파서로 검사한다. Record는 최대 3타(K-055)를 기록하고 녹화 중에는 앱 단축키로 보내지 않는다. Save는 바로 저장하고 바로 적용한다. 인자가 있는 사용자 바인딩은 JSON으로 고치라고 안내하고 인자를 버리지 않는다.
- 저장: `%APPDATA%\workbench-tauri\keymap.json`, Zed keymap.json 형식(섹션 배열, `context`·`bindings`, 값은 문자열 또는 null). 파일 전체를 다시 쓰지 않고 배열 끝에 override 섹션을 더해 주석·BOM·줄바꿈·알 수 없는 필드를 보존한다. 키를 바꾸면 옛 키를 null로 푸는 섹션과 새 키 섹션을 더한다. 모달을 열 때의 원문과 디스크 내용이 다르면 저장을 거부하고, 원자 교체로 쓴다. `Edit in JSON`은 파일이 없으면 `[]`로 만들고 편집기 탭으로 연다.
- 쓴 스펙 ID: K-010(padding 8·세로 gap 4), K-011(위 줄 gap 8), K-012(검색칸 높이 32·padding 8·테두리 1·radius 6), K-013(버튼 묶음 gap 4·최소 폭 320), K-020·K-021(줄무늬 표, 열 구성), K-022(아이콘 열 36, 나머지 비율), K-030·K-031(행 테두리·포커스 테두리), K-036(아이콘 버튼 18), K-050(녹화 입력), K-055(최대 3타), K-080·K-082·K-083(모달 폭 544·본문 gap 10·바닥 gap 4), L-07(버튼 높이 22·좌우 padding 4).
- 하지 않은 것: 키 입력으로 찾기·필터 메뉴 버튼(ORDER-06-R1의 선택 사항), 열 드래그 폭 조정, 가상 목록, 충돌 배너 전체, REC 애니메이션, Zed의 Esc 연타로 녹화 끝내기 세부 규칙, 인자 있는 바인딩의 GUI 편집.
- 스펙에 없는 값(넣지 않고 기본 레이아웃을 씀): Keymap 행 높이, 머리글 padding, 모달 바깥 padding·세로 위치, K-013 버튼 옆 단축키의 작은 글꼴 크기. 화면 일치에 필요하면 tauri-leader가 실측해 공급한다.
- 반복 편집하면 override 섹션이 쌓여 파일이 길어진다(코드에 `shortcut:` 주석).

*Settings 창 (K-10-R1·K-14)*

- 열기: `Ctrl-,`(`zed::OpenSettings`)와 "v" 메뉴 Settings. 별도 OS 창(label `settings`, `index.html?window=settings`)이고 처음 크기는 900×750, 메인 창과 같이 장식 없이 앱이 타이틀 바를 그린다(그림자 있음). 이미 열려 있으면 최소화를 풀고 앞으로 가져온다. 메인 창이 실제로 닫히면 Settings 창도 닫힌다. Settings 창은 작업 공간 로드·상태 저장·닫기 확인을 하지 않는다.
- 타이틀 바: 보이는 글자 없이 창 버튼과 끌기 영역만 둔다(K-14). 문서 제목은 "Settings"다. 창 버튼의 hover·눌림·활성 상태는 창(HWND)마다 따로 둔다.
- 왼쪽 탐색: 검색칸에 Zed `MagnifyingGlass` → `magnifying_glass.svg` 16px, 안쪽 왼쪽 padding 6·오른쪽 2·gap 6(`settings.search.*`). 범주 행은 `chevron_right.svg` + 글자 14px(L-05). 범주는 Appearance 하나라 펼침 기능은 두지 않고 Zed 캡처의 닫힌 아이콘으로 보인다.
- 위 줄: 범위 칩 `User` 하나(글자 14px, 높이 22, 좌우 padding 4, 반경 4, 선택 배경 테마 `info.background` — Zed Tinted(Accent)). `Edit in settings.json`은 파일이 없으면 `{}`로 만들고 메인 창의 편집기 탭으로 열며 메인 창을 앞으로 가져온다.
- 행: Appearance 페이지에 소제목 Theme·Buffer Font·UI Font(Zed 순서, K-16; 12px, `text.muted`, 버퍼 글꼴)를 두고, 그 아래 행을 둔다. 행 이름·설명은 Zed 커밋 `4304dec732`의 `crates/settings_ui/src/page_data.rs` 문구다.

| 소제목 | 행 이름 | 설명 | 키 | 컨트롤·선택지 | 기본값 |
|---|---|---|---|---|---|
| Theme | Theme Name | The name of your selected theme. | `theme` | 드롭다운: Catppuccin Mocha, Catppuccin Latte, One Light | Catppuccin Mocha |
| Theme | Icon Theme Name | The name of your selected icon theme. | `icon_theme` | 드롭다운: Zed (Default) | Zed (Default) |
| Buffer Font | Font Size | Font size for editor text. | `buffer_font_size` | 숫자 입력 + 감소·증가 버튼(1 단위, 유한한 양수만) | 15 |
| UI Font | Font Size | Font size for UI elements. | `ui_font_size` | 숫자 입력 + 감소·증가 버튼(1 단위, 유한한 양수만) | 16 |

*Settings 행 문구 표 (ORDER-06-R2, gpui 대조용)*

Zed 문구는 커밋 `4304dec732` `crates/settings_ui/src/page_data.rs`(`appearance_page`, 556줄부터)의 값을 그대로 옮겼다(코드는 옮기지 않음). 앱 표시는 `src/settings/model.ts` `ROWS`·`Settings.tsx`다.

| 자리 | 키 | Zed 문구 | page_data.rs 줄 | 앱 표시 |
|---|---|---|---|---|
| 페이지 제목·탐색 범주 | — | Appearance | 1686 | 같음 |
| 소제목 | — | Theme | 559 | 같음 |
| 소제목 | — | Buffer Font | 925 | 같음 |
| 소제목 | — | UI Font | 1104 | 같음 |
| 행 제목 | `theme` | Theme Name | 627 | 같음 |
| 행 설명 | `theme` | The name of your selected theme. | 628 | 같음 |
| 행 제목 | `icon_theme` | Icon Theme Name | 808 | 같음 |
| 행 설명 | `icon_theme` | The name of your selected icon theme. | 809 | 같음 |
| 행 제목 | `ui_font_size` | Font Size | 1120 | 같음 |
| 행 설명 | `ui_font_size` | Font size for UI elements. | 1121 | 같음 |
| 행 제목 | `buffer_font_size` | Font Size | 941 | 같음 |
| 행 설명 | `buffer_font_size` | Font size for editor text. | 942 | 같음 |
| 소제목 순서 | — | Theme → Buffer Font → UI Font(`concat_sections!` 1672~1675) | 1672~1675 | 같음(K-16, core ORDER-06-R2 결정: 두 갈래 모두 Zed 순서) |
| Theme 위 선택 행 | `theme` | Theme Mode / "Choose a static, fixed theme or dynamically select themes based on appearance and light/dark modes." | 563~564 | **다름 — 두지 않음**(core 결정 ORDER-06-R1·R2). Static일 때의 Theme Name 행만 둔다 |
| Icon Theme Name 위 선택 행 | `icon_theme` | Icon Theme / "The custom set of icons Zed will associate with files and directories." | 742~743 | **다름 — 두지 않음**(core 결정 ORDER-06-R1·R2). Static일 때의 Icon Theme Name 행만 둔다 |

- 네 행의 제목·설명 문구와 소제목 순서는 Zed와 같다(순서는 K-16). 다른 곳은 Theme Mode·Icon Theme 선택 행을 두지 않는 것뿐이며, core 결정(ORDER-06-R1·R2)에 따른 것이다.

- 드롭다운: 네이티브 select가 아니라 글자 + `chevron_up_down.svg`의 테두리 버튼이다(높이 28, 좌우 padding 8, 글꼴 14, 아이콘 14, gap 4, 반경 4; L-05·L-06·L-07). 누르면 기존 앱 메뉴 팝업을 버튼 오른쪽 아래 기준 y=2px 아래에 연다. 클릭·Enter·Space·위/아래 화살표로 열고, 선택하면 바로 저장·적용, Escape는 저장하지 않고 닫는다. 숫자 컨트롤 구성(감소·값·증가)은 Zed `components/number_field.rs`를 따랐다(Zed의 modifier별 step은 넣지 않았다).
- 검색: 페이지 제목(Appearance), 소제목, 행 이름, 설명에서 대소문자 구분 없이 공백으로 나눈 검색어 모두를 찾는다(Zed `build_search_index`가 같은 범위를 넣는다). Zed의 fuzzy·BM25 검색은 넣지 않았다.
- 적용: 저장하면 두 창이 설정을 다시 읽어 테마·글꼴 크기를 바로 적용한다. 파일을 직접 고쳐도 기존 감시기로 다시 읽는다. 열린 편집기는 레이아웃을 다시 재고, 테마가 바뀌면 구문 강조 색을 새 테마로 다시 맞춘다.
- 타이틀 바·사이드바 머리 높이: L-21(Windows 타이틀 바 32 고정)·L-39(창 버튼 36×32)라 UI 글꼴 크기를 바꿔도 rem이 아닌 px로 고정한다.
- 저장 방식은 `DECISIONS.md` D-4(두 갈래 기준), capability는 D-5에 있다.
- 쓴 테마 토큰: 탐색 `panel.background`, 본문 `background`, 검색 입력 `editor.background`, 선택 범주 `ghost_element.selected`, 입력·버튼 `element.background`(없으면 `elevated_surface.background`), 경계 `border`, 포커스 `border.focused`, 설명 `text.muted`, User 칩 `info.background`·`text.accent`.

*Panel Layout (K-10-R1)*

- `Classic`(`workspace::UseClassicLayout`): 왼쪽 dock을 열고 사용자 폭을 지워 기본 폭 `PROJECT_PANEL_DEFAULT_WIDTH` 240px(L-32 `project_panel.default_width`)로 되돌린다. 폴더 사이드바·Pane 분할·확대·활성 파일은 그대로다.
- dock이 열려 있고 폭이 240이면 `Classic`에 체크한다. 닫혔거나 폭이 다르면 `Classic` 체크를 풀고 `Custom`(체크·비활성)을 보인다. 드래그·더블클릭 복원도 같은 폭 상태를 바꾼다.

*메뉴 키 (K-13, core 결정 두 갈래 공통)*

메뉴의 키 표시는 R-17 "메뉴 키 기준"을 따른다. "v" 메뉴의 Settings `Ctrl-,`·Keymap `Ctrl-K Ctrl-S`도 Zed `default-windows.json`(1536·687줄)과 같다.

*화면 확인 (tauri-leader 2026-11-07, 1440×852·100%)*

- 근거: `specs/v0.5/verify/ORDER-06-R1/tauri-r1.json`, `tauri-settings.png`, `tauri-keymap-editor.png`, `tauri-panel-layout.png`.
- Settings 치수는 Zed 실측과 같다: 창 900×750, 탐색 225+1, 검색칸 205×28, 범주 행 28, 본문 padding 32, 컨트롤 28, 버튼 22.
- 모양 차이 6가지(타이틀 바 글자, 검색 아이콘, 범주 아이콘·글자, User 칩, 소제목, 드롭다운)와 검색 범위를 K-14로 고쳤다. 재확인 결과는 아래 "화면 재확인"에 있다.
- Keymap Editor가 탭으로 열리고 열 구성이 맞으며 행은 91개다.
- Panel Layout은 `Classic` 하나에 체크가 있다.
- "v" 버튼 오른쪽 4px(K-13)는 아래 "화면 재확인"에서 확인했다.

*확인 결과 (코드)*

- K-10-R1(V1): typecheck 통과, `npm.cmd run test` 126/126, `cargo check`·`cargo clippy -- -D warnings` 통과, `cargo test` 20개, 디버그 빌드 통과. 테스트는 실제 `%APPDATA%`를 쓰지 않았다.
- K-13(V1): 관련 10/10, typecheck, `npm.cmd run test` 127/127, 디버그 빌드 통과.
- K-14(V1): 관련 19/19·14/14, typecheck, `npm.cmd run test` 128/128, 디버그 빌드 통과.
- 리뷰(tauri-checker C-22, K-11·K-10-R1): PASS. 데이터 손실 방지(주석 보존, 깨진 파일 덮어쓰기 거부, expected 비교·원자 교체), 고정 경로만 쓰기, capability가 settings 창에만 걸림, main capability·CSP 불변. 권고: Settings 창이 파괴될 때 창별 캡션 상태 맵에서 그 항목을 지우면 더 깔끔하다(지금도 실질 누수는 아님).

*gpui와 다른 점 (K-10-R1 읽은 시점, 진행 중)*

- 네 키, 행 이름·설명, Appearance 범주, 기본 16/15는 같다.
- 테마 선택지: tauri는 지금 있는 세 테마, gpui는 읽은 시점 `Default Light`. 목록 통일은 Phase 7이다.
- settings.json 처리: gpui는 읽은 시점에 잘못된 값이면 오류를 내고 이전 값을 유지하며, 저장 때 전체 객체를 다시 써 주석을 보존하지 않았다. core-leader가 tauri 방식을 두 갈래 기준으로 정했다(D-4).
- gpui Settings 창 치수는 읽은 시점에 아직 없었다.

*Extensions 탭 (K-12)*

- 열기: `Ctrl-Shift-X`(`zed::Extensions`, Zed `default-windows.json` 717줄 Workspace)와 "v" 메뉴 Extensions(활성). Keymap Editor처럼 파일이 아닌 일반 탭 "Extensions"이고, 같은 편집 컨텍스트에 이미 있으면 그 탭을 앞으로 가져온다. 폴더가 없어도 열린다.
- 틀: 제목 "Extensions", 검색칸 "Search extensions…"(D-9 `magnifying_glass.svg`), 설치 상태 `All`/`Installed`/`Not Installed`, 범주 칩 `All`/`Themes`/`Icon Themes`, 카드 목록(이름, 버전, 태그, 설명, 작성자, 오른쪽 상태).
- 검색: 이름·설명·작성자에서 대소문자 구분 없이 공백으로 나눈 검색어 모두. 범주와 설치 상태를 함께 적용한다. `Installed`는 들어 있는 자원 전부, `Not Installed`는 늘 빈 목록이다.
- 빈 상태 문구: `No extensions`, `No installed extensions`, `No uninstalled extensions`, 검색어가 있으면 ` that match "검색어"`를 붙인다(X-49). `All`·`Not Installed` 문구의 Zed 화면 대조는 하지 않았다.
- 카드(Phase 7 K-21에서 바꿈): 복사한 확장 셋의 `extension.toml` 복사본에서 만든다. K-12의 테마 JSON 카드(One Dark·One Light: Zed Industries, Zed (Default))는 없앴다.

| 이름 | 버전 | 작성자 | 설명 | 태그 | 저장소 버튼 | 출처 |
|---|---|---|---|---|---|---|
| Catppuccin | 0.2.27 | Catppuccin <releases@catppuccin.com> | 🦀 Soothing pastel theme for Zed | Themes | https://github.com/catppuccin/zed | `src/theme/assets/catppuccin/extension.toml` |
| Catppuccin Icons | 1.24.0 | Catppuccin <releases@catppuccin.com> | 🦊 Soothing pastel icons for Zed | Icon Themes | https://github.com/catppuccin/zed-icons | `src/assets/icon-themes/catppuccin-icons/extension.toml` |
| macOS Classic Theme | 0.4.0 | Jason Lee <huacnlee@gmail.com> | A macOS native style theme, let it same like native app in macOS. | Themes | https://github.com/huacnlee/zed-theme-macos-classic | `src/theme/assets/macos-classic/extension.toml` |

- 값 출처: `extension.toml` 첫 `[table]` 앞의 최상위 문자열 키 `id`·`name`·`version`·`authors`·`description`·`repository`만 읽는다(`src/extensions/model.ts` `parseManifest`). 값은 원본 그대로이고 없는 필드는 빈 문자열이다. `authors` 배열은 `, `로 잇는다(Zed 캡처 `specs/v0.5/verify/ORDER-06/zed-extensions.png`의 작성자 줄과 같은 방식). 숫자·불린 키는 건너뛴다. 파싱 실패나 `name` 없음이면 그 카드만 빠진다(`shortcut:` 주석: 인라인 테이블·여러 줄 문자열은 읽지 않는다). 새 의존성은 없다.
- 태그 판정: 확장 폴더에 `themes/*.json`이 있으면 Themes, `icon_themes/*.json`이 있으면 Icon Themes(둘 다 있으면 태그 둘). 자원 JSON이 없으면 카드가 없다.
- 정렬: 이름순(`localeCompare`) — Catppuccin, Catppuccin Icons, macOS Classic Theme.
- GitHub 버튼: 카드 오른쪽 아래(Zed 캡처의 GitHub 아이콘 자리)에 `github.svg` 버튼을 둔다. `repository`가 `https://`로 시작할 때만 보이고 `openUrl`로 연다(opener 권한은 이미 `https://*`, 바꾸지 않음).
- 기본 묶음 카드 없음: One·Ayu·Gruvbox 테마와 Zed (Default) 아이콘 테마는 카드로 보이지 않는다(core 결정 2026-11-07, 두 갈래 공통: `extension.toml`이 있는 확장만 카드). Zed Extensions 화면은 확장 패키지만 나열하고 본체 내장 테마·아이콘 테마는 나오지 않는다(`docs/refs/01-zed/02-INTERACTION.md` 16절 첫 문단). 이 묶음은 `extension.toml`이 없는 본체 자원이다(`DECISIONS.md` D-7).
- 복사본이 없으면 그 카드가 빠진다. 설치된 Zed 확장 폴더는 읽지 않는다.
- 결과: Install Themes → Themes 범주에 Catppuccin·macOS Classic Theme 두 장, Install Icon Themes → Icon Themes 범주에 Catppuccin Icons 한 장.
- 쓴 스펙 ID: X-44(탭·액션·키), X-45(머리 padding 위·좌우 16, 행 gap 16), X-46(검색 높이 32·최소 폭 384·좌우 padding 6/8·gap 8·테두리 1·반경 6·글꼴 14·줄 높이 1.3), X-48(범주 gap 8·padding 위아래 10·좌우 16·아래 테두리 1), X-49(목록 padding 좌우·아래 16, 카드 위 margin 16·높이 110·padding 12·gap 8·테두리 1·반경 6), L-05·L-06·L-07.

*Extensions 화면 항목 표 (ORDER-06-R2, gpui 대조용)*

근거: `src/extensions/model.ts`·`Extensions.tsx`·`extensions.css`, K-12 보고. Phase 7 K-21 결과로 고쳤다(필터 조합·정렬·카드 필드). 코드에서 확인하지 못한 것은 "미정"이다.

| 자리 | 값·규칙 | 근거 |
|---|---|---|
| 제목 | "Extensions" | `Extensions.tsx` |
| 검색칸 | 자리표시 "Search extensions…", 아이콘 `magnifying_glass`(D-9) | `Extensions.tsx` |
| 설치 상태 전환 | `All` / `Installed` / `Not Installed` 순서, 처음 `All`. 검색칸 오른쪽 | `INSTALL_FILTERS` |
| 범주 칩 | `All` / `Themes` / `Icon Themes` 순서, 처음 `All`. 검색 줄 아래 | `CATEGORIES` |
| 검색 대상 | 이름·설명·작성자(버전·태그는 찾지 않음) | `filterExtensions` |
| 검색 규칙 | 앞뒤 공백을 빼고 공백으로 나눈 검색어가 모두 들어 있어야 함, 대소문자 무시, 단순 포함(퍼지 아님). 검색어가 없으면 전부 | `filterExtensions` |
| 필터 조합 | 범주 AND 설치 상태 AND 검색. 범주는 카드 태그에 들어 있으면 맞음(`kinds.includes`). `All`·`Installed`는 같은 목록(모두 복사 자원), `Not Installed`는 늘 빈 목록 | `filterExtensions` |
| 정렬 | 확장 이름 `localeCompare` 순. 필터 뒤에도 순서를 유지 | `bundledExtensions` |
| 빈 상태 문구 | `All` → `No extensions`, `Installed` → `No installed extensions`, `Not Installed` → `No uninstalled extensions`. 검색어(앞뒤 공백 뺌)가 있으면 ` that match "검색어"`를 붙임 | `emptyExtensions` |

| 카드 필드 | 출처 | 빈 값 처리 | 표시 |
|---|---|---|---|
| 이름 | `extension.toml` `name` | 없으면 카드를 만들지 않음 | 기본 글자 크기 |
| 버전 | `extension.toml` `version` | 없으면 비움(표시하지 않음) | 있으면 `v` + 버전, 이름 오른쪽, `text.muted` |
| 태그 | 확장 폴더의 자원 JSON: `themes/` → `Themes`, `icon_themes/` → `Icon Themes`(둘 다면 둘) | 자원 JSON이 없으면 카드 없음 | 작은 글자, `element.background` 칩 |
| 설명 | `extension.toml` `description` | 없으면 빈 줄 | 작은 글자, 한 줄 말줄임 |
| 작성자 | `extension.toml` `authors`를 `, `로 이음 | 없으면 빈 줄 | 작은 글자, `text.muted`, 한 줄 말줄임 |
| 오른쪽 상태 | 고정 문구 "Installed" | 늘 있음 | `text.muted`, 버튼 아님(누를 수 없음) |
| 저장소 버튼 | `extension.toml` `repository` | `https://`로 시작하지 않으면 버튼 없음 | 작성자 줄 오른쪽 `github` 아이콘 버튼, `openUrl` |

- 값은 지어내지 않는다. 깨진 `extension.toml`·`name` 없음·자원 JSON 없음은 카드를 만들지 않는다. 기본 묶음(One·Ayu·Gruvbox·Zed (Default))은 카드가 없다(위 K-21, `DECISIONS.md` D-7).
- 카드 치수: X-49(위 margin 16, 높이 110, padding 12, gap 8, 테두리 1, 반경 6). 목록 X-49(좌우·아래 padding 16). 범주 줄 X-48, 검색칸 X-46, 머리 X-45, 탭·액션·키 X-44.
- 미정: 제목·카드 이름의 전용 글자 크기(toml에 Headline 수치가 없어 기본 UI 글자 크기를 상속), 작성자 아이콘(넣지 않음).

*Extensions의 Zed와 다른 점 (core D-15·D-8)*

- 온라인 목록 대신 이 앱에 복사된 확장만 보인다(Phase 7 뒤 카드 3개: Catppuccin, Catppuccin Icons, macOS Classic Theme).
- 범주 칩은 `All`·`Themes`·`Icon Themes` 셋뿐이다.
- 설치·제거, `Install Dev Extension`, 다운로드 수, 카드 더보기 메뉴가 없다. 카드 오른쪽은 누를 수 없는 "Installed" 문구이고, 저장소 GitHub 버튼만 누를 수 있다(K-21).
- 검색은 단어 포함 방식이다(Zed의 fuzzy 검색·`id:` 검색 없음).
- 제목·카드 이름의 Headline 크기는 `spec/zed-metrics.toml`에 없어 UI 글자 크기를 그대로 쓴다(추정하지 않음). 작성자 앞 Person 아이콘은 없다.
- 목록은 일반 스크롤 목록이다.

*입력란 포커스의 키 처리 (K-15)*

- 문제: 입력란(`data-text-input`)에 포커스가 있으면 모든 바인딩 dispatch를 건너뛰어, Extensions 검색에서 `Ctrl-,`가 Settings를 열지 못했다(leader 재확인에서 발견). v0.2의 트리 이름 입력 보호 규칙이 원인이다.
- 고친 규칙(`src/keymap/keyboard.ts`): 포커스가 `<input>`이면 표시 유무와 관계없이 Workspace 루트 바인딩과 문맥 없는 전역 바인딩만 dispatch한다. 입력을 감싼 ProjectPanel·Pane·KeymapEditor 바인딩은 쓰지 않는다.
- 입력에 남기는 키: 수정자 없는 문자·Shift 문자, Backspace·Delete·방향키·Home·End·PageUp·PageDown·Insert·Enter·Escape·Tab(수정자 조합 포함), `Ctrl`+A·C·X·V·Z·Y(Shift가 붙은 A·V·Z·Y 포함, `Ctrl-Shift-X`는 Extensions로 보냄), IME 조합 중 입력, Dead 키, AltGr와 겹치는 `Ctrl`+`Alt` 조합.
- 편집 키를 입력에 넘기면 대기 중인 chord를 비운다. 키맵 녹화 영역은 지금처럼 가장 먼저 우회한다.
- 한계(`shortcut:` 주석): 입력 포커스에서 수정자 없는 타건으로 끝나는 chord(예 `Ctrl-K V`)와 `Ctrl`+`Alt` Workspace 키는 이어지지 않는다. `Ctrl-K Ctrl-S`처럼 각 타건에 수정자가 있는 chord는 동작한다. Zed 입력 컨텍스트 소스와는 대조하지 않았다.

*화면 재확인 (tauri-leader 2026-11-07, 1440×852·100%)*

근거: `specs/v0.5/verify/ORDER-06-R1/tauri-recheck.json`, `tauri-extensions.png`, `tauri-settings-after.png`, `tauri-settings-dropdown.png`, `tauri-user-menu.png`, `tauri-menu-edit.png`.

- "v" 버튼 22×22, 최소화 버튼과 간격 4(Zed와 같다). "v" 메뉴의 Extensions `Ctrl-Shift-X`가 활성이다.
- `≡` 메뉴 Close Editor `Ctrl-W`, Redo `Ctrl-Y` 표시.
- Extensions 탭: 제목, 검색칸(X-46), `All`/`Installed`/`Not Installed`, 칩 `All`/`Themes`/`Icon Themes`, 카드 3개(One Dark·One Light: Zed Industries, Zed (Default)), 오른쪽 "Installed" 표시만.
- Settings(K-14 뒤): 타이틀 바 글자 없음, 검색 돋보기, 범주 `chevron_right`, User 칩, 작은 소제목, 자체 드롭다운(위아래 화살표 아이콘, 앱 팝업 목록·체크).
- K-15 뒤 Extensions 검색에 포커스가 있을 때 `Ctrl-,`로 Settings 창이 열린다.

*남은 차이*

- Settings 범주 글자 시작 x 39(Zed 43, 4px 왼쪽).

*확인 결과 (K-12·K-15·C-23)*

- K-12(V1): typecheck 통과, `npm.cmd run test` 130/130, 디버그 빌드 통과(Rust 경고 없음), `git diff --check` 통과.
- K-15(V1): `src/keymap/keyboard.test.ts`(신규) 통과, typecheck 통과, 전체 131/131, 디버그 빌드 통과.
- 리뷰(tauri-checker C-23, K-13·K-14·K-12): PASS, 지적 없음. typecheck 통과, `npm.cmd run test` 131/131, `cargo test` 20개, `cargo clippy -- -D warnings` 경고 0. 네트워크·설치 코드 없음, 복사 자원만 읽음, 메타데이터를 지어내지 않음, 의존성·CSP 불변.

*gpui와 다른 점 (K-12 읽은 시점)*

gpui `src/ui/app_menu.rs`에 Extensions 메뉴와 `Ctrl-Shift-X`는 있으나, Extensions 화면·카드·칩·빈 상태 구현은 찾지 못했다. 메뉴 이름·키는 같고, 화면 항목은 gpui 구현 뒤 대조한다.

---

## R-3. Zed처럼 아이콘 테마를 추가하고 고를 수 있게 한다

**요구**

미리 정한 아이콘 테마 목록에서 하나를 고르면 UI 아이콘이 그 테마로 바뀐다. 목록은 이 PC의 Zed에서 쓸 수 있는 아이콘 테마를 모두 복사한 것이다(Catppuccin Icons, Zed 기본 파일 아이콘). 복사본은 `.gitignore` 폴더에 둔다.

**정해진 결과**

Icon Themes 선택 화면(R-2와 연결)에서 고른 아이콘 테마로 파일 아이콘이 바뀐다.

**판정 방법**

Icon Themes 선택 화면에 D-8로 복사한 아이콘 테마가 모두 나온다. 하나를 고르면 파일 트리와 탭의 파일 아이콘이 그 테마로 바뀐다. 같은 아이콘 테마를 고른 Zed 캡처와 모양이 같다. V3.

**출처**

I-3, core D-8·D-9, 사용자 2026-11-06.

**Phase 7 결과 (core ORDER-07, K-17·K-20·K-21)**

*목록과 기본값*

- 9종, 이 순서로 보인다: Catppuccin Frappé, Catppuccin Frappé Monochrome, Catppuccin Macchiato, Catppuccin Macchiato Monochrome, Catppuccin Mocha, Catppuccin Mocha Monochrome, Zed (Default), Catppuccin Latte, Catppuccin Latte Monochrome.
- 정렬 근거: `docs/refs/01-zed/03-THEME-ICONS.md` T-21.3(아이콘 테마 선택기도 테마 선택기와 같은 정렬)·T-32.4 — 어두운 것 먼저, 밝은 것 나중, 각각 이름의 문자열 비교 순. Zed (Default)의 appearance는 K-17이 쓴 `dark`라 어두운 Catppuccin 뒤, 밝은 Catppuccin 앞에 온다. Zed 소스 `icon_theme.rs`로는 이 PC에서 확인하지 못했다.
- Monochrome 네 종: T-20.6은 "채용하지 않는다(판단)"지만 ORDER-07 2장이 그 확장의 아이콘 테마 전부를 요구해 넣었다. core 결정(2026-11-07, 두 갈래 공통)으로 Monochrome 4종 포함 9종, 어두운 것 이름순 → 밝은 것 이름순이 확정이다.
- 기본값은 Zed (Default)다. `settings.json`에 `icon_theme`이 없거나 목록에 없는 이름이면 Zed (Default)로 읽고 그린다(T-32.19).
- 목록은 `src/theme/icon-themes.ts` `buildIconThemes`가 `zed-default.json`과 `icon_themes/*.json`에서 만든다. 깨진 JSON·이름 중복·appearance 틀림은 건너뛴다. 목록은 빌드 때 고정이다(복사본을 바꾸면 다시 빌드).

*선택기 "Select Icon Theme..."*

- 열기: "v" 메뉴 Icon Themes…(활성), 액션 `icon_theme_selector::Toggle`. 키는 없다(Zed 기본 키맵 `v05-K-13-zed-default-windows.json`에 `icon_theme_selector` 항목 없음, P-011).
- 모양·키·닫기는 R-4의 "Select Theme..." 선택기와 같다(같은 `PickerConfig`·`openPicker`, 아래 R-4). 문구는 placeholder `Select Icon Theme...`, 푸터 오른쪽 `Install Icon Themes`(P-011). Zed의 `View Icon Theme Docs`는 넣지 않았다.
- 미리보기: 위아래로 움직이거나 마우스를 올리면 적용 중인 아이콘 테마만 바꿔 파일 트리가 바로 따라간다(저장하지 않음).
- 확정: Enter·클릭이면 `settings.json`의 `icon_theme`에 저장한다. Esc 등 그 밖의 닫기는 연 때의 이름으로 되돌린다.
- 열 때 설정 값이 목록에 없으면 첫 항목이 선택되고 체크는 없다(T-32.16).
- `Install Icon Themes`: 되돌린 뒤 Extensions 탭을 Icon Themes 범주로 연다(R-2 Extensions, core D-15).
- Settings 창 Icon Theme 드롭다운도 같은 9종이고, 같은 `settings.json` 저장·감시 경로라 선택기와 값을 공유한다(`src/settings/choices.ts`).

*아이콘 결정 규칙 (T-22, `fileIcon`·`dirIcon`)*

- 파일(T-22.1~22.6): 이름 전체로 stems → suffixes를 찾고, 없으면 이름에서 첫 `.` 앞부분을 떼어 가며 같은 조회를 되풀이한다(`a.stories.tsx` → `stories.tsx` → `tsx`, `.data.json` → `json`). 그다음 첫 `.` 앞 스템(`Dockerfile.prod` → `Dockerfile`)을 보고, 모두 실패하면 키 `default`다.
- 얻은 키는 현재 테마 `file_icons` → Zed (Default) `file_icons` → 기본 파일 아이콘(현재 테마 `default`, 없으면 Zed (Default) `default`) 순서로 찾는다. 원본의 정의 없는 키(`bak` → `backup`)도 기본 파일 아이콘이 된다.
- 확장 테마의 stems·suffixes는 Zed (Default) 표 위에 덮어쓴 것으로 찾는다(T-32.10: 테마 값이 이기고 stems가 suffixes보다 먼저).
- 폴더(T-22.7~22.10): 현재 테마 `named_directory_icons[이름 양끝 공백 제거, 대소문자 구분]` → Zed (Default)의 것(비어 있음) → 현재 테마 `directory_icons` → Zed (Default) `directory_icons`. 펼침 여부로 `expanded`/`collapsed`를 고른다. `null` 경로는 다음 단계로 넘어간다. 접힌 폴더 경로 행(`a\b`)은 마지막 구간 이름으로 찾는다.
- 경로 검사(T-32.11, K-21): 아이콘 `path`는 테마 루트(`icon_themes/` 아래 JSON은 확장 루트, 생성된 `zed-default.json`은 `src/assets/`) 기준으로 푼다. 절대 경로·URL·역슬래시·널 문자·`..`는 모두 거부하고, 결과가 복사된 아이콘 폴더(`zed-icons/file_icons`, `icon-themes/catppuccin-icons/icons`)의 실제 SVG가 아니면 버린다.
- 표는 `Map`이라 `constructor` 같은 파일 이름이 프로토타입을 건드리지 않는다.

*색과 그리는 곳*

- 색: Zed (Default)는 SVG를 `themedSvg`로 `currentColor`화해 트리 아이콘 색(`--icon-muted`)의 단색으로 그린다. Catppuccin은 `<img>`로 SVG 원래 색 그대로 그린다(T-20.7 "테마 색을 주입하지 않는다", T-31.8). Catppuccin 테마 안에서 Zed (Default)로 대체된 아이콘은 단색이다.
- 그리는 곳: 파일 트리(`src/shell/ProjectTree.tsx` → `src/shell/FileIcon.tsx`)의 파일·폴더 행, 루트 폴더 행, 새 파일·폴더 입력 행(이름이 없어 기본 아이콘). 크기는 기존 `--icon-size`(L-40)다. UI 아이콘(R-1)은 바뀌지 않는다.
- 펼침 화살표(`chevron_icons`)는 그리지 않는다. 파일 트리는 폴더 아이콘으로 열림을 보인다(L-126 `folder_indicator: icon`).
- **탭에는 파일 아이콘이 없다.** Zed 기본 `tabs.file_icons`가 false이고(`docs/refs/01-zed/01-LAYOUT.md` L-67·L-131, `04-APP-SPEC.md` A-21.12) 사용자 Zed 설정에도 이 키가 없어, Zed 편집기 탭에 파일 아이콘이 없다. 마크다운 미리보기 탭의 책 아이콘은 탭 자체 아이콘(L-69)이라 그대로다. ORDER-07 3.2·4장 3의 "파일 트리와 탭의 파일 아이콘" 문장과 달랐으나, core 결정(2026-11-07, 두 갈래 공통)으로 탭에는 그리지 않고 아이콘 테마는 파일 트리에만 쓰는 것으로 확정했다.
- 쓴 스펙 ID: T-11.1~11.7, T-20.4·20.5·20.7·20.14, T-21.3, T-22.1~22.10, T-28.5·28.7, T-31.8, T-32.4·32.10·32.11·32.16·32.19, P-010·P-011, L-40, L-67·L-131·A-21.12, L-126.
- 복사본이 없을 때: 아래 R-4 "복사본 출처".

*확인 결과 (코드)*

- K-20(V1): typecheck 통과, `npm run test` 165/165(icon-themes 6건: 목록·경로 검사·파일 규칙·확장 테마 덮어쓰기·폴더·실제 복사본 9종). `npm run build` 1회로 Catppuccin SVG가 `?no-inline` 파일 URL로 나오고 `data:`로 인라인되지 않음을 확인(CSP `img-src`에 `data:` 없음), `dist/`는 지움.
- K-21(V1): typecheck 통과, `npm run test` 167/167(경로 `..` 거부, 재생성 복사본 9종의 모든 조회 경로 존재).
- 실측 필요(V3): 트리 아이콘 크기·정렬, Zed (Default) 단색 여부, Catppuccin Latte/Mocha의 파일·폴더 아이콘(README.md, `*.md`, `src/`, `docs/`, `.git/`, `node_modules/`, 알 수 없는 확장자)과 Zed 캡처 대조(ORDER-07 4장 3: Catppuccin Latte), 선택기 미리보기 중 트리 즉시 변경, 9종 전환 중 깨짐, Monochrome SVG의 색.

---

## R-4. 테마를 추가하고 "v" 메뉴의 Themes에서 골라 바꿀 수 있게 한다

**요구**

미리 정한 테마 목록에서 하나를 고르면 UI 테마가 그 테마로 바뀐다. 목록은 이 PC의 Zed에서 쓸 수 있는 테마를 모두 복사한 것이다(Ayu 3종, Gruvbox 6종, One Dark·Light, Catppuccin, macOS Classic). 복사본은 `.gitignore` 폴더에 둔다. 이미 커밋된 One 테마(`src/theme/assets/one/`, LICENSE 포함)는 그대로 둔다.

**정해진 결과**

Themes 선택 화면에서 고른 테마로 UI 색이 바뀐다. 지금 tauri는 테마 셋(Catppuccin Mocha·Latte, One Light)을 코드에 고정하고 URL 매개변수로만 바꾼다(`src/theme/apply.ts`).

**판정 방법**

Themes 선택 화면에 D-8로 복사한 테마가 모두 나온다. 하나를 고르면 UI 색이 그 테마로 바뀐다. 같은 테마를 고른 Zed 캡처와 주요 색(배경, 글자, 경계, 강조)이 같다. V3.

**출처**

I-4, core D-8, 사용자 2026-11-06.

**Phase 7 결과 (core ORDER-07, K-17·K-18·K-19)**

*목록과 기본값*

- 21종, 이 순서로 보인다.
  - 어두운 13: Ayu Dark, Ayu Mirage, Catppuccin Frappé, Catppuccin Frappé - No Italics, Catppuccin Macchiato, Catppuccin Macchiato - No Italics, Catppuccin Mocha, Catppuccin Mocha - No Italics, Gruvbox Dark, Gruvbox Dark Hard, Gruvbox Dark Soft, One Dark, macOS Classic Dark
  - 밝은 8: Ayu Light, Catppuccin Latte, Catppuccin Latte - No Italics, Gruvbox Light, Gruvbox Light Hard, Gruvbox Light Soft, One Light, macOS Classic Light
- 정렬 근거: `docs/refs/01-zed/03-THEME-ICONS.md` T-21.3·T-32.4(Zed `theme_selector.rs` L176-L182) — 어두운 것 먼저, 밝은 것 나중, 각각 이름의 문자열 비교(대소문자·악센트를 코드 값 그대로) 순. 소문자 `macOS`가 대문자 이름 뒤로 가는 것은 이 비교의 결과다. 이 PC에 Zed 소스가 없어 원문 코드는 열지 못했고 실측 문서에 의존했다.
- 테마 이름은 원본 JSON의 `name` 그대로다.
- 기본값은 One Dark다(`src/theme/registry.ts` `DEFAULT_THEME`). `settings.json`에 `theme`이 없거나 목록에 없는 이름이면 One Dark로 읽는다. URL `?theme=` 덮어쓰기도 목록에 없으면 One Dark다.
- 목록은 `src/theme/themes.ts`가 `src/theme/assets/**/*.json`(one/·zed/·catppuccin/·macos-classic/)을 빌드 때 eager raw glob으로 묶고, `buildRegistry`가 테마마다 `findTheme`로 검증해 만든다. 깨진 JSON·`themes`가 배열 아님·이름 없음·appearance 틀림·style 없음은 건너뛰고, 이름이 겹치면 경로 순으로 앞 것만 쓴다. 설치된 Zed 확장(`zlext` 스킴)에서 Catppuccin을 읽던 코드와 코드에 고정한 테마 셋은 없앴다(core D-8). `zlext` 스킴 자체는 `src/syntax/highlight.ts`가 쓰므로 남았다.
- Settings 창 Theme 드롭다운도 같은 21종이다.

*선택기 "Select Theme..."*

- 열기: "v" 메뉴 Themes…(활성)와 `Ctrl-K Ctrl-T`(액션 `theme_selector::Toggle`, Workspace, `v05-K-13-zed-default-windows.json` 688줄). 키는 `BUILTIN`이 아니라 `THEME_SELECTOR_BINDINGS`(`src/theme/selector.ts`)에 두었고 Keymap Editor 목록에도 나온다. ☰ 앱 메뉴에는 넣지 않았다.
- 모양: 네이티브 모달 `<dialog>`(맨 위 레이어, 뒤 페이지 inert). 위 검색칸(placeholder `Select Theme...`) → 테마 목록 → 푸터. 열 때 지금 테마가 선택돼 있고 검색칸에 포커스가 간다. 체크는 열 때의 테마 한 줄에만 있다. 맞는 글자는 `text.accent`, 선택 줄은 `ghost_element.selected`, 결과가 없으면 `No matches`.
- 키(P-005): 위·`Ctrl-P`·`Shift-Tab`, 아래·`Ctrl-N`·`Tab`, Home/End/PageUp/PageDown, Enter, Escape. 끝에서 순환한다(P-004). PageUp/PageDown은 처음/끝이다(앱 `menu` 컨텍스트, K-13이 Zed 핀 키맵으로 확인). 02-INTERACTION 14.1 문장의 "이전/다음"과 다르다.
- 미리보기: 키 이동, 마우스 올림, 검색어가 바뀌어 첫 항목이 바뀔 때마다 그 테마를 메모리에서만 적용한다(편집 영역 구문 색 포함).
- 확정: Enter·클릭이면 모달을 닫고 `settings.json`의 `theme`에 저장한다. 저장이 실패하면 알림을 띄우고 되돌린다.
- 되돌림: Esc, 바깥 왼쪽 클릭, 같은 토글 키(`Ctrl-K Ctrl-T` 다시), 푸터 버튼이면 연 때의 테마로 돌아간다. 닫으면 연 때의 포커스 요소로 돌아간다. 열린 선택기 위에 다른 선택기를 열면 앞 것은 되돌림부터 한다.
- 푸터 오른쪽 `Install Themes`: 되돌린 뒤 Extensions 탭을 Themes 범주로 연다(탭이 있으면 그 탭을 앞으로, 범주만 바꿈). Zed의 `View Theme Docs ↗`는 넣지 않았다(ORDER-07 3.1).
- 키보드만으로 모두 할 수 있다.
- 구현: `src/shell/picker.ts`(`PickerConfig`·`openPicker`)·`Picker.tsx`(`PickerHost`, `App.tsx`에 한 번)·`picker.css`. 아이콘 테마 선택기(R-3)도 설정만 바꿔 같은 것을 쓴다.
- 검색은 자체 퍼지 검색이다(`DECISIONS.md` D-9).

*쓴 스펙 ID*

| ID | 쓴 곳 |
|---|---|
| P-001 | 위 80(`picker.modal_top_offset`), 가로 가운데, 창을 어둡게 하지 않음(투명 backdrop), 바깥 왼쪽 클릭·같은 토글 키로 닫힘 |
| P-002 | 폭 544(창 폭 95% 이하), 목록 최대 높이 384, 높이 제한 (창 높이 − 160) × 0.95, 반경 8, 테두리 1, elevation_3 그림자 4겹 |
| P-003 | 입력 줄 높이 36, `padding_x` 10, `gap` 4, 구분선 1(`border.variant`) |
| P-004 | 목록 `padding_y` 4, 항목 `margin_x` 4·`padding_x` 6·`padding_y` 4·반경 4·`gap` 4, 순환, hover로 선택, 선택 배경, 맞는 글자 `text.accent`, `No matches` |
| P-005 | 위 키 목록 |
| P-006 | 배경 `elevated_surface.background`, 테두리 `border.variant`, 글자 `text`, placeholder `text.placeholder`, 체크 `icon.muted` |
| P-010 | placeholder `Select Theme...`, 푸터 padding 8·위 구분선 1, 오른쪽 `Install Themes`, 체크 16, 미리보기·Enter 저장·Esc 되돌림 |
| P-011 | 아이콘 테마 선택기(R-3) |
| T-21.3~21.6, T-32.4 | 정렬, 미리 적용, 취소 되돌림, 확정 저장 |

- `spec/zed-metrics.toml`에 없는 값(그림자 4겹, 창 높이 마진 160, 행 높이 계산용 줄 높이 1.618, 빈 결과 위아래 8, 체크 16)은 `docs/refs/01-zed/01-LAYOUT.md` 4.13 본문 값을 썼다(`DECISIONS.md` D-10). core 결정(2026-11-07)으로 gpui writer가 이 값에 toml ID를 붙여 올렸고, K-23에서 그 ID 참조로 바꿨다.
- 푸터 버튼 모양은 문서에 값이 없어 `buttons.height.default`·`padding_x.default_compact`·`settings.control.corner_radius`를 빌린 투명 버튼이다.
- 문구 출처: `01-LAYOUT.md` 4.13.5 P-010·4.13.3, `02-INTERACTION.md` 14.1·14.5(핀 커밋 14b7b0e). 원문 코드로는 확인하지 못했다.

*Zed와 다르거나 하지 않은 것*

- 목록 스크롤바(K-22): 포인터가 목록 위에 있을 때만 색이 보인다(P-004, core 결정 2026-11-07 두 갈래 공통). 폭은 L-308 `scrollbar.width.ui` 6px, 트랙·썸은 스크롤바 토큰이다. Zed의 자동 숨김 1초(E-033)와 썸 최소 25px은 하지 않았다.
- 최대 높이 384는 목록에만 건다(입력 줄·푸터 제외). 문서가 어디에 거는지 밝히지 않아 목록으로 가정했다.
- `Ctrl-C`로 닫기는 넣지 않았다(입력칸에서는 복사 키).
- 입력칸이 포커스를 잃으면 닫히는 동작은 만들지 않았다. 모달이 포커스를 안에 가두므로 창 전환 때만 해당한다.
- 커서 색 `players[0].cursor`(P-006) 토큰은 더하지 않았다. 입력칸 캐럿은 글자색을 따른다.
- 미리보기 중 `settings.json`이 밖에서 바뀌면 저장된 테마로 다시 그려진다(미리보기가 풀림).

*테마 토큰 대응 표 (앱 자리 → 테마 토큰)*

`TARGET_TOKENS` 40개(`src/theme/theme.ts`)를 CSS 변수 `--<토큰의 . _ [ ]를 ->`로 둔다(`players[0].selection` → `--players-0-selection`). 원본 테마 JSON의 토큰 이름과 Zed의 쓰임을 따른다. 두 갈래 표 대조는 gpui 표를 읽은 뒤 한다.

| 앱 자리 | 토큰 |
|---|---|
| 창 바탕 | `background` |
| 경계 / 보조 경계 / 포커스 링 / 분할선 | `border` / `border.variant` / `border.focused` / `pane_group.border` |
| 타이틀 바(활성·비활성) | `title_bar.background` / `title_bar.inactive_background` |
| 글자(기본·흐림·비활성) | `text` / `text.muted` / `text.disabled` |
| 입력 자리표시(선택기 검색칸) | `text.placeholder`(K-19) |
| 아이콘(흐림·비활성) | `icon.muted` / `icon.disabled` |
| hover·active·선택 | `ghost_element.hover` / `ghost_element.active` / `ghost_element.selected` |
| 상태 바 | `status_bar.background` |
| 탭 바·활성 탭·비활성 탭 | `tab_bar.background` / `tab.active_background` / `tab.inactive_background` |
| 패널(트리) | `panel.background` |
| 편집 영역 배경·글자 | `editor.background` / `editor.foreground` |
| 거터·줄 번호·현재 줄 번호·현재 줄 | `editor.gutter.background` / `editor.line_number` / `editor.active_line_number` / `editor.active_line.background` |
| 선택 영역 | `players[0].selection` |
| 스크롤바 thumb(기본·hover·active)·track | `scrollbar.thumb.background` / `scrollbar.thumb.hover_background` / `scrollbar.thumb.active_background` / `scrollbar.track.background` |
| 툴팁·메뉴·모달 | `elevated_surface.background` + `border.variant` |
| 오류·경고·강조(수정 점, 선택기 맞는 글자) | `error` / `warning` / `text.accent` |
| Settings User 범위 칩 | `info.background` |
| 탭 드롭 대상·삽입선 | `drop_target.background` / `drop_target.border` |
| Markdown 툴바 | `toolbar.background` |
| Keymap·Extensions 버튼 배경, Extensions 태그 | `element.background`(`TARGET_TOKENS` 밖, `apply.ts`가 `--element-background`로 따로 둠) |
| 구문 색 | `style.syntax` 전체(`syntaxCss`). 21종 모두 `parseColor`를 통과한다. 구문 강조 대응은 Phase 11(R-15) |

*빠진 토큰과 대체 순서*

- 순서: JSON 값 → 같은 테마의 파생 값(T-26.3·T-26.4) → 같은 밝기의 One 테마 값(dark → One Dark, light → One Light) → 고정 값(T-26.13). 이전에는 JSON 값도 T-26 대체도 없으면 테마 적용이 실패했다. One 값 근사는 `DECISIONS.md` D-8이고, core 결정(2026-11-07)으로 두 갈래 공통 순서다.
- 테마별로 대체가 쓰인 토큰:

| 테마 | 파생(T-26) | One 값 | 고정 |
|---|---|---|---|
| Ayu Dark·Ayu Light·Ayu Mirage·One Dark·One Light | `scrollbar.thumb.active_background`(→ `scrollbar.thumb.background`), `pane_group.border`(→ `border`) | 없음 | `drop_target.border`(#d7dadf) |
| Catppuccin 8종(Latte·Frappé·Macchiato·Mocha, 각 일반·No Italics) | `scrollbar.thumb.active_background` | 없음 | `drop_target.border` |
| Gruvbox 6종 | `pane_group.border` | 없음 | `drop_target.border` |
| macOS Classic Light | `scrollbar.thumb.active_background`, `pane_group.border` | One Light: `title_bar.inactive_background`, `ghost_element.active`, `text.disabled`, `icon.muted`, `icon.disabled`, `error`, `drop_target.background` | `drop_target.border` |
| macOS Classic Dark | `scrollbar.thumb.active_background`, `pane_group.border` | One Dark: Light의 일곱 개 + `warning`, `text.accent`, `text.placeholder` | `drop_target.border` |

- `element.background`는 21종 모두 JSON에 있다.

*확인 결과 (코드)*

- K-18(V1): typecheck 통과, `npm run test` 151/151(테마 21종 토큰 대조, registry 2건: 빈 입력 → 빈 목록, 없는 이름 → One Dark).
- K-19(V1): typecheck 통과, `npm run test` 158/158(퍼지·순환·키 매핑, 미리보기 → 되돌림, 확정 → 저장 값, 저장 실패 시 복원, `Ctrl-K Ctrl-T` 바인딩, 토큰 대조에 `text.placeholder`). 화면은 코드 확인만.
- 실측 필요(V2·V3): P-001 위치, P-002 폭·목록 높이, P-003 입력 줄·구분선, P-004 항목 여백·행 높이, P-006 색, P-010 푸터, 체크 16, 모달이 위쪽 가운데에 뜨는지, 그림자 4겹, 21종 미리보기 전환, 테마마다 주요 자리 색과 JSON 토큰 값 대조(ORDER-07 4장 2).
- 알아둘 것: 테마 JSON은 시작 때 한 번 파싱한다(복사본 포함 약 340KB, 파일 6개). 이름·appearance를 알려면 파싱이 필요해 파일별 lazy 읽기는 하지 않았다(`themes.ts` `shortcut:` 주석).

**복사본 출처 (R-3·R-4 공통, core D-8)**

| 묶음 | 저장소 | 태그 / 커밋 | 두는 곳(`.gitignore`) | 라이선스 파일 |
|---|---|---|---|---|
| Zed Ayu 3종·Gruvbox 6종 | `zed-industries/zed` `assets/themes/` | 커밋 `4304dec732a75505066de5ce2dbbfb2bec369498` | `src/theme/assets/zed/` | `src/theme/assets/zed/LICENSES` |
| Catppuccin 테마 8종 | `catppuccin/zed` | `v0.2.27` / `83fe57ba356a3b4dc4ac78b8d98d8ae95e093e45` | `src/theme/assets/catppuccin/` | `src/theme/assets/catppuccin/LICENSE`(MIT) |
| macOS Classic 2종 | `huacnlee/zed-theme-macos-classic` | `v0.4.0` / `22266e11c4b8962be2e259011251b4016ff00552` | `src/theme/assets/macos-classic/` | `src/theme/assets/macos-classic/LICENSE`(MIT) |
| Catppuccin Icons 8종 | `catppuccin/zed-icons` | `v1.24.0` / `fe864c992c5da1e417e5897b741b7de9b90830e0` | `src/assets/icon-themes/catppuccin-icons/` | `src/assets/icon-themes/catppuccin-icons/LICENSE`(MIT) |
| Zed (Default) 대응 | `zed-industries/zed` `crates/theme/src/icon_theme.rs`의 문자열 표(stems 5, suffixes 293, file_icons 92, directory_icons 2) | 커밋 `4304dec732a75505066de5ce2dbbfb2bec369498` | `src/assets/icon-themes/zed/zed-default.json`(SVG는 Phase 5 `src/assets/zed-icons/file_icons/`) | `src/assets/zed-icons/LICENSES`, `LICENSE-GPL`, `LICENSE-APACHE`(Phase 5) |

- 확장 셋의 버전은 이 PC에 설치된 Zed 확장의 `extension.toml` 버전과 같다(K-17이 읽기만 해서 확인). 확장 셋은 테마·아이콘 테마 JSON, `extension.toml`, `LICENSE`를 복사한다. Catppuccin Icons는 `file_icons`·`directory_icons`·`named_directory_icons`·`chevron_icons`가 가리키는 SVG 5016개를 모두 복사한다.
- Zed (Default) 대응은 Rust 코드를 복사하지 않고 문자열 튜플만 뽑아 확장과 같은 family/themes JSON 구조로 만든다. SVG 경로는 `src/assets/` 기준 `zed-icons/file_icons/<이름>.svg`다(`..` 없음, K-21). 원본에 `bak → backup`이 있으나 `backup` 정의가 없어 그대로 두었다(앱은 기본 파일 아이콘으로 그림).
- 커밋하지 않는다. 이미 커밋된 One 테마(`src/theme/assets/one/one.json`, `LICENSE`)는 그대로 둔다(core D-8). K-17 확인: `git check-ignore` 5030/5030, `git ls-files`에 복사본 0개.
- 다시 채우는 방법: Phase 5 `tools/fetch-zed-icons.ps1`을 먼저 실행해 `src/assets/zed-icons/`를 채운 뒤, 레포 루트에서 `pwsh -NoProfile -File tools/fetch-zed-themes.ps1`을 실행하고 다시 빌드한다(dev는 재시작). JSON·SVG는 빌드 때 glob으로 들어가므로 빌드 뒤에 채우면 반영되지 않는다. 스크립트는 위 커밋·태그를 TEMP 임시 폴더에 받아 고정 커밋·manifest 버전, 테마 개수·이름 중복·빈 이름, 파일·라이선스, 아이콘 경로를 스스로 확인하고 임시 폴더를 지운다. GitHub 연결이 필요하다. 이 PC의 Zed 설치 폴더는 읽지 않는다.
- 복사본이 없을 때: 앱은 죽지 않는다.
  - 테마: 커밋된 One Dark·One Light 두 종만 목록에 나온다. 기본은 One Dark다.
  - 아이콘 테마: 복사본이 없는 테마는 목록에서 빠진다. Zed (Default)까지 없으면 목록이 비고, 파일 트리는 UI 아이콘 `folder`·`folder_open`·`file`(R-1)로 그린다.
  - Extensions: 복사본이 없는 확장의 카드가 빠진다.
  - Licenses: 그 묶음의 고지 항목이 빠진다.
- 앱은 실행 중에 내려받지 않고 이 PC의 Zed 폴더를 읽지 않는다.

---

## R-5. 편집 중인 탭의 커서 위치와 파일 형식을 상태 바에 보인다

**요구**

마크다운 문서나 코드 파일이 에디터 탭에 편집 상태로 열려 있으면 상태 바에 `{line}:{column} {Filetype}`을 보인다(예: `13:27 Markdown`). 커서가 움직이면 바뀐다. 마크다운 미리보기에서도 마우스로 누른 곳에 해당하는 원본 위치를 같은 형식으로 보인다. 자리는 상태 바 오른쪽 아이콘 묶음 바로 앞이다.

**정해진 결과**

상태 바에 위치와 파일 형식이 Zed와 같은 형식·자리로 보인다. 지금 tauri 상태 바는 비어 있다(`src/App.tsx`, `src/app.css`의 상태 바).

**판정 방법**

마크다운 파일과 코드 파일을 편집 상태로 열고 커서를 옮기면 상태 바의 `{line}:{column}`이 그 위치로 바뀐다. 파일 형식 이름이 Zed와 같다. 미리보기에서 누른 곳에 해당하는 원본 위치가 같은 형식으로 보인다. 위치는 오른쪽 아이콘 묶음 바로 앞이다. 위치 계산은 V1 테스트, 화면은 V3.

**출처**

I-5, 사용자 2026-11-06, 참고 화면 `refs/I-5-zed.png`, `refs/zed-split.png`.

미정: 열린 탭이 없을 때 무엇을 보일지. Zed와 같게 하는 것으로 보고 갈래가 Zed에서 확인한다(I-5 미정). → 아래 Zed 확인으로 정해졌다.

**Zed 확인(2026-11-07)**

조건: core ORDER-08 2장, Zed `4304dec` 설치본 `zed -n` 새 창, 1440×852, One Dark, 사용자 `base_keymap` VSCode. 캡처 `specs/v0.5/verify/ORDER-08/zed-*.png`.

| 상태 | 상태 바 오른쪽(오른쪽 아이콘 묶음 바로 앞) | 캡처 |
|---|---|---|
| 편집 중 | `5:23 Markdown` | `zed-cursor.png` |
| 선택 있음 | `5:28 (5 characters) Markdown` — 위치는 선택 끝(커서), 괄호에 선택한 글자 수 | `zed-selection.png` |
| 열린 탭 없음 | 위치·파일 형식 모두 없음, 오른쪽 아이콘만 | `zed-no-tab2.png`, `zed-end-run2.png` |
| Project Search 결과 탭(여러 파일 묶음) | `45:35 (8 characters)`만, 파일 형식 이름 없음 | `zed-search-results.png` |
| Diagnostics 탭 | 둘 다 없음 | `zed-diagnostics.png` |

**구현 (K-24)**

- 위치는 주 선택의 head(커서) 기준 1부터 시작하는 `line:column`이다. 열과 선택 글자 수는 UTF-16 코드 유닛이 아닌 Unicode scalar 수다.
- 선택 정보는 selections, lines, characters 순서로 괄호에 넣는다. selections·lines는 2 이상, characters는 1 이상일 때 보이고 단·복수를 구분한다. 빈 단일 커서는 괄호가 없다. 선택 끝이 다음 줄 시작이면 그 줄은 줄 수에 넣지 않는다. 여러 줄 선택의 개행은 글자 수에 넣는다(Zed `crates/go_to_line/src/cursor_position.rs`를 동작 이해용으로 읽음, 코드 복사 없음).
- split에서는 편집 뷰마다 위치가 따로다. 문서 내용이 바뀌어도 갱신한다.
- 편집기가 준비되지 않았거나, 열린 탭이 없거나, 도구 탭이면 두 항목을 숨긴다. Project Search 탭은 현재 일치의 끝 위치와 선택 글자 수만 보이고 파일 형식은 숨긴다(R-22). 미리보기 탭의 파일 형식은 Markdown이다.
- 글꼴 크기 `statusbar.cursor_position.font_size`(L-97), 항목 간격 `statusbar.item_gap`(L-29). 지금 오른쪽 아이콘 묶음이 없어 상태 바 오른쪽에 두 항목을 두었다. 아이콘 묶음이 생기면 이 두 항목 뒤에 놓는다.

**마크다운 미리보기 클릭 위치 (core 결정 2026-11-07)**

- 누른 곳을 포함하는 가장 안쪽 블록의 원본 시작 줄, 열 1이다(`DECISIONS.md` D-13). 미리보기 탭마다 따로 유지한다.
- 구현: 렌더러가 블록에 둔 `data-line`(0부터)에서 누른 곳의 가장 가까운 조상(`closest("[data-line]")`)을 찾아 `줄 + 1`, 열 1로 보인다. K-28에서 테스트로 확인했고 앱 코드는 바꾸지 않았다.
- 링크를 누르면 링크 동작(I-085)이 먼저 처리되고 위치는 바뀌지 않는다.

*블록 종류 표 (K-28)* — 표시 열은 모두 1이다. 예의 줄 번호는 테스트 원본 기준이다.

| 블록 종류 | 원본 줄 기준 | 예 |
|---|---|---|
| 문단 | 가장 안쪽 p의 시작 줄 | 앞 문단·빈 줄 뒤의 문단 안 strong을 클릭 → 3:1 |
| 제목 | 제목 토큰의 시작 줄 | 3행의 `## heading` 안 strong을 클릭 → h2, 3:1 |
| 목록 항목(타이트) | 가장 안쪽 li의 시작 줄 | 둘째 항목 → 2:1, 그 안 중첩 항목 → 3:1 |
| 목록 항목 안 문단(느슨한 목록) | li보다 안쪽인 p의 시작 줄 | 1행에서 시작한 항목의 3행 둘째 문단 → 3:1 |
| 코드 블록(펜스) | 여는 펜스 줄 | 3행에서 연 펜스 안 어느 코드 줄을 클릭해도 → code, 3:1 |
| 코드 블록(들여쓰기) | 코드 블록의 첫 들여쓰기 줄 | 3~4행 코드 중 둘째 줄 클릭 → pre, 3:1 |
| 표 머리 셀 | 해당 tr의 시작 줄 | 표 머리 행 3행 → 3:1 |
| 표 본문 셀 | 해당 tr의 시작 줄 | 표 시작 3행·본문 5행 → 5:1 |
| 인용 안 블록 | blockquote 안 가장 안쪽 data-line 블록의 시작 줄 | 1행 인용 안 3행 둘째 문단 → p, 3:1 |
| 수평선 | hr의 원본 줄 | 문단·빈 줄 뒤 3행 `---` → 3:1 |
| front matter(키·값 표) | front matter 전체 블록의 여는 `---` 줄 | 2행 값 클릭 → 바깥 div, 1:1 |
| front matter(원문 코드) | front matter 전체 블록의 여는 `---` 줄 | 중첩 YAML 항목 클릭 → pre.frontmatter-raw, 1:1 |

*표 셀 → 그 행 tr의 시작 줄: 현재 동작, core 확인 요청*

th·td에는 줄 정보가 없고 tr에 있어, 표 시작 줄로 통일하지 않고 그 행의 원본 시작 줄을 보인다. 구분선 행(`| --- |`)은 렌더된 셀이 없어 누를 수 없다.

| 클릭 대상(테스트 원본 3~6행 표) | 가장 가까운 data-line 요소 | 표시값 |
|---|---|---|
| 머리 셀 | tr, data-line=2 | 3:1 |
| 첫 본문 셀 | tr, data-line=4 | 5:1 |
| 둘째 본문 행 셀 | tr, data-line=5 | 6:1 |

**파일 형식 대응 표 (K-24)**

- 출처: Zed `4304dec732a75505066de5ce2dbbfb2bec369498` `crates/grammars/src/*/config.toml` 23개의 `name`·`path_suffixes`만 뽑았다(`src/editor/filetypes.json`). `file_names`·`filenames` 필드는 없었다. 경로 대응이 없는 JSDoc·Markdown-Inline·Regex·Zed Keybind Context 4개는 뺐다.
- 규칙: 파일 이름 전체 또는 점으로 나눈 suffix를 비교해 가장 긴 일치를 쓴다(`tsconfig.json`이 `json`보다 먼저). 대소문자는 원본 그대로 구분한다(`c` → C, `C` → C++). 대응이 없으면 Plain Text다.
- 외부 확장의 언어는 이 표에 없어 넣지 않았다(예: `toml`은 Plain Text). 첫 줄 패턴(`first_line_pattern`) 검출은 하지 않는다.

| Zed name | path_suffixes (원본 순서) |
|---|---|
| Shell Script | sh, bash, bashrc, bash_profile, bash_aliases, bash_login, bash_logout, brushrc, bats, envrc, profile, zsh, zshrc, zshenv, zsh_profile, zsh_aliases, zsh_histfile, zlogin, zprofile, PKGBUILD, APKBUILD, ebuild |
| C | c |
| C++ | cc, ccm, hh, cpp, cppm, h, hpp, cxx, cxxm, hxx, c++, c++m, h++, hip, ipp, inl, ino, ixx, cu, cuh, C, H |
| CSS | css, postcss, pcss |
| Diff | diff, patch |
| Env | .env |
| Git Commit | TAG_EDITMSG, MERGE_MSG, COMMIT_EDITMSG, NOTES_EDITMSG, EDIT_DESCRIPTION |
| Go | go |
| Go Mod | mod |
| Go Work | work |
| JavaScript | js, jsx, mjs, cjs |
| JSON | json, flake.lock, geojson, topojson, prettierrc, json.dist, deno.lock |
| JSONC | jsonc, bun.lock, devcontainer.json, pyrightconfig.json, tsconfig.json, luaurc, swcrc, babelrc, eslintrc, stylelintrc, jshintrc |
| Markdown | md, mdx, mdwn, mdc, markdown, MD |
| Python | py, pyi, mpy |
| Rust | rs |
| TSX | tsx |
| TypeScript | ts, cts, mts |
| YAML | yml, yaml, pixi.lock, clang-format, clangd, bst |

---

## R-6. 기본 창을 1440×852로, 작업 영역 한가운데에 연다

**요구**

앱을 시작할 때 메인 창을 논리 1440×852로, 작업 표시줄을 뺀 작업 영역 한가운데에 연다. 최소 크기는 360×240이다. 마지막 창 크기는 기억하지 않는다.

**정해진 결과**

매번 1440×852로 가운데에 열린다. 지금 tauri는 1440×852로 연다(`src-tauri/tauri.conf.json`). 가운데 배치 여부는 확인하지 않았다.

**판정 방법**

설정이나 기록이 없는 상태로 처음 실행하면 창 클라이언트 영역이 논리 1440×852이고 작업 영역 가운데에 있다. 360×240보다 작게 줄어들지 않는다. 크기를 바꾸고 다시 실행해도 1440×852로 열린다. V3.

**출처**

I-6, 사용자 2026-11-06.

---

## R-7. 탭 아래 편집 영역의 경계를 한 줄, 직각 모서리로 한다

**요구**

분할한 pane 각각의 편집 영역 경계를 한 줄, 직각 모서리로 한다.

**정해진 결과**

경계가 한 줄이고 모서리가 직각이다. tauri는 이미 기대와 같다(core ITEMS I-7, 참고 화면 `refs/I-7-tauri.png`). 이 레포는 바꾸지 않고 판정만 한다.

**판정 방법**

분할한 pane마다 편집 영역 경계가 한 줄이고 모서리가 직각이다. 확대 캡처에서 Zed와 같다. V3.

**출처**

I-7, 사용자 2026-11-06.

---

## R-8. 마크다운 문서 편집 화면에서 자동 줄바꿈을 한다

**요구**

편집 상태로 연 마크다운 문서의 긴 줄을 편집 영역 폭에서 자동으로 줄바꿈한다.

**정해진 결과**

줄바꿈되고 가로 스크롤바가 없다. 지금 tauri는 줄바꿈이 되지 않고 가로 스크롤바가 생긴다(`refs/I-7-tauri.png`).

**판정 방법**

마크다운 문서의 긴 줄이 편집 영역 폭에서 줄바꿈되고 가로 스크롤바가 생기지 않는다. V3.

**출처**

I-8, 사용자 2026-11-06.

---

## R-9. 편집 영역 스크롤바가 보이는 조건을 Zed와 같게 한다

**요구**

편집 영역 스크롤바가 보이는 조건을 Zed와 같게 한다. 판정 기준은 Zed 실제 동작이다. 스크롤할 내용이 있으면 세로 스크롤바가 마우스 위치와 상관없이 늘 보이고, 가로 스크롤바는 내용이 가로로 넘칠 때만 보인다(마크다운은 I-8 줄바꿈으로 넘치지 않는다).

**정해진 결과**

세로 스크롤바는 스크롤할 내용이 있으면 마우스가 창 밖·편집 영역 밖·편집 영역 위에 있을 때, 스크롤 중과 멈춘 뒤에 늘 보이고 사라지지 않는다. 가로 스크롤바는 내용이 가로로 넘칠 때만 보인다. 지금 tauri는 세로·가로 스크롤바가 늘 보인다(`refs/compare/I-9-tauri.png`).

Zed 확인(tauri-leader 2026-11-07): Zed 기본 설정(`settings.json`에 `scrollbar` 항목 없음, Windows `DynamicScrollbars` 없음)에서 SendInput으로 마우스를 옮기고 휠을 굴려 캡처했다(`specs/v0.5/verify/I-9/zed-*.png`, 판정 `specs/v0.5/verify/I-9/zed-scrollbar.md`). 세로 thumb는 타이틀 바·편집 영역 위·휠 직후·휠 뒤 3초·다시 타이틀 바 3초·창 밖 3초 여섯 상태에서 모두 보였고 숨김은 없었다. 내용이 가로로 넘치지 않는 파일에서 가로 스크롤바는 보이지 않았다.

**판정 방법**

마우스가 편집 영역 밖에 있을 때와 위에 있을 때, 스크롤 중과 멈춘 뒤에 스크롤바가 보이는 조건이 위 Zed 확인 결과와 같다. 세로는 늘 보이고, 가로는 내용이 가로로 넘칠 때만 보인다. V3.

**출처**

I-9(기대 정정 core-leader, 사용자 위임 core D-13, 2026-11-07), 사용자 2026-11-06.

---

## R-10. 탭 바의 뒤로·앞으로 버튼에 툴팁을 보이고 동작하게 한다

**요구**

탭 바 왼쪽 뒤로(←)·앞으로(→) 버튼에 마우스를 올리면 Zed와 같은 툴팁(단축키 표시 포함)이 보이고, 버튼과 `Alt+Left`·`Alt+Right`로 탐색 기록을 따라 이동한다.

**정해진 결과**

툴팁이 Zed와 같고 버튼·단축키로 이동한다. 지금 tauri는 `Go Back`·`Go Forward` 툴팁이 나오고 단축키 표시는 없다(`refs/compare/I-10-*.png`). 이동 여부는 확인하지 않았다.

**판정 방법**

두 버튼의 툴팁 글자와 단축키 표시가 Zed와 같다. 파일을 두 개 이상 차례로 연 뒤 뒤로·앞으로 버튼과 `Alt+Left`·`Alt+Right`로 이전·다음 위치로 이동한다. 이동 기록은 V1 테스트, 화면은 V3.

**출처**

I-10, 사용자 2026-11-06("zed와 동일하게").

---

## R-11. 탭 제목에 마우스를 올리면 파일 전체 경로를 툴팁으로 보인다

**요구**

탭 제목에 마우스를 올리면 그 파일의 절대 경로를 툴팁으로 보인다(예: `D:\projects\workbench-gpui\INTENT.md`).

**정해진 결과**

탭 툴팁에 절대 경로가 보인다. 지금 tauri는 툴팁이 없다(`refs/compare/I-11-tauri.png`).

**판정 방법**

탭 제목에 마우스를 올리면 그 파일의 절대 경로가 툴팁으로 보인다. V3.

**출처**

I-11, 사용자 2026-11-06, 참고 화면 `refs/I-11-zed.png`.

---

## R-12. 편집 영역 위에 파일 경로와 현재 제목 줄을 보인다

**요구**

탭 바 아래, 편집 영역 바로 위 줄 왼쪽에 파일 경로와 커서가 있는 곳의 제목 계층을 `›`로 이어 보인다. 경로를 어디부터 보일지와 마크다운이 아닌 파일에서 무엇을 보일지 모두 Zed와 같다.

**정해진 결과**

경로 줄이 Zed와 같다. 지금 tauri의 이 줄에는 오른쪽 미리보기 버튼만 있다(`refs/I-7-tauri.png`, v0.4 E-038 툴바).

**판정 방법**

같은 파일, 같은 커서 위치에서 경로 줄 글자가 Zed와 같다. 확인은 폴더 하나와 여럿, 마크다운 파일과 코드 파일 각 한 경우씩 한다. V3.

**출처**

I-12, 사용자 2026-11-06("zed와 동일하게"), 참고 화면 `refs/zed-overview.png`, `refs/zed-split.png`.

미정: 코드 파일에서 Zed가 무엇을 보이는지(심볼 계층 등). 갈래가 Zed에서 확인해 이 절에 적는다(I-12 정한 것).

---

## R-13. 커서가 있는 줄의 배경과 줄 번호를 강조한다

**요구**

커서가 있는 줄의 배경과 줄 번호를 강조한다. 자동 줄바꿈(R-8)으로 여러 줄로 보이는 줄도 전체를 강조한다.

**정해진 결과**

커서 줄의 배경과 줄 번호가 Zed처럼 강조된다. 지금 tauri는 커서 줄 배경과 줄 번호를 강조한다(`refs/compare/base-tauri.png`). 줄바꿈된 줄 전체 강조는 R-8 뒤에 판정한다.

**판정 방법**

커서가 있는 줄의 배경과 줄 번호가 강조된다. 줄바꿈으로 여러 줄로 보이는 줄은 그 전체가 강조된다. 커서를 옮기면 강조도 옮겨 간다. V3.

**출처**

I-13, 사용자 2026-11-06.

---

## R-14. UI·에디터 본문·미리보기의 글꼴을 Zed와 같게 한다

**요구**

UI, 편집 영역, 미리보기 본문, 미리보기 코드 블록의 글꼴(이름, 크기, 굵기, 줄 높이)을 아래 Zed 기본값과 같게 한다. Zed 기본 글꼴 IBM Plex Sans와 Lilex의 글꼴 파일과 라이선스 파일을 레포에 넣고 커밋한다. 편집 영역 본문의 한글은 굴림체가 아닌 고딕 계열로 보인다.

| 자리 | Zed 기본값 |
|---|---|
| UI | `.ZedSans` = IBM Plex Sans, 16, 굵기 400, 합자(`calt`) 끔 |
| 에디터 본문 | `.ZedMono` = Lilex, 15, 굵기 400, 줄 높이 comfortable(1.618) |
| 미리보기 본문 | UI 글꼴을 따른다. 제목 굵기 600 |
| 미리보기 코드 블록 | 에디터 글꼴을 따른다 |

**정해진 결과**

네 곳의 글꼴이 표와 같다. 지금 tauri는 UI와 미리보기 본문에 `font-family`를 정하지 않아 WebView2 기본 글꼴이고(`src/app.css`), 에디터 본문과 미리보기 코드는 `Consolas, monospace`다(`src/spec/metrics.ts` `BUFFER_FONT_FAMILY`, 주석 "Lilex is out of scope (INTENT)" — 이번 요구가 이 제외를 바꾼다). 한글은 굴림체로 보이는 것으로 추정한다(확인 안 함).

**판정 방법**

UI, 편집 영역, 미리보기 본문, 미리보기 코드 블록의 글꼴 이름·크기·굵기·줄 높이가 표의 Zed 기본값과 같다. D-10의 글꼴 파일과 라이선스 파일이 레포에 있다. 편집 영역의 한글이 굴림체가 아닌 고딕 계열이다(tauri는 개발자 도구 Rendered Fonts로 확인). 값은 V2, 화면은 V3, 글자 모양은 V4.

**출처**

I-14, core D-10, 사용자 2026-11-06.

**Zed 한글 대체 글꼴**

Zed에서 한글은 Malgun Gothic(맑은 고딕)으로 그려진다. 편집 영역 한글의 고딕 계열 판정은 이 이름으로 한다.

- 확인 방법: Zed와 같은 시스템 API인 DirectWrite `IDWriteFactory2::GetSystemFontFallback` → `IDWriteFontFallback::MapCharacters`로 "가나다한글"을 질의했다. 시스템 글꼴 컬렉션, 굵기 400, normal style·stretch, 기본 패밀리 Lilex와 IBM Plex Sans 각각, 로캘 ko-KR·en-US 둘 다. 네 경우 모두 Malgun Gothic / 맑은 고딕, 굵기 400, scale 1, 5글자 매핑.
- 확인: 2026-11-07 tauri-coder(K-03). 출력 `%TEMP%\v05-K-03-dwrite.txt`.
- 한계: Zed가 실제 요청하는 로캘과 실행 중인 Zed의 렌더링 결과는 확인하지 않았다(같은 API 질의 결과다).

**글꼴 값의 스펙 ID**

크기·줄 높이·제목 굵기는 `spec/zed-metrics.toml`의 `typography.ui_font_size`(16), `typography.buffer_font_size`(15), `editor.line_height.comfortable_multiplier`(1.618), `markdown_preview.heading.font_weight`(600)를 쓴다. 글꼴 이름, 굵기 400, `calt` 끔은 I-14 표가 직접 정한 값이다(core D-12 예외). 굵기·스타일 파일과 버전은 `DECISIONS.md` D-1에 있다.

**미리보기 코드 블록의 글자 크기**

미리보기 코드 블록은 I-14에 따라 에디터 글꼴의 이름·굵기·합자·줄 높이(1.618)를 따른다. 글자 크기는 16px로 Zed 실측과 같다(ORDER-03-R1: Zed와 tauri 모두 글자 16px, 줄 높이 1.618, 64자 줄 폭 612px 동일, 줄 간격 7간격 합 1px 차, tauri-leader 2026-11-07, 근거 `specs/v0.5/verify/ORDER-03-R1/`). (리더 결정, 사용자 위임 core D-13, ORDER-03, 2026-11-07)

**줄 번호 열 폭 (해소)**

ORDER-03에서 편집 영역 줄 번호 열 폭이 Zed와 달랐다(tauri 99px = E-002 최소 4ch + E-003 왼쪽 3ch + E-004 오른쪽 4ch, Zed 약 64px; C-13, `specs/v0.5/verify/ORDER-03/ORDER-03-judgement.md` 2.3). ORDER-03-R1에서 해소했다.

- Zed 실측(tauri-leader 2026-11-07, Zed 새 창 클라이언트 1440×852, 100%, Lilex 15): 줄 번호 왼쪽 여백 22px, 줄 번호 칸 = 자릿수(최소 4)×9px, 오른쪽 여백 29px + margin(E-005, descent 5px).
- 스펙 E-003(3ch)·E-004(4ch)는 Zed 소스(`14b7b0e`) 값이지만 지금 Zed 화면과 달라 core D-12(ITEMS 우선)로 실측값을 쓴다.
- 수정 뒤 tauri = Zed: 4자리 숫자 오른쪽 57px·본문 시작 92px, 5자리 66px·101px, 차 ≤1px. 근거 `specs/v0.5/verify/ORDER-03-R1/`.

1번 줄 위 여백은 ORDER-03에서 차이 0으로 풀렸다.

---

## R-15. 편집 영역에서 구문 강조를 한다

**요구**

편집 상태의 편집 영역에서 Zed처럼 파일 형식에 따라 구문 강조를 한다. 지원할 형식은 Zed가 지원하는 형식 전체다.

**정해진 결과**

형식마다 구문 강조가 된다. 지금 tauri는 편집 영역 글자가 모두 한 색이다(`refs/compare/base-tauri.png`).

**판정 방법**

Zed가 지원하는 파일 형식마다 샘플 파일을 열면 구문 강조가 된다. 마크다운과 HTML 샘플은 같은 테마의 Zed 캡처와 색이 같다. 형식 목록과 샘플 결과는 갈래 보고에 표로 남긴다. V3, 색 품질은 V4.

**출처**

I-15, 사용자 2026-11-06.

미정: Zed가 지원하는 파일 형식 목록. 갈래가 Zed에서 확인해 이 절에 적는다(I-15 정한 것).

---

## R-16. 탭이 탭 바보다 넘칠 때 Zed와 같게 처리한다

**요구**

탭이 탭 바 폭을 넘을 때 Zed와 같게 보이고 동작한다.

**정해진 결과**

넘칠 때의 모습과 동작이 Zed와 같다. 지금 tauri는 폴더 보기를 열면 탭이 오른쪽 끝에서 잘린다(`refs/compare/I-11-tauri.png`).

**판정 방법**

탭을 탭 바 폭보다 많이 열었을 때 보이는 모습과 동작(스크롤, 잘림, 활성 탭 보이기)이 Zed와 같다. V3.

**출처**

I-16, 사용자 2026-11-06("zed와 동일하게").

미정: 탭이 실제로 넘칠 때 Zed가 어떻게 하는지. 갈래가 Zed에서 확인한다(I-16 확인한 사실).

---

## R-17. `≡` 메뉴를 Zed와 같은 구성으로 하고, 구현된 기능만 넣는다

**요구**

`≡` 메뉴가 Zed의 메뉴 구성(Zed·File·Edit·Selection·View·Go·Run·Window·Help 순서)을 따르고, 구현된 기능의 항목만 넣는다. 두 갈래 메뉴는 같다. 마지막 메뉴는 Help이고 View Dependency Licenses, (구분선) File Bug Report..., Request Feature..., (구분선) workbench-tauri Repository를 넣는다. 메뉴 막대 뒤에 폴더 이름이 한 번 더 보이지 않는다. 이름 사이 간격은 Zed와 같다.

**정해진 결과**

메뉴가 Zed 순서·구현 기능만으로 되어 있다. 지금 tauri 메뉴는 workbench-tauri(Quit)·File(Save 포함)·Edit(Undo, Redo)·Go(Previous Tab, Next Tab)·View·Window이고, Help가 없으며, 메뉴 이름 사이 간격이 거의 없고, 막대 뒤에 폴더 이름이 한 번 더 보인다(`refs/compare/I-2-tauri.png`; 메뉴 정의는 `src/shell/app-menus.ts`, `src/shell/AppMenu.tsx`).

**판정 방법**

두 갈래의 `≡` 메뉴 막대와 항목이 서로 같다. 메뉴 순서는 Zed를 따르고, 마지막 메뉴는 Help다. 구현되지 않은 항목은 없다. 메뉴 막대 뒤에 폴더 이름이 한 번 더 보이지 않는다. 이름 사이 간격은 Zed와 같다. 각 항목을 누르면 그 기능이 동작한다. V3.

**출처**

I-17, 사용자 2026-11-06("Help 제안대로").

**Zed 근거**

Zed `crates/zed/src/zed/app_menus.rs`(커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`)의 항목 이름·순서·조건만 확인했고 코드는 복사하지 않았다.

| 근거 | 위치 |
|---|---|
| 메뉴 막대 순서 Zed·File·Edit·Selection·View·Go·Run·Window·Help | `app_menus.rs:71,116,153,174,222,227,270,295,304` |
| View의 Editor Layout 하위 메뉴(Split Up/Down/Left/Right) | `app_menus.rs:31~40` |
| Close Editor는 고정 탭도 닫는다(close_pinned=true) | `app_menus.rs:142~146` |
| Help의 라이선스·구분선·버그·기능 요청·저장소 | `app_menus.rs:304~334` |
| 메뉴 막대가 열리면 프로젝트 이름 숨김 | `crates/title_bar/src/title_bar.rs:302~319` |

**넣는 규칙**

- 구현된 기능의 항목만 넣는다. 구현되지 않은 Zed 항목은 넣지 않는다.
- 항목이 하나도 없는 메뉴(Selection·Run)는 메뉴째 넣지 않는다.
- 첫 메뉴 이름은 Zed 자리에 앱 이름 `workbench-tauri`를 둔다.
- Zed에 없는 앱 전용 항목(폴더 사이드바 두 항목, Maximize Pane, Markdown Preview 두 항목, 탭 이동)은 기존 기능이라 유지하고, 기존 상대 순서를 지킨다.

**메뉴 항목 표 (ORDER-06 1단계)**

단축키는 기본 키맵 기준이다. 실제 표시는 기존 `shortcutFor`로 사용자 키맵과 메뉴를 열기 직전의 포커스를 따른다. `—`는 표시 없음이다.

| 메뉴 | 항목 | 기본 단축키 | 동작 |
|---|---|---|---|
| workbench-tauri | Quit workbench-tauri | `Ctrl-Q` | 창 닫기 |
| File | Open Folder... | `Ctrl-K Ctrl-O` | 폴더 추가 |
| File | (구분선) | | |
| File | Save | `Ctrl-S` | 활성 문서 저장 |
| File | (구분선) | | |
| File | Close Editor | `Ctrl-W` | 활성 탭 닫기. 고정 탭도 닫고 저장 확인은 유지 |
| File | Close Window | `Ctrl-Shift-W` | 창 닫기 |
| Edit | Undo | `Ctrl-Z` | 편집 이력 취소 |
| Edit | Redo | `Ctrl-Y` | 편집 이력 재실행. `Ctrl-Shift-Z`도 동작 |
| View | Toggle Left Dock | `Ctrl-B` | 왼쪽 dock 토글 |
| View | Toggle Folder Sidebar | `Ctrl-Alt-J` | 폴더 사이드바 토글 |
| View | Focus Folder Sidebar | `Ctrl-Alt-;` | 폴더 사이드바 포커스 |
| View | Editor Layout | `>` | 하위 메뉴 |
| View → Editor Layout | Split Up | `Ctrl-K Up` | 위로 분할 |
| View → Editor Layout | Split Down | `Ctrl-K Down` | 아래로 분할 |
| View → Editor Layout | Split Left | `Ctrl-K Left` | 왼쪽으로 분할 |
| View → Editor Layout | Split Right | `Ctrl-\`(편집기), `Ctrl-K Right`(그 밖) | 오른쪽으로 분할 |
| View | Maximize Pane | `Shift-Escape` | Pane 확대 토글 |
| View | (구분선) | | |
| View | Project Panel | `Ctrl-Shift-E` | 프로젝트 패널 포커스 토글 |
| View | Open Markdown Preview | `Ctrl-Shift-V` | 미리보기. Markdown 편집 탭에서만 활성 |
| View | Open Markdown Preview to the Side | `Ctrl-K V` | 옆 미리보기. Markdown 편집 탭에서만 활성 |
| Go | Previous Tab | `Ctrl-PageUp` | 이전 탭 |
| Go | Next Tab | `Ctrl-PageDown` | 다음 탭 |
| Window | Minimize | — | 최소화 |
| Window | Zoom | — | 최대화 토글 |
| Help | View Dependency Licenses | — | 라이선스 대화 상자(아래) |
| Help | (구분선) | | |
| Help | File Bug Report... | — | 브라우저로 `https://github.com/nampluskr/workbench-tauri/issues/new` |
| Help | Request Feature... | — | 브라우저로 `https://github.com/nampluskr/workbench-tauri/issues/new` |
| Help | (구분선) | | |
| Help | workbench-tauri Repository | — | 브라우저로 `https://github.com/nampluskr/workbench-tauri` |

- Help: View Telemetry·Show Welcome·Email Us는 넣지 않는다. Zed는 버그 요청에 이슈 템플릿과 환경 정보를, 기능 요청에 discussions를 쓰지만(`crates/feedback/src/feedback.rs:19~35`), 이 레포에는 이슈 템플릿이 없고 ORDER-06이 두 항목 모두 이 저장소의 `issues/new`로 정했다. URL은 테스트로 확인했고 브라우저는 열지 않았다.
- 하위 메뉴: 누르거나 포인터를 올리거나 Right/Enter로 열고, Left/Escape로 부모에 돌아간다. 오른쪽 공간이 모자라면 부모 왼쪽에 펼치고 창 안으로 제한한다.
- 하위 메뉴가 열린 채 다른 메뉴 이름으로 포인터를 옮기면 그 메뉴로 바뀌고 메뉴 막대는 열린 채다(K-09-R1). 포커스가 잠깐 메뉴 밖으로 나가도 동기 교체가 끝난 뒤 포커스가 메뉴 안이면 닫지 않는다(`src/shell/menu.ts` `closeOnFocusOut`).
- 하위 메뉴가 열린 채 비활성 형제 항목으로 포인터를 옮기면 하위 메뉴가 닫힌다. 비활성 항목은 선택·강조되지 않고 실행되지 않는다(K-09-R3).

**메뉴 막대가 열리면 프로젝트 이름 숨김**

가로 메뉴 막대가 열려 있는 동안 타이틀 바의 프로젝트 이름을 그리지 않는다(`src/shell/TitleBar.tsx`). "v" 메뉴나 다른 컨텍스트 메뉴만 열렸을 때는 이름이 그대로다.

**메뉴 이름 간격**

이름 사이 간격 = 앞 이름 버튼 오른쪽 padding + 막대 gap + 다음 이름 버튼 왼쪽 padding이다.

- 막대 gap: `menu.horizontal.item_gap`(I-321) 4px를 같은 ID의 CSS 변수로 `.menu-bar`의 `gap`에 쓴다.
- 이름 버튼 좌우 padding: `buttons.padding_x.default_compact`(L-07) 4px를 같은 ID의 CSS 변수로 `.menu-name`의 좌우 padding에 쓴다(K-09-R2). 세로 padding은 0, 버튼 높이 `buttons.height.default`(L-07) 22px는 그대로다.
- 근거: Zed 메뉴 이름 글자 잉크 간격은 13~14px다(`specs/v0.5/verify/ORDER-06/zed-menubar.png`). 이름 버튼 padding이 0이던 tauri는 약 5px였다(`tauri-menubar.png`). padding 4px를 더한 뒤 12~13px로 Zed와 1px 이내다(`tauri-menubar-after.png`).

**메뉴 키 기준 (core-leader 결정 2026-11-07, 두 갈래 공통)**

- 메뉴 항목의 키는 Zed Windows 기본 키맵 `assets/keymaps/default-windows.json`(커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`)을 따른다. 한 액션에 키가 여럿이면 메뉴에는 그 파일의 첫 키를 보인다.
- Close Editor는 메뉴에 `Ctrl-W`를 보인다. 메뉴를 누르면 지금처럼 고정 탭도 닫는 `workspace::CloseActiveItem`을 실행하고, `Ctrl-W` 키 입력은 지금처럼 `pane::CloseActiveItem`(고정 탭은 닫지 않음, 원본 507~508·729~730줄)으로 간다. 두 동작은 합치지 않았다.
- K-13 결과: 메뉴 액션의 키 조합은 이미 원본과 같아 추가·삭제가 없었다. 바뀐 것은 Redo 표시(`Ctrl-Shift-Z` → 원본 첫 키 `Ctrl-Y`, 78~79줄. 두 키 모두 동작, 등록 순서만 바꿈)와 Close Editor의 `Ctrl-W` 표시뿐이다. Minimize·Zoom·Licenses·링크 항목·Classic은 원본에 일반 문맥 키가 없어 키를 만들지 않았다.
- 메뉴 표시와 테스트는 같은 조회 함수(`shortcutForEntry`)를 쓴다. 사용자 키맵에 바인딩을 더하면 메뉴 표시에 반영된다.

**Licenses 표시 방법**

Help → View Dependency Licenses는 앱 안의 읽기 전용 DOM `<dialog>`에 라이선스 전문을 텍스트로 보인다. Close 버튼과 Escape로 닫고 원래 포커스로 돌아간다. 글은 선택·복사할 수 있고, 폴더가 없어도 열린다(`src/shell/licenses.ts`).

- 글꼴: `public/fonts/ibm-plex-sans/license.txt`, `public/fonts/lilex/OFL.txt`를 같은 출처에서 읽는다(CSP 변경 없음).
- Zed 아이콘: `src/assets/zed-icons/LICENSES`, `LICENSE-GPL`, `LICENSE-APACHE`를 빌드에 넣는다. `.gitignore` 복사본이 없으면 그 이름과 `License copy unavailable.`를 보인다.
- 자체 아이콘: 없음. Phase 7(K-20)에서 Lucide `file.svg`와 `LICENSE-LUCIDE`를 지우고 glob에서 뺐다. 파일 아이콘은 아이콘 테마(기본 Zed (Default))이고, 없으면 UI 아이콘(`zed-icons`) `file`·`folder`로 대체한다.
- 테마·아이콘 테마: `src/theme/assets/**/LICENSE*`(Zed Ayu·Gruvbox의 `zed/LICENSES` 포함)와 `src/assets/icon-themes/**/LICENSE*`(Phase 7 K-19에서 넓힘). 복사본이 없으면 glob이 비어 그 항목만 빠진다.
- 파일마다 실패를 따로 처리해, 한 파일이 없어도 다른 라이선스가 보이고 앱이 죽지 않는다.
- K-13 확인: Zed UI 아이콘, 자체 파일 아이콘, One Dark·One Light, IBM Plex Sans, Lilex의 고지가 모두 위 경로로 들어 있다. Catppuccin은 지금 복사한 자원이 아니라 설치된 Zed 확장을 읽는 상태라 고지가 없다. Phase 7에서 테마를 복사할 때 Catppuccin MIT 고지(T-17.2)를 함께 넣는다.
- Phase 7 뒤(K-19·K-20): Catppuccin·macOS Classic·Catppuccin Icons의 `LICENSE`와 Zed Ayu·Gruvbox의 `LICENSES`가 위 glob으로 들어간다. Lucide 고지는 없다.

**gpui와 다른 점 (두 갈래 조율 필요)**

tauri-coder가 gpui `src/ui/app_menu.rs`와 gpui `specs/v0.5/SPEC.md` R-2·R-17을 읽은 시점(2026-11-07, K-09)의 차이다. 두 갈래 표가 같아야 하므로(I-17) 아래는 두 갈래 조율이 필요하다.

| 대상 | tauri | gpui(읽은 시점) |
|---|---|---|
| 첫 메뉴 이름 | workbench-tauri | workbench-gpui(의도된 갈래 이름 차이) |
| View 분할 | Editor Layout 하위 메뉴(Zed `app_menus.rs:31~40`과 같음) | View의 직접 항목 |
| "v" 메뉴 | chevron_down 버튼, 비활성 다섯 항목, Panel Layout 하위 메뉴 | `app_menu.rs`에 없음(다른 파일은 판정하지 않음) |
| Help URL·앱 이름 | workbench-tauri 저장소 | workbench-gpui 저장소(의도된 차이) |

File Save, Edit Undo·Redo, Go Previous·Next Tab, View Markdown Preview 두 항목, Help 구성은 마지막으로 읽은 시점에 두 갈래가 같은 이름·순서다.

**확인 결과**

- 코드(V1, tauri-coder K-09): `npm.cmd run typecheck` 통과, `node --test src/shell/app-menus.test.ts src/shell/menu.test.ts` 8/8(구성·순서·비활성·단축키 표시·URL·라이선스 누락·하위 메뉴 경계 배치), `cargo check` 경고 없음, `npm.cmd run tauri build -- --debug --no-bundle` 통과.
- 리뷰(tauri-checker C-20): PASS. `npm.cmd run typecheck` 통과, `npm.cmd run test` 119/119, `cargo check` 경고 없음.
- 수정(V1, tauri-coder): K-09-R1 하위 메뉴가 열린 채 다른 메뉴 이름으로 옮기면 막대 전체가 닫히던 버그, K-09-R2 이름 버튼 padding(L-07), K-09-R3 비활성 형제 항목 위에서 하위 메뉴가 닫히지 않던 것(C-21 지적). R3 뒤 `npm.cmd run typecheck` 통과, `npm.cmd run test` 121/121, `npm.cmd run tauri build -- --debug --no-bundle` 통과. Rust 변경 없음, `cargo check` 경고 0.
- 화면(V3, tauri-leader 2026-11-07, 1920×1080 주 모니터·창 1440×852·100%·One Dark): 판정 checker C-21, 통과 13·불일치 0(`specs/v0.5/verify/ORDER-06/ORDER-06-judgement.md`, `tauri-menus.json`).
  - 메뉴 순서 workbench-tauri·File·Edit·View·Go·Window·Help, Selection·Run 없음.
  - 메뉴 막대가 열리면 프로젝트 이름이 숨는다(`projectNameVisible: false`).
  - 이름 잉크 간격 File→Edit 13, Edit→View 12, View→Go 12, Go→Window 12, Window→Help 12px(Zed 13~14px와 1px 이내).
  - View > Editor Layout이 열린 채 Go로 옮기면 Go가 열리고 막대는 열린 채다(R1 뒤 CDP 재현).
  - 라이선스 대화 상자가 열리고 Escape로 닫히며 이전 포커스로 돌아간다. 복사본 누락(`License copy unavailable.`) 0.
  - Help URL 세 개는 코드·테스트로 확인했다.
- K-09-R3(비활성 형제 위에서 하위 메뉴 닫힘)은 코드·테스트로 확인했고, 화면 재확인은 tauri-leader가 한다.
- 메뉴 키(K-13, V1): 관련 10/10, typecheck, `npm.cmd run test` 127/127, 디버그 빌드 통과. 화면 재확인(tauri-leader 2026-11-07)에서 Close Editor `Ctrl-W`, Redo `Ctrl-Y` 표시를 확인했다(`specs/v0.5/verify/ORDER-06-R1/tauri-menu-edit.png`).

---

## R-18. 상태 바 왼쪽 아이콘 모양을 Zed와 같게 한다

**요구**

왼쪽 dock 여닫기 버튼의 아이콘을 Zed처럼 트리 모양으로, Add Project(폴더 추가) 버튼의 아이콘에 Zed처럼 "+"를 붙인다. 아이콘 출처는 R-1과 같다.

**정해진 결과**

두 아이콘이 Zed와 같다.

**판정 방법**

왼쪽 dock 여닫기 버튼이 Zed와 같은 트리 모양 아이콘이다. Add Project 버튼에 "+"가 붙어 있다. 확대 캡처에서 Zed와 같다. V3.

**출처**

I-18, core D-9, 사용자 2026-11-06.

**결과**

- 아이콘 출처·복사본·복사본이 없을 때의 모습은 R-1 "아이콘 출처와 복사본"과 같다.
- 왼쪽 dock 여닫기(상태 바 Project Panel / Close Left Dock, `src/App.tsx:63,65`): Zed `FileTree` → `file_tree.svg`(트리 모양). 근거 `crates/project_panel/src/project_panel.rs:8278~8285`, `crates/workspace/src/dock.rs:1411~1415`.
- Add Project(상태 바 `src/App.tsx:58`, 사이드바 아래 `src/App.tsx:34`): Zed `FolderAdd` → `folder_add.svg`("+"가 붙은 폴더). 근거 `crates/sidebar/src/sidebar.rs:6772~6775`.
- 사이드바 토글(`src/App.tsx:24,53`): Zed `ThreadsSidebarLeftOpen`·`ThreadsSidebarLeftClosed`(R-1 대응 표).
- 화면(V3, tauri-leader 2026-11-07, 1440×852·100%): 상태 바 왼쪽 세 버튼이 Zed와 같은 모양이다(`specs/v0.5/verify/ORDER-05/zoom-open-statusbar.png`, `zoom-closed-statusbar.png`, zed-1·2). 판정은 checker C-19(`specs/v0.5/verify/ORDER-05/ORDER-05-judgement.md`).
- 버튼 종류·순서(R-22)와 켜짐 표시(R-19)는 Phase 8이다.

---

## R-19. 사이드바·왼쪽 dock이 켜져 있으면 그 버튼을 진하게 보인다

**요구**

사이드바(폴더 보기)나 왼쪽 dock이 열려 있으면 상태 바의 그 버튼이 Zed처럼 켜짐 상태로 보이고, 닫히면 원래대로 돌아온다.

**정해진 결과**

켜짐 표시가 Zed와 같다.

**판정 방법**

사이드바와 왼쪽 dock을 열면 그 버튼이 Zed와 같은 켜짐 표시로 진해지고, 닫으면 원래대로 돌아온다. V3.

**출처**

I-19, 사용자 2026-11-06.

**Zed 확인(2026-11-07)**

조건은 R-5 "Zed 확인"과 같다(캡처 `specs/v0.5/verify/ORDER-08/`).

- 왼쪽 dock(프로젝트 패널) 열림: 상태 바 `file_tree` 아이콘 색이 강조색(One Dark `#74ade8`, `text.accent` 계열)이 되고 배경은 바뀌지 않는다. 닫힘: 보통 아이콘 색이다(`zed-cursor.png` 대 `zed-project-click1.png`).
- 사이드바 열림: 상태 바의 사이드바 토글이 사라지고, 사이드바 아래쪽 줄에 `threads_sidebar_left_open` 아이콘(왼쪽 절반 채움)이 보인다(`zed-dock-click1.png`).
- Zed 사이드바 아래쪽의 시계(스레드 기록)는 AI 기능이라 이 앱 범위 밖이다(core D-17).

---

## R-20. 파일 경로의 역슬래시를 원화 기호가 아닌 `\`로 보인다

**요구**

파일 트리, 탭 툴팁(R-11), 경로 줄(R-12)에서 역슬래시를 `\`로 보인다.

**정해진 결과**

`₩`로 보이지 않는다. 지금 tauri 파일 트리는 이미 `resources\windows`로 보인다(`refs/compare/base-tauri.png`). R-14 글꼴 변경 뒤와 R-11·R-12의 새 자리에서 판정한다.

- 실측(2026-11-07, 1920×1080·100%, 클라이언트 1440×852): 앱이 그리는 자리는 모두 `\`로 보이고 `₩`가 없다. 파일 트리 compact 행(`docs\refs`), 트리 경로 툴팁, 사이드바·타이틀 바·트리 루트(`D:\`), 편집기 본문, 미리보기 본문·코드다. 코드 변경은 없다(`verify/ORDER-04/`).
- 근거: 이 자리들의 Rendered Fonts는 IBM Plex Sans 또는 Lilex뿐이고 Malgun Gothic은 0이다. R-14 글꼴이 U+005C를 `\`로 그린다.
- 네이티브 대화 상자(TaskDialog, 메시지 박스, 폴더 선택 창)는 OS 시스템 UI 글꼴(맑은 고딕)이 U+005C를 `₩`로 그리고 앱에서 바꿀 수 없다. "OS 표시"로 R-20 판정에서 빼고 Phase 12 사용자 확인(V4)에 올린다. 문구의 구분자는 바꾸지 않는다(core-leader 결정 2026-11-07, core D-13).
- 탭 경로 툴팁(R-11)·경로 줄(R-12)은 지금 없어 Phase 9에서 판정한다.

**판정 방법**

파일 트리, 탭 툴팁(I-11), 경로 줄(I-12)에서 역슬래시가 `\`로 보이고 `₩`로 보이지 않는다. V3.

**출처**

I-20, 사용자 2026-11-06("tauri 화면이 맞습니다").

---

## R-21. 폴더 보기 패널의 모양을 Zed와 같게 한다

**요구**

폴더 보기 패널의 폭, 아이콘과 이름 사이 간격, 선택 표시를 Zed 사이드바와 같게 한다. 검색칸은 두지 않는다. 내용과 순서는 지금처럼 이 레포의 폴더 관리 기준을 따른다.

**정해진 결과**

모양이 Zed 사이드바와 같다. 지금 tauri는 폭 약 300px, 폴더 아이콘과 이름 사이 간격이 없고, 선택 항목에 1px 윤곽선이 있다(`refs/compare/X-folders-tauri.png`; 패널은 `src/shell/Sidebar.tsx`).

**판정 방법**

폴더 보기 패널의 폭, 아이콘과 이름 사이 간격, 선택 표시가 Zed 사이드바와 같다. 검색칸이 없다. V3.

**출처**

I-21, 사용자 2026-11-06.

---

## R-22. 상태 바 왼쪽 버튼 구성을 Zed와 같게 한다

**요구**

상태 바 왼쪽 버튼의 종류와 순서를 Zed(패널 토글, 프로젝트 패널, 검색, 진단(✓))와 같게 하고, 각 버튼이 Zed와 같은 패널이나 화면을 연다. 아이콘 모양은 R-18, 켜짐 표시는 R-19를 따른다.

**정해진 결과**

버튼 구성이 Zed와 같다. 지금 tauri는 패널 토글, 폴더, 열린 폴더 버튼이고 검색·진단 버튼은 없다(`refs/compare/base-tauri.png`).

**판정 방법**

상태 바 왼쪽 버튼의 종류와 순서가 Zed와 같고, 각 버튼을 누르면 Zed와 같은 패널이나 화면이 열린다. V3.

**출처**

I-22, 사용자 2026-11-06("나머지는 Zed와 동일하게"), core D-12(루트 `INTENT.md` "프로젝트 전체 검색"보다 I-22가 우선한다).

이 레포에는 프로젝트 검색과 진단(언어 서버) 기능이 없다. 범위에서 빼지 않고, Phase 8에서 구현이 막히면 그때 `[BLOCKED]`로 이유를 남긴다(core D-12, `PLAN.md` Phase 8).

**Zed 확인(2026-11-07)**

조건은 R-5 "Zed 확인"과 같다(캡처 `specs/v0.5/verify/ORDER-08/`). 툴팁의 키는 사용자 Zed 키맵 기준이다.

*왼쪽 버튼 (`zed-tip-*.png`, 버튼 중심 x 14·44·74·104)*

| 순서 | 아이콘 | 툴팁 | 비고 |
|---|---|---|---|
| 1 | `threads_sidebar_left_closed` | "Open Threads Sidebar" `Ctrl-Alt-J` | 이 앱은 폴더 사이드바다. 지금 앱 툴팁은 "Open Folder Sidebar"(`src/App.tsx`)이고 기존 결정대로 둔다 |
| — | 세로 구분선 | | |
| 2 | `file_tree` | dock 열림 "Close Left Dock" `Ctrl-B`, 닫힘 "Project Panel" | |
| — | 세로 구분선 | | |
| 3 | 돋보기 | "Project Search" `Ctrl-Shift-F` | |
| 4 | 진단 ✓ | "Project Diagnostics" `Ctrl-Shift-M` | |

- 사이드바가 닫혀 있을 때 상태 바에 Add Project(`folder_add`) 버튼이 없다. `folder_add`는 사이드바가 열렸을 때 사이드바 아래쪽 줄 오른쪽 끝에만 있다(`zed-dock-click1.png`).

*Project Search 탭 (`zed-search-empty.png`, `zed-search-results.png`, `zed-search-filters.png`, `zed-search-replace-row.png`, `zed-search-end.png`, `zed-search-open.png`, `zed-tip-filter.png`, `zed-tip-replace.png`)*

- 탭 제목: 돋보기 아이콘 + "Project Search"(빈 상태), 검색 뒤에는 검색어.
- 툴바 한 줄: 왼쪽 모두 접기/펴기 버튼, 검색칸(placeholder "Search all files…"), 칸 안 오른쪽 Aa(Match case `Alt-C`)·wd(Match whole words `Alt-W`)·.*(Match with regex `Alt-R`), 칸 밖 Toggle Filters(`Alt-F`)·Toggle Replace(`Alt-Shift-H`), 이전/다음 결과 화살표, `1/19`(현재/전체, 빈 상태 `0/0`).
- 빈 상태 가운데: "Search All Files" / "Start typing to search. For more options:" / 아이콘 + "Include/exclude specific paths `Alt-F`", "Find and replace `Alt-Shift-H`", "Match with regex `Alt-R`", "Match case `Alt-C`", "Match whole words `Alt-W`".
- Filters 줄: "Include: e.g. src/**/*.rs", "Exclude: e.g. vendor/*, *.lock" 두 칸 + "Only Search Open Files" 토글 + "Also search files ignored by configuration" 토글(기본 꺼짐 = gitignore 파일 제외).
- Replace 줄: "Replace in project…" 칸 + 다음 바꾸기·모두 바꾸기 아이콘 두 개(누르지 않음).
- 결과: 파일마다 머리줄(접기 화살표, 파일 이름, 흐린 경로 또는 제목 경로 breadcrumb, 오른쪽 "Open File `Alt-Enter`"). 그 아래 일치 줄과 앞뒤 2줄 발췌(줄 번호, 위/아래로 더 펼치기 화살표), 일치 부분 강조.
- 동작: Enter로 검색한다. `Alt-Enter`나 Open File로 그 파일·위치를 일반 편집 탭으로 연다(`zed-search-open.png`: AGENTS.md 미리보기 탭, `45:35`).
- 참고: 사용자 Zed는 VSCode 기본 키맵이라 편집 영역 포커스에서 `Alt-Shift-H`는 다른 명령(incoming calls)이 잡았다. 툴팁 표기는 `Alt-Shift-H`다.

*Diagnostics 탭 (`zed-diagnostics.png`)*

- 탭 제목 "✓ No problems"(✓ 초록).
- 툴바 왼쪽 접기 버튼, 오른쪽 아이콘 4개(검색, 스파클, 새로고침, 경고 토글).
- 가운데 "No problems in workspace".

**구현 — 상태 바 왼쪽 버튼 (K-25)**

| 상태 | 순서 |
|---|---|
| 사이드바 닫힘 | `threads_sidebar_left_closed` → 구분선 → `file_tree` → 구분선 → `magnifying_glass` → `check` |
| 사이드바 열림 | `file_tree` → 구분선 → `magnifying_glass` → `check` |

| 버튼 | 아이콘 | 툴팁 | 키 | 액션 |
|---|---|---|---|---|
| 사이드바 토글(닫힘 때만) | `threads_sidebar_left_closed` | Open Folder Sidebar | `Ctrl-Alt-J`(키맵 조회) | `multi_workspace::ToggleWorkspaceSidebar` |
| 프로젝트 패널, dock 열림 | `file_tree` | Close Left Dock | `Ctrl-B` | `workspace::ToggleLeftDock` |
| 프로젝트 패널, dock 닫힘 | `file_tree` | Project Panel | `Ctrl-Shift-E` | `project_panel::ToggleFocus` |
| 검색 | `magnifying_glass` | Project Search | `Ctrl-Shift-F` | `pane::DeploySearch` |
| 진단 | `check` | Project Diagnostics | `Ctrl-Shift-M` | `diagnostics::Deploy` |

- 키 출처: Zed `4304dec` `assets/keymaps/default-windows.json` Workspace(`ctrl-shift-f` → `pane::DeploySearch`, `ctrl-shift-m` → `diagnostics::Deploy`). 새 키는 `BUILTIN`이 아니라 `STATUS_BINDINGS`에 두었다(v0.4 고정 표 테스트 유지).
- 툴팁의 키 표시(코드 확인, W-20): 버튼은 `IconButton`에 `label`과 `action`만 주고(`src/shell/status.ts` `statusButtons`), 툴팁은 그 액션의 키를 지금 키맵에서 찾아 제목 옆에 보인다(`src/shell/tooltip.ts` `shortcutFor(keymap, action, focusStack())`). 키를 버튼에 고정하지 않으므로 표의 키는 기본 키맵 값이다: `Ctrl-Alt-J`·`Ctrl-B`·`Ctrl-Shift-E`는 `src/keymap/builtin.ts` 38~40줄, `Ctrl-Shift-F`·`Ctrl-Shift-M`은 `STATUS_BINDINGS`. 사용자 키맵을 바꾸면 툴팁의 키도 따라 바뀐다.
- 구분선: `statusbar.left_divider.width`(1)·`statusbar.left_divider.height`(16), 색 `border`, 세로 가운데, `aria-hidden`(`DECISIONS.md` D-12). V3 대조 좌표 `x_after_sidebar_toggle` 28, `x_after_file_tree` 59, `y_top` 829(desktop_measure_100, 1440×852, One Dark)는 코드에 넣지 않았다.
- 켜짐 표시(R-19): dock이 열리면 `file_tree`가 `text.accent` 색과 `aria-pressed=true`가 된다. 배경은 바뀌지 않는다(Zed `IconButton` 선택 기본색 `Color::Selected` → `text_accent`, `crates/ui/src/components/button/icon_button.rs:267~268`, `crates/ui/src/styles/color.rs:108`).
- 상태 바의 Add Project(`folder_add`)는 뺐다. 사이드바 아래쪽 줄의 Add Project와 `threads_sidebar_left_open` 토글은 그대로다.
- 진단 버튼은 K-27(Diagnostics 탭) 전까지 아무 일도 하지 않았다. K-27 뒤에는 아래 Diagnostics 탭을 연다.

**구현 — Project Search 탭 (K-26)**

- 열기: 상태 바 검색 버튼·`Ctrl-Shift-F`. 같은 폴더 컨텍스트에 이미 있으면 그 탭과 입력칸으로 돌아간다. 탭 아이콘 `magnifying_glass`, 제목은 검색 전 "Project Search", Enter 뒤 검색어.
- 툴바: 검색칸 "Search all files…", Match case(`Alt-C`)·Match whole words(`Alt-W`)·Match with regex(`Alt-R`), Toggle Filters(`Alt-F`)·Toggle Replace(`Alt-Shift-H`), 결과 이동과 현재/전체 수, 파일별 접기와 모두 접기/펴기. 빈 상태의 제목·안내·다섯 행은 위 Zed 확인 문구와 Zed 아이콘(Filter·Replace·Regex·CaseSensitive·WholeWord)이다(Zed `crates/search/src/project_search.rs:2530~2571`).
- Filters: Include/Exclude는 쉼표로 나눈 glob. Only Search Open Files, Also search files ignored by configuration(기본 꺼짐). 기본은 숨김·gitignore 규칙을 따르고, ignored를 켜면 gitignore·global·exclude·`.ignore` 필터를 풀고 숨김 규칙은 둔다.
- 실행: Enter. Rust `spawn_blocking`에서 순회·검색하고 Tauri Channel로 파일 단위 결과를 보내 UI를 막지 않는다. 새 검색은 같은 창의 이전 검색을 취소하고, 취소된 탭에는 "Search cancelled."를 보인다.
- 범위: 요청한 루트가 저장된 작업 공간 폴더 목록과 같아야 한다. 외부 루트·외부 열린 버퍼 경로는 백엔드에서 거부한다. 심볼릭 링크·junction은 따라가지 않는다(`DECISIONS.md` D-11). 작업 공간 안의 열린 편집 뷰는 미저장 텍스트로 찾는다. 디스크 파일은 UTF-8/BOM·UTF-16 BOM·CP949를 읽고 NUL 바이너리·디코딩 실패 파일은 뺀다. 검색은 파일을 쓰지 않는다.
- 결과: 파일마다 머리줄(파일 이름·전체 경로·접기·Open File), 일치 줄 앞뒤 2줄(Zed 기본 `excerpt_context_lines` 2), 줄 번호, `search.match_background` 강조. 겹치는 발췌 줄은 한 번만 보인다. 상한 파일 5,000·일치 10,000(D-11).
- 이동·열기: 이전/다음은 일치 단위로 순환한다. 결과 행 클릭은 그 행의 첫 일치(문맥 행은 열 1), Open File은 그 파일 첫 일치, `Alt-Enter`는 현재 일치를 일반 편집 탭으로 연다.
- 스펙 ID: E-061~E-063(검색칸). Project Search 전용 화면 수치는 추정해 넣지 않았다.
- 하지 않은 것: Replace 쓰기(Replace 줄·입력칸·비활성 버튼만 보임, K-29 진행 중), 클릭한 글자의 열 계산.

**구현 — Diagnostics 탭 (K-27)**

- 열기: 상태 바 진단 버튼·`Ctrl-Shift-M`(`diagnostics::Deploy`). 같은 컨텍스트의 어느 pane에든 이미 있으면 그 탭을 다시 활성화한다(`openTool`).
- 탭: 내부 식별은 "Project Diagnostics"로 고정하고 표시 제목은 "No problems". 앞의 `check` 아이콘은 `success` 토큰 색이다(Zed `Color::Success` → `status.success`, One Dark `#a1c181ff`). 다른 도구 탭의 아이콘 색은 그대로다.
- 본문: 가운데 "No problems in workspace", `text.muted`.
- 상태 바: 위치·파일 형식 신호가 없는 도구 탭이라 두 항목이 숨는다(R-5).
- 언어 서버·진단 수집·가짜 진단 데이터·새 의존성은 없다(core D-17).

| 위치 | Zed IconName / SVG | 툴팁 | 이 앱의 동작 |
|---|---|---|---|
| 왼쪽 | ChevronDownUp / chevron_down_up | Collapse All Files | 결과가 없어 비활성. 접힘 상태를 따로 만들지 않음 |
| 오른쪽 1 | MagnifyingGlass / magnifying_glass | Buffer Search | 검색할 진단 내용이 없어 비활성 |
| 오른쪽 2 | ZedAssistant / zed_assistant | Inline Assist | 지원하지 않는 AI 기능이므로 비활성. 캡처의 스파클은 이 아이콘이며 sparkle.svg로 추정하지 않음 |
| 오른쪽 3 | ArrowCircle / arrow_circle | Refresh Diagnostics | 진단 출처·언어 서버가 없어 비활성. refresh_title.svg로 추정하지 않음 |
| 오른쪽 4 | Warning / warning | Exclude Warnings | 경고 토큰색으로 표시하되 진단 데이터가 없어 비활성. 경고 포함/제외 상태를 만들지 않음 |

- 다섯 버튼 모두 처리기가 없어 `IconButton` 규칙대로 비활성이지만 툴팁은 있다. 액션 이름은 툴팁 조회용으로만 쓰고, 이 앱에 없는 액션의 키를 새로 만들지 않았다.
- Zed 근거(`4304dec`): `crates/diagnostics/src/diagnostics.rs:104~121`(빈 본문 문구·가운데·Muted), 같은 파일 762~772(Check + Success + No problems 탭), `crates/ui/src/styles/color.rs:109`(Success → `status.success`), `crates/diagnostics/src/toolbar_controls.rs:53~57,62~124`(오른쪽 네 아이콘과 툴팁, Inline Assist는 Zed에서 agent 설정에 따라 나타남), `crates/search/src/buffer_search.rs:110~143`(왼쪽 Collapse All Files, 접혔을 때 Expand All Files). 캡처 `specs/v0.5/verify/ORDER-08/zed-diagnostics.png`. Zed 코드는 복사하지 않았다.
- 화면 수치는 추정하지 않고 기존 툴바·아이콘·글꼴 스펙 변수를 썼다.

---

## R-23. 탭 바 오른쪽 버튼(+, 분할, 최대화)이 보이는 방식을 Zed와 같게 한다

**요구**

탭 바 오른쪽 버튼 묶음이 언제 보이는지(늘, 또는 마우스를 올렸을 때만)를 Zed와 같게 한다.

**정해진 결과**

보이는 조건이 Zed와 같다. 지금 tauri는 창에 마우스가 들어왔을 때만 보이고(`refs/compare/I-9-tauri.png`), v0.4에서 포커스 있는 Pane에만 두었다(v0.4 PROGRESS V4 목록 6, I-706).

**판정 방법**

탭 바 오른쪽 버튼(+, 분할, 최대화)이 보이는 조건이 Zed와 같다. V3.

**출처**

I-23, 사용자 2026-11-06("나머지는 Zed와 동일하게").

미정: Zed에서 이 버튼이 보이는 조건. 갈래가 Zed에서 확인한다(I-23 확인한 사실).
