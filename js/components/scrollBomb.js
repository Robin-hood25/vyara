/**
 * VYRA ESPORTS — 100% Scroll-Driven Tactical Bomb Motion
 *
 * Requirements:
 * 1. Scroll controls all movement. No automatic floating, drifting, bobbing, rotation, or idle loops.
 * 2. When user stops scrolling, the bomb stops completely and remains perfectly still.
 * 3. Invisible throughout the hero section. Activates smoothly after scrolling past the hero.
 * 4. Deterministic predefined waypoint trajectory across the page.
 * 5. Positioned above background but behind foreground cards (pointer-events: none, z-index: 1).
 * 6. Respects reduced-motion preferences.
 */

import { el } from "../utils/dom.js";

/**
 * Creates the high-detail tactical bomb SVG with transparent background
 */
function createTacticalBombSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 240 240");
  svg.setAttribute("class", "tactical-bomb-svg");
  svg.setAttribute("aria-hidden", "true");

  svg.innerHTML = `
    <defs>
      <!-- Metallic gradients -->
      <linearGradient id="bombBodyMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2D3748" />
        <stop offset="40%" stop-color="#1A202C" />
        <stop offset="85%" stop-color="#0F131A" />
        <stop offset="100%" stop-color="#080A0F" />
      </linearGradient>

      <linearGradient id="bombPanelSteel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A5568" />
        <stop offset="50%" stop-color="#2D3748" />
        <stop offset="100%" stop-color="#171923" />
      </linearGradient>

      <linearGradient id="wireBlue" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#145CFF" />
        <stop offset="100%" stop-color="#00D2FF" />
      </linearGradient>

      <linearGradient id="wireRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FF303B" />
        <stop offset="100%" stop-color="#FF7B00" />
      </linearGradient>

      <radialGradient id="ledGlowBlue" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#00D2FF" />
        <stop offset="50%" stop-color="#145CFF" />
        <stop offset="100%" stop-color="rgba(20, 92, 255, 0)" />
      </radialGradient>

      <radialGradient id="ledGlowRed" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FF303B" />
        <stop offset="60%" stop-color="rgba(255, 48, 59, 0.4)" />
        <stop offset="100%" stop-color="rgba(255, 48, 59, 0)" />
      </radialGradient>

      <!-- Drop shadow filter for realistic depth -->
      <filter id="bombDepthShadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.8" />
      </filter>

      <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Bomb Assembly Root -->
    <g filter="url(#bombDepthShadow)">
      
      <!-- DETONATOR WIRES (Looping gracefully across device) -->
      <path d="M 65 80 Q 40 120 75 160 Q 95 185 110 170" fill="none" stroke="url(#wireBlue)" stroke-width="3" stroke-linecap="round" opacity="0.9" filter="url(#glowFilter)" />
      <path d="M 80 75 Q 45 105 60 145 Q 70 175 125 175" fill="none" stroke="url(#wireRed)" stroke-width="2.5" stroke-linecap="round" opacity="0.9" />
      <path d="M 95 70 Q 140 40 165 75 Q 185 110 160 140" fill="none" stroke="#ECC94B" stroke-width="2.2" stroke-linecap="round" opacity="0.85" />

      <!-- C4 BLOCK 1 (Lower explosive charge) -->
      <rect x="52" y="86" width="136" height="78" rx="8" fill="url(#bombBodyMetal)" stroke="#374151" stroke-width="2" />
      <!-- Tactical ribbing / texture grooves -->
      <line x1="52" y1="102" x2="188" y2="102" stroke="#11141B" stroke-width="2" />
      <line x1="52" y1="124" x2="188" y2="124" stroke="#11141B" stroke-width="2" />
      <line x1="52" y1="146" x2="188" y2="146" stroke="#11141B" stroke-width="2" />

      <!-- REINFORCED COMPOSITE STRAPS -->
      <rect x="74" y="84" width="16" height="82" rx="2" fill="#0D1117" stroke="#4A5568" stroke-width="1.2" />
      <rect x="150" y="84" width="16" height="82" rx="2" fill="#0D1117" stroke="#4A5568" stroke-width="1.2" />

      <!-- DIGITAL TIMER & DETONATOR CONTROL MODULE -->
      <rect x="94" y="96" width="52" height="42" rx="4" fill="#080A0F" stroke="#2D3748" stroke-width="1.8" />
      <!-- Digital LCD display background -->
      <rect x="98" y="100" width="44" height="22" rx="2" fill="#05070A" stroke="#1A202C" stroke-width="1" />
      <!-- Digital Timer Readout (VYRA-00:45) -->
      <text x="120" y="115" font-family="'Space Grotesk', monospace" font-size="10" font-weight="900" fill="#145CFF" text-anchor="middle" letter-spacing="1" filter="url(#glowFilter)">00:45</text>

      <!-- STATUS LED INDICATORS -->
      <!-- Red Armed Beacon -->
      <circle cx="106" cy="130" r="3" fill="#FF303B" filter="url(#glowFilter)" />
      <circle cx="106" cy="130" r="6" fill="url(#ledGlowRed)" />
      <!-- Blue Armed Sync Beacon -->
      <circle cx="120" cy="130" r="3" fill="#145CFF" filter="url(#glowFilter)" />
      <!-- Green Ready Beacon -->
      <circle cx="134" cy="130" r="3" fill="#22C55E" />

      <!-- ANTENNA / RECEIVER MODULE -->
      <line x1="168" y1="84" x2="184" y2="48" stroke="#718096" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="184" cy="48" r="3" fill="#FF303B" filter="url(#glowFilter)" />

      <!-- PRESSURE SWITCH / CAPACITOR PACK -->
      <rect x="56" y="66" width="34" height="20" rx="3" fill="url(#bombPanelSteel)" stroke="#2D3748" stroke-width="1.5" />
      <circle cx="73" cy="76" r="4" fill="#0D1117" />
      <circle cx="73" cy="76" r="2" fill="#FF303B" />

      <!-- STENCILED ESPORTS EMBLEM -->
      <text x="120" y="156" font-family="'Space Grotesk', sans-serif" font-size="6.5" font-weight="900" letter-spacing="1.5" fill="#4B5563" text-anchor="middle">VYRA C4-TACTICAL</text>
    </g>
  `;

  return svg;
}

