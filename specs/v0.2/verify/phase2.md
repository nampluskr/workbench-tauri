# Phase 2 끝 V3 실측 (카드 v02-M2, SPEC R-2 + 키 이름 인식)

## 측정 조건

- 창 논리 1440x852(`innerWidth`×`innerHeight`, CDP), 배율 100%(`devicePixelRatio` 1, 창 DPI 96), 앱 기본 테마(Mocha 지정, `body` 배경 `rgb(39, 39, 59)`은 값만 읽었고 테마 ID와 대조하지 않았다), 1920x1080 주 모니터.
- 앱: `npm.cmd run tauri build -- --debug --no-bundle`로 새로 만든 `src-tauri/target/debug/workbench-tauri.exe`(23:57:10).
- 시험마다 앱을 새로 띄워 3초 기다린 뒤 CDP로 `.toast` DOM을 읽고 종료했다. 시험 파일 5개 + 키 실행 1회 + 아래 "추가 1회"로 앱을 7번 실행했다.
- `%APPDATA%\workbench-tauri`는 **원래 없었다**(시작 전 확인). 시험 파일은 그 폴더에 한 개씩 두었다.
- 키 입력은 `tools/win-input.ps1`(SendInput) `-ProcessId`로 PID를 고정하고 입력마다 전경 창 확인(스크립트가 보내기 직전 확인, 끝난 뒤 `foreground` true). 키 실행 PID 6324, HWND 0x1700020.
- preventDefault는 CDP로 `window`에 **버블 단계** `keydown`·`contextmenu` 기록 리스너를 꽂아(앱 코드는 그대로) 앱의 캡처 단계 처리가 끝난 뒤의 `defaultPrevented`를 읽었다. 콘솔 오류는 `Runtime.exceptionThrown`·`console.error`·`Log.entryAdded(error)`를 입력 직전부터 모았다.

## R-2 알림 문구 (K-085, K-091)

| 시험 파일 | 기대 | 측정 (`.toast` 텍스트) | 판정 |
|---|---|---|---|
| (a) `ctrl-b`를 `workspace::Open`으로 덮어쓰기 | 알림 없음 | 없음 | 통과 |
| (b) `ctrl-b: null` 해제 | 알림 없음 | 없음 | 통과 |
| (c) 없는 액션 `foo::NoSuchAction` | `Action 'foo::NoSuchAction' not found` | `Action 'foo::NoSuchAction' not found` (알림 1개, 줄 1개) | 통과 |
| (d) 주석(`//`·`/* */`)·끝 쉼표·문자열 안 `//`·`/*` 포함 정상 파일 | 알림 없음 | 없음 | 통과 |
| (e) 형식이 깨진 파일(잘린 JSON) | `Failed to load keymap file` | `Failed to load keymap file` (알림 1개, 줄 1개) | 통과 |

- (a)(b)는 알림만 판정했다. 내장 액션이 아직 no-op이라 키 실행 효과는 보지 않았다.
- (d) 파일에는 `"note": "http://example.com/a // not a comment /* nor this */"`를 넣었고, 주석으로 잘못 걷었다면 (e)와 같은 알림이 떴을 것이다. 안 떴다.

## 키 이름 인식 (한 실행, 시험 파일 없음, 포커스 `BODY`)

| 입력 | 도착한 keydown (`key`/`code`) | 앱이 preventDefault | 콘솔 오류 | 판정 |
|---|---|---|---|---|
| `ctrl-alt-;` | `;` / `Semicolon`, ctrl·alt true | **아니오** (`defaultPrevented` false) | 0 | 인식은 됨(키 이름 도착), 막지 않음 |
| `ctrl-k ctrl-o` | `k`/`KeyK` ctrl, `o`/`KeyO` ctrl 순서대로 | **아니오** (둘 다 false) | 0 | 위와 같음 |
| `f10` | `F10`/`F10` | **아니오** (false) | 0 | 위와 같음 |
| `Menu` | `ContextMenu`/`ContextMenu`, 뒤이어 `contextmenu` 이벤트 | keydown 아니오(false, 내장 바인딩 없음), `contextmenu`는 **예**(true, `keyboard.ts` 전역 차단) | 0 | 브라우저 컨텍스트 메뉴는 막힘 |

- 입력 전 콘솔 오류도 0이었다.
- 알림은 키 입력 중 0개.

