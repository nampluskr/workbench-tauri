# Phase 2 SPEC R-7 재판정 보고서

- 작성: wt-checker (wC)
- 일시: 2026-11-01
- 대상: SPEC R-7 (키맵 규칙 엔진이 Zed의 충돌·해제·연속 키 규칙대로 평가)
- 앞선 판정: `specs/v0.1/verify/phase2/REPORT.md` R-7 절 (I-703 불충족: 깊은 `null`이 얕은 바인딩을 해제하지 않음)
- 재판정 사유: 엔진 `src/keymap/engine.ts`와 테스트가 Zed 동작(가장 앞선 `null`이 깊이가 얕아도 그보다 낮은 우선순위의 같은 키 후보를 모두 해제, 얕은 `null`은 깊은 바인딩을 해제 불가)으로 수정됨

---

## 1. 테스트 실행 및 재현 검증 결과 요약

1. **자동 단위 테스트 실행** (`node --test src/keymap/engine.test.ts`):
   - 실행 결과: **19/19 통과** (`ℹ tests 19`, `ℹ pass 19`, `ℹ fail 0`, 소요 시간 149.1ms)
   - 증거 파일: `specs/v0.1/verify/phase2/r7-test-keymap-rerun.txt`

2. **I-703 probe 재현 실행** (`node specs/v0.1/verify/phase2/r7-i703-probe.mts`):
   - 실행 결과:
     - Case 1: `Editor null (base) + Workspace binding (default), focus path Workspace>Pane>Editor` → `{"kind":"none"}` (깊은 `null`이 얕은 바인딩을 해제함)
     - Case 2: `Workspace null (base) + Editor binding (default)` → `{"kind":"action","action":"editor::Act",...}` (얕은 `null`은 깊은 바인딩을 해제하지 못함)
   - 증거 파일: `specs/v0.1/verify/phase2/r7-i703-probe-rerun.out.txt`

---

## 2. 규칙별 판정표

| SPEC 규칙 | 테스트 이름 | 결과 (통과/전체) | 판정 |
| --- | --- | --- | --- |
| **I-702 깊은 컨텍스트가 이긴다** | `I-702: deeper matching context wins (Editor > Pane > Workspace)` | 통과 (1/1) | 충족 |
| **I-702 깊이가 같으면 나중 등록** | `I-702: equal depth -> the binding registered later wins` | 통과 (1/1) | 충족 |
| **I-702 컨텍스트 없음 = 가장 깊음** | `I-702: a binding without context counts as the deepest` | 통과 (1/1) | 충족 |
| **I-702 조건식이 길다고 우선하지 않음** | `I-702: a longer condition does not take priority by itself` | 통과 (1/1) | 충족 |
| **I-703 `null`은 낮은 우선순위 후보를 해제** (깊은 `null`이 얕은 바인딩 해제 포함) | `I-703: null disables lower-priority candidates in that context`<br>`I-703: a deeper null disables a shallower binding of the same key`<br>`I-703: a deeper null also disables a shallower binding registered later` | 통과 (3/3) | 충족 |
| **I-703 얕은 `null`은 깊은 바인딩을 해제하지 못함** | `I-703: a shallower null cannot disable a deeper binding` | 통과 (1/1) | 충족 |
| **I-703 덧씌움의 `null`은 사용자 설정을 지우지 않음** | `I-703: the overlay's null does not remove the user's binding` | 통과 (1/1) | 충족 |
| **I-703 출처 등급 사용자 > 덧씌움 > 기본, 깊이·순서와 섞지 않음** | `I-703: source rank user > base > default applies to null only` | 통과 (1/1) | 충족 |
| **I-001 `Ctrl+K V`는 따로 누른 연속 키** | `I-001: 'ctrl-k v' is Ctrl+K then V pressed separately`<br>`I-001: a non-continuing key ends the chord and is handled alone` | 통과 (2/2) | 충족 |
| **I-704 액션 인수까지 같은 바인딩** | `I-704: displayed key requires the same action and the same arguments`<br>`I-704: argument objects compare structurally (key order ignored)` | 통과 (2/2) | 충족 |
| **I-704 다른 액션에 가려진 키는 뺀다** | `I-704: keys shadowed by another action in this context are dropped`<br>`I-704: a chord whose prefix runs another action here is not shown` | 통과 (2/2) | 충족 |
| **I-704 남은 후보 중 마지막** | `I-704: among the remaining candidates the last binding is shown` | 통과 (1/1) | 충족 |
| **(보조) `null`로 푼 연속 키 및 키 입력 정규화** | `I-703 + I-001: a chord unbound with null is not a pending prefix`<br>`keystrokes normalize modifiers and read DOM events by code` | 통과 (2/2) | 충족 |

---

## 3. I-703 해소 검증 상세

- **이전 문제점**: `src/keymap/engine.ts`가 같은 깊이에서만 `null`을 평가하여 깊은 컨텍스트(`Editor`)의 `null`이 얕은 컨텍스트(`Workspace`)의 바인딩을 끄지 못했음 (`r7-i703-probe.out.txt`에서 `workspace::Act` 실행).
- **수정 및 확인 내용**:
  - `engine.ts`의 `candidates()` 정렬 순서(깊이 우선 → 나중 등록 순)대로 후보를 순회하면서, `null`을 만나면 해당 출처 등급 이하의 낮은 우선순위 후보를 깊이와 무관하게 건너뛰도록 수정됨.
  - 재현 probe(`r7-i703-probe-rerun.out.txt`) 결과:
    1. `Editor null (base)` + `Workspace binding (default)` 상태에서 포커스 경로가 `Workspace > Pane > Editor`일 때 결과가 `none`으로 올바르게 비활성화됨.
    2. 반대로 `Workspace null (base)` + `Editor binding (default)`인 경우 얕은 `null`이 깊은 바인딩을 끄지 못하고 `editor::Act`가 정상 실행됨.
  - 관련 단위 테스트 3건(`a deeper null disables a shallower binding...`, `a deeper null also disables a shallower binding registered later`, `a shallower null cannot disable a deeper binding`)이 모두 추가되어 통과함을 확인.

---

## 4. R-7 종합 판정

- 자동 테스트 통과율: **19/19 (100%)**
- 재현 probe 검증: Zed 동작(깊은 `null`이 얕은 바인딩 해제, 얕은 `null`은 깊은 바인딩 유지)과 일치 확인.

**R-7 종합: 충족.**
