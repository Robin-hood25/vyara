/**
 * VYRA ESPORTS — Realistic Bullet Impact Sparks + Bullet Holes
 *
 * Exact Two-Stage Animation Sequence (Scroll-Driven):
 *   Stage 1 — Sparks:
 *     As user reaches an impact threshold, show a brief burst of realistic metallic
 *     impact sparks (varied trajectories, lengths, brightness; warm white, pale yellow,
 *     amber-orange highlights) plus a sharp, tiny central impact flash.
 *   Stage 2 — Bullet Hole:
 *     Immediately as sparks spread and fade, the realistic bullet hole appears at the
 *     exact same impact point and remains permanently visible.
 *
 * Strict Scroll Synchronization:
 *   - 100% deterministic mapping from scroll progress.
 *   - Zero autonomous timers, idle animation loops, or random regeneration.
 *   - Scrolling down reveals sparks then hole; scrolling up reverses the sequence.
 *   - Stopping freezes the animation at the exact current frame.
 *   - Completely invisible inside the hero section; activates only after hero bottom.
 *   - Layered above dark background but behind all interactive content (z-index: 4).
 *   - Respects prefers-reduced-motion.
 */

import { el } from "../utils/dom.js";

/**
 * Predefined deterministic bullet impact marks across sub-hero background corridors.
 * All positions are kept in safe background gutters (far-left 5-8vw, far-right 89-94vw)
 * so they never collide with foreground cards or text.
 */
export const BULLET_IMPACTS = [
  // 1. Immediately below hero in left corridor
  { id: "impact-1", topVh: 22, leftVw: 5.5, side: "left", variant: 1, rot: -15, scale: 1.0, threshold: 0.00 },
  // 2. Upper-right corridor of Tournament Overview
  { id: "impact-2", topVh: 32, leftVw: 92.5, side: "right", variant: 2, rot: 28, scale: 1.05, threshold: 0.05 },
  // 3. Mid-left margin
  { id: "impact-3", topVh: 42, leftVw: 7.2, side: "left", variant: 3, rot: -42, scale: 0.95, threshold: 0.11 },
  // 4. Upper-right corridor of Format & Rules
  { id: "impact-4", topVh: 52, leftVw: 91.0, side: "right", variant: 1, rot: 12, scale: 1.02, threshold: 0.18 },
  // 5. Lower-left margin
  { id: "impact-5", topVh: 62, leftVw: 5.0, side: "left", variant: 2, rot: 55, scale: 0.96, threshold: 0.25 },
  // 6. Lower-right margin
  { id: "impact-6", topVh: 72, leftVw: 93.5, side: "right", variant: 3, rot: -8, scale: 1.06, threshold: 0.32 },
  // 7. Prize Pool left corridor
  { id: "impact-7", topVh: 28, leftVw: 8.0, side: "left", variant: 1, rot: 34, scale: 0.98, threshold: 0.39 },
  // 8. Prize Pool right corridor
  { id: "impact-8", topVh: 38, leftVw: 89.5, side: "right", variant: 2, rot: -25, scale: 1.04, threshold: 0.46 },
  // 9. Rules section left margin
  { id: "impact-9", topVh: 48, leftVw: 6.2, side: "left", variant: 3, rot: 18, scale: 0.96, threshold: 0.53 },
  // 10. Rules section right margin
  { id: "impact-10", topVh: 58, leftVw: 92.0, side: "right", variant: 1, rot: -60, scale: 1.02, threshold: 0.60 },
  // 11. My Tickets left corridor
  { id: "impact-11", topVh: 68, leftVw: 7.5, side: "left", variant: 2, rot: 40, scale: 1.00, threshold: 0.67 },
  // 12. My Tickets right corridor
  { id: "impact-12", topVh: 78, leftVw: 90.0, side: "right", variant: 3, rot: -10, scale: 1.05, threshold: 0.74 },
  // 13. Refer & Earn left corridor
  { id: "impact-13", topVh: 34, leftVw: 5.2, side: "left", variant: 1, rot: -32, scale: 0.94, threshold: 0.80 },
  // 14. Refer & Earn right corridor
  { id: "impact-14", topVh: 46, leftVw: 93.0, side: "right", variant: 2, rot: 22, scale: 1.08, threshold: 0.86 },
  // 15. FAQ & Contact left corridor
  { id: "impact-15", topVh: 64, leftVw: 8.2, side: "left", variant: 3, rot: -15, scale: 0.98, threshold: 0.91 },
  // 16. FAQ & Contact right corridor
  { id: "impact-16", topVh: 76, leftVw: 91.5, side: "right", variant: 1, rot: 48, scale: 1.02, threshold: 0.96 }
];

