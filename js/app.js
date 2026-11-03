import { el, formatINR } from "./utils/dom.js";
import {
  sanitizeText,
  sanitizeUrl,
  sanitizeReferralCode,
  validateRegistrationData
} from "./utils/security.js";
import { showToast } from "./components/toast.js";
import { initParticleCanvas } from "./components/particles.js";
import { initCardTilt } from "./utils/tilt.js";
import { createBroadcastTicker } from "./components/ticker.js";
import { createHeader } from "./components/header.js";
import { createHero } from "./components/hero.js";
import { createEventSection } from "./components/event.js";
import { createFormatSection } from "./components/format.js";
import { createPrizesSection } from "./components/prizes.js";
import { createRulesSection } from "./components/rules.js";
import { createRegisterSection } from "./components/register.js";
import { createReferSection } from "./components/refer.js";
import { createFaqSection } from "./components/faq.js";
import { createContactSection } from "./components/contact.js";
import { createFooter } from "./components/footer.js";
import { createMyTicketsSection } from "./components/myTickets.js";
import { createPreBookingModal } from "./components/prebookingModal.js";
import { initScrollBomb } from "./components/scrollBomb.js";
import { initScrollBullets } from "./components/scrollBullets.js";

/**
 * Initializes and renders the professional esports web application.
 * @param {HTMLElement} root
 * @param {Object} siteConfig
 */
export function initApp(root, siteConfig) {
  if (!root) throw new Error("Mount target #app not found");

  const site = siteConfig || window.SITE || {};

  // Build the complete high-production esports UI purely via JavaScript
  root.innerHTML = "";

  const ticker = createBroadcastTicker();
  const header = createHeader(site);
  const hero = createHero(site);
  const eventSec = createEventSection(site);
  const formatSec = createFormatSection();
  const prizes = createPrizesSection(site);
  const rules = createRulesSection(site);
  const refer = createReferSection(site);
  const faq = createFaqSection();
  const contact = createContactSection(site);
  const footer = createFooter(site);

  let prebookingModal;
  const myTickets = createMyTicketsSection(
    site,
    (ticket) => {
      if (prebookingModal && typeof prebookingModal.showTicket === "function") {
        prebookingModal.showTicket(ticket);
      }
    },
    () => {
      if (prebookingModal && typeof prebookingModal.open === "function") {
        prebookingModal.open();
      }
    }
  );

  prebookingModal = createPreBookingModal(site, () => {
    if (myTickets && typeof myTickets.reloadTickets === "function") {
      myTickets.reloadTickets();
    }
  });

  const subHeroZone = el("div", { className: "sub-hero-zone", id: "subHeroZone" }, [
    eventSec,
    formatSec,
    prizes,
    rules,
    myTickets,
    refer,
    faq,
    contact
  ]);

  const main = el("main", { id: "mainContent" }, [
    hero,
    subHeroZone
  ]);

  root.appendChild(ticker);
  root.appendChild(header);
  root.appendChild(main);
  root.appendChild(footer);
  root.appendChild(prebookingModal.el);

  // Global click triggers for pre-booking CTA buttons
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-action='open-prebook'], [data-prebook], #heroPrebookBtn");
    if (trigger) {
      e.preventDefault();
      const regForm = document.getElementById("regForm");
      const prefill = {};
      if (regForm) {
        if (regForm.elements.name?.value) prefill.name = regForm.elements.name.value;
        if (regForm.elements.phone?.value) prefill.phone = regForm.elements.phone.value;
        if (regForm.elements.ign?.value) prefill.ign = regForm.elements.ign.value;
        if (regForm.elements.uid?.value) prefill.uid = regForm.elements.uid.value;
        if (regForm.elements.ref?.value) prefill.ref = regForm.elements.ref.value;
      }
      prebookingModal.open(prefill);
    }
  });

  // Initialize interactive dynamic effects
  if (typeof window !== "undefined") {
    // 1. Floating cyber dust & electric energy particle canvas
    initParticleCanvas();

    // 2. 3D card tilt & glare physics
    initCardTilt();

    // 3. Desktop cyber cursor effect
    initCustomCursor();

    // 4. 100% scroll-driven tactical bomb animation (strictly moves with scroll)
    initScrollBomb();

    // 5. 100% scroll-driven cinematic FPS bullet impact holes (scattered across background)
    initScrollBullets();
  }

  // Update page title
  document.title = `${site.companyName || "VYRA Esports"} | ${site.eventName || "Free Fire Championship"} — Win ₹10,000 Cash`;

  // Set safe contact links
  const contactWa = document.getElementById("contactWa");
  if (contactWa) {
    const waText = encodeURIComponent(`Hi Admin, I have a question about the ${site.eventName || "Free Fire Championship"}.`);
    const waUrl = site.whatsapp ? `https://wa.me/${encodeURIComponent(site.whatsapp)}?text=${waText}` : "#";
    contactWa.href = sanitizeUrl(waUrl);
  }

  const contactIg = document.getElementById("contactIg");
  if (contactIg && site.instagram) {
    contactIg.href = sanitizeUrl(site.instagram);
  }

  // Countdown timer logic
  setupCountdown(site.eventDate);

  // Handle URL referral code (?ref=CODE)
  try {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      const sanitized = sanitizeReferralCode(refCode);
      const refInput = document.getElementById("refInput");
      if (refInput) {
        refInput.value = sanitized;
        showToast(`Referral code ${sanitized} applied!`, "info");
      }
    }
  } catch {
    // Graceful fallback
  }

  // Registration form handler
  setupRegistrationForm(site);

  // Referral code generator handler
  setupReferralGenerator(site);
}

