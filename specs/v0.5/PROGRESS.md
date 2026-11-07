> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서는 `PLAN.md`에, 요구와 판정 방법은 `SPEC.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.5/reports/`에 있다.

# PROGRESS — workbench-tauri v0.5

## 현재 상태(2026-11-08)

- Phase 1~10: 닫힘, push 완료(core).
- Phase 11: tauri는 ORDER-11 충족(core 판정 2026-11-08). Phase 닫힘은 gpui 보고 뒤 core가 정하고 그때 push를 지시한다. 아래 Phase 11 "ORDER-11 종료".
- coder: Claude Code Sonnet 5.5 high(2026-11-07 23:15부터, `HERDR-SETUP.md` 1장).
- 다음: Phase 12(V4 사용자 확인). 재료 목록 [`reports/V4-LIST.md`](reports/V4-LIST.md)(tauri-leader 작성).

## Phase별 진행

### Phase 1 — 갈래 준비

- **W-01 v0.4 종료 기록** (2026-11-06)
  - 무엇을 했나: ORDER-01 3.0대로 `specs/v0.4/PROGRESS.md` "버전 종료"에 사용자 종료 판단을 그대로 옮기고 남은 것(V4 목록 16항목, 미정)을 적었다. `specs/v0.4/PLAN.md` 진행 현황 Phase 3 커밋 칸을 `72bdaa7`로 채웠다.
  - 결과: v0.4 두 파일의 해당 절만 바뀌었다. v0.4 다른 파일과 절은 그대로다.
  - 검증: V0. `git log --oneline -1 72bdaa7`이 `v0.4 Phase 3: 임시·핀 탭, 분할, 탭 드래그, 마크다운 미리보기 (R-8~R-11, R-14)`였다. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 커밋과 태그 `v0.4`는 tauri-leader가 한다(ORDER-01 3.0).
- **W-01 v0.5 문서 여섯** (2026-11-06)
  - 무엇을 했나: `specs/v0.5/`에 INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP·PROGRESS를 상태 "초안"으로 썼다(ORDER-01 3.1~3.3).
  - 결과: SPEC은 I-1~I-23을 R-1~R-23(같은 번호)으로 옮기고 판정 방법은 ITEMS 그대로다. PLAN은 core Phase 1~12와 번호를 같게 두고 대응 표를 넣었다. DECISIONS의 갈래 결정은 없음이다. HERDR-SETUP에 리더 결정(카드·보고 파일, 카드 ID)을 적었다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 루트 `INTENT.md` "다루지 않는 것"(설정 UI 화면, 프로젝트 전체 검색)과 I-2 Settings·I-22 검색 버튼이 부딪칠 수 있다. 혼자 맞추지 않고 SPEC R-2·R-22에 미정으로 두었다.
- **W-01 루트 AGENTS.md** (2026-11-06)
  - 무엇을 했나: 레포 규칙 "HERDR 구성은…" 줄을 core D-2 구성으로 고치고, core D-7 줄을 더했다. 0장·1장·3A·8장의 `specs/v0.4/` 경로와 역할 이름을 v0.5와 D-2 이름(tauri-leader·writer·coder·checker)에 맞췄다.
  - 결과: "사람이 정하고 묻는다", "지난 버전 폴더 불변", "Zed 코드 복사 금지"는 바꾸지 않았다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 없음.
- **C-01 검토 결과와 v0.4 종료 커밋** (2026-11-06)
  - 무엇을 했나: tauri-checker(agy)가 C-01로 ORDER-01 3.4의 W-01 산출물을 검토했다. tauri-leader가 v0.4 종료 기록을 커밋하고 태그를 붙였다.
  - 결과: C-01 판정 PASS. 항목 1~6 모두 PASS, 남은 지적 없음. v0.4 종료 커밋 `f7541ee`, 태그 `v0.4`.
  - 검증: C-01 보고 `C:\Users\nampl\AppData\Local\Temp\v05-C-01-report.md`. 커밋 해시와 태그는 tauri-leader 전달(W-01-R1).
  - 특이사항: 없음.
- **W-02 ORDER-01-R1 core ITEMS 우선: 지침 충돌 정리** (2026-11-06)
  - 무엇을 했나: 루트 `INTENT.md`·`AGENTS.md`·`docs/refs/` 지침 문서에서 core ITEMS I-1~I-23과 부딪치는 문장을 찾았다. 갈래 지침(루트 INTENT·AGENTS)의 부딪치는 문장은 지우지 않고 "단, core v0.5 ITEMS I-n은 예외(core D-12)"를 붙였다(리더 결정: 이력 보존). 루트 `AGENTS.md` 레포 규칙에 "core ITEMS 우선" 줄을 더했다. v0.5 INTENT·SPEC·PLAN·DECISIONS에서 I-2·I-22 충돌을 "미정"으로 둔 곳을 정리하고, PLAN Phase 8에 진단을 빼지 않고 막히면 `[BLOCKED]`로 남긴다고 적었다.
  - 결과: 고친 곳은 루트 `INTENT.md` 2줄(I-2·I-22), 루트 `AGENTS.md` 4곳(레포 규칙 1줄 추가, 3장 toml 기준 I-6·I-14, 5장 확장 파일 복사 I-1·I-3·I-4·I-18, 5장 의존성 목록 I-22). SPEC R-2·R-22는 ITEMS의 기대와 판정 방법대로 요구로 둔다. 위 W-01 "v0.5 문서 여섯" 특이사항의 미정은 이것으로 풀렸다. `docs/refs/`(03-tauri README 1절, refs README 1절·3절, 01-zed 04-APP-SPEC A-05·A-18.3)와 `spec/INDEX.md`의 부딪치는 문장은 고치지 않았다(카드 W-02, 원문·원본 gpui).
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다. `specs/v0.5/`에서 "루트 INTENT"·"부딪" 검색으로 남은 미정이 없음을 확인했다(이 PROGRESS의 지난 기록은 덧붙이기 원칙대로 그대로 둔다).
  - 특이사항: checker 검토(ORDER-01-R1 3장 6)는 아직이다.
  - 리더 결정(W-02-R1): `docs/refs/`는 `HERDR-SETUP.md` 4장 소유권(아무도 고치지 않음)대로 고치지 않고, 루트 `AGENTS.md` "core ITEMS 우선" 줄에 docs/refs/ 출발 문서(`03-tauri/README.md`·`README.md`)도 이 레포 지침에 포함됨을 밝혔다.
- **W-03 ORDER-01-R2 승인 위임** (2026-11-06)
  - 무엇을 했나: core ORDER-01-R2 2장 A대로 `HERDR-SETUP.md` 5장에 "5.5 승인 처리"를 더했다. 서브 에이전트 승인 요청은 tauri-leader가 대신 응답하고(사용자 2026-11-06, core ORDER-01-R2), 의존성 변경·HERDR 구성 변경·push는 사용자에게 묻는다. leader 판단은 출처를 달아 PROGRESS에 남기고 HERDR-DECISIONS는 두지 않는다. 자동 모드가 승인 키 입력을 막을 때의 리더 결정(승인하지 않음, 읽기 전용 결과는 `%TEMP%` 파일로, 그래도 안 되면 `[BLOCKED]`)을 적었다.
  - 결과: 5.5 절이 생겼다. 0장 구독 현황은 이미 core D-2 근거("여유", 수치 없음)라 고치지 않았다(2장 B 해당 없음). 4장 "push는 core-leader 판정 뒤 사용자가 정한다"와 5.4는 5.5와 어긋나지 않아 그대로 두었다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 2장 C·D는 gpui만 해당한다(tauri 해당 없음).
- **W-04 ORDER-01-R3 checker 명령 허용** (2026-11-06)
  - 무엇을 했나: 레포에 `.agents/checker-settings.json`(agy `permissions.allow`·`deny`)을 새로 두고, `HERDR-SETUP.md` 5.5에 "checker 명령 허용" 항목(위치, 허용 요약, 허용하지 않는 것, 보고 파일 범위, 앱 실행 제외)을 더했다. 1장 표·2장·6장의 checker 실행 명령을 `agy --model gemini-3.8-flash-high --settings D:\projects\workbench-tauri\.agents\checker-settings.json`으로 고쳤다. 5.5의 기존 리더 결정 앞에 "checker 명령은 허용 목록으로 승인 없이 돈다"를 두었다.
  - 결과: 설정은 레포 안 파일이고 checker 세션에만 `--settings`로 적용한다. agy 전역 설정은 고치지 않았다(core D-7). ORDER-01-R3 3장 3의 금지 명령은 허용 목록에 없고 deny에 있다.
  - 검증: V0. 문서·설정 파일만 바뀌어 명령은 실행하지 않았다. 확인 결과(checker `git diff --stat`이 승인 창 없이 도는지): leader가 checker 재시작 뒤 확인.
  - 특이사항: 없음.
  - 확인 결과와 대체 방식(W-05, 2026-11-06): allow와 deny가 함께 있으면 허용 명령도 승인 창이 뜬다(tauri-leader 시험 2026-11-06). deny를 빼는 조치는 사용자 조치 대기이고(core-leader가 최종 보고에 올린다), 설정 파일은 allow+deny 그대로 둔다. 대체 방식(core-leader 결정, 사용자 위임 2026-11-06, core D-13): checker가 실행해야 할 명령은 `tauri-coder` 또는 `tauri-leader`가 실행해 출력을 `%TEMP%\v05-<카드ID>-*.txt`로 남기고, `tauri-checker`는 그 파일을 읽어 판정하며 셸 명령을 실행하지 않는다. 사용자 조치로 승인 없이 돌게 되면 대체 방식을 끝낸다. `HERDR-SETUP.md` 5.5에 같은 내용을 적었다.
  - deny 제거(W-07·W-08, 2026-11-06): 사용자 직접 승인(core-leader 전달, 사용자 원문 "checker가 승인 창 없이 명령을 실행하게 하는 설정하도록 승인합니다.")으로 `.agents/checker-settings.json`에서 deny를 빼고 allow만 남겼다.
  - leader 시험(2026-11-06): allow만 있어도 `command(git diff)`는 `git diff --stat`과 일치하지 않아 승인 창이 떴다. 앞부분 일치가 아니다. 앞 시험에서는 정확한 항목 `command(git diff --stat)`이 있을 때 승인 창이 뜨지 않았다.
  - 정확한 항목이나 와일드카드 항목을 더하는 지시는 tauri-leader 세션 자동 모드가 `[Self-Modification]`으로 거부해 하지 않았다(우회하지 않음, core-leader에게 알림).
  - 그래서 대체 방식(coder/leader가 실행해 `%TEMP%\v05-<카드ID>-*.txt`, checker는 파일만 읽음)을 계속 쓴다. `HERDR-SETUP.md` 5.5의 설정 항목을 "현재 파일 내용"과 실제 동작으로 고쳐 적었다.
  - 정확한 변형 추가(W-09, 2026-11-06): core-leader가 사용자 직접 요청으로 allow에 정확한 명령 형태(`git diff --stat`, `git status --short`, `git log --oneline -5` 등과 빌드·clippy 변형)를 더했다(core D-7 예외). checker를 `--settings`로 다시 띄우자 이 세 명령이 승인 창 없이 실행되었다(tauri-leader 시험). allow는 명령 전체가 정확히 같을 때만 일치하므로, 목록에 있는 명령은 checker가 직접 실행하고, 없는 명령은 대체 방식을 쓰며 필요하면 tauri-leader가 core-leader에게 알려 목록에 더한다(`HERDR-SETUP.md` 5.5).
- Phase 1 종료 판정: 충족(core-leader, 사용자 위임 D-13), 문서 다섯 확정 (2026-11-06, W-06).

### Phase 2 — 창

- **ORDER-02 창 1440×852·작업 영역 가운데·최소 360×240 (R-6, I-6)** (2026-11-06 ~ 2026-11-07)
  - 무엇을 했나:
    - K-01: `src-tauri/tauri.conf.json` main 창에 `minWidth: 360`·`minHeight: 240`을 더했다(1440×852는 그대로). 처음에는 `center: true`로 가운데 배치를 맡겼다.
    - V3 1차(C-04·C-05): clientOrigin이 기대 240,90보다 +8,+1 어긋났다(center가 보이지 않는 크기 조절 테두리를 포함한 바깥 사각형을 가운데에 둠). 최소 크기는 입력 도구가 크기를 바꾸지 못해 측정 불가였다.
    - K-01-R1: `center`를 빼고 `src-tauri/src/lib.rs` setup에서 보이지 않는 크기 조절 테두리를 뺀 클라이언트 영역을 작업 영역 가운데에 둔다(`centered_outer_position`, 단위 테스트 하나).
    - V3 2차(C-07): 클라이언트가 344×231까지 줄어 최소 크기가 불일치였다.
    - K-01-R2: setup에서 테두리만큼 최소 크기를 보정한다(`compensated_min_size`, 최소값은 `tauri.conf.json`에서만 읽음, 단위 테스트 하나).
    - V3 3차(C-09): 세 기준을 다시 쟀다.
  - 결과: 첫 실행 clientSize 1440×852, clientOrigin 240,90(작업 영역 0,0,1920,1032의 가운데). 최소 clientSize 360×240 유지. 크기를 바꾸고 다시 실행해도 1440×852로 열린다. R-6 충족.
  - 검증:
    - V1: `cargo test --manifest-path src-tauri/Cargo.toml` 19 passed, `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` 경고 0, `npm.cmd run tauri build -- --debug --no-bundle` 통과(K-01-R2, `%TEMP%\v05-K-01-R2-cmd.txt`).
    - 리뷰: C-03(K-01)·C-06(K-01-R1)·C-08(K-01-R2) 모두 PASS(`%TEMP%\v05-C-03-report.md`, `v05-C-06-report.md`, `v05-C-08-report.md`).
    - V3: 3기준 통과, 불일치 없음(`specs/v0.5/verify/ORDER-02-window.md`, `%TEMP%\v05-C-09-report.md`). 측정 조건 1920×1080, 100%, 작업 표시줄 있음, 앱 데이터 측정마다 백업·복원.
    - 화면 차례: `[SCREEN-REQ]`·`[SCREEN-OK]`·`[SCREEN-DONE]`를 3회 주고받았다(core D-4).
  - 특이사항:
    - checker의 첫 state 호출이 창이 보이기 전이라 실패해, 측정 명령은 tauri-leader가 대체 방식으로 실행했다(`HERDR-SETUP.md` 5.5).
    - 사용자 확인 필요: 없음.

### Phase 3 — 편집 영역과 글꼴

