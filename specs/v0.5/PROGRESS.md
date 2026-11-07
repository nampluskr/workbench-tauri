> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서는 `PLAN.md`에, 요구와 판정 방법은 `SPEC.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.5/reports/`에 있다.

# PROGRESS — workbench-tauri v0.5

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
- **core 결정 반영(문서)** (2026-11-07, W-17)
  - 무엇을 했나: core-leader [DECISION](사용자 위임 core D-13, ORDER-07 두 갈래 공통) 여섯 가지를 문서에 적었다. ① 탭 파일 아이콘은 Zed 기본 `tabs.file_icons`=false대로 그리지 않고 아이콘 테마는 파일 트리에만 ② Extensions는 `extension.toml`이 있는 확장(Catppuccin 0.2.27, Catppuccin Icons 1.24.0, macOS Classic 0.4.0)만 카드, 내장 테마는 안 보임 ③ toml에 없는 선택기 값(D-10)은 gpui writer가 toml ID를 올리고 tauri는 그 ID로 바꿔 참조 ④ 빠진 토큰 대체 순서 D-8을 두 갈래 공통으로 ⑤ Monochrome 4종 포함, 테마는 dark 이름순 → light 이름순, 아이콘 테마 9종 ⑥ 선택기 스크롤바는 목록 위 포인터일 때만.
  - 결과: DECISIONS D-7·D-8·D-10과 미결 사항, SPEC R-2 Extensions(기본 묶음 카드)·R-3(Monochrome, 탭 아이콘 확정)·R-4(선택기 스크롤바, toml 밖 값, 대체 순서)에 "core 결정 2026-11-07"을 근거로 적었다. 탭 아이콘·기본 묶음 카드의 "core 보고 대상·확인 필요" 표현을 확정으로 바꿨다(이 PROGRESS의 앞 항목은 지난 기록이라 그대로 둠).
  - 남은 일: ③ gpui toml 갱신 대기. 올라오면 `spec/`을 다시 복사하고 `src/spec/metrics.ts`·`src/shell/picker.css`의 값을 toml ID 참조로 바꾸는 coder 카드가 필요하다.
  - 검증: V0(문서만, 실행 없음).

## 사용자 요청 작업

- **HERDR 구성 규칙 추가** (2026-11-07, W-11): `HERDR-SETUP.md` 1장에 Codex 한도가 바닥나면 `tauri-coder`를 Claude Code Sonnet 5.5 high로 바꾼다는 규칙(core D-16, 사용자 결정)을 적었다. 지금은 쿠폰 적용으로 Codex gpt-6.1-sol medium 그대로다. 검증 V0(문서만).
- **coder 모델 교체 기록** (2026-11-07, W-14, core D-16): 2026-11-07 12:13에 `tauri-coder`를 Codex gpt-6.1-sol medium에서 Claude Code Sonnet 5.5 high(`claude --model sonnet --effort high`, 이름 유지, pane `wJ:pM`)로 바꿨다. 사유: Codex 5시간 한도 6% 남음, K-17(ORDER-07 복사 스크립트)이 끝난 카드 경계에서 다음 카드 K-18(큰 카드) 중간 소진을 피하려고 leader가 바꿨다. 사용자 결정(core-leader 전달): Codex 한도는 14:00에 초기화되며, 14:00 이후 진행 중인 카드가 끝나는 때에 Codex gpt-6.1-sol medium으로 되돌리고 그 시각을 `HERDR-SETUP.md`와 이 문서에 적는다(되돌린 시각 미정). `HERDR-SETUP.md` 1장에 같은 기록을 적었다. 검증 V0(문서만).

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
