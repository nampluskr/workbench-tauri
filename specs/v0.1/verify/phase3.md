# Phase 3 결과표 — R-11 증분 파싱 시간 (M-3)

> 대상: SPEC R-11의 "10MB 파일에서 한 글자를 입력할 때의 증분 파싱 시간". 통과 기준 수치가 원문에 없어 측정값과 관찰만 적는다(판정 없음).
> 측정자: `measure`. 스크립트: `tools/measure-m3.mjs` (`node tools/measure-m3.mjs specs/v0.1/verify/phase3.md`에서 아래 표를 만든다). 앱은 띄우지 않았다.
> 장식 갱신 시간은 재지 않는다(사용자 결정 2026-11-05).

## 측정 조건

| 항목 | 값 |
| --- | --- |
| CPU | Intel(R) Core(TM) i7-8700K CPU @ 3.70GHz (12 논리 코어) |
| Node | v22.22.3 (win32 x64) |
| web-tree-sitter | 0.27.1 |
| 문법 | 설치된 Zed HTML 확장 `html.wasm` (dylink 우회: `src/syntax/grammar.ts`의 `loadLanguage`) |
| 입력 | 올바른 HTML 10,485,817자(10.00 MiB), 98,269줄, 행 96,334개(`<section>` 100행마다, 행당 `div`·`a`·`span`·`b`) |
| 편집 경로 | 앱과 같은 `editTree` → `Tree.edit`, `parseDoc`(CM6 `Text`, 4096자 청크 콜백)로 이전 트리를 넘겨 파싱 |
| 편집 | 위치마다 텍스트 노드 안에 한 글자 `a`를 연속 입력(각 글자는 앞 글자 바로 뒤). 버리는 워밍업 3회 + 측정 30회 |
| 시간 | `process.hrtime.bigint`, ms. "증분 파싱" = `parse` 호출만, "편집+파싱" = `Tree.edit` + `parse` |

## 첫 전체 파싱

| 루트 노드 | hasError | 루트 자식 수 | 시간(ms) |
| --- | --- | --- | --- |
| `document` | false | 2 | 2998.477 |

## 한 글자 입력의 증분 파싱 시간 (ms, 30회)

| 위치 | 오프셋 | 증분 파싱 중앙값 | 최소 | 최대 | 편집+파싱 중앙값 | `Tree.edit` 중앙값 | 입력 후 루트 | hasError |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 맨 앞 | 143 | 0.629 | 0.588 | 0.966 | 0.637 | 0.007 | `document` | false |
| 가운데 | 5,220,717 | 0.657 | 0.591 | 1.008 | 0.670 | 0.011 | `document` | false |
| 끝 | 10,485,753 | 0.618 | 0.555 | 0.966 | 0.624 | 0.006 | `document` | false |

## 관찰

- 한 글자 입력의 증분 파싱은 세 위치 모두 중앙값 0.6ms대(최소 0.56ms, 최대 약 1.0ms)이고 위치 차이가 거의 없다. 첫 전체 파싱(약 3.0초)과 비교해 이전 트리를 재사용하고 있다.
- `Tree.edit` 자체는 0.01ms 안팎이라 편집+파싱 시간은 사실상 `parse`다.
- 입력이 올바른 HTML이라 루트는 전체 파싱과 모든 편집 뒤에 `document`이고 `hasError`는 `false`다(이전 PoC의 루트 ERROR 사고 없음).
- 첫 전체 파싱은 1회 값이다(반복하지 않음). 증분 값은 워밍업 3회를 버린 30회 분포다.
- 측정은 Node에서 한 값이다. WebView2 안의 web-tree-sitter 시간은 재지 않았다(앱 미실행).

---

# M-4 — Phase 3 끝 V3와 줄 수 비교

> 측정자: `measure`. 스크립트: `tools/measure-m4.mjs`(앱 1회 실행, 조작 없음, 끝에 종료), `tools/capture-startup.ps1`(화면 복사만, 입력 없음), `tools/count-lines.mjs`.
> 대상: `src-tauri/target/debug/workbench-tauri.exe`(2026-11-05 12:31 빌드, `http://tauri.localhost/`). 데스크톱 주 모니터 1920x1080, 100%. impl 보고 `impl-p3-1.md`의 "실측 필요" 두 개 + 시작 상태의 HTML 강조.
> 이 절의 판정은 목록 항목의 사실 기록이다. 고치지 않았고 `src/`는 건드리지 않았다.
> 부수 변경: `tools/theme-expect.mjs`가 읽던 번들 Catppuccin JSON이 P3-1에서 삭제돼 설치된 Zed 확장 경로(`%LOCALAPPDATA%\Zed\extensions\installed\catppuccin\themes\catppuccin-mauve.json`)로 바꿨다.

