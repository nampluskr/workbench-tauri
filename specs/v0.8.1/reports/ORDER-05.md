[DONE] ORDER-05 tauri

V3는 debug exe(구현 `4572b27`, R1 `7d28b4b`)로 쟀다. 주 모니터 1920×1080 100%, 창 1440×852, One Dark(음영은 테마 21개), CDP 마우스·키(창을 앞으로 가져온 뒤). 설정 값은 측정 스크립트가 앱 데이터 폴더의 settings.json을 바꿔 넣었다(앱이 파일을 다시 읽음). 앱 데이터·WebView 데이터·픽스처 `o5ws`는 scratchpad의 별도 폴더. 근거는 `specs/v0.8.1/verify/ORDER-05/`(`v3.json`, `v3-b.json`, `v3-c.json`, PNG, `themes/` 21장, `measure.mjs`·`measure-b.mjs`·`measure-c.mjs`).

**검토·판정은 대리다**: tauri-checker(agy) 사용 한도(07:32에 풀림)로 leader-core 결정대로 구현에 참여하지 않은 Claude Code 서브 에이전트(새 컨텍스트)가 C-09(코드 검토)·C-10(R1 검토·V3 판정)을 했다. 같은 Claude 계열이라 독립성이 낮다.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 글꼴 파일 | 출처·버전·라이선스(실제 파일), 원문 파일이 레포에 | 충족 | 아래 "글꼴" 표. 원문 `public/fonts/jetbrains-mono/OFL.txt`, `public/fonts/hack/LICENSE.md`, `public/fonts/ubuntu-mono/LICENCE.txt`·`copyright.txt`, `public/fonts/d2coding/OFL.txt`(대리 검토 C-09가 파일을 열어 실제 라이선스와 맞음을 확인) |
| 2 기본값 | 값 없는 처음 상태에서 에디터·코드 블록 JetBrains Mono, 코드 블록 85%(16px → 13.6px) | 충족 | `v3.json` `c2_defaults_editor.editor` / `c2_defaults.pre` `"JetBrains Mono", "Malgun Gothic", monospace`, `preSize` 13.6px, `body` 16px, `--preview-code-font-size` 13.6px. `c2-preview-default.png` |
| 3 설정 | Settings > Editor 글꼴, Preview 코드 글꼴·크기(%), 바로 반영, 다섯 글꼴 캡처, 미리보기 크기를 따라감 | 충족 | 미리보기 `v3.json` `c3_fonts`(다섯 글꼴 각각 `pre`·`inline` 글꼴 바뀜, 13.6px), 편집기 `v3-b.json` `c3_editor_fonts`(다섯 글꼴, 15px, 줄 높이 24px 그대로). `previewSize20`: 미리보기 20px → 코드 17px, `code120` 120% 반영. 캡처 `c3-font-*.png`(미리보기)·`c3-editor-*.png`(편집기) 각 다섯. Settings 화면의 행·드롭다운은 V1 테스트(`src/settings/model.test.ts`)와 코드; 화면 조작으로 바꾸지는 않았다(설정 파일로 바꿈) |
| 4 적용 범위 | 마크다운 블록·인라인, ipynb 셀·출력·오류·[n]은 코드 글꼴, 브레드크럼·검색 결과·Settings 절 제목은 Lilex | 충족 | 인라인 `c2_defaults.inline` JetBrains Mono·`inlineSize` 14px(인라인 크기 규칙 그대로). `c4_ipynb`: `cell`·`output`·`errorTitle`·`traceback`·`count`("[3]") 모두 JetBrains Mono, `cellSize` 13.6px. `c4_scope`: 브레드크럼·검색 결과 이름·경로 `Lilex, "Malgun Gothic", monospace`. Settings 절 제목은 코드 확인(`--buffer-font-family`를 쓰는 곳이 브레드크럼·검색 결과 이름·경로·Settings 절 제목 넷뿐, C-09) |
| 5 한글 | JetBrains Mono에서 한글 주석은 맑은 고딕, D2Coding에서는 D2Coding | 충족 | CDP `CSS.getPlatformFontsForNode`: 편집기 `v3.json` `c5_korean_editor` JetBrains Mono → ["Malgun Gothic:7","JetBrains Mono:3"], D2Coding → ["D2Coding:10"]; 미리보기 `c3_fonts.*.previewKorean` 같은 결과(Hack·Ubuntu Mono·Lilex도 한글은 Malgun Gothic) |
| 6 글꼴 로딩 | 인터넷 요청 없음, 글꼴을 바꾼 뒤 거터·줄 높이·커서 위치 | 충족 | `c6_long_line.fontRequests`: 모두 `tauri.localhost`(JetBrains Mono·Hack·Ubuntu Mono·D2Coding·Lilex·IBM Plex), `externalRequests` []. 기록은 앱 시작 6초 뒤부터라 처음 받은 글꼴은 `@font-face`가 모두 앱 내부 경로라는 코드 확인으로 보충. 긴 줄(90자) 끝 클릭 → 상태 표시 1:91(Ubuntu Mono·JetBrains Mono 둘 다), 줄 높이 24px, 거터 여백이 글꼴마다 다시 계산됨(3px·5px) |
| 7 설정 파일 | 지금 저장 방식(주석·알 수 없는 키 보존), 목록 밖 이름·범위 밖 크기 → 기본값·멈추지 않음 | 충족 | `c7_bad_values`(`buffer_font_family` "Comic Sans", `preview_code_font_family` 42, `preview_code_font_size` 999): 코드 블록 JetBrains Mono·13.6px, 앱 응답 정상. 실행 중 다시 읽기로 넣었다. 저장 방식(주석·알 수 없는 키 보존)과 편집기 쪽 잘못된 값은 V1 테스트(`model.test.ts`)와 기존 `updateSetting` 재사용 |
| 8 I-11 음영 | One Dark·One Light에서 코드 블록 배경 ≠ 본문 배경, 다른 테마도 캡처 | 충족 | `c8_shading` 21개 테마 모두 `block` ≠ `page`(One Dark rgb(47,52,62) vs rgb(40,44,51), One Light rgb(235,235,236) vs rgb(250,250,250), 가장 작은 차이 macOS Classic Light rgb(249,249,249) vs rgb(255,255,255)). 캡처 `themes/*.png` 21장 |
| 9 I-12 머리 줄 | python 블록·ipynb 셀 위 언어·복사, 언어 없음·mermaid·수식·출력 처리 | 충족 | `c9_headers.blocks`: ```python → `lang` "python"·복사 버튼(`aria-label` "Copy Code"), 언어 없는 펜스·들여쓰기 블록 → `lang` ""(비움)·복사 버튼. `mermaid` 그려짐·머리 줄 없음, `math` 머리 줄 없음(그려짐은 캡처로 판정). `c4_ipynb`: 셀 머리 줄 "python", 출력 머리 줄 0. 머리 줄 높이 22px·12px·text.muted. Mermaid 문법 오류일 때도 머리 줄 없음(코드) |
| 10 I-12 복사 | 클립보드 = 블록 원문(여러 줄·한글·탭·끝 줄바꿈, 머리 줄 글자 없음), 키보드로도 | 충족 | `c10_copy`: 클립보드 `"def greet(name):\n\t# 한글 주석입니다\n\treturn f\"hi {name}\"\n"` = 원문(`equal` true), 아이콘 "Copied" → 2초 뒤 "Copy Code". 버튼에 포커스 + Enter로도 같음(`keyboardEqual` true) |
| 11 회귀 | 위치 연계, Outline 클릭 → 제목 위끝, 구문 색칠, 수식·Mermaid, CSV·HTML·SVG, 에디터 Ctrl+= | 충족 | `c11_regress`: 구문 색칠 span 13, 미리보기 블록 클릭 → 블록 표시(active-block)·편집기 줄 "```python". `v3-b.json` `c11_outline_scroll`(머리 줄 40개 문서): "Part 25" → 제목 top 0(scrollTop 4190), "Part 10" → top 0(1686). `c11_other_previews`: CSV 표·HTML iframe·SVG 그림, 머리 줄 0. `c11_ctrl_plus`: 15px → 16px. 수식·Mermaid는 `c9_headers`와 캡처. 위치 연계는 미리보기 → 편집기 방향만 쟀다(편집기 → 미리보기는 블록 상자로 `data-line`이 옮겨진 코드 확인, C-09) |
| 12 Licenses·크기 | View All Licenses에 글꼴 넷, 늘어난 크기(빌드 산출물) | 충족 | `v3.json` `c12_licenses.aboutList`: JetBrains Mono 2.304 OFL-1.1·Hack 3.003 MIT AND Bitstream-Vera·Ubuntu Mono 0.83 Ubuntu Font Licence 1.0·D2Coding 1.3.2 OFL-1.1. `v3-c.json` `c12_licenses_scan`(Licenses 탭을 스크롤하며): `/fonts/jetbrains-mono/OFL.txt`·`/fonts/hack/LICENSE.md`·`/fonts/ubuntu-mono/LICENCE.txt`·`/fonts/ubuntu-mono/copyright.txt`·`/fonts/d2coding/OFL.txt`와 본문 표지(JetBrains Mono Project Authors·Bitstream Vera·UBUNTU FONT LICENCE·NAVER Corporation) 모두 있음. 크기: vite 빌드 `dist/fonts/` jetbrains-mono 385,167 + hack 442,860 + ubuntu-mono 828,400 + d2coding 4,190,355 = **5,846,782 B**(약 5.58 MiB, 대부분 D2Coding 한 벌 4.19 MB) |
| 13 테스트 | 설정 읽기·검증 테스트, 전체 통과, typecheck 0 | 충족 | `7d28b4b`에서 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 303/303. 새 테스트: `model.test.ts`(새 키 셋의 기본값·목록 밖·범위 밖·형), `about.test.ts`·`app-menus.test.ts`(글꼴 넷) |

