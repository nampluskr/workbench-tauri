[DONE] ORDER-03 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| I-14 | 네 자리 글꼴 이름·크기·굵기·줄 높이가 표와 같다(V2). D-10 파일·라이선스 커밋. 편집 영역 한글이 고딕(Rendered Fonts, V3). 글자 인상은 V4 | 충족 | 아래 "I-14 값". 덤프 `specs/v0.5/verify/ORDER-03/tauri-dump.json`, `tauri-dump-pre.json`. 판정 `specs/v0.5/verify/ORDER-03/ORDER-03-judgement.md`. 캡처 tauri `tauri-I8-I13-spec-md.png`, `tauri-preview.png`, `tauri-preview-pre.png` / Zed `zed-spec-md-window.png` |
| I-7 | 분할한 pane마다 편집 영역 경계가 한 줄, 직각 | 이미 같음 | 분할 뒤 `.cm-editor` border 0, radius 0, 부모도 0. 분할선 한 줄. tauri `tauri-I7-split.png` / Zed `zed-I7-split-window.png`(Split Right) |
| I-8 | 마크다운 긴 줄이 편집 영역 폭에서 줄바꿈, 가로 스크롤바 없음 | 충족 | SPEC.md에서 `.cm-scroller` scrollWidth 885 = clientWidth 885. 3번 줄이 3행으로 줄바꿈(72.797px). 마크다운(`md`·`markdown`)만 줄바꿈하고 다른 파일은 그대로. tauri `tauri-I8-I13-spec-md.png` / Zed `zed-spec-md-window.png` |
| I-9 | (core 정정 기준) 스크롤할 내용이 있으면 세로 스크롤바가 마우스 위치와 상관없이 늘 보이고, 가로는 넘칠 때만 | 이미 같음 | tauri: 세로 스크롤바가 늘 보인다(캡처 모두). 가로는 `.cm-scroller` overflow auto라 넘칠 때만 보이고, 줄바꿈 마크다운에서는 없다(scrollWidth = clientWidth, 코드 확인). Zed 확인은 아래. 캡처 `specs/v0.5/verify/I-9/zed-*.png`, 판정 `specs/v0.5/verify/I-9/zed-scrollbar.md` |
| I-13 | 커서 줄 배경과 줄 번호 강조, 줄바꿈된 줄 전체, 커서 따라 이동 | 이미 같음 | 3번 줄(3행으로 줄바꿈) 클릭 → `.cm-activeLine` 높이 72.797px, 즉 3행 전체 배경 rgba(205,214,244,0.07). 줄 번호 칸도 같은 배경, 글자색 rgb(203,166,247). tauri `tauri-I13-cursor-wrapped.png` / Zed `zed-I13-cursor-wrapped-window.png`(3번 줄 2행 전체 강조) |

- 공통 조건: 1920×1080, 배율 100%, 클라이언트 1440×852, 같은 파일 `specs/v0.5/SPEC.md`(미리보기 코드 블록은 `AGENTS.md`).
- **테마 다름(Zed One Dark, tauri Catppuccin Mocha)**: core-leader 결정(D-13)으로 그대로 두고, 색과 무관한 모양·값으로 판정했다. 색 대조는 Phase 7 뒤에 한다.
  - Zed는 사용자 설정을 바꾸지 않았다.
  - tauri의 One 테마는 코드 수정 없이 고를 수 있는 것이 One Light뿐이라 쓰지 않았다.

