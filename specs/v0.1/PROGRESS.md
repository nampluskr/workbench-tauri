> 버전: v0.1 · 작성일: 2026-11-05 · 상태: 진행 중
>
> 실제로 한 일과 검증 결과를 기록한다. 계획은 `PLAN.md`에, 설계 결정은 `DECISIONS.md`에 있다. 기존 기록은 지우지 않고 뒤에 더한다. 이전 PoC의 기록은 태그 `legacy-v0.1-poc`(9f83f8d)에만 있다.

# PROGRESS — workbench-tauri v0.1

## Phase별 진행

### Phase 0 — 프로젝트 뼈대

- **P0-1 Tauri 2 + Solid + Vite 뼈대** (2026-11-05)
  - 무엇을 했나: `impl`이 CSP를 켠 채 빌드되는 빈 Tauri 2 + Solid + Vite + npm 프로젝트를 만들었다.
    - 이전 PoC(`legacy-v0.1-poc`)의 `vite.config.ts`·`tsconfig.json`·`build.rs`·아이콘·`Cargo.lock`을 다시 썼다. `Cargo.lock`은 전이 의존성 버전을 고정하려고 가져왔다.
    - 데모 코드는 넣지 않았다.
  - 결과
    - 새 파일
      - 루트: `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/index.tsx`
      - `src-tauri/`: `Cargo.toml`, `Cargo.lock`, `build.rs`, `tauri.conf.json`, `capabilities/default.json`, `src/main.rs`, `src/lib.rs`, `icons/`
    - 의존성(정확한 버전 고정, 03-tauri 3.1·3.2 안)
      - npm dependencies: `@tauri-apps/api` 2.12.4, `solid-js` 1.9.18
      - npm devDependencies: `@tauri-apps/cli` 2.12.4, `typescript` 7.0.2, `vite` 8.3.5, `vite-plugin-solid` 2.11.15
      - Cargo: `tauri` =2.12.5, `tauri-build` =2.7.4
      - `tauri`와 `@tauri-apps/api`의 마이너(2.12)가 같다.
    - npm 스크립트: `test` → `node --test`, `typecheck` → `tsc --noEmit`, 그 밖에 `dev`·`build`·`tauri`. 루트 `AGENTS.md` 2장에 적었다.
    - CSP
      - `csp`: `default-src 'self' ipc: http://ipc.localhost`
      - `devCsp`: 같은 값에 `connect-src 'self' ipc: http://ipc.localhost ws://localhost:1420`(Vite HMR)을 더했다.
      - D-14의 세 항목은 아직 없다(PLAN Phase 0).
    - 창은 `main` 하나이고 1440x852, 기본 장식이다. 장식은 Phase 2에서 바꾼다. capability 권한은 비어 있다.
    - 이름
      - package·crate는 `workbench-tauri`, lib는 `workbench_tauri_lib`다.
      - identifier는 `dev.workbench.tauri`, productName은 `workbench-tauri`다.
      - 앱 이름은 레포 이름과 같은 `workbench-tauri`로 정했다(리더 결정, 사용자 위임 2026-11-05).
    - 빌드 준비물 버전(03-tauri R-30)
      - Node v22.22.3, npm 10.9.8
      - rustc·cargo 1.99.1(2026-10-13), toolchain `stable-x86_64-pc-windows-msvc`
      - Visual Studio 2022 Build Tools, MSVC 도구 14.44.35207(Redist 14.44.35112)
      - WebView2 런타임 156.0.4314.58
    - 첫 빌드 시간(캐시 없음): `cargo check` 1분 14초, tauri 디버그 빌드 1분 20초.
  - 검증
    - V0. `impl`의 확인 결과다.
      - `npx tsc --noEmit`: 에러 0
      - `cargo check`: 경고 0
      - `npm run tauri build -- --debug --no-bundle`: 성공. `workbench-tauri.exe` 11.6MB, 컴파일 경고 없음
      - `npm run test`: tests 0, exit 0
    - `check` C-9는 PASS다. Phase 0 완료 조건 일곱 가지를 모두 충족했다.
    - C-9가 전체 테스트를 1회 돌렸다: `npm.cmd run typecheck`, `npm.cmd run test`, `cargo check`가 모두 exit 0, 경고 0이었다.
    - 앱은 실행하지 않았다.
  - 특이사항
    - 03-tauri 표(`docs/refs/03-tauri/README.md`)에는 `tauri-build`가 2.12.5로 적혀 있지만, 실제 크레이트 버전은 2.7.x다. 그래서 이전 PoC 값 2.7.4를 썼다. `docs/refs/`는 고치지 않고 이 기록만 남긴다(리더 결정, 사용자 위임 2026-11-05).
    - C-9 지적 1·2를 루트 `AGENTS.md` 2장에 반영했다. 1은 npm 스크립트, 2는 실행 정책에 막힐 때 `npm.cmd`를 쓰는 것이다.

### Phase 1 — 프레임워크·편집기 기반 PoC

- **P1-1 두 Pane·탭 이동과 CM6 편집기** (2026-11-05)
  - 무엇을 했나: `impl`이 두 Pane과 탭이 있는 PoC 화면과 CM6 편집기를 만들었다(R-1, R-2).
    - 탭마다 `EditorView`를 하나씩 둔다. Solid 밖(`store.ts`의 Map)에서 한 번만 만들고, Pane은 `view.dom`을 다시 붙이기만 한다.
    - 탭은 "→/←" 버튼으로 옮긴다.
    - 이동할 때는 스크롤을 찍어 두었다가 되살린 뒤 포커스를 준다.
  - 결과
    - 새 파일
      - `src/`: `App.tsx`, `app.css`, `spec/metrics.ts`
      - `src/editor/`: `extensions.ts`, `sample.ts`
      - `src/workbench/`: `panes.ts`, `panes.test.ts`, `store.ts`
    - 고친 파일: `src/index.tsx`, `index.html`, `package.json`·`package-lock.json`
      - `index.html`에는 CSP nonce carrier `<style>`을 더했다.
    - 의존성 추가: `@codemirror/state` 6.7.6, `@codemirror/view` 6.43.15. 정확한 버전으로 고정했고 03-tauri 3.2 목록 안이다(리더 승인).
    - 시작 상태: Pane 0에 HTML 예제(`index.html` 탭, 스크롤이 생기는 길이)가 열리고, 커서는 1행에 있다. 구문 강조는 Phase 3에서 넣는다.
    - 수치: toml ID를 키로 한 `src/spec/metrics.ts`가 `:root` CSS 변수로 내보낸다. 인라인 style은 없다.
      - E-005 간격은 캔버스 `fontBoundingBoxDescent`로 한 번 계산한다.
      - 편집기 글꼴은 시스템 고정폭 Consolas 15px다.
    - CSP 문자열은 Phase 0 그대로다. CM6의 `<style>`은 nonce carrier와 `EditorView.cspNonce`로 허용한다.
    - 색은 CSS 변수 이름만 걸었다. 값은 아직 정의하지 않았다.
  - 검증
    - V2(`impl`)
      - `npm run typecheck`: 에러 0
      - `npm run test`: 1 pass(`panes.test.ts`)
      - `cargo check`: 경고 0
      - `npm run build` 성공
      - `tauri dev`를 1회 띄워 조작 없이 CDP로 덤프했다.
      - E-002·E-003·E-004·E-005·E-010·E-011(크기·범위)·E-030이 모두 허용 오차 안에서 통과했다.
    - V3(`measure` M-1)
      - 빌드한 exe(CSP 적용)를 1회 실행했다. 창은 논리 1440x852, 1920x1080 100%다.
      - R-1: 탭 이동 전후로 `.cm-editor`가 `===`이고 `isConnected`다. 스크롤 280/20, DOM 선택 영역, 커서 좌표가 같았다. 한 프레임 뒤와 500ms 뒤 모두 같았다. **R-1 됨**. React 19 비교는 필요 없고, D-2(Solid)를 유지한다.
      - R-2 E-015: 선택 모서리 반지름 3.6405px로 기대값과 같다. 통과다.
      - CSP 위반은 0건이다. 양성 대조로 측정 방식을 확인했다. CM6 `<style>`의 nonce도 일치했다.
      - 결과표: `specs/v0.1/verify/phase1.md`
      - 스크립트: `tools/cdp-lib.mjs`, `tools/measure-p1.mjs`
    - `check` C-10은 PASS다.
      - Phase 1 완료 조건 다섯 가지를 모두 충족했다.
      - Solid 반응성 함정이 없다.
      - 전체 테스트를 1회 돌렸다: typecheck, test 1 pass, `cargo check` 경고 0.
    - R-2의 크기 항목은 모두 통과했다. 색 판정은 Phase 2로 넘겼다(아래 특이사항).
  - 특이사항
    - E-011·E-015·E-006 색과 스크롤바 색은 테마가 들어오는 Phase 2에서 판정한다. 테마 코드는 앞당기지 않는다. 임시 CSS 변수 이름(`--editor-active-line-background`, `--players-0-selection` 등)은 Phase 2에서 T-40 토큰 이름에 맞춘다(리더 결정, 사용자 위임 2026-11-05. C-10 지적 1).
    - E-005의 descent는 Chromium이 글꼴 메트릭을 정수로 둥글려 4px다. 글꼴이나 배율 환경이 바뀌면 다시 확인한다(C-10 지적 2).
    - V2 덤프 직전에 HMR 상태를 정리하려고 페이지를 한 번 리로드했다. nonce carrier는 덤프 뒤에 더했고, 그 확인은 V3에서 했다.
    - M-1의 입력은 OS 입력이 아니라 CDP `Input.dispatchMouseEvent`였다.