/**
 * Creates the scroll bomb container element
 */
export function createScrollBombElement() {
  const container = el("div", {
    className: "scroll-bomb-viewport",
    id: "scrollBombViewport",
    "aria-hidden": "true"
  });

  const bombWrap = el("div", {
    className: "scroll-bomb-entity",
    id: "scrollBombEntity"
  }, [
    createTacticalBombSvg()
  ]);

  container.appendChild(bombWrap);
  return container;
}

/**
 * Waypoint definitions across scroll progress (0.0 to 1.0)
 * Deterministic path that guides the bomb naturally through open background regions
 * avoiding important text, cards, buttons, and form areas.
 */
const WAYPOINTS = [
  // p: 0.00 - Boundary immediately after hero video ends: entering from left margin into Tournament Overview
  { p: 0.00, x: -6,  y: 35, rot: -20, scale: 0.88, opacity: 0.0 },
  // p: 0.08 - Revealed in left open corridor of Tournament Overview (#event)
  { p: 0.08, x: 6,   y: 45, rot: -5,  scale: 0.92, opacity: 0.95 },
  // p: 0.25 - Drifting diagonally across upper open corridor toward Format (#format)
  { p: 0.25, x: 22,  y: 28, rot: 30,  scale: 0.95, opacity: 0.95 },
  // p: 0.45 - Gliding through open right corridor near Prize Pool (#prizes)
  { p: 0.45, x: 84,  y: 42, rot: 75,  scale: 0.96, opacity: 0.95 },
  // p: 0.65 - Arching through open space near Rules & Scoring (#rules)
  { p: 0.65, x: 78,  y: 65, rot: 135, scale: 0.92, opacity: 0.92 },
  // p: 0.82 - Sweeping across to open left background near My Tickets (#myTickets / #refer)
  { p: 0.82, x: 8,   y: 48, rot: 210, scale: 0.90, opacity: 0.92 },
  // p: 1.00 - Concluding in open right background near FAQ & Contact (#faq / #contact)
  { p: 1.00, x: 82,  y: 55, rot: 275, scale: 0.88, opacity: 0.90 }
];

