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

### Phase 2 — asset protocol·CSP, 이미지·PDF·마크다운 이미지·SVG

- **W-03 루트 AGENTS.md 레포 규칙 v0.8, PLAN Phase 2 표(ORDER-02 3.7)** (2026-11-11, 커밋 `86f938a`)
  - 무엇을 했나: 루트 `AGENTS.md` 레포 규칙 절 10행을 "v0.8 구성은 v0.7 그대로다(core `specs/v0.8/PLAN.md` 운영)"로, 12행을 "workbench-core v0.8 ITEMS(I-1~I-10)"로 고쳤다. 버전·범위만 바꾸고 나머지 문장은 그대로다. `PLAN.md`에 "Phase 2 작업 카드" 표를 더했다.
  - 결과: 레포 규칙 절에 v0.7 문장이 남지 않았다. 남은 버전 표기(`core v0.5 D-7`·`core v0.6 D-9`, "v0.4까지는")는 결정 출처·이력이라 그대로다.
  - 검증: V0. `git diff AGENTS.md` 하나만 실행했다(보고 `C:\Users\nampl\AppData\Local\Temp\v08-W-03-report.md`).
  - 특이사항: ORDER-02 3.7이 "레포 규칙 절의 문장은 바꾸지 않는다"보다 앞선다(이 카드 한정).
- **K-02a asset protocol 켜기(M-8)** [BLOCKED] (2026-11-11, coder)
  - 무엇을 했나: `Cargo.toml` `protocol-asset` feature와 `tauri.conf.json` `assetProtocol`을 넣으려 했다.
  - 결과: `tauri.conf.json` `assetProtocol` 편집이 Claude Code auto mode 분류기에 "Security Weaken"으로 거부됐다. 우회하지 않고 leader-core에 `[BLOCKED]`를 보냈다. feature만 넣으면 tauri-build가 allowlist 불일치로 실패해 `Cargo.toml`·`Cargo.lock`을 되돌렸다(파일 변경 없음).
  - 검증: V1 미완료(`cargo check` 실패 뒤 되돌림). 보고 `C:\Users\nampl\AppData\Local\Temp\v08-K-02a-report.md`.
  - 특이사항: 없음.
- **K-02c asset protocol·로컬 자원 CSP(M-8)** (2026-11-11, coder, 커밋 `82c9547`)
  - 무엇을 했나: 사용자 지시로 leader-core가 tauri-coder를 manual mode로 바꾸고, 승인 창 둘을 사용자가 승인했다(2026-11-11). `Cargo.toml` tauri `features = ["protocol-asset"]`(Cargo.lock 새 crate `http-range 0.1.6` 하나), `tauri.conf.json` `assetProtocol` `{ "enable": true, "scope": ["**"] }`, csp·devCsp에 `img-src 'self' asset: http://asset.localhost; frame-src asset: http://asset.localhost`.
  - 결과: `script-src`·`connect-src`·`style-src`·`default-src`와 capability는 그대로다. scope `**`가 Windows 드라이브 경로(`C:\…`, `\\?\C:\…`, UNC)에 걸리는 것을 Tauri 2.12.5 소스(`scope/fs.rs`)와 glob 0.3.4 시험으로 확인했다. 닷파일도 막지 않는다.
  - 검증: V1. `cargo check` 통과, `cargo clippy -- -D warnings` 경고 없음. 보고 `C:\Users\nampl\AppData\Local\Temp\v08-K-02c-report.md`.
  - 특이사항: `**`는 모든 로컬 파일을 허용한다(M-8대로). 앞뒤 CSP 값 전체는 K-02c 보고에 있다.
