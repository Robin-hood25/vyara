import { spawn } from "child_process";
import fs from "fs";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9255;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log("=== RUNNING PRE-BOOKING FLOW ACCEPTANCE TESTS ===");

  if (!fs.existsSync("scratch")) {
    fs.mkdirSync("scratch", { recursive: true });
  }

  // 1. Direct Backend Solo rejection check (acceptance criterion 5)
  const soloRes = await fetch("http://localhost:3000/api/bookings/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Solo Attempter",
      phone: "9876543210",
      ign: "SoloBypasser",
      uid: "12345678",
      entryType: "solo"
    })
  });
  assert.equal(soloRes.status, 409, "Backend MUST reject direct Solo booking with 409 Conflict");
  const soloBody = await soloRes.json();
  assert(soloBody.error.includes("SOLD OUT"), "Error message must state Solo Entry is SOLD OUT");
  console.log("✓ Acceptance 5: Direct backend POST for Solo booking rejected with 409 Conflict");

  // 2. Launch Edge headless for full end-to-end browser verification
  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--user-data-dir=C:\\Users\\win 11\\AppData\\Local\\Temp\\edge-test-prebook",
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

    // Click Pre-Book CTA button on Hero page
    console.log("-> Clicking Pre-Book CTA...");
    const clickCta = await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = document.querySelector("#heroPrebookBtn") || document.querySelector("[data-action='open-prebook']");
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    assert.equal(clickCta.result.value, true, "Pre-book CTA button must exist and be clicked");
    await sleep(600);

    // Verify Ticket Selection Screen (Acceptance 1, 2, 3, 4)
    const checkSelectionScreen = await send("Runtime.evaluate", {
      expression: `(() => {
        const modal = document.querySelector(".prebook-modal-card");
        const title = document.querySelector(".ticket-select-title");
        const sub = document.querySelector(".ticket-select-sub");
        const squadCard = document.querySelector(".is-squad-card");
        const soloCard = document.querySelector(".is-solo-card");
        const squadSelectBtn = document.querySelector("#btnSelectSquadPass");
        const soloSelectBtn = document.querySelector("#btnSelectSoloPass");

        return {
          isOpen: modal && getComputedStyle(document.querySelector(".prebook-modal-backdrop")).display !== "none",
          heading: title ? title.innerText.trim() : null,
          subtitle: sub ? sub.innerText.trim() : null,
          squadCardExists: !!squadCard,
          squadText: squadCard ? squadCard.innerText : "",
          squadHasDel: !!squadCard?.querySelector("del"),
          squadDelText: squadCard?.querySelector("del")?.innerText,
          soloCardExists: !!soloCard,
          soloText: soloCard ? soloCard.innerText : "",
          soloHasDel: !!soloCard?.querySelector("del"),
          soloDelText: soloCard?.querySelector("del")?.innerText,
          soloDisabled: soloSelectBtn ? soloSelectBtn.disabled : false
        };
      })()`,
      returnByValue: true
    });

    const s = checkSelectionScreen.result.value;
    console.log("Ticket Selection Evaluation:", JSON.stringify(s, null, 2));

    assert(s.isOpen, "Pre-booking modal must open");
    assert.equal(s.heading, "CHOOSE YOUR BATTLE", "Heading must be CHOOSE YOUR BATTLE");
    assert.equal(s.subtitle, "Exclusive pre-booking prices. Secure your spot before bookings close.");
    console.log("✓ Acceptance 1: Modal opened with heading 'CHOOSE YOUR BATTLE' and subtitle");

    // Squad Pass Card checks
    assert(s.squadText.includes("SQUAD"), "Squad card must display SQUAD category");
    assert.equal(s.squadDelText, "₹2,000", "Squad card must have ₹2,000 with visible strikethrough");
    assert(s.squadText.includes("₹1,200"), "Squad card must display ₹1,200 pre-booking price");
    assert(s.squadText.includes("SAVE ₹800"), "Squad card must display SAVE ₹800");
    assert(s.squadText.includes("PRE-BOOKING OFFER"), "Squad card must display PRE-BOOKING OFFER badge");
    assert(s.squadText.includes("Offer valid for pre-bookings only."), "Squad card must display supporting text");
    assert(s.squadText.includes("PRE-BOOK SQUAD — ₹1,200"), "Squad card must display CTA PRE-BOOK SQUAD — ₹1,200");
    console.log("✓ Acceptance 2: Squad card matches all pricing, badge, savings, and CTA requirements");

    // Solo Pass Card checks
    assert(s.soloText.includes("SOLO"), "Solo card must display SOLO category");
    assert.equal(s.soloDelText, "₹500", "Solo card must have ₹500 with visible strikethrough");
    assert(s.soloText.includes("₹350"), "Solo card must display ₹350 offer price");
    assert(s.soloText.includes("SAVE ₹150"), "Solo card must display SAVE ₹150");
    assert(s.soloText.includes("SOLD OUT"), "Solo card must display SOLD OUT badge");
    assert(s.soloText.includes("Solo registrations are currently sold out."), "Solo card must display supporting text");
    assert(s.soloText.includes("₹350 offer applies to pre-bookings only."), "Solo card must display offer note");
    assert(s.soloText.includes("SOLO SOLD OUT"), "Solo card must display action SOLO SOLD OUT");
    assert.equal(s.soloDisabled, true, "Solo action must be disabled");
    console.log("✓ Acceptance 3: Solo card matches all SOLD OUT, strikethrough, and disabled requirements");

    // Capture screenshot of Ticket Selection Screen on Desktop
    const shotSelectDesk = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/00-ticket-selection-desktop.png", Buffer.from(shotSelectDesk.data, "base64"));
    console.log("Saved scratch/00-ticket-selection-desktop.png");

    // Acceptance 4: Attempt to click Solo Pass and verify it cannot proceed
    console.log("-> Testing Solo Pass click rejection...");
    const clickSolo = await send("Runtime.evaluate", {
      expression: `(() => {
        const soloCard = document.querySelector(".is-solo-card");
        const soloBtn = document.querySelector("#btnSelectSoloPass");
        if (soloBtn) soloBtn.click();
        if (soloCard) soloCard.click();
        // Check if step changed
        const step1Title = document.querySelector(".step-main-title");
        return {
          stillOnSelection: !!document.querySelector(".ticket-select-title"),
          stepperVisible: !!document.querySelector(".prebook-stepper")
        };
      })()`,
      returnByValue: true
    });
    assert.equal(clickSolo.result.value.stillOnSelection, true, "Clicking Solo MUST NOT advance away from selection screen");
    assert.equal(clickSolo.result.value.stepperVisible, false, "Stepper must not appear for Solo");
    console.log("✓ Acceptance 4: Attempt to select Solo cannot proceed");

    // Acceptance 6: Select Squad Pass and verify Step 1 begins
    console.log("-> Selecting Squad Pass...");
    const selectSquad = await send("Runtime.evaluate", {
      expression: `(() => {
        const squadBtn = document.querySelector("#btnSelectSquadPass");
        if (squadBtn) squadBtn.click();
        return true;
      })()`,
      returnByValue: true
    });
    await sleep(500);

    const step1Check = await send("Runtime.evaluate", {
      expression: `(() => {
        const stepper = document.querySelector(".prebook-stepper");
        const steps = Array.from(document.querySelectorAll(".stepper-label")).map(el => el.textContent.trim());
        const heading = document.querySelector(".step-main-title")?.innerText.trim();
        const selectedPill = document.querySelector(".selected-pass-pill")?.innerText;
        return {
          stepperExists: !!stepper,
          stepLabels: steps,
          heading,
          selectedPill
        };
      })()`,
      returnByValue: true
    });

    const st1 = step1Check.result.value;
    console.log("Step 1 Evaluation:", JSON.stringify(st1, null, 2));

    assert.deepEqual(
      st1.stepLabels,
      ["Verify Mobile", "Review Booking", "Demo Payment", "Digital Ticket"],
      "Stepper must have exact labels"
    );
    assert.equal(st1.heading, "VERIFY YOUR MOBILE", "Step 1 heading must be VERIFY YOUR MOBILE");
    assert(st1.selectedPill.includes("SQUAD PASS"), "Selected pass pill must show SQUAD PASS");
    assert(st1.selectedPill.includes("₹1,200"), "Selected pass pill must show ₹1,200");
    console.log("✓ Acceptance 6: Step 1 begins with 4-step stepper and preserved category/price");

    // Capture Step 1 screenshot
    const shotStep1 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/01-verify-mobile-desktop.png", Buffer.from(shotStep1.data, "base64"));
    console.log("Saved scratch/01-verify-mobile-desktop.png");

    // Fill form and verify OTP (Acceptance 7)
    console.log("-> Filling Step 1 and testing Demo OTP...");
    const fillStep1 = await send("Runtime.evaluate", {
      expression: `(() => {
        const inputs = document.querySelectorAll(".modal-input");
        inputs[0].value = "Vikram Aditya"; // Name
        inputs[1].value = "9876543210";    // Phone
        inputs[2].value = "亗VIKRAM亗";     // IGN
        inputs[3].value = "8899001122";    // UID

        // Click Continue which verifies demo OTP and advances
        const btnContinue = document.querySelector("#btnStep1Continue");
        btnContinue.click();
        return true;
      })()`,
      returnByValue: true
    });
    await sleep(800);

    // Verify Step 2 (Review Booking)
    const step2Check = await send("Runtime.evaluate", {
      expression: `(() => {
        const heading = document.querySelector(".summary-card-title")?.innerText.trim();
        const summaryCard = document.querySelector(".booking-summary-card");
        const proceedBtn = document.querySelector("#btnStep2Proceed");
        return {
          heading,
          summaryText: summaryCard ? summaryCard.innerText : "",
          hasDelPrice: !!summaryCard?.querySelector("del"),
          delPriceText: summaryCard?.querySelector("del")?.innerText,
          proceedBtnText: proceedBtn?.innerText.trim()
        };
      })()`,
      returnByValue: true
    });

    const st2 = step2Check.result.value;
    console.log("Step 2 Evaluation:", JSON.stringify(st2, null, 2));

    assert.equal(st2.heading, "REVIEW BOOKING", "Step 2 heading must be REVIEW BOOKING");
    assert(st2.summaryText.includes("SQUAD PASS"), "Summary must display SQUAD PASS");
    assert.equal(st2.delPriceText, "₹2,000", "Summary must display ₹2,000 crossed out");
    assert(st2.summaryText.includes("₹1,200"), "Summary must display ₹1,200 payable amount");
    assert(st2.summaryText.includes("₹800 OFF"), "Summary must display ₹800 OFF discount");
    assert(st2.summaryText.includes("PRE-BOOKING OFFER ONLY"), "Summary must display PRE-BOOKING OFFER ONLY");
    assert(st2.summaryText.includes("Vikram Aditya"), "Summary must display Customer Name");
    assert(st2.summaryText.includes("+91 98*** **210"), "Summary must display masked phone");
    assert.equal(st2.proceedBtnText, "CONTINUE TO DEMO PAYMENT →", "Primary CTA must be CONTINUE TO DEMO PAYMENT");
    console.log("✓ Acceptance 8: Step 2 Review Booking verified with ₹1,200 payable amount and discount details");

    // Capture Step 2 screenshot
    const shotStep2 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/02-review-booking-desktop.png", Buffer.from(shotStep2.data, "base64"));
    console.log("Saved scratch/02-review-booking-desktop.png");

    // Proceed to Step 3 (Demo Payment)
    console.log("-> Proceeding to Step 3 (Demo Payment)...");
    await send("Runtime.evaluate", {
      expression: `document.querySelector("#btnStep2Proceed").click()`
    });
    await sleep(800);

    const step3Check = await send("Runtime.evaluate", {
      expression: `(() => {
        const title = document.querySelector(".demo-pay-title")?.innerText.trim();
        const banner = document.querySelector(".demo-disclaimer-banner")?.innerText;
        const dueAmount = document.querySelector(".pay-due-amount")?.innerText;
        const utrInput = document.querySelector(".demo-utr-input")?.value;
        const verifyBtn = document.querySelector("#btnVerifyDemoPay")?.innerText.trim();
        return {
          title,
          banner,
          dueAmount,
          utrInput,
          verifyBtn
        };
      })()`,
      returnByValue: true
    });

    const st3 = step3Check.result.value;
    console.log("Step 3 Evaluation:", JSON.stringify(st3, null, 2));

    assert.equal(st3.title, "DEMO PAYMENT", "Step 3 title must be DEMO PAYMENT");
    assert(st3.banner.includes("DEMO ONLY — NO REAL MONEY WILL BE TRANSFERRED"), "Must disclose DEMO ONLY");
    assert(st3.dueAmount.includes("₹1,200"), "Must display Amount Due: ₹1,200");
    assert.equal(st3.verifyBtn, "VERIFY DEMO PAYMENT & GENERATE TICKET →", "Must have correct verify CTA");
    console.log("✓ Acceptance 9: Step 3 Demo Payment verified with required disclosures");

    // Capture Step 3 screenshot
    const shotStep3 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/03-demo-payment-desktop.png", Buffer.from(shotStep3.data, "base64"));
    console.log("Saved scratch/03-demo-payment-desktop.png");

    // Verify Demo Payment and generate Digital Ticket (Acceptance 10, 11)
    console.log("-> Verifying Demo Payment & Generating Ticket...");
    await send("Runtime.evaluate", {
      expression: `document.querySelector("#btnVerifyDemoPay").click()`
    });
    await sleep(1000);

    const step4Check = await send("Runtime.evaluate", {
      expression: `(() => {
        const notice = document.querySelector(".ticket-disclaimer-notice")?.innerText;
        const ticketCard = document.querySelector(".digital-ticket-card");
        const ticketId = document.querySelector(".ticket-id-val")?.innerText;
        const viewPassBtn = document.querySelector("#btnViewDigitalPass")?.innerText.trim();
        return {
          notice,
          hasTicketCard: !!ticketCard,
          ticketCardText: ticketCard ? ticketCard.innerText : "",
          ticketId,
          viewPassBtn
        };
      })()`,
      returnByValue: true
    });

    const st4 = step4Check.result.value;
    console.log("Step 4 Evaluation:", JSON.stringify(st4, null, 2));

    assert(st4.notice.includes("DEMO TICKET — PAYMENT SIMULATED"), "Must disclose DEMO TICKET — PAYMENT SIMULATED");
    assert(st4.notice.includes("PRE-BOOKING CONFIRMATION — NOT A FINAL EVENT ADMISSION TICKET"), "Must disclose PRE-BOOKING CONFIRMATION");
    assert(st4.hasTicketCard, "Must render digital ticket card");
    assert(st4.ticketCardText.includes("Squad Pass"), "Ticket must specify Squad Pass");
    assert(st4.ticketCardText.includes("₹1,200"), "Ticket must specify ₹1,200");
    assert(st4.ticketId && st4.ticketId.startsWith("VYRA-TKT-"), "Ticket ID must start with VYRA-TKT-");
    assert.equal(st4.viewPassBtn, "VIEW DIGITAL PASS IN MY TICKETS →", "Must include action to view pass in My Tickets");
    console.log("✓ Acceptance 10 & 11: Digital Ticket generated and displays all required disclosures and booking info");

    // Capture Step 4 Digital Ticket screenshot
    const shotStep4 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/04-digital-ticket-desktop.png", Buffer.from(shotStep4.data, "base64"));
    console.log("Saved scratch/04-digital-ticket-desktop.png");

    // Capture Mobile view of Ticket Selection (Acceptance 13)
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    // Re-render Step 0 in mobile viewport
    await send("Runtime.evaluate", {
      expression: `(() => {
        const modal = document.querySelector(".modal-close-btn");
        if (modal) modal.click();
        const heroBtn = document.querySelector("#heroPrebookBtn");
        if (heroBtn) heroBtn.click();
      })()`
    });
    await sleep(600);

    const shotMobile = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("scratch/00-ticket-selection-mobile.png", Buffer.from(shotMobile.data, "base64"));
    console.log("Saved scratch/00-ticket-selection-mobile.png");

    console.log("\n>>> ALL PRE-BOOKING FLOW ACCEPTANCE TESTS PASSED! <<<\n");

  } finally {
    edgeProc.kill();
  }
}

run().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
