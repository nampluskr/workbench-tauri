[DONE] ORDER-04 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-8 | tauri의 모든 스크롤바(그 밖의 탭 화면 포함)에 화살표가 없다 | 충족 | `src/app.css:72` `::-webkit-scrollbar-button { display: none; }`가 모든 스크롤바에 걸린다. 픽셀: 편집 영역 트랙 위끝은 여백 4px 뒤 바로 thumb, 트리 트랙 아래끝까지 배경(`specs/v0.6/verify/ORDER-04/pixels.json`) |
| I-8 | 두께와 색이 서로 같다 | 충족 | 트랙 15px(`.cm-scroller`·`.tree-scroll`·`.sidebar-list`·`.project-search-results` 모두 offsetWidth−clientWidth 15, `tauri-dark.json`·`tauri-light.json`). thumb 6px·오른쪽 여백 4px가 편집 영역·트리·Sidebar·Search 탭에서 같다. 색은 같은 배경끼리 같다(Dark 편집·Search `#595c63`, 트리·Sidebar `#5e626b`; Light `#c0c0c2`, `#b6b6b9`). 스타일은 `src/app.css:68-95` 한 곳 |
| I-8 | gpui와 두께 1px 안 | 충족 | One Dark·One Light 모두 편집 영역·트리 thumb 6px(gpui 6), hover 8px(gpui 8), 오른쪽 여백 4px(gpui 4) — 차이 0px. 트랙은 편집 영역 15(gpui 15), 패널 15(gpui 16, 1px) |
| I-8 | gpui와 색이 같다 | 충족 | 불투명 키는 같다: Light 트리 `#b6b6b9`=`#b6b6b9`, hover Light `#dfdfe0`=`#dfdfe0`. 반투명 기본 thumb(`#c8ccd44c`·`#383a414c`)는 채널당 1 이내(Dark 편집 `#595c63`/gpui `#585c63`, 트리 `#5e626b`/`#5d616b`; Light 편집 `#c0c0c2`/`#c0c1c3`; Dark hover `#373c46`/`#363c46`) — 알파 합성 반올림, C-08 판정 같음 |
| I-8 | 가져온 두께 값과 색 출처(테마 키)를 보고에 적는다 | 충족 | 아래 "가져온 값" |

## 가져온 값 (gpui, 읽기만)
| 항목 | 값 | 출처 | tauri |
|---|---|---|---|
| 패널 트랙 폭 | 16 | `D:\projects\workbench-gpui\vendor\gpui-base\src\scrollbar.rs:22` | 15로 통일(spec `scrollbar.width.editor`), 1px 차이 |
| 편집기 트랙 폭 | 15 | `workbench-gpui\src\ui\pane.rs:214-218`, `src\ui\metrics.rs:246-247` | 15 |
| thumb 두께 | 6 | `scrollbar.rs:25` | spec `scrollbar.width.ui` 6 |
| hover·drag thumb 두께 | 8 | `scrollbar.rs:29` | `src/spec/metrics.ts` `scrollbar.thumb.active_width` 8(gpui 출처 주석) |
| 가장자리 여백 | 4 | `scrollbar.rs:27,31` | spec `scrollbar.padding` 4 |
| thumb 최소 길이 | 48 | `scrollbar.rs:23` | `scrollbar.thumb.min_length` 48(gpui 출처) |
| thumb 모서리 | radius 6을 폭 절반으로 clamp | gpui-component 0.8.1 `theme\mod.rs:422,433,443,774`, `scrollbar.rs:40-43` | `scrollbar.thumb.radius` 6 |
| 화살표 | 없음 | `scrollbar.rs:1624-1658` | `::-webkit-scrollbar-button` 숨김 |
| 기본 thumb 색 | 테마 키 `scrollbar.thumb.background` | `workbench-gpui\src\ui\theme.rs:102` | `--scrollbar-thumb-background` |
| hover·drag thumb 색 | 테마 키 `scrollbar.thumb.hover_background` | `theme.rs:102`, gpui-component `theme\mod.rs:432,440-443` | `--scrollbar-thumb-hover-background` |
| 트랙 색 | 테마 키 `scrollbar.track.background`(One 테마는 투명) | `theme.rs:101` | `--scrollbar-track-background` |
| 키가 없을 때 | 같은 appearance One 테마 값 | `theme.rs:59-80,86-87` | 기존 `resolveTokens`(JSON → One) |

