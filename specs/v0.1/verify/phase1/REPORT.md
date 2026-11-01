# Phase 1 검증 보고서 — SPEC R-1 · R-2

- 검증자: wt-checker (Claude Sonnet 5.5, 대체 모델). 날짜: 2026-11-01.
- 기준: `specs/v0.1/SPEC.md`의 "공통 판정 방식", "R-1", "R-2" 절. 기대값은 SPEC·01-zed 원문(`01-LAYOUT.md` E-002~E-030, `03-THEME-ICONS.md` T-05.05·T-25.02 Mocha 열)에서 직접 가져왔다. 앱이 낸 `pass` 값은 근거로 쓰지 않고, 덤프 원값을 기대값과 직접 대조했다.
- 대상: wt-runner-app의 `tauri dev` 인스턴스(CDP 9222). 코드는 고치지 않았다. 쓴 곳은 `specs/v0.1/verify/phase1/`뿐이다.
- 빌드 앱 확인: R-1·R-2 판정에는 필요하지 않아 하지 않았다(CSP는 R-11 몫이고 `csp-built-check.json`은 참고만 했다).
- 환경: devicePixelRatio 2(200%), 창 800×600 논리 px. 편집기 화면은 기준 화면이 없어 창 크기를 기준 화면에 맞추지 않았다(SPEC R-2 판정 방법: "편집기 화면 대조는 하지 않는다").
- 독립 대조: 앱의 `__poc` 시험 외에, 같은 항목을 다른 방법(DOM 표식 객체 비교, `getBoundingClientRect`·`getComputedStyle`·`path d` 직접 파싱)으로 다시 쟀다.

## R-1. Pane 사이로 탭을 옮겨도 EditorView가 살아남는다

판정 방법: PoC 결과표. 증거는 (1) 옮기기 전후 노드가 같은지 비교한 출력, (2) 전후의 스크롤·선택·커서 덤프.

| SPEC 항목 | 기대 | 실제 | 판정 | 증거 파일 |
| --- | --- | --- | --- | --- |
| 두 Pane이 있는 작은 PoC | Pane 2개, 탭 이동 가능 | p0(탭 a·b)·p1(탭 c), `⇄` 버튼으로 이동 | 충족 | `r1-move.png`, `r1-independent.png` |
| 탭 이동 후 `EditorView` DOM이 같은 객체 | 같은 객체 | 앱 시험: 탭 a를 p0→p1로 옮긴 뒤 `sameNode: true`, 인스턴스 번호 1→1. 독립 시험(실제 `⇄` 클릭): 이동 전 `.cm-editor`에 붙인 JS 참조·`data-checker-tag`가 이동 뒤 같은 객체(`el2 === 참조`), 인스턴스 3→3, 문서 안 `.cm-editor` 수 1개 | 충족 | `r1-move.json`, `r1-independent.json` |
| 이동 후에도 DOM이 목적지에 붙어 있다(파괴되지 않고 옮겨짐) | 목적지 Pane 슬롯의 자식, `isConnected` | `domSlot: p1`, `storePane: p1`, 전후 `connected: true`. 독립 시험도 `parentSlot` p0→p1, `isConnected` true | 충족 | `r1-move.json`, `r1-independent.json` |
| 스크롤 위치 유지 | 전후 차이 ±1 px (A-31.1) | 앱 시험 `scrollTop` 1200→1200. 독립 시험 900→900 | 충족 | `r1-move.json`, `r1-independent.json` |
| 선택 영역 유지 | 같은 anchor·head | 앱 시험 `{anchor:2000, head:2100}` 전후 동일 (독립 시험의 탭 b는 선택이 기본 0..0이어서 선택 증거는 앱 시험에 의존) | 충족 | `r1-move.json` |
| 커서 위치 유지 | 같은 줄·열 | `{line:37, col:1}` 전후 동일 | 충족 | `r1-move.json` |
| 부모 구조가 바뀌어 Pane 컴포넌트가 다시 만들어져도 `EditorView` 유지(R-1 요구: "컴포넌트 트리가 바뀌어도") | 같은 객체, 같은 인스턴스, 스크롤·선택·커서 유지 | 앱 시험(row↔nested): `sameNode`·`sameInstance`·스크롤 1200·선택 2000..2100·커서 37:1 모두 유지. 독립 시험: `[data-poc-pane]` 요소는 모두 새로 만들어졌고(`paneComponentsRecreated: true`) `.cm-editor`는 같은 객체, 인스턴스 3→3, 스크롤 700→700 | 충족 | `r1-restructure.json`, `r1-restructure-independent.json` |
| 실패 시 React 19 비교 결과 | 실패했을 때만 필요 | 실패 항목이 없어 해당 없음 | 해당 없음 | — |