/**
 * Deterministic metallic ballistic spark definitions
 * Fast ricochet angles, varied lengths, and authentic incandescent colors.
 */
function getDeterministicSparks(variant, rot, isMobile = false) {
  const base = [
    { a: 18,  d: 38, l: 12, w: 1.6, c: "#FFFFFF" },
    { a: 52,  d: 46, l: 15, w: 1.5, c: "#FFF8DC" },
    { a: 86,  d: 30, l: 9,  w: 1.2, c: "#FFD166" },
    { a: 128, d: 44, l: 13, w: 1.7, c: "#FF9F1C" },
    { a: 164, d: 26, l: 8,  w: 1.1, c: "#FFF3B0" },
    { a: 202, d: 42, l: 14, w: 1.4, c: "#FFFFFF" },
    { a: 242, d: 48, l: 16, w: 1.8, c: "#FFF4CC" },
    { a: 282, d: 32, l: 10, w: 1.3, c: "#FFB703" },
    { a: 316, d: 45, l: 15, w: 1.6, c: "#FF9F1C" },
    { a: 348, d: 36, l: 11, w: 1.4, c: "#FFFFFF" },
    { a: 72,  d: 22, l: 7,  w: 1.0, c: "#FFD166" },
    { a: 224, d: 25, l: 8,  w: 1.1, c: "#FFE899" }
  ];

  // Mobile optimization: 8 particles instead of 12 for high performance
  const list = isMobile ? base.slice(0, 8) : base;

  const angleOffset = (rot * 1.5 + variant * 36) % 360;
  return list.map((s) => ({
    angle: (s.a + angleOffset) % 360,
    maxDist: s.d * (variant === 2 ? 1.08 : variant === 3 ? 0.94 : 1.0),
    len: s.l,
    width: s.w,
    color: s.c
  }));
}

/**
 * Creates the high-speed spark burst SVG (Stage 1)
 */
function createSparksSvg(id, variant, rot, isMobile) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-60 -60 120 120");
  svg.setAttribute("class", "bullet-sparks-svg");
  svg.setAttribute("aria-hidden", "true");

  const flashGradId = `sparkFlash_${id}`;
  const ambientGradId = `sparkAmbient_${id}`;

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <radialGradient id="${flashGradId}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="#FFF3B0" />
      <stop offset="70%" stop-color="#FF9F1C" />
      <stop offset="100%" stop-color="rgba(255, 48, 59, 0)" />
    </radialGradient>
    <radialGradient id="${ambientGradId}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255, 235, 170, 0.45)" />
      <stop offset="40%" stop-color="rgba(255, 160, 40, 0.25)" />
      <stop offset="100%" stop-color="rgba(255, 48, 59, 0)" />
    </radialGradient>
  `;
  svg.appendChild(defs);

  // Subtle ambient surface illumination on impact
  const ambientEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ambientEl.setAttribute("class", "spark-ambient");
  ambientEl.setAttribute("cx", "0");
  ambientEl.setAttribute("cy", "0");
  ambientEl.setAttribute("r", "28");
  ambientEl.setAttribute("fill", `url(#${ambientGradId})`);
  ambientEl.setAttribute("opacity", "0");
  svg.appendChild(ambientEl);

  // Spark streaks container
  const streaksGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  streaksGroup.setAttribute("class", "spark-streaks-group");

  const sparkDefs = getDeterministicSparks(variant, rot, isMobile);
  const sparkLines = [];

  for (const def of sparkDefs) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "0");
    line.setAttribute("stroke", def.color);
    line.setAttribute("stroke-width", String(def.width));
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("opacity", "0");
    streaksGroup.appendChild(line);
    sparkLines.push({ line, def });
  }

  svg.appendChild(streaksGroup);

  // Tiny, sharp central impact flash
  const flashEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  flashEl.setAttribute("class", "spark-flash-core");
  flashEl.setAttribute("cx", "0");
  flashEl.setAttribute("cy", "0");
  flashEl.setAttribute("r", "5.5");
  flashEl.setAttribute("fill", `url(#${flashGradId})`);
  flashEl.setAttribute("opacity", "0");
  svg.appendChild(flashEl);

  return { svg, ambientEl, flashEl, sparkLines, sparkDefs };
}

