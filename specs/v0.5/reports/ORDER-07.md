[DONE] ORDER-07 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| 1 문서·복사본 | 출처·두는 곳·라이선스·다시 채우는 방법·복사본 없을 때 모습이 문서에 있다. 복사본 추적 0건 | 충족 | SPEC "복사본 출처" 절(커밋 2ae5abf), 아래 "복사본 출처". `git ls-files src/theme/assets src/assets` → 추적은 기존 `one/one.json`·`one/LICENSE`뿐(checker C-24 확인) |
| 2 I-4 테마 | Select Theme…에 2장 테마 전부, 미리 보기·Esc 복원·Enter 저장, 고르면 UI 색이 바뀜. V2 21테마 색 표, V3 One Dark Zed 대조 | 충족 | 목록 21개(dark 이름순 → light 이름순). Esc 뒤 배경 `#3b414dff` 복원, settings.json 그대로. "gruvbox dark hard" 검색 1건 → Enter 저장. V2 표 `specs/v0.5/verify/ORDER-07/v2-colors.md`: CSS 값 = JSON 251/252(나머지 1은 대체값), 그려진 색 차이 평면 ≤3·반투명 선택 ≤7. V3 One Dark 8자리 Zed와 차이 ≤1. tauri `tauri-theme-selector.png`·`tauri-after-save-gruvbox-dark-hard.png` / Zed `zed-theme-selector.png`·`zed-main.png` |
| 3 I-3 아이콘 테마 | Select Icon Theme…에 아이콘 테마 전부, 고르면 트리 아이콘이 바뀜. Zed 대조는 Catppuccin Latte, Zed (Default)는 대응 표·출처 | 충족(탭은 아래 결정 필요 1) | 목록 9개(Catppuccin Frappé/Macchiato/Mocha/Latte와 각 Monochrome, Zed (Default)), Latte 선택 표시. 트리 아이콘 Catppuccin Latte 22행 Zed와 일치(평균 차이 ≤7). `cmp-icons-zed-top-tauri-bottom.png`, `tauri-icon-theme-selector.png`, `tauri-main-onedark-latteicons.png`. Zed (Default) 대응은 Zed 커밋 4304dec732 `crates/theme/src/icon_theme.rs`에서 문자열만 뽑음(stems 5, suffixes 293, file_icons 92, directory_icons 2) |
| 4 기본값 | settings.json 없으면 One Dark·Zed (Default) | 충족 | `tauri-default.json`(`settingsExists:false`, 배경 `#3b414dff`, README 아이콘 svg = Zed (Default)), `tauri-default.png` |
| 5 연결 | "v" 메뉴·Settings 창·Extensions 탭이 3.3대로 | 충족(Extensions는 아래 결정 필요 2) | "v" 메뉴 Themes…·Icon Themes…가 `theme_selector::Toggle`·`icon_theme_selector::Toggle`로 선택기를 연다(`src/shell/app-menus.ts:63-64`, V1 테스트). Settings 드롭다운 Theme 21·Icon Theme 9(`tauri-main.json` settingsDropdowns). 선택기 바닥 "Install Themes"·"Install Icon Themes" → Extensions 탭 범주. Extensions 카드: Catppuccin 0.2.27, Catppuccin Icons 1.24.0, macOS Classic Theme 0.4.0 |
| 6 앞 Phase 유지 | 테마를 바꿔도 글꼴·아이콘 모양·메뉴·창이 깨지지 않음(대표 테마 V3) | 충족 | `tauri-theme-{One-Dark,One-Light,Ayu-Mirage,Gruvbox-Light-Hard,Catppuccin-Latte,macOS-Classic-Dark}.png`. 배치 같음, 선택기 프레임 x 448–991·top 80 Zed와 같음 |

- 공통 조건: 1920×1080, 배율 100%, 클라이언트 1440×852. tauri 앱 데이터는 백업·시험 데이터·복원(복원 뒤 차이 0). Zed는 `zed -n` 새 창만 열고 그 창만 닫음. 사용자 Zed 설정·테마·신뢰 목록 바꾸지 않음. Zed 테마 선택기는 열고 캡처한 뒤 Esc만.
- 검사: `npm run typecheck` 통과, `npm run test` 168/168, `cargo test` 20, `cargo clippy -D warnings` 0(checker C-24, K-17~K-21 리뷰 PASS).

