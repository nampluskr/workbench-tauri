> 버전: v0.4 · 작성일: 2026-11-06 · 상태: 확정 (2026-11-06)
>
> 이번 버전(gpui v0.4와 같은 범위)에 적용할 설계 결정을 기록한다. 목적과 범위는 `specs/v0.4/INTENT.md`에, 요구와 판정 방법은 `SPEC.md`에 둔다(아직 없음). 지난 버전 결정은 `specs/v0.2/DECISIONS.md`에 있고 "v0.2 D-n"으로, workbench-gpui 결정은 "gpui v0.4 D-n"·"gpui H-n"(gpui `specs/v0.4/HERDR-DECISIONS.md`)으로 부른다. `03-tauri R-nn`은 `docs/refs/03-tauri/README.md` 5절 조사 항목이다. "INTENT 결정 n"은 v0.4 INTENT "결정 기록"의 번호다. Q-n은 `writer` 보고서(`%TEMP%\v04-w2.md`)의 질문 번호다. Q-1~Q-10은 리더 결정(사용자 위임 2026-11-06)으로 정했다.

# DECISIONS — workbench-tauri v0.4

## D-1. v0.2 결정을 이어받되, D-10(탭 보기 전용)과 D-15(마크다운 미리보기 비활성)는 이 버전 결정으로 바꾼다

**선택**

- v0.2 D-1~D-20을 v0.4에서도 따른다. 처리는 아래 "v0.2 결정 처리 표"에 있다.
- v0.2 D-10(탭 보기 전용, 최소 동작)은 D-3·D-8·D-9로 바꾼다.
- v0.2 D-12(삭제 확인창 TaskDialog)는 D-6으로 넓혀 이어받는다.
- v0.2 D-15(Open Markdown Preview 비활성)는 D-10으로 바꾼다.
- gpui 코드 값과 스펙 값이 다르면 스펙 값을 따른다(v0.2 D-1, v0.2 INTENT 결정 기록 14). 이 규칙은 아래 모든 결정에 걸린다.

**근거**

- WORKFLOW 5절: 지난 버전 폴더는 그대로 두고 읽기만 한다. 그래서 이어받는다고만 적는다(v0.2 D-1과 같은 방식).
- v0.4 INTENT 범위: 탭 편집과 저장, PoC 6단계 탭 기능(미리보기 탭·핀·분할·탭 드래그·마크다운 미리보기).
- gpui v0.4 D-1도 지난 결정을 이어받고 v0.2 D-18(탭 보기 전용)을 D-6으로 풀었다.

**배제한 대안**

- **v0.2 결정을 모두 새 번호로 다시 쓴다** — 내용이 같은 결정이 두 곳에 생긴다. 배제.

---

## D-2. 새 의존성은 `encoding_rs`, `markdown-it` 15.0.3, `dompurify` 3.4.17 셋이다

**선택**

**[의존성]**은 `package.json`·`Cargo.toml`이 바뀌는 항목이다(루트 `AGENTS.md` 9장).

| 쓰임 | 선택 | 결정 |
| --- | --- | --- |
| CP949 저장 인코딩(D-5) | **[의존성]** `encoding_rs`(`src-tauri/Cargo.toml`). 03-tauri 3.1 목록 밖이다. 정확한 버전은 설치하는 Phase에서 crates.io 최신 안정판으로 고정하고 이 표에 적는다(버전: 미정) | 사용자 승인 2026-11-06(INTENT 결정 7) |
| 마크다운 렌더(D-10) | **[의존성]** `markdown-it` 15.0.3(`package.json`, 03-tauri 3.2) | 사용자 승인 2026-11-06(INTENT 결정 8) |
| 렌더 결과 정화(D-10) | **[의존성]** `dompurify` 3.4.17(`package.json`, 03-tauri 3.2. 라이선스 MPL-2.0 OR Apache-2.0) | 사용자 승인 2026-11-06(INTENT 결정 8) |
| `markdown-it` 타입 | 새 의존성 없이, 쓰는 API만 담은 작은 `.d.ts`를 레포에 둔다. `markdown-it` 15는 타입 선언을 함께 싣지 않는다. 쓰는 API가 넓어지면 `@types/markdown-it`(승인 필요)로 바꾼다는 조건을 `shortcut:` 주석으로 남긴다 | 리더 결정(사용자 위임 2026-11-06) (Q-7) |

