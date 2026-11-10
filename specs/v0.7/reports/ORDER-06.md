[DONE] ORDER-06 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-16 | Editor를 누르면 Editor 행만, Preview를 누르면 Preview 행만(V3 캡처) | 충족 | `specs/v0.7/verify/ORDER-06/v3.json` `c1_pages`: 처음 열면 제목 "UI" 하나, 행 3. Editor를 누르면 제목 "Editor", 행 7. Preview를 누르면 제목 "Preview", 행 6. 셋 다 `scrollTop` 0. 캡처 `c1-first-open-ui.png`, `c1-editor-page.png`, `c1-preview-page.png` |
| 2 I-16 | 검색 `preview` → 분류와 관계없이 맞는 행(V3) | 충족 | `c2_search.searched`: 제목 Preview, 행 6. 다른 분류의 행 이름·설명에는 "preview"가 없다. 분류 셋에 걸친 검색은 `c2_search.font`: 제목 UI·Editor·Preview, 행 4(UI Font Size, Editor Font Size·Line Height, Preview Font Size). 검색어를 지우면 고른 분류(Preview)로 돌아간다(`cleared`). 캡처 `c2-search-preview.png`, `c2-search-font.png` |
| 3 I-17 | Editor Font Size·Line Height와 Preview Font Size를 바꾼 뒤 Editor Load Defaults → 확인 → Editor만 기본값, 취소는 변화 없음, 다시 열어도 같음(V3) | 충족 | 시작 값: `buffer_font_size` 20, `editor_line_height` 2.2, `preview_font_size` 22. 파일에 주석과 알 수 없는 키 `x_unknown`도 넣었다. `c3_load_defaults`: Escape·Cancel 뒤 파일이 그대로다(`fileSame` true, 20·2.2). 확인 뒤 15·1.6이 되고 Preview 22, 주석, `x_unknown`은 그대로다. `c3_reopen`: 앱을 다시 띄워도 15·1.6·22. 캡처 `c3-confirm-dialog.png`, `c3-editor-after-load-defaults.png`, `c3-preview-after-load-defaults.png`, `c3-reopen-editor.png` |
| 4 테스트 | 분류별 기본값 되돌리기(다른 분류·다른 키 보존) 테스트, 기존 테스트 통과(V1) | 충족 | `src/settings/model.test.ts` "I-17: Load Defaults for a category writes only that category's keys": Editor만 기본값이 되고 UI·Preview 값, 알 수 없는 키, 주석은 그대로다. `npm.cmd run test` 247/247, `npm.cmd run typecheck` 오류 0 |

## 검증
- typecheck 오류 0, `npm.cmd run test` 247 통과. Rust 변경이 없어 cargo는 실행하지 않았다. 출력 파일은 leader가 만들었다(`%TEMP%\v07-C-11-*.txt`). checker C-11 검토 [PASS].
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]` 순서로 했다.
  - debug exe, 임시 APPDATA와 WebView 데이터 폴더를 썼다.
  - Settings 창은 900×750(앱이 여는 크기), 100%, One Dark. 입력은 CDP 합성 입력이다.
  - checker C-12 [MEASURED]: 기준 1·2·3 PASS, 불일치 0.
- 결과 파일: `specs/v0.7/verify/ORDER-06/v3.json`, PNG 9개(c1-first-open-ui, c1-editor-page, c1-preview-page, c2-search-preview, c2-search-font, c3-confirm-dialog, c3-editor-after-load-defaults, c3-preview-after-load-defaults, c3-reopen-editor).
- 사용자 앱과 Zed 창은 건드리지 않았다. 빌드는 debug(`--no-bundle`)만 했다.

## 지운 것·더한 것·하지 않은 것
- 더한 것:
  - `categoryDefaults`(`src/settings/model.ts`): 분류의 키만 기본값으로 모은다. `saveSettings`로 한 번 쓴다.
  - Load Defaults 버튼.
  - `<dialog>` 확인 창.
- 지운 것: 분류를 누르면 스크롤하던 코드.
- 바꾼 것: 왼쪽 분류 셋은 검색 중에도 항상 보인다. 전에는 맞는 행이 있는 분류만 보였다.
- 새 의존성 없음. 행 이름·순서·설명·값 범위는 바꾸지 않았다.
- 남은 위험:
  - 확인하면 그 분류의 키가 모두 기본값으로 파일에 쓰인다. V3에서 파일에 없던 Editor 키 다섯이 새로 생겼다. 값은 기본값과 같아서 화면은 같다. 키를 지우는 방식이 아니다.
  - 메모리에만 있는 단축키 값(`Ctrl+=` 크기, `Ctrl+Alt+L`, `Alt+Z`)은 지금 규칙을 그대로 따른다. 설정 값이 실제로 바뀔 때만 지워진다. 그래서 이미 기본값이던 키를 되돌리면 임시값이 남는다.

## tauri가 고른 것
- 검색 결과에서 분류를 보이는 방법: 맞는 행이 있는 분류마다 분류 제목(h1) 아래에 묶는다(ORDER-01 방식 그대로). 검색 중 왼쪽 분류를 누르면 검색어를 지우고 그 분류 페이지로 간다.
- Load Defaults 위치: 분류 페이지 제목과 같은 줄, 오른쪽 끝. 검색 결과 화면에는 두지 않는다. 어느 분류를 되돌리는지 모호해지기 때문이다.
- 확인 창: WebView 안의 `<dialog>`를 `showModal()`로 연다. `window.confirm`과 TaskDialog는 쓰지 않는다.
  - 문구는 VS Code 확인 창 형식(질문 한 줄, 설명 한 줄, 주 버튼과 Cancel)으로 썼다.
    - 제목: "Restore all {UI|Editor|Preview} settings to their defaults?"
    - 설명: "This cannot be undone."
    - 버튼: [Load Defaults] [Cancel]
  - 열리면 Cancel에 포커스가 간다. 되돌릴 수 없는 동작이라 안전한 쪽을 골랐다.
  - Escape는 취소다. 닫히면 Load Defaults 버튼으로 포커스가 돌아간다.
  - VS Code 앱 화면과는 대조하지 않았다.
- UI의 Load Defaults는 UI 분류의 키(`theme`, `icon_theme`, `ui_font_size`)만 되돌린다. `editor_theme`와 `preview_theme`는 각각 Editor, Preview 분류에 속한다.

## 바꾼 파일
- 커밋 `7125505`:
  - `src/settings/Settings.tsx`, `model.ts`, `model.test.ts`, `settings.css`
  - `specs/v0.7/PLAN.md`(Phase 6 행, 카드 표), `specs/v0.7/PROGRESS.md`
  - `specs/v0.7/verify/ORDER-06/*`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 확인할 때 분류 키를 기본값으로 쓸지, 파일에서 지울지 → core-leader 또는 사용자(지금은 쓴다. 화면은 같다).
- 이미 기본값인 키를 되돌릴 때 메모리 단축키 값도 지울지 → core-leader 또는 사용자(지금은 기존 규칙 그대로).
- ORDER-05 미정(checker 허용 목록, `running-pid11268`)은 그대로 남아 있다. 이번에도 checker가 승인 창(`Get-ChildItem`)에서 한 번 멈췄다. leader가 취소했고, checker는 셸 없이 진행했다.

## BLOCKED
없음
