import { el } from "../utils/dom.js";

export function createFooter(site) {
  const companySpan = el("span", { id: "footerCompany" }, site.companyName || "VYRA Esports");

  const brandBlock = el("div", { className: "footer-brand-block" }, [
    el("div", { className: "brand-logo-mark" }, [
      el("span", { className: "brand-symbol" }, "◆"),
      el("span", { className: "brand-name" }, "VYRA"),
      el("span", { className: "brand-tag" }, "ESPORTS")
    ]),
    el("p", { className: "footer-tagline" }, site.tagline || "Drop in. Outlast everyone. Take home ₹10,000."),
    el("div", { className: "footer-status" }, [
      el("span", { className: "live-dot" }),
      el("span", { className: "small" }, "Live Tournament Engine · Custom Battle Royale Lobbies Active")
    ])
  ]);

  const navLinks = [
    { href: "#event", label: "Overview" },
    { href: "#format", label: "Format & Scoring" },
    { href: "#prizes", label: "Prize Pool" },
    { href: "#rules", label: "Rules" },
    { href: "#my-tickets", label: "My Tickets" },
    { href: "#refer", label: "Refer & Earn" },
    { href: "#contact", label: "Organizer Support" },
    { href: "/terms-and-conditions", label: "Terms & Conditions" }
  ];

  const linksBlock = el("div", { className: "footer-links-block" }, [
    el("p", { className: "footer-col-title" }, "Navigation & Legal"),
    el("div", { className: "footer-links-grid" }, 
      navLinks.map(link => el("a", { href: link.href, className: "footer-link" }, link.label))
    )
  ]);

  const legalRow = el("div", { className: "footer-legal-bar" }, [
    el("a", {
      href: "/terms-and-conditions",
      className: "footer-legal-link",
      id: "footerTermsLink"
    }, "📜 Terms & Conditions & Non-Refundable Payment Policy (v1.0)")
  ]);

  const p = el("p", { className: "footer-copyright" }, [
    `© ${new Date().getFullYear()} `,
    companySpan,
    ". All rights reserved. Free Fire is a registered trademark of Garena. This championship is an independent competitive esports tournament."
  ]);

  const footerWrap = el("div", { className: "wrap footer-inner" }, [
    el("div", { className: "footer-top-grid" }, [brandBlock, linksBlock]),
    el("div", { className: "footer-bottom" }, [legalRow, p])
  ]);

  return el("footer", { className: "site-footer" }, footerWrap);
}
