[DONE] ORDER-13 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| U-7 | `Ctrl+F`(또는 돋보기) → 경로 줄 아래 편집 영역 너비 찾기 줄, 문서 첫 줄이 밀린다(V3) | 충족 | `specs/v0.6/verify/ORDER-13/v3.json` ctrlF: 줄 t110 = 경로 줄 아래 끝 110, l440–r1440 = 편집 영역 l440–r1440, 첫 줄 110 → 155(닫으면 110, closeBtn). `code-find-bar.png` |
| U-7 | 줄 요소 순서가 카드 구성과 같다(V3) | 충족 | order: Find 입력란 → Match Case·Match Whole Word·Use Regular Expression(입력란 안 오른쪽) → Toggle Replace → Select All Matches → Find in Selection → 구분선 → Previous → Next → `1/4` → Close. 참고 그림 `find-ref-2.png`과 같은 순서 |
| U-7 | 버튼마다 동작: 토글 셋, 바꾸기 줄 열기·닫기, 일치 모두 선택, 이전·다음, 닫기(V3) | 충족 | toggles: 각 aria-pressed true·원복; replaceRow: 아래 줄 열림(줄 b154 → b194)·닫힘, `code-replace-row.png`; selectAll: 일치 4개 선택·줄 닫힘; prevNext 1/4 → 2/4 → 1/4; closeBtn 닫힘 |
| U-7 | 선택 안에서 찾기: 문서 일부를 선택하고 켜면 그 범위 안 일치만 센다(V1, V3) | 충족 | V1 `src/editor/search.test.ts`(범위 안 개수·이동·모두 선택·바꾸기). V3 findInSelection: 1·2줄 선택 → 켬 → "foo" 3개(`1/3`), 끄면 4개(`1/4`) |
| U-7 | 돋보기: 열기 전 꺼짐, 열린 동안 켜짐, 닫으면 꺼짐(V3 계산된 색 값) | 충족 | before: aria-pressed false, rgb(88,88,90); 열림: true, rgb(92,120,226) = `--text-accent`; ×·다시 누르기·Esc 뒤 false, rgb(88,88,90)(magToggle·closeBtn). Lock Preview와 같은 `IconButton toggled` 방식 |
| U-7 | ORDER-09-R1 단축키 표 동작 그대로(V1, V3 일부) | 충족 | V1 search.test.ts·keyboard.test.ts. V3 keysStill: Ctrl+H 바꾸기 줄, Enter 2/4, F3 3/4, Alt+C 토글, Esc 닫힘 |
| U-7 | 마크다운 편집 탭과 코드 파일 탭 둘 다 | 충족 | markdown(notes.md): 같은 자리·너비·순서, 첫 줄 110 → 155, `4/20`. `md-find-bar.png`. 코드 탭은 main.ts(위 줄들) |
| U-7 | 편집↔미리보기 위치 연계가 줄이 열려도 깨지지 않는다(한 번 본다) | 충족 | previewSync: 찾기 줄을 연 채 편집 "## Section 5" 클릭 → 미리보기 active-block "Section 5". `md-find-bar-preview-sync.png` |
| U-8 | Search 탭 입력란 안 `Aa`·`wd`·`.*`, 오른쪽 결과 수(V3 캡처) | 충족 | `search-tab-options.png`, searchTab.read count "3" |
| U-8 | `read` → 셋, `Aa` → readme-old.md·my_read.txt, `wd` → 단어 경계로 걸러짐, `.*` `^read` → read로 시작, 잘못된 정규식 → 오류 없이 0(V1, V3 일부) | 충족 | V1 Rust `options_filter_names_by_case_and_word_boundary`, JS `src/search/name-regexp.test.ts`. V3: read 3, Aa 2(readme-old.md·my_read.txt), wd 0(아래 참고), `^read` 2(Readme.md·readme-old.md), `[` 0·오류 문구 없음, 입력란에서 Alt+C 토글 → 2 |

## 카드가 보고하라고 한 것
- 아이콘(이미 있는 아이콘에서 가장 가까운 것):

| 버튼 | 아이콘 | 출처 |
|---|---|---|
| Aa / wd / .* | Zed `case_sensitive` / `whole_word` / `regex` | `src/assets/zed-icons/`(core D-9 고정 복사본, 참고 그림과 같은 Zed 모양) |
| 바꾸기 줄 켜기 | Zed `replace` | 같음 |
| 일치 모두 선택 | Zed `select_all` | 같음 |
| 선택 안에서 찾기 | codicon `list-selection` | @vscode/codicons 0.0.46-24 SVG를 수정 없이 `src/assets/codicons/list-selection.svg`에 복사, `NOTICE.txt` 한 줄(ORDER-09·10 방식, Zed에 selection 계열 아이콘 없음) |
| 이전 / 다음 / 닫기 | Zed `chevron_left` / `chevron_right` / `close` | 같음 |
| 하나 바꾸기 / 모두 바꾸기 | Zed `replace_next` / `replace_all` | 같음 |