### Phase 2 — 창·단위·테마·키맵 기반

- **W-7 R-7 대상 토큰·화면 샘플 고정** (2026-11-05)
  - 무엇을 했나: SPEC R-7의 시작 조건이다. 대상 토큰 목록과 화면 샘플 목록을 원문에서 뽑아 고정했다.
    - 원문: `docs/refs/01-zed/03-THEME-ICONS.md`(T-08, T-26, T-40, 값 표 T-02~T-05·T-25), `01-LAYOUT.md`(L-·E- 행)
    - **이 목록은 고정한 뒤 바꾸지 않는다(SPEC R-7).**
    - 처음 뽑을 때 "확인 필요"였던 7건(표 4)은 리더 결정으로 정리했다(W-7-R1). 표 1~3은 그 결정까지 반영해 확정한 것이다.
  - 결과
    - 대상 토큰 24개(아래 표 1). T-40에 있는 키만 넣었다.
    - 그 토큰에 걸리는 T-26 규칙(아래 표 2)
    - 화면 샘플: Mocha 23개, Latte 23개(아래 표 3, 같은 요소·상태를 두 테마에 적용)
    - One Light는 토큰 값만 본다(D-8). 표 1의 24개 토큰을 대상으로 한다.
  - 검증: 원문 대조. 토큰마다 T-40 행과 화면 요소의 L-·E- 행을 달았다.
  - 특이사항: 처음에 확인이 필요했던 7건은 표 4의 리더 결정으로 정리했다(남은 "확인 필요" 없음). 미사용으로 뺀 토큰은 표 5에 있다.

  표 1. 대상 토큰

  | # | 토큰 | T-40 | 쓰이는 화면 요소(이번 버전) | 원문 ID |
  | --- | --- | --- | --- | --- |
  | 1 | `border` | T-40.2 | 영역 사이 1px 선, 왼쪽 Dock 오른쪽 테두리 | L-16, T-08.13, `window.border_dock_left` |
  | 2 | `title_bar.background` | T-40.15 | 타이틀 바(창 포커스 있음) | L-81, T-08.1, T-08.7 |
  | 3 | `title_bar.inactive_background` | T-40.15 | 타이틀 바(창 포커스 잃음) | L-81 |
  | 4 | `text` | T-40.8 | 타이틀 바 글자, 창 버튼 글리프, 활성 탭 제목 | L-84, T-08.5, T-08.15 |
  | 5 | `text.muted` | T-40.9 | 비활성 탭 제목 | T-40.9 |
  | 6 | `ghost_element.hover` | T-40.5 | 창 버튼 hover(닫기 외) | L-84 |
  | 7 | `ghost_element.active` | T-40.5 | 창 버튼 누름(닫기 외) | L-84 |
  | 8 | `status_bar.background` | T-40.16 | 상태 표시줄 | L-91, T-08.1, T-08.9 |
  | 9 | `tab_bar.background` | T-40.17 | 탭 바 바탕 | L-61, T-08.1 |
  | 10 | `tab.active_background` | T-40.17 | 활성 탭 | L-63, T-08.3, T-08.11 |
  | 11 | `tab.inactive_background` | T-40.17 | 비활성 탭 | L-63, T-08.4, T-08.10 |
  | 12 | `panel.background` | T-40.19 | 사이드바, 왼쪽 Dock | L-12, L-14, T-08.2, T-08.8 |
  | 13 | `editor.background` | T-40.22 | 편집기 바탕 | L-102, T-08.3, T-08.11 |
  | 14 | `editor.foreground` | T-40.22 | 편집기 글자(구문 강조 전) | T-40.22 |
  | 15 | `editor.gutter.background` | T-40.23 | 거터 바탕 | E-007 |
  | 16 | `editor.line_number` | T-40.23 | 줄 번호(커서 줄 외) | E-006 |
  | 17 | `editor.active_line_number` | T-40.23 | 커서 줄 번호 | E-006 |
  | 18 | `editor.active_line.background` | T-40.23 | 현재 줄 강조 | E-011 |
  | 19 | `players[0].selection` | T-40.26 | 선택 영역 | E-015 |
  | 20 | `scrollbar.thumb.background` | T-40.21 | 편집기 스크롤 손잡이 기본 | E-032(색) |
  | 21 | `scrollbar.thumb.hover_background` | T-40.21 | 손잡이 hover | E-032(색) |
  | 22 | `scrollbar.thumb.active_background` | T-40.21 | 손잡이 끄는 중 | E-032(색), T-26.3 |
  | 23 | `scrollbar.track.background` | T-40.21 | 편집기 스크롤 트랙 | E-031 |
  | 24 | `background` | T-40.1 | 창 맨 바닥. 화면 샘플 없이 토큰 값(V1·V2)만 본다(Q-7) | L-11 |

  E-032는 두께만 판정에서 뺐다(D-15). 손잡이 색 상태는 대상이다.

  표 2. 대상 토큰에 걸리는 T-26 규칙

  | T-26 | 토큰 | 걸리는 테마 | 규칙 |
  | --- | --- | --- | --- |
  | T-26.3 | `scrollbar.thumb.active_background` | One Light(키 없음), Mocha·Latte(`null`) | `scrollbar.thumb.background` 값을 쓴다 |
  | T-26.17 | 표 1에 없는 키 | — | 쓰지 않는다 |

  - 표 1의 나머지 23개 토큰은 세 테마 JSON에 모두 값이 있다(T-02~T-05, T-25 값 표). 그래서 다른 T-26 규칙은 걸리지 않는다.
  - `theme.fallback.*` 가운데 표 1의 토큰에 걸리는 항목은 없다. `theme.fallback."scrollbar.thumb.border"`(T-26.8)는 `scrollbar.thumb.border`가 대상이 아니어서(Q-2) 걸리지 않는다.

  표 3. 화면 샘플(Mocha·Latte 각각)

  | # | 화면 요소 | 상태 | 토큰 | 원문 ID |
  | --- | --- | --- | --- | --- |
  | S-1 | 타이틀 바 | 기본(창 포커스) | `title_bar.background` | T-08.1 / T-08.7 |
  | S-2 | 타이틀 바 | 창 포커스 잃음 | `title_bar.inactive_background` | L-81 |
  | S-3 | 타이틀 바 글자·창 버튼 글리프 | 기본 | `text` | L-84, T-08.5 / T-08.15 |
  | S-4 | 창 버튼(최소화·최대화) | hover | `ghost_element.hover` | L-84 |
  | S-5 | 창 버튼(최소화·최대화) | 누름 | `ghost_element.active` | L-84 |
  | S-6 | 사이드바 | 기본 | `panel.background` | L-12, T-08.2 / T-08.8 |
  | S-7 | 왼쪽 Dock | 기본 | `panel.background` | L-14, T-08.2 / T-08.8 |
  | S-8 | 영역 사이 선(타이틀 바 아래, 탭 바 아래, 상태 표시줄 위, 사이드바 오른쪽, 왼쪽 Dock 오른쪽) | 기본 | `border` | L-16, T-08.13 |
  | S-9 | 탭 바 바탕 | 기본 | `tab_bar.background` | L-61, T-08.1 |
  | S-10 | 활성 탭 | 기본 | `tab.active_background` | L-63, T-08.3 / T-08.11 |
  | S-11 | 비활성 탭 | 기본 | `tab.inactive_background` | L-63, T-08.4 / T-08.10 |
  | S-12 | 활성 탭 제목 | 기본 | `text` | T-40.8 |
  | S-13 | 비활성 탭 제목 | 기본 | `text.muted` | T-40.9 |
  | S-14 | 상태 표시줄 | 기본 | `status_bar.background` | L-91, T-08.1 / T-08.9 |
  | S-15 | 편집기 바탕 | 기본 | `editor.background` | L-102, T-08.3 / T-08.11 |
  | S-16 | 편집기 글자 | 기본(구문 강조 전) | `editor.foreground` | T-40.22 |
  | S-17 | 거터 바탕 | 기본 | `editor.gutter.background` | E-007 |
  | S-18 | 줄 번호 | 커서 줄 외 | `editor.line_number` | E-006 |
  | S-19 | 줄 번호 | 커서 줄 | `editor.active_line_number` | E-006 |
  | S-20 | 현재 줄 강조 | 커서 줄(선택 없음) | `editor.active_line.background` | E-011 |
  | S-21 | 선택 영역 | 선택 있음 | `players[0].selection` | E-015 |
  | S-22 | 편집기 스크롤 손잡이 | 기본 / hover / 끄는 중 | `scrollbar.thumb.background` / `scrollbar.thumb.hover_background` / `scrollbar.thumb.active_background` | E-032(색), T-26.3 |
  | S-23 | 편집기 스크롤 트랙 | 기본 | `scrollbar.track.background` | E-031 |

  - S-22는 한 요소의 세 상태다. 상태마다 따로 잰다.
  - Latte 관찰 항목 T-08.7~T-08.18 가운데 이번 화면에 있는 것은 T-08.7·T-08.8·T-08.9·T-08.10·T-08.11·T-08.13·T-08.15다. 위 표에 모두 들어 있다.
  - 이번 화면에 요소가 없어 뺀 것은 다섯이다. T-08.12(사이드바 선택 항목), T-08.14(트리 항목 글자), T-08.16(비활성 ←→ 아이콘), T-08.17(프로젝트 패널 토글)은 화면에 해당 요소가 없다. T-08.18은 원문이 "제외 대상"으로 적었다.
  - 표 1의 `background`(창 맨 바닥)는 화면 샘플에 넣지 않고 토큰 값만 본다(표 4 Q-7).

  표 4. 처음 확인이 필요했던 항목과 결정

  | Q | 항목 | 원문 | 처음 판단이 서지 않은 이유 | 결정 |
  | --- | --- | --- | --- | --- |
  | Q-1 | `players[0].cursor`(캐럿 색) | T-40.26, E-012 | 편집기에 캐럿이 보이지만, SPEC R-2·R-7이 든 화면 요소에 캐럿이 없다 | 대상 아님. SPEC 요소 목록 밖이다 |
  | Q-2 | `scrollbar.thumb.border`와 T-26.8(`theme.fallback."scrollbar.thumb.border"`) | T-40.21, E-032 | E-032 두께를 판정하지 않으므로(D-15) 테두리를 그리는지가 정해지지 않았다 | 대상 아님. E-032 판정 제외이고, 테두리를 그리지 않는다 |
  | Q-3 | `scrollbar.track.border`(E-031 세로 트랙 왼쪽 1px 테두리) | T-40.21, E-031 | SPEC R-2 목록에 없다. Phase 1에서 구현하지 않았다 | 대상 아님. 이번에 구현하지 않는다 |
  | Q-4 | `border.variant` | T-40.2 | `border`와 한 행이다. 영역 사이 선은 T-08.13이 `border`로 확인했다 | 대상 아님. 쓰는 자리가 없다 |
  | Q-5 | `pane_group.border`와 T-26.4 | T-26.4 | 두 Pane 사이 경계에 쓰는지 01-LAYOUT 행으로 확인하지 못했다 | 대상 아님. 01-LAYOUT로 확인되지 않았다. Pane 경계는 PoC 화면이며 L-15 판정 대상이 아니다 |
  | Q-6 | `toolbar.background` | T-40.18 | "탭 바 아래 줄"인데, SPEC R-8 뼈대(L-11~L-16)에 툴바가 없다 | 대상 아님. 뼈대에 툴바가 없다 |
  | Q-7 | `background`의 화면 샘플 | T-40.1, L-11 | 창 맨 바닥이 화면에 드러나는 자리가 있는지 원문으로 정할 수 없다 | 대상에 둔다. 화면 샘플 없이 토큰 값(V1·V2)만 본다 |

  - 결정 원칙: SPEC R-2·R-4·R-8이 든 요소 밖으로 대상을 늘리지 않는다. 원문으로 확인되지 않은 것은 넣지 않는다(리더 결정, 사용자 위임 2026-11-05).

  표 5. 미사용으로 뺀 토큰(A-31.8)

  | 토큰 | 원문 |
  | --- | --- |
  | `editor.hover_line_number` | T-26.11 |
  | `pane.focused_border` | T-26.14 |
  | `editor.highlighted_line.background` | T-26.15 |

  - 이번 화면 요소가 없는 토큰도 대상에 넣지 않았다(T-26.17): `element.*`, `ghost_element.selected`, `icon.*`, `text.disabled`, `text.placeholder`, `text.accent`, `elevated_surface.background`, `drop_target.*`, `panel.indent_guide*`, `editor.wrap_guide`·`indent_guide*`·`invisible`, `editor.document_highlight.*`, 상태 색, `syntax.*`. `syntax.*`는 Phase 3 R-9의 T-27.1이 다룬다.

