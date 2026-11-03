/**
 * VYRA ESPORTS — Cinematic Scroll-Driven Bullet Impact Holes
 *
 * Core Behaviors:
 * 1. Appears strictly AFTER hero background video / hero section ends.
 * 2. Completely invisible inside the hero section.
 * 3. As user scrolls down, new bullet holes appear progressively along an irregular path.
 * 4. Scrolling upward removes bullet holes in reverse order.
 * 5. Stationary when scrolling stops (zero timers, zero loops, zero random regeneration).
 * 6. Placed above background surfaces but behind all foreground content (z-index: 4).
 * 7. Never obscures text, cards, buttons, or interactive elements.
 * 8. Respects reduced-motion preferences.
 */

import { el } from "../utils/dom.js";

/**
 * High-detail realistic ballistic impact SVG templates
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
      <path d="M 23 23 Q 32 19 41 22" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-linecap="round" />
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
 * Predefined deterministic bullet impact marks across sub-hero background regions
 */
export const BULLET_IMPACTS = [
  // 1. Immediately visible right below hero in left background corridor
  { id: "impact-1", topVh: 22, leftVw: 5.5, side: "left", variant: 1, rot: -15, scale: 1.0, threshold: 0.00 },
  // 2. Upper-right corridor as user scrolls into Tournament Overview
  { id: "impact-2", topVh: 32, leftVw: 92.5, side: "right", variant: 2, rot: 28, scale: 1.05, threshold: 0.05 },
  // 3. Mid-left margin
  { id: "impact-3", topVh: 42, leftVw: 7.2, side: "left", variant: 3, rot: -42, scale: 0.95, threshold: 0.11 },
  // 4. Upper-right corridor of Format & Rules
  { id: "impact-4", topVh: 52, leftVw: 91.0, side: "right", variant: 1, rot: 12, scale: 1.02, threshold: 0.18 },
  // 5. Lower-left margin
  { id: "impact-5", topVh: 62, leftVw: 5.0, side: "left", variant: 2, rot: 55, scale: 0.96, threshold: 0.25 },
  // 6. Lower-right margin
  { id: "impact-6", topVh: 72, leftVw: 93.5, side: "right", variant: 3, rot: -8, scale: 1.06, threshold: 0.32 },
  // 7. Middle section left corridor (Prize Pool)
  { id: "impact-7", topVh: 28, leftVw: 8.0, side: "left", variant: 1, rot: 34, scale: 0.98, threshold: 0.39 },
  // 8. Middle section right corridor (Prize Pool)
  { id: "impact-8", topVh: 38, leftVw: 89.5, side: "right", variant: 2, rot: -25, scale: 1.04, threshold: 0.46 },
  // 9. Rules section left margin
  { id: "impact-9", topVh: 48, leftVw: 6.2, side: "left", variant: 3, rot: 18, scale: 0.96, threshold: 0.53 },
  // 10. Rules section right margin
  { id: "impact-10", topVh: 58, leftVw: 92.0, side: "right", variant: 1, rot: -60, scale: 1.02, threshold: 0.60 },
  // 11. My Tickets section left margin
  { id: "impact-11", topVh: 68, leftVw: 7.5, side: "left", variant: 2, rot: 40, scale: 1.00, threshold: 0.67 },
  // 12. My Tickets section right margin
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
 * Creates the persistent bullet holes stage and viewport
 */
export function createScrollBulletsElement() {
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
    const itemEl = el("div", {
      className: `bullet-impact-item bullet-side-${item.side}`,
      id: item.id,
      style: `top: ${item.topVh}vh; left: ${item.leftVw}vw; --rot: ${item.rot}deg; --scale: ${item.scale};`
    }, [
      createBulletSvg(item.variant)
    ]);

    viewport.appendChild(itemEl);
    impactNodes.push({
      id: item.id,
      threshold: item.threshold,
      el: itemEl,
      active: false
    });
  }

  stage.appendChild(viewport);
  return { stage, viewport, impactNodes };
}

/**
 * Initializes the scroll-driven bullet impact system
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
  } else {
    // Collect existing nodes if already mounted
    impactNodes = BULLET_IMPACTS.map((item) => ({
      id: item.id,
      threshold: item.threshold,
      el: document.getElementById(item.id),
      active: false
    })).filter(n => n.el !== null);
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

  function update() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const hero = document.getElementById("hero");
    
    // Live detection: While hero is visible in viewport, NO bullet holes are shown
    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const isHeroVisible = heroRect ? heroRect.bottom > 0 : (scrollY <= heroBottom);

    if (isHeroVisible) {
      viewport.style.opacity = "0";
      viewport.style.visibility = "hidden";
      for (let i = 0; i < impactNodes.length; i++) {
        const node = impactNodes[i];
        if (node.active) {
          node.active = false;
          node.el.classList.remove("is-impacted");
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

    // Reveal impacts in sequence, and remove in reverse order when scrolling up
    for (let i = 0; i < impactNodes.length; i++) {
      const node = impactNodes[i];
      if (progress >= node.threshold) {
        if (!node.active) {
          node.active = true;
          node.el.classList.add("is-impacted");
        }
      } else {
        if (node.active) {
          node.active = false;
          node.el.classList.remove("is-impacted");
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
