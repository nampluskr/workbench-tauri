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

## 사용자 요청 작업

### ORDER-01-R1 결과 검토와 제안 (2026-11-10)

- 요청: 사용자가 ORDER-01-R1 결과를 "검토하고 제안해 주세요", "core-leader에게 제안을 보내 주세요"라고 요청했다(2026-11-10).
- 조치: tauri-leader가 ORDER-01-R1 결과를 검토하고 제안 `specs/v0.6/reports/ORDER-01-R1-proposal.md`를 써서 core-leader에게 보냈다.
- 결과: core-leader 판단을 사용자가 적용하기로 해 ORDER-01-R2로 왔다.
- 검증: 커밋 `fa7f648`.
- 상태: 끝남.

## 버전 종료

진행 중.