- **P2-1 장식 없는 창과 타이틀 바·창 버튼** (2026-11-05)
  - 무엇을 했나: `impl`이 장식 없는 창(D-6 1단계)과 타이틀 바·창 버튼을 만들었다(R-3, R-4).
  - 결과
    - 새 파일: `src/shell/TitleBar.tsx`, `src/shell/title-bar.css`
    - 고친 파일
      - `src/App.tsx`, `src/app.css`: 타이틀 바와 `.workspace` 래퍼
      - `src/spec/metrics.ts`: `titlebar.*` 4항목
      - `src-tauri/tauri.conf.json`: `decorations: false`, `shadow: true`
      - `src-tauri/capabilities/default.json`: 권한 8개를 개별로 허용했다.
        - 창: `core:window:allow-minimize`, `allow-toggle-maximize`, `allow-close`, `allow-is-maximized`, `allow-start-dragging`, `allow-internal-toggle-maximize`
        - 이벤트: `core:event:allow-listen`, `allow-unlisten`(최대화 상태 추적용 `onResized`)
    - 타이틀 바 전체가 드래그 영역이다(`data-tauri-drag-region`, L-81). 높이는 `titlebar.height`다.
    - 창 버튼은 오른쪽 끝에 최소화·최대화(복원)·닫기 순서로 있다.
      - 크기: `titlebar.window_button.width`·`titlebar.window_button.height`, 글리프 `titlebar.window_button.glyph_size`
      - 글꼴: `"Segoe Fluent Icons", "Segoe MDL2 Assets"` 폴백 체인(L-83)
      - 글리프: U+E921 / U+E922(최대화 상태면 U+E923) / U+E8BB(L-83, L-312). 최대화 상태는 `isMaximized()`와 `onResized`로 추적한다.
    - L-84 닫기 버튼 빨강은 판정 제외 항목이다. CSS 상수 하나(`--close-red`, 출처 주석)로 두었다.
    - 창 모서리·테두리·그림자는 앱이 그리지 않는다(D-7).
    - 새 의존성은 없다.
  - 검증
    - V2(`impl`): `npm run typecheck` 에러 0, `npm run test` 1 pass, `cargo check` 경고 0, `tauri build --debug --no-bundle` 성공
    - 빌드 exe를 1회 띄워 조작 없이 덤프했다. L-21, L-39(폭·높이·글리프 크기), 버튼 순서·위치가 모두 차 0으로 통과했다. L-81 드래그 영역은 속성만 코드 확인했다.