- **ORDER-03 편집 영역과 글꼴 (R-7, R-8, R-9, R-13, R-14 / I-7, I-8, I-9, I-13, I-14)** (2026-11-07)
  - 무엇을 했나:
    - K-03(I-14): IBM Plex Sans `@ibm/plex-sans@1.1.0`(Regular·Italic·SemiBold·SemiBoldItalic woff2, `license.txt`)과 Lilex 2.630(Regular·Italic·Bold·BoldItalic woff2, `OFL.txt`)을 `public/fonts/`에 넣고 `@font-face` 8개로 읽게 했다(`src/app.css`). UI는 `"IBM Plex Sans", "Malgun Gothic", sans-serif`·16·400·`"calt" 0`, 에디터는 `"Lilex", "Malgun Gothic", monospace`·15·400·1.618이다(`src/spec/metrics.ts`, `src/editor/extensions.ts`). `applyMetrics`를 비동기로 바꿔 Lilex를 읽은 뒤 E-005 descent를 계산하고 유일한 호출부 `src/index.tsx`에서 await한다(회귀 테스트 `src/spec/metrics.test.ts` 하나). CSP 변경 없음(`default-src 'self'`).
    - K-03 DirectWrite: `IDWriteFactory2::GetSystemFontFallback` → `MapCharacters`로 Zed 한글 대체 글꼴이 Malgun Gothic(맑은 고딕)임을 확인했다(ko-KR·en-US, `%TEMP%\v05-K-03-dwrite.txt`).
    - K-03-R1(core 결정: UI 16은 rem 기준값이고 요소별 크기는 유지): 폼 요소 공통 `font-size`·`font-weight` 상속과 `.markdown-body pre`의 15px 지정을 지웠다. 미리보기 코드 블록 크기는 K-03 전 값(본문에서 상속한 16)으로 돌아갔다.
    - K-04(I-8·I-13): `.md`·`.markdown`에만 CodeMirror `EditorView.lineWrapping`을 넣었다(`src/editor/extensions.ts`, `src/editor/file-view.ts`, 테스트 `src/editor/extensions.test.ts` 하나). I-13은 `highlightActiveLine`·`highlightActiveLineGutter`가 줄바꿈된 논리 줄 전체를 강조해 코드 수정이 없다(코드 확인).
    - I-9: 두 갈래가 확인한 Zed 동작(세로 thumb 늘 보임·숨김 없음, 가로는 넘칠 때만)으로 core ITEMS I-9 기대가 정정되었다. tauri는 이미 같아 코드 수정이 없다(`.cm-scroller` `overflow: auto`, 캡처).
    - 문서(W-11~W-13): SPEC R-14에 한글 대체 글꼴·스펙 ID·미리보기 코드 블록 크기·Zed와 다른 점, DECISIONS D-1에 글꼴 파일·출처·CSP, HERDR-SETUP 3장·5.3에 띄운 PID만 닫기와 입력 스크립트 방식, SPEC R-9를 I-9 정정 기준으로 적었다.
  - 결과: I-14·I-7·I-8·I-13 충족. I-9는 정정 기준으로 tauri가 이미 Zed와 같다. 1번 줄 위 여백 차이 0으로 풀렸다. 미리보기 코드 블록은 Lilex·16px·400·줄 높이 25.888px(1.618)·`font-feature-settings: normal`, Rendered Lilex+Malgun Gothic이다(`specs/v0.5/verify/ORDER-03/tauri-dump-pre.json`).
  - 검증:
    - V1: `npm.cmd run typecheck` 통과, `npm.cmd run test -- src/spec/metrics.test.ts src/editor/markdown.test.ts` 6/6(K-03·K-03-R1), `npm.cmd run test -- src/editor/extensions.test.ts` 1/1(K-04), `git diff --check` 통과(`%TEMP%\v05-K-03-cmd.txt`, `v05-K-03-R1-cmd.txt`, `v05-K-04-cmd.txt`).
    - 리뷰: C-10(K-03)·C-11(K-04) PASS(`%TEMP%\v05-C-10-report.md`, `v05-C-11-report.md`).
    - Zed I-9: tauri-leader가 SendInput(`tools/win-input.ps1`)으로 캡처하고 C-12가 판정했다(`specs/v0.5/verify/I-9/zed-*.png`, `zed-scrollbar.md`, `%TEMP%\v05-C-12-report.md`).
    - V2·V3: C-13 통과 8, 불일치 1(줄 번호 열 폭), 미리보기 코드 블록은 별도 덤프로 확인(`specs/v0.5/verify/ORDER-03/ORDER-03-judgement.md`, `tauri-dump-pre.json`, `%TEMP%\v05-C-13-report.md`). 측정 조건: 창 클라이언트 1440×852, 100%, 테마는 Zed One Dark·tauri Catppuccin Mocha로 다르다(core-leader 결정으로 그대로, 색 판정 제외).
    - 화면 차례: `[SCREEN-REQ]`·`[SCREEN-OK]`·`[SCREEN-DONE]`를 3회 주고받았다(core D-4). Zed·앱은 띄운 PID만 닫았다.
  - 특이사항:
    - Zed와 다른 점: 줄 번호 열 폭 tauri 99px, Zed 약 64px. 글꼴로 풀리지 않아 SPEC R-14에 적었다.
    - 리더 결정(사용자 위임 core D-13): 미리보기 코드 블록은 줄 높이 1.618을 유지하고 크기는 16이다.
    - 사용자 확인 필요(V4): I-14 글자 모양·한글 간격의 인상.
- **ORDER-03-R1 줄 번호 열·미리보기 코드 블록 (R-14 / I-14)** (2026-11-07)
  - 무엇을 했나:
    - tauri-leader가 Zed 줄 번호 열과 미리보기 코드 블록을 실측했다(Zed 새 창 클라이언트 1440×852, 100%, Lilex 15). 줄 번호 왼쪽 여백 22px, 칸 = 자릿수(최소 4)×9px, 오른쪽 여백 29px + margin(E-005, descent 5px).
    - K-06: 줄 번호 왼쪽·오른쪽 여백을 E-003(3ch)·E-004(4ch)에서 실측값 22px·29px로 바꿨다(`src/spec/metrics.ts` `editor.gutter.padding_left`·`padding_right`, `src/editor/extensions.ts`). E-002 최소 4자리와 E-005 margin은 그대로다. E-003·E-004는 Zed 소스(`14b7b0e`) 값이지만 지금 Zed 화면과 달라 core D-12로 실측값을 쓴다. `shortcut:` 주석에 Lilex 15 기준이라 글꼴·크기가 바뀌면 다시 잰다고 적었다.
    - 문서(W-15): SPEC R-14 "Zed와 다른 점"을 해소로 고치고 미리보기 코드 블록 크기를 "Zed 실측과 같음"으로 고쳤다. HERDR-SETUP 3장에 Zed 측정 방식을 더했다.
  - 결과: 줄 번호 열 tauri = Zed(4자리 숫자 오른쪽 57px·본문 92px, 5자리 66px·101px, 차 ≤1px). 미리보기 코드 블록은 Zed와 같다(글자 16px, 줄 높이 1.618, 64자 줄 폭 612px 동일, 줄 간격 7간격 합 1px 차). ORDER-03의 불일치 1(줄 번호 열 폭)이 풀렸다.
  - 검증:
    - V1: `npm.cmd run typecheck` 통과, `npm.cmd run test -- src/spec/metrics.test.ts src/editor/extensions.test.ts` 2/2, `npm.cmd run tauri build -- --debug --no-bundle` 성공, `git diff --check` 통과(K-06, `%TEMP%\v05-K-06-report.md`).
    - 리뷰: C-15(K-06) PASS(`%TEMP%\v05-C-15-report.md`).
    - 측정: Zed·tauri 수정 전후 캡처와 덤프(`specs/v0.5/verify/ORDER-03-R1/`, `%TEMP%\v05-o3r1-tauri.txt`, `v05-o3r1-after.txt`, `v05-o3r1-zed-log.txt`).
  - 특이사항:
    - Zed 측정 중 사용자 Zed(PID 20788) 창에 탭 4개가 열렸다(Zed 단일 인스턴스라 측정용 열기가 사용자 창으로 갔다). 사용자 창과 탭은 닫지 않았고 core-leader가 사용자에게 알렸다.
    - 이후 `zed -n` 새 창만 재고 그 창만 `WM_CLOSE`로 닫았다. 이 방식을 `HERDR-SETUP.md` 3장에 적었다(core-leader 결정 2026-11-07).
    - 사용자 확인 필요: 없음.
