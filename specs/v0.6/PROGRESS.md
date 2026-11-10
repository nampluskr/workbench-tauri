> 버전: v0.6 · 작성일: 2026-11-10 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서는 `PLAN.md`에, 요구와 판정 방법은 `SPEC.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.6/reports/`에 있다.

# PROGRESS — workbench-tauri v0.6

## Phase별 진행

### Phase 1 — tauri 준비

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: workspace `wV`에 탭 셋(docs `wV:t2`, impl `wV:t3`, check `wV:t4`)을 만들고 control `wV:t1`과 함께 탭 배치를 control·docs·impl·check로 두었다. 서브 에이전트 셋(`tauri-writer` `wV:p2`, `tauri-coder` `wV:p3`, `tauri-checker` `wV:p4`)을 `HERDR-SETUP.md` 1장 명령으로 시작하고 역할만 확인시켰다.
  - 결과: `herdr agent list`에 `tauri-leader`(claude, `wV:p1`), `tauri-writer`(claude, `wV:p2`), `tauri-coder`(codex, `wV:p3`), `tauri-checker`(agy, `wV:p4`)가 있고, `herdr tab list`의 `wV` 탭 이름이 control·docs·impl·check다(tauri-writer 확인 2026-11-10). worktree 없음. v0.5 pane은 남아 있지 않아 닫은 pane은 없다.
  - 검증: 위 두 명령 출력. 모델·effort는 `herdr agent list`에 나오지 않아 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.6 문서 여섯** (2026-11-10)
  - 무엇을 했나: `specs/v0.6/`에 INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP·PROGRESS를 상태 "초안"으로 썼다(ORDER-01 3.1~3.3).
  - 결과: SPEC은 I-1~I-20을 R-1~R-20(같은 번호)으로 옮기고 판정 방법은 ITEMS 그대로다. C-1~C-9는 옮기지 않았다. PLAN은 core Phase 1~10과 번호를 같게 두고 대응 표, core D-5 진행 규칙, core D-8 구현 원칙을 넣었다. DECISIONS의 이 레포 결정은 없음이다. HERDR-SETUP은 ORDER-01 3.2·3.3대로 쓰고 gpui와 화면 차례를 나누던 내용을 뺐으며, v0.5 3장·5.5는 가리키기만 했다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 루트 `INTENT.md`("workbench-gpui와 같아야 한다", "Zed와 같아야 한다")가 core D-1·D-6·D-7과 어긋난다. 혼자 맞추지 않고 `DECISIONS.md` 미결 사항에 두었다.
- **W-01 루트 AGENTS.md** (2026-11-10)
  - 무엇을 했나: 레포 규칙 "HERDR 구성은 core가 정한다"(core v0.6 D-4), "core ITEMS 우선"(core v0.6 ITEMS I-1~I-20), 1장 개요(gpui는 동결된 갈래, 현재 상태 v0.6 진행 중), 0장 읽을 것 경로, 카드 파일 이름(`v06-`), 3A.4·8장의 `specs/v0.6/` 경로를 고쳤다.
  - 결과: "사람이 정하고 묻는다", "지난 버전 폴더 불변", "Zed 코드 복사 금지", "자기 워크스페이스만 쓴다"와 "`spec/`의 원본은 `workbench-gpui`다" 문장은 그대로다(ORDER-01 3.1·5장).
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 없음.
- C-01 checker 검토 [PASS], 지적 없음(보고 `C:\Users\nampl\AppData\Local\Temp\v06-C-01-report.md`) (2026-11-10)
- leader 커밋 `4fa27fc`(push 안 함), ORDER-01 보고는 `specs/v0.6/reports/ORDER-01.md` (2026-11-10)
- **W-02 tauri 지침을 core v0.6에 맞추기(ORDER-01-R1)** (2026-11-10)
  - 무엇을 했나: core D-9(사용자 2026-11-10)대로 루트 `INTENT.md`에서 gpui·Zed 원칙, 확장 설치, v0.5 ITEMS·D-12 예외 문장을 고쳤다. 루트 `AGENTS.md`에서 레포 규칙 10·11·12줄 괄호 근거, 19·40·44줄 "Zed 재현" 전제, 77·78·194·195·240줄의 v0.5 번호 예외와 `spec/` 원본을 고쳤다. `specs/v0.6/` INTENT·DECISIONS·HERDR-SETUP의 미정(새 파일 형식, `spec/` 원본, 루트 지침 넷, Codex 대체, `docs/BUILD.md` 작성자, 5.5 위임)을 반영했다.
  - 결과: 고친 문장마다 원래·고친 것·근거를 `%TEMP%\v06-W-02-report.md` 표에 적었다. 네 규칙("사람이 정하고 묻는다", "지난 버전 폴더 불변", "Zed 코드 복사 금지", "자기 워크스페이스만 쓴다") 본문은 그대로다. 상태 줄은 "초안"이다.
  - 검증: V0. 문서만 바뀌어 빌드·테스트는 실행하지 않았다. `spec/`는 tauri-leader가 `diff -rq spec D:\projects\workbench-core\spec`로 확인했다. 출력이 없었다(exit 0, 2026-11-10).
  - 특이사항: 없음.
- **W-03 R1 제안 반영(ORDER-01-R2 2장 1·3·4번)** (2026-11-10)
  - 무엇을 했나: 루트 `INTENT.md` "변하지 않는 원칙"에서 "테마·아이콘 테마는 미리 넣어 둔 것 중에서 고르기만 한다. / 받기·추가 기능은 두지 않는다." 두 줄을 지웠다. 루트 `AGENTS.md` 11줄 괄호를 "(core v0.5 D-7)"로 고치고, 3장 77줄 다음에 창 크기·글꼴 표 줄을 더했다(core v0.6 D-8).
  - 결과: "다루지 않는 것"과 INTENT 5줄은 그대로다. 2번(194줄 커스텀 스킴)은 checker 확인 뒤, 5번(checker `git grep`)은 사용자 결정 뒤 따로 한다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 운영 변경으로, 보고 파일에 커밋 해시를 적으려고 커밋을 따로 하는 일을 그만둔다(ORDER-01-R2 2장, 사용자 적용 2026-11-10).
- C-03 checker 확인 [CONFIRMED]: 커스텀 스킴·asset protocol이 없고, 테마·아이콘 테마·UI 아이콘·문법 모두 `.gitignore` 폴더 복사본을 Vite `import.meta.glob`으로 함께 빌드한다(보고 `C:\Users\nampl\AppData\Local\Temp\v06-C-03-report.md`) (2026-11-10)
- **W-04 AGENTS.md 5장 복사본 문장(ORDER-01-R2 2장 2번)** (2026-11-10)
  - 무엇을 했나: 루트 `AGENTS.md` 5장 195줄(커스텀 스킴·A-55.2 문장)을 "Zed 테마·아이콘 테마·UI 아이콘·문법은 `.gitignore` 폴더에 복사해 함께 빌드한다. 복사본은 core ITEMS가 정한 것만 둔다."로 바꿨다. 코드는 고치지 않았다.
  - 결과: C-03 확인 결과와 같다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: ORDER-01-R2 5번(checker `git grep`)은 사용자가 `.agents/checker-settings.json`에 직접 넣기로 했다. auto mode가 leader·writer의 권한 설정 변경을 막는다(2026-11-10). 넣은 뒤 `HERDR-SETUP.md`에 적는다.

### Phase 2 — 기능 축소

- **K-01 기능 축소 구현(ORDER-02, R-4~R-7)** (2026-11-10, coder)
  - 무엇을 했나:
    - 내용 검색 `src-tauri/src/project_search.rs`, `src/search/model.ts`·`replace.ts`와 테스트를 지웠다.
    - 이름 검색 `src-tauri/src/name_search.rs`를 새로 뒀다. `search_names`는 대소문자를 무시한 부분 일치이고, 링크·junction을 따라가지 않고, 창 폴더 루트 밖은 거부하고, 결과는 5,000개까지다.
    - "Search" 탭: 파일 결과는 열고, 폴더 결과는 Left Dock을 열어 트리에서 펼치고 선택한다. 대소문자·정규식·단어·Replace 버튼은 없다.
    - `src/diagnostics/` 전체와 상태 바 진단 버튼·`Ctrl-Shift-M`을 지웠다. 버튼 자리는 비웠다(Phase 10 I-18 자리).
    - 테마·아이콘 테마 선택 창 버튼을 "View Themes"·"View Icon Themes"로 바꿨다(콜백 이름 viewThemes·viewIconThemes). Extensions 화면은 그대로다.
  - 결과: 언어 서버 클라이언트 코드·의존성은 원래 없었다(R-4).
  - 검증: typecheck, cargo check, clippy, cargo test 21, 관련 node 테스트 통과.
  - 특이사항: 없음.