- **P2-2 키맵 엔진과 브라우저 단축키 차단** (2026-11-05)
  - 무엇을 했나: `impl`이 WebView 안의 키맵 엔진(D-4)과 브라우저 단축키 차단(D-5)을 만들었다(R-5, R-6).
  - 결과
    - 새 파일: `src/keymap/engine.ts`, `src/keymap/keyboard.ts`, `src/keymap/engine.test.ts`
    - 고친 파일: `src/index.tsx`(`installKeyboard()`), `src/App.tsx`(`data-keymap-context` Workspace·Pane), `src/editor/extensions.ts`(Editor 컨텍스트)
    - 엔진은 I-702(깊이 우선, 같으면 나중 등록), I-703(null 해제와 출처 등급), I-001(연속 키), I-704(표시 키)를 따른다. 키 정규화는 빈 `code`, 한글 IME, 숫자패드 +·-를 다룬다.
    - 의도적 단순화는 `shortcut:` 주석으로 남겼다. 술어의 `>`·`key == value`가 없다.
    - Zed 키맵 파일 로드(I-700)는 하지 않는다. 앱의 바인딩은 비어 있다.
    - D-5 결과
      - wry 0.57.1에는 `with_browser_accelerator_keys`가 있다. 그러나 Tauri 2.12.5와 그 runtime·utils는 `AreBrowserAcceleratorKeysEnabled`를 노출하지 않는다. 결과는 안 됨이다.
      - 그래서 최상위 캡처 단계 `keydown`에서 `BROWSER_KEYS`의 키를 `preventDefault`하고, 모든 키를 키맵 엔진으로 보낸다. 우클릭은 캡처 단계 `contextmenu`의 `preventDefault`로 막는다.
      - `webview2-com`으로 설정을 직접 바꾸는 길은 03-tauri 3.1 목록 밖이라 쓰지 않았다.
    - `BROWSER_KEYS`는 14개다. SPEC R-5 목록의 13개에 `ctrl-=`를 더했다(아래 리더 결정).
    - 새 의존성은 없다.
  - 검증
    - V1(`impl`): `npm run typecheck` 에러 0, `npm run test` 7 pass / 0 fail(키맵 6개 + 기존 1개), `cargo check` 경고 0
    - R-6 테스트 6개는 I-702, I-703, I-001, I-704, 키 정규화, R-5 키 집합을 다룬다.
    - 테스트가 실패를 잡는지도 확인했다. I-703 등급 조건을 빼면 1 fail이 났고, 원복하자 7/7이 되었다.

- **P2-3 테마 적용과 영역 뼈대** (2026-11-05)
  - 무엇을 했나: `impl`이 세 테마의 대상 토큰 24개를 CSS 변수로 적용했다(R-7). 영역 뼈대와 rem 단위(R-8)도 만들었다.
  - 결과
    - 새 파일: `src/theme/theme.ts`, `src/theme/apply.ts`, `src/theme/theme.test.ts`, `src/theme/NOTICE.md`
    - 새 데이터(수정 없이 들여옴): `src/theme/assets/one/one.json`과 `LICENSE`, `src/theme/assets/catppuccin/catppuccin-mauve.json`과 `LICENSE`. Catppuccin 복사는 아래 리더 결정을 따랐다.
    - 고친 파일: `src/App.tsx`, `src/app.css`, `src/spec/metrics.ts`, `src/shell/TitleBar.tsx`, `src/shell/title-bar.css`, `src/editor/extensions.ts`, `src/index.tsx`, `tsconfig.json`(`resolveJsonModule`)
    - 테마 코드
      - `parseColor`: #RRGGBB는 알파 255, #RRGGBBAA, 그 밖은 오류(T-01.7)
      - `findTheme`: T-01.4~06
      - 대상 토큰은 W-7 표 1의 24개다. CSS 변수 이름은 키의 `.`·`_`·`[`·`]`를 `-`로 바꾼다.
      - T-26.3 대체: `scrollbar.thumb.active_background` ← `scrollbar.thumb.background`
    - 적용 방식
      - constructable stylesheet 하나로 `:root`에 변수를 낸다. 인라인 style은 없다.
      - 시작 테마는 Catppuccin Mocha다.
      - 측정용으로 `?theme=<이름>`으로 다시 불러오면 그 테마로 시작한다. 측정 전용 전역은 없다.
    - 타이틀 바는 창이 포커스를 잃으면 `title_bar.inactive_background`를 쓴다.
    - 영역 뼈대(L-11~L-16)
      - `#root`: [사이드바] → [Workspace]
      - Workspace(세로): [타이틀 바] → [본문] → [상태 표시줄]
      - 본문(가로): [왼쪽 Dock] → [PaneGroup(Phase 1의 두 Pane)]
    - 치수는 toml ID 변수만 썼다. rem 변환은 `metrics.ts`의 `rem()` 한 곳이며, 루트 글자 크기는 `units.rem_size`다(L-01, L-02).
    - 앞의 두 항목에서 판정하지 않는 부분이 있다.
      - L-22 이후 치수는 판정하지 않는다.
      - Phase 1의 임시 변수 이름은 이미 이름 규칙과 같아서 바꾸지 않았다.
    - JSON 두 파일을 번들해서 JS가 255KB에서 328KB로 늘었다.
  - 검증
    - V1(`impl`): `npm run test` 11 pass / 0 fail. 이 카드에서 parseColor 1개와 세 테마의 24개 토큰 일치 3개를 더했다.
      - 세 테마 모두 T-26.3 경로가 실제로 쓰였다.
      - `npm run typecheck` 에러 0, `cargo check` 경고 0, `tauri build` 성공
    - V2(`impl`): 빌드 exe 1회, 조작 없이 덤프
      - Mocha 변수 24개가 V1 계산 값과 알파까지 일치했다.
      - 루트 글자 크기는 16px다.
      - R-8의 L-11~L-16 배치는 모두 통과했다.
      - Phase 1에서 넘긴 E-011·E-006·스크롤바 색 변수가 연결되어 있다.

- **P2-4 네이티브 최대화 버튼(D-6 2단계)과 둘째 탭** (2026-11-05)
  - 무엇을 했나
    - M-2에서 스냅 레이아웃 팝업이 안 됨으로 나왔다. 그래서 `impl`이 D-6 2단계로 최대화 버튼을 네이티브로 처리했다.
    - S-11·S-13을 재려고 시작 상태에 둘째 탭을 더했다.
  - 결과
    - 의존성 추가: `windows` =0.62.2(03-tauri 3.1 목록, 리더 승인)
      - feature는 6개다: `Win32_Foundation`, `Win32_Graphics_Gdi`, `Win32_UI_HiDpi`, `Win32_UI_Input_KeyboardAndMouse`, `Win32_UI_Shell`, `Win32_UI_WindowsAndMessaging`
      - 이미 전이 의존성이었다. 그래서 `Cargo.lock` 변경은 1줄이다.
    - 새 파일: `src-tauri/src/caption.rs`
    - 고친 파일: `src-tauri/src/lib.rs`(setup과 명령 `caption_set_colors`), `src-tauri/Cargo.toml`·`Cargo.lock`, `src/theme/apply.ts`, `src/theme/theme.ts`(`over()` 합성), `src/editor/sample.ts`, `src/workbench/store.ts`
    - 최대화 버튼 처리 방식
      1. `WRY_WEBVIEW` 자식 창에서 최대화 버튼 칸을 창 영역으로 뚫는다.
      2. 최상위 창 서브클래스가 그 칸에서 `WM_NCHITTEST`에 `HTMAXBUTTON`을 돌려준다.
      3. hover·누름·놓음을 직접 처리하고, 버튼을 GDI로 그린다(Segoe Fluent Icons, `IsZoomed`로 U+E922/U+E923).
      4. `WM_NCMOUSEMOVE`는 기본 처리로 넘겨 시스템이 스냅 팝업을 띄우게 한다.
    - 버튼 색은 테마를 적용할 때 프런트엔드가 단색 5개로 보낸다. 타이틀 바 배경, 비활성 배경, `ghost_element.hover`·`ghost_element.active`를 타이틀 바 배경 위에 합성한 값, `text`다.
    - 한계: 비활성 창에서 hover하면 활성 배경 기준 합성 색을 쓴다(아래 사용자 확인 필요).
    - Rust 상수는 toml ID 이름이다(`TITLEBAR_WINDOW_BUTTON_WIDTH/HEIGHT/GLYPH_SIZE`). `unsafe` 블록마다 `SAFETY:` 주석을 달았다.
    - HTML 최대화 버튼은 키보드 접근과 레이아웃을 위해 DOM에 남겼다.
    - 둘째 탭: 시작 상태 Pane 0에 `index.html`(활성, HTML 예제)과 `style.css`(짧은 CSS)가 있다.
  - 검증
    - V2(`impl`): `npm run typecheck` 에러 0, `npm run test` 11 pass / 0 fail, `cargo check` 경고 0, `tauri build` 성공
    - 빌드 exe 1회, 조작 없이 덤프와 읽기 전용 Win32 질의를 했다.
      - L-21, L-39, L-83 모두 통과다.
      - 최대화 버튼 중심의 `WM_NCHITTEST`는 `HTMAXBUTTON`이고, 최소화·닫기·편집기는 `HTCLIENT`다.
      - GDI 버튼 픽셀은 타이틀 바 배경·`text`와 같다.

