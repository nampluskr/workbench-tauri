# workbench-tauri

- 빌드·배포: [docs/BUILD.md](docs/BUILD.md)

## 실행

| 파일 | 경로 |
|---|---|
| release 앱 exe | `src-tauri\target\release\workbench-tauri.exe` |
| NSIS 설치 파일 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.1_x64-setup.exe`(설치 파일 이름의 번호는 앱 버전, `src-tauri/tauri.conf.json` `version`) |
| 디버그 exe | `src-tauri\target\debug\workbench-tauri.exe`(`npm run tauri build -- --debug --no-bundle`로 만든다) |

- 세 파일 모두 빌드 산출물이라 저장소에 없다. 빌드해야 생긴다. 만드는 방법은 [docs/BUILD.md 0절](docs/BUILD.md#0-노트북에서-처음부터)·[3절](docs/BUILD.md#3-빌드-명령)에 있다.
- 0.8.1의 크기·빌드 시각·버전은 [docs/BUILD.md 4A절](docs/BUILD.md#4a-081-결과-파일)에 있다(0.8.0은 [4절](docs/BUILD.md#4-결과-파일)).