### I-14 값 (CDP `getComputedStyle`, Rendered Fonts = `CSS.getPlatformFontsForNode`)
| 자리 | font-family | 크기 | 굵기 | 줄 높이 | 합자 | Rendered Fonts |
|---|---|---|---|---|---|---|
| UI(body·타이틀 바·상태 바) | "IBM Plex Sans", "Malgun Gothic", sans-serif | 16 (기준값, 요소별 스펙 크기는 그대로. 예: `.project-name` 14) | 400 | normal | `"calt" 0` | — |
| 에디터 본문(`.cm-content`·`.cm-line`) | Lilex, "Malgun Gothic", monospace | 15 | 400 | 24.27px (=15×1.618) | normal | 한글 줄: Lilex 57자 + **Malgun Gothic** 16자 |
| 미리보기 본문(`.markdown-body p`) | "IBM Plex Sans", "Malgun Gothic", sans-serif | 16 | 400 | 24px | `"calt" 0` | IBM Plex Sans 55자 + Malgun Gothic 16자 |
| 미리보기 제목(h1·h2) | 같음 | 28·22.4 | **600** | 35·28px | | |
| 미리보기 코드 블록(`pre`·`pre code`) | Lilex, "Malgun Gothic", monospace | 16 (리더 결정: 크기는 K-03 전 값 유지) | 400 | 25.888px (=16×1.618) | normal | Lilex 383자 + Malgun Gothic 17자 |

