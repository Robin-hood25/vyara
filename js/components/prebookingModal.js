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
 * Creates the complete multi-step pre-booking and demo payment modal.
 * @param {Object} site
 * @param {Function} [onTicketGenerated] Callback when a ticket is issued
 * @returns {{ open: Function, close: Function, el: HTMLElement }}
 */
export function createPreBookingModal(site, onTicketGenerated) {
  let currentStep = 1;
  let verifiedPhone = "";
  let isPhoneVerified = false;
  let activeBooking = null;
  let generatedTicket = null;

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
    if (prefill.name || prefill.phone) {
      stepState.name = prefill.name || "";
      stepState.phone = prefill.phone || "";
      stepState.ign = prefill.ign || "";
      stepState.uid = prefill.uid || "";
      stepState.ref = prefill.ref || "";
    }
    renderStep(currentStep);
  }

  const stepState = {
    name: "",
    phone: "",
    ign: "",
    uid: "",
    ref: "",
    otp: "",
    demoUtr: "",
    simulateFailure: false
  };

  // Render Stepper Progress Header
  function renderStepper(step) {
    const steps = [
      { num: 1, label: "Verify Mobile" },
      { num: 2, label: "Review Booking" },
      { num: 3, label: "Demo Payment" },
      { num: 4, label: "Digital Ticket" }
    ];

    return el("div", { className: "prebook-stepper" }, [
      el("div", { className: "stepper-track" },
        steps.map((s) =>
          el("div", { className: `stepper-step ${s.num === step ? "is-active" : s.num < step ? "is-done" : ""}` }, [
            el("div", { className: "stepper-circle" }, s.num < step ? "✓" : String(s.num)),
            el("span", { className: "stepper-label" }, s.label)
          ])
        )
      )
    ]);
  }

  function renderStep(step) {
    modalContainer.innerHTML = "";
    currentStep = step;

    const closeBtn = el("button", {
      className: "modal-close-btn",
      type: "button",
      "aria-label": "Close pre-booking dialog"
    }, "✕");
    closeBtn.addEventListener("click", closeModal);

    const header = el("div", { className: "modal-header-row" }, [
      el("div", {}, [
        el("span", { className: "badge badge-flame" }, "DEMO PRE-BOOKING SYSTEM"),
        el("h3", { className: "modal-title" }, "Squad Pass Pre-Booking (₹1,200)")
      ]),
      closeBtn
    ]);

    modalContainer.appendChild(header);
    modalContainer.appendChild(renderStepper(step));

    const contentBox = el("div", { className: "modal-step-content" });

    if (step === 1) {
      renderStep1(contentBox);
    } else if (step === 2) {
      renderStep2(contentBox);
    } else if (step === 3) {
      renderStep3(contentBox);
    } else if (step === 4) {
      renderStep4(contentBox);
    }

    modalContainer.appendChild(contentBox);
  }

  // --- STEP 1: Details & Demo Mobile OTP Verification ---
  function renderStep1(container) {
    const nameInput = el("input", {
      type: "text",
      placeholder: "e.g. Rahul Sharma",
      value: stepState.name,
      required: true
    });
    const phoneInput = el("input", {
      type: "tel",
      placeholder: "10-digit Indian Mobile (starts with 6-9)",
      value: stepState.phone,
      maxLength: 10,
      required: true
    });
    const ignInput = el("input", {
      type: "text",
      placeholder: "e.g. 亗DARK•SOUL亗",
      value: stepState.ign,
      required: true
    });
    const uidInput = el("input", {
      type: "text",
      placeholder: "Free Fire UID (6+ digits)",
      value: stepState.uid,
      maxLength: 15,
      required: true
    });
    const refInput = el("input", {
      type: "text",
      placeholder: "Ambassador / Referral Code (Optional)",
      value: stepState.ref
    });

    const otpInput = el("input", {
      type: "text",
      placeholder: "Enter 6-digit OTP",
      maxLength: 6,
      className: "otp-code-input",
      value: stepState.otp
    });

    const otpSection = el("div", { className: "otp-verify-block", hidden: !isPhoneVerified && !stepState.otpSent });
    const sendOtpBtn = el("button", { className: "btn btn-ghost btn-small", type: "button" }, "Send Demo OTP");
    const otpNotice = el("p", { className: "small otp-demo-hint", hidden: true });

    sendOtpBtn.addEventListener("click", async () => {
      const p = phoneInput.value.trim();
      if (!/^[6-9]\d{9}$/.test(p)) {
        showToast("Please enter a valid 10-digit Indian mobile number.", "warning");
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
        otpNotice.innerHTML = `⚡ <strong>DEMO MODE:</strong> Your test OTP is <code>${res.demoOtp || "123456"}</code>`;
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
        verifiedPhone = p;
        showToast("Mobile number verified successfully!", "success");
        verifyOtpBtn.textContent = "✓ Verified";
        verifyOtpBtn.disabled = true;
        phoneInput.disabled = true;
        otpSection.innerHTML = `<div class="verified-badge-row">✓ Mobile +91 ${p} Verified</div>`;
      } else {
        showToast(res.error || "Incorrect OTP code", "warning");
      }
    });

    otpSection.appendChild(el("label", {}, ["Enter 6-Digit Demo OTP", otpInput]));
    otpSection.appendChild(verifyOtpBtn);
    otpSection.appendChild(otpNotice);

    const nextBtn = el("button", { className: "btn btn-glow w-100 mt-3", type: "button" }, "Review Booking Details →");
    nextBtn.addEventListener("click", () => {
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
        showToast("Please enter a valid 10-digit Indian mobile number.", "warning");
        phoneInput.focus();
        return;
      }
      if (!isPhoneVerified) {
        showToast("Please verify your mobile number with the demo OTP first.", "warning");
        sendOtpBtn.focus();
        return;
      }
      if (ign.length < 2) {
        showToast("Please enter your Free Fire In-Game Name.", "warning");
        ignInput.focus();
        return;
      }
      if (!/^\d{6,15}$/.test(uid)) {
        showToast("Free Fire UID must be 6 to 15 digits.", "warning");
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
      nextBtn
    ]);

    container.appendChild(form);
  }

  // --- STEP 2: Review Booking Details ---
  function renderStep2(container) {
    const summaryCard = el("div", { className: "booking-summary-card" }, [
      el("div", { className: "summary-header-row" }, [
        el("h4", {}, "Squad Pass Booking Summary"),
        el("span", { className: "badge badge-neon" }, "FULL PAYMENT PRE-BOOKING")
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Ticket Category"),
        el("strong", {}, "Squad Pass (1 Squad · 4 Players)")
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Solo Entry Status"),
        el("span", { className: "badge badge-sold-out" }, "SOLD OUT")
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Captain Name"),
        el("span", {}, stepState.name)
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Verified Mobile"),
        el("span", {}, maskPhone(stepState.phone))
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Free Fire UID"),
        el("span", {}, stepState.uid)
      ]),
      el("div", { className: "summary-item-row" }, [
        el("span", { className: "item-name" }, "Tournament Date"),
        el("span", { className: "badge badge-muted" }, "TBA (To Be Announced)")
      ]),
      el("div", { className: "summary-item-row highlight-row" }, [
        el("span", { className: "item-name" }, "Total Payable Amount"),
        el("strong", { className: "summary-price" }, formatINR(1200))
      ]),
      el("p", { className: "small perks-reminder" },
        "🎁 Pre-booking includes automatic guaranteed entry to the ₹10,000 Lucky Pool (Pre-bookings Only) plus championship bracket eligibility for ₹10,000 (1st) & ₹5,000 (2nd)."
      )
    ]);

    const backBtn = el("button", { className: "btn btn-ghost", type: "button" }, "← Back");
    backBtn.addEventListener("click", () => renderStep(1));

    const proceedBtn = el("button", { className: "btn btn-glow flex-1", type: "button" }, "Proceed to Full Demo Payment (₹1,200) →");
    proceedBtn.addEventListener("click", async () => {
      proceedBtn.disabled = true;
      proceedBtn.textContent = "Creating Booking Record...";
      const res = await createPreBooking({
        name: stepState.name,
        phone: stepState.phone,
        ign: stepState.ign,
        uid: stepState.uid,
        ref: stepState.ref,
        entryType: "squad"
      });
      proceedBtn.disabled = false;
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

  // --- STEP 3: Demo Payment Screen ---
  function renderStep3(container) {
    const bookingId = activeBooking?.bookingId || ("VYRA-BK-" + Date.now().toString(36).toUpperCase());

    const warningBanner = el("div", { className: "demo-disclaimer-banner" }, [
      el("span", { className: "disclaimer-icon" }, "⚠️"),
      el("div", {}, [
        el("strong", {}, "DEMO PAYMENT MODE"),
        el("p", { className: "small" }, "NO REAL MONEY WILL BE TRANSFERRED. This is a simulated testing environment for tournament squad pre-booking verification.")
      ])
    ]);

    // Simulated QR Code Generator (SVG High-Tech Visual QR)
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
      value: stepState.demoUtr
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
        el("span", { className: "brand-tag" }, "VYRA GAMING ESPORTS"),
        el("div", { className: "badge badge-amber" }, "PAYMENT PENDING")
      ]),
      el("div", { className: "demo-pay-grid" }, [
        qrWrapper,
        el("div", { className: "demo-pay-details" }, [
          el("p", { className: "small" }, `Booking ID: <code>${bookingId}</code>`),
          el("h3", { className: "pay-due-amount" }, `Amount Due: ${formatINR(1200)}`),
          el("p", { className: "small text-muted" }, "Squad Pass (1 Squad) · Full Payment Verification"),
          el("div", { className: "demo-utr-wrapper mt-2" }, [
            el("div", { className: "label-with-action" }, [
              el("label", {}, "Demo UTR / Bank Reference Number"),
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

    const verifyPayBtn = el("button", { className: "btn btn-glow flex-1", type: "button" }, "Authorize & Complete Demo Payment (₹1,200) →");

    verifyPayBtn.addEventListener("click", async () => {
      const utr = utrInput.value.trim().toUpperCase();

      if (!utr) {
        errorAlert.textContent = "Please enter a demo reference number or click 'Auto-Generate Test UTR'.";
        errorAlert.hidden = false;
        utrInput.focus();
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

      const result = await verifyDemoPayment({
        bookingId,
        demoUtr: utr,
        phone: stepState.phone,
        name: stepState.name,
        ign: stepState.ign,
        uid: stepState.uid
      });

      verifyPayBtn.disabled = false;
      verifyPayBtn.textContent = "Authorize & Complete Demo Payment (₹1,200) →";

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
    container.appendChild(actionRow);
  }

  // --- STEP 4: Digital Pre-Booking Ticket ---
  function renderStep4(container) {
    const t = generatedTicket || {
      ticketId: "VYRA-TKT-991204",
      bookingId: activeBooking?.bookingId || "VYRA-BK-2026-001",
      holderName: stepState.name,
      maskedPhone: maskPhone(stepState.phone),
      ticketType: "Squad Pre-Booking",
      amount: 1200,
      paymentStatus: "DEMO PAYMENT VERIFIED",
      bookingStatus: "PRE-BOOKED",
      tournamentDate: "TBA",
      demoUtr: stepState.demoUtr || "DEMO-TX-10492"
    };

    const ticketNotice = el("div", { className: "ticket-disclaimer-notice" }, [
      el("strong", {}, "DEMO TICKET — PAYMENT SIMULATED. NOT A FINAL EVENT ADMISSION TICKET."),
      el("p", { className: "small" }, "This pass confirms your squad pre-booking reservation in demo mode. The match schedule is currently TBA.")
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
            el("span", { className: "ticket-value" }, `Squad Pass (1 Squad) · ${formatINR(t.amount)} (PAID IN FULL)`)
          ]),
          el("div", { className: "ticket-field" }, [
            el("span", { className: "ticket-label" }, "TOURNAMENT DATE"),
            el("span", { className: "ticket-value text-amber" }, "TBA (To Be Announced)")
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

    const myTicketsBtn = el("a", { className: "btn btn-glow flex-1", href: "#my-tickets" }, "View in My Tickets →");
    myTicketsBtn.addEventListener("click", () => {
      closeModal();
      const elSection = document.getElementById("my-tickets");
      if (elSection) {
        elSection.scrollIntoView({ behavior: "smooth" });
      }
    });

    const printBtn = el("button", { className: "btn btn-ghost", type: "button" }, "🖨️ Print Pass");
    printBtn.addEventListener("click", () => {
      window.print();
    });

    const doneBtn = el("button", { className: "btn btn-ghost", type: "button" }, "Done");
    doneBtn.addEventListener("click", closeModal);

    const actionRow = el("div", { className: "modal-actions-row mt-3" }, [printBtn, myTicketsBtn, doneBtn]);

    container.appendChild(ticketNotice);
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
