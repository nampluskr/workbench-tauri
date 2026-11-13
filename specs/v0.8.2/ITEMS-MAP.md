> 버전: v0.8.2 · 작성일: 2026-11-13 · 상태: 초안
>
> core v0.8.2 ITEMS의 항목(I-1~I-26, I-4·I-5는 거둠, 살아 있는 항목 24개)과 tauri 작업의 대응이다. 요구·정한 것·판정 방법의 원본은 core `D:\projects\workbench-core\specs\v0.8.2\ITEMS.md`, Phase 나눔은 core `specs/v0.8.2/PLAN.md`의 "Phase와 카드"·"그룹과 Phase" 표와 ORDER-01 2절이다(읽기만 한다). core Phase n의 지시 카드는 core `specs/v0.8.2/orders/ORDER-<nn>.md`다. 실제로 한 일과 검증은 `PROGRESS.md`에, 에이전트 운영은 `HERDR-SETUP.md`에 있다. tauri 카드는 core 카드를 받은 뒤 채운다.

# ITEMS-MAP — workbench-tauri v0.8.2

## 1. 대응 표

- core Phase = ORDER 번호다. 두 Phase에 걸친 항목은 앞 Phase가 마크다운·ipynb(또는 편집 탭) 부분, 뒤 Phase가 HTML 미리보기 부분이다(core PLAN "그룹과 Phase").
- 상태: 진행 중 · 대기(카드 받기 전) · 충족(leader-core 판정 뒤) · 거둠.