- **K-02 regex 직접 의존성 제거** (2026-11-10, coder)
  - 무엇을 했나: `src-tauri/Cargo.toml`의 `regex = "=1.13.1"`, `Cargo.lock`의 workbench-tauri 의존성 목록 한 줄, `src/licenses/regex-1.13.1-*.txt` 두 파일을 지웠다.
  - 결과: regex는 tauri-utils·urlpattern의 간접 의존성으로 `Cargo.lock`에 남는다.
  - 검증: cargo check·clippy·test 21 통과, Licenses 테스트 통과.
  - 특이사항: 근거는 core D-8, core-leader 2026-11-10.
- C-05 checker [PASS]: 전체 typecheck, npm test 210 통과, clippy 경고 0, cargo test 21 통과, R-4~R-7 코드 검토 지적 없음 (2026-11-10)
  - 특이사항: checker가 `git diff src-tauri/Cargo.toml` 허가 창에서 1시간 넘게 멈췄다(허용 목록에 git diff 없음). leader가 취소하고 diff를 직접 확인했다. 허용 목록 추가는 미정(사용자 설정).
- **V3 화면 검증(ORDER-02)** (2026-11-10, leader 측정·checker C-06 판정 [PASS])
  - 무엇을 했나: 주 모니터 100%, One Light, Catppuccin Latte, 임시 APPDATA와 임시 폴더(README.md, thread.ts, other.txt, reader/notes.txt, docs/guide.md)에서 쟀다. 입력은 SendInput(`tools/win-input.ps1`), 값은 CDP.
  - 결과: 1~10 모두 통과 — 툴팁 "Search", `Ctrl-Shift-F`로 Search 탭, `read` → README.md·reader·thread.ts, `rdm` → 없음, 폴더 결과 reveal·선택, 파일 결과 열림, 진단 버튼 없음·`Ctrl-Shift-M` 무동작, "View Themes"→Themes 범주, "View Icon Themes"→Icon Themes 범주, 앱 프로세스는 workbench-tauri.exe·msedgewebview2.exe뿐.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-02/`(PNG 10개, `v3.json`, `v3b.json`).
  - 특이사항: 두 세션 모두 SendInput `ctrl+k ctrl+t`로 테마 선택 창이 열리지 않아 사용자 메뉴로 열었다. ORDER-02는 이 바인딩을 바꾸지 않았다(`src/theme/selector.ts` 6줄 그대로). 원인은 확인하지 않았다. 첫 실행은 이전 실행의 고아 WebView2 프로세스가 데이터 폴더를 잡고 있어 실패했고, leader가 그 프로세스를 끝낸 뒤 다시 실행했다. I-7 부분은 두 번째 세션에서 다시 쟀다.

### Phase 3 — 배포

- **K-03 버전 한 곳·BUILD.md·Licenses(ORDER-03, R-1~R-3)** (2026-11-10, coder)
  - 무엇을 했나:
    - 버전 값을 `src-tauri/tauri.conf.json` `version` 한 곳(`0.6.0`)에만 뒀다. `package.json`·`package-lock.json` 루트 `version`을 지웠고(private 패키지), `src-tauri/Cargo.toml` `version`은 생략했다(Cargo.lock 자기 패키지 0.0.0). 의존성 변경은 없다. tauri-build 2.7.4가 config version을 exe·설치 파일의 FileVersion·ProductVersion에 넣는 것을 소스로 확인했다.
    - `docs/BUILD.md`: NSIS·exe 서명 없음, SmartScreen "Windows의 PC 보호"에서 "추가 정보 → 실행", 배포 범위 "개인 용도, 다른 사람에게 나눠 주지 않음", 버전 한 곳 규칙(버전을 끝낼 때마다 그 번호로, v0.7이면 0.7.0), 빌드 결과(K-03-R1로 갱신).
    - Licenses 점검: Zed 쿼리(GPL-3.0)·Zed 아이콘·문법 25개·확장 2개·테마·아이콘 테마·글꼴 2개는 이미 화면에 있었다. 빠져 있던 Vite 번들 JS 의존성·web-tree-sitter 런타임 원문을 `src/licenses/frontend-dependencies.txt`에 더했다.
  - 결과: 위와 같다.
  - 검증: typecheck, app-menus 테스트 5/5, cargo check·clippy 통과.
  - 특이사항: coder의 release 빌드는 사용자가 2026-11-09 22:54에 띄운 release 앱(PID 11268)이 exe를 잠가 os error 5로 실패했다. leader가 그 프로세스를 끝내지 않고 잠긴 exe 이름을 `workbench-tauri.exe.running-pid11268`로 바꾼 뒤 다시 빌드했다(파일은 그대로 남아 있다).
- **K-04 About 버전 표시** (2026-11-10, coder; core-leader 2026-11-10 승인)
  - 무엇을 했나: Help 메뉴 맨 아래에 "About workbench-tauri"(zed::About)를 더했다. 누르면 `<dialog>` showModal로 "{앱 이름} {버전}" 한 줄만 보인다. 버전은 `@tauri-apps/api/app` getVersion()이다. 크기·여백은 spec `about.*`(440×300, padding 16, gap 16), 배경 editor_background·글자 text다. capability `core:app:allow-version` 하나를 더했다. 아이콘·Commit·OK/Copy·링크는 없다(D-8).
  - 결과: K-04-R1에서 제목 h1에 Extensions 제목과 같은 `font: inherit`를 줬다(spec에 Headline 수치가 없어 UA 기본 2em을 쓰지 않음).
  - 검증: typecheck, app-menus 테스트 5/5.
  - 특이사항: Zed P-018의 Headline 글자 크기는 spec에 없다 — 미정(core).
- **release 빌드** (2026-11-10, leader)
  - 무엇을 했나: `npm.cmd run tauri build`를 실행했다. 빌드 전 D: 여유는 약 64 GB였다.
  - 결과: 성공. `workbench-tauri_0.6.0_x64-setup.exe` 5,999,959 바이트, `workbench-tauri.exe` 16,720,384 바이트, 둘 다 ProductVersion·FileVersion 0.6.0.
  - 검증: 파일 크기·버전 속성 확인. 설치는 하지 않았다.
  - 특이사항: 없음.
- C-07 checker [PASS]: 전체 typecheck, npm test 210 통과, clippy 경고 0, cargo test 21 통과, 코드·BUILD.md 검토, V3 판정. 지적 셋(BUILD.md 빌드 실패 문장·0.1.0 표·About 대기 문구)은 K-03-R1로 고쳤다 (2026-11-10)
  - 특이사항: checker가 `Test-Path` 허가 창에서 멈춰 leader가 취소하고 파일 읽기로 진행시켰다(ORDER-02의 git diff와 같은 문제). 허용 목록은 미정(사용자 설정).
- **V3 화면 검증(ORDER-03)** (2026-11-10, leader 측정·checker C-07 판정 [PASS])
  - 무엇을 했나: release exe, 주 모니터 100%, One Light, 임시 APPDATA에서 쟀다. 입력은 SendInput, 값은 CDP.
  - 결과: Help 항목에 "About workbench-tauri"; About 글자 "workbench-tauri 0.6.0"뿐, 440×300, 창(1440×852) 가운데(x 500, y 276), padding·gap 16px, 버튼·링크·이미지 0; Esc로 닫힘. Licenses 항목 41개, "License copy unavailable." 0개 — Zed 쿼리 GPL(`zed-grammars/licenses/zed/LICENSE-GPL`), Zed 아이콘(LICENSES·LICENSE-GPL·LICENSE-APACHE), 문법, 글꼴 2개 포함.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-03/`(01-about.png, 02-about-closed-by-esc.png, 03-licenses-top.png, licenses-text.txt, v3.json).
  - 특이사항: Esc 뒤 포커스는 body다(대화 상자를 연 메뉴 항목이 메뉴와 함께 사라짐, Licenses와 같은 동작). leader 스크립트의 결과 파일 경로 오류로 앱을 세 번 띄웠다(앞 두 번은 결과 저장 실패, 마지막 세션 결과만 썼다).

### Phase 4 — 스크롤바