## 글꼴
| 글꼴 | 출처 | 버전 | 라이선스(파일로 확인) | 넣은 벌 |
|---|---|---|---|---|
| JetBrains Mono | https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip (`fonts/webfonts/`) | 2.304 | OFL-1.1 (`OFL.txt`) | Regular·Italic·Bold·BoldItalic woff2 |
| Hack | https://github.com/source-foundry/Hack/releases/download/v3.003/Hack-v3.003-webfonts.zip + `LICENSE.md`(v3.003 태그) | 3.003 | MIT + Bitstream Vera License (`LICENSE.md`) | Regular·Italic·Bold·BoldItalic woff2 |
| Ubuntu Mono | https://assets.ubuntu.com/v1/0cef8205-ubuntu-font-family-0.83.zip | 묶음 0.83(글꼴 0.80) | Ubuntu Font Licence 1.0 (`LICENCE.txt`, `copyright.txt`) | R·RI·B·BI TTF(공식 배포가 TTF뿐, UFL 수정본 조건 때문에 변환 안 함) |
| D2Coding | https://github.com/naver/d2codingfont/releases/download/VER1.3.2/D2Coding-Ver1.3.2-20180524.zip + `OFL.txt`(master) | 1.3.2 | OFL-1.1, Reserved Font Name D2Coding (`OFL.txt`) | Regular만 TTF(한 벌 4 MB, 굵게는 합성; 변환본은 예약 이름 문제로 원본 그대로) |

