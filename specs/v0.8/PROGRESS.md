> 버전: v0.8 · 작성일: 2026-11-10 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서와 core I-n 대응은 `PLAN.md`에, 요구와 판정 방법은 core `specs/v0.8/ITEMS.md`와 카드 4절에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.8/reports/`에 있다.

# PROGRESS — workbench-tauri v0.8

## Phase별 진행

### Phase 1 — v0.8 시작, 미리보기 공통과 CSV·TSV 표

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: workspace `wY`(workbench-tauri)에 탭 넷을 에이전트 이름으로 두고(`wY:t1` tauri-leader, `wY:t2` tauri-writer, `wY:t3` tauri-coder, `wY:t4` tauri-checker) 서브 에이전트 셋(`tauri-writer` `wY:p2`, `tauri-coder` `wY:p3`, `tauri-checker` `wY:p4`)을 `HERDR-SETUP.md` 1장 명령으로 띄웠다. control은 `wY:p1`이다.
  - 결과: worktree 없음. `herdr agent list`·`herdr tab list` 근거는 ORDER-01 보고에 붙인다(tauri-leader).
  - 검증: 모델·effort는 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.8 문서와 루트 AGENTS.md** (2026-11-10, 커밋 `4ceea09`)
  - 무엇을 했나: `specs/v0.8/`에 PLAN(core I-n 대응)·HERDR-SETUP·PROGRESS를 상태 "초안"으로 쓰고, `reports/`·`verify/` 폴더(`.gitkeep`)를 만들었다(ORDER-01 3.1). 루트 `AGENTS.md`의 레포 규칙 절 아래에서 제목 `(v0.8)`, 0장 경로, 카드 파일 이름 `v08-`, 1장 현재 상태("v0.8 진행 중"), 3장 core 리더 이름(`leader-core`), 3A.4·8장의 `specs/v0.8/verify` 경로를 고쳤다.
  - 결과: HERDR-SETUP은 v0.7판에서 레이아웃(`wY`, 탭 이름 = 에이전트 이름), 카드·보고 파일 이름(`v08-`), 경로, core 리더 이름(`leader-core`), core 근거(core v0.8 `orders/COMMON.md`)만 바꾸고 구성은 그대로다. 레포 규칙 절의 문장은 그대로다.
  - 검증: V0. 문서만 바뀌어 `git grep -n core-leader -- . ':!spec' ':!specs/v0.[1-7]'` 하나만 실행했다. `AGENTS.md` 결과 없음. 남은 결과는 모두 `specs/v0.4`~`v0.7` 아래(pathspec이 폴더 아래 파일과 맞지 않음)이고, 새 `specs/v0.8/` 파일은 Grep으로 0건이다(보고 `C:\Users\nampl\AppData\Local\Temp\v08-W-01-report.md`).
  - 특이사항: 루트 `AGENTS.md` 레포 규칙 절 10·12행의 v0.7 문장은 카드대로 그대로 두었다(바꿀지는 leader-core가 정한다).
- **K-01 미리보기 공통·I-10·I-7·버전 0.8.0(ORDER-01, M-2·M-5·M-6·M-7·I-10·I-7)** (2026-11-10, coder, 커밋 `5c5ee72`)
  - 무엇을 했나:
    - 판별: 미리보기 대상 판별을 `src/editor/preview-kind.ts` 한 곳(`previewKind`·`hasPreview`, 대상 `.md`·`.markdown`·`.csv`·`.tsv`)에 두었다. `Pane.tsx`·`tree-menu.ts`·`tab-menu.ts`·`AppMenu.tsx`·`workspace/tabs.ts`·`editor/markdown.ts`(`classifyLink`)의 `md|markdown` 정규식을 지우고 이 판별을 쓴다. 키맵 문맥(`keymap/builtin.ts`)은 `extension == md`에서 대상 확장자 넷으로 넓혔다(v0.7까지 `.markdown`에서 `Ctrl+Shift+V`가 안 먹던 것도 먹는다). `editor/view-options.ts`의 `md|markdown`은 줄바꿈 판별이라 그대로 두었다.
    - 열기·이름: 눈 버튼·트리·탭·View 메뉴 이름을 "Open Preview"·"Open Preview to the Side"로 바꿨다. 명령 ID와 "Lock Preview"는 그대로다. 상태 표시줄 종류는 미리보기 탭도 `filetype(tab.path)`다("Markdown" 고정 삭제).
    - I-10: Lock Preview 버튼을 `eye`로, 켜짐은 기존 `aria-pressed` 파란 스타일. 안 쓰는 `markdown`·`markdown_box` 아이콘 이름과 `IconButton.toggledName`을 지웠다(SVG 파일은 둠).
    - I-7: `src/editor/csv.ts` `parseCsv`(따옴표 필드·`""`·CRLF/CR/LF·빈 셀)·`csvTable`(첫 줄 머리글, 데이터 1,000행, "Showing first 1,000 of N rows"). 표는 DOM+`textContent`로만 만들고 기존 마크다운 표 CSS를 쓴다(새 CSS 없음). 원본이 바뀌면 기존 디바운스로 다시 그리고, 위치 연계는 마크다운에만 남는다(M-1).
    - 버전: `src-tauri/tauri.conf.json` 0.8.0, `src/shell/about.test.ts`, `docs/BUILD.md` 112행. `docs/BUILD.md` 79·81·85·86·94행의 0.7.0은 0.7.0 빌드 기록이라 그대로다.
  - 결과(tauri가 고른 것):
    - 빈 줄은 건너뛴다(`csv.ts` `shortcut:` 주석). 한 열짜리 파일의 빈 값 행이 사라지는 한계가 있다.
    - CSV 상태 표시줄 종류는 "Plain Text"다. 앱에 CSV 언어 항목이 없어 편집 탭과 같다.
    - `opensMarkdownPreview` → `opensPreview`로 이름만 바꿨다. 탭 플래그 `markdown`(미리보기 탭)과 `preview`(임시 탭)는 섞지 않고 `tabs.ts` 주석에 뜻을 적었다.
    - 미리보기 요소의 내부 이름(`markdown-preview`, 키맵 문맥 `MarkdownPreview` 등)은 그대로다. 모든 미리보기 탭이 같이 쓴다.
    - `builtin.test.ts`: 비교 대상 R-1 표가 지난 버전(v0.4) PROGRESS에 있어 고칠 수 없으므로, 테스트에서 미리보기 문맥 한 줄만 `extension == md`로 되돌려 비교하는 정규식 한 줄을 더했다.
  - 검증: V1. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 262/262 통과(새 테스트 3: `csv.test.ts`의 I-7 둘, M-5 사용자 키맵 하나). 보고 `C:\Users\nampl\AppData\Local\Temp\v08-K-01-report.md`.
  - 특이사항: 의존성·CSP·capability·설정 항목 변경 없음.
- **C-01 checker 검토(W-01·K-01)** [PASS] (2026-11-10)
  - 무엇을 했나: K-01 변경 파일 23개와 W-01 문서를 카드의 볼 것 11항목으로 검토했다.
  - 결과: 지적 없음. typecheck 오류 0, test 262 통과.
  - 검증: V1. checker는 명령을 실행하지 않고 tauri-leader가 남긴 출력 파일(`%TEMP%\v08-C-01-*.txt`: diff·typecheck·test)로 판정했다(`HERDR-SETUP.md` 5.5). 보고 `C:\Users\nampl\AppData\Local\Temp\v08-C-01-report.md`.
  - 특이사항: 없음.
- **V3 측정(ORDER-01)** (2026-11-10, tauri-leader)
  - 무엇을 했나: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`(ORDER-01) 차례 안에서 tauri-leader가 쟀다. 측정 조건: debug exe(K-01 커밋), 임시 APPDATA·WebView 폴더, 1920×1080 100%, 창 1440×852, One Dark, CDP 합성 입력.
  - 결과: `specs/v0.8/verify/ORDER-01/`(`v3.json`, `v3-b.json`, PNG 11). C-02 checker 판정 [MEASURED]: ORDER-01 완료 기준 #2·3·4·5·7·8·9·10·11·13 모두 PASS(10), 불일치 0, 측정 불가 0(보고 `C:\Users\nampl\AppData\Local\Temp\v08-C-02-report.md`).
  - 검증: V3. 2회차(`v3-b.json`)는 1회차에서 편집한 `data.csv`가 닫히지 않아 탭이 쌓여 #4·#5 값이 오염됐기 때문에 그 둘만 다시 쟀다.
  - 특이사항:
    - 셀 안 줄바꿈은 파싱은 맞지만 HTML 공백 규칙으로 화면에서 한 칸 공백으로 보인다(`c10-big-head.png` 오른쪽 "line1 line2").
    - CSV 미리보기 탭 아이콘은 마크다운 미리보기와 같은 그림이다.
    - 둘 다 판정 기준 밖이라 그대로 두고 ORDER-01 보고 "미정"에 적는다.
