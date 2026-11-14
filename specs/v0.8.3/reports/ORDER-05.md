[DONE] ORDER-05 tauri

## 완료 기준
| # | 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|---|
| 1 | I-1 동작 | 보임·숨김 규칙과 설정 범위·저장(새 단위 테스트 둘) + 화면 6절 #1 | 충족(테스트) / 화면은 일부만 | 규칙 `src/shell/scrollbar-hide.ts`·`scrollbar-hide.test.ts`(영역별, 대기 시간, 0 = 늘 보임, 스크롤바 자리 위 마우스는 숨지 않음), 설정 `scrollbar_hide_delay`(`src/settings/model.ts`, UI 분류, 정수 0~10, 기본 3) `model.test.ts`. 화면: S-3(가로 스크롤바는 대기 뒤에도 보임) 통과, S-1·S-2·S-4~S-7 측정 불가(아래 표) |
| 2 | I-14 동작 | F11 토글이 두 줄만 숨김·창 크기 그대로·다시 켜면 보통(코드) + 화면 6절 #2 + 확인 요청 넷 | 충족(코드·화면 일부) | 명령 `workspace::ToggleZenMode`·`f11`(`src/keymap/builtin.ts:84`), 상태는 저장 안 하는 신호(`src/shell/panels.ts:75`), `.workspace.zen`에서 `.title-bar`·`.status-bar`만 `display: none`(`src/App.tsx:53`, `src/app.css:455`), 창 API 호출 없음. 화면: Z-1 DOM(두 줄 숨김, 탭 줄·세 Sidebar·Folder 검색 칸·제목 줄·바닥 줄 그대로, `Z-1-zen-mode.png`), Z-2(맨 위·아래 마우스에 안 나타남) 통과, Z-4(오른쪽 위 클릭이 최대화 안 됨) 통과. 창 사각형 비교·끌기·최대화(Z-1 일부, Z-3, Z-6, Z-7)는 측정 불가. 확인 요청 넷은 아래 "tauri가 고른 것" |
| 3 | release | 0.8.3 설치 파일, README·BUILD 0.8.3 | 충족 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.3_x64-setup.exe` 10,590,767 B, `src-tauri\target\release\workbench-tauri.exe` 21,558,272 B, 둘 다 2026-11-14 16:27:56, ProductVersion·FileVersion 0.8.3. 빌드 직전 workbench-tauri 프로세스 0개(leader-core [BUILD-OK]). `docs/BUILD.md` 4C절, README 실행 절(`a12fc4e`) |
| 4 | 앞 Phase 화면 | ORDER-01~04 6절을 release exe로 | 일부 | 아래 "화면 측정 표". 통과 12줄, 문제 1줄(확인 필요), 측정 불가 나머지 |
| 5 | 시안 대조 | 두 시안 장면을 One Light·One Dark로 나란히 | 산출물만(대조 판정 없음) | `specs/v0.8.3/verify/ORDER-05/out/mockup-pairs.md`(6쌍: 시안 절 캡처 + 앱 Light·Dark). 앱 쪽 캡처는 장면 상태(툴팁·눌린 칸·메뉴·Zen)를 다 만들지 못한 것이 많다(예: `M-app-03-sort-dark.png`는 Folder 화면만) — "다른 곳" 칸은 비어 있고, 사용자 확인 때 직접 본다 |
| 6 | 회귀 | 전체 테스트·typecheck 한 번, cargo, 보안 diff | 충족 | `npm.cmd run test` 346/346, `npm.cmd run typecheck` 0(C-05, release 빌드 전 한 번). Rust를 고쳐 `cargo check`·`cargo clippy -- -D warnings` 경고 0(K-05). `git diff d8f9438 --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` → 버전 한 줄뿐 |

### 화면 측정 표 (release exe 사본 `%TEMP%\v083-exe083\workbench-tauri.exe`, 격리 APPDATA·WebView2, 창 1440×852, 1920×1080 100%, One Light; M만 One Dark도)

프로브 `specs/v0.8.3/verify/ORDER-05/probe.mjs`, 결과 `out/result.json`(1~4차 합침, 줄마다 마지막 실행 값), 로그 `%TEMP%\v083-probe-run1.log`~`run4.log`.

| id | 무엇 | 판정 | 근거·이유 |
|---|---|---|---|
| O1-1 | About 0.8.3 | 통과 | `O1-1-about.png` |
| O1-2 | 세 선 ≥ 1px(UI 15px, 창 1440·1441, 좌우·상하) | 통과 | `O1-2-dividers.png` |
| O1-3 | I-13 본문 구간 색 | 측정 불가(프로브) | 같은 라이트 미리보기 둘을 만들지 못했고(`lightViewView` null), "다크 편집 + 라이트 미리보기"는 Edit 다크 설정이 적용되기 전에 재 두 색이 같게 읽힘. 화면으로 판정 못 함 |
| O1-4 | 위치 글자·ipynb 종류·Outline | 통과 | 편집 `1:1`, md 미리보기 `1`, ipynb 미리보기 `1` "Jupyter Notebook", 미리보기 블록 클릭 뒤 Outline "Section 1" |
| O2-1 | 미리보기 본문 58px, `[999]`·`[10000]` 안 잘림 | 실행 번호 통과 / 본문 시작 측정 불가(프로브) | `[1]`·`[999]`는 44px 칸 안(scrollW = clientW), `[10000]` 58px 칸, 왼쪽 끝이 pane 왼쪽에서 0.42px — 안 잘림. 본문 시작은 프로브가 `.markdown-body` 상자 왼쪽(14px = 바깥 여백)을 재서 글자 시작(+44px 여백)을 못 잼 |
| O2-2 | 탭 줄 버튼 영역 | 통과(계산 대조) | 오른쪽 영역 gap `0px`, 양쪽 padding `4px`. 왼쪽 영역 53px — 프로브가 UI 글자를 15px로 바꾸지 않아 기본 16px에서 잼: 22 + 22 + 4 + 4 + 경계 1 = 53px로 맞음(15px이면 49.7px). 프로브는 49 기대로 "문제"라 적었다 |
| O2-3 | 줄 번호 12px·기준선 | 글자 크기 통과 / 기준선 측정 불가(프로브) | `.cm-lineNumbers` 12px. 기준선은 프로브가 첫 `.cm-gutterElement`(CodeMirror의 숨은 자리 잡기 요소)와 첫 줄의 아래 끝을 비교해 22.41px 차이 — 같은 줄끼리가 아님 |
| O2-4 | 줄 번호 켬·끔·미리보기 시작선 58px | 측정 불가(프로브) | 줄 번호 켬 58px. 끔 0px·미리보기 14px은 상자 왼쪽을 잰 값(글자 시작이 아님) |
| O3-1 | 화면 글자 | 측정 불가(프로브) | 폴더 없는 세션에서 Tree 줄을 누르려다 실패 |
| O3-2 | Ctrl+Alt+1·2·3, Ctrl+B·Ctrl+Alt+J, Ctrl+Shift+E | 통과 | 세 Sidebar 닫힘, 두 옛 키 무변화, Reveal 줄 `pair.md` |
| O3-3 | 세 버튼 툴팁 | 통과 | 열림·닫힘 모두 "Toggle Folder Ctrl-Alt-1"·"Toggle Tree Ctrl-Alt-2"·"Toggle Outline Ctrl-Alt-3" |
| O3-4 | Folder 바닥 줄 토글 없음 | 통과 | 캡처 |
| O4-1 | 정렬 아이콘 네 상태 | 통과 | 오름 [Alpha, Beta, Zeta] 오름 눌림, 내림 [Zeta, Beta, Alpha] 내림 눌림, 끌어서 [Zeta, Alpha, Beta]이면 둘 다 안 눌림, hover 캡처 |
| O4-2 | 두 우클릭 메뉴 | 통과 | `O4-2-folder-row-menu.png`, `O4-2-folder-empty-menu.png` |
| O4-3 | 세 제목 줄 hover·×·포커스 | 통과 | 셋 다 × 누름 = 닫힘, 제목 누름 = 목록 포커스 |
| O4-4 | Right Sidebars 배치·손잡이·다시 켠 뒤 | 측정 불가(입력 도구) | `win-input` 전경 창 가져오기 실패("could not bring the window to the foreground") — 배치 자체는 `O4-4-right-sidebars.png`·`R-2-outline-handle-overlap.png`에 Folder │ 탭·문서 │ Outline │ Tree로 보임 |
| R-1 | I-13 색 경계 = 탭 줄 아래 | 측정 불가(프로브) | 같은 테마 미리보기 둘을 만들지 못해 구분선 요소를 못 찾음 |
| R-2 | Right에서 Outline 손잡이가 끝 버튼·스크롤바와 겹침 | 문제(확인 필요) | 프로브가 끝 버튼 영역과 2px 겹침, 스크롤바와 0px로 적음. 사각형 값이 기록되지 않아 근거가 약하다. 코드상 손잡이 잡는 영역의 절반이 pane 오른쪽 끝 위로 걸치는 것은 K-04 보고와 같다 |
| R-3 | Tree 목록이 끝까지 차고 스크롤 | 측정 불가(프로브) | 프로브가 스크롤 요소(`.project-panel`)가 아니라 그 안 내용(`.tree-window`)을 재서 "안 스크롤됨"으로 적음. 캡처 `R-3-tree-scrolling.png`에는 Tree 세로 스크롤바가 dock 안에 있다 |
| S-1·S-2 | 3초 뒤 숨음·입력에 나타남·다른 영역 | 측정 불가(입력 도구·프로브) | 편집 창 클릭 지점 가려짐, 전경 창 실패 |
| S-3 | 가로 스크롤바 그대로 | 통과 | 넓은 줄(scrollWidth 4350 > 725), 세로가 `off`인 동안 가로는 `--scrollbar-opacity`를 쓰지 않음 |
| S-4·S-5·S-6·S-7 | 손잡이 위 hover·0.3초 흐려짐·설정 0·선택기 | 측정 불가(프로브) | 탭 정리(`closeAll`) 실패, 전경 창 실패 |
| Z-1 | F11 앞뒤 | DOM 통과 / 창 사각형 측정 불가 | DOM은 위 #2. 창 사각형을 `win-input state`로 못 읽음 |
| Z-2 | 맨 위·아래 hover에 안 나타남 | 통과 | 두 줄 `display: none` 유지 |
| Z-3 | 탭 줄 빈 곳 끌기·두 번 눌러 최대화 | 측정 불가(입력 도구) | 전경 창 실패 |
| Z-4 | Zen 동안 오른쪽 위 클릭 | 통과 | 최대화 안 됨, 창 크기 그대로 |
| Z-5 | HTML 미리보기 안에서 F11 | 측정 불가(프로브) | 편집기 요소 못 찾음. 코드상 먹지 않음(아래 미정) |
| Z-6·Z-7 | 다시 F11·다시 켠 뒤 보통 / Right에서 같음 | 측정 불가(입력 도구) | 측정 앱 창을 잃음("window not found") |
| M | 시안 대조 | 산출물만 | #5 |

## 검증
- 테스트: K-05 닿는 테스트 29 pass, typecheck 0, `cargo check`·`cargo clippy -- -D warnings` 경고 0. C-05에서 전체 `npm.cmd run test` 346/346, typecheck 0(이 버전에서 한 번).
- 리뷰: C-05 [PASS](I-1 영역 찾기·흐려짐 CSS·타이머, Zen 끌기 자리, `caption.rs` 숨김과 `caption_set_visible`, 보안 설정 diff 없음).
- 빌드: K-06 `npm.cmd run tauri build` exit 0(77초).
- 화면: [SCREEN-OK] 뒤 프로브 네 번(1차 전부, 2·3·4차는 남은 줄만), [SCREEN-DONE] 보냄. 측정 앱은 모두 프로브가 띄운 `%TEMP%` 사본이고, 끝난 뒤 남은 하나(1차, PID 25916, 경로 확인)만 닫았다. 지금 workbench-tauri 프로세스 0개.

## 지운 것·더한 것·하지 않은 것
- 더함: `src/shell/scrollbar-hide.ts`(+테스트), 설정 `scrollbar_hide_delay`, 명령 `workspace::ToggleZenMode`·키 `f11`, Rust `caption.rs` 숨김 상태와 명령 `caption_set_visible`, 측정 프로브. 지움: 선택기 목록의 hover 때만 보이는 스크롤바 예외.
- 하지 않음: 가로 스크롤바·HTML 미리보기 프레임 안 스크롤바, Zen Mode 메뉴·아이콘·안내·Esc·저장·전체 화면, 프레임 키 허용 목록 넓히기, 측정에서 기대와 다른 것 고치기.
- 측정 프로브는 checker(C-06·-R1·-R2)가 썼다. 2·3차 사이에 tauri-leader가 프로브 세 군데(JS 식을 선택자로 읽던 `pt`, 탭 닫기를 Ctrl+W로, Zen 켜짐 확인 가드 — 가드가 없을 때 2차 Z-4가 보통 모드에서 창 닫기 단추를 눌러 측정 앱을 닫았다)를 고쳤다. 앱 코드는 아니다.
- 남은 위험: 측정 불가 줄이 많다(위 표) — 대부분 프로브 선택자와 `win-input` 전경 창 가져오기 실패. I-1의 3초 숨김·0.3초 흐려짐, Zen 끌기·최대화, I-13 색 경계, I-12 시작선은 화면으로 확인되지 않았다.

## tauri가 고른 것
- I-1 설정 키 `scrollbar_hide_delay`. 영역은 목록을 두지 않고 "이벤트 대상에서 위로 올라가며 세로로 넘치고 `overflow-y`가 auto/scroll인 첫 요소"로 찾는다(모든 범위 영역에 같은 코드). 흐려짐 0.3초는 `src/spec/metrics.ts` `scrollbar.hide.fade_duration`(ITEMS 값). 프로그램이 굴린 스크롤만으로는 보이지 않는다(항목이 말한 입력만). shortcut: 보이는 영역 안에 다시 세로 스크롤 영역이 있으면 함께 보인다(`app.css` 주석).
- I-14 명령 `workspace::ToggleZenMode`. 창 끌기는 Zen일 때만 `.tab-bar`·`.tab-bar-edge` 둘·`.tab-bar-drop`에 `data-tauri-drag-region`(Tauri가 탭·버튼은 끌기에서 뺌, 이미 허용된 `start-dragging`·`internal-toggle-maximize`). 입력 칸에 포커스가 있어도 F11만 넘긴다(`src/keymap/keyboard.ts:87`).
- I-14 확인 요청:
  1. F11이 전체 화면이 되지 않음: 키맵이 `preventDefault`(`keyboard.ts:104`), 키맵에서 풀어도 `BROWSER_KEYS`의 `f11`로 막음. 화면: F11 뒤 창이 전체 화면이 아님(Z-1 캡처, Z-4 창 크기 그대로).
  2. 창 버튼 자리: Zen 동안 WebView 구멍을 없애고 그리지 않으며 `HTMAXBUTTON`을 답하지 않음(`src-tauri/src/caption.rs:92-95,114,171`). 화면: Z-4 오른쪽 위 클릭이 최대화하지 않음(통과). 가장자리 크기 바꾸기는 창 테두리가 하는 일이라 이 변경과 닿지 않음(코드, 화면 측정 불가).
  3. HTML 미리보기 안을 누른 상태의 F11: 먹지 않는다. 프레임 안 키는 `FRAME_KEYS` 일곱 가지만 넘어온다(`src/editor/html.ts:183,191-196`). 허용 목록은 보안 설정에 닿아 넓히지 않았다 — 미정.
  4. 탭 줄 빈 곳 끌기와 탭 놓는 자리: 부딪히지 않음 — 탭 끌기는 탭 위 `pointerdown`에서 시작(`src/shell/Pane.tsx:368`), 놓는 자리는 포인터 위치(`Pane.tsx:191`), 창 끌기는 빈 곳 자체를 누른 `mousedown`만(코드).
  5. Right Sidebars에서도 같음: 같은 요소를 CSS `order`로 옮긴 것이고 창 버튼 구멍은 창 단위로 없앤다(코드). 화면 Z-7 측정 불가.

## 바꾼 파일
- 코드 `8505c9f`(K-05): `src/shell/scrollbar-hide.ts`(새), `src/shell/scrollbar-hide.test.ts`(새), `src/app.css`, `src/index.tsx`, `src/settings/model.ts`, `src/settings/load.ts`, `src/settings/model.test.ts`, `src/spec/metrics.ts`, `src/shell/panels.ts`, `src/App.tsx`, `src/shell/Pane.tsx`, `src/keymap/builtin.ts`, `src/keymap/keyboard.ts`, `src/keymap/builtin.test.ts`, `src-tauri/src/caption.rs`, `src-tauri/src/lib.rs`
- 문서 `a12fc4e`(K-06): `docs/BUILD.md` 4C절, `README.md`
- 측정 산출물(`specs/v0.8.3/verify/ORDER-05/`)과 이 보고·PROGRESS는 이 보고 뒤 커밋에 넣는다.

## 미정
- HTML 미리보기 프레임 안에 포커스가 있을 때 F11이 먹지 않음 — 프레임 키 허용 목록에 F11을 더할지(보안 설정, leader-core·사용자).
- 화면 측정 불가 줄(위 표) — 사용자 확인 때 직접 본다(leader-core 지시). 특히 I-1 숨김·흐려짐, Zen 끌기·최대화, I-13 색 경계, I-12 시작선, Right Sidebars 다시 켠 뒤.
- R-2: Right Sidebars에서 Outline 손잡이 잡는 영역이 탭 줄 오른쪽 끝 버튼과 약 2px 겹친다는 측정(근거 약함) — 사용자 확인 때 볼지 leader-core.

## BLOCKED
- 없음
