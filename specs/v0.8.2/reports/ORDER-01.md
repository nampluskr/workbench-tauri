[BLOCKED] ORDER-01 tauri

> 화면 측정은 사용자 2026-11-14 중지 지시("phase-1 테스트를 중지하고 다음 단계로", leader-core 전달)로 멈췄다. 잰 값만 그대로 적는다. #7에서 위치가 0이 된 경우가 남아 있어 [BLOCKED]로 낸다(고치지 않음 — 중지 지시).

## 완료 기준

측정 범위는 core COMMON 8절, ORDER-01 6절 "고친 기록"·7절 "필요한 테스트 목록"(사용자 2026-11-14)을 따랐다. 화면 조건: 1920×1080 100%(dpi 96), 창 클라이언트 1440×852, One Dark(설정 파일 없음 기본), exe `src-tauri/target/debug/workbench-tauri.exe`(코드 `9599bcb`의 debug 빌드), 격리 APPDATA·WebView2 폴더(`%TEMP%\v082-probe`).

| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 시작 | v0.8.2 문서·AGENTS 문장·herdr 넷 | 충족 | `specs/v0.8.2/`(HERDR-SETUP, ITEMS-MAP=I-n↔core Phase 26행(살아 있는 24 + 거둠 2), PROGRESS, `reports/`, `verify/`), 커밋 `78845ca`. `git grep -n "v0\.8\.2\|v082-" AGENTS.md` → 10·12·17·28·29·34·42·130·134·221행. `herdr agent list`·`herdr tab list --workspace w0`에 tauri-leader·writer·coder·checker(w0:p1~p4) |
| 2 앱 버전 | About 0.8.2, 버전 자리 | 충족 | 화면: About 대화상자 "Version 0.8.2"(`verify/ORDER-01/leader-probe/out/c2-about-run1.png`, `out/result-run1.json` `c2_about`). `git grep`: `src-tauri/tauri.conf.json:4 "version": "0.8.2"`, `src/shell/about.test.ts:33,35`. v0.8.1 ORDER-01 버전 커밋 `b6c8683`이 바꾼 자리는 tauri.conf·about.test·`docs/BUILD.md` 셋이고, `docs/BUILD.md`는 카드대로 ORDER-07에서 |
| 3 I-26 기본값 | 설정 없음에서 에디터 14·미리보기 14·본문 700 | 충족 | 화면(계산값): 에디터 `.cm-content` 14px, `.markdown-body` 14px, max-width 700px(실제 폭 700), 바깥 여백 14px(`leader-probe/out-run2.txt` `c3_defaults`, 캡처 `out/c3-preview.png`). 테스트 `src/settings/model.test.ts:7` |
| 4 I-26 저장된 값 | 단위 테스트 | 충족 | `src/settings/model.test.ts:93` "0.8.1 gap keys read as the same drawn px, and the next write keeps them in the new keys"(글자 크기 없음/18, 새 키 우선, 저장 때 새 키로 옮김, 주석·알 수 없는 키 보존, Load Defaults), `:36` 주석·알 수 없는 키 보존. `npm.cmd run test` 315/315 |
| 5 I-26 간격 비례 | 단위 테스트, 설명 문구 | 충족 | `src/settings/model.test.ts:76`(0.25px 단위 0~48), `src/spec/metrics.test.ts`(14px·18px에서 간격 넷·너비·여백 비례). 설명 문구에서 "at a 16px preview font" 문장 삭제(`src/settings/model.ts`). 계산값 표는 아래 "tauri가 고른 것" |
| 6 I-12 원인 | 소스 줄 근거 | 충족(코드 근거) | 아래 "I-12 원인". 0.8.1 재현 측정은 하지 않음(ORDER-01 6·7절) |
| 7 I-12 같은 pane | 탭 종류마다 휠로 내리고 다른 탭 하나 갔다 온 앞뒤 ±1px | **미충족(일부)** | 아래 "#7 측정 값". 통과: `code.py` 편집, 마크다운·ipynb·CSV 미리보기. 0이 된 경우: 마크다운 편집 탭(`a.md`) 3회 중 1회, HTML 미리보기 3회 중 2회 |
| 8 I-12 분할 pane | 다른 pane 탭을 썼다 돌아옴 한 번 | 측정 안 함(사용자 중지) | 프로브가 분할을 만들지 못했다(`Ctrl`+`\`와 메뉴 경로 시도 뒤 `.pane` 1개, `out-run2.txt`·`out/result.json` `c8_split` error). 고치던 중 중지 |
| 9 회귀 | 테스트·리뷰·보안 diff | 충족 | `npm.cmd run test` 315/315, typecheck 0(coder K-01, checker C-01 리뷰 PASS). `git diff --stat c0609e5 -- src-tauri/tauri.conf.json src-tauri/capabilities` → tauri.conf.json 1줄(`"version"`)뿐, capabilities 변화 없음. HTML 프레임 sandbox·CSP 그대로, 새 메시지 `previewScrollTo`는 `e.source===parent`만 받음(`src/editor/html.ts`). 화면 회귀는 Phase 7 |
| 10 테스트 | 전체 test·typecheck, 새 테스트 둘 | 충족 | 315/315, typecheck 0. 새 테스트: 간격 옮기기 `model.test.ts:93`, 위치 되돌림 `src/shell/view-scroll.test.ts`. 기본값 14로 맞춘 기존 테스트 `model.test.ts`·`metrics.test.ts`·`about.test.ts` |

### #7 측정 값

입력: 실제 휠(`tools/win-input.ps1 -Action wheel`, SendInput, 전경 확인) 6칸(−120×6), 탭 이동은 CDP 마우스 클릭. 값은 탭 스크롤러의 `scrollTop`(편집 `.cm-scroller`, 미리보기 `.markdown-preview`), HTML은 프레임 CDP 대상의 `scrollY`. "뒤"는 돌아오고 1.5초 뒤, run3의 "3초 뒤"는 그 3초 뒤.

| 회차 | 탭 | 갔다 온 탭 | 앞 | 뒤 | 3초 뒤 | 판정 |
|---|---|---|---|---|---|---|
| run2 | `a.md` 편집 | `code.py` | 800 | **0** | - | 0이 됨 |
| run2 | `code.py` 편집 | `a.md` | 600 | 600 | - | 통과 |
| run2 | Preview `a.md` | Preview `test.ipynb` | 600 | 600 | - | 통과 |
| run2 | Preview `test.ipynb` | `code.py` | 600 | 600 | - | 통과 |
| run2 | Preview `test.html` | `a.md` | 1200 | **0** | - | 0이 됨 |
| run2 | Preview `test.csv` | Preview `a.md` | 600 | 600 | - | 통과 |
| run3 | `a.md` 편집 | `code.py` | 700 | **0** | **0** | 0이 됨 |
| run3 | `a.md` 편집 | Preview `a.md` | 600 | 600 | 600 | 통과 |
| run3 | Preview `test.html` | `a.md` | 1200 | 1200 | 1200 | 통과 |
| run3 | Preview `test.html` | `code.py` | 1800 | **0** | **0** | 0이 됨 |
| run3 | `a.md` 편집 | `code.py` | 2400 | 2400 | 2400 | 통과 |

원시 출력: `specs/v0.8.2/verify/ORDER-01/leader-probe/out-run2.txt`(run2 전체 JSON), `out-run3.txt`(run3). 프로브 `leader-probe/probe.mjs`.

**재현 조건(본 것)**: 마크다운 편집 탭은 각 실행에서 **그 탭을 처음 내렸다 떠난 때**만 0이 됐다(run2·run3 모두 첫 경우, 같은 run3의 같은 조합 다섯째 경우는 2400 유지). HTML 미리보기는 같은 조합(`a.md` 경유)이 run2에서 0, run3에서 유지 — 회차마다 갈린다. 0은 3초 뒤에도 그대로라 늦게 되돌아오는 것이 아니다.

**짐작하는 원인(확인 안 함)**:
- 마크다운 편집 탭: `shell/view-scroll.ts`는 scroll 이벤트로 적은 값을 넣은 직후 한 번 되돌린다. 처음 떠날 때만 0이 되는 것으로 보아, 되돌린 뒤 CodeMirror가 다시 붙은 view를 처음 측정하면서(높이 다시 잼, 마크다운 편집 탭에만 있는 미리보기 연계·장식이 높이를 바꿈) 자기 스크롤 기준(scroll anchor)으로 위치를 다시 쓰는 것으로 짐작한다. `code.py`는 한 번도 0이 안 됐다.
- HTML 미리보기: 프레임이 다시 로드될 때 앱이 `load`에서 `previewScrollTo`를 보내는데(`shell/markdown-preview.ts`), 머리 스크립트의 message 수신 준비·문서 높이 확정과 보내는 시점이 경합해 `scrollTo`가 효과 없이 끝나는 회차가 있는 것으로 짐작한다.
- 둘 다 다음 카드에서 원인 확인·고침이 필요하다(leader-core가 정함).

## 검증

- `npm.cmd run test` 315/315, `npm.cmd run typecheck` 0 (coder K-01, 커밋 `9599bcb` 전; checker C-01이 같은 코드로 1회 더 돌림). `cargo check`·`cargo clippy -- -D warnings` 0(coder; Rust 소스는 안 바뀌고 `tauri.conf.json` version만).
- `npm.cmd run tauri build -- --debug --no-bundle` 성공(`9599bcb`).
- 화면 검증 캡처: `verify/ORDER-01/leader-probe/out/c2-about-run1.png`, `out/c3-preview.png`, `out/c7-last.png`.
- checker 측정 스크립트(`verify/ORDER-01/run.mjs`·`measure.mjs`, C-01-R1)는 #2·#3를 한 번씩 돌렸으나 요소를 찾지 못해 측정 불가였다(`verify/ORDER-01/results/run-step2.txt`·`run-step3.txt`, `v3-step2.json`·`v3-step3.json`). 그래서 v0.8.1 ORDER-09 스크립트의 동작한 절차로 leader 프로브를 따로 써서 쟀다.

## 지운 것·더한 것·하지 않은 것

- 더함: `src/shell/view-scroll.ts`(+test), 간격 새 키 넷, HTML 프레임 `previewScrollTo` 수신. 고침: `Pane.tsx:434` 주석.
- 하지 않음: #8 화면 측정(사용자 중지), #7 0이 된 경우의 원인 확인·고침(사용자 중지), 0.8.1 나란히 측정·#6 재현·18px 화면(6·7절).
- 남은 위험: 마크다운 편집 탭·HTML 미리보기의 위치가 가끔 0이 된다(위 표). 옛 간격 키는 파일에 남는다(새 키가 이김, 효과 없음).

## tauri가 고른 것

- 간격 넷 새 기본값 **7 · 14 · 5.25 · 3.5px**(Paragraph Line·Paragraph·List Line·List Item). 0.8.1의 16px 값 8·16·6·4 × 14/16 그대로 — 반올림하면 16px에서 맞춘 비율이 깨진다.
- 간격 단위 **0.25px**, 범위 0~48 그대로(`nearestGap = round(v×4)/4`). 5.25를 담는 가장 큰 단위. Settings −/+ 한 번은 1.
- 비례: 화면 간격 = 설정값 × 미리보기 글자 크기 / 14(넷 모두). 본문 너비·바깥 여백은 기존 `prem`(px/16 × 글자 크기) 그대로라 14px에서 700·14px. `spec/`의 값(Zed 16px rem 값)은 고치지 않았다.
- 계산값: 14px → 간격 7·14·5.25·3.5, 너비 700, 여백 14 / 18px → 9·18·6.75·4.5, 900, 18.
- 옛 저장값 바꿔 읽기: **키 이름을 바꿨다** — 새 키 `preview_paragraph_line_spacing`·`preview_paragraph_spacing`·`preview_list_line_spacing`·`preview_list_spacing`, 옛 키 `preview_*_gap`은 새 키가 없을 때만 읽어 0.8.1 화면 px를 보존하게 바꾼다(0.8.1: 문단 둘 고정, 목록 둘 ×글자/16). 같은 이름을 두면 16px 기준 값인지 가를 수 없어서다. 다음 저장 때 새 키로 쓰고, 주석·알 수 없는 키·옛 줄은 보존, Load Defaults는 옛 키도 지운다.
- I-12 고침 방식: pane 몸통에 capture scroll 리스너로 요소별 마지막 위치를 기록(WeakMap)하고 탭 요소를 넣은 직후 되돌림 — 같은 pane·분할·옮김이 한 길. HTML은 프레임 다시 로드 때 마지막 위치를 부모 메시지로 보냄.

### I-12 원인 (코드 근거, #6)

- 탭 전환은 `shell/Pane.tsx` PaneBody(0.8.1 `:433-452`)의 `item.replaceChildren(dom)`으로 화면 요소를 뺐다 넣는다. WebView2(Chromium)는 DOM에서 뺀 요소의 스크롤 위치를 버린다(scrollTop 0, scroll 이벤트 없음). 0.8.1에는 위치를 저장·복원하는 코드가 편집 탭(`editor/file-view.ts`)에도 미리보기(`shell/markdown-preview.ts` `createPreview`)에도 없었다. 0.8.1 434행 주석("so scroll and selection stay")은 틀렸다.
- 남을 때·잃을 때를 가른 것: CodeMirror만 되돌린다 — `@codemirror/view` 6.43.15 `dist/index.js:4989-4991`이 scroll 이벤트마다 `lastScrollTop`을 적고, `:5297-5302`(focus observer)가 contentDOM이 실제 focus 이벤트를 받을 때 scrollTop이 0이면 그 값을 다시 넣는다. 그래서 편집 탭은 돌아올 때 에디터가 focus 이벤트를 받으면 남고(탭 클릭 → `focusPane` → `view.focus()`, `Pane.tsx:374-375`), 창이 전경이 아니거나 스크롤 직후 이벤트 전에 바꾸면 잃었다. 미리보기(마크다운·ipynb·CSV)는 되돌리는 코드가 없어 늘 잃었다. HTML은 프레임이 다시 로드되며 마지막 render 때 위치로 갔다(`editor/html.ts:160-163`, `markdown-preview.ts:286`).
- 0.8.1 ipynb "700px 그대로" 측정은 코드로 설명되지 않는다(그 탭이 빠지지 않았을 가능성). 재현 측정은 하지 않았다.

## 바꾼 파일

- `78845ca` 문서: `AGENTS.md`, `specs/v0.8.2/HERDR-SETUP.md`·`ITEMS-MAP.md`·`PROGRESS.md`, `reports/.gitkeep`, `verify/.gitkeep`
- `9599bcb` 코드: `src-tauri/tauri.conf.json`, `src/editor/html.ts`·`html.test.ts`, `src/settings/load.ts`·`model.ts`·`model.test.ts`, `src/shell/Pane.tsx`·`about.test.ts`·`markdown-preview.ts`·`view-scroll.ts`·`view-scroll.test.ts`, `src/spec/metrics.ts`·`metrics.test.ts`
- 측정 스크립트·결과·이 보고: 다음 커밋(`specs/v0.8.2/verify/ORDER-01/`, `specs/v0.8.2/reports/ORDER-01.md`)

## 미정

- #7에서 0이 된 두 경우(마크다운 편집 탭 첫 이탈, HTML 미리보기 회차별)의 원인 확인·고침을 언제 할지 — leader-core.
- #8 분할 pane 화면 측정을 언제 할지(Phase 7 화면 회귀에 넣을지) — leader-core.
- PROGRESS.md의 ORDER-01 K-01·C-01·측정 기록은 아직 비어 있다(중지 지시로 writer 카드를 내지 않음). 다음 카드 시작 때 채운다.

## BLOCKED

- 원인: #7 완료 기준(모든 탭 종류에서 위치 유지)이 마크다운 편집 탭·HTML 미리보기에서 가끔 깨진다. 사용자 중지로 원인 확인·고침을 하지 않았다.
- 필요한 것: 고칠지·언제 고칠지 결정(leader-core). #8은 측정 안 함(사용자 중지).
