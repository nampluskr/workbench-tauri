[DONE] ORDER-01 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 시작 | `specs/v0.7/`에 PROGRESS, I-n 대응, `reports/`·`verify/`. `AGENTS.md` 버전 문장 v0.7. herdr 에이전트 넷 v0.6 구성(V0) | 충족 | `specs/v0.7/PROGRESS.md`, `specs/v0.7/PLAN.md`(I-n 대응 표), `specs/v0.7/HERDR-SETUP.md`, `reports/`·`verify/`. `AGENTS.md` 17·28·29·34·42·130·134·221줄(레포 규칙 1~14줄은 그대로). `herdr agent list`: `tauri-leader` claude `wX:p1`, `tauri-writer` claude `wX:p2`(`--model claude-opus-5-5 --effort medium`), `tauri-coder` claude `wX:p3`(`--model sonnet --effort high`), `tauri-checker` agy `wX:p4`(`--model gemini-3.8-flash-high --settings …checker-settings.json`). 탭 control·docs·impl·check |
| 2 I-4 | 분류 UI·Editor·Preview 순서, 항목 순서, 분류를 누르면 그 자리, 검색 `preview` → 미리보기 글꼴 크기만, 값은 그 영역에만(V3) | 충족 | `verify/ORDER-01/v3.json` i4_settings: nav `UI, Editor, Preview`, 행 UI Theme·Icon Theme·Font Size / Editor Font Size / Preview Font Size. 분류를 누르면 `aria-current`가 그 분류로 가고 heading 위치(103/390/515)로 간다. 내용이 한 화면에 다 들어가 scrollTop은 0. 검색 `preview` → `Preview / Font Size` 한 줄(`i4-search-preview.png`), `editor`·`ui`도 그 분류만. `i4-settings.png` |
| 3 I-2 | preview 20 → 미리보기 본문만 / UI 18 → 메뉴·Sidebar·탭 이름만 / 미리보기 `Ctrl+=` 뒤 다시 열면 20 / 연계 맞음(V3) | 충족 | i2_preview20: 미리보기 p 20, 편집 15, Sidebar·탭 14, 상태 바 12(`i2-preview20.png`). i2_ui18: 메뉴 File…Help·Sidebar·탭·트리 15.75(=14×18/16), 상태 바 13.5, 미리보기 20·편집 15 그대로(`i2-ui18.png`). run3_restart: 키로 21까지 키운 뒤 다시 열자 20. 연계: `v3-sync.json` 글꼴 변경 전·미리보기 +2·편집 −1·편집 +2 뒤 클릭한 줄과 미리보기 활성 블록이 모두 같음(Section 3~11) |
| 4 I-2 더함 | preview 20 → h1 35(V3 계산값) | 충족 | i2_preview20: h1 35px, h2 28px, 인라인 코드 17.5px |
| 5 I-1 | 미리보기 `Ctrl+=` 두 번 → 미리보기만 두 단계, 편집 `Ctrl+-` → 편집만 한 단계, 연계 맞음(V3 계산값·캡처) | 충족 | i1_keys: 포커스 `MarkdownPreview`에서 20→22, 편집 15 그대로(`i1-preview-plus2.png`). 편집(`cm-content`)에서 15→14, 미리보기 22 그대로(`i1-editor-minus1.png`). 연계는 `v3-sync.json` |
| 6 I-1 더함 | Sidebar 포커스 `Ctrl+=` → 그대로, 미리보기 `Ctrl+0` → Settings 값, 미리보기 둘 다 커짐(V3) | 충족 | 포커스 `Folders`(Sidebar)에서 `Ctrl+=`·`Ctrl+-`·`Ctrl+=` → 편집·미리보기·UI 그대로, 트리(`ProjectPanel`)에서 `Ctrl+=` → 그대로. 미리보기 둘에서 한쪽 `Ctrl+=` → 둘 다 22→23(`i1-two-previews-plus1.png`), `Ctrl+0` → 둘 다 20 |
| 7 기본값 | 설정 파일 없음과 v0.6 설정 파일(키 넷)에서 화면이 v0.6과 같다(V3) | 충족 | run1_noSettings·run2_v06Settings 같음: 미리보기 p 16·h1 28·h2 22.4·인라인 코드 14, 편집 15, Sidebar·탭·트리 14, 상태 바 12, dpr 1, 창 1440(`run1-no-settings.png`, `run2-v06-settings.png`) |
| 9 버전 | About에 "workbench-tauri 0.7.0", 설정 파일에 0.6.0이 남지 않음(V1·V3) | 충족 | run3_restart about `workbench-tauri 0.7.0`(`run3-about.png`). `src-tauri/tauri.conf.json` `"version": "0.7.0"`. `git grep -n "0\.6\.0"`: 남은 것은 `Cargo.lock`의 남의 crate(ico·ndk-sys·urlpattern), `package-lock.json`의 node 엔진 범위, `docs/BUILD.md` 85·86행(v0.6 빌드 결과 기록)과 지난 버전 문서뿐. 이 앱 Cargo 패키지 버전은 원래 0.0.0이라 바꿀 것 없음 |
| 8 테스트 | 새 설정 읽기·검증, 포커스별 대상 고르기에 테스트, 기존 테스트 통과(V1) | 충족 | `src/settings/model.test.ts`(`preview_font_size` 기본·v0.6 파일·잘못된 값·저장, 분류 검색), `src/editor/font-size.test.ts`(`fontTarget`: 편집·검색 바·미리보기·Sidebar·Pane·ProjectPanel·KeymapEditor·빈 스택). `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 236/236 통과 |

## 검증
- typecheck 오류 0, `npm.cmd run test` 236 통과, `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` 경고 0, `cargo test` 22 통과(커밋 직전 1회). checker C-01 검토 [PASS].
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`. debug exe(`npm.cmd run tauri build -- --debug --no-bundle`), 임시 APPDATA·임시 WebView 데이터 폴더, 창 1440×852, 100%, One Dark. 앱은 판정에 다시 열기가 있어 세 번 열었다(설정 없음 / v0.6 파일 / 다시 열기). 연계만 따로 한 번 더 열었다(아래). checker C-02 [MEASURED]: 2~7·9 모두 PASS, 불일치 없음.
- 캡처·결과: `specs/v0.7/verify/ORDER-01/` `v3.json`, `v3-sync.json`, `i1-editor-minus1.png`, `i1-preview-plus2.png`, `i1-two-previews-plus1.png`, `i2-preview20.png`, `i2-ui18.png`, `i4-search-preview.png`, `i4-settings.png`, `run1-no-settings.png`, `run2-v06-settings.png`, `run3-about.png`.
- 입력은 CDP 합성 입력이다. `tools/win-input.ps1` SendInput이 "foreground window is 0x0"(화면 잠김으로 보임)로 막혔다. 앱 키맵은 페이지 keydown에서 처리하므로 결과는 같다고 봤다. 실제 키보드로 WebView 확대가 막히는지(v0.6 U-17에서 확인된 것)는 이번에 다시 재지 않았다.
- `v3.json`의 i1 `syncAfterClickSection8: ["Section 6"]`은 "## Section 8" 줄이 창 아래 밖이라 클릭이 닿지 않은 측정 오류다. 글꼴을 바꾸지 않아도 같았다. 줄을 화면 안으로 스크롤해 다시 잰 `v3-sync.json`에서는 모든 경우가 맞았다.