**R-1 종합: 충족.**

## R-2. CM6로 Zed 편집기 규격을 맞출 수 있는지 측정

- 쓴 글꼴: **Consolas** 15px (`.cm-scroller` 계산된 스타일의 `font-family`, 시스템 고정폭). 같은 글꼴로 캔버스에서 "0"의 폭 `ch` = 8.2471 px, `fontBoundingBoxDescent` = 4 px(정수로 돌려준다). 기대값은 이 메트릭으로 계산했다(SPEC R-2: 측정 글꼴 이름을 보고서에 적는다).
- 허용 오차 ±1 논리 px (A-31.1). 기대값 상수는 위에서 말한 원문에서 가져왔으며, `src/poc/specExpected.ts`의 값(24.27, 3.64, 7.28, 15, 3ch, 4ch, `#cdd6f412`, `#9399b240`)도 원문과 같음을 확인했다.

| SPEC 항목 (ID) | 기대 | 실제 | 판정 | 증거 파일 |
| --- | --- | --- | --- | --- |
| 글꼴 크기 (L-08) | 15 px | `.cm-scroller` 15px | 충족 | `r2-raw-independent.json` |
| E-002 줄 번호 폭, 300줄 | max(3자리, 4자리 최소) × ch = 4 × 8.2471 = 32.99 px | 거터 90.703 − padding 24.741 − 32.988 = 32.974 px (앱 측정 32.974) | 충족 (차 0.01) | `r2-raw-independent.json`, `r2-measure.json` |
| E-002 줄 번호 폭, 10000줄(5자리) | 5 × 8.2471 = 41.235 px | 거터 98.961 − 24.741 − 32.988 = 41.231 px | 충족 (차 0.004) | `r2-raw-10000.json`, `r2-measure-10000.json` |
| E-003 거터 왼쪽 여백 | 3 ch = 24.741 px | 줄 번호 칸 `padding-left` 24.7412 px | 충족 | `r2-raw-independent.json` |
| E-004 거터 오른쪽 여백 | 4 ch = 32.988 px | `padding-right` 32.9883 px | 충족 | `r2-raw-independent.json` |
| E-005 거터↔본문 간격 | \|descent\| = 4 px (측정 글꼴 메트릭) | 거터 오른쪽 끝 91.703 → 첫 글자 왼쪽 95.703 = 4.000 px | 충족 | `r2-raw-independent.json` |
| E-010 줄 높이 | 15 × 1.618 = 24.27 px | `.cm-line` 높이 24.2734 px, `view.defaultLineHeight` 24.2734 px, 계산된 `line-height` 24.27px | 충족 | `r2-raw-independent.json`, `r2-sel-independent.json` |
| E-011 빈 커서: 강조 줄 수 | 1줄(본문)과 거터 칸 | 본문 `.zl-activeLine` 1개, 거터 칸 1개 | 충족 | `r2-sel-independent.json` |
| E-011 왼쪽 끝 | 편집기 왼쪽 끝(거터 포함) = 1 px | 거터 칸 left 1, 편집기 left 1 | 충족 | `r2-sel-independent.json` |
| E-011 오른쪽 끝 | 편집기 오른쪽 끝 | 본문 강조 right 784 = 스크롤바 안쪽 끝(스크롤러 left + `clientWidth` = 784). 편집기 박스 right는 799이고 그 사이 15 px는 스크롤바 | 충족 — 해석 주의(아래) | `r2-sel-independent.json` |
| E-011 높이 | 1줄 = 24.27 px | 본문 강조 24.2734, 거터 칸 24.2734 | 충족 | `r2-sel-independent.json` |
| E-011 색 | `#cdd6f412` = rgba(205, 214, 244, 0.07) | 본문·거터 모두 `rgba(205, 214, 244, 0.07)` (0x12/255 = 0.0706) | 충족 | `r2-sel-independent.json` |
| E-011 비어 있지 않은 선택이 있는 줄 | 강조 0줄 | 같은 줄에 비어 있지 않은 선택을 주었을 때 `.zl-activeLine` 0개, 거터 강조 칸 없음. 세 줄 선택일 때도 0줄 | 충족 | `r2-sel-independent.json` |
| E-015 한 줄 선택 | 바깥 모서리 4개, 반지름 3.64 px | 경로 1개, 호(`A`) 4개, 모두 3.641 | 충족 | `r2-sel-independent.json` |
| E-015 세 줄 선택(3줄 11열 → 5줄 21열) | 경로 1개에 바깥 모서리 6개(3.64), 안쪽 꺾인 모서리 2개(7.28) | 경로 1개, 호 8개: 3.641 × 6(sweep 1), 7.281 × 2(sweep 0) | 충족 | `r2-sel-independent.json`, `r2-editor-selection.png` |
| E-015 색 | `#9399b240` = rgba(147, 153, 178, 0.25) | 경로 `fill` `rgba(147, 153, 178, 0.25)` (0x40/255 = 0.251) | 충족 | `r2-sel-independent.json` |
| E-030 스크롤바 두께 | 15 px | `offsetWidth − clientWidth` = 798 − 783 = 15, `::-webkit-scrollbar` width 15px | 충족 | `r2-raw-independent.json` |
| 항목별 PoC 결과표(기대·측정·통과/실패) | 필수 ID 8개 모두 있음 | `r2-measure.json`·`r2-measure-10000.json`에 E-002, 003, 004, 005, 010, 011, 015, 030 행이 모두 있고 `failed: []` | 충족 | `r2-measure.json`, `r2-measure-10000.json` |
| 편집기 탭 스크린샷 | 편집기 탭이 보이는 창 | 거터·줄 번호·현재 줄 강조·선택·스크롤바가 보이는 창 | 충족 | `r2-editor.png`, `r2-editor-10000.png`, `r2-editor-selection.png`, `r2-sel-independent.png` |