- 버전은 정확히 고정하고 lock 파일을 함께 올린다(v0.2 PLAN "의존성", 03-tauri R-31).
- 그 밖의 일은 새 의존성 없이 한다.
  - 원자적 저장: 이미 쓰는 `windows` =0.62.2의 `ReplaceFileW`·`MoveFileExW`(v0.2 D-7, D-4).
  - 확인창: 이미 쓰는 `windows`의 `TaskDialogIndirect`(v0.2 D-7, D-6).
  - UTF-16 LE·BE 저장: Rust 표준 `str::encode_utf16`. `encoding_rs`는 UTF-16으로 인코딩하지 않는다(출력 인코딩이 UTF-8로 바뀐다).
  - 읽기 디코딩: WebView `TextDecoder`(D-5).
  - 디스크 감시: 이미 쓰는 `notify`(v0.2 D-7).

**근거**

- 사용자 승인(2026-11-06): `encoding_rs`(버전은 설치 Phase에서 고정), `markdown-it` 15.0.3, `dompurify` 3.4.17.
- 03-tauri 3.1·3.2 목록, 03-tauri R-38("인코딩 감지 크레이트는 미확인").
- 루트 `AGENTS.md` 4.1(표준 라이브러리·설치된 의존성 먼저), 5장(목록 안에서만), 9장(승인 없는 의존성 추가 금지).

**배제한 대안**

- **CP949를 Win32 `WideCharToMultiByte`로 직접 부른다(gpui 방식, gpui `src/text_io.rs`)** — 새 크레이트가 필요 없지만 사용자가 `encoding_rs`를 승인했다(2026-11-06). 배제.
- **`unified` + `remark-gfm` + `remark-frontmatter`(03-tauri 3.2 다른 후보)** — 사용자가 `markdown-it` + `dompurify`를 골랐다(2026-11-06). 배제.

---

## D-3. 탭 편집은 CM6 읽기 전용 설정만 풀어서 하고, 수정 상태는 탭마다 둔다

**선택**

- v0.2 D-10의 `EditorState.readOnly`를 푼다. 편집기는 v0.1부터 쓰는 CM6 그대로다(INTENT 제외 범위 "에디터 직접 구현").
- 탭마다 저장 기준을 둔다: 마지막으로 읽거나 저장한 디스크 원본 바이트의 해시와 그때의 인코딩·BOM·줄 끝(D-5). 충돌 판정(D-7)과 저장(D-4)이 같은 기준을 쓴다(gpui H-18).
- 수정(dirty) 판정: 현재 문서가 저장 기준 텍스트와 다르면 수정이다. undo로 저장 기준과 같아지면 깨끗하다(리더 결정(사용자 위임 2026-11-06), Q-4). 01-zed 원문 근거는 SPEC 작성 때 확인하고, 어긋나면 다시 정한다. 충돌 상태는 undo로 풀리지 않는다(D-7).
- 수정 표시는 탭의 수정 점(L-65, `tab["indicator_size"]`)이다.
- 같은 탭에 열기·다시 읽기 요청이 겹치면 마지막 요청 결과만 반영한다. 저장과 읽기는 같은 순서 번호를 쓴다(INTENT 결정 3, gpui R-4, gpui PROGRESS P3-1 R1 "저장·읽기 토큰 공유").
- 미리보기 탭(I-062)은 편집하면 일반 탭으로 승격된다. 승격 조건 전체는 D-8이다.

**근거**

- INTENT 범위 "탭 편집과 저장", 결정 3.
- gpui v0.4 D-6(편집기 유지, 편집 막음만 푼다), gpui H-18(디스크 원본 바이트 해시 기준).
- CM6 읽기 전용은 라이브러리 설정 하나다(루트 `AGENTS.md` 4.1 4번).

**배제한 대안**

- **에디터를 직접 구현한다** — INTENT 제외 범위다. 배제.
- **열기 요청이 겹치면 진행 중인 요청을 우선한다** — 편집 버퍼가 늦게 온 결과로 덮일 수 있다. gpui도 "마지막 요청만 반영"을 골랐다(gpui D-4). 배제.

---

## D-4. 파일 저장은 `state.json`과 같은 원자적 교체(`ReplaceFileW`) 경로로 쓰고, 수정하지 않은 탭은 쓰지 않는다

**선택**

- 저장은 코어 명령 하나가 한다: 임시 파일 쓰기 → 디스크 동기화 → 교체. 대상이 있으면 `ReplaceFileW`, 없으면(지워진 파일 다시 만들기, E-085) `MoveFileExW`(`MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH`)다.
  - `state.rs`의 쓰기·교체·재시도 부분을 한 함수로 나눠 두 곳이 같이 쓴다. 재시도 횟수와 간격은 `state.rs`의 앱 상수를 그대로 쓴다(v0.2 D-11).
  - `ReplaceFileW`는 원본 파일의 속성·보안 정보를 새 파일로 옮긴다. 사용자 파일을 덮어쓸 때 이것이 필요하다.
