[DONE] ORDER-06 1단계 — Zed "v" 메뉴 확인 (tauri)

## 조건
- Zed 새 창(`zed -n %TEMP%\v05-i20`), 클라이언트 1440×852, 100%, 테마 One Dark, 아이콘 테마 Catppuccin Latte(사용자 설정, 바꾸지 않음).
- Zed 신뢰 창에서는 Stay in Restricted Mode(Ctrl+Alt+Shift+S)를 골랐다. "v" 메뉴 항목과 구성은 Restricted Mode에서도 같다.
- 확인 방법:
  - leader가 SendInput(`tools/win-input.ps1`)으로 그 창에만 입력하고 캡처했다.
  - 측정이 끝나면 그 창만 WM_CLOSE로 닫았다. Settings는 별도 OS 창으로 열렸고, 그 창도 HWND로 그것만 닫았다.
- 화면에서 아무 값도 바꾸지 않았다(설정·단축키·테마 선택·확장 설치 없음).
  - 사용자 `%APPDATA%\Zed\settings.json`의 수정 시각은 측정 전후 같다(2026-11-06 20:35:50). `keymap.json`은 없고 새로 생기지 않았다.
- 메뉴 정의 근거: Zed 소스 `crates/title_bar/src/title_bar.rs`(커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`) 1374~1415행. 동작을 이해하는 데만 읽었고 복사하지 않았다.
- 캡처: `specs/v0.5/verify/ORDER-06/zed-*.png`.

## "v" 버튼과 메뉴
- 위치: 타이틀 바 오른쪽 `Sign In` 옆, 최소화 버튼 바로 앞의 `ChevronDown` 버튼.
- 메뉴(`zed-v-menu.png`), 위에서부터:

| 순서 | 항목 | 단축키 표시 | 여는 것 |
|---|---|---|---|
| 1 | Settings | Ctrl-, | **별도 OS 창**(Settings 창) |
| 2 | Keymap | Ctrl-K Ctrl-S | 편집 영역의 **새 탭** "Keymap Editor" |
| 3 | Themes… | Ctrl-K Ctrl-T | **모달 선택기** "Select Theme…" |
| 4 | Icon Themes… | (없음) | **모달 선택기** "Select Icon Theme…" |
| 5 | Extensions | Ctrl-Shift-X | 편집 영역의 **새 탭** "Extensions" |
| — | (구분선) | | |
| 6 | Panel Layout | `>` | **하위 메뉴**(Classic, Agentic, 조건부 Custom) |

- 로그인하면 구분선 뒤에 Sign Out이 더 나온다. 로그인하지 않아 확인하지 않았다.

## 항목별 화면

### 1. Settings — 별도 창 (`zed-settings-window.png`)
- 구성:
  - 왼쪽 탐색: 맨 위 검색칸 "Search settings…", 그 아래 접히는 범주 목록이다. General, Appearance, Keymap, Editor, Languages & Tools, Search & Files, Window & Layout, Panels, Debugger, Terminal, Version Control, Collaboration, AI, Network, Developer 순이다. 맨 아래에 `Ctrl-Shift-E Focus Navbar` 안내가 있다.
  - 오른쪽 위: 범위 선택(`User` / 프로젝트 이름 `projects` / `+1` 드롭다운)과 `Edit in settings.json` 버튼.
  - 오른쪽 본문: 범주 제목(General) 아래 설정 행이 이어진다. 행마다 이름, 설명 한두 줄, 오른쪽 컨트롤(토글 또는 드롭다운)이 있다.
  - 예: Accessible Mode(토글), When Closing With No Tabs(드롭다운 Platform Default), On New Window(Launchpad), On Last Window Closed, Use System Path Prompts(토글), Use System Prompts, Redact Private Values.
- 동작: 토글·드롭다운을 바꾸면 그 값이 바로 저장된다.
  - User 범위는 `%APPDATA%\Zed\settings.json`, 프로젝트 범위는 그 프로젝트의 `.zed/settings.json`에 저장된다.
  - `Edit in settings.json`은 JSON 파일을 편집기 탭으로 연다.

### 2. Keymap — 새 탭 "Keymap Editor" (`zed-keymap.png`)
- 구성:
  - 위: 필터칸 "Filter action names…", 키 입력으로 찾기 버튼, 필터 버튼, `Edit in JSON`(Ctrl-E), `Create Keybinding`(Ctrl-K).
  - 표 열: Action, Arguments, Keystrokes, Context, Source(Base/Default/User 등). 행마다 액션 하나와 그 바인딩이다.
- 동작: 행을 골라 키 바인딩을 바꾸거나 새로 만든다. `Edit in JSON`은 키맵 파일을 연다.
  - 저장 위치는 `%APPDATA%\Zed\keymap.json`(사용자 키맵)이다. 지금은 파일이 없다.

### 3. Themes… — 모달 "Select Theme…" (`zed-themes.png`)
- 구성:
  - 맨 위 검색칸 "Select Theme…", 그 아래 테마 이름 목록. 지금 테마(One Dark)에 체크와 강조가 있다.
  - 아래 줄: `View Theme Docs ↗`, `Install Themes`.
- 동작: 목록에서 고르면 테마가 바뀌고 `settings.json`의 `"theme"`에 저장된다.
  - Zed 테마 선택기는 움직이는 동안 미리 보여 주고, 닫으면 원래 값으로 돌아간다. 동작 이해로만 확인했고, 이번에는 선택을 움직이지 않았다.
  - `Install Themes`는 Extensions 탭을 테마 범주로 연다.

### 4. Icon Themes… — 모달 "Select Icon Theme…" (`zed-icon-themes.png`)
- 구성: Themes와 같은 모양이다.
  - 목록: Catppuccin Frappé/Macchiato/Mocha/Latte 계열, Zed (Default) 등. 지금 값(Catppuccin Latte)에 체크가 있다.
  - 아래 줄: `View Icon Theme Docs ↗`, `Install Icon Themes`.
- 동작: 고르면 `settings.json`의 `"icon_theme"`에 저장된다.

### 5. Extensions — 새 탭 "Extensions" (`zed-extensions.png`)
- 구성:
  - 제목 "Extensions"와 오른쪽 `Install Dev Extension` 버튼.
  - 검색칸 "Search extensions…"와 오른쪽의 `All` / `Installed` / `Not Installed` 전환.
  - 범주 칩: All, Languages, Themes, Icon Themes, Language Servers, Debug Adapters, MCP Servers, Snippets.
  - 온라인 확장 목록 카드: 이름, 버전, 태그(Languages·Grammars·Language Servers·Themes 등), 설명, 작성자, 다운로드 수, 오른쪽 `Install`/`Uninstall`과 메뉴.
- 동작: 설치·제거, 개발 확장 설치(로컬 폴더).
  - 설치하면 `%LOCALAPPDATA%\Zed\extensions\installed`(색인 `index.json`)에 들어간다.
  - 이번에는 아무것도 설치하지 않았다.

### 6. Panel Layout — 하위 메뉴 (`zed-panel-layout.png`)
- 항목: `Classic`, `Agentic`, 그리고 지금 배치가 두 가지 어느 것도 아닐 때만 체크되고 비활성인 `Custom`이 나온다. 이 환경에서는 Custom에 체크가 있었다.
- 동작:
  - Classic(`UseClassicLayout`)은 편집기 중심 패널 배치, Agentic(`UseAgenticLayout`)은 에이전트 패널 중심 배치로 바꾼다.
  - 바꾼 배치는 사용자 `settings.json`에 패널 위치 설정 차이로 저장된다(`AgentSettings::set_layout`).
  - AI 기능이 꺼져 있으면 이 하위 메뉴와 앞 구분선이 나오지 않는다(`title_bar.rs` `when(ai_enabled, …)`).
- 지금 tauri에는 AI 패널이 없다. 2단계에서 Classic·Agentic이 무엇을 바꿀지 core가 정해야 한다.

## `≡` 메뉴 막대 (I-17 참고, `zed-menubar.png`)
- `≡`를 누르면 메뉴 막대 `Zed File Edit Selection View Go Run Window Help`가 펼쳐지고 첫 메뉴(Zed)가 열린다.
- 막대 뒤에 프로젝트 이름(v05-i20)은 보이지 않는다. Restricted Mode 표시만 있다.
- 메뉴 막대 이름 간격의 tauri 대조는 최종 보고 `ORDER-06.md`에 적는다.
- 각 메뉴 안 항목 순서는 Zed 소스 `crates/zed/src/zed/app_menus.rs`(같은 커밋)로 확인했다. 메뉴마다 화면 캡처를 시도했지만 두 번째 클릭이 막대를 닫아 쓰지 못했고, 그 캡처는 지웠다.

## 2단계를 위한 정리 (core 판단용)
| 항목 | Zed가 여는 것 | 저장 위치 | 화면 규모 |
|---|---|---|---|
| Settings | 별도 OS 창 | `%APPDATA%\Zed\settings.json`, 프로젝트 `.zed/settings.json` | 큼(범주 15개, 행마다 컨트롤) |
| Keymap | 편집 영역 탭 | `%APPDATA%\Zed\keymap.json` | 중간(표, 필터, 바인딩 편집) |
| Themes | 모달 선택기 | settings.json `theme` | 작음 |
| Icon Themes | 모달 선택기 | settings.json `icon_theme` | 작음 |
| Extensions | 편집 영역 탭 | `%LOCALAPPDATA%\Zed\extensions\` | 큼(온라인 목록, 설치) |
| Panel Layout | 하위 메뉴(Classic/Agentic/Custom) | settings.json 패널 위치 | 작음(앱의 패널 구성에 따라 다름) |

## 특이사항
- Zed가 테스트 폴더(`%TEMP%\v05-i20`)의 지난 측정 탭(paths.md, Preview, Keymap Editor)을 새 창에서 다시 열었다. 테스트 폴더의 Zed 작업 공간 기억이고, 사용자 프로젝트와는 무관하다.
- `Ctrl-,`와 `Ctrl-K Ctrl-T`를 SendInput으로 보낸 첫 시도는 열리지 않았다. 그래서 Settings·Themes는 "v" 메뉴 클릭으로 열었다. Keymap(Ctrl-K Ctrl-S)과 Extensions(Ctrl-Shift-X)는 단축키로 열렸다.
- **알림 창 1개를 닫음**: Keymap 측정 중 Zed 알림 팝업("DESKTOP: workbench-core / projects", View·Dismiss)이 새 창으로 떴다.
  - 내 스크립트는 그때 "이번 실행에서 새로 생긴 Zed 창"을 모두 닫게 되어 있어, 이 알림 창에도 WM_CLOSE를 보냈다.
  - 내가 연 창이 아니었다. 그 뒤 스크립트를 고쳐 추가 창은 캡처만 하고 닫지 않는다. 닫을 창은 화면을 보고 HWND 하나씩 닫는다.
  - 사용자 Zed 프로세스(20788·18016)와 기존 창은 그대로다.