- core-leader의 I-14 해석(UI 16은 rem 기준값, 요소별 크기는 그대로)을 따랐다. 그래서 K-03-R1에서 공통 폼 요소의 크기 상속과 코드 블록 15px를 되돌렸다.
- 1번 줄 위 여백: 첫 줄 top 100 = 스크롤러 top 100(차이 0). 글꼴 변경 뒤 빈 줄만큼의 여백은 없다.
- **Zed와 다른 점(글꼴로 풀리지 않음)**: 줄 번호 열 폭이 tauri는 99px(`.cm-gutters`), Zed 캡처는 약 64px다. SPEC R-14에 "Zed와 다른 점"으로 적었다. 줄 번호 여백 값(E-002~E-005)은 이번 카드 범위 밖이라 고치지 않았다.
- `₩`(I-20): 이번 화면에서는 보지 않았다(트리에 `\` 표시는 `docs\refs`처럼 그대로 보인다, `tauri-I7-split.png`). Phase 4에서 본다.

## Zed에서 확인한 것
- **I-9 스크롤바**(tauri-leader 2026-11-07, SendInput과 모니터 캡처, checker C-12 판정):
  - 조건: Zed 기본 설정(`settings.json`에 scrollbar 항목 없음), Windows `DynamicScrollbars` 값 없음, 파일 `src-tauri/src/lib.rs`(211줄), 창 클라이언트 1178×649, 둘째 모니터, 100%, 테마 One Dark.
  - 결과: 세로 thumb는 마우스가 창 밖·타이틀 바·편집 영역 위에 있을 때, 스크롤 직후, 멈춘 뒤 3초에 모두 보였다. 숨김은 없었다. 가로는 내용이 넘치지 않아 보이지 않았다.
  - gpui 결과와 같다(core-leader 대조) → core ITEMS I-9 기대가 정정됐다.
- **I-14 한글 대체 글꼴**: **Malgun Gothic(맑은 고딕)**.
  - 확인 방법: Zed와 같은 API인 DirectWrite `IDWriteFactory2::GetSystemFontFallback` → `MapCharacters`에 "가나다한글"을 넣었다. 기본 글꼴 Lilex·IBM Plex Sans, 로캘 ko-KR·en-US 네 경우 모두 Malgun Gothic이 나왔다(tauri-coder, 임시 스크립트, 출력 `%TEMP%\v05-K-03-dwrite.txt`).
  - tauri 앱에서도 한글 Rendered Fonts가 Malgun Gothic이다(위 표).
  - Zed 캡처의 한글도 같은 고딕 모양이다(`zed-spec-md-window.png`). 글자 인상은 V4.
- I-7(분할선 한 줄·직각)과 I-13(줄바꿈된 줄 전체 강조)은 Zed 캡처가 tauri와 같은 모양이다.

## 글꼴 파일 (D-10)
- IBM Plex Sans **@ibm/plex-sans@1.1.0**
  - 받은 곳: https://github.com/IBM/plex/releases/tag/%40ibm/plex-sans%401.1.0 (`ibm-plex-sans.zip`, `fonts/complete/woff2/`)
  - 파일: `public/fonts/ibm-plex-sans/IBMPlexSans-Regular.woff2`·`-Italic`·`-SemiBold`·`-SemiBoldItalic`, `license.txt`(SIL OFL 1.1, © 2017 IBM Corp.)
- Lilex **2.630**
  - 받은 곳: https://github.com/mishamyrt/Lilex/releases/tag/2.630 (`Lilex.zip`, `webfonts/`)
  - 파일: `public/fonts/lilex/Lilex-Regular.woff2`·`-Italic`·`-Bold`·`-BoldItalic`
  - 라이선스: `OFL.txt`(SIL OFL 1.1, 2019 The Lilex Project Authors). 같은 태그의 공식 저장소에서 받았다.
- 굵기·스타일은 Zed 번들 목록(T-15·T-17.5·T-17.6)에 맞췄다.
- CSP 변경은 없다(`default-src 'self'`가 글꼴을 허용). 버전과 출처는 `specs/v0.5/DECISIONS.md`에 적었다.

## 바꾼 파일
- 앱:
  - `src/app.css`: `@font-face` 8개, UI·미리보기 글꼴, 폼 요소 글꼴 이름·합자 상속, `pre` 글꼴.
  - `src/spec/metrics.ts`: 글꼴 상수(I-14). "Lilex is out of scope" 주석을 없앴다.
  - `src/index.tsx`: `applyMetrics` await.
  - `src/editor/extensions.ts`, `src/editor/file-view.ts`: 에디터 글꼴, 마크다운 줄바꿈.
  - 테스트: `src/spec/metrics.test.ts`, `src/editor/extensions.test.ts`.
  - 글꼴: `public/fonts/**`(woff2 8개, 라이선스 2개).
- 문서: `specs/v0.5/SPEC.md`(R-9 정정, R-14 한글 글꼴·Zed와 다른 점·코드 블록 리더 결정), `DECISIONS.md`(D-10 글꼴), `HERDR-SETUP.md`(띄운 PID만 닫기, 입력은 leader가 SendInput), `PLAN.md`(Phase 3 done), `PROGRESS.md`.
- 검증 결과: `specs/v0.5/verify/I-9/`, `specs/v0.5/verify/ORDER-03/`. Zed 전체 모니터 캡처는 창 영역으로 잘라 저장소 크기를 줄였다(26MB → 3.4MB).
- 커밋: `git log -1 -- specs/v0.5/reports/ORDER-03.md`(push 안 함). 같은 시기 별도 커밋 `1e3795a`는 core-leader가 checker 허용 목록에서 `Stop-Process -Name`을 뺀 것이다.

## 검토
- checker 코드 리뷰: C-10(I-14, K-03) PASS, C-11(I-8·I-13, K-04) PASS.
- V1:
  - coder: typecheck와 관련 테스트 통과.
  - 커밋 직전 전체 검사(C-14): `npm.cmd run typecheck` 통과, `npm.cmd run test` 113/113, `cargo test` 19/19, `cargo clippy -- -D warnings` 경고 0.
- V2·V3:
  - leader가 화면 차례 3회 안에서 측정했다. tauri는 CDP 덤프와 캡처, Zed는 win-input SendInput과 캡처로 했다.
  - checker가 파일로 판정했다(C-12, C-13). C-13은 8개 통과, 다른 점 1개(줄 번호 열 폭), 측정 불가 1개(코드 블록)였다. 코드 블록은 추가 차례에서 쟀다.
- 띄운 프로세스는 PID로만 닫았다: 앱 39164·43784·23068, Zed 19536·25988. 이미 떠 있던 창은 없었다.
- 앱 데이터 `%APPDATA%\workbench-tauri`는 측정마다 백업하고 복원했다.

## 사용자 확인 필요(V4)
- I-14 글자 모양과 한글 글자 간격의 인상(Phase 12).
- 줄 번호 열 폭(tauri 99px, Zed 약 64px)을 Zed에 맞출지. 줄 번호 여백 값(E-002~E-005)을 다루는 카드가 필요하다.

## BLOCKED
없음
