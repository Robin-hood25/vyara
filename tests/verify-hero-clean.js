import { spawn } from "child_process";
import fs from "fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9244;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  if (!fs.existsSync("scratch")) {
    fs.mkdirSync("scratch", { recursive: true });
  }

  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--user-data-dir=C:\\Users\\win 11\\AppData\\Local\\Temp\\edge-test-hero-clean",
    "--window-size=1280,850",
    "about:blank"
  ]);

  try {
    let wsUrl;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch("http://127.0.0.1:" + PORT + "/json/list");
        if (res.ok) {
          const list = await res.json();
          const p = list.find(t => t.type === "page");
          if (p) { wsUrl = p.webSocketDebuggerUrl; break; }
        }
      } catch (e) {}
      await sleep(250);
    }
    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(m, p={}) {
      return new Promise((res) => {
        const reqId = id++;
        const handler = (msg) => {
          const d = JSON.parse(msg.data);
          if (d.id === reqId) {
            ws.removeEventListener("message", handler);
            res(d.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id: reqId, method: m, params: p }));
      });
    }

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.navigate", { url: "http://localhost:3000" });
    await sleep(2500);

    const checkDom = await send("Runtime.evaluate", {
      expression: `(() => {
        const heroCard = document.querySelector(".hero-card");
        const heroSidePanel = document.querySelector(".hero-side-panel");
        const cinemaBtn = document.querySelector(".hero-cinema-btn");
        const soundBtn = document.querySelector(".hero-sound-toggle-btn");
        const slotCard = document.querySelector(".hero-slot-card");
        const slotCount = document.querySelector(".slot-count");
        const countdown = document.getElementById("countdown");
        const canvas3D = document.getElementById("hero3DCanvas");

        return {
          hasHeroCard: !!heroCard,
          hasHeroSidePanel: !!heroSidePanel,
          hasCinemaBtn: !!cinemaBtn && cinemaBtn.innerText.trim(),
          hasSoundBtn: !!soundBtn && soundBtn.innerText.trim(),
          hasSlotCard: !!slotCard,
          slotText: slotCount ? slotCount.innerText.trim() : null,
          hasCountdown: !!countdown,
          hasCanvas3D: !!canvas3D
        };
      })()`,
      returnByValue: true
    });

    console.log("DOM Verification Result:", JSON.stringify(checkDom.result.value, null, 2));

    // Capture desktop screenshot
    const shotDesktop = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/hero-clean-desktop.png", Buffer.from(shotDesktop.data, "base64"));
    console.log("Saved scratch/hero-clean-desktop.png");

    // Switch to Mobile viewport (iPhone 14 / modern mobile 390x844)
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);

    const shotMobile = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/hero-clean-mobile.png", Buffer.from(shotMobile.data, "base64"));
    console.log("Saved scratch/hero-clean-mobile.png");

  } finally {
    edgeProc.kill();
  }
}

run().catch(console.error);