## 지운 것·더한 것·하지 않은 것
- 더한 것: 설정 `preview_font_size`(기본 16), `CATEGORIES`, `prem()`과 `--typography-preview-font-size`, 미리보기 임시 크기, `fontTarget`. 지운 것: Settings의 Appearance 제목과 절 셋(Theme·Buffer Font·UI Font), `adjustEditorFontSize`(→ `adjustFontSize(target, direction)`). 의존성·`spec/`·Rust 변경 없음.
- 하지 않은 것: 미리보기용 새 액션 이름(같은 세 Zed 액션 안에서 포커스로 대상을 고른다), Editor·Preview Theme(ORDER-02), `docs/BUILD.md` 85·86행 0.7.0 갱신(0.7.0 빌드를 돌리기 전에 고치면 크기·버전 기록이 거짓이 된다).
- 남은 위험: `markdown_preview.*` 길이 32개를 모두 미리보기 크기에 맞췄다(여백·간격 포함, 16이면 v0.6과 같음). 미리보기 크기를 바꾼 직후에는 활성 블록을 다시 스크롤하지 않고, 다음 커서 이동 때 맞춘다(v0.6과 같음).

## tauri가 고른 것
- Settings 설명 문구(VS Code 설정 설명 방식. 앞의 둘은 `workbench.colorTheme`·`workbench.iconTheme`, Editor는 `editor.fontSize`, Preview는 `markdown.preview.fontSize` 설명과 같은 문장이다. 이번에 VS Code 문서를 다시 열어 대조하지는 않았다)
  - UI Theme: "Specifies the color theme used in the workbench."
  - UI Icon Theme: "Specifies the file icon theme used in the workbench."
  - UI Font Size: "Controls the font size in pixels used in the UI."
  - Editor Font Size: "Controls the font size in pixels."
  - Preview Font Size: "Controls the font size in pixels used in the Markdown preview."
