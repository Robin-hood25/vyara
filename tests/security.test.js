import assert from "node:assert/strict";
import { handleRequest } from "../server.js";
import { dispatchRequest } from "./test-helper.js";
import {
  sanitizeText,
  escapeHtml,
  sanitizeUrl,
  sanitizeReferralCode,
  validateRegistrationData
} from "../js/utils/security.js";

async function runSecurityTests() {
  console.log("=== RUNNING SECURITY CHECKS ===");

  // 1. Path Traversal Attacks
  const traversalPayloads = [
    "/../package.json",
    "/%2e%2e/package.json",
    "/..%2fpackage.json",
    "/../../../../etc/passwd",
    "/..\\..\\..\\windows\\system32\\cmd.exe",
    "/%2e%2e%2f%2e%2e%2fpackage.json"
  ];

  for (const payload of traversalPayloads) {
    const res = await dispatchRequest(handleRequest, { url: payload });
    assert.notEqual(
      res.statusCode,
      200,
      `Path traversal attempt should NOT return 200 OK: ${payload} (got ${res.statusCode})`
    );
    assert(
      res.statusCode === 403 || res.statusCode === 404,
      `Expected 403 or 404 for traversal attempt ${payload}, got ${res.statusCode}`
    );
  }
  console.log("✓ Security Check: Path traversal attacks properly blocked (403/404)");

  // 2. HTTP Security Headers
  const res = await dispatchRequest(handleRequest, { url: "/" });
  assert.equal(res.headers["x-content-type-options"], "nosniff", "Missing X-Content-Type-Options: nosniff");
  assert.equal(res.headers["x-frame-options"], "DENY", "Missing X-Frame-Options: DENY (Clickjacking protection)");
  assert(
    res.headers["content-security-policy"] && res.headers["content-security-policy"].includes("frame-ancestors 'none'"),
    "CSP must include frame-ancestors 'none'"
  );
  assert.equal(
    res.headers["referrer-policy"],
    "strict-origin-when-cross-origin",
    "Missing Referrer-Policy"
  );
  assert(
    res.headers["permissions-policy"] && res.headers["permissions-policy"].includes("camera=()"),
    "Missing Permissions-Policy restricting sensitive devices"
  );
  console.log("✓ Security Check: Mandatory HTTP Security Headers verified (CSP, XFO, nosniff, Referrer, Permissions)");

  // 3. HTTP Method Restrictions
  const disallowedMethods = ["POST", "PUT", "DELETE", "PATCH"];
  for (const method of disallowedMethods) {
    const methodRes = await dispatchRequest(handleRequest, { url: "/index.html", method });
    assert.equal(
      methodRes.statusCode,
      405,
      `Method ${method} on static asset should be rejected with 405 Method Not Allowed`
    );
  }
  console.log("✓ Security Check: Disallowed HTTP methods properly blocked with 405");

  // 4. URL Sanitization / Dangerous Scheme Injection (XSS via links)
  const dangerousUrls = [
    "javascript:alert(1)",
    "javascript:/*--></title></style></textarea></script>alert(1)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "jav&#x09;ascript:alert(document.domain)"
  ];

  for (const badUrl of dangerousUrls) {
    const sanitized = sanitizeUrl(badUrl);
    assert.equal(sanitized, "#", `Dangerous URL should be sanitized to '#': ${badUrl}`);
  }

  const safeUrls = [
    "https://instagram.com/myhandle",
    "http://example.com/tourney",
    "upi://pay?pa=name@upi&pn=VYARA&am=500",
    "https://wa.me/919876543210?text=Hello"
  ];

  for (const safe of safeUrls) {
    const sanitized = sanitizeUrl(safe);
    assert.equal(sanitized, safe, `Valid safe URL should remain intact: ${safe}`);
  }
  console.log("✓ Security Check: URL sanitization & Dangerous Scheme (javascript:/data:) injection blocked");

  // 5. HTML Entity Escaping & XSS Payload Cleansing
  const xssPayload = '<img src=x onerror="alert(1)"> & "quotes" \'apostrophe\'';
  const escaped = escapeHtml(xssPayload);
  assert(!escaped.includes("<"), "Escaped string should not contain unescaped <");
  assert(!escaped.includes(">"), "Escaped string should not contain unescaped >");
  assert(!escaped.includes('"'), "Escaped string should not contain unescaped double quotes");
  assert(!escaped.includes("'"), "Escaped string should not contain unescaped single quotes");
  assert(escaped.includes("&amp;"), "Ampersands must be escaped");
  console.log("✓ Security Check: HTML entity escaping protects against markup injection");

  // 6. Referral Code Injection & Pollution Defense
  const dirtyCodes = [
    "code<script>",
    "../../etc",
    "admin' OR 1=1--",
    "LONGREFERRALCODETHATEXCEEDSTWELVECHARS"
  ];
  for (const dirty of dirtyCodes) {
    const clean = sanitizeReferralCode(dirty);
    assert(/^[A-Z0-9]{0,12}$/.test(clean), `Referral code must only contain alphanumeric up to 12 chars: ${clean}`);
  }
  console.log("✓ Security Check: Referral code input strictly filtered and bounded");

  // 7. Input Bounds and ReDoS Resistance
  const massiveString = "a".repeat(100_000);
  const start = performance.now();
  const bounded = sanitizeText(massiveString, 100);
  const duration = performance.now() - start;

  assert.equal(bounded.length, 100, "sanitizeText should strictly enforce maximum length bounds");
  assert(duration < 50, `String sanitization must complete rapidly without ReDoS (took ${duration.toFixed(2)}ms)`);

  const regValidation = validateRegistrationData({
    name: massiveString,
    phone: "9999999999",
    ign: massiveString,
    uid: massiveString
  });
  assert.equal(regValidation.isValid, false, "Excessive UID length must fail validation");
  console.log("✓ Security Check: ReDoS and buffer / payload overflow protection verified");

  // 8. Backend Solo Entry Rejection & Ticket Availability Enforcement
  const ticketRes = await dispatchRequest(handleRequest, { url: "/api/tickets" });
  assert.equal(ticketRes.statusCode, 200, "/api/tickets should return 200");
  const ticketData = JSON.parse(ticketRes.body);
  assert.equal(ticketData.solo.available, false, "Solo ticket must be unavailable (SOLD OUT)");
  assert.equal(ticketData.squad.available, true, "Squad ticket must be available");

  const soloPostRes = await dispatchRequest(handleRequest, {
    url: "/api/register",
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
  assert.equal(soloPostRes.statusCode, 409, "Direct POST for Solo Entry must return 409 Conflict");
  assert(soloPostRes.body.includes("SOLD OUT"), "Response must state Solo Entry is SOLD OUT");

  const squadPostRes = await dispatchRequest(handleRequest, {
    url: "/api/register",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Squad Leader",
      phone: "9876543210",
      ign: "SquadKing",
      uid: "12345678",
      entryType: "squad"
    })
  });
  assert.equal(squadPostRes.statusCode, 200, "Direct POST for Squad Entry must succeed with 200 OK");
  console.log("✓ Security Check: Backend Solo Entry SOLD OUT enforcement & Squad booking verified");

  // 9. Pre-Booking Security: Amount Tamper Prevention, Solo Lockout & Duplicate UTR Prevention
  // A. Solo Entry via /api/bookings/create must be rejected
  const soloBookingRes = await dispatchRequest(handleRequest, {
    url: "/api/bookings/create",
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
  assert.equal(soloBookingRes.statusCode, 409, "Solo entry in pre-booking must return 409 Conflict");

  // B. Server-side ₹1,200 amount enforcement (reject client-submitted tampered amount)
  const tamperBookingRes = await dispatchRequest(handleRequest, {
    url: "/api/bookings/create",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Price Tamperer",
      phone: "9876543211",
      ign: "HackerOne",
      uid: "12345678",
      amount: 1, // Tamper attempt: pay ₹1
      entryType: "squad"
    })
  });
  assert.equal(tamperBookingRes.statusCode, 201, "Booking created with enforced server pricing");
  const tamperData = JSON.parse(tamperBookingRes.body);
  assert.equal(tamperData.amount, 1200, "Server must enforce ₹1,200 amount regardless of client body");
  const testBookingId = tamperData.bookingId;

  // C. Reject invalid OTP code
  const badOtpRes = await dispatchRequest(handleRequest, {
    url: "/api/otp/verify",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "9876543211", otp: "000000" })
  });
  assert.equal(badOtpRes.statusCode, 400, "Incorrect OTP must be rejected with 400");

  // D. Payment verification without Terms & Conditions acceptance must fail (400 Bad Request)
  const noTermsPayRes = await dispatchRequest(handleRequest, {
    url: "/api/bookings/verify-demo-payment",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId: testBookingId,
      demoUtr: "DEMO-NO-TERMS",
      amount: 1200
      // termsAccepted omitted
    })
  });
  assert.equal(noTermsPayRes.statusCode, 400, "Must reject payment confirmation when terms are not accepted");
  const noTermsData = JSON.parse(noTermsPayRes.body);
  assert(noTermsData.error.includes("Terms & Conditions"), "Error must state Terms & Conditions must be accepted");

  // E. Valid demo payment verification with Terms accepted succeeds
  const uniqueUtr = "DEMO-UTR-SEC-" + Date.now();
  const firstPayRes = await dispatchRequest(handleRequest, {
    url: "/api/bookings/verify-demo-payment",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId: testBookingId,
      demoUtr: uniqueUtr,
      amount: 1200,
      termsAccepted: true,
      termsVersion: "v1.0"
    })
  });
  assert.equal(firstPayRes.statusCode, 200, "Valid demo UTR verification must succeed");
  const verifiedData = JSON.parse(firstPayRes.body);
  assert.equal(verifiedData.ticket.termsAccepted, true, "Ticket must record terms acceptance");
  assert.equal(verifiedData.ticket.nonRefundable, true, "Ticket must be marked non-refundable");

  // F. Duplicate demo UTR reuse must be blocked (409 Conflict)
  const dupPayRes = await dispatchRequest(handleRequest, {
    url: "/api/bookings/verify-demo-payment",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId: "VYRA-BK-ANOTHER",
      demoUtr: uniqueUtr,
      amount: 1200,
      termsAccepted: true,
      termsVersion: "v1.0"
    })
  });
  assert.equal(dupPayRes.statusCode, 409, "Reused demo UTR must be rejected with 409 Conflict");
  console.log("✓ Security Check: Amount tamper protection, Solo booking rejection, Terms enforcement & Duplicate UTR prevention verified");

  console.log("\n>>> ALL SECURITY CHECKS PASSED SUCCESSFULLY! <<<\n");
}

runSecurityTests().catch((err) => {
  console.error("SECURITY CHECK FAILED:", err);
  process.exit(1);
});
