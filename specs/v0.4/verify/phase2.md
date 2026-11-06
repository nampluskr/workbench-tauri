# Phase 2 끝 V3 실측 (카드 v04-M2, SPEC R-2~R-7, 03-tauri R-08·R-10·R-15·R-24·R-38)

## 1. 측정 조건

- 앱: `npm run tauri build -- --debug --no-bundle`로 레포 소스(P2-C1·P2-1·P2-2 변경이 들어 있는 작업 트리)를 새로 만든 exe(2026-11-06 08:25:49). 빌드 뒤 `src/`·`src-tauri/src/`·`package.json`·`index.html`에 더 새 파일 없음. 창 클라이언트 논리 1440×852, 배율 100%(DPI 96, `devicePixelRatio` 1), 주 모니터 1920×1080, 키보드 배열 `0x0412`(한국어), 테마·글꼴 기본.
- 시험 폴더: `%TEMP%\wb-v04-m2\` 아래만(`root`와 `f1`~`f3`). 사용자 실제 폴더는 등록하지 않았다. 인코딩 시험 파일은 `test-fixtures/encoding/`의 사본이다.
- 앱 데이터: `%APPDATA%\workbench-tauri`에는 `state.json`만 있었다(SHA-256 `77EF33FF…07C99`). 시험 폴더만 적은 `state.json`을 써 두고 측정했고, 끝에 원래 파일을 되돌려 해시가 같음을 확인했다.
- 입력: 실제 OS 입력(SendInput). `tools/win-input.ps1`의 C# 입력 코드를 실행 때 꺼내 쓰는 일회성 상주 스크립트(scratch, `tools/`에 남기지 않음)로 보냈다. 대상은 PID로 고정했고 이벤트마다 전경 창을 확인하는 도구의 가드를 그대로 썼다. TaskDialog에는 그 창의 HWND를 대상으로 키(Esc·Enter)를 보내거나 UI Automation으로 버튼을 눌렀다(`InvokePattern`). 최대화 버튼에는 마우스를 올리지 않았다. 창 닫기 시험은 Alt+F4와 제목 줄 닫기 버튼(맨 오른쪽 칸)을 썼다.
- 관측: 탭·편집기·알림은 CDP(`--remote-debugging-port=9222`)로 `getComputedStyle`·DOM 클래스·CM6 문서 텍스트를 읽었다. TaskDialog는 UI Automation(제목·버튼 이름·순서·키보드 초점)과 창 스크린샷으로 읽었다. 디스크는 바이트·수정 시각(ns)·폴더 목록으로 읽었다. 측정용 코드는 앱에 넣지 않았다. 페이지에는 CDP로 이벤트 기록기와 비교용 `<textarea>`(IME 기준선)를 임시로 심었고 시험이 끝날 때 지웠다.
- **UI Automation 한계(측정 방법 메모)**: 한 앱 프로세스에서 **처음 뜨는 TaskDialog만** 본문 텍스트(`MainInstruction`·`ContentText`)가 나온다. 두 번째부터는 같은 창인데도 버튼 이름·순서·초점 칸만 나오고 본문이 비어 있다(별도 프로세스로 읽어도 같음). 그래서 본문 문구는 처음 뜬 창의 UIA 값과, 종류마다 한 장씩 찍은 창 스크린샷(`phase2-e08*.png`)을 직접 보고 글자 단위로 대조했다.
- 앱 실행: 17회. 이 가운데 측정 도구 디버깅이 11회다(UIA가 대화상자를 못 찾음, 속성 이름·함수 이름 오류, 두 번째 창부터 본문이 안 읽히는 한계 확인 등 — 앱 결과가 아니라 내 스크립트 문제). 판정에는 마지막 정상 실행 6회의 값만 썼다: 편집·인코딩·저장 / 임시 탭 편집·잠긴 파일 / 닫기 질문·충돌·지워진 파일 / 폴더 해제·Quit·창 닫기 / 10MB·IME·제목 줄 닫기 / E-083 답·임시 탭 포커스 재확인.
- 스크린샷: `phase2-e081.png`·`phase2-e081-long-path.png`·`phase2-e082.png`·`phase2-e083.png`·`phase2-e084.png`·`phase2-e085.png`(창 크롭 각 366×161~233, 7~9KB), `phase2-tab-dot.png`(탭 크롭 200×40, 1.4KB). 모두 300KB 이하.
- 정리: `state.json` 복구(SHA 일치), 시험 폴더·임시 백업 삭제, 남은 workbench-tauri 프로세스 없음. `tools/` 변경 없음.

## 2. 요약

- 판정 행 81개: 통과 77, 기록 3(기준 수치 없는 10MB 측정), 불일치 1(F-1).
- F-1: 임시 탭에서 처음 한 글자를 치면 탭이 일반 탭으로 바뀌는 순간 편집기가 포커스를 잃어, 이어 치는 글자·Backspace·Ctrl+Z가 편집기에 들어가지 않는다(3장 3.3).
- 기준 수치가 없는 측정(10MB 반영 시간, IME 기준선 비교)은 값을 기록했다.

## 3. 판정 표

### 3.1 탭 모양 (L-25, L-65, L-66, I-071, I-073, E-086, E-087)

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| L-25 `tab.start_slot` | 시작 슬롯 크기 | 12×12 | 12×12 | 통과 |
| L-25 `tab.end_slot` | 끝 슬롯(닫기 버튼) 크기 | 14×14 | 14×14 | 통과 |
| L-06 `icons.size.small` | 닫기 아이콘 크기 | 14 | 14×14 | 통과 |
| L-65 `tab.indicator_size` | 수정 점 크기(수정 상태의 계산값) | 10 | 10px × 10px | 통과 |
| L-65 | 깨끗한 탭에는 점이 없다 | 점 없음 | `display: none`(열었을 때, 저장 뒤 6개 파일 모두) | 통과 |
| I-071 | 수정 점 색 = Accent 토큰 | `--text-accent` `#cba6f7ff` | `rgb(203, 166, 247)`, 토큰과 같음 | 통과 |
| E-086, L-65 | 충돌 점 색 = Warning 토큰 | `--warning` `#f9e2afff` | `rgb(249, 226, 175)`, 토큰과 같음 | 통과 |
| E-087 | 지워진 파일 탭 제목 취소선 | line-through | `text-decoration-line: line-through` | 통과 |
| E-087 | 지워진 비지 않은 탭은 수정됨 | 점 보임 | 점 `block`, Accent 색 | 통과 |
| L-66, I-073 | 닫기 버튼은 hover 때만 보인다 | 탭 위 보임 / 밖 숨김 | `visible` / `hidden` | 통과 |

