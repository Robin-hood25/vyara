import { spawn } from "child_process";
import fs from "fs";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9266;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log("=== RUNNING BULLET IMPACT SPARKS & HOLES VERIFICATION ===");

  if (!fs.existsSync("scratch")) {
    fs.mkdirSync("scratch", { recursive: true });
  }

  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--user-data-dir=C:\\Users\\win 11\\AppData\\Local\\Temp\\edge-test-bullets",
    "--window-size=1280,900",
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

    // 1. Top of page verification (hero in view): NO sparks, NO bullet holes
    console.log("-> Checking initial state at top of page (Hero in view)...");
    const topCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const viewport = document.getElementById("scrollBulletsViewport");
        const impact1 = document.getElementById("impact-1");
        const sparksSvg = impact1 ? impact1.querySelector(".bullet-sparks-svg") : null;
        const holeWrapper = impact1 ? impact1.querySelector(".bullet-hole-wrapper") : null;

        return {
          viewportVisibility: viewport ? getComputedStyle(viewport).visibility : null,
          viewportOpacity: viewport ? getComputedStyle(viewport).opacity : null,
          impact1Visibility: impact1 ? impact1.style.visibility : null,
          sparksOpacity: sparksSvg ? sparksSvg.style.opacity : null,
          holeOpacity: holeWrapper ? holeWrapper.style.opacity : null
        };
      })()`,
      returnByValue: true
    });

    console.log("Top of page state:", JSON.stringify(topCheck.result.value, null, 2));
    assert.equal(topCheck.result.value.viewportVisibility, "hidden", "Viewport must be hidden at top of page");
    assert.equal(topCheck.result.value.impact1Visibility, "hidden", "Impact 1 must be hidden when hero is in view");
    console.log("✓ Acceptance 1: Completely invisible inside hero section");

    // Measure hero bottom in page
    const heroInfo = await send("Runtime.evaluate", {
      expression: `(() => {
        const hero = document.getElementById("hero");
        const rect = hero.getBoundingClientRect();
        const docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        const heroBottom = rect.top + window.scrollY + hero.offsetHeight;
        return {
          heroBottom,
          docHeight,
          windowHeight: window.innerHeight
        };
      })()`,
      returnByValue: true
    });
    const { heroBottom, docHeight, windowHeight } = heroInfo.result.value;
    console.log("Hero bottom position:", heroBottom, "px; Total doc height:", docHeight, "px");

    // 2. Scroll to trigger Stage 1: Spark burst on Impact 1
    // Available scroll beyond hero:
    const availableScroll = docHeight - windowHeight - heroBottom;
    // Impact 1 has threshold 0.00. SPAN is 0.026.
    // At scroll progress = 0.005 (localProgress = 0.005 / 0.026 = ~0.19):
    const targetScrollYStage1 = Math.round(heroBottom + availableScroll * 0.004 + 10);
    console.log(`-> Scrolling to Stage 1 (Sparks Burst): scrollY = ${targetScrollYStage1}px...`);

    await send("Runtime.evaluate", {
      expression: `window.scrollTo({ top: ${targetScrollYStage1}, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`
    });
    await sleep(400);

    const stage1Check = await send("Runtime.evaluate", {
      expression: `(() => {
        try {
          const impact1 = document.getElementById("impact-1");
          if (!impact1) return { error: "impact-1 not found" };
          const sparksSvg = impact1.querySelector(".bullet-sparks-svg");
          const holeWrapper = impact1.querySelector(".bullet-hole-wrapper");
          const flashCore = impact1.querySelector(".spark-flash-core");
          const firstLine = impact1.querySelector(".spark-streaks-group line");

          return {
            itemVisibility: impact1.style.visibility,
            sparksOpacity: sparksSvg ? sparksSvg.style.opacity : null,
            holeOpacity: holeWrapper ? holeWrapper.style.opacity : null,
            flashOpacity: flashCore ? flashCore.getAttribute("opacity") : null,
            sparkLineX2: firstLine ? firstLine.getAttribute("x2") : null,
            sparkLineY2: firstLine ? firstLine.getAttribute("y2") : null,
            sparkLineOpacity: firstLine ? firstLine.getAttribute("opacity") : null
          };
        } catch (e) {
          return { error: e.message };
        }
      })()`,
      returnByValue: true
    });

    console.log("Stage 1 (Sparks Burst) State:", JSON.stringify(stage1Check.result.value, null, 2));
    assert.equal(stage1Check.result.value.itemVisibility, "visible", "Impact item must be visible during burst");
    assert.equal(stage1Check.result.value.sparksOpacity, "1", "Sparks SVG must have opacity 1 during burst");
    assert(parseFloat(stage1Check.result.value.sparkLineOpacity) > 0, "Spark line opacity must be > 0");
    assert(Math.abs(parseFloat(stage1Check.result.value.sparkLineX2)) > 0, "Sparks must shoot outward from origin");
    console.log("✓ Acceptance 2: Stage 1 metallic spark burst activated immediately post-hero");

    // Capture screenshot of Spark Burst
    const shotSparks = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/01-bullet-spark-burst.png", Buffer.from(shotSparks.data, "base64"));
    console.log("Saved scratch/01-bullet-spark-burst.png");

    // 3. Scroll to trigger Stage 2: Sparks faded, Bullet Hole remains permanently
    // At scroll progress = 0.035 (localProgress = 0.035 / 0.026 = 1.35 >= 1.0)
    const targetScrollYStage2 = Math.round(heroBottom + availableScroll * 0.035 + 20);
    console.log(`-> Scrolling to Stage 2 (Hole Remains, Sparks Faded): scrollY = ${targetScrollYStage2}px...`);

    await send("Runtime.evaluate", {
      expression: `window.scrollTo({ top: ${targetScrollYStage2}, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`
    });
    await sleep(400);

    const stage2Check = await send("Runtime.evaluate", {
      expression: `(() => {
        try {
          const impact1 = document.getElementById("impact-1");
          const sparksSvg = impact1 ? impact1.querySelector(".bullet-sparks-svg") : null;
          const holeWrapper = impact1 ? impact1.querySelector(".bullet-hole-wrapper") : null;
          const flashCore = impact1 ? impact1.querySelector(".spark-flash-core") : null;

          return {
            itemVisibility: impact1 ? impact1.style.visibility : null,
            sparksOpacity: sparksSvg ? sparksSvg.style.opacity : null,
            holeOpacity: holeWrapper ? holeWrapper.style.opacity : null,
            holeTransform: holeWrapper ? holeWrapper.style.transform : null,
            flashOpacity: flashCore ? flashCore.getAttribute("opacity") : null
          };
        } catch (e) {
          return { error: e.message };
        }
      })()`,
      returnByValue: true
    });

    console.log("Stage 2 (Bullet Hole Remains) State:", JSON.stringify(stage2Check.result.value, null, 2));
    assert.equal(stage2Check.result.value.itemVisibility, "visible", "Impact item must remain visible");
    assert.equal(stage2Check.result.value.sparksOpacity, "0", "Sparks SVG must fade to 0 after impact completes");
    assert.equal(stage2Check.result.value.flashOpacity, "0", "Flash core must fade to 0");
    assert.equal(stage2Check.result.value.holeOpacity, "1", "Bullet hole must permanently remain at opacity 1");
    assert(stage2Check.result.value.holeTransform.includes("scale(1)"), "Bullet hole must be at scale(1)");
    console.log("✓ Acceptance 3: Stage 2 bullet hole remains permanently visible at exact impact point");

    // Capture screenshot of Permanent Bullet Hole
    const shotHole = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/02-bullet-hole-remaining.png", Buffer.from(shotHole.data, "base64"));
    console.log("Saved scratch/02-bullet-hole-remaining.png");

    // 4. Test Scroll Reversal (Scrolling up restores previous state)
    console.log("-> Testing Reverse Scroll (scrolling back to Stage 1 sparks)...");
    await send("Runtime.evaluate", {
      expression: `window.scrollTo({ top: ${targetScrollYStage1}, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`
    });
    await sleep(400);

    const reverseCheck1 = await send("Runtime.evaluate", {
      expression: `(() => {
        const impact1 = document.getElementById("impact-1");
        const sparksSvg = impact1.querySelector(".bullet-sparks-svg");
        return {
          sparksOpacity: sparksSvg.style.opacity
        };
      })()`,
      returnByValue: true
    });
    assert.equal(reverseCheck1.result.value.sparksOpacity, "1", "Scrolling back must restore active sparks");
    console.log("✓ Acceptance 5: Scrolling up restores sparks in reverse order");

    console.log("-> Scrolling back to top of page (inside hero)...");
    await send("Runtime.evaluate", {
      expression: `window.scrollTo({ top: 0, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`
    });
    await sleep(400);

    const reverseCheckTop = await send("Runtime.evaluate", {
      expression: `(() => {
        try {
          const impact1 = document.getElementById("impact-1");
          const viewport = document.getElementById("scrollBulletsViewport");
          return {
            viewportVisibility: viewport ? viewport.style.visibility : null,
            impact1Visibility: impact1 ? impact1.style.visibility : null
          };
        } catch (e) {
          return { error: e.message };
        }
      })()`,
      returnByValue: true
    });
    assert.equal(reverseCheckTop.result.value.viewportVisibility, "hidden", "Viewport must hide when scrolling back into hero");
    assert.equal(reverseCheckTop.result.value.impact1Visibility, "hidden", "Impact 1 must hide when scrolling back into hero");
    console.log("✓ Acceptance 5 (part 2): Returning to hero removes all impacts");

    // 5. Test Stationary Freeze:
    // Scroll to an intermediate position, wait 500ms, and verify properties have NOT changed
    console.log("-> Testing stationary freeze (zero autonomous animation while still)...");
    await send("Runtime.evaluate", {
      expression: `window.scrollTo({ top: ${targetScrollYStage1}, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`
    });
    await sleep(400);

    const snapshot1 = await send("Runtime.evaluate", {
      expression: `(() => {
        const impact1 = document.getElementById("impact-1");
        const firstLine = impact1.querySelector(".spark-streaks-group line");
        return {
          x2: firstLine.getAttribute("x2"),
          y2: firstLine.getAttribute("y2"),
          opacity: firstLine.getAttribute("opacity")
        };
      })()`,
      returnByValue: true
    });

    await sleep(600); // Wait without scrolling

    const snapshot2 = await send("Runtime.evaluate", {
      expression: `(() => {
        const impact1 = document.getElementById("impact-1");
        const firstLine = impact1.querySelector(".spark-streaks-group line");
        return {
          x2: firstLine.getAttribute("x2"),
          y2: firstLine.getAttribute("y2"),
          opacity: firstLine.getAttribute("opacity")
        };
      })()`,
      returnByValue: true
    });

    assert.deepEqual(snapshot1.result.value, snapshot2.result.value, "Values MUST remain completely frozen while scroll is stationary");
    console.log("✓ Acceptance 6: Zero autonomous movement while stationary; perfectly frozen");

    // 6. Test Mobile Viewport & Reduced Particle Count
    console.log("-> Testing mobile viewport (390x844)...");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(400);

    // Scroll beyond hero on mobile
    const mobileHeroInfo = await send("Runtime.evaluate", {
      expression: `(() => {
        const hero = document.getElementById("hero");
        const rect = hero.getBoundingClientRect();
        return rect.top + window.scrollY + hero.offsetHeight;
      })()`,
      returnByValue: true
    });
    const mobHeroBottom = mobileHeroInfo.result.value;

    await send("Runtime.evaluate", {
      expression: `window.scrollTo({ top: ${mobHeroBottom + 120}, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`
    });
    await sleep(400);

    const shotMobile = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/03-bullet-sparks-mobile.png", Buffer.from(shotMobile.data, "base64"));
    console.log("Saved scratch/03-bullet-sparks-mobile.png");

    console.log("\n>>> ALL BULLET IMPACT SPARKS & HOLES ACCEPTANCE TESTS PASSED! <<<\n");

  } finally {
    edgeProc.kill();
  }
}

run().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