- 항목 이름: Theme / Icon Theme / Font Size(분류 이름이 영역을 말하므로 "Theme Name"·"Icon Theme Name"에서 줄였다). 분류 안에 절은 두지 않았다.
- 설정 키 이름: `preview_font_size`(기존 `ui_font_size`·`buffer_font_size`와 같은 형식).
- v0.7 문서 구성: core처럼 INTENT·DECISIONS·SPEC은 두지 않는다. `specs/v0.7/PLAN.md`(Phase ↔ ORDER ↔ core I-n 대응, 카드 표, 요구 번호는 I-n 그대로), `HERDR-SETUP.md`(v0.6 구성 그대로, workspace `wX`, 카드 파일 `v07-`. 루트 레포 규칙 "버전마다 따로 둔다"에 맞춰 새로 썼다), `PROGRESS.md`, `reports/`, `verify/`.

## 바꾼 파일
- 커밋 `bf8cfd7`: `AGENTS.md`, `specs/v0.7/{PLAN,HERDR-SETUP,PROGRESS}.md`, `specs/v0.7/reports/.gitkeep`, `specs/v0.7/verify/.gitkeep`, `specs/v0.7/verify/ORDER-01/*`, `src-tauri/tauri.conf.json`, `src/App.tsx`, `src/editor/font-size.ts`·`font-size.test.ts`, `src/settings/Settings.tsx`·`load.ts`·`model.ts`·`model.test.ts`, `src/spec/metrics.ts`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 루트 `AGENTS.md` 레포 규칙 10줄("v0.6 구성 … `tauri-coder` Codex gpt-6.1-sol medium")과 12줄("core v0.6 ITEMS(I-1~I-20)")은 v0.7과 맞지 않는다. 카드가 레포 규칙 절을 고치지 말라고 해서 그대로 두었다. 고칠지는 core-leader가 정한다.
- checker의 읽기 전용 git·npm·cargo 명령 승인: core-leader가 허락했지만, tauri-leader가 checker 승인 창에 대신 답하는 입력을 auto mode가 막았다. 우회하지 않고 HERDR-SETUP 5.5대로 leader가 실행해 출력 파일로 넘겼다. 허용 목록 정리는 ORDER-05.
- `docs/BUILD.md` 0.7.0 빌드 기록 갱신: 0.7.0 release 빌드를 언제 돌릴지 → core-leader.

## BLOCKED
- 없음
