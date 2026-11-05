# Phase 1 끝 V3 실측 (카드 v04-M1, SPEC R-12·R-13)

## 1. 측정 조건

- 앱: `npm run tauri build -- --debug --no-bundle`로 레포 소스(P1-1·P1-2 변경이 들어 있는 작업 트리)를 새로 만든 exe(2026-11-06 07:42:25). 창 클라이언트 논리 1440×852, 배율 100%(DPI 96, `devicePixelRatio` 1), 주 모니터 작업 영역 1920×1032, 테마·글꼴 기본.
- 시험 폴더: `%TEMP%\wb-v04-m1\root`(`sample.txt` 12줄, `sub\inner.txt`)만 등록. 사용자 실제 폴더는 등록하지 않았다. `sample.txt`의 줄은 `L00 abcdefghijklmnopqrstuvwxyz0123456789`처럼 길이가 모두 같다.
- 앱 데이터: `%APPDATA%\workbench-tauri`에는 `state.json`만 있었다(SHA-256 `77EF33FF…07C99`). 시험 폴더 하나만 적은 `state.json`으로 바꿔 두고 측정했고, 끝에 원래 파일을 되돌려 해시가 같음을 확인했다. 시험 폴더는 지웠다.
- 입력: 실제 OS 입력(SendInput). `tools/win-input.ps1`의 임시 사본(`drag`가 `-Mods`를 받게 한 줄만 다름, scratch에만 있고 `tools/`는 바꾸지 않았다)으로 보냈다. 대상은 `-ProcessId`로 고정했고 이벤트마다 전경 창을 확인하는 도구의 가드를 썼다. 입력 전후 키보드 배열 `0x0412` 그대로, 남은 눌림 없음(`releasedOnExit` 없음).
- 관측: 값은 CDP(`--remote-debugging-port=9222`)로 `getComputedStyle`·`getBoundingClientRect`·CM6 선택 상태를 읽었다. 키·마우스 이벤트 관측기는 CDP로 페이지에 심었고 앱 코드에는 아무것도 넣지 않았다. 일회성 스크립트는 scratch에만 있고 `tools/`에 남기지 않았다.
- 앱 실행: 2회. 첫 실행은 내 스크립트가 CM6 뷰를 찾는 속성 이름이 틀려(`cmView`, 이 버전은 `cmTile.root.view`) 입력 직전에 끝났다. 판정은 둘째 실행 값만 쓴다. 최대화 버튼에는 마우스를 올리지 않았다.
- 스크린샷: `phase1-columns.png` 한 장(편집기 영역 640×300, 35.9KB).

## 2. 요약

- 판정 행 15개: 통과 14, 불일치 1(F-1).
- F-1: Ctrl+Shift 끌기 열 선택에서 끌기 전에 있던 커서가 선택 범위로 남는다(열 선택 6줄 + 남은 커서 1개 = 7개).

## 3. 판정 표

### 3.1 `editor.cursor_width` (E-012, 기대 2px)

탭을 연 뒤 편집기를 실제로 클릭해 커서를 만들고 `.cm-cursor`를 읽었다.

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| E-012 | `.cm-cursor.cm-cursor-primary` 계산된 `border-left-width` | 2px | 2px(`border-left-style: solid`) | 통과 |
| E-012 | 같은 요소 `getBoundingClientRect().width` | 2px | 2 | 통과 |
| E-012 | 열 선택 뒤 `.cm-cursor` 7개 전부의 `border-left-width` | 2px | 2px ×7 | 통과 |

참고(기대 없음): `margin-left`는 CM6 기본 `-0.6px`다.

### 3.2 Ctrl+Shift 끌기 열 선택 (E-047 첫 항목)

시작: 먼저 2째 줄 3열을 클릭해 커서를 둔다(`sample.txt`가 열린 직후 편집기에 커서가 하나 있는 상태). 그다음 Ctrl+Shift를 누른 채 3째 줄 5열에서 8째 줄 15열까지 마우스로 끌었다(화면 (710,153)→(792,274), 25단계). 줄은 1부터, 열은 줄 시작부터 센 글자 수다. 끌기 동안 이벤트의 `ctrlKey`·`shiftKey`가 모두 true였다.

