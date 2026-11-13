[DONE] ORDER-05 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-1 모양 | 켜진 칸 크기·모서리·배경·테두리·아이콘 색이 시안 표와 같다 (V3, 8절: CSS↔시안 대조 표) | 코드 충족, 계산값 Phase 7에서 잼 | 아래 "#1 대조 표". `src/app.css:309-322`, `src/spec/metrics.ts:302-310` |
| 2 I-1 켜짐 조건 | 버튼 다섯 켜짐 조건, Open Folder Sidebar 늘 보임, Search는 Search 탭 있는 동안, 툴팁 (V1) | 충족 | `src/shell/status.ts:22-35`, `src/workspace/tab-view.ts:18-19` `hasSearchTab`, `src/App.tsx:75`(지금 폴더의 모든 pane 탭). 테스트 `src/shell/status.test.ts:37`. 켜진 Search 클릭은 그대로 `pane::DeploySearch`. 툴팁은 "tauri가 고른 것" 1 |
| 3 I-2 버튼 | 맨 오른쪽 `UI`·`Edit`·`View`, 구분선, 그 영역만 바뀜, 눌린 칸 없음 (V1 + V3) | V1 충족, 캡처 Phase 7에서 잼 | `src/App.tsx:86-91`, `src/shell/status.ts:37-46`, `src/settings/load.ts:111-112`, `src/settings/model.ts:50-51` `toggleThemeMode`. 버튼에 `aria-pressed` 없음 → 눌린 칸 규칙 안 걸림. 테스트 `src/theme/theme.test.ts:132` |
| 4 I-2 설정 | Dark Theme·Light Theme 여섯, 다크/라이트 상태 저장 (V1) | 충족 | `src/settings/model.ts:68-82`(여섯 줄), `:14-16`(기본·`_mode`). 테스트 `theme.test.ts:132`, `src/settings/model.test.ts:25` |
| 5 I-2 옮기기 | 옛 `theme`·`editor_theme`·`preview_theme` 네 조합에서 모양 그대로, 주석·알 수 없는 키 보존, 방법 보고 (V1) | 충족 | `src/settings/model.ts:122-137` `oldThemes`, `:189` `updateSettings`, `:168-173` `loadDefaults`. 표 테스트 `model.test.ts:25`(모두 다크·모두 라이트·섞임·일부만·무효 이름·빈 파일, 새 키 우선, 주석·알 수 없는 키·CRLF 보존, Load Defaults). 방법은 "tauri가 고른 것" 3 |
| 6 I-2 기본 | 설정 파일이 없으면 세 영역 One Light (V1 + V3) | V1 충족, 캡처 Phase 7에서 잼 | `src/settings/model.ts:14-16`, `src/theme/registry.ts:8` `DEFAULT_THEME`. 테스트 `model.test.ts:8-13`, `theme.test.ts:132`, `src/theme/registry.test.ts:20` |
| 7 I-2 선택기 | Themes… 다크·라이트 나눔, 고른 테마가 세 영역 그쪽 설정·그쪽 모드로 (V1 + V3) | V1 충족, 캡처 Phase 7에서 잼 | `src/theme/selector.ts:22-27,48-53`, `src/theme/commands.ts:17-31`, `src/settings/model.ts:52-54` `themeForAll`, `src/shell/Picker.tsx:99-100`·`src/shell/picker.css:55-56`(나눔 선). 테스트 `src/theme/selector.test.ts:56` |
| 8a I-3 Welcome | 폴더 없을 때만 pane 가운데, 머리·GET STARTED 두 줄, 단축키 글자가 키맵에서, 클릭이 명령 실행 (V1 + V3) | V1 충족, 캡처·좌표 Phase 7에서 잼 | 조건 `src/workspace/recent.ts:24` `showWelcome` ← `src/shell/Pane.tsx:443`, 머리 `src/shell/Welcome.tsx:43-49`, 줄 `recent.ts:30-36`, 가운데 `src/app.css:401-402`, 단축키 `Welcome.tsx:15`(`shortcutFor`)·`:34`(키맵 바뀌면 다시 그림), 클릭 `:54`. 테스트 `src/workspace/recent.test.ts:11` |
| 8b I-3 최근 폴더 | 맨 위·중복 없음·개수 제한·다시 켜도 남음·클릭으로 열림·없으면 구획 없음, 정한 값 보고 (V1) | 충족 | `recent.ts:16-21`, `src/workspace/store.ts:186`(열 때 넣기)·`:63,132`·`src/workspace/state-file.ts:57,75`(저장·읽기)·`store.ts:135-137,177-178`(없어진 폴더), `Welcome.tsx:28-30`. 테스트 `recent.test.ts:42`. 값은 "tauri가 고른 것" 6~11 |
| 8c I-3 선택 표시 | hover·위/아래 줄 배경, Enter 실행 (V1 + V3) | V1 충족, 배경 모양 Phase 7에서 잼 | `src/app.css:419`(`:hover`·`.selected`), `Welcome.tsx:23-27,41`(기존 `menu::*` 키 컨텍스트). 테스트 `recent.test.ts:11` |
| 9 I-3 No File | "No File"이 "No outline"과 같은 계산값, 옛 문구·버튼 없음 (V3) | 코드 충족(같은 `.outline-empty` 규칙), 계산값 Phase 7에서 잼 | `src/shell/ProjectPanel.tsx:24`, `src/app.css:705-706`. 옛 안내 문구·[Open Project] 버튼 삭제 |
| 10 테스트 | 전체 테스트 통과(기본 One Dark 기대 테스트 맞춤), typecheck 0, 보안 설정 diff 없음 (V1 + V0) | 충족 | 아래 "검증" |