**R-2 종합: 충족.**

## 주의·한계 (판정에는 영향 없음)

1. **E-011 오른쪽 끝의 해석.** SPEC은 "편집기 왼쪽 끝부터 오른쪽 끝까지"라고만 쓴다. 구현은 오른쪽 끝을 스크롤바 안쪽 끝(784)으로 잡았고, HOWTO도 그렇게 적었다. 편집기 박스 오른쪽 끝(799)으로 읽으면 15 px 차이가 난다. Zed의 스크롤바는 본문 위에 얹히는 요소이므로 안쪽 끝이 맞다고 보지만, 이 값은 소스 원문에서 확정되지 않았다. 사람이 정할 일이면 결정이 필요하다.
2. **E-005 descent.** 브라우저의 `fontBoundingBoxDescent`는 정수(4)로 나온다. Consolas의 실제 descent는 약 3.2 px로 보여 오차 ±1 안이다. 실제 글꼴 메트릭을 더 정확히 읽는 값은 따로 얻지 못했다. SPEC도 글꼴마다 다르다고 적었다.
3. **독립 시험의 선택 증거.** 독립 이동 시험은 탭 b(선택 0..0)로 했다. 선택 보존은 앱 시험(2000..2100)과, 같은 앱 상태 객체의 덤프에 의존한다. 이 값은 앱이 `EditorView` 상태에서 읽은 것이므로 원값으로 보았다.
4. **시험 뒤 앱 상태.** 시험으로 탭 a·b가 p1로 옮겨져 p0이 비어 있다. 부모 구조는 `row`로 되돌렸다. 선택은 문서 처음 커서로, 문서는 300줄로 되돌렸다. tauri dev 인스턴스는 끄지 않았다.
5. **창 크기.** 편집기 화면은 800×600 논리 px(DPR 2)에서 찍었다. SPEC상 편집기 화면은 기준 화면과 비교하지 않으므로 창 크기를 기준 화면에 맞추지 않았다.

## 불충족 항목

없음.

## 파일

| 파일 | 내용 |
| --- | --- |
| `r1-move.json` · `.png` | 앱 `runMoveTest` 덤프(탭 a, p0→p1) |
| `r1-restructure.json` · `.png` | 앱 `runRestructureTest` 덤프 |
| `r1-independent.js` · `.json` · `.png` | 독립 시험: 실제 `⇄` 클릭, DOM 표식 객체 비교 |
| `r1-restructure-independent.json` | 독립 시험: 부모 구조 변경 뒤 객체 비교 |
| `r2-measure.json` · `r2-editor.png` | 앱 `measure()` (300줄) |
| `r2-measure-10000.json` · `r2-editor-10000.png` | 앱 `measure()` (10000줄) |
| `r2-raw-independent.json` | 거터·padding·간격·스크롤바 DOM 원값 |
| `r2-raw-10000.json` | 10000줄 거터 원값 |
| `r2-sel-independent.js` · `.run.js` · `.json` · `.png` | 선택 경로 `A` 호, 현재 줄 강조 원값 |
| `r2-editor-selection.png` | 세 줄 선택이 보이는 편집기 화면 |