- **Phase 2 판정과 Phase 끝 검증** (2026-11-05)
  - 무엇을 했나
    - `measure`가 Phase 2 V3를 실측했다(M-2). P2-4 뒤에 바뀐 항목과 지난 불일치·측정 불가 항목만 다시 쟀다(M-2-R1).
    - `check`가 코드를 검토하고 전체 테스트를 1회 돌렸다. C-11a는 P2-1~P2-3, C-11b는 P2-4다.
  - 결과(판정)
    - **R-3 됨.**
      - 스냅 레이아웃 팝업은 `WM_NCHITTEST` 처리가 필요했다. 1단계(`decorations: false` + `shadow: true`)에서는 안 됐고, D-6 2단계(P2-4)에서 됐다(M-2-R1). 최대화 버튼 hover 2.5초 뒤 팝업이 나오고, 칸을 고르면 스냅된다.
      - 타이틀 바 드래그 이동, 가장자리 리사이즈, 더블클릭 최대화·복원, 최대화 버튼 클릭이 된다. 버튼 밖에서 놓으면 아무 일이 없다.
      - 최대화 여백은 사방 0px이다. 프레임이 작업 영역 1920x1032와 같다.
      - 세 창 상태 관찰값(D-7, L-311 판정 안 함)
        - 일반 창: 1px `#0078d4` 테두리, 반지름 약 8px 둥근 모서리
        - 왼쪽 스냅 창: 1px 테두리, 직각
        - 최대화 창: 테두리 없음, 직각
    - **R-4 충족.**
      - 크기·글리프는 V2에서 통과했다.
      - V3에서 닫기 외 버튼 hover·누름 색(S-4·S-5, Mocha·Latte)이 통과했다. 네이티브 최대화 버튼은 같은 캡처의 견본 대비 채널 차 1(±1 안)이다.
      - 최대화 상태 글리프 U+E923과 복원 U+E922가 맞다.
    - **R-5 충족.** 시험할 키 16개가 모두 앱 `keydown`에 도달했고, `defaultPrevented`가 참이었다.
      - 키: Ctrl+P/F/R/W, F5·F3·F1·F6, Alt+←/→, Ctrl+Plus(Shift+=와 =), Ctrl+Minus, Ctrl+숫자패드 ±, Ctrl+Tab
      - 새 창·새로고침·확대·뒤로가기가 없었다.
      - 한글 모드 Ctrl+P/F/R/W와 우클릭 두 곳(편집기, 타이틀 바)도 같은 결과다.
    - **R-6 충족.** 단위 테스트 6개가 통과했다.
    - **R-7 충족.**
      - 변수 덤프는 세 테마 각 24/24로 일치했다.
      - 화면 색 S-1~S-23(Mocha·Latte)은 기준 견본 대비 채널 차 최대 1이다.
      - S-11·S-13은 M-2-R1에서 실제 둘째 탭으로 차 0이었다.
    - **R-8 충족.** V2 배치 L-11~L-16이 통과했다.
    - R-1은 새 영역 뼈대에서 다시 재서 유지됨을 확인했다(M-2).
    - 결과표: `specs/v0.1/verify/phase2.md`(맨 아래 "재측정(M-2-R1)" 절 포함)
    - 증거 이미지: `specs/v0.1/verify/phase2/`
    - 측정 도구: `tools/measure-p2.mjs`, `tools/win-input.ps1`, `tools/png.mjs`, `tools/theme-expect.mjs`
  - 검증
    - V3(`measure` M-2, M-2-R1)
      - 조건: 1920x1080 100%, 창 논리 1440x852(최대화 안 함), 빌드 debug exe(CSP 적용)
      - 입력: OS 입력(SendInput)과 CDP. PID·HWND를 고정하고 입력마다 전경 창을 확인했다. 다른 창에 입력이 들어간 일은 없다.
    - `check` C-11a PASS, C-11b PASS
      - 전체 테스트 1회: `npm run typecheck` 에러 0, `npm run test` 11 pass / 0 fail, `cargo check` 경고 0
      - 지적은 모두 참고 수준이다. 비활성 창 hover 합성, `caption_set_colors` 결과 무시, 모듈 수준 리스너, `?theme=`다.
  - 리더 결정(사용자 위임 2026-11-05)
    - `ctrl-=` 차단 유지: SPEC R-5 목록 밖이지만 `BROWSER_KEYS`에 둔다. Shift 없이 `=`로 눌리는 확대 키다.
    - Catppuccin JSON 임시 복사
      - `catppuccin-mauve.json`을 MIT 고지(LICENSE, NOTICE.md)와 함께 레포에 복사했다.
      - D-9(One Light 하나만 복사)·D-13(확장 파일은 경로로 참조)과 어긋난다. Phase 3 `zlext` 이후 다시 판단한다.
    - W-7 Q-1~Q-7: 위 W-7 표 4의 결정대로 대상 토큰 24개와 화면 샘플을 고정했다.
    - 둘째 탭: S-11·S-13을 재기 위해 시작 상태에 둘째 탭(`style.css`)을 더했다.
    - D-5 결과: Tauri가 `AreBrowserAcceleratorKeysEnabled`를 노출하지 않는다. 그래서 캡처 단계 `keydown` 차단을 채택했다.
    - D-6 2단계 진행과 `windows` =0.62.2 추가를 승인했다.
  - 사용자 확인 필요(V4)
    - 네이티브 GDI 최대화 글리프와 DOM 기준 글리프의 안티앨리어싱 차이
      - 먹 범위(위치·크기)는 같다. Latte만 왼쪽 끝이 1px 짧다.
      - 픽셀 최대 차는 Mocha 59, Mocha 최대화 상태 65, Latte 12다.
      - 원문에 통과 수치가 없다.
    - 비활성 창에서 최대화 버튼 hover 색은 근사값이다. 활성 타이틀 바 배경 기준으로 합성한다. 재지 않았다.
  - 특이사항
    - 창 리사이즈 영역은 클라이언트 밖 8px 투명 테두리다(위는 1px). Windows 기본 동작이다.
    - S-22 "끄는 중" 색은 T-26.3 때문에 기본 색과 같다.
    - 테마 JSON 번들로 JS 크기가 늘었다(255KB → 328KB). 필요한 테마만 잘라 넣을지는 Phase 3 `zlext` 판단과 함께 본다.

### Phase 3 — 문법 WASM 로드 PoC와 P0 정리

- **W-9 R-9 술어 목록 고정** (2026-11-05)
  - 무엇을 했나: SPEC R-9 시작 조건이다. 이 PC에 설치된 Zed HTML 확장에서 `.scm` 6개를 읽고, 실제로 쓰인 술어를 원문 그대로 뽑아 고정했다.
    - 경로: `%LOCALAPPDATA%\Zed\extensions\installed\html\languages\html\`
    - 확장 버전: `html` 0.3.2(`extension.toml`)
    - 문법: `tree-sitter-html` rev `bfa075d83c6b97cd48440b3829ab8d24a2319809`
    - **이 목록은 고정한 뒤 바꾸지 않는다(SPEC R-9).**
  - 결과

    | 술어 | 파일·쓰임 | 고정 사례(입력 → 기대) |
    | --- | --- | --- |
    | `#match?` | injections.scm: `@_attribute_name "^style$"` | P-1 `<p style="color:red">` → injection.content "color:red", injection.language "css" / P-2 `<p class="color:red">` → 속성 매치 없음 |
    | `#match?` | injections.scm: `@_attribute_name "^on[a-z]+$"` | P-3 `<b onclick="go()">` → injection.content "go()", injection.language "javascript" / P-4 `<b onClick="go()">` → 속성 매치 없음(대문자 C) |
    | `#set!`(인수 2개) | injections.scm: `injection.language` ×5 | P-5 `<script>let x = 1;</script>` → setProperties {"injection.language":"javascript"}, content "let x = 1;" |
    | `#set!`(인수 1개) | brackets.scm: `rainbow.exclude` ×5 | P-6 `<a href="x">` 따옴표 쌍 → setProperties에 키 "rainbow.exclude"(값 null) |
    | `#set!`(인수 1개) | brackets.scm: `newline.only` ×1 | P-7 `<div></div>` → 시작·끝 태그 쌍에 키 "newline.only"와 "rainbow.exclude" |

    - `injection.language` 값 다섯은 "comment", "javascript"(script), "css"(style), "css"(`style` 속성), "javascript"(`on*` 속성)다.
    - 03-tauri R-03이 든 `#any-of?`는 이 6개 파일에 쓰이지 않는다.
    - highlights.scm, indents.scm, outline.scm, overrides.scm에는 술어가 없다.
    - overrides.scm에는 Zed 고유 지시문(`.inclusive` 등)이 없다. 일반 캡처(`@comment`, `@string`, `@default`)만 있다.
    - Markdown·JSON 확장은 2026-11-05 현재 설치되어 있지 않다. `installed`에 있는 것은 `catppuccin`, `html`, `macos-classic`, `toml`이다. 그래서 PLAN대로 R-9의 Markdown·JSON 항목은 "대기"다(리더 확인).
  - 검증
    - 파일 6개 원문을 읽어 옮겼다.
    - `#` 지시문은 13곳이다(brackets 6, injections 7). 모두 위 표에 들어 있다.
    - 이전 PoC의 고정 표(태그 `legacy-v0.1-poc`의 PROGRESS "R-10 술어 목록 고정", 확장 0.3.2)와 대조했다. 현재 설치 파일과 같다.
  - 특이사항: 이전 PoC 표는 이전 SPEC 번호(R-10)로 적혀 있다. 이번 버전에서는 R-9다.

