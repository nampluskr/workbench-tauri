[DONE] ORDER-08 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| I-5 위치·파일 형식 | 편집 중 커서 이동에 `{line}:{column}`이 바뀜, 파일 형식 이름이 Zed와 같음, 미리보기 누른 곳 원본 위치, 오른쪽 아이콘 묶음 앞 | 충족 | 커서 `5:23 Markdown`, 선택 `5:28 (5 characters) Markdown` — Zed와 같은 문구(`tauri-cursor.png`·`tauri-selection.png` / `zed-cursor.png`·`zed-selection.png`). 미리보기 둘째 목록 항목 클릭 `6:1 Markdown`(기대 6, `tauri-preview-click.png`). 탭 없음·도구 탭: 둘 다 숨김(`tauri-v3-probe.json`, Zed `zed-no-tab2.png`). 대응 표 SPEC R-5 676행(Zed 4304dec `crates/grammars/src/*/config.toml` 19행, 없으면 Plain Text). 미리보기 블록 표 SPEC R-5 643행. V1 테스트 position·filetype·status·markdown |
| I-19 켜짐 표시 | 사이드바·dock 열고 닫을 때 버튼 표시가 Zed와 같음 | 충족 | dock 열림 file_tree 아이콘 `#74ade8`(text.accent), 닫힘 `#a9afbc`, 배경 변화 없음 — Zed 실측 `#74ade8`과 같음(`zed-cursor.png` vs `zed-project-click1.png`, `tauri-v3.json` left_dock_open/closed). 사이드바 열림: 상태 바 토글이 사라지고 사이드바 아래쪽 줄에 `threads_sidebar_left_open`(Zed와 같은 구성, `tauri-sidebar-open.png` / `zed-dock-click1.png`) |
| I-22 버튼 구성 | 종류·순서·툴팁·키가 Zed와 같고 각 버튼이 Zed 틀의 화면을 엶 | 충족 | 순서 [사이드바 토글] \| [file_tree] \| [검색] [진단 ✓]. 툴팁 `Open Folder Sidebar Ctrl-Alt-J`, `Close Left Dock Ctrl-B`, `Project Search Ctrl-Shift-F`, `Project Diagnostics Ctrl-Shift-M`(Zed 첫 버튼은 Threads Sidebar, 이 앱은 폴더 사이드바 — 기존 결정). 위치(글리프 잉크 x) tauri 9·39·70·101 = Zed 9·39·70·101, 구분선 28·59 = Zed, 높이 16·색 border 같음(차이 0, `tauri-re-status-sidebar-closed.png`). 표 SPEC R-22 1265행, Zed 실측 근거 1287행 |
| I-22 Project Search | 실제 검색, Zed 틀, 결과 열기 | 충족 | 한 줄 툴바(접기·검색칸 안 Aa/wd/.*·Filters·Replace·‹ ›·`현재/전체`), 빈 상태 안내 5줄, Filters(Include/Exclude, Only Search Open Files, ignored 포함 토글), Replace 줄, 파일별 머리줄(상대 폴더, Open File Alt-Enter), 앞뒤 2줄 발췌·경계, 일치 강조 2색, 줄바꿈(`tauri-re-search-empty.png`·`tauri-re-search-results.png` / `zed-search-empty.png`·`zed-search-results.png`). "ponytail" 1/20 vs Zed 1/19: 차이는 Zed 캡처 뒤 생긴 측정 파일 `tauri-v3.json` 한 건(rg 20건과 같은 규칙). Alt-Enter로 열면 `45:35 (8 characters) Markdown`(Zed와 같음). Rust 백그라운드 검색(gitignore·바이너리 제외, 취소, 링크 미탐색, 창 폴더 밖 거부), 상한 파일 5,000·일치 10,000(Zed와 같음). Replace Next/All: 버퍼만 바꾸고 저장하지 않음(Zed `replace_next`/`replace_all`도 저장 안 함, project_search.rs 1407-1485), 검색 뒤 바뀐 파일은 건너뜀. SPEC R-22 1335·1347행 |
| I-22 Diagnostics | 언어 서버 없이 Zed "문제 없음" 화면 | 충족 | 탭 `✓ No problems`(success 색), 툴바 4아이콘(비활성)·접기, 본문 `No problems in workspace` y 465.5(Zed 466), 툴바 높이 45(`tauri-re-diagnostics.png` / `zed-diagnostics.png`). SPEC R-22 1373행 |
| 완료 2 Zed 확인 | Zed 확인 결과, 탭 없을 때 상태 바 | 충족 | 아래 "Zed 확인" |
| 완료 3 앞 Phase | 앞 Phase 결과 유지 | 충족 | 전체 테스트 185/185, cargo test 25, clippy 0(checker C-25 PASS). 선택기 값은 gpui toml ID로 참조만 바뀜(K-23, 값 같음) |