/**
 * Creates the high-detail realistic ballistic impact bullet hole SVG (Stage 2)
 */
function createBulletSvg(variant = 1) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("class", "bullet-impact-svg");
  svg.setAttribute("aria-hidden", "true");

  if (variant === 1) {
    svg.innerHTML = `
      <defs>
        <radialGradient id="scorchGlow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#020305" stop-opacity="0.95" />
          <stop offset="35%" stop-color="#080A0F" stop-opacity="0.75" />
          <stop offset="70%" stop-color="#141923" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#080A0F" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="craterBevel1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4B5563" />
          <stop offset="30%" stop-color="#1F2937" />
          <stop offset="70%" stop-color="#111827" />
          <stop offset="100%" stop-color="#05070A" />
        </linearGradient>
        <radialGradient id="holeDepth1" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#000000" />
          <stop offset="75%" stop-color="#030406" />
          <stop offset="100%" stop-color="#0D1117" />
        </radialGradient>
      </defs>
      <!-- Powder burn / scorch halo -->
      <circle cx="32" cy="32" r="30" fill="url(#scorchGlow1)" />
      <!-- Stress fracture cracks -->
      <path d="M 32 14 L 30 8 M 46 22 L 54 18 M 48 38 L 57 44 M 34 50 L 36 58 M 18 44 L 10 50 M 14 26 L 6 22" stroke="#2D3748" stroke-width="1.3" stroke-linecap="round" opacity="0.85" />
      <path d="M 31 16 L 33 22 M 43 25 L 39 30 M 44 37 L 39 35 M 29 46 L 31 40 M 20 41 L 26 36 M 18 27 L 24 30" stroke="#145CFF" stroke-width="0.8" opacity="0.3" />
      <!-- Chipped crater rim bevel -->
      <polygon points="32,18 39,20 45,25 47,33 44,41 37,46 28,47 21,43 17,35 18,27 24,20" fill="url(#craterBevel1)" stroke="#374151" stroke-width="1.2" />
      <!-- Deep central entry puncture -->
      <polygon points="32,23 37,25 40,29 41,34 38,39 33,41 27,41 23,37 22,32 25,26" fill="url(#holeDepth1)" stroke="#000000" stroke-width="1" />
      <!-- Specular rim highlight on top-left edge -->
      <path d="M 23 23 Q 32 19 41 22" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-linecap="round" />
    `;
  } else if (variant === 2) {
    svg.innerHTML = `
      <defs>
        <radialGradient id="scorchGlow2" cx="52%" cy="48%" r="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.95" />
          <stop offset="40%" stop-color="#0E1219" stop-opacity="0.8" />
          <stop offset="75%" stop-color="#141923" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#080A0F" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="craterBevel2" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="#6B7280" />
          <stop offset="40%" stop-color="#374151" />
          <stop offset="85%" stop-color="#111827" />
          <stop offset="100%" stop-color="#05070A" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#scorchGlow2)" />
      <!-- Radiating impact fractures -->
      <path d="M 33 12 L 35 6 M 48 18 L 56 14 M 52 35 L 60 38 M 45 49 L 52 56 M 30 52 L 28 60 M 16 47 L 8 52 M 12 33 L 4 32 M 16 19 L 9 14" stroke="#374151" stroke-width="1.4" stroke-linecap="round" opacity="0.85" />
      <!-- Asymmetric chipped crater -->
      <polygon points="31,16 41,19 47,27 48,36 43,45 34,48 24,47 17,40 16,30 22,20" fill="url(#craterBevel2)" stroke="#4B5563" stroke-width="1" />
      <!-- Core entry cavity -->
      <ellipse cx="32" cy="33" rx="9" ry="9.5" fill="#020304" stroke="#000000" stroke-width="1.2" />
      <!-- Micro metal burr/chipping highlight -->
      <path d="M 20 23 Q 29 17 40 21" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.1" stroke-linecap="round" />
      <circle cx="48" cy="24" r="1.5" fill="#4B5563" opacity="0.9" />
      <circle cx="16" cy="42" r="1.2" fill="#374151" opacity="0.85" />
    `;
  } else {
    svg.innerHTML = `
      <defs>
        <radialGradient id="scorchGlow3" cx="48%" cy="52%" r="50%">
          <stop offset="0%" stop-color="#020305" stop-opacity="0.9" />
          <stop offset="35%" stop-color="#0A0D13" stop-opacity="0.7" />
          <stop offset="70%" stop-color="#141923" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#080A0F" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="craterBevel3" x1="0%" y1="20%" x2="100%" y2="80%">
          <stop offset="0%" stop-color="#4B5563" />
          <stop offset="50%" stop-color="#1F2937" />
          <stop offset="100%" stop-color="#080A0F" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#scorchGlow3)" />
      <!-- Jagged stress lines -->
      <path d="M 28 15 L 26 8 M 45 17 L 53 12 M 50 32 L 58 33 M 43 47 L 50 54 M 27 49 L 24 57 M 15 40 L 7 43 M 17 24 L 11 18" stroke="#2D3748" stroke-width="1.2" stroke-linecap="round" opacity="0.75" />
      <!-- Elongated entry crater -->
      <polygon points="30,19 38,21 44,28 45,36 40,43 32,45 23,44 19,37 20,28 24,21" fill="url(#craterBevel3)" stroke="#374151" stroke-width="1.1" />
      <ellipse cx="32" cy="32" rx="8" ry="7.5" fill="#000000" stroke="#080A0F" stroke-width="1" />
      <!-- Rim highlight -->
      <path d="M 22 24 Q 31 20 40 23" fill="none" stroke="rgba(255,255,255,0.32)" stroke-width="1" stroke-linecap="round" />
    `;
  }

  return svg;
}

