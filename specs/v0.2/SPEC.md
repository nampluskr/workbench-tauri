> 버전: v0.2 · 작성일: 2026-11-05 · 상태: 확정 (2026-11-05)
>
> 이번 버전(gpui v0.2·v0.3 끝 상태와 같은 범위)이 만족해야 할 것과 판정 방법을 담는다. 목적과 범위는 `specs/v0.2/INTENT.md`에, 설계 결정은 `DECISIONS.md`에, 작업 순서는 `PLAN.md`(아직 없음)에 있다.
>
> 번호 읽는 법:
> - `R-n`(접두 없음)은 이 SPEC의 요구 번호다. `03-tauri R-nn`은 `docs/refs/03-tauri/README.md` 5절의 조사 항목이다. `D-n`은 v0.2 `DECISIONS.md`의 결정이다. `gpui R-n`은 `D:\projects\workbench-gpui\specs\v0.2\SPEC.md`의 요구다.
> - `L-`·`E-`·`I-`·`T-`·`A-`·`P-`·`K-`는 01-zed 명세의 항목 ID다. 문구는 원문 그대로다.
> - 수치는 `spec/zed-metrics.toml`의 항목 ID(`<표>.<키>`)로만 적는다(v0.1 D-1). 값은 이 문서에 옮기지 않는다. toml에 ID가 없는 값은 01-zed ID로만 인용하고, "toml ID 없음"이라고 적는다.
> - Q-n은 `writer` 보고서의 질문 번호다. 모두 결정으로 닫혔고, 결정한 사람과 날짜는 각 줄에 적었다.

# SPEC — workbench-tauri v0.2

## 공통 판정 방식

아래 모든 요구에 적용한다.

- 검증 수준은 루트 `AGENTS.md` 3A의 V0~V4다(v0.1 D-17). 요구마다 판정 방법에 수준을 적는다.
- 측정·검증 전용 코드를 앱에 두지 않는다(v0.1 D-16, D-18). dev 플래그, 탐침, 측정용 전역이 없다. 증거는 다음으로만 얻는다.
  - V1: 단위 테스트 출력. Rust는 `cargo test`, 프런트엔드는 `node --test`다. 테스트는 비자명한 로직에만 둔다(`AGENTS.md` 4.4).
  - V2: 앱을 띄운 직후 상태를 CDP로 덤프한 값(`getComputedStyle`·`getBoundingClientRect`·DOM 속성·콘솔). 조작하지 않는다.
  - V3: 실제 입력(`tools/win-input.ps1`)과 화면 측정, 측정 중 CDP로 평가한 값. CDP 평가식은 `tools/`의 스크립트에 둔다.
  - 파일 시스템 상태: PowerShell로 읽은 폴더·파일 목록, 크기, 수정 시각, 내용 해시, 휴지통 목록.
  - 코드 확인: 해당 처리의 위치(파일·줄).
- gpui가 dev 출력으로 본 값은 다음으로 바꿔 본다(D-18).
  - 바인딩 목록: `tools/` 스크립트가 내장 키맵 소스 파일(데이터)을 직접 읽는다(Q-16).
  - 실행된 동작: 그 결과(파일 시스템 상태, 화면 DOM, 포커스 위치 `document.activeElement`)로 본다.
  - 트리·탭 상태(펼침, 선택, 임시 여부, 활성): CDP로 DOM을 덤프한다. 트리 항목의 펼침·선택·깊이는 접근성 속성(`role`, `aria-expanded`, `aria-selected`, `aria-level`)으로 읽는다. 이 속성은 접근성 기본 요소이며 측정 전용 코드가 아니다(`AGENTS.md` 4.3).
  - 폴더 등록 상태: 미리 만든 `state.json`으로 시작한다. 선택 창 자체는 R-11에서 실제 창을 한 번 조작해 확인한다(D-18, Q-15).
- V2·V3의 시작 상태: 미리 만든 `state.json`과 시험 폴더로 시작하고, 시작 때 열린 탭은 없다. v0.1의 예제 탭(`index.html`·`style.css`)과 HTML 탭의 Catppuccin 고정 아이콘은 v0.1 PoC 화면과 함께 뺀다(리더 결정(사용자 위임 2026-11-05), Q-A).
- V3 측정 조건, 기준 화면 대조 창 크기, 허용 오차(`verification.tolerance.dimension`, `verification.tolerance.font_size`, `verification.tolerance.color_channel`)는 v0.1 SPEC 공통 판정 방식과 같다.
- 시험 폴더(fixture)는 `tools/`의 스크립트가 측정 때 임시 폴더에 만들고 끝나면 지운다. 사용자 폴더·Zed 폴더는 건드리지 않는다. 앱 데이터 폴더(`%APPDATA%\workbench-tauri`, D-6)는 측정 전에 백업하고 끝나면 되돌린다.
- 앱이 내는 문구는 원문 문구와 글자 하나까지 같아야 한다.
- 색 판정: 새 화면 요소의 색은 T-40 토큰의 CSS 변수 덤프로 토큰 값만 판정한다(A-31.8). 화면 픽셀 색 대조는 하지 않는다(리더 결정(사용자 위임 2026-11-05), Q-I).
- 03-tauri 5절 P1 조사 항목 가운데 v0.2 범위에 걸리는 것: R-08(R-20), R-15(R-21), R-21의 원자적 저장 부분(R-29), R-24(R-25), R-25(R-6·R-9), R-10의 큰 데이터 방식(R-30)을 푼다. 넣지 않는 것: R-07(측정 조건이 100% 하나), R-38(저장이 없어 읽기만 R-26에 둔다), R-12(아이콘 매핑 제외, UI 아이콘은 D-20), R-16(앱이 `keymap.json`을 쓰지 않아 해당 없음). 리더 결정(사용자 위임 2026-11-05), Q-F.
- 결과는 `specs/v0.2/verify/`에 스펙 ID·기대값·측정값·차이·판정의 표로 남긴다(AGENTS 3A.4).
- 원문에 통과 기준 수치가 없는 측정은 측정값과 관찰을 기록하면 충족이다.
- v0.1 테스트는 계속 통과한다. Phase 끝에 `check`가 전체 테스트를 1회 돌린다(INTENT 결정 기록 12).
- 새 의존성은 정확한 버전으로 고정하고 lock 파일을 올린다(03-tauri R-31, v0.1 D-3).
- 판정하지 않는 것(INTENT 제외 범위): 아이콘 테마 매핑과 아이콘 모양, 글꼴(Zed 글꼴·Lilex), E-032, 탭 편집·저장과 그에 딸린 표시, 드래그 앤 드롭, Picker·키맵 편집·찾기 바, 다중 창 복원, 화면 픽셀 색 대조(Q-I), 원문에 추정으로 적힌 값(예: I-508 항목 높이, L-40 트리 아이콘 크기).

---

## R-1. 내장 키맵에 02 1절 키 표 가운데 v0.2 동작의 키가 적용 결과대로 들어 있다

**요구**

앱 내장 키맵(D-2)에 01-zed 02-INTERACTION 1절 키 표(VSCode 덧씌움 적용 결과, I-001·I-700) 가운데 v0.2에 있는 동작의 키를 같은 컨텍스트로 넣는다.

**정해진 결과**

다음 키가 표의 컨텍스트·동작대로 묶여 있다(gpui R-1과 같다).
- 창·작업 영역: Ctrl+B 왼쪽 Dock 열기/닫기(I-022, A-17.7), Ctrl+Shift+E 프로젝트 패널 포커스 토글(I-023, A-17.8), Ctrl+Alt+J 사이드바 표시 토글·Ctrl+Alt+; 사이드바 포커스(I-024, A-17.1, A-17.2), Ctrl+K Ctrl+O 폴더 추가(A-13.1, A-17.6), F10 앱 메뉴 열기(I-310).
- ☰ 메뉴 항목의 키: Quit Ctrl+Q(I-341), Close Window Ctrl+Shift+W(I-358)(D-2, A-18.11).
- 사이드바(`Sidebar` 컨텍스트, D-3): Up/Down 항목 이동, Enter 활성화, Delete 등록 해제(A-17.3~A-17.5).
- 프로젝트 패널: I-030~I-037, I-039~I-043의 키. I-038 Undo/Redo는 표에서 "제외"다.
- 메뉴(`menu` 컨텍스트): I-517의 키.
- 액션 이름은 D-2대로이고, 우리가 지은 이름 목록이 PROGRESS에 있다.

**판정 방법**

- 검증 수준: V1.
- `tools/` 스크립트 또는 `node --test` 테스트가 내장 키맵 소스 파일을 읽어 (키, 컨텍스트, 액션) 표를 만들고, 위 ID의 기대 표와 줄마다 대조한다. 표에 있는데 없거나 컨텍스트·동작이 다르면 실패다.
- 기대 표는 키맵 작업 Phase를 시작할 때 원문에서 뽑아 PROGRESS에 고정한다.