- 공통 조건: 1920×1080, 배율 100%, 클라이언트 1440×852, One Dark, 폴더 `D:\projects\workbench-tauri`. tauri는 앱 데이터 백업·시험 데이터·복원(매번 차이 0), 띄운 PID만 닫음. Zed는 `zed -n` 새 창 5개, 각 그 창만 닫음. 사용자 Zed 설정·신뢰 목록 불변, Replace 누르지 않음, Ctrl-, 누르지 않음.

## Zed 확인 (2장)
- 열린 탭 없음: 상태 바 오른쪽에 위치·파일 형식 없이 오른쪽 아이콘 묶음만(`zed-no-tab2.png`, `zed-end-run2.png`).
- 위치 문구: `5:23 Markdown`, 선택 `5:28 (5 characters) Markdown`(위치는 선택 끝). 여러 줄·여러 선택 문구는 Zed `crates/go_to_line/src/cursor_position.rs` 규칙(SPEC R-5). Project Search 탭은 위치만, Diagnostics는 둘 다 없음.
- 왼쪽 버튼(사이드바 닫힘): 토글 `Open Threads Sidebar Ctrl-Alt-J` | file_tree `Close Left Dock Ctrl-B` | 검색 `Project Search Ctrl-Shift-F`, 진단 `Project Diagnostics Ctrl-Shift-M`. 버튼 박스 22×22 x 4·33·64·94, 진단은 ✓ 아이콘만, 검색→진단 간격 8(숨은 lsp_button 자리). 사이드바 닫힘일 때 상태 바에 Add Project 없음.
- 켜짐: dock 열림이면 file_tree 아이콘 강조색, 사이드바 열림이면 토글이 사이드바 아래쪽 줄로.
- Project Search·Diagnostics: 위 표와 SPEC R-22. 사용자 Zed는 VSCode 기본 키맵이라 편집 영역에서 Alt-Shift-H가 다른 명령(incoming calls)으로 열렸다(아무것도 바꾸지 않고 닫음).

## 두 갈래 대조용
- 파일 형식 대응 표: SPEC R-5 676행. 버튼 표: SPEC R-22 1265행, Zed 실측 근거(잉크·박스·구분선·진단 버튼 구성): 1287~1310행.
- **toml에 없는 값 목록(gpui 등록 요청): SPEC R-22 1313~1331행(13행).** 이 가운데 `statusbar.padding_x`·`statusbar.toggle_gap`은 gpui가 이미 올렸고 tauri는 K-35에서 spec/를 다시 복사했다(표의 "올리는 중" 표시는 다음 문서 카드에서 고침). 나머지 11개(Project Search 10, 타이틀 바 닫기 버튼 색 L-84 1)는 임시 metrics 값.
- 미리보기 클릭 위치: core 결정대로 가장 안쪽 블록 시작 줄, 열 1. 표 안 셀은 그 **행(tr)** 시작 줄이다(머리 행은 표 시작 줄과 같은 수) — SPEC R-5 643행, core 확인 요청.

## 남은 차이
- Project Search 머리줄의 제목 breadcrumb(`# … › ## …`)와 발췌 펼치기 동작(화살표는 모양만), 머리줄 파일 아이콘, Filters 줄 모양 세부: 하지 않음.
- Replace All 뒤 편집기가 없던 파일은 탭으로 열려 미저장으로 남는다(Zed는 결과 멀티버퍼 안에서 바꿔 탭이 늘지 않음 — 이 앱 구조상 차이).
- 링크(junction 포함)는 따라가지 않는다(보안). Zed는 루트 안 링크를 따라간다.
- 상태 바 오른쪽 아이콘 묶음(터미널·디버거 등)은 이 앱 범위 밖이라 없다. 위치·파일 형식은 오른쪽 끝(여백 4)에 있다.

## 의존성
- `ignore =0.4.34`(Unlicense OR MIT), `regex =1.13.1` — 승인 문구는 MIT/Unlicense였으나 regex 실제 라이선스는 **MIT OR Apache-2.0**. 원문 4개 `src/licenses/`, Licenses 창 연결. DECISIONS D-11.

## 운영
- coder: 14:57 Codex(GPT-6.1-Sol medium)로 되돌림, 15:57 5시간 한도 소진(K-29 중) → D-16대로 Sonnet 5.5 high. Codex는 19:05 다시 쓸 수 있음 — 되돌릴지 지시를 따름.
- 측정 중 사고: V3 1차에서 측정 스크립트의 Ctrl-Shift-V가 붙여넣기로 처리되어 앱 편집기 버퍼(AGENTS.md)에 클립보드 글이 들어갔다. 저장하지 않고 앱을 닫아 디스크는 바뀌지 않았다(git 확인). 원인은 앱 버그(사이드바 닫은 뒤 포커스가 편집기가 아닌 pane으로)였고 K-33에서 고쳤다(재측정 확인).
- tauri 앱 실행 5회(1차 스크립트 실패, 본 측정, probe, 재측정 2회 — 이유는 PROGRESS Phase 8).
- 커밋(push 안 함): 9509ae4 ~ 49e390f.
