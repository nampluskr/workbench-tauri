[DONE] ORDER-03-R1 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| I-14 줄 번호 열 | 같은 조건에서 줄 번호 열 폭과 여백이 Zed와 같다(차이 1px 이하, 자릿수별) | 충족 | 아래 표. 판정 `specs/v0.5/verify/ORDER-03-R1/ORDER-03-R1-judgement.md`. 캡처 Zed `zed-SPEC-md.png`·`zed-g50-txt.png`·`zed-g1200-txt.png`·`zed-g12000-txt.png` / tauri 수정 전 `tauri-*.png`, 수정 후 `tauri-after-*.png`. 덤프 `tauri-gutter.json`·`tauri-after-gutter.json` |
| I-14 미리보기 코드 블록 | 글자 크기와 줄 높이가 Zed와 같다 | 이미 같음(변경 없음) | 64자 줄 잉크 폭 Zed 612px = tauri 612px(글자 16px). 줄 간격 평균 Zed 26.0 / tauri 25.857(computed 25.888 = 16×1.618), 7간격 합 1px 차. `zed-code-preview.png`, `tauri-code-preview.png`·`.json` |
| ORDER-03 충족 항목 유지 | I-7·I-8·I-9·I-13, I-14 나머지 | 충족(코드 확인) | 바뀐 곳은 줄 번호 칸의 좌우 padding뿐이다(`src/spec/metrics.ts`, `src/editor/extensions.ts`). 전체 검사 통과(아래). 화면 재측정은 줄 번호 열만 했다(AGENTS 3A.4 7). |

### 줄 번호 열 (픽셀 분석: 같은 글리프의 잉크 위치, 편집기 왼쪽 끝 기준 px)
| 파일(최대 자릿수) | 값 | Zed | tauri 수정 전 | tauri 수정 후 | 차이(수정 후) |
|---|---|---|---|---|---|
| g50.txt(2자리, 최소 4자리 폭) | 숫자 오른쪽 끝 / 본문 시작 | 57 / 92 | 62 / 104 | 57 / 92 | 0 / 0 |
| g1200.txt(4자리) | 같음 | 57 / 91~92 | — | 57 / 92 | 0 |
| SPEC.md(3자리) | 본문 시작 | 91~93 | 103~106 | 91~94 | ≤1 |
| g12000.txt(5자리) | 숫자 오른쪽 끝 / 본문 시작 | 66 / 101 | 71 / 113 | 66 / 101 | 0 / 0 |
| (공통) | 숫자 왼쪽 끝 | 41 | 45 | 40 | 1 |

- 수정 전 tauri의 줄 번호 열은 스펙 값 그대로였다: 왼쪽 여백 3ch(27px, E-003), 오른쪽 여백 4ch(36px, E-004), margin 5px(E-005).
- Zed 실측은 왼쪽 여백 22px, 오른쪽 여백 + margin 34px였다. 줄 번호 칸 폭(자릿수 × 9px, 최소 4자리)은 두 앱이 같았다. 자릿수가 하나 늘면 둘 다 +9px다.
- tauri를 왼쪽 22px, 오른쪽 29px로 바꿨다. margin은 E-005(descent) 그대로 5px다.
  - 근거: E-003·E-004는 Zed 소스(14b7b0e)에서 온 값이지만 지금 Zed 화면과 다르다. ITEMS I-14("줄 번호 열 폭이 Zed와 같아진다")가 우선한다(core D-12). 실측값과 근거를 SPEC R-14에 적었다. `spec/`는 고치지 않았다.
  - 한계: Lilex 15·100% 실측이다(`shortcut:` 주석).

## Zed에서 확인한 것
- 조건: Zed 새 창(`zed -n <파일>`), 클라이언트 1440×852, 100%. 테마는 One Dark(tauri Catppuccin Mocha와 다름, core-leader 결정으로 그대로). 파일은 `%TEMP%\v05-gutter\`의 SPEC.md(레포 사본)·g50·g1200·g12000.txt·code.md다.
- 미리보기 코드 블록은 카드의 `AGENTS.md` 대신 그 첫 코드 블록(2장 명령)을 담은 `code.md`로 쟀다. Zed 미리보기에서 휠 스크롤이 먹지 않아 AGENTS.md의 코드 블록까지 내려가지 못했다. 같은 내용을 같은 조건으로 두 앱에서 쟀다.
- Zed 줄 번호 열 값은 위 표와 같다(왼쪽 22, 칸 자릿수 × 9, 오른쪽 + margin 34).

## 사용자 Zed 창 (알림)
- 측정을 시작할 때 Zed(PID 20788·18016, 01:23 시작, tauri가 띄운 것 아님)가 이미 떠 있었다. Zed는 단일 인스턴스라 내 `Zed.exe <파일>` 실행 4회가 그 창에 탭으로 열리고 내 프로세스는 바로 끝났다.
- 더해진 탭: `%TEMP%\v05-gutter\`의 SPEC.md·g50.txt·g1200.txt·g12000.txt. 읽기만 했고 편집하지 않았다.
- core-leader 결정대로 그 창·탭·프로세스는 닫지 않았다(사용자에게는 core-leader가 알린다).
- 그 뒤로는 `zed -n`으로 새 창을 열어 그 HWND만 재고, 그 창만 WM_CLOSE로 닫았다. 프로세스는 끝내지 않았고, 매번 기존 창이 그대로인 것을 확인했다. HERDR-SETUP 측정 조건에 이 방식을 적었다.

## 글꼴 파일 (D-10)
변경 없음(ORDER-03 그대로).

## 바꾼 파일
- 앱:
  - `src/spec/metrics.ts`: 줄 번호 왼쪽 22px·오른쪽 29px(I-14 Zed 실측). 쓰지 않게 된 `padding_left_ch`·`padding_right_ch`를 지웠다.
  - `src/editor/extensions.ts`: 줄 번호 칸 padding을 새 값으로 바꿨다.
- 문서:
  - `specs/v0.5/SPEC.md`: R-14 줄 번호 열 실측값과 해소, 코드 블록 "Zed 실측과 같음".
  - `specs/v0.5/HERDR-SETUP.md`: Zed 측정은 새 창으로.
  - `specs/v0.5/PROGRESS.md`.
- 검증 결과: `specs/v0.5/verify/ORDER-03-R1/`(924KB).
- 커밋: `git log -1 -- specs/v0.5/reports/ORDER-03-R1.md`. push 안 함.

## 검토
- checker 코드 리뷰 C-15(K-06): PASS.
- 판정 C-16: 완료 기준 1·2 충족(`ORDER-03-R1-judgement.md`). 기준 3 유지는 바뀐 범위로 본 코드 확인이다.
- 커밋 직전 전체 검사(C-16): typecheck 통과, `npm.cmd run test` 113/113, `cargo test` 19/19, clippy 경고 0.
- 화면 차례 2회(실측, 재측정).
- 띄운 앱은 launchApp PID로만 닫았고, 앱 데이터는 매번 백업하고 복원했다.

## 사용자 확인 필요(V4)
- I-14 글자 모양·한글 간격 인상(ORDER-03 그대로).
- 사용자 Zed 창에 열린 탭 4개(위 "사용자 Zed 창").
- tauri 미리보기 코드 블록에 흰 가로 스크롤바가 보인다(Zed는 스크롤바 없이 잘림, `tauri-code-preview.png`). 색·스크롤바는 이 카드 범위 밖이라 고치지 않았다.

## BLOCKED
없음
