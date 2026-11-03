import { el } from "../utils/dom.js";

export function createContactSection(site) {
  const contactWa = el("a", {
    className: "btn btn-glow btn-hero",
    id: "contactWa",
    href: "#",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "💬 Chat on Official WhatsApp");

  const contactIg = el("a", {
    className: "btn btn-ghost",
    id: "contactIg",
    href: "#",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "📸 Follow on Instagram");

  const ctaRow = el("div", { className: "cta-row" }, [contactWa, contactIg]);

  const supportCard = el("div", { className: "support-card", dataset: { tilt: "true" } }, [
    el("div", { className: "support-header-badge" }, [
      el("span", { className: "radar-ping" }),
      el("span", { className: "small text-uppercase tracking-wider" }, "TOURNAMENT ADMIN DESK // 24/7 ACTIVE")
    ]),
    el("div", { className: "section-head" }, [
      el("p", { className: "kicker" }, "24/7 Organizer Desk"),
      el("h2", {}, "Need Help or Have Questions?"),
      el("p", { className: "sub" }, "Our tournament admin team is active on WhatsApp to assist with slot confirmation, scoring rules, and squad verification.")
    ]),
    ctaRow,
    el("div", { className: "support-footer-note" }, [
      el("span", { className: "hud-pill" }, "⚡ Typical Response: Under 15 Minutes"),
      el("span", { className: "hud-pill" }, "🔒 Verified Match Referees — Zero Bot Delays")
    ])
  ]);

  return el("section", { className: "wrap", id: "contact" }, supportCard);
}
