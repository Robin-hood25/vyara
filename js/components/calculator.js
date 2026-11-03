import { el, formatINR } from "../utils/dom.js";

export function createEarningsCalculator(site) {
  const commission = site.commissionPerReferral || 50;

  const slider = el("input", {
    type: "range",
    id: "calcSlider",
    min: "1",
    max: "40",
    value: "10",
    className: "range-slider",
    "aria-label": "Referral count slider"
  });

  const countDisplay = el("span", { id: "calcCount", className: "calc-highlight" }, "10");
  const payoutDisplay = el("strong", { id: "calcPayout", className: "calc-payout" }, formatINR(10 * commission));
  const badgeDisplay = el("span", { id: "calcTier", className: "badge badge-amber" }, "Silver Scout");

  function getTier(count) {
    if (count >= 30) return { title: "Diamond Champion", cls: "badge-neon" };
    if (count >= 20) return { title: "Gold Ambassador", cls: "badge-flame" };
    if (count >= 10) return { title: "Silver Scout", cls: "badge-amber" };
    return { title: "Rookie Recruiter", cls: "badge-muted" };
  }

  slider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10) || 1;
    countDisplay.textContent = String(val);
    payoutDisplay.textContent = formatINR(val * commission);

    const tier = getTier(val);
    badgeDisplay.textContent = tier.title;
    badgeDisplay.className = `badge ${tier.cls}`;
  });

  const calcBox = el("div", { className: "calc-box", dataset: { tilt: "true" } }, [
    el("div", { className: "calc-header" }, [
      el("div", {}, [
        el("h3", {}, "Calculate Your Referral Cashout"),
        el("p", { className: "small" }, "Direct cash rewards for inviting players and squads")
      ]),
      badgeDisplay
    ]),
    el("p", { className: "small" }, [
      "Move the slider to see your guaranteed cash earnings at ",
      el("b", {}, formatINR(commission)),
      " per verified squad registration:"
    ]),
    el("div", { className: "slider-wrap" }, [
      el("div", { className: "slider-labels" }, [
        el("span", {}, "Squads Invited:"),
        countDisplay
      ]),
      slider,
      el("div", { className: "slider-ticks" }, [
        el("span", {}, "1"),
        el("span", {}, "10"),
        el("span", {}, "20"),
        el("span", {}, "30"),
        el("span", {}, "40+")
      ])
    ]),
    el("div", { className: "calc-result" }, [
      el("div", {}, [
        el("span", { className: "result-label" }, "Your Direct UPI Payout"),
        payoutDisplay
      ]),
      el("a", { className: "btn btn-small btn-glow", href: "#refer" }, "Get My Code Now")
    ])
  ]);

  return calcBox;
}