- **K-05 스크롤바를 gpui와 같게(ORDER-04, R-8)** (2026-11-10, coder)
  - 무엇을 했나:
    - gpui 값(읽기만): `D:\projects\workbench-gpui\vendor\gpui-base\src\scrollbar.rs:22-31` 패널 트랙 16·thumb 6·hover/drag 8·여백 4·최소 길이 48, 편집기 트랙 15(`src/ui/pane.rs:214-218`, `src/ui/metrics.rs:246-247`), 색 테마 키 `scrollbar.thumb.background`(기본)·`scrollbar.thumb.hover_background`(hover·drag)·`scrollbar.track.background`(트랙, One 테마는 투명)(`src/ui/theme.rs:101-102`). 화살표 없음.
    - tauri: `src/app.css` 한 곳에 `::-webkit-scrollbar*`로 모든 스크롤바(편집 영역, Sidebar, 트리, Search 등 탭 화면, picker, Settings·Keymap·Extensions·Licenses·미리보기)를 정의했다. 트랙 15(spec `scrollbar.width.editor`; gpui 패널 16과 1px 차이), thumb 6, hover/drag 8, 여백 4. gpui 전용 값(hover 폭 8, 최소 길이 48, 모서리 6)은 `src/spec/metrics.ts`에 출처 주석과 함께 뒀다. 편집기·picker의 따로 둔 규칙을 지웠고, 쓰지 않는 `scrollbar.thumb.active_background` 토큰 발행을 지웠다. picker의 hover 때만 보이는 조건, 편집 영역 표시 조건(v0.5 I-9), 트리 스크롤 동작(I-13)은 그대로다.
  - 결과: 위와 같다.
  - 검증: typecheck, 관련 node 테스트 28/28.
  - 특이사항: 없음.
- C-08 checker [PASS]: 전체 typecheck, npm test 210, clippy 경고 0, cargo test 21, 코드 검토와 V3 판정, 지적 없음 (2026-11-10)
- **V3 gpui·tauri 비교(ORDER-04)** (2026-11-10, leader 측정·C-08 판정 [PASS])
  - 무엇을 했나: 주 모니터 100%, 두 앱 모두 창 1440×852, 같은 임시 폴더(폴더 30개 + 파일 120개·긴 파일). One Dark·One Light. gpui는 release exe, tauri는 debug exe. 화면 캡처의 픽셀 줄을 읽어 쟀다.
  - 결과: 두 테마 모두 편집 영역·트리 thumb 6px, hover 8px, 오른쪽 여백 4px로 gpui와 같다. 색은 One Light 트리 `#b6b6b9`·hover `#dfdfe0`가 같고, 반투명 기본 thumb는 채널당 1 이내 차이다(합성 반올림). tauri의 편집 영역·트리·Sidebar·Search 탭 스크롤바는 서로 같고 화살표가 없다.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-04/`(gpui-*·tauri-* PNG, `pixels.json`, `tauri-dark.json`, `tauri-light.json`).
  - 특이사항: gpui Sidebar는 스크롤바를 그리지 않는다(렌더러를 붙이지 않음). tauri Sidebar는 공통 모양으로 그린다. gpui는 데이터 폴더를 `%APPDATA%` 환경 변수가 아니라 Windows API로 찾으므로, leader가 사용자 gpui `state.json`·`settings.json`을 백업하고 임시 상태로 바꿔 띄운 뒤 원래 파일로 되돌렸다(SHA-256 일치 확인). 캡처는 창 영역만 잘랐고, 오른쪽 아래를 가린 데스크톱 알림 자리는 회색으로 칠했다. picker·drag·가로 스크롤바는 화면으로 재지 않고 코드로 확인했다.

### Phase 5 — 탭 바와 편집 영역 상단

- **K-06 뒤로·앞으로는 탭 사이만(R-12), 경로 줄 상대 경로만(R-16)** (2026-11-10, coder)
  - 무엇을 했나:
    - 뒤로·앞으로: 기록에 탭 객체(`TabFile`)만 저장하고 줄·열은 저장하지 않는다. 문서 안 위치 기록 코드(`NavEntry`·`NavMode`·`isFarJump`·`MIN_NAVIGATION_HISTORY_ROW_DELTA`·`placeOf`·`ViewHooks.jumped`·`navigated`·`FileLocation.noHistory`)와 닫힌 탭 재열기·커서 복원을 지웠다. 닫힌 탭은 건너뛰고, 이동할 곳이 없으면 버튼이 비활성화된다. 탭 바 버튼과 Alt+Left/Right는 같은 경로를 쓴다.
    - 경로 줄: 열린 폴더 기준 상대 경로만 보인다(루트 이름 접두사·드라이브 문자 없음, 폴더 밖 파일은 파일명만). 제목·심볼 계층 코드(`headings.ts`·`headings.test.ts`·`outline.test.ts`, `symbolsAtCursor`·`SyntaxDocument.symbols`, outline 쿼리 로딩 등)를 지웠다. 경로 줄 자리·모양 CSS는 그대로다.
    - 남긴 것: 마크다운 편집↔미리보기 위치 연계, 구문 강조(파싱·증분 갱신), 상태 표시 커서·Go to Line.
  - 결과: 위와 같다.
  - 검증: typecheck, 관련 node 테스트 31/31.
  - 특이사항: 없음.
- **K-07 탭 오른쪽 클릭 메뉴(R-9)** (2026-11-10, coder; core-leader 2026-11-10 승인 — 문서 기준)
  - 무엇을 했나:
    - 메뉴: 미리보기 탭은 core `refs/I-9-zed.png`의 묶음(닫기 묶음·Make Tab Read-Only·Pin·Show Source), 파일 탭은 같은 묶음 + `docs/refs/01-zed/02-INTERACTION.md` 11.3 I-663 경로 묶음(Copy Path·Copy Relative Path·Reveal in File Explorer·Reveal In Project Panel) + 마크다운 편집 탭만 Open Markdown Preview, 그 밖의 탭은 닫기 묶음 + Pin.
    - Make Tab Read-Only/Editable을 탭 단위로 새로 만들었다(디스크 가독성 상태와 따로, 다른 탭에 전파하지 않음).
    - 단축키(Ctrl-K E/T/U/W/P/R, Ctrl-Alt-Shift-T, Ctrl-Shift-E 등)를 Pane에 등록했다. 기존 Ctrl-K Shift-Enter(Pin)는 그대로 썼다.
    - 새 파일 `src/shell/tab-menu.ts`와 테스트.
  - 결과: 위와 같다.
  - 검증: typecheck, 관련 node 테스트 28/28 + 2/2.
  - 특이사항: 없음.
- **K-07-R1 단축키 실측 실패 조사** (2026-11-10, coder)
  - 무엇을 했나: leader V3에서 chord 단축키가 동작하지 않는 것처럼 보인 원인을 찾았다. 앱 코드는 고치지 않고 실제 modifier 순서 회귀 테스트 하나(`src/keymap/keyboard.test.ts`)만 더했다.
  - 결과: 원인은 leader 실측 스크립트가 `tools/win-input.ps1 -Keys`에 키를 여러 인자로 넘겨 두 번째 키가 `-Mods`로 들어간 것이었다(앱 결함 아님). ORDER-02 V3의 "SendInput `ctrl+k ctrl+t`로 테마 선택 창이 열리지 않음"도 같은 스크립트 원인이다.
  - 검증: typecheck, 관련 node 테스트 19/19.
  - 특이사항: 없음.
- C-09 checker [PASS]: 전체 typecheck, npm test 210, clippy 경고 0, cargo test 21, 코드 검토와 V3 판정, 지적 없음 (2026-11-10)
- **V3(ORDER-05)** (2026-11-10, leader 측정·C-09 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA, One Light, 임시 폴더(notes.md·app.py·main.ts·sub/lib.rs, 두 번째 폴더 other.md).
  - 결과: 메뉴 네 종류가 승인 목록과 같다. 메뉴 동작 — Close Others, Show Source, Make Tab Read-Only(입력 막힘·라벨 전환), Copy Relative Path(붙여넣기 "app.py"), Reveal In Project Panel. 단축키 재측정 모두 동작(Ctrl-K T/E/U/W, Ctrl-Alt-Shift-T, Ctrl-K Shift-Enter, Ctrl-Shift-E, Ctrl-K Ctrl-T). 뒤로 B→A, 앞으로 B, Ctrl+End 뒤에도 탭 이동, 닫힌 탭 건너뜀. 경로 줄 `notes.md`·`app.py`·`main.ts`·`sub\lib.rs`·`other.md`(폴더 하나·둘), `›` 뒤 없음, 드라이브 문자 없음.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-05/`(single.json, multi.json, probe.json, chords.json, PNG).
  - 특이사항: Zed 비교는 하지 않았다 — 이 PC Zed가 사용자 것으로 떠 있고 `--user-data-dir`를 줘도 떠 있는 인스턴스로 넘어가 따로 띄울 수 없었다. 시도 중 사용자 Zed에 'o5' 폴더 창과 빈 창이 한 번씩 열려 leader가 그 두 창만 닫았다('o5'는 사용자 Zed 최근 작업 영역 기록에 남았을 수 있음, 고치지 않음). Zed 비교 캡처와 이 PC Zed 탐색 기록 확인은 사용자 확인 대기. 클립보드 읽기 권한 창이 한 번 떠 leader가 허용·차단을 누르지 않았다(거부로 끝남). 스크립트 오류로 앱을 여러 번 띄웠다.

### Phase 6 — Sidebar