### #1 대조 표 — 시안 "사용자 선택안"(E안 오목) ↔ CSS

| 항목 | 시안 값 | CSS 규칙 | 값(변수 → 토큰/치수) |
|---|---|---|---|
| 칸 크기 | 22×22 | `src/app.css:468-469`, `:304` | `--statusbar-button-height` 22px(`metrics.ts:295`, 기존 `statusbar.button_height`) |
| 모서리 | 4 | `src/app.css:310` | `--statusbar-toggled-corner-radius` 4px(`metrics.ts:304`) |
| 배경 | `editor.background` | `src/app.css:314` | `var(--editor-background)` |
| 테두리 | `border` 안쪽 1px | `src/app.css:312,319` | `inset 0 0 0 1px var(--border)` |
| 아이콘 색 | `text.accent` | `src/app.css:315` | `var(--text-accent)` |
| 안쪽 그림자 | `inset 0 1px 2px` 검정 다크 .40 / 라이트 .20 | `src/app.css:316-318,321` | `color-mix(#000 40%/20%)`, `:root[data-appearance]`로 가름 |
| 마우스 올림 | 테두리 `border.focused`, 배경 그대로 | `src/app.css:322` | `var(--border-focused)` |
| I-2 버튼 | 높이 22, 글자 11px SemiBold, `text.muted`, 올림 `ghost_element.hover`, 눌린 칸 없음 | `src/app.css:324-330` | `aria-pressed` 없음 |

One Dark·One Light의 실제 hex 계산값은 Phase 7에서 잰다.

## 검증
- K-05(커밋 `38ceb0a`): `npm.cmd run test` tests 330, pass 330, fail 0. `npm.cmd run typecheck` 오류 0. `git diff --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` 출력 없음.
- K-06(커밋 `da10b4b`): `npm.cmd run test` tests 332, pass 332, fail 0. `npm.cmd run typecheck` 오류 0. 보안 설정 diff 출력 없음.
- Rust 변경 없음(cargo 안 돌림). 앱·Zed 실행 안 함.
- checker diff 리뷰: C-05(K-05) PASS. C-06(K-06) PASS. 테스트 재실행 없음(COMMON 8절).
- 화면 검증: 하지 않음. 6절 #1·#3·#6·#7·#8·#9는 Phase 7에서 잼.