/**
 * Hermite smoothstep interpolation for organic, cinematic curve transitions
 */
function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Interpolates all properties at a given scroll progress p in [0, 1]
 */
function interpolateWaypoints(p) {
  const clamped = Math.max(0, Math.min(1, p));

  // Find surrounding waypoints
  let i = 0;
  while (i < WAYPOINTS.length - 1 && WAYPOINTS[i + 1].p < clamped) {
    i++;
  }

  const p0 = WAYPOINTS[i];
  const p1 = WAYPOINTS[Math.min(i + 1, WAYPOINTS.length - 1)];

  if (p0.p === p1.p) {
    return p0;
  }

  const rawT = (clamped - p0.p) / (p1.p - p0.p);
  const t = smoothStep(Math.max(0, Math.min(1, rawT)));

  return {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t,
    rot: p0.rot + (p1.rot - p0.rot) * t,
    scale: p0.scale + (p1.scale - p0.scale) * t,
    opacity: p0.opacity + (p1.opacity - p0.opacity) * t
  };
}

/**
 * Initializes the 100% scroll-driven bomb controller.
 * Movement happens strictly when scrolling, stopping completely when scroll stops.
 */
export function initScrollBomb() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  let stage = document.getElementById("scrollBombStage");
  let viewport = document.getElementById("scrollBombViewport");

  if (!viewport) {
    viewport = createScrollBombElement();
  }

  if (!stage) {
    stage = el("div", { className: "scroll-bomb-stage", id: "scrollBombStage", "aria-hidden": "true" });
    stage.appendChild(viewport);
    const subHeroZone = document.getElementById("subHeroZone");
    if (subHeroZone) {
      subHeroZone.prepend(stage);
    } else {
      document.body.appendChild(stage);
    }
  }

  const entity = document.getElementById("scrollBombEntity");
  if (!entity) return;

  let ticking = false;
  let heroBottom = 0;
  let maxScroll = 0;

  function measureDimensions() {
    const hero = document.getElementById("hero");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      // Absolute document coordinate where hero section ends
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
    
    // Live detection of hero bottom boundary relative to viewport
    // When heroRect.bottom > 0, the hero video/experience is still visible in the viewport.
    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const isHeroVisible = heroRect ? heroRect.bottom > 0 : (scrollY <= heroBottom);

    // 1. Hero boundary: completely invisible while hero video is visible
    if (isHeroVisible) {
      viewport.style.opacity = "0";
      viewport.style.visibility = "hidden";
      ticking = false;
      return;
    }

    // 2. Beyond hero: Calculate deterministic scroll progress (0.0 to 1.0)
    const availableScroll = Math.max(1, maxScroll - heroBottom);
    const scrollBeyondHero = Math.max(0, scrollY - heroBottom);
    const progress = Math.max(0, Math.min(1, scrollBeyondHero / availableScroll));

    // 3. Interpolate position, rotation, scale, and opacity strictly from scroll progress
    const state = interpolateWaypoints(progress);

    // Make visible immediately after hero ends
    viewport.style.visibility = "visible";
    viewport.style.opacity = state.opacity.toFixed(3);

    // Position and transform on GPU
    entity.style.transform = `translate3d(${state.x.toFixed(2)}vw, ${state.y.toFixed(2)}vh, 0) rotate(${state.rot.toFixed(1)}deg) scale(${state.scale.toFixed(3)})`;

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

  // Initial calculation
  measureDimensions();
  update();

  // Passive event listener for high-performance scroll updates
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  // Safety recalculation on full asset load
  window.addEventListener("load", () => {
    measureDimensions();
    update();
  }, { once: true });
}
