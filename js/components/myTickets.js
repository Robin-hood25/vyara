import { el, formatINR } from "../utils/dom.js";
import { fetchMyTickets, maskPhone } from "../services/bookingStore.js";

/**
 * Creates the redesigned "My Tickets" tournament section.
 * Provides a dedicated, premium esports ticket lookup panel and responsive pass display.
 * @param {Object} site
 * @param {Function} onViewTicket Callback to view specific ticket in modal
 * @param {Function} onStartPrebook Callback to start a new pre-booking
 * @returns {HTMLElement}
 */
export function createMyTicketsSection(site, onViewTicket, onStartPrebook) {
  // Main container elements
  const section = el("section", { className: "my-tickets-section", id: "my-tickets" });
  const wrap = el("div", { className: "wrap" });

  // Section Header: Balanced, cinematic, and immune to sticky navbar clipping
  const sectionHeader = el("div", { className: "section-head text-center" }, [
    el("div", { className: "tickets-eyebrow-row" }, [
      el("span", { className: "tickets-radar-dot" }),
      el("span", { className: "tickets-eyebrow" }, "YOUR ACCESS. YOUR BATTLE.")
    ]),
    el("h2", { className: "tickets-main-heading" }, "MY TICKETS"),
    el("p", { className: "sub tickets-sub" }, "Find your squad pre-booking and access your digital pass.")
  ]);

  // Dedicated Ticket Lookup Panel
  const lookupPanel = el("div", { className: "tickets-lookup-panel" });

  const panelHeader = el("div", { className: "lookup-panel-header" }, [
    el("div", { className: "lookup-icon-badge" }, [
      el("span", { className: "lookup-icon" }, "🎫")
    ]),
    el("div", { className: "lookup-header-text" }, [
      el("h3", { className: "lookup-title" }, "FIND YOUR BOOKING"),
      el("p", { className: "lookup-desc" }, "Enter the 10-digit mobile number used during pre-booking.")
    ])
  ]);

  // Search Input Field
  const phoneInput = el("input", {
    type: "tel",
    inputMode: "numeric",
    placeholder: "Enter 10-digit mobile number",
    className: "tickets-dark-input",
    maxLength: 10,
    autocomplete: "tel",
    "aria-label": "Enter 10-digit mobile number"
  });

  const searchBtn = el("button", {
    className: "btn btn-find-tickets",
    type: "button",
    "aria-label": "Find squad tickets"
  }, [
    el("span", { className: "search-btn-icon" }, "🔍"),
    el("span", { className: "search-btn-text" }, "FIND TICKETS")
  ]);

  const searchForm = el("form", {
    className: "tickets-search-form",
    on: {
      submit: (e) => {
        e.preventDefault();
        executeSearch();
      }
    }
  }, [
    el("div", { className: "input-with-prefix" }, [
      el("span", { className: "phone-prefix" }, "+91"),
      phoneInput
    ]),
    searchBtn
  ]);

  // Inline Validation Message Container
  const validationAlert = el("div", {
    className: "tickets-validation-alert",
    hidden: true,
    role: "alert"
  });

  lookupPanel.appendChild(panelHeader);
  lookupPanel.appendChild(searchForm);
  lookupPanel.appendChild(validationAlert);

  // Dedicated Results Area
  const resultsArea = el("div", { className: "tickets-results-area", id: "ticketsResultsArea" });

  // Render initial guide state
  function showInitialState() {
    resultsArea.innerHTML = "";
    const card = el("div", { className: "tickets-state-card initial-card" }, [
      el("div", { className: "state-icon" }, "🎫"),
      el("h4", { className: "state-title" }, "SQUAD PASS LOOKUP"),
      el("p", { className: "state-desc" },
        "Enter your pre-registered mobile number above to retrieve and display your digital tournament tickets."
      ),
      el("button", {
        className: "btn btn-ghost btn-small mt-3",
        type: "button",
        on: {
          click: () => {
            if (typeof onStartPrebook === "function") onStartPrebook();
          }
        }
      }, [
        "Pre-Book Squad Passes (₹1,200)",
        el("span", { className: "arrow" }, " →")
      ])
    ]);
    resultsArea.appendChild(card);
  }

  // Render loading state
  function showLoadingState() {
    resultsArea.innerHTML = "";
    const card = el("div", { className: "tickets-state-card loading-card" }, [
      el("div", { className: "state-spinner" }),
      el("h4", { className: "state-title" }, "SEARCHING VAULT..."),
      el("p", { className: "state-desc font-mono" }, "Scanning encrypted ledger for verified pre-bookings...")
    ]);
    resultsArea.appendChild(card);
  }

  // Render no results state
  function showNoResultsState(phone) {
    resultsArea.innerHTML = "";
    const card = el("div", { className: "tickets-state-card empty-card" }, [
      el("div", { className: "state-icon text-red" }, "🔍"),
      el("h4", { className: "state-title" }, "NO BOOKINGS FOUND"),
      el("p", { className: "state-desc" },
        `No pre-booked tickets found for mobile +91 ${phone}. Please verify the 10-digit number used during squad pre-booking.`
      ),
      el("div", { className: "state-actions" }, [
        el("button", {
          className: "btn btn-ghost btn-small",
          type: "button",
          on: {
            click: () => {
              phoneInput.focus();
              phoneInput.select();
            }
          }
        }, "Try Another Number"),
        el("button", {
          className: "btn btn-glow btn-small",
          type: "button",
          on: {
            click: () => {
              if (typeof onStartPrebook === "function") onStartPrebook();
            }
          }
        }, "Pre-Book Your Squad (₹1,200) →")
      ])
    ]);
    resultsArea.appendChild(card);
  }

  // Render error state
  function showErrorState(phone) {
    resultsArea.innerHTML = "";
    const card = el("div", { className: "tickets-state-card error-card" }, [
      el("div", { className: "state-icon text-red" }, "⚠️"),
      el("h4", { className: "state-title" }, "VAULT CONNECTION ERROR"),
      el("p", { className: "state-desc" },
        "Unable to connect to the ticket vault. Please check your internet connection and try again."
      ),
      el("button", {
        className: "btn btn-ghost btn-small mt-3",
        type: "button",
        on: {
          click: () => executeSearch(phone)
        }
      }, "🔄 Retry Search")
    ]);
    resultsArea.appendChild(card);
  }

  // Render verified ticket results
  function showTicketsSuccess(tickets) {
    resultsArea.innerHTML = "";

    const countText = `${tickets.length} ${tickets.length === 1 ? "SQUAD PASS" : "SQUAD PASSES"} FOUND`;
    const resultsHeader = el("div", { className: "tickets-results-header" }, [
      el("h3", { className: "results-title" }, "YOUR BOOKINGS"),
      el("span", { className: "badge badge-neon" }, countText)
    ]);

    // Responsive container: centered single card or balanced multi-column grid
    const gridClass = tickets.length === 1 ? "tickets-cards-wrap is-single" : "tickets-cards-wrap is-multi";
    const cardsContainer = el("div", { className: gridClass });

    tickets.forEach((t) => {
      const card = el("article", {
        className: "ticket-pass-card",
        dataset: { tilt: "true" }
      }, [
        // Top accent esports glowing line
        el("div", { className: "pass-accent-bar" }),

        // Header: Ticket ID & Status Badges
        el("div", { className: "pass-card-header" }, [
          el("div", { className: "pass-id-group" }, [
            el("span", { className: "pass-type-kicker" }, t.ticketType || "Squad Pre-Booking Pass"),
            el("h4", { className: "pass-ticket-id" }, t.ticketId || "VYRA-TKT-XXXXXX")
          ]),
          el("div", { className: "pass-status-group" }, [
            el("span", { className: "badge badge-neon" }, t.paymentStatus || "DEMO PAYMENT VERIFIED"),
            el("span", { className: "badge badge-flame" }, t.bookingStatus || "PRE-BOOKED")
          ])
        ]),

        // 2-Column Structured Info Grid
        el("div", { className: "pass-info-grid" }, [
          el("div", { className: "pass-field" }, [
            el("span", { className: "field-label" }, "PASS HOLDER"),
            el("strong", { className: "field-value holder-name" }, t.holderName || "Squad Captain")
          ]),
          el("div", { className: "pass-field" }, [
            el("span", { className: "field-label" }, "REGISTERED MOBILE"),
            el("span", { className: "field-value font-mono" }, t.maskedPhone || maskPhone(t.phone))
          ]),
          el("div", { className: "pass-field" }, [
            el("span", { className: "field-label" }, "ENTRY PASS AMOUNT"),
            el("strong", { className: "field-value amount-highlight" }, formatINR(t.amount || 1200))
          ]),
          el("div", { className: "pass-field" }, [
            el("span", { className: "field-label" }, "TOURNAMENT DATE"),
            el("span", { className: "field-value text-amber font-mono" }, t.tournamentDate || "TBA (Grand Finals)")
          ]),
          el("div", { className: "pass-field" }, [
            el("span", { className: "field-label" }, "DEMO UTR / REFERENCE"),
            el("code", { className: "field-value demo-utr-tag font-mono" }, t.demoUtr || "DEMO-VERIFIED")
          ]),
          el("div", { className: "pass-field" }, [
            el("span", { className: "field-label" }, "BOOKING IDENTIFIER"),
            el("span", { className: "field-value text-muted font-mono small" }, t.bookingId || "VYRA-BK-...")
          ])
        ]),

        // Footer: Demo disclosure & Digital Pass Modal CTA
        el("div", { className: "pass-card-footer" }, [
          el("p", { className: "pass-demo-notice" }, "⚡ DEMO PASS — PAYMENT SIMULATED. NOT AN OFFICIAL BANK TRANSACTION."),
          el("button", {
            className: "btn btn-view-pass",
            type: "button",
            "aria-label": `View digital pass for ${t.ticketId}`,
            on: {
              click: () => {
                if (typeof onViewTicket === "function") onViewTicket(t);
              }
            }
          }, [
            "VIEW DIGITAL PASS",
            el("span", { className: "pass-btn-arrow" }, " →")
          ])
        ])
      ]);

      cardsContainer.appendChild(card);
    });

    resultsArea.appendChild(resultsHeader);
    resultsArea.appendChild(cardsContainer);
  }

  // Execute lookup with validation and state orchestration
  async function executeSearch(targetPhone) {
    const rawVal = targetPhone !== undefined ? targetPhone : phoneInput.value;
    const cleanPhone = String(rawVal || "").replace(/\D/g, "");

    // Validation: Exactly 10 digits required
    if (cleanPhone.length !== 10) {
      validationAlert.hidden = false;
      validationAlert.textContent = "⚠️ Please enter a valid 10-digit mobile number.";
      phoneInput.classList.add("has-error");
      phoneInput.focus();
      return;
    }

    validationAlert.hidden = true;
    phoneInput.classList.remove("has-error");

    showLoadingState();

    try {
      const tickets = await fetchMyTickets(cleanPhone);
      if (!tickets || tickets.length === 0) {
        showNoResultsState(cleanPhone);
      } else {
        showTicketsSuccess(tickets);
      }
    } catch {
      showErrorState(cleanPhone);
    }
  }

  // Bind lookup button click
  searchBtn.addEventListener("click", () => executeSearch());

  // Real-time error clearance on typing
  phoneInput.addEventListener("input", () => {
    if (!validationAlert.hidden) {
      const clean = phoneInput.value.replace(/\D/g, "");
      if (clean.length === 10) {
        validationAlert.hidden = true;
        phoneInput.classList.remove("has-error");
      }
    }
  });

  // Check if an active phone exists in local storage
  let activePhone = "";
  try {
    activePhone = localStorage.getItem("vyara_active_user_phone") || "";
  } catch {
    // Ignore storage issues
  }

  if (activePhone && activePhone.replace(/\D/g, "").length === 10) {
    phoneInput.value = activePhone.replace(/\D/g, "");
    // Auto-search for returning pre-booked player
    executeSearch(activePhone);
  } else {
    showInitialState();
  }

  // Assemble section layout
  wrap.appendChild(sectionHeader);
  wrap.appendChild(lookupPanel);
  wrap.appendChild(resultsArea);
  section.appendChild(wrap);

  // Expose reload function for external triggers (e.g. after newly generated ticket)
  section.reloadTickets = (phone) => {
    if (phone) {
      phoneInput.value = phone.replace(/\D/g, "");
      executeSearch(phone);
    } else {
      executeSearch();
    }
  };

  return section;
}
