// take-screenshots.mjs — serves app/ on a local port, drives the Puppeteer
// Chrome over raw CDP (websocket, no puppeteer package), opens each scene in
// shots.json deterministically, and writes JPEG screenshots to screenshots/.
// Usage: node take-screenshots.mjs
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = process.env.HOME + "/.cache/puppeteer/chrome/linux-157.0.8103.78/chrome-linux64/chrome";
const APP_PORT = 8901;
const CDP_PORT = 9333;
const shots = JSON.parse(readFileSync(join(rootDir, "shots.json"), "utf8"));

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForJson(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { const res = await fetch(url); if (res.ok) return await res.json(); } catch {}
    await sleep(250);
  }
  throw new Error("Timed out waiting for " + url);
}

const server = spawn("node", ["serve.ts", "--port", String(APP_PORT)], { cwd: rootDir, stdio: "ignore" });
const chrome = spawn(CHROME_PATH, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${CDP_PORT}`, "--window-size=1280,800", "about:blank",
], { stdio: "ignore" });

try {
  await waitForJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
  await waitForJson(`http://127.0.0.1:${APP_PORT}/index.html`).catch(() => null);
  await sleep(600);
  const targets = await waitForJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let nextId = 1;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  function send(method, params = {}) {
    const id = nextId++;
    return new Promise((resolve) => { pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
  }
  await send("Page.enable");
  await send("Runtime.enable");
  mkdirSync(join(rootDir, "screenshots"), { recursive: true });
  for (const shot of shots) {
    const url = `http://127.0.0.1:${APP_PORT}${shot.path}`;
    await send("Page.navigate", { url });
    await sleep(1800);
    const check = await send("Runtime.evaluate", { expression: "document.querySelectorAll('.trophy-row').length + '|' + document.title", returnByValue: true });
    console.log(shot.file, "rows/title:", check.result?.result?.value ?? JSON.stringify(check.result));
    const shotResult = await send("Page.captureScreenshot", { format: "jpeg", quality: 82, captureBeyondViewport: false });
    const data = shotResult.result?.data;
    if (!data) throw new Error("No screenshot data for " + shot.file);
    writeFileSync(join(rootDir, "screenshots", shot.file), Buffer.from(data, "base64"));
    console.log("wrote", shot.file);
  }
  ws.close();
} finally {
  chrome.kill("SIGKILL");
  server.kill("SIGKILL");
}