/**
 * Initializes a subtle, responsive cyber cursor on desktop devices
 */
function initCustomCursor() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

  if (document.getElementById("cyberCursor")) return;

  const dot = document.createElement("div");
  dot.id = "cyberCursor";
  dot.className = "cursor-dot";

  const ring = document.createElement("div");
  ring.className = "cursor-ring";

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Enlarge ring on interactive targets
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, input, textarea, [data-tilt]")) {
      ring.classList.add("cursor-hover");
    }
  }, { passive: true });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a, button, input, textarea, [data-tilt]")) {
      ring.classList.remove("cursor-hover");
    }
  }, { passive: true });
}

/**
 * Sets up the event countdown timer.
 * @param {string} dateString
 */
export function setupCountdown(dateString) {
  const target = dateString ? new Date(dateString).getTime() : NaN;
  const daysEl = document.getElementById("cd-d");
  const hoursEl = document.getElementById("cd-h");
  const minEl = document.getElementById("cd-m");
  const secEl = document.getElementById("cd-s");

  function tick() {
    if (!daysEl || !hoursEl || !minEl || !secEl) return;

    if (isNaN(target)) {
      daysEl.textContent = "--";
      hoursEl.textContent = "--";
      minEl.textContent = "--";
      secEl.textContent = "--";
      return;
    }

    const diff = Math.max(0, target - Date.now());
    const pad = (n) => String(n).padStart(2, "0");

    daysEl.textContent = pad(Math.floor(diff / 864e5));
    hoursEl.textContent = pad(Math.floor(diff / 36e5) % 24);
    minEl.textContent = pad(Math.floor(diff / 6e4) % 60);
    secEl.textContent = pad(Math.floor(diff / 1e3) % 60);
  }

  tick();
  setInterval(tick, 1000);
}

/**
 * Safe clipboard copy with toast feedback
 */
function copyToClipboard(text, successMsg = "Copied to clipboard!") {
  const notifyDone = () => {
    showToast(successMsg, "success");
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(notifyDone).catch(() => {});
  } else {
    try {
      const tempInput = document.createElement("input");
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      notifyDone();
    } catch {
      // Fallback
    }
  }
}

/**
 * Sets up the registration form submit listener and payment box.
 * @param {Object} site
 */