- 임시 파일은 gpui와 같다(gpui `src/text_io.rs` `write_file_with`, 리더 결정(사용자 위임 2026-11-06), Q-3).
  - 대상과 같은 폴더에 `<파일명>.<uuid>.tmp`를 새로 만들기 전용(`create_new`)으로 만들어 쓰고, `sync_all` 뒤 교체한다. `ReplaceFileW`는 같은 볼륨에서만 되므로 같은 폴더다.
  - 임시 파일 쓰기에 실패하면 임시 파일을 지운다. 원본은 바뀌지 않는다.
  - 교체에 실패했는데 원본이 남아 있으면 임시 파일을 지운다.
  - 교체에 실패했는데 원본이 없으면 임시 파일을 남기고, 오류 문구에 그 경로를 적는다(gpui PROGRESS P3-1 R1).
  - 이름에 고유 값을 넣어 사용자의 실제 `<파일명>.tmp` 파일을 덮지 않는다.
- 수정하지 않은 탭은 저장 명령에서 쓰지 않는다. 편집하지 않은 파일의 바이트는 그대로 남는다(gpui H-15).
- 저장 중에 그 파일의 경로가 앱 안에서 바뀌면(이름 바꾸기·이동) 완료 때 탭을 깨끗하게 만들지 않는다(gpui PROGRESS P3-F1).
- 자기 저장이 끝나면 저장 기준 해시를 새 바이트로 바꾼다. 그 뒤 오는 감시 이벤트는 해시가 같아 충돌이 아니다(gpui H-18).
- 저장 때 줄 끝 공백 제거·마지막 줄바꿈은 하지 않는다(INTENT 제외 범위).

**근거**

- 카드 W-v04-2 "원자적 쓰기 재사용 여부". v0.2 D-7·D-11(A-24.1 원문대로 `ReplaceFileW`·`MoveFileExW`, 사용자 결정 2026-11-05).
- gpui v0.4 PROGRESS Phase 3: gpui도 `ReplaceFileW`로 저장했고, 교체 실패(오류 1176) 때 원본과 임시본을 모두 잃을 수 있던 것을 REWORK로 고쳤다.
- 루트 `AGENTS.md` 4.3(데이터 손실을 막는 오류 처리는 줄이지 않는다), 4.2(공통 지점에서 한 번 고친다).

**배제한 대안**

- **`std::fs::write`로 바로 덮어쓴다** — 쓰는 중 실패하면 원본을 잃는다. 배제.
- **저장용 교체 함수를 따로 만든다** — `state.rs`와 같은 일을 두 번 쓴다(루트 `AGENTS.md` 4.1 2번). 배제.
- **`std::fs::rename`으로 교체한다** — v0.2 D-7이 같은 이유로 배제했다(A-24.1 원문과 같은지 판정할 수 없다). 배제.

---

## D-5. 인코딩은 열 때 감지한 인코딩·BOM·줄 끝을 저장 때 그대로 쓰고, CP949로 옮길 수 없는 글자가 있으면 저장하지 않는다

**선택**

- 대상: UTF-8(BOM 있음·없음, LF·CRLF), UTF-16 LE, UTF-16 BE, CP949(INTENT 결정 7).
  - UTF-16 BE는 gpui 끝 상태와 같게 넣는다(gpui `src/text_io.rs`). 넣지 않으면 BE 파일이 CP949로 잘못 읽히고 그대로 저장하면 깨진다(리더 결정(사용자 위임 2026-11-06), Q-2, INTENT 결정 7 개정).
- 감지 순서: BOM → 올바른 UTF-8 → CP949(gpui `src/text_io.rs` `decode`와 같다).
  - UTF-16은 BOM으로만 가린다(gpui와 같다).
  - CP949는 WHATWG `euc-kr`(Windows-949)이다. `encoding_rs`의 `EUC_KR`과 WebView `TextDecoder("euc-kr")`가 같은 표를 쓴다.
- 줄 끝: 파일에서 가장 많은 줄 끝을 그 파일의 줄 끝으로 본다. 같으면 파일에서 먼저 나온 것, 줄 끝이 없으면 LF다. 편집기 문서는 `\n`만 갖고, 저장 때 감지한 줄 끝으로 바꾼다(gpui `decode_text`, gpui H-15).
  - 편집한 혼합 줄 끝 파일은 감지한 줄 끝 하나로 통일된다. `shortcut:` 주석으로 남긴다(gpui H-15, gpui 사용자 확인 승인 2026-11-05).
