[DONE] ORDER-06-R1 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| 1. Settings·Keymap·Extensions·Panel Layout이 2장 범위대로 열리고 동작, 단축키 같음 | V1 + V3(CDP) | 충족 | `specs/v0.5/verify/ORDER-06-R1/tauri-r1.json`, `tauri-recheck.json`, 캡처 `tauri-settings-after.png`, `tauri-settings-dropdown.png`, `tauri-keymap-editor.png`, `tauri-extensions.png`, `tauri-panel-layout.png`, `tauri-user-menu.png` |
| 2. 설정·키맵 변경 저장, 다시 실행해도 유지 | V1 테스트 + 코드 | 충족(V1). 화면에서 값 바꾸기는 하지 않음 | 아래 "저장". 저장은 앱 데이터의 고정 파일, 앱은 시작할 때 그 파일을 읽는다(C-22 확인). 실제 사용자 데이터에 쓰는 시험은 하지 않았다(측정 때 앱 데이터는 백업·복원) |
| 3. 두 갈래 화면별 항목 표가 같음 | 다른 갈래 읽기 대조 | 부분 — 아래 "gpui와 다른 점" | Settings 4행·키·기본값은 같다. Keymap·Extensions·Settings 화면은 gpui에 아직 없었다(읽은 시점) |
| 4. 앱·Zed 캡처로 틀이 Zed와 같음 | V3 | 충족(남은 작은 차이 1) | Settings 치수 = Zed 실측(아래). Zed `specs/v0.5/verify/ORDER-06/zed-*.png`(ORDER-06 1단계 캡처, Zed는 다시 열지 않음) |
| 5. 보고 | — | 충족 | 이 파일 |

## 화면별 결과
### Settings — 별도 OS 창 (`Ctrl-,`, "v" 메뉴)
- core-leader 공통안(D-13)대로 만들었다.
  - 파일: `%APPDATA%\workbench-tauri\settings.json`(Zed 형식).
  - 범주: Appearance 하나, 범위 `User`만.
  - 행: Theme Name(`theme`, 드롭다운 Catppuccin Mocha·Catppuccin Latte·One Light), Icon Theme Name(`icon_theme`, Zed (Default)), Font Size(`ui_font_size`, 16), Font Size(`buffer_font_size`, 15).
  - 문구는 Zed `settings_ui/src/page_data.rs`(4304dec732) 그대로다.
- **창 치수는 Zed 캡처 실측**(D-12, core 승인, SPEC R-2에 적어 gpui가 읽어 쓴다). Zed와 tauri가 같다:

  | 항목 | 값 |
  |---|---|
  | 창 | 900×750 |
  | 타이틀 바 | 32 |
  | 탐색 폭 | 225+1 |
  | 검색 | 205×28 |
  | 범주 행 | 28 |
  | 본문 padding | 32 |
  | 컨트롤 높이 | 28 |
  | 버튼 | 22 |
- 모양: 첫 확인에서 Zed와 다른 점 6가지를 찾아 K-14로 고쳤고, 재확인에서 Zed와 같았다.
  - 타이틀 바 글자 없음, 검색 돋보기, 범주 chevron_right, User 칩, 작은 소제목, 자체 드롭다운(위아래 아이콘, 앱 팝업 목록·체크).
  - **남은 작은 차이**: 범주 글자 시작이 x 39다(Zed 43, 4px 왼쪽).
- 저장: 바꾼 키의 값만 교체한다. 다른 키·주석·BOM은 보존하고, 잘못된 키만 기본값으로 쓴다. 이 방식이 두 갈래 기준이 됐다(core-leader).
  - 파일 교체는 원자적이다(디스크 원문 비교 → 임시 파일 → 교체). 깨진 파일은 덮어쓰지 않는다.
  - 파일을 직접 고쳐도 다시 읽고 바로 적용한다. `Edit in settings.json`은 메인 창 편집기 탭으로 연다.
- 새 capability `src-tauri/capabilities/settings.json`:
  - settings 창 label에만 적용된다. 권한은 창 제어 7개와 event listen·unlisten뿐이다.
  - main capability와 CSP는 바꾸지 않았다(DECISIONS D-5).

### Keymap — 편집 영역 탭 "Keymap Editor" (`Ctrl-K Ctrl-S`)
- 위 줄: 필터칸 "Filter action names…", `Edit in JSON`(Ctrl-E), `Create Keybinding`(Ctrl-K). 키로 찾기·필터 버튼은 넣지 않았다(카드에서 선택 사항).
- 표 열: Edit 아이콘, Action(`pane: close active item` 형식), Arguments, Keystrokes, Context, Source(Default/User). 화면 실측에서 91행이었다.
- 동작: 행 편집·새 바인딩(키 녹화 최대 3타, K-055), `<null>` 해제.
  - 저장 위치는 `%APPDATA%\workbench-tauri\keymap.json`(Zed 섹션 배열 형식)이다. 기존 내용·주석은 보존하고 override 섹션을 덧붙인다. 저장하면 바로 적용된다.
  - 크기는 스펙 ID K-010~K-083을 썼다.

