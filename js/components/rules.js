import { el, formatINR } from "../utils/dom.js";

export function createRulesSection(site) {
  const rulesList = el("ul", { className: "rules-list" }, [
    el("li", {}, [
      el("strong", {}, "Entry Fee & Slot Policy: "),
      `Registration fee is ${formatINR(site.entryFees?.squad || site.entryFeeSquad || 1200)} per Squad (Solo Entry is officially SOLD OUT) and is non-refundable once custom room lobbies are created.`
    ]),
    el("li", {}, [
      el("strong", {}, "Device Verification: "),
      "Strictly mobile devices only (Android & iOS). Emulators, scripts, iPads/tablets, and rooted tools are instantly disqualified."
    ]),
    el("li", {}, [
      el("strong", {}, "Credentials Delivery: "),
      "Room ID and Password are transmitted via official WhatsApp exactly 15 minutes before match countdown starts."
    ]),
    el("li", {}, [
      el("strong", {}, "Fair Play & Anti-Teaming: "),
      "Cross-team teaming, hacking, macro scripts, or abusive conduct results in an instant ban without refund."
    ]),
    el("li", {}, [
      el("strong", {}, "Referees & Disputes: "),
      "Tournament admins' decisions on match replays and official score calculation are final."
    ])
  ]);

  const rulesCol = el("div", { className: "rules-card", dataset: { tilt: "true" } }, [
    el("div", { className: "card-title-row" }, [
      el("span", { className: "icon-pill" }, "⚖️"),
      el("h2", {}, "Tournament Rules")
    ]),
    rulesList
  ]);

  const stepsList = el("ol", { className: "steps-list" }, [
    el("li", {}, [
      el("strong", {}, "1. Submit Squad Registration"),
      el("p", { className: "small" }, "Fill in captain name, WhatsApp, Free Fire UID, and optional referral code for your squad.")
    ]),
    el("li", {}, [
      el("strong", {}, `2. Transfer Entry Fee via UPI (${formatINR(site.entryFees?.squad || site.entryFeeSquad || 1200)} Squad · Solo Sold Out)`),
      el("p", { className: "small" }, "Pay using any UPI app (GPay, PhonePe, Paytm) and screenshot the transaction.")
    ]),
    el("li", {}, [
      el("strong", {}, "3. Instant Slot Confirmation"),
      el("p", { className: "small" }, "Send transaction screenshot on WhatsApp to lock your squad in the match bracket.")
    ]),
    el("li", {}, [
      el("strong", {}, "4. Join Custom Lobby & Play"),
      el("p", { className: "small" }, `Receive Room ID 15 minutes before match, drop in, and take home ${formatINR(site.prizes?.first || 10000)}!`)
    ])
  ]);

  const stepsCol = el("div", { className: "steps-card", dataset: { tilt: "true" } }, [
    el("div", { className: "card-title-row" }, [
      el("span", { className: "icon-pill" }, "🚀"),
      el("h2", {}, "How It Works")
    ]),
    stepsList
  ]);

  const wrap = el("div", { className: "wrap two" }, [rulesCol, stepsCol]);

  return el("section", { className: "band alt", id: "rules" }, wrap);
}
