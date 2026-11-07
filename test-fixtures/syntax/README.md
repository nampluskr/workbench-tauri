# 구문 강조 샘플 (ORDER-11)

ORDER-11 판정용 샘플이다. Zed와 tauri에서 같은 파일을 연다(Zed에서는 열기만). 언어와 규칙은 `specs/v0.5/SPEC.md` R-15 "언어 목록 (ORDER-11, Zed 4304dec)"을 따른다. 줄 끝은 LF.

## 파일 → 기대 언어

| 파일 | 기대 언어 이름 | 골라지는 규칙(`path_suffixes`) |
| --- | --- | --- |
| `sample.sh` | Shell Script | `sh` (첫 줄 `#!/usr/bin/env bash`도 `first_line_pattern`에 맞음) |
| `sample.c` | C | `c` |
| `sample.cpp` | C++ | `cpp` |
| `sample.css` | CSS | `css` |
| `sample.diff` | Diff | `diff` |
| `env/.env` | Env | `.env`: 파일 이름 전체가 `.env`일 때만 맞는다(Zed `available_languages.rs` 266~276은 후보가 `"." + 접미사`로 끝나거나 접미사와 같아야 한다. `sample.env`는 `..env`로 끝나지 않고 `.env`와 같지도 않아 맞지 않는다) |
| `COMMIT_EDITMSG` | Git Commit | 파일 이름 `COMMIT_EDITMSG` |
| `sample.go` | Go | `go` |
| `gomod/go.mod` | Go Mod | `mod` |
| `gowork/go.work` | Go Work | `work` |
| `sample.js` | JavaScript | `js` |
| `sample.json` | JSON | `json` |
| `sample.jsonc` | JSONC | `jsonc` |
| `sample.md` | Markdown | `md` |
| `sample.py` | Python | `py` |
| `sample.rs` | Rust | `rs` |
| `sample.tsx` | TSX | `tsx` |
| `sample.ts` | TypeScript | `ts` |
| `sample.yaml` | YAML | `yaml` |
| `sample.html` | HTML | `html` (Zed는 HTML 확장이 설치되어 있어야 한다) |

숨김 언어(JSDoc, Markdown-Inline, Regex, Zed Keybind Context)는 따로 파일이 없다. 다른 파일 안에 주입으로 나온다: JSDoc은 `sample.js`의 `/** … */`, Markdown-Inline은 `sample.md`의 문단·표 칸, Regex는 `sample.ts`·`sample.js`의 정규식.

## 주입 확인

- `sample.md`: 코드 블록 ```` ```rust ````·```` ```javascript ````·```` ```python ````, 문단·목록·인용·표(markdown-inline).
- `sample.html`: `<style>`(CSS), `<script>`(JavaScript), `style="…"`(CSS), `onclick="…"`(JavaScript), 주석, 엔티티(`&amp;` `&lt;` `&gt;` `&copy;` `&nbsp;`).

## 심볼 확인 위치 (I-12 경로 줄)

| 파일 | 줄 | 기대 중첩(바깥 → 안쪽) |
| --- | --- | --- |
| `sample.ts` | 18 | class Inventory › add › function normalize |
| `sample.rs` | 21 | impl Counter › fn bump › fn clamp |
| `sample.py` | 21 | class Library › def add › def normalize |

경로 줄에 실제로 보이는 글자는 Zed outline 쿼리가 정한다(SPEC R-15 "I-12 코드 파일 심볼(outline)"). 위 열은 소스 구조만 적은 것이고, 보이는 글자는 Zed 캡처로 정한다.