- 선택 안에서 찾기: 지금 없던 기능이라 `@codemirror/search`(`SearchQuery.getCursor(state, from, to)`) 범위 안에서 만들었다. BLOCKED 없음.
- U-8 정규식: Rust `regex` 크레이트는 ORDER-02에서 지웠고 새 의존성 금지라, 대소문자·단어 경계는 Rust(`name_search.rs`), 정규식은 프런트엔드 JS `RegExp`(`src/search/name-regexp.ts`)에서 거른다. 정규식 모드에서 Rust는 범위 안 이름을 흘려 보내고 페이지가 이름에 정규식을 건다. 범위 밖·링크 거부와 상한은 그대로.

## 검증
- coder K-17(Claude Code Sonnet 5.5 high): typecheck, npm test 227, `cargo test … name_search` 3, clippy 경고 0.
- checker C-19(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 227 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과. 코드 검토 지적 없음, V3 U-7 14항목·U-8 7항목 PASS. 도중에 checker가 허용 목록 밖 명령(`Get-ChildItem`)으로 허가 창에서 멈춰, leader가 거절하고 파일 목록을 건넸다.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe(`src-tauri/target/debug`), 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 1440×852. SendInput, CDP. 시스템 클립보드는 건드리지 않았다. 사용자 테스트 앱(PID 47400)은 건드리지 않았다. 스크립트는 자기가 띄운 PID만 끝냈고, 측정 뒤 확인했을 때 47400은 실행 중이 아니었다(측정 전 상태는 확인하지 않음).
- 결과 파일: `specs/v0.6/verify/ORDER-13/` `v3.json`, `code-find-bar.png`, `code-replace-row.png`, `md-find-bar.png`, `md-find-bar-preview-sync.png`, `search-tab-options.png`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: 오른쪽 위 겹침 창 배치(`.cm-editor > .cm-panels-top`의 absolute·top·right·left·max-width)와 옛 `.document-search*` 규칙. 겹침 창에만 쓰던 metrics 값은 없었다.
- 더한 것: 찾기 줄 재구성, 선택 안에서 찾기, 돋보기 켜짐 표시(`watchSearchPanel`), 아이콘 레지스트리 정리(`iconMarkup`·`iconElement`)와 IconName 8개, codicon `list-selection.svg`, spec 값 노출(E-061 `search_bar.gap`, E-062 입력란, E-063 `font_size`·`line_height_multiplier`, E-065, E-066 `modes_*`·`separator_*`, E-067 `search_results_count.*`, `search_input.max_width`), Search 탭 옵션·결과 수, `name-regexp.ts`, Rust 이름 필터 옵션. 새 의존성 없음, spec/ 수정 없음.
- 바꾼 것: 일치 수 문구 `1 of 2` → `1/2`(참고 그림).
- 하지 않은 것: 좁은 폭 줄바꿈(`search_bar.narrow_threshold`), 띄엄띄엄 일치(I-5), Search 탭 이전·다음·바꾸기 버튼(카드대로).
- 남은 위험:
  - 선택 안에서 찾기를 켜도 범위 밖 일치의 강조는 문서 전체에 남는다(개수·이동·바꾸기만 범위 안).
  - 범위를 고른 뒤 찾기 입력란에 먼저 글자를 치면 입력 중 찾기가 선택을 접어, 그다음 토글이 켜지지 않는다(선택 → 토글 → 입력 순서).
  - U-8 `wd`: `my_read`의 `_`를 단어 문자로 봐서 `read`가 단어로 걸리지 않는다(VS Code와 같은 규칙). 사용자가 `my_read.txt`가 걸리기를 기대했다면 규칙을 정해야 한다.
  - U-8 정규식 모드는 Rust가 이름을 최대 100,000개까지 흘려 보내고 화면은 일치 5,000개에서 멈춘다. 정규식+`wd`는 ASCII `\w` 경계라 한글 사이도 경계로 본다.

## 바꾼 파일
- 코드 커밋 `64156a7`: `src/editor/search.ts`·`search.test.ts`, `src/app.css`, `src/shell/Pane.tsx`, `src/shell/Icon.tsx`, `src/shell/icon-svg.ts`, `src/spec/metrics.ts`, `src/assets/codicons/list-selection.svg`(새)·`NOTICE.txt`, `src/search/Search.tsx`, `src/search/search.css`, `src/search/name-regexp.ts`(새)·`name-regexp.test.ts`(새), `src-tauri/src/name_search.rs`
- 기록 커밋 `90d6968`: `specs/v0.6/PROGRESS.md`("사용자 요청 작업" 절 ORDER-13 소절), `specs/v0.6/verify/ORDER-13/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- U-8 `wd`에서 `_`를 단어 문자로 볼지(지금은 봄, VS Code와 같음) → 사용자
- 선택 안에서 찾기의 범위 밖 일치 강조를 숨길지 → 사용자

## BLOCKED
- 없음
