[DONE] ORDER-10 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| 1 I-21 폭 | Zed 사이드바와 1px 이내 | 충족(이미 같음) | Zed 300(오른쪽 선 x 299, `zed-sb-open.png`) = tauri 300(`tauri-v3-two.json`). Zed 소스 기본 `threads_sidebar.default_width` 300(default.json 1195), 최소 200·최대 800. core가 앞서 본 약 220은 이 조건(`zed -n` 새 창, 사용자 설정에 폭 없음)에서 나오지 않았다. |
| 1 I-21 줄·여백 | 높이·안쪽 여백 | 충족 | 줄 높이 31(Zed y 33~63 = tauri 33~63), 왼 8 + 테두리 1 → 내용 시작 x 9(Zed 이름 잉크 x 9, tauri 아이콘 칸 x 9) |
| 1 I-21 아이콘과 이름 간격 | 1px 이내 | 충족(소스 기준) | Zed 묶음 머리에는 앞 아이콘이 없어, 사이드바에서 이름 앞에 아이콘이 있는 줄(스레드 줄, thread_item.rs 291·461)을 따랐다: 아이콘 칸 16(아이콘 14 가운데) + 간격 6. tauri 아이콘 칸 x 9~25, 이름 x 31. 지금까지 간격 0 → 6. |
| 1 I-21 선택 표시 | 배경·윤곽선·색이 같은 테마 토큰 | 충족 | 현재 폴더: 글자 `text`, 나머지 `text.muted`, **배경 없음**(Zed 현재 묶음과 같음, 지금까지의 ghost_element_selected 배경 제거). 키보드 선택(목록 포커스 + 커서 줄): 테두리 `panel.focused_border` 1px(오른쪽 2px) Zed #2870bd = tauri #2870bd(`zed-sb-down.png` / `tauri-two-focused.png`). hover `ghost_element_hover` #363c46 = #363c46. 둘째 줄부터 위 1px `border` 선(Zed 소스 sidebar.rs 2297-2299, Zed는 묶음 하나라 캡처 없음, tauri y 64). |
| 1 글자 크기 | 같음 | 충족 | 이름 잉크 폭 Zed 120 / tauri 119(`workbench-tauri`) |
| 1 검색칸 없음 | 없음 | 충족(이미 같음) | Zed에는 "Search threads…" 칸이 있으나 사용자 결정대로 두지 않음(tauri `search: false`) |
| 1 아래쪽 줄 | Zed 아래쪽 줄과 같음 | 충족(이미 같음) | 위 선 y 821, 안쪽 4·간격 4, 토글 왼쪽(Zed 잉크 x 9~20 / tauri svg 8~22), Add Project 오른쪽 끝(Zed 278~290 / tauri 277~291). Zed의 Thread History(시계) 버튼은 기능이 없어 두지 않음(내용 불변). |
| 2 내용·순서·동작 | V1 테스트 그대로 | 충족 | `src/shell/Sidebar.tsx` 변경 없음(checker 확인). 바뀐 것은 CSS·테마 토큰뿐 |
| 3 두 갈래 치수 표 | 같음 | tauri 표 작성 | SPEC R-21 1334행(Zed 확인·치수 표 12행), gpui가 읽어 씀 |
| 4 앞 Phase | 결과 유지 | 충족 | npm test 197/197, cargo test 25, clippy 0(checker C-27 PASS) |

- 공통 조건: 1920×1080, 배율 100%, 클라이언트 1440×852, One Dark. Zed는 `zed -n` 새 창 1개(폴더 workbench-tauri, Ctrl-Alt-J로 열고 마지막에 다시 닫아 처음 상태로, 그 창만 WM_CLOSE). 스레드·AI 사용 없음, 파일 편집·저장 없음. tauri는 폴더 둘(workbench-tauri, workbench-core 읽기만) 시험 데이터로 1회 실행, 띄운 PID만 닫음, 앱 데이터 복원 차이 0.
- 캡처: `specs/v0.5/verify/ORDER-10/` (zed-start·sb-open·sb-down·sb-hover·sb-end.png, tauri-two-idle·hover·focused.png, tauri-v3-two.json).