## 1. 시작 때 테마 없는 프레임 — **보인다**

방법: 앱을 띄우기 전에 `tools/capture-startup.ps1`을 먼저 켜 두고, 앱 프로세스가 생기자마자 창 아래 화면을 약 20ms 간격으로 5초간 복사했다(244장). 프레임은 6x4 격자 24점의 색 서명이 바뀔 때만 저장했다. 기준: 테마 배경이 아닌 프레임이 보이면 기록. `t`는 프로세스 시작 시각 이후 ms.

| 프레임(`t`) | 창 사각형(화면 px, 그림자 포함) | 24점 표본 | 판정 |
| --- | --- | --- | --- |
| 149ms | 16x16 | `#474c60` 계열 | 창이 막 생김(아직 크기 없음) |
| 224ms | 1456x861 | 뒤 화면이 비치는 반투명(`#d5d5d5`~`#f9efe7`) | DWM 창 등장 효과 중. 앱 내용 아님 |
| **325ms ~ 1242ms** | 1456x861, `IsWindowVisible` = true | **24점 전부 `#ffffff`** | **테마 배경 아님: WebView 기본 흰 배경이 약 0.9초(917ms) 보인다**(이 구간에서 서명이 바뀌지 않음) |
| 1242ms | 1456x861 | `#191825` `#1f1d2e` `#28263b`(Mocha 면 색) | 테마 UI가 처음 그려짐 |

- 증거 이미지(창 안쪽만 잘라 저장, 바탕화면 가장자리 제외): 흰 프레임 `specs/v0.1/verify/phase3/m4-startup-325ms-white.png`, 처음 테마 프레임 `m4-startup-1242ms-themed.png`.
- impl 보고는 "fetch 동안 수 ms"로 예상했으나 이 PC 빌드에서는 창이 뜬 뒤 첫 테마 프레임까지 약 0.9초 흰 화면이 보인다. 원인 조사나 수정은 하지 않았다(측정자 범위 밖). 확인한 사실은 창 표시(≈325ms)가 첫 테마 그리기(≈1242ms)보다 먼저라는 것뿐이다.
- 한계: 측정은 디버그 빌드(Rust 디버그, JS는 `vite build`)·이 PC에서 1회다. 표본 격자는 평면 배경 위주라 글자 색 변화는 이 서명에 잡히지 않는다.

## 2. `?theme=Catppuccin%20Latte`가 zlext 경유로 Latte 변수를 적용 — **된다**

`Page.navigate`로 `…/?theme=Catppuccin%20Latte`에 이동한 뒤 `:root`의 CSS 변수 24개를 원본 JSON(설치된 확장 파일)과 비교했다(`tools/theme-expect.mjs`, 값은 알파 포함 완전 일치).

| 대상 | 결과 | 비고 |
| --- | --- | --- |
| Latte 변수 24개 | **24/24 일치**, 불일치 0 | 시작(Mocha)도 24/24 |
| 이동 후 주소 | `http://tauri.localhost/?theme=Catppuccin%20Latte` | |
| 이동 후 zlext 요청(`performance` resource) | `catppuccin/themes/catppuccin-mauve.json`, `html/grammars/html.wasm`, `html/languages/html/highlights.scm` | 테마가 zlext로 읽혔다 |
| 이동 후 강조 span | 247개 | Latte에서도 강조됨. 화면 `m4-latte.png` |

## 3. 빌드 앱 시작 상태의 HTML 강조 — **입혀져 있다**

CDP 연결 뒤 `.cm-content`가 생길 때까지 40ms 간격으로 기다린 다음 `.cm-content [class*="cm-syntax-"]`를 셌다. 화면은 `m4-start-mocha.png`.

| 항목 | 값 |
| --- | --- |
| `.cm-content` 확인 시점 / 첫 강조 span 확인 시점 | 앱 시작 후 1256ms / 1258ms (같은 폴링 안, 강조가 편집기와 거의 동시에 보임) |
| 강조 span 수(안정 뒤, 500ms 대기) | 247개, 클래스 6종 |
| 클래스별(개수, 계산된 글자색; 기본 글자색 `rgb(205, 214, 244)`) | `tag` 53 `rgb(137,180,250)` · `punctuation-bracket` 108 `rgb(147,153,178)` · `punctuation-delimiter` 17 `rgb(147,153,178)` · `attribute` 17 `rgb(249,226,175)` · `string` 51 `rgb(166,227,161)` · `tag-doctype` 1 `rgb(203,166,247)` |
| 기본 글자색과 다른 클래스 | 6/6 |

