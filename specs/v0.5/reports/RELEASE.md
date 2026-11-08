[DONE] RELEASE tauri (v0.5 종료 뒤 사용자 요청 작업, K-59·W-41)

다른 PC에서 쓸 배포본(NSIS 설치 파일)을 만들었다. 2026-11-08, master `2f635a0` + `src-tauri/tauri.conf.json` `bundle` 변경(`"active": true`, `"targets": ["nsis"]`). `webviewInstallMode`는 넣지 않아 기본값 `downloadBootstrapper`다.

## 배포 파일
MiB는 1,048,576바이트 기준이다.

| 종류 | 경로 | 바이트 | MiB |
|---|---|---:|---:|
| NSIS 설치 파일 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.1.0_x64-setup.exe` | 6,052,343 | 5.77 |
| 앱 exe | `src-tauri\target\release\workbench-tauri.exe` | 16,972,800 | 16.19 |
| exe 하나를 zip으로(예상) | 위 exe를 Compress-Archive Optimal로 묶음(tauri-leader 측정) | — | 7.66 |

## 어떻게 쓰나
- 설치 파일: 다른 PC에서 `workbench-tauri_0.1.0_x64-setup.exe`를 실행한다. Tauri NSIS 기본대로 사용자별로 설치된다. WebView2가 없으면 설치 중에 인터넷으로 부트스트래퍼를 받아 WebView2를 설치한다.
- exe만 복사: WebView2가 이미 있는 PC라면 `workbench-tauri.exe` 하나만 복사해 실행해도 된다(아래 "확인한 것"의 코드 근거).

## 확인한 것
- 빌드: `npm run tauri build`. 첫 시도는 Codex 샌드박스가 네트워크를 막아 NSIS 도구 내려받기에서 실패했다(os error 10013). 권한 승인 뒤 재시도 성공 101.7초(Rust 컴파일 56.1초, NSIS 3.13·nsis_tauri_utils 첫 내려받기 포함). Rust 경고 없음. Vite 경고(500 kB 넘는 chunk, web-tree-sitter direct eval)는 기존 그대로. coder 보고 `%TEMP%\v05-K-59-report.md`.
- 단독 실행 1회(tauri-leader, core-leader `[SCREEN-OK] tauri K-59` 뒤): exe를 `%TEMP%\wb-release-run\`에 복사해 실행 → 0.58초에 창 핸들 생성, WebView2 자식 프로세스 1개, 응답 중. 조작·캡처 없이 `CloseMainWindow`로 닫음(종료 코드 0). 복사본 폴더는 지움.
- 코드 근거: 런타임에 쓰는 디스크 경로는 `%APPDATA%\workbench-tauri\`(keymap.json·settings.json·상태 파일)뿐이고 없으면 앱이 만든다. 프런트엔드(문법 wasm 포함)는 exe에 들어 있다. exe는 WebView2Loader.dll·vcruntime140.dll을 참조하지 않고 Windows 기본 UCRT만 참조한다.

## 남은 제약
- 코드 서명 없음: 다른 PC에서 SmartScreen "알 수 없는 게시자" 경고가 뜰 수 있다.
- WebView2가 없는 PC는 설치할 때 인터넷이 필요하다. 오프라인 설치는 `offlineInstaller`/`embedBootstrapper` 설정이 필요하며 지금은 켜지 않았다.
- Windows x64만. WebView2를 지원하지 않는 Windows(7/8 등)는 해당 없음.
- 버전 번호가 `0.1.0`(tauri.conf.json `version`)이고 설치 파일 이름에 그대로 나온다. 바꿀지는 사람이 정한다(미정).
- 미검증: 다른 PC에서의 설치·실행, 이 PC에서의 실제 설치는 하지 않았다.
- 사용자 데이터 위치 `%APPDATA%\workbench-tauri\`는 제거할 때 남을 수 있다.

## 빌드 다시 하는 법
- 문법 복사본이 없으면 먼저 `tools/fetch-zed-grammars.ps1`을 실행한다.
- `npm run tauri build`. 첫 빌드는 NSIS 도구를 인터넷으로 받는다.
- 결과는 위 "배포 파일" 표의 경로에 생긴다.
