> 버전: v0.7 · 작성일: 2026-11-10 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서와 core I-n 대응은 `PLAN.md`에, 요구와 판정 방법은 core `specs/v0.7/ITEMS.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.7/reports/`에 있다.

# PROGRESS — workbench-tauri v0.7

## Phase별 진행

### Phase 1 — v0.7 시작, Settings 분류와 글꼴 크기 셋

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: workspace `wX`에 탭 셋(docs `wX:t2`, impl `wX:t3`, check `wX:t4`)을 만들고 서브 에이전트 셋(`tauri-writer` `wX:p2`, `tauri-coder` `wX:p3`, `tauri-checker` `wX:p4`)을 `HERDR-SETUP.md` 1장 명령으로 띄웠다. control은 `wX:t1`(`wX:p1`)이다.
  - 결과: `herdr agent list`로 확인했다(tauri-leader). worktree 없음.
  - 검증: `herdr agent list` 출력. 모델·effort는 출력에 나오지 않아 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.7 문서와 루트 AGENTS.md** (2026-11-10)
  - 무엇을 했나: `specs/v0.7/`에 PLAN(core I-n 대응)·HERDR-SETUP·PROGRESS를 상태 "초안"으로 쓰고, `reports/`·`verify/` 폴더(`.gitkeep`)를 만들었다(ORDER-01 3.1). INTENT·DECISIONS·SPEC은 쓰지 않는다(tauri-leader 결정). 루트 `AGENTS.md`의 레포 규칙 절 아래에서 제목 `(v0.7)`, 0장 경로, 카드 파일 이름 `v07-`·"관련 core `I-n`", 1장 현재 상태, 3A.4·8장의 `specs/v0.7/` 경로를 고쳤다.
  - 결과: PLAN은 core Phase 1~5와 번호를 같게 두고 판정 방법은 옮기지 않았다. HERDR-SETUP은 v0.6판에서 레이아웃(`wX`), 카드·보고 파일 이름(`v07-`), 경로, core 근거(core v0.7 `orders/COMMON.md`)만 바꾸고 구성은 그대로다. 레포 규칙 절과 core v0.6 D-8·D-9 근거 문장은 그대로다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 없음.
- **K-01 버전 0.7.0, Settings 분류, 글꼴 크기 셋, `Ctrl+=` 따로(ORDER-01, I-4·I-2·I-1)** (2026-11-10, coder)
  - 무엇을 했나:
    - 버전: `src-tauri/tauri.conf.json` 한 곳을 0.7.0으로 바꿨다. About은 `getVersion()`으로 이 값을 읽는다.
    - I-4: Settings 왼쪽 분류를 UI·Editor·Preview로 나눴다(`src/settings/model.ts` `CATEGORIES`, `Settings.tsx`). UI는 Theme·Icon Theme·Font Size, Editor·Preview는 Font Size다. 분류를 누르면 `category-<이름>` 제목으로 스크롤한다. 검색(`filterSettings`)은 분류 이름·항목 이름·설명을 함께 거른다. 설명 문구는 VS Code 설정 설명 방식이다: UI Theme "Specifies the color theme used in the workbench.", Icon Theme "Specifies the file icon theme used in the workbench.", UI Font Size "Controls the font size in pixels used in the UI.", Editor Font Size "Controls the font size in pixels.", Preview Font Size "Controls the font size in pixels used in the Markdown preview."
    - I-2: 새 설정 `preview_font_size`(기본 16)를 더했다. `src/spec/metrics.ts`의 `markdown_preview.*` 32곳을 `rem()`에서 새 `prem()`(`--typography-preview-font-size`에 비례)으로 바꿨다. 스펙 ID 줄은 그대로다.
    - I-1: `src/editor/font-size.ts`의 `fontTarget(focusStack())`이 포커스에 `Editor`가 있으면 편집, `MarkdownPreview`가 있으면 미리보기, 아니면 대상 없음(아무것도 안 함)을 고른다. 기존 세 Zed 액션 안에서 대상만 고르므로 새 액션·키 묶음은 없다. 미리보기 임시 값은 앱 전체 하나, 저장 안 함, 1px·6~100, `Ctrl+0`은 Settings 값이다.
  - 결과: v0.6 설정 파일(키 넷)과 잘못된 값은 미리보기 16으로 읽고, `updateSetting`이 주석·알 수 없는 키를 보존하며 새 키를 더한다(테스트). 미리보기 16이면 v0.6과 같은 값이다. `docs/BUILD.md` 85·86행은 v0.6 빌드 결과 기록(파일 이름·크기·ProductVersion)이라 0.7.0 빌드 전까지 그대로 두었다. Rust는 바꾸지 않았다.
  - 검증: V1. `npm.cmd run typecheck` 통과, `node --test` 236 통과.
  - 특이사항: 편집↔미리보기 위치 연계는 블록 번호(`data-line`) 기준이라 글꼴 크기를 가정하지 않는다(코드 확인). 크기 변경 직후 활성 블록을 다시 스크롤하는 코드는 없다.
