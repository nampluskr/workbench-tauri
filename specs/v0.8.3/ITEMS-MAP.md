> 버전: v0.8.3 · 작성일: 2026-11-14 · 상태: 초안
>
> core v0.8.3 ITEMS의 항목(I-1~I-17)과 tauri 작업의 대응이다. 요구·정한 것·판정 방법의 원본은 core `D:\projects\workbench-core\specs\v0.8.3\ITEMS.md`, Phase 나눔은 core `specs/v0.8.3/PLAN.md`의 "Phase와 카드"·"그룹과 Phase" 표다(읽기만 한다). core Phase n의 지시 카드는 core `specs/v0.8.3/orders/ORDER-<nn>.md`다. 실제로 한 일과 검증은 `PROGRESS.md`에, 에이전트 운영은 `HERDR-SETUP.md`에 있다. tauri 카드는 core 카드를 받은 뒤 채운다.

# ITEMS-MAP — workbench-tauri v0.8.3

## 1. 대응 표

- core Phase = ORDER 번호다. 화면 측정은 모든 항목을 Phase 5(ORDER-05)에서 release exe로 한 번에 잰다(core COMMON 8절).
- 상태: 진행 중 · 대기(카드 받기 전) · 충족(leader-core 판정 뒤).

| I-n | 제목 | 그룹 | core Phase | tauri 카드 | 상태 |
|---|---|---|---|---|---|
| I-1 | 스크롤바를 마우스·키보드 입력이 있을 때만 보이기 (모든 영역) | G-4 | 5 | ORDER-05 | 대기 |
| I-2 | pane 구분선이 창 너비에 따라 사라짐 (같은 두께의 선 둘 포함) | G-3 | 1 | ORDER-01 | ORDER-01 충족(leader-core 판정), 화면은 Phase 5 |
| I-3 | Folder Sidebar 안의 토글 아이콘 없애기 | G-1 | 3 | ORDER-03 | 대기 |
| I-4 | Sidebar 단축키 — 포커스 키 없애기, 토글 키 다시 정하기 | G-1 | 3 | ORDER-03 | 대기 |
| I-5 | 상태 표시줄 Sidebar 버튼의 툴팁 | G-1 | 3 | ORDER-03 | 대기 |
| I-6 | Folder Sidebar 정렬 아이콘 둘 | G-1 | 4 | ORDER-04 | 대기 |
| I-7 | Folder Sidebar 우클릭 메뉴 | G-1 | 4 | ORDER-04 | 대기 |
| I-8 | 이름 통일 — Folder, 그리고 Folder Sidebar / Tree Sidebar / Outline Sidebar | G-1 | 3 | ORDER-03 | 대기 |
| I-9 | 본문 왼쪽 여백 줄이기 — 미리보기와 줄 번호를 끈 에디터 | G-2 | 2 | ORDER-02 | 구현·테스트 충족(코드 근거), 화면은 Phase 5 |
| I-10 | 탭 줄 Go Back / Go Forward 영역의 간격 줄이기 | G-2 | 2 | ORDER-02 | 구현·테스트 충족(코드 근거), 화면은 Phase 5 |
| I-11 | 줄 번호 글꼴 크기를 따로 — Settings에 설정 추가 | G-2 | 2 | ORDER-02 | 구현·테스트 충족(코드 근거), 화면은 Phase 5 |
| I-12 | 줄 번호를 켠 에디터의 글자 시작선을 본문 여백과 맞추기 | G-2 | 2 | ORDER-02 | 구현·테스트 충족(코드 근거), 화면은 Phase 5 |
| I-13 | pane 구분선의 색 — 탭 줄 구간은 UI 테마, 본문 구간은 그 창의 테마 | G-3 | 1 | ORDER-01 | ORDER-01 충족(leader-core 판정), 화면은 Phase 5 |
| I-14 | Zen Mode — 타이틀바와 상태 표시줄을 숨기는 모드 | G-5 | 5 | ORDER-05 | 대기 |
| I-15 | 미리보기 창에서는 위치를 줄 번호만 표시 | G-5 | 1 | ORDER-01 | ORDER-01 충족(leader-core 판정), 화면은 Phase 5 |
| I-16 | 세 Sidebar의 제목 줄 — 마우스 올림 반전, 감추기 표시 | G-1 | 4 | ORDER-04 | 대기 |
| I-17 | Panel Layout — Tree·Outline Sidebar를 왼쪽 또는 오른쪽에 | G-1 | 4 | ORDER-04 | 대기 |

## 2. Phase별 묶음

| core Phase | 카드 | 항목 | 보안 설정 (core COMMON 3절) |
|---|---|---|---|
| 1 | ORDER-01 | v0.8.3 시작(문서·`AGENTS.md`·앱 버전 0.8.3), I-2, I-13, I-15 | 바꾸지 않음 |
| 2 | ORDER-02 | I-9, I-10, I-11, I-12 | 바꾸지 않음 |
| 3 | ORDER-03 | I-8, I-4, I-5, I-3 | 바꾸지 않음 |
| 4 | ORDER-04 | I-6, I-7, I-16, I-17 | 바꾸지 않음 |
| 5 | ORDER-05 | I-1, I-14 + 0.8.3 release 빌드·이 버전에서 바뀐 화면 측정 | 바꾸지 않음 |

- 앱 버전 0.8.2 → 0.8.3은 ORDER-01 3.1에서 바꾼다. README 실행 절·`docs/BUILD.md`·release 빌드는 ORDER-05에서 0.8.3 기준으로 한다.
- 보안 설정은 v0.8.2 끝(`d8f9438`)과 같게 둔다. v0.8.3에는 이를 허락하는 카드가 없다.