## 검증
- `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 303/303(`7d28b4b`). `npm.cmd run tauri build -- --debug --no-bundle` 성공. 의존성·`src-tauri/`·`package.json` 변경 없음(`git diff 91576dd -- src-tauri/ package.json package-lock.json` 출력 없음, C-09).
- 화면 차례 한 번(`[SCREEN-REQ]`/`[SCREEN-OK]`/`[SCREEN-DONE]`) 안에서 `measure.mjs` → `measure-b.mjs`(편집기 글꼴, 긴 문서 Outline 스크롤, 다른 미리보기, Ctrl+=) → R1 뒤 `measure-c.mjs`.
- 측정 메모: `v3.json`의 `editor: null`(미리보기 탭이 앞), `c11_regress.outlineHeading`(짧은 문서), `c12_licenses.licensesHas` false(가상 스크롤)는 판별력이 없고 `v3-b.json`·`v3-c.json`의 키가 대신한다.
- **대리 검토**: C-09 REWORK(M-1 첫 코드 블록 위 16px 회귀; 권고 R-1~R-4) → K-05-R1(M-1·R-2·R-3); C-10 1부 PASS, 2부 V3 #1~#13 PASS(약한 근거는 위 표에 적음). 보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-09-report.md`·`v081-C-10-report.md`.