- **K-02b I-6 SVG 편집·미리보기, I-7 셀 줄바꿈** (2026-11-11, coder, 커밋 `86f938a`)
  - 무엇을 했나:
    - I-6: `preview-kind.ts`에 `.svg`를 더했다(버튼·단축키·옆에 열기·메뉴·Lock Preview가 판별 한 곳을 따라온다). 새 `src/editor/svg.ts`가 DOMPurify SVG 프로필(`FORBID_TAGS` script·style·foreignObject, `FORBID_ATTR` style)로 정화하고, 호출 동안만 붙이는 `afterSanitizeAttributes` 훅이 `#id`가 아닌 `href`/`xlink:href`와 `url(`+비`#` 속성을 지운다. 정화한 `<svg>`를 DOM에 직접 넣는다(`img-src`에 `data:`/`blob:`이 없어서). 크기는 CSS `max-width:100%; height:auto`, `viewBox`만 있으면 그 너비를 `width` 속성으로 넣어 키우지 않는다. `<svg>`가 안 남으면 "Not a valid SVG". 위치 연계는 없다(M-1).
    - I-7: CSV·TSV 표에 `csv-table` 클래스, 셀 `white-space: pre-wrap`. 마크다운 표는 영향 없음.
  - 결과: CSP·의존성·Rust 변경 없음. 실제 DOM 정화는 node 테스트로 못 돌려 정책(`loadsExternal`·금지 목록)만 테스트했고, 정화 결과는 V3에서 확인했다.
  - 검증: V1. typecheck 통과, test 264 통과 / 1 실패(`tools/rust-licenses.test.mjs` I-25, 변경 전에도 실패. K-02d 때 267/267). 새 테스트 `svg.test.ts`. 보고 `C:\Users\nampl\AppData\Local\Temp\v08-K-02b-report.md`.
  - 특이사항: 없음.
- **K-02d I-8 이미지·I-9 PDF 보기, I-3 마크다운 로컬 이미지** (2026-11-11, coder, 커밋 `82c9547`)
  - 무엇을 했나:
    - I-8·I-9: `preview-kind.ts`에 `viewKind`(`png`·`jpg`·`jpeg`·`gif`·`webp`·`ico` → image, `pdf` → pdf, `previewKind`와 따로). `context.ts` `openFile` 맨 앞에서 `openView`로 가서 텍스트 읽기에 닿지 않는다. 보기 탭은 기존 tool 탭(저장·툴바·Show Source·Editor 키 문맥 없음, 확인 없이 닫기)이고 한 번 클릭 임시·두 번 클릭 고정 규칙 그대로다. 새 `src/shell/view-body.ts`가 `convertFileSrc`로 `<img>`(`max-width/max-height:100%`, `object-fit: contain`) 또는 PDF `<iframe>`(영역 채움)을 만든다.
    - I-3: `markdown.ts` `localImagePath`(스킴·`//host`는 null, 드라이브 글자는 로컬, `%XX` 풀기, `?`·`#` 제거, 마크다운 폴더 기준, `..`는 드라이브 위로 못 감, 폴더 제한 없음 M-8). `classifyLink`의 경로 풀기를 `resolveLocal`로 뽑아 같이 쓴다. 미리보기는 DOMPurify `RETURN_DOM_FRAGMENT`에서 로컬 `img`는 asset URL로 바꾸고 아니면 지운다. S-9 `shortcut:`과 CSS `img { display:none }`을 없앴다.
  - 결과: Rust·conf·CSP·의존성 변경 없음.
  - 검증: V1. typecheck 0, test 267/267(Cargo.lock 갱신으로 I-25도 통과), `cargo check` 통과. 새 테스트 `view-kind.test.ts`, `markdown.test.ts`에 `localImagePath` 1개. 보고 `C:\Users\nampl\AppData\Local\Temp\v08-K-02d-report.md`.
  - 특이사항(알아둘 것):
    - 보기 탭은 파일이 바뀌어도 다시 그리지 않는다(감시가 tool 탭을 건너뜀, `shortcut:` 주석). 닫고 다시 열면 맞다.
    - 보기 탭은 분할·복제가 없고 탭 메뉴에 Copy Path·Reveal이 없으며 경로 툴팁이 없다.
    - 이름 바꾸기 뒤 `<img>`/iframe의 `src`는 옛 경로 그대로다. 다시 열면 맞다.
    - PDF iframe 안에 포커스가 있으면 앱 단축키가 닿지 않는다(웹뷰 기본 동작).