### Extensions — 편집 영역 탭 "Extensions" (`Ctrl-Shift-X`)
- 틀은 Zed와 같다: 제목, 검색칸(X-46), `All`/`Installed`/`Not Installed`, 칩 `All`/`Themes`/`Icon Themes`, 카드(X-49: 높이 110·padding 12·radius 6).
- 내용은 앱에 들어 있는 자원만이다.

  | 카드 | 작성자 | 출처 |
  |---|---|---|
  | One Dark | Zed Industries | `src/theme/assets/one/one.json` |
  | One Light | Zed Industries | `src/theme/assets/one/one.json` |
  | Zed (Default) | (빈 값) | D-9 복사본 |

  - 버전·설명은 원본에 없어 비워 두었다(지어내지 않음).
  - Catppuccin은 앱에 복사된 것이 아니라 설치된 Zed 확장을 읽는 상태라 넣지 않았다. Phase 7에서 복사하면 다음 빌드에 자동으로 들어온다.
- **Zed와 다른 점**(D-15·D-8):
  - 온라인 목록, 설치·제거, `Install Dev Extension`, 다운로드 수가 없다.
  - 카드 오른쪽은 "Installed" 표시만 있다.
  - 범주 칩은 3개다.

### Panel Layout — 하위 메뉴
- `Classic`만 있다(Agentic 제거, D-15). 기본 상태에서 체크되어 있다(화면 확인).
- Classic을 누르면 왼쪽 dock을 열고 dock 기본 폭으로 되돌린다.
  - 기본 폭 상수: **`project_panel.default_width` 240px (L-32)**. gpui와 다르면 core가 정한다.
  - sidebar·분할·zoom·활성 파일은 건드리지 않는다.
- 둘 중 하나라도 기본과 다르면 `Custom`(체크·비활성)이 보이고 Classic 체크가 풀린다.

### 메뉴 맞춤 (core 결정, 두 갈래 공통)
- 메뉴 항목 키를 Zed Windows 기본 키맵(`assets/keymaps/default-windows.json`, 4304dec732, `%TEMP%`에서만 읽음)과 대조했다. 이미 같았다.
  - 표시만 바꿨다: Redo는 Zed 첫 키 `Ctrl-Y`(Ctrl-Shift-Z도 동작), Close Editor는 `Ctrl-W`(메뉴 동작은 그대로).
- "v" 버튼: Zed 캡처에서 22×22, chevron 폭 8로 tauri와 같다.
  - 최소화 버튼과의 4px 간격을 스펙 `titlebar.right_group.gap`(L-89/I-603)으로 맞췄다. 재확인에서 간격 4였다. gpui는 SPEC R-2 값을 읽어 쓴다.
- 메뉴 이름 간격은 ORDER-06 1단계에서 Zed와 1px 이내다.
- Licenses는 앱에 실제로 들어간 자원 전부다(글꼴 2, Zed 아이콘 LICENSES·GPL·Apache, Lucide, One 테마 LICENSE). Catppuccin MIT 고지는 Phase 7에서 복사할 때 함께 넣는다.

### 화면 확인에서 찾아 고친 것
- K-15: 입력란(Extensions 검색 등)에 포커스가 있으면 `Ctrl-,` 같은 Workspace 키가 동작하지 않았다.
  - 원인: v0.2부터 입력란에서는 키맵 dispatch를 통째로 건너뛰었다.
  - 수정: 입력의 편집 키는 입력에 남기고 Workspace 키는 dispatch한다(`src/keymap/keyboard.ts` 한 곳). 재확인에서 검색 포커스 상태로 Settings 창이 열렸다.

## gpui와 다른 점 (읽기만, 진행 중 스냅샷)
- Settings: 4개 키·행 이름·설명·Appearance·16/15는 같다.
  - gpui 테마 목록은 읽은 시점에 Default Light/One Light 계열이었고 tauri는 3개다. Phase 7에서 같은 목록이 된다.
  - gpui의 settings 저장 방식(전체 다시 쓰기)은 core-leader가 tauri 방식으로 정했다.
- Keymap·Extensions 화면: 읽은 시점에 gpui에는 화면 구현이 없었다(메뉴 이름·단축키만 같음). 표 대조는 gpui 구현 뒤에 해야 한다.
- Panel Layout: gpui `app_menu.rs`는 읽은 시점에 Classic·Agentic이었다(SPEC에는 제거 예정).
- View의 분할 항목: core-leader 결정대로 tauri는 이미 Editor Layout 하위 메뉴다.