- CP949 저장에서 옮길 수 없는 글자가 있으면 저장하지 않고 그 글자를 알린다. best-fit 변환은 하지 않는다(gpui R-10).
- 디코딩은 WebView, 인코딩은 코어가 한다(리더 결정(사용자 위임 2026-11-06), Q-1).
  - 읽기: 코어 `read_file`이 지금처럼 원본 바이트를 준다(03-tauri R-10 바이트 응답). WebView가 `TextDecoder`로 디코딩한다: BOM이면 그 인코딩(`utf-8`, `utf-16le`, `utf-16be`), 아니면 `utf-8`(fatal), 실패하면 `euc-kr`. 지금의 `src/editor/file-view.ts` `decodeText`(UTF-8만)를 넓힌다.
  - 저장: 코어가 인코딩한다. UTF-8은 그대로, UTF-16은 표준 라이브러리, CP949는 `encoding_rs`다(D-2).
  - 충돌 판정용 원본 바이트 해시(D-7)는 WebView가 받은 바이트로 낸다.
  - `TextDecoder("euc-kr")`와 `encoding_rs` `EUC_KR`이 같은 표를 쓰는지는 인코딩 왕복 테스트로 잡는다.
- 상태 표시줄 인코딩 표시는 없다(01-zed A-05.5, 03-tauri R-38).

**근거**

- INTENT 결정 7(사용자 결정 2026-11-06): gpui처럼 UTF-8(LF·CRLF)·UTF-16 LE·CP949 왕복과 CP949 손실 거부.
- gpui v0.4 D-6, gpui H-15, gpui `src/text_io.rs`(감지 순서·줄 끝 규칙은 01-zed에 없는 gpui의 앱 판단이다).
- 03-tauri R-38.

**배제한 대안**

- **모두 UTF-8로 저장한다** — 원본 인코딩을 바꾼다. gpui D-6이 배제했다. 배제.
- **혼합 줄 끝을 줄마다 기억한다** — gpui가 고르지 않았고, 승인한 사용자 확인 목록에 "주된 줄 끝으로 통일"이 있다(2026-11-05). 배제.
- **코어가 `encoding_rs`로 디코딩까지 하고 텍스트와 형식을 함께 돌려준다** — 바이트 응답 경로를 바꿔야 하고, 웹 플랫폼으로 되는 디코딩에 크레이트를 쓴다(루트 `AGENTS.md` 4.1 3번). 배제(Q-1).
- **UTF-16 LE만 넣는다** — BE 파일을 잘못 읽은 채 저장하면 깨진다. 배제(Q-2).

---

## D-6. 저장 질문·저장 실패·충돌·지워진 파일 확인창은 v0.2와 같은 TaskDialog이고, 기본 버튼과 실패 때 처리는 취소다

**선택**

- 확인창은 E-080대로 Windows TaskDialog다. v0.2의 `confirm` 명령(`src-tauri/src/files.rs`)을 버튼 여러 개와 고른 버튼을 돌려주게 넓힌다.
- 대상과 원문(02-INTERACTION 12.4절)
  - E-081 수정한 탭 하나 닫기: Save / Don't Save / Cancel. 경로는 `confirm_close.path_max_chars`로 자른다.
  - E-082 수정한 탭 여러 개: Save all / Discard all / Cancel, 파일 목록은 상세.
  - E-083 저장 실패: Close Without Saving / Cancel.
  - E-084 디스크와 충돌한 상태에서 저장: Overwrite / Discard Edits / Cancel.
  - E-085 디스크에서 지워진 파일 저장: Save / Close / Cancel.
- 기본 버튼과 `Esc`는 취소다. 창을 띄우지 못하면 취소로 본다(v0.2 D-12, gpui H-17).
- 창 닫기·앱 종료 때 수정한 탭이 있으면 묻는다. 미저장 내용 복원(A-25.8·I-118)은 INTENT 제외 범위다(gpui H-17).
- 닫기 질문에서 시작한 저장이 끝나지 않으면 기다리는 상한을 둔다(gpui PROGRESS P3-3 R2·R3). 상한이 지나면 닫기 요청만 취소한다.
  - 값은 gpui 앱 상수와 같은 `CLOSE_SAVE_WAIT_LIMIT` = 10초다(gpui `src/ui/metrics.rs` timing). 스펙 ID가 아닌 앱 상수이고, `shortcut:` 주석으로 남긴다(리더 결정(사용자 위임 2026-11-06), Q-9).

**근거**

- 01-zed E-080~E-085. v0.2 D-7·D-12(사용자 결정 2026-11-05). 03-tauri 3.3 확인창 행, 03-tauri R-15.
- gpui H-17(기본 Cancel, 표시 실패 때 Cancel, 종료 때 질문).

**배제한 대안**

