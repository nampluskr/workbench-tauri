> 버전: v0.8.3 · 작성일: 2026-11-14 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. core I-n ↔ Phase ↔ tauri 카드 대응은 `ITEMS-MAP.md`에, 요구와 판정 방법은 core `specs/v0.8.3/ITEMS.md`와 카드 4절에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.8.3/reports/`에 있다.

# PROGRESS — workbench-tauri v0.8.3

## v0.8.3 시작

- 시작: 2026-11-14. core v0.8.2는 2026-11-14에 끝났다(tauri `origin/master` = `d8f9438`).
- 범위: v0.8.2까지 만든 것의 버그 수정과 UI 다듬기(core ITEMS I-1~I-17). core PLAN은 카드 5장이다(`ITEMS-MAP.md` 2장).
- 화면 측정은 ORDER-05에 모은다. ORDER-01~04는 단위 테스트·typecheck·코드 리뷰로 판정한다(core COMMON 8절).
- 보안 설정은 `d8f9438`과 같게 둔다(core COMMON 3절).

## Phase별 진행

### Phase 1 — ORDER-01 (I-2·I-13·I-15): v0.8.3 시작, 구분선 두께·색, 상태 표시줄 위치 표시

- **에이전트 환경** (2026-11-14, leader-core)
  - 무엇을 했나: v0.8.2 마지막 구성으로 워크스페이스 `workbench-tauri`(w15)에 띄웠다(사용자 2026-11-14 "tauri herdr 환경을 구성해 주세요", core ORDER-01 3.1). `tauri-leader` w15:p1, `tauri-writer` w15:p2, `tauri-coder` w15:p3, `tauri-checker` w15:p4. `tauri-analyst`는 띄우지 않았다.
  - 결과: `HERDR-SETUP.md` 1·2장. `herdr agent list` 근거는 ORDER-01 보고에 붙인다(tauri-leader).
  - 검증: 모델·effort는 `HERDR-SETUP.md` 1장 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.8.3 시작 문서와 루트 AGENTS.md** (2026-11-14, writer)
  - 무엇을 했나: `specs/v0.8.3/`에 HERDR-SETUP(v0.8.2판에서 버전·경로·패널 w15·leader-core `w14:p1`, 카드·보고 앞붙이 `v083-`, 보안 설정 기준 `d8f9438`·허락 카드 없음, 화면 검증은 ORDER-05에서만, 5.5에 서브 에이전트 허락 창 승인 규칙과 checker 카드에 core 내용 옮겨 적기)·ITEMS-MAP(core I-1~I-17 ↔ 그룹 ↔ core Phase ↔ tauri 카드, I-2·I-13·I-15 진행 중, 나머지 대기)·PROGRESS를 상태 "초안"으로 쓰고 `reports/`·`verify/`(`.gitkeep`)를 만들었다(ORDER-01 3.1). 루트 `AGENTS.md`의 제목 `(v0.8.3)`, 1장 현재 상태, 0장 경로, 카드·보고 앞붙이 `v083-`, "core ITEMS 우선"(v0.8.3, I-1~I-17)·"HERDR 구성은 core가 정한다"(v0.8.3 구성 = v0.8.2 마지막 구성, 근거 core v0.8.3 ORDER-01 3.1), 3A.4·8장 verify 경로를 고치고, 레포 규칙 절에 "서브 에이전트 허락 승인" 한 줄을 더했다. 다른 규칙은 그대로다.
  - 결과: v0.8.2처럼 tauri PLAN을 두지 않고 ITEMS-MAP이 Phase 대응을 맡는다. "HERDR 구성" 문장에서 v0.8.2의 `tauri-analyst` "I-27 분석만"을 "필요할 때만, 실험은 worktree에서만"으로 바꿨다.
  - 검증: V0. `git grep` 결과는 보고 `C:\Users\nampl\AppData\Local\Temp\v083-W-01-report.md`. 커밋 `3faa224`.
  - 특이사항: 없음.
- **K-01 앱 버전 0.8.3·I-2·I-13·I-15 (ORDER-01)** (2026-11-14, coder, 커밋 `8aa9073`)
  - 무엇을 했나:
    - 버전: `src-tauri/tauri.conf.json` 0.8.2 → 0.8.3, `src/shell/about.test.ts` 기대값 두 곳. `package.json`·`Cargo.toml`에는 앱 버전 자리가 없다. README·`docs/BUILD.md`는 ORDER-05에서 한다.
    - I-2: 세 선을 쓰는 CSS 자리에 `max(1px, …)`를 걸었다 — `.split-handle`(`--split-line` = `max(1px, var(--pane-split-line-thickness))`, 좌우 너비·상하 높이)·`.status-divider`(`src/app.css`), `.picker-divider`(`src/shell/picker.css`). `spec/metrics.ts` 값은 그대로다(`--picker-input-divider-width`는 선택기 입력 줄 테두리도 써서 값을 바꾸면 카드 밖 선까지 바뀜). 잡는 영역 `::before`는 그려지는 두께 `--split-line` 기준으로 가운데에 오고, `--pane-split-line-mouse-hitbox` 값은 그대로다.
    - I-13: 구분선은 한 요소로 두고 배경을 탭 줄 높이에서 끊긴 그라디언트로 그린다 — `linear-gradient(var(--pane-group-border) var(--tab-bar-height), var(--split-line-body) 0)`(위는 UI 색, 아래는 본문 구간 색). 끌기·두 번 누르기와 잡는 영역이 한 요소에 걸려 있어 쪼개지 않았다. 테마를 걸 때(`theme/apply.ts`) 영역 쌍 셋의 본문 색을 `:root` 변수 `--split-line-edit-edit`·`--split-line-edit-view`·`--split-line-view-view`로 내고, `Pane.tsx`가 좌우 구분선에 양쪽 창의 영역을 `data-areas`로 적어 CSS가 변수를 고른다. 색 규칙은 순수 함수 `splitLineColor`(`src/shell/split-line.ts`, 새로) — 본문 구간·좌우 분할·양쪽 문서 창·두 창의 `pane_group.border`(없으면 `border`)가 같을 때만 그 색, 나머지는 UI 색. 인라인 style 없음. 테마를 바꾸면 변수가, 활성 탭이 바뀌면 `data-areas`가 따라 바뀐다.
    - I-13 shortcut: 구분선 한쪽이 다시 나뉜 그룹(중첩 분할)이면 문서 창으로 치지 않아 UI 색이다(`Pane.tsx` `areaOf`의 `shortcut:` 주석). 그 선에도 테마 색이 필요하면 선에 닿는 pane을 모두 걷도록 넓힌다. checker는 "그 밖은 모두 UI 테마 색" 범위에 맞다고 판정했다.
    - I-15: 미리보기 탭(마크다운·ipynb·HTML) 위치를 `{줄}`만(`src/workspace/context.ts`), 편집 탭·도구 탭(`toolPosition`)은 그대로. `src/editor/filetypes.json`에 "Jupyter Notebook"(`ipynb`) 한 건만 더했다(편집·미리보기 탭 같은 경로). Outline은 `Outline.tsx:180` `Number(position?.split(":")[0])`라 새 글자 `"8"`에서도 같은 줄 8을 낸다(미리보기 위치를 `:`로 읽는 곳은 이 한 곳, `src` grep).
  - 결과: 보안 설정 diff는 `tauri.conf.json` 버전 한 줄뿐(`git diff d8f9438 -- src-tauri/tauri.conf.json src-tauri/capabilities`). 새 테스트 `src/shell/split-line.test.ts`(경우 여섯 + 테마 변경). 기존 `status.test.ts`·`filetype.test.ts`를 새 값으로 고쳤다.
  - 검증: V1 + V0. `node --test src/shell/split-line.test.ts src/shell/about.test.ts src/shell/status.test.ts src/editor/filetype.test.ts` 9/9, `npm.cmd run typecheck` 0(출력 `C:\Users\nampl\AppData\Local\Temp\v083-K-01-tests.txt`, 보고 `...\v083-K-01-report.md`). Rust를 건드리지 않아 `cargo`는 돌리지 않았다. 전체 테스트는 ORDER-05.
  - 특이사항: 없음.
- **C-01 checker 리뷰(K-01)** [PASS] (2026-11-14, checker)
  - 무엇을 했나: K-01 diff를 리뷰했다(버전 자리, I-2 세 선의 `max(1px, …)`와 잡는 영역 가운데 계산, I-13 색 규칙·`areaOf`가 도구 탭·Welcome에서 null인지·`--tab-bar-height`가 실제 탭 줄 높이 변수와 같은지·`pane_group.border` 대체, 중첩 분할 shortcut, I-15 위치 글자·`.ipynb` 한 건·Outline 읽기, 보안 설정 diff).
  - 결과: PASS. Settings는 별도 창이라 pane 도구 탭이 아니고, `settings.json` 파일 탭은 문서 편집 탭이라 `"edit"`로 치는 것이 맞다고 봤다.
  - 검증: V0 코드 리뷰(앱 실행·테스트 재실행 없음, coder 출력 근거)(보고 `C:\Users\nampl\AppData\Local\Temp\v083-C-01-report.md`).
  - 특이사항: 없음.
- **화면으로 잴 것 (ORDER-05로 넘김, core COMMON 8절)**
  - About에 0.8.3.
  - I-2: UI 글자 15px, 좌우 분할 50:50에서 창 너비 짝수·홀수일 때 pane 구분선 1px, 상하 분할도 같음. 상태 표시줄 왼쪽 선·테마 선택기 가로선이 보임.
  - I-13: 같은 라이트 미리보기 둘 사이 본문 구간이 라이트 테두리 색, 다크 편집 + 라이트 미리보기 사이는 UI 색(픽셀 색). 탭 줄 구간 경계가 탭 줄 높이와 맞음.
  - I-15: 마크다운·ipynb·HTML 미리보기와 편집 탭의 위치 글자, Outline 지금 위치 표시.
- **상태**: 충족(leader-core 판정 6/6)·push 끝 `dbd269e`.

### Phase 2 — ORDER-02 (I-9·I-10·I-11·I-12): 본문 왼쪽 여백, 탭 줄 화살표 간격, 줄 번호 글꼴과 시작선

- **K-02 I-9·I-10·I-11·I-12 (ORDER-02)** (2026-11-14, coder, 커밋 `056d606`)
  - 무엇을 했나:
    - I-9: `markdown_preview.left_margin` 64 → 44(미리보기 글자 14px 기준 비례), 바깥 14 그대로라 본문 시작 58px. 줄 번호 끈 에디터(`extensions.ts` `bodyStart`)와 HTML 미리보기(`html.ts:154`)가 같은 두 변수를 따른다. ipynb 실행 번호 `.nb-count`는 `width` → `min-width`(긴 번호는 왼쪽 바깥 여백으로 자라고 본문은 안 움직임).
    - I-9 카드 밖 값: `markdown_preview.notebook_count_gap` 7px(미리보기 글자 14px 기준 비례, `[n]`과 코드 칸 사이). 전의 코드 블록 안쪽 여백 10.5px이면 `[10000]`(50.6px)이 58px를 넘어 3px 잘린다. 7px이면 `[999]` 43.1 ≤ 44, `[10000]` 57.6 ≤ 58로 안 잘린다. ITEMS "약 8px"보다 1px 작다(8이면 `[10000]`이 0.6px 넘음). `.nb-count`에만 쓴다. tauri가 고른 값으로 보고한다.
    - I-10: `tab.end_buttons_area.gap` 4 → 0, `padding_x` 6 → 4. 버튼·경계선 값은 그대로.
    - I-11: 설정 키 `editor_line_number_font_size`(Editor 분류 "Line Number Font Size", 기본 12). 키 이름은 에디터 보기 설정의 `editor_` 접두사와 글자 크기 키의 `_font_size` 끝을 따랐다. 그리는 크기 = min(설정, `buffer_font_size`) × (Ctrl+= 크기 ÷ `buffer_font_size`). 파일 값 8 미만·숫자 아님은 무효(기본 12), 에디터 글자보다 큰 파일 값은 그대로 두고 그릴 때 맞춘다. Settings 화면 ±·입력은 8~에디터 글자 크기로 맞춰 저장. 밑선은 번호 칸에 에디터 글자 크기의 빈 인라인 상자(`::before`, 폭 0)로 본문과 맞춘다. 미리보기 코드 블록 줄 번호는 안 건드림.
    - I-12: `.cm-gutters` `min-width` = 본문 여백. 번호 칸 = 왼쪽 10px + 자릿수×1ch(최소 4) + 오른쪽 최소 8px(`editor.gutter.padding_right`), 남는 폭은 빈 채움 칸 `gutter({class:"cm-gutter-fill"})`(flex-grow 1, 활성 줄에만 요소)이 가져간다. `.cm-line`의 하강 여백 `--editor-gutter-margin`과 그 canvas 측정은 지웠다.
    - I-12 최소 여백 8px: 기본 설정에서 다섯 자리(10+36+8=54px)는 58px 안이라 밀리지 않고 여섯 자리부터 밀린다(10만 줄 61.2px). ITEMS의 "다섯 자리 이상"과 다르다 — 다섯 자리부터 밀리려면 최소 여백이 12px를 넘어야 한다. 보고에서 결정을 묻는다(미정).
  - 결과: 고친 기존 테스트 — `model.test.ts` Editor 검색 키 목록과 "font size" 검색 개수 6 → 7(새 행), `metrics.test.ts`의 `--editor-gutter-margin` 단언 → 줄 번호 글꼴 변수 단언. 시작선 테스트는 `metrics.test.ts` 안에 넣었고 CSS 배치를 실행하지 않고 `applyMetrics`가 내는 변수 값으로 네 경우(기본 58/58, 줄 번호 16 58/58, 미리보기 글자 18 74.57/74.57, 10만 줄 58/61.2)를 계산한다 — 값 변경은 잡지만 CSS 규칙이 틀린 것은 못 잡는다(화면은 ORDER-05). 보안 설정 diff는 `tauri.conf.json` 버전 한 줄뿐(`git diff d8f9438`). 미리보기 코드 글꼴을 100% 넘게 키우면 `[10000]`이 58px를 넘을 수 있다(범위 밖).
  - 검증: V1 + V0. `node --test src/spec/metrics.test.ts src/settings/model.test.ts src/editor/extensions.test.ts src/editor/indent-guides.test.ts` 27/27, `npm.cmd run typecheck` 0(출력 `C:\Users\nampl\AppData\Local\Temp\v083-K-02-tests.txt`, 보고 `...\v083-K-02-report.md`). Rust를 건드리지 않아 `cargo`는 돌리지 않았다. 앱은 띄우지 않았다.
  - 특이사항: 없음.
- **C-02 checker 리뷰(K-02)** [PASS] (2026-11-14, checker)
  - 무엇을 했나: K-02 diff를 리뷰했다(I-9 58px와 `.nb-count`, I-10 값, I-11 검증·맞춤·Ctrl+= 비율·밑선 `::before`, I-12 `min-width`·채움 칸이 활성 줄 모양을 안 바꾸는지, 지운 `--editor-gutter-margin`·canvas 측정의 남은 호출부, `notebook_count_gap` 필요성과 영향 범위, 바꾼 테스트 기대값의 정당성, 금지 사항).
  - 결과: PASS. `--editor-gutter-margin`은 `src/`에 남지 않았다(지난 버전 측정 스크립트에만). `notebook_count_gap`은 `.nb-count`에만 쓰여 다른 화면에 영향이 없다.
  - 검증: V0 코드 리뷰(앱 실행·테스트 재실행 없음, coder 출력 근거)(보고 `C:\Users\nampl\AppData\Local\Temp\v083-C-02-report.md`).
  - 특이사항: 없음.
- **화면으로 잴 것 (ORDER-05로 넘김, core COMMON 8절)**
  - I-9: 미리보기 셋(마크다운·ipynb·HTML) 본문 시작 58px, ipynb `[999]`(44px 안)·`[10000]`(58px 안, 안 잘림).
  - I-10: 탭 줄 양쪽 버튼 영역 너비(간격 0, 여백 4).
  - I-11: 줄 번호 12px와 본문 글자와 같은 밑선.
  - I-12: 편집 탭(줄 번호 켬·끔)과 미리보기 탭의 글자 시작선 58px, 활성 줄 배경이 번호 칸~채움 칸~본문 사이에 끊기지 않는지.
- **상태**: 충족(leader-core 판정 5/5)·push 끝 `7445d30`. 미정 둘(I-12 최소 여백 8px — 여섯 자리부터 밀림, I-9 `[n]` 틈 `notebook_count_gap` 7px)은 leader-core가 받아들였다.

### Phase 3 — ORDER-03 (I-8·I-4·I-5·I-3): 이름 통일, Sidebar 단축키, 상태 표시줄 툴팁, Folder Sidebar 안 토글 버튼

- **K-03 I-8·I-4·I-5·I-3 (ORDER-03)** (2026-11-14, coder, 커밋 `a35322e`)
  - 무엇을 했나:
    - I-8: core ORDER-03 3.1 표의 화면 글자를 모두 새 글자로 바꿨다(Open Folder, RECENT FOLDERS, Tree 루트 우클릭 "Open Folder..."·"Close Folder", "Search files...", "Reveal in Tree Sidebar", View 메뉴 "Toggle Tree Sidebar", 빈 폴더 "No Folder"). View 메뉴에 "Toggle Outline Sidebar"(`outline_panel::Toggle`)를 더했다. **화면 글자만 바꿨다** — 명령 ID(`project_panel::*`·`workspace::ToggleLeftDock` 등)·keymap context `ProjectPanel`·상태 파일 키(`state-file.ts` `recent`)·CSS 클래스(`.project-panel`·`.dock-left`)는 그대로다(`app.css`·`state-file.ts`는 주석 한 줄씩만).
    - I-4: `builtin.ts` Workspace에서 `ctrl-b`·`ctrl-shift-e`·`ctrl-alt-j`·`ctrl-alt-;`를 없애고 `ctrl-alt-1`(Folder)·`ctrl-alt-2`(Tree)·`ctrl-alt-3`(Outline)을 더했다. `Pane`의 `ctrl-shift-e`(Reveal, `tab-menu.ts:22`)는 그대로. View 메뉴에서 "Focus Folder Sidebar"·"Project Panel"을 뺐다. **포커스 명령 둘(`project_panel::ToggleFocus`·`multi_workspace::FocusWorkspaceSidebar`)은 `panels.ts:67,69`에 명령으로 남아** 사용자 `keymap.json`으로 묶을 수 있다. 상태 표시줄 Tree 버튼은 늘 `workspace::ToggleLeftDock`(`status.ts:31`).
    - I-5: 상태 표시줄 세 버튼 글자 "Toggle Folder"·"Toggle Tree"·"Toggle Outline"(열림·닫힘 같음), 툴팁은 `IconButton` 기본(글자 + 키). 아이콘·`toggled`·순서·구분선 그대로.
    - I-3: Folder Sidebar 바닥 줄 왼쪽 토글 버튼과 두 줄 툴팁을 없앴다. 빈 `.group.grow`를 남겨 Open Folder는 오른쪽 끝 그대로(CSS 안 고침). 이 버튼만 쓰던 `toggleSidebar` import와 `IconButton`의 `tips` prop·`Tip` import를 정리했다.
  - I-4 겹침 확인(tauri가 고른 것):
    - 기본 키 겹침 없음 — 모든 context의 기본 키에서 `ctrl-alt-<숫자>`는 새 셋뿐이고, WebView2 브라우저 단축키·Windows 전역 키에도 없다.
    - AltGr(= Ctrl+Alt)가 **ASCII 밖 글자**를 내는 자판(독일어 AltGr+2 `²`·AltGr+3 `³` 등)에서는 편집기에서 글자 대신 Sidebar가 여닫힌다(`keymap/engine.ts:32-34`가 ASCII 밖 글자를 물리 키로 읽음). ASCII 글자를 내는 자판(스페인어·프랑스어)과 한국어·미국 자판은 문제없다. 옛 `ctrl-alt-j`·`ctrl-alt-;`·지금 있는 `ctrl-alt-l`도 같은 성질이다.
    - `<input>`에 포커스가 있으면 Ctrl+Alt 조합은 AltGr 글자 입력으로 넘겨(`keymap/keyboard.ts:81`) 새 키가 동작하지 않는다. 옛 `Ctrl+B`는 입력 칸(Folder 찾기, Tree 이름 바꾸기, 파일 찾기, Settings)에서도 Tree를 여닫았다. 편집기(CodeMirror)에서는 동작한다.
    - 둘 다 고치지 않고 보고에 미정으로 올렸다(판단은 leader-core).
  - 결과: 새 테스트 없음(카드 지시). 기존 테스트 여덟(`app-menus`·`status`·`tab-menu`·`recent`·keymap `builtin`·`display`·`user`·`keyboard`)을 새 값으로 고쳤다 — `builtin.test.ts`는 v0.4 고정 표에서 없앤 넷을 빼고 더한 셋을 넣어 대조, `keyboard.test.ts`는 안 묶인 `ctrl-b` 예시를 `ctrl-w`로(같은 규칙). `git grep`으로 `src/`·`index.html`에 옛 화면 글자 0건. 보안 설정 diff는 `tauri.conf.json` 버전 한 줄뿐(`git diff d8f9438`), 이 카드의 `src-tauri` diff 없음.
  - 검증: V1 + V0. `node --test` 9개 파일 32/32, `npm.cmd run typecheck` 0(출력 `C:\Users\nampl\AppData\Local\Temp\v083-K-03-tests.txt`, 보고 `...\v083-K-03-report.md`). Rust를 건드리지 않아 `cargo`는 돌리지 않았다. 앱은 띄우지 않았다.
  - 특이사항: I-4 겹침 둘(AltGr 자판, 입력 칸) 미정.
- **C-03 checker 리뷰(K-03)** [PASS] (2026-11-14, checker)
  - 무엇을 했나: K-03 diff 20개 파일을 리뷰했다(I-8 글자 대조, I-4 없앤 넷·더한 셋·`Pane` `ctrl-shift-e`·포커스 명령 등록, I-5 세 글자와 툴팁 키, I-3 바닥 줄 flex 배치, 옛 글자 남은 곳, `tips` prop 제거 영향, 바꾼 테스트 기대값, 명령 ID·상태 키·CSS 클래스 그대로인지, 다음 Phase 선작업 없음).
  - 결과: PASS. 화면 글자로 남은 옛 문자열 0건, `tips=` 사용처 0건.
  - 검증: V0 코드 리뷰(앱 실행·테스트 재실행 없음, coder 출력 근거)(보고 `C:\Users\nampl\AppData\Local\Temp\v083-C-03-report.md`).
  - 특이사항: 없음.
- **화면으로 잴 것 (ORDER-05로 넘김, core ORDER-03 6절)**
  - I-8: Welcome "RECENT FOLDERS", View 메뉴, Tree 루트·탭 우클릭 메뉴, 파일 찾기 창, 폴더 없을 때 "No Folder".
  - I-4: `Ctrl+Alt+1·2·3`이 세 Sidebar를 여닫음, `Ctrl+B`·`Ctrl+Alt+J`가 아무 일 안 함, 탭 영역 `Ctrl+Shift+E`는 Reveal.
  - I-5: 세 버튼에 마우스를 올린 툴팁(시안 02절과 대조).
  - I-3: Folder Sidebar 바닥 줄(시안 01절과 대조), Open Folder가 오른쪽 끝 그대로인지.
- **상태**: 충족(leader-core 판정 7/7)·push 끝 `c809a75`. 미정 둘(I-4 AltGr 자판, 입력 칸에서 `Ctrl+Alt+1·2·3`)은 leader-core가 지금 규칙 그대로 받아들였다(사용자 확인 때 본다).

### Phase 4 — ORDER-04 (I-6·I-7·I-16·I-17): Folder Sidebar 정렬·우클릭 메뉴, 세 Sidebar 제목 줄, Panel Layout

- **K-04 I-6·I-7·I-16·I-17 (ORDER-04)** (2026-11-14, coder, 커밋 `5bc2015`)
  - 무엇을 했나:
    - I-6: 정렬 아이콘 둘(`sort_name_asc`·`sort_name_desc`, 시안 statusbar 03절 C안 path, `Icon.tsx`)을 Folder Sidebar 바닥 줄 Open Folder 앞에 두었다(툴팁 "Sort by Name (A to Z)"·"(Z to A)", 키 없음). 정렬·판정은 `folders.ts` `sortFolders`·`isSorted`(이름 = `folderLabel`, 비교 = `naturalCmp`), 누르면 `store.ts` `sortFolderList`가 한 번 정렬해 상태 파일 `folders` 순서로 저장한다. 고른 정렬은 저장하지 않고, 눌린 칸은 목록 순서에서 매번 계산한다(끌기·새 폴더로 어긋나면 풀림). 눌린 칸 CSS 선택자를 `:is(.status-bar, .sidebar-footer)`로 넓혔다(값 그대로).
    - I-7: 폴더 줄 메뉴(Close / Close Others(1개면 흐림) / Close All / Rename / Copy Path / Reveal in File Explorer)와 빈 곳 메뉴(Open Folder... / Close All / Sort by Name 둘 / Sort by Date Added 둘, 정렬 줄은 `isSorted`로 체크)를 `Sidebar.tsx`에 더했다. 키 표시 없음(`run`만). **`removeFolder`가 닫았는지 boolean을 돌려준다**(취소 = false). `closeFolders` → `closing.ts` `closeEach`가 목록 순서로 하나씩 닫고 첫 취소에서 멈춘다. 추가 순은 `added_at` 글자 비교.
    - I-16: 공통 부품 **`src/shell/SidebarTitle.tsx`**(Outline 제목 줄을 옮김, 클래스 `.outline-header` 그대로)를 세 Sidebar가 같이 쓴다 — Folder "Folder"(`threads_sidebar_left_open`), Tree "Tree · 폴더 이름"(폴더 없으면 "Tree", `file_tree`), Outline "Outline · 파일 이름"(`list_tree`). 마우스 올림에 배경 `ghost-element-hover`·글자 `--text`·×(툴팁 없음). × = `toggleSidebar`/`toggleDock`/`toggleOutline`, 다른 곳 클릭 = 그 목록에 포커스. mousedown `preventDefault`로 직전 포커스 기억(`sidebarFrom`·`panelFrom`)을 그대로 둔다. Tree에 제목 줄이 들어가 **`.dock-left`를 세로 flex로** 바꿨다.
    - I-17: View 메뉴 Panel Layout을 "Left Sidebars"·"Right Sidebars"(지금 쪽 체크) 두 줄로 바꾸고 "Custom" 줄·너비 되돌리기를 지웠다(**`src/shell/layout.ts` 지움**). **명령 ID: Left = 옛 `workspace::UseClassicLayout` 그대로(이제 왼쪽으로만, Tree 열기·너비 되돌리기 없음), Right = 새 `workspace::UseRightSidebars`.** 기본 키맵에는 둘 다 키가 없다. 상태 파일 **`windows[0].panel_layout`** = `"left"`|`"right"`(`"right"`가 아니면 Left, 알 수 없는 키 보존). **Right 배치는 CSS `order`로만**(DOM 순서 그대로): 탭·문서 │ Outline │ Tree, Folder Sidebar는 늘 왼쪽 끝. Right에서 경계선·손잡이는 왼쪽, 끌 때 너비는 오른쪽 끝에서 잰다(`dock.ts`). 열림·닫힘·너비·상태 표시줄은 그대로.
  - 결과: 새 테스트 — `workspace.test.ts` 정렬·판정(Rename 이름, 대소문자, `v2`<`v10`, 한글·영문, `added_at`, 끌기·새 폴더 뒤, 같은 이름)과 Panel Layout 저장·읽기·키 보존, `closing.test.ts` 여러 폴더 닫기 순서·취소에서 멈춤. 고친 테스트 — `app-menus.test.ts` Panel Layout 두 줄·체크·명령 ID. 메뉴 목록·제목 글자는 테스트 없이 코드 근거. 보안 설정 diff는 `tauri.conf.json` 버전 한 줄뿐(`git diff d8f9438`), `src-tauri` diff 없음. I-17 확인 요청(경계선 색 I-13, 제목 줄 I-16, 탭 끌어 놓기·pane 분할, Zen Mode 창 끌기)은 코드로 걸리는 것 없음.
  - 검증: V1 + V0. `node --test` 6개 파일 46/46, `npm.cmd run typecheck` 0(출력 `C:\Users\nampl\AppData\Local\Temp\v083-K-04-tests.txt`, 보고 `...\v083-K-04-report.md`). Rust를 건드리지 않아 `cargo`는 돌리지 않았다. 앱은 띄우지 않았다.
  - 특이사항: 미정 하나 — **폴더 0·1개(또는 이름이 모두 같음)일 때 정렬 표시 둘 다 켜짐**(아이콘 둘 눌린 칸, 메뉴 정렬 줄 모두 체크). ITEMS 글 그대로 두었고, 2개부터만 표시하려면 `isSorted` 한 줄. 그 밖에 tauri가 고른 것: Tree 제목의 폴더 이름은 `folderLabel`(Rename 이름 우선), 빈 곳 메뉴 "Close All"은 폴더가 없어도 흐리게 하지 않음.
- **C-04 checker 리뷰(K-04)** [PASS] (2026-11-14, checker)
  - 무엇을 했나: K-04 diff를 리뷰했다(I-6 아이콘·정렬·눌린 칸 계산, I-7 두 메뉴 줄 순서·흐림·순차 닫기, I-16 공통 부품·올림·×·포커스 흐름, I-17 메뉴·명령 ID·상태 파일·`order` 배치·손잡이 너비 계산, `layout.ts` 남은 참조, `removeFolder` 호출부 다섯, `.dock-left` 세로 flex 영향, 금지 사항, 테스트).
  - 결과: PASS. `layout.ts`·`resetDockWidth`·`isClassicLayout` 남은 참조 0건, `removeFolder` 호출부는 반환값을 무시하거나 `closeEach`로만 써서 영향 없음. **CSS `order` 배치는 Tab·스크린 리더 순서가 DOM 순서라 화면 순서와 다르지만** 편집기는 Sidebar 전환을 Tab이 아닌 단축키로 하고, DOM을 옮기면 에디터·스크롤 상태를 잃으므로 타당하다고 판정했다. `.dock-left` 세로 flex에서 `.project-panel`이 제목 줄 아래 남은 높이를 차지하고 스크롤된다고 코드로 봤다. 폴더 0·1개 정렬 표시는 결함이 아닌 정책 선택으로 사용자 확인에 올렸다.
  - 검증: V0 코드 리뷰(앱 실행·테스트 재실행 없음, coder 출력 근거)(보고 `C:\Users\nampl\AppData\Local\Temp\v083-C-04-report.md`).
  - 특이사항: 없음.
- **화면으로 잴 것 (ORDER-05로 넘김, core COMMON 8절)**
  - I-6: 정렬 아이콘 네 상태(오름·내림 × 눌림·안 눌림)와 누른 뒤 순서.
  - I-7: 두 우클릭 메뉴 줄·흐림·정렬 체크.
  - I-16: 세 제목 줄 평소·올림·×·제목 누른 뒤 포커스, **Tree 목록이 제목 줄 아래에서 끝까지 차고 스크롤되는지**.
  - I-17: Right Sidebars 배치·손잡이 끌기·다시 켠 뒤 남음, **Right에서 Outline 손잡이(왼쪽 가장자리, 폭의 절반)가 본문 세로 스크롤바·탭 줄 끝 버튼과 겹치는 정도**.
- **상태**: 충족(leader-core 판정 5/5)·push 끝 `d17ea8a`. 미정 하나(폴더 0·1개일 때 정렬 표시 둘 다 켜짐)는 leader-core가 항목 글 그대로 받아들였다.

### Phase 5 — ORDER-05 (I-1·I-14 + 0.8.3 release·화면 측정): 스크롤바 자동 숨김, Zen Mode, release 빌드, 이 버전 화면 측정

이 버전의 마지막 Phase다.

- **K-05 I-1·I-14 (ORDER-05)** (2026-11-14, coder, 커밋 `8505c9f`)
  - 무엇을 했나:
    - I-1: 세로 스크롤바 자동 숨김 `src/shell/scrollbar-hide.ts`(새). 영역은 목록을 두지 않고 이벤트 대상에서 위로 올라가며 세로로 넘치고 `overflow-y`가 auto/scroll인 첫 요소로 찾는다(모든 범위 영역에 같은 코드). 입력(마우스 움직임·휠·키)이 난 영역은 `data-scrollbar="on"`(바로 보임), 대기 시간 뒤 `"off"`(0.3초에 흐려짐, `src/spec/metrics.ts` `scrollbar.hide.fade_duration`, ITEMS 값). 세로 홈·손잡이 색을 등록한 속성 `--scrollbar-opacity`로 섞고 자리 너비는 그대로(`src/app.css`). 가로 스크롤바·모서리·HTML 미리보기 프레임 안은 손대지 않는다. 스크롤바 자리 위 마우스는 숨지 않는다. 프로그램이 굴린 스크롤만으로는 보이지 않는다. 설정 `scrollbar_hide_delay`(UI 분류, 정수 0~10, 기본 3, 0 = 늘 보임, `src/settings/model.ts`·`load.ts`). 선택기 목록의 hover 때만 보이는 스크롤바 예외를 지웠다. shortcut: 보이는 영역 안에 다시 세로 스크롤 영역이 있으면 함께 보인다(`app.css` 주석).
    - I-14: 명령 `workspace::ToggleZenMode`·키 `f11`(`src/keymap/builtin.ts:84`). 상태는 저장 안 하는 신호(`src/shell/panels.ts:75`). `.workspace.zen`에서 `.title-bar`·`.status-bar`만 `display: none`(`src/App.tsx:53`, `src/app.css:455`), 창 API 호출 없음. 창 끌기는 Zen일 때만 `.tab-bar`·`.tab-bar-edge` 둘·`.tab-bar-drop`에 `data-tauri-drag-region`(이미 허용된 `start-dragging`·`internal-toggle-maximize`). 입력 칸에 포커스가 있어도 F11만 넘긴다(`src/keymap/keyboard.ts:87`). Rust `caption.rs`에 숨김 상태와 명령 `caption_set_visible`(Zen 동안 창 버튼 구멍을 없애고 그리지 않으며 `HTMAXBUTTON`을 답하지 않음).
  - 결과: 새 테스트 `scrollbar-hide.test.ts`(영역별, 대기 시간, 0 = 늘 보임, 스크롤바 자리 위 마우스), `model.test.ts`에 `scrollbar_hide_delay`, `builtin.test.ts`에 `f11`. 보안 설정 diff는 `tauri.conf.json` 버전 한 줄뿐(`git diff d8f9438`), `capabilities` 변화 없음.
  - 검증: V1 + V0. `node --test` 5개 파일 29/29, `npm.cmd run typecheck` 0, `cargo check`·`cargo clippy -- -D warnings` 경고 0(출력 `C:\Users\nampl\AppData\Local\Temp\v083-K-05-tests.txt`, 보고 `...\v083-K-05-report.md`). 앱은 띄우지 않았다.
  - 특이사항: I-14 확인 요청 다섯은 ORDER-05 보고 "tauri가 고른 것"에 적었다. HTML 미리보기 프레임 안 F11은 먹지 않는다(`FRAME_KEYS`, 보안 설정이라 넓히지 않음) — 미정.
- **C-05 checker 리뷰(K-05)와 전체 테스트** [PASS] (2026-11-14, checker)
  - 무엇을 했나: K-05 diff를 리뷰했다(I-1 영역 찾기·흐려짐 CSS·타이머, Zen 끌기 자리, `caption.rs` 숨김과 `caption_set_visible`, 보안 설정 diff). release 빌드 전 전체 테스트·typecheck를 이 버전에서 한 번 돌렸다.
  - 결과: PASS. `npm.cmd run test` 346/346, `npm.cmd run typecheck` 0. 보안 설정·의존성 변경 없음.
  - 검증: V0 리뷰 + 전체 테스트 1회(보고 `C:\Users\nampl\AppData\Local\Temp\v083-C-05-report.md`).
  - 특이사항: 없음.
- **[BUILD-OK]** (2026-11-14, leader-core): release 빌드 허락. 빌드 직전 workbench-tauri 프로세스 0개.
- **K-06 0.8.3 release 빌드·README·BUILD** (2026-11-14, coder, 커밋 `a12fc4e`)
  - 무엇을 했나: `npm.cmd run tauri build` 한 번(exit 0, 77초). `docs/BUILD.md` 머리 "고친 날"에 0.8.3 줄과 "4C. 0.8.3 결과 파일" 절(4A·4B절 그대로), README 실행 절(설치 파일 이름 0.8.3, 4C절 링크).
  - 결과: 설치 파일 `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.3_x64-setup.exe` 10,590,767 B, `src-tauri\target\release\workbench-tauri.exe` 21,558,272 B, 둘 다 2026-11-14 16:27:56, ProductVersion·FileVersion 0.8.3. 0.8.2 대비 설치 파일 +1,423 B, exe +26,112 B. 경고는 기존과 같은 종류(Vite 500 kB 넘는 chunk 3개, `[EVAL]` 2건), Rust 경고 없음.
  - 검증: V0 + release 빌드 한 번(빌드 요약 `%TEMP%\v083-K-06-build.txt`, 보고 `...\v083-K-06-report.md`).
  - 특이사항: 없음.
- **C-06 화면 측정 프로브** (2026-11-14, checker)
  - 무엇을 했나: `specs/v0.8.3/verify/ORDER-05/probe.mjs`를 썼다(`specs/v0.8.2/verify/ORDER-07/probe.mjs`·`tools/cdp-lib.mjs`·`tools/win-input.ps1`·`tools/png.mjs` 재사용). C-06은 O1~O4·R·M 섹션, C-06-R1은 S(I-1, S-1~S-7)·Z(I-14, Z-1~Z-7) 섹션과 시안 대조 `05 Zen Mode`, C-06-R2는 1차 실행에서 막힌 곳(`closeAll` 탭 닫기, 섹션 사이 상태 격리·복원 `endSession`·`restartApp`, O4-3 선택자 `SyntaxError`, R-1 판정)을 고쳤다.
  - 결과: 앱을 띄우지 않고 `node --check`만 통과.
  - 검증: V0(보고 `C:\Users\nampl\AppData\Local\Temp\v083-C-06-report.md`·`v083-C-06-R1-report.md`·`v083-C-06-R2-report.md`).
  - 특이사항: 없음.
- **[SCREEN-OK]~[SCREEN-DONE] 화면 측정 네 번** (2026-11-14, tauri-leader)
  - 무엇을 했나: release exe 사본 `%TEMP%\v083-exe083\workbench-tauri.exe`, 격리 APPDATA·WebView2, 창 1440×852, 1920×1080 100%, One Light(시안 대조만 One Dark도)에서 프로브를 네 번 돌렸다(1차 전부, 2·3·4차는 남은 줄만). 결과 `specs/v0.8.3/verify/ORDER-05/out/result.json`(줄마다 마지막 실행 값), 로그 `%TEMP%\v083-probe-run1.log`~`run4.log`. 끝난 뒤 남은 측정 앱 하나(1차, PID 25916, 경로 확인)만 닫았다 — 지금 workbench-tauri 프로세스 0개.
  - 2·3차 사이 tauri-leader가 프로브 세 군데를 고쳤다(앱 코드 아님): JS 식을 선택자로 읽던 `pt`, 탭 닫기를 Ctrl+W로, Zen 켜짐 확인 가드(가드가 없을 때 2차 Z-4가 보통 모드에서 창 닫기 단추를 눌러 측정 앱을 닫았다).
  - 결과(ORDER-05 보고 "화면 측정 표"):
    - 통과: O1-1 About 0.8.3, O1-2 세 선 ≥ 1px(창 1440·1441), O1-4 위치 글자·ipynb 종류·Outline, O2-1 실행 번호(`[999]`·`[10000]` 안 잘림), O2-2 탭 줄 버튼 영역(계산 대조 — 프로브가 UI 글자 16px에서 재 53px, 15px이면 49.7px), O2-3 줄 번호 12px, O3-2 Ctrl+Alt+1·2·3·옛 키 무변화·Reveal, O3-3 세 버튼 툴팁, O3-4 Folder 바닥 줄 토글 없음, O4-1 정렬 아이콘 네 상태, O4-2 두 우클릭 메뉴, O4-3 세 제목 줄 ×·포커스, S-3 가로 스크롤바 그대로, Z-1 DOM(두 줄만 숨김), Z-2 맨 위·아래 hover에 안 나타남, Z-4 Zen 동안 오른쪽 위 클릭이 최대화 안 함.
    - 문제 1(확인 필요): R-2 — Right Sidebars에서 Outline 손잡이 잡는 영역이 탭 줄 끝 버튼 영역과 약 2px 겹침, 스크롤바와 0px. 사각형 값이 기록되지 않아 근거가 약하다.
    - 측정 불가: 프로브 선택자·상태 문제 — O1-3·R-1(I-13 색, 같은 테마 미리보기 둘을 못 만듦), O2-1 본문 시작·O2-4(I-9·I-12 시작선, 글자 시작이 아닌 상자 왼쪽을 잼), O2-3 기준선(숨은 자리 잡기 요소와 비교), O3-1(I-8 화면 글자, 폴더 없는 세션에서 Tree 줄 누름 실패), R-3(I-16 Tree 스크롤, 내용 요소를 잼 — 캡처에는 스크롤바가 dock 안에 있음), S-4~S-7(탭 정리 실패), Z-5(편집기 요소 못 찾음). 입력 도구 문제 — `win-input` 전경 창 가져오기 실패·창을 잃음: O4-4(Right Sidebars 손잡이·다시 켠 뒤, 배치 자체는 캡처에 보임), S-1·S-2, Z-1 창 사각형, Z-3, Z-6·Z-7.
    - 시안 대조: 산출물만 `specs/v0.8.3/verify/ORDER-05/out/mockup-pairs.md`(6쌍, 대조 판정 없음). 앱 쪽 캡처는 장면 상태를 다 만들지 못한 것이 많다.
  - 검증: V3(측정 결과 위 파일).
  - 특이사항: 측정 불가 줄은 사용자 확인 때 직접 본다(leader-core 지시).
- **ORDER-05 보고** (2026-11-14, tauri-leader·writer): `specs/v0.8.3/reports/ORDER-05.md`. 완료 기준 6개 — I-1 충족(테스트)·화면 일부, I-14 충족(코드·화면 일부), release 충족, 앞 Phase 화면 일부, 시안 대조 산출물만, 회귀 충족. 미정 셋: HTML 미리보기 프레임 안 F11(프레임 키 허용 목록, 보안 설정), 화면 측정 불가 줄(사용자 확인 때), R-2 손잡이 겹침.
- **상태**: ORDER-05 보고 보냄, leader-core `[PUSH]` 대기.
