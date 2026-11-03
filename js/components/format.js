import { el } from "../utils/dom.js";

export function createFormatSection() {
  // 3-Stage Tournament Roadmap
  const stages = [
    {
      num: "01",
      title: "Qualifiers",
      desc: "48 Squads divided into 4 intense groups of 12. Top 6 squads from each group advance.",
      badge: "Group Stage"
    },
    {
      num: "02",
      title: "Semi-Finals",
      desc: "24 surviving squads clash across 2 brackets. The best 12 secure their ticket to Grand Finals.",
      badge: "High Stakes"
    },
    {
      num: "03",
      title: "Grand Finals",
      desc: "Top 12 squads battle over 3 back-to-back maps (Bermuda, Purgatory, Kalahari) for 1st Place (₹10,000) and 2nd Place (₹5,000).",
      badge: "Championship"
    }
  ];

  const stageCards = stages.map((s) =>
    el("div", { className: "roadmap-card", dataset: { tilt: "true" } }, [
      el("div", { className: "roadmap-header" }, [
        el("span", { className: "roadmap-num" }, s.num),
        el("span", { className: "badge badge-neon" }, s.badge)
      ]),
      el("h3", {}, s.title),
      el("p", { className: "roadmap-desc" }, s.desc)
    ])
  );

  const roadmapGrid = el("div", { className: "roadmap-grid" }, stageCards);

  // Scoring Points Matrix
  const pointsData = [
    { rank: "1st (Booyah!)", points: "12 Pts" },
    { rank: "2nd Place", points: "9 Pts" },
    { rank: "3rd Place", points: "8 Pts" },
    { rank: "4th Place", points: "7 Pts" },
    { rank: "5th Place", points: "6 Pts" },
    { rank: "Kill Point", points: "1 Pt per kill" }
  ];

  const tableRows = pointsData.map((p) =>
    el("div", { className: "point-row" }, [
      el("span", { className: "point-rank" }, p.rank),
      el("span", { className: "point-badge" }, p.points)
    ])
  );

  const scoringCard = el("div", { className: "scoring-card", dataset: { tilt: "true" } }, [
    el("div", { className: "scoring-header" }, [
      el("div", {}, [
        el("h3", {}, "Official Scoring Matrix"),
        el("p", { className: "small" }, "Standard Esports Guidelines")
      ]),
      el("span", { className: "badge badge-flame" }, "OFFICIAL ESPORTS RULES")
    ]),
    el("div", { className: "point-grid" }, tableRows)
  ]);

  const wrap = el("div", { className: "wrap" }, [
    el("div", { className: "section-head text-center-mobile" }, [
      el("p", { className: "kicker" }, "Roadmap & Structure"),
      el("h2", {}, "Tournament Format"),
      el("p", { className: "sub" }, "Fair, competitive, and verified point system across all match lobbies.")
    ]),
    roadmapGrid,
    scoringCard
  ]);

  return el("section", { className: "band", id: "format" }, wrap);
}