- **앱 안 DOM 모달** — 03-tauri 3.3과 v0.2 D-12가 OS TaskDialog로 정했다. 배제.
- **`tauri-plugin-dialog` 메시지 창** — 세 버튼·사용자 문구 지원이 미확인이다(03-tauri R-15, v0.2 D-7). 배제.

---

## D-7. 디스크 변경은 원본 바이트 해시로 판정하고, 깨끗한 탭은 다시 읽고 수정한 탭은 충돌로 두며, 지워진 파일은 취소선으로 보인다

**선택**

- 감시는 v0.2 D-7·R-25의 `notify` 경로를 그대로 쓴다.
- 디스크 원본 바이트의 해시가 탭의 저장 기준(D-3)과 다르면 디스크 변경이다. 수정 시각은 쓰지 않는다(gpui H-18).
  - 01-zed E-086은 디스크 시각으로 판정한다. 같은 내용으로 덮어쓰면 Zed는 변경으로 볼 수 있다. gpui는 이 차이를 사용자 확인 목록에 올려 승인받았다(gpui "버전 종료" 승인 2026-11-05).
- 깨끗한 탭은 v0.2처럼 자동으로 다시 읽는다(E-086 앞부분, v0.2 R-25).
- 수정한 탭은 버퍼를 그대로 두고 충돌로 둔다. 탭 점을 Warning 색으로 바꾼다(E-086). undo로 저장 기준과 같아져도 충돌은 남는다(gpui PROGRESS P3-4a R1).
- 열린 파일이 지워지면 탭 제목에 취소선을 긋는다. 내용이 비어 있지 않으면 수정됨으로 본다(E-087).

**근거**

- 01-zed E-086·E-087, 03-tauri R-24. gpui v0.4 D-6, gpui H-18.

**배제한 대안**

- **정규화한 텍스트 해시로 판정한다** — 디스크의 인코딩·BOM·줄 끝 변경을 못 잡는다(gpui P3-4a REWORK). 배제.
- **수정 시각으로 판정한다** — gpui가 고르지 않았고, 이 레포는 gpui 끝 상태와 같게 간다(INTENT 목적). 배제.

---

## D-8. 분할은 폴더 작업 문맥마다 재귀 PaneGroup 트리로 두고, 탭의 EditorView는 하나를 만들어 Pane 사이로 옮긴다

**선택**

- 분할 규칙은 02-INTERACTION 3.1(I-706~I-739)을 모두 따른다: 상하좌우 4방향, 개수 제한 없음, 분할 방식 셋(`ClonePane` 기본, `EmptyPane`, `MovePane`), 분할선 크기 조절(I-726·I-727), 확대(I-730·I-737)(gpui D-7, gpui H-20).
- 상태는 폴더 작업 문맥(v0.2 D-8)마다 하나의 분할 트리다. 잎은 Pane이고, Pane은 탭 목록과 활성 탭을 갖는다. 갈래는 방향과 자식별 비율을 갖는다.
- 탭의 EditorView는 한 번 만들고 Pane 사이·DOM 안팎으로 옮긴다. v0.2 `PaneBody`가 이미 이렇게 한다. v0.1에서 탭 이동 때 스크롤·선택·커서가 유지되는 것을 확인했다(03-tauri R-01 "됨", `specs/v0.1/verify/P0-SUMMARY.md`).
- `ClonePane`처럼 한 파일이 두 Pane에 보이면 두 번째 EditorView를 만들고, CM6 트랜잭션을 서로 넘겨 같은 문서로 맞춘다. 수정 상태와 저장 기준은 파일 하나에 하나다(리더 결정(사용자 위임 2026-11-06), Q-5).
- 미리보기 탭과 핀은 02-INTERACTION 2절(I-060~I-066)을 따른다. Pane당 미리보기 탭 수는 `max_preview_tabs`다.
- 탭·분할 상태 복원(I-112~I-120)은 넣지 않는다(INTENT 제외 범위).
- 분할 수치(`split_line_thickness`, `split_line_mouse_hitbox`, `min_drag_width`, `min_drag_height` 등)는 이미 `spec/zed-metrics.toml`에 있다.

**근거**

- INTENT 범위 "PoC 6단계 탭 기능", gpui v0.4 D-7(사용자 선택 "Zed 원문 전부"), gpui H-20.
- 03-tauri 7절 4단계(재귀 분할), 03-tauri R-01.

**배제한 대안**

- **분할마다 EditorView를 새로 만든다** — 옮길 때 스크롤·선택·커서를 잃는다(03-tauri R-01이 피하려던 문제). 배제.
- **좌우 분할만, 또는 명령으로만** — gpui D-7이 배제했다. 배제.
- **같은 파일의 두 Pane이 따로 문서를 갖고 맞추지 않는다** — 한쪽 편집이 다른 쪽에 없고, 저장 때 서로 덮어쓴다. Zed `ClonePane`은 같은 버퍼를 보인다. 배제(Q-5).