탭 크롭: `phase2-tab-dot.png`(수정한 `v-edit.txt` 탭).

### 3.2 편집·되돌리기·IME·큰 파일 (R-2, E-059c, 03-tauri R-08·R-10)

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| R-2 | 열린 파일을 편집할 수 있다 | 글자가 들어감 | 6개 인코딩 파일·일반 탭에 `X` 입력이 문서에 반영 | 통과 |
| I-063 | 임시 탭을 편집하면 일반 탭으로 바뀐다 | `preview` 클래스 사라짐 | 사라짐(`tab active preview` → `tab active`) | 통과 |
| I-063 | 승격 뒤에도 편집기에서 이어 칠 수 있다 | 초점 유지 | **초점이 `BODY`로 감**, 이어 친 글자 무시(3.3) | **불일치 F-1** |
| R-2, S-1 | 입력 뒤 되돌리면 깨끗 | 점 사라짐 | `u-undo` 모든 묶음을 되돌렸을 때 `display: none` | 통과 |
| R-2, S-1 | 친 글자를 지워 문서가 저장 기준과 같아지면 깨끗(앱 결정) | 점 사라짐 | X 입력 → Backspace → `display: none`, Ctrl+W 때 묻지 않음 | 통과 |
| E-059c | Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z | 되돌리기·다시 실행 | 4번 되돌리기·4번 다시 실행(Ctrl+Y, Ctrl+Shift+Z 번갈아) 결과가 기대와 같음 | 통과 |
| E-059c `editor.undo.group_interval` 300 | 간격 100ms → 한 묶음 | 1·2·3이 함께 | 한 번에 `…123` → 기본 | 통과 |
| E-059c | 간격 250ms → 한 묶음 | 4·5가 함께 | 한 번에 `…12345` → `…123` | 통과 |
| E-059c | 간격 350ms → 두 묶음 | 6, 7이 따로 | 7, 6이 각각 | 통과 |
| 03-tauri R-08 | 한글 조합(ㅎㅏㄴㄱㅡㄹ → 한글) 뒤 Enter | 편집기와 네이티브 `<textarea>`가 같음, 글자 잘림·겹침 없음 | 두 곳 모두 `한글` + 줄바꿈, 이벤트 열(`compositionstart/update/end`, `insertCompositionText`, `insertLineBreak`)까지 같음 | 통과 |
| 03-tauri R-08 | … 뒤 Escape | 같음 | 둘 다 `한글` 확정(조합 취소 없음) | 통과 |
| 03-tauri R-08 | … 뒤 Left / Right | 같음 | 둘 다 `한글` 확정 뒤 캐럿이 1칸 왼쪽 / 그대로 끝 | 통과 |
| 03-tauri R-08 | … 뒤 Up / Down | 같음 | 둘 다 `한글` 확정, 캐럿 위치 같음 | 통과 |
| 03-tauri R-08 | … 뒤 Space | 같음 | 둘 다 `한글` + 공백 | 통과 |
| 03-tauri R-10 | 10MB HTML(10,485,817 바이트) 열기(더블 클릭 → 문서 전체가 편집기에) | 기록 | 584ms | 기록 |
| 03-tauri R-10 | 한 글자 입력: 키 누름 → 문서 반영 → 그려짐(두 프레임 뒤) | 기록 | 12번(문서 위·가운데·끝 각 4번): 반영 중앙값 16.3ms(최대 35.4), 그려짐 중앙값 63.7ms(최대 135.0) | 기록 |
| 03-tauri R-10 | 같은 길이 바꾸기(한 글자 선택 뒤 다른 글자, 전체 비교 경로) | 기록 | 위 133.7ms, 가운데 46.8ms, 끝 39.4ms(각 1번) | 기록 |

