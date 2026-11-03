# Free Fire Championship Website (VYARA)

Modular JavaScript application with dynamic component rendering, zero-dependency Node.js server, smoke tests, and security verification.

---

## Architecture: JavaScript Components (No Hardcoded HTML)

The application UI is constructed and managed dynamically via JavaScript modules in [`js/`](file:///d:/vyara/js/) instead of static HTML files:

- **[`index.html`](file:///d:/vyara/index.html)**: Clean, minimal entry point with `<div id="app"></div>` and `<noscript>` fallback.
- **[`js/components/`](file:///d:/vyara/js/components/)**:
  - [`header.js`](file:///d:/vyara/js/components/header.js): Brand and navigation
  - [`hero.js`](file:///d:/vyara/js/components/hero.js): Dynamic hero banner and real-time countdown
  - [`event.js`](file:///d:/vyara/js/components/event.js): Event schedule and venue details
  - [`prizes.js`](file:///d:/vyara/js/components/prizes.js): Prize podium and perks
  - [`rules.js`](file:///d:/vyara/js/components/rules.js): Tournament rules and step-by-step guide
  - [`register.js`](file:///d:/vyara/js/components/register.js): Safe registration form & UPI/WhatsApp payment action box
  - [`refer.js`](file:///d:/vyara/js/components/refer.js): Referral code generator & instant sharing
  - [`contact.js`](file:///d:/vyara/js/components/contact.js): WhatsApp & Instagram links
  - [`footer.js`](file:///d:/vyara/js/components/footer.js): Disclaimer and copyright
- **[`js/utils/`](file:///d:/vyara/js/utils/)**:
  - [`security.js`](file:///d:/vyara/js/utils/security.js): Input sanitization, safe URL scheme validation (`http:`, `https:`, `upi:`, `whatsapp:`), entity escaping, ReDoS bounds
  - [`dom.js`](file:///d:/vyara/js/utils/dom.js): Safe DOM node construction (`document.createElement`) avoiding `innerHTML` vulnerabilities
- **[`server.js`](file:///d:/vyara/server.js)**: Production-ready, zero-dependency Node.js web server with automated security headers and path traversal defenses.

---

## Quick Start & Running

### 1. Run with Node.js
```bash
npm start
# or
node server.js
```
The application will be running at `http://localhost:3000/`.

### 2. Run Smoke & Security Tests
```bash
npm test
```
Or run individually:
```bash
npm run test:smoke      # Verifies routes, assets, components & registration logic
npm run test:security   # Verifies path traversal, CSP/XFO headers, XSS & input bounding
```

---

## Security Protections Included

1. **XSS Protection**: Zero use of unsafe `innerHTML` for dynamic user or config values.
2. **Dangerous URI Injection Defense**: Validates and strips `javascript:`, `data:`, and `vbscript:` URLs.
3. **HTTP Security Headers**:
   - `Content-Security-Policy`: Disallows unauthorized frames (`frame-ancestors 'none'`).
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY` (Clickjacking prevention)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy`: Restricts camera, microphone, geolocation
4. **Path Traversal Defense**: Blocks directory escaping attempts (`..`, `%2e%2e`, `\`) in requests.
5. **ReDoS & Buffer Limit Checks**: Strict length bounds on user inputs.
