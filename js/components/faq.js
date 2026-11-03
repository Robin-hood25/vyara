import { el } from "../utils/dom.js";

export function createFaqSection() {
  const faqs = [
    {
      q: "Who can participate in this championship?",
      a: "Any player with a valid Free Fire / Free Fire MAX account (UID level 20+) is eligible. Both casual and competitive squads are welcome."
    },
    {
      q: "Are PC emulators or iPad/tablets allowed?",
      a: "Strictly mobile phones only! Emulators, scripts, keyboard/mouse attachments, and rooted device hacks are instantly detected and result in permanent disqualification without refund."
    },
    {
      q: "How will I receive the custom Room ID and Password?",
      a: "Room credentials are sent directly to your registered WhatsApp number exactly 15 minutes prior to match schedule. Ensure your WhatsApp number is accurate."
    },
    {
      q: "What are the entry fees and slot availability for this tournament?",
      a: "Solo Entry (₹350) is officially SOLD OUT and closed to new registrations. Squad Entry (1 Squad: ₹1,200) remains OPEN with active slot reservations. Payment is verified securely via UPI."
    },
    {
      q: "Can I still register for Solo Entry?",
      a: "No. All Solo Entry player slots for this championship have been completely filled and are permanently marked SOLD OUT. Only full squad entries (4 players) are currently accepted."
    },
    {
      q: "When and how are cash prizes paid out?",
      a: "All cash prizes (1st Place ₹10,000, 2nd Place ₹5,000, and ₹10,000 Lucky Pool for eligible pre-bookings) and referral payouts are transferred directly via UPI within 48 hours after match verification."
    },
    {
      q: "What is the guaranteed participant gift?",
      a: "Every registered squad that completes their match receives an official digital certificate of participation and priority entry tokens for future private scrimmage lobbies."
    },
    {
      q: "What happens if a squad member gets disconnected?",
      a: "Once the custom room countdown starts in-game, the match cannot be paused. We recommend playing on high-speed 4G/5G or stable Wi-Fi."
    }
  ];

  const items = faqs.map((item, index) => {
    const questionBtn = el(
      "button",
      {
        className: "faq-question",
        "aria-expanded": "false",
        "aria-controls": `faq-ans-${index}`
      },
      [
        el("span", { className: "faq-q-text" }, item.q),
        el("span", { className: "faq-icon" }, "+")
      ]
    );

    const answer = el(
      "div",
      {
        id: `faq-ans-${index}`,
        className: "faq-answer",
        hidden: true
      },
      el("p", {}, item.a)
    );

    questionBtn.addEventListener("click", () => {
      const isExpanded = questionBtn.getAttribute("aria-expanded") === "true";
      questionBtn.setAttribute("aria-expanded", String(!isExpanded));
      questionBtn.querySelector(".faq-icon").textContent = isExpanded ? "+" : "−";
      answer.hidden = isExpanded;
      answer.classList.toggle("faq-open", !isExpanded);
    });

    return el("div", { className: "faq-item" }, [questionBtn, answer]);
  });

  const wrap = el("div", { className: "wrap" }, [
    el("div", { className: "section-head" }, [
      el("p", { className: "kicker" }, "Got Questions?"),
      el("h2", {}, "Frequently Asked Questions"),
      el("p", { className: "sub" }, "Everything you need to know about match rules, payments, and scoring.")
    ]),
    el("div", { className: "faq-list" }, items)
  ]);

  return el("section", { className: "band alt", id: "faq" }, wrap);
}
