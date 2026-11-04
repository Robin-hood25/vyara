import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateRegistrationData } from "./js/utils/security.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname);

// In-Memory Demo Booking, OTP & Ticket Registries
export const activeOtps = new Map();
export const demoBookings = new Map();
export const demoTickets = new Map();
export const usedDemoUtrs = new Set();

function readJsonBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 20480) {
      req.destroy();
    }
  });
  req.on("end", () => {
    if (!body) return callback(null, {});
    try {
      callback(null, JSON.parse(body));
    } catch (err) {
      callback(err, null);
    }
  });
  req.on("error", (err) => callback(err, null));
}

export const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".txt": "text/plain; charset=utf-8"
};

export const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self';",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin"
};

export function handleRequest(req, res, options = {}) {
  const root = options.root ? path.resolve(options.root) : ROOT_DIR;

  // Apply security headers to every response
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }

  const rawUrl = req.url || "/";

  // Security check: Block path traversal signatures in raw request URL
  if (
    rawUrl.includes("..") ||
    rawUrl.toLowerCase().includes("%2e%2e") ||
    rawUrl.includes("\\")
  ) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden: Path traversal detected");
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl, `http://${req.headers?.host || "localhost"}`);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request: Malformed URI");
    return;
  }

  // Security check: Verify decoded pathname does not contain traversal
  if (pathname.includes("..") || pathname.includes("\\")) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden: Path traversal detected");
    return;
  }

  // API endpoints
  if (pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    return;
  }

  // Authoritative ticket availability endpoint
  if (pathname === "/api/tickets" || pathname === "/api/availability") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      solo: {
        category: "SOLO",
        title: "SOLO PASS",
        available: false,
        status: "SOLD OUT",
        originalPrice: 500,
        price: 350,
        savings: 150,
        badge: "SOLD OUT",
        supportingText: "Solo registrations are currently sold out.",
        offerNote: "₹350 offer applies to pre-bookings only."
      },
      squad: {
        category: "SQUAD",
        title: "SQUAD PASS",
        available: true,
        status: "AVAILABLE",
        originalPrice: 2000,
        price: 1200,
        savings: 800,
        badge: "PRE-BOOKING OFFER",
        supportingText: "Offer valid for pre-bookings only.",
        offerNote: "Pre-booking offer active."
      }
    }));
    return;
  }

  // Demo OTP Dispatch Endpoint
  if (pathname === "/api/otp/send") {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
      return;
    }
    readJsonBody(req, (err, data) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON payload" }));
        return;
      }
      const phone = String(data.phone || "").trim();
      if (!/^[6-9]\d{9}$/.test(phone)) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: "Enter a valid 10-digit Indian mobile number." }));
        return;
      }
      const demoOtp = "123456";
      activeOtps.set(phone, { otp: demoOtp, expiresAt: Date.now() + 300000 });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({
        success: true,
        message: "Demo OTP dispatched successfully.",
        demoOtp,
        note: "DEMO MODE: Use OTP 123456 to verify."
      }));
    });
    return;
  }

  // Demo OTP Verification Endpoint
  if (pathname === "/api/otp/verify") {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
      return;
    }
    readJsonBody(req, (err, data) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON payload" }));
        return;
      }
      const phone = String(data.phone || "").trim();
      const otp = String(data.otp || "").trim();
      const record = activeOtps.get(phone);
      if (otp === "123456" || (record && record.otp === otp && Date.now() < record.expiresAt)) {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: true, verified: true, message: "Mobile number verified successfully." }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: "Incorrect OTP. Please enter valid 6-digit demo code (123456)." }));
      }
    });
    return;
  }

  // Authoritative Pre-Booking Creation Endpoint
  if (pathname === "/api/bookings/create") {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
      return;
    }
    readJsonBody(req, (err, data) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON payload" }));
        return;
      }

      const entryType = String(data.entryType || "squad").toLowerCase();
      if (entryType === "solo") {
        res.writeHead(409, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          success: false,
          error: "Solo Entry is SOLD OUT. Only Squad registrations are currently accepted."
        }));
        return;
      }

      const validation = validateRegistrationData(data);
      if (!validation.isValid) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: validation.error }));
        return;
      }

      const bookingId = "VYRA-BK-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);
      const booking = {
        bookingId,
        holderName: validation.sanitized.name,
        phone: validation.sanitized.phone,
        ign: validation.sanitized.ign,
        uid: validation.sanitized.uid,
        ref: validation.sanitized.ref || null,
        ticketType: "Squad Pre-Booking",
        entryType: "squad",
        amount: 1200, // Server-enforced trusted amount
        bookingStatus: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        tournamentDate: "TBA",
        createdAt: new Date().toISOString()
      };

      demoBookings.set(bookingId, booking);

      res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({
        success: true,
        message: "Squad pre-booking created. Please complete demo payment verification.",
        bookingId: booking.bookingId,
        amount: booking.amount,
        bookingStatus: booking.bookingStatus,
        booking
      }));
    });
    return;
  }

  // Demo Payment Verification Endpoint
  if (pathname === "/api/bookings/verify-demo-payment") {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
      return;
    }
    readJsonBody(req, (err, data) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON payload" }));
        return;
      }

      const bookingId = String(data.bookingId || "").trim();
      const rawUtr = String(data.demoUtr || "").trim().toUpperCase();
      const phone = String(data.phone || "").trim();

      // Enforcement of Terms & Conditions and Non-Refundable Payment Policy
      if (data.termsAccepted !== true && data.termsAccepted !== "true") {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          success: false,
          error: "You must read and agree to the Terms & Conditions and Non-Refundable Payment Policy before confirming your booking."
        }));
        return;
      }

      if (!rawUtr || !/^(DEMO[-_]?[A-Z0-9_\-]{3,24}|[0-9]{12})$/i.test(rawUtr)) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          success: false,
          error: "Invalid demo reference format. Format: DEMO-XXXXXX or 12-digit reference."
        }));
        return;
      }

      // Replay / Duplicate reference check
      if (usedDemoUtrs.has(rawUtr)) {
        res.writeHead(409, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          success: false,
          error: "This demo reference number has already been used for another booking."
        }));
        return;
      }

      // Locate or initialize booking record
      let booking = demoBookings.get(bookingId);
      if (!booking) {
        if (!data.name || !phone) {
          res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ success: false, error: "Booking record not found." }));
          return;
        }
        booking = {
          bookingId: bookingId || "VYRA-BK-" + Date.now().toString(36).toUpperCase(),
          holderName: String(data.name).slice(0, 60),
          phone,
          ign: String(data.ign || "Squad Captain").slice(0, 40),
          uid: String(data.uid || "12345678").slice(0, 15),
          amount: 1200,
          ticketType: "Squad Pre-Booking",
          bookingStatus: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          tournamentDate: "TBA"
        };
        demoBookings.set(booking.bookingId, booking);
      }

      // Check if trying to process an unavailable category
      if (booking.entryType === "solo" || booking.category === "SOLO") {
        res.writeHead(409, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          success: false,
          error: "Solo registrations are SOLD OUT. Payment cannot be processed."
        }));
        return;
      }

      // Check if already verified
      if (booking.paymentStatus === "DEMO_VERIFIED" && booking.ticketId) {
        const existingTicket = demoTickets.get(booking.ticketId);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          success: true,
          message: "Booking is already verified.",
          ticket: existingTicket
        }));
        return;
      }

      // Transition to DEMO_VERIFIED and PRE_BOOKED
      usedDemoUtrs.add(rawUtr);
      booking.bookingStatus = "PRE_BOOKED";
      booking.paymentStatus = "DEMO_VERIFIED";
      booking.demoUtr = rawUtr;
      booking.verifiedAt = new Date().toISOString();
      booking.termsAccepted = true;
      booking.termsAcceptedAt = data.termsAcceptedAt || new Date().toISOString();
      booking.termsVersion = String(data.termsVersion || "v1.0").slice(0, 10);
      booking.nonRefundable = true;

      const ticketId = "VYRA-TKT-" + Math.floor(100000 + Math.random() * 900000);
      booking.ticketId = ticketId;

      const holderPhone = booking.phone || phone || "";
      const maskedPhone = holderPhone.length >= 10
        ? `+91 ${holderPhone.slice(0, 2)}*** **${holderPhone.slice(-3)}`
        : holderPhone;

      const ticket = {
        ticketId,
        bookingId: booking.bookingId,
        holderName: booking.holderName,
        phone: booking.phone,
        maskedPhone,
        category: "SQUAD",
        categoryName: "SQUAD PASS",
        ticketType: "Squad Pre-Booking",
        amount: 1200,
        originalPrice: 2000,
        savings: 800,
        offerCondition: "PRE-BOOKING OFFER ONLY",
        paymentStatus: "DEMO_VERIFIED",
        paymentStatusLabel: "DEMO PAYMENT VERIFIED",
        bookingStatus: "PRE-BOOKED",
        tournamentDate: "TBA",
        demoUtr: rawUtr,
        nonRefundable: true,
        refundPolicy: "NON-REFUNDABLE: Confirmed tournament registrations cannot be refunded, subject to statutory obligations.",
        termsAccepted: true,
        termsAcceptedAt: booking.termsAcceptedAt,
        termsVersion: booking.termsVersion,
        notice: "DEMO TICKET — PAYMENT SIMULATED. PRE-BOOKING CONFIRMATION — NOT A FINAL EVENT ADMISSION TICKET.",
        issuedAt: new Date().toISOString()
      };

      demoTickets.set(ticketId, ticket);

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({
        success: true,
        message: "Demo payment verified successfully. Pre-booking ticket issued.",
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        booking,
        ticket
      }));
    });
    return;
  }

  // My Tickets Retrieval Endpoint
  if (pathname === "/api/bookings/my-tickets") {
    if (req.method !== "GET") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method Not Allowed. Use GET." }));
      return;
    }
    const rawPhone = parsedUrl.searchParams.get("phone") || "";
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
    const allTickets = Array.from(demoTickets.values());

    // Only return tickets matching the supplied 10-digit mobile number
    const filtered = cleanPhone.length === 10
      ? allTickets.filter(t => (t.phone || "").replace(/\D/g, "").slice(-10) === cleanPhone)
      : [];

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      success: true,
      count: filtered.length,
      tickets: filtered
    }));
    return;
  }

  // Legacy registration and checkout endpoint
  if (pathname === "/api/register" || pathname === "/api/checkout") {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
      return;
    }

    readJsonBody(req, (err, data) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON payload" }));
        return;
      }

      const entryType = String(data.entryType || "squad").toLowerCase();
      // Server-side enforcement: Reject any attempt to register for Solo Entry
      if (entryType === "solo") {
        res.writeHead(409, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          success: false,
          error: "Solo Entry is SOLD OUT. Only Squad registrations are currently accepted."
        }));
        return;
      }

      const validation = validateRegistrationData(data);
      if (!validation.isValid) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: validation.error }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({
        success: true,
        message: "Squad registration accepted. Complete payment via UPI.",
        ticket: {
          entryType: "squad",
          amount: 1200,
          captain: validation.sanitized.name,
          phone: validation.sanitized.phone,
          uid: validation.sanitized.uid
        }
      }));
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  // Path resolution with traversal defense
  let safePath = pathname;
  if (safePath === "/terms-and-conditions" || safePath === "/terms-and-conditions/") {
    safePath = "/terms-and-conditions.html";
  } else if (safePath.endsWith("/")) {
    safePath += "index.html";
  }

  const targetFile = path.resolve(root, "." + safePath);

  // Security check: Path relative to root
  const relative = path.relative(root, targetFile);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden: Access Denied");
    return;
  }

  fs.stat(targetFile, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 Not Found</h1><p>The requested file was not found.</p>");
      return;
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const range = req.headers.range;

    // HTTP 206 Partial Content support for video streaming and seeking
    if (range && (ext === ".mp4" || ext === ".webm" || ext === ".ogg")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400"
      });

      if (req.method === "HEAD") {
        res.end();
        return;
      }

      const stream = fs.createReadStream(targetFile, { start, end });
      stream.on("error", () => {
        if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal Server Error");
      });
      stream.pipe(res);
      return;
    }

    const isMedia = ext === ".mp4" || ext === ".webm" || ext === ".ogg";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Accept-Ranges": "bytes",
      "Cache-Control": isMedia ? "public, max-age=86400" : "no-cache, no-store, must-revalidate"
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    const stream = fs.createReadStream(targetFile);
    stream.on("error", () => {
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      }
      res.end("Internal Server Error");
    });
    stream.pipe(res);
  });
}

export function createServer(options = {}) {
  return http.createServer((req, res) => handleRequest(req, res, options));
}

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/`);
  });
}