function setupRegistrationForm(site) {
  const form = document.getElementById("regForm");
  const formErr = document.getElementById("formErr");
  const payBox = document.getElementById("payBox");
  const payHint = document.getElementById("payHint");
  const upiShow = document.getElementById("upiShow");
  const upiBtn = document.getElementById("upiBtn");
  const waBtn = document.getElementById("waBtn");
  const copyUpi = document.getElementById("copyUpi");

  if (copyUpi) {
    copyUpi.addEventListener("click", function () {
      copyToClipboard(site.upiId || "", `Copied UPI ID: ${site.upiId}`);
    });
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      name: form.elements.name?.value,
      phone: form.elements.phone?.value,
      ign: form.elements.ign?.value,
      uid: form.elements.uid?.value,
      ref: form.elements.ref?.value,
      entryType: form.elements.entryType?.value || "squad"
    };

    if (data.entryType === "solo") {
      if (formErr) {
        formErr.textContent = "Solo Entry is SOLD OUT. Only Squad registrations are currently accepted.";
        formErr.hidden = false;
      }
      showToast("Solo Entry is SOLD OUT. Only Squad registrations are accepted.", "warning");
      return;
    }

    const validation = validateRegistrationData(data);

    if (!validation.isValid) {
      if (formErr) {
        formErr.textContent = validation.error;
        formErr.hidden = false;
      }
      showToast(validation.error || "Please check your inputs", "warning");
      return;
    }

    if (formErr) formErr.hidden = true;

    const { name, phone, ign, uid, ref } = validation.sanitized;
    const selectedFee = site.entryFees?.squad || site.entryFeeSquad || site.entryFee || 1200;

    const summaryText =
      `*${site.eventName || "Free Fire Championship"} Squad Registration*\n` +
      `Captain Name: ${name}\n` +
      `WhatsApp: ${phone}\n` +
      `Free Fire IGN / Squad: ${ign}\n` +
      `Player UID: ${uid}\n` +
      `Referral Code: ${ref || "None"}\n` +
      `Entry Fee: ${formatINR(selectedFee)} (screenshot attached)`;

    const waUrl = `https://wa.me/${encodeURIComponent(site.whatsapp || "")}?text=${encodeURIComponent(summaryText)}`;
    const upiUrl =
      `upi://pay?pa=${encodeURIComponent(site.upiId || "")}&pn=${encodeURIComponent(site.companyName || "VYRA Esports")}` +
      `&am=${encodeURIComponent(selectedFee)}&cu=INR&tn=${encodeURIComponent("FreeFire Squad Entry " + uid)}`;

    const payTitle = document.getElementById("payTitle");
    if (payTitle) {
      payTitle.textContent = `Transfer Entry Fee: ${formatINR(selectedFee)}`;
    }

    if (upiShow) upiShow.textContent = site.upiId || "";
    if (upiBtn) upiBtn.href = sanitizeUrl(upiUrl);
    if (waBtn) waBtn.href = sanitizeUrl(waUrl);

    if (payHint) payHint.hidden = true;
    if (payBox) {
      payBox.hidden = false;
      payBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    showToast("Tournament slot reserved! Please complete the entry fee deposit.", "success");
  });
}

/**
 * Sets up referral code generator and share links.
 * @param {Object} site
 */
function setupReferralGenerator(site) {
  const genBtn = document.getElementById("genRef");
  const nameInput = document.getElementById("refName");
  const refOut = document.getElementById("refOut");
  const myCode = document.getElementById("myCode");
  const myLink = document.getElementById("myLink");
  const copyLink = document.getElementById("copyLink");
  const shareWa = document.getElementById("shareWa");

  if (copyLink) {
    copyLink.addEventListener("click", function () {
      if (myLink) copyToClipboard(myLink.textContent, "Referral link copied to clipboard!");
    });
  }

  if (!genBtn || !nameInput) return;

  genBtn.addEventListener("click", () => {
    const raw = sanitizeText(nameInput.value, 50);
    const base = raw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6);
    if (base.length < 2) {
      nameInput.focus();
      showToast("Please enter at least 2 letters of your name.", "warning");
      return;
    }

    // Deterministic hash based on the name
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash * 31 + raw.toLowerCase().charCodeAt(i)) % 1000;
    }

    const code = base + String(hash).padStart(3, "0");
    const link = `${window.location.origin}${window.location.pathname}?ref=${code}`;

    if (myCode) myCode.textContent = code;
    if (myLink) myLink.textContent = link;

    if (shareWa) {
      const shareMsg = `Join the ${site.eventName || "Free Fire Championship"} on ${site.companyName || "VYRA Esports"}! Compete for ₹10,000 1st prize & ₹10,000 lucky pool. Register using my referral link: ${link}`;
      shareWa.href = sanitizeUrl(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`);
    }

    if (refOut) {
      refOut.hidden = false;
      refOut.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    showToast(`Code ${code} generated successfully!`, "success");
  });
}
