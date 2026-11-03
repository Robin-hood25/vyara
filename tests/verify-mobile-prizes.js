import { spawn } from "child_process";
import http from "http";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9225;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find(t => t.type === "page");
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch (e) {}
    await sleep(250);
  }
  throw new Error("Could not connect to Edge DevTools port");
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = msg => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { res, rej } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) rej(data.error);
          else res(data.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((res, rej) => {
      this.callbacks.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }
}

async function run() {
  console.log("=== STARTING MOBILE SCROLL & BREACH VERIFICATION ===");
  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=C:\\Users\\win 11\\AppData\\Local\\Temp\\edge-test-prizes",
    "--window-size=390,844",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
  ]);

  try {
    const wsUrl = await getWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    // Enable console and page
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Listen for JS errors
    const errors = [];
    cdp.ws.addEventListener("message", (msg) => {
      const parsed = JSON.parse(msg.data);
      if (parsed.method === "Runtime.exceptionThrown") {
        errors.push(parsed.params);
      }
    });

    console.log("Navigating to http://localhost:3000/#prizes at mobile 390x844...");
    await cdp.send("Page.navigate", { url: "http://localhost:3000/#prizes" });
    await sleep(2500);

    const coords = await cdp.evaluate(`
      (() => {
        const prizes = document.getElementById("prizes");
        const stage = document.getElementById("prizesVaultStage");
        const hud = document.getElementById("iceUnlockHud");
        const rect = prizes.getBoundingClientRect();
        return {
          prizesOffsetTop: rect.top + window.scrollY,
          prizesHeight: rect.height,
          stageOffsetTop: stage.getBoundingClientRect().top + window.scrollY,
          stageHeight: stage.getBoundingClientRect().height,
          docHeight: document.documentElement.scrollHeight
        };
      })()
    `);
    console.log("Page geometry:", coords);

    // Scroll to the start of Prizes section
    console.log("Scrolling to top of Prizes section...");
    await cdp.evaluate(`window.scrollTo({ top: 4800, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`);
    await sleep(100);
    const topState = await cdp.evaluate(`
      (() => {
        const hud = document.getElementById("iceUnlockHud");
        const stage = document.getElementById("prizesVaultStage");
        const hudRect = hud.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        return {
          scrollY: window.scrollY,
          stageTop: stageRect.top,
          hudTop: hudRect.top,
          hudTransform: hud.style.transform,
          btnOffsetInsideStage: hudRect.top - stageRect.top
        };
      })()
    `);
    console.log("At top of Prizes section:", topState);

    // Scroll 350px down inside Prizes section
    console.log("Scrolling 350px down inside Prizes section...");
    await cdp.evaluate(`window.scrollTo({ top: 4800 + 350, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`);
    await sleep(100);
    const midState = await cdp.evaluate(`
      (() => {
        const hud = document.getElementById("iceUnlockHud");
        const stage = document.getElementById("prizesVaultStage");
        const hudRect = hud.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        return {
          scrollY: window.scrollY,
          stageTop: stageRect.top,
          hudTop: hudRect.top,
          hudTransform: hud.style.transform,
          btnOffsetInsideStage: hudRect.top - stageRect.top
        };
      })()
    `);
    console.log("After scrolling 350px down:", midState);

    // Scroll another 350px (total 700px) down inside Prizes section
    console.log("Scrolling 700px down inside Prizes section...");
    await cdp.evaluate(`window.scrollTo({ top: 4800 + 700, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`);
    await sleep(100);
    const deepState = await cdp.evaluate(`
      (() => {
        const hud = document.getElementById("iceUnlockHud");
        const stage = document.getElementById("prizesVaultStage");
        const hudRect = hud.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        return {
          scrollY: window.scrollY,
          stageTop: stageRect.top,
          hudTop: hudRect.top,
          hudTransform: hud.style.transform,
          btnOffsetInsideStage: hudRect.top - stageRect.top
        };
      })()
    `);
    console.log("After scrolling 700px down:", deepState);

    // Verification check: Button followed the user down
    if (midState.btnOffsetInsideStage > topState.btnOffsetInsideStage &&
        deepState.btnOffsetInsideStage > midState.btnOffsetInsideStage) {
      console.log("✓ VERIFIED: Unlock button successfully follows user scroll down the Prizes section!");
    } else {
      console.warn("Notice: Button positions:", { top: topState.btnOffsetInsideStage, mid: midState.btnOffsetInsideStage, deep: deepState.btnOffsetInsideStage });
    }

    // Now test clicking the Unlock button at this scroll position!
    console.log("Triggering breach click at current scroll position...");
    const clickRes = await cdp.evaluate(`
      (() => {
        const btn = document.getElementById("iceUnlockTrigger");
        btn.click();
        const stage = document.getElementById("prizesVaultStage");
        return {
          isBreaching: stage.classList.contains("is-breaching")
        };
      })()
    `);
    console.log("Breach clicked:", clickRes);

    // Wait for the full gunfire burst and catastrophic ice shatter to complete (1.6s)
    await sleep(2200);

    const postBreachState = await cdp.evaluate(`
      (() => {
        const stage = document.getElementById("prizesVaultStage");
        const refreezeBtn = document.getElementById("btnRefreezeVault");
        const cracks = document.querySelectorAll(".ice-bullet-impact-entry");
        return {
          isUnlocked: stage.classList.contains("is-unlocked"),
          isLocked: stage.classList.contains("is-locked"),
          cracksCount: cracks.length,
          refreezeVisible: refreezeBtn && window.getComputedStyle(refreezeBtn).display !== "none"
        };
      })()
    `);
    console.log("Post-breach state:", postBreachState);

    if (postBreachState.isUnlocked) {
      console.log("✓ VERIFIED: Frozen vault successfully breached and unlocked!");
    } else {
      console.error("FAIL: Vault not unlocked after breach!");
    }

    if (errors.length === 0) {
      console.log("✓ VERIFIED: No console errors or unhandled exceptions occurred!");
    } else {
      console.error("Runtime exceptions detected:", errors);
    }

  } finally {
    edgeProc.kill();
    console.log("Verification finished.");
  }
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
