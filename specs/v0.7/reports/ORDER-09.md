[DONE] ORDER-09 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-30 | View All Licenses → 글꼴·크기·줄간격·테마가 편집 탭과 같다, 검은 테두리 없음(V3) | 충족 | `specs/v0.7/verify/ORDER-09/v3.json` `c1_c2_licenses`: 일반 편집 탭과 Licenses 탭이 같다(Lilex 15px, 줄 높이 24, 배경 rgb(40,44,51), 글자색 같음, 줄 번호 있음). outline `none`, border 0(`c1-licenses-tab.png`) |
| 2 I-30 | 쳐도·붙여 넣어도 안 바뀜, 선택·복사 됨, `Ctrl+F` `MIT`, `Ctrl+=`(V3) | 충족 | 입력, Enter, Backspace, Ctrl+X, Ctrl+Z, Ctrl+V, 메뉴 Paste 뒤에도 길이 733301 그대로다. 첫 줄 선택·복사 결과가 첫 줄과 같다. 찾기 `MIT`는 `1/1313`이고 Replace 버튼은 비활성이다(`c2-licenses-find-mit.png`). `Ctrl+=`는 16px, `Ctrl+0`은 15px(`c2-licenses-zoomed.png`) |
| 3 I-30 | 내용이 지금 Licenses와 같다(V1), 닫을 때 저장 확인 없음(V3) | 충족 | `src/shell/licenses.test.ts`가 내용이 `licenseText(licenseSources(copies))`와 같은지 본다. Ctrl+W를 누르면 확인 창 없이 탭이 2개에서 1개로 줄었다. 일반 파일 탭은 그대로 편집된다(`plainEditable` true) |
| 4 빌드 | 설치 파일 새로 만듦, 0.7.0, `docs/BUILD.md` 새 결과(V1) | 충족 | `workbench-tauri_0.7.0_x64-setup.exe` 6,065,494 바이트, 2026-11-10 22:36:00, ProductVersion·FileVersion 0.7.0. 앱 exe 16,832,512 바이트. `docs/BUILD.md` 4·5장 |
| 5 테스트 | 읽기 전용·내용 같음 테스트, 기존 테스트 통과(V1) | 충족 | `licenses.test.ts`의 읽기 전용 테스트: 입력·삭제·undo·redo가 글을 바꾸지 못하고, 편집 가능 상태와 대조한다. 내용 같음 테스트도 있다. `npm.cmd run test` 259/259, typecheck 0 |
| 6 I-31(10절 고침) | 긴 문서 좌우 분할에서 경계선이 탭 줄부터 아래까지 보이고, 색·두께가 영역 구분선과 같음(One Dark·One Light), 끌기(V3) | 충족(코드 변경 없음) | `v3-b.json` `c6_long_dark`·`c6_long_light`: 편집+미리보기, 미리보기 둘 모두 확인했다.<br>- 1x 캡처 x=940 한 줄이 y=48(탭 줄)부터 800까지 선 색이다. One Dark 71,75,87, One Light 201,201,202이고 Sidebar↔편집 구분선(x=439)과 같은 값이다.<br>- 1px이고, `elementFromPoint`는 모두 경계선을 가리킨다(덮는 요소 없음).<br>- 스크롤바(15px)는 각 pane 안쪽에 있다.<br>- 끌기: 939.5 → 879.5.<br>캡처 `c6c-long-*.png`. 앞선 측정은 `v3.json` `c6_split_*` |
| 7 I-32 | 두 곳에서 세 아이콘 그림이 다 들어감, UI 글꼴 16·18(V3) | 충족 | `v3-b.json` `c7_icons_ui16`·`ui18`: Search 탭과 찾기 줄 모두 확인했다.<br>- `Aa`·`wd`에 viewBox `0 0 16 16`이 붙었다.<br>- 그림 오른쪽 끝은 svg 상자 안이다(그림 오른쪽 = svg.x + (bbox.x+bbox.w)×svg.w/16). UI 16: 상자 14px, 그림 끝 12.4·12.4·11.5px. UI 18: 상자 15.75px, 그림 끝 최대 13.96px.<br>캡처 `c7-find-bar-ui16/18.png`, `c7-search-tab-ui16/18.png` |

