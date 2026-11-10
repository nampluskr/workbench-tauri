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

## 사용자 요청 작업

없음
