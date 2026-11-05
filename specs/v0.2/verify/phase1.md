# Phase 1 끝 V3 실측 (카드 v02-M1, SPEC R-10)

## 측정 조건

- 창 논리 1440x852(`innerWidth`×`innerHeight`, CDP), 배율 100%(`devicePixelRatio` 1, 창 DPI 96), 테마 Mocha, 1920x1080 주 모니터.
- 앱: `npm.cmd run tauri build -- --debug --no-bundle`로 다시 빌드한 `src-tauri/target/debug/workbench-tauri.exe`. 처음 실행은 exe(23:30:47)가 `src/spec/metrics.ts`(23:31:02)보다 오래돼 번들에 `--tab-border-width`가 없었고, 그래서 다시 빌드했다(소스는 고치지 않음).
- 도구: `tools/measure-m1.mjs`(`cdp-lib.mjs` `launchApp` + `win-input.ps1`). 입력은 `-ProcessId`로 PID 고정, 스크립트가 매번 전경 창 확인(`fgBefore`·`fgAfter` true). 이번 실행 PID 16508, HWND 0x34F07D8.
- 앱 데이터 폴더 `%APPDATA%\workbench-tauri`는 없어서 백업·복원할 것이 없었다. 시험 폴더는 쓰지 않았다.
- 본문(`.workspace-body`) 폭 1140px, 손잡이 폭 6px. 앱은 실행 한 번이 끝나자 종료했다.

## 결과

| 스펙 ID | 기대 | 측정 | 차이 | 판정 |
|---|---|---|---|---|
| `tab.border_width` (L-63) | 탭 바 채움 영역(`.tab-bar-filler`) 아래 테두리 1px | `border-bottom` 1px solid `rgb(49, 50, 68)`(= Mocha `--border` `#313244`). 채움 아래 끝 = 탭 바 아래 끝(65) | 0 | 통과 |
| `dock.min_width` (L-31) | 손잡이를 왼쪽 끝(클라이언트 x=0)까지 끌면 Dock 폭 6px | Dock 폭 **240px**(끌기 전과 같음) | +234px | **불일치** |
| L-31 상한 | 오른쪽 끝(x=1439)까지 끌면 본문 폭 − 손잡이 = 1140 − 6 = 1134px | Dock 폭 1134px | 0 | 통과 |
| `project_panel.default_width` (L-32) | 손잡이 더블클릭 시 240px | 1134px 상태에서 더블클릭 → 240px | 0 | 통과 |

## 불일치 메모 (고치지 않음)

- 왼쪽 끝 끌기: 포인터가 Dock 왼쪽 가장자리(x=300)를 넘으면 `src/shell/dock.ts`가 `width: <음수>px` 규칙을 쓴다. CSS는 음수 `width`를 무효로 버리므로 규칙이 비고 폭이 기본 240으로 돌아가며, `min-width`(6px)가 적용될 기회가 없다. 이 원인은 코드를 읽어 추정한 것이고 따로 측정하지 않았다.
- 더블클릭 시험은 오른쪽 끝(1134px) 상태에서 했다. 최소 폭 상태에서는 왼쪽 끌기가 실패해 만들 수 없었다.
- 카드·SPEC ID 표기: 카드는 더블클릭을 L-30이라 적었으나 SPEC R-10은 L-30 = 손잡이 폭, L-32 = 기본 폭이다. 위 표는 SPEC 표기를 따랐다.

## 재측정 (카드 v02-M1-R1) — 불일치 항목만

- 앞 표의 행은 그대로 둔다. 소스는 그 사이 `src/shell/dock.ts`가 음수 폭을 0으로 잘라 쓰도록 바뀌었다(구현 담당 수정, 측정자는 고치지 않음).
- 조건은 위와 같다(1440x852, 100%, Mocha, debug 빌드를 새로 만든 뒤 1회 실행, 앱은 끝나고 종료). PID 7544, HWND 0x34074C, 입력마다 전경 확인(`fgBefore`·`fgAfter` true). 측정 스크립트는 일회성이라 측정 뒤 지웠다.
- ID 정정: 이전 카드가 더블클릭 기본 폭을 L-30이라 적은 것은 오류다. 기본 폭 `project_panel.default_width`는 L-32, L-30은 손잡이 폭 `dock.resize_handle_width`다.

| 스펙 ID | 기대 | 측정 | 차이 | 판정 |
|---|---|---|---|---|
| `dock.min_width` (L-31) | 손잡이를 왼쪽 끝(클라이언트 x=0)까지 끌면 Dock 폭 6px | Dock 폭 6px | 0 | 통과 (재측정) |
| `project_panel.default_width` (L-32) | 최소 폭(6px) 상태에서 손잡이 더블클릭 → 240px | 6px 상태(손잡이 중심 x=305)에서 더블클릭 → 240px | 0 | 통과 (재측정) |