**출처**

D-2 · D-3 · D-18 · I-001 · I-700 · I-022~I-024 · I-030~I-043 · I-310 · I-341 · I-358 · I-517 · A-13.1 · A-17 · A-18.11 · A-27.1 · gpui R-1

---

## R-2. 사용자 `keymap.json`이 내장 키맵 위에 마지막으로 얹히고, `null`은 낮은 후보를 해제한다

**요구**

`%APPDATA%\workbench-tauri\keymap.json`(D-6, A-20.4)을 읽어 내장 키맵 위에 얹는다. 나중 것이 이긴다(A-27.1). 값이 `null`이면 그 컨텍스트에서 낮은 후보를 해제한다(I-703).

**정해진 결과**

- 내장 키와 같은 키를 다른 액션으로 묶으면 사용자 쪽 액션이 실행된다.
- 키를 `null`로 적으면 그 컨텍스트에서 내장 바인딩이 실행되지 않는다.
- 없는 액션 이름은 `Action '{이름}' not found`(K-085) 알림으로 알리고, 파일을 읽지 못하거나 형식이 틀리면 `Failed to load keymap file`(K-091) 알림이다. 오류가 여럿이면 알림 하나에 한 줄씩 잇는다. 오류 항목만 빼고 나머지 바인딩은 적용한다(D-14).
- 주석(`//`, `/* */`)과 끝 쉼표를 허용한다. 문자열 안의 `//`·`/*`는 주석이 아니다(D-4).
- 파일이 없으면 내장 키맵만 쓰고 알림이 없다.

**판정 방법**

- 검증 수준
  - V1: JSONC 걷어 내기와 덧씌움 규칙. 주석·끝 쉼표·문자열 안 `//`가 있는 입력, `null` 해제, 없는 액션 이름, 형식 오류를 사례로 둔 `node --test` 테스트.
  - V3: 시험용 `keymap.json` 네 가지(덮어쓰기, `null` 해제, 없는 액션 이름, 주석·끝 쉼표)로 앱을 띄워 해당 키 입력의 결과와 알림 문구(DOM 텍스트)를 확인한다.

**출처**

D-2 · D-3 · D-4 · D-6 · D-14 · A-20.4 · A-27.1 · I-703 · K-085 · K-091 · gpui R-2

---

## R-3. 같은 키는 포커스 컨텍스트가 더 깊은 쪽이 이기고, 깊이가 같으면 나중 바인딩이 이긴다

**요구**

키 충돌을 I-702대로 푼다. 같은 키라도 포커스 영역이 동작을 정한다(I-002).

**정해진 결과**

- `Delete`: 사이드바 포커스 → 등록 해제(A-13.4), 프로젝트 패널의 루트가 아닌 항목 → 휴지통(I-039), 루트 항목 → 아무 일도 하지 않음(A-14 아래 목록).
- `Ctrl+N`: 프로젝트 패널에서 새 파일(I-036). Workspace의 새 버퍼(I-005)는 v0.2에 없다.
- 깊이가 같은 두 바인딩은 나중에 등록된 쪽이 이긴다(I-702).
- 내장 키맵이 컨텍스트 술어 `>`·`key == value`를 쓰면 엔진이 그 술어를 평가한다(D-3). 쓰지 않으면 더하지 않는다.

**판정 방법**

- 검증 수준
  - V1: 규칙은 v0.1 R-6 테스트가 이미 판정한다. 술어를 더했으면 그 술어마다 테스트 하나.
  - V3: 포커스를 바꿔 가며 같은 키를 입력하고 결과(파일 시스템 상태, 사이드바 목록 DOM)를 확인한다. 같은 컨텍스트에 두 번 묶은 시험용 `keymap.json`으로 나중 바인딩을 확인한다.

**출처**

D-3 · I-002 · I-005 · I-036 · I-039 · I-702 · A-13.4 · A-14 · gpui R-3

---

## R-4. `keymap.json`을 고쳐 저장하면 바로 다시 읽고 메뉴·툴팁의 단축키 표시도 바뀐다

**요구**

실행 중에 `keymap.json`이 바뀌면 감시(D-7 `notify`)로 다시 읽어 키맵에 반영하고, 메뉴·툴팁 표시를 다시 만든다(I-704, A-27.6).

**정해진 결과**

앱을 띄운 채 `keymap.json`에서 어떤 액션의 키를 바꿔 저장하면, 다시 띄우지 않아도 새 키가 동작하고 ☰ 메뉴·툴팁에 새 키가 보인다. 파일이 지워지면 내장 키맵으로 돌아간다.

**판정 방법**

- 검증 수준: V3.
- 바꾸기 전후의 메뉴·툴팁 DOM 텍스트와 키 입력 결과를 비교한다. 반영까지 걸린 시간을 기록한다(원문에 기준 수치 없음).

**출처**

D-3 · D-7 · I-704 · A-27.6 · gpui R-4

---

## R-5. 메뉴·툴팁의 단축키 표시가 키맵 적용 결과와 일치하고 형식이 L-217~L-223과 같다

**요구**

메뉴·툴팁에 보이는 단축키는 그 액션에 묶인 키 가운데 I-704·L-217 규칙으로 고른 하나이고, L-218~L-221 형식으로 그린다.

**정해진 결과**

- 고르는 규칙: 액션 인수까지 같은 바인딩 중 현재 컨텍스트에서 다른 액션에 가려지지 않은 마지막 바인딩(I-704). 메뉴는 열기 직전 포커스의 컨텍스트에서 찾고, 없으면 창 전체에서 찾는다(I-307, I-510).
- 형식: 구분자 `-`, 순서 Fn → Ctrl → Win → Alt → Shift → 키(L-219). 키 이름 첫 글자 대문자, `pageup` → `PageUp`, `pagedown` → `PageDown`(L-220). chord는 키 입력마다 덩어리 하나(L-221). 툴팁의 덩어리 사이 간격은 `tooltip.shortcut.chord_gap`, 덩어리 안쪽 여백은 `tooltip.shortcut.padding_x`·`tooltip.shortcut.padding_y`다(L-222). 메뉴의 덩어리 간격은 `menu.item.shortcut_chord_gap`이다(L-221).
- 바인딩이 없으면 단축키 영역 없이 제목만 보인다(L-223).
- v0.2에 있는 모든 메뉴 항목·툴팁의 단축키가 R-1·R-2의 키맵 적용 결과와 일치한다.

**판정 방법**

- 검증 수준
  - V1: 표시 문자열 만들기(순서·대문자·chord 나누기)와 표시 키 고르기. 사례별 `node --test` 테스트.
  - V3: 메뉴 항목·툴팁마다 "화면에 보인 단축키(DOM 텍스트) / 키맵 적용 결과로 계산한 단축키"를 나란히 적은 대조표. 하나라도 다르면 실패다. 덩어리 간격은 `getBoundingClientRect`로 잰다.

**출처**

D-3 · I-307 · I-510 · I-704 · L-217~L-223 · A-27.4 · A-27.5 · gpui R-5

---

## R-6. 툴팁이 L-206~L-216의 시점·위치·모양대로 뜨고 사라진다 (03-tauri R-25)

**요구**

툴팁을 DOM 전역 하나로 그리고(D-5), 지연·사라짐·위치·모양을 01-zed 값과 맞춘다.

**정해진 결과**

- 지연은 `tooltip.delay_default`이고, 프로젝트 패널 항목은 `project_panel.name_tooltip_delay`다(L-206, L-247).
- 마우스가 벗어나거나, 버튼을 누르거나, 스크롤하면 사라진다(L-207).
- 띄우는 순간의 마우스 위치에서 (`tooltip.cursor_offset_x`, `tooltip.cursor_offset_y`)만큼, 투명 여백 왼쪽 `tooltip.transparent_margin_left`·위 `tooltip.transparent_margin_top`을 둔다(L-208, L-209). 오른쪽·아래가 창을 넘으면 커서 왼쪽·위쪽으로 뒤집는다(L-210). 창 크기는 WebView 안쪽 크기 기준이다(03-tauri R-25).
- 모서리 `tooltip.corner_radius`, 테두리 `tooltip.border_width`(L-211), 그림자 두 겹: 첫째 `tooltip.shadow.1.offset_y`·`tooltip.shadow.1.blur`·`tooltip.shadow.1.color`·`tooltip.shadow.1.alpha`, 둘째 `tooltip.shadow.2.offset_y`·`tooltip.shadow.2.blur`·`tooltip.shadow.2.color`와 라이트 테마 `tooltip.shadow.2.alpha_light`·다크 테마 `tooltip.shadow.2.alpha_dark`(L-212), 안쪽 여백 `tooltip.padding_y`·`tooltip.padding_x`(L-213), 글자 `tooltip.font_size`(L-214), 제목 최대 폭 `tooltip.title.max_width`와 단축키 사이 `tooltip.title.shortcut_gap`(L-215), 메타 줄 `tooltip.meta.font_size`(L-216).
- 메뉴를 여는 버튼은 메뉴가 열려 있는 동안 툴팁이 없다(L-205, L-272).

