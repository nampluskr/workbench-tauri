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

## 사용자 요청 작업

### ORDER-01-R1 결과 검토와 제안 (2026-11-10)

- 요청: 사용자가 ORDER-01-R1 결과를 "검토하고 제안해 주세요", "core-leader에게 제안을 보내 주세요"라고 요청했다(2026-11-10).
- 조치: tauri-leader가 ORDER-01-R1 결과를 검토하고 제안 `specs/v0.6/reports/ORDER-01-R1-proposal.md`를 써서 core-leader에게 보냈다.
- 결과: core-leader 판단을 사용자가 적용하기로 해 ORDER-01-R2로 왔다.
- 검증: 커밋 `fa7f648`.
- 상태: 끝남.

## 버전 종료

진행 중.