- **P3-1 `zlext` 스킴, 확장 경로 검사, CSP, Catppuccin을 설치 경로에서 읽기** (2026-11-05)
  - 무엇을 했나: `impl`이 확장 파일을 주는 커스텀 스킴 `zlext`, A-55.2 경로 검사, D-14 CSP 세 항목을 만들었다(R-10). Catppuccin 임시 복사본을 지우고 `zlext`로 읽게 했다.
  - 결과
    - 새 파일: `src-tauri/src/ext_protocol.rs`(스킴·경로 검사와 정션 단위 테스트)
    - 고친 파일
      - `src-tauri/src/lib.rs`: `register_uri_scheme_protocol("zlext", …)`
      - `src-tauri/tauri.conf.json`: CSP
      - `src/theme/apply.ts`: Catppuccin을 `zlext`로 fetch, `applyTheme` async
      - `src/index.tsx`: `await applyTheme()` 뒤 render
      - `src/theme/theme.test.ts`: Catppuccin을 설치 경로에서 읽음
      - `src/theme/NOTICE.md`: Catppuccin 행 삭제
    - 지운 파일: `src/theme/assets/catppuccin/`(`catppuccin-mauve.json`, `LICENSE`)
    - 스킴 URL은 `http://zlext.localhost/<확장 id>/<상대 경로>`다. 루트는 `%LOCALAPPDATA%\Zed\extensions\installed` 하나다(D-14).
    - 경로 검사(A-55.2)는 다음 순서다.
      1. 퍼센트 디코딩을 먼저 한다.
      2. 절대 경로(드라이브, `\\`, 앞의 `/`)를 거부한다.
      3. `..`·`.` 구성 요소를 거부한다.
      4. `canonicalize`한 실제 경로가 확장 루트 밖이면 거부한다.
    - 거부하면 403과 이유 문자열을, 없는 파일이면 404를 준다. CORS는 앱 출처에만 연다.
    - CSP(`csp`, `devCsp`)는 D-14 세 항목만 더했다: `script-src 'self' 'wasm-unsafe-eval'`, `connect-src`에 `http://zlext.localhost`, `img-src 'self' http://zlext.localhost`.
    - 의존성·capability 변경은 없다(Tauri 내장 스킴, std).
    - 확장 SVG 표시는 넣지 않았다. 이 PC의 `installed`에 SVG 파일이 없다(아래 리더 결정).
  - 검증
    - V1(`impl`): `npm run typecheck` 에러 0, `npm run test` 11/11, `cargo check` 경고 0, `tauri build` 성공
    - `cargo test` `ext_protocol::tests::path_checks_follow_a_55_2` 통과
      - 임시 폴더와 `mklink /J` 정션으로 시험한다.
      - 사례: 정상 상대 경로 허용, `C:/…`·`\\server\share`·`//etc` 거부, `../other`·`%2e%2e`·`sub\..\..` 거부, 정션 경유 루트 밖 링크 거부
      - 이 PC의 Zed 폴더는 건드리지 않는다.
    - V2(`impl`): 빌드 exe 1회, 조작 없이 최초 로드부터 수집했다.
      - CSP 위반 0건
      - `catppuccin-mauve.json`, `highlights.scm`, `html.wasm` 요청이 200이다.
      - 거부 사례 fetch는 403·404다.
      - Mocha 변수 24/24가 Phase 2 값과 같다.

- **P3-2 문법 WASM 로드와 구문 강조** (2026-11-05)
  - 무엇을 했나: `impl`이 `web-tree-sitter`로 설치된 HTML 확장의 문법 WASM과 `.scm`을 읽어 시작 상태 편집기에 강조를 입혔다(R-9). dylink 우회 카드라 HERDR-SETUP대로 Opus 5.5 medium으로 했다(아래 리더 결정).
  - 결과
    - 새 파일: `src/syntax/grammar.ts`(dylink 우회, 언어 로드, 경로, 쿼리 컴파일, T-27.1 `themeKey`), `src/syntax/highlight.ts`(CM6 ViewPlugin), `src/syntax/grammar.test.ts`
    - 고친 파일: `src/theme/theme.ts`(`syntaxClass`·`syntaxCss`), `src/theme/apply.ts`, `src/workbench/store.ts`(`index.html` 탭에만 `syntaxHighlighting("html")`), `package.json`·`package-lock.json`
    - 의존성 추가: `web-tree-sitter` 0.27.1(정확히 고정, 03-tauri 3.2 목록)
    - dylink 우회(D-12): 바이트 사본에서 `dylink.0`의 NEEDED(`libc.so`) 하위 섹션 종류 바이트만 0x7f로 바꾼다. 원본 파일과 원본 배열은 그대로다.
    - 경로 규칙: `<id>/grammars/<id>.wasm`, `<id>/languages/<id>/highlights.scm`. Markdown·JSON은 설치 뒤 실제 폴더를 보고 맞춘다.
    - 강조: 캡처 이름 → T-27.1 키 → `cm-syntax-*` 클래스다. 테마 `style.syntax` 키마다 규칙 하나를 같은 stylesheet에 넣는다. 장식은 `visibleRanges` 안에서만 만든다.
    - 인젝션 강조는 하지 않는다. `style.css` 탭은 CSS 확장이 없어 강조가 없다(대상 아님).
  - 검증
    - V1(`impl`): `npm run test` 16/16(이 카드 5개), `npm run typecheck` 에러 0, `cargo check` 경고 0, `tauri build` 성공
      1. D-12: 원본 그대로는 로드가 거부되고, 우회 사본은 로드되며, 원본은 변하지 않는다.
      2. `.scm` 6개 컴파일: brackets·highlights·indents·injections·outline·overrides 모두 됨. highlights 캡처가 나온다.
      3. W-9 술어 P-1~P-7: 입력 → 기대가 실제와 모두 같다.
      4. T-27.1: Mocha `syntax` 키에서 기대 키와 앱 결과가 같다.
      5. 범위 단위: `QueryOptions`는 바이트(코드 단위×2), Node는 코드 단위다.
    - V2(`impl`): 빌드 exe, 조작 없음
      - `cm-syntax-*` 요소 247개, 클래스 6종이고, 계산 색이 Mocha `syntax` 값과 같다.
      - CSP 위반·콘솔 오류 0건
      - 앱을 두 번 띄웠다. 첫 실행은 덤프 스크립트가 리로드 직후 편집기가 없는 상태를 만나 스크립트 쪽 예외로 끝났다. 앱 코드는 두 실행 사이에 바꾸지 않았다.

- **P3-3 CM6와 Tree-sitter 증분 연동** (2026-11-05)
  - 무엇을 했나: `impl`이 CM6 트랜잭션을 `Tree.edit`와 이전 트리를 넘기는 증분 파싱으로 이었다(R-11). 증분 연동 카드라 Opus 5.5 medium으로 했다.
  - 결과
    - 새 파일: `src/syntax/incremental.ts`(`editTree`, `parseDoc`), `src/syntax/incremental.test.ts`
    - 고친 파일: `src/syntax/highlight.ts`(전체 파싱은 문법 로드 직후 한 번뿐, 이후 증분)
    - `editTree`: change마다 `Tree.edit`를 한 번 부른다. 좌표는 앞 edit이 반영된 텍스트 기준이며, 인덱스·Point는 UTF-16 코드 단위다.
    - `parseDoc`: `parser.parse(callback, oldTree)`. 콜백이 4096 코드 단위씩 준다.
    - 코드 확인
      - Lezer: `@codemirror/language`가 의존성에 없고, 편집기 확장에 언어 확장이 없다. 강조는 Tree-sitter 플러그인 하나뿐이다.
      - 보이는 범위: `src/syntax/highlight.ts`의 `visibleRanges` 반복에서만 장식을 만든다.
    - 의존성 변경은 없다.
  - 검증
    - V1(`impl`): `npm run test` 17/17, `npm run typecheck` 에러 0, `cargo check` 경고 0, `tauri build` 성공
    - 테스트: 트랜잭션마다 `Tree.edit` 수가 change 수와 같고, `parse`에 edit한 옛 트리와 콜백 입력이 넘어가며, 결과가 전체 파싱과 같다. change 3개의 edit 값은 손계산과 비교한다.
    - 일부러 고장 낸 네 가지(옛 좌표 인덱스, 옛 문서 Point, 여러 줄 삭제 행 누락, newEnd −1)를 모두 실패로 잡았다.