## 지운 것·더한 것·하지 않은 것
- 더함: 상태 표시줄 눌린 칸·Open Folder Sidebar 늘 보임, `UI`·`Edit`·`View` 버튼, 설정 키 9개, Themes… 나눔, Welcome 화면(`src/shell/Welcome.tsx`·`src/workspace/recent.ts` 새 파일), 최근 폴더, 명령 `welcome::OpenRecentProject1~5`. 해·달 아이콘은 `Icon.tsx`에 새로 그림(Zed 아이콘 묶음에 없음). 새 테마·아이콘 파일 없음.
- 지움: 기본 테마 One Dark(→ One Light), 영역별 `Theme` 항목, left dock 안내 문구·[Open Project] 버튼. 기존 테스트 "I-3: editor and preview themes follow theme"는 I-2가 바꾼 동작이라 옛 테마 옮기기 표 테스트로 바꿈(같은 경우들을 옮기기 결과로 검사).
- 하지 않음: 다크/라이트 버튼 명령, 최근 폴더 툴팁(전체 경로), Settings 화면의 다크/라이트 상태 행, HTML 미리보기 프레임 변경, 화면 측정.
- 남은 위험: 화면 쪽은 한 번도 띄우지 않음(가운데 정렬·아이콘 세로 맞춤·코드 글꼴 10px 대문자·Themes… 선). Welcome 치수는 Zed `main`에서 읽어 고정 커밋 `4304dec732`와 대조하지 못함 — 어긋나면 `welcome.*` 변수 값만 고치면 됨. 옛 `theme` 키 없이 쓰던 0.8.1 사용자는 One Dark → One Light(ITEMS I-2대로). Load Defaults는 옛 세 테마 키를 지움. 사이드 바 안쪽 아래 기존 Toggle Sidebar 버튼은 그대로라 열려 있을 때 토글 버튼이 두 군데 보임. 폴더 없이 pane을 나누면 Welcome이 pane마다 보임.

## tauri가 고른 것
1. Open Folder Sidebar 열림 툴팁: `Close Folder Sidebar`(닫힘 `Open Folder Sidebar`), 단축키 `Ctrl-Alt-J` 함께. Zed dock 버튼 방식(`Close Left Dock`·`Close Outline`과 같은 꼴).
2. 새 설정 키(`settings.json`, 9개): `theme_dark`·`theme_light`·`theme_mode`, `editor_theme_dark`·`editor_theme_light`·`editor_theme_mode`, `preview_theme_dark`·`preview_theme_light`·`preview_theme_mode`. `_mode`는 `"dark"`/`"light"`(Settings 화면 행 없음, ORDER-04 `outline_heading_*`와 같은 방식). 기본 `_dark` One Dark, `_light` One Light, `_mode` light. Dark Theme에는 다크 테마만, Light Theme에는 라이트 테마만(반대쪽 이름이면 무효 → 기본).
3. 옛 테마 옮기기: (1) 읽을 때 영역마다 옛 테마 = 그 영역 옛 키, 없으면 옛 `theme`(0.8.1의 "theme을 따름"). 다크면 `<영역>_mode`=dark·`<영역>_dark`=그 테마, 라이트면 반대. 새 키가 유효하면 새 키가 이김. (2) 아무 설정이나 처음 쓸 때 그 값을 새 키로 적음(옛 키·주석은 그대로). (3) Load Defaults는 새 키로 적은 뒤 옛 세 키를 지움(옛 `theme`이 되살아나 기본값을 바꾸지 않게). 옛 키가 목록에 없는 이름이거나 없으면 그 영역은 One Light. ORDER-01 `oldGaps`와 같은 방식.
4. 다크/라이트 버튼: 명령 없이 저장 함수를 바로 부름(키맵·팔레트에 없음). 툴팁 `UI: Light Theme`/`UI: Dark Theme`, `Editor: …`, `Preview: …`(지금 상태). 글자 묶음 뒤 구분선은 글자 묶음이 있을 때만.
5. Themes… 나누기: 다크 → 가로선 → 라이트. 검색어를 치면 점수순이라 선을 숨김. 선은 picker 입력줄 구분선 값, 위아래 여백 `picker.list.padding_y`.
6. 최근 폴더 개수: 5(Zed `welcome.rs` `.take(5)`, 캡처 3줄은 그때 있던 수).
7. 단축키: `Ctrl-1`~`Ctrl-5`, 키 컨텍스트 `Welcome`(포커스가 Welcome 안일 때만). 새 명령 `welcome::OpenRecentProject1`~`5` — Zed는 인자 하나짜리 명령이지만 이 앱의 명령·사용자 키맵은 인자를 받지 않아 줄마다 이름 하나.
8. 줄 이동: 기존 `menu` 컨텍스트 키(위·아래·Tab·Shift-Tab·Home·End, Enter). 포커스는 아무 데도 없을 때(body)만 Welcome이 가져감.
9. 저장하는 곳: 상태 파일 `state.json`의 `windows[0].recent_folders`(최근 것이 앞, 모르는 키 보존, 기존 디바운스 저장). 넣는 때: Open Folder 대화상자·최근 폴더 줄로 열 때(이미 등록된 폴더도 맨 위로). 앱 시작 때 되살아난 폴더는 넣지 않음. 중복 판별은 경로 정규화·대소문자 무시.
10. 없어진 폴더: 앱 시작 때 `paths_exist`로 확인해 빼고 저장. 줄을 눌렀는데 열 수 없으면 "Cannot open this folder." 알림 뒤 뺌. 확인 자체가 실패하면 빼지 않음(Zed 최근 목록도 없는 경로를 빼고 보임).
11. 보이는 조건: 열린 폴더 0개이고 그 pane에 탭이 없을 때(폴더 없이도 Settings JSON·Keymap·Extensions 탭이 열릴 수 있어 그 위에는 그리지 않음).
12. Welcome 치수·토큰(`spec/zed-metrics.toml`에 없음 → `src/spec/metrics.ts:316-333` `welcome.*`): 바탕 `editor.background`, 본문 최대 512·안쪽 32·구획 간격 24, 아이콘 45·간격 16, 제목 18px 줄 높이 1.6 `text`, 부제 12px `text.muted` 기울임, 구획 제목 10px 대문자 코드 글꼴 `text.muted`, 가로선 1px `border.variant`, 줄 높이 28·좌우 8·모서리 4·이름 14px, 줄 아이콘 14 `icon.muted`, 단축키 12px `text.muted`, hover·선택 `ghost_element.hover`·누름 `ghost_element.active`. 출처 Zed `crates/workspace/src/welcome.rs`·`ui/src/styles/typography.rs`·`button_like.rs`(값만, `main`).
13. 시안 값 중 `spec/zed-metrics.toml`에 없는 것(`statusbar.toggled.*`·`statusbar.theme_button.*`, `metrics.ts:302-314`): 모서리 4, 안쪽 테두리 1, 그림자 0 1px 2px 다크 .4·라이트 .2, 글자 11px·600, 안쪽 여백 왼쪽 4·오른쪽 5, 아이콘-글자 3.

