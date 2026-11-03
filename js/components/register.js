import { el, formatINR } from "../utils/dom.js";

export function createRegisterSection(site) {
  const soloFee = site.entryFees?.solo || site.entryFeeSolo || 350;
  const squadFee = site.entryFees?.squad || site.entryFeeSquad || site.entryFee || 1200;
  const luckyPool = site.prizes?.luckyDraw || 10000;

  const formErr = el("p", { className: "err", id: "formErr", role: "alert", hidden: true });

  // Disabled & non-selectable Solo Entry card with SOLD OUT indicator
  const soloRadio = el("input", {
    type: "radio",
    name: "entryType",
    value: "solo",
    id: "entryTypeSolo",
    disabled: true,
    "aria-disabled": "true"
  });

  const soloCard = el(
    "label",
    {
      className: "entry-type-card is-sold-out",
      htmlFor: "entryTypeSolo",
      title: "Solo registrations are permanently closed - SOLD OUT"
    },
    [
      soloRadio,
      el("div", { className: "entry-type-top-row" }, [
        el("span", { className: "entry-type-title" }, "Solo Entry"),
        el("span", { className: "badge-sold-out" }, "SOLD OUT")
      ]),
      el("span", { className: "entry-type-price" }, formatINR(soloFee)),
      el("span", { className: "entry-type-desc" }, "SOLD OUT — Registrations Closed")
    ]
  );

  // Active & functional Squad Entry card
  const squadRadio = el("input", {
    type: "radio",
    name: "entryType",
    value: "squad",
    id: "entryTypeSquad",
    checked: true
  });

  const squadCard = el("label", { className: "entry-type-card is-active", htmlFor: "entryTypeSquad" }, [
    squadRadio,
    el("div", { className: "entry-type-top-row" }, [
      el("span", { className: "entry-type-title" }, "Squad Entry"),
      el("span", { className: "badge badge-neon" }, "AVAILABLE")
    ]),
    el("span", { className: "entry-type-price" }, formatINR(squadFee)),
    el("span", { className: "entry-type-desc" }, "1 Squad (4 Players) · Active Slots")
  ]);

  const entryTypeSelector = el(
    "div",
    { className: "entry-type-grid", role: "radiogroup", "aria-label": "Select Entry Type" },
    [soloCard, squadCard]
  );

  // Submit button locked to Squad registration
  const submitBtn = el(
    "button",
    { className: "btn btn-glow w-100", id: "regSubmitBtn", type: "submit" },
    `Lock Squad Slot (${formatINR(squadFee)})`
  );

  const nameInput = el("input", {
    name: "name",
    autocomplete: "name",
    required: true,
    maxlength: "60",
    placeholder: "e.g. Rahul Sharma"
  });
  const phoneInput = el("input", {
    name: "phone",
    inputmode: "numeric",
    maxlength: "10",
    placeholder: "10-digit WhatsApp number (starts with 6-9)",
    required: true
  });
  const ignInput = el("input", {
    name: "ign",
    required: true,
    maxlength: "40",
    placeholder: "e.g. 亗DARK•SOUL亗"
  });
  const uidInput = el("input", {
    name: "uid",
    inputmode: "numeric",
    required: true,
    maxlength: "15",
    placeholder: "e.g. 1827465920 (UID level 20+)"
  });
  const refInput = el("input", {
    name: "ref",
    id: "refInput",
    placeholder: "e.g. FRIEND123",
    autocapitalize: "characters",
    maxlength: "12"
  });

  const form = el("form", { id: "regForm", novalidate: true, dataset: { tilt: "true" } }, [
    el("div", { className: "form-header" }, [
      el("div", {}, [
        el("h3", {}, "Squad Registration"),
        el("p", { className: "small" }, "Fast-track onboarding for custom tournament lobbies")
      ]),
      el("span", { className: "badge badge-flame" }, "INSTANT SLOT LOCK")
    ]),
    el("label", {}, [
      "Tournament Entry Category",
      entryTypeSelector
    ]),
    el("label", {}, ["Captain / Player Full Name", nameInput]),
    el("label", {}, ["WhatsApp Contact Number", phoneInput]),
    el("label", {}, ["Free Fire In-Game Name (IGN) / Squad Tag", ignInput]),
    el("label", {}, ["Free Fire Player UID (6+ Digits)", uidInput]),
    el("label", {}, [
      "Ambassador / Referral Code ",
      el("span", { className: "opt" }, "(Optional)"),
      refInput
    ]),
    formErr,
    submitBtn,
    el("p", { className: "small security-note" }, "🔒 Enterprise security. Room ID & Password delivered directly to your WhatsApp 15m before match.")
  ]);

  const payTitle = el("h3", { id: "payTitle" }, `Transfer Entry Fee: ${formatINR(squadFee)}`);

  const payBox = el("aside", { className: "pay pay-box-glow", id: "payBox", hidden: true, dataset: { tilt: "true" } }, [
    el("div", { className: "pay-header" }, [
      el("span", { className: "badge badge-neon" }, "Squad Slot Reserved"),
      payTitle
    ]),
    el("p", { id: "payDesc" }, "Transfer the tournament squad entry fee to our official tournament UPI ID, then share the confirmation screenshot on WhatsApp for instant bracket lock:"),
    el("div", { className: "upi-card" }, [
      el("div", {}, [
        el("span", { className: "small" }, "Official Tournament UPI ID:"),
        el("p", { className: "upi" }, el("code", { id: "upiShow" }, site.upiId || ""))
      ]),
      el("button", { className: "btn btn-small btn-ghost", id: "copyUpi", type: "button" }, "📋 Copy")
    ]),
    el("div", { className: "pay-actions" }, [
      el("a", { className: "btn btn-glow", id: "upiBtn", href: "#" }, "⚡ Open UPI App (GPay / PhonePe / Paytm)"),
      el("a", {
        className: "btn btn-ghost",
        id: "waBtn",
        href: "#",
        target: "_blank",
        rel: "noopener noreferrer"
      }, "💬 Confirm on Official WhatsApp")
    ]),
    el("p", { className: "small text-center" }, "Slots are confirmed in real-time once the transaction screenshot is verified by our tournament admins.")
  ]);

  const payHint = el("aside", { className: "pay", id: "payHint", dataset: { tilt: "true" } }, [
    el("h3", {}, "What Your Registration Includes"),
    el("ul", { className: "perks-list" }, [
      el("li", {}, [
        el("span", { className: "perk-icon" }, "🏆"),
        el("div", {}, [
          el("strong", {}, "Championship Squad Bracket"),
          el("p", { className: "small" }, `Compete for ${formatINR(site.prizes.first || 10000)} (1st Prize) and ${formatINR(site.prizes.second || 5000)} (2nd Prize).`)
        ])
      ]),
      el("li", {}, [
        el("span", { className: "perk-icon" }, "🎁"),
        el("div", {}, [
          el("strong", {}, `Lucky Pool: ${formatINR(luckyPool)} (Pre-bookings Only)`),
          el("p", { className: "small" }, "Exclusively reserved for pre-registered squads. Drawn live on match day.")
        ])
      ]),
      el("li", {}, [
        el("span", { className: "perk-icon" }, "🛡️"),
        el("div", {}, [
          el("strong", {}, "Anti-Cheat Scrim Room"),
          el("p", { className: "small" }, "Verified spectated rooms with strict mobile-only anti-emulator enforcement.")
        ])
      ]),
      el("li", {}, [
        el("span", { className: "perk-icon" }, "🎖️"),
        el("div", {}, [
          el("strong", {}, "Official Esports Certificate"),
          el("p", { className: "small" }, "Digital certificate awarded to every participant squad upon match completion.")
        ])
      ])
    ])
  ]);

  const regGrid = el("div", { className: "reg-grid" }, [form, payBox, payHint]);

  return el("section", { className: "wrap", id: "register" }, [
    el("div", { className: "section-head" }, [
      el("p", { className: "kicker" }, "Secure Your Lobby"),
      el("h2", {}, "Squad Registration"),
      el("p", { className: "sub" }, `Squad Entry: ${formatINR(squadFee)} per Squad. Solo Entry is officially SOLD OUT. Slot is locked and confirmed immediately after payment verification.`)
    ]),
    regGrid
  ]);
}