- IME: Microsoft 한글 입력기(두벌식), 시험 시작 때 입력기는 영문 모드였다. 한/영 키를 한 번 눌러 한글 모드로 바꾸고 끝나면 다시 눌러 되돌렸다. 기준선은 페이지에 임시로 심은 `<textarea>`다(같은 키 순서, 같은 창).
- 10MB 값은 처음 한 번(위쪽 135.0ms, 133.7ms)이 웜업을 포함한다. 12번과 1번씩이라 통계는 아니다. 그려짐은 키 이벤트 시각부터 문서 변경을 본 프레임 뒤 두 프레임까지다(`requestAnimationFrame` 두 번, 60Hz 기준 약 33ms 포함). 표준 Event Timing 항목(`keydown`·`input` 등)의 `duration`은 16~64ms였다.

### 3.3 불일치 F-1: 임시 탭 편집 승격 때 편집기가 포커스를 잃는다

임시 탭(파일 한 번 클릭)에서 편집기를 클릭하고 글자를 입력했다.

| 단계 | 임시 탭 `v-edit.txt` | 일반 탭 `u-undo.txt`(더블 클릭) |
| --- | --- | --- |
| 클릭 직후 `document.activeElement` | `DIV.cm-content` | `DIV.cm-content` |
| `X` 입력 뒤 | 문서 `v-editX`, 탭 `preview` 사라짐, **`BODY`** | 문서 `u-undoX`, `DIV.cm-content` |
| 이어 `Y` 입력 | **문서 그대로 `v-editX`**(글자 무시) | `u-undoXY` |
| Ctrl+Z | **변화 없음**, 점 그대로 | `u-undoX` |

- 같은 현상이 1회차(S1: Ctrl+Z·Ctrl+Y·Backspace 모두 무시)와 별도 재확인(4번째 묶음)에서도 나왔다.
- 편집기를 다시 클릭하면 `DIV.cm-content`로 돌아오고, 그 뒤 Ctrl+Z는 되돌려져 점이 사라졌다(되돌리기 기록은 남아 있다).
- 원인 추정(소스 읽기만, 앱에서 확인 안 함): `context.ts`의 `promote`가 탭 객체를 새로 만들어 `Pane.tsx` `PaneBody`의 렌더 효과가 다시 돌고 `body.replaceChildren(view.dom)`으로 같은 편집기 DOM을 뗐다 붙이면서 포커스가 풀린다. 고치는 방법은 leader가 정한다.
- 인코딩 왕복(3.4)은 모두 일반 탭(더블 클릭)으로 열어 한 글자만 쳤으므로 이 결함의 영향을 받지 않았다.

### 3.4 저장·인코딩 (R-4, R-5, 03-tauri R-38)

모든 파일은 일반 탭으로 열어 첫 줄 끝을 클릭하고 `X` 한 글자를 넣은 뒤 Ctrl+S를 눌렀다. 기대 바이트 = 열 때 바이트의 첫 줄 끝 앞에 `X`(해당 인코딩의 바이트)를 끼운 것이다. 원본 내용은 `한글 A` + 줄바꿈 + `둘째 줄` + 줄바꿈이다. 모든 파일에서 열었을 때 문서는 `한글 A\n둘째 줄\n`이고 저장 뒤 문서는 `한글 AX\n둘째 줄\n`이었다.