- 관찰: 1.의 1242ms 프레임(화면 복사)에서 글자는 아직 강조 색이 아니었다. 강조 span은 그 직후 첫 폴링(≈1258ms)에 있었다. 강조 없는 첫 그리기가 있고 그 길이는 수십 ms 이내로 보이나, 이 방법으로는 정확히 재지 못했다.

## 4. 목록 밖 관찰 (고치지 않음)

- 편집기 오른쪽 아래 스크롤바 모서리 15x15 px가 두 테마 모두 `#ffffff`다(CDP 캡처 (982,813)점: Mocha·Latte 둘 다 `[255,255,255]`). 모서리 스타일이 테마 변수를 받지 않는 것으로 보인다. 목록 밖이라 스펙 ID 대조는 하지 않았다.

## 5. 줄 수 비교 (D-18)

이전 PoC 태그 `legacy-v0.1-poc`와 현재 작업 트리(미커밋 변경 포함)를 같은 기준으로 센다.

- 센 것: `src/**/*.{ts,tsx,css}`, `src-tauri/src/**/*.rs`, `tools/**`(전부). 세지 않은 것: 문서·JSON 데이터·lock·아이콘·설정(`tauri.conf.json`, `tsconfig`, `vite.config.ts`, `index.html` 등).
- 테스트 구분: `src/**/*.test.ts`(이전 PoC도 같은 규칙 — 테스트 파일은 `src/keymap/engine.test.ts` 하나). Rust는 파일 안 `#[cfg(test)]` 줄부터 끝까지(두 쪽 모두 `src-tauri/src/ext_protocol.rs`의 끝 `mod tests` 하나뿐, 이전 284/319줄·현재 89/134줄에서 시작).
- "줄"은 `\n` 기준 전체 줄, "비공백"은 공백뿐인 줄을 뺀 줄. 주석은 빼지 않았다.
- 현재 `tools/`에는 이 Phase에서 새로 쓴 `measure-m3.mjs`(121)·`measure-m4.mjs`(80)·`capture-startup.ps1`(58)·`count-lines.mjs`(47), 합 306줄이 들어 있다.

| 구분 | 이전 PoC 줄 (비공백) | 현재 줄 (비공백) | 차이(줄) |
| --- | --- | --- | --- |
| 앱 코드 — `src/` (ts·tsx·css) | 3,171 (2,917) | 990 (893) | −2,181 |
| 앱 코드 — `src-tauri/src/` (Rust, 테스트 블록 제외) | 821 (771) | 342 (318) | −479 |
| **앱 코드 합계** | **3,992 (3,688)** | **1,332 (1,211)** | **−2,660** |
| 테스트 — `src/**/*.test.ts` | 251 (225) | 311 (286) | +60 |
| 테스트 — Rust `#[cfg(test)]` 블록 | 36 (34) | 46 (43) | +10 |
| **테스트 합계** | **287 (259)** | **357 (329)** | **+70** |
| `tools/` | 1,095 (1,007) | 1,891 (1,778) | +796 |
| 같은 `tools/`, 위 새 스크립트 4개 제외 | 1,095 | 1,585 | +490 |

참고(이전 PoC): `src/poc/`(PocApp·editorStore·layout·probe·probe2·probe3·selectionShape·specExpected·zedEditor) 9개 파일 1,736줄(비공백 1,605)이 앱 코드 3,171줄 안에 들어 있다. 이를 뺀 이전 PoC `src/`는 1,435줄이다. 현재 `src/`에는 `app.css`(54)·`shell/title-bar.css`(32) 두 css 86줄이 포함돼 있고, 이전 PoC는 css 파일이 없다(스타일이 `shell/styles.ts` 25줄 등 ts 안).

쓴 명령(저장소 루트):

```powershell
node tools/count-lines.mjs legacy-v0.1-poc   # git ls-tree -r --name-only + git show <tag>:<path>
node tools/count-lines.mjs worktree          # src, src-tauri/src, tools 폴더를 직접 읽음(node_modules·target 제외)
git ls-tree -r --name-only legacy-v0.1-poc   # 이전 PoC 파일 이름·테스트 규칙 확인
git grep -n "cfg(test)" legacy-v0.1-poc -- 'src-tauri/src/*.rs'
```

