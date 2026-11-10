[DONE] ORDER-07 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-15 | 2칸 세 단계 파일 → 2칸 간격 선, 4칸 파일 → 4칸 간격. 활성 선 강조·빈 줄 이어짐 그대로(V3) | 충족 | `specs/v0.7/verify/ORDER-07/v3.json` `c1_guides`(글자 폭 9px). two.yaml 선 left는 5·23·41(간격 18 = 2칸), four.ts는 5·41·77(간격 36 = 4칸). 두 파일 모두 활성 선이 하나다. 빈 5줄을 지나는 선은 높이 72(3줄)다. 색 `#fefef31b`/`#fffaed2d`는 그대로다. 캡처 `c1-guides-two-space.png`, `c1-guides-four-space.png` |
| 2 I-18 | 찾기 줄을 연 채 Preview Markdown·Find 툴팁 전체가 보인다. 닫혀 있을 때도 같다(V3) | 충족 | `c2_tooltips`: 열림·닫힘의 툴팁 글과 위치가 같다(Preview 1162,88 235×53; Find 1367,88 53×38). 열림 때 툴팁이 찾기 줄(y 110, h 45)과 겹치고, 툴팁 z 1000이 패널 z 300보다 위다. 캡처 `c2-preview-tooltip-find-open.png`, `c2-find-tooltip-find-open.png`, `c2-*-closed.png` |
| 3 I-19 | Help에 "About"·"Repository", 각각 지금처럼 동작(V3 캡처) | 충족 | `c3_c5_menus.help`: 순서대로 View Dependency Licenses, File Bug Report..., Request Feature..., Repository, About. About 창은 "workbench-tauri 0.7.0"이다(`c3-about.png`, `c3-help-menu.png`). Repository는 외부 브라우저를 여는 동작이라 누르지 않았다. 동작(URL)은 이름만 바꾼 diff와 `app-menus.test.ts`로 확인했다 |
| 4 I-20 | Search 탭 `wd` + `read` → 셋, 끄면 넷. 편집 탭 찾기 `wd` → `x/3`, 끄면 `x/4`(V1·V3) | 충족 | `c4_search_tab`: 켬 → my_read.txt, read.md, to-read. 끔 → reader.md까지 넷. `c4_editor_find`: 켬 `1/3`, 끔 `1/4`. 단어를 선택한 채 찾기 줄을 다시 열어도 `wd`가 켜져 있고 `1/3`이다. V1: `name_search.rs` 테스트(넷 목록), `search.test.ts`. 캡처 `c4-*` |
| 5 I-21 | 메뉴 줄에 Window가 없다. 타이틀 바 버튼으로 최소화·최대화·원래 크기(V3) | 충족 | `c3_c5_menus.bar`: File, Edit, View, Go, Help. `c5_title_buttons`: 최대화 1920×1032(버튼이 Restore로 바뀜), 원래 크기 1440×852(240,90), 최소화 뒤 창 위치 -31992,-31999(최소화 상태). 캡처 `c5-menu-bar.png`, `c5-maximized.png` |
| 5A I-17 고침 | Editor 키 셋을 넣은 파일에서 Editor Load Defaults 확인 → 파일에 Editor 키가 없고 화면은 기본값. Preview 키·주석·알 수 없는 키 그대로(V3), 테스트 고침(V1) | 충족 | `c5a_load_defaults`: 시작 20·2.2·wrap false. 확인 뒤 화면은 15·1.6·wrap true이고, 파일은 `{ // user comment, "x_unknown": 1, "preview_font_size": 22 }`이다. Preview 값은 22 그대로다(`c5a-editor-after-load-defaults.png`). V1: `model.test.ts`에 키 지우기 테스트(BOM·CRLF·주석, 첫·마지막·유일·한 줄·끝 쉼표·중첩 키, 모든 키 지우기, 깨진 파일 거부)가 있다 |
| 6 빌드 | `workbench-tauri_0.7.0_x64-setup.exe` 새로 만듦(수정 시각), 제품 버전 0.7.0, `docs/BUILD.md` 새 결과(V1) | 충족 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.7.0_x64-setup.exe`: 6,024,784 바이트, LastWriteTime 2026-11-10 20:03:16(ORDER-05 때는 6,020,919 바이트, 17:35), ProductVersion·FileVersion 0.7.0. 앱 exe 16,743,936 바이트, 0.7.0. `docs/BUILD.md` 4장 두 행·표 위 문장, 5장 걸린 시간(66.4초) |
| 7 테스트 | I-15 단위 감지, I-20 두 곳 구분자 테스트, 기존 테스트 통과(V1) | 충족 | `indent-guides.test.ts`(2칸 세 단계→2, 4칸→4, 혼재→2, 탭→4, 감지 불가→4), `name_search.rs`·`search.test.ts`(I-20). `npm.cmd run test` 251/251, `cargo test` 22 |

## 검증
- typecheck 오류 0, `npm.cmd run test` 251 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과. 커밋 직전 1회 실행했고, leader가 출력 파일 `%TEMP%\v07-C-13-*.txt`로 넘겼다. checker C-13 검토 [PASS]. `Cargo.lock`·`package-lock.json` 변화 없음.
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]` 순서로 했다.
  - debug exe, 임시 APPDATA·WebView 폴더, 창 1440×852, 100%, One Dark, CDP 합성 입력.
  - checker C-14 [MEASURED]: 기준 1·2·3·4·5·5A PASS, 불일치 0.
