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

## 사용자 요청 작업

없음
