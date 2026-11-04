import { el, formatINR } from "../utils/dom.js";
import { showToast } from "./toast.js";
import {
  sendDemoOtp,
  verifyDemoOtp,
  createPreBooking,
  verifyDemoPayment,
  maskPhone
} from "../services/bookingStore.js";

/**
 * VYRA Esports — Tournament Pre-Booking & Demo Payment Modal
 * Features:
 * - Initial Ticket Selection Screen ("CHOOSE YOUR BATTLE"): Squad Pass & Solo Pass (SOLD OUT)
 * - 4-Step Checkout Stepper:
 *     01 VERIFY MOBILE -> 02 REVIEW BOOKING -> 03 DEMO PAYMENT -> 04 DIGITAL TICKET
 * - Complete security validation, backend price enforcement, and single-ticket idempotency.
 *
 * @param {Object} site
 * @param {Function} [onTicketGenerated] Callback when a ticket is issued
 * @returns {{ open: Function, close: Function, showTicket: Function, el: HTMLElement }}
 */
export function createPreBookingModal(site, onTicketGenerated) {
  // Step 0: Ticket Selection ("CHOOSE YOUR BATTLE")
  // Step 1: 01 VERIFY MOBILE
  // Step 2: 02 REVIEW BOOKING
  // Step 3: 03 DEMO PAYMENT
  // Step 4: 04 DIGITAL TICKET
  let currentStep = 0;
  let isPhoneVerified = false;
  let activeBooking = null;
  let generatedTicket = null;

  const stepState = {
    category: "squad",
    categoryTitle: "SQUAD PASS",
    originalPrice: 2000,
    price: 1200,
    savings: 800,
    offerCondition: "PRE-BOOKING OFFER ONLY",
    name: "",
    phone: "",
    ign: "",
    uid: "",
    ref: "",
    otp: "",
    otpSent: false,
    demoUtr: "",
    simulateFailure: false
  };

  // Backdrop overlay
  const overlay = el("div", {
    className: "prebook-modal-backdrop",
    hidden: true,
    style: "display: none;",
    role: "dialog",
    "aria-modal": "true"
  });

  const modalContainer = el("div", { className: "prebook-modal-card" });
  overlay.appendChild(modalContainer);

  // Click outside modal card to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) {
        closeModal();
      }
    });
  }

  function closeModal() {
    overlay.hidden = true;
    overlay.style.display = "none";
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  }

  function openModal(prefill = {}) {
    overlay.hidden = false;
    overlay.style.display = "flex";
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");

    if (prefill.name) stepState.name = prefill.name;
    if (prefill.phone) stepState.phone = prefill.phone;
    if (prefill.ign) stepState.ign = prefill.ign;
    if (prefill.uid) stepState.uid = prefill.uid;
    if (prefill.ref) stepState.ref = prefill.ref;

    // Always start at Ticket Selection screen when opening freshly
    renderStep(0);
  }

  // Render 4-step progress indicator
  function renderStepper(step) {
    const steps = [
      { num: 1, label: "Verify Mobile" },
      { num: 2, label: "Review Booking" },
      { num: 3, label: "Demo Payment" },
      { num: 4, label: "Digital Ticket" }
    ];

    return el("div", { className: "prebook-stepper", role: "navigation", "aria-label": "Booking progress" }, [
      el(
        "div",
        { className: "stepper-track" },
        steps.map((s) => {
          const isActive = s.num === step;
          const isDone = s.num < step;
          return el(
            "div",
            {
              className: `stepper-step ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`,
              "aria-current": isActive ? "step" : undefined
            },
            [
              el("div", { className: "stepper-circle" }, isDone ? "✓" : `0${s.num}`),
              el("span", { className: "stepper-label" }, s.label)
            ]
          );
        })
      )
    ]);
  }

  function renderStep(step) {
    modalContainer.innerHTML = "";
    currentStep = step;

    // Adjust container width for ticket selection vs form steps
    if (step === 0) {
      modalContainer.classList.add("modal-card-wide");
    } else {
      modalContainer.classList.remove("modal-card-wide");
    }

    const closeBtn = el("button", {
      className: "modal-close-btn",
      type: "button",
      "aria-label": "Close pre-booking dialog"
    }, "✕");
    closeBtn.addEventListener("click", closeModal);

    const contentBox = el("div", { className: "modal-step-content" });

    if (step === 0) {
      // Step 0: Ticket Selection Screen ("CHOOSE YOUR BATTLE")
      renderTicketSelection(contentBox, closeBtn);
    } else {
      // Steps 1 - 4: Render Header with Active Pass Pill + Stepper
      const passBadge = el("div", { className: "selected-pass-pill" }, [
        el("span", { className: "pass-pill-badge" }, "SQUAD PASS"),
        el("span", { className: "pass-pill-price" }, "₹1,200"),
        el("span", { className: "pass-pill-savings" }, "SAVE ₹800"),
        el("button", {
          className: "btn-change-pass",
          type: "button",
          title: "Change Ticket Category"
        }, "Change Pass")
      ]);

      passBadge.querySelector(".btn-change-pass").addEventListener("click", () => {
        renderStep(0);
      });

      const header = el("div", { className: "modal-header-row" }, [
        el("div", {}, [
          el("span", { className: "badge badge-flame" }, "PRE-BOOKING SYSTEM"),
          passBadge
        ]),
        closeBtn
      ]);

      modalContainer.appendChild(header);
      modalContainer.appendChild(renderStepper(step));

      if (step === 1) {
        renderStep1(contentBox);
      } else if (step === 2) {
        renderStep2(contentBox);
      } else if (step === 3) {
        renderStep3(contentBox);
      } else if (step === 4) {
        renderStep4(contentBox);
      }
    }

    modalContainer.appendChild(contentBox);
  }

  // =========================================================================
  // STEP 0: TICKET SELECTION SCREEN ("CHOOSE YOUR BATTLE")
  // =========================================================================
  function renderTicketSelection(container, closeBtn) {
    const headerRow = el("div", { className: "ticket-select-header-row" }, [
      el("div", { className: "ticket-select-heading-group" }, [
        el("div", { className: "ticket-select-eyebrow-row" }, [
          el("span", { className: "live-dot" }),
          el("span", { className: "ticket-select-eyebrow" }, "OFFICIAL TOURNAMENT PASSES")
        ]),
        el("h2", { className: "ticket-select-title" }, "CHOOSE YOUR BATTLE"),
        el("p", { className: "ticket-select-sub" }, "Exclusive pre-booking prices. Secure your spot before bookings close.")
      ]),
      closeBtn
    ]);

    // CARD 1 — SQUAD PASS (Available & Selectable)
    const squadCard = el("div", { className: "ticket-battle-card is-squad-card", dataset: { tilt: "true" } }, [
      el("div", { className: "ticket-card-glow-edge" }),
      el("div", { className: "ticket-card-top" }, [
        el("span", { className: "ticket-category-tag" }, "SQUAD"),
        el("span", { className: "badge badge-flame" }, "PRE-BOOKING OFFER")
      ]),
      el("h3", { className: "ticket-card-title" }, "SQUAD PASS"),
      el("div", { className: "ticket-price-block" }, [
        el("div", { className: "ticket-price-row" }, [
          el("span", { className: "ticket-original-price" }, [
            el("del", {}, "₹2,000")
          ]),
          el("strong", { className: "ticket-offer-price text-gradient-blue" }, "₹1,200")
        ]),
        el("span", { className: "ticket-savings-badge" }, "SAVE ₹800")
      ]),
      el("p", { className: "ticket-supporting-text" }, "Offer valid for pre-bookings only."),
      el("div", { className: "ticket-perks-list" }, [
        el("div", { className: "ticket-perk-item" }, [
          el("span", { className: "perk-icon perk-check" }, "✓"),
          el("span", {}, "1 Full Squad Allocation (4 Players)")
        ]),
        el("div", { className: "ticket-perk-item" }, [
          el("span", { className: "perk-icon perk-check" }, "✓"),
          el("span", {}, "₹10,000 1st & ₹5,000 2nd Prize Eligibility")
        ]),
        el("div", { className: "ticket-perk-item" }, [
          el("span", { className: "perk-icon perk-check" }, "✓"),
          el("span", {}, "Automatic Guaranteed Entry into ₹10,000 Lucky Pool")
        ])
      ]),
      el("button", {
        className: "btn btn-glow btn-battle-select w-100",
        type: "button",
        id: "btnSelectSquadPass",
        "aria-label": "Select Squad Pass Pre-Booking for ₹1,200"
      }, "PRE-BOOK SQUAD — ₹1,200")
    ]);

    squadCard.querySelector("#btnSelectSquadPass").addEventListener("click", () => {
      stepState.category = "squad";
      stepState.categoryTitle = "SQUAD PASS";
      stepState.originalPrice = 2000;
      stepState.price = 1200;
      stepState.savings = 800;
      stepState.offerCondition = "PRE-BOOKING OFFER ONLY";
      renderStep(1);
    });

    // CARD 2 — SOLO PASS (SOLD OUT & Disabled)
    const soloCard = el("div", {
      className: "ticket-battle-card is-solo-card is-sold-out",
      "aria-disabled": "true",
      title: "Solo registrations are currently sold out."
    }, [
      el("div", { className: "ticket-card-top" }, [
        el("span", { className: "ticket-category-tag" }, "SOLO"),
        el("span", { className: "badge-sold-out" }, "SOLD OUT")
      ]),
      el("h3", { className: "ticket-card-title text-muted" }, "SOLO PASS"),
      el("div", { className: "ticket-price-block" }, [
        el("div", { className: "ticket-price-row" }, [
          el("span", { className: "ticket-original-price" }, [
            el("del", {}, "₹500")
          ]),
          el("strong", { className: "ticket-offer-price text-muted" }, "₹350")
        ]),
        el("span", { className: "ticket-savings-badge badge-savings-muted" }, "SAVE ₹150")
      ]),
      el("p", { className: "ticket-supporting-text text-amber" }, "Solo registrations are currently sold out."),
      el("p", { className: "ticket-offer-note" }, "₹350 offer applies to pre-bookings only."),
      el("div", { className: "ticket-perks-list is-dimmed" }, [
        el("div", { className: "ticket-perk-item text-muted" }, [
          el("span", { className: "perk-icon perk-cross" }, "✕"),
          el("span", {}, "Solo Custom Room Bracket (Max Capacity Reached)")
        ]),
        el("div", { className: "ticket-perk-item text-muted" }, [
          el("span", { className: "perk-icon perk-cross" }, "✕"),
          el("span", {}, "Registrations Permanently Closed")
        ])
      ]),
      el("button", {
        className: "btn btn-disabled-sold-out w-100",
        type: "button",
        disabled: true,
        "aria-disabled": "true",
        id: "btnSelectSoloPass",
        "aria-label": "Solo Pass is Sold Out"
      }, "SOLO SOLD OUT")
    ]);

    // Safety guard: clicking disabled card or button strictly prevents any progress
    soloCard.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast("Solo registrations are currently sold out. Please choose Squad Pass to participate.", "warning");
    });

    const grid = el("div", { className: "ticket-battle-grid" }, [squadCard, soloCard]);

    const note = el("p", { className: "small text-center text-muted mt-3" },
      "🔒 Secure 256-Bit Encrypted Tournament Registration. Powered by official VYRA Esports backend."
    );

    container.appendChild(headerRow);
    container.appendChild(grid);
    container.appendChild(note);
  }

  // =========================================================================
  // STEP 1: VERIFY MOBILE
  // =========================================================================
  function renderStep1(container) {
    const stepHead = el("div", { className: "step-intro-block" }, [
      el("h3", { className: "step-main-title" }, "VERIFY YOUR MOBILE"),
      el("p", { className: "step-sub-desc" },
        "Your 10-digit Indian mobile number will be associated with this booking for tournament room credentials and prize payouts."
      )
    ]);

    const nameInput = el("input", {
      type: "text",
      placeholder: "e.g. Rahul Sharma",
      value: stepState.name,
      className: "modal-input",
      required: true,
      maxLength: 60
    });
    const phoneInput = el("input", {
      type: "tel",
      placeholder: "10-digit Indian Mobile (starts with 6-9)",
      value: stepState.phone,
      className: "modal-input",
      maxLength: 10,
      inputMode: "numeric",
      required: true
    });
    const ignInput = el("input", {
      type: "text",
      placeholder: "e.g. 亗DARK•SOUL亗",
      value: stepState.ign,
      className: "modal-input",
      required: true,
      maxLength: 40
    });
    const uidInput = el("input", {
      type: "text",
      placeholder: "Free Fire UID (6+ digits)",
      value: stepState.uid,
      className: "modal-input",
      maxLength: 15,
      inputMode: "numeric",
      required: true
    });
    const refInput = el("input", {
      type: "text",
      placeholder: "Ambassador / Referral Code (Optional)",
      className: "modal-input",
      maxLength: 12,
      value: stepState.ref
    });

    const otpInput = el("input", {
      type: "text",
      placeholder: "Enter 6-digit OTP",
      maxLength: 6,
      className: "otp-code-input",
      value: stepState.otp || "123456"
    });

    const otpSection = el("div", { className: "otp-verify-block", hidden: !isPhoneVerified && !stepState.otpSent });
    const sendOtpBtn = el("button", { className: "btn btn-ghost btn-small", type: "button" }, "Send Demo OTP");
    const otpNotice = el("p", { className: "small otp-demo-hint", hidden: true });

    sendOtpBtn.addEventListener("click", async () => {
      const p = phoneInput.value.trim();
      if (!/^[6-9]\d{9}$/.test(p)) {
        showToast("Please enter a valid 10-digit Indian mobile number (starts with 6-9).", "warning");
        phoneInput.focus();
        return;
      }
      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = "Sending...";
      const res = await sendDemoOtp(p);
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = "Resend OTP";
      if (res.success) {
        stepState.otpSent = true;
        otpSection.hidden = false;
        otpNotice.hidden = false;
        otpNotice.innerHTML = `⚡ <strong>DEMO OTP:</strong> No real SMS is sent. Enter test code <code>${res.demoOtp || "123456"}</code>`;
        showToast("Demo verification OTP dispatched!", "info");
      } else {
        showToast(res.error || "Failed to send OTP", "warning");
      }
    });

    const verifyOtpBtn = el("button", { className: "btn btn-glow btn-small", type: "button" }, "Verify OTP");
    verifyOtpBtn.addEventListener("click", async () => {
      const p = phoneInput.value.trim();
      const code = otpInput.value.trim();
      if (!/^\d{6}$/.test(code)) {
        showToast("Please enter the 6-digit verification code.", "warning");
        otpInput.focus();
        return;
      }
      const res = await verifyDemoOtp(p, code);
      if (res.success) {
        isPhoneVerified = true;
        phoneInput.disabled = true;
        showToast("Mobile number verified successfully!", "success");
        otpSection.innerHTML = `<div class="verified-badge-row">✓ Mobile +91 ${p} Verified for Tournament Access</div>`;
      } else {
        showToast(res.error || "Incorrect OTP code", "warning");
      }
    });

    otpSection.appendChild(el("label", {}, ["Enter 6-Digit Demo OTP", otpInput]));
    otpSection.appendChild(verifyOtpBtn);
    otpSection.appendChild(otpNotice);

    const backBtn = el("button", { className: "btn btn-ghost", type: "button" }, "← Back to Tickets");
    backBtn.addEventListener("click", () => renderStep(0));

    // Primary CTA: "VERIFY & CONTINUE"
    const continueBtn = el("button", { className: "btn btn-glow flex-1", type: "button", id: "btnStep1Continue" }, "VERIFY & CONTINUE →");

    continueBtn.addEventListener("click", async () => {
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const ign = ignInput.value.trim();
      const uid = uidInput.value.trim();

      if (name.length < 2) {
        showToast("Please enter captain full name (min 2 characters).", "warning");
        nameInput.focus();
        return;
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        showToast("Please enter a valid 10-digit Indian mobile number (starts with 6-9).", "warning");
        phoneInput.focus();
        return;
      }

      // If mobile not yet verified, verify via demo OTP automatically or prompt
      if (!isPhoneVerified) {
        const code = otpInput.value.trim() || "123456";
        continueBtn.disabled = true;
        continueBtn.textContent = "Verifying Mobile...";
        const otpRes = await verifyDemoOtp(phone, code);
        continueBtn.disabled = false;
        continueBtn.textContent = "VERIFY & CONTINUE →";

        if (otpRes.success) {
          isPhoneVerified = true;
        } else {
          stepState.otpSent = true;
          otpSection.hidden = false;
          otpNotice.hidden = false;
          otpNotice.innerHTML = `⚡ <strong>DEMO OTP:</strong> No real SMS is sent. Enter test code <code>123456</code>`;
          showToast("Please enter the demo OTP code (123456) to verify your mobile.", "warning");
          otpInput.focus();
          return;
        }
      }

      if (ign.length < 2) {
        showToast("Please enter your Free Fire In-Game Name.", "warning");
        ignInput.focus();
        return;
      }
      if (!/^\d{6,15}$/.test(uid)) {
        showToast("Free Fire UID must be between 6 and 15 digits.", "warning");
        uidInput.focus();
        return;
      }

      stepState.name = name;
      stepState.phone = phone;
      stepState.ign = ign;
      stepState.uid = uid;
      stepState.ref = refInput.value.trim();

      renderStep(2);
    });

    const form = el("div", { className: "prebook-form-grid" }, [
      el("div", { className: "form-group" }, [el("label", {}, ["Captain / Player Full Name", nameInput])]),
      el("div", { className: "form-group" }, [
        el("div", { className: "label-with-action" }, [
          el("label", {}, "Indian Mobile Number"),
          sendOtpBtn
        ]),
        phoneInput
      ]),
      otpSection,
      el("div", { className: "two-col-inputs" }, [
        el("div", { className: "form-group" }, [el("label", {}, ["Free Fire IGN / Squad Tag", ignInput])]),
        el("div", { className: "form-group" }, [el("label", {}, ["Player UID (6+ Digits)", uidInput])])
      ]),
      el("div", { className: "form-group" }, [el("label", {}, ["Referral Code (Optional)", refInput])]),
      el("div", { className: "modal-actions-row mt-3" }, [backBtn, continueBtn])
    ]);

    container.appendChild(stepHead);
    container.appendChild(form);
  }

  // =========================================================================
  // STEP 2: REVIEW BOOKING
  // =========================================================================
  function renderStep2(container) {
    const summaryCard = el("div", { className: "booking-summary-card" }, [
      el("div", { className: "summary-header-row" }, [
        el("h3", { className: "summary-card-title" }, "REVIEW BOOKING"),
        el("span", { className: "badge badge-flame" }, "PRE-BOOKING OFFER ONLY")
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Selected Category"),
        el("strong", { className: "text-blue" }, "SQUAD PASS")
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Original Price"),
        el("span", { className: "item-original-price" }, [
          el("del", {}, "₹2,000")
        ])
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Pre-Booking Discount"),
        el("span", { className: "badge badge-neon" }, "₹800 OFF")
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Offer Condition"),
        el("span", { className: "offer-cond-tag" }, "PRE-BOOKING OFFER ONLY")
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Customer Name"),
        el("strong", {}, stepState.name)
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Masked Mobile"),
        el("span", { className: "mono-val" }, maskPhone(stepState.phone))
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Free Fire IGN & UID"),
        el("span", { className: "mono-val" }, `${stepState.ign} (UID: ${stepState.uid})`)
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Tournament Date"),
        el("span", { className: "badge badge-muted" }, site.eventDateText || "TBA (To Be Announced)")
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name text-amber" }, "Cancellation Policy"),
        el("strong", { className: "badge badge-flame" }, "NON-REFUNDABLE BOOKING")
      ]),
      el("div", { className: "summary-item-row highlight-row" }, [
        el("span", { className: "item-name final-amount-label" }, "Final Payable Amount"),
        el("strong", { className: "summary-price text-gradient-blue" }, "₹1,200")
      ]),
      el("p", { className: "small perks-reminder" },
        "🎁 Pre-booking includes guaranteed entry to the ₹10,000 Lucky Pool (Pre-bookings Only) plus full eligibility for ₹10,000 (1st) & ₹5,000 (2nd) Prizes."
      ),
      el("p", { className: "small non-refundable-summary-note text-amber mt-1" },
        "⚠️ Non-refundable booking: Confirmed tournament registrations cannot be refunded once verified, subject to applicable law."
      )
    ]);

    const backBtn = el("button", { className: "btn btn-ghost", type: "button" }, "← Back");
    backBtn.addEventListener("click", () => renderStep(1));

    // Primary CTA: "CONTINUE TO DEMO PAYMENT"
    const proceedBtn = el("button", {
      className: "btn btn-glow flex-1",
      type: "button",
      id: "btnStep2Proceed"
    }, "CONTINUE TO DEMO PAYMENT →");

    proceedBtn.addEventListener("click", async () => {
      proceedBtn.disabled = true;
      proceedBtn.textContent = "Creating Booking Record...";
      const res = await createPreBooking({
        name: stepState.name,
        phone: stepState.phone,
        ign: stepState.ign,
        uid: stepState.uid,
        ref: stepState.ref,
        category: "squad",
        entryType: "squad"
      });
      proceedBtn.disabled = false;
      proceedBtn.textContent = "CONTINUE TO DEMO PAYMENT →";

      if (res.success && res.booking) {
        activeBooking = res.booking;
        renderStep(3);
      } else {
        showToast(res.error || "Booking creation failed", "warning");
      }
    });

    const actionRow = el("div", { className: "modal-actions-row mt-3" }, [backBtn, proceedBtn]);

    container.appendChild(summaryCard);
    container.appendChild(actionRow);
  }

  // =========================================================================
  // STEP 3: DEMO PAYMENT
  // =========================================================================
  function renderStep3(container) {
    const bookingId = activeBooking?.bookingId || ("VYRA-BK-" + Date.now().toString(36).toUpperCase());

    const warningBanner = el("div", { className: "demo-disclaimer-banner" }, [
      el("span", { className: "disclaimer-icon" }, "⚠️"),
      el("div", {}, [
        el("strong", { className: "disclaimer-title" }, "DEMO ONLY — NO REAL MONEY WILL BE TRANSFERRED"),
        el("p", { className: "small disclaimer-body" },
          "This is a simulated testing environment for tournament squad pre-booking verification. Do not transfer actual currency."
        )
      ])
    ]);

    // High-Tech Cyber QR Simulation
    const qrSvg = `
      <svg class="demo-qr-svg" viewBox="0 0 160 160" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="160" fill="#080A0F" rx="8" />
        <rect x="15" y="15" width="40" height="40" fill="none" stroke="#145CFF" stroke-width="6" rx="4" />
        <rect x="25" y="25" width="20" height="20" fill="#FF303B" />
        <rect x="105" y="15" width="40" height="40" fill="none" stroke="#145CFF" stroke-width="6" rx="4" />
        <rect x="115" y="25" width="20" height="20" fill="#FF303B" />
        <rect x="15" y="105" width="40" height="40" fill="none" stroke="#145CFF" stroke-width="6" rx="4" />
        <rect x="25" y="115" width="20" height="20" fill="#FF303B" />
        <path d="M70 20 h20 v20 h-20 z M70 60 h20 v20 h-20 z M20 70 h20 v20 h-20 z M110 70 h20 v20 h-20 z M70 110 h20 v20 h-20 z M110 110 h30 v10 h-30 z M105 130 h15 v15 h-15 z" fill="#145CFF" />
        <circle cx="80" cy="80" r="14" fill="#FF303B" />
        <text x="80" y="84" font-family="monospace" font-size="9" fill="#F5F7FA" text-anchor="middle" font-weight="bold">DEMO</text>
      </svg>
    `;

    const qrWrapper = el("div", { className: "demo-qr-box" });
    qrWrapper.innerHTML = qrSvg;

    const utrInput = el("input", {
      type: "text",
      className: "demo-utr-input",
      placeholder: "e.g. DEMO-982143 or 12-digit reference",
      value: stepState.demoUtr || ("DEMO-" + Math.floor(100000 + Math.random() * 900000))
    });

    const genUtrBtn = el("button", { className: "btn btn-ghost btn-small", type: "button" }, "⚡ Auto-Generate Test UTR");
    genUtrBtn.addEventListener("click", () => {
      const randomCode = "DEMO-" + Math.floor(100000 + Math.random() * 900000);
      utrInput.value = randomCode;
      stepState.demoUtr = randomCode;
      showToast(`Generated Demo UTR: ${randomCode}`, "info");
    });

    const failureCheckbox = el("input", { type: "checkbox", id: "simFailureToggle" });
    const failureLabel = el("label", { htmlFor: "simFailureToggle", className: "small failure-toggle-label" }, [
      failureCheckbox,
      " Simulate Payment Failure (Test Retry State)"
    ]);

    const errorAlert = el("p", { className: "err", hidden: true, role: "alert" });

    const payScreen = el("div", { className: "demo-pay-screen-card" }, [
      el("div", { className: "demo-pay-header" }, [
        el("div", {}, [
          el("span", { className: "brand-tag" }, "VYRA GAMING ESPORTS"),
          el("h3", { className: "demo-pay-title" }, "DEMO PAYMENT")
        ]),
        el("div", { className: "badge badge-amber" }, "PAYMENT PENDING")
      ]),
      el("div", { className: "demo-pay-grid" }, [
        qrWrapper,
        el("div", { className: "demo-pay-details" }, [
          el("p", { className: "small" }, ["Booking ID: ", el("code", {}, bookingId)]),
          el("h3", { className: "pay-due-amount" }, `Amount Due: ₹1,200`),
          el("p", { className: "small text-muted" }, "Squad Pass (1 Squad · 4 Players) · Demo Verification"),
          el("div", { className: "demo-utr-wrapper mt-2" }, [
            el("div", { className: "label-with-action" }, [
              el("label", {}, "Demo UTR / Reference Number"),
              genUtrBtn
            ]),
            utrInput
          ]),
          failureLabel,
          errorAlert
        ])
      ])
    ]);

    const backBtn = el("button", { className: "btn btn-ghost", type: "button" }, "← Back");
    backBtn.addEventListener("click", () => renderStep(2));

    // Mandatory Agreement Checkbox (Initially Unchecked as required by specification)
    const termsCheckbox = el("input", {
      type: "checkbox",
      id: "termsAgreeCheckbox",
      className: "terms-agree-checkbox"
    });
    termsCheckbox.checked = false;

    // Prominent Non-Refundable Booking Notice & Agreement Section
    const termsNoticeBox = el("div", { className: "non-refundable-notice-box" }, [
      el("div", { className: "notice-header-row" }, [
        el("span", { className: "notice-icon" }, "⚠️"),
        el("strong", { className: "notice-heading" }, "NON-REFUNDABLE BOOKING")
      ]),
      el("p", { className: "notice-body-text" },
        "By confirming this booking, you acknowledge that confirmed tournament registration fees are generally non-refundable, subject to applicable law and the organizer's obligations if the event is cancelled or cannot be provided."
      ),
      el("div", { className: "terms-checkbox-row" }, [
        termsCheckbox,
        el("label", { htmlFor: "termsAgreeCheckbox", className: "terms-checkbox-label" }, [
          "I have read and agree to the ",
          el("a", {
            href: "/terms-and-conditions",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "terms-modal-link",
            title: "Open Terms & Conditions in a new tab"
          }, "Terms & Conditions and Non-Refundable Payment Policy"),
          "."
        ])
      ])
    ]);

    // Primary CTA: "VERIFY DEMO PAYMENT & GENERATE TICKET"
    const verifyPayBtn = el("button", {
      className: "btn btn-glow flex-1 btn-disabled",
      type: "button",
      id: "btnVerifyDemoPay"
    }, "VERIFY DEMO PAYMENT & GENERATE TICKET →");

    const updateTermsButtonState = () => {
      if (termsCheckbox.checked) {
        verifyPayBtn.classList.remove("btn-disabled");
        errorAlert.hidden = true;
      } else {
        verifyPayBtn.classList.add("btn-disabled");
      }
    };

    termsCheckbox.addEventListener("change", updateTermsButtonState);

    verifyPayBtn.addEventListener("click", async () => {
      const utr = utrInput.value.trim().toUpperCase();

      if (!utr) {
        errorAlert.textContent = "Please enter a demo reference number or click 'Auto-Generate Test UTR'.";
        errorAlert.hidden = false;
        utrInput.focus();
        return;
      }

      // Strict enforcement of Terms & Conditions acceptance
      if (!termsCheckbox.checked) {
        errorAlert.textContent = "You must read and agree to the Terms & Conditions and Non-Refundable Payment Policy before confirming your booking.";
        errorAlert.hidden = false;
        termsCheckbox.focus();
        showToast("Please agree to the Terms & Conditions and Non-Refundable Policy to proceed.", "warning");
        return;
      }

      if (failureCheckbox.checked) {
        errorAlert.textContent = "Simulated Payment Failure: Gateway rejected the demo transaction. Please retry.";
        errorAlert.hidden = false;
        showToast("Simulated payment failure triggered. You can retry.", "warning");
        return;
      }

      errorAlert.hidden = true;
      verifyPayBtn.disabled = true;
      verifyPayBtn.textContent = "Verifying Demo Transaction...";

      stepState.demoUtr = utr;

      const termsAcceptedAt = new Date().toISOString();
      const termsVersion = "v1.0";

      const result = await verifyDemoPayment({
        bookingId,
        demoUtr: utr,
        phone: stepState.phone,
        name: stepState.name,
        ign: stepState.ign,
        uid: stepState.uid,
        category: "squad",
        amount: 1200,
        termsAccepted: true,
        termsAcceptedAt,
        termsVersion,
        userId: stepState.phone
      });

      verifyPayBtn.disabled = false;
      verifyPayBtn.textContent = "VERIFY DEMO PAYMENT & GENERATE TICKET →";

      if (result.success && result.ticket) {
        generatedTicket = result.ticket;
        showToast("Demo payment verified! Digital ticket generated.", "success");
        if (typeof onTicketGenerated === "function") {
          onTicketGenerated(result.ticket);
        }
        renderStep(4);
      } else {
        errorAlert.textContent = result.error || "Payment verification failed. Please try again.";
        errorAlert.hidden = false;
        showToast(result.error || "Payment verification failed", "warning");
      }
    });

    const actionRow = el("div", { className: "modal-actions-row mt-3" }, [backBtn, verifyPayBtn]);

    container.appendChild(warningBanner);
    container.appendChild(payScreen);
    container.appendChild(termsNoticeBox);
    container.appendChild(actionRow);
  }

  // =========================================================================
  // STEP 4: DIGITAL TICKET
  // =========================================================================
  function renderStep4(container) {
    const t = generatedTicket || {
      ticketId: "VYRA-TKT-" + Math.floor(100000 + Math.random() * 900000),
      bookingId: activeBooking?.bookingId || ("VYRA-BK-" + Date.now().toString(36).toUpperCase()),
      holderName: stepState.name || "Squad Captain",
      maskedPhone: maskPhone(stepState.phone),
      category: "SQUAD",
      categoryName: "SQUAD PASS",
      ticketType: "Squad Pre-Booking",
      amount: 1200,
      originalPrice: 2000,
      savings: 800,
      paymentStatus: "DEMO_VERIFIED",
      paymentStatusLabel: "DEMO PAYMENT VERIFIED",
      bookingStatus: "PRE-BOOKED",
      tournamentDate: site.eventDateText || "TBA",
      demoUtr: stepState.demoUtr || "DEMO-TX-10492"
    };

    // Explicit dual disclosures required by specification
    const disclosuresNotice = el("div", { className: "ticket-disclaimer-notice" }, [
      el("strong", { className: "disclosure-badge text-amber" }, "DEMO TICKET — PAYMENT SIMULATED"),
      el("p", { className: "disclosure-body" }, "PRE-BOOKING CONFIRMATION — NOT A FINAL EVENT ADMISSION TICKET"),
      el("p", { className: "small text-muted mt-1" },
        "This digital confirmation reserves your squad pre-booking slot. Official match room credentials and schedule will be notified via registered mobile."
      ),
      el("p", { className: "small text-amber mt-1 font-mono" },
        "🔒 NON-REFUNDABLE BOOKING · Governed by Tournament Terms & Conditions v1.0"
      )
    ]);

    const qrSvg = `
      <svg class="ticket-qr-svg" viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#0E1219" rx="6" />
        <rect x="10" y="10" width="25" height="25" fill="none" stroke="#145CFF" stroke-width="4" />
        <rect x="17" y="17" width="11" height="11" fill="#FF303B" />
        <rect x="65" y="10" width="25" height="25" fill="none" stroke="#145CFF" stroke-width="4" />
        <rect x="72" y="17" width="11" height="11" fill="#FF303B" />
        <rect x="10" y="65" width="25" height="25" fill="none" stroke="#145CFF" stroke-width="4" />
        <rect x="17" y="72" width="11" height="11" fill="#FF303B" />
        <path d="M45 15 h10 v10 h-10 z M45 45 h10 v10 h-10 z M15 45 h10 v10 h-10 z M75 45 h10 v10 h-10 z M45 75 h10 v10 h-10 z M70 70 h20 v8 h-20 z" fill="#145CFF" />
      </svg>
    `;

    const ticketCard = el("div", { className: "digital-ticket-card", dataset: { tilt: "true" } }, [
      el("div", { className: "ticket-header" }, [
        el("div", { className: "brand-logo-mark" }, [
          el("span", { className: "brand-symbol" }, "◆"),
          el("span", { className: "brand-name" }, "VYRA"),
          el("span", { className: "brand-tag" }, "ESPORTS")
        ]),
        el("div", { className: "ticket-badges-col" }, [
          el("span", { className: "badge badge-flame" }, "PRE-BOOKED"),
          el("span", { className: "badge badge-neon" }, "DEMO PAYMENT VERIFIED")
        ])
      ]),
      el("div", { className: "ticket-body-grid" }, [
        el("div", { className: "ticket-meta-fields" }, [
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "TICKET ID"),
            el("strong", { className: "ticket-value ticket-id-val" }, t.ticketId)
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "BOOKING ID"),
            el("span", { className: "ticket-value" }, t.bookingId)
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "PASS HOLDER"),
            el("span", { className: "ticket-value" }, t.holderName)
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "CONTACT NUMBER"),
            el("span", { className: "ticket-value" }, t.maskedPhone)
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "CATEGORY & AMOUNT"),
            el("span", { className: "ticket-value" }, "Squad Pass (1 Squad · 4 Players) · ₹1,200 (PAID IN FULL)")
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "OFFER SAVINGS"),
            el("span", { className: "ticket-value text-neon" }, "Original ₹2,000 · SAVE ₹800 (PRE-BOOKING OFFER)")
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "TOURNAMENT DATE"),
            el("span", { className: "ticket-value text-amber" }, site.eventDateText || "TBA (To Be Announced)")
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "PAYMENT POLICY"),
            el("span", { className: "ticket-value text-amber font-mono" }, "NON-REFUNDABLE BOOKING (v1.0)")
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "DEMO REFERENCE (UTR)"),
            el("code", { className: "ticket-utr" }, t.demoUtr)
          ])
        ]),
        el("div", { className: "ticket-qr-col" }, [
          el("div", { className: "qr-box-inner" }, []),
          el("span", { className: "small text-muted mt-1 text-center" }, "Verified Booking QR")
        ])
      ])
    ]);

    const qrInner = ticketCard.querySelector(".qr-box-inner");
    if (qrInner) qrInner.innerHTML = qrSvg;

    // View Digital Pass action / Return to My Tickets
    const viewPassBtn = el("button", {
      className: "btn btn-glow flex-1",
      type: "button",
      id: "btnViewDigitalPass"
    }, "VIEW DIGITAL PASS IN MY TICKETS →");

    viewPassBtn.addEventListener("click", () => {
      closeModal();
      const elSection = document.getElementById("my-tickets");
      if (elSection) {
        elSection.scrollIntoView({ behavior: "smooth" });
        // Auto-search for user's phone if available
        const phoneField = elSection.querySelector("input[type='tel']");
        const searchBtn = elSection.querySelector(".btn-find-tickets");
        if (phoneField && stepState.phone) {
          phoneField.value = stepState.phone;
          if (searchBtn) searchBtn.click();
        }
      }
    });

    const printBtn = el("button", { className: "btn btn-ghost", type: "button" }, "🖨️ Print Pass");
    printBtn.addEventListener("click", () => {
      window.print();
    });

    const doneBtn = el("button", { className: "btn btn-ghost", type: "button" }, "Done");
    doneBtn.addEventListener("click", closeModal);

    const actionRow = el("div", { className: "modal-actions-row mt-3" }, [printBtn, viewPassBtn, doneBtn]);

    container.appendChild(disclosuresNotice);
    container.appendChild(ticketCard);
    container.appendChild(actionRow);
  }

  return {
    el: overlay,
    open: openModal,
    close: closeModal,
    showTicket: (ticket) => {
      generatedTicket = ticket;
      currentStep = 4;
      renderStep(4);
      overlay.hidden = false;
      overlay.style.display = "flex";
      overlay.classList.add("is-open");
      document.body.classList.add("modal-open");
    }
  };
}
