# Phase 3 검증 방법 (wt-coder, 2026-11-01)

SPEC R-10~R-13을 판정하기 위한 도구와 사용법이다. 명령은 모두 레포 루트에서 실행한다.

## 0. 도구와 대상 고정

- 앱 안 덤프는 `window.__poc.syntax`(R-10, R-12)와 `window.__poc.ext`(R-11)로 얻는다. 읽는 도구는 `tools/cdp-eval.mjs`다.
- 대상은 Phase 2 HOWTO 0절대로 고정한다.
  1. `pwsh -NoProfile -File tools/win-input.ps1 -Action state`로 `pid`를 얻는다.
  2. 모든 CDP 호출에 `node tools/cdp-eval.mjs --pid <pid> …`를 쓴다.
- 링크 사례용 시험 확장은 `tools/make-ext-fixture.ps1`이 만든다.
  - 위치: `%TEMP%\zedlike-ext-fixture`
  - 디렉터리 정션과, 만들 수 있으면 심볼릭 링크를 둔다. 이 PC의 Zed 폴더는 건드리지 않는다.
- 빌드 앱의 CSP 확인은 Phase 1 HOWTO 3a 방식이다. 빌드한 exe를 별도 포트·별도 `WEBVIEW2_USER_DATA_FOLDER`로 띄우고 `?poc`로 연다.

## 1. 구조 요약 (판정에 필요한 사실)

- 확장 파일 공급(D-9, D-16):
  - 코어의 커스텀 스킴 `zlext`가 준다. WebView 주소는 `http://zlext.localhost/<확장 id>/<상대 경로>`다(`src-tauri/src/ext_protocol.rs`).
  - 루트는 `ZEDLIKE_EXT_ROOTS` 또는 `%LOCALAPPDATA%\Zed\extensions\installed`다. 파일은 복사하지 않는다.
  - 거부 응답은 403/404이고, 이유는 헤더 `X-Zedlike-Denied`에 있다.
- 거부 이유 코드:
  - `absolute-path`
  - `parent-dir`
  - `link-escapes-extension-root`
  - `bad-extension-id`
  - `unknown-extension`
  - `not-found`
  - `not-a-file`
  - `empty-path`
- CSP(D-16): 기존에 더해 `script-src 'self' 'wasm-unsafe-eval'`, `connect-src … http://zlext.localhost`, `img-src 'self' http://zlext.localhost`를 넣었다.
- 문법 로드(`src/syntax/grammar.ts`):
  1. 파일을 받은 그대로 `Language.load`를 먼저 시도하고, 결과를 `rawLoad`에 남긴다.
  2. 실패하면 메모리 사본에서만 `dylink.0` NEEDED(`libc.so`) 하위 섹션을 건너뛰게 한 뒤 다시 로드한다(`shim`). 이유는 `P0-SUMMARY.md`의 "R-19 관찰"에 있다.
- 강조(`src/syntax/highlight.ts`):
  - CM6 ViewPlugin이 트랜잭션마다 바뀐 곳마다 `Tree.edit`를 부르고, 이전 트리를 넘겨 증분 파싱한다.
  - 장식은 `view.visibleRanges` 안에서만 만들고, 캡처 범위도 그 안으로 자른다.
  - 캡처 이름 → 테마 키는 T-27.1 규칙(점 경계의 가장 긴 키)이다. 스타일은 nonce를 단 `<style>`의 클래스(`zl-syn-*`)와 `:root` 변수(`--zl-syntax-*`)로 준다.
- Lezer 강조: `@codemirror/language`를 설치하지 않았고, 편집기 확장(`src/poc/zedEditor.ts`, `src/syntax/highlight.ts`)에 언어·`syntaxHighlighting` 설정이 없다. 근거 위치는 `package.json` dependencies와 `zedEditorExtensions()`다.
- `web-tree-sitter` 0.27.1의 단위 관찰:
  - `Node`·`Edit`의 index·column은 UTF-16 코드 단위다.
  - `QueryOptions.startIndex/endIndex`는 C에 그대로 넘어가 바이트(코드 단위 × 2)로 해석된다.
  - 그래서 `captures` 범위는 × 2로 넘긴다(`highlight.ts` 주석).