- **ORDER-04 경로 역슬래시 표시 (R-20 / I-20)** (2026-11-07)
  - 무엇을 했나:
    - tauri-leader가 화면 차례 1회로 경로를 보이는 자리를 실측했다(1920×1080, 100%, 클라이언트 1440×852, 테스트 폴더 `%TEMP%\v05-i20`, 등록 폴더 `D:\`). 대상 자리 목록은 coder 정적 조사(`%TEMP%\v05-K-07-report.md`)를 따랐다.
    - 문서(W-05): SPEC R-20 "정해진 결과"에 실측 결과·글꼴 근거·네이티브 대화 상자 판정 제외·R-11·R-12 자리를 적고, PLAN Phase 4를 done으로 했다.
  - 결과: 앱이 그리는 자리(파일 트리 compact 행, 트리 경로 툴팁, 사이드바·타이틀 바·트리 루트, 편집기 본문, 미리보기 본문·코드)는 모두 `\`이고 `₩`가 없다. Rendered Fonts는 IBM Plex Sans 또는 Lilex뿐(Malgun Gothic 0)으로, Phase 3 글꼴(R-14) 덕분이다. 코드 변경은 없다.
  - 검증:
    - V3: 캡처와 덤프 `specs/v0.5/verify/ORDER-04/`(`tauri-i20.json`, `tauri-1~6-*.png`). 판정 `specs/v0.5/verify/ORDER-04/ORDER-04-judgement.md`(checker C-17).
    - 문서: V0(실행 없음).
  - 특이사항:
    - 네이티브 대화 상자(미저장 닫기 확인 TaskDialog)는 `docs₩refs₩paths.md`로 보인다(`tauri-4-dialog.png`). OS 시스템 UI 글꼴(맑은 고딕) 때문이며 앱에서 바꿀 수 없다. core-leader 결정(2026-11-07, core D-13)으로 "OS 표시"로 판정에서 빼고 Phase 12 사용자 확인(V4)에 올린다. 문구의 구분자는 바꾸지 않는다.
    - 탭 경로 툴팁(R-11)·경로 줄(R-12)은 지금 없어 Phase 9에서 다시 본다.
    - 사용자 확인 필요(V4): 네이티브 대화 상자의 `₩` 표시.

### Phase 5 — 아이콘 모양

- **ORDER-05 UI 아이콘을 Zed 원본으로 (R-1·R-18 / I-1·I-18)** (2026-11-07)
  - 무엇을 했나:
    - K-08: Zed `4304dec732a75505066de5ce2dbbfb2bec369498`의 `assets/icons/`(UI 299, `file_icons/` 96, `LICENSES`)와 루트 `LICENSE-GPL`·`LICENSE-APACHE`를 `src/assets/zed-icons/`(`.gitignore`)에 받는 `tools/fetch-zed-icons.ps1`을 만들고, UI 아이콘을 그 SVG로 바꿨다(`src/shell/Icon.tsx`, `src/shell/icon-svg.ts`, 테스트 `src/shell/icon-svg.test.ts`, `src/App.tsx`, `src/shell/Pane.tsx`, `src/shell/ProjectTree.tsx`). 쓰지 않게 된 자체 SVG 14개를 지웠다.
    - K-08-R1(리더 결정): 등록 폴더 목록(`src/shell/Sidebar.tsx`)도 Zed `folder.svg`로 바꾸고 자체 `folder.svg`를 지웠다(gpui 갈래와 같다).
    - tauri-leader가 화면 차례 1회로 tauri와 Zed를 캡처했다(클라이언트 1440×852, 100%).
    - 문서(W-06): SPEC R-1에 출처·두는 곳·라이선스·다시 채우기·없을 때 모습·대응 표·유지 자리, R-18에 결과, DECISIONS D-2(복사본 위치·없을 때 모습)·D-3(등록 폴더 목록 아이콘), PLAN Phase 5 done.
  - 결과:
    - UI 아이콘은 Zed 원본 SVG에서 나온다(대응 표 `SPEC.md` R-1). 상태 바 왼쪽 dock 여닫기는 `file_tree.svg`(트리 모양), Add Project는 `folder_add.svg`("+")다.
    - 유지 2곳: 파일 트리 일반 파일은 자체 `file.svg`(Zed는 확장자별 아이콘 테마, Phase 7), Windows 창 버튼은 Segoe Fluent 글리프(Zed도 같은 글리프).
    - 복사본이 없으면 교체한 자리는 같은 크기의 빈 칸이고 버튼·툴팁·기능은 그대로다.
  - 검증:
    - V1: 복사본 있음·없음 각각 `npm.cmd run typecheck` 통과, `npm.cmd run test` 114/114, `npm.cmd run tauri build -- --debug --no-bundle` 통과. `node --test src/shell/icon-svg.test.ts` 1/1, `cargo check` 경고 없음, `git diff --check` 통과. `git status`·`git ls-files src/assets/zed-icons`에 복사본 없음(`%TEMP%\v05-K-08-report.md`, `v05-K-08-R1-report.md`).
    - V3: 상태 바 왼쪽(패널 토글·`folder_add`·`file_tree`), 탭 바(화살표·`+`·분할·확대), 미리보기 탭 아이콘이 Zed와 같은 모양(`specs/v0.5/verify/ORDER-05/` tauri-1~3, zed-1·2, zoom-*, `tauri-icons.json`). 판정은 checker C-19(`specs/v0.5/verify/ORDER-05/ORDER-05-judgement.md`).
    - 문서: V0(실행 없음).
  - 특이사항:
    - 조건 차이: 사용자 Zed 아이콘 테마가 Catppuccin Latte라(설정은 읽기만 함) 파일 트리 폴더·파일 아이콘은 화면 비교가 안 되고 코드 출처(Zed 기본 테마 `file_icons.rs` 폴더 = `folder.svg`/`folder_open.svg`)로 판정한다. Zed는 Restricted Mode로 열었다(신뢰 목록에 더하지 않음).
    - 빌드 경고: Vite 500 kB 초과 chunk, `web-tree-sitter` direct eval 2건(복사본 있음·없음 같음, 범위 밖).
    - 사용자 확인 필요: 없음(시각 품질은 Phase 12 V4에서 함께 본다).

### Phase 6 — 타이틀 바 메뉴

- **ORDER-06 1단계 `≡` 메뉴와 "v" 메뉴 (R-17·R-2 / I-17·I-2)** (2026-11-07, 1단계 완료·core 판정 대기)
  - 무엇을 했나:
    - tauri-leader가 Zed 새 창(`zed -n`, 1440×852, 100%, Restricted Mode)에서 "v" 메뉴 여섯 항목이 여는 것·화면 구성·저장 위치를 확인하고 캡처했다(`specs/v0.5/reports/ORDER-06-zed.md`, `specs/v0.5/verify/ORDER-06/zed-*.png`). Zed 설정·키맵 파일은 바뀌지 않았다.
    - K-09: `≡` 메뉴를 workbench-tauri·File·Edit·View·Go·Window·Help로 맞췄다. Split 네 항목을 Zed처럼 View → Editor Layout 하위 메뉴로 옮기고, Help(View Dependency Licenses·File Bug Report...·Request Feature...·workbench-tauri Repository)와 라이선스 대화 상자를 더했다. 메뉴 막대가 열리면 프로젝트 이름을 숨긴다. 최소화 버튼 앞에 "v" 버튼(`chevron_down.svg`)과 메뉴(Settings·Keymap·Themes…·Icon Themes…·Extensions·Panel Layout 하위 Classic·Agentic)를 더했다. 변경 파일 `src/shell/app-menus.ts`, `AppMenu.tsx`, `TitleBar.tsx`, `Icon.tsx`, `menu.ts`, `menu.test.ts`, `app-menus.test.ts`(신규), `licenses.ts`(신규), `src/spec/metrics.ts`, `src/app.css`.
    - K-09-R1(leader 화면 확인에서 발견): View > Editor Layout 하위 메뉴가 열린 채 다른 메뉴 이름으로 포인터를 옮기면 메뉴 막대 전체가 닫히던 버그. 하위 메뉴 DOM 교체 중의 일시적 포커스 이탈로 닫히던 것을, `src/shell/menu.ts` `closeOnFocusOut`이 microtask 뒤 포커스가 메뉴 안인지 보고 판정하게 고쳤다(`AppMenu.tsx`, `menu.test.ts` 회귀 테스트 1개).
    - K-09-R2(leader 화면 확인에서 발견): 메뉴 이름 간격이 Zed 잉크 13~14px에 비해 약 5px였다. 이름 버튼 좌우 padding을 `buttons.padding_x.default_compact`(L-07) 4px로 했다(`src/spec/metrics.ts`, `src/app.css` `.menu-name`).
    - K-09-R3(checker C-21 지적): "v" 메뉴 Panel Layout 하위 메뉴가 열린 채 비활성 형제(Extensions 등)로 포인터를 옮기면 닫히지 않던 것. hover 판단을 `menu.ts`로 분리해 비활성 항목에서도 하위 메뉴를 닫게 하고, `.menu-item.disabled`의 `pointer-events: none`을 빼고 hover 배경을 활성 항목에만 준다. 비활성 항목은 여전히 선택·실행되지 않는다(`AppMenu.tsx`, `menu.ts`, `menu.test.ts`, `src/app.css`).
    - tauri-leader가 화면 차례로 tauri 메뉴를 실측했다(V3).
    - 문서(W-07): SPEC R-17에 메뉴 항목 표·Zed 근거·넣는 규칙·Help URL·이름 숨김·이름 간격·Licenses 표시 방법·gpui와 다른 점, R-2에 Zed 확인 결과와 1단계 결과, PLAN Phase 6 doing.
    - 문서(W-07-R1): SPEC R-17·R-2에 V3 결과와 R1~R3, R-17에 이름 padding(L-07) 근거, PLAN Phase 6 비고 "1단계 완료(core 판정 대기), 2단계 ORDER-06-R1 대기".
  - 결과:
    - `≡` 메뉴는 구현된 기능만 Zed 순서로 있고 Help가 마지막이다. Selection·Run은 항목이 없어 넣지 않았다.
    - "v" 메뉴는 Zed와 같은 순서·단축키 표시로 나온다. 화면이 없는 항목과 Panel Layout 하위 항목은 비활성이라 눌러도 아무 일이 없다. Themes…·Icon Themes…는 Phase 7까지 비활성이다. Zed의 Custom은 tauri에 해당 배치 상태가 없어 넣지 않았다.
    - 라이선스 대화 상자는 파일마다 실패를 따로 처리해, Zed 아이콘 복사본이 없어도 `License copy unavailable.`로 보이고 앱이 죽지 않는다.
  - 검증:
    - V1(K-09): `npm.cmd run typecheck` 통과, `node --test src/shell/app-menus.test.ts src/shell/menu.test.ts` 8/8, `cargo check` 경고 없음, `npm.cmd run tauri build -- --debug --no-bundle` 통과, `git diff --check` 통과(`%TEMP%\v05-K-09-report.md`).
    - 리뷰(C-20): PASS. `npm.cmd run typecheck` 통과, `npm.cmd run test` 119/119, `cargo check` 경고 없음(`%TEMP%\v05-C-20-report.md`).
    - V1(K-09-R1~R3): R1 관련 9/9·전체 120/120, R2 관련 10/10, R3 관련 10/10·전체 121/121, typecheck 통과, 디버그 빌드 통과, `git diff --check` 통과(`%TEMP%\v05-K-09-R1-report.md`, `-R2-`, `-R3-`). Rust 변경 없음, `cargo check` 경고 0.
    - V3(tauri-leader, 1920×1080·창 1440×852·100%·One Dark): checker C-21 통과 13·불일치 0(`specs/v0.5/verify/ORDER-06/ORDER-06-judgement.md`, `%TEMP%\v05-C-21-report.md`). 메뉴 순서, 프로젝트 이름 숨김(`projectNameVisible: false`), 이름 잉크 간격 12~13px(Zed 13~14px와 1px 이내, `tauri-menubar-after.png`), Editor Layout → Go 전환 뒤 막대 유지, 라이선스 대화 상자 열림·Escape 닫힘·복사본 누락 0, "v" 버튼 최소화 바로 앞 22×22, 항목 순서·단축키 표시, Panel Layout 하위 열림, 비활성 항목 클릭 뒤 앱 유지.
    - K-09-R3: 코드·테스트 확인. 화면 재확인은 tauri-leader(결과는 leader 보고에 적는다).
    - 문서: V0(실행 없음).
  - 특이사항:
    - gpui와 다른 점: View 분할이 tauri는 Editor Layout 하위 메뉴(Zed와 같음), gpui는 직접 항목이다. 두 갈래 표가 같아야 하므로 조율이 필요하다(SPEC R-17 "gpui와 다른 점").
    - Help 두 이슈 항목은 ORDER-06대로 이 저장소의 `issues/new`를 연다(Zed의 템플릿·discussions는 쓰지 않음). 브라우저는 열지 않고 URL을 테스트로 확인했다.
    - 2단계(ORDER-06-R1): Settings·Keymap·Extensions·Panel Layout 화면의 공통 범위를 core가 정한다.
    - 빌드 경고: Vite 500 kB 초과 chunk, `web-tree-sitter` direct eval 2건(기존, 범위 밖).
    - 사용자 확인 필요: 라이선스 대화 상자의 시각 품질(`tauri-licenses.png`, Phase 12 V4에서 함께 본다).

- **ORDER-06-R1 "v" 메뉴 화면 (R-2 / I-2, core D-15)** (2026-11-07, 완료·core 판정 대기)
  - 무엇을 했나:
    - K-10(Settings 창·Panel Layout): `[BLOCKED]`. Settings 창 크기·배치 수치가 `spec/zed-metrics.toml`에 없고, gpui에 Settings 행·테마 선택지 공통 표가 없었다(`%TEMP%\v05-K-10-report.md`).
    - core-leader 결정(2026-11-07, core D-13): Settings 파일 `%APPDATA%\workbench-<갈래>\settings.json`(Zed 형식·키), 범주 Appearance 하나에 Theme·Icon Theme·UI Font Size·Buffer Font Size, Panel Layout은 Classic만(왼쪽 dock 열기 + 기본 폭 240px L-32), Custom은 기본과 다를 때.
    - tauri-leader가 Zed Settings 창(`zed-settings-window.png`)과 "v" 버튼(`zed-v-menu.png`)을 실측했다(1440×852·100%).
    - K-10-R1: 완료. 위 결정·실측으로 Settings 별도 창(`Ctrl-,`·"v" 메뉴, label `settings`, 900×750, 이미 있으면 앞으로)과 Appearance 네 행, settings.json 저장·감시·바로 적용(DECISIONS D-4), Settings 창 capability(D-5), Panel Layout Classic(왼쪽 dock 열기 + 기본 폭 240)·Custom을 만들었다. K-11의 `user_keymap.rs`를 공통 `user_file.rs`로 옮겼다. 창별 캡션 상태를 HWND마다 나눴다. 변경 `src/settings/`(신규 model·model.test·load·main·Settings.tsx·settings.css), `src/index.tsx`, `src/keymap/keyboard.ts`, `src/shell/TitleBar.tsx`·`AppMenu.tsx`·`app-menus.ts`·`app-menus.test.ts`·`dock.ts`·`layout.ts`(신규)·`menu.ts`·`KeymapEditor.tsx`, `src/spec/metrics.ts`·`metrics.test.ts`, `src/syntax/highlight.ts`, `src/theme/apply.ts`, `src-tauri/src/lib.rs`·`caption.rs`·`user_file.rs`, `src-tauri/capabilities/settings.json`(신규).
    - tauri-leader 화면 확인(2026-11-07): Settings 치수가 Zed 실측과 같고, Keymap Editor 탭·열·91행, Panel Layout은 Classic만 체크. 모양 차이 6가지를 찾았다(`specs/v0.5/verify/ORDER-06-R1/`).
    - core-leader 결정(2026-11-07): settings.json 처리는 tauri 방식(주석 보존, 잘못된 키만 기본값)을 두 갈래 기준으로 한다. 메뉴 키는 Zed Windows 기본 키맵, 메뉴에는 첫 키, Close Editor는 `Ctrl-W`(두 갈래 공통).
    - K-13: 완료. 메뉴 키를 Zed `default-windows.json`에 맞췄다(Redo 표시 `Ctrl-Y`, Close Editor `Ctrl-W` 표시, 다른 메뉴 키는 이미 같음). "v" 버튼 오른쪽 4px를 `titlebar.right_group.gap`(L-89/I-603)으로 맞췄다. Licenses 고지 경로를 확인했다(Catppuccin 고지는 Phase 7로 인계). 변경 `src/keymap/builtin.ts`, `src/shell/app-menus.ts`·`AppMenu.tsx`·`menu.ts`·`app-menus.test.ts`, `src/spec/metrics.ts`, `src/app.css`.
    - K-14: 완료. Settings 모양 차이를 고쳤다: 타이틀 바 글자 없앰, 검색 돋보기, 범주 `chevron_right`·14px, User 칩 `info.background`, 소제목 12px·`text.muted`·버퍼 글꼴, 자체 드롭다운(기존 메뉴 팝업), 검색 범위에 페이지 제목·소제목 추가. 변경 `src/settings/Settings.tsx`·`settings.css`·`model.ts`·`model.test.ts`, `src/shell/TitleBar.tsx`·`Icon.tsx`·`AppMenu.tsx`, `src/keymap/keyboard.ts`, `src/spec/metrics.ts`, `src/theme/theme.ts`·`theme.test.ts`.
    - K-12(Extensions 탭): 완료. `Ctrl-Shift-X`·"v" 메뉴로 파일이 아닌 탭 "Extensions"를 열고, 제목·검색·`All`/`Installed`/`Not Installed`·칩 `All`/`Themes`/`Icon Themes`·카드 목록을 만들었다. 카드는 복사한 자원만(One Dark·One Light·Zed (Default)), 메타데이터는 원본에 있는 것만, 오른쪽은 "Installed" 문구만이다. 네트워크·설치 기능은 없다(core D-8). 스펙 X-44~X-49. 변경 `src/extensions/`(신규 Extensions.tsx·extensions.css·model.ts·model.test.ts), `src/index.tsx`, `src/keymap/keyboard.ts`, `src/shell/KeymapEditor.tsx`·`app-menus.ts`·`app-menus.test.ts`, `src/spec/metrics.ts`.
    - tauri-leader 화면 재확인(2026-11-07): "v" 버튼 간격 4, 메뉴 키 표시, Extensions 탭, K-14 뒤 Settings 모양을 확인했다. Extensions 검색에 포커스가 있을 때 `Ctrl-,`가 동작하지 않는 것을 찾았다.
    - K-15(leader 재확인에서 나온 수정): 입력란 포커스에서도 Workspace·전역 바인딩을 dispatch하고 편집 키·IME·AltGr는 입력에 남기도록 v0.2 입력 보호 규칙을 고쳤다. 변경 `src/keymap/keyboard.ts`, `src/keymap/keyboard.test.ts`(신규). 재확인에서 Extensions 검색 포커스에서 `Ctrl-,`로 Settings 창이 열린다.
    - K-11(Keymap Editor): 완료. `Ctrl-K Ctrl-S`·"v" 메뉴로 편집 영역 탭 "Keymap Editor"를 열고, 필터·`Edit in JSON`·`Create Keybinding`, Edit·Action·Arguments·Keystrokes·Context·Source 표, 바인딩 편집 모달(녹화 최대 3타 K-055)을 만들었다. `%APPDATA%\workbench-tauri\keymap.json`에 JSONC를 보존하며 override 섹션을 더해 저장하고 바로 적용한다. Panel Layout에서 Agentic을 뺐다(Classic은 K-10-R1까지 비활성). 변경 `src/index.tsx`, `src/keymap/edit.ts`(신규)·`edit.test.ts`(신규)·`keyboard.ts`·`load.ts`, `src/shell/KeymapEditor.tsx`(신규)·`keymap-editor.css`(신규)·`AppMenu.tsx`·`Icon.tsx`·`Pane.tsx`·`app-menus.ts`·`app-menus.test.ts`, `src/spec/metrics.ts`, `src/theme/apply.ts`, `src/workspace/context.ts`·`store.ts`·`tabs.ts`·`watch.ts`, `src-tauri/src/lib.rs`·`user_keymap.rs`(신규).
    - 문서(W-08): SPEC R-2 "2단계" 절(core 결정, Settings 창 Zed 실측 표, "v" 버튼 Zed 실측, Keymap Editor).
    - 문서(W-09): SPEC R-2 2단계에 Settings 창·Panel Layout·메뉴 키·화면 확인·gpui와 다른 점, R-17에 메뉴 키 기준과 표(Redo `Ctrl-Y`, Close Editor `Ctrl-W`)·Licenses 확인, DECISIONS D-4(settings.json 처리, 두 갈래 기준)·D-5(Settings 창 capability).
    - 문서(W-10): SPEC R-2 2단계에 Extensions 탭·Zed와 다른 점, 입력란 포커스 키 처리, 화면 재확인, 남은 차이, K-12·K-15·C-23 확인 결과. PLAN Phase 6 비고 "2단계 완료(core 판정 대기)".
  - 결과: 완료(core 판정 대기). "v" 메뉴 Settings(별도 창)·Keymap(탭)·Extensions(탭)·Panel Layout(Classic·Custom)이 ORDER-06-R1 범위대로 열리고 동작한다. Settings 치수는 Zed 실측과 같다. Themes…·Icon Themes…는 Phase 7까지 비활성이다.
  - 남은 차이: Settings 범주 글자 시작 x 39(Zed 43, 4px 왼쪽).
  - 검증:
    - V1(K-11): `npm.cmd run typecheck` 통과, 관련 테스트 18/18·10/10, `npm.cmd run test` 123/123, `cargo check` 경고 없음, `cargo clippy -- -D warnings` 통과, `cargo test` 20개 통과, `npm.cmd run tauri build -- --debug --no-bundle` 통과, `git diff --check` 통과(`%TEMP%\v05-K-11-report.md`). 테스트는 실제 `%APPDATA%`를 쓰지 않았다.
    - V1(K-10-R1): typecheck 통과, `npm.cmd run test` 126/126, `cargo check`·`cargo clippy -- -D warnings` 통과, `cargo test` 20개, 디버그 빌드 통과, `git diff --check` 통과(`%TEMP%\v05-K-10-R1-report.md`).
    - V1(K-13): 관련 10/10, typecheck, `npm.cmd run test` 127/127, 디버그 빌드 통과(`%TEMP%\v05-K-13-report.md`).
    - V1(K-14): 관련 19/19·14/14, typecheck, `npm.cmd run test` 128/128, 디버그 빌드 통과(`%TEMP%\v05-K-14-report.md`).
    - 리뷰(C-22, K-11·K-10-R1): PASS. 데이터 손실 방지, 고정 경로, capability 범위, main capability·CSP 불변, 회귀 없음(`%TEMP%\v05-C-22-report.md`).
    - 화면 확인(tauri-leader, 1440×852·100%): Settings 900×750·탐색 225+1·검색 205×28·범주 28·padding 32·컨트롤 28·버튼 22가 Zed 실측과 같음. Keymap Editor 탭·열·91행. Panel Layout Classic만 체크(`specs/v0.5/verify/ORDER-06-R1/tauri-r1.json`, `tauri-settings.png`, `tauri-keymap-editor.png`, `tauri-panel-layout.png`).
    - V1(K-12): typecheck 통과, `npm.cmd run test` 130/130, 디버그 빌드 통과, `git diff --check` 통과(`%TEMP%\v05-K-12-report.md`).
    - V1(K-15): `src/keymap/keyboard.test.ts` 통과, typecheck 통과, 전체 131/131, 디버그 빌드 통과(`%TEMP%\v05-K-15-report.md`).
    - 리뷰(C-23, K-13·K-14·K-12): PASS, 지적 없음. typecheck, `npm.cmd run test` 131/131, `cargo test` 20개, `cargo clippy -- -D warnings` 경고 0(`%TEMP%\v05-C-23-report.md`).
    - 화면 재확인(tauri-leader, 1440×852·100%): "v" 버튼 22×22·최소화와 간격 4(Zed와 같음), Close Editor `Ctrl-W`·Redo `Ctrl-Y`·Extensions `Ctrl-Shift-X` 활성, Extensions 탭 구성과 카드 3개, K-14 뒤 Settings 모양, K-15 뒤 입력 포커스에서 `Ctrl-,` 동작(`specs/v0.5/verify/ORDER-06-R1/tauri-recheck.json`, `tauri-extensions.png`, `tauri-settings-after.png`, `tauri-settings-dropdown.png`, `tauri-user-menu.png`, `tauri-menu-edit.png`).
    - 문서: V0(실행 없음).
  - 특이사항:
    - C-22 권고: Settings 창이 파괴될 때 창별 캡션 상태 맵에서 그 항목을 지우면 더 깔끔하다(지금도 실질 누수는 아님).
    - Phase 7 인계: 테마를 복사할 때 Catppuccin MIT 고지(T-17.2)를 Licenses에 넣는다. 복사한 테마 JSON은 Extensions 목록에 다음 빌드부터 자동으로 들어가므로 목록이 늘어나는지 확인한다(ORDER-06-R1 2.3).
    - Extensions의 Zed와 다른 점: 복사 자원만, 칩 셋, 설치·제거·다운로드 수 없음, 단어 포함 검색, Headline 크기는 스펙에 없어 UI 글자 크기(SPEC R-2).
    - K-15 한계: 입력 포커스에서 수정자 없는 타건으로 끝나는 chord(예 `Ctrl-K V`)와 `Ctrl`+`Alt` Workspace 키는 이어지지 않는다(`shortcut:` 주석).
    - gpui와 다른 점(K-10-R1 읽은 시점): 테마 선택지(Phase 7에서 통일), settings.json 처리(core가 tauri 방식을 기준으로 정함, D-4), gpui Settings 창 치수 아직 없음.
    - Keymap Editor에서 하지 않은 것: 키로 찾기·필터 메뉴 버튼, 열 드래그, 가상 목록, 충돌 배너 전체, REC 애니메이션, 인자 있는 바인딩의 GUI 편집. 스펙에 없는 Keymap 행 높이·머리글 padding·모달 바깥 padding·작은 단축키 글꼴은 추정하지 않았다(SPEC R-2).
    - gpui 대조(K-11 읽은 시점): gpui Keymap은 아직 화면이 없어 열·문구를 대조할 수 없다. 파일 형식(Zed keymap.json 섹션 배열)은 같다. gpui 구현 뒤 다시 대조한다.
    - 빌드 경고: Vite 500 kB 초과 chunk, `web-tree-sitter` direct eval 2건(기존, 범위 밖).

- **ORDER-06-R2 tauri 문서 (R-2 / I-2, core ORDER-06-R2 2장)** (2026-11-07, 완료)
  - 무엇을 했나: W-12. SPEC R-2에 gpui가 대조할 표 두 개를 넣었다. (1) Extensions 화면 항목 표: 범주 칩·설치 상태 전환 순서, 검색 대상·규칙, 필터 조합, 정렬, 빈 상태 문구, 카드 필드별 출처·빈 값 처리·표시, 치수 스펙 ID(X-44~X-49). 근거는 `src/extensions/model.ts`·`Extensions.tsx`·`extensions.css`와 K-12 보고. (2) Settings 행 문구 표: Appearance 페이지 제목, 소제목 Theme·Buffer Font·UI Font, 네 행 제목·설명을 Zed `4304dec732` `page_data.rs` 문구와 줄 번호로 적고 앱 표시와 나란히 두었다. gpui SPEC R-2 Extensions 표를 읽어 다른 곳을 W-12 보고에 적었다(SPEC에는 쓰지 않음).
  - 결과: 완료. Settings 네 행의 제목·설명 문구는 Zed와 같다. 앱이 Zed와 다른 곳은 소제목 순서(앱 Theme → UI Font → Buffer Font, Zed Theme → Buffer Font → UI Font)와 Theme Mode·Icon Theme 선택 행이 없는 것이다(코드는 고치지 않음).
  - 후속(core ORDER-06-R2 결정, 2026-11-07): 소제목 순서를 두 갈래 모두 Zed 순서 Theme → Buffer Font → UI Font로 맞췄다(K-16, 검증 V1). Theme Mode·Icon Theme 선택 행은 core 결정대로 두지 않는다. SPEC R-2 행 표·문구 표를 고쳤다(W-13).
  - 검증: 문서만(V0, 실행 없음). SPEC·PROGRESS 제어 문자 0개.

### Phase 7 — 테마·아이콘 테마

- **ORDER-07 테마·아이콘 테마 (R-3·R-4 / I-3·I-4, core D-8·D-15)** (2026-11-07, 코드·문서 완료, 화면 검증 전)
  - 무엇을 했나:
    - K-17(커밋 `87a21ec`): `tools/fetch-zed-themes.ps1`(PowerShell 7, `fetch-zed-icons.ps1`과 같은 방식)로 고정 커밋·태그의 Zed Ayu·Gruvbox, Catppuccin v0.2.27, macOS Classic v0.4.0, Catppuccin Icons v1.24.0과 Zed (Default) 확장자 대응 문자열 표를 `.gitignore` 폴더에 복사했다. `.gitignore`에 다섯 폴더를 더했다. 테마 19종 + 커밋된 One 2종 = 21종, 아이콘 테마 Catppuccin 8종 + Zed (Default) = 9종.
    - K-18(커밋 `0113f2c`): 테마 레지스트리(`src/theme/themes.ts`·`registry.ts`)로 복사본에서 21종 목록을 만들고, 설치된 Zed 확장(`zlext`) 읽기와 고정 테마 셋을 없앴다. 기본값 One Dark. 빠진 토큰 대체 순서(JSON → 파생 T-26 → 같은 밝기 One → 고정)를 넣었다. Settings Theme 드롭다운 21종.
    - K-19(커밋 `df1ae22`): 모달 선택기(`src/shell/picker.ts`·`Picker.tsx`·`picker.css`)와 "Select Theme..."(미리보기·Esc 복원·저장, `Ctrl-K Ctrl-T`, Install Themes → Extensions Themes 범주). "v" 메뉴 Themes… 활성. 토큰 `text.placeholder` 추가(40개). 라이선스 glob을 `LICENSE*`와 `icon-themes`로 넓혔다.
    - K-20(커밋 `b469be1`): 아이콘 테마 9종(`src/theme/icon-themes.ts`·`icons.ts`), 파일 트리 `FileIcon`(T-22 결정 규칙), "Select Icon Theme..."(Install Icon Themes), "v" 메뉴 Icon Themes… 활성, Settings Icon Theme 드롭다운 9종. Lucide `file.svg`·`LICENSE-LUCIDE`를 지웠다. 탭 파일 아이콘은 넣지 않았다(Zed 기본 `tabs.file_icons` false).
    - K-21(커밋 `8313414`): Extensions 탭을 복사한 확장 셋의 `extension.toml` 카드(Catppuccin, Catppuccin Icons, macOS Classic Theme, 이름순, 태그 판정, GitHub 버튼)로 바꾸고 기본 묶음 카드를 없앴다. Zed (Default) 아이콘 경로를 `src/assets/` 기준으로 바꿔 `..`를 없애고, 경로 검사가 `..`를 모두 거부한다.
    - W-15: SPEC R-3·R-4(목록·기본값·선택기·토큰 대응 표·빠진 토큰·아이콘 결정 규칙·색·탭 아이콘 없음, "복사본 출처" 절), R-2 Extensions 표, R-1 유지한 자리·Licenses의 Lucide 언급을 고쳤다. DECISIONS에 D-6~D-10을 더했다.
  - 결과: 코드·문서 완료. 화면 대조(ORDER-07 4장 2·3의 V2 색 대조·V3 Zed 대조)는 아직이다.
  - 검증:
    - V1(K-17): 스크립트 문법 검사, 전체 실행 exit 0, 고정 커밋 4개·manifest 버전 3개 일치, 개수·이름·파일·라이선스·아이콘 경로 검사, `git check-ignore` 5030/5030, `git ls-files` 복사본 0개(`%TEMP%\v05-K-17-report.md`).
    - V1(K-18): typecheck 통과, `npm run test` 151/151(`%TEMP%\v05-K-18-report.md`).
    - V1(K-19): typecheck 통과, `npm run test` 158/158(`%TEMP%\v05-K-19-report.md`).
    - V1(K-20): typecheck 통과, `npm run test` 165/165, `npm run build` 1회(SVG가 `data:` 인라인 아님)(`%TEMP%\v05-K-20-report.md`).
    - V1(K-21): typecheck 통과, `npm run test` 167/167, `npm run build` 1회, 스크립트 재실행 exit 0(`%TEMP%\v05-K-21-report.md`).
    - 문서(W-15): V0(실행 없음).
  - 특이사항:
    - core 보고 대상: 탭 파일 아이콘 없음(ORDER-07 3.2 "파일 트리와 탭"과 Zed 기본 `tabs.file_icons` false·사용자 Zed 설정에 키 없음), Extensions 기본 묶음 카드 없음(D-7, D-15 해석), toml에 없는 Picker 값(D-10, gpui toml 반영).
    - 실측 필요: 선택기 P-001~P-006·P-010 치수·색과 위치·그림자, 21종 미리보기 전환과 색 대조, 아이콘 9종 전환·Catppuccin Latte Zed 대조·Zed (Default) 단색, Extensions 카드 3장 모양.
    - Zed와 다른 점: 선택기 스크롤바 숨김 없음, 최대 높이 목록에만, PageUp/PageDown 처음/끝, 커서 색 토큰 없음, 미리보기 중 외부 `settings.json` 변경이면 미리보기가 풀림, 퍼지 검색 자체 구현(D-9).
    - 원본 특이점: Zed (Default) 대응의 `bak → backup`은 `backup` 정의가 없어 기본 파일 아이콘으로 그린다.
    - Extensions 범주는 탭을 닫았다 열어도 마지막 값을 유지한다(Install Themes 뒤 메뉴로 열면 Themes 범주).
    - 테마 JSON은 시작 때 한 번 파싱(약 340KB), 아이콘 테마 목록은 빌드 때 고정. `dist` 약 16MB(Catppuccin SVG 5천여 개).
- **ORDER-07 마무리: K-22·C-24·V3** (2026-11-07, 완료·core 판정 대기)
  - 무엇을 했나:
    - K-22(커밋 `14f15c0`): 선택기 목록 스크롤바는 포인터가 목록 위일 때만 색이 보인다(P-004, 폭 L-308 6px `scrollbar.width.ui`, 트랙·썸 토큰). `settings.json`에 새 키를 덧붙일 때 앞 값 뒤 쉼표·첫 키 들여쓰기·줄바꿈 형식을 유지한다(`appendEntry`, 테스트 1건).
    - C-24: tauri-checker가 K-17~K-21을 리뷰했다.
    - V3(2026-11-07): 화면 측정과 Zed 대조.
    - W-16: PROGRESS·HERDR-SETUP·SPEC(Lucide 언급, 선택기 스크롤바)·PLAN(Phase 7 상태) 문서.
  - 결과:
    - C-24 PASS: 복사본 추적 0건, 실행 중 Zed 폴더·네트워크 읽기 없음, 고정 커밋·태그 일치, `resolveAsset` 거부 9건 테스트, `cargo test` 20개·clippy 경고 0.
    - V3: One Dark 8곳이 Zed와 차이 1 이하. 21테마 CSS 값 = JSON(macOS Classic Dark `text.accent`만 대체값). 그린 색 차이는 평면 3 이하, 반투명 선택 7 이하. Catppuccin Latte 아이콘 22행 일치. 선택기 프레임 x 448–991, top 80으로 Zed와 같다. 테마 21·아이콘 테마 9 목록, Esc 복원·Enter 저장 확인.
  - 검증:
    - V1(K-22): typecheck 통과, `npm run test` 168/168.
    - V3: 측정 조건 1920×1080·100%, 창 1440×852. 결과 파일 `specs/v0.5/verify/ORDER-07/`(`tauri-*.png`·`tauri-*.json`, `zed-*.png`, `cmp-icons-zed-top-tauri-bottom.png`).
    - 문서(W-16): V0(실행 없음).
  - 남은 차이(이 Phase 밖이거나 결정 필요):
    - Zed "View Theme Docs" 없음(ORDER-07 3.1에서 제외).
    - 선택기 구문 색 미리보기(Phase 11).
    - 파일 트리 정렬(`package.json`/`package-lock.json` 순서)과 `.git` 표시(이 Phase 밖).
    - 탭 파일 아이콘: Zed 기본 `tabs.file_icons`=false라 그리지 않음(core 확인).
    - 기본 묶음 Extensions 카드 없음(Zed 동작, `DECISIONS.md` D-7).
    - 스크롤바 자동 숨김 1초(E-033)·썸 최소 25px 생략.
  - coder 되돌림: 14:08 K-22가 끝난 뒤 Sonnet 5.5 coder를 `/quit`로 종료했다. Codex gpt-6.1-sol medium 시작은 pane `wJ:pM`이 입력에 반응하지 않아 아직 못 했다(`herdr agent start` timeout 2회). 되돌린 시각은 끝나면 leader가 다시 알린다(`HERDR-SETUP.md` 1장 같은 기록).
    - 되돌림 완료(W-18): 2026-11-07 14:57에 coder를 Codex gpt-6.1-sol medium으로 되돌렸다. 14:08 Sonnet 종료 뒤 pane에 입력이 줄 일부만 들어가 PowerShell이 계속 입력 상태로 멈춰 있던 것을 `Ctrl-C`로 풀고 `herdr agent start`로 띄웠다(`HERDR-SETUP.md` 1장 같은 기록).
- **core 결정 반영(문서)** (2026-11-07, W-17)
  - 무엇을 했나: core-leader [DECISION](사용자 위임 core D-13, ORDER-07 두 갈래 공통) 여섯 가지를 문서에 적었다. ① 탭 파일 아이콘은 Zed 기본 `tabs.file_icons`=false대로 그리지 않고 아이콘 테마는 파일 트리에만 ② Extensions는 `extension.toml`이 있는 확장(Catppuccin 0.2.27, Catppuccin Icons 1.24.0, macOS Classic 0.4.0)만 카드, 내장 테마는 안 보임 ③ toml에 없는 선택기 값(D-10)은 gpui writer가 toml ID를 올리고 tauri는 그 ID로 바꿔 참조 ④ 빠진 토큰 대체 순서 D-8을 두 갈래 공통으로 ⑤ Monochrome 4종 포함, 테마는 dark 이름순 → light 이름순, 아이콘 테마 9종 ⑥ 선택기 스크롤바는 목록 위 포인터일 때만.
  - 결과: DECISIONS D-7·D-8·D-10과 미결 사항, SPEC R-2 Extensions(기본 묶음 카드)·R-3(Monochrome, 탭 아이콘 확정)·R-4(선택기 스크롤바, toml 밖 값, 대체 순서)에 "core 결정 2026-11-07"을 근거로 적었다. 탭 아이콘·기본 묶음 카드의 "core 보고 대상·확인 필요" 표현을 확정으로 바꿨다(이 PROGRESS의 앞 항목은 지난 기록이라 그대로 둠).
  - 남은 일: ③ gpui toml 갱신 대기. 올라오면 `spec/`을 다시 복사하고 `src/spec/metrics.ts`·`src/shell/picker.css`의 값을 toml ID 참조로 바꾸는 coder 카드가 필요하다.
  - 검증: V0(문서만, 실행 없음).

### Phase 8 — 상태 바

- **ORDER-08 Zed 확인 결과 기록 (R-5·R-19·R-22 / I-5·I-19·I-22)** (2026-11-07, W-18)
  - 무엇을 했나: core ORDER-08 2장의 Zed 확인 결과(Zed `4304dec` 설치본, 1440×852, One Dark, 사용자 `base_keymap` VSCode, 캡처 `specs/v0.5/verify/ORDER-08/zed-*.png`)를 SPEC에 "Zed 확인(2026-11-07)"으로 적었다. R-5: 편집 중·선택 있음·열린 탭 없음·Project Search 결과 탭·Diagnostics 탭의 상태 바 오른쪽 표시(R-5 "열린 탭 없음" 미정이 풀림). R-19: dock 열림 `file_tree` 강조색, 사이드바 열림 때 토글이 사이드바 아래로 감. R-22: 왼쪽 버튼 순서·툴팁·구분선, Add Project 없음, Project Search 탭 구성·동작, Diagnostics 탭 구성.
  - 결과: 문서만. 파일 형식 대응 표는 자리만 두었다("대응 표: K-24 뒤").
  - 검증: V0(문서만, 실행 없음).
- **K-23 선택기 값을 gpui toml ID로 (core ORDER-07 결정 3, ORDER-08 추가 지시)** (2026-11-07, 커밋 `9509ae4`)
  - 무엇을 했나: gpui `spec/zed-metrics.toml`·`spec/ambiguous.md`·`spec/INDEX.md`를 그대로 복사하고, `src/spec/metrics.ts`·`src/shell/picker.css`의 선택기 값(그림자 `shadow.1~4`, `line_height_ratio`, `theme_selector.check_icon_size`, `item.font_size` 등)을 toml ID 참조로 바꿨다. 값은 같다.
  - 결과: `DECISIONS.md` D-10의 대기가 끝났다. `measured.*`와 ambiguous 2건(384 범위·행 높이)은 바꾸지 않았다.
  - 검증: V1. typecheck 통과, `npm.cmd run test` 168/168, `git diff --check` 통과, spec 세 파일이 gpui 원본과 바이트 단위로 같음(`%TEMP%\v05-K-23-report.md`).
- **K-24 상태 바 위치·파일 형식 (R-5 / I-5)** (2026-11-07, 커밋 `c26e851`)
  - 무엇을 했나: 상태 바 오른쪽에 `{line}:{column}`(선택 정보 포함)과 파일 형식 이름을 보인다(`src/editor/position.ts`·`filetype.ts`·`filetypes.json`, `src/shell/status.ts`). 파일 형식 대응 표는 Zed `crates/grammars/src/*/config.toml`에서 뽑았다. 미리보기는 누른 블록의 원본 시작 줄·열 1.
  - 결과: SPEC R-5 "구현"·"파일 형식 대응 표"에 적었다. 미리보기 클릭 위치는 core 결정(2026-11-07)으로 "가장 안쪽 블록의 원본 시작 줄, 열 1"이 확정됐다(`DECISIONS.md` D-13). 블록 종류 표는 K-28 뒤.
  - 검증: V1. typecheck 통과, 관련 테스트 9/9(한글·보조 평면·결합 문자 포함), `git diff --check` 통과(`%TEMP%\v05-K-24-report.md`).
  - 실측 필요(V3): 상태 바 오른쪽 배치, L-29 간격, L-97 글꼴, 커서·선택·탭/pane/폴더 전환, 도구 탭·빈 탭 숨김, 미리보기 클릭 위치.
- **K-25 상태 바 왼쪽 버튼·켜짐 표시·구분선 (R-19·R-22 / I-19·I-22)** (2026-11-07, 커밋 `c5e78a3`)
  - 무엇을 했나: 왼쪽 버튼을 사이드바 토글(닫힘 때만) → `file_tree` → 검색 → 진단(✓) 순서로 바꾸고 상태 바 Add Project를 뺐다. dock 열림이면 `file_tree`가 `text.accent`. 새 액션 `pane::DeploySearch`(`Ctrl-Shift-F`)·`diagnostics::Deploy`(`Ctrl-Shift-M`)를 `STATUS_BINDINGS`로 연결했다. 구분선은 사용자 추가 지시로 실측값(1×16, `border`)으로 넣었다가 core-leader NOTICE로 gpui `statusbar.left_divider.*` ID로 바꿨다(gpui `spec/zed-metrics.toml`·`INDEX.md` 다시 복사).
  - 결과: SPEC R-22 "구현 — 상태 바 왼쪽 버튼"에 적었다(`DECISIONS.md` D-12).
  - 검증: V1. typecheck 통과, 관련 테스트 7/7, 구분선 뒤 3/3, ID 반영 뒤 3/3, `git diff --check` 통과, spec 두 파일 gpui와 바이트 단위 같음(`%TEMP%\v05-K-25-report.md`).
  - 실측 필요(V3): 버튼 순서·위치·툴팁, dock 열림/닫힘 색과 배경, 사이드바 열림/닫힘 토글 이동, 구분선 폭·높이·색과 좌표 x 28·59, y 829.
- **K-26 Project Search 탭 (R-22 / I-22)** (2026-11-07, 커밋 `1ac4fbe`)
  - 무엇을 했나: Rust `src-tauri/src/project_search.rs`(백그라운드 순회·검색, Channel 결과, 취소)와 `src/search/`(탭 UI)로 Project Search를 만들었다. 의존성 `ignore` =0.4.34·`regex` =1.13.1을 더하고 라이선스 원문 4개를 `src/licenses/`에 두어 Licenses 창에 연결했다.
  - 결과: SPEC R-22 "구현 — Project Search 탭", `DECISIONS.md` D-11에 적었다. Replace 쓰기는 분리했다(K-29 진행 중).
  - 검증: V1. typecheck 통과, 프런트 관련 테스트 13/13, Rust 검색 테스트 2/2, `cargo check`·`cargo clippy -- -D warnings` 통과, 라이선스 4개가 배포본과 바이트 단위 같음(`%TEMP%\v05-K-26-report.md`).
  - 실측 필요(V3): 빈 상태·툴바·필터·Replace 줄·결과·접기·이전/다음·파일 위치 열기·탭 재활성화·검색 취소·상태 바.
  - 특이사항: 링크·junction을 따라가지 않는다(Zed는 루트 안 링크를 따라감). 결과 행 클릭은 그 행의 첫 일치이고 클릭한 글자의 열은 계산하지 않는다.
- **리더 검사 (K-26 뒤)** (2026-11-07): typecheck 통과, `npm test` 177/177, `cargo test` 22개, clippy 경고 0(tauri-leader).
- **W-19 Phase 8 문서** (2026-11-07): SPEC R-5(구현·미리보기 클릭 위치·파일 형식 대응 표)·R-22(버튼 표·Project Search 구현 범위), DECISIONS D-11~D-13, D-10 대기 해소. 검증 V0(문서만).
- **K-27 Diagnostics 탭 (R-22 / I-22, core D-17)** (2026-11-07, 커밋 `5f68440`)
  - 무엇을 했나: 진단 버튼·`Ctrl-Shift-M`으로 여는 Diagnostics 탭(`src/diagnostics/`)을 만들었다. 탭 제목 "No problems"와 `success` 색 `check`, 가운데 "No problems in workspace", Zed와 같은 툴바 아이콘 다섯 개(Collapse All Files, Buffer Search, Inline Assist, Refresh Diagnostics, Exclude Warnings)와 툴팁.
  - 결과: 툴바 버튼은 모두 비활성이다. 결과가 없고(접기·검색), AI 기능이 없고(Inline Assist), 진단 출처가 없어서다(갱신·경고). 언어 서버·진단 수집은 만들지 않았다(core D-17). 캡처의 스파클은 `zed_assistant`, 새로고침은 `arrow_circle`로 Zed 소스에서 확인했다(`sparkle.svg`·`refresh_title.svg`로 추정하지 않음). SPEC R-22 "구현 — Diagnostics 탭"에 표를 적었다.
  - 검증: V1. typecheck 통과, 관련 테스트 5/5, 액션명 보정 뒤 typecheck·진단 모델 테스트 1/1 다시 통과, `git diff --check` 통과(`%TEMP%\v05-K-27-report.md`).
  - 실측 필요(V3): 탭 제목·체크 모양과 `success` 색, 툴바 배치·아이콘·툴팁, 가운데 본문, 재활성화·닫기, 상태 바 숨김.
- **리더 검사 (K-27 뒤)** (2026-11-07): `npm test` 178/178(tauri-leader).
- **K-28 미리보기 클릭 위치 확인 (R-5 / I-5, core 결정·D-13)** (2026-11-07, 커밋 `9c52d07`)
  - 무엇을 했나: `src/editor/markdown.test.ts`에 렌더 결과 기준 테스트 4개(목록 항목·느슨한 목록 문단·코드 블록·인용 안 문단·표 행)와 테스트 전용 조상 탐색 도우미를 더했다. 앱 코드는 바꾸지 않았다.
  - 결과: 기존 구현(`data-line` 가장 가까운 조상, 줄 + 1, 열 1)이 core 결정 "가장 안쪽 블록의 원본 시작 줄, 열 1"과 같았다. 블록 종류 표를 SPEC R-5에 적었다. 표 셀은 그 행(tr)의 시작 줄이며 현재 동작으로 두고 core 확인을 요청했다.
  - 검증: V1. `src/editor/markdown.test.ts` 9/9(기존 5 + 새 4), typecheck 통과, `git diff --check` 통과(`%TEMP%\v05-K-28-report.md`).
- **W-20 문서** (2026-11-07): SPEC R-5 블록 종류 표·표 셀 동작(core 확인 요청), R-22 Diagnostics 탭 구현 절, R-22 버튼 툴팁 키 표시를 코드(`status.ts`·`tooltip.ts`·`builtin.ts`)로 확인해 고침(W-19 확인 필요 해소). DECISIONS D-13에 표 위치 한 줄. 검증 V0(문서만).
- **coder 교체 기록 (core D-16)** (2026-11-07, W-21): 15:57에 Codex gpt-6.1-sol medium의 5시간 한도가 바닥났다(K-29 진행 중, 다시 쓸 수 있는 시각 19:05). D-16대로 `tauri-coder`를 Claude Code Sonnet 5.5 high로 바꿨다(`herdr agent start tauri-coder --kind claude --pane wJ:pM -- --model sonnet --effort high`, 이름 유지). K-29는 Sonnet이 작업 트리의 중간 결과에서 이어서 한다. 되돌릴지는 core-leader 지시를 따른다(앞 14:00 결정은 그 회차에만 적용). `HERDR-SETUP.md` 1장에 같은 기록을 적었다. 검증 V0(문서만).
- **W-22 R-22 상태 바 Zed 실측 근거 (gpui 대조용, core-leader 요청)** (2026-11-07): SPEC R-22 상태 바 버튼 절에 "Zed 실측 근거(2026-11-07)" 소절을 더했다(조건, 글리프 잉크·버튼 박스·구분선 좌표 표, 간격과 Zed 소스 근거 표, 진단 ✓ 구성과 숨은 `lsp_button` 자리, padding 4, toml ID `statusbar.padding_x`·`statusbar.toggle_gap`은 gpui가 올리는 중이고 tauri는 임시 metrics 값(K-31), tauri V3(K-31 전) 잉크 5·37·68·95·구분선 26·57, K-31 뒤 재측정). 검증 V0(문서만).
- **K-29 검색 루트·Replace Next (R-22 / I-22)** (2026-11-07, 커밋 `87a78ca`)
  - 무엇을 했나: 검색 루트를 부른 창의 폴더로 검사한다(`state::window_folders`). Replace Next는 Rust `prepare_search_replace`가 편집을 계산하고 열린 편집기에 반영해 미저장으로 둔다. 검색 뒤 디스크·편집기·옵션이 바뀌었거나 작업 공간 밖이면 거부한다. 정규식 `$1`·`${1}`·`$$`, `\n`·`\t`·`\\`.
  - 결과: 2a까지. Replace All과 편집기 없는 파일은 K-30으로 넘겼다. Codex가 쓴 코드를 15:57 교체 뒤 Sonnet이 읽어 확인했다(W-21).
  - 검증: V1. typecheck 통과, `npm run test` 183/183, `cargo test` 24개, clippy 경고 0(`%TEMP%\v05-K-29-report.md`).
- **K-30 Replace All (R-22 / I-22)** (2026-11-07, 커밋 `d8d663a`)
  - 무엇을 했나: `replacement_edits`로 파일 하나의 일치 여럿을 한 번에 계산하고 Replace All을 만들었다. 편집기 없는 파일은 일반 탭으로 열어 미저장으로 바꾼다(리더 결정). 거부된 파일만 건너뛰고 끝에 알린다.
  - 결과: Zed `replace_next`(1407~1440)·`replace_all`(1442~1485)도 저장하지 않음을 소스로 확인했다. SPEC R-22 "Project Search 갱신"에 적었다. 판단 기록: 건너뛴 파일 알림 문구는 Zed에 없어 coder가 정했고, 편집기 없던 파일이 많으면 탭이 그만큼 열린다.
  - 검증: V1. typecheck 통과, `npm run test` 183/183, `cargo test` 25개(`replace_all_skips_only_files_that_changed_after_the_search` 추가), clippy 경고 0(`%TEMP%\v05-K-30-report.md`).
  - 사용자 확인 필요: Replace All 동작(편집기 없는 파일이 탭으로 열려 미저장으로 남는지, 알림 문구).
- **ORDER-08 V3 1차** (2026-11-07, tauri-leader, 1920×1080·100%, 창 1440×852, One Dark)
  - 무엇을 했나: 상태 바·Project Search·Diagnostics를 재고 Zed 캡처와 맞췄다. 결과 파일 `specs/v0.5/verify/ORDER-08/tauri-v3.json`·`tauri-v3-probe.json`과 `tauri-*.png`.
  - 결과:
    - 같음: 위치·선택 문구 `5:23 Markdown`·`5:28 (5 characters) Markdown`, 툴팁 4개(`Open Folder Sidebar Ctrl-Alt-J`, `Close Left Dock Ctrl-B`, `Project Search Ctrl-Shift-F`, `Project Diagnostics Ctrl-Shift-M`), dock 켜짐 색 `#74ade8`, 구분선 높이 16·색 (70,75,87), 미리보기 클릭 6:1(기대 6), 탭 없음일 때 숨김, Diagnostics 문구.
    - 다름 → K-31: 구분선 위치 −2(26·57, Zed 28·59), 아이콘 −2~−6(잉크 5·37·68·95, Zed 9·39·70·101), 검색 결과 열기 때 일치 선택 없음.
    - 다름 → K-32: Project Search 화면(빈 상태, 검색칸, 결과 머리줄, 일치 강조 등).
    - 다름 → K-33: 사이드바를 상태 바로 열고 `Ctrl-Alt-J`로 닫은 뒤 `Ctrl-Shift-V`가 미리보기 대신 붙여넣기가 됐다.
  - 특이사항: 측정 중 편집기 버퍼에 클립보드 내용이 붙여넣어졌으나(probe의 `AGENTS.md*`) 저장하지 않았고 디스크는 바뀌지 않았다.
  - 앱 실행 횟수(W-24, leader 전달): ORDER-08 V3의 tauri 실행은 모두 5회다. 매번 띄운 PID만 닫았고 앱 데이터 복원 차이는 0이다.
    1. o8 1차: 편집기 클릭 좌표가 화면 밖(`.cm-content` 중심)이라 커서·선택 측정이 실패했고, 사이드바가 열린 상태라 위치를 비교할 수 없었다 → 스크립트를 고쳤다.
    2. o8 2차(`tauri-v3.json`): 본 측정.
    3. probe(`tauri-v3-probe.json`): 미리보기 클릭·탭 없음 재측정.
    4. 재측정(`tauri-v3-re.json`, K-31~K-33 뒤): 상태 바 위치·Escape·`Ctrl-Shift-V`·결과 열기 선택·Diagnostics. Project Search가 K-32에서 깨진 것을 발견 → K-34.
    5. 재측정(K-34 뒤, `tauri-re-*.png` 덮어씀): Project Search 한 줄 툴바·결과 줄·강조.
- **K-31 상태 바 여백·토글 간격·결과 열기 선택 (V3 불일치)** (2026-11-07, 커밋 `c281499`)
  - 무엇을 했나: 상태 바 padding을 네 변 4로(Zed `status_bar.rs:153`), 토글과 구분선 사이를 2로(`status_bar.rs:280-287` `gap_0p5`), 진단 앞에 폭 0 자리를 두어 숨은 `lsp_button` 자리의 gap 4를 만들었다. 검색 결과를 열 때 일치를 선택한다(anchor 시작, head 끝).
  - 결과: 예상 위치는 버튼 left 4·33·64·94, 구분선 28·59(Zed와 같음). V3로 다시 재야 확인된다. `statusbar.padding_x`·`statusbar.toggle_gap`은 toml ID가 없어 임시 metrics 값이다(SPEC R-22 "toml에 없는 값").
  - 검증: V1. typecheck 통과, `npm run test` 183/183(`status.test.ts` 단언 추가)(`%TEMP%\v05-K-31-report.md`).
- **K-32 Project Search·Diagnostics 화면 Zed 맞춤 (V3 불일치)** (2026-11-07, 커밋 `1724f8b`)
  - 무엇을 했나: 빈 상태 크기·키 위치, 검색칸 포커스 윤곽 없음·`‹ ›` 아이콘·`1/19` 묶음, 결과 머리줄(상대 폴더, Open File `Alt-Enter`), 일치 강조 토큰(빠져 있던 원인), 긴 줄 줄바꿈, 발췌 경계, Diagnostics 툴바 높이 45와 포커스 윤곽.
  - 결과: SPEC R-22 "Project Search 갱신"에 적었다. toml에 없는 값 10개는 "toml에 없는 값" 표. breadcrumb·펼치기 동작·머리줄 아이콘·Filters 줄 모양은 하지 않았다.
  - 검증: V1. typecheck 통과, `npm run test` 184/184(`activeSpan`·`excerptsOf`·`relativeDir`, 토큰 목록 4개 추가)(`%TEMP%\v05-K-32-report.md`).
  - 실측 필요(V3): 빈 상태, 검색칸·`‹ ›`·`1/19`, 머리줄, 일치 배경 2종, 줄바꿈, 발췌 경계·거터 화살표, Diagnostics 툴바(아이콘 y 87)·본문(y 466), 포커스 윤곽 없음.
  - 사용자 확인 필요: 머리줄 모서리 모양과 거터 화살표 인상.
- **K-33 포커스 복귀·Ctrl-Shift-V·편집기 Escape (V3 불일치)** (2026-11-07, 커밋 `142f1c4`)
  - 무엇을 했나: 사이드바·dock을 닫을 때 포커스를 `.pane` 요소가 아니라 활성 편집기로 돌린다(`focusPane`). `ctrl-shift-v`를 `BROWSER_KEYS`에 넣어 바인딩이 없을 때 붙여넣기가 되지 않게 했다(Zed는 Editor 일반에 `ctrl-shift-v` 붙여넣기 없음). 편집기 Escape로 선택을 푼다(Zed `editor::Cancel`, CodeMirror `simplifySelection`).
  - 결과: 원인은 사이드바를 연 상태 바 버튼이 사라져 포커스가 `.pane`으로 떨어져 `Editor extension=md` 컨텍스트가 없던 것이다. SPEC R-5 "구현"에 Escape 한 줄.
  - 검증: V1. typecheck 통과, `npm run test` 185/185(`keyboard.test.ts`)(`%TEMP%\v05-K-33-report.md`).
  - 실측 필요(V3 합성 입력): 재현 순서에서 미리보기가 열리는지, Escape로 선택이 풀리는지.
- **K-34 Project Search 툴바·결과 줄 회귀 고침** (2026-11-07, 커밋 `b06c1ce`)
  - 무엇을 했나: 첫 툴바 줄만 `flex-wrap: nowrap`으로 하고 검색칸이 줄어들게 했다(묶음들은 `flex: none`, Zed `toolbar.rs:120-150` padding). 결과 줄 grid 칸을 3개(거터 | 번호 | 코드 `minmax(0, 1fr)`)로 고쳤다.
  - 원인:
    - 툴바: `flex-wrap: wrap` 상태에서 검색칸 `flex-basis` 1200이 줄 폭보다 커서 줄바꿈이 먼저 일어나 검색칸이 한 줄을 차지했다.
    - 결과 줄: grid 칸 4개에 자식 3개라 코드가 29px 칸에 들어가 글자마다 줄이 바뀌었다.
  - 검증: V1. typecheck 통과, `npm run test` 185/185(`%TEMP%\v05-K-34-report.md`).
- **ORDER-08 V3 재측정 결과 (K-31~K-34 뒤)** (2026-11-07, tauri-leader, 같은 조건)
  - 상태 바: 글리프 잉크 x 9·39·70·101, 구분선 28·59로 Zed와 같다(차이 0, core 기준 1px 이내). 오른쪽 끝 여백 4(`status-items` right 1436/1440).
  - Escape 뒤 `5:28 Markdown`(선택 해제). 사이드바 토글 → `Ctrl-Alt-J` → `Ctrl-Shift-V`로 미리보기가 열리고 붙여넣기는 없다. 결과 `Alt-Enter` 뒤 `45:35 (8 characters) Markdown`(Zed와 같음). Diagnostics 문구 y 465.5(Zed 466).
  - Project Search: 툴바 한 줄, 머리줄 상대 폴더·Open File `Alt-Enter`, 발췌 경계·화살표, 일치 강조 두 색, 줄바꿈이 Zed 캡처와 같은 틀이다.
  - 결과 수 tauri `1/20` 대 Zed `1/19`: 차이는 Zed 캡처 뒤에 생긴 측정 파일 `specs/v0.5/verify/ORDER-08/tauri-v3.json` 한 건이다(rg로 20건, 같은 규칙).
  - 결과 파일: `specs/v0.5/verify/ORDER-08/tauri-v3-re.json`, `tauri-re-*.png`.
- **W-23 문서** (2026-11-07): SPEC R-22 "toml에 없는 값" 표(12개)·"Project Search 갱신"(K-29~K-32), R-5 Escape 한 줄, 이 PROGRESS의 K-29~K-33·V3 1차. 검증 V0(문서만). coder 교체(15:57)는 W-21 항목 그대로.
- **W-24 Phase 8 마무리 문서** (2026-11-07): 앱 실행 5회 이유, K-34·재측정 결과, SPEC R-22 "toml에 없는 값" 표에 L-84 닫기 버튼 색 행, PLAN Phase 8 "완료(core 판정 대기)". 검증 V0(문서만).
- **K-35 상태 바 값 2개 toml ID 반영** (2026-11-07, 커밋 `49e390f`)
  - 무엇을 했나: gpui `spec/` 세 파일(`zed-metrics.toml`·`INDEX.md`·`ambiguous.md`)을 다시 복사하고, `src/spec/metrics.ts`의 `statusbar.padding_x`(4)·`statusbar.toggle_gap`(2) 주석 "no toml ID yet"을 toml 키와 Zed 출처로 바꿨다. 값은 그대로다.
  - 결과: 두 값이 toml ID(toml 276·277행)와 같다. Project Search 10개는 K-36으로 남겼다.
  - 검증: V0. typecheck 통과, `npm run test` 185/185, `spec/` 세 파일이 gpui와 바이트 단위 같음(`cmp`)(`%TEMP%\v05-K-35-report.md`).
- **K-36 나머지 10개·닫기 버튼 색 toml ID 반영 (gpui W-38)** (2026-11-07, 커밋 `bb7b043`)
  - 무엇을 했나: gpui W-38(`D:\projects\workbench-gpui\specs\v0.5\cards\W-38.report.md`)이 tauri SPEC R-22 표의 나머지를 toml에 올린 뒤 `spec/` 세 파일을 다시 복사했다. Project Search 10개(`editor.search_input.max_width`, `search_results.header.*` 7개, `search_results.matches.padding_left`, `search_results.count.min_width`)의 이름·값이 toml과 같아 주석만 toml 출처로 바꿨다. 닫기 버튼은 `titlebar.window_button.close.hover_background` `#E81120`·`.hover_foreground` `#FFFFFF`·`.active_opacity` 0.8을 `metrics.ts`에 올리고 `src/shell/title-bar.css`의 하드코딩 색을 `--titlebar-window-button-close-*` 변수로 바꿨다.
  - 결과: `src`에 "no toml ID"가 0개다. SPEC R-22 표를 "등록됨(gpui W-38, tauri K-35·K-36)"으로 고쳤다(W-25). 누름 상태는 toml 설명대로 배경과 글자 모두 80%라, 이전(글자 100%)과 누름 중 글자만 달라진다.
  - 검증: V1. typecheck 통과, `npm run test` 185/185, `grep -rniE "no toml ID" src tools src-tauri/src` 0개, `spec/` 세 파일 gpui와 바이트 단위 같음(`%TEMP%\v05-K-36-report.md`).
  - 실측 필요(V3): 닫기 버튼 hover 색 `#E81120`·누름 80%(hover·누름 조작이 필요해 V2로는 못 잼).
  - 특이사항: `search_results.header.radius` 2는 소스로 직접 확인하지 못한 값이라 gpui `spec/ambiguous.md` 6절에 확인 필요로 남아 있다.
- **W-25 문서** (2026-11-07): SPEC R-22 "toml에 없던 값" 표를 등록됨으로, ID 칸을 toml ID로(닫기 버튼 행은 ID 3개), PROGRESS K-35·K-36. 검증 V0(문서만).
- **K-37 Project Search 빈 화면 글자 크기를 toml ID로 (core-leader 결정, gpui W-39)** (2026-11-07, 커밋 `2d09250`)
  - 무엇을 했나: gpui `spec/` 세 파일을 다시 복사하고, toml `[project_search]`의 `project_search.landing.heading_size` 16·`subtitle_size` 14·`subtitle_margin_bottom` 8·`action_label_size` 14·`key_size` 14·`gap` 4를 `metrics.ts`에 올려 `src/search/search.css` 빈 화면 규칙이 쓰게 했다.
  - 결과: 값이 바뀐 곳은 키 크기 12 → 14뿐이다(Zed 소스 값, core-leader 결정 2026-11-07). SPEC R-22 "Project Search 갱신"에 표를 적었다. Zed 캡처의 약 13px과의 차이는 재확인 대상, Phase 12 V4(`spec/ambiguous.md` 6절).
  - 검증: V1. typecheck 통과, `npm run test` 185/185, `spec/` 세 파일 gpui와 바이트 단위 같음(`%TEMP%\v05-K-37-report.md`).
  - 실측 필요: 빈 화면 제목·안내·다섯 줄·키 글자 크기(소스 14 대 캡처 약 13).
- **W-26 문서** (2026-11-07): SPEC R-22 빈 화면 글자 크기 표와 V4 재확인, PROGRESS K-37. 검증 V0(문서만).

### Phase 9 — 탭 바와 편집 영역 상단

- **ORDER-09 Zed 확인 결과 기록 (R-10·R-11·R-12·R-16·R-23 / I-10·I-11·I-12·I-16·I-23)** (2026-11-07, W-27)
  - 무엇을 했나: core ORDER-09의 Zed 확인 결과(Zed `4304dec` 설치본, 1440×852, One Dark, 사용자 `base_keymap` VSCode, 캡처 `specs/v0.5/verify/ORDER-09/zed-*.png`)를 SPEC 다섯 절에 "Zed 확인(2026-11-07)" 표로 적었다(gpui가 읽어 씀). R-10 툴팁·비활성·이동 기록 순서, R-11 탭 툴팁 절대 경로·"+" 툴팁, R-12 경로 줄(마크다운·코드·폴더 둘·분할), R-16 넘침, R-23 버튼이 보이는 조건(pane 포커스). R-12·R-16·R-23의 "미정"이 풀렸다.
  - 결과: 문서만. 이동 기록 기준(최소 줄 수 등)은 K-38에서 coder가 Zed 소스로 확인한다.
  - 특이사항(측정 메모): workbench-core 폴더는 읽기만 했고 Zed 확인 전후 두 레포 `git status`를 확인했다(`.zed` 폴더 없음). core에 새로 생긴 `specs/v0.5/orders/ORDER-10.md`는 core-leader 카드다.
  - 검증: V0(문서만, 실행 없음).
- **K-38 뒤로·앞으로 이동 기록 (R-10 / I-10)** (2026-11-07, 커밋 `b52f848`)
  - 무엇을 했나: pane별 이동 기록 모델(`src/workspace/nav-history.ts`)과 연결(탭을 떠날 때·10줄 이상 이동 때 쌓기, 닫힌 탭 다시 열기, 버튼 흐림·툴팁, `Alt-Left`/`Alt-Right`)을 만들었다. 규칙은 Zed 소스로 확인했다(SPEC R-10 "이동 기록 규칙").
  - 결과: Zed 캡처 순서(AGENTS 5:23 → App.tsx → 66줄 → 뒤로·뒤로·앞으로·앞으로 → 75줄(9줄, 기록 안 됨) → 뒤로 = App.tsx 1:1)를 테스트로 재현했다. Go to Line은 앱에 없다. 삭제된 파일 기록 제거는 모델에만 있다.
  - 검증: V1. typecheck 통과, `npm run test` 188/188(`nav-history.test.ts` 3개)(`%TEMP%\v05-K-38-report.md`). 연결부는 코드 확인.
  - 실측 필요(V3): Zed 순서 재현(Go to Line 대신 66줄 이상 클릭), 버튼 흐림·툴팁 키.
- **K-39 탭 툴팁·넘침·오른쪽 버튼 조건 (R-11·R-16·R-23 / I-11·I-16·I-23)** (2026-11-07, 커밋 `3a939dd`)
  - 무엇을 했나: 탭 툴팁 규칙(`tabTooltip`: 파일 절대 경로, 읽기 전용 메타, Project Search 검색어, Diagnostics "Project Diagnostics", Settings·Keymap·Extensions 없음). 넘침: 휠 한 칸 77.7px 가로 스크롤, 활성 탭 `scrollIntoView` nearest, 하단 선을 배경 선으로. 오른쪽 버튼 조건은 확인만(고친 것 없음).
  - 결과: SPEC R-11·R-16·R-23 "구현"에 적었다.
  - 검증: V1. typecheck 통과, `npm run test` 190/190(`tab-view.test.ts` 2개)(`%TEMP%\v05-K-39-report.md`).
  - 실측 필요(V3): 탭 10개 이상 넘친 상태에서 휠 한 칸(약 78px)·활성 탭 보이기·하단 선, 탭 hover 툴팁과 지연.
- **K-40 경로 줄 (R-12 / I-12)** (2026-11-07, 커밋 `4c92570`)
  - 무엇을 했나: 편집기 툴바 왼쪽에 경로 + 마크다운 제목 계층(`src/editor/breadcrumbs.ts`)을 보인다. 폴더 둘이면 루트 이름부터, 분할은 pane별 커서, 12개 넘으면 6 + ⋯ + 6. 코드 파일은 경로만.
  - 결과: core 결정(2026-11-07)으로 코드 심볼 계층은 Phase 11(`DECISIONS.md` D-14). setext 제목은 Zed 개요 쿼리에 없어 조각이 아니고, 미리보기 탭은 Zed처럼 툴바가 없다. SPEC R-12 "범위"·"구현"에 적었다.
  - 검증: V1. typecheck 통과, `npm run test` 194/194(`breadcrumbs.test.ts` 4개)(`%TEMP%\v05-K-40-report.md`).
  - 실측 필요(V3): 툴바 높이 45, 경로 줄 글자 x·크기(14가 맞는지)·색, 제목 색, 폴더 둘, 분할.
- **W-28 문서** (2026-11-07): SPEC R-10(이동 기록 규칙·구현)·R-11·R-12(범위·구현)·R-16·R-23 구현, DECISIONS D-14, 이 PROGRESS K-38~K-40. 검증 V0(문서만).
- **ORDER-09 V3** (2026-11-07, tauri-leader, 1920×1080·100%, 창 1440×852, One Dark)
  - 무엇을 했나: 경로 줄·탭 툴팁·뒤로/앞으로·오른쪽 버튼 조건·탭 넘침을 재고 Zed 확인(W-27)과 맞췄다. 결과 파일 `specs/v0.5/verify/ORDER-09/tauri-v3-one.json`·`tauri-v3-two.json`·`tauri-one-*.png`·`tauri-two-*.png`.
  - 앱 실행 4회(매번 띄운 PID만 닫음):
    1. 1·2회(폴더 하나·둘): 측정 스크립트가 스크롤된 트리 항목 대신 상태 바 진단 버튼을 눌러 Diagnostics 탭("No problems")이 열렸다(앱 문제 아님, K-41에서 앱 쪽 경로를 찾지 못한 것과 맞음). 경로 줄에 제목이 나오지 않았다 → K-41.
    2. 3·4회(K-41 뒤): 아래 결과.
  - 결과(3·4회):
    - 같음: 경로 줄 `AGENTS.md › # AGENTS`(열자마자), 5행 `… › ## 레포 규칙`, 코드 파일 `src\App.tsx`(경로만, D-14), 폴더 둘 `workbench-tauri\AGENTS.md › # AGENTS`. 탭 툴팁 `D:\projects\workbench-tauri\AGENTS.md`. Go Back 툴팁 `Go Back Alt-Left`, 기록 없을 때 버튼 비활성, 이동 순서 Zed와 같음. 프로젝트 패널에 포커스가 있으면 오른쪽 버튼 숨김(hover에도). 탭 13개 넘침(scrollWidth 1510 / 812), 휠 한 칸 78px, 활성 탭 보임.
    - 다름 → K-42: 경로 줄 글자 시작 x tauri 8 대 Zed 12. K-42는 코드 확인만 했고 재측정은 하지 않았다.
    - 재지 않음: tauri 프로젝트 패널이 한 번에 한 폴더만 보여, 둘째 폴더(workbench-core) 파일 열기는 측정하지 않았다.
  - 특이사항: Zed 확인과 tauri 실행 전후 두 레포 `git status`를 확인했다. `.zed` 없음, 앱·Zed가 쓴 파일 없음(core의 `PROGRESS.md` 수정·`ORDER-10.md`·`docs/`는 core-leader 것).
- **K-41 경로 줄 제목이 안 나오던 것 (R-12 / I-12, V3 불일치)** (2026-11-07, 커밋 `3d64c73`)
  - 무엇을 했나: 제목 신호를 탭 파일을 만들 때 미리 건네고(`newFile`·`twinOf`), 편집기가 생기면 값만 갱신하게 했다(`src/editor/headings.ts` `createHeadings`).
  - 원인: K-40은 제목 신호를 편집기 생성 뒤 탭 파일에 붙였다. 탭이 생기자마자 먼저 그려진 경로 줄은 그때 신호가 없어 구독하지 못했고, 뒤에 신호가 붙어도 다시 그려지지 않았다.
  - 결과: 3·4회 V3에서 제목이 나왔다. "No problems" 탭은 앱의 키맵·클릭 경로에서 재현되지 않아 코드는 바꾸지 않았다(측정 스크립트의 클릭이 원인).
  - 검증: V1. typecheck 통과, `npm run test` 196/196(`headings.test.ts` 2개)(`%TEMP%\v05-K-41-report.md`).
- **K-42 경로 줄 안쪽 여백 4 (R-12 / I-12, V3 불일치)** (2026-11-07, 커밋 `0c6355f`)
  - 무엇을 했나: `.breadcrumbs`에 `padding-inline: var(--buttons-padding-x-default-compact)`(toml `buttons.padding_x.default_compact` 4, L-07)를 줬다.
  - 원인: Zed 툴바 왼쪽 padding 8(`toolbar.rs:123-124`) 안에서 경로 줄이 `ButtonLike`로 한 번 더 싸여 좌우 4가 붙는다(`element.rs:7208-7211`, `button_like.rs:817-821`). 그래서 글자 시작이 8 + 4 = 12다. tauri는 이 4가 없어 8이었다.
  - 결과: 글자 시작 12(코드 확인). Diagnostics 툴바와 미리보기 버튼 위치는 바뀌지 않는다.
  - 검증: V1. typecheck 통과, `npm run test` 196/196(`%TEMP%\v05-K-42-report.md`). 재측정 안 함.
- **C-26 리뷰 (K-37~K-42)** (2026-11-07, tauri-checker)
  - 결과: PASS. 이동 기록 무한 루프·폭주 방지, 닫힌 탭 재오픈 때 작업 공간 밖 경로 차단, 1024 상한, 제목 텍스트 XSS 없음(텍스트 노드), 넘치지 않을 때 휠 차단 없음, 하드코딩 수치·인라인 style·경고 억제 없음, 의존성·CSP·capability 무변경, `spec/` gpui와 같음.
  - 검증: typecheck 통과, `npm run test` 196/196, `cargo test` 25개, clippy 경고 0(`%TEMP%\v05-C-26-report.md`).
  - 참고: `src-tauri/src/folder_watch.rs:169` `missing_root_is_watched_after_creation_and_recreation`는 파일시스템 알림을 기다리는 테스트라 부하 때 드물게 시간 초과가 날 수 있다(재실행 25/25). `spec/ambiguous.md:111`에 gpui W-40의 "해소" 주석이 생겼다(기능 영향 없음).
- **W-29 Phase 9 마무리 문서** (2026-11-07): V3·K-41·K-42·C-26 기록, PLAN Phase 9 "완료(core 판정 대기)". 검증 V0(문서만).
- **coder 되돌림 (사용자 지시)** (2026-11-07, W-30): 19:21에 사용자 지시(core-leader 전달 [DECISION])로 `tauri-coder`를 Codex gpt-6.1-sol medium으로 되돌렸다. 진행 중인 카드가 없는 때(K-43 뒤) Sonnet 5.5 high를 `/exit`로 끝냈고, 셸이 프롬프트를 바로 돌려주지 않아 `Ctrl-C`로 풀고 같은 pane `wJ:pM`에서 `herdr agent start tauri-coder --kind codex --pane wJ:pM -- -m gpt-6.1-sol -c model_reasoning_effort=medium`로 띄웠다(이름 유지, pane을 닫고 새로 띄우지 않음). `/model`로 GPT-6.1-Sol·Medium(current)을 확인했다(바꾸지 않음). 상태 줄 `GPT-6.1-Sol medium`. `HERDR-SETUP.md` 1장에 같은 기록을 적었다. 검증 V0(문서만).

### Phase 10 — 폴더 보기 패널

- **K-44 폴더 보기 패널 모양 (R-21 / I-21)** (2026-11-07, 커밋 `3de1422`, K-45 주석 포함)
  - 무엇을 했나: `src/app.css`, `src/spec/metrics.ts`, `src/theme/theme.ts`·`apply.ts`·`theme.test.ts`. 현재 폴더 `text`·나머지 `text.muted`, 현재 줄 배경과 1px inset 윤곽선 제거, 줄 테두리 1(오른쪽 2, 평소 투명, 사이드바 포커스 + cursor 줄만 `panel.focused_border`), 둘째 줄부터 1px `border` 구분선, 아이콘 14를 16 칸 가운데·이름과 간격 6. `panel.focused_border`가 없을 때 다크 #2870bd, 라이트는 `border.focused` 유지. `Sidebar.tsx`의 내용·순서·동작과 폭 설정은 그대로.
  - 결과: toml에 없는 임시 값 다섯 개(`sidebar.item.border_right_width` 2, `separator_width` 1, `icon_slot_size` 16, `icon_gap` 6, `panel.focused_border` 다크 기본값 #2870bd)를 gpui 등록 요청으로 SPEC R-21에 적었다. 라이트 기본값은 미확정(core 확인 요청).
  - 검증: V1. typecheck 통과, 관련 테스트 32/32(`workspace.test.ts`·`status.test.ts`·`theme.test.ts`), `git diff --check` 통과(`%TEMP%\v05-K-44-report.md`).
- **ORDER-10 Zed 확인·V3** (2026-11-07, tauri-leader)
  - 무엇을 했나: 1920×1080 100%, 클라이언트 1440×852, One Dark에서 Zed(`zed -n`, 폴더 workbench-tauri, Ctrl-Alt-J)와 tauri 폴더 보기 패널을 재고 Zed 소스 근거와 대조했다. 캡처 `specs/v0.5/verify/ORDER-10/`(zed-start·sb-open·sb-down·sb-hover·sb-end.png, tauri-two-idle·hover·focused.png, tauri-v3-two.json).
  - 결과: 같음 — 폭 300(최소 200·최대 800, core가 앞서 본 약 220은 이번 조건에서 나오지 않음), 줄 높이 31, 여백 8/6·테두리 1(오른쪽 2), 현재 폴더 글자색·배경 없음, 키보드 선택 테두리 #2870bd, hover #363c46, 아래쪽 줄(위 선 y 821, 토글·Add Project 위치). 소스 기준 같음 — 아이콘 칸 16·간격 6(Zed 묶음 머리에는 아이콘 없음), 줄 사이 선(Zed는 묶음 하나라 캡처 없음), 누름 색. 글자 잉크 폭 120 대 119(1px 이내). 두지 않음 — 검색칸(사용자 2026-11-06), Thread History 버튼·"No threads yet" 줄(내용이라 두지 않음). 표는 SPEC R-21 "Zed 확인(2026-11-07)".
- **K-45 spec/ gpui 동기화·주석 (C-27 지적)** (2026-11-07, 커밋 `99d36c4`, 주석은 K-44 커밋 `3de1422`에 포함)
  - 무엇을 했나: gpui `spec/INDEX.md`·`spec/zed-metrics.toml`을 복사했다(새 ID `tab.scroll.wheel_step` 80, 복사 뒤 cmp 같음). `src/theme/theme.ts` `panelFocusedBorder` 주석에 Zed 근거(`default_colors.rs:252`)를 더했다.
  - 결과: tauri 탭 휠 값(소스 77.7, V3 78)은 바꾸지 않고 새 ID 80과의 차이를 core에 물었다.
  - 검증: typecheck 통과.
- **C-27 리뷰 (K-44)** (2026-11-07, tauri-checker)
  - 결과: PASS. 지적 2건(spec/ 동기화, 주석)은 K-45로 처리했다.
  - 검증: `npm test` 197/197, `cargo test` 25개, clippy 경고 0.
- **W-31 Phase 10 문서** (2026-11-07, 커밋 `f80d615`): SPEC R-21 "Zed 확인(2026-11-07)" 치수 표·toml 등록 요청 표·"구현(K-44)", PROGRESS Phase 10, PLAN Phase 10 진행 현황. 검증 V0(문서만).
- **K-46 panel.focused_border 라이트 기본값 (R-21 후속, core 답)** (2026-11-07, 커밋 `540b5e3`)
  - 무엇을 했나: `src/theme/theme.ts`·`apply.ts`·`src/app.css`·`theme.test.ts`. 테마 값이 없을 때 라이트 #0588f0(Zed `default_colors.rs:98` `blue().light().step_10()`), 다크 #2870bd(`:252`). `apply.ts` 조건부 발행과 `app.css`의 `border.focused` 대체를 없앴다.
  - 결과: R-21의 라이트 기본값 미확정이 풀렸다(SPEC R-21, W-33).
  - 검증: V1. typecheck 통과, `theme.test.ts` 23/23, `git diff --check` 통과(`%TEMP%\v05-K-46-report.md`).

### Phase 11 — 구문 강조

- **K-48 폴더 밖 파일의 경로 줄은 파일 이름만 (R-12 / I-12, core 정정)** (2026-11-07, 커밋 `296e01d`)
  - 무엇을 했나: `src/editor/breadcrumbs.ts`·`breadcrumbs.test.ts`. 폴더 밖 파일은 마지막 `\` 뒤 파일 이름만 보인다(예: `C:\elsewhere\a.md` → `a.md`), 폴더 수와 관계없음.
  - 원인(Zed 근거): 폴더 밖 파일은 단일 파일 워크트리가 되어 상대 경로가 비고 `root_name`이 파일 이름이다(`editor.rs:11682-11704`, `buffer.rs:5533-5540`, `worktree_store.rs:502-514`, `worktree.rs:536-543`·`1279-1288`).
  - 검증: V1. typecheck 통과, `breadcrumbs.test.ts` 5/5, `git diff --check` 통과(`%TEMP%\v05-K-48-report.md`).
- **W-33 ORDER-11 언어 목록·대응 표** (2026-11-07, 커밋 `5dbf6d9`): SPEC R-15 언어 목록(Zed 4304dec 23개 + HTML), 하이라이트 이름 → 테마 syntax 토큰, 주입, I-12 outline 규칙, R-16 휠 core 결정, R-21 panel.focused_border 기본값 core 결정. 검증 V0(문서만).
- **Phase 9 push** (2026-11-07, tauri-leader): `d42a0df..5dbf6d9`.
- **K-47 문법 wasm 빌드 spike** (2026-11-07, 레포 변경 없음)
  - 무엇을 했나: tree-sitter CLI 0.27.1(SHA256 고정)로 Rust(0.24.2)·Markdown block·inline(zed-industries rev b596e73)을 `%TEMP%`에서 wasm으로 빌드하고 기존 `loadLanguage`·`compileQuery`로 읽었다. CLI가 wasi-sdk 34.0·Binaryen 132를 자동으로 받았다.
  - 결과: wasm 3개 빌드·로드 성공, 샘플 ERROR 노드 0, 쿼리 8개 컴파일. 이 빌드에서는 `skipDylinkNeeded` 우회가 필요 없었다. C++ scanner 문법은 따로 확인이 필요하다고 남겼다.
  - 검증: V1(임시 스크립트 assert, `%TEMP%\v05-K-47-report.md`).
- **K-49 문법·쿼리 복사본 스크립트** (2026-11-07, 커밋 `bc95568`)
  - 무엇을 했나: `tools/fetch-zed-grammars.ps1`, `.gitignore`(`src/assets/zed-grammars/`), `src/syntax/zed-grammars.test.ts`. Zed 4304dec 쿼리와 Cargo.lock 고정 문법을 받아 wasm으로 빌드하고 manifest·라이선스·빌드 로그와 함께 복사본에 둔다. 임시 폴더는 실행마다 고유하게 만들고 끝나면 지운다.
  - 결과: 언어 24개, wasm 20/20 빌드·로드. 문법 라이선스 24개 모두 MIT(css·diff·jsdoc·json·regex는 게시 커밋에서 LICENSE). 쿼리 58개 중 54개 컴파일, 4개(javascript·tsx·typescript `(?s)`, python `(?i:sql)`)는 JavaScript RegExp가 거부해 테스트 1개 실패 → K-50(로더 정규식 변환).
  - 검증: V1. typecheck 통과, `zed-grammars.test.ts` 실패 1(쿼리 4개, 기대값 바꾸지 않음), `git diff --check`·PowerShell 구문 검사 통과(`%TEMP%\v05-K-49-report.md`).
- **W-34 ORDER-11 문서** (2026-11-07): SPEC R-15 라이선스 열·빌드 출처·쿼리 정규식, DECISIONS D-15, PROGRESS Phase 11, PLAN Phase 10·11. 검증 V0(문서만).
- **W-35 구문 강조 샘플** (2026-11-07, 커밋 `15e063c`): `test-fixtures/syntax/`에 언어별 샘플 20개(Env는 Zed 규칙상 파일 이름이 `.env`여야 해 `env/.env`)와 README(파일 → 기대 언어, 심볼 확인 위치 sample.ts 18·sample.rs 21·sample.py 21). 검증 V0.
- **K-50 구문 강조를 Zed 문법 복사본으로 (R-15 / I-15)** (2026-11-07, 커밋 `4929641`)
  - 무엇을 했나: `src/syntax/assets.ts`·`catalog.ts`·`document.ts`(새로), `grammar.ts`·`highlight.ts`·`incremental.ts`, `src/editor/file-view.ts`, `src/shell/AppMenu.tsx`, `src-tauri/src/lib.rs`·`tauri.conf.json`, `ext_protocol.rs` 삭제. 복사본 config로 파일 형식 20개(숨김 4개 제외)를 고르고, 주입(마크다운 코드 블록·inline·HTML style/script·속성 등, host·combined 묶음, 순환 방지), 겹친 캡처는 Zed 순서(`syntax_map.rs:1472-1475`)대로 맨 위 하나, 쿼리 정규식 4개 변환(`(?s)` → `[\s\S]`, `(?i:sql)` → `[sS][qQ][lL]`), C++ `#has-ancestor?` 처리, 라이선스 창에 문법·쿼리 라이선스.
  - 결과: Zed 설치 폴더를 읽던 `zlext` 스킴과 CSP의 `http://zlext.localhost`를 없앴다(축소). 복사본이 없거나 로드에 실패하면 평문. first_line_pattern 선택은 넣지 않았다. TOML은 이때 빠져 K-54로 넘겼다.
  - 한계(shortcut): 편집마다 레이어 전체에서 주입 쿼리를 다시 돈다(Zed는 changed_ranges로 줄임). 큰 파일 성능은 V3에서 본다.
  - 검증: V1. typecheck 통과, 관련 프런트엔드 테스트 25개, `cargo test` 24개, clippy 경고 0, `git diff --check` 통과(`%TEMP%\v05-K-50-report.md`).
- **K-51 폴더 보기 패널 이름 글자 14px (ORDER-10-R1, R-21)** (2026-11-07, 커밋 `e6db40d`)
  - 무엇을 했나: `src/app.css`·`src/spec/metrics.ts`. `.sidebar-item` 글자 크기를 임시 ID `sidebar.item.font_size` 14(Zed `sidebar.rs:2377~` Label 기본 크기, `typography.rs:139·152` TextSize::Default 14)로 했다.
  - 결과: 앞서 적은 Zed 이름 잉크 폭 120은 접기 화살표가 들어간 잘못된 값이었다(leader 재측정 Zed 104, tauri 119). toml 등록 요청 `sidebar.item.font_size` 14.
  - 검증: V1. typecheck 통과, `git diff --check` 통과(`%TEMP%\v05-K-51-report.md`). V3 재측정 대기.
- **ORDER-11 Zed 확인 캡처** (2026-11-07, tauri-leader, 커밋 `a5141a8`): 샘플 강조·경로 줄 심볼·미리보기 코드 블록 캡처.
- **K-54 TOML 강조 (core 결정)** (2026-11-07, 커밋 `bad70f3`)
  - 무엇을 했나: `tools/fetch-zed-grammars.ps1`, `src/syntax/zed-grammars.test.ts`·`document.test.ts`. Zed 확장 `zed-extensions/toml` v1.1.0(커밋 8e18e50)과 문법 `tree-sitter-toml` rev 342d9be를 고정해 복사본에 더했다. 앱 코드는 바꾸지 않았다(K-50 카탈로그가 찾는다).
  - 결과: 언어 25개·wasm 21개 빌드. path_suffixes Cargo.lock·toml·Pipfile·uv.lock. 마크다운 `+++` front matter가 TOML로 주입된다. Zed 쿼리대로 `+++` 구분자까지 주입 범위라 그 자리는 오류 노드가 될 수 있다(Zed와 같음). 설치본과 config·쿼리 9개 같음, `extension.toml` 원시 해시만 다름(SPEC R-15 TOML 행). 확장 Apache-2.0, 문법 MIT.
  - 검증: V1. typecheck 통과, 관련 테스트 10개, `git diff --check`·PowerShell 구문 검사 통과(`%TEMP%\v05-K-54-report.md`). TOML·`+++` 색은 V3에서.
- **coder 교체 (사용자 지시, core D-16)** (2026-11-07 23:15, W-36): 사용자 지시(core-leader 전달, D-16)로 coder를 Codex gpt-6.1-sol medium에서 Claude Code Sonnet 5.5 high로 바꿨다. 사유: Codex 5시간 한도가 9% 남았다. 카드 경계(K-54 보고 뒤, K-52 시작 전)에서 Codex를 `/quit`로 끝내고 셸 프롬프트를 `Ctrl-C`로 되돌린 뒤 같은 pane `wJ:pM`에서 `herdr agent start tauri-coder --kind claude --pane wJ:pM -- --model sonnet --effort high`로 띄웠다(이름 `tauri-coder` 유지). `/model`로 Sonnet 5.5 ✔·High effort를 확인했다(바꾸지 않음). `HERDR-SETUP.md` 1장에 같은 기록을 적었다. 검증 V0(문서만).
- **W-36 문서** (2026-11-07): coder 교체 기록, SPEC R-15 TOML 행·HTML 비고·설치된 다른 확장 언어, PROGRESS Phase 11 K-50·K-51·K-54·캡처·W-35. 검증 V0(문서만).
- **K-52 코드 파일 경로 줄 심볼 (R-12 / I-12)** (2026-11-07, 커밋 `290d1d2`)
  - 무엇을 했나: `src/syntax/assets.ts`(outline.scm), `document.ts`(`symbols`), `highlight.ts`, `outline.test.ts`(새로), `src/editor/headings.ts`·`file-view.ts`·`breadcrumbs.ts`, `src/workspace/context.ts`, `src/shell/Pane.tsx`. Zed `symbols_containing`·`next_outline_item` 규칙대로 커서 ±1 범위의 outline 항목을 이어 문법 색으로 그린다. 마크다운 제목 계층은 그대로.
  - 결과: sample.rs·ts·py 심볼 글자가 Zed 캡처와 같다(SPEC R-12 "코드 파일 심볼"). TS의 `( )`는 outline.scm이 괄호를 `@context`로 잡아서다.
  - 검증: V1. typecheck 통과, 관련 테스트 10/10, `git diff --check` 통과(`%TEMP%\v05-K-52-report.md`).
- **K-53 미리보기 코드 블록 강조·테두리 (ORDER-11 3.3)** (2026-11-07, 커밋 `290d1d2`)
  - 무엇을 했나: `src/syntax/document.ts`(`codeBlockHighlights`), `src/shell/markdown-preview.ts`, `src/app.css`, `src/spec/metrics.ts`(임시 `markdown_preview.code_block.border` 1). 렌더 뒤 코드 블록을 DOM API로 칠하고, 블록에 1px `border_variant` 테두리.
  - 결과: Zed 미리보기도 코드 블록을 강조하고 1px 테두리가 있다(`markdown.rs` 272~279). L-109 "no border"는 잘못 읽은 것이라 gpui에 정정 요청.
  - 검증: V1. typecheck 통과, 관련 테스트 5/5, `git diff --check` 통과(`%TEMP%\v05-K-53-report.md`).
- **K-55 git-firefly 확장 4언어** (2026-11-07, 커밋 `290d1d2`)
  - 무엇을 했나: `tools/fetch-zed-grammars.ps1`, `zed-grammars.test.ts`·`document.test.ts`. 확장 `d1y/git_firefly` v0.1.9(커밋 c63c6c0287ab5c8eb3872cf2bc8803e21c7a9675)와 문법 4개(git_config 3a61756a, git_rebase 39bf3b75, gitattributes 1b7af09d, gitignore f4685bf1)를 고정해 복사본에 더했다. 앱 코드 변경 없음.
  - 결과: 언어 29개, wasm 25개. 설치본과 언어 파일 12/12 같고 `extension.toml` 원시 해시만 다르다(K-54와 같은 이유). `.git/config`는 확장 config에 `config` 이름이 없어 고르지 않는다(Zed config대로, core 확인 요청). 확장 Apache-2.0, 문법 MIT.
  - 검증: V1. 스크립트 종료 코드 0, typecheck 통과, 관련 테스트 11/11, PowerShell 구문 검사·`git diff --check` 통과(`%TEMP%\v05-K-55-report.md`).
- **ORDER-11 V3** (2026-11-07, tauri-leader, 캡처 커밋 `a25696e`)
  - 1차: 측정 스크립트가 파일 트리 줄을 찾지 못해 파일을 열지 못했다(측정 쪽 문제, 앱 문제 아님).
  - 2차: 트리 줄을 이름으로 찾아 성공. 결과 `specs/v0.5/verify/ORDER-11/tauri-v3.json`.
  - 결과: 형식 14개 + 심볼 위치 3개 모두 강조됨. 마크다운·HTML 색은 45개 중 39개가 차이 24 이하(ClearType), 나머지 6개는 측정 쪽 원인. 심볼 3개가 Zed와 같은 글자·문법 색. 미리보기 코드 블록 3개 테두리 1px·반지름 6·안쪽 12. 상태 바 HTML 이름 차이 → K-56. 범위 밖 차이(줄 높이 24.0/약 24.3, 미리보기 본문 x 456/433·간격, 현재 블록 막대)는 다음 Phase 후보. 표는 SPEC R-15 "V3 (2026-11-07)".
- **K-56 상태 바 파일 형식 이름을 강조 카탈로그와 같게 (R-5, V3 발견)** (2026-11-07, 커밋 `59dd1ea`)
  - 무엇을 했나: `src/editor/filetype.ts`, `src/syntax/assets.ts`(카탈로그 등록), `filetype.test.ts`. 후보 = 카탈로그의 보이는 언어 + 카탈로그에 없는 내장 항목, 이름 맞추기는 K-50 `fileLanguage` 그대로.
  - 결과: HTML·TOML·Git Ignore 등이 이름으로 나온다. 복사본이 없으면 내장 19개 이름만.
  - 검증: V1. typecheck 통과, 관련 테스트 5/5, `git diff --check` 통과(`%TEMP%\v05-K-56-report.md`). V3 재측정은 다음 화면 차례.
- **C-28 리뷰 (K-46·K-48~K-55·K-51)** (2026-11-07, tauri-checker)
  - 결과: PASS. zlext 제거·CSP 축소, 미리보기 칠하기는 DOM API만, 스크립트 고정 커밋·SHA256·압축 경로 검사·임시 폴더 정리, 실행 코드에 Zed 설치 경로 없음, 복사본 없을 때 평문, 하드코딩·인라인 style·경고 억제·의존성 변경 없음. 지적: gpui `spec/` 미동기화 → K-57.
  - 검증 숫자 정정: checker 보고의 숫자(npm 197, cargo 25)는 이전 회차 값이었다. leader가 직접 다시 실행: typecheck 0 오류, `npm test` 214/214, `cargo test` 24개, clippy 경고 0(`%TEMP%\v05-C-28-report.md`).
- **K-57 spec/ gpui 동기화·임시 값 교체** (2026-11-07, 커밋 전): gpui `spec/INDEX.md`·`zed-metrics.toml`·`ambiguous.md` 복사, `sidebar.item.*` 4개·`panel.focused_border` #2870bd가 toml ID가 됨, `scroll.wheel_step` 77.7로 정정됨(tauri 값 그대로). 보고 전이라 결과·검증은 보고 뒤에 적는다.
- **Phase 10 push** (2026-11-07, tauri-leader): `a25696e`까지.
- **W-37 ORDER-11 문서** (2026-11-07): SPEC R-12 코드 파일 심볼, R-15 구현·V3·미리보기 코드 블록·범위 밖 차이·toml 등록 요청, PROGRESS Phase 11, PLAN Phase 10·11. 검증 V0(문서만).
- **K-58 큰 파일 입력 지연 (ORDER-11-R1, R-15)** (2026-11-08, 커밋 `42a7473`)
  - 무엇을 했나: `src/syntax/document.ts`·`document.test.ts`. 주입 쿼리를 바뀐 범위(`Tree.getChangedRanges` + 편집 범위)·최상위 노드 단위로 좁혔다(Zed `syntax_map.rs` changed_ranges). 안 바뀐 주입 레이어 트리를 재사용하고, 언어별 파서를 공유하고, 레이어 사이에서 8ms 양보하고, 뷰포트 밖 레이어는 강조하지 않는다. 측정 스크립트는 `%TEMP%\v05-k58\`에 두고 앱에 넣지 않았다.
  - 결과: 편집 중 한 번에 막는 최장 동기 구간이 0.3~7초에서 26ms 이하(대부분 12~18ms)로 줄었다. 편집 합계는 1만 줄대 23~37ms, 5만 줄대 25~59ms(입력은 막지 않음). 수정 전·후 강조 비교 차이 0, 임의 편집 퍼즈에서 새 불일치 0. 전·후 표와 남는 한계(Node 한정 마크다운 첫 파싱 1.5초 정지, `textCallback` shortcut)는 SPEC R-15 "구현"의 성능.
  - 검증: V1. coder: typecheck 통과, 관련 테스트 35/35(`%TEMP%\v05-K-58-report.md`). leader 직접: `npm test` 215/215, typecheck 0 오류.
  - 실측 필요(V3): WebView2에서 큰 파일(lib.dom.d.ts 4.5만 줄) 열기·타이핑, 큰 마크다운 첫 파싱 정지 여부.
- **ORDER-11 종료(core 2026-11-08)**: tauri ORDER-11은 충족으로 닫혔다. R1 화면 확인(커밋 `72eb7cf`): 상태 바 HTML 이름이 Zed와 같다. WebView2에서 큰 마크다운 첫 파싱의 최장 정지는 107ms이고, Node에서 본 1.5초 정지는 없었다. Phase 11 자체는 gpui 보고 뒤 core가 닫고 그때 push를 지시한다. push 안 한 커밋: `59dd1ea` ~ 이 정리 커밋(W-39).
- **W-39 현재 상태 정리** (2026-11-08): PROGRESS 맨 위 "현재 상태(2026-11-08)", Phase 11 "ORDER-11 종료", PLAN Phase 11 진행 현황. 검증 V0(문서만).

## 사용자 요청 작업

- **HERDR 구성 규칙 추가** (2026-11-07, W-11): `HERDR-SETUP.md` 1장에 Codex 한도가 바닥나면 `tauri-coder`를 Claude Code Sonnet 5.5 high로 바꾼다는 규칙(core D-16, 사용자 결정)을 적었다. 지금은 쿠폰 적용으로 Codex gpt-6.1-sol medium 그대로다. 검증 V0(문서만).
- **coder 모델 교체 기록** (2026-11-07, W-14, core D-16): 2026-11-07 12:13에 `tauri-coder`를 Codex gpt-6.1-sol medium에서 Claude Code Sonnet 5.5 high(`claude --model sonnet --effort high`, 이름 유지, pane `wJ:pM`)로 바꿨다. 사유: Codex 5시간 한도 6% 남음, K-17(ORDER-07 복사 스크립트)이 끝난 카드 경계에서 다음 카드 K-18(큰 카드) 중간 소진을 피하려고 leader가 바꿨다. 사용자 결정(core-leader 전달): Codex 한도는 14:00에 초기화되며, 14:00 이후 진행 중인 카드가 끝나는 때에 Codex gpt-6.1-sol medium으로 되돌리고 그 시각을 `HERDR-SETUP.md`와 이 문서에 적는다(되돌린 시각 미정). `HERDR-SETUP.md` 1장에 같은 기록을 적었다. 검증 V0(문서만).

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