---

# 재측정 (M-4-R1)

> 측정자: `measure`. 위 M-4의 불일치 행은 그대로 두고, impl P3-4(`impl-p3-4.md`: 창 `visible:false` → 테마·첫 render 뒤 `show()`, 스크롤바 모서리 토큰)로 바뀐 항목만 다시 쟀다. 앱 1회(빌드 `src-tauri/target/debug/workbench-tauri.exe`, 2026-11-05 12:37 디버그 빌드), 주 모니터 1920x1080 100%, 창 클라이언트 1440x852. 고치지 않았고 `src/`는 건드리지 않았다.
> 스크립트: `tools/measure-m4r1.mjs`(실행 묶음), `tools/capture-startup.ps1`(M-4와 같음), `tools/hittest.ps1`(읽기 전용 `WM_NCHITTEST` 질의, 입력 없음), `tools/win-input.ps1 -Action hover`(대상 PID 고정, 전경 확인 뒤 포인터 이동만).

## R1-1. 시작부터 첫 표시까지 테마가 아닌 프레임 — **보이지 않는다**

M-4와 같은 방법(앱보다 먼저 화면 복사를 켜고, 앱 프로세스가 생기자마자 창 아래 화면을 약 20ms 간격으로 5초간, 263장, 6x4 격자 24점 서명이 바뀔 때만 저장). 기준: 테마 배경이 아닌 프레임이 보이면 기록. `t`는 프로세스 시작 시각 이후 ms.

| 프레임(`t`) | 창 사각형 | 24점 표본 | 판정 |
| --- | --- | --- | --- |
| 144ms | 16x16 (화면 0,0) | `#474c60` 계열 | 보조 창(M-4에서도 149ms에 같은 모양). 앱 본창 아님 |
| 965ms | 1456x861 (본창 자리) | 창 뒤의 다른 창·바탕화면 색(`#b7b7b7` `#1f201f` 등) | 본창이 보이기 시작했으나 아직 합성 전이다. **앱이 그린 흰색 프레임은 아님**(표본에 `#ffffff` 없음) |
| **1066ms** | 1456x861 | `#191825` `#1f1d2e` `#28263b`(Mocha 면 색) | **첫 앱 프레임이 처음부터 테마 UI**이고 구문 강조도 이미 입혀져 있다(`m4r1-first-frame-1066ms.png`) |
| 1118·1167·1217ms | 같음 | 위와 같음, 한 점만 편집기 글자 쪽 색이 바뀜(`#29324c`→`#b6cdea`→`#1f3a5c`→원래) | 글자·캐럿 잉크 변화. 배경은 계속 테마 색 |

- 5초 동안 저장한 모든 프레임에서 24점 중 `#ffffff`는 한 번도 없다. M-4(수정 전)는 325ms~1242ms 약 917ms 동안 24점 전부 `#ffffff`였다.
- 창이 뜨는 시점: 본창이 보이기 시작 ≈965ms, 첫 테마 프레임 ≤1066ms(수정 전: 창 ≈325ms 흰색, 첫 테마 프레임 1242ms). CDP로 `.cm-content` 확인은 1019ms.
- 첫 프레임의 구문 강조: M-4에서 남은 "강조 없는 첫 프레임"은 이번엔 화면 복사에 잡히지 않았다. 1066ms 프레임에서 태그·문자열 색이 이미 보인다(이미지 확인). 1회 측정이라 항상 그렇다고 단정하지 않는다.
- 한계: 디버그 빌드·이 PC 1회. 프레임 간격은 약 20ms라 그보다 짧은 깜빡임은 못 잡는다. 표본 격자는 평면 배경 위주다.

## R1-2. 스크롤바 모서리 색 — **트랙과 같다**

편집기 스크롤바 15x15. CDP 화면 캡처(DPR 1)에서 모서리 중심, 세로 트랙 아래쪽, 가로 트랙 오른쪽 끝의 픽셀을 비교했다. 토큰은 `--scrollbar-track-background`(`scrollbar.track.background`).

| 테마 | `--scrollbar-track-background` | 모서리 `::-webkit-scrollbar-corner` 계산값 | 모서리 픽셀 | 세로 트랙 픽셀 | 가로 트랙 픽셀 | 토큰을 편집기 배경 위에 합성한 값 | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Catppuccin Mocha | `#11111bff` | `rgb(17, 17, 27)` | `#12111b` | `#12111b` | `#12111b` | `#11111b` | 같음, 흰색 아님(이전 `#ffffff`) |
| Catppuccin Latte (`?theme=Catppuccin%20Latte`) | `#dce0e8ff` | `rgb(220, 224, 232)` | `#dde0e8` | `#dde0e8` | `#dde0e8` | `#dce0e8` | 같음, 흰색 아님 |