- HTML 탭:
  - Pane `p1`의 탭 `h`는 HTML 예제로, 이 PoC를 위해 새로 쓴 것이다.
  - `bigEdit()`가 만드는 `hbig`는 약 10MB HTML이다.

## 2. R-10 — 문법 WASM·쿼리·술어·테마 키

```
node tools/cdp-eval.mjs --pid <pid> "__poc.syntax.load()"          --out specs/v0.1/verify/phase3/r10-load.json
node tools/cdp-eval.mjs --pid <pid> "__poc.syntax.queries()"       --out specs/v0.1/verify/phase3/r10-queries.json
node tools/cdp-eval.mjs --pid <pid> "__poc.syntax.predicates()"    --out specs/v0.1/verify/phase3/r10-predicates.json
node tools/cdp-eval.mjs --pid <pid> "__poc.syntax.themeKeys()"     --out specs/v0.1/verify/phase3/r10-theme-keys.json
node tools/cdp-eval.mjs --pid <pid> "__poc.syntax.otherGrammars()" --out specs/v0.1/verify/phase3/r10-other.json
```

- `load()`:
  - `grammarUrl`, `bytes`
  - `dylink`(needed 목록, 오프셋)
  - `rawLoad`(그대로 로드 결과)
  - `shim`(적용 여부, 내용)
  - `loaded`, `abiVersion`
  - `parseSample`(예제 HTML 루트 종류, 오류 여부)
- `queries()`: `.scm` 6개마다 `ok`, `error`, `patternCount`, `captureNames`가 나온다.
- `predicates()`: PROGRESS Phase 3에 고정한 사례 P-1~P-7마다 `input`, `expected`, `actual`(match의 pattern, setProperties, captures), `pass`가 나온다.
- `themeKeys()`: 예제에서 나온 캡처 이름별로 앱이 고른 키(`chosenKey`)와 현재 테마의 `syntax` 키 전체가 나온다. 기대 키는 checker가 T-27.1로 따로 계산한다.
- `otherGrammars()`: Markdown·JSON 확장이 설치되지 않았으면 `result: "대기"`다.
- 술어와 별개로, 화면 강조가 맞는지는 `h` 탭 스크린샷과 DOM으로 볼 수 있다. DOM에서는 `.cm-content [data-capture]` 요소의 `data-capture`, 글자, 색을 본다.
- 코어 대안(D-8)은 시험하지 않았다. 이유는 `P0-SUMMARY.md` "R-19 관찰"에 있다(`tree-sitter` 크레이트가 `.wasm`을 읽으려면 제외된 `wasmtime`이 필요).

## 3. R-11 — CSP와 경로 검사

```
# 링크 사례용 시험 확장(임시 폴더). 결과 JSON 의 root 를 다음 명령에 쓴다(경로는 / 로).
pwsh -NoProfile -File tools/make-ext-fixture.ps1
node tools/cdp-eval.mjs --pid <pid> "__poc.ext.addRoot('C:/Users/<user>/AppData/Local/Temp/zedlike-ext-fixture/root')"

# 실제 프로토콜 요청 (C-1~C-7 고정 사례 + 시험 확장 C-8, C-9)
node tools/cdp-eval.mjs --pid <pid> "__poc.ext.protocol({ ext: 'linky', inside: 'ok.txt', outsideViaLink: 'out-junction/secret.txt' })" --out specs/v0.1/verify/phase3/r11-protocol.json

# 같은 검사를 명령으로 (URL 해석 없이 rel 문자열 그대로)
node tools/cdp-eval.mjs --pid <pid> "__poc.ext.check([{id:'K-1',ext:'linky',rel:'ok.txt',expect:'allow'},{id:'K-2',ext:'linky',rel:'out-junction/secret.txt',expect:'deny'},{id:'K-3',ext:'linky',rel:'C:/Windows/win.ini',expect:'deny'},{id:'K-4',ext:'linky',rel:'../../outside/secret.txt',expect:'deny'},{id:'K-5',ext:'html',rel:'../catppuccin/extension.toml',expect:'deny'}])"

# 확장 SVG
node tools/cdp-eval.mjs --pid <pid> "__poc.ext.svg()"
```