- **K-08 Sidebar(R-10·R-11·R-19)** (2026-11-10, coder)
  - 무엇을 했나:
    - 항목 메뉴: Rename 하나만 남겼다. 보이는 이름만 state.json 폴더 항목의 `name`에 저장하고 path는 그대로다. 빈 이름이면 디스크 폴더 이름으로 돌아간다. Move Up/Move Down/Remove 메뉴를 지웠다.
    - hover한 항목 오른쪽 끝 x: 기존 `removeFolder`를 그대로 불러 디스크를 건드리지 않고 수정된 탭 확인 흐름을 유지한다.
    - 끌어 순서 바꾸기: 순서를 state.json 폴더 배열에 저장한다.
    - Sidebar|Left Dock 경계선: Left Dock과 `resizeHandle`을 공유한다(최소 6·최대 부모−6, 두 번 누르기 240, `sidebar.width` 저장). 옛 200~800 제한을 지웠다.
    - 맨 위 "Search" 입력란: spec에 전용 ID가 없어 Extensions 검색 X-46 값을 재사용했다. 표시 이름 기준 대소문자 무시 부분 일치(`toLowerCase().includes` — I-5 맞추기는 Rust에 있어 재사용할 수 없음). Ctrl+F는 Sidebar 컨텍스트에서만 이 입력란으로 간다.
  - 결과: 위와 같다.
  - 검증: typecheck, 관련 node 테스트 16/16.
  - 특이사항: 없음.
- **K-08-R1 경계선 두 번 누른 뒤 끌기** (2026-11-10, coder)
  - 무엇을 했나: leader V3에서 두 번 누르기 뒤 같은 경계선을 끌면 3px만 움직였다(기존 Left Dock도 같음). `resizeHandle` pointerdown에서 기본 동작(글자 선택·끌기)을 막았다.
  - 결과: 다시 재니 Sidebar·Left Dock 두 경계선 모두 정상이다.
  - 검증: typecheck, 관련 node 테스트 8/8.
  - 특이사항: 없음.
