import { el } from "../utils/dom.js";

export function createBroadcastTicker() {
  const items = [
    { icon: "🔴", text: "REGISTRATIONS OPEN NOW" },
    { icon: "👑", text: "1ST PRIZE ₹10,000 INSTANT UPI" },
    { icon: "🥈", text: "2ND PRIZE ₹5,000" },
    { icon: "🎁", text: "LUCKY POOL ₹10,000 — PRE-BOOKINGS ONLY" },
    { icon: "⚡", text: "SOLO ENTRY: SOLD OUT · SQUAD ENTRY ₹1,200 (ACTIVE SLOTS)" },
    { icon: "💰", text: "EARN ₹50 PER SQUAD REFERRAL" },
    { icon: "🛡️", text: "OFFICIAL ESPORTS RULES & ANTI-CHEAT ENFORCEMENT" },
    { icon: "🎖️", text: "GUARANTEED DIGITAL PARTICIPATION PERKS FOR ALL" }
  ];

  const buildItems = () =>
    items.map((item) =>
      el("div", { className: "ticker-item" }, [
        el("span", { className: "ticker-icon" }, item.icon),
        el("span", { className: "ticker-text" }, item.text)
      ])
    );

  // Duplicate for seamless infinite marquee loop
  const track = el("div", { className: "ticker-track" }, [...buildItems(), ...buildItems()]);

  return el("aside", { className: "broadcast-ticker", "aria-label": "Live Tournament Updates" }, track);
}
