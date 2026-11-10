> 버전: v0.8 · 작성일: 2026-11-10 · 상태: 초안
>
> workbench-core v0.8 ITEMS의 I-1~I-10과 공통 결정 M-1~M-11을 어떤 Phase 순서로 반영할지 적는 I-n 대응 문서다. v0.8은 INTENT·DECISIONS·SPEC을 쓰지 않는다(v0.7과 같음, core ITEMS 머리말). 요구·결정·판정 방법은 core `specs/v0.8/ITEMS.md`의 "정한 것"·"공통 결정"과 각 카드의 "완료 기준"을, Phase 순서와 이유는 core `specs/v0.8/PLAN.md`를, 카드 공통 규칙은 core `specs/v0.8/orders/COMMON.md`를 따른다. 에이전트 운영은 `HERDR-SETUP.md`에, 실제 진행은 `PROGRESS.md`에, core 보고는 `specs/v0.8/reports/`에 있다.

# PLAN — workbench-tauri v0.8

## 읽는 법

- 요구 번호는 따로 매기지 않는다. core ITEMS의 `I-n`·`M-n`을 그대로 쓴다(R-n 없음). `G-n`은 core ITEMS의 그룹이다.
- 이 레포의 Phase 번호는 core Phase 번호와 같다. Phase n은 core 카드 `ORDER-<nn>`(두 자리)을 받아 진행하고, 같은 Phase 안의 재지시는 `ORDER-<nn>-R<n>`이다.
- 판정 방법은 core ITEMS와 카드 4절 그대로이고 여기에 옮기지 않는다.
- 한 Phase 안의 작업 카드 나눔은 `tauri-leader`가 정한다.

## Phase 대응 표

| 이 레포 Phase | core Phase (카드) | 그룹 | core 항목 |
|---|---|---|---|
| Phase 1 — v0.8 시작, 미리보기 공통과 CSV·TSV 표 | Phase 1 (ORDER-01) | G-1 · G-4 | v0.8 시작(앱 버전 0.8.0) · 미리보기 공통(M-2·M-5·M-6·M-7) · I-10 · I-7 |
| Phase 2 — asset protocol·CSP, 이미지·PDF·마크다운 이미지·SVG | Phase 2 (ORDER-02) | G-3 | M-8·M-9 실측 · I-8 · I-9 · I-3 · I-6 |
| Phase 3 — HTML 미리보기 | Phase 3 (ORDER-03) | G-3 | I-1 |
| Phase 4 — ipynb 미리보기 | Phase 4 (ORDER-04) | G-2 | I-2 |
| Phase 5 — 수식·Mermaid, Licenses, 0.8.0 release 빌드 | Phase 5 (ORDER-05) | G-5 | I-4 · I-5 · Licenses 갱신 · 0.8.0 빌드·`docs/BUILD.md` |

- 보안 설정(CSP·asset protocol·capability)은 Phase 1·4에서 바꾸지 않는다. Phase 2에서 바꾸고, Phase 3·5는 필요하면 바꾼다(core PLAN, M-8·M-9).
- 사용자 확인은 Phase 5 뒤 한 번이다(core PLAN). tauri는 V4를 하지 않는다.

### Phase 1 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| W-01 | v0.8 문서(PLAN·HERDR-SETUP·PROGRESS, `reports/`·`verify/`)와 루트 `AGENTS.md`, core 리더 이름 `leader-core` | v0.8 시작 |
| K-01 | 미리보기 대상 판별 한 곳(`.md`·`.markdown`·`.csv`·`.tsv`), 열기 방식과 화면 이름 일반화, I-10 `eye` 아이콘, I-7 CSV·TSV 표, 앱 버전 0.8.0 | v0.8 시작 · M-2 · M-5 · M-6 · M-7 · I-10 · I-7 |
| C-01 | 검토·V3 | v0.8 시작 · M-2 · M-5 · M-6 · M-7 · I-10 · I-7 |