## 검증
- coder K-05: typecheck, 관련 node 테스트 28/28.
- checker C-08(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 210 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드 검토(한 곳, 하드코딩 없음, I-9·I-13 동작 그대로, gpui 출처 세 곳 실제 파일과 일치) PASS, 지적 없음.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): 주 모니터 1920×1080 100%, 두 앱 모두 창 1440×852(같은 위치), 같은 임시 폴더(폴더 30개 + 파일 120개·긴 파일 `a-long.txt`), One Dark·One Light. gpui release exe, tauri debug exe. SendInput으로 파일을 열고 휠·hover로 스크롤바를 띄운 뒤, 화면 캡처의 픽셀 줄을 읽어 쟀다. C-08 판정 PASS.
- 캡처: `specs/v0.6/verify/ORDER-04/` `gpui-{dark,light}-{editor,editor-hover,tree,sidebar}.png`, `gpui-dark-tree-hover.png`, `gpui-dark-0.png`, `tauri-{dark,light}-{editor,editor-hover,tree,sidebar,search}.png`, `pixels.json`, `tauri-dark.json`, `tauri-light.json`. 캡처는 창 영역만 잘랐고, 오른쪽 아래(잘린 좌표 x≥1367, y≥600)를 가린 데스크톱 알림 자리는 회색으로 칠했다.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: 편집기(`src/editor/extensions.ts`)·picker(`src/shell/picker.css`)의 따로 둔 스크롤바 크기·색 규칙, 쓰지 않는 `scrollbar.thumb.active_background` 토큰 발행과 테스트 줄(gpui도 drag에 hover 색을 쓴다).
- 더한 것: `src/app.css`의 공통 `::-webkit-scrollbar*` 규칙 하나, `src/spec/metrics.ts`의 gpui 출처 값 셋(hover 폭 8, 최소 길이 48, 모서리 6). 새 의존성 없음.
- 하지 않은 것: 편집 영역 스크롤바 표시 조건(v0.5 I-9), 트리 스크롤 동작(I-13, Phase 7), gpui 파일 쓰기.
- 남은 위험: gpui Sidebar는 스크롤바를 그리지 않는데(렌더러를 붙이지 않음) tauri Sidebar는 공통 모양으로 그린다. R-8 "모든 스크롤바를 한꺼번에 같게"에 맞춘 것이다(C-08 판단 같음). picker(hover 때만 보임)·drag·가로 스크롤바는 화면으로 재지 않고 코드로 확인했다. 패널 트랙은 gpui 16, tauri 15다(1px, thumb 위치는 오른쪽 여백 4로 같다).

## 바꾼 파일
- 코드 커밋 `7f35a8d`: `src/app.css`, `src/editor/extensions.ts`, `src/shell/picker.css`, `src/spec/metrics.ts`, `src/theme/theme.ts`, `src/theme/theme.test.ts`
- 기록 커밋 `8a8be28`: `specs/v0.6/PROGRESS.md`(Phase 4 절), `specs/v0.6/verify/ORDER-04/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- gpui는 데이터 폴더를 `%APPDATA%` 환경 변수가 아니라 Windows API로 찾아 따로 떼어 띄울 수 없다. leader가 사용자 `%APPDATA%\workbench-gpui\state.json`·`settings.json`을 백업하고 임시 상태(테마 One Dark·One Light)로 바꿔 띄운 뒤 원래 파일로 되돌렸다(SHA-256 `ef843c1a…`·`74a557c5…` 백업과 일치). gpui는 leader가 띄운 프로세스만 닫았다. 다음 비교 때도 이 방식을 써도 되는지 → core-leader
- checker 허용 목록에 `git diff`·`Test-Path`가 없는 문제는 그대로다(이번에는 카드에 diff 파일과 "허용 밖 명령 금지"를 적어 멈추지 않았다). → 사용자
- leader가 ORDER-04 작업 중 core-leader pane에 빈 프롬프트(Enter)를 한 번 잘못 보냈다(03:36 무렵). core-leader 쪽에 영향이 없었는지 → core-leader

## BLOCKED
- 없음