기대: 마우스 위치부터 열 선택. 줄 3~8마다 범위 하나, 모두 5열→15열(anchor→head).

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| E-047 | 열 선택 줄 3 | 5→15 | 5→15 | 통과 |
| E-047 | 열 선택 줄 4 | 5→15 | 5→15 | 통과 |
| E-047 | 열 선택 줄 5 | 5→15 | 5→15 | 통과 |
| E-047 | 열 선택 줄 6 | 5→15 | 5→15 | 통과 |
| E-047 | 열 선택 줄 7 | 5→15 | 5→15 | 통과 |
| E-047 | 열 선택 줄 8 | 5→15 | 5→15 | 통과 |
| E-047 | 선택 범위 수 | 6 | **7**: 위 6개 + 끌기 전 커서(줄 2, 3열, anchor=head) | **불일치 F-1** |

끌기 중 범위 수 변화(관측기): 3 → 4 → 6 → 놓은 뒤 7. 끌기 전 1.

F-1 원인(소스로 확인, 앱 코드 변경 없이): `rectangularSelection`은 `view.state.facet(clickAddsSelectionRange)`가 비어 있으면 Windows에서 `event.ctrlKey`를 "범위 더하기"로 읽고(`@codemirror/view` `addsSelectionRange`), 더하기이면 `ranges.concat(startSel.ranges)`로 끌기 전 선택을 남긴다(`rectangleSelectionStyle`의 `get`). Ctrl+Shift 끌기는 Ctrl이 눌려 있어 항상 더하기다.
판정 근거: E-047이 Ctrl+Shift("마우스 위치부터")와 Alt+Shift("기존 선택에서부터")를 구분해 적었다. 끌기 전 커서가 남는 것이 "마우스 위치부터"와 어긋나는지는 원문(E-047)이 끌기 전 선택을 어떻게 한다고 적지 않아서, 어긋난다고 읽은 것은 내 해석이다. leader 판단이 필요하다.

### 3.3 십자 커서 없음 (P1-2에서 `crosshairCursor` 제거)

Ctrl만 눌렀을 때, Ctrl+Shift를 눌렀을 때, 끌기 중, 놓은 뒤에 `.cm-editor`·`.cm-scroller`·`.cm-content`와 포인터 아래 요소의 `cursor` 계산값을 읽었다(관측 6회).

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| E-047 | 클래스 `cm-crosshair`(`.cm-editor`·`.cm-scroller`) | 없음 | 6회 모두 없음 | 통과 |
| E-047 | `cursor` 계산값 | `crosshair` 아님 | 모두 `auto`(포인터 아래 요소 포함) | 통과 |

### 3.4 `typography.size.default` (L-05, 기대 14px)

| ID | 대상 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| L-05 | 트리 이름 `.tree-label`(`root`·`sub`·`sample.txt` 3개) | 14px | 14px ×3 | 통과 |
| L-05 | 탭 제목 `.tab-title`(`sample.txt`, 탭 연 뒤) | 14px | 14px(탭 열림 직후, 열 선택 뒤에도 14px) | 통과 |
| L-05 | 타이틀 바 폴더 이름 `.project-name`(`root`) | 14px | 14px | 통과 |

참고(기대 없음): `--typography-size-default` 계산값은 `0.875rem`, `--editor-cursor-width`는 `0.125rem`(루트 16px 기준 14px·2px). 줄 높이가 고정된 곳의 `scrollHeight`와 `clientHeight`는 같았다: 트리 이름 20/20, 탭 제목 31/31, 폴더 이름 버튼 22/22(글자 잘림 신호 없음. 눈으로 본 판정은 아니다).

## 4. 불일치 목록 (leader에게)

| 번호 | 스펙 ID | 기대 | 측정 | 비고 |
| --- | --- | --- | --- | --- |
| F-1 | E-047 첫 항목 | 열 선택 범위만(6개) | 끌기 전 커서가 남아 7개 | 원문이 끌기 전 선택 처리를 적지 않음. 기대는 내 해석 |