- **P3-4 시작 흰 프레임과 스크롤바 모서리** (2026-11-05)
  - 무엇을 했나: M-4에서 나온 두 가지를 고쳤다. 시작할 때 테마 없는 흰 프레임이 보이고, 스크롤바 모서리가 흰색이었다.
  - 결과
    - `src-tauri/tauri.conf.json`: 창 `"visible": false`
    - `src-tauri/capabilities/default.json`: `core:window:allow-show` 추가(리더 승인)
    - `src/index.tsx`: 테마 적용과 첫 render 뒤 `finally`에서 `show()`. 테마 로드가 실패해도 창은 뜬다.
    - `src/editor/extensions.ts`: `::-webkit-scrollbar-corner`에 `--scrollbar-track-background`
    - 하드코딩 색은 쓰지 않았다. Rust 코드·의존성 변경은 없다.
  - 검증: V0/V1(`impl`). `npm run typecheck` 에러 0, `npm run test` 17/17, `cargo check` 경고 0, `tauri build` 성공. 화면 확인은 M-4-R1이다.

- **Phase 3 판정과 Phase 끝 검증** (2026-11-05)
  - 무엇을 했나
    - M-3: `measure`가 R-11 증분 파싱 시간을 쟀다. `tools/` 스크립트로 쟀고, 앱은 띄우지 않았다.
    - M-4: Phase 3 끝 V3와 줄 수 비교(D-18)를 했다.
    - M-4-R1: P3-4로 바뀐 항목만 다시 쟀다.
    - M-5: 일회성 측정 스크립트를 정리했다.
    - C-12: `check`가 검토하고 전체 테스트를 1회 돌렸다.
    - R-12: `writer`가 P0 요약표를 썼다(W-10).
  - 결과(판정)
    - **R-9**
      - HTML: 됨. `html.wasm` 로드, `.scm` 6개 컴파일, 술어 P-1~P-7, T-27.1, 범위 단위가 모두 통과다. V2 강조 247개다.
      - Markdown·JSON: 대기. 확장이 설치되어 있지 않다.
      - 로드가 실패한 문법이 없어 코어 비교는 해당 없음이다.
    - **R-10**
      - wasm·`.scm` 로드, 경로 사례, CSP 세 항목, 위반 0건: 충족
      - 확장 SVG 표시: 대기(아래 리더 결정)
    - **R-11 충족.** M-3 측정값
      - 조건: Node v22.22.3, i7-8700K, `web-tree-sitter` 0.27.1, Zed `html.wasm`, HTML 10.00 MiB(98,269줄), 위치당 워밍업 3 + 30회
      - 첫 전체 파싱: 2998ms
      - 한 글자 증분 파싱 중앙값: 맨 앞 0.629ms(0.588~0.966), 가운데 0.657ms(0.591~1.008), 끝 0.618ms(0.555~0.966). 편집 뒤에도 루트 `document`, `hasError` false다.
      - 통과 기준 수치는 원문에 없어 기록까지다. 장식 갱신 시간은 재지 않았다.
    - **R-12 충족.** `specs/v0.1/verify/P0-SUMMARY.md`
      - 됨: R-01, R-02, R-03, R-06, R-20, R-37
      - 대기: R-19(HTML 됨, Markdown·JSON), R-36(확장 SVG 표시)
      - 구조 판단: 프레임워크·편집기·구문 강조 모두 유지다. "다시 정함"이 없어 사용자에게 올릴 결정이 없다.
    - M-4 결과(빌드 exe, 1920x1080 100%)
      - `?theme=Catppuccin%20Latte`는 `zlext`를 거쳐 Latte 변수 24/24 일치
      - 시작 상태 HTML 강조: 247개, 클래스 6종
      - 불일치 둘(P3-4로 고침)
        - 시작 때 약 0.9초(325~1242ms) 창 전체가 `#ffffff`
        - 스크롤바 모서리 15x15가 `#ffffff`
    - M-4-R1 결과: 불일치 없음
      - 흰 프레임이 사라졌다. 5초간 263장에서 `#ffffff`는 0회다. 첫 앱 프레임(≤1066ms)부터 Mocha UI이고, 강조도 이미 있었다(1회 관찰).
      - 스크롤바 모서리 픽셀이 트랙 픽셀과 같다(Mocha·Latte).
      - 숨김→표시 뒤에도 최대화 버튼 hit test는 `HTMAXBUTTON`이고, 스냅 팝업이 뜬다.
    - 결과표: `specs/v0.1/verify/phase3.md`(M-3, M-4, M-4-R1, M-5 절), 이미지 `specs/v0.1/verify/phase3/`
  - 검증
    - `check` C-12 PASS. Phase 3 완료 조건을 충족했다(확장 SVG·Markdown·JSON은 대기 승인).
    - 전체 테스트 1회
      - `npm run typecheck` 에러 0
      - `npm run test` 17 pass / 0 fail
      - `cargo test` 1 pass
      - `cargo check` 경고 0
    - 지적 1·2(일회성 tools 스크립트)는 M-5로 정리했다. 지적 3(대기)은 리더 확인이다.
  - 리더 결정(사용자 위임 2026-11-05)
    - Catppuccin 임시 복사를 지우고 `zlext`로 설치 경로에서 읽는다. Phase 2의 D-9 어긋남이 풀렸다.
    - 확장 SVG는 대기다. 아이콘 테마 확장이 이 PC에 설치되어 있지 않다. SPEC 공통 시작 상태의 "확장 SVG가 보인다" 항목도 대기다.
    - 일회성 tools 스크립트를 정리했다(M-5).
      - 지운 것: `tools/measure-p1.mjs`, `measure-p2.mjs`, `measure-m4.mjs`, `measure-m4r1.mjs`
      - p1·p2는 git 기록(9f5ea8f / 6dd9580)에 남는다. m4·m4r1은 커밋된 적이 없다.
      - 남긴 것: `cdp-lib.mjs`, `win-input.ps1`, `png.mjs`, `theme-expect.mjs`, `hittest.ps1`, `capture-startup.ps1`, `count-lines.mjs`, `measure-m3.mjs`
    - R-9 dylink 우회(P3-2)와 R-11 증분 연동(P3-3) 카드는 `impl` 모델을 Opus 5.5 medium으로 바꿔서 했다(HERDR-SETUP 1절 배정대로).
    - `core:window:allow-show` 추가를 승인했다(P3-4).
  - 줄 수 비교(D-18)
    - 비교 대상: 이전 PoC 태그 `legacy-v0.1-poc`와 현재 작업 트리(미커밋 변경 포함)
    - 줄 기준: 전체 줄, 괄호 안은 비공백 줄이다.
    - 센 것: `src/**/*.{ts,tsx,css}`, `src-tauri/src/**/*.rs`, `tools/**`
    - 세지 않은 것: 문서·JSON 데이터·lock·아이콘·설정
    - 테스트: `src/**/*.test.ts`와 Rust `#[cfg(test)]` 줄부터 파일 끝까지

    | 구분 | 이전 PoC | 현재 | 차이 |
    | --- | --- | --- | --- |
    | 앱 코드 — `src/` (ts·tsx·css) | 3,171 (2,917) | 990 (893) | −2,181 |
    | 앱 코드 — `src-tauri/src/` (Rust, 테스트 블록 제외) | 821 (771) | 342 (318) | −479 |
    | **앱 코드 합계** | **3,992 (3,688)** | **1,332 (1,211)** | **−2,660** |
    | 테스트 — `src/**/*.test.ts` | 251 (225) | 311 (286) | +60 |
    | 테스트 — Rust `#[cfg(test)]` 블록 | 36 (34) | 46 (43) | +10 |
    | **테스트 합계** | **287 (259)** | **357 (329)** | **+70** |
    | `tools/` 정리 전(M-4) | 1,095 (1,007) | 1,891 (1,778) | +796 |
    | `tools/` 정리 후(M-5) | 1,095 (1,007) | 975 (913) | −120 |

    - 이전 PoC 앱 코드 3,171줄 안에는 `src/poc/` 9개 파일 1,736줄이 들어 있다.
    - 현재 `src/`에는 css 2개 86줄이 들어 있다. 이전 PoC는 css 파일이 없다.
    - 정리 후 `tools/` 파일별 줄 수
      - `win-input.ps1` 486, `measure-m3.mjs` 121, `cdp-lib.mjs` 83, `png.mjs` 70
      - `theme-expect.mjs` 61, `capture-startup.ps1` 58, `hittest.ps1` 49, `count-lines.mjs` 47
    - 같은 시점(M-5) `src/`는 1,000줄(비공백 903)이다. P3-4분이 늘었다. 표의 앱 코드 행은 M-4 값 그대로다.
    - 명령(저장소 루트)

    ```powershell
    node tools/count-lines.mjs legacy-v0.1-poc
    node tools/count-lines.mjs worktree
    git ls-tree -r --name-only legacy-v0.1-poc
    git grep -n "cfg(test)" legacy-v0.1-poc -- 'src-tauri/src/*.rs'
    ```

  - 특이사항
    - 테마와 문법 테스트(V1)는 설치 경로에서 확장 파일을 직접 읽는다. 그래서 이 PC에서만 돈다(SPEC R-9 판정 방법).
    - M-4-R1의 첫 프레임 강조는 1회 관찰이다. 항상 그렇다고 단정하지 않는다.

