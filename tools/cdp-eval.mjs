#!/usr/bin/env node
// Development verification helper (Phase 1~). Evaluates a JS expression in the
// ZedLike WebView2 page over the Chrome DevTools Protocol and prints the result
// as JSON. Uses only Node 24 built-ins (fetch, WebSocket).
//
// Requires the app to run with
//   WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222
// (development only).
//
// Usage:
//   node tools/cdp-eval.mjs "<JS expression>" [--out <file>] [--screenshot <png>]
//   node tools/cdp-eval.mjs --screenshot shot.png
// Options:
//   --out <file>         also write the result JSON to <file>
//   --screenshot <png>   capture the page (Page.captureScreenshot) after evaluating
//   --logs               include browser log entries (Log domain; replays entries
//                        collected so far, e.g. CSP violations) in the result
//   --port <n>           DevTools port (default 9222)
//   --title <text>       page title to look for (default ZedLike)
//   --timeout <ms>       limit for each CDP request and the connection (default 30000)
import { writeFileSync } from "node:fs";

function parseArgs(argv) {
  const opts = {
    expr: null,
    out: null,
    screenshot: null,
    logs: false,
    port: 9222,
    title: "ZedLike",
    timeout: 30000,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") opts.out = argv[++i];
    else if (a === "--screenshot") opts.screenshot = argv[++i];
    else if (a === "--logs") opts.logs = true;
    else if (a === "--port") opts.port = Number(argv[++i]);
    else if (a === "--title") opts.title = argv[++i];
    else if (a === "--timeout") opts.timeout = Number(argv[++i]);
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (opts.expr === null) opts.expr = a;
    else throw new Error(`unexpected argument: ${a}`);
  }
  if (!Number.isFinite(opts.timeout) || opts.timeout <= 0) throw new Error("--timeout must be > 0");
  return opts;
}

function usage() {
  console.error(
    'usage: node tools/cdp-eval.mjs "<JS expression>" [--out <file>] [--screenshot <png>] [--logs] [--port 9222] [--title ZedLike] [--timeout 30000]',
  );
}

async function findPage(port, title, timeout) {
  const res = await fetch(`http://127.0.0.1:${port}/json`, { signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`GET /json failed: ${res.status}`);
  const targets = await res.json();
  const page = targets.find((t) => t.type === "page" && t.title === title);
  if (!page) {
    const list = targets.map((t) => `${t.type}:${JSON.stringify(t.title)}`).join(", ");
    throw new Error(`no page titled ${JSON.stringify(title)} (targets: ${list || "none"})`);
  }
  return page;
}

function connect(url, timeout) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let nextId = 1;
    let closed = false;
    const pending = new Map();
    const listeners = new Map();

    const failAll = (err) => {
      for (const { reject: fail, timer } of pending.values()) {
        clearTimeout(timer);
        fail(err);
      }
      pending.clear();
    };

    const openTimer = setTimeout(() => {
      reject(new Error(`WebSocket open timed out after ${timeout} ms: ${url}`));
      ws.close();
    }, timeout);

    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(typeof ev.data === "string" ? ev.data : ev.data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { resolve: ok, reject: fail, timer } = pending.get(msg.id);
        clearTimeout(timer);
        pending.delete(msg.id);
        if (msg.error) fail(new Error(`${msg.error.message} (${msg.error.code})`));
        else ok(msg.result);
      } else if (msg.method && listeners.has(msg.method)) {
        for (const fn of listeners.get(msg.method)) fn(msg.params);
      }
    });
    ws.addEventListener("error", () => {
      clearTimeout(openTimer);
      const err = new Error(`WebSocket error: ${url}`);
      reject(err);
      failAll(err);
    });
    ws.addEventListener("close", () => {
      closed = true;
      clearTimeout(openTimer);
      failAll(new Error("WebSocket closed before the response arrived"));
    });
    ws.addEventListener("open", () => {
      clearTimeout(openTimer);
      resolve({
        send(method, params = {}) {
          if (closed) return Promise.reject(new Error(`WebSocket closed; cannot send ${method}`));
          const id = nextId++;
          return new Promise((ok, fail) => {
            const timer = setTimeout(() => {
              pending.delete(id);
              fail(new Error(`${method} timed out after ${timeout} ms`));
            }, timeout);
            pending.set(id, { resolve: ok, reject: fail, timer });
            ws.send(JSON.stringify({ id, method, params }));
          });
        },
        on(method, fn) {
          if (!listeners.has(method)) listeners.set(method, []);
          listeners.get(method).push(fn);
        },
        close() {
          failAll(new Error("connection closed by client"));
          ws.close();
        },
      });
    });
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (opts.expr === null && !opts.screenshot)) {
    usage();
    process.exit(opts.help ? 0 : 2);
  }
  const page = await findPage(opts.port, opts.title, opts.timeout);
  const cdp = await connect(page.webSocketDebuggerUrl, opts.timeout);
  try {
    const logs = [];
    if (opts.logs) {
      cdp.on("Log.entryAdded", ({ entry }) =>
        logs.push({ source: entry.source, level: entry.level, text: entry.text, url: entry.url }),
      );
      await cdp.send("Log.enable");
    }
    let output = null;
    if (opts.expr !== null) {
      const r = await cdp.send("Runtime.evaluate", {
        expression: opts.expr,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true,
      });
      if (r.exceptionDetails) {
        const d = r.exceptionDetails;
        output = { ok: false, error: d.exception?.description ?? d.text };
      } else {
        output = { ok: true, type: r.result.type, value: r.result.value };
      }
    }
    if (opts.logs) {
      // Let replayed and new entries arrive.
      await new Promise((r) => setTimeout(r, 300));
      output = { ...(output ?? { ok: true }), logs };
    }
    if (output) {
      const json = JSON.stringify(output, null, 2);
      process.stdout.write(json + "\n");
      if (opts.out) writeFileSync(opts.out, json + "\n", "utf8");
    }
    if (opts.screenshot) {
      const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
      writeFileSync(opts.screenshot, Buffer.from(shot.data, "base64"));
      process.stderr.write(`screenshot: ${opts.screenshot}\n`);
    }
    if (output && !output.ok) process.exitCode = 1;
  } finally {
    cdp.close();
  }
}

main().catch((err) => {
  console.error(`cdp-eval: ${err.message}`);
  process.exit(1);
});