## 5. 측정 불가·범위 밖

- 없음. 카드의 측정 목록(커서 폭, 열 선택, 십자 커서 없음, 14px 세 곳)을 모두 쟀다.
- 측정 목록에 없어 재지 않은 것: Ctrl+클릭 다중 커서. 소스상 같은 이유(`clickAddsSelectionRange` 미설정 + `allowMultipleSelections` true)로 Windows에서 Ctrl+클릭이 범위를 더하게 되어 있을 것으로 읽히나, 앱에서 확인하지 않았다.

## 6. 산출물

- `specs/v0.4/verify/phase1-columns.png`: 열 선택 직후 편집기 영역(줄 3~8의 5~15열이 선택된 모습).

## 7. 재측정 R1 (카드 v04-M1-R1, F-1만)

수정 확인: `src/editor/extensions.ts`에 `EditorView.clickAddsSelectionRange.of((e) => e.altKey)`가 더해졌다(레포 소스). 그 소스로 debug 빌드를 새로 만든 exe(2026-11-06 07:47:38)를 1회 실행했다.

### 7.1 조건

- 3장·1장과 같다: 창 논리 1440×852, DPI 96, 시험 폴더 `%TEMP%\wb-v04-m1\root`의 `sample.txt`(줄 길이 모두 같음), `%APPDATA%\workbench-tauri\state.json` 백업·복구(SHA-256 `77EF33FF…07C99` 일치 확인), 실제 OS 입력(PID 고정, 전경 가드, `drag` 임시 사본). 키보드 배열 `0x0412` 그대로, 남은 눌림 없음. 시험 폴더는 지웠고 남은 프로세스 없음. `tools/` 변경 없음. 앱 실행 1회.
- 순서(앞 단계의 선택 상태가 다음 단계의 시작 상태): A 일반 클릭 → B Ctrl+Shift 끌기 → C Ctrl+클릭 → D Alt+클릭. 각 입력의 `mousedown`·`mouseup`에서 `ctrlKey`·`shiftKey`·`altKey`를 페이지에 심은 관측기로 기록했다(앱 코드 변경 없음). 값은 CM6 `state.selection.ranges`를 줄(1부터)·열로 읽었다.

### 7.2 판정 표

| ID | 입력 | 시작 선택 | 기대 | 측정(anchor→head: 줄·열) | 판정 |
| --- | --- | --- | --- | --- | --- |
| A | 줄 2 3열 일반 클릭 | (탭을 연 직후) | 범위 1개, 줄 2 3열 | `[2:3→2:3]`(1개) | 통과 |
| E-047 (F-1) | Ctrl+Shift 끌기 줄 3 5열→줄 8 15열. 이벤트 ctrl·shift = true, alt = false | A의 줄 2 3열 커서 | 새 열 범위 6개만, 끌기 전 커서 없음 | `[3:5→3:15]` `[4:5→4:15]` `[5:5→5:15]` `[6:5→6:15]` `[7:5→7:15]` `[8:5→8:15]`(6개). 줄 2 3열 없음 | 통과 |
| C | Ctrl+클릭 줄 10 8열. 이벤트 ctrl = true, shift·alt = false | B의 6개 범위 | 범위를 더하지 않는다: 1개, 줄 10 8열 | `[10:8→10:8]`(1개) | 통과 |
| D | Alt+클릭 줄 11 4열. 이벤트 alt = true, ctrl·shift = false | C의 줄 10 8열 | 범위를 더한다: 2개 | `[10:8→10:8]` `[11:4→11:4]`(2개) | 통과 |

참고(기대 없음): Alt 클릭 뒤에도 탭은 1개, 키보드 배열 그대로.

### 7.3 결과

- F-1 해소: Ctrl+Shift 끌기 뒤 범위는 새 열 범위 6개뿐이다(이전 측정 7개).
- 이전 측정 메모의 "Ctrl+클릭이 범위를 더할 수 있다"는 소스 추정이었고, 수정 뒤 앱에서 더하지 않음을 쟀다. Alt+클릭은 더한다.
- 판정 행 4개: 통과 4, 불일치 0.
