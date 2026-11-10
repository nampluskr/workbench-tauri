> 버전: v0.7 · 작성일: 2026-11-10 · 상태: 초안
>
> workbench-core v0.7 ITEMS의 I-1~I-13을 어떤 Phase 순서로 반영할지 적는 I-n 대응 문서다. v0.7은 INTENT·DECISIONS·SPEC을 쓰지 않는다(tauri-leader 결정 2026-11-10). 요구·결정·판정 방법은 core `specs/v0.7/ITEMS.md`의 "정한 것"과 "판정 방법"을, Phase 순서와 이유는 core `specs/v0.7/PLAN.md`를, 카드 공통 규칙은 core `specs/v0.7/orders/COMMON.md`를 따른다. 에이전트 운영은 `HERDR-SETUP.md`에, 실제 진행은 `PROGRESS.md`에, core 보고는 `specs/v0.7/reports/`에 있다.

# PLAN — workbench-tauri v0.7

## 읽는 법

- 요구 번호는 따로 매기지 않는다. core ITEMS의 `I-n`을 그대로 쓴다(R-n 없음). `G-n`은 core ITEMS의 그룹이다.
- 이 레포의 Phase 번호는 core Phase 번호와 같다. Phase n은 core 카드 `ORDER-<nn>`(두 자리)을 받아 진행하고, 같은 Phase 안의 재지시는 `ORDER-<nn>-R<n>`이다.
- 판정 방법은 core ITEMS 그대로이고 여기에 옮기지 않는다.
- 한 Phase 안의 작업 카드 나눔은 `tauri-leader`가 정한다.

## Phase 대응 표

| 이 레포 Phase | core Phase (카드) | 그룹 | core 항목 |
|---|---|---|---|
| Phase 1 — v0.7 시작, Settings 분류와 글꼴 크기 셋 | Phase 1 (ORDER-01) | G-3 · G-1 | v0.7 시작 · I-4 · I-2 · I-1 |
| Phase 2 — 테마 셋 | Phase 2 (ORDER-02) | G-2 | I-3 |
| Phase 3 — 편집 보기 | Phase 3 (ORDER-03) | G-4 | I-5 · I-6 · I-7 · I-8 · I-10 |
| Phase 4 — 미리보기 줄간격 | Phase 4 (ORDER-04) | G-5 | I-9 · I-14 |
| Phase 5 — 작은 항목과 v0.6 정리 | Phase 5 (ORDER-05) | G-6 | I-11 · I-12 · I-13 · v0.6 정리 · I-9 맞추기 · 0.7.0 빌드 |

### Phase 1 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| W-01 | v0.7 문서(PLAN·HERDR-SETUP·PROGRESS, `reports/`·`verify/`)와 루트 `AGENTS.md` | v0.7 시작 |
| K-01 | 앱 버전 0.7.0, Settings 분류, 글꼴 크기 셋, `Ctrl+=` 따로 | v0.7 시작 · I-4 · I-2 · I-1 |
| C-01 | 검토·V3 | v0.7 시작 · I-4 · I-2 · I-1 |

### Phase 2 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| W-03 | 루트 `AGENTS.md` 레포 규칙 10·12줄을 v0.7로(ORDER-02 3A) | ORDER-02 3A |
| K-02 | 테마 셋(UI·편집·미리보기), 새 키 `editor_theme`·`preview_theme`, Settings Theme 행, 선택 창 셋 함께 | I-3 |
| C-03 | W-03·K-02 검토와 커밋 전 전체 검증 | ORDER-02 3A · I-3 |
| C-04 | V3 결과 판정 | I-3 |
| W-04 | ORDER-02 PROGRESS 기록 | I-3 |

### Phase 3 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| K-03 | 편집 설정 다섯(줄간격·줄 번호·줄바꿈·들여쓰기 안내선·공백 보이기), 단축키 `Ctrl+Alt+L`·`Alt+Z` | I-5 · I-6 · I-7 · I-8 · I-10 |
| C-05 | K-03 검토와 커밋 전 전체 검증 | I-5 · I-6 · I-7 · I-8 · I-10 |
| C-06 | V3 결과 판정 | I-5 · I-6 · I-7 · I-8 · I-10 |
| W-05 | ORDER-03 PROGRESS·PLAN 기록 | I-5 · I-6 · I-7 · I-8 · I-10 |

### Phase 4 작업 카드

core ORDER-04가 I-14(One 테마 안내선 색)를 이 Phase에 넣었다.

| 카드 | 할 일 | core 항목 |
|---|---|---|
| K-04 | 미리보기 줄간격 설정 넷(px 고정), One Dark·One Light 안내선 색 | I-9 · I-14 |
| C-07 | K-04 검토와 커밋 전 전체 검증 | I-9 · I-14 |
| C-08 | V3 결과 판정 | I-9 · I-14 |
| W-06 | ORDER-04 PROGRESS·PLAN 기록 | I-9 · I-14 |

### Phase 5 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| K-05 | 선택 안 찾기 강조, 돋보기 툴팁 "Find", 메뉴 Paste 권한 창 없애기, 문단 사이 간격 맞추기, checker 허용 목록 | I-11 · I-12 · I-13 · I-9 맞추기 · v0.6 정리 |
| C-09 | K-05 검토와 커밋 전 전체 검증 | I-11 · I-12 · I-13 · I-9 맞추기 |
| K-06 | release 0.7.0 빌드와 `docs/BUILD.md` 갱신 | 0.7.0 빌드 |
| C-10 | V3 결과 판정 | I-11 · I-12 · I-13 · I-9 맞추기 |
| W-07 | ORDER-05 PROGRESS·PLAN 기록 | I-11 · I-12 · I-13 · I-9 맞추기 · 0.7.0 빌드 |