## 바꾼 파일
- K-05 `38ceb0a`: `src/settings/model.ts`·`model.test.ts`·`load.ts`·`choices.ts`·`Settings.tsx`, `src/theme/registry.ts`·`registry.test.ts`·`apply.ts`(주석)·`commands.ts`·`selector.ts`·`selector.test.ts`·`theme.test.ts`, `src/shell/status.ts`·`status.test.ts`·`Icon.tsx`·`picker.ts`·`Picker.tsx`·`picker.css`, `src/workspace/tab-view.ts`, `src/spec/metrics.ts`, `src/app.css`, `src/App.tsx`
- K-06 `da10b4b`: `src/shell/Welcome.tsx`(새), `src/workspace/recent.ts`·`recent.test.ts`(새), `src/workspace/state-file.ts`·`store.ts`, `src/keymap/keyboard.ts`, `src/shell/Pane.tsx`·`ProjectPanel.tsx`·`Icon.tsx`, `src/spec/metrics.ts`, `src/app.css`

## 미정
- Welcome 치수(Zed `main`에서 읽음)가 고정 커밋 `4304dec732`와 같은지 — Phase 7 캡처 대조 때 leader-core가 봄.
- 사용자 확인 목록 후보(leader-core): 해·달 아이콘 모양(새로 그림), 눌린 칸 안쪽 그림자 느낌, Welcome 앱 아이콘 45px 선명도, 사이드 바 열림 때 토글 버튼이 두 군데 보이는 것, 0.8.1에서 쓰던 폴더는 이 버전에서 한 번 열어야 최근 목록에 생기는 것.

## BLOCKED
- 없음
