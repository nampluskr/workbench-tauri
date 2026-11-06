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

## 사용자 요청 작업

없음.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