- `protocol()` 결과는 사례마다 `url`, `expect`, `actual`, `status`, `reason`(X-Zedlike-Denied), `pass`다.
  - 브라우저는 URL의 `..`를 보내기 전에 정리한다. 그래서 `..`와 절대 경로 사례는 `%2F`·`%5C`로 인코딩한 한 조각으로 보낸다. 코어는 디코딩한 뒤 검사한다.
- 심볼릭 링크: 이 계정에는 권한이 없어 `make-ext-fixture.ps1`이 만들지 못하고, 그 사실을 `symlink.error`에 남긴다. 디렉터리 정션은 권한 없이 만들어지고 같은 검사(정규화한 경로가 루트 밖이면 거부)를 받는다.
- 코어 단위 테스트도 있다: `cargo test --manifest-path src-tauri/Cargo.toml --lib`(`ext_protocol::tests::a55_2_rules`).
- 빌드 앱 CSP:
  ```
  npm run tauri build -- --debug --no-bundle
  # 빌드한 exe 를 WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9223,
  # WEBVIEW2_USER_DATA_FOLDER=<임시 폴더> 로 실행한 뒤 (pid 는 그 exe 의 것)
  node tools/cdp-eval.mjs --port 9223 --pid <빌드 pid> "location.replace('http://tauri.localhost/?poc'), 1"
  node tools/cdp-eval.mjs --port 9223 --pid <빌드 pid> --logs "(async()=>({ load: await __poc.syntax.load(), protocol: await __poc.ext.protocol(), svg: await __poc.ext.svg(), csp: __poc.csp() }))()"
  ```
  - 통과 기준: `csp.violations` 빈 배열, `logs`에 `source: "security"` 없음, 로드·프로토콜·SVG 성공.
  - wt-coder 자체 확인 결과는 `specs/v0.1/verify/phase3/csp-built-check.json`이다. `http://tauri.localhost`에서 위반 0, 로드·쿼리·술어·프로토콜·SVG·장식이 모두 성공했다.

## 4. R-12 — 증분 파싱과 보이는 범위 장식

```
node tools/cdp-eval.mjs --pid <pid> --timeout 300000 "__poc.syntax.bigEdit(10)" --out specs/v0.1/verify/phase3/r12-big-edit.json
node tools/cdp-eval.mjs --pid <pid> --timeout 120000 "__poc.syntax.decorations('hbig')" --out specs/v0.1/verify/phase3/r12-decorations.json
node tools/cdp-eval.mjs --pid <pid> "__poc.syntax.logs()"
```

- `bigEdit(mb, tab, edits)`:
  - 순서: 약 `mb` MB HTML 탭을 연다 → 첫 파싱을 기다린다 → 보이는 범위 가운데에 한 글자를 `edits`번(기본 5) 넣는다.
  - `transactions[]`: 트랜잭션마다 `treeEditCalls`, `oldTreePassed`, `fullReparse`, `parseMs`.
  - `decorationUpdates[]`: 장식을 다시 만든 시간과 수.
  - `medianMs`: 증분 파싱, 장식, dispatch, 화면 반영까지의 중앙값.
  - `initialParseMs`
- `decorations(tab)`:
  - 스크롤 맨 위와 가운데 두 곳에서, 플러그인의 모든 장식 범위를 `view.visibleRanges`와 비교한다.
  - `outsideVisible`가 0이고 장식이 있으면 `pass`다.
- 탭 `h`(작은 예제)는 스크롤이 없어 두 위치가 같다. 판정은 `hbig`로 한다.
- wt-coder 자체 확인(dev 앱, 10MB, `document` 루트, 오류 없음):
  - 첫 파싱 1551ms
  - 증분 파싱 중앙값 98ms(5회, 90~137ms)
  - 장식 1.2ms, 화면 반영까지 중앙값 117ms
  - 맨 위·가운데 모두 보이는 범위 밖 장식 0(가운데 721개)
- 통과 기준 수치는 원문에 없으므로 측정값은 기록용이다(SPEC R-12).

## 5. R-13 — P0 요약표

- 초안은 `specs/v0.1/verify/phase3/P0-SUMMARY.md`다. 판정은 checker가 한다.
- 구조 판단의 조건(메모리 안 dylink 우회의 수용 여부)은 사용자 확인 항목이다.