**판정 방법**

- 검증 수준: V3.
- 실제 마우스를 올린 시각과 툴팁 DOM이 나타난 시각을 CDP로 기록해 지연을 잰다. 상자의 위치·치수는 `getBoundingClientRect`·`getComputedStyle`로 잰다. 창 오른쪽·아래 끝 근처에서 뒤집기를 확인한다.
- 그림자는 `box-shadow` 계산값을 덤프해 두 겹의 오프셋·흐림·색·알파를 위 ID와 대조한다.

**출처**

D-5 · L-205~L-216 · L-247 · L-272 · 03-tauri R-25 · gpui R-6

---

## R-7. v0.2 화면 요소의 툴팁 문구와 단축키가 02 8.2절과 같다

**요구**

v0.2 화면 요소의 툴팁 문구·단축키를 01-zed 02 8.2·8.3절대로 단다.

**정해진 결과**

gpui R-7의 표와 같다.

| 요소 | 문구 | 단축키 | ID |
| --- | --- | --- | --- |
| ☰ 메뉴 버튼 | Open Application Menu | 표시 안 함 | L-225 |
| 창 버튼 | 툴팁 없음 | — | L-228 |
| 사이드바 폴더 추가 | Add Project | Ctrl-K Ctrl-O | L-230, A-13.1 |
| 사이드바 폴더 항목 | 툴팁 없음 | — | L-231, A-12.8 |
| 사이드바 토글(열림, 사이드바 안) | 두 줄: "Toggle Sidebar" + 키 / 구분선 / "Focus Sidebar" + 키 | Ctrl-Alt-J / Ctrl-Alt-; | L-232, L-270 |
| 사이드바 토글(닫힘, 상태 표시줄) | Open Folder Sidebar | Ctrl-Alt-J | L-251, L-270 |
| 프로젝트 패널 토글(닫힘·비활성) | Project Panel | Ctrl-Shift-E | L-253, L-266 |
| 프로젝트 패널 토글(열림·활성) | Close Left Dock | Ctrl-B | L-254, L-266 |
| 탭 바 ← / → | Go Back / Go Forward | 없음 | L-236, L-237, L-223 |
| 탭 바 + | New… | 없음 | L-243 |
| 탭 바 분할 | Split Pane | 없음 | L-244 |
| 탭 바 최대화 | Zoom In (확대 상태 Zoom Out) | 없음 | L-245, L-265, L-223 |
| 타이틀 바 폴더 이름 버튼 | Recent Projects | 없음 | L-226, L-227, L-223, D-16 |
| 프로젝트 패널 항목 | 항목의 절대 경로(홈은 `~`), `project_panel.name_tooltip_delay` | 없음 | L-247 |

- ←·→·최대화·폴더 이름 버튼의 동작은 v0.2에 없어 바인딩이 없고, 툴팁은 문구만 보인다(L-223). 비활성 버튼에도 툴팁은 뜬다(02 8.1절).
- 탭 툴팁(L-238~L-241)과 상태 표시줄 커서 위치(L-256)는 이번 범위가 아니다.
- 탭 바 끝 버튼(←·→·+·분할·최대화)은 v0.2 화면에 있고 비활성이다(R-10, Q-B).

**판정 방법**

- 검증 수준: V3.
- 요소마다 마우스를 올려 툴팁 DOM 텍스트를 덤프하고 표와 대조한다.

**출처**

D-5 · D-16 · L-223 · L-225~L-228 · L-230~L-232 · L-236 · L-237 · L-243~L-245 · L-247 · L-251 · L-253 · L-254 · L-265 · L-266 · L-270 · A-12.8 · A-13.1 · gpui R-7

---

## R-8. ☰ 앱 메뉴가 01-zed 9.1절 방식으로 열리고 02 9.2절 구조를 따른다

**요구**

타이틀 바 ☰ 메뉴를 DOM으로 만든다(D-5, D-13).

**정해진 결과**

- 닫힌 상태에는 `Menu` 아이콘 버튼 하나만 보이고 아이콘 크기는 `menu.app_menu_button.icon_size`다(L-85, I-302, I-321). 누르면 첫 메뉴가 열리고, 열려 있는 동안 가로 메뉴 바가 나타난다(I-302, L-86). 가로 메뉴 이름 글자는 `menu.horizontal.item_font_size`, 간격은 `menu.horizontal.item_gap`이다(I-321). 메뉴 바에는 v0.2에서 동작하는 항목이 있는 메뉴만 둔다(D-13, I-306).
- 메뉴가 열려 있으면 다른 메뉴 이름에 마우스를 올리는 것만으로 바뀐다. Left/Right는 끝에서 반대편으로 순환한다(I-303).
- 하위 메뉴는 없고 묶음 항목은 부모 메뉴에 펴서 넣는다(I-304, A-18.2). 구분선 정리는 I-306이다.
- F10 = 열기, 열린 채 F10 = 닫기(I-310). 항목 실행 전에 원래 포커스를 복원한다(I-309).
- 앱 이름은 `workbench-tauri`다. 첫 메뉴 이름은 `workbench-tauri`, 항목은 `Quit workbench-tauri`다(D-13, A-18.10).
- 항목은 02 9.2절·A-18.3~A-18.9 가운데 v0.2에서 동작하는 것만 둔다. 문구·순서·구분선은 02 9.2절 그대로다. 기준으로 본 항목은 gpui R-8과 같다. 최종 목록은 메뉴 작업 Phase에서 02 9.2절과 대조해 PROGRESS에 고정한다.
  - 앱 이름 메뉴: Quit (A-18.3)
  - File: Open Folder...(폴더 등록, A-13.1), Close Window (A-18.4)
  - View: Toggle Left Dock, Toggle Folder Sidebar, Focus Folder Sidebar, Project Panel (A-18.7)
  - Window: Minimize, Zoom (A-18.9)

**판정 방법**

- 검증 수준: V3.
- 버튼 클릭·F10·hover 전환·Left/Right 순환을 실제 입력으로 하고 메뉴 DOM을 덤프한다. 항목 문구를 02 9.2절과 대조한다. 포커스 복원은 `document.activeElement`로 본다.

**출처**

D-5 · D-13 · L-85 · L-86 · I-301~I-310 · I-321 · A-18 · gpui R-8

---

## R-9. 메뉴(앱 메뉴·우클릭 메뉴)의 모양과 키·닫힘 동작이 01-zed와 같다

**요구**

메뉴 공통 모양과 동작을 01-zed 값과 맞춘다(D-5).

**정해진 결과**

- 최소 폭 `menu.min_width`(바깥 `menu.min_outer_width`), 최대 높이 = 창 높이 × `menu.max_height_ratio`, 넘치면 세로 스크롤(I-313).
- 테두리 `menu.border_width`, 모서리 `menu.corner_radius`, 목록 위아래 `menu.list_padding_y`(I-315). 항목 바깥 좌우 `menu.item.margin_x`, 안 좌우 `menu.item.padding_x`, 단축키 앞 최소 간격 `menu.item.shortcut_min_gap`(I-316). 글자 `menu.item.font_size`, 줄 높이 `menu.item.line_height`(I-317). 구분선 `menu.separator.height`, 위아래 `menu.separator.margin_y`, 합계 `menu.separator.total_height`(I-318). 우클릭 메뉴 아이콘 `menu.context.icon_size`(I-511), 창 가장자리 여백 `menu.context.window_margin`(I-501).
- 앱 메뉴 팝업 위치는 `menu.popup_offset_x`·`menu.popup_offset_y`(I-314)다.
- 비활성 항목은 hover·클릭 반응이 없고 키보드 선택에서 건너뛴다(I-515).
- 키(`menu` 컨텍스트, I-516·I-517): 다음 Down·Tab·Ctrl-N / 이전 Up·Shift-Tab·Ctrl-P / 처음 Home·PageUp·Shift-PageUp / 끝 End·PageDown·Shift-PageDown / 실행 Enter / 닫기 Escape·Ctrl-C. 처음 아래 키는 첫 선택 가능 항목, 끝에서 처음으로 순환(I-518).
- 메뉴 밖 클릭, Escape, 항목 실행 후, 포커스를 잃으면 닫힌다(I-519).
- 열린 채 항목의 단축키를 누르면 선택 표시 후 `menu.shortcut_activate_delay` 뒤에 닫고 실행한다(I-520).
- 브라우저 기본 우클릭 메뉴는 나오지 않는다. 인라인 입력칸 안에서도 앱 메뉴가 아니면 나오지 않으며, 입력칸의 복사·붙여넣기 키는 동작한다(03-tauri R-25).

