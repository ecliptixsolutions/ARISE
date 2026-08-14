// CDP verification helper: measures layout at a given viewport width.
// Usage: node verify-layout.mjs <url> <width> <height> [pageName]
import { spawn } from "node:child_process";
import http from "node:http";
import WebSocket from "ws";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9229;

const url = process.argv[2] || "http://localhost:8080/";
const width = Number(process.argv[3] || 1440);
const height = Number(process.argv[4] || 900);
const label = process.argv[5] || url;

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=C:\\Users\\Vivek\\AppData\\Local\\Temp\\opencode\\chrome-profile",
  `--window-size=${width},${height}`,
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
let nextId = 1;
const pending = new Map();

function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function getTab() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      const tabs = await res.json();
      const tab = tabs.find((t) => t.type === "page");
      if (tab) return tab;
    } catch {}
    await sleep(200);
  }
  throw new Error("CDP not reachable");
}

async function evalJS(expression) {
  const res = await cdp("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    return { error: res.exceptionDetails.text + ": " + (res.exceptionDetails.exception?.description ?? "") };
  }
  return res.result.value;
}

const tab = await getTab();
ws = new WebSocket(tab.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
await new Promise((r) => ws.once("open", r));
ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});

await cdp("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: false,
});

await cdp("Page.enable");
await cdp("Runtime.enable");
await cdp("Page.navigate", { url });
await sleep(6000);

const metrics = await evalJS(`(() => {
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) };
  };
  const q = (sel) => document.querySelector(sel);
  const phone = q('a[href^="tel:"]');
  const email = q('a[href^="mailto:"]');
  const track = q('a[href*="track-repair"]');
  const topBar = q('[data-topbar]');
  const header = q('header.site-header-premium');
  const hero = q('.home-hero');
  const badge = hero?.querySelector('.home-hero article div.inline-flex') ?? null;
  const doc = document.documentElement;
  return {
    viewport: innerWidth,
    docScrollW: doc.scrollWidth,
    hOverflow: doc.scrollWidth > innerWidth,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
    htmlOverflowX: getComputedStyle(doc).overflowX,
    topBar: rect(topBar),
    topBarBg: topBar ? getComputedStyle(topBar).backgroundColor : null,
    header: rect(header),
    headerPos: header ? getComputedStyle(header).position : null,
    hero: rect(hero),
    badge: rect(badge),
    phone: phone ? { text: phone.textContent.trim(), href: phone.getAttribute("href"), aria: phone.getAttribute("aria-label"), font: getComputedStyle(phone).fontSize, rect: rect(phone) } : null,
    email: email ? { text: email.textContent.trim(), href: email.getAttribute("href"), aria: email.getAttribute("aria-label"), rect: rect(email) } : null,
    track: track ? { text: track.textContent.trim(), href: track.getAttribute("href"), rect: rect(track) } : null,
    status: (() => {
      const s = q('[data-status]');
      if (!s) return null;
      const r = s.getBoundingClientRect();
      return { text: s.textContent.trim().replace(/\\s+/g, " "), hidden: getComputedStyle(s).display === "none", x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    })(),
    overlaps: (() => {
      const h = header?.getBoundingClientRect();
      const b = badge?.getBoundingClientRect();
      if (!h || !b) return null;
      const x = Math.max(0, Math.min(h.right, b.right) - Math.max(h.left, b.left));
      const y = Math.max(0, Math.min(h.bottom, b.bottom) - Math.max(h.top, b.top));
      return x > 0 && y > 0 ? { overlapPx: Math.round(y), x, y } : null;
    })(),
  };
})()`);

console.log(`\n=== ${label} (${width}x${height}) ===`);
console.log(JSON.stringify(metrics, null, 1));

ws.close();
chrome.kill();
await sleep(500);
process.exit(0);
