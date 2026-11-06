[DONE] ORDER-01-R1 tauri

## 완료 기준
| 번호 | 기준 | 결과 | 근거 |
|---|---|---|---|
| 1 | 갈래 지침에 core ITEMS와 부딪치는 문장이 없다 | 충족 | 아래 "고친 문장". 루트 `INTENT.md`·`AGENTS.md`의 부딪치는 문장에 예외(core D-12)를 붙였다. `docs/refs/` 출발 문서는 아래 리더 결정으로 덮었다. C-02 항목 1 PASS |
| 2 | "core ITEMS 우선(core D-12)" 문장 | 충족 | `AGENTS.md` 레포 규칙 "**core ITEMS 우선**" 줄 |
| 3 | v0.5 SPEC·PLAN에 I-2·I-22 충돌 "미정"이 없다 | 충족 | `specs/v0.5/SPEC.md` R-2·R-22, `specs/v0.5/PLAN.md` Phase 6·8, `specs/v0.5/INTENT.md` 제외 범위. C-02 항목 3 PASS |
| 4 | 이 보고 파일 | 충족 | `D:\projects\workbench-tauri\specs\v0.5\reports\ORDER-01-R1.md` |

## 고친 문장
| 파일 | 고치기 전 | 고친 뒤 | 대응 I-n |
|---|---|---|---|
| `INTENT.md` 다루지 않는 것 | 프로젝트 전체 검색, 설정 UI 화면, 업데이트 확인, 오른쪽·하단 Dock. | (같은 문장) + "단, core v0.5 ITEMS I-2(Settings·Panel Layout)·I-22(검색·진단 버튼)는 예외(core D-12)." | I-2, I-22 |
| `INTENT.md` 다루지 않는 것 | 화면을 추가하는 확장, 온라인 확장 목록. | (같은 문장) + "단, core v0.5 ITEMS I-2(Extensions)는 예외(core D-12)." | I-2 |
| `AGENTS.md` 레포 규칙 | (없음) | 추가: "**core ITEMS 우선** — workbench-core v0.5 ITEMS(I-1~I-23)가 이 레포 지침(docs/refs/ 출발 문서 `03-tauri/README.md`·`README.md` 포함)보다 우선한다 (core D-12, 사용자 2026-11-06)." | I-1~I-23 |
| `AGENTS.md` 3장 | …`spec/zed-metrics.toml`의 항목 ID로 참조한다. 수치의 기준은 이 toml 하나다. | (같은 문장) + "단, core v0.5 ITEMS I-6(창 1440×852·최소 360×240)·I-14(글꼴 표)가 직접 정한 값은 예외(core D-12)." | I-6, I-14 |
| `AGENTS.md` 5장 | Zed 확장 파일은 프로젝트로 복사하지 않고 커스텀 스킴으로 읽는다. | (같은 문장) + "단, core v0.5 ITEMS I-3·I-4(core D-8)와 I-1·I-18(core D-9)은 예외(core D-12)." | I-1, I-3, I-4, I-18 |
| `AGENTS.md` 5장 | 의존성은 `docs/refs/03-tauri/README.md` 3.1·3.2 목록 안에서만 고른다. | (같은 문장) + "단, core v0.5 ITEMS I-n(예: I-22 진단) 구현에 목록 밖 의존성이 필요하면 예외(core D-12)이고, 승인은 9장대로 받는다." | I-22 |
| `specs/v0.5/INTENT.md` 제외 범위 | I-2·I-22와 루트 INTENT가 부딪치는 부분: 미정(사람이 정한다) | "core ITEMS가 우선하므로(core D-12) 제외하지 않고 SPEC R-2·R-22로 둔다." | I-2, I-22 |
| `specs/v0.5/SPEC.md` R-2 | 미정: 루트 INTENT "설정 UI 화면"과 부딪치는지 사람이 정한다 | 미정에서 뺌, 출처에 core D-12. Zed 화면 확인 미정 1건은 남김(충돌과 무관) | I-2 |
| `specs/v0.5/SPEC.md` R-22 | 미정: 검색·진단 기능 없음, `[BLOCKED]` 여부를 사람이 정한다 | 미정 삭제, 출처 core D-12, "범위에서 빼지 않고, Phase 8에서 막히면 그때 `[BLOCKED]`" | I-22 |
| `specs/v0.5/PLAN.md` Phase 6 | 완료 조건 "R-2 미정(Settings와 루트 INTENT)이 사람의 판단으로 정해져 있다" | 삭제 | I-2 |
| `specs/v0.5/PLAN.md` Phase 8 | 완료 조건 "R-22 미정이 사람의 판단으로 정해져 있다" | "진단(R-22, I-22)은 범위에서 빼지 않는다. 구현이 막히면 이 Phase에서 그때 `[BLOCKED]`로 이유를 보고와 PROGRESS에 남긴다(core D-12)" | I-22 |
| `specs/v0.5/DECISIONS.md` | core 결정 표에 D-12 없음 | D-12 행 추가 | 전체 |

### 고치지 않은 것
- `docs/refs/03-tauri/README.md` 1절, `docs/refs/README.md` 1·3절: 프로젝트 전체 검색·Settings UI·온라인 확장 목록 제외, Catppuccin 내장, Zed 아이콘 라이선스 문장(I-1·I-2·I-3·I-4·I-22). **리더 결정**: v0.5 HERDR-SETUP 소유권상 `docs/refs/`는 아무도 고치지 않는 출발 문서라 원문을 두고, AGENTS "core ITEMS 우선" 줄에 docs/refs 출발 문서도 포함한다고 밝혀 덮었다. C-02 항목 5에서 충분하다고 판정했다.
- `docs/refs/01-zed/04-APP-SPEC.md`(A-05.6·A-05.8·A-18.3·A-18.12·A-31.14 등): Zed 원문 실측이다. 지침이 아니어서 고치지 않았다.
- `spec/INDEX.md` 91행 "넣지 않는 것: … Git/LSP 배지 …"(I-22): `spec/`의 원본은 workbench-gpui다(D-7). 그쪽에서 판단할 일로 남긴다.
- `src/spec/metrics.ts` 212행 주석 "Lilex is out of scope (INTENT)."(I-14): 앱 코드다. Phase 3에서 coder가 고친다.

## 바꾼 파일
- `INTENT.md`, `AGENTS.md`, `specs/v0.5/INTENT.md`·`DECISIONS.md`·`SPEC.md`·`PLAN.md`·`PROGRESS.md`, `specs/v0.5/reports/ORDER-01-R1.md`
- 커밋: `git log -1 -- specs/v0.5/reports/ORDER-01-R1.md` (push 안 함)

## 검토
- C-02 (tauri-checker, agy): 항목 1~5 모두 PASS, 최종 PASS. writer가 "부딪치지 않는다"고 본 문장(터미널 등 편집 외 기능, 로그인·협업, 쓰지 않는 기능의 아이콘, 재구현·Zed 코드 복사 금지)의 판단도 타당하다고 봤다.

## BLOCKED
없음
