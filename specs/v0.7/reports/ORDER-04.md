[DONE] ORDER-04 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-9 | 접히는 문단 둘·여러 줄 항목 목록에서 넷을 하나씩 바꾸면 그 간격만 그 px만큼 바뀌고 나머지 셋은 그대로(V3 계산값·캡처) | 충족 | `specs/v0.7/verify/ORDER-04/v3.json` c1_c5_one_at_a_time. 기본은 문단 내부 8 / 문단 외부 16 / 목록 내부 8 / 목록 외부 12. 하나씩 바꾼 결과: 문단 내부 18 → 문단 줄 틈 18(줄 높이 34px), 문단 외부 26 → 문단 사이 26, 목록 내부 18 → 항목 줄 틈 18, 목록 외부 20 → 항목 사이 20. 매번 나머지 셋은 그대로였다(`c1-paragraph-gap-26.png`, `c5-list-gap-20.png`). Settings 창 −/+: 47→48, 48에서 + → 48, 1→0, 0에서 − → 0 |
| 2 I-9 | 내부 8px에서 미리보기 글꼴을 키워도 줄 사이 틈이 8px(V3) | 충족 | c2_font_growth: 미리보기 글꼴 16 → `Ctrl+=`×4로 20 → 설정 28. 문단 줄 간격은 24 → 28 → 36px로 늘고, 문단·항목 틈은 늘 8px, 외부 16·12도 그대로다(`c2-preview-font-20-gap-8.png`) |
| 3 I-9 | 처음 상태가 v0.6과 같은 간격, ORDER-03 설정 파일로 열어도 같다(V3) | 충족 | ORDER-03 빌드(`9b11900`)와 이 빌드를 같은 상태로 띄워 미리보기 간격 덤프 21개 값(틈·외부 간격·제목·인용·코드·표 앞 간격·줄 높이)을 비교했다. `c3_noSettings_equal` true, `c3_o03File_equal` true(`c3-*-o03.png`·`c3-*-new.png`) |
| 4 I-9 | 편집↔미리보기 위치 연계(V3) | 충족 | c4_sync: 문단 외부 40·목록 외부 30·문단 내부 20으로 둔 상태에서 "## After", "## Section 3", "## Section 7", "## List"를 누르면 미리보기 활성 블록이 각각 같다(`c4-sync-gaps-changed.png`) |
| 5 I-9 더함 | 목록 외부 20px → 하위 불릿 사이도 20px, 제목·코드 블록 앞뒤 간격 그대로(V3 계산값) | 충족 | `preview_list_gap` 20: 항목 사이 20, 하위 항목 사이 20. 제목 앞 16/16, 코드 블록 앞 16, 뒤 16 그대로 |
| 6 I-14 | One Dark·One Light에서 세 단계 TS, 커서 안쪽 블록 → 활성 선이 나머지보다 배경 대비 크고, One Light 안내선이 글자색보다 옅다(V3 계산값·캡처). 두 키가 있는 테마는 ORDER-03과 같다(V3) | 충족 | 알파 색을 배경 위에 합성해 WCAG 명암비로 계산했다(c6_*). One Dark(배경 40,44,51): 안내선 (63,66,71) 1.39:1, 활성 (78,80,84) 1.73:1 — 활성이 더 또렷하다(이전에는 활성이 배경보다 어두운 27,29,35). One Light(배경 250,250,250): 안내선 (222,221,218) 1.30:1, 활성 (214,213,210) 1.41:1, 본문 글자 14.67:1 — 글자보다 옅고 활성이 더 짙다. Catppuccin Mocha: 토큰·화면 색이 ORDER-03 빌드와 같다(`c6_catppuccin_same` true). `c6-oneDark-guides-{o03,new}.png`, `c6-oneLight-guides-{o03,new}.png`, `c6-catppuccin-guides-new.png` |
| 7 테스트 | 새 설정 넷 읽기·검증(범위·단위), One 테마 안내선 색에 테스트, 기존 테스트 통과(V1) | 충족 | `src/settings/model.test.ts`(넷: 정수 0~48, 범위·소수·문자열은 기본값, 가장 가까운 값), `src/theme/theme.test.ts`(I-14: One Dark·One Light 두 토큰, 키가 있는 테마·이름 없는 호출은 그대로). `npm.cmd run test` 245/245 |