- **C-03·C-04 checker 검토** [PASS] (2026-11-11)
  - 무엇을 했나: C-03은 K-02b·W-03, C-04는 K-02c·K-02d를 검토했다.
  - 결과: 지적 없음. 보안 설정이 `img-src`·`frame-src`·assetProtocol만 바뀐 것, 보기 탭이 텍스트 경로에 닿지 않는 것, 인터넷 이미지가 정화 단계에서 지워지는 것을 확인했다.
  - 검증: V1. checker는 tauri-leader가 남긴 출력 파일로 판정했다. 최종 test 267/267, typecheck 오류 0, clippy 경고 0, cargo test 통과. 보고 `C:\Users\nampl\AppData\Local\Temp\v08-C-03-report.md`, `C:\Users\nampl\AppData\Local\Temp\v08-C-04-report.md`.
  - 특이사항: 없음.
- **실측 3.1(a)(b)(c)와 V3 측정(ORDER-02)** (2026-11-11, tauri-leader)
  - 무엇을 했나: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`(ORDER-02) 차례 안에서 tauri-leader가 쟀다. 측정 조건: debug exe, 임시 APPDATA·WebView 폴더, 1920×1080 100%, 창 1440×852, One Dark, CDP 합성 입력.
  - 결과:
    - (a) 된다: asset URL을 `<iframe>`에 주면 WebView2 내장 PDF 뷰어로 뜬다. `<embed>`는 `object-src`에 막힌다.
    - (b) Tauri가 빌드할 때 `style-src`에 nonce를 붙여 `'unsafe-inline'`이 무시된다(임시 `--config` 프로브, 파일은 안 바꿈). `dangerousDisableAssetCspModification: ["style-src"]`면 인라인이 된다. 이때도 지시어 다섯(default·script·connect·style·img)은 온전하다(처음 tauri-leader가 헤더를 잘못 읽어 결함으로 알렸다가 원문 확인 뒤 바로잡음).
    - (c) 권한 없는 sandbox `srcdoc`에서는 asset 이미지가 안 뜨고(`allow-same-origin`이면 뜸), 로컬 CSS는 상속된 CSP `style-src`에 막힌다.
    - V3: `specs/v0.8/verify/ORDER-02/`(json 7, PNG). C-05 [MEASURED]: ORDER-02 완료 기준 #1·3·4·5·6·7·8·10 PASS(8), 불일치 0, 측정 불가 0(보고 `C:\Users\nampl\AppData\Local\Temp\v08-C-05-report.md`).
  - 검증: V3. part1의 SVG fill 변경 단계는 스크립트 오류(Ctrl+S 키 표 누락)로 part2에서 다시 쟀다.
  - 특이사항:
    - K-02a·K-02c 되돌리기 때 `Cargo.lock`이 CRLF로 다시 쓰여 `tools/rust-licenses.test.mjs`가 실패해 보였고, tauri-leader가 LF로 되돌렸다(내용 변화 없음).

### Phase 3 — HTML 미리보기

- **W-05 PLAN Phase 3 표** (2026-11-11, 커밋 `f62ed74`)
  - 무엇을 했나: `PLAN.md`에 "Phase 3 작업 카드" 표(K-03a·K-03b·C-06·C-07·W-05·W-06)를 Phase 2 표 형식으로 더했다.
  - 결과: 그 밖의 절은 그대로다.
  - 검증: V0. 명령 실행 없음(보고 `C:\Users\nampl\AppData\Local\Temp\v08-W-05-report.md`).
  - 특이사항: 없음.
- **K-03s 보안 설정(M-12·M-13, PLAN 표의 K-03a)** [BLOCKED] → 사용자 직접 적용 (2026-11-11, 커밋 `6d15017`)
  - 무엇을 했나: tauri-leader의 K-03a 카드 전송이 Claude Code auto mode에 막혀 `[BLOCKED]`가 됐고, leader-core가 처리해 사용자가 tauri-coder pane에서 직접 적용했다. `tauri.conf.json` `csp`·`devCsp` 끝에 `style-src 'self' 'unsafe-inline' asset: http://asset.localhost`, `img-src`에 `data:`(leader-core 결정, ORDER-04 ipynb 그림용 — ORDER-04에서 CSP를 다시 바꾸지 않는다), `app.security.dangerousDisableAssetCspModification: ["style-src"]`.
  - 결과: `default-src`·`script-src`·`connect-src`·`frame-src`, asset 범위(`**`), capability, Cargo·의존성은 그대로다. `csp`와 `devCsp`는 `connect-src`의 `ws://localhost:1420` 말고 같다. 앞뒤 값 전체는 K-03s 보고와 `C:\Users\nampl\AppData\Local\Temp\v08-C-07-conf-diff.txt`에 있다.
  - 검증: V0. JSON 파싱만 확인했다(보고 `C:\Users\nampl\AppData\Local\Temp\v08-K-03s-report.md`). 빌드 exe의 실제 헤더는 V3 #1에서 확인했다.
  - 특이사항: v0.8은 DECISIONS를 쓰지 않으므로 CSP 앞뒤 값과 이유는 `specs/v0.8/reports/ORDER-03.md`(tauri-leader가 씀)와 이 PROGRESS에 둔다. 대기는 약 40분이었다.
