import { spawn } from "child_process";
import fs from "fs";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9277;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log("=== RUNNING TERMS & CONDITIONS & PAYMENT POLICY TESTS ===");

  if (!fs.existsSync("scratch")) {
    fs.mkdirSync("scratch", { recursive: true });
  }

  // 1. Direct HTTP GET verification of /terms-and-conditions
  const res = await fetch("http://localhost:3000/terms-and-conditions");
  assert.equal(res.status, 200, "GET /terms-and-conditions must return 200 OK");
  const html = await res.text();

  // Verify Header & Sections A through H
  assert(html.includes("TERMS &amp; CONDITIONS &amp; PAYMENT POLICY") || html.includes("TERMS & CONDITIONS"), "Must have main heading");
  assert(html.includes("A. Tournament Registration"), "Must have Section A");
  assert(html.includes("B. Booking Prices &amp; Availability") || html.includes("B. Booking Prices"), "Must have Section B");
  assert(html.includes("C. Non-Refundable Payments"), "Must have Section C");
  assert(html.includes("D. Tournament Rules &amp; Fair Play") || html.includes("D. Tournament Rules"), "Must have Section D");
  assert(html.includes("E. Digital Tickets &amp; Entry") || html.includes("E. Digital Tickets"), "Must have Section E");
  assert(html.includes("F. Prizes &amp; Lucky Pool") || html.includes("F. Prizes"), "Must have Section F");
  assert(html.includes("G. Changes &amp; Decisions") || html.includes("G. Changes"), "Must have Section G");
  assert(html.includes("H. Privacy &amp; Contact") || html.includes("H. Privacy"), "Must have Section H");

  // Verify Section B prices
  assert(html.includes("₹2,000") && html.includes("₹1,200") && html.includes("SAVE ₹800"), "Must specify Squad Pass ₹2,000, ₹1,200, save ₹800");
  assert(html.includes("₹500") && html.includes("₹350") && html.includes("SAVE ₹150") && html.includes("SOLD OUT"), "Must specify Solo Pass ₹500, ₹350, save ₹150, SOLD OUT");

  // Verify Section C prominent notice
  assert(html.includes("IMPORTANT: ALL CONFIRMED TOURNAMENT BOOKINGS ARE NON-REFUNDABLE."), "Must contain exact prominent non-refundable notice");
  assert(html.includes("change of mind, personal scheduling conflict, absence, late arrival"), "Must detail non-refundable circumstances");
  assert(html.includes("Statutory Rights"), "Must disclose statutory rights / organizer cancellation");

  // Verify Section D placeholder
  assert(html.includes("[OFFICIAL RULES PLACEHOLDER]"), "Must include clearly labeled placeholder for tournament rules");

  // Verify Section F prizes
  assert(html.includes("₹10,000") && html.includes("1st Place"), "Must state 1st place ₹10,000");
  assert(html.includes("₹5,000") && html.includes("2nd Place"), "Must state 2nd place ₹5,000");
  assert(html.includes("Lucky Pool") && html.includes("pre-booking"), "Must disclose Lucky Pool ₹10,000 for pre-bookings only");

  // Verify Section H contact channels
  assert(html.includes("+91 9876543210"), "Must include official WhatsApp");
  assert(html.includes("vyara.digital"), "Must include official Instagram");
  assert(html.includes("vyaraesports@upi"), "Must include official UPI ID");
  assert(html.includes("[Official Organizer Email"), "Must include email placeholder");

  console.log("✓ Acceptance 1: All required sections A through H and exact terms verified in HTML");

  // 2. Direct API request bypass protection check
  const bypassRes = await fetch("http://localhost:3000/api/bookings/verify-demo-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId: "VYRA-BK-TEST-BYPASS",
      demoUtr: "DEMO-BYPASS-001",
      phone: "9876543210",
      amount: 1200
      // termsAccepted NOT provided
    })
  });
  assert.equal(bypassRes.status, 400, "Direct API call without termsAccepted must be rejected with 400");
  const bypassData = await bypassRes.json();
  assert(bypassData.error.includes("Terms & Conditions"), "Error must mention Terms & Conditions requirement");
  console.log("✓ Acceptance 2: Direct API request cannot bypass required terms acceptance (rejected with 400)");

  // 3. Browser end-to-end verification
  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--user-data-dir=C:\\Users\\win 11\\AppData\\Local\\Temp\\edge-test-terms",
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
    assert(wsUrl, "Must obtain WebSocket URL from Edge DevTools");

    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(m, p={}) {
      return new Promise((resolve, reject) => {
        const reqId = id++;
        const listener = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === reqId) {
            ws.removeEventListener("message", listener);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener("message", listener);
        ws.send(JSON.stringify({ id: reqId, method: m, params: p }));
      });
    }

    // A. Navigate to /terms-and-conditions (Desktop Viewport)
    console.log("-> Navigating to /terms-and-conditions in browser...");
    await send("Page.navigate", { url: "http://localhost:3000/terms-and-conditions" });
    await sleep(1500);

    const desktopCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const h1 = document.querySelector(".terms-title")?.innerText;
        const alertTitle = document.querySelector(".terms-alert-title")?.innerText;
        const sections = document.querySelectorAll(".terms-section").length;
        const navReturnLink = document.querySelector(".terms-nav-actions a")?.getAttribute("href");
        return {
          h1,
          alertTitle,
          sectionsCount: sections,
          navReturnLink
        };
      })()`,
      returnByValue: true
    });
    console.log("Desktop Terms Page Evaluation:", JSON.stringify(desktopCheck.result.value, null, 2));
    assert(desktopCheck.result.value.h1.includes("TERMS"), "Title must contain TERMS");
    assert(desktopCheck.result.value.alertTitle.includes("IMPORTANT: ALL CONFIRMED TOURNAMENT BOOKINGS ARE NON-REFUNDABLE."), "Callout must be visible");
    assert.equal(desktopCheck.result.value.sectionsCount, 8, "Must contain all 8 sections (A through H)");

    const shotDesktop = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/06-terms-page-desktop.png", Buffer.from(shotDesktop.data, "base64"));
    console.log("Saved scratch/06-terms-page-desktop.png");

    // B. Test Mobile Viewport (390x844)
    console.log("-> Testing mobile viewport (390x844)...");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(400);

    const shotMobile = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/07-terms-page-mobile.png", Buffer.from(shotMobile.data, "base64"));
    console.log("Saved scratch/07-terms-page-mobile.png");

    // Reset viewport to desktop
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // C. Check Footer link on Home Page
    console.log("-> Checking footer link on Home page...");
    await send("Page.navigate", { url: "http://localhost:3000/" });
    await sleep(1500);

    const footerCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const termsLink = document.querySelector("#footerTermsLink");
        const navTermsLink = Array.from(document.querySelectorAll(".footer-link")).find(a => a.getAttribute("href") === "/terms-and-conditions");
        return {
          hasLegalBarLink: !!termsLink,
          legalBarHref: termsLink ? termsLink.getAttribute("href") : null,
          hasNavTermsLink: !!navTermsLink
        };
      })()`,
      returnByValue: true
    });
    console.log("Footer Links Evaluation:", JSON.stringify(footerCheck.result.value, null, 2));
    assert.equal(footerCheck.result.value.hasLegalBarLink, true, "Footer legal bar link must exist");
    assert.equal(footerCheck.result.value.legalBarHref, "/terms-and-conditions", "Legal bar link must point to /terms-and-conditions");
    assert.equal(footerCheck.result.value.hasNavTermsLink, true, "Navigation grid must include Terms & Conditions link");
    console.log("✓ Acceptance 3: Footer contains visible, verified links to /terms-and-conditions");

    console.log("\n>>> ALL TERMS & CONDITIONS & PAYMENT POLICY ACCEPTANCE TESTS PASSED! <<<\n");

    ws.close();
  } finally {
    edgeProc.kill("SIGKILL");
  }
}

run().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