| 파일 | 열 때 바이트 | 저장 뒤 바이트 | 기대와 | 점 사라짐 | 충돌(1.5초 뒤) | `.tmp` | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UTF-8 무BOM LF | `ed959ceab8802041 0a …` | `ed959ceab8802041 58 0a …` | 같음 | 예 | 없음 | 없음 | 통과 |
| UTF-8 무BOM CRLF | `… 41 0d0a …` | `… 41 58 0d0a …` | 같음 | 예 | 없음 | 없음 | 통과 |
| UTF-8 BOM | `efbbbf …` | `efbbbf … 41 58 0a …` | 같음(BOM 유지) | 예 | 없음 | 없음 | 통과 |
| UTF-16 LE BOM | `fffe 5cd5 00ae 2000 4100 0a00 …` | `fffe … 4100 5800 0a00 …` | 같음 | 예 | 없음 | 없음 | 통과 |
| UTF-16 BE BOM | `feff d55c ae00 0020 0041 000a …` | `feff … 0041 0058 000a …` | 같음 | 예 | 없음 | 없음 | 통과 |
| CP949 | `c7d1b1db 2041 0a …` | `c7d1b1db 2041 58 0a …` | 같음 | 예 | 없음 | 없음 | 통과 |

모든 행에서 수정 시각이 바뀌었다.

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| R-4 | 깨끗한 탭 Ctrl+S는 쓰지 않는다 | 바이트·수정 시각 그대로 | 시각을 `2020-01-01T00:00:00Z`로 맞춘 사본: 저장 뒤 바이트 같음, 수정 시각 ns까지 같음, `.tmp` 없음, 알림 없음 | 통과 |
| R-4 | 자기 저장이 낸 감시 이벤트로 충돌·다시 읽기가 생기지 않는다 | 충돌 없음 | 위 6개 파일 모두 저장 1.5초 뒤 `conflict` 클래스 없음, 점 없음 | 통과 |
| R-4 | 원자적 저장의 흔적 없음 | `.tmp` 없음 | 모든 저장(성공·실패) 뒤 폴더에 `*.tmp` 없음 | 통과 |
| R-5 | CP949 파일에 CP949 밖 글자(😀) 입력 뒤 저장 | 저장 거부, 글자를 알림 | 알림 한 줄 `Unable to save file: these characters cannot be saved in CP949: 😀`, 디스크 바이트·수정 시각 그대로, 탭은 수정 상태 유지, `.tmp` 없음 | 통과 |
| R-5 | 거부 뒤 Ctrl+Z | 깨끗 | 점 사라짐 | 통과 |
| R-4, E-083 | 잠긴 파일(다른 프로세스가 `FileShare.None`으로 연 상태) 저장 | 실패를 `Unable to save file: {오류}`로 알림, 원본 유지, `.tmp` 없음 | 알림 `Unable to save file: 다른 프로세스가 파일을 사용 중이기 때문에 프로세스가 액세스 할 수 없습니다. (os error -2147024864)`, 188~323ms에 표시, 탭 수정 상태 유지, 폴더에 `.tmp` 없음, 잠금을 푼 뒤 원본 바이트 그대로(닫기 시험 뒤 같음) | 통과 |
| R-4 | 잠금을 풀고 다시 저장 | 저장됨 | 점 사라짐, 디스크가 버퍼와 같음 | 통과 |

### 3.5 닫기 질문 (R-6, 03-tauri R-15, E-080~E-083)

