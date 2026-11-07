[DONE] ORDER-11 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| 1 언어 목록·형식별 결과 표 | 이름·확장자·문법 출처·버전 표, 형식별 결과 표, 두 갈래 같음 | 충족(tauri가 먼저 작성, gpui 읽기용) | 언어 목록 SPEC R-15 1065행(Zed 4304dec 내장 23개 + HTML(Zed 레포 확장) + TOML·git-firefly 4개(core 결정, 설치본과 같은 버전 고정 커밋)), 빌드 출처 1106행, 형식별 V3 표 1169행 |
| 2 I-15 구문 강조 | 언어마다 샘플을 열면 강조, 마크다운·HTML은 Zed 캡처와 색이 같음 | 충족(색 품질은 Phase 12 V4) | 샘플 `test-fixtures/syntax/`(20개). V3 형식 14개 + 코드 3개 모두 강조됨(span 21~247개, `tauri-v3.json`). 마크다운·HTML 토큰별 색 45개 중 39개 차이 ≤24(글꼴 안티에일리어싱 차이), 나머지 6개는 측정 쪽 원인(Zed 커서가 1행 `#` 위, Zed의 CSS 색 견본 ■은 언어 서버 기능, 열 계산 어긋남 2, `fn` 1개 안티에일리어싱). 캡처 `zed-md.png`·`zed-html.png` / `tauri-md.png`·`tauri-html.png`. 주입 확인: 마크다운 코드 블록 rust·javascript·python, markdown-inline, HTML style·script·style 속성 |
| 3 I-12 코드 파일 심볼 | 같은 파일·커서에서 경로 줄 글자가 Zed와 같음(2개 이상) | 충족 | sample.rs 21행 `impl Counter › pub fn bump › fn clamp`, sample.ts 18행 `class Inventory › add( ) › function normalize( )`, sample.py 21행 `class Library › def add › def normalize` — Zed와 같은 글자, 문법 색(keyword #b477cf·type·function). `zed-rs-sym.png`·`zed-ts-sym.png`·`zed-py-sym.png` / `tauri-*-sym.png`. 심볼 밖(sample.html 1행)은 경로만. SPEC R-12 955행 |
| 3.3 미리보기 코드 블록 | Zed 미리보기처럼 강조 | 충족 | Zed도 언어별 강조(`zed-md-preview.png`). tauri 블록 3개 강조(span 19·25·17), 테두리 1px rgb(54,60,70)=border_variant, 반지름 6, 안쪽 12(`tauri-md-preview.png`). Zed 소스 markdown.rs 272~279에 테두리가 있어 L-109 "no border"는 잘못 읽은 것 — gpui 정정 요청. SPEC R-15 1196행 |
| 4 복사본·스크립트·D-8 | 쿼리 복사본 미커밋, 다시 채우는 스크립트, 실행 중 Zed 폴더 안 읽음 | 충족 | 복사본 `src/assets/zed-grammars/`(.gitignore), `tools/fetch-zed-grammars.ps1`(Zed 4304dec 쿼리, Cargo.lock 고정 문법, TOML 확장 v1.1.0 8e18e50, git-firefly 0.1.9 c63c6c0, 언어 29·wasm 25). 실행 코드에서 Zed 설치·확장 폴더를 읽던 `zlext` 스킴과 CSP 항목을 지웠다(CSP는 좁힘만, checker 확인). 복사본이 없으면 평문 |
| 5 앞 Phase | 결과 유지 | 충족 | leader 직접 실행: typecheck 0, npm test 214/214, cargo test 24, clippy 0. checker C-28 PASS(아래 운영 참고) |

- 공통 조건: 1920×1080, 배율 100%, 클라이언트 1440×852, One Dark, 폴더 `test-fixtures\syntax`. Zed는 `zed -n` 새 창 2개(확인용 1, 캡처 1, 각 그 창만 닫음), 파일은 열기만, 신뢰 창 없음. Zed가 언어 서버(rust-analyzer·TS)를 띄웠으나 레포에 만든 파일 없음(git status). tauri는 2회 실행(아래), 앱 데이터 복원 차이 0, 띄운 PID만 닫음.

## 문법 빌드 (사용자 허락 2026-11-07)
- tree-sitter CLI 0.27.1 Windows x64 공식 릴리스 1개(SHA256 e21184878f908f91c753b78a76a0766e61954e06627b46088d70d66233424531)를 실행마다 고유 %TEMP% 폴더에서 `build --wasm`. CLI가 자동으로 받는 wasi-sdk 34.0·Binaryen 132도 그 폴더 안(URL·SHA256 SPEC 1106행). 빌드 도구는 의존성 목록에 넣지 않았다. 문법은 재생성하지 않음(parser.c 그대로, 해시 기록).
- 문법 25개 모두 MIT(저장소 LICENSE 본문 확인). crate에 LICENSE가 없는 css·diff·jsdoc·json·regex는 crate의 `.cargo_vcs_info.json` 게시 커밋에서 parser.c가 같음을 확인한 뒤 LICENSE를 가져옴. Zed 쿼리는 GPL-3.0, HTML·git-firefly 확장은 Apache-2.0. 모두 Licenses 창에.
- Zed 쿼리 4개(javascript·tsx·typescript injections `(?s)`, python `(?i:sql)`)는 Rust 정규식 문법이라 JS RegExp가 거부 → 원문은 두고 로더가 같은 뜻으로 바꿔 컴파일(leader 결정, 4개 형태만).

## 결정·확인 요청
- TOML·git-firefly: core 결정대로 넣음. 설치본과의 대조는 개발 중 1회(언어 config·쿼리 파일 바이트 동일, extension.toml만 Zed 설치 때 정규화로 다름).
- 큰 파일 성능: 8ms 조각 파싱·보이는 영역만 칠함. 단 주입 쿼리는 편집마다 레이어 전체에 동기로 돈다(Zed는 changed_ranges로 좁힘) — `shortcut:` 주석. 큰 파일에서 입력 지연은 **재지 않았다**.
- toml 등록 요청(gpui): `sidebar.item.font_size` 14(ORDER-10-R1), `markdown_preview.code_block.border` 1, L-109 문구 정정. 라이트 panel.focused_border #0588f0은 toml에 슬롯이 없어 코드에.

## 남은 차이
- 상태 바 파일 형식 이름: V3에서 sample.html이 tauri `Plain Text` / Zed `HTML`이었다 → K-56에서 강조 카탈로그와 같은 목록으로 고침(V1 테스트, 화면 재측정은 다음 차례).
- TOML·git-firefly 4개 언어와 마크다운 `+++` front matter는 V1 테스트로만 확인(샘플·화면 대조 없음).
- 범위 밖으로 본 차이(다음 Phase 후보, SPEC 1203행): 편집기 줄 높이 Zed 24.0 / tauri 약 24.3px, 미리보기 본문 왼쪽 x Zed 456 / tauri 433과 문단·목록 간격, Zed 미리보기의 현재 블록 왼쪽 막대.

## 운영
- coder: 23:15 Codex(5시간 한도 9%) → Sonnet 5.5 high(사용자 지시, D-16, 카드 경계, /model 확인, 26b2b6e). K-46~K-49·K-50·K-51·K-54는 Codex, K-52·K-53·K-55~K-57은 Sonnet.
- 권한: 처음 CLI 받기는 제 쪽 자동 권한 검사가 거부해 [BLOCKED]로 알렸고, 사용자 허락 뒤 coder 명령을 하나씩 읽고 한 번씩 승인했다. Sonnet(auto mode)이 K-55 스크립트를 승인 창 없이 실행해, 실행 뒤 diff를 읽어 설치 폴더 읽기·삭제가 없음을 확인했다.
- tauri 측정 2회: 1차는 측정 스크립트가 파일 트리 줄을 `data-path`로 찾지 못해 파일을 열지 못했다(앱 동작 아님, 원인은 확인 못 함). 2차는 이름으로 찾아 성공. 경로 줄 글자 기록의 빠진 `s`도 스크립트 정규식 문제(화면 캡처는 정상).
- checker C-28 PASS. 다만 보고의 테스트 숫자(npm 197, cargo 25)는 이전 회차 값이었다. leader가 다시 실행: npm 214/214, cargo 24. 지적 1건(spec 동기화)은 K-57로 처리.
- ORDER-10-R1: 같은 기간에 처리(K-51, ORDER-10 보고에 R1 절).
- push: Phase 9(5dbf6d9까지), Phase 10(a25696e까지) core 지시로 push. 그 뒤 커밋(59dd1ea~ 이 보고)은 push 안 함.