## Zed에서 확인한 것
- 이번에는 Zed를 열지 않았다(core-leader 지시). ORDER-06 1단계 캡처(`specs/v0.5/verify/ORDER-06/zed-settings-window.png`, `zed-keymap.png`, `zed-extensions.png`, `zed-v-menu.png`, `zed-panel-layout.png`)로 재고 대조했다.
- 문구·구성은 Zed 소스(4304dec732)를 `gh api` GET으로 읽어 확인했다. 레포에는 복사하지 않았고 `%TEMP%`에만 두었다.

## 글꼴 파일 (D-10)
변경 없음.

## 바꾼 파일
- 앱(주요):
  - 새로: `src/settings/**`(Settings 창), `src/keymap/edit.ts`, `src/shell/KeymapEditor.tsx`·`keymap-editor.css`, `src/extensions/**`, `src/shell/layout.ts`, `src-tauri/src/user_file.rs`, `src-tauri/capabilities/settings.json`.
  - 수정: `src/keymap/keyboard.ts`·`builtin.ts`·`load.ts`, `src/shell/AppMenu.tsx`·`TitleBar.tsx`·`app-menus.ts`·`dock.ts`·`menu.ts`·`Pane.tsx`·`Icon.tsx`, `src/workspace/*`, `src/theme/*`, `src/spec/metrics.ts`, `src/app.css`, `src-tauri/src/lib.rs`·`caption.rs`(창별 caption 상태).
  - 테스트 다수.
- 문서:
  - `specs/v0.5/SPEC.md`: R-2 2단계(Settings 실측값 — gpui가 읽음, 화면별 표, Zed와 다른 점), R-17 메뉴 키.
  - `DECISIONS.md`: D-4 settings.json 처리, D-5 Settings capability.
  - `PLAN.md`(Phase 6 doing: 1·2단계 완료, core 판정 대기), `PROGRESS.md`.
- 검증 결과: `specs/v0.5/verify/ORDER-06-R1/`.
- 커밋: `git log -1 -- specs/v0.5/reports/ORDER-06-R1.md`. push 안 함.

## 검토
- coder 카드:
  - K-10(BLOCKED: 공통 표·치수 없음) → core 결정 → K-10-R1(Settings).
  - K-11(Keymap), K-12(Extensions), K-13(메뉴 키·v 간격), K-14(Settings 모양), K-15(입력 포커스 키).
- checker:
  - C-22: K-11·K-10-R1 PASS. 데이터 보존, 고정 경로, capability 최소를 봤다.
  - C-23: K-13·K-14·K-12 PASS, 지적 없음.
- 커밋 직전 전체 검사(C-23, K-15 포함): typecheck 통과, `npm.cmd run test` 131/131, `cargo test` 20, clippy 경고 0.
- 화면 차례 3회(첫 확인, 재확인, Settings 재확인).
  - tauri는 launchApp PID만 닫았다(19172, 28960, 21224).
  - 앱 데이터는 매번 백업하고 복원했다(측정 앱이 만든 settings.json 등은 복원으로 지웠다).
  - Zed는 열지 않았다.
- Codex 한도: K-10-R1 뒤 5시간 한도가 0%가 되어 core-leader에게 [BLOCKED]로 알렸다. 쿠폰 적용 뒤 모델이 GPT-6.1-Sol medium인 것을 확인하고 이어서 했다.
  - "더 싼 모델로 바꾸기" 제안은 D-2에 따라 고르지 않았다.
- 승인 창(허용 목록 밖): leader가 매번 내용을 보고 1회씩 승인했다(always allow 없음).
  - coder: Zed 고정 커밋 파일을 `gh api` GET으로 읽고 `%TEMP%\v05-K-1x-*`에 저장, 샌드박스 밖 재시도 편집(레포 `src\` 안 카드 범위 파일).
  - checker: git·Test-Path 읽기.

## 사용자 Zed 창 (알림)
- 사용자 Zed(PID 20788)에 "Zed — Settings" 창이 떠 있다. ORDER-06 1단계 측정 때 내가 SendInput으로 보낸 `Ctrl-,`(첫 시도, 그때는 캡처에 잡히지 않음)가 연 것으로 보인다.
- core-leader 지시대로 닫지 않았다. 사용자가 닫아 주면 된다.

## 사용자 확인 필요(V4)
- Settings 범주 글자 4px 차이(x 39 vs Zed 43)를 고칠지.
- Settings·Keymap·Extensions 화면의 시각 품질(Phase 12).
- 라이선스 대화상자 시각 품질(ORDER-06 그대로).

## BLOCKED
없음(Codex 한도 BLOCKED는 쿠폰 적용으로 풀림)
