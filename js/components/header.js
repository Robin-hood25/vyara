import { el, formatINR } from "../utils/dom.js";

export function createHeader(site) {
  // Brand Logo with glowing esports gem & typography
  const brandLogo = el("div", { className: "brand-logo-mark" }, [
    el("span", { className: "brand-symbol" }, "◆"),
    el("span", { className: "brand-name" }, "VYRA"),
    el("span", { className: "brand-tag" }, "ESPORTS")
  ]);

  const brand = el("a", { className: "brand", href: "#top", "aria-label": "VYRA Esports Championship" }, brandLogo);

  const navLinks = [
    { href: "#event", label: "Overview" },
    { href: "#format", label: "Format & Scoring" },
    { href: "#prizes", label: "Prize Pool" },
    { href: "#rules", label: "Rules" },
    { href: "#my-tickets", label: "My Tickets" },
    { href: "#refer", label: "Refer & Earn" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Support" }
  ];

  const desktopNav = el("nav", { className: "nav-desktop", "aria-label": "Main" }, 
    navLinks.map(link => el("a", { href: link.href, className: "nav-link" }, link.label))
  );

  const registerBtn = el(
    "button",
    {
      className: "btn btn-nav btn-glow",
      type: "button",
      "data-action": "open-prebook",
      "aria-label": "Pre-Book Your Squad"
    },
    [
      el("span", { className: "btn-dot" }),
      "Pre-Book Your Squad"
    ]
  );

  // Mobile menu button
  const mobileToggle = el("button", {
    className: "mobile-toggle",
    "aria-label": "Toggle navigation menu",
    "aria-expanded": "false"
  }, [
    el("span", { className: "bar-line" }),
    el("span", { className: "bar-line" }),
    el("span", { className: "bar-line" })
  ]);

  // Mobile drawer overlay
  const mobileDrawer = el("div", { className: "mobile-drawer", id: "mobileDrawer" }, [
    el("div", { className: "mobile-drawer-header" }, [
      el("span", { className: "mobile-brand-name" }, "VYRA ESPORTS"),
      el("button", { className: "mobile-close-btn", "aria-label": "Close menu" }, "✕")
    ]),
    el("nav", { className: "mobile-nav-links" }, 
      navLinks.map(link => {
        const item = el("a", { href: link.href, className: "mobile-nav-link" }, link.label);
        item.addEventListener("click", () => {
          mobileDrawer.classList.remove("is-open");
          mobileToggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("nav-open");
        });
        return item;
      })
    ),
    el("div", { className: "mobile-drawer-footer" }, [
      el("button", {
        className: "btn btn-glow w-100",
        type: "button",
        "data-action": "open-prebook",
        on: {
          click: () => {
            mobileDrawer.classList.remove("is-open");
            mobileToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("nav-open");
          }
        }
      }, `Pre-Book Your Squad (${formatINR(site.entryFees?.squad || site.entryFee || 1200)})`),
      el("p", { className: "small text-center mt-2" }, site.tagline || "Drop in. Outlast everyone. Take home ₹10,000.")
    ])
  ]);

  // Handle mobile toggle interaction
  mobileToggle.addEventListener("click", () => {
    const isOpen = mobileDrawer.classList.toggle("is-open");
    mobileToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  const closeBtn = mobileDrawer.querySelector(".mobile-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      mobileDrawer.classList.remove("is-open");
      mobileToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  }

  // Scroll listener for sticky glass header styling
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      const headerEl = document.getElementById("top");
      if (headerEl) {
        if (window.scrollY > 40) {
          headerEl.classList.add("nav-scrolled");
        } else {
          headerEl.classList.remove("nav-scrolled");
        }
      }
    }, { passive: true });
  }

  return el("header", { className: "nav", id: "top" }, [
    brand,
    desktopNav,
    el("div", { className: "nav-actions" }, [registerBtn, mobileToggle]),
    mobileDrawer
  ]);
}