- release 빌드(`npm.cmd run tauri build`, 66.4초)는 커밋 `455091b`와 같은 코드로 했다. 커밋과 다른 것은 문서뿐이다. 빌드 전 workbench-tauri 프로세스는 없었고, 잠금도 없었다.
- 결과 파일: `specs/v0.7/verify/ORDER-07/v3.json`, PNG 15.

## 지운 것·더한 것·하지 않은 것
- 더한 것:
  - `guessIndentUnit`과 그 단위로 안내선 긋기.
  - `wholeWordTest`·`keepWholeWord`(편집 탭 찾기 줄만).
  - `categoryKeys`·`removeSettings`·`resetSettings`.
- 지운 것:
  - Window 메뉴.
  - Search 탭 `is_word`의 `_`.
  - ORDER-06의 `categoryDefaults`(Load Defaults가 기본값을 써 넣던 경로).
- 바꾼 것: `.tooltip`의 z-index 3 → 1000.
- 하지 않은 것:
  - 명령 `zed::Minimize`·`zed::Zoom` 등록은 남겼다(사용자 keymap에서 쓸 수 있다).
  - 찾기 줄 밖 단어 범위(`Ctrl+D`, 커서 단어 강조 등)는 CM 규칙 그대로다.
  - 메뉴(z 3)도 같은 이유로 찾기 줄에 가릴 수 있지만 카드 밖이라 고치지 않았다.
- 남은 위험:
  - 들여쓰기 단위는 문서가 바뀔 때마다 다시 감지한다(최대 10000줄 스캔). 빈 파일에 처음 들여쓰기를 치는 동안 단위가 바뀔 수 있다.
  - VS Code의 "정렬처럼 보이는 줄" 거름은 넣지 않았다(`shortcut:` 주석).
  - Load Defaults는 지운 키 바로 위 줄의 주석을 남긴다.