창 제목은 모든 창에서 `Warning`이었다(UIA·스크린샷). 문구는 스크린샷과 처음 뜬 창의 UIA 값으로 글자 단위로 대조했다.

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| E-081 | 문구 | `` `c-one.txt` contains unsaved edits. Do you want to save it? `` | 같음(백틱 그대로 보임, 경고 아이콘) — `phase2-e081.png` | 통과 |
| E-081 | 버튼 순서 | Save, Don't Save, Cancel | 같음 | 통과 |
| D-6, E-081 | 기본 버튼 | Cancel | UIA 초점이 Cancel(스크린샷에 초점 테두리), Enter를 보내면 취소로 동작 | 통과 |
| E-081 | Esc | 닫지 않음 | 탭 열림, 수정 상태, 디스크 그대로 | 통과 |
| E-081 | Enter(기본 버튼) | 닫지 않음 | 탭 열림, 수정 상태, 디스크 그대로 | 통과 |
| E-081 | Don't Save | 버리고 닫음 | 탭 닫힘, 디스크 그대로 | 통과 |
| E-081 | Save | 저장하고 닫음 | 탭 닫힘, 디스크 `c-oneZ…`(입력한 글자 반영), `.tmp` 없음 | 통과 |
| I-066, I-073, I-075 | Ctrl+W·Ctrl+F4·가운데 클릭·닫기 버튼이 같은 질문을 낸다 | 같은 창 | 네 경로 모두 Warning / Save · Don't Save · Cancel / 기본 Cancel, Esc 뒤 탭 열림 | 통과 |
| E-082 | 문구와 목록 | `Do you want to save changes to the following files?` + 경로 줄 | 같음, 목록 `c-two-a.txt` / `c-two-b.txt` / `f3.txt`(폴더 둘의 탭) — `phase2-e082.png` | 통과 |
| E-082 | 버튼 순서·기본 | Save all, Discard all, Cancel / Cancel | 같음, 초점 Cancel | 통과 |
| E-082 | 창 닫기(Alt+F4): Esc | 창 유지 | 앱 실행 중, 탭 둘 모두 수정 상태 | 통과 |
| E-082 | 창 닫기(Alt+F4): Enter(기본) | 창 유지 | 앱 실행 중 | 통과 |
| E-082 | Quit(Ctrl+Q): Esc | 앱 유지 | 앱 실행 중, 탭 그대로 | 통과 |
| E-082 | 창 닫기: Discard all | 버리고 끝냄 | 앱 종료, 두 파일 바이트 그대로 | 통과 |
| E-082 | 제목 줄 닫기 버튼 → Save all | 저장하고 끝냄 | 앱 종료, `c-two-a`→`c-two-aP`, `c-two-b`→`c-two-bQ`, `.tmp` 없음 | 통과 |
| E-083 | 닫기 질문에서 Save가 실패하면 | 문구 `Unable to save file: {오류}` + Close Without Saving / Cancel | 같음(OS 오류 글이 그대로 들어감, 기본 Cancel) — `phase2-e083.png` | 통과 |
| E-083 | Esc | 닫지 않음 | 탭 열림, 수정 상태, `.tmp` 없음 | 통과 |
| E-083 | Close Without Saving | 저장 없이 닫음 | 탭 닫힘, 디스크 그대로, `.tmp` 없음 | 통과 |
| R-14(v0.2), R-6 | 폴더 해제 — 사이드바 Delete 키, 수정 탭 둘(`f1`) | E-082 | Save all / Discard all / Cancel. Esc·Enter → 폴더 남음, 탭 수정 상태. Discard all → 폴더 사라짐, 디스크 그대로 | 통과 |
| R-14(v0.2), R-6 | 폴더 해제 — 트리 루트 우클릭 `Remove from Project`, 수정 탭 하나(`f2`) | E-081 | Save / Don't Save / Cancel. Esc → 폴더 남음. Save → 폴더 사라짐, 디스크 `folder 2R…`, `.tmp` 없음 | 통과 |
| R-14(v0.2), R-6 | 폴더 해제 — 사라진 폴더 패널의 `Remove` 버튼(`f3`, 폴더를 지운 뒤) | E-081 | 패널 `This folder no longer exists.` + `Remove`. Esc → 폴더 남음. Don't Save → 폴더 사라짐 | 통과 |