**판정 방법**

- 검증 수준: V3.
- 메뉴 상자·항목·구분선 치수를 `getBoundingClientRect`·`getComputedStyle`로 재고, 키 동작을 실제 입력으로 확인한다.

**출처**

D-5 · I-313~I-318 · I-321 · I-501 · I-511 · I-515~I-520 · 03-tauri R-25 · gpui R-9

---

## R-10. 타이틀 바 밖 뼈대 치수(L-22 이후)가 Zed와 같다

**요구**

v0.1에서 판정하지 않은 뼈대 치수를 판정한다(INTENT 결정 기록 1). 대상은 v0.2 화면에 있는 영역이다.

**정해진 결과**

- 사이드바: 기본 폭 `sidebar.default_width`, 최소 `sidebar.min_width`, 최대 `sidebar.max_width`(L-33). 헤더 높이 `sidebar.header_height`(L-12). 폴더 줄 높이 `sidebar.item_row.height`, 왼쪽 `sidebar.project_header.padding_left`, 오른쪽 `sidebar.project_header.padding_right`(L-34). 푸터 높이 `sidebar.footer.height`, 여백 `sidebar.footer.padding`, 간격 `sidebar.footer.gap`, 위 테두리 `sidebar.footer.border_top`, 아이콘 `sidebar.footer.icon_size`(L-35, A-11.4). gpui 코드 값과 다르면 스펙 값이다(D-1).
- 경계선: `window.border_workspace_top`·`window.border_workspace_bottom`(L-301), `window.border_sidebar_header_bottom`(L-302), `window.border_sidebar_right`(L-303), `window.border_dock_left`(L-16).
- 왼쪽 Dock: 프로젝트 패널 기본 폭 `project_panel.default_width`(L-32), 크기 조절 손잡이 `dock.resize_handle_width`(L-30), 최소 폭 `dock.min_width`(L-31).
- 탭 바: 높이 `tab.bar_height`(L-22), 탭 내용 높이 `tab.content_height`(L-23), 좌우 여백 `tab.padding_x`·간격 `tab.gap`(L-24), 끝 버튼 영역 `tab.end_buttons_area.*`(L-27), 아이콘 `tab.bar_icon_size`(L-300), 테두리 `tab.border_width`·`tab.active_padding_bottom`(L-63), 제목 최대 글자 `tab.max_title_chars`(L-26).
- 상태 표시줄: 높이 `statusbar.height`, 위아래 `statusbar.padding_y`, 버튼 높이 `statusbar.button_height`(L-28), 묶음 간격 `statusbar.group_gap`·항목 간격 `statusbar.item_gap`(L-29), 아이콘 `statusbar.icon_size`(L-92).
- 사이드바 닫힘·열림에 따른 상태 표시줄 왼쪽 버튼 배치는 A-11.8·A-11.9다(R-17).
- 가운데는 Pane 하나다. v0.1의 두 Pane PoC 화면은 뺀다. 탭 바 끝 버튼(←·→·+·분할·최대화)은 gpui처럼 두되 비활성이다(리더 결정(사용자 위임 2026-11-05), Q-B). 툴팁은 R-7이다.

**판정 방법**

- 검증 수준
  - V2: 시작 상태에서 덤프할 수 있는 치수.
  - V3: 조작이 필요한 상태(사이드바 닫힘, 폭 끌기 최소·최대, hover)의 치수.
- 영역마다 `getBoundingClientRect`·`getComputedStyle`을 덤프해 toml ID별로 대조한다. 허용 오차는 공통 판정 방식이다.

**출처**

D-1 · INTENT 결정 기록 1 · L-12 · L-16 · L-22~L-35 · L-63 · L-92 · L-300~L-303 · A-11.4 · A-11.8 · A-11.9 · A-32.3~A-32.5

---

## R-11. 폴더 추가: OS 선택 창에서 폴더 하나를 고르면 목록 맨 아래에 붙고 활성화된다

**요구**

폴더 등록(A-13.1)을 만든다. 선택 창은 `tauri-plugin-dialog`다(D-7).

**정해진 결과**