- **사용자 확인 필요 모음** (2026-11-05, v0.1 전체)
  - Markdown·JSON 확장 설치 뒤 R-9(03-tauri R-19) 판정. 사용자가 Zed에서 두 확장을 설치하면 같은 방식으로 로드하고 결과와 실패 사례를 적는다.
  - 아이콘 테마 확장 설치 뒤 확장 SVG 표시(R-10, 시작 상태). 어떤 SVG를 어디에 보일지는 리더가 정한다.
  - 네이티브 GDI 최대화 글리프와 DOM 기준 글리프의 안티앨리어싱 차이(Phase 2, V4)
    - 먹 범위는 같다.
    - 픽셀 최대 차는 Mocha 59, Mocha 최대화 상태 65, Latte 12다.
    - 원문에 통과 수치가 없다.
  - 비활성 창에서 최대화 버튼 hover 색은 근사값이다. 활성 타이틀 바 배경 기준으로 합성하며, 재지 않았다(Phase 2, V4).
  - 03-tauri 표의 `tauri-build` 버전 표기 차이(Phase 0)
    - 03-tauri 표는 2.12.5다.
    - 실제 크레이트는 2.7.x이고, 2.7.4를 썼다.
    - `docs/refs/`는 고치지 않았다.

## 사용자 요청 작업

### W-1 이전 PoC 보관과 삭제 (2026-11-04)

- 요청: v0.1을 같은 범위로 처음부터 다시 쓴다. 이전 PoC는 태그로만 남긴다.
- 조치
  - 태그 `legacy-v0.1-poc`를 9f83f8d에 달았다.
  - 이전 코드와 문서 253개 파일을 지웠다(커밋 e35eb6a).
- 결과: 남은 파일은 `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `INTENT.md`, `LICENSE` 다섯 개다.
- 검증: 커밋 통계가 253 files changed, 30291 deletions다. 태그가 9f83f8d를 가리킨다(`git rev-parse`).
- 상태: 완료.

### W-2 workbench-gpui 자산 들여오기 (2026-11-04)

- 요청: workbench-gpui의 `spec/`(수치 스펙)과 `docs/refs/`(Zed 명세)를 그대로 들여온다.
- 조치: gpui 자산 12개를 복사하고 `.gitignore`를 한 줄 고쳤다(커밋 616cda5).
  - `spec/` 셋
  - `docs/refs/01-zed/` 넷
  - `docs/refs/03-tauri/README.md`
  - `docs/refs/04-COMPARISON.md`
  - `docs/refs/README.md`
  - 기준 화면 PNG 둘
- 결과
  - `spec/`의 원본은 workbench-gpui로 둔다(D-1).
  - `docs/refs/README.md`의 `02-gpui/` 링크는 이 레포에서 끊겨 있다. `AGENTS.md`는 gpui 레포 경로로 참조한다.
- 검증: 복사한 12개 파일의 해시가 gpui 원본과 일치했다.
- 상태: 완료.

### W-3 루트 AGENTS.md 다시 쓰기와 INTENT 원칙 추가 (2026-11-04)

- 요청: 루트 `AGENTS.md`를 v0.1 재작성에 맞게 다시 쓰고, 루트 `INTENT.md`에 ponytail 원칙 두 줄을 더한다.
- 조치
  - `AGENTS.md`의 레포 규칙과 "에이전트 공통 지침" 0·1·2·3·3A·4·5·8·9장을 다시 썼다.
  - V2는 사용자 결정으로 되살렸다. 예외 조건은 조작 없는 1회 덤프다.
  - `INTENT.md`의 "변하지 않는 원칙"에 두 줄을 더했다.
  - 고친 차례: W-3, W-3-R1, W-3-R2.
- 결과: 커밋 b3f6d6d.
- 검증
  - `check` C-1은 REWORK였다(지적 10건). W-3-R1·R2로 고쳤다.
  - C-2는 PASS였다(10건 모두 해소, 새 문제 없음).
- 상태: 완료.

### W-4a 버전 INTENT (2026-11-04)

- 요청: `specs/v0.1/INTENT.md`를 쓴다.
- 조치
  - 초안을 썼다.
  - W-4a-R1에서 사용자 답을 반영했다: E-032 판정 제외, Markdown·JSON 판정 포함, 제외 셋 확정, 줄 수 비교 대상.
- 결과: 확정, 커밋 5708518.
- 검증
  - C-3은 REWORK였다(지적 3건: 제외 범위의 미정 문장, E-032 위치, R-19 범위).
  - C-4는 PASS였다(3건 해소).
- 상태: 완료.

### W-4b 버전 DECISIONS (2026-11-04)

- 요청: `specs/v0.1/DECISIONS.md`를 쓴다. 이전 D-1~D-16을 골라 새 번호로 다시 쓰고, 2026-11-04 사용자 결정을 넣는다.
- 조치
  - D-1~D-19를 썼다.
  - 이전 결정은 9개를 그대로 잇고, 4개를 고쳐 잇고, 3개를 버렸다.
  - W-4b-R1에서 미결 넷을 반영했다: 확장 루트 하나, cargo 정션 테스트, E-032 관찰값 기록 안 함, 이전 D-1·D-2 버림.
  - C-5 권고대로 "이전 결정 처리 표"를 "미결 사항" 앞으로 옮겼다.
- 결과: 확정, 커밋 c9eec6f.
- 검증: C-5는 PASS였다. 권고 1건(절 순서)은 반영했다.
- 상태: 완료.

### W-4c 버전 SPEC (2026-11-05)

- 요청: `specs/v0.1/SPEC.md`를 쓴다. 수치는 toml ID로만 적고, 측정 전용 코드에 기대는 판정은 쓰지 않는다.
- 조치
  - R-1~R-12를 썼다.
  - W-4c-R1에서 사용자 답을 반영했다.
    - 판정 제외: L-84 닫기 버튼 색, 테마 전환 시간, 10MB 장식 갱신 시간
    - V2 시작 상태를 요구로 둠
    - V3 대조 창 논리 1440x852
    - V1 프런트엔드 테스트 `node --test`
- 결과: 확정, 커밋 1fb6cde.
- 검증: C-6은 PASS였다(지적 없음).
- 상태: 완료.

### W-4d 버전 PLAN (2026-11-05)

- 요청: `specs/v0.1/PLAN.md`를 쓴다. 이전 PLAN의 Phase 나눔을 참고하되 ponytail로 줄인다.
- 조치
  - Phase 0~3과 진행 현황 표를 썼다.
  - W-4d-R1에서 사용자 답을 반영했다: Markdown·JSON 설치는 Phase 3 전, 미해결 실패 규칙 유지, 담당 이름은 HERDR-SETUP에서, CSP 세 항목은 Phase 3, 커밋은 Phase 끝 1회.
- 결과: 확정, 커밋 1a15baa.
- 검증: C-7은 PASS였다(지적 없음).
- 상태: 완료.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