## 검증
- typecheck 오류 0, `npm.cmd run test` 245 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과(커밋 직전 1회, leader가 실행해 출력 파일로 넘김). checker C-07 검토 [PASS].
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`. debug exe와 비교용 ORDER-03 빌드 exe(scratchpad 사본), 임시 APPDATA·임시 WebView 데이터 폴더, 창 1440×852, 100%, One Dark(c6만 테마별), CDP 합성 입력(SendInput 막힘). checker C-08 [MEASURED]: 1~6 모두 PASS.
- C-08 보고의 One Dark 명암비(1.50·1.96)는 계산 오류였다. leader가 WCAG 식으로 다시 계산한 값(1.39·1.73, K-04 보고와 같음)을 위에 적었다. 결론은 같다.
- 결과 파일: `specs/v0.7/verify/ORDER-04/` `v3.json`, PNG 14(c1-paragraph-gap-26, c2-preview-font-20-gap-8, c3-noSettings-new, c3-noSettings-o03, c3-o03File-new, c3-o03File-o03, c4-sync-gaps-changed, c5-list-gap-20, c6-catppuccin-guides-new, c6-oneDark-guides-new, c6-oneDark-guides-o03, c6-oneLight-guides-new, c6-oneLight-guides-o03, settings-preview).

## 지운 것·더한 것·하지 않은 것
- 더한 것:
  - 설정 넷과 Settings Preview 행.
  - CSS 변수 `--preview-paragraph-line-gap`·`--preview-paragraph-gap`·`--preview-list-line-gap`·`--preview-list-gap`.
  - 문단·항목 줄 높이를 `글꼴 + 틈`으로, `p` 아래 여백과 `li + li`를 새 변수로.
  - `theme.ts` `ONE_GUIDES`(One Dark·One Light 이름에만).
- 지운 것: 쓰는 곳이 없어진 메트릭 `markdown_preview.list_gap`.
- 의존성·Rust·`spec/` 변경 없음. 테마 JSON 복사본은 고치지 않았다.
- 그대로 둔 것: 목록 블록(`ul`/`ol`)·인용·표·frontmatter 앞뒤 간격(지금 `prem(16)`), 제목 줄 높이 1.25, 다른 미리보기 길이(비례).
- 느슨한 목록(항목 안에 `p`)의 처리:
  - 줄 높이는 목록 내부를 따른다.
  - 항목 사이는 지금처럼 (문단 외부 + 목록 외부)다.
- 남은 위험:
  - 문단 외부 값은 문단 아래 여백이라, 문단 바로 뒤에 오는 제목·코드 블록 앞 간격도 그 값을 따른다(26으로 두면 26). 카드의 "제목·코드 블록 앞뒤 간격은 지금대로"는 목록 외부를 바꿀 때 기준(5)으로 판정했다.
  - 항목 안의 표·인용은 이제 항목의 길이값 줄 높이를 물려받는다. 기본값에서는 같다.

## tauri가 고른 것
- Preview 행(Theme → Font Size 뒤, 이 순서; 설명은 VS Code 설정 설명 방식; 정수 px 0~48):
  - Paragraph Line Spacing `preview_paragraph_line_gap` 8 — "Controls the space in pixels between wrapped lines of a paragraph."
  - Paragraph Spacing `preview_paragraph_gap` 16 — "Controls the space in pixels between paragraphs."
  - List Line Spacing `preview_list_line_gap` 8 — "Controls the space in pixels between wrapped lines of a list item."
  - List Item Spacing `preview_list_gap` 12 — "Controls the space in pixels between list items."
- 잘못된 값: 파일 값이 범위·단위 밖이면 기본값. Settings 화면 −/+·입력은 가장 가까운 정수.
- I-14 색 값과 출처: Zed 소스(이 PC의 클론, 커밋 4304dec) `crates/theme/src/default_colors.rs`의 `editor_indent_guide`·`editor_indent_guide_active` 기본값.
  - 다크: `dark_alpha` step 4·6, Sand 척도.
  - 라이트: `light_alpha` step 5·6.
  - Zed의 `assets/themes/one/one.json`에도 두 키가 없어, Zed는 One 테마를 이 기본값으로 그린다.
  - 값만 옮기고 코드는 복사하지 않았다.

  | 테마 | `editor.indent_guide` | `editor.indent_guide_active` |
  |---|---|---|
  | One Dark | `#fefef31b` | `#fffaed2d` |
  | One Light | `#1f180021` | `#19130029` |

  - 지금까지 쓰던 #3b3d45/#1b1d23은 Zed `fallback_themes.rs`(오프라인용 대체 테마) 값이었다.
  - ORDER-03 보고에 적은 Zed 소스 커밋 14b7b0e는 이 PC에 없어서 4304dec 클론으로 읽었다.

## 바꾼 파일
- 커밋 `b808eec`: `specs/v0.7/PLAN.md`(Phase 4에 I-14, 카드 표), `specs/v0.7/PROGRESS.md`, `specs/v0.7/verify/ORDER-04/*`, `src/app.css`, `src/settings/load.ts`·`model.ts`·`model.test.ts`, `src/spec/metrics.ts`, `src/theme/apply.ts`·`theme.ts`·`theme.test.ts`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 없음

## BLOCKED
- 없음