### 3.6 충돌·지워진 파일 (R-7, 03-tauri R-24, E-084~E-087)

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| E-086 | 수정 탭의 파일이 바깥에서 바뀌면 충돌 | 점 Warning 색, 버퍼 유지 | 6초 안에 `dirty conflict`, 색 `--warning`, 버퍼 텍스트 그대로 | 통과 |
| E-086 | 충돌 중 Ctrl+Z | 충돌 유지 | 문서가 기준 텍스트까지 돌아가도 `dirty conflict` | 통과 |
| E-084 | 문구 | `This file has changed on disk since you started editing it. Do you want to overwrite it?` | 같음 — `phase2-e084.png` | 통과 |
| E-084 | 버튼 순서·기본 | Overwrite, Discard Edits, Cancel / Cancel | 같음, 초점 Cancel | 통과 |
| E-084 | Esc | 아무것도 안 함 | 디스크 바깥 내용 그대로, 버퍼 유지, 충돌 유지 | 통과 |
| E-084 | Enter(기본) | 아무것도 안 함 | 같음 | 통과 |
| E-084 | Discard Edits | 디스크 내용을 다시 읽음 | 문서 = 디스크(`external change`), 점 없음, 디스크 그대로 | 통과 |
| E-084 | Overwrite | 버퍼를 씀 | 디스크 = 버퍼 텍스트, 점 없음, `.tmp` 없음 | 통과 |
| D-7 | 같은 내용으로 덮어쓴 바깥 저장(수정 탭) | 변경 아님 | 같은 바이트로 다시 쓴 뒤 2.5초: `dirty`(충돌 아님), 버퍼 유지 | 통과 |
| D-7 | 대조: 다른 바이트로 바꾸면 | 충돌 | `conflict` | 통과 |
| R-7 | 깨끗한 탭의 파일이 바깥에서 바뀌면 | 자동 다시 읽기 | 6초 안에 문서 = 바깥 내용, 점 없음 | 통과 |
| E-087, S-2 | 지워진 비지 않은 탭 | 취소선 + 수정됨 | `line-through`, 점 Accent 색 | 통과 |
| E-085 | 문구 | `This file has been deleted on disk since you started editing it. Do you want to recreate it?` | 같음 — `phase2-e085.png` | 통과 |
| E-085 | 버튼 순서·기본 | Save, Close, Cancel / Cancel | 같음, 초점 Cancel | 통과 |
| E-085 | Esc, Enter(기본) | 아무것도 안 함 | 파일 여전히 없음, 탭 `strike`·수정 상태 | 통과 |
| E-085 | Save | 다시 만듦 | 파일 생김, 원래 바이트와 같음, 취소선·점 사라짐, `.tmp` 없음 | 통과 |
| E-085 | Close | 탭 닫음 | 탭 닫힘, 파일 안 만들어짐, 이어 묻는 창 없음 | 통과 |
| S-2, E-081 | 지워진 비지 않은 탭을 Ctrl+W로 닫으면 | 묻는다 | E-081(Save / Don't Save / Cancel), Esc 뒤 탭 유지 | 통과 |
| R-8, I-062 | 지워진 비지 않은 임시 탭은 다른 임시 탭으로 교체되지 않는다 | 둘 다 남음 | `g-prev.txt`(임시, 취소선, 점)와 새 `g-other.txt`(임시)가 함께 있음 | 통과 |
| R-8, I-062 | 대조: 깨끗한 임시 탭은 교체된다 | 교체됨 | `g-other.txt`가 다음 단일 클릭 `g-nonempty.txt`로 교체됨 | 통과 |

## 4. 측정 불가·미측정

- TaskDialog 본문: 두 번째부터 UIA가 본문 텍스트를 주지 않는다(1장). 문구 판정은 스크린샷을 눈으로 대조했다(글자 단위, 크롭 해상도에서 읽힘). 소스 문자열 대조는 하지 않았다.
- E-081 경로가 80자를 넘을 때: 상대 경로 90자(`d`×40 `\` `e`×40 `\long.txt`)로 열어 닫기를 눌렀다. 창에는 `` `… ``로 시작하고 긴 낱말이 OS의 자체 말줄임으로 가운데가 잘린 `dddd…\long.txt`가 보였다(`phase2-e081-long-path.png`). 앱이 보낸 문자열(앞쪽 자름, "…" 포함 80자)은 이 화면만으로는 확인되지 않는다. 판정 안 함(V1 `shortPath` 테스트·코드 확인 범위).
- I-072(닫은 뒤 활성 탭 history): 재지 않았다(이 카드 목록 밖).
- 닫기 때 저장 대기 상한 10초, 저장 중 재편집: 재지 않았다(V1 범위).
- `editor.tab_size`(E-055): 재지 않았다(코드 확인 범위).
- R-4의 "교체 실패하고 원본이 없는" 경우: 재지 않았다(V1 범위).
- IME: Microsoft 한글 입력기 두벌식, 조합 중 Enter·Escape·Left·Right·Up·Down·Space만. 한자 변환·Shift 조합·영문 전환 중 입력은 재지 않았다.

## 5. 관찰(기준 없음, leader 판단용)

- **되돌리기와 다시 읽기**: 깨끗한 탭이 바깥 변경으로 다시 읽힌 뒤, 또는 충돌에서 Discard Edits로 디스크 내용을 읽은 뒤 Ctrl+Z를 누르면 직전 텍스트로 돌아가고 탭이 수정 상태가 된다. 앞의 경우 `reloaded` → 이전 본문(점 있음), 뒤의 경우 `external change` → 편집 내용 `x-conf1A…`(점 있음). Zed 동작과의 대조는 하지 않았다(P2-2 보고의 "Zed와 같은지 확인 필요"에 대한 측정값).
- **충돌 해소**: 충돌 중인 탭의 파일을 처음 저장 기준과 같은 바이트로 되돌려 쓰면 충돌이 사라지고 수정 상태만 남는다(바깥 변경 해시 비교).
- **E-083 `{오류}`**: OS 언어의 오류 글에 `(os error -2147024864)`가 그대로 붙는다. 스펙에 `{오류}`의 모양은 없다.
- **IME 시작 상태**: 시험 시작 때 입력기가 영문 모드여서 한/영 키로 한글 모드를 켰다가 끝에 되돌렸다. 입력 전후 키보드 배열 `0x0412`, 남은 눌림 없음(`releasedOnExit` 없음).
- **알림 위치**: 알림(`.toast`)은 앱 내부 DOM 한 줄이고 `role="alert"`다(CDP로 읽음).

## 6. 재측정 (카드 v04-M2-R1: F-1과 미측정 항목)

### 6.1 조건

- 앱: 레포 소스로 `npm run tauri build -- --debug --no-bundle`로 새로 만든 exe(2026-11-06 08:55:54). 창·배율·입력·관측 방식은 1장과 같다(클라이언트 1440×852, DPI 96, 실제 SendInput, CDP로 값 읽기). 시험 폴더 `%TEMP%\wb-v04-m2\`, `%APPDATA%\workbench-tauri\state.json`은 측정 전 SHA-256 `77EF33FF…07C99`를 백업했고 끝에 복구해 일치를 확인했다. 시험 폴더·백업은 삭제했다. 앱 실행 1회. `tools/` 변경 없음.

### 6.2 F-1 (I-063, R-2): 임시 탭 편집 승격 뒤 포커스

임시 탭(파일 한 번 클릭)에서 편집기를 클릭하고 입력했다.

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| I-063 | `XY`를 한 번에 입력(`v-edit.txt`) | 두 글자 반영, 승격, 포커스 유지 | 문서 `v-editXY`, `preview` 클래스 사라짐, 점 보임, `activeElement` = `DIV.cm-content` | 통과 |
| R-2 | 이어 Backspace | 한 글자 지움 | `v-editX`, 포커스 `DIV.cm-content` | 통과 |
| E-059c | Ctrl+Z 두 번 | 지운 글자 복원 → 입력 되돌림 | `v-editXY` → `v-edit`, 점 사라짐, 포커스 유지 | 통과 |
| I-063 | `X`, `Y`를 따로 입력(임시 탭 `u-undo.txt`) | 둘 다 반영 | 승격 뒤 포커스 `DIV.cm-content`, `u-undoX` → `u-undoXY`, Backspace → `u-undoX`, Ctrl+Z → `u-undoXY` | 통과 |
| I-063 | 키로 친 숫자 `1 2 3`(임시 탭 `g-prev.txt`) | 세 글자 반영 | `g-prev123`, 승격, 포커스 `DIV.cm-content` | 통과 |

F-1은 해소됐다(3개 입력 경로 모두 승격 뒤 `activeElement`가 `cm-content` 유지).

### 6.3 I-072: 탭을 닫은 뒤 활성 탭 = history

탭 `h-a`, `h-b`, `h-c`를 이 순서로 열고 클릭으로 `h-a` → `h-c` → `h-b` 순서로 활성화했다(직전 활성 `h-c`, 왼쪽 이웃 `h-a`로 두 규칙이 다른 답을 내는 배치).

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| I-072 | 활성 `h-b`를 Ctrl+W로 닫음 | 직전에 활성이던 `h-c` | 활성 `h-c`(남은 탭 `h-a`, `h-c`) | 통과 |
| I-072 | 이어서 활성 `h-c`를 닫음 | 직전에 활성이던 `h-a` | 활성 `h-a` | 통과 |

### 6.4 E-055 `editor.tab_size` (기대 4칸)

시험 파일 두 줄: `<TAB>A`와 `····A`(공백 4개). 글꼴 `Consolas, monospace`.

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| E-055 | CM6 `state.tabSize` | 4 | 4 | 통과 |
| E-055 | 편집기 CSS `tab-size` | 4 | 4 | 통과 |
| E-055 | 탭 문자의 그려진 폭 | 공백 4칸 | 33px = 공백 폭 8.25px × 4. 같은 줄 `A`의 x가 탭 뒤 667.703, 공백 4개 뒤 667.688(0.016px 차) | 통과 |
| E-055 | 줄 중간 탭 문자(`<TAB>A<TAB>B`)가 탭 정지점으로 | 4칸 배수 | 둘째 탭 뒤 `B` x 700.688 = 줄 왼쪽 630.703 + 패딩 4 + 66(공백 8칸) | 통과 |

- 관찰(기준 없음): 실제 Tab 키를 누르면 문서는 바뀌지 않고 포커스가 `BUTTON.icon-button`으로 간다(편집기에 들여쓰기 키 바인딩이 없다, 이 카드의 "Tab 키 입력 폭" 대신 위 계산값·그려진 폭으로 판정). 탭 문자는 유니코드 입력으로 넣었다.

### 6.5 요약

- 판정 행 9개: 통과 9, 불일치 0. 2장의 불일치 F-1은 해소됐다. 4장 미측정 가운데 I-072와 `editor.tab_size`는 측정했다.

## 7. 재측정 R2 (카드 v04-M2-R2: I-059 Tab·Shift+Tab)

### 7.1 조건

- 앱: 레포 소스로 `npm run tauri build -- --debug --no-bundle`로 새로 만든 exe(2026-11-06 09:02:02). 창·배율·입력·관측 방식은 1장과 같다(클라이언트 1440×852, DPI 96, 실제 SendInput, CDP로 문서 텍스트·`document.activeElement`·`keydown`의 `defaultPrevented`를 읽음). 앱 실행 2회(둘째는 캐럿만 있는 내어쓰기를 따로 보려고 한 번 더 실행). 시험 폴더 `%TEMP%\wb-v04-m2\`, `%APPDATA%\workbench-tauri\state.json`은 측정 전 SHA-256 `77EF33FF…07C99`를 백업했고 끝에 복구해 일치를 확인했다. 시험 폴더·백업 삭제, `tools/` 변경 없음.

### 7.2 편집기 (I-059)

시험 파일 `alpha` / `beta` / `gamma`. 들여쓰기 한 단계는 공백 4칸으로 나왔다(E-055 `tab_size` 4와 같다).

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| I-059 | 캐럿이 줄 시작일 때 Tab | 문서가 바뀜, 포커스 `cm-content` | `alpha` → `····alpha`, `activeElement` = `DIV.cm-content` | 통과 |
| I-059 | Tab을 한 번 더 | 한 단계 더 | `········alpha`, 포커스 유지 | 통과 |
| I-059 | 캐럿이 줄 끝(`alpha|`)일 때 Tab | 문서가 바뀜, 포커스 유지 | `alpha` → `alpha···`(다음 4칸 정지점까지 3칸), 다시 누르면 `alpha·······`(4칸 더), 수정 점 보임, `keydown`의 `defaultPrevented` = true, 포커스 `DIV.cm-content` | 통과 |
| I-059 | Shift+Tab(캐럿만) | 한 단계 내어쓰기, 포커스 유지 | `········alpha` → `····alpha` → `alpha`, 포커스 `DIV.cm-content` | 통과 |
| I-059 | 들여쓰기 없는 줄에서 Shift+Tab | 변화 없음 | `alpha` 그대로, 포커스 유지 | 통과 |
| I-059 | 세 줄 선택(Shift+Down 두 번) 뒤 Tab | 세 줄 모두 들여쓰기 | `····alpha…` / `····beta` / `····gamma`, 포커스 유지 | 통과 |
| I-059 | 같은 선택에서 Shift+Tab | 세 줄 모두 내어쓰기 | `alpha…` / `beta` / `gamma`(앞 들여쓰기만 사라짐), 포커스 유지 | 통과 |
| I-059 | Tab 뒤 Ctrl+Z | 들여쓰기 되돌림 | 세 줄 들여쓰기가 한 번에 되돌아감 | 통과 |

### 7.3 트리에서 Tab (기존 동작)

`src/keymap/builtin.ts`의 `menu` 컨텍스트 바인딩 `tab` → `menu::SelectNext`, `shift-tab` → `menu::SelectPrevious`는 HEAD에도 있는 줄이고 이번 변경에서 바뀌지 않았다(`git show HEAD:`로 확인). 프로젝트 트리에 포커스를 둔 채(파일 행 클릭 뒤) 눌렀다.

| ID | 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- | --- |
| I-059, A-17 | 트리에서 Tab | 선택이 다음 행으로(기존 `menu::SelectNext`), 편집기 문서 불변, 포커스는 패널 | `c-btn.txt` → `c-f4.txt` → `c-mid.txt`, `activeElement` = `DIV.project-panel`, `defaultPrevented` = true | 통과 |
| I-059, A-17 | 트리에서 Shift+Tab | 선택이 이전 행으로 | `c-mid.txt` → `c-f4.txt`, 포커스 패널 | 통과 |
| I-059 | 트리에서 Tab이 편집기 문서를 건드리지 않는다 | 불변 | 텍스트 같음 | 통과 |

### 7.4 요약

- 판정 행 11개: 통과 11, 불일치 0. 1장 4장의 Tab 키 관찰("Tab 키를 누르면 포커스가 `BUTTON.icon-button`으로 간다", 6.4절)은 이 변경으로 해소됐다.
