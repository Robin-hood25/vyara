import { spawn } from "child_process";
import fs from "fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9233;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--user-data-dir=C:\\Users\\win 11\\AppData\\Local\\Temp\\edge-test-3d",
    "--window-size=1280,800",
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

    const tiltCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const heroCard = document.querySelector(".hero-card");
        const canvas3D = document.getElementById("hero3DCanvas");
        const cards = document.querySelectorAll("[data-tilt]");

        const rect = heroCard.getBoundingClientRect();
        heroCard.dispatchEvent(new MouseEvent("mousemove", {
          clientX: rect.left + 50,
          clientY: rect.top + 30,
          bubbles: true
        }));

        const transformAfterTilt = heroCard.style.transform;

        return {
          cardsWith3DTilt: cards.length,
          canvas3DPresent: !!canvas3D,
          canvasWidth: canvas3D ? canvas3D.width : 0,
          canvasHeight: canvas3D ? canvas3D.height : 0,
          heroCardTiltTransform: transformAfterTilt
        };
      })()`,
      returnByValue: true
    });

    console.log("3D Test Result:", JSON.stringify(tiltCheck.result.value, null, 2));

    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/hero-with-3d.png", Buffer.from(shot.data, "base64"));
    console.log("Saved scratch/hero-with-3d.png");

  } finally {
    edgeProc.kill();
  }
}
run();
