import { el, formatINR } from "../utils/dom.js";

export function createEventSection(site) {
  const dateText = site.eventDateText || "Grand Finals: Next Weekend";
  const venueText = site.venue || "Custom Battle Royale Rooms (Mobile Only)";

  const tournamentHighlights = [
    {
      icon: "📅",
      tag: "MATCH SCHEDULE",
      title: "Tournament Timeline",
      desc: dateText,
      chips: ["Qualifiers", "Semi-Finals", "Grand Finals"]
    },
    {
      icon: "🎮",
      tag: "ESPORTS TITLE",
      title: "Garena Free Fire MAX",
      desc: "Competitive 48-squad custom battle royale tournament with verified mobile-only device lobbies and live anti-cheat spectators.",
      chips: ["Mobile Only", "Level 20+ UID", "Fair Play"]
    },
    {
      icon: "💳",
      tag: "COMPETITIVE ENTRY",
      title: "Entry Fees & Availability",
      desc: `Solo Entry: ${formatINR(site.entryFees?.solo || site.entryFeeSolo || 350)} (SOLD OUT — No new slots) · Squad Entry: ${formatINR(site.entryFees?.squad || site.entryFeeSquad || 1200)} (1 Squad). Secure UPI payment with instant slot confirmation.`,
      chips: ["Solo: SOLD OUT", "Squad ₹1,200", "Squad Slots Open"]
    },
    {
      icon: "📍",
      tag: "BATTLEFIELD VENUE",
      title: "Custom Esports Lobbies",
      desc: `${venueText}. Credentials sent directly to registered WhatsApp numbers 15 minutes before match countdown.`,
      chips: ["Bermuda", "Purgatory", "Kalahari"]
    }
  ];

  const facts = el("div", { className: "facts services-grid" }, 
    tournamentHighlights.map((t) =>
      el("div", { className: "fact-card service-card", dataset: { tilt: "true" } }, [
        el("div", { className: "service-card-top" }, [
          el("div", { className: "fact-icon service-icon" }, t.icon),
          el("span", { className: "badge badge-neon" }, t.tag)
        ]),
        el("h3", { className: "service-title" }, t.title),
        el("p", { className: "service-desc" }, t.desc),
        el("div", { className: "service-chips" }, 
          t.chips.map(chip => el("span", { className: "chip-item" }, chip))
        ),
        el("button", { className: "service-cta-link", type: "button", "data-action": "open-prebook" }, [
          "Join This Tournament",
          el("span", { className: "arrow" }, " →")
        ])
      ])
    )
  );

  const wrap = el("div", { className: "wrap" }, [
    el("div", { className: "section-head text-center-mobile" }, [
      el("p", { className: "kicker" }, "Tournament Overview"),
      el("h2", {}, "The Championship"),
      el("p", { className: "sub" }, 
        "High-octane custom lobbies streamed, monitored, and officiated with zero tolerance for emulators or macro hacks."
      )
    ]),
    facts
  ]);

  return el("section", { className: "band", id: "event" }, wrap);
}
