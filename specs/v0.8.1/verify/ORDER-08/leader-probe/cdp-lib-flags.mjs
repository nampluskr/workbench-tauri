// Shared helpers for V2/V3 measurement scripts (AGENTS 3A, SPEC 공통 판정 방식).
// Launches the built exe with a CDP port, attaches over WebSocket, reads spec/zed-metrics.toml.
import { spawn, execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = "D:/projects/workbench-tauri";
export const DEFAULT_EXE = resolve(root, "src-tauri/target/debug/workbench-tauri.exe");
const PORT = 9222;

// shortcut: line-based lookup of `"key" = { value = N`, no full TOML parse; switch to a parser if a value needs arrays/strings.
export function metric(section, key) {
  const lines = readFileSync(resolve(root, "spec/zed-metrics.toml"), "utf8").split(/\r?\n/);
  let inSection = false;
  for (const line of lines) {
    const header = line.match(/^\[(.+)\]\s*$/);
    if (header) inSection = header[1] === section;
    else if (inSection) {
      const m = line.match(/^"?([\w.]+)"?\s*=\s*\{\s*value\s*=\s*([-\d.]+)/);
      if (m && m[1] === key) return Number(m[2]);
    }
  }
  throw new Error(`metric not found: ${section}.${key}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launchApp(exe = DEFAULT_EXE) {
  const child = spawn(exe, [], {
    env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT} ${process.env.EXTRA_FLAGS || ""}` },
    stdio: "ignore",
  });
  let target;
  for (let i = 0; i < 100 && !target; i++) {
    await sleep(300);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find((t) => t.type === "page");
    } catch {}
  }
  if (!target) throw new Error("CDP target not found");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
    } else if (msg.method) listeners.forEach((fn) => fn(msg));
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const i = ++id;
      pending.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  /** Evaluate an expression in the page; awaits promises; returns the JSON value. */
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const mouse = (type, x, y, extra = {}) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", ...extra });
  const kill = () => {
    try {
      ws.close();
    } catch {}
    try {
      execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } catch {}
  };
  return { send, evaluate, mouse, on: (fn) => listeners.push(fn), kill, sleep, pid: child.pid };
}