- **C-01 checker 검토(W-01·K-01)와 커밋 전 전체 검증** [PASS] (2026-11-10)
  - 무엇을 했나: W-01 문서와 K-01 코드를 검토하고 전체 검증을 했다.
  - 결과: 지적 없음. typecheck 오류 0, test 236 통과, clippy 경고 0, cargo test 22 통과.
  - 검증: checker 명령은 승인 창이 auto mode에 막혀 tauri-leader가 실행하고 출력 파일(`%TEMP%\v07-C-01-*.txt`)로 넘겼고, checker는 그 파일로 판정했다(`HERDR-SETUP.md` 5.5). 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-01-report.md`.
  - 특이사항: 없음.
- **V3 측정(ORDER-01)** (2026-11-10, tauri-leader)
  - 무엇을 했나: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]` 차례 안에서 tauri-leader가 쟀다.
  - 결과: `specs/v0.7/verify/ORDER-01/`(`v3.json`, `v3-sync.json`, PNG 10). C-02 checker 판정 [MEASURED]: ORDER-01 완료 기준 2~7·9 모두 PASS, 불일치 없음, 측정 불가 없음(측정 조건 1920×1080 100%, 창 1440×852, One Dark, 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-02-report.md`). `v3.json`의 Section 8 연계 값은 그 줄이 창 밖이라 클릭이 닿지 않은 측정 오류이고, 연계는 다시 잰 `v3-sync.json`(Section 3~11, 글꼴 변경 전후 모두 일치)으로 판정했다.
  - 검증: V3. SendInput이 전경 창 0x0으로 막혀 CDP 합성 입력으로 쟀다.
  - 특이사항: 없음.

### Phase 2 — 테마 셋

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: Phase 시작에 writer·coder·checker의 컨텍스트를 `/clear`로 비웠다(core COMMON 1절).
  - 결과: 세 에이전트 모두 비운 상태로 카드를 받았다.
  - 검증: herdr 프롬프트 전송.
  - 특이사항: Git Bash 경로 변환으로 첫 시도의 `/clear`가 `C:/Program Files/Git/clear`로 바뀌어 보내졌다. `MSYS_NO_PATHCONV=1`을 붙여 다시 보냈다(`HERDR-SETUP.md` 5.4).
- **W-03 루트 AGENTS.md 레포 규칙 10·12줄(ORDER-02 3A)** (2026-11-10, writer)
  - 무엇을 했나: 레포 규칙 10줄 "HERDR 구성은 core가 정한다"를 v0.7 구성(v0.6 그대로, core `specs/v0.7/PLAN.md` 운영: `tauri-coder` Claude Code Sonnet 5.5 high, 사용자 2026-11-10)으로, 12줄 "core ITEMS 우선"을 "workbench-core v0.7 ITEMS(I-1~I-13)"로 고쳤다(사용자 승인 2026-11-10).
  - 결과: 두 줄의 버전·구성 문구만 바뀌었다. 10줄 뒤 문장과 12줄 괄호 근거 "(core v0.6 D-9, 사용자 2026-11-10)", 다른 줄과 아래 절은 그대로다. core PLAN 운영 문장과 일치한다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-W-03-report.md`.
  - 특이사항: 없음.
- **K-02 테마 셋 UI·편집·미리보기(I-3)** (2026-11-10, coder)
  - 무엇을 했나:
    - 설정: 새 키 `editor_theme`·`preview_theme`를 더했다(`src/settings/model.ts`·`load.ts`). 새 키가 없거나 목록 밖이면 그 파일의 `theme`(그것도 없거나 틀리면 기본)을 쓰고, v0.6 파일(`theme`만)은 셋 모두 `theme`이다. `?theme=`는 세 영역 모두 덮는다.
    - 범위: UI 테마 변수는 `:root`, 편집 테마는 `.cm-editor, .editor-toolbar`, 미리보기 테마는 `.markdown-preview`에 같은 변수 이름으로 다시 정의한다. 구문 강조 클래스는 `.cm-editor .cm-syntax-*`(편집)와 `.markdown-preview .cm-syntax-*`(미리보기)로 좁혔다(`src/theme/theme.ts`·`apply.ts`, `src/shell/markdown-preview.ts`의 `previewSyntaxKeys`). `data-appearance`는 툴팁·메뉴 그림자 전용이라 UI 테마만 따른다.
    - 선택 창: `theme_selector::Toggle`의 미리 보기는 셋 모두에 한 이름, 확정은 `saveSettings({theme, editor_theme, preview_theme})` 한 번의 쓰기, 취소·저장 실패는 열 때의 세 값으로 복원한다(`src/theme/commands.ts`·`selector.ts`). 선택 창 UI는 그대로다.
    - Settings: Editor·Preview 분류에 Theme 행을 더했다(`Settings.tsx`).
  - 결과: 영역 경계는 이렇게 정했다. 찾기 줄(입력란 포함)과 경로 줄은 편집 테마, 미리보기 빈 영역은 `.markdown-preview` 전체라 미리보기 테마, 편집·미리보기 위에 뜨는 메뉴·툴팁·컨텍스트 메뉴·토스트·선택 창은 body 쪽이라 UI 테마, 탭 없는 Pane·탭 바·분할선·확대 테두리는 UI 테마, 스크롤바는 스크롤 컨테이너의 변수라 `.cm-scroller`는 편집·`.markdown-preview`는 미리보기·나머지는 UI 테마다. Rust는 바꾸지 않았다.
  - 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 통과(C-03 기준 239). 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-02-report.md`.
  - 특이사항: 생략한 것 — 아이콘 테마 나누기, 선택 창 새 UI, 미리보기가 열린 채 테마가 바뀔 때 코드 블록 재색칠(기존 동작 그대로, 클래스 CSS만 새 테마로 바뀜).
- **C-03 checker 검토(W-03·K-02)와 커밋 전 전체 검증** [PASS] (2026-11-10)
  - 무엇을 했나: W-03 문서와 K-02 코드를 검토하고 전체 검증을 했다.
  - 결과: 지적 없음. typecheck 오류 0, test 239 통과, clippy 경고 0, cargo test 22 통과.
  - 검증: 출력 파일 `%TEMP%\v07-C-03-*.txt`로 판정했다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-03-report.md`.
  - 특이사항: 없음.
- **V3 측정(ORDER-02)** [PASS] (2026-11-10, tauri-leader)
  - 무엇을 했나: 화면 차례 안에서 tauri-leader가 쟀다. 처음 상태 비교용으로 커밋 `104ce8a`(테마 하나, ORDER-01 끝)를 scratch에 풀어 따로 빌드했고, 무시 폴더의 테마·아이콘·문법 복사본도 함께 복사했다. 임시 APPDATA·임시 WebView 데이터 폴더, 창 1440×852, 100%, CDP 합성 입력(SendInput은 전경 창 0x0으로 막힘).
  - 결과: `specs/v0.7/verify/ORDER-02/`(`v3.json`, `v3-inner.json`, PNG 12). C-04 checker 판정 [MEASURED]: ORDER-02 완료 기준 1~6 모두 PASS, 불일치 없음, 측정 불가 없음(측정 조건 1920×1080 100%, 창 1440×852, 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-04-report.md`). 다시 연 뒤(`c3_restart`)의 차이는 제목 줄 색 하나로, 재기 전 Settings 창이 포커스를 가져 본창 제목 줄이 inactive 색(46,52,62)이었다가 active 색(59,65,77)으로 돌아온 것이다. 선택 창(`c4_selector`)의 차이는 Esc로 찾기 줄이 닫혀 `findBar`·`findInput`이 null인 것뿐이다. `.editor-toolbar` 자신의 `color`는 UI 값을 물려받지만 그 안에 보이는 요소(경로 글자·아이콘·강조)는 모두 편집 테마 색이다(`v3-inner.json`, `c1-editor-toolbar-findbar.png`).
  - 검증: V3. SendInput이 전경 창 0x0으로 막혀 CDP 합성 입력으로 쟀다. 판정은 C-04(checker)가 측정 파일만 읽어 했다.
  - 특이사항: 없음.

### Phase 3 — 편집 보기

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: Phase 시작에 writer·coder·checker의 컨텍스트를 `/clear`로 비웠다(core COMMON 1절).
  - 결과: 세 에이전트 모두 비운 상태로 카드를 받았다.
  - 검증: herdr 프롬프트 전송.
  - 특이사항: 사용자 1차 확인(Phase 1~2)은 사용자가 따로 하고, 이 Phase를 먼저 진행했다(core-leader 2026-11-10).
- **K-03 편집 보기 설정 다섯과 단축키 둘(I-5·I-6·I-7·I-8·I-10)** (2026-11-10, coder)
  - 무엇을 했나:
    - 설정: Settings Editor 분류에 `buffer_font_size` 뒤로 다섯 행을 더했다(`src/settings/model.ts`·`load.ts`·`Settings.tsx`). `editor_line_height` Line Height(기본 1.6), `editor_line_numbers` Line Numbers(켬), `editor_word_wrap` Word Wrap(켬), `editor_indent_guides` Indent Guides(켬), `editor_render_whitespace` Render Whitespace(끔). 설명은 VS Code 설정 설명 방식이다. 켬/끔은 boolean만 유효하고, 쓰기는 `updateSetting`(주석·모르는 키 보존)이다.
    - I-6·I-7 단축키: `Ctrl+Alt+L`(`editor::ToggleLineNumbers`)은 편집 탭(찾기 줄 포함)에 포커스가 있을 때 열린 편집 탭 전부에, `Alt+Z`(`editor::ToggleSoftWrap`)는 마크다운 편집 탭에 포커스가 있을 때 열린 마크다운 탭 전부에 건다. 둘 다 임시 값이라 저장하지 않고, Settings 값이 바뀌면 버린다. 키맵·`BROWSER_KEYS`·메뉴 가속키와 부딪치는 것은 없다(`src/keymap/builtin.ts`, `src/App.tsx`, 새 파일 `src/editor/view-options.ts`).
    - I-8: 파일 값이 1.0~3.0·0.1 단위가 아니면 무효라 기본 1.6이다. Settings 화면의 −/+·직접 입력은 가장 가까운 허용 값으로 맞춘 뒤 저장한다(예: 3.5→3.0, 1.65→1.7). 줄 높이는 `font-size × --editor-line-height-multiplier`(`Ctrl+=` 임시 값 포함)다. E-010(1.618)은 미리보기 `pre`가 계속 쓴다.
    - I-5 들여쓰기 안내선(새 파일 `src/editor/indent-guides.ts`): 선 폭·색은 `docs/refs/01-zed/01-LAYOUT.md` E-020·E-117(폭 1px, 활성 1px, `metrics.ts`의 `editor.indent_guide.width`·`.active_width`), 색 기본값은 `03-THEME-ICONS.md` T-26.9·T-26.10(테마 토큰 `editor.indent_guide`·`editor.indent_guide_active`)이다. 커서 블록 판정은 Zed 소스(커밋 14b7b0e) `crates/editor/src/indent_guides.rs` `find_active_indent_guide_indices`와 `crates/multi_buffer/src/multi_buffer.rs` `enclosing_indent`의 동작만 따랐다(코드 복사 없음). 한 칸은 공백 4칸(`EDITOR_TAB_SIZE`)이고 CM `layer`로 그려 문서 글자에 들어가지 않는다.
    - I-10 공백 보이기(새 파일 `src/editor/whitespace.ts`): 공백 `·`, 탭 `→`, 줄 끝 `↵`(마지막 줄 제외), 색은 편집 테마 토큰 `editor.invisible`이다. 문서 글자는 그대로라 복사·저장에 들어가지 않고, I-5와 켜고 끔이 따로다.
    - 다시 재기: 옛 `remeasureEditors`(DOM에서 `.cm-editor` 찾기)는 화면에 안 붙은 탭을 놓쳐 `eachView`(뷰 추적)로 바꿨다. 글꼴·줄간격이 같이 쓴다.
  - 결과: 처음 상태는 I-5 안내선 켬과 줄간격 1.6 말고는 ORDER-02와 같다. 줄 번호가 꺼지면 거터가 없어지고 줄 앞 여백(E-005)은 그대로다. 새 의존성 없음, Rust 변경 없음. 생략한 것 — CM `highlightWhitespace`(색이 확장 안에 고정이라 `editor.invisible`로 못 칠하고 ↵가 없음), 접힘·RTL 처리, 안내선은 viewport 줄만 계산(활성 블록은 커서 주변을 Zed 한도 25000줄까지 훑음).
  - 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 243 통과. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-03-report.md`.
  - 특이사항: Zed는 커서가 문서 마지막 줄이면 활성 안내선이 없는데 따르지 않았다.
- **C-05 checker 검토(K-03)와 커밋 전 전체 검증** [PASS] (2026-11-10)
  - 무엇을 했나: K-03 코드를 검토하고 전체 검증을 했다.
  - 결과: 지적 없음. typecheck 오류 0, test 243 통과, clippy 경고 0, cargo test 22 통과.
  - 검증: tauri-leader 출력 파일 `%TEMP%\v07-C-05-*.txt`로 판정했다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-05-report.md`.
  - 특이사항: 없음.
- **V3 측정(ORDER-03)** [PASS] (2026-11-10, tauri-leader)
  - 무엇을 했나: 화면 차례 안에서 tauri-leader가 쟀다. 처음 상태 비교용으로 ORDER-02 빌드 exe를 따로 두었다.
  - 결과: `specs/v0.7/verify/ORDER-03/`(`v3.json`, `v3-extra.json`, PNG 16). C-06 checker 판정 [MEASURED]: ORDER-03 완료 기준 1~6 모두 PASS, 불일치 없음, 측정 불가 없음(측정 조건 창 1440×852, 100%, One Dark(One Light 비교 포함), K-03 작업 트리 debug exe, 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-06-report.md`). `v3.json`에서 빠진 값(`afterCtrlAltL2`, 줄 번호 끈 상태 연계 `syncNoNumbers`, 단일 편집기 덤프)은 `v3-extra.json`(`two_editors`, `sync_after_toggles.numbersOff`, `sync_after_toggles.lineHeight24`)으로 판정했다. Settings Editor 분류 행 다섯의 이름·순서·설명과 −/+ 단계(`settings_rows`)도 기준을 채웠다. 사용자 확인 필요: One Light 안내선 색(V4, 아래 미정).
  - 검증: V3. SendInput 대신 CDP 합성 입력, 임시 APPDATA·WebView 폴더로 쟀다. 판정은 C-06(checker)이 측정 파일만 읽어 했다.
  - 특이사항: 사용자 테스트 앱 PID 8744는 건드리지 않았다. V3 뒤 8744가 실행 중이 아닌 것을 보고 core-leader에게 [INFO]로 알렸다. tauri가 닫은 것이 아니다 — 자기 자식만 PID로 닫았고, single-instance가 없고, 충돌 로그가 없다.
- **미정: One 테마의 안내선 색** (2026-11-10)
  - One 테마 파일에 `editor.indent_guide`·`editor.indent_guide_active` 키가 없어 스펙 fallback(#3b3d45/#1b1d23)이 쓰인다. One Light에서 선이 진하다. 스펙에 라이트 값이 없어 추정하지 않았다 — core·사용자가 정한다.

### Phase 4 — 미리보기 줄간격

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: Phase 시작에 writer·coder·checker의 컨텍스트를 `/clear`로 비웠다(core COMMON 1절).
  - 결과: 세 에이전트 모두 비운 상태로 카드를 받았다.
  - 검증: herdr 프롬프트 전송.
  - 특이사항: core ORDER-04가 I-14(One 테마 안내선 색)를 이 Phase에 넣었다. Phase 3의 "미정: One 테마의 안내선 색"은 I-14로 풀었다.
- **K-04 미리보기 줄간격 넷(I-9)과 One 테마 안내선 색(I-14)** (2026-11-10, coder)
  - 무엇을 했나:
    - I-9 설정: Settings Preview 분류에 `preview_font_size` 뒤로 네 행을 더했다(`src/settings/model.ts`·`load.ts`). `preview_paragraph_line_gap` Paragraph Line Spacing(기본 8), `preview_paragraph_gap` Paragraph Spacing(16), `preview_list_line_gap` List Line Spacing(8), `preview_list_gap` List Item Spacing(12). 정수 0~48만 유효하고, 파일 값이 범위 밖·소수·문자열·null이면 기본값이다. Settings −/+·직접 입력은 가장 가까운 정수로 맞춘다(60→48, −3→0, 8.6→9). 저장은 `updateSetting`이다.
    - I-9 화면(`src/spec/metrics.ts`·`src/app.css`): 넷은 `applyMetrics`가 `:root`에 내는 px 고정 CSS 변수라 `Ctrl+=`·글꼴 크기와 무관하다. `p`·`li`의 줄 높이는 `calc(1em + 틈)`(글꼴 + 틈)이라 글꼴을 키워도 겹치지 않고, 16px·기본값이면 24px로 이전 1.5배와 같다. 문단 사이는 `p`의 아래 여백, 목록 항목 사이는 `li + li`(중첩 하위 항목 포함)다. 설정 파일이 바뀌면 열린 미리보기에 바로 걸린다.
    - 목록 블록(`ul`/`ol`) 앞뒤 간격은 지금 값(`markdown_preview.paragraph_gap`, 16) 그대로다. 쓰는 곳이 없어진 `markdown_preview.list_gap` 메트릭은 삭제했다.
    - 느슨한 목록(항목 안 `p`): 줄 높이는 `li p { line-height: inherit }`로 목록 내부 줄간격을 따르고, 항목 사이 세로 간격은 지금처럼 (문단 외부 + 목록 외부)다.
    - I-14: One Dark·One Light의 `editor.indent_guide`·`editor.indent_guide_active`를 Zed 기본값으로 바꿨다. One Dark `#fefef31b`/`#fffaed2d`, One Light `#1f180021`/`#19130029`. 출처는 Zed 소스(로컬 클론 커밋 4304dec) `crates/theme/src/default_colors.rs`이고 값만 읽었다(코드 복사 없음). 예전 값 #3b3d45/#1b1d23은 `fallback_themes.rs`(오프라인 fallback 테마) 값이었다. `src/theme/theme.ts`의 `ONE_GUIDES`가 테마 이름("One Dark"·"One Light")으로만 걸리고(`resolveTokens` 셋째 인자 `name`, `apply.ts`가 `theme.name` 전달), 테마 파일에 값이 있는 테마(Catppuccin)와 그 밖의 테마는 그대로다. 테마 JSON 복사본은 고치지 않았다.
  - 결과: 대비(배경 위 합성) — One Dark 안내선 1.39, 활성 1.73으로 활성이 더 뚜렷하다(이전 활성 1.20은 배경보다 어두워 묻혔다). One Light 안내선 1.30, 활성 1.41로 본문 글자보다 옅고 두 선이 구분된다. 제목·인용·표·코드 블록·frontmatter의 간격·줄 높이는 바뀌지 않았다. 새 의존성 없음, Rust 변경 없음.
  - 검증: V1. `npm.cmd run typecheck` 통과, 관련 테스트(`model.test.ts`·`theme.test.ts`·`metrics.test.ts`) 35 통과. 편집↔미리보기 연계는 `src/shell/markdown-preview.ts`가 `[data-line]` 블록 DOM만 쓰는 것을 코드로 확인했다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-04-report.md`.
  - 특이사항: ORDER-03 보고의 Zed 소스 커밋 14b7b0e는 이 PC에 없어 I-14 값은 4304dec로 읽었다. 목록 항목 안의 표·인용도 `li`의 줄 높이(길이값)를 물려받는다 — 기본값에서는 24px로 같고, 인용·표 글꼴이 항목과 다를 때만 차이가 난다.
- **C-07 checker 검토(K-04)와 커밋 전 전체 검증** [PASS] (2026-11-10)
  - 무엇을 했나: K-04 코드를 검토하고 전체 검증을 했다.
  - 결과: 지적 없음. typecheck 오류 0, test 245 통과, clippy 경고 0, cargo test 22 통과.
  - 검증: tauri-leader 출력 파일 `%TEMP%\v07-C-07-*.txt`로 판정했다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-07-report.md`.
  - 특이사항: 없음.
- **V3 측정(ORDER-04)** [PASS] (2026-11-10, tauri-leader)
  - 무엇을 했나: 화면 차례 안에서 tauri-leader가 쟀다. 처음 상태 비교용으로 ORDER-03 빌드 exe를 따로 두었다.
  - 결과: `specs/v0.7/verify/ORDER-04/`(`v3.json`, PNG 14). C-08 checker 판정 [MEASURED]: ORDER-04 완료 기준 1~6 모두 PASS, 불일치 없음, 측정 불가 없음(측정 조건 1920×1080 100%, 창 1440×852, One Dark(I-14는 테마별), 글꼴 16px·`Ctrl+=` 20px·설정 28px, K-04 debug exe와 ORDER-03 exe 비교, 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-08-report.md`).
    - I-9: 넷을 하나씩 바꾸면 그 간격만 바뀌고 나머지 셋은 그대로이며, 되돌리면 8/16/8/12다. Settings −/+는 48·0에서 멈춘다. 글꼴 20px·28px에서도 줄 높이는 글꼴 + 8px이고 바깥 간격은 16/12 그대로다. 새 프로필과 ORDER-03 설정 파일 모두 ORDER-03 exe와 값이 같다. 미리보기 블록 클릭 위치 연계 4건이 맞다. `preview_list_gap` 20이면 하위 항목 사이도 20px이고 제목·코드 블록 간격은 16px 그대로다.
    - I-14: One Dark 활성 1.96:1 > 안내선 1.50:1(배경 대비 채널 차 107 > 65). One Light 안내선 1.30:1·활성 1.41:1로 본문 글자(14.69:1)보다 옅고 서로 구분된다. Catppuccin은 토큰·화면 색 모두 ORDER-03과 같다.
  - 검증: V3. 판정은 C-08(checker)이 측정 파일만 읽어 했다.
  - 특이사항: `preview_paragraph_gap` 26에서 문단 뒤 제목·코드 블록 앞 간격도 26px이 된 것은 직전 요소가 `p`이고 그 아래 여백이 문단 외부 값이라서이며, 정상으로 판정했다. 글꼴을 키울 때 인용 뒤 코드 블록 앞 간격이 20·28px로 커지는 것은 인용 아래 여백이 글꼴 비례(`prem()`)라서다. K-04 보고의 One Dark 명암비(1.39·1.73)와 C-08 측정(1.50·1.96)은 합성 RGB가 같고 명암비 계산만 다르다 — tauri-leader가 WCAG 식으로 다시 계산했다: One Dark 합성 안내선 (63,66,71) 1.39:1, 활성 (78,80,84) 1.73:1, One Light 안내선 (222,221,218) 1.30:1, 활성 (214,213,210) 1.41:1, 글자 14.67:1. K-04 값이 맞고 C-08의 One Dark 명암비(1.50·1.96)는 계산 오류다. 결론(활성 선이 더 또렷함, PASS)은 같다.

### Phase 5 — 작은 항목과 v0.6 정리

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: Phase 시작에 writer·coder·checker의 컨텍스트를 `/clear`로 비웠다(core COMMON 1절).
  - 결과: 세 에이전트 모두 비운 상태로 카드를 받았다.
  - 검증: herdr 프롬프트 전송.
  - 특이사항: 없음.
- **K-05 선택 안 찾기 강조(I-11), 툴팁(I-12), 메뉴 Paste(I-13), I-9 맞추기** (2026-11-10, coder)
  - 무엇을 했나:
    - I-11: "선택 안에서 찾기"가 켜지면 범위 안 일치만 `.cm-scopedMatch`로 칠하고, 에디터에 `.cm-find-in-selection`이 붙어 CM의 전체 일치 `.cm-searchMatch`는 투명이 된다(`src/editor/search.ts` `scopedMatchRanges`, `src/app.css`). 끄거나 찾기 줄을 닫으면 문서 전체 일치를 다시 칠한다. 카운트·다음·이전·바꾸기·모두 선택은 그대로다. 근거는 이 PC의 VS Code 1.117.0 번들에서 확인한 찾기 모델 동작(공개 소스 `microsoft/vscode` `findModel.ts` `research()`가 범위 안 일치만 구하고 `findDecorations.ts` `set()`이 그것만 강조)이다.
    - I-12: 편집 탭 경로 줄 돋보기 툴팁을 "Find in Explorer"에서 "Find"로 바꿨다(`src/shell/Pane.tsx`).
    - I-13: 원인은 메뉴 Paste가 `document.execCommand("paste")` 실패 뒤 `navigator.clipboard.readText()`로 넘어가고, 이 WebView 클립보드 읽기 API가 권한 창을 띄우는 것이었다. Rust 명령 `read_clipboard_text`(새 파일 `src-tauri/src/clipboard.rs`)가 CF_UNICODETEXT를 읽고, 프런트 `pasteClipboard`가 포커스된 입력란이면 선택을 대체하고 아니면 CM에 `paste` 이벤트를 보내 `Ctrl+V`와 같은 처리를 탄다. 이미 직접 의존인 `windows` crate에 feature 셋(`Win32_System_DataExchange`·`Win32_System_Memory`·`Win32_System_Ole`)만 더했다.
    - I-9 맞추기: `.markdown-body p`의 아래 여백을 비례 값 `--markdown-preview-paragraph-gap`(L-103)으로 돌리고, 문단 사이(`p:has(+ p)`)와 목록 항목 안 문단(`li p`)만 문단 외부 값 `--preview-paragraph-gap`(px)을 쓴다.
  - 결과: 새 crate·npm 없음, `Cargo.lock` 변화 없음, Licenses 변경 없음, capability 변경 없음(앱 자체 `#[tauri::command]`). I-9는 기본값에서 두 값이 같은 16이라 화면이 ORDER-04와 같고, 문단 뒤 제목·코드 블록·표·인용·목록 앞 간격은 다시 비례 값이다.
  - 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 246 통과, `cargo check`·`cargo clippy -- -D warnings`·`cargo test` 22 통과. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-05-report.md`.
  - 특이사항: VS Code는 여러 줄 범위를 줄 단위(시작 열 1 ~ 끝 줄 끝)로 넓히는데 따르지 않고 선택 그대로를 범위로 두었다 — 차이로 남는다.
- **v0.6 정리 두 가지** [BLOCKED] (2026-11-10)
  - 무엇을 했나: `.agents/checker-settings.json` 허용 목록 추가(coder)와 `src-tauri/target/release/workbench-tauri.exe.running-pid11268` 삭제(leader)를 시도했다.
  - 결과: 허용 목록 추가는 auto mode가 Self-Modification으로, 파일 삭제는 Irreversible Local Destruction으로 막았다(PID 11268은 실행 중 아님). 둘 다 우회하지 않았고 파일은 그대로다. 더하려던 허용 목록 줄(명령 전체 일치 방식): `command(git status -s)`, `command(git grep)`, `command(Test-Path)`, `command(Get-ChildItem)`, `command(Get-ChildItem -Path "D:\projects\workbench-tauri\specs\v0.7\verify\ORDER-02")`.
  - 검증: 없음(변경 없음).
  - 특이사항: 사용자가 파일을 고치거나 규칙을 허용해야 한다.
- **C-09 checker 검토(K-05)와 커밋 전 전체 검증** [PASS] (2026-11-10)
  - 무엇을 했나: K-05 코드를 검토하고 전체 검증을 했다.
  - 결과: 지적 없음. typecheck 오류 0, test 246 통과, clippy 경고 0, cargo test 22 통과.
  - 검증: tauri-leader 출력 파일 `%TEMP%\v07-C-09-*.txt`로 판정했다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-09-report.md`.
  - 특이사항: 없음.
- **V3 측정(ORDER-05)** (2026-11-10, tauri-leader)
  - 무엇을 했나: 화면 차례 안에서 tauri-leader가 쟀다. 처음 상태 비교용으로 ORDER-04 빌드를 따로 두었다. I-13은 사용자 클립보드 글을 저장했다가 측정 뒤 되돌렸다.
  - 결과: `specs/v0.7/verify/ORDER-05/`(`v3.json`, `v3-find.json`, PNG 8). C-10 checker 판정 [MEASURED]: ORDER-05 완료 기준 1·2·3·3A·5 PASS, 4 BLOCKED(측정 조건 1920×1080 100%, 창 1440×852, One Dark, I-13은 임시 APPDATA·독립 WebView 데이터 폴더, 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-10-report.md`).
    - I-11(`v3-find.json`으로 판정): 켬이면 카운트 1/2, `.cm-find-in-selection` 붙음, 전체 일치 `.cm-searchMatch` 보이는 것 0, 범위 안 강조 2(범위 안 일치 1 + 현재 일치 선택 색 1). 끔이면 카운트 2/5, 클래스 빠짐, 강조 5(일치 4 + 현재 일치 1).
    - I-12: 돋보기 hover 툴팁 "Find".
    - I-13: 메뉴 Paste로 `menuDoc`에 "한국어 첫 줄\n둘째 줄 English"가 들어갔고, `Ctrl+V`에 해당하는 `after`−`before` 삽입 글과 같다. 찾기 입력란에는 줄바꿈이 한 칸으로 바뀌어 "한국어 첫 줄 둘째 줄 English"가 들어갔다. 클립보드는 되돌렸다(`clipboardRestored: true`).
    - I-9 맞추기: 기본값에서 ORDER-04 빌드와 미리보기 간격 12항목이 같다(`c3a_default_equal: true`). 문단 외부 26px이면 문단 사이(`P>P`)만 26px이고 문단 뒤 `H2`·`PRE`·`BLOCKQUOTE`·`UL`·`TABLE` 앞은 16px이다.
    - 0.7.0 빌드: K-06 결과(설치 파일·앱 exe 크기, ProductVersion·FileVersion 0.7.0)와 `docs/BUILD.md` 4장 갱신을 확인했다.
    - v0.6 정리: 위 [BLOCKED] 두 가지 그대로다(`running-pid11268` 파일 남아 있음).
  - 검증: V3. 판정은 C-10(checker)이 측정 파일만 읽어 했다.
  - 특이사항: `v3.json`의 I-13 비교 플래그(`menuInsertedEqualsClip` 등)가 false인 것은 PowerShell 출력 코드 페이지 때문에 `clip` 문자열이 깨진 측정 문제이고, `menuDoc`·`after`를 직접 비교해 일치로 판정했다. 권한 창이 없는 것은 CDP 캡처에 네이티브 창이 찍히지 않아 화면으로 확인하지 못한 측정 한계다(삽입은 바로 끝났다).
- **K-06 release 0.7.0 빌드** (2026-11-10, coder)
  - 무엇을 했나: 빌드 전 workbench-tauri 프로세스가 없는 것을 확인하고 `npm.cmd run tauri build`로 release 빌드를 했다. `docs/BUILD.md` 4장(표 두 행·표 위 문장)과 5장(한 줄)을 갱신했다.
  - 결과: 빌드 62.3초(vite 6.0초, Rust 44.2초). `workbench-tauri_0.7.0_x64-setup.exe` 6,020,919 바이트, 앱 exe 16,742,912 바이트, 둘 다 ProductVersion·FileVersion 0.7.0. 기존 경고(chunk 크기, web-tree-sitter direct eval)만 있고 Rust 경고 없음.
  - 검증: V1. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-06-report.md`.
  - 특이사항: exe zip·dist 크기는 재지 않아 `docs/BUILD.md`에 기존 2026-11-08 기록을 유지했다. `workbench-tauri.exe.running-pid11268`은 그대로 두었다.

### Phase 6 — Settings 분류별 페이지·Load Defaults

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: Phase 시작에 writer·coder·checker의 컨텍스트를 `/clear`로 비웠다(core COMMON 1절).
  - 결과: 세 에이전트 모두 비운 상태로 카드를 받았다.
  - 검증: herdr 프롬프트 전송.
  - 특이사항: 없음.
- **K-07 Settings 분류별 페이지(I-16), 분류마다 Load Defaults(I-17)** (2026-11-10, coder)
  - 무엇을 했나:
    - I-16: 검색어가 없으면 고른 분류의 제목과 행만 보인다(`src/settings/Settings.tsx` `shown()` = `[current()]`). 처음 열면 UI. 왼쪽 분류를 누르면 페이지만 바뀌고 스크롤 이동은 없다(스크롤 코드 삭제). 왼쪽 분류 셋은 검색 중에도 항상 보인다. 검색어가 있으면 맞는 행이 있는 분류만 제목으로 묶어 모두 보이고(기존 방식), 검색어를 지우면 고른 분류 페이지로 돌아간다. 검색 중 분류를 누르면 검색어를 지우고 그 분류 페이지로 간다.
    - I-17: 분류 페이지 제목 오른쪽 끝에 Load Defaults 버튼(`.settings-heading`)을 두고, 검색 결과 화면에는 두지 않았다. 누르면 WebView 안 `<dialog class="settings-confirm">`를 `showModal()`로 연다. 문구는 "Restore all {분류} settings to their defaults?" / "This cannot be undone." / [Load Defaults] [Cancel]. 열리면 Cancel에 포커스, Tab은 창 안에서만 돌고, Escape = 취소, 닫히면 Load Defaults 버튼으로 포커스가 돌아간다. 확인하면 `categoryDefaults(분류)`(`src/settings/model.ts`)를 `saveSettings`로 한 번 쓴다 — 그 분류 키만 기본값이고 주석·알 수 없는 키·다른 분류 키는 그대로다. `window.confirm`·Rust TaskDialog는 쓰지 않았다.
  - 결과: 의존성·`spec/` 변경 없음, 새 수치·토큰 없음(기존 `--settings-*`·`--buttons-*` 변수 사용). 변경 파일은 `src/settings/`의 `Settings.tsx`·`model.ts`·`model.test.ts`·`settings.css`.
  - 검증: V1. `npm.cmd run typecheck` 통과, `node --test src/settings/model.test.ts` 9 통과(새 테스트 1: Editor 되돌리기 → Editor 키만 기본값, 다른 분류 값·알 수 없는 키·주석 그대로). 전체 테스트 247. UI 동작은 코드 확인. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-07-report.md`.
  - 특이사항: 메모리 단축키 값(`Ctrl+=` 글꼴 크기, `Ctrl+Alt+L`·`Alt+Z`)은 설정 값이 실제로 바뀔 때만 지워지는 기존 규칙(ORDER-01~05) 그대로다 — 이미 기본값인 키를 되돌리면 임시값이 남는다. 바꾸지 않았다. UI의 Load Defaults는 `theme`만 되돌리고 `editor_theme`·`preview_theme`는 Editor·Preview 분류 소속이라 건드리지 않는다.
- **C-11 checker 검토(K-07)와 커밋 전 전체 검증** [PASS] (2026-11-10)
  - 무엇을 했나: K-07 코드와 `categoryDefaults` 테스트를 검토하고 전체 검증을 했다.
  - 결과: 지적 없음. typecheck 오류 0, test 247/247 통과. Rust 변경이 없어 cargo 검증은 하지 않았다.
  - 검증: tauri-leader 출력 파일 `%TEMP%\v07-C-11-*.txt`로 판정했다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-11-report.md`.
  - 특이사항: 검토 중 checker가 `Get-ChildItem` 승인 창에 멈췄다(auto mode가 승인 응답을 막음). tauri-leader가 취소하고 셸 없이 진행시켰다.
- **V3 측정(ORDER-06)** (2026-11-10, tauri-leader)
  - 무엇을 했나: 화면 차례 안에서 tauri-leader가 쟀다.
  - 결과: `specs/v0.7/verify/ORDER-06/`(`v3.json`, PNG 9). C-12 checker 판정 [MEASURED]: ORDER-06 완료 기준 1·2·3 PASS, 불일치 0, 측정 불가 0(측정 조건 1920×1080 100%, Settings 창 900×750, One Dark, debug exe, CDP 합성 입력. 시작 `settings.json`은 주석 1행·`x_unknown: 1`·`buffer_font_size` 20·`editor_line_height` 2.2·`preview_font_size` 22. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-12-report.md`).
    - 기준 1(I-16 분류별 페이지): 처음 열면 UI 제목 하나·행 3, Editor 클릭은 행 7, Preview 클릭은 행 6이고 셋 다 `scrollTop` 0.
    - 기준 2(I-16 검색): "preview" 검색은 Preview 제목·행 6이고 Load Defaults 없음. 검색어를 지우면 Preview 페이지와 Load Defaults가 돌아온다. "font" 검색은 UI·Editor·Preview 제목 아래 행 4(UI Font Size, Editor Font Size·Line Height, Preview Font Size). 검색 중 Editor 클릭은 검색어 ""·Editor 행 7.
    - 기준 3(I-17 Load Defaults): 확인 창 제목 "Restore all Editor settings to their defaults?", 설명 "This cannot be undone.", 버튼 [Load Defaults] [Cancel], 포커스 Cancel, 위치 (282, 295) 337×160(창 가운데). Escape·Cancel은 창이 닫히고 파일이 그대로(Escape 뒤 포커스 Load Defaults). 확인하면 Editor 값만 기본값(`buffer_font_size` 15, `editor_line_height` 1.6)이 되고 주석·`x_unknown`·`preview_font_size` 22는 그대로다. 앱을 다시 열어도 같다.
  - 검증: V3. 판정은 C-12(checker)가 측정 파일만 읽어 했다.
  - 특이사항: 확인 뒤 파일에 없던 Editor 키 다섯(`editor_theme`·`editor_line_numbers`·`editor_word_wrap`·`editor_indent_guides`·`editor_render_whitespace`)이 기본값으로 새로 쓰였다 — `categoryDefaults`가 분류의 키 전부를 쓰기 때문이고 값은 기본값과 같다.

### Phase 7 — 안내선 단위·툴팁·Help 이름·`wd` 구분자·Window 메뉴, 0.7.0 다시 빌드

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: Phase 시작에 writer·coder·checker의 컨텍스트를 `/clear`로 비웠다(core COMMON 1절).
  - 결과: 세 에이전트 모두 비운 상태로 카드를 받았다.
  - 검증: herdr 프롬프트 전송.
  - 특이사항: 없음.
- **K-08 안내선 단위(I-15), 툴팁(I-18), Help 이름(I-19), `wd` 구분자(I-20), Window 메뉴(I-21)** (2026-11-10, coder)
  - 무엇을 했나:
    - I-15: 들여쓰기 안내선 단위를 문서에서 감지한다(`src/editor/indent-guides.ts` `guessIndentUnit`, 기존 `depths`·`activeBlock`·`guideRuns`·`lineDepth`에 `unit` 인자를 더함). 규칙은 VS Code `guessIndentation`(이 PC VS Code 번들 `workbench.desktop.main.js`, 공개 소스 `src/vs/editor/common/model/indentationGuesser.ts`)을 읽고 따랐고 코드는 베끼지 않았다: 앞 10000줄, 빈 줄 건너뜀, 앞 줄과 접두사 관계인 줄의 공백 차이 1~8을 세어 후보 [2,4,6,8,3,5,7] 중 최다(동수면 앞 후보), 4가 뽑혀도 2가 4의 2/3 이상이면 2, 탭 시작 줄이 공백 2칸 이상 줄보다 많거나 같으면 탭 파일 → 4, 센 게 없으면 4. VS Code와 다른 점: 탭·공백이 섞인 차이는 세지 않고 건너뛴다, "looks like alignment" 거름은 생략했다(`shortcut:` 주석). 탭 키 칸 수(4)와 탭 정지 폭은 그대로다. 문서 상태를 만들 때(파일을 열 때)와 문서가 바뀔 때마다 다시 감지한다(`StateField`).
    - I-18: 원인은 CodeMirror 찾기 줄(`.cm-panels`) 기본 `z-index` 300이 툴팁 `.tooltip`의 `z-index` 3보다 높아, 경로 줄 오른쪽 아이콘 툴팁이 찾기 줄 아래로 들어간 것이다. `.tooltip`을 `z-index` 1000으로 바꿨다(`src/app.css`).
    - I-19: Help 항목을 "Repository"·"About"으로 바꿨다(동작 그대로, `src/shell/app-menus.ts`).
    - I-20: Search 탭은 `src-tauri/src/name_search.rs` `is_word`에서 `_`를 뺐다(글자·숫자만 단어 문자). 편집 탭 찾기 줄의 원래 동작은 CM `charCategorizer` 기준이라 `_`는 단어 문자, `-`는 구분자였다 — `read to-read my_read reader`에서 `wd` `read`는 둘(`read`, `to-read`). CM wholeWord는 단어 문자를 뺄 수 없어 찾기 줄 `wd` 토글을 쿼리 `test` 훅 `wholeWordTest`(글자·숫자 경계)로 바꾸고, 켜짐 표시는 `wholeWordOn(query)`로 한다(`src/editor/search.ts`). `Ctrl+D`·`Ctrl+Shift+L`·skip·커서 단어 강조·단어 이동·두 번 눌러 선택은 그대로다.
    - I-21: Window 메뉴(Minimize·Zoom)를 지웠다. 타이틀 바 버튼은 `TitleBar.tsx`가 `appWindow`를 직접 불러 그대로다. `zed::Minimize`·`zed::Zoom` 명령 등록은 사용자 keymap에서 쓸 수 있어 남겼다.
  - 결과: 의존성·`spec/` 변경 없음. 변경 파일은 `src/editor/indent-guides.ts`(+`.test.ts`), `src/app.css`, `src/shell/app-menus.ts`(+`.test.ts`), `src/editor/search.ts`(+`.test.ts`), `src-tauri/src/name_search.rs`.
  - 검증: V1. `npm.cmd run typecheck` 통과, `node --test` indent-guides·search·app-menus 17 통과, `cargo check`·`cargo clippy -- -D warnings` 경고 없음, `cargo test name_search` 3 통과. I-18은 코드 확인(원인을 CM 소스에서 확정). 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-08-report.md`.
  - 특이사항: 문서가 바뀔 때마다 감지하므로 빈 파일에 처음 들여쓰기를 치는 동안 단위가 바뀔 수 있다. 큰 파일 입력이 느려지면 열 때만 감지로 바꾼다. 메뉴(z 3)도 같은 이유로 찾기 줄에 가릴 수 있으나 카드 범위 밖이라 고치지 않았다.
- **K-08-R1 Load Defaults 키 지우기(ORDER-07 3.5A)와 K-08 검토 지적** (2026-11-10, coder)
  - 무엇을 했나:
    - ORDER-07 3.5A(ORDER-06 미정 1의 사용자 답): Load Defaults가 그 분류 키를 기본값으로 쓰지 않고 파일에서 지운다. `src/settings/model.ts`에서 `categoryDefaults`를 지우고 `categoryKeys`·`removeSettings`를 더했고, `src/settings/load.ts` `resetSettings`가 읽기 → `removeSettings` → `expected`로 한 번 쓰기 → 다시 읽기를 한다(`Settings.tsx`가 `resetSettings(categoryKeys(분류))`를 부름). 최상위 멤버만 지우고, BOM·CRLF·다른 키·알 수 없는 키·주석은 그대로 두며, 지운 키 바로 위 줄 주석은 남긴다(구역 제목일 수 있어서). 깨진 파일은 거부한다.
    - ORDER-06 미정 2(단축키 임시 값): 사용자 답대로 지금 규칙 그대로 두었다.
    - 검토 지적: `name_search.rs` 테스트에 `read.md`·`to-read`·`my_read.txt`·`reader.md` 넷에서 `wd` `read` → 앞의 셋, 끄면 넷 단언을 더했다. 편집 탭 `SearchQuery` 생성 지점을 전수 확인했고 빠진 곳 하나를 고쳤다 — CM 안쪽 `defaultQuery`가 선택 글이 있는 채로 찾기 줄을 열 때 새 쿼리를 만들면서 `test`를 잃어 `wd`가 꺼졌다. `keepWholeWord`(`EditorState.transactionExtender`)가 되돌리고, `wd` 토글 자신은 `userEvent: "search.wholeword"`로 걸러 끄기는 그대로 된다.
  - 결과: 의존성 변경 없음. 변경 파일은 `src/settings/model.ts`(+`.test.ts`), `src/settings/load.ts`, `src/settings/Settings.tsx`, `src-tauri/src/name_search.rs`, `src/editor/search.ts`(+`.test.ts`).
  - 검증: V1. `npm.cmd run typecheck` 통과, `node --test` search·indent-guides·settings model·app-menus 28 통과, `cargo check`·`cargo clippy -- -D warnings` 경고 없음, `cargo test name_search` 통과. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-08-R1-report.md`.
  - 특이사항: 중복 키는 하나씩 반복해서 지운다(드문 경우라 단순하게).
- **C-13 checker 검토(K-08·K-08-R1)와 커밋 전 전체 검증** [PASS] (2026-11-10)
  - 무엇을 했나: K-08·K-08-R1 코드와 테스트를 검토하고 전체 검증을 했다.
  - 결과: 지적 없음. typecheck 오류 0, test 251/251 통과, clippy 경고 0, cargo test 22 통과.
  - 검증: tauri-leader 출력 파일 `%TEMP%\v07-C-13-*.txt`로 판정했다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-13-report.md`.
  - 특이사항: 없음.
- **V3 측정(ORDER-07)** (2026-11-10, tauri-leader)
  - 무엇을 했나: 화면 차례 안에서 tauri-leader가 쟀다.
  - 결과: `specs/v0.7/verify/ORDER-07/`(`v3.json`, PNG 15). C-14 checker 판정 [MEASURED]: ORDER-07 완료 기준 1·2·3·4·5·5A PASS, 불일치 0, 측정 불가 0(측정 조건 창 1440×852, 100%, One Dark, 버퍼 글자 폭 9px, debug exe, 임시 APPDATA·WebView 폴더, CDP 합성 입력. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-14-report.md`).
    - 기준 1(I-15): 2칸 YAML은 선 간격 18px(2칸), 4칸 TS는 36px(4칸)이다(글자 폭 9). 활성 선은 하나이고 빈 줄 이어짐과 테마 변수는 그대로다.
    - 기준 2(I-18): 찾기 줄이 열려도 Preview Markdown·Find 툴팁의 글과 위치가 닫혔을 때와 같고, 툴팁 z 1000 > 찾기 줄 z 300이라 겹치는 부분까지 보인다.
    - 기준 3(I-19): Help 항목 "Repository"·"About", About 창 "workbench-tauri 0.7.0"(Escape로 닫힘).
    - 기준 4(I-20): Search 탭 `wd` 켬은 `my_read.txt`·`read.md`·`to-read` 셋, 끔은 넷. 편집 탭 `read to-read my_read reader`에서 `wd` 켬 `1/3`, 선택 위에서 찾기 줄을 다시 열어도 `1/3`·`wd` 켜짐 유지, 끔 `1/4`.
    - 기준 5(I-21): 메뉴 줄 File·Edit·View·Go·Help. 최대화 1920×1032, 원래대로 1440×852, 최소화 동작.
    - 기준 5A(I-17 고침): Editor Load Defaults 뒤 화면 값은 기본값(15·1.6·줄바꿈 켬)이고 Preview 22는 그대로다. 파일은 `{ // user comment, "x_unknown": 1, "preview_font_size": 22 }`로 Editor 키만 지워졌다.
  - 검증: V3. 판정은 C-14(checker)가 측정 파일만 읽어 했다.
  - 특이사항: Repository는 외부 브라우저를 열어 누르지 않았다(URL과 핸들러는 코드·테스트 그대로).
- **K-09 release 0.7.0 다시 빌드** (2026-11-10, coder)
  - 무엇을 했나: `npm.cmd run tauri build`로 release를 다시 빌드하고 `docs/BUILD.md`(4장 표 위 두 문장, NSIS 설치 파일·앱 exe 행, 5장 0.7.0 걸린 시간)를 고쳤다.
  - 결과: 성공, 전체 66.4초(vite 6.57초, Rust release 47.25초, NSIS 포함). NSIS 설치 파일 `workbench-tauri_0.7.0_x64-setup.exe` 6,024,784 바이트(LastWriteTime 2026-11-10 20:03:16), 앱 exe 16,743,936 바이트, 둘 다 ProductVersion·FileVersion 0.7.0. 경고는 기존 그대로(web-tree-sitter direct eval, 큰 chunk).
  - 검증: V1(빌드 결과 확인). 빌드 전 `workbench-tauri.exe` 프로세스 없음, 잠금 없음. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-09-report.md`.
  - 특이사항: exe zip·`dist/` 크기는 이번에 재지 않아 기존 2026-11-08 기록 표시를 유지했다.

### Phase 8 — 앱 아이콘·찾기 VS Code 맞춤·Rust 라이선스·Sidebar·줄 번호 여백·Go 메뉴·About, 0.7.0 다시 빌드

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: Phase 시작에 writer·coder·checker의 컨텍스트를 `/clear`로 비웠다(core COMMON 1절).
  - 결과: 세 에이전트 모두 비운 상태로 카드를 받았다.
  - 검증: herdr 프롬프트 전송.
  - 특이사항: 없음.
- **ORDER-05 정리(ORDER-08 3.7)** (2026-11-10, tauri-leader)
  - 무엇을 했나: 남은 `running-pid11268`을 지웠다(PID 11268은 실행 중이 아니었다). `.agents/checker-settings.json` 허용 목록 추가는 auto mode가 Self-Modification으로 다시 막아 우회하지 않고 core-leader에 [BLOCKED]로 알렸다.
  - 결과: `running-pid11268` 삭제. 허용 목록은 core-leader 답대로 사용자가 직접 고치고 다시 시도하지 않는다(기준 7은 삭제만).
  - 검증: 코드 확인(파일 없음).
  - 특이사항: 없음.
- **K-10 앱 아이콘(I-22), 선택 안 찾기(I-23), Ctrl+F 입력란(I-24), Rust 라이선스(I-25), Sidebar(I-26), 줄 번호 감춤 여백(I-27)** (2026-11-10, coder)
  - 무엇을 했나:
    - I-22: core 아이콘 `i-window.ico`(16·24·32·48·256)와 `i-window-256.png`를 변환 없이 `src-tauri/icons/icon.ico`·`icon.png`로 복사했다. Windows에서 창·작업 표시줄 기본 아이콘은 exe의 `.ico` 리소스라 `icon.ico` 하나로 exe·창·작업 표시줄이 같이 바뀐다.
    - I-23: 찾기 줄 "선택 안에서" 범위를 VS Code(`FindWidget` 토글, `FindModelBoundToEditorModel.research`)처럼 줄 단위로 넓힌다(`src/editor/search.ts` `lineScope`·`toggleScope`). 여러 줄이면 첫 줄 시작~끝 줄 끝, 끝이 열 1이면 앞 줄 끝으로 당기고, 한 줄 안 선택은 그대로, 비면 켜지 않는다. 문서가 바뀌면 다시 넓힌다.
    - I-24: Ctrl+F 입력란을 VS Code `getSelectionSearchString(…, "single")` 규칙으로 채운다(`seedSearchString`·`openWith`): 한 줄 선택은 그 글(524288자 미만), 커서만 있으면 커서 아래 단어, 여러 줄이면 입력란 유지, 정규식이 켜져 있으면 이스케이프. Ctrl+H는 입력란이 비어 있을 때만 채운다. 전에는 여러 줄을 개행째 넣어 `<input>`에서 "cat bcat c"처럼 보였다. I-20의 `test`는 `...before`로 보존.
    - I-25: `tools/rust-licenses.mjs`(새)가 `cargo metadata --filter-platform x86_64-pc-windows-msvc --locked`로 normal 의존만 따라가(build·dev·proc-macro 제외) crate 폴더의 `LICENSE*`·`COPYING*`·`UNLICENSE*`·`NOTICE*` 원문을 같은 글끼리 묶어 `src/licenses/rust-dependencies.txt`(새, 425KB)를 만든다. 기존 `src/licenses/*.txt` raw glob이 Licenses 화면에 그대로 싣는다.
    - I-26: 원인은 `.sidebar-list`에 `overflow-y: auto`만 있어 `overflow-x`도 `auto`로 계산된 것이다. `overflow-x: hidden`을 더했다(`src/app.css`). 이름 말줄임은 그대로다.
    - I-27: 줄 번호를 끄면 편집기에 `cm-no-line-numbers` 클래스를 달고 `.cm-line` 왼쪽 여백을 VS Code `computeLayout` 식(줄 높이 + `lineDecorationsWidth` 10 + folding 16)으로 준다(`view-options.ts`, `extensions.ts`, `metrics.ts`의 이름 있는 변수 둘). 들여쓰기 안내선은 글자 시작을 `.cm-line`의 실제 padding으로 읽는다(`indent-guides.ts`). 보임 상태는 그대로다.
  - 결과: 의존성·`spec/` 변경 없음. 변경 파일은 `src-tauri/icons/icon.ico`·`icon.png`, `src/editor/search.ts`(+`.test.ts`), `tools/rust-licenses.mjs`(+`.test.mjs`), `src/licenses/rust-dependencies.txt`, `src/app.css`, `src/spec/metrics.ts`, `src/editor/extensions.ts`, `src/editor/view-options.ts`, `src/editor/indent-guides.ts`.
  - 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 254/254(새 테스트 I-23·I-24·I-25), `cargo check` 통과(Rust 코드 변경 없음). I-26·I-27은 코드 확인. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-10-report.md`.
  - 특이사항: `alloc-stdlib`·`selectors`·`webview2-com`·`webview2-com-sys`는 패키지에 라이선스 파일이 없어 그 사실과 SPDX 식만 적었다. `Cargo.lock`이 바뀌면 `node tools/rust-licenses.mjs`를 다시 돌린다. 보고에 적은 crate 수 214는 틀린 수다(목록 파일 색인은 192, 아래 V3). I-27 줄 높이가 소수(예 25.5px)여도 반올림하지 않았다(VS Code는 정수).
- **K-11 Go 메뉴(I-28), About(I-29)** (2026-11-10, coder)
  - 무엇을 했나:
    - I-28: Go 메뉴만 지웠다. `pane::ActivatePreviousItem`·`ActivateNextItem` 명령, `Ctrl+PageUp/PageDown`, 탭 영역 ←·→ 버튼은 그대로다. 메뉴 줄은 File·Edit·View·Help.
    - I-29: Help는 `About` 하나다(View Dependency Licenses·File Bug Report...·Request Feature...·Repository 삭제, 쓰지 않게 된 `REPOSITORY_URL`·`ISSUE_URL`·`MenuItem.url`·`openUrl` 분기도 지움). About는 앱 안 `<dialog>`(`src/shell/About.tsx`, `about.ts` 새): 머리(앱 아이콘 48px, "workbench-tauri", Version), 기술 정보 Version·Date(빌드 날, `vite.config.ts` `__BUILD_DATE__`)·Host(`tauri::VERSION`)·WebView2(`tauri::webview_version()`, Rust 명령 `about_info`)·OS(`navigator.userAgentData` `platformVersion`), 주요 Third-Party 9개(Tauri·Solid·CodeMirror·web-tree-sitter·markdown-it·Catppuccin Icons·Codicons·IBM Plex Sans·Lilex, 값은 `src/licenses` 데이터에서 읽고 글꼴 둘만 하드코딩)와 나머지 개수 줄, 버튼 Copy·View All Licenses·OK(기본 포커스). Copy는 Rust 명령 `write_clipboard_text`(CF_UNICODETEXT, 기존 `read_clipboard_text`와 `open_clipboard` 재시도 공유)로 한다. 아이콘은 `?no-inline` import로 파일로 내보내 CSP `img-src 'self'`를 지킨다.
  - 결과: 의존성·CSP·capability 변경 없음. 변경 파일은 `src/shell/app-menus.ts`(+`.test.ts`), `src/shell/menu.ts`, `src/shell/AppMenu.tsx`, `src/shell/About.tsx`·`about.ts`(+`.test.ts`, 새), `src/app.css`, `src/spec/metrics.ts`(새 변수 넷), `vite.config.ts`, `src-tauri/src/clipboard.rs`, `src-tauri/src/lib.rs`.
  - 검증: V1. `npm.cmd run typecheck` 통과, `npm.cmd run test` 256/256, `cargo check` 통과, `cargo clippy -- -D warnings` 경고 없음, `cargo test` 22 통과, `npx vite build` 통과. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-11-report.md`.
  - 특이사항: I-28·I-29는 카드 진행 중 core-leader가 ORDER-08 8절(3.9 I-28, 3.10 I-29)로 더했다(한때 보류했다가 사용자 지시로 진행). 새 변수 `--dialog-about-max-height` 560px·`--dialog-about-icon-size` 48px·`--dialog-about-button-border` 1px는 toml에 없는 값이다. P-018 `dialog.about.height`(300)는 쓰지 않는다(창 높이는 글 높이, 최대 560).
- **C-15 checker 검토(K-10·K-11)와 커밋 전 전체 검증** [PASS] (2026-11-10)
  - 무엇을 했나: K-10·K-11 코드와 테스트를 검토하고 전체 검증을 했다.
  - 결과: 지적 없음. typecheck 오류 0, test 256/256 통과, clippy 경고 0, cargo test 22 통과.
  - 검증: tauri-leader 출력 파일 `%TEMP%\v07-C-15-*.txt`로 판정했다. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-15-report.md`.
  - 특이사항: 없음.
- **K-12·K-12-R1·K-12-R2 release 0.7.0 다시 빌드와 설치 파일 아이콘** (2026-11-10, coder)
  - 무엇을 했나: K-12에서 `npm.cmd run tauri build`로 release를 다시 빌드하고 `docs/BUILD.md`(4장 문장·표, 5장 걸린 시간과 아이콘 주의, 8장 `rust-dependencies.txt` 한 줄)를 고쳤다. 첫 빌드 exe 아이콘이 옛것이어서(Cargo가 `build.rs`를 다시 돌리지 않아 `resource.lib`가 옛것) `src-tauri/build.rs` 수정 시각만 갱신해 다시 빌드했다. 설치 파일 아이콘이 NSIS 기본이라 K-12-R1에서 `tauri.conf.json` `bundle.windows.nsis.installerIcon: "icons/icon.ico"`를 더하고 K-12-R2에서 다시 빌드하고 `docs/BUILD.md`(3장 설치 파일 아이콘 한 문장 포함)를 고쳤다.
  - 결과: 최종(K-12-R2) 성공, 전체 57.77초. NSIS 설치 파일 `workbench-tauri_0.7.0_x64-setup.exe` 6,066,132 바이트(LastWriteTime 2026-11-10 20:58:14), 앱 exe 16,832,512 바이트, 둘 다 ProductVersion·FileVersion 0.7.0. 아이콘은 `specs/v0.7/verify/ORDER-08/icon-setup-exe.png`·`icon-app-exe.png`·`icon-app-exe-16.png`로 뽑았고 설치 파일·앱 exe 모두 i-window(32px 중앙 픽셀 RGB 72,77,86 = 원본)다.
  - 검증: V1(빌드 결과 확인). 빌드 전 `workbench-tauri*` 프로세스 0개, 종료한 프로세스 없음, os error 5 없음. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-K-12-report.md`, `v07-K-12-R2-report.md`.
  - 특이사항: 아이콘만 바꿨을 때는 `build.rs` 수정 시각을 갱신해야 exe 아이콘이 바뀐다(`docs/BUILD.md` 5장). 설치 프로그램 화면의 사이드바·헤더 그림(`sidebarImage`·`headerImage`)은 범위 밖이다. 설치된 앱 바로 가기·제거 항목 아이콘은 설치해 보지 않아 미확인이다.
- **V3 측정(ORDER-08)** (2026-11-10, tauri-leader)
  - 무엇을 했나: 화면 차례 안에서 tauri-leader가 쟀다.
  - 결과: `specs/v0.7/verify/ORDER-08/`(`v3.json`, PNG). C-16 checker 판정 [MEASURED]: 9 PASS, 불일치 0, 측정 불가 0(측정 조건 창 1440×852, 100%, One Dark, Lilex 15px·글자 폭 9px·줄 높이 24px, debug exe(C-15 PASS 코드 + installerIcon 설정), 임시 APPDATA·WebView 폴더, CDP 합성 입력. 보고 `C:\Users\nampl\AppData\Local\Temp\v07-C-16-report.md`).
    - 기준 1(I-22): 창 아이콘 32×32, 앱 exe·설치 파일·16px 아이콘 모두 i-window.
    - 기준 2(I-23): 2줄 중간~3줄 중간 선택은 `2/4`(2·3줄 전체가 범위), 한 줄 안 선택은 `0/0`, 2줄 시작~4줄 열 1은 4줄을 빼고 `1/4`.
    - 기준 3(I-24): 여러 줄 선택 뒤 Ctrl+F는 입력란 `cat` 유지, 한 줄 선택은 `b1 ca`, 단어 안 커서는 `cat`.
    - 기준 4(I-25): Licenses에 Rust 제목과 `tauri 2.12.5`·`windows 0.62.2`·`webview2-com 0.39.1`.
    - 기준 5(I-26): 너비 200·320에서 `scrollWidth` = `clientWidth`(199/199, 319/319), `overflowX` hidden, 가로 스크롤바 0.
    - 기준 6(I-27): 감춤 글자 시작 50px(paddingLeft 50px), `Ctrl+=` 뒤 51.59px(줄 높이 25.59 + 26), 보임 content left 527(ORDER-03과 같음). 들여쓰기 선 상대 위치 [0, 36, 72] 유지, 확대 뒤 [0, 38.4, 76.8].
    - 기준 8(0.7.0 빌드): 위 K-12-R2 산출물.
    - 기준 10(I-28): 메뉴 줄 File·Edit·View·Help 넷, 탭 ←·→ 버튼과 `Ctrl+PageUp/PageDown` 동작.
    - 기준 11(I-29): Help는 About 하나. About 머리(아이콘 48px, workbench-tauri, Version 0.7.0), 기술 정보 다섯(WebView2 157.0.4341.42, OS Windows 11 x64), 주요 9개와 요약 줄, Copy("Copied", 클립보드에 머리 포함)·View All Licenses(About 닫고 Licenses 탭)·OK(기본 포커스).
  - 검증: V3. 판정은 C-16(checker)이 측정 파일만 읽어 했다.
  - 특이사항: About의 Rust crate 수 192는 `rust-dependencies.txt` 색인 줄 수와 같고, K-10 보고의 214는 틀린 수였다. 클립보드 덤프의 `?`는 PowerShell 콘솔 코드페이지 변환 때문이다(`—`·`©`).

## 사용자 요청 작업

없음