- **K-03b I-1 HTML 미리보기(M-1·M-5·M-7·M-8·M-12·M-13·I-1)** (2026-11-11, coder, 커밋 `f62ed74`)
  - 무엇을 했나:
    - `preview-kind.ts`에 `html` 종류(`.html`·`.htm`)를 더했다. 눈 버튼·Ctrl+Shift+V·Ctrl+K V·메뉴·트리 메뉴·Lock Preview는 판별 한 곳을 따라온다. 위치 연계는 없다(M-1).
    - `markdown-preview.ts`가 html 종류에서 iframe 하나(`sandbox="allow-same-origin"`, `srcdoc`)를 그린다. 고치면 기존 `changed` 디바운스로 srcdoc을 바꾸고 스크롤 위치를 되돌린다.
    - 새 `src/editor/html.ts` `htmlSrcdoc`: `<script>`·`<base>`·`<iframe>`·`<frame>`·`<frameset>`·`<embed>`·`<object>`·`<applet>`·meta refresh, `on*`·`ping` 속성, stylesheet가 아닌 `<link>`를 지운다. `javascript:`·`data:`·인터넷(`http:`·`https:`·`//host`)·빈 URL은 속성을 지우고, 로컬 경로는 HTML 파일 기준으로 풀어(`localImagePath` 재사용, 폴더 제한 없음 M-8) asset URL로 바꾼다. `<style>`·`style=`의 `@import`는 지우고 `url()`은 같은 규칙으로 바꾼다. 링크·폼 대상(`href`·`action`·`formaction`)은 지운다.
  - 결과: CSP·capability·Cargo·의존성 변경 없음. `csv.test.ts`·`tabs.test.ts`의 "`.html`은 미리보기 없음" 단언은 `.xhtml`로 바꿨다.
  - 검증: V1. typecheck 0, test 273/273. 새 테스트 `html.test.ts`(node에 DOM이 없어 URL 분류·CSS·srcset 등 순수 부분만). 보고 `C:\Users\nampl\AppData\Local\Temp\v08-K-03b-report.md`.
  - 특이사항: C-06 [PASS](아래).