/**
 * Creates the persistent scroll bullet container and all node references
 */
export function createScrollBulletsElement() {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  const stage = el("div", {
    className: "scroll-bullets-stage",
    id: "scrollBulletsStage",
    "aria-hidden": "true"
  });

  const viewport = el("div", {
    className: "scroll-bullets-viewport",
    id: "scrollBulletsViewport",
    "aria-hidden": "true"
  });

  const impactNodes = [];

  for (const item of BULLET_IMPACTS) {
    const sparksData = createSparksSvg(item.id, item.variant, item.rot, isMobile);

    const holeWrapper = el("div", {
      className: "bullet-hole-wrapper",
      style: `transform: translate(-50%, -50%) rotate(${item.rot}deg) scale(0.4); opacity: 0; visibility: hidden;`
    }, [
      createBulletSvg(item.variant)
    ]);

    const impactContainer = el("div", { className: "bullet-impact-container" }, [
      sparksData.svg,
      holeWrapper
    ]);

    const itemEl = el("div", {
      className: `bullet-impact-item bullet-side-${item.side}`,
      id: item.id,
      style: `top: ${item.topVh}vh; left: ${item.leftVw}vw; --rot: ${item.rot}deg; --scale: ${item.scale}; visibility: hidden;`
    }, [
      impactContainer
    ]);

    viewport.appendChild(itemEl);

    impactNodes.push({
      id: item.id,
      threshold: item.threshold,
      variant: item.variant,
      rot: item.rot,
      scale: item.scale,
      itemEl,
      sparksSvg: sparksData.svg,
      ambientEl: sparksData.ambientEl,
      flashEl: sparksData.flashEl,
      sparkLines: sparksData.sparkLines,
      holeWrapper,
      active: false,
      completed: false
    });
  }

  stage.appendChild(viewport);
  return { stage, viewport, impactNodes };
}