## 복사본 출처
| 복사본 | 출처(고정) | 두는 곳(.gitignore) | 라이선스 |
|---|---|---|---|
| Zed 기본 테마(One·Ayu·Gruvbox) | zed-industries/zed 커밋 `4304dec732a75505066de5ce2dbbfb2bec369498` `assets/themes/` | `src/theme/assets/zed/` | 함께 복사한 각 폴더 `LICENSE*` |
| Zed (Default) 아이콘 테마 | 같은 커밋 `crates/theme/src/icon_theme.rs`의 대응 문자열(코드 복사 없음) + `assets/icons/file_icons/` | `src/assets/icon-themes/zed/`, 아이콘 파일 `src/assets/zed-icons/` | 같음 |
| Catppuccin | catppuccin/zed 태그 `v0.2.27` 커밋 `83fe57ba356a3b4dc4ac78b8d98d8ae95e093e45` | `src/theme/assets/catppuccin/` | MIT(`LICENSE`) |
| Catppuccin Icons | catppuccin/zed-icons 태그 `v1.24.0` 커밋 `fe864c992c5da1e417e5897b741b7de9b90830e0` | `src/assets/icon-themes/catppuccin-icons/` | MIT(`LICENSE`) |
| macOS Classic | huacnlee/zed-theme-macos-classic 태그 `v0.4.0` 커밋 `22266e11c4b8962be2e259011251b4016ff00552` | `src/theme/assets/macos-classic/` | `LICENSE` |

- 버전은 이 PC 설치 확장(0.2.27, 1.24.0, 0.4.0)·core NOTICE와 같다.
- 다시 채우기: `pwsh tools/fetch-zed-themes.ps1`(고정 커밋 sparse fetch, 임시 폴더는 GUID 이름만 지움). 실행 중에는 내려받지 않고 이 PC Zed 폴더도 읽지 않는다(번들 glob만).
- 복사본이 없을 때: 테마는 레포의 One(One Dark·One Light)만, 아이콘은 UI 아이콘 file/folder로 대체, 앱은 깨지지 않는다(C-24 확인).

## Phase 중 고친 것
- K-22(14f15c0): 선택기 목록 스크롤바가 늘 보이던 것을 Zed처럼 목록 위에 포인터가 있을 때만 보이게(폭 L-308 6px). settings.json에 새 키를 덧붙이면 `\n\n,"theme"`처럼 형식이 깨지던 것을 원인(`updateSetting`)에서 고침. V1 테스트, 화면 재측정은 하지 않음.

## 남은 차이
- Zed "View Theme Docs" 버튼 없음: ORDER에서 제외.
- 선택기 미리 보기에 문법 색 없음: 구문 강조는 Phase 11(I-15).
- 선택기 스크롤바 자동 숨김 1초(E-033)·썸 최소 25px: Windows 판정 미확인, webkit으로 지정 불가라 생략. 스크롤 위치가 Zed와 조금 다름(Zed는 One Dark가 맨 아래, tauri는 한 줄 일부가 더 보임).
- 이 Phase 밖: 트리 정렬(Zed는 package.json이 package-lock.json 앞, tauri 반대), Zed는 `.git`을 숨김.

## 결정 필요(core)
1. 탭 파일 아이콘: ORDER 3.2는 "트리와 탭"인데 Zed 기본값 `tabs.file_icons = false`(L-67·A-21.12)라 탭에는 그리지 않았다. 사용자 Zed도 이 설정이 없다. 탭에도 그리라면 coder 카드 한 장.
2. Extensions 기본 묶음: ORDER 3.3은 "기본 묶음을 보인다"인데 Zed는 내장 테마를 Extensions 목록에 보이지 않는다(02-INTERACTION 16절). 그래서 `extension.toml`이 있는 3개만 카드로 보인다.
3. 선택기의 toml에 없는 값은 01-LAYOUT 4.13 문구에서 가져왔다(DECISIONS D-10). gpui가 toml에 올릴지 core 판단.
4. 테마 JSON에 없는 토큰은 JSON → T-26 파생 → 같은 appearance의 One 값 → 고정값 순으로 대체(D-8). 21테마 중 macOS Classic Dark `text.accent` 하나가 해당.
5. Monochrome 아이콘 변형 4개도 목록에 포함(Zed와 같음).

## 운영
- coder: 12:13 Codex 한도 6%로 D-16대로 Sonnet 5.5 high로 바꿈. 14:08 K-22 끝에서 Sonnet coder를 종료했으나 Codex 시작이 패널 wJ:pM 무응답으로 아직 안 됨(herdr agent start timeout 2회, 패널이 입력을 받지 않음). 다음 coder 카드 전에 다시 시작하고 시각을 HERDR-SETUP·PROGRESS에 적는다.
- 커밋(push 안 함): 87a21ec, f029665, 0113f2c, df1ae22, b469be1, 8313414, 14f15c0, 2ae5abf, 그리고 이 보고·측정 파일 커밋.