- C-10 checker [PASS]: 전체 typecheck, npm test 212, clippy 경고 0, cargo test 21, 코드 검토와 V3 판정(Zed 비교는 core refs `I-10-zed.png`·`I-19-zed.png` 캡처로), 지적 없음 (2026-11-10)
- **V3(ORDER-06)** (2026-11-10, leader 측정·C-10 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA, 임시 WebView 데이터 폴더(`WEBVIEW2_USER_DATA_FOLDER`, core-leader 규칙), One Light, 임시 폴더 apple·banana·cherry·date.
  - 결과: 메뉴는 Rename 하나. apple→Zebra, 디스크 apple 그대로. hover한 cherry에만 x, 누르면 목록에서 빠지고 디스크 그대로. date를 맨 위로 끌기. 경계선 300→379에 Left Dock·편집 영역이 함께 밀림, 두 번 누르기 240. 다시 열어도 이름·순서·너비 유지. Sidebar에서 Ctrl+F → Search, 트리·편집 영역·탭에서는 가지 않음. "ebr"→Zebra, "ana"→banana, 지우면 모두.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-06/`(first.json, reopen.json, reopen-2.json, PNG).
  - 특이사항: 편집 영역 Ctrl+F의 문서 안 찾기는 Phase 9에서 확인한다.

### Phase 7 — Left Dock 트리

- **K-09 트리 고정 줄(R-13)** (2026-11-10, coder)
  - 무엇을 했나:
    - 기준: 사용자 Zed를 쓰지 않고 core `refs/I-13-zed.png`, `docs/refs/01-zed/01-LAYOUT.md` L-47·L-51, Zed 소스(커밋 14b7b0ef `project_panel.rs`·`sticky_items.rs`, leader가 받아 둔 것, 읽기만)를 기준으로 구현했다.
    - 맨 위에 보이는 항목의 상위 폴더 사슬 전체를 고정한다. 마지막 자식이 지나가면 마지막 고정 줄이 밀려 올라간다.
    - 고정 줄 클릭: 펼치기 없이 그 폴더가 고정 순번 자리에 오도록 스크롤한다(−1px).
    - 색: `panel.overlay_background`/`overlay_hover`(T-26.1·T-26.2 합성).
    - 고정 줄에서 메뉴·끌기를 막고, 키보드 선택이 고정 줄 밑에 가리지 않게 했다.
    - 순수 함수 `stickyRows`(`src/workspace/tree.ts`)와 테스트.
  - 결과: 위와 같다.
  - 검증: typecheck, 관련 node 테스트 35.
  - 특이사항: L-51의 "제외"는 core I-13이 덮는다. 이 앱은 등록 폴더마다 트리 하나라 다른 등록 폴더의 사슬은 함께 보이지 않는다.
- C-11 checker [PASS]: 전체 typecheck, npm test 215, clippy 경고 0, cargo test 21, 코드 검토(Zed 소스 동작 일치, 복사 없음)와 V3 판정, 지적 없음 (2026-11-10)
- **V3(ORDER-07)** (2026-11-10, leader 측정·C-11 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light, 폴더 proj(alpha/beta/gamma 깊이 3)·second(inner).
  - 결과: gamma 안까지 스크롤하면 proj·alpha·beta·gamma 고정(높이 26, top 0/26/52/78). gamma 끝에서 gamma 줄이 78→58로 밀린 뒤 사라짐. hover한 고정 줄만 overlay_hover. alpha 고정 줄 클릭 → 펼치기 그대로, 스크롤 0, 포커스 패널. second 폴더는 second·inner 고정. 스크롤바(Phase 4)는 바꾸지 않았다.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-07/`(v3.json, PNG).
  - 특이사항: Zed 비교 캡처는 사용자 확인 대기.
- W-11 docs/refs `01-LAYOUT.md` L-51·L-127 sticky scroll 문구를 '포함'으로 고침(core D-9, core-leader 2026-11-10 지시, ORDER-08 커밋에 넣음) (2026-11-10)

### Phase 8 — 타이틀 바 메뉴

- **K-10 메뉴 줄·타이틀 바·Licenses 탭(R-14·R-15·R-20)** (2026-11-10, coder)
  - 무엇을 했나:
    - R-14: 앱 이름 메뉴를 지우고 File 맨 아래에 구분선과 Quit(`zed::Quit`)을 더했다. 기존 Ctrl-Q 바인딩과 저장 확인 흐름(`appWindow.close()`)을 그대로 쓴다. 다른 메뉴의 순서·내용은 그대로다.
    - R-15: 타이틀 바 폴더 이름(`ProjectName`·`PROJECT_NAME_MAX_CHARS`·`appMenuExpanded`·관련 CSS)을 지웠다. drag region(`data-tauri-drag-region`, `title-left`의 `margin-right: auto`)은 그대로다.
    - R-20: Licenses를 `openTool`로 탭 하나로 연다(다시 누르면 그 탭 선택). `<dialog>`·`showModal`·전용 포커스 복원을 지웠다. 목록·본문 코드(glob, `FONT_LICENSES`, `licenseText`)는 그대로다.
  - 결과: 위와 같다.
  - 검증: typecheck, 관련 node 테스트 22.
  - 특이사항: W-11(docs/refs sticky scroll 문구)은 이 Phase 커밋에 함께 들어갔다(Phase 7 절의 W-11 줄 참고).
- C-12 checker [PASS]: 전체 typecheck, npm test 215, clippy 경고 0, cargo test 21, 코드 검토와 V3 판정, 지적 없음 (2026-11-10)
- **V3(ORDER-08)** (2026-11-10, leader 측정·C-12 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light.
  - 결과: 메뉴 줄 File·Edit·View·Go·Window·Help, File 맨 아래 Quit Ctrl-Q. 폴더 있음·없음 모두 타이틀 바 왼쪽에 ≡만(오른쪽 User menu·창 버튼 그대로). Licenses 탭(대화 상자 없음, 본문이 ORDER-03 캡처와 같음 276,249자, 스크롤, 다른 탭 오가기, 다시 누르면 같은 탭, 닫고 다시 열기). 편집 뒤 Ctrl-Q → "Warning" 저장 확인 창, Esc로 취소하면 앱 유지, 되돌린 뒤 File → Quit으로 종료.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-08/`(nofolder.json, folder.json, quit.json, licenses-text.txt, PNG). 저장 확인 창 캡처는 화면 전체 캡처라 창 영역만 잘랐다.
  - 특이사항: Licenses 목록은 v0.5와 다르다 — Phase 2에서 regex 라이선스 두 개를 지웠고 Phase 3에서 `frontend-dependencies.txt`를 더했다(v0.6 변경). leader 스크립트 오류로 Quit 단계를 한 번 더 띄워 쟀다(`quit.json`).

### Phase 9 — 문서 편집 기본 기능

- **K-11 의존성 없이 되는 부분(R-17)** (2026-11-10, coder)
  - 무엇을 했나:
    - Edit 메뉴를 workbench-kit 기대 2대로 바꿨다: 13항목, 구분선 넷, VS Code 표기(`+` 구분, Shift+Alt+A). Find·Replace·Add Next Occurrence는 비활성이다. 다른 메뉴의 Zed 표기는 그대로다.
    - 편집 영역 키 Ctrl+A·Ctrl+L·Ctrl+Alt+Up·Ctrl+Alt+Down·Ctrl+/·Shift+Alt+A를 Editor 컨텍스트로 더했다(CM6 명령 재사용). Alt+클릭·Esc는 기존 동작 그대로다.
    - 주석 토큰은 언어 config의 `line_comments` 첫 토큰과 `block_comment`에서 읽는다. 토큰이 없는 일반 텍스트에서는 주석 명령이 동작하지 않는다.
    - 메뉴 Cut/Copy/Paste를 편집기에 연결했다. 키보드 Cut/Copy/Paste는 CM6 기본 처리 그대로다.
    - codicon `search` SVG만 복사했다(`src/assets/codicons/`, @vscode/codicons 0.0.46-24, CC BY 4.0 본문 `src/licenses/`, Licenses에 포함). 경로 줄 찾기 아이콘: 마크다운은 눈 오른쪽, 그 밖은 오른쪽 끝, 비활성, 툴팁 "Find in Explorer".
  - 결과: 위와 같다. 겹치는 단축키 표는 coder 보고에 있다. 기존 앱 바인딩을 없앤 키는 없다.
  - 검증: typecheck, 관련 node 테스트(19·11·4).
  - 특이사항: 삽입 언어(HTML 안 JS, TSX의 JSX 등)의 범위별 주석 전환은 하지 않았다(`shortcut:` 주석).
- **K-11-R1·R2 한국어 IME에서 Ctrl+/** (2026-11-10, coder)
  - 무엇을 했나: V3에서 한국어 IME(0x0412)일 때 Ctrl+/가 key 'Process'로 와서 주석 대신 '/'가 들어갔다. stroke 변환에서 Process+Ctrl/Alt는 물리 키(code)로 정했다(R1, `src/keymap/engine.ts`). 그 직후 IME가 넣는 같은 글자 한 개 조합 입력을 300ms 안에서 한 번만 막았다(R2, `src/editor/ime.ts`). 수정자 없는 한글 조합은 그대로다.
  - 결과: 다시 재니 주석만 토글, Ctrl+Z 한 번에 복원, 한글 입력 정상.
  - 검증: typecheck, 관련 node 테스트(R1 16, R2 19), V3 재측정.
  - 특이사항: 300ms를 넘기거나 다른 글자로 오는 IME 입력은 막지 않는다.
- **검색 모듈 BLOCKED(사용자 승인 대기)** — ORDER-09-R1에서 풀림
  - `@codemirror/search@6.7.2`(MIT, unpacked 137,655바이트, 하위 의존성은 이미 있는 crelt·view·state뿐)가 필요하다. core-leader: 더하지도 직접 구현(TS 약 400~600줄)도 하지 않는다.
  - 승인되면 할 것: 패키지 추가, 찾기·바꾸기 창(오른쪽 위), F3/Shift+F3·Enter/Shift+Enter, Alt+C/W/R, 하나/모두 바꾸기(Ctrl+Alt+Enter, 모두 바꾸기 한 번 취소), Alt+Enter, Ctrl+D·Ctrl+Shift+L·Ctrl+K Ctrl+D, Edit 메뉴 세 항목·찾기 아이콘 활성, I-19 편집 영역 Ctrl+F 확인, workbench-kit 비교 캡처.
- **메뉴 Paste 미정**
  - WebView2는 메뉴에서 클립보드를 읽지 못해 `navigator.clipboard.readText`로 대신하는데, 이것이 WebView 권한 창을 띄운다(키보드 Ctrl+V는 정상).
  - core-leader: 지금 상태를 유지한다. 선택지 셋(클립보드 플러그인 추가 / 권한 창 받아들이기 / 메뉴 Paste 비활성)은 사용자가 정한다.
- C-13 checker [PASS]: 전체 typecheck, npm test 220, clippy 경고 0, cargo test 21, 코드 검토와 V3 판정(BLOCKED 항목 제외), 지적 없음 (2026-11-10)
- **V3(ORDER-09)** (2026-11-10, leader 측정·C-13 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light, 임시 폴더(notes.md·app.py·main.ts).
  - 결과: Edit 메뉴가 기대 2와 같다. 찾기 아이콘 자리는 코드 파일 1410–1432(경로 줄 끝), 마크다운은 눈(1387–1409) 오른쪽. Ctrl+L 줄+줄바꿈, Esc 커서 하나, Ctrl+Alt+Down 커서 셋, Ctrl+A 전체, Alt+클릭 커서 둘, Shift+Alt+A 블록 주석(Ctrl+Z 복원), Ctrl+/ `# `(IME 고친 뒤), 키보드 복사·붙여넣기, 메뉴 Undo/Redo. 편집 영역 Ctrl+F는 아무것도 열리지 않고 Sidebar로도 가지 않는다. Licenses에 codicons가 있다.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-09/`.
  - 특이사항: workbench-kit은 띄우지 않고 소스·VS Code 기본 동작으로 비교했다. 메뉴 Copy 시험이 시스템 클립보드를 덮어썼다.

#### ORDER-09-R1 — 찾기·바꾸기

- **K-13 찾기·바꾸기(R-17, 사용자가 @codemirror/search 추가 승인 2026-11-10)** (2026-11-10, coder)
  - 무엇을 했나:
    - `@codemirror/search` 6.7.2(MIT)를 더했다. `package.json` 1줄, lock은 그 패키지 블록만, 새 하위 의존성 없음. 라이선스는 `src/licenses/frontend-dependencies.txt`에 더했다.
    - 편집 영역 오른쪽 위 찾기·바꾸기 창(`src/editor/search.ts` 새 파일, 커스텀 패널): Toggle Replace·찾기 입력·Aa/ab/.*·일치 수·이전·다음·닫기, 바꾸기 줄 입력·Replace·All.
    - 단축키: Ctrl+F/H, F3/Shift+F3, 창 안 Enter/Shift+Enter·Alt+C/W/R·Alt+Enter, 바꾸기 줄 Enter/Ctrl+Alt+Enter, Ctrl+D, Ctrl+Shift+L, Ctrl+K Ctrl+D, Esc.
    - Edit 메뉴 Find·Replace·Add Next Occurrence를 활성으로 했다. 경로 줄 찾기 아이콘이 그 탭의 찾기 창을 열고 닫는다. Sidebar Ctrl+F는 그대로다.
    - 수치는 spec E-062/E-063/E-065/E-066/E-067과 기존 toolbar·button 변수를 쓴다. 툴팁 문구·메뉴 Paste는 그대로다.
  - 결과: 위와 같다.
  - 검증: C-15에서 함께 확인.
  - 특이사항: 없음
- **K-13-R1 찾기 입력란 글자 덮어쓰기** (2026-11-10, coder)
  - 무엇을 했나: leader V3에서 찾기 입력란에 "foo"를 치면 "o"가 됐다. @codemirror/search의 findNext가 입력란 전체를 선택해서다. 입력 중 자동 탐색 앞뒤로 입력란 선택 범위를 보관·복원했다.
  - 결과: 입력한 글자가 그대로 남는다.
  - 검증: 이 실패를 잡는 테스트를 더했다.
  - 특이사항: 없음
- C-15 checker [PASS]: 커밋 직전 1회 typecheck 오류 0, npm test 227 통과, clippy -D warnings 경고 0, cargo test 21 통과, 코드 검토 지적 없음, V3 판정 15항목 PASS (2026-11-10)
- **V3(ORDER-09-R1)** (2026-11-10, leader 측정·C-15 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·임시 WebView 데이터 폴더, One Light. 시스템 클립보드는 건드리지 않았다.
  - 결과: 15항목 PASS.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-09-R1/`(v3.json, v3-2.json, find-panel.png, find-panel-md.png, replace-panel.png, icon-open.png, ctrl-d.png). v3.json의 ctrlD·menu.addNext 줄은 leader 스크립트 커서 위치 잘못으로 무효이고 v3-2.json이 대신한다.
  - 특이사항: workbench-kit은 띄워 비교하지 않았다(사용자 데이터에 쓸 위험, 소스·VS Code 기본 동작으로 비교). 한글 IME 입력·작은 Pane에서 창 압축은 V3로 재지 않았다.
- 커밋: 코드 `bf05328`.

### Phase 10 — 상태 바 미리보기 버튼

- **K-12 Lock Preview(R-18)** (2026-11-10, coder)
  - 무엇을 했나:
    - codicon `markdown` SVG를 복사했다(ORDER-09 방식, `src/assets/codicons/NOTICE.txt`에 출처 한 줄). 상태 바 돋보기 오른쪽에 버튼을 두었다(툴팁 Lock Preview, Left Dock과 같은 toggled 표시).
    - 켜짐은 `state.json`의 `lock_preview`에 저장한다(없거나 true가 아니면 꺼짐).
    - 켜면 공통 openFile에서 .md/.markdown(대소문자 무시)을 미리보기 탭으로 연다. 이미 열린 탭은 그대로 두고, 같은 파일 편집 탭이 있으면(다른 Pane 포함) 그 탭을 선택한다.
    - 미리보기 탭의 `Ctrl-Shift-V`와 탭 메뉴 Show Source는 같은 파일 편집 탭을 더 열고(있으면 선택) 미리보기는 남긴다. ORDER-05의 Zed 동작(미리보기를 닫고 편집 탭으로)을 R-18이 나중 요구라 leader가 바꿨다.
    - 편집↔미리보기 연계는 같은 Doc 공유 경로(twinOf)를 재사용했다. 경로 줄 눈 아이콘과 Ctrl-K V는 그대로다.
  - 결과: 위와 같다.
  - 검증: typecheck, 관련 node 테스트 40.
  - 특이사항: 없음
- C-14 checker [PASS]: 전체 typecheck, npm test 222, clippy 경고 0, cargo test 21, 코드 검토와 V3 판정, 지적 없음 (2026-11-10)
- **V3(ORDER-10)** (2026-11-10, leader 측정·C-14 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light, 임시 폴더(notes.md·other.md·main.ts).
  - 결과: 상태 바 Left Dock·Search·Lock Preview, 툴팁 Lock Preview. 꺼짐에서 md → 편집 탭, 켜도 그 탭은 편집 탭. 켜짐에서 notes.md → 미리보기만, main.ts → 편집 탭. 미리보기에서 Ctrl-Shift-V → notes.md 편집 탭이 더 열리고 미리보기 유지. 나란히 두고 편집 Section 3 → 미리보기 Section 3, 미리보기 Section 2 → 편집 "## Section 2". 켠 채·끈 채 다시 열기에서 상태 유지. Licenses에 markdown.svg.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-10/`(first.json, reopen-on.json, reopen-off.json, PNG).
  - 특이사항: 시스템 클립보드는 건드리지 않았다.

## 사용자 요청 작업

### ORDER-01-R1 결과 검토와 제안 (2026-11-10)

- 요청: 사용자가 ORDER-01-R1 결과를 "검토하고 제안해 주세요", "core-leader에게 제안을 보내 주세요"라고 요청했다(2026-11-10).
- 조치: tauri-leader가 ORDER-01-R1 결과를 검토하고 제안 `specs/v0.6/reports/ORDER-01-R1-proposal.md`를 써서 core-leader에게 보냈다.
- 결과: core-leader 판단을 사용자가 적용하기로 해 ORDER-01-R2로 왔다.
- 검증: 커밋 `fa7f648`.
- 상태: 끝남.

### ORDER-11 사용자 확인 반영 (2026-11-10)

- 요청: 사용자가 core `USER-TEST.md`로 확인하고 남긴 U-1~U-5(core `D:\projects\workbench-core\specs\v0.6\orders\ORDER-11.md`).
- **K-14 U-1~U-5 반영** (2026-11-10, coder)
  - 무엇을 했나:
    - U-1 Search 탭: 결과 경로를 검색 범위 폴더 기준 상대 경로로 왼쪽 정렬했다. 범위는 Sidebar 선택 폴더 하나다(선택 없음·잘못된 선택 → 첫 폴더, 폴더 없음 → 빈 범위). Rust의 범위 밖 거부는 그대로다. 네 모서리는 `--editor-search-input-corner-radius`(6px)를 재사용했다.
    - U-2 뒤로·앞으로: 탭 바 위치 기준으로 왼쪽·오른쪽 탭으로 가고, 끝에서는 반대쪽 끝으로 돈다. 기존 `stepTab`을 재사용했다. NavHistory 스택·최대 길이 등 기록 코드를 지웠고 `nav-history.ts`에는 NAV_BINDINGS만 남겼다. 키맵·Go 메뉴 action 이름은 그대로다. I-12의 "연 순서" 판정 대신 이 동작으로 판정한다(카드).
    - U-3 Sidebar 검색란: Sidebar 헤더(타이틀 바 줄, 높이 L-12)로 옮기고 본문 검색 줄을 지웠다. 테두리 없음. 빈 값이면 `Ctrl+F`(기존 단축키 표시 재사용), 값이 있으면 x를 보이고 누르면 비우고 목록 복원·입력란 포커스. 헤더 `data-tauri-drag-region`은 유지했다(입력란 밖 끌기·두 번 눌러 최대화는 코드 확인).
    - U-4: 선택 폴더의 `--ghost-element-selected` 배경을 포커스와 무관하게 유지하고, 검색어 일치 글자를 `--text-accent`로 했다. 목록은 폴더 한 단계 그대로다.
    - U-5: ≡ 메뉴 줄 이름·항목 글꼴을 `--typography-ui-font-size`로 하고, 쓰지 않게 된 metrics `menu.item.font_size`·`menu.horizontal.item_font_size`를 지웠다.
  - 결과: 위와 같다.
  - 검증: typecheck, 관련 테스트 38 통과(범위 걸러내기, 위치 이동·끝 돌기, 일치 글자 나누기).
  - 특이사항: 없음
- C-16 checker [PASS]: typecheck 오류 0, npm test 225 통과, clippy 경고 0, cargo test 21 통과, 코드 검토 지적 없음, V3 U-1~U-5 PASS (2026-11-10). cargo test 첫 실행에서 `folder_watch::tests::missing_root_is_watched_after_creation_and_recreation`이 5초 시간 초과로 1건 실패했고 바로 다시 실행해 통과했다(이번 변경과 무관한 시간 의존 테스트).
- **V3(ORDER-11)** (2026-11-10, leader 측정·C-16 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light, 폴더 workbench-a·other-b.
  - 결과: U-1~U-5 PASS.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-11/`(v3.json, v3-searchB.json, sidebar-idle.png, sidebar-typed.png, sidebar-selected-editor-focus.png, search-tab-a.png, search-tab-b.png, menu-file.png). v3.json의 searchB 줄은 leader 스크립트 오류로 무효이고 v3-searchB.json이 대신한다.
  - 특이사항: 없음
- 커밋: 코드 `707edcd`.
- 상태: 끝남.

### coder 모델 변경 (2026-11-10)

- 요청: 2026-11-10 09:35, 사용자 지시(core-leader 전달 [DECISION]).
- 무엇을 했나: `tauri-coder`를 Codex gpt-6.1-sol medium에서 Claude Code Sonnet 5.5 high로 바꿨다. 진행 중인 카드가 없는 때(ORDER-11 push 뒤)였다. Codex를 `/quit`로 끝내고 셸 프롬프트(`PS D:\projects\workbench-tauri>`)를 확인한 뒤, 같은 pane `wV:p3`에서 `herdr agent start tauri-coder --kind claude --pane wV:p3 -- --model sonnet --effort high`로 띄웠다(이름 `tauri-coder` 유지, pane을 닫고 새로 띄우지 않음, v0.5 HERDR-SETUP 1장과 같은 방법). `specs/v0.6/HERDR-SETUP.md` 1·2장을 맞췄다.
- 결과: `tauri-coder`는 Claude Code Sonnet 5.5 high다. 지금은 Codex를 쓰지 않는다.
- 검증: `/model`로 Sonnet 5.5 ✔·High effort 확인(바꾸지 않고 Esc).
- 상태: 끝남.

### ORDER-12 메뉴·단축키 글꼴 크기 (2026-11-10)

- 요청: 사용자가 ORDER-11 빌드를 보고 남긴 U-6(core `D:\projects\workbench-core\specs\v0.6\orders\ORDER-12.md`).
- **K-15 U-6 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high로 바꾼 뒤 첫 카드)
  - 무엇을 했나: 모든 오른쪽 클릭 메뉴·≡ 펼친 메뉴의 항목·서브 메뉴 항목·단축키와 Sidebar 검색란 `Ctrl+F` 표시를 툴팁 글꼴 크기 `--tooltip-font-size`(14px)로 했다. 새 값은 없다. 오른쪽 클릭 메뉴와 펼친 메뉴가 같은 `.menu`라 `src/app.css` 한 곳(+ Sidebar 표시 한 줄)을 고쳤다. 메뉴 줄 File~Help는 ORDER-11 U-5대로 `--typography-ui-font-size`(16px)다. Settings 드롭다운도 같은 `.menu`라 함께 14px가 됐다.
  - 결과: 위와 같다. 쓰지 않게 된 크기 값은 없다.
  - 검증: typecheck 통과.
  - 특이사항: 없음
- C-17 checker [PASS]: typecheck 오류 0, npm test 225 통과, clippy 경고 0, cargo test 21 통과, 코드 검토 지적 없음, V3 8항목 PASS (2026-11-10).
- **V3(ORDER-12)** (2026-11-10, C-17 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light. File 메뉴엔 서브 메뉴가 없어 View → Editor Layout과 사용자 메뉴 Panel Layout으로 서브 메뉴를 확인했다.
  - 결과: 8항목 PASS.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-12/`(v3.json, tab-context-menu.png, tree-context-menu.png, user-menu-sub.png, file-menu.png, view-editor-layout-sub.png, sidebar-idle.png).
  - 특이사항: 없음
- 커밋: 코드 `281de60`.
- 상태: 끝남.

### 메뉴 줄 글꼴 14px (2026-11-10)

- 요청: 사용자 직접 요청 "메뉴 File | Edit | ... | Help -> 글꼴크기 14px 로 감소"(ORDER-11 U-5의 기본 UI 크기를 덮음).
- **K-16 메뉴 줄 글꼴 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나: `src/app.css` `.menu-name` 글꼴을 `--typography-ui-font-size`에서 `--tooltip-font-size`(14px, ORDER-12에서 메뉴 항목에 쓴 같은 변수)로 바꿨다. 새 값은 없다.
  - 결과: 메뉴 줄 File~Help가 14px다.
  - 검증: typecheck 통과.
  - 특이사항: 없음
- C-18 checker [PASS]: typecheck 오류 0, npm test 225 통과, clippy 경고 0, cargo test 21 통과, 코드 검토 지적 없음, V3 PASS (2026-11-10).
- **V3(K-16)** (2026-11-10, C-18 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더. 사용자 테스트 앱(PID 46148)은 건드리지 않았다.
  - 결과: File~Help 14px, 펼친 메뉴 항목·단축키 14px. PASS.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/K-16/`(v3.json, menu-bar-file.png).
  - 특이사항: 없음
- 커밋: 코드 `46b6962`.
- 상태: 끝남.

### ORDER-13 찾기·바꾸기 줄과 Search 탭 옵션 (2026-11-10)

- 요청: 사용자가 확인하고 남긴 U-7 찾기·바꾸기 줄, U-8 Search 탭 옵션(core `D:\projects\workbench-core\specs\v0.6\orders\ORDER-13.md`).
- **K-17 U-7·U-8 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나:
    - U-7 찾기·바꾸기: ORDER-09-R1의 편집 영역 오른쪽 위 겹침 창을 없애고, 경로 줄 바로 아래 편집 영역 너비의 줄(CM 상단 패널)로 바꿨다. 겹침 CSS는 지웠고 문서가 아래로 밀린다. 구성은 찾기 입력란(안 오른쪽 Aa·wd·.*) → 바꾸기 줄 켜기 → 일치 모두 선택 → 선택 안에서 찾기 → 구분선 → < > → n/m(문구 "1 of 2" → "1/2") → ×다. 바꾸기 줄은 아래 줄(입력란·하나 바꾸기·모두 바꾸기)이다. 선택 안에서 찾기는 새로 만들었다. 켤 때의 선택 범위를 저장하고, 개수·이동·모두 선택·바꾸기가 그 범위 안만 다룬다(@codemirror/search 범위 안). 돋보기는 찾기 줄이 열린 동안 aria-pressed·강조색이다(Lock Preview 방식). 아이콘은 Zed 아이콘(case_sensitive·whole_word·regex·replace·select_all·chevron_left/right·close·replace_next·replace_all)이고, codicon `list-selection` 하나를 복사했다(@vscode/codicons 0.0.46-24, NOTICE 한 줄). 수치는 spec E-061~E-067·`search_input.max_width`를 metrics 상수·CSS 변수로 뒀다. 단축키·일치 강조·K-13-R1 수정·툴팁·메뉴 Paste는 그대로다.
    - U-8 Search 탭: 입력란 안에 Aa·wd·.*(같은 부품), 오른쪽에 결과 수를 두고 Alt+C/W/R로 토글한다. 이름에만 적용하고 기본은 대소문자 무시 부분 일치다. 대소문자·단어 경계는 Rust `name_search.rs`, 정규식은 프런트엔드 JS RegExp(`src/search/name-regexp.ts`)다. Rust regex 크레이트는 다시 더하지 않았고, Rust는 all 모드로 이름을 흘려 보낸다. 잘못된 정규식은 결과 0이고 오류를 내지 않는다. 범위 밖·링크 거부와 상한은 그대로다.
  - 결과: 위와 같다.
  - 검증: typecheck, npm test 227 통과, cargo test name_search 3 통과, clippy 경고 0.
  - 특이사항(한계): 선택 안에서 찾기에서 범위 밖 일치의 강조는 문서 전체에 남는다. 범위를 고르고 먼저 토글한 뒤 입력해야 한다. 정규식 모드는 Rust가 이름을 최대 100,000개(MAX_SCAN)까지 흘려 보내고 화면은 일치 5,000개에서 멈춘다. 정규식+wd는 ASCII `\w` 경계다. 좁은 폭 줄바꿈(narrow_threshold)은 하지 않는다.
- C-19 checker [PASS]: typecheck 오류 0, npm test 227 통과, clippy 경고 0, cargo test 22 통과, 코드 검토 지적 없음, V3 U-7 14항목·U-8 7항목 PASS (2026-11-10). checker가 허용 목록 밖 명령(Get-ChildItem)으로 허가 창에서 한 번 멈춰, leader가 거절하고 파일 목록을 건넸다.
- **V3(ORDER-13)** (2026-11-10, C-19 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light.
  - 결과: 찾기 줄은 경로 줄 바로 아래(y 110), 편집 영역 너비(440–1440)이고, 문서 첫 줄이 110 → 155로 밀린다(닫으면 110). 선택 안에서 찾기는 1·2줄 범위에서 3(끄면 4). U-8은 read 3·Aa 2·wd 0(my_read의 _는 단어 문자)·^read 2·[ 0. U-7 14항목·U-8 7항목 PASS.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-13/`(v3.json, code-find-bar.png, code-replace-row.png, md-find-bar.png, md-find-bar-preview-sync.png, search-tab-options.png).
  - 특이사항: 없음
- 커밋: 코드 `64156a7`.
- 상태: 끝남.

### ORDER-14 Search 탭 입력란 모서리와 결과 항목 여백 (2026-11-10)

- 요청: 사용자가 확인하고 남긴 U-9 Ctrl-Shift-F Search 탭 입력란 왼쪽 위·아래 모서리가 끊겨 보임(사용자 캡처 search-input-corner.png), 같은 카드에 더한 U-10 결과 항목 높이 26px(Left Dock 트리 한 줄)·항목 사이 4px(사용자 선택)(core `D:\projects\workbench-core\specs\v0.6\orders\ORDER-14.md`).
- **K-18 U-9 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나: 원인은 입력란 안 `<input>`의 불투명 사각 배경이 둥근 테두리 왼쪽 모서리를 덮은 것이다. 여백·최소 높이를 바깥 칸(`.project-search-input`)으로 옮기고 input 배경을 투명으로 했다. 편집기 찾기 줄 입력란(`.document-search-field`)과 같은 변수·구조다. `src/search/search.css`만 고쳤다.
  - 결과: 입력란 왼쪽 모서리가 끊기지 않는다.
  - 검증: typecheck 통과.
  - 특이사항: 없음
- C-20 checker [PASS]: U-9 (2026-11-10).
- **K-18-R1 U-10 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나: 결과 항목 높이에 기존 `--project-panel-item-height`(`project_panel.item.height` 26px)를 쓰고, 위아래 바깥 여백은 새 상수 `search_results.header.margin_y` = 2px로 뒀다(사용자 결정 ORDER-14 U-10, toml에 없어 `src/spec/metrics.ts`에 출처 주석, `spec/` 수정 없음). 좌우 여백 4px·테두리·모서리·글꼴은 그대로다. 쓰지 않게 된 `search_results.header.lines`·`--search-line-height`는 지웠다.
  - 결과: 결과 항목 높이 26px, 항목 사이 4px.
  - 검증: typecheck 통과, npm test 227 통과.
  - 특이사항: 없음
- C-20-R1 checker [PASS](U-9+U-10, 커밋 직전 전체): typecheck 오류 0, npm test 227 통과, clippy 경고 0, cargo test 22 통과, 코드 검토 지적 없음, V3 PASS (2026-11-10).
- **V3(ORDER-14)** (2026-11-10, C-20-R1 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더.
  - 결과: 입력란 높이 32·모서리 6px·왼쪽 테두리 1px·왼쪽 여백 8px(찾기 줄과 같음). 결과 항목 높이 26(트리 한 줄 26)·간격 4·4. 결과 클릭으로 notes.md가 열린다. PASS.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-14/`(v3.json, search-tab.png, search-input-left-zoom.png, search-input-right-zoom.png, search-results-zoom.png).
  - 특이사항: 없음
- 커밋: 코드 `3c8e235`.
- 상태: 끝남.

### ORDER-15 같은 단어 강조·선택 색·여러 선택 단축키 (2026-11-10)

- 요청: 사용자가 확인하고 남긴 U-11 커서 단어·선택 글자와 같은 곳을 옅게 강조(VS Code, 참고 그림 word-highlight-ref.png), U-12 마우스·키보드·여러 커서 선택 색을 찾기 줄 현재 일치 색과 같게, U-13 Ctrl+D·Ctrl+Shift+L·Ctrl+Shift+Up/Down(core `D:\projects\workbench-core\specs\v0.6\orders\ORDER-15.md`).
- **K-19 U-11~U-13 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나:
    - U-11: @codemirror/search `highlightSelectionMatches({highlightWordAroundCursor: true})`를 켰다. 강조 색은 찾기 다른 일치와 같은 토큰 `--ghost-element-selected`이고, 찾기 줄이 열리면 찾기 강조가 우선한다.
    - U-13: Ctrl+Shift+L이 커서만 있을 때 커서 단어(단어 경계)를 전부 선택하도록 고쳤다. Ctrl+Shift+Up/Down을 Editor 컨텍스트에 `editor::AddCursorAbove`/`AddCursorBelow`로 더했다. 빠지는 것은 브라우저 기본 선택 확장뿐이고 다른 컨텍스트는 그대로다. Ctrl+Alt+Up/Down은 그대로이고, Edit 메뉴 표시는 Ctrl+Alt를 유지한다(VS Code Windows 메뉴 표시).
  - 결과: 위와 같다. 새 색은 없다.
  - 검증: C-21에서 함께 확인.
  - 특이사항: 없음
- **K-19-R1~R3 U-12 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나: 선택 색의 계산값은 이미 같았지만(`--players-0-selection`) leader V3 픽셀이 달라 세 번 고쳤다.
    - K-19-R1: 반투명 활성 줄 배경이 글자 뒤 선택 레이어를 덮었다 → 활성 줄 배경을 `.cm-activeLine::before`(z -100)로 옮겼다.
    - K-19-R2: 그때 줄 자체 배경이 비어 CM 기본 파란 활성 줄이 드러난 회귀 → `.cm-activeLine` background를 transparent로 했다.
    - K-19-R3: 찾기 현재 일치는 편집기 선택과 같은 범위라 선택 위에 같은 색이 한 겹 더 쌓였다 → `.cm-searchMatch-selected`를 투명으로 했다.
  - 결과: 선택 색이 찾기 현재 일치 색과 같다.
  - 검증: C-21에서 함께 확인.
  - 특이사항: 없음
- C-21 checker [PASS](커밋 직전 전체): typecheck 오류 0, npm test 229 통과, clippy 경고 0, cargo test 22 통과(첫 실행 타이머 지연 1건 뒤 재실행 통과), 코드 검토 지적 없음, V3 PASS (2026-11-10). checker가 허용 목록 밖 명령(`node -e`)으로 허가 창에서 한 번 멈춰, leader가 거절했다.
- **V3(ORDER-15)** (2026-11-10, C-21 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light.
  - 결과: 커서 foo → 단어 foo 3개 강조(foobar 제외), 공백 → 0, 한글 '않는다' 3개, 찾기 줄을 열면 찾기 강조가 우선한다. 활성 줄 위 찾기 현재 일치 = 두 번 눌러 선택 = 끌어 선택 = 여러 커서 선택 = (207,209,237)이고, 활성 줄 (239,239,240)은 그대로다. Ctrl+D 1→2, Ctrl+Shift+L(커서만) 3, Ctrl+Shift+Down 두 번 → 커서 3개 같은 열, 트리에서는 그대로다. 미리보기 연계는 그대로다. PASS.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-15/`(v3.json 최종 전체 — 그 안 u12 줄은 글자 위 표본이라 판정에 쓰지 않음, v3-u12.json 최종 U-12 픽셀, png).
  - 특이사항: 없음
- 커밋: 코드 `f5fa2ba`.
- 상태: 끝남.

### ORDER-16 여러 커서 좌우·점선 테두리·Sidebar Ctrl+F·편집 글꼴 크기·Lock Preview 표시 (2026-11-10)

- 요청: 사용자가 확인하고 남긴 U-14~U-16(core `D:\projects\workbench-core\specs\v0.6\orders\ORDER-16.md`), 같은 카드에 더한 U-17 편집 영역 글꼴만 Ctrl+=/Ctrl+-/Ctrl+0, U-18 Lock Preview 켜짐: 강조색 아이콘 + 옅은 강조색 둥근 테두리(그림 lock-preview-on.png).
- **K-20 U-14~U-16 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나:
    - U-14: 원인은 편집기에 CM defaultKeymap이 없고 앱 키맵에도 없어 브라우저가 네이티브로 캐럿을 옮겨 커서가 하나로 줄어든 것이다. CM 키맵에 @codemirror/commands 좌우·Home/End·Ctrl+좌우(이동/선택)를 더했다. 위/아래 화살표는 범위 밖이라 그대로다. 단일 커서 Home도 이제 들여쓰기 끝으로 먼저 간다.
    - U-15: 원인은 CM 기본 테마 `.cm-editor.cm-focused` outline 1px dotted다 → outline none으로 했다(다른 탭 본문은 이미 none).
    - U-16: `SIDEBAR_BINDINGS`·`sidebar::Search` 명령·Ctrl+F 표시·`.sidebar-search .menu-shortcut`을 지웠다. Sidebar에서 Ctrl+F는 `BROWSER_KEYS`로 아무 일도 하지 않는다.
  - 결과: 위와 같다.
  - 검증: C-22에서 함께 확인.
  - 특이사항: U-17은 값 근거가 없어 [BLOCKED] → core 확정(1px·최소 6·최대 100·저장 안 함·Ctrl+0 = 설정 `buffer_font_size`·브라우저 배율 초기화 막기·편집 글꼴 변수 따로 승인).
- **K-20-R1 U-17·U-18 반영** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나:
    - U-17: `src/editor/font-size.ts`, `--editor-buffer-font-size`(편집기만, Search 탭·미리보기는 그대로). Workspace 전역(`STATUS_BINDINGS`)에 `zed::IncreaseBufferFontSize`/`DecreaseBufferFontSize`/`ResetBufferFontSize`, Ctrl+=·Ctrl+Shift+=·숫자 패드 +, Ctrl+-·숫자 패드 -, Ctrl+0(숫자 패드 0 NumLock). `BROWSER_KEYS`에 ctrl-0을 더했다. 설정 `buffer_font_size`가 바뀌면 일시 값을 버린다(coder 결정).
    - U-18: 켜짐에만 테두리 `--border-focused` 1px·모서리 `--settings-control-corner-radius` 4px, 아이콘 `--text-accent`. 크기는 그대로다.
  - 결과: 위와 같다.
  - 검증: C-22에서 함께 확인.
  - 특이사항: 없음
- **K-20-R2 U-17 수정** (2026-11-10, coder, Claude Code Sonnet 5.5 high)
  - 무엇을 했나: leader V3에서 이미 열린 편집기의 줄 번호가 옛 줄 높이에 남는 버그(17px인데 줄 번호 24.3)를 찾았다 → 빈 Compartment를 새 빈 테마로 재설정해 CM이 줄 높이를 다시 재게 했다(공개 API).
  - 결과: 줄 번호 높이가 글꼴 크기를 따른다.
  - 검증: C-22에서 함께 확인.
  - 특이사항: 없음
- C-22 checker [PASS](커밋 직전 전체): typecheck 오류 0, npm test 233 통과, clippy 경고 0, cargo test 22 통과, 코드 검토 지적 없음, V3 PASS (2026-11-10).
- **V3(ORDER-16)** (2026-11-10, C-22 판정 [PASS])
  - 무엇을 했나: debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light.
  - 결과: 세 커서 Shift+→×3 → abc/ghi/mno, Shift+← → ab/gh/mn, → → 커서 셋. 점선 없음. Sidebar Ctrl+F 표시·동작 없음, 편집 Ctrl+F는 찾기 줄. 15 → 17px(줄 27.5·줄 번호 27.5) → 16 → 15, UI 글꼴·dpr·zoom 불변, 미리보기 16px 불변, 미리보기 연계 그대로. Lock Preview 켬: 아이콘 rgb(92,120,226)·테두리 1px rgb(125,130,232)·4px·22×22 불변. PASS.
  - 검증: V3. 결과 파일 `specs/v0.6/verify/ORDER-16/`(v3.json, png).
  - 특이사항: 사용자 확인 남음: U-18 테두리 `--border-focused`가 '옅은' 정도인지.
- 커밋: 코드 `bf86cdc`.
- 상태: 끝남(U-18 사용자 확인 남음).

## 버전 종료

진행 중.