| I-n | 제목 | 그룹 | core Phase | tauri 카드 | 상태 |
|---|---|---|---|---|---|
| I-1 | 상태 표시줄 버튼의 켜짐 표시 | G-1 | 5 | ORDER-05 | 구현·테스트 충족, 화면(켜진 칸 계산값)은 Phase 7 |
| I-2 | 상태 표시줄에 영역별 다크/라이트 버튼 3개 | G-1 | 5 | ORDER-05 | 구현·테스트 충족, 화면은 Phase 7 |
| I-3 | 빈 화면 안내 | G-1 | 5 | ORDER-05 | 구현·테스트 충족, 화면은 Phase 7 |
| I-4 | 분할된 pane 사이 구분선이 보이지 않음 | G-1 | — | — | 거둠 |
| I-5 | Outline 키보드 이동 | G-2 | — | — | 거둠 |
| I-6 | HTML의 Outline을 제목 계층으로 | G-2 | 4 · 7 (편집 탭 4, HTML 미리보기 탭 7) | ORDER-04 | 편집 탭 구현·테스트 충족, 화면은 Phase 7. HTML 미리보기 탭은 ORDER-07 |
| I-7 | 클릭한 위치를 Outline에 표시 — 미리보기 포함 | G-2 | 4 · 7 (에디터·마크다운·ipynb 4, HTML 미리보기 7) | ORDER-04 | 에디터·마크다운·ipynb 구현·테스트 충족, 화면은 Phase 7. HTML 미리보기는 ORDER-07 |
| I-8 | 제목 앞 표시: 아이콘 방식과 숫자 방식 | G-2 | 4 | ORDER-04 | 구현·테스트 충족 |
| I-9 | Outline 우클릭 메뉴 | G-2 | 4 | ORDER-04 | 구현 충족(코드 확인), 화면은 Phase 7 |
| I-10 | 처음 열 때 2단계까지만 펼침 | G-2 | 4 | ORDER-04 | 구현·테스트 충족 |
| I-11 | 단계별 제목 색 — Outline과 미리보기 제목 | G-2 | 4 · 6 (Outline·마크다운·ipynb 4, HTML 제목 6) | ORDER-04 · ORDER-06 | Outline·마크다운·ipynb 구현·테스트 충족(ORDER-04), HTML 미리보기 제목 색 구현·테스트 충족(ORDER-06), 화면은 Phase 7 |
| I-12 | 탭을 오갈 때 스크롤 위치 기억 — 편집 탭과 미리보기 탭 | G-3 | 1 | ORDER-01 | 충족(남은 두 경우는 I-27에서 측정 오류로 밝혀짐) |
| I-13 | 줄 번호를 껐을 때 에디터 왼쪽 여백 | G-3 | 2 | ORDER-02 | 구현·테스트 충족, 화면은 Phase 7 |
| I-14 | 공통 원칙: md·ipynb·HTML 미리보기를 같은 모양으로 | G-4 | 6 | ORDER-06 | 구현·테스트 충족(같은 출처는 코드 근거), 화면(계산값)은 Phase 7 |
| I-15 | 왼쪽 여백과 노트북 실행 번호 | G-4 | 2 · 6 (마크다운·ipynb 2, HTML 6) | ORDER-02 · ORDER-06 | 마크다운·ipynb(ORDER-02)·HTML(ORDER-06) 구현·테스트 충족, 화면은 Phase 7 |
| I-16 | 표를 본문 너비에 꽉 차게 | G-4 | 2 · 6 (마크다운·ipynb 2, HTML 6) | ORDER-02 · ORDER-06 | 마크다운·ipynb(ORDER-02)·HTML(ORDER-06) 구현·테스트 충족, 화면은 Phase 7 |
| I-17 | 코드·결과창·표의 기본 크기를 12px로 | G-4 | 2 · 6 (마크다운·ipynb 2, HTML 6) | ORDER-02 · ORDER-06 | 마크다운·ipynb(ORDER-02)·HTML(ORDER-06) 구현·테스트 충족, 화면은 Phase 7 |
| I-18 | 미리보기 섹션 접기·펼치기 | G-4 | 4 | ORDER-04 | 구현·테스트 충족, 화면은 Phase 7 |
| I-19 | 미리보기 `Ctrl`+`+`/`-`로 글자 크기 바꾸기 — md·ipynb·HTML 모두 | G-4 | 7 | 미정 | 대기 |
| I-20 | 미리보기의 로컬 문서 링크는 어디서든 미리보기로 | G-4 | 3 | ORDER-03 | 구현·테스트 충족, 화면은 Phase 7 |
| I-21 | 코드 블록 줄 간격 설정 | G-5 | 2 · 6 (마크다운·ipynb 2, HTML 6) | ORDER-02 · ORDER-06 | 마크다운·ipynb(ORDER-02)·HTML(ORDER-06) 구현·테스트 충족, 화면은 Phase 7 |
| I-22 | 코드 블록 앞뒤 빈 줄 숨김 | G-5 | 2 | ORDER-02 | 구현·테스트 충족, 화면은 Phase 7 |
| I-23 | 미리보기 코드 줄 번호 설정 | G-5 | 2 · 6 (마크다운·ipynb 2, HTML 6) | ORDER-02 · ORDER-06 | 마크다운·ipynb(ORDER-02)·HTML(ORDER-06) 구현·테스트 충족, 화면은 Phase 7 |
| I-24 | 마크다운·노트북 본문 안의 HTML 태그를 HTML로 그림 | G-5 | 3 | ORDER-03 | 구현·테스트 충족, 화면은 Phase 7 |
| I-25 | 미리보기 찾기를 HTML에도 — md·ipynb·HTML 모두 `Ctrl+F` | G-4 | 7 | 미정 | 대기 |
| I-26 | 에디터·미리보기 기본 글자 크기를 14px로 | G-3 | 1 | ORDER-01 | 충족 |
| I-27 | 탭 스크롤 위치 — 남은 두 경우 | G-3 | 2 (ORDER-02 8절) | ORDER-02 | 충족 — 측정 오류, 앱 코드 변경 없음 |

## 2. Phase별 묶음

| core Phase | 카드 | 항목 | 보안 설정 (core COMMON 3절) |
|---|---|---|---|
| 1 | ORDER-01 | v0.8.2 시작, I-26, I-12 | 바꾸지 않음 |
| 2 | ORDER-02 | I-15, I-13, I-16, I-17, I-21, I-22, I-23 | 바꾸지 않음 |
| 3 | ORDER-03 | I-24, I-20 | I-24 본문 HTML 정화 규칙을 새로 둠(앱 CSP는 그대로) |
| 4 | ORDER-04 | I-6(편집 탭), I-7(ipynb), I-8, I-9, I-10, I-11, I-18 | 바꾸지 않음 |
| 5 | ORDER-05 | I-1, I-2, I-3 | 바꾸지 않음 |
| 6 | ORDER-06 | I-14, I-11·I-15·I-16·I-17·I-21·I-23의 HTML 부분 | 이 카드에서만, HTML 미리보기 프레임 쪽 |
| 7 | ORDER-07 | I-6·I-7의 HTML 부분, I-19, I-25 + 0.8.2 release 빌드·전체 회귀 | 이 카드에서만, 앱↔프레임 전달 |

- 앱 버전 0.8.1 → 0.8.2는 ORDER-01 3.1에서 바꾼다. README 실행 절·`docs/BUILD.md`·release 빌드는 ORDER-07에서 0.8.2 기준으로 한다.