---

## D-9. 탭 드래그는 포인터 이벤트로 직접 하고, HTML5 드래그 앤 드롭은 쓰지 않는다

**선택**

- `pointerdown`·`pointermove`·`pointerup`과 `setPointerCapture`로 탭 드래그를 만든다(03-tauri R-09).
- 드래그로 하는 일: 탭 순서 바꾸기, 다른 Pane으로 옮기기, 본문 가장자리 드롭 영역에 놓아 분할하기(I-712~I-720). 드롭 영역 비율·삽입선 두께·탭 바 끝 드롭 폭은 `drop_target_size_ratio`, `directional_drop_overlay_ratio`, `tab_drop_line_width`, `tab_bar_end_drop_min_width`다.
- 프로젝트 패널에서 끌어 열기(I-721·I-722), 프로젝트 패널 드래그 앤 드롭(I-094), 외부 드롭(I-097)은 넣지 않는다(INTENT 결정 9).

**근거**

- 03-tauri R-09: HTML5 DnD는 WebView2의 파일 드롭 처리와 부딪치고, `Ctrl` 복제 전환(I-718)·2px 삽입선(I-715)·고스트 제어가 어렵다.
- INTENT 범위, 결정 9. gpui v0.4 D-7.

**배제한 대안**

- **HTML5 DnD** — 위 03-tauri R-09 이유. 배제.

---

## D-10. 마크다운 미리보기는 `markdown-it`으로 렌더하고 `dompurify`로 정화해 넣으며, CSP는 그대로 둔다

**선택**

- 마크다운 파일이면 편집기 빠른 동작에 미리보기 버튼(E-039)이 있고, 누르면 "Preview {파일명}" 탭(L-69)이 열린다(gpui R-14).
- 프로젝트 패널 우클릭 메뉴의 Open Markdown Preview를 켠다(v0.2 D-15를 바꾼다).
- 렌더 경로: 문서 텍스트 → `markdown-it` → `dompurify` → 미리보기 탭의 컨테이너에 넣는다. 편집하면 다시 렌더한다(03-tauri 7절 6단계 "실시간 미리보기").
- CSP는 바꾸지 않는다(v0.1 D-14, 루트 `AGENTS.md` 5장).
  - `markdown-it`의 HTML 통과(`html` 옵션)는 끈다.
  - 인라인 `style` 속성을 남기지 않는다(루트 `AGENTS.md` 5장). GFM 표 정렬은 `markdown-it` 렌더 규칙에서 `style` 대신 클래스로 단다(리더 결정(사용자 위임 2026-11-06), Q-8).
  - 이미지·링크의 동작은 SPEC 작성 때 01-zed·gpui 동작을 확인해 정한다. CSP를 넓히지 않는 쪽이 기본이고, 넓혀야 하면 사용자 승인이다(루트 `AGENTS.md` 9장)(리더 결정(사용자 위임 2026-11-06), Q-8). 지금 CSP의 `img-src`는 `'self'`와 `zlext`뿐이다.
- 원문 위치 매핑(I-084, 03-tauri R-04): `markdown-it` 블록 토큰의 `map`(시작·끝 줄)을 `data-` 속성으로 렌더한다. `dompurify`는 기본으로 `data-` 속성을 남긴다.
- frontmatter 표(L-110): `markdown-it`에 frontmatter 처리가 없다. 앞쪽 `---` 블록을 직접 잘라 `키: 값` 줄만 2열 표로 그린다. 중첩 YAML은 지원하지 않는다는 한계를 `shortcut:` 주석으로 남긴다. gpui도 frontmatter 상자를 근사로 두고 승인받았다(gpui "버전 종료" 2026-11-05)(리더 결정(사용자 위임 2026-11-06), Q-6).
- 스타일은 01-LAYOUT 5절(`L-101~`) 값을 `markdown_preview` 스펙 ID의 CSS 변수로 쓴다.
- 뷰어 등록 구조(03-tauri R-26)는 만들지 않는다. 마크다운 미리보기 하나뿐이다(INTENT 제외 범위, 루트 `AGENTS.md` 4.2 "하나만 만드는 factory 금지").

**근거**

- INTENT 결정 8(사용자 승인 2026-11-06), gpui v0.4 D-7·R-14.
- 03-tauri 3.2 마크다운 행("소스 위치를 보존하는 파서가 필요", I-084), 03-tauri R-04·R-32.

**배제한 대안**