## Zed 확인 (tauri가 먼저 확인해 SPEC에 적음 — gpui 읽기용)
- 위치: `specs/v0.5/SPEC.md` R-21 1334행(치수 표), 1365행(구현).
- 폴더 한 줄은 Zed "프로젝트 묶음 머리"(sidebar.rs render_project_header 2331~)에 맞췄다: 높이 31, `pl_2 pr_1p5 border_1 border_r_2`, 현재 묶음은 글자색만, 선택은 포커스 때 테두리.
- panel.focused_border: One Dark에 값이 없어(null) Zed 기본값(default_colors.rs 252 dark blue step 8)을 쓰며 실측 #2870bd. **라이트 테마 기본값은 정하지 않았다**(tauri는 그때 border.focused를 씀) — core 확인 요청(SPEC 1363행).

## gpui 등록 요청 (toml에 없는 값)
- SPEC R-21 1353행 표: `sidebar.item.border_right_width` 2, `sidebar.item.separator_width` 1, `sidebar.item.icon_slot_size` 16, `sidebar.item.icon_gap` 6, panel.focused_border 다크 기본 #2870bd. 지금은 `src/spec/metrics.ts`·`src/theme/theme.ts`의 임시 값(Zed 근거 주석).

## core 확인 요청
- gpui가 올린 `tab.scroll.wheel_step` 80(spec/ 사본은 K-45로 동기화)과 tauri 지금 값(Zed 소스 3줄×줄 높이 ≈ 77.7, ORDER-09 V3 78) 중 무엇을 쓸지. 지금은 바꾸지 않았다.

## 남은 차이
- 줄 사이 선은 Zed에서 묶음이 둘 이상일 때만 생겨 이번 Zed 캡처로는 확인하지 못했다(소스 기준).
- 누름(ghost_element_active) 색은 소스 기준, 실측 안 함.

## ORDER-10-R1 (core 재확인, 2026-11-07)
- 정정: 위 표 "글자 크기" 행의 Zed 이름 잉크 폭 120은 틀렸다. 그 값은 포커스 때만 보이는 접기 화살표(x 121~128)를 포함한 `zed-sb-down.png`에서 쟀다. 포커스 없는 `zed-sb-open.png`에서 다시 재면 `workbench-tauri` 잉크 x 9~112 = **104px**(y 44~53)로 core·gpui 측정과 같다. 그때 tauri는 x 31~149 = 119px였다(글자 16px).
- 고침(K-51, e6db40d): 폴더 이름 글자를 Zed `Label` 기본 크기 `TextSize::Default` 14px로(Zed `crates/ui/src/styles/typography.rs` 139·152, sidebar.rs 2377~ Label 크기 지정 없음). toml에 같은 뜻 ID가 없어 `src/spec/metrics.ts` 임시 `sidebar.item.font_size` 14(gpui 등록 요청).
- V3(ORDER-11 tauri 측정 차례에 함께, `specs/v0.5/verify/ORDER-11/tauri-sidebar.png`, `tauri-v3.json`): 계산된 글자 크기 **14px**. 그 측정의 폴더는 `syntax`라 같은 글자로 잉크 폭을 대조하지 못했다: `syntax` 잉크 x 31~71 = 41px. 같은 글자 환산은 16px 때 119px × 14/16 = 104.1px로 Zed 104px와 1px 이내다(환산값이며 같은 글자 실측은 아님).

## 운영
- coder: 19:21 Codex GPT-6.1-Sol medium으로 되돌림(사용자 지시, `/model`로 Medium 확인, HERDR-SETUP·PROGRESS 커밋 0cd7f0f). K-44·K-45는 Codex가 했다.
- 화면 차례 1회: Zed 창 1개, tauri 1회. 레포 상태: workbench-tauri에 `.zed` 없음, 새 파일은 측정 캡처뿐.
- 커밋(push 안 함): 99d36c4(spec 동기화), 3de1422(K-44·K-45), f80d615(W-31), PROGRESS 보완(W-32), 그리고 이 보고.
