import assert from "node:assert/strict";
import { handleRequest } from "../server.js";
import { dispatchRequest } from "./test-helper.js";
import { SITE } from "../js/config.js";
import { formatINR } from "../js/utils/dom.js";
import { validateRegistrationData, sanitizeReferralCode } from "../js/utils/security.js";

async function runSmokeTests() {
  console.log("=== RUNNING SMOKE TESTS ===");

  // 1. Root route smoke test
  const rootRes = await dispatchRequest(handleRequest, { url: "/" });
  assert.equal(rootRes.statusCode, 200, "Root page should return status 200");
  assert(rootRes.headers["content-type"].includes("text/html"), "Root page should be text/html");
  assert(rootRes.body.includes('<div id="app"></div>'), "Root page must have #app container");
  assert(rootRes.body.includes('src="js/main.js"'), "Root page must load js/main.js");
  console.log("✓ Smoke test: Root HTML serving OK");

  // 2. CSS asset smoke test
  const cssRes = await dispatchRequest(handleRequest, { url: "/style.css" });
  assert.equal(cssRes.statusCode, 200, "style.css should return 200");
  assert(cssRes.headers["content-type"].includes("text/css"), "style.css should have text/css header");
  assert(cssRes.body.includes(".hero"), "style.css should contain styling rules");
  assert(cssRes.body.includes(".broadcast-ticker"), "style.css should contain ticker styling");
  assert(cssRes.body.includes(".range-slider"), "style.css should contain calculator styling");
  console.log("✓ Smoke test: CSS file serving OK");

  const jsFiles = [
    "/js/main.js",
    "/js/app.js",
    "/js/config.js",
    "/js/utils/dom.js",
    "/js/utils/security.js",
    "/js/utils/tilt.js",
    "/js/services/bookingStore.js",
    "/js/components/toast.js",
    "/js/components/particles.js",
    "/js/components/ticker.js",
    "/js/components/header.js",
    "/js/components/hero.js",
    "/js/components/event.js",
    "/js/components/format.js",
    "/js/components/prizes.js",
    "/js/components/rules.js",
    "/js/components/register.js",
    "/js/components/calculator.js",
    "/js/components/prebookingModal.js",
    "/js/components/myTickets.js",
    "/js/components/refer.js",
    "/js/components/faq.js",
    "/js/components/contact.js",
    "/js/components/footer.js",
    "/js/components/gunLoader.js",
    "/js/components/scrollBomb.js",
    "/js/components/scrollBullets.js"
  ];

  for (const file of jsFiles) {
    const jsRes = await dispatchRequest(handleRequest, { url: file });
    assert.equal(jsRes.statusCode, 200, `${file} should return 200`);
    assert(
      jsRes.headers["content-type"].includes("javascript"),
      `${file} should have javascript Content-Type`
    );
  }
  console.log(`✓ Smoke test: All ${jsFiles.length} JavaScript component, utility, service, and animation files serve OK`);

  // 4. API health endpoint smoke test
  const healthRes = await dispatchRequest(handleRequest, { url: "/api/health" });
  assert.equal(healthRes.statusCode, 200, "/api/health should return 200");
  const healthData = JSON.parse(healthRes.body);
  assert.equal(healthData.status, "ok", "/api/health should return { status: 'ok' }");
  console.log("✓ Smoke test: /api/health endpoint OK");

  // 5. Config integrity smoke test
  assert(SITE.companyName, "SITE must have companyName");
  assert(typeof SITE.entryFee === "number", "SITE must have numeric entryFee");
  assert.equal(SITE.entryFees?.solo, 350, "Solo entry fee must be ₹350");
  assert.equal(SITE.entryFees?.squad, 1200, "Squad entry fee must be ₹1,200");
  assert.equal(SITE.entryAvailability?.solo, false, "Solo entry must be SOLD OUT");
  assert.equal(SITE.entryAvailability?.squad, true, "Squad entry must be ACTIVE");
  assert.equal(SITE.prizes?.first, 10000, "1st prize must be ₹10,000");
  assert.equal(SITE.prizes?.second, 5000, "2nd prize must be ₹5,000");
  assert.equal(SITE.prizes?.luckyDraw, 10000, "Lucky pool must be ₹10,000");
  console.log("✓ Smoke test: Configuration integrity OK (Solo SOLD OUT, Squad ₹1,200, 1st ₹10k, 2nd ₹5k, Lucky Pool ₹10k)");

  // 6. Registration validation smoke tests
  const invalidShortName = validateRegistrationData({
    name: "A",
    phone: "9876543210",
    ign: "Player1",
    uid: "1234567"
  });
  assert.equal(invalidShortName.isValid, false, "Should reject name shorter than 2 chars");

  const invalidPhone = validateRegistrationData({
    name: "Valid Name",
    phone: "1234567890",
    ign: "Player1",
    uid: "1234567"
  });
  assert.equal(invalidPhone.isValid, false, "Should reject phone not starting with 6-9");

  const invalidUid = validateRegistrationData({
    name: "Valid Name",
    phone: "9876543210",
    ign: "Player1",
    uid: "123"
  });
  assert.equal(invalidUid.isValid, false, "Should reject UID shorter than 6 digits");

  // Enforce Solo Entry SOLD OUT rejection
  const soloAttempt = validateRegistrationData({
    name: "Solo Player",
    phone: "9876543210",
    ign: "SoloSniper",
    uid: "12345678",
    entryType: "solo"
  });
  assert.equal(soloAttempt.isValid, false, "Should reject solo registration");
  assert(soloAttempt.error.includes("SOLD OUT"), "Error must state Solo Entry is SOLD OUT");

  const validData = validateRegistrationData({
    name: "Rahul Kumar",
    phone: "9876543210",
    ign: "DragonSlayer",
    uid: "987654321",
    ref: "FRIEND123",
    entryType: "squad"
  });
  assert.equal(validData.isValid, true, "Should accept valid squad registration payload");
  assert.equal(validData.sanitized.ref, "FRIEND123");
  console.log("✓ Smoke test: Registration validation logic OK (Solo correctly rejected as SOLD OUT)");

  // 7. Referral code & Currency formatting smoke tests
  const formatted = formatINR(20000);
  assert.equal(formatted, "₹20,000", "Currency should format correctly");

  const refSanitized = sanitizeReferralCode("rahul!@#456");
  assert.equal(refSanitized, "RAHUL456", "Referral code should sanitize to uppercase alphanumeric");
  // 8. Demo Pre-Booking & Ticket Generation API smoke tests
  const testPhone = "9876543299";

  // A. Request Demo OTP
  const otpSendRes = await dispatchRequest(handleRequest, {
    url: "/api/otp/send",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: testPhone })
  });
  assert.equal(otpSendRes.statusCode, 200, "Send OTP should return 200");
  const otpSendData = JSON.parse(otpSendRes.body);
  assert.equal(otpSendData.success, true);
  const receivedOtp = otpSendData.demoOtp;
  assert(receivedOtp, "Must return demo OTP code in demo mode");

  // B. Verify Demo OTP
  const otpVerifyRes = await dispatchRequest(handleRequest, {
    url: "/api/otp/verify",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: testPhone, otp: receivedOtp })
  });
  assert.equal(otpVerifyRes.statusCode, 200, "Verify OTP should return 200");
  const otpVerifyData = JSON.parse(otpVerifyRes.body);
  assert.equal(otpVerifyData.verified, true);

  // C. Create Pre-Booking
  const bookingRes = await dispatchRequest(handleRequest, {
    url: "/api/bookings/create",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Captain Smoke",
      phone: testPhone,
      ign: "SmokeSquad",
      uid: "99887766",
      entryType: "squad"
    })
  });
  assert.equal(bookingRes.statusCode, 201, "Booking creation should return 201");
  const bookingData = JSON.parse(bookingRes.body);
  assert.equal(bookingData.amount, 1200, "Booking amount must be enforced at ₹1,200");
  assert.equal(bookingData.bookingStatus, "PENDING_PAYMENT");
  const bookingId = bookingData.bookingId;

  // D. Verify Demo Payment
  const testUtr = "DEMO-UTR-SMOKE-100";
  const payVerifyRes = await dispatchRequest(handleRequest, {
    url: "/api/bookings/verify-demo-payment",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId,
      demoUtr: testUtr,
      amount: 1200
    })
  });
  assert.equal(payVerifyRes.statusCode, 200, "Demo payment verification should return 200");
  const payVerifyData = JSON.parse(payVerifyRes.body);
  assert.equal(payVerifyData.bookingStatus, "PRE_BOOKED");
  assert.equal(payVerifyData.paymentStatus, "DEMO_VERIFIED");
  assert(payVerifyData.ticket, "Must return generated digital ticket");
  assert.equal(payVerifyData.ticket.ticketType, "Squad Pre-Booking");
  assert.equal(payVerifyData.ticket.amount, 1200);

  // E. Retrieve My Tickets
  const myTicketsRes = await dispatchRequest(handleRequest, {
    url: `/api/bookings/my-tickets?phone=${testPhone}`
  });
  assert.equal(myTicketsRes.statusCode, 200, "My Tickets should return 200");
  const myTicketsData = JSON.parse(myTicketsRes.body);
  assert(Array.isArray(myTicketsData.tickets));
  assert(myTicketsData.tickets.some(t => t.bookingId === bookingId), "Must contain generated ticket");
  console.log("✓ Smoke test: Full demo pre-booking flow (OTP -> Booking -> Demo Payment -> Ticket Generation -> My Tickets) OK");

  console.log("\n>>> ALL SMOKE TESTS PASSED SUCCESSFULLY! <<<\n");
}

runSmokeTests().catch((err) => {
  console.error("SMOKE TEST FAILED:", err);
  process.exit(1);
});