## 검증
- typecheck 오류 0, `npm.cmd run test` 259 통과. Rust 변경은 없다. leader가 출력 파일을 만들었다(`%TEMP%\v07-C-17-*`·`v07-C-18-*`).
- checker C-17: K-13 코드 [PASS], V3 기준 1·2·3·6(첫 측정) PASS.
- checker C-18: K-15 코드 [PASS], 기준 6(고침)·7 PASS.
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`을 두 번 했다.
  - debug exe, 임시 APPDATA·WebView, 창 1440×852, 100%, CDP 합성 입력.
  - 측정 전 사용자 클립보드를 저장했고, 뒤에 되돌렸다(`clipboardRestored` true).
- release 빌드(67.7초)는 커밋 `5f65e34`와 같은 코드로 했다. 커밋과 다른 것은 문서뿐이다. 사용자 앱 PID 26888은 손대지 않았다.
- 결과 파일: `specs/v0.7/verify/ORDER-09/v3.json`, `v3-b.json`, PNG.

## 지운 것·더한 것·하지 않은 것
- I-30:
  - Licenses는 이제 `createFileView(…, editable=false)`로 만든 읽기 전용 CodeMirror 탭이다.
  - `openTool`이 view도 받게 바꿨다.
  - `licenseSources`를 `src/shell/licenses.ts`로 옮겼고 내용·순서는 같다.
  - `<pre class="licenses-tab">`와 그 CSS는 지웠다.
- I-32: `scalable()`(viewBox 없는 SVG에 viewBox 붙이기)을 더했다. 적용 대상은 `case_sensitive`·`whole_word` 둘뿐이다.
- I-31: 코드 변경 없음. 임시 color-mix는 되돌렸다.
- 새 의존성 없음, 앱 버전·아이콘·Licenses 내용 그대로.
- 남은 위험:
  - viewBox 없는 Zed 아이콘이 이 둘 말고도 있다(`select_all` 등). 14px 상자에 놓이면 같은 잘림이 날 수 있다. 사용자 보고가 없어 손대지 않았다.
  - Licenses 탭은 지금처럼 앱을 다시 열 때 복원되지 않는다.

## tauri가 고른 것
- 읽기 전용 방법: 편집 탭과 같은 view를 `EditorState.readOnly`와 `EditorView.editable=false`로 만든다. 탭의 "Make Tab Read-Only"와 같은 수단이다.
  - 탭 종류는 도구 탭이다. 그래서 고침 표시·저장·닫을 때 확인이 없고, 다시 열면 이미 열린 탭으로 간다.
  - 메뉴 Paste는 readOnly에서 멈춘다(I-13 경로). Replace는 비활성이다.
- 자동 줄바꿈: 하지 않는다. 코드 파일과 같은 규칙이다(I-7: Markdown만 줄바꿈 설정을 따른다). 목록이 줄 단위 표 모양이고, 120자를 넘는 줄은 약 11,000줄 중 58줄뿐이다.
- 검은 테두리 원인: `<pre tabIndex=-1>`이 포커스될 때 `outline: none`이 없어 브라우저 기본 포커스 윤곽선이 그려졌다. CodeMirror view는 `.cm-focused { outline: none }`이 이미 있다.
- I-31: 좌우 경계선은 처음부터 영역 구분선과 같은 토큰이었다(`pane_group.border` ← `border`, T-26.4). Zed 테마에서도 `pane_group.border`가 없으면 `border`를 쓴다. 이 앱의 대체 규칙이 그것이다.
  - 측정으로 Sidebar↔편집 선과 픽셀까지 같다. 긴 문서에서도 덮는 요소가 없다.
  - Zed보다 덜 보이는 것은 선이 아니라 주변 차이로 보인다. Zed 화면은 재지 않았다.
- I-32 원인: Zed 복사본 `case_sensitive.svg`·`whole_word.svg`에 `viewBox` 없이 `width/height="16"`만 있다. 그래서 14px 상자에서 그림이 줄지 않고 오른쪽·아래가 잘렸다. 불러올 때 viewBox를 붙여 고쳤다. 크기·자리·동작은 그대로다.
- 설치 파일: `D:\projects\workbench-tauri\src-tauri\target\release\bundle\nsis\workbench-tauri_0.7.0_x64-setup.exe`, 6,065,494 바이트(5.78 MiB), 2026-11-10 22:36:00.

## 바꾼 파일
- 커밋 `5f65e34`:
  - `docs/BUILD.md`
  - `specs/v0.7/PLAN.md`, `specs/v0.7/PROGRESS.md`, `specs/v0.7/verify/ORDER-09/*`
  - `src/app.css`
  - `src/shell/AppMenu.tsx`·`Icon.tsx`·`icon-svg.ts`·`icon-svg.test.ts`·`licenses.ts`·`licenses.test.ts`(새)
  - `src/workspace/context.ts`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- I-31: 선은 영역 구분선과 같지만, 사용자가 여전히 약하게 보면 선 색 토큰을 정해야 한다 → 사용자(기존 토큰 중 모든 테마에서 더 진한 것은 없음, `%TEMP%\v07-K-15-report.md` 표).
- `.agents/checker-settings.json` 허용 목록 → 사용자(ORDER-08부터 그대로).

## BLOCKED
없음. I-31의 [BLOCKED] 두 건은 core-leader 답(9·10절)으로 풀렸다.