/**
 * Short scroll-progress span for the two-stage impact event
 * ~2.6% of available sub-hero scroll per bullet impact.
 */
const IMPACT_SPAN = 0.026;

/**
 * Initializes the scroll-driven realistic bullet impact system
 */
export function initScrollBullets() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  let stage = document.getElementById("scrollBulletsStage");
  let viewport = document.getElementById("scrollBulletsViewport");
  let impactNodes = [];

  if (!viewport || !stage) {
    const created = createScrollBulletsElement();
    stage = created.stage;
    viewport = created.viewport;
    impactNodes = created.impactNodes;

    const subHeroZone = document.getElementById("subHeroZone");
    if (subHeroZone) {
      subHeroZone.prepend(stage);
    } else {
      document.body.appendChild(stage);
    }
  }

  let ticking = false;
  let heroBottom = 0;
  let maxScroll = 0;

  function measureDimensions() {
    const hero = document.getElementById("hero");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      heroBottom = rect.top + scrollY + hero.offsetHeight;
    } else {
      heroBottom = window.innerHeight;
    }

    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    maxScroll = Math.max(1, docHeight - window.innerHeight);
  }

  /**
   * Deterministic scroll evaluation function.
   * Completely maps scrollY to visual state with zero wall-clock dependencies.
   */
  function update() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const hero = document.getElementById("hero");

    // Dynamic hero boundary check:
    // While hero is visible in the viewport, NO sparks or bullet holes appear.
    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const isHeroVisible = heroRect ? heroRect.bottom > 0 : (scrollY <= heroBottom);

    if (isHeroVisible) {
      viewport.style.opacity = "0";
      viewport.style.visibility = "hidden";

      for (let i = 0; i < impactNodes.length; i++) {
        const node = impactNodes[i];
        if (node.active || node.completed) {
          node.active = false;
          node.completed = false;
          node.itemEl.style.visibility = "hidden";
          node.sparksSvg.style.opacity = "0";
          node.ambientEl.setAttribute("opacity", "0");
          node.flashEl.setAttribute("opacity", "0");
          node.holeWrapper.style.visibility = "hidden";
          node.holeWrapper.style.opacity = "0";
          node.holeWrapper.style.transform = `translate(-50%, -50%) rotate(${node.rot}deg) scale(0.4)`;
        }
      }
      ticking = false;
      return;
    }

    // Beyond hero: reveal viewport
    viewport.style.visibility = "visible";
    viewport.style.opacity = "1";

    const availableScroll = Math.max(1, maxScroll - heroBottom);
    const scrollBeyondHero = Math.max(0, scrollY - heroBottom);
    const progress = Math.max(0, Math.min(1, scrollBeyondHero / availableScroll));

    // Evaluate each impact deterministically
    for (let i = 0; i < impactNodes.length; i++) {
      const node = impactNodes[i];
      const localProgress = (progress - node.threshold) / IMPACT_SPAN;

      if (localProgress < 0) {
        // --- Inactive (not reached yet or scrolled back above threshold) ---
        if (node.active || node.completed) {
          node.active = false;
          node.completed = false;
          node.itemEl.style.visibility = "hidden";
          node.sparksSvg.style.opacity = "0";
          node.ambientEl.setAttribute("opacity", "0");
          node.flashEl.setAttribute("opacity", "0");
          node.holeWrapper.style.visibility = "hidden";
          node.holeWrapper.style.opacity = "0";
          node.holeWrapper.style.transform = `translate(-50%, -50%) rotate(${node.rot}deg) scale(0.4)`;
        }
      } else if (localProgress < 1.0) {
        // --- Active Transition (Stage 1 Sparks Burst -> Stage 2 Bullet Hole) ---
        node.active = true;
        node.completed = false;
        node.itemEl.style.visibility = "visible";

        // 1. Central Impact Flash & Ambient Glow (Active only in initial fraction: 0.0 to 0.3)
        if (localProgress <= 0.30) {
          const flashIn = Math.min(1, localProgress / 0.07);
          const flashOut = Math.max(0, 1 - (localProgress - 0.07) / 0.23);
          const flashOpacity = (flashIn * flashOut).toFixed(3);
          node.flashEl.setAttribute("opacity", flashOpacity);
          node.ambientEl.setAttribute("opacity", (flashOpacity * 0.7).toFixed(3));
        } else {
          node.flashEl.setAttribute("opacity", "0");
          node.ambientEl.setAttribute("opacity", "0");
        }

        // 2. High-Speed Metallic Spark Streaks (Active 0.0 to 0.85)
        if (localProgress <= 0.85) {
          node.sparksSvg.style.opacity = "1";
          const sp = Math.min(1, localProgress / 0.82);

          // Ballistic expansion (fast launch, gradual air-friction deceleration)
          const travel = 1 - Math.pow(1 - sp, 2.4);

          // Fast ignition then cooling dissipation
          const sparkIn = Math.min(1, sp / 0.12);
          const sparkOut = Math.max(0, 1 - Math.max(0, sp - 0.42) / 0.58);
          const sparkOpacity = (sparkIn * sparkOut).toFixed(3);

          for (let j = 0; j < node.sparkLines.length; j++) {
            const item = node.sparkLines[j];
            const def = item.def;
            const r = def.maxDist * travel;
            const streakLen = def.len * Math.min(1, sp * 2.2) * (1 - sp * 0.35);
            const tailR = Math.max(0, r - streakLen);
            const rad = (def.angle * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            item.line.setAttribute("x1", (tailR * cos).toFixed(1));
            item.line.setAttribute("y1", (tailR * sin).toFixed(1));
            item.line.setAttribute("x2", (r * cos).toFixed(1));
            item.line.setAttribute("y2", (r * sin).toFixed(1));
            item.line.setAttribute("opacity", sparkOpacity);
          }
        } else {
          node.sparksSvg.style.opacity = "0";
        }

        // 3. Bullet Hole Emergence at exact impact origin (Reveals 0.35 to 0.75)
        if (localProgress >= 0.35) {
          node.holeWrapper.style.visibility = "visible";
          const hp = Math.min(1, (localProgress - 0.35) / 0.40);
          const holeScale = (0.55 + 0.45 * Math.sin(hp * Math.PI / 2)).toFixed(3);
          const holeOpacity = hp.toFixed(3);
          node.holeWrapper.style.opacity = holeOpacity;
          node.holeWrapper.style.transform = `translate(-50%, -50%) rotate(${node.rot}deg) scale(${holeScale})`;
        } else {
          node.holeWrapper.style.visibility = "hidden";
          node.holeWrapper.style.opacity = "0";
          node.holeWrapper.style.transform = `translate(-50%, -50%) rotate(${node.rot}deg) scale(0.4)`;
        }
      } else {
        // --- Completed (localProgress >= 1.0): Sparks Faded, Bullet Hole Permanently Remains ---
        if (!node.completed) {
          node.completed = true;
          node.active = false;
          node.itemEl.style.visibility = "visible";
          // Sparks and flash completely removed (zero continuous glow)
          node.sparksSvg.style.opacity = "0";
          node.ambientEl.setAttribute("opacity", "0");
          node.flashEl.setAttribute("opacity", "0");
          // Bullet hole permanently crisp and visible at exact impact point
          node.holeWrapper.style.visibility = "visible";
          node.holeWrapper.style.opacity = "1";
          node.holeWrapper.style.transform = `translate(-50%, -50%) rotate(${node.rot}deg) scale(1)`;
        }
      }
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  function onResize() {
    measureDimensions();
    onScroll();
  }

  measureDimensions();
  update();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("load", () => {
    measureDimensions();
    update();
  }, { once: true });
}