- **CSP에 `style-src 'unsafe-inline'`을 더한다** — CSP를 끄지 않는다(루트 `AGENTS.md` 5장). 배제.
- **정화 없이 넣는다** — 문서 안 스크립트·이벤트 속성이 WebView에서 돈다. 배제.
- **frontmatter에 플러그인과 YAML 파서를 더한다** — 새 의존성이고 승인 밖이다. 배제(Q-6).
- **표 정렬 `style`을 지우고 정렬을 버린다** — 표 모양(L-107)이 달라진다. 배제(Q-8).

---

## D-11. 에디터 코어 5건 가운데 3건은 v0.1에서 이미 맞았고, 커서 폭과 Ctrl+Shift 열 선택만 CM6 테마·확장으로 더한다

**선택**

- 이미 됨(v0.1 `specs/v0.1/verify/phase1.md` 판정 "됨")
  - 줄 번호 최소 자릿수(E-002, `editor["gutter.min_line_number_digits"]`): `src/editor/extensions.ts` 거터 `minWidth`.
  - 선택 모서리(E-015, `editor["selection.corner_radius_multiplier"]`): `.cm-selectionBackground` `borderRadius`.
  - 스크롤바(E-030): `.cm-scroller::-webkit-scrollbar` 폭.
- 더할 것
  - 커서 폭(`editor["cursor_width"]`): CM6 테마의 `.cm-cursor` 테두리 폭을 스펙 ID의 CSS 변수로 둔다. 지금은 CM6 기본값이다.
  - 열 선택(E-047): CM6 `rectangularSelection`의 `eventFilter`를 Ctrl+Shift 끌기로 둔다. E-047의 나머지(Alt+Shift 끌기, 가운데 버튼 끌기)는 넣지 않는다. gpui D-10과 같은 범위다(리더 결정(사용자 위임 2026-11-06), Q-10).
- 모호 3건(E-012 한글 혼합 줄 기준선, E-034 스크롤바 마커, E-049 선택 끌어 옮기기)과 큰 파일 + soft wrap은 뺀다(INTENT 결정 6).

**근거**

- INTENT 결정 6. gpui v0.4 D-10과 gpui PROGRESS Phase 2 표.
- `specs/v0.1/verify/phase1.md` 표(E-002 32.988 대 32.9883, E-015 3.6405 대 3.6405, E-030 15 대 15).
- 01-zed 02-INTERACTION E-047. CM6 `rectangularSelection`·테마는 라이브러리 기능이다(루트 `AGENTS.md` 4.1 4번).

**배제한 대안**

- **CM6 선택·커서 레이어를 직접 그린다** — 테마·확장 설정으로 된다(루트 `AGENTS.md` 4.1). 배제.
- **E-047 셋을 모두 넣는다** — INTENT 결정 6의 범위(gpui D-10 8건 가운데 스펙 값이 있는 것) 밖이다. 다음 버전 후보로 남긴다. 배제(Q-10).

---

## D-12. clippy는 Phase 1에서 기준선을 한 번 재고 `-D warnings`로 0건을 만들며, `allow`로 숨기지 않는다

**선택**

- Phase 1 첫 카드에서 `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings`를 돌려 기준선(경고 수)을 PROGRESS에 적는다.
- 경고를 고쳐 0건으로 만든다. 새 `#[allow(clippy::...)]`를 두지 않는다. 불가피하면 사유를 주석으로 남긴다(루트 `AGENTS.md` 5장).
- 이후 clippy는 완료 보고 전 경고 규칙에 든다(루트 `AGENTS.md` 2장, W-v04-2a 반영).
- 대상은 `src-tauri`다. 프런트엔드는 `npm run typecheck`가 계속 맡는다.

**근거**

- INTENT 결정 2(clippy 설치 확인). gpui v0.4 D-5·R-6.

**배제한 대안**

- **`--all-targets`로 테스트 코드까지 본다(gpui R-6 명령)** — 루트 `AGENTS.md` 2장에 더한 명령에 없다. 넣으려면 그 명령을 고쳐야 한다. 배제(바꾸려면 사람이 정한다).
- **경고를 `allow`로 숨긴다** — 루트 `AGENTS.md` 5장. 배제.

---

## v0.2 결정 처리 표