- 모서리 픽셀과 트랙 픽셀은 완전히 같다. 토큰 값과는 한 채널이 1 차이(`#12` vs `#11`, `#dd` vs `#dc`)로, 트랙·모서리 둘 다 같은 폭으로 어긋나므로 캡처 색 변환(스크린샷 감마) 오차로 본다. 허용 오차(`verification.tolerance.color_channel`) 안의 값이다.

## R1-3. 숨김→표시 뒤 최대화 버튼 hit test와 스냅 팝업 — **그대로 된다**

창은 처음 숨겨졌다가 `show()`로 표시됐다. 표시된 뒤(`IsWindowVisible` = true, 클라이언트 1440x852, DPI 96) 최대화 버튼 영역을 읽기 전용 `WM_NCHITTEST`(`SendMessageTimeout`, 입력 없음)로 물었다(L-39: 36x32 버튼). 코드 9 = `HTMAXBUTTON`, 1 = `HTCLIENT`.

| 질의 점(클라이언트 논리 px) | 응답 | 기대 | 판정 |
| --- | --- | --- | --- |
| 최대화 버튼 중심 (1386, 16) | **9 (HTMAXBUTTON)** | 9 | 통과 |
| 최대화 버튼 왼쪽 끝 +1 (1369, 16) | **9** | 9 | 통과 |
| 최대화 버튼 오른쪽 끝 −1 (1403, 16) | **9** | 9 | 통과 |
| 최소화 중심 (1350, 16) | 1 | 최대화 아님 | 통과 |
| 닫기 중심 (1422, 16) | 1 | 최대화 아님 | 통과 |
| 타이틀 바 (700, 16) | 1 | 최대화 아님 | 통과 |
| 편집기 (700, 400) | 1 | 최대화 아님 | 통과 |

- 스냅 팝업: 최대화 버튼에 실제 포인터를 올려 2.5초 두고(`win-input.ps1 -Action hover`, 전경 확인 뒤 이동) 모니터를 캡처했다. 버튼 아래에 스냅 레이아웃 플라이아웃(3행 팝업)이 떴다(`m4r1-snap-flyout.png`, 바탕화면 쪽 사생활 내용은 잘라냄). 클릭은 하지 않았다.
- 한계: 이 판정은 플라이아웃이 뜬다는 사실만이다. 플라이아웃 칸 모양·위치는 지난 Phase에서 본 것과 같은 방식이고 이번에 다시 측정하지 않았다.

---

# 정리 후 tools/ 줄 수 (M-5)

일회성 측정 스크립트 4개(`measure-p1.mjs` 115, `measure-p2.mjs` 770, `measure-m4.mjs` 80, `measure-m4r1.mjs` 약 100줄)를 작업 트리에서 지웠다. 남은 것은 다시 쓰는 라이브러리·도구와 SPEC R-11이 요구한 `measure-m3.mjs`다. 지운 파일을 import하는 남은 파일은 없다(`measure-*`를 가리키는 곳은 지운 스크립트 자신의 주석과 verify·PROGRESS 문서의 설명뿐). 위 M-4·M-4-R1 절이 가리키는 `measure-m4.mjs`·`measure-m4r1.mjs`는 커밋되지 않았으므로 git 기록에도 없고 이 문서의 절차 설명만 남는다.

`node tools/count-lines.mjs worktree`(위 5절과 같은 기준):

| 구분 | 이전 PoC 줄 (비공백) | 정리 후 현재 줄 (비공백) | 위 표의 정리 전 현재 |
| --- | --- | --- | --- |
| `tools/` | 1,095 (1,007) | **975 (913)** | 1,891 (1,778) |

남은 `tools/` 파일별 줄 수: `win-input.ps1` 486, `measure-m3.mjs` 121, `cdp-lib.mjs` 83, `png.mjs` 70, `theme-expect.mjs` 61, `capture-startup.ps1` 58, `hittest.ps1` 49, `count-lines.mjs` 47.
(같은 시점 `src/` ts·tsx·css는 1,000줄(비공백 903)로 위 표의 990에서 P3-4분이 늘었다. 이 줄은 참고이고 위 5절 표는 고치지 않았다.)
