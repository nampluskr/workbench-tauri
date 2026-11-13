[DONE] ORDER-09 tauri

> 카드: core `specs/v0.8.1/orders/ORDER-09.md` · 비교 기준 `33ea4a0` · 작성 2026-11-13 · tauri-leader
> 측정은 모두 release exe(0.8.1, `56c3b66` 빌드, 1920×1080 100%, 창 1440×852)로, 화면 차례(`[SCREEN-OK] ORDER-09`) 안에서 했다. 측정 로그는 회차별로 `specs/v0.8.1/verify/ORDER-09/leader-probe/runs/`에 있다.

## 완료 기준

| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 I-16 | 맨 클릭·키보드 커서 행은 테두리만, Ctrl·Shift·열린 파일 행은 배경, Zed 나란히 | 충족 | `verify/ORDER-09/new/v3-new.json` `step_i16_tree_selection`: One Dark 폴더 맨 클릭 bg `rgba(0,0,0,0)`·테두리 `rgb(71,103,158)`(=`--border-focused`), ↓ 커서 행 같음, Ctrl 클릭 행·열린 파일 행 bg `rgb(69,74,86)`(=`--ghost-element-selected`), 트리 밖 포커스 때 커서 테두리 투명. One Light 폴더 맨 클릭 bg 투명·테두리 `rgb(125,130,232)`. Zed(`zed -n` 새 창, 사용자 테마 그대로=밝은 테마): `new/i16-side-1-folder.png`(테두리만)·`-2-cursor-down`·`-3-ctrl-click`(배경+테두리)·`-4-active-outside`, `zed-i16.json`. 한계: 나란히 그림의 tauri 쪽은 끝 상태 한 장이라 단계별 tauri 값은 JSON으로 본다 |
| 2 I-17 | Paste 뒤 Undo·Redo, 할 것 없으면 비활성, 옮기기 뒤 Undo·Redo | 충족 | `regress/v3-o2.json` `i17_menu_undo_redo`: 처음 `Paste Ctrl-V`·`Undo Ctrl-Z`·`Redo Ctrl-Shift-Z` 모두 비활성(Paste 바로 뒤), 옮긴 뒤 Undo 활성·Redo 비활성 → 메뉴 Undo로 디스크 되돌아감(`srcRestored`) → Redo 활성 → 메뉴 Redo로 다시 옮겨짐. leader probe `leader-probe/probe-i17.json`(처음 메뉴 같음) |
| 3 I-18 | 키보드로 Outline 들어가 ↑↓←→ Enter, 포커스 테두리, 커서 따라가기가 포커스를 안 뺏음 | 충족(미리보기 탭 Enter는 코드 확인) | `step_i18_outline_keyboard`: 목록 포커스, 선택 행 테두리 `rgb(71,103,158)`=트리 포커스 테두리, ↓ Install→Windows, ←·→로 접고 펼침, Enter → 편집기 `### Windows` 줄·편집기 포커스, 편집기 커서를 바꿔도 고른 행 `Path`·`activeElement` `outline-list` 그대로. 미리보기 탭 Enter는 클릭과 같은 `go`(`src/shell/Outline.tsx`)라 코드 확인, 클릭 이동은 회귀 #15 `c7_preview` PASS |
| 4 I-19 | 코드 블록 1px `border.variant`, 테마 21개 | 충족 | `step_i19_code_block_borders`: 21/21 테마 `1px solid` = 그 테마 `--border-variant`. macOS Classic Light 테두리 `rgb(224,224,224)`·블록 `rgb(249,249,249)`·본문 `rgb(255,255,255)`, Catppuccin Latte `rgb(231,226,245)`/`rgb(230,233,239)`/`rgb(239,241,245)`, Mocha `rgb(44,41,61)`/`rgb(24,24,37)`/`rgb(30,30,46)`, Gruvbox Light Soft `rgb(221,204,167)`/`rgb(236,220,179)`/`rgb(242,229,188)`. `new/i19-code-block-border.png` |
| 5 I-20 | ipynb 출력·traceback 배경 없음, 코드 셀 음영 | 충족 | `step_i20_ipynb_output_bg`: `pre.nb-output`·`pre.nb-traceback` bg `rgba(0,0,0,0)`·테두리 0, 코드 셀 `.code-block` `rgb(47,52,62)`. `new/i20-ipynb-output.png` |
| 6 I-21 | 느슨한 목록 끝 → 문단 50±1, 붙은 목록·제목 그대로 | 충족 | `step_i21_loose_list_spacing`: 잉크 간격 **51**(Zed 50), 여백 마지막 항목 p 16 + ul 12 = 28. 처음 빌드(`9a27d12`)에서는 ul 16(특이도에 짐, 합 32) → K-09e(`56c3b66`)로 고침. 제목·항목 간격은 회귀 REP-I8 h2 `22px`·li `4px` PASS. 붙은 목록은 바뀐 규칙(`:has(> li:last-child > p:last-child)`)에 걸리지 않음(코드 확인, 따로 재지 않음) |
| 7 I-22 | 목차 링크(한글·같은 제목 둘) 스크롤, 없는 id 아무 일 없음, 슬러그 테스트 | 충족 | `step_i22_heading_slug_links`: `#한글-제목`·`#usage`·`#usage-1` 누르면 제목 top=미리보기 top(65, 차 0), 없는 id scrollTop 0 그대로. ipynb: leader probe `leader-probe/probe-i22.json` `Cell Target` 1775→65(측정 스크립트 fixture는 짧아 스크롤 불가로 실패 — 코드 문제 아님). 슬러그 테스트 `src/editor/markdown.test.ts`(한글·기호·같은 제목 셋·이미 있는 id) |
| 8 I-23 | 16·20·24px에서 비례, 16px 그대로, 설명 문구 | 충족 | `step_i23_list_gap_scaling`: 항목 사이 4/5/6px, 항목 안 줄 6/7.5/9px, 문단 값 16/8 그대로. 16px 값 = ORDER-06(4·6). 문구: "Controls the space between list items, in pixels at a 16px preview font. Scales with the preview font." / "Controls the space between wrapped lines of a list item, in pixels at a 16px preview font. Scales with the preview font." |
| 8b I-24 | 누른 링크 여섯 종류, 클릭 없는 길 다섯, 격리 시험 그대로, 보안 앞뒤 값 | 충족 | `verify/ORDER-09/links/v3-links.json`·`SUMMARY.md` 24/24: 로컬 `other.html`·`sub/page.html` → `Preview other.html`·`Preview page.html`, `.md` → `Preview doc.md`, `.txt`·`.csv` → 편집 탭, `https://example.com` → 기본 브라우저(브라우저 프로세스 22→29), `file:`·`javascript:` → 아무 일 없음, `#id` → 페이지 안 스크롤, Tab+Enter → `Preview other.html`. 클릭 없는 길 다섯(`location.href`·`window.open`·만든 클릭·위조 `postMessage`·스크립트 `<meta refresh>`) 탭 수 그대로·호출 0. 프로토타입 바꿔치기 뒤 사용자 클릭은 따라가고 만든 클릭은 막힘, DOM·스크립트에서 토큰 못 찾음. ORDER-07·08 fixture 다섯(`navigate`·`refresh`·`loopnav`·`isolation`·`network`) 클릭 없이 결과 같음. 보안 앞뒤 값은 아래 "tauri가 고른 것" |
| 9 빌드 | 0.8.1 설치 파일, BUILD.md, ProductVersion | 충족 | `docs/BUILD.md` 4A절: `workbench-tauri_0.8.1_x64-setup.exe` 10,579,833 B(2026-11-13 17:27:30), exe 21,521,920 B, ProductVersion·FileVersion 0.8.1, 앞 0.8.1 10,579,907 B 대비 −74 B. 빌드 직전 release exe 잠김 없음(사용자 앱 PID 31852는 `%TEMP%\v081-app\` 복사본, 건드리지 않음). 7절 무한 루프 줄을 ORDER-08 결과로 고침 |
| 10 전체 회귀 | 3.10 범위를 release exe로, 나 16줄은 USER-TEST 번호로 | 충족(#8만 측정 불가) | 아래 "회귀 표", `verify/ORDER-09/regress/regression-summary.md` |
| 11 테스트 | 새 로직 테스트, 기존 모두 통과, typecheck 0, cargo test·clippy 0 | 충족 | `npm test` 313/313, typecheck 0(C-19 checker), `cargo test` 24 통과, clippy 0(leader). 새 테스트: 슬러그(`markdown.test.ts`), 간격 비례(`metrics.test.ts`), Outline 키(`outline.test.ts`), I-24 링크 분류·머리 스크립트(`html.test.ts`) |

### 회귀 표 (release exe `56c3b66`, `regress/regression-summary.md`, 로그 `leader-probe/runs/v081-ORDER-09-regress-run3~5.txt`)

| USER-TEST | 줄 | 결과 | 값 |
|---|---|---|---|
| #4 | 끌어 옮기기·대상 표시·Ctrl 복사 | PASS | dst=[a.txt, keep.txt], 대상 bg `rgba(131,137,148,0.5)`, 가장자리 스크롤 |
| #5 | 자기 자신·하위 막기, 같은 이름 알림 | PASS | 대상 행 0, "Failed to move `dst\a.txt` to `dst2\a.txt`. A file or folder already exists there." |
| #6 | 열린 탭이 따라감 | PASS | tip `…\dst\doc.md`·`…\dst\proj\f.md`, dirty 유지 |
| #7 | pane에 놓기 | PASS | 본문·탭 바·오른쪽 가장자리·Lock 켬 놓기 |
| #8 | 탐색기에서 놓기(OLE) | **측정 불가** | 도우미 창이 커서 아래로 오지 않아(`helper is not under the cursor; nothing sent`) 실제 OLE 끌기를 보내지 못함. 이 카드는 놓기 경로(Rust·`drop` 처리)를 바꾸지 않았다. 근거는 ORDER-02 debug `v3-c7.json` 그대로 |
| #9 | Ctrl+Z·Ctrl+Shift+Z | PASS | 되돌림·다시 함, 편집기 포커스 Ctrl+Z는 트리를 건드리지 않음 |
| #10 | Lock Preview 임시 탭·고정 | PASS | 임시 탭 이탤릭, 더블클릭·가운데 클릭 고정 |
| #11 | Search 탭 제목=검색어·결과 유지 | PASS | 제목 m1·long-file-name-1·data, Extensions 탭 1 |
| #13 | 상태 표시줄 순서·Outline 여닫기 | PASS | [Close Left Dock, \|, Outline, \|, Search, Lock Preview], 폭 240, 리사이즈 299 |
| #15 | 종류별 Outline·누르면 이동 | PASS | md 계층, ipynb, 코드, 편집기 `## Usage` |
| #16 | 커서 따라감·편집 갱신 | PASS | 추가·되돌리기 반영, 접힌 부모 선택, big.md 스크롤 |
| #18 | 글꼴 다섯·D2Coding 한글 | PASS | pre 글꼴 반영, D2Coding 글리프 |
| #19 | 코드 블록 음영·머리 줄·복사 | PASS | 블록≠본문, `python`, 클립보드 원문 같음 |
| #20 | Licenses 글꼴 넷 | PASS | JetBrains Mono·Hack·Ubuntu Mono·D2Coding |
| #23 | 찾기 옵션·종류별 | PASS | apple 1/6, 한글 1/2, Esc 닫힘 |
| #25 | 스타일 없는 HTML 테마색·링크·인터넷 | PASS | 글자 `rgb(220,224,229)`·iframe `rgb(40,44,51)`, network 막힘, `#bottom` scrollY 1272 |
| REP I-1~I-13 | 대표 동작(ORDER-07 #11 범위) | PASS | About "Version 0.8.1", I-1 14px, I-2 `rgb(169,175,188)`, I-4 [C A, m m, f f], I-5 이탤릭 임시 탭, I-6 탭 2, I-7 `ran`, I-8 22px/4px, I-9 찾기 바, I-10 JetBrains Mono, I-11 `rgb(47,52,62)`≠`rgb(40,44,51)`, I-12 python, I-13 848<853, 위치 연계 `## End`, 미리보기 종류(csv·svg·ipynb·img·pdf). I-3은 #4 끌기로 판정(아래 미정) |
| I-14 | 무한 루프 알림·복구·거짓 알림 | PASS | 알림 6.8초(그때 전경=앱), 앱 응답, 루프 닫고 새 HTML 그려짐(3·4회차), 보통 페이지 거짓 알림 없음(전경=앱 확인) |
| I-15 | WebRTC 유출 | PASS | LAN STUN 수신 0 |
| I-16~I-24 | 이 카드 | 위 표 | — |

## 검증

- `npm.cmd run typecheck` 0, `npm.cmd run test` 313/313(C-19), `cargo test --manifest-path src-tauri/Cargo.toml` 24 통과, `cargo clippy … -- -D warnings` 0(leader, checker 쪽은 `.cargo-build-lock` 권한으로 막힘).
- `npm.cmd run tauri build` 두 번(K-09d `9a27d12`, K-09d-R1 `56c3b66`), 둘 다 exit 0, Rust 경고 0, Vite 경고는 기존과 같음.
- 화면 측정(release exe): `verify/ORDER-09/measure-new.mjs`(I-16~I-23), `measure-links.mjs`(I-24), `run-regression.mjs`(회귀), `zed-i16.mjs`(Zed 캡처), leader probe `probe-i22.mjs`·`probe-i17.mjs`. 캡처: `new/i16-tree-*.png`, `new/i16-side-*.png`, `new/zed-i16-*.png`, `new/i19-code-block-border.png`, `new/i20-ipynb-output.png`, `new/i21-loose-list-spacing.png`, `regress/*.png`.
- 측정 스크립트는 처음 모든 단계가 `data-path` 선택자 이스케이프 오류로 죽어 checker가 여섯 번 고쳤다(C-20~C-20-R6). 판정은 마지막 회차 값과, 같은 exe에서 PASS였던 앞 회차(로그 보존)로 했다.

## 지운 것·더한 것·하지 않은 것

- 더함: I-24 프레임 두 번째 머리 스크립트와 토큰 검사, 링크 분류 `classifyHtmlLink`, Outline 키 처리(`outlineStep`, 트리 함수 재사용), 슬러그 `headingSlugs`, `scaledListGap`, 트리 메뉴 Undo·Redo, CSS 규칙 몇 줄.
- 하지 않음: 새 의존성, Rust 변경, 앱 CSP·capability·sandbox·프레임 CSP 다른 지시 변경. Zed의 "마우스 누르는 동안 포커스 테두리 숨김"(카드 밖).
- 남은 위험: I-24는 사용자가 누른 링크의 대상을 페이지가 `mousedown`에서 바꾸거나 화면 전체 투명 링크로 정할 수 있다(보통 브라우저와 같은 한계, 갈 수 있는 곳은 로컬 파일 탭과 http(s) 브라우저뿐). 페이지 스크립트가 `a.href`를 읽으면 `…#`이 나온다(원래 값은 `data-preview-href`). 측정 중 사용자 기본 브라우저에 example.com 탭이 몇 번 열렸다(프로세스는 끝내지 않음).

## tauri가 고른 것

- I-19: 테두리는 머리 줄+코드를 감싼 상자 하나에, 머리 줄과 코드 사이 선은 두지 않음(같은 음영 상자의 한 부분). 값 `markdown_preview.code_block.border` = `prem(1)`(16px에서 1px, core I-19 값).
- I-21: 끝 여백을 "문단 16 + 항목 4 + 목록 12 = 32"로 쌓지 않고 마지막 항목 문단 16 + 목록 끝 L-103 list_gap 12 = 28로 했다(32는 앱에서 잉크 약 55가 됨 — #6a의 5px 차이가 남아 있어서). 측정 51.
- I-16: 트리에 포커스가 없을 때 커서 행은 테두리 투명·배경 없음(Zed `show_focused_border` 거짓과 같음), marked·열린 파일 행 배경은 포커스와 상관없이 남음. Sidebar(폴더 목록)는 이미 같은 규칙이라 바꾸지 않음.
- I-17: 단축키 표시는 다른 항목처럼 명령 ID(`project_panel::Undo`·`project_panel::Redo`)로 → `Ctrl-Z`·`Ctrl-Shift-Z`.
- I-18: ←→는 기존 `menu` 문맥의 `menu::SelectParent`·`menu::SelectChild`를 쓴다(내장 키맵 표는 바꾸지 않음). 행 클릭은 지금처럼 그 위치로 가며 포커스가 편집기·미리보기로 간다 — 키보드는 Tab이나 목록 빈 곳 클릭으로 들어간다.
- I-23: 설명 문구 위 표(테스트 `keys("font size")` 5개를 지키려고 "font size" 대신 "font").
- I-24 구별 방법: WebView2 `IsUserInitiated`(의존성 `webview2-com` 직접 추가가 필요)는 쓰지 않고, 프레임 머리 스크립트가 페이지 스크립트보다 먼저 내장 함수를 저장하고, 자기 `<script>`를 지운 뒤, `window` 캡처 단계 `click`에서 `e.isTrusted`일 때만 미리보기마다 만든 `crypto.randomUUID()` 토큰과 함께 부모에 알린다. 부모는 `e.source===frame.contentWindow`이고 토큰이 같은 것만 받는다. 링크(`#id` 말고)는 모두 `preventDefault`라 프레임은 다른 페이지로 가지 않는다.
- I-24 보안 앞뒤 값:
  - 앞: 링크 `href`는 `#id` 말고 지움. 머리 스크립트 한 개(WebRTC 지우기, previewReady, ping/pong, 스크롤).
  - 뒤: 링크 `href="#"` + `data-preview-href="<원래 값>"`. 머리에 스크립트 하나 더: `(()=>{const T="<token>",U=parent,A=Reflect.apply,P=U.postMessage,E=Element.prototype,S=String.prototype,C=E.closest,G=E.getAttribute,M=S.trim,W=S.startsWith,D=Event.prototype.preventDefault,O=Object.getOwnPropertyDescriptor,R=O(Event.prototype,"target").get,K=O(MouseEvent.prototype,"altKey").get;document.currentScript.remove();addEventListener("click",e=>{…if(e.isTrusted)A(P,U,[{previewLink:{token:T,href:h,alt:…}},"*"])},true)})()`(전문 `src/editor/html.ts` `headStart`).
  - 그대로: 앱 CSP, capability, `PREVIEW_CSP`, `sandbox="allow-scripts"`, Rust 이동 처리, `recordRecovery`, ping/pong, WebRTC 지우기, `<meta refresh>` 지우기.

## 바꾼 파일

- 코드 `9a27d12`: `src/app.css`, `src/editor/html.ts`·`html.test.ts`, `src/editor/markdown.ts`·`markdown.test.ts`, `src/settings/model.ts`, `src/shell/Outline.tsx`, `src/shell/markdown-preview.ts`, `src/shell/tree-menu.ts`, `src/spec/metrics.ts`·`metrics.test.ts`, `src/syntax/outline.ts`·`outline.test.ts`, `src/workspace/actions.ts`, `specs/v0.8.1/verify/ORDER-09/`(처음 스크립트).
- 코드 `56c3b66`: `src/app.css`(I-21 특이도).
- 문서·측정 `d3a8878`: `docs/BUILD.md`, `specs/v0.8.1/PROGRESS.md`·`PLAN.md`, `specs/v0.8.1/verify/ORDER-09/`(고친 스크립트, 결과, 캡처, leader probe, 로그), `specs/v0.8.1/verify/ORDER-02/drag-src.ps1`·`ext-drop.ps1`(checker C-20-R4가 고침).

## 미정

- 회귀 #8(탐색기 OLE 놓기): 이번 회차 측정 불가. 사람이 탐색기에서 한 번 끌어 보거나(USER-TEST #8), 다음 측정에서 도우미 창 방식을 고쳐야 한다 — leader-core 판단.
- REP-I3(루트 파일 → 옆 루트 폴더 끌기): CDP 입력으로는 drop-target이 생기지 않는다. 앞 0.8.1 빌드(`%TEMP%\v081-app\workbench-tauri-0.8.1-v081end.exe`)도 같아 이번 변경 탓이 아니다(`leader-probe/probe-i17.mjs`). 하위 폴더 파일 끌기(#4)는 PASS. ORDER-07 회귀에서는 같은 길이 `moved true`였다 — 측정 환경 차이로 보나 닫히지 않음.
- `verify/ORDER-02/drag-src.ps1`·`ext-drop.ps1`은 checker가 ORDER-02 폴더에서 직접 고쳤다(지난 카드 측정 스크립트). 되돌릴지 leader-core 판단.
- I-19 머리 줄과 코드 사이에 선이 없는 모양(사용자 확인 V4).

## BLOCKED

- 없음