## 불일치·관찰 (고치지 않음)

- **`ctrl-alt-;`·`ctrl-k ctrl-o`·`f10`이 막히지 않는다.** 이 세 키의 내장 바인딩은 `Workspace` 컨텍스트 아래에 있는데(`src/keymap/builtin.ts`), 키 이벤트 대상(= `document.activeElement`)이 `BODY`이고 `data-keymap-context="Workspace"`는 `.workspace`(`src/App.tsx:23`)에만 있어 컨텍스트 스택이 비어 바인딩이 맞지 않는다. 시작 직후 상태에서 이 키들은 브라우저(WebView2)에 그대로 넘어간다. 원인은 코드를 읽은 추정이며 `.workspace` 안으로 포커스를 옮겨 다시 재지는 않았다(카드 밖). 포커스가 Workspace 안에 있을 때 막히는지는 실측 필요.
- `f10`은 막히지 않아 Windows 시스템 메뉴 모드로 들어간 흔적이 있다. 같은 실행에서 뒤이은 `Menu` 키 때 `key: " "`(`Space`) keydown이 하나 더 도착했다(도구가 보낸 키는 `Menu`뿐). 순서 때문에 생긴 것인지 가려내려고 **새로 띄운 앱에서 `Menu` 키만** 한 번 더 보냈다(추가 1회, PID 9316). 이때는 `Space` 없이 `ContextMenu` keydown과 `contextmenu`(막힘)만 왔다. 즉 위 표의 `Menu` 행은 이 단독 실행 결과이고, `Space`는 `f10` 뒤에 남은 시스템 메뉴 모드의 부산물로 보인다(추정).
- `Menu` 키 단독 바인딩은 내장 키맵에 없어 keydown은 막지 않는다. 기대가 "막힘"이면 `contextmenu`가 막힌 것으로 충족하나, keydown 단계까지 막는지는 SPEC에 없어 판정하지 않았다.

## 도구

- `tools/win-input.ps1`에 키 이름 `;`(VK_OEM_1)와 `menu`/`apps`(VK_APPS, 확장 키)를 더했다(`Vk`, `IsExtended`). 다시 쓸 일반 입력 도구라 남긴다. 시험 스크립트(`m2.mjs`)는 일회성이라 `tools/`에 두지 않았다.

## 원상복구

- 시험 `keymap.json`을 지우고, 원래 없던 `%APPDATA%\workbench-tauri` 폴더도 지웠다(`existsSync` false 확인). 앱 프로세스는 모두 종료(`tasklist` 0).

## 재측정 (카드 v02-M2-R1) — 불일치 항목만

- 앞 표의 행은 그대로 둔다. 소스는 그 사이 바뀌었다(`src/App.tsx` 수정, 구현 담당 수정, 측정자는 고치지 않음).
- 조건은 위와 같다: debug 빌드를 새로 만들고(`workbench-tauri.exe` 2026-11-06 00:03:11) 1회 실행, 창 논리 1440x852, 100%, 시작 직후 포커스 그대로(`document.activeElement` = `BODY`), 시험 파일 없음. PID 24796, HWND 0x1BC0AD6, 입력마다 전경 확인(`fgAfter` true). 입력 전 콘솔 오류 0. 기록 방식은 위와 같다(버블 단계 리스너로 `defaultPrevented` 읽기).
- `%APPDATA%\workbench-tauri`는 만들지 않았다(실행 전·후 모두 없음 확인). 앱은 끝나고 종료(`tasklist` 0).

| 입력 | 도착한 keydown | 앱이 preventDefault | 콘솔 오류 | 알림 | 판정 |
|---|---|---|---|---|---|
| `ctrl-alt-;` | `Control`(false), `Alt`(false), `;`/`Semicolon` | 예 (`;` keydown `defaultPrevented` true) | 0 | 0 | 통과 (재측정) |
| `ctrl-k ctrl-o` | `k`(true), `o`(true) (사이의 `Control` keydown은 수식키 단독이라 false) | 예 (두 글자 모두 true) | 0 | 0 | 통과 (재측정) |
| `f10` | `F10` | 예 (true) | 0 | 0 | 통과 (재측정) |

- 수식키 단독 keydown(`Control`·`Alt`)은 앱이 처리하지 않는 이벤트라 false이며 판정 대상이 아니다.