| v0.2 D | 내용 | 처리 | v0.4 D | 이유 |
|---|---|---|---|---|
| D-1 | v0.1 결정 이어받기, 스펙 값 우선 | 이어받음 | D-1 | 없음 |
| D-2 | 내장 키맵 + `keymap.json` | 이어받음 | D-1 | 새 동작(저장·닫기·분할)의 키는 같은 규칙으로 더한다 |
| D-3 | 키 규칙, 자체 엔진 | 이어받음 | D-1 | 없음 |
| D-4 | `keymap.json` JSONC | 이어받음 | D-1 | 없음 |
| D-5 | 메뉴·툴팁 DOM | 이어받음 | D-1 | 없음 |
| D-6 | 앱 데이터 폴더 | 이어받음 | D-1 | 없음 |
| D-7 | 의존성 표 | 이어받음 | D-1, D-2 | 새 의존성은 D-2 |
| D-8 | 폴더마다 작업 문맥 | 이어받음 | D-1, D-8 | 분할 트리가 작업 문맥 안에 든다 |
| D-9 | 가상 스크롤 트리 | 이어받음 | D-1 | 없음 |
| D-10 | 최소 탭, 보기 전용 | 바꿈 | D-3, D-8, D-9 | INTENT 범위(탭 편집·저장, PoC 6단계) |
| D-11 | `state.json` 범위, A-24 | 이어받음 | D-1, D-4 | 교체 경로를 파일 저장이 같이 쓴다. 탭·분할 상태는 저장하지 않는다(INTENT 제외 범위) |
| D-12 | 삭제 확인창 TaskDialog | 넓혀 이어받음 | D-6 | E-081~E-085를 더한다 |
| D-13 | ☰ 동작 항목만, 앱 이름 | 이어받음 | D-1 | 새로 동작하는 항목(저장 등)은 같은 규칙으로 켜진다 |
| D-14 | 알림 DOM, 문구 판정 | 이어받음 | D-1 | CP949 저장 거부·교체 실패 알림도 이 경로 |
| D-15 | Open Markdown Preview 비활성 | 바꿈 | D-10 | 마크다운 미리보기를 넣는다 |
| D-16 | 폴더 이름 버튼 | 이어받음 | D-1 | 없음 |
| D-17 | 파일 작업 P3-D1·P3-D2, AUDIT 3 회피 | 이어받음 | D-1 | AUDIT 3·4는 이미 됨(INTENT 범위) |
| D-18 | 판정은 CDP·앱 밖 도구, dev 플래그 없음 | 이어받음 | D-1 | INTENT 기대 결과(ponytail 원칙), 결정 10·11 |
| D-19 | opener | 이어받음 | D-1 | 없음 |
| D-20 | Lucide 아이콘 | 이어받음 | D-1 | 새 아이콘(분할·미리보기 버튼 등)도 같은 방식 |

## gpui 결정 대응 표

| gpui v0.4 결정 | 내용 | 이 문서 | 처리 |
|---|---|---|---|
| D-1 | v0.3 결정 이어받기, 값 변경 허용 | D-1 | 같은 꼴(이 레포는 v0.2 결정을 이어받음) |
| D-2 | 정리 → 일치 → 기능 | 없음 | 순서는 PLAN이 정한다 |
| D-3 | P4·P5 Phase 시작 V3 실측 | 없음 | 하지 않음(INTENT 결정 4) |
| D-4 | AUDIT 3·4 수정, 마지막 요청 반영 | D-3 | AUDIT 3·4는 이미 됨, 마지막 요청 반영만 넣음(INTENT 결정 3) |
| D-5 | Duration·clippy 0건 | D-12 | clippy만. Duration은 이미 됨(INTENT 결정 1) |
| D-6 | 탭 편집·저장, 인코딩 3건 | D-3~D-7 | 같게. CP949는 Win32 대신 `encoding_rs`(D-2) |
| D-7 | PoC 6단계, 분할 원문 전부, 마크다운 컴포넌트 | D-8~D-10 | 같게. 렌더러는 `markdown-it` + `dompurify` |
| D-8 | 검증 V0~V4, R-15 회귀 대조 | 없음 | V0~V4는 루트 `AGENTS.md` 3A 그대로, R-15는 넣지 않음(INTENT 결정 10) |
| D-9 | herdr 구성 | 없음 | `specs/v0.4/HERDR-SETUP.md`가 담는다 |
| D-10 | 에디터 직접 구현 8건 중 표시·스크롤바·입력 | D-11 | 스펙 값이 있는 5건(3건은 이미 됨) |
| H-15 | 혼합 줄 끝 통일, 깨끗한 탭 안 씀 | D-4, D-5 | 같게 |
| H-17 | 종료 때 질문, 기본 Cancel | D-6 | 같게 |
| H-18 | 원본 바이트 해시로 충돌 판정 | D-3, D-7 | 같게 |
| H-20 | 크기 조절·확대 포함 | D-8 | 같게 |

---

## 미결 사항

없음.

- Q-1~Q-10을 모두 정했다(리더 결정(사용자 위임 2026-11-06)). SPEC 작성 때 확인할 것은 두 가지다: 수정 판정의 01-zed 근거(D-3, Q-4), 미리보기 이미지·링크 동작(D-10, Q-8).