## tauri가 고른 것
- I-15 감지 규칙과 VS Code 대조 근거: 이 PC의 VS Code 1.117.0 번들(`%LOCALAPPDATA%\Programs\Microsoft VS Code\a44adf7f53\resources\app\out\vs\workbench\workbench.desktop.main.js`)의 `guessIndentation`을 읽었다. 공개 소스는 `microsoft/vscode` `src/vs/editor/common/model/indentationGuesser.ts`다. 규칙만 따랐고 코드는 베끼지 않았다.
  - 앞 10000줄을 본다. 빈 줄은 건너뛴다.
  - 각 줄의 앞 공백을 앞 줄 들여쓰기와 비교한다. 한쪽이 다른 쪽의 접두사일 때만 비교하고, 차이가 1~8이면 센다.
  - 후보 2·4·6·8·3·5·7 중 가장 많이 센 것이 단위다. 동수면 앞 후보를 고른다.
  - 4가 뽑혀도 2를 센 횟수가 4의 2/3 이상이면 2로 한다.
  - 탭으로 시작하는 줄이 공백 2칸 이상 줄보다 많거나 같으면 탭 파일로 보고 4로 한다. 센 것이 없을 때도 4다.
  - VS Code와 다른 점: 탭과 공백이 섞인 차이는 세지 않는다.
- 다시 감지하는 때: 문서 상태를 만들 때와 문서가 바뀔 때마다. 가장 작은 구현이다.
- I-18 고친 방법:
  - 원인: CodeMirror 찾기 줄(`.cm-panels`)은 기본 테마가 `z-index: 300`이다. 툴팁(`position: fixed`)은 `z-index: 3`이고 둘이 같은 쌓임 맥락에 있어서 툴팁이 찾기 줄 아래로 들어갔다.
  - `src/app.css`에서 `.tooltip`의 z-index를 1000으로 바꿨다. 툴팁은 `pointer-events: none`이라 다른 요소의 클릭을 막지 않는다.
- I-20 편집 탭 찾기의 원래 동작: CM `SearchQuery` whole-word는 `charCategorizer`로 판정했다.
  - `_`는 항상 단어 문자였고 `-`는 구분자였다. 그래서 `read to-read my_read reader`에서 `wd` + `read`는 둘(`read`, `to-read`)과 일치했다.
  - CM의 단어 문자는 더하기만 되고 빼기는 안 된다. 그래서 찾기 줄 `wd` 토글을 쿼리의 `test` 훅(글자·숫자 경계)으로 바꿨다.
  - CM이 찾기 줄을 다시 열 때 `test`를 잃는 곳(`defaultQuery`)은 `keepWholeWord`로 막았다.
- I-17 고침(3.5A) 키 지우기 방식: 멤버가 자기 줄들만 차지하면 줄째 지우고, 한 줄에 여러 멤버가 있으면 그 멤버와 쉼표만 지운다.
  - 마지막 멤버를 지우면 앞 멤버의 쉼표도 지운다.
  - 지운 키 위 줄 주석은 남긴다(구역 제목일 수 있다).
  - BOM·CRLF는 그대로다. 깨진 파일은 거부한다.
- 설치 파일: `D:\projects\workbench-tauri\src-tauri\target\release\bundle\nsis\workbench-tauri_0.7.0_x64-setup.exe`, 6,024,784 바이트(5.75 MiB), 2026-11-10 20:03:16.

## 바꾼 파일
- 커밋 `455091b`:
  - `docs/BUILD.md`
  - `specs/v0.7/PLAN.md`, `specs/v0.7/PROGRESS.md`, `specs/v0.7/verify/ORDER-07/*`
  - `src-tauri/src/name_search.rs`, `src/app.css`
  - `src/editor/indent-guides.ts`·`.test.ts`, `src/editor/search.ts`·`.test.ts`
  - `src/settings/Settings.tsx`·`load.ts`·`model.ts`·`model.test.ts`
  - `src/shell/app-menus.ts`·`.test.ts`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 메뉴 드롭다운도 열린 찾기 줄에 가릴 수 있다(z 3 < 300, 이번 측정 밖). 고칠지 → core-leader(카드 밖).
- ORDER-05 미정(checker 허용 목록, `running-pid11268`)은 그대로다 → 사용자.

## BLOCKED
없음