## 지운 것·더한 것·하지 않은 것
- 더함: 글꼴 넷(`public/fonts/`), 설정 `buffer_font_family`·`preview_code_font_family`·`preview_code_font_size`, CSS 변수 `--editor-font-family`·`--preview-code-font-family`·`--preview-code-font-size`, 코드 블록 상자(음영·머리 줄·복사 버튼), 글꼴 로딩을 기다린 뒤의 편집기 치수 계산. 지움: 코드 블록 1px `border.variant` 테두리와 안 쓰게 된 `markdown_preview.code_block.border`.
- 하지 않음: ipynb 출력 음영 빼기(C-09 R-1 — 사용자 확인), `applyMetrics` 기본 인자 정리(R-4).
- 남은 위험: D2Coding을 처음 고르면 4 MB를 읽는 동안 글꼴 변경이 잠깐 늦다. 거터 좌우 여백(I-14)은 Lilex에서 잰 고정 px라 다른 글꼴에서 Zed와 다를 수 있다(기존 shortcut). About의 Ubuntu Mono 저작권 줄은 글꼴 name table의 "2011", copyright.txt는 "2010,2011".

## tauri가 고른 것
- 설정 이름(Settings): Editor "Font Family"(`buffer_font_family`, Zed 키 이름), Preview "Code Font Family"(`preview_code_font_family`)·"Code Font Size"(`preview_code_font_size`, %).
- 크기 범위: 50~150 정수 %, 단계 1, 기본 85. 파일의 범위 밖 값은 85, Settings 입력은 가장 가까운 값으로.
- 음영: `panel.background`, 테두리 없음, 둥근 모서리(GitHub·VS Code 미리보기 모양). 인라인 코드 배경 그대로.
- 머리 줄: 높이 = 버튼 높이(L-07, 22px), UI 글꼴 12px(L-05)·text.muted, 아이콘 zed-icons `copy`·`check` 14px. 언어 = 펜스 info 첫 낱말(ipynb는 노트북 언어), 없으면 비움. 복사 뒤 아이콘이 `check`로 2초(`CODE_BLOCK_COPIED_MS` = 2000, tauri 값), 실패하면 toast. 머리 줄 글자는 선택되지 않음.
- mermaid: 머리 줄 없음(문법 오류로 원문이 보일 때도 없음, 오류 한 줄은 지금 모양 그대로). 수식·ipynb 출력·raw 셀·앞머리에도 없음.
- 클립보드: 앱의 Rust `write_clipboard_text`(About Copy와 같은 경로) — capability·CSP 변경 없음.
- D2Coding 한 벌(Regular).

## 바꾼 파일
- 코드 `4572b27`(K-05): `src/app.css`, `src/editor/extensions.ts`, `src/settings/load.ts`, `src/settings/model.ts`, `src/settings/model.test.ts`, `src/shell/about.ts`, `src/shell/about.test.ts`, `src/shell/app-menus.test.ts`, `src/shell/licenses.ts`, `src/shell/markdown-preview.ts`, `src/spec/metrics.ts`, `public/fonts/{jetbrains-mono,hack,ubuntu-mono,d2coding}/`(글꼴·라이선스).
- 코드 `7d28b4b`(K-05-R1): `src/app.css`, `src/shell/licenses.ts`, `src/shell/app-menus.test.ts`, `public/fonts/ubuntu-mono/copyright.txt`.
- 문서·검증 `e5bbcbf`: `specs/v0.8.1/PLAN.md`·`PROGRESS.md`, `specs/v0.8.1/verify/ORDER-05/`.

## 미정
- 사용자 확인(V4, leader-core): 다섯 글꼴의 보기 좋음, 테마 21개 음영 농도(특히 macOS Classic Light·Gruvbox Light Soft처럼 차이가 작은 테마)와 구문 색 가독성, 머리 줄 모양, ipynb 출력에도 음영이 드는 것(VS Code·Jupyter는 출력에 음영 없음).

## BLOCKED
- 없음
