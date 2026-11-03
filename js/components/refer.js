import { el, formatINR } from "../utils/dom.js";
import { createEarningsCalculator } from "./calculator.js";

export function createReferSection(site) {
  const leftCol = el("div", {}, [
    el("div", { className: "section-head" }, [
      el("p", { className: "kicker" }, "Ambassador Program"),
      el("h2", {}, "Refer & Earn Real Cash"),
      el("p", { className: "lead dark" }, [
        "Earn ",
        el("b", {}, formatINR(site.commissionPerReferral)),
        " real cash for every player or squad who registers with your unique link."
      ]),
      el(
        "p",
        {},
        "Share your personalized referral code with your guild, WhatsApp gaming groups, and Instagram story. Track your referrals and receive direct UPI payouts!"
      )
    ]),
    createEarningsCalculator(site)
  ]);

  const refNameInput = el("input", {
    id: "refName",
    placeholder: "Enter your gamer tag to generate link",
    maxlength: "50",
    autocomplete: "name"
  });

  const genRefBtn = el("button", { className: "btn btn-glow", id: "genRef", type: "button" }, "Get My Referral Code");

  const refOut = el("div", { id: "refOut", className: "ref-out-box", hidden: true }, [
    el("div", { className: "code-header" }, [
      el("span", { className: "small" }, "Your Exclusive Referral Code:"),
      el("strong", { id: "myCode" })
    ]),
    el("p", { className: "linkline" }, el("code", { id: "myLink" })),
    el("div", { className: "ref-actions" }, [
      el("button", { className: "btn btn-small", id: "copyLink", type: "button" }, "📋 Copy Link"),
      el("a", {
        className: "btn btn-small btn-ghost",
        id: "shareWa",
        href: "#",
        target: "_blank",
        rel: "noopener noreferrer"
      }, "💬 Share on WhatsApp")
    ])
  ]);

  const refbox = el("div", { className: "refbox", dataset: { tilt: "true" } }, [
    el("h3", {}, "Generate Your Link"),
    el("p", { className: "small" }, "Generate your custom referral URL to invite friends and earn ₹50 per squad registration:"),
    el("label", {}, ["Your Name / Gamer Handle", refNameInput]),
    genRefBtn,
    refOut,
    el(
      "p",
      { className: "small" },
      "🛡️ Referral rewards are verified against completed registrations. Payouts processed directly to your UPI ID within 48h after the tournament."
    )
  ]);

  const wrap = el("div", { className: "wrap two" }, [leftCol, refbox]);

  return el("section", { className: "band alt", id: "refer" }, wrap);
}
