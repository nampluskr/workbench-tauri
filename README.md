# workbench-tauri

Zed의 기본 편집기 기능을 바탕으로 Tauri 2로 만든 Windows 전용 편집기다. 무엇을 Zed와 같게 하고 다르게 할지는 [workbench-core](https://github.com/nampluskr/workbench-core)가 정한다.

- 현재 버전: 0.8.3(마지막 작업 커밋은 v0.8.3 ORDER-07, `c1a7d54`)
- 빌드·배포: [docs/BUILD.md](docs/BUILD.md)

## 빠른 시작(새 PC)

[docs/BUILD.md 0절](docs/BUILD.md#0-노트북에서-처음부터)을 줄인 것이다. 모든 단계에 인터넷이 필요하다.

1. 도구 설치: [docs/BUILD.md 1절](docs/BUILD.md#1-필요한-도구와-버전)(Git, PowerShell 7, Node.js 24, VS Build Tools 2022 C++, Rust, WebView2)
2. 레포 받기:
   ```powershell
   git clone https://github.com/nampluskr/workbench-tauri
   cd workbench-tauri
   ```
3. 복사본 채우기 — 아이콘·테마·문법은 `.gitignore`된 복사본이라 clone에 없다. 이 순서로 실행한다(themes는 icons 뒤에):
   ```powershell
   pwsh tools/fetch-zed-icons.ps1
   pwsh tools/fetch-zed-themes.ps1
   pwsh tools/fetch-zed-grammars.ps1
   ```
4. `npm ci`(안 되면 `npm install`, PowerShell 실행 정책에 막히면 `npm.cmd ci`)
5. `npm run tauri build` → 결과는 아래 "실행" 표의 release exe·NSIS 설치 파일

- 테스트·타입 검사(`package.json` scripts): `npm run test`, `npm run typecheck`

## 실행

| 파일 | 경로 |
|---|---|
| release 앱 exe | `src-tauri\target\release\workbench-tauri.exe` |
| NSIS 설치 파일 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.3_x64-setup.exe`(설치 파일 이름의 번호는 앱 버전, `src-tauri/tauri.conf.json` `version`) |
| 디버그 exe | `src-tauri\target\debug\workbench-tauri.exe`(`npm run tauri build -- --debug --no-bundle`로 만든다) |

- 세 파일 모두 빌드 산출물이라 저장소에 없다. 빌드해야 생긴다. 만드는 방법은 [docs/BUILD.md 0절](docs/BUILD.md#0-노트북에서-처음부터)·[3절](docs/BUILD.md#3-빌드-명령)에 있다.
- 0.8.3의 크기·빌드 시각·버전은 [docs/BUILD.md 4C절](docs/BUILD.md#4c-083-결과-파일)에 있다(0.8.2는 [4B절](docs/BUILD.md#4b-082-결과-파일), 0.8.1은 [4A절](docs/BUILD.md#4a-081-결과-파일), 0.8.0은 [4절](docs/BUILD.md#4-결과-파일)).