- **C-06 checker 검토(K-03b)** [PASS] (2026-11-11)
  - 무엇을 했나: 판별·열기 경로, sandbox 단일 토큰과 srcdoc, 정화 목록과 요청 새는 경로(SVG `<image>`, `<input type=image>`, video·audio, CSS `image-set()`·`@font-face`), 경로 풀기, 마크다운 DOMPurify `style` 금지 불변을 봤다.
  - 결과: 지적 없음. `color-scheme: dark` 실제 화면은 V3·사용자 확인으로 넘겼다.
  - 검증: V1. typecheck 0, test 273/273(보고 `C:\Users\nampl\AppData\Local\Temp\v08-C-06-report.md`).
  - 특이사항: 없음.
- **K-03c `#id` 링크 지우기(I-1)** (2026-11-11, coder, 커밋 `6d15017`)
  - 무엇을 했나: V3에서 `<a href="#h">`를 누르면 iframe이 `http://tauri.localhost/#h`(앱 페이지)로 이동하는 결함이 나왔다(`verify/ORDER-03/v3-c6-r1.json`). srcdoc의 `#id`가 앱 URL 기준으로 풀리기 때문이다. 새 순수 함수 `navigates(tag, attr)`로 `<a>`·`<area>`의 `href`·`xlink:href`와 `action`·`formaction`을 `#id`까지 모두 지운다. `<use href="#id">` 같은 비탐색 참조는 남는다.
  - 결과: `src/editor/html.ts`·`html.test.ts`만 바뀌었다. 기대값을 바꾼 테스트는 없다.
  - 검증: V1. typecheck 0, test 274/274(보고 `C:\Users\nampl\AppData\Local\Temp\v08-K-03c-report.md`). 다시 재서 해결했다(`v3-c6.json`, frame url `about:srcdoc` 유지).
  - 특이사항: 없음.
- **V3 측정과 C-07 판정(ORDER-03)** [PASS] (2026-11-11, tauri-leader 측정, checker 판정)
  - 무엇을 했나: tauri-leader가 재고 C-07이 보안 diff, K-03c, 완료 기준 #1~#9를 판정했다. 결과는 `specs/v0.8/verify/ORDER-03/`(json 4, PNG 11, `c8-diff-bbox.txt`).
  - 결과: #1~#9 PASS.
    - #1 보안: 빌드 exe의 실제 CSP 헤더가 conf와 같고, sandbox는 `allow-same-origin` 하나다.
    - #2 열기: `.html`·`.htm` 둘 다 눈 버튼·Ctrl+Shift+V·Ctrl+K V·트리 메뉴·Lock Preview.
    - #3 로컬 자원: 하위·상위 CSS, `<style>`, `style=`, 이미지 4종(하위·상위·한글·공백·URL 인코딩)이 적용된다.
    - #4 JS 막기: 전역·title·script·`on*` 흔적 0, 콘솔 0건. #5 인터넷: 외부 요청 0건. #6 이동 막기: 상대·외부·앵커 링크와 폼 제출 뒤에도 `about:srcdoc`, meta refresh 0. #7 갱신: 글자·색이 바로 바뀐다.
    - #8 회귀: settings는 0px 차이, main·menu·about 차이는 트리의 `site` 폴더 펼침뿐이다. 마크다운 위치 연계·`style=` 제거, CSV 줄바꿈, SVG, 이미지는 그대로다. PDF 보기는 측정 스크립트에서 빠져 코드 확인(`view-body.ts`·`frame-src` 안 바뀜)으로 판정했다.
    - #9 테스트: typecheck 0, test 274/274.
  - 검증: V3·V1(보고 `C:\Users\nampl\AppData\Local\Temp\v08-C-07-report.md`).
  - 특이사항(한계·사용자 확인):
    - 링크된 CSS 파일 안의 상대 `url()`은 풀리지 않는다(`html.ts` `shortcut:`, M-7).
    - `.html-frame`의 `color-scheme: dark`로 HTML 기본 배경이 흰색이 아니라 어둡다. 맞는지는 사용자가 정한다.
    - iframe 안으로 키보드 포커스가 들어가면 앱 단축키가 닿지 않는다(탭 밖을 눌러야 돌아온다).
    - PDF 보기 화면은 Phase 5 사용자 확인 목록에 넣는다.