- 진입: 사이드바 푸터·상태 표시줄의 폴더 추가 버튼, ☰ File → `Open Folder...`, `Ctrl+K Ctrl+O`(A-13.1, A-18.4).
- OS 폴더 선택 창(폴더 하나)을 연다(A-13.1, A-10.6). 고르면 목록 맨 아래에 붙이고 활성화한다. 취소하면 아무 일도 없다(A-13.8).
- 이미 등록된 경로(Windows는 대소문자 무시, 끝 `\` 무시, A-28)를 다시 고르면 새 항목을 만들지 않고 기존 항목을 활성화한다(A-13.2, A-16.6).
- 코어가 직접 검사한다: 경로가 있고, 폴더이고, 목록을 읽을 수 있는지. 하나라도 실패하면 등록하지 않고 `Cannot open this folder.` 알림만 보인다(A-16.4).
- 디스크는 읽기만 한다(A-13.1).
- capability는 폴더 선택에 쓰는 권한만 허용한다(D-7, `AGENTS.md` 5장).

**판정 방법**

- 검증 수준
  - V1: 경로 정규화·비교(A-28.1~A-28.6, 대소문자, 끝 `\`)와 등록 검사(없는 경로, 파일 경로, 읽을 수 없는 폴더). `cargo test`.
  - V3: 실제 선택 창을 입력 도구로 한 번 조작해 등록·취소를 확인한다(D-18). 목록·활성 항목은 사이드바 DOM으로 본다. 중복 경로 사례는 미리 만든 `state.json`으로 시작해 확인한다.
  - 코드 확인: capability 파일의 허용 권한.

**출처**

D-6 · D-7 · D-8 · D-14 · D-18 · A-10.5 · A-10.6 · A-13.1 · A-13.2 · A-13.8 · A-16.4 · A-16.6 · A-18.4 · A-28 · gpui R-10

---

## R-12. 사이드바 폴더 항목의 모양과 상태가 A-12와 같다

**요구**

등록 폴더 항목을 A-12대로 그린다.

**정해진 결과**

- [폴더 아이콘][이름]. 이름은 한 줄, 넘치면 말줄임(A-12.1). 줄 높이·여백은 R-10의 `sidebar.item_row.height`·`sidebar.project_header.padding_*`다. 폴더 아이콘 크기는 `sidebar.item.icon_size`이고(A-12.1), 아이콘은 Lucide `Folder`다(D-20).
- 활성(선택)·hover·누름·키보드 포커스 상태를 구분한다(A-12.2~A-12.5). 키보드 포커스는 항목 둘레 `sidebar.item.focus_border_width`다(A-12.5).
- 이름이 같은 폴더가 둘 이상이면 이름 뒤에 바로 위 폴더 이름을 덧붙인다. 예: `docs · guides`(A-12.6).
- 경로가 없어진 폴더는 이름·아이콘을 비활성 색으로 그린다(A-12.7).
- 툴팁은 없다(A-12.8).

**판정 방법**

- 검증 수준
  - V1: 같은 이름 덧붙이기(A-12.6). `node --test`.
  - V3: 같은 이름·없어진 경로를 포함한 `state.json`으로 시작해 DOM 덤프와 스크린샷으로 확인한다. 상태마다 쓰인 토큰의 CSS 변수를 덤프해 A-12.1~A-12.7의 토큰과 대조한다(공통 판정 방식의 색 판정).

**출처**

D-8 · D-20 · A-12.1~A-12.8 · A-32.12 · gpui R-11

---

## R-13. 폴더를 활성화하면 트리가 그 폴더 것으로 바뀌고, 폴더마다 작업 문맥이 따로 유지된다

**요구**

폴더 선택(A-13.3)과 전환 규칙(A-15)을 만든다(D-8).

**정해진 결과**

- 항목 클릭, 포커스 후 Enter, Up/Down 이동 후 Enter로 활성화한다(A-13.3, A-10.4). 사이드바에는 활성 폴더와 별도로 키보드 커서가 있다(D-8).
- 활성화하면 프로젝트 패널 트리가 그 폴더 루트 하나로 바뀐다(A-13.3).
- 트리 펼침·선택·스크롤은 폴더마다 따로 보관하고 전환해도 메모리에 남는다(A-15.2). 열린 탭도 폴더마다 따로다(A-15.1).
- 사이드바 폭·왼쪽 Dock 폭·열림은 전체 공유다(A-15.4).
- 전환한 뒤 포커스는 사이드바에 그대로 둔다(A-15.6).
- 타이틀 바에 활성 폴더 이름(`titlebar.project_name.max_chars` 말줄임)을 보이고, 폴더가 없으면 `Open Recent Project`(Muted)를 보인다(A-13.9, A-15.5, L-88, L-227, D-16). 눌러도 아무 일도 하지 않는다.

**판정 방법**

- 검증 수준: V3.
- 폴더 둘이 등록된 `state.json`으로 시작해 각각 트리를 펼치고 선택한 뒤 오가며, 펼침·선택·스크롤(`aria-expanded`·`aria-selected`·`scrollTop`)과 탭 목록이 폴더마다 유지되는지 덤프한다.

**출처**

D-8 · D-16 · A-10.4 · A-13.3 · A-13.9 · A-15.1~A-15.6 · L-88 · L-227 · I-108 · I-111 · gpui R-12

---

## R-14. 등록 해제는 목록에서만 빼고 디스크는 그대로 둔다

**요구**

등록 해제(A-13.4, A-13.5)를 만든다.

**정해진 결과**

- 진입: 사이드바 항목 우클릭 → `Remove`(I-935), 사이드바 포커스에서 `Delete`(A-13.4 ②, A-17.5), 프로젝트 패널 루트 항목 우클릭 → `Remove from Project`(I-555). 대상은 ①②는 선택한 항목, ③은 활성 폴더다.
- 확인창은 없다(A-14.4). 탭은 보기 전용이라 저장 질문이 나오지 않는다(D-10). 해제한 폴더의 탭은 함께 닫힌다.
- 디스크의 폴더·파일은 그대로다(A-13.4, A-14.3).
- 활성 폴더를 해제하면 아래 항목, 없으면 위 항목을 활성화하고, 하나도 없으면 빈 상태(R-16)다(A-13.5).

**판정 방법**

- 검증 수준: V3.
- 세 진입 경로마다 해제 전후의 사이드바 DOM·활성 항목과 디스크 상태(폴더·파일 목록 비교)를 확인한다.

**출처**

D-10 · A-13.4 · A-13.5 · A-14.1~A-14.6 · A-17.5 · I-107 · I-555 · I-935 · gpui R-13

---

## R-15. 우클릭 Move Up·Move Down으로 폴더 순서를 한 칸씩 바꾼다

**요구**

사이드바 항목 우클릭 메뉴(I-667)와 순서 바꾸기(A-13.6)를 만든다.

**정해진 결과**

- 메뉴: `Move Up`, `Move Down`, 구분선, `Remove`(I-667, A-12.10). Move Up·Move Down은 폴더가 둘 이상일 때 보이고, 맨 위·맨 아래면 비활성이다(I-934, I-940). 단축키는 없다.
- 순서는 처음에 등록 순서이고 한 칸씩 바뀐다(A-13.6).
- 사이드바 빈 공간과 폴더 추가 버튼에는 우클릭 메뉴가 없다(I-937, I-939).
- 끌어서 순서 바꾸기는 없다(A-12.11).
- 바꾼 순서는 `state.json`에 저장되고 다음 시작 때 복원된다(R-29).

**판정 방법**

- 검증 수준: V3.
- 폴더 셋으로 메뉴 항목의 표시·비활성과 순서 변화를 DOM 덤프로 확인하고, `state.json`의 `folders` 순서를 읽는다.

**출처**

D-11 · A-12.10 · A-12.11 · A-13.6 · A-22.2 · I-667 · I-934 · I-935 · I-937 · I-939 · I-940 · gpui R-14

---

## R-16. 예외 상태(폴더 없음, 경로 없음, 겹침, 개수)가 A-16대로 동작한다

**요구**

A-16의 예외 상태를 만든다.

**정해진 결과**

- 등록 폴더가 없으면 사이드바 목록은 비어 있고, 프로젝트 패널에 `Choose one of the options below to use the Project Panel` 문구와 `Open Project` 버튼 하나를 보인다. 버튼은 폴더 선택 창을 연다(A-16.1).
- 경로가 없는 폴더를 활성화하면 트리 자리에 `This folder no longer exists.`와 Remove 버튼을 보인다(A-16.2, A-12.7). 실행 중 폴더가 사라져도 같다(A-16.3, R-25).
- 한 폴더가 다른 등록 폴더의 안쪽·바깥이어도 독립 항목으로 허용한다(A-16.5).
- 등록 수 제한은 없고 목록은 세로 스크롤한다(A-16.7).

**판정 방법**

- 검증 수준: V3.
- 빈 상태, 없는 경로, 안쪽·바깥 폴더, 많은 폴더(스크롤) 사례를 각각 `state.json`으로 만들어 시작하고 DOM 덤프로 확인한다. 실행 중 사라짐은 PowerShell로 폴더 이름을 바꿔 본다.

**출처**

A-12.7 · A-16.1~A-16.7 · gpui R-15

---

## R-17. 사이드바·프로젝트 패널의 표시·포커스 키가 A-17·I-098~I-100대로 동작한다

**요구**

사이드바와 프로젝트 패널의 표시 토글과 포커스 토글을 구분해 만든다.

**정해진 결과**

- `Ctrl+Alt+J`: 사이드바 열기·닫기. 열 때 포커스를 옮기고, 닫을 때 사이드바에 포커스가 있었으면 이전 위치로, 없으면 가운데 Pane으로 돌아간다(A-17.1, I-100).
- `Ctrl+Alt+;`: 닫혀 있으면 열고 포커스. 열려 있고 포커스가 있으면 이전 포커스로 돌아가되 닫지 않는다(A-17.2, I-099).
- `Ctrl+B`: 왼쪽 Dock 표시 토글(A-17.7, I-098).
- `Ctrl+Shift+E`: 바깥에서 누르면 Dock을 열고 프로젝트 패널에 포커스, 패널에서 다시 누르면 가운데 Pane으로 돌아가고 패널은 닫지 않는다(A-17.8, I-098).
- 사이드바가 닫히면 상태 표시줄 왼쪽에 사이드바 토글·폴더 추가·프로젝트 패널 토글이 이 순서로 보인다(A-11.9). 열리면 푸터에 사이드바 토글(왼쪽)·폴더 추가(오른쪽 끝), 상태 표시줄 왼쪽에 프로젝트 패널 토글이 보인다(A-11.8).

**판정 방법**

- 검증 수준: V3.
- 키 입력마다 사이드바·Dock의 표시 여부와 `document.activeElement`를 덤프한다.

**출처**

A-11.8 · A-11.9 · A-17.1 · A-17.2 · A-17.7 · A-17.8 · I-098~I-100 · gpui R-16

---

## R-18. 프로젝트 패널 트리가 활성 폴더 루트를 맨 위에 두고 01-zed 치수로 그려진다

**요구**

프로젝트 패널 트리를 만든다. 보이는 범위만 그리는 가상 스크롤을 고정 행 높이로 직접 쓴다(D-9).

**정해진 결과**

- 활성 폴더 루트 하나를 맨 위 항목으로 그린다(L-41).
- 자식이 하나뿐인 폴더 경로는 한 줄로 합친다. 예: `docs \ guides`(L-42). 합친 경로 조각의 좌우 여백은 `project_panel.collapsed_path.padding_x`(L-43)다.
- 항목 높이 `project_panel.item.height`(L-36, `conditions.project_panel_comfortable`), 내용 높이 `project_panel.item.content_height`, 좌우 여백 `project_panel.item.padding_x`, 간격 `project_panel.item.gap`, 들여쓰기 단계 `project_panel.indent_step`(L-37). 안내선 폭 `project_panel.indent_guide.width`, x = 깊이 × `project_panel.indent_step` + `project_panel.indent_guide.offset_x`, 위아래 `project_panel.indent_guide.padding_y`(L-38). 항목 테두리 `project_panel.item.border_width`·`project_panel.item.border_right_width`(L-48).
- 파일·폴더 아이콘은 Lucide SVG(`File`, `FolderOpen`·`FolderClosed` 등, D-20)다. 크기(L-40)는 원문이 추정이라 toml에 없고 판정하지 않는다(gpui `spec/ambiguous.md` L-40). 아이콘 테마 매핑은 판정하지 않는다(INTENT 결정 기록 3).
- 펼친 항목이 많아도 DOM에는 보이는 범위(앞뒤 여유 포함)의 행만 있다. 스크롤해도 행 위치가 `project_panel.item.height` 단위로 맞는다.
- 각 행은 `role="treeitem"`, `aria-level`, 폴더면 `aria-expanded`, 선택이면 `aria-selected`를 가진다(접근성 기본 요소).

**판정 방법**

- 검증 수준
  - V1: 펼침 상태에서 보이는 행 목록 만들기(접힌 경로 합치기 포함)와 보이는 범위 계산. `node --test`.
  - V3: 여러 단계의 시험 폴더가 등록된 `state.json`으로 시작해 펼친 뒤 치수를 덤프로 대조하고, 많은 항목에서 DOM 행 수가 보이는 범위만큼인지 본다.

**출처**

D-9 · D-20 · L-36~L-43 · L-48 · A-32.14~A-32.16 · gpui R-17

---

## R-19. 트리의 누르기·키보드 동작이 I-087~I-090과 I-030~I-033·I-043대로다

**요구**

트리의 마우스·키보드 동작을 만든다.

**정해진 결과**

- 폴더를 누르면 펼침 토글, Alt+클릭은 하위 전체 토글(I-089). Right는 닫힌 폴더를 펼치고 이미 펼쳤으면 다음 항목 선택, Left는 펼친 폴더를 접고 아니면 부모로(I-089, I-031). Ctrl+Left/Right 전체 접기/펼치기(I-032). Ctrl+Left에서 루트는 펼친 채 둔다(gpui 판단 표, D-17).
- Up/Down·Home/End는 선택·스크롤만 바꾸고 파일을 열지 않는다(I-030, I-088). 끝에서 돌지 않는다(gpui 판단 표). Space는 파일을 임시 탭으로 열고 트리에 포커스를 남긴다(I-033).
- Shift+클릭 범위 선택, Ctrl+클릭 개별 선택 토글(I-090), Shift+Up/Down 범위 확장(I-043).
- 파일 한 번 클릭 = 임시 탭(편집기 포커스 없음), 더블클릭·가운데 클릭 = 일반 탭 + 편집기 포커스(I-087). 탭 동작은 R-26이다.

**판정 방법**

- 검증 수준
  - V1: 선택 범위·키 이동 규칙(Shift 범위, Ctrl 토글, Left/Right, 끝에서 멈춤). `node --test`.
  - V3: 시험 폴더에서 실제 입력으로 각 조작을 하고 `aria-expanded`·`aria-selected`·`document.activeElement`를 덤프한다.

**출처**

D-10 · D-17 · I-030~I-033 · I-043 · I-087~I-090 · gpui R-18

---

## R-20. 새 파일·새 폴더·이름 변경을 트리 안 인라인 입력칸으로 하고, 한글 조합 중에도 깨지지 않는다 (03-tauri R-08)

**요구**

생성·이름 변경(I-091, I-092)을 만든다. 인라인 입력칸의 한글 조합 처리를 정한다(03-tauri R-08).

**정해진 결과**

- Ctrl+N 새 파일, Alt+N 새 폴더(I-036). Enter 또는 F2는 이름 변경이다(I-034).
- 인라인 입력칸: Enter 확정, Escape는 입력을 버리고 패널로 포커스 복귀, 포커스를 잃으면 확정을 시도하고 안 되면 버린다(I-035, I-092).
- 이름 변경은 파일이면 확장자를 뺀 이름만, 폴더면 이름 전체를 선택한다. 루트 폴더는 이름을 바꿀 수 없다(I-091, A-14).
- 입력칸 모양: 높이 `inline_input.height`(P-019), 테두리 `inline_input.border_top_bottom_left`·`inline_input.border_right`(P-020), 검증 배너 `inline_input.banner.padding_y`·`inline_input.banner.padding_x`·`inline_input.banner.border`(P-021).
- 문구와 검증은 P-019~P-022를 따른다. Windows에서 확정할 때 이름 끝의 마침표를 모두 지운다, 새 항목 입력이 `/` 또는 `\`로 끝나면 폴더 생성으로 바뀐다, 앞뒤 공백이 있으면 경고 `File or directory name contains leading or trailing whitespace.`(P-021, P-022).
- 새 항목 가상 행 자리: 폴더는 맨 앞, 파일은 폴더들 뒤(gpui 판단 표, D-17).
- 생성한 파일은 일반 탭으로 열고 편집기에 포커스를 준다(I-097 `auto_open.on_create`, gpui 판단 표).
- 한글 조합 중(`isComposing`)에는 Enter·Escape·방향키가 확정·취소·이동을 하지 않고, 마지막 글자가 잘리거나 겹치지 않는다(03-tauri R-08, I-035, P-021).

**판정 방법**

- 검증 수준
  - V1: 이름 검증(끝 마침표, `/`·`\` 끝, 앞뒤 공백)과 이름 변경 선택 범위 계산. `node --test`. 조합 중 키 무시 규칙도 사례로 둔다.
  - V3: 키 입력으로 생성·이름 변경·취소·포커스 잃음을 하고 디스크 상태와 트리 DOM을 확인한다. 이름 변경 시작 때 입력칸의 `selectionStart`·`selectionEnd`를 덤프한다. Microsoft 한글 입력기로 조합 중 Enter·Escape를 실제 입력해 결과 이름을 확인한다.

**출처**

D-17 · I-034~I-036 · I-091 · I-092 · I-097 · P-019~P-022 · A-14 · 03-tauri R-08 · gpui R-19

---

## R-21. 휴지통과 영구 삭제는 다른 동작이고, 둘 다 01-zed 문구의 TaskDialog를 거친다 (03-tauri R-15)

**요구**

Trash와 Delete(I-093, A-14)를 만든다. 확인창은 `windows` `TaskDialogIndirect`다(D-7, D-12).

**정해진 결과**

- Trash: Delete·Backspace(I-039), `trash`로 휴지통으로 옮긴다(D-7). Delete: Shift+Delete·Ctrl+Delete·Ctrl+Backspace(I-040), `std::fs`로 지운다. 둘 다 루트가 아닌 항목에만 있다(A-14.1, I-093). 루트가 선택된 채 Delete 키를 누르면 아무 일도 하지 않는다.
- 확인창 문구(A-14.7~A-14.10)
  - 휴지통, 하나: ``Do you want to trash `name`?`` + `Trash`와 취소
  - 영구 삭제, 하나: ``Are you sure you want to permanently delete `name`?`` + 보조 `This cannot be undone.` + `Delete`와 취소
  - 여러 항목: 본문이 `… the following N files?`로 바뀌고 목록을 보인다. 넘치면 `.. N files not shown`.
  - 수정된 버퍼 문구(A-14.10)는 탭이 보기 전용이라 나오지 않는다(D-10).
- 기본 버튼은 취소이고 `Esc`도 취소다. 창 제목은 `workbench-tauri`다(D-12).
- 실패하면 `Failed to trash/delete X of Y file(s).` 알림(A-14.11).
- 키를 바꿔도 확인창을 건너뛰지 않는다.
- 삭제 뒤 선택은 같은 자리 행이다. 열린 파일을 지운 탭은 그대로 둔다(gpui 판단 표, D-17).
- 03-tauri R-15 결과: `TaskDialogIndirect`로 사용자 문구의 버튼과 기본 버튼 취소가 되는지가 PROGRESS에 있다.

**판정 방법**

- 검증 수준: V3.
- 시험 폴더의 파일·폴더로 Trash·Delete를 하고, 확인창 문구(창 텍스트를 UI Automation 또는 스크린샷으로)와 확인·취소 뒤 디스크 상태(휴지통 목록 포함)를 확인한다. 여러 항목·넘치는 목록·실패(잠긴 파일) 사례를 포함한다.
- 측정 PC의 작업 드라이브에 휴지통이 없으면 휴지통 항목은 "판정 불가"로 적는다(gpui v0.3 Q-16과 같은 사정).

**출처**

D-7 · D-10 · D-12 · D-14 · D-17 · I-039 · I-040 · I-093 · A-14.1~A-14.11 · 03-tauri R-15 · gpui R-20

---

## R-22. 잘라내기·복사·붙여넣기·복제·경로 복사가 파일·폴더 단위로 동작하고, 이미 있는 대상과 바뀐 원본을 잃지 않는다

**요구**

트리의 파일 작업(I-037, I-041)을 만들고, gpui v0.3 P3-D1·P3-D2와 AUDIT 3 회피를 지킨다(D-17).

**정해진 결과**

- Ctrl+C·Ctrl+Insert 복사, Ctrl+X 잘라내기, Ctrl+V·Shift+Insert 붙여넣기는 파일·폴더 작업이다(I-037). 붙여 넣을 것이 없으면 Paste는 비활성(I-544). Duplicate(I-543).
- Shift+Alt+C 경로 복사, Ctrl+K Ctrl+Shift+C 상대 경로 복사(I-041, I-548, I-549). 결과는 OS 클립보드 문자열이다(`navigator.clipboard`, D-7). 루트의 상대 경로는 폴더 이름, 여러 항목은 줄바꿈으로 잇는다(gpui 판단 표).
- 붙여넣기·복제 이름은 ` copy`, ` copy 1`(파일은 확장자 앞, 폴더는 이름 끝)이다. 같은 폴더에 잘라 붙이면 아무 일도 하지 않는다. 클립보드는 창 하나에 하나다(gpui 판단 표).
- 붙여넣기·복제로 생긴 파일은 일반 탭으로 열고 패널 포커스를 유지한다(I-097 `on_paste`, gpui 판단 표).
- 데이터 손실 방지(gpui v0.3 P3-D1·P3-D2)
  - 복사·복제는 목적 이름을 배타적으로 확보한 뒤 `std::fs::copy`로 채운다. 대상이 이미 있으면 덮어쓰지 않고 오류다.
  - 복사 결과는 NTFS 추가 스트림·속성·수정 시각을 보존한다.
  - 다른 볼륨 이동은 복사 전과 삭제 직전 원본의 목록·크기·수정 시각을 대조한다. 다르면 원본과 복사본을 남기고 오류로 끝낸다.
  - 남은 한계(이름 확보~복사 사이 경쟁, 마지막 대조~삭제 사이 변경, 같은 크기·같은 시각 변경)는 `shortcut:` 주석에 있다.
- 실패 알림(AUDIT 3 회피): 붙여넣기·복제·이동이 실패하면 알림(D-14)으로 알린다. 잘라내기 클립보드는 성공했을 때만 비운다.
- 실패 알림 문구는 01-zed에 없어 우리 문구로 정한다. `state.json` 문구(`Could not save the window state.`)와 같은 어조다(리더 결정(사용자 위임 2026-11-05), Q-K).
  - 붙여넣기(복사·잘라내기 모두) 실패: `Could not paste the item.`
  - 복제 실패: `Could not duplicate the item.`
  - 여러 항목 가운데 일부가 실패해도 알림은 하나다.

**판정 방법**

- 검증 수준
  - V1: `cargo test`로 임시 폴더에서 다음을 확인한다. 이미 있는 대상을 덮어쓰지 않음, 추가 스트림·수정 시각 보존, 다른 볼륨 이동 중 원본이 바뀌면 원본 보존(gpui `copy_keeps_existing_destination`·`copy_keeps_streams_and_mtime`과 같은 사례). 이름 짓기(` copy`, ` copy 1`)도 테스트 하나.
  - V3: 시험 폴더에서 각 작업 후 디스크 상태와 클립보드 문자열을 확인하고, 실패 사례(대상 잠금)에서 알림 DOM과 클립보드가 남는지 본다.
  - 코드 확인: `shortcut:` 주석의 위치.
- 다른 볼륨 이동의 V1·V3에 쓸 두 번째 볼륨이 측정 PC에 없으면 그 사례는 "판정 불가"로 적는다.

**출처**

D-7 · D-14 · D-17 · I-037 · I-041 · I-097 · I-543 · I-544 · I-548 · I-549 · gpui v0.3 P3-D1·P3-D2·AUDIT 3 · gpui R-21

---

## R-23. 프로젝트 패널 우클릭 메뉴가 02 11.2절 구성·조건과 같다

**요구**

프로젝트 패널 우클릭 메뉴를 만든다.

**정해진 결과**

- 우클릭한 항목이 선택이 되고 메뉴는 선택 항목에 대해 동작한다(I-560). 빈 공간을 우클릭하면 마지막 루트 항목의 메뉴(I-559). 여러 항목을 표시한 상태에서 Cut·Copy·Trash·Delete는 표시된 모든 항목에 적용한다(I-562). Menu 키·Shift+F10으로 연다(I-042). 위치는 선택 항목 행 왼쪽 아래에서 (`menu.context.keyboard_offset_x`, `menu.context.keyboard_offset_y`)다(I-502, gpui 판단 표).
- 항목·단축키·조건은 I-530~I-557과 02 11.2절 표의 "앞 구분선" 열을 따른다. gpui R-22의 목록과 같다.
  - New File(Ctrl-N)·New Folder(Alt-N) / Reveal in File Explorer(Ctrl-Alt-R)·Open in Default App(Ctrl-Shift-Enter) / Unfold·Fold Directory / Cut(Ctrl-X)·Copy(Ctrl-C)·Duplicate·Paste(Ctrl-V, 없으면 비활성) / Copy Path(Alt-Shift-C)·Copy Relative Path(Ctrl-K Ctrl-Shift-C) / Rename(F2, 루트면 숨김) / Trash(Delete)·Delete(Ctrl-Delete)(루트가 아닐 때) / 루트: Add Folders to Project…(폴더 등록)·Remove from Project(등록 해제) / 폴더: Expand All·Collapse All
- Open Markdown Preview(I-535)는 비활성 항목이다(D-15).
- Reveal in File Explorer·Open in Default App은 `tauri-plugin-opener`로 부른다. capability는 쓰는 권한만 허용한다(D-19).

**판정 방법**

- 검증 수준: V3.
- 파일·폴더·루트·빈 공간에서 메뉴를 열어 항목·단축키·구분선·비활성을 02 11.2절과 대조하고(DOM 덤프), 항목마다 실행 결과를 확인한다. Reveal·Open in Default App은 열린 탐색기·앱 창을 확인한다.
- 코드 확인: opener capability의 허용 권한.

**출처**

D-15 · D-17 · D-19 · I-042 · I-502 · I-515 · I-530~I-562 · A-14 · gpui R-22

---

## R-24. 활성 파일이 바뀌면 트리가 그 항목을 펼쳐 보이되 포커스는 옮기지 않는다

**요구**

자동 표시(I-096)를 만든다.

**정해진 결과**

활성 파일이 바뀌면 트리에서 그 항목까지 펼쳐 보인다. 트리에 포커스를 가져오지 않는다(I-096 `auto_reveal_entries` 기본 true).

**판정 방법**

- 검증 수준: V3.
- 깊은 위치의 파일을 연 뒤 `aria-expanded`와 `document.activeElement`를 덤프한다.

**출처**

D-10 · I-096 · gpui R-23

---

## R-25. 바깥에서 파일·폴더가 생기거나 지워지거나 바뀌면 트리와 열린 파일에 반영된다 (03-tauri R-24)

**요구**

디스크 감시(G-115)를 `notify`로 만든다(D-7).

**정해진 결과**

- 활성 폴더 안에서 바깥 프로그램이 파일·폴더를 만들거나 지우거나 이름을 바꾸면 트리에 반영된다.
- 등록 폴더 자체가 사라지면 R-16의 "경로 없음" 상태가 된다(A-16.3).
- 탭으로 열린 파일이 바깥에서 바뀌면 그 탭 내용을 자동으로 다시 읽는다(E-086 앞부분). 탭은 보기 전용이라 모든 버퍼가 깨끗하다(D-10).
- 한 번의 바깥 변경에 이벤트가 여러 개 와도 트리가 한 번의 변경으로 맞게 보인다(03-tauri R-24 "디바운스"). 앱 자신의 파일 작업(R-20~R-22)이 낸 이벤트로 트리가 중복되거나 깜빡이지 않는다.
- 충돌 표시(E-086 뒷부분), 지워진 파일 취소선(E-087), 저장 때 확인창(E-084, E-085)은 판정하지 않는다(D-10).

**판정 방법**

- 검증 수준: V3.
- 앱을 띄운 채 PowerShell로 시험 폴더에 파일·폴더를 만들고 지우고 이름을 바꿔 트리 DOM이 바뀌는지 확인하고, 탭으로 연 파일 내용을 바깥에서 바꿔 탭 내용(CM6 문서 텍스트)이 다시 읽히는지 확인한다. 반영까지 걸린 시간을 기록한다(원문에 기준 수치 없음).
- 앱 안에서 이름 변경·붙여넣기를 한 직후 트리 행 수와 순서가 한 번에 맞는지 본다.

**출처**

D-7 · D-10 · A-16.3 · E-084~E-087 · 03-tauri R-24 · gpui R-24

---

## R-26. 트리에서 파일을 탭으로 열고, 임시 탭 하나를 교체·승격하며, 탭은 폴더마다 따로 있고 보기 전용이다

**요구**

시나리오 A-33.2·A-33.4에 필요한 최소 탭 동작을 만든다(D-10).

**정해진 결과**

- 트리에서 파일을 한 번 클릭하거나 Space를 누르면 임시 탭으로 연다. 한 번 클릭은 편집기에 포커스를 주지 않고, Space는 트리에 포커스를 남긴다(I-087, I-033, I-061).
- Pane마다 임시 탭은 `pane.max_preview_tabs`개다. 다른 파일을 임시로 열면 기존 임시 탭을 닫고 그 자리(인덱스)를 재사용한다(I-062).
- 더블클릭(또는 가운데 클릭)은 일반 탭으로 열고 편집기에 포커스를 준다. 이미 임시 탭으로 열린 파일이면 일반 탭으로 바뀐다(I-087, I-063).
- 임시 탭 제목은 기울임꼴이다(I-064).
- 열린 탭은 폴더마다 따로 보관하고, 폴더를 바꾸면 그 폴더의 탭이 보인다(A-15.1).
- 탭 내용은 CM6 편집기로 보이고 읽기 전용이다. 글자를 입력해도 내용과 디스크 파일이 바뀌지 않는다(D-10).
- 파일은 UTF-8로 읽고, 깨진 바이트는 대체 문자로 보인다(gpui 판단 표, D-17). 이름 변경 때 탭 경로는 새 경로로 바뀐다. 탭이 없을 때 탭 바는 자리 표시를 둔다(gpui 판단 표).
- 열린 파일의 구문 강조: 확장자가 `html`·`toml`이면 v0.1의 문법(D-1, v0.1 D-11~D-13)으로 강조하고, 나머지는 강조하지 않는다(리더 결정(사용자 위임 2026-11-05), Q-C).
- 저장·탭 닫기·이동 기록은 없다.

**판정 방법**

- 검증 수준: V3.
- 실제 입력으로 트리 조작을 하고 탭 DOM(순서, 활성, 제목의 `font-style`)과 `document.activeElement`를 덤프한다. 탭 편집기에 글자를 입력해 CM6 문서 텍스트와 디스크 파일 해시가 바뀌지 않는지 확인한다.
- `html`·`toml` 파일과 다른 확장자 파일을 열어 강조 클래스가 붙은 요소의 유무를 덤프한다.

**출처**

D-10 · D-17 · A-15.1 · I-033 · I-061~I-064 · I-087 · gpui R-27

---

## R-27. 시나리오 A-33.2가 된다

**요구**

A-33.2를 끝까지 한다.

**정해진 결과**

트리에서 `README.md`를 한 번 클릭하면 임시 탭(제목 기울임)이 열린다 → 다른 파일을 한 번 클릭하면 같은 자리에서 교체된다 → 더블클릭하면 일반 탭이 된다(A-33.2, I-061, I-062, I-064, I-087).

**판정 방법**

- 검증 수준: V3.
- 실제 입력으로 시나리오를 하고 단계마다 스크린샷과 탭 DOM 덤프(목록·임시 여부)를 남긴다.

**출처**

D-10 · A-33.2 · I-061 · I-062 · I-064 · I-087 · gpui R-25

---

## R-28. 시나리오 A-33.4가 된다

**요구**

A-33.4를 끝까지 한다.

**정해진 결과**

폴더 둘을 등록한다 → 각각 탭을 연다 → 전환해도 탭이 따로 유지된다 → 하나를 해제한다 → 디스크에 그대로 있다(A-33.4, A-13, A-15).

**판정 방법**

- 검증 수준: V3.
- 폴더 등록은 R-11의 선택 창으로 하나, 미리 만든 `state.json`으로 하나를 쓴다(D-18). 단계마다 스크린샷, 폴더별 탭 DOM 덤프, 해제 뒤 디스크 상태를 남긴다.

**출처**

D-10 · D-18 · A-33.4 · A-13 · A-15 · gpui R-26

---

## R-29. 등록 폴더 목록·순서·활성 폴더·사이드바 폭을 `state.json`에 A-24대로 원자적으로 저장하고 다음 시작 때 복원한다 (03-tauri R-21)

**요구**

D-11 범위의 상태를 저장·복원한다. 쓰기·읽기는 A-24.1~A-24.7이다.

**정해진 결과**

- `%APPDATA%\workbench-tauri\state.json`(D-6)의 필드는 `version`, `windows[].folders[]`(`id`, `path`, `added_at`), `windows[].active_folder_id`, `windows[].sidebar.width`다. 폴더 순서는 `folders` 배열 순서다(A-13.6, A-22.2). `id`는 `crypto.randomUUID()`의 UUID v4(A-22.3, D-7), `added_at`은 UTC ISO 8601(A-22.5)이다.
- 폴더 등록·해제·순서·활성 변경과 사이드바 폭 변경 뒤 `app.state_save_debounce` 안에 또 변경이 없으면 쓰고, 종료 직전에 한 번 더 쓴다(A-24.2, A-24.3).
- 쓰기 순서(A-24.1): 같은 폴더에 `state.json.tmp`를 새로 만들어 전체를 쓴다 → 디스크로 내린다(`sync_all`) → 기존 `state.json`이 있으면 `ReplaceFileW`, 없으면 `MoveFileExW`(`MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH`)로 `state.json` 자리에 놓는다. 두 API는 `windows` =0.62.2에 `Win32_Storage_FileSystem` feature를 더해 부른다(D-7, 사용자 결정 2026-11-05, Q-9).
- 교체가 실패하면 `app.state_replace_retry_delay` 간격으로 `app.state_replace_retry_count`번 다시 시도한다. 그래도 실패하면 `.tmp`를 그대로 두고, 메모리 상태를 유지하고, `Could not save the window state.` 알림을 보이고, 다음 쓰기 때 처음부터 다시 한다(A-24.4).
- `state.json`이 없거나 깨졌고 `.tmp`가 올바른 JSON이면 `.tmp`를 쓴다. 둘 다 안 되면 빈 상태로 시작한다(A-24.5).
- 깨진 `state.json`은 `state.json.bad-YYYYMMDD-HHMMSS`로 옮긴다. 같은 이름이 있으면 `-2`, `-3`을 붙인다. 최근 `app.state_bad_max_keep`개만 남긴다. 알림은 `Could not read the window state.`다(A-24.6, D-11).
- `version`이 앱보다 크면 읽기만 하고 쓰지 않는다(A-24.7).
- 알 수 없는 키는 읽을 때 무시하고 쓸 때 보존한다(A-20).
- 앱을 다시 시작하면 목록·순서·활성 폴더·사이드바 폭이 마지막 값으로 돌아온다. 경로가 없어진 폴더는 R-16의 "경로 없음" 상태다(A-16.2).
- 그 밖의 A-22 항목(열린 탭, Dock 폭, 창 위치, 최근 목록 등)은 쓰지 않는다(D-11).

**판정 방법**

- 검증 수준
  - V1
    - 코어(`cargo test`, 임시 폴더): `.tmp` 쓰기 → 교체, 교체 실패 재시도(대상 파일을 잠가 재현), `.tmp` 복구, 깨진 파일 보관 이름(`-2`·`-3`)과 최근 개수 정리.
    - 화면(`node --test`): 알 수 없는 키 보존, `version`이 클 때 쓰지 않음.
  - V3: 폴더 등록·순서·활성·폭 변경 뒤 `state.json` 내용을 읽고, 앱을 닫았다 다시 띄워 복원 결과를 DOM 덤프로 확인한다. 없는 경로, 알 수 없는 키가 든 파일, 깨진 파일, `.tmp`만 남은 사례를 포함한다.
  - 코드 확인: `ReplaceFileW`·`MoveFileExW` 호출의 위치와 플래그(`MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH`).

**출처**

D-6 · D-7 · D-11 · D-14 · A-11.1 · A-13.6 · A-16.2 · A-20 · A-22 · A-22.2 · A-22.3 · A-22.5 · A-24.1~A-24.7 · 03-tauri R-21 · gpui R-28

---

## R-30. 큰 파일 열기와 재귀 복사·다른 볼륨 이동이 UI를 막지 않는다

**요구**

gpui v0.3 AUDIT 4(큰 파일 첫 열기와 복사·이동이 UI 스레드를 막음)를 처음부터 피한다(D-17).

**정해진 결과**

- 파일 읽기, 재귀 복사, 다른 볼륨 이동은 비동기 코어 명령으로 한다. 진행 중에도 WebView가 입력(트리 이동, 메뉴 열기)에 응답한다.
- 큰 파일 본문은 JSON 문자열이 아니라 바이트 응답(`tauri::ipc::Response`) 같은 큰 데이터 방식으로 받는다(03-tauri 2.4 "큰 데이터", 03-tauri R-10). 방식은 PLAN 작업에서 정한다.

**판정 방법**

- 검증 수준
  - 코드 확인: 해당 명령이 `async`이거나 별도 스레드에서 도는 위치.
  - V3: 큰 시험 파일 열기와 큰 시험 폴더 복사 중에 트리에서 키 이동을 하고 응답(`aria-selected` 변화)까지의 시간을 기록한다. 큰 파일은 v0.1 M-3과 같은 10MB HTML이다. 시험 폴더 크기는 PLAN에서 정한다. 원문에 통과 기준이 없어 측정값을 기록하면 충족이다(리더 결정(사용자 위임 2026-11-05), Q-J).

**출처**

D-17 · gpui v0.3 AUDIT 4 · 03-tauri 2.4 · 03-tauri R-10
