/**
 * VYRA ESPORTS — FPS Gun Firing & Reloading Cinematic Loading Experience
 * High-production first-person shooter tactical rifle animation sequence:
 * Phase 1: Tactical weapon entry from lower-right
 * Phase 2: Authentic magazine removal, reinsertion, and charging-handle rack
 * Phase 3: Triple-burst firing with recoil, multi-layered muzzle flash, brass casing ejection, and smoke
 * Phase 4: Tactical crosshair lock & seamless transition to website
 */

import { el } from "../utils/dom.js";

/**
 * Creates the complete SVG markup for the tactical battle rifle
 */
export function createTacticalRifleSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 900 600");
  svg.setAttribute("class", "fps-weapon-svg");
  svg.setAttribute("aria-hidden", "true");

  svg.innerHTML = `
    <defs>
      <!-- Gradients for realistic metallic weapon textures -->
      <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E2430" />
        <stop offset="50%" stop-color="#121620" />
        <stop offset="100%" stop-color="#0A0D14" />
      </linearGradient>

      <linearGradient id="metalHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A5568" />
        <stop offset="30%" stop-color="#2D3748" />
        <stop offset="100%" stop-color="#1A202C" />
      </linearGradient>

      <linearGradient id="barrelSteel" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2D3748" />
        <stop offset="40%" stop-color="#4A5568" />
        <stop offset="70%" stop-color="#1A202C" />
        <stop offset="100%" stop-color="#0D1117" />
      </linearGradient>

      <linearGradient id="electricBlueAccent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#145CFF" />
        <stop offset="100%" stop-color="#00D2FF" />
      </linearGradient>

      <linearGradient id="brassCasing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFE066" />
        <stop offset="50%" stop-color="#D4AF37" />
        <stop offset="100%" stop-color="#996515" />
      </linearGradient>

      <radialGradient id="muzzleCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="25%" stop-color="#FFF275" />
        <stop offset="60%" stop-color="#FF5722" />
        <stop offset="100%" stop-color="rgba(255, 48, 59, 0)" />
      </radialGradient>

      <radialGradient id="opticsGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(20, 92, 255, 0.9)" />
        <stop offset="60%" stop-color="rgba(20, 92, 255, 0.4)" />
        <stop offset="100%" stop-color="rgba(20, 92, 255, 0)" />
      </radialGradient>

      <!-- Glow filter for lasers and muzzle flash -->
      <filter id="weaponGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="flashBloom" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="16" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- LASER SIGHT PROJECTION -->
    <g class="gun-laser-group">
      <line x1="280" y1="230" x2="-200" y2="150" stroke="#FF303B" stroke-width="2.5" opacity="0.85" filter="url(#weaponGlow)" />
      <circle cx="-200" cy="150" r="5" fill="#FF303B" filter="url(#weaponGlow)" />
    </g>

    <!-- RECOIL CONTAINER (Applies recoil kick and weapon sway) -->
    <g class="gun-recoil-assembly" id="gunRecoilAssembly">
      
      <!-- MUZZLE SMOKE WISPS -->
      <g class="gun-smoke-group" id="gunSmokeGroup">
        <circle class="smoke-puff p1" cx="240" cy="220" r="14" fill="#A0AEC0" opacity="0" />
        <circle class="smoke-puff p2" cx="210" cy="205" r="22" fill="#718096" opacity="0" />
        <circle class="smoke-puff p3" cx="180" cy="190" r="30" fill="#4A5568" opacity="0" />
      </g>

      <!-- MUZZLE FLASH BURST -->
      <g class="gun-muzzle-flash" id="gunMuzzleFlash">
        <!-- Main blast bloom -->
        <ellipse cx="230" cy="226" rx="95" ry="60" fill="url(#muzzleCore)" filter="url(#flashBloom)" />
        <!-- Starburst flame spikes -->
        <polygon points="230,226 120,205 210,220 100,226 210,232 120,247 225,236 150,280 235,236 210,300 240,236" fill="#FFF8E7" />
        <polygon points="230,226 150,170 220,215 170,140 230,215 250,130 235,220" fill="#FFB703" />
        <!-- Micro sparks -->
        <circle cx="140" cy="190" r="3" fill="#FFF" />
        <circle cx="110" cy="235" r="2.5" fill="#FFB703" />
        <circle cx="160" cy="275" r="3.5" fill="#FF5722" />
        <circle cx="130" cy="150" r="2" fill="#FFE066" />
      </g>

      <!-- EJECTED BRASS CASINGS -->
      <g class="gun-casings-group" id="gunCasingsGroup">
        <g class="ejected-casing c1" id="casing1">
          <rect x="520" y="240" width="22" height="9" rx="2" fill="url(#brassCasing)" stroke="#7A5214" stroke-width="0.8" />
          <rect x="538" y="239" width="3" height="11" rx="1" fill="#D4AF37" />
        </g>
        <g class="ejected-casing c2" id="casing2">
          <rect x="520" y="240" width="22" height="9" rx="2" fill="url(#brassCasing)" stroke="#7A5214" stroke-width="0.8" />
          <rect x="538" y="239" width="3" height="11" rx="1" fill="#D4AF37" />
        </g>
        <g class="ejected-casing c3" id="casing3">
          <rect x="520" y="240" width="22" height="9" rx="2" fill="url(#brassCasing)" stroke="#7A5214" stroke-width="0.8" />
          <rect x="538" y="239" width="3" height="11" rx="1" fill="#D4AF37" />
        </g>
      </g>

      <!-- WEAPON ROOT BODY (Realistic Tactical Carbine) -->
      <g class="gun-main-mesh" transform="rotate(-14 550 350)">
        
        <!-- BARREL & FLASH SUPPRESSOR -->
        <rect x="250" y="222" width="220" height="14" rx="2" fill="url(#barrelSteel)" />
        <polygon points="230,217 252,220 252,238 230,241 228,236 238,229 228,222" fill="#11141B" stroke="#2D3748" stroke-width="1.5" />
        <!-- Flash Hider Ports -->
        <rect x="236" y="222" width="4" height="14" fill="#0D1117" />
        <rect x="244" y="222" width="4" height="14" fill="#0D1117" />
        
        <!-- GAS BLOCK & FRONT PICATINNY RAIL -->
        <rect x="340" y="214" width="34" height="10" fill="#1A202C" />
        <polygon points="350,214 360,198 375,198 370,214" fill="#242D3D" />

        <!-- TACTICAL HANDGUARD / M-LOK SHROUD -->
        <polygon points="360,205 520,205 530,265 375,255" fill="url(#metalDark)" stroke="#2D3748" stroke-width="1.5" />
        <!-- Ventilation Slots / M-LOK Cooling Vents -->
        <rect x="390" y="218" width="24" height="8" rx="3" fill="#0A0D14" stroke="#374151" stroke-width="0.8" />
        <rect x="424" y="220" width="24" height="8" rx="3" fill="#0A0D14" stroke="#374151" stroke-width="0.8" />
        <rect x="458" y="222" width="24" height="8" rx="3" fill="#0A0D14" stroke="#374151" stroke-width="0.8" />
        <rect x="492" y="224" width="20" height="8" rx="3" fill="#0A0D14" stroke="#374151" stroke-width="0.8" />

        <!-- Top Picatinny Rail System -->
        <rect x="360" y="196" width="330" height="9" fill="#1E2430" />
        <!-- Rail notches -->
        <line x1="370" y1="196" x2="370" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="390" y1="196" x2="390" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="410" y1="196" x2="410" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="430" y1="196" x2="430" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="450" y1="196" x2="450" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="470" y1="196" x2="470" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="490" y1="196" x2="490" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="510" y1="196" x2="510" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="530" y1="196" x2="530" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="550" y1="196" x2="550" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="570" y1="196" x2="570" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="590" y1="196" x2="590" y2="205" stroke="#0D1117" stroke-width="2" />
        <line x1="610" y1="196" x2="610" y2="205" stroke="#0D1117" stroke-width="2" />

        <!-- HOLOGRAPHIC RED/BLUE DOT OPTIC SIGHT -->
        <g class="gun-optic-assembly">
          <polygon points="460,196 470,154 550,154 560,196" fill="#1A202C" stroke="#374151" stroke-width="1.5" />
          <!-- Optic Hood / Protective Shroud -->
          <path d="M 475 194 L 485 158 L 535 158 L 545 194 Z" fill="#0D1117" />
          <!-- Holographic Glass Lens -->
          <rect x="490" y="162" width="40" height="28" rx="3" fill="url(#opticsGlow)" opacity="0.8" />
          <!-- Glowing Reticle Center Point -->
          <circle cx="510" cy="176" r="3" fill="#145CFF" filter="url(#weaponGlow)" />
          <circle cx="510" cy="176" r="1.2" fill="#FFFFFF" />
          <!-- Optic Elevation Adjustment Turret -->
          <rect x="502" y="148" width="16" height="7" rx="2" fill="#2D3748" />
        </g>

        <!-- RECEIVER (Upper & Lower) -->
        <polygon points="520,205 660,205 680,290 620,330 540,295 530,265" fill="url(#metalHighlight)" stroke="#374151" stroke-width="1.8" />
        <!-- Electric Blue Esports Trim Accent Stripe -->
        <polygon points="535,210 655,210 650,215 538,215" fill="url(#electricBlueAccent)" filter="url(#weaponGlow)" />
        <polygon points="560,250 640,250 635,254 565,254" fill="#FF303B" opacity="0.9" />

        <!-- EJECTION PORT & BOLT CARRIER (Animates during reload & firing!) -->
        <g class="gun-ejection-assembly">
          <rect x="548" y="218" width="58" height="24" rx="2" fill="#080A0F" stroke="#1A202C" stroke-width="1.2" />
          <!-- Reciprocating Bolt Carrier -->
          <g class="gun-bolt" id="gunBolt">
            <rect x="550" y="220" width="52" height="20" rx="1.5" fill="url(#barrelSteel)" />
            <circle cx="578" cy="230" r="3" fill="#0D1117" />
            <line x1="560" y1="225" x2="595" y2="225" stroke="#0D1117" stroke-width="1.5" />
            <!-- Charging Handle Tab -->
            <polygon points="600,215 615,215 610,225 595,225" fill="#4A5568" stroke="#1A202C" stroke-width="1" />
          </g>
          <!-- Shell Casing deflector wedge -->
          <polygon points="612,220 626,228 612,236" fill="#1E2430" stroke="#374151" stroke-width="1" />
        </g>

        <!-- SELECTOR SWITCH (Fire: Full Auto / Burst) -->
        <circle cx="630" cy="275" r="7" fill="#1E2430" stroke="#4A5568" stroke-width="1.5" />
        <line x1="630" y1="275" x2="636" y2="270" stroke="#FF303B" stroke-width="2.5" stroke-linecap="round" />
        <text x="618" y="265" font-family="monospace" font-size="6" font-weight="bold" fill="#FF303B">BURST</text>

        <!-- TRIGGER GUARD & TRIGGER -->
        <path d="M 590 290 Q 590 325 625 320" fill="none" stroke="#2D3748" stroke-width="3" />
        <path d="M 602 292 Q 600 306 608 312" fill="none" stroke="#D1D5DB" stroke-width="2.5" />

        <!-- ERGONOMIC PISTOL GRIP -->
        <path d="M 620 310 L 685 450 L 640 465 L 595 330 Z" fill="url(#metalDark)" stroke="#2D3748" stroke-width="2" />
        <!-- Stippling Texture on Grip -->
        <line x1="625" y1="350" x2="660" y2="365" stroke="#374151" stroke-width="2" stroke-linecap="round" />
        <line x1="620" y1="375" x2="655" y2="390" stroke="#374151" stroke-width="2" stroke-linecap="round" />
        <line x1="615" y1="400" x2="650" y2="415" stroke="#374151" stroke-width="2" stroke-linecap="round" />
        <line x1="610" y1="425" x2="645" y2="440" stroke="#374151" stroke-width="2" stroke-linecap="round" />

        <!-- TACTICAL ADJUSTABLE CRANE STOCK & BUFFER TUBE -->
        <rect x="660" y="215" width="130" height="20" rx="3" fill="#1A202C" stroke="#2D3748" stroke-width="1.5" />
        <!-- Stock Body -->
        <polygon points="710,210 840,210 860,340 820,345 770,250 710,240" fill="url(#metalDark)" stroke="#2D3748" stroke-width="2" />
        <!-- Ribbed Rubber Buttpad -->
        <path d="M 840 208 L 865 208 L 880 342 L 855 342 Z" fill="#0A0D14" stroke="#1F2937" stroke-width="2" />
        <line x1="860" y1="230" x2="870" y2="230" stroke="#374151" stroke-width="2" />
        <line x1="863" y1="255" x2="873" y2="255" stroke="#374151" stroke-width="2" />
        <line x1="866" y1="280" x2="876" y2="280" stroke="#374151" stroke-width="2" />
        <line x1="869" y1="305" x2="879" y2="305" stroke="#374151" stroke-width="2" />
        <line x1="872" y1="330" x2="882" y2="330" stroke="#374151" stroke-width="2" />

        <!-- DETACHABLE HIGH-CAPACITY CURVED MAGAZINE (Separated for realistic reload animation!) -->
        <g class="gun-magazine" id="gunMagazine">
          <!-- Magwell lip -->
          <polygon points="528,260 575,268 565,300 520,290" fill="#1A202C" stroke="#2D3748" stroke-width="1.5" />
          <!-- Main Magazine Body -->
          <path d="M 525 285 Q 490 410 450 490 L 505 505 Q 545 420 572 295 Z" fill="url(#metalDark)" stroke="#374151" stroke-width="2" />
          <!-- Magazine Ribs & Windows -->
          <path d="M 515 320 Q 485 415 460 480" fill="none" stroke="#242D3D" stroke-width="6" stroke-linecap="round" />
          <!-- Clear Amber Ammo Count Window -->
          <rect x="495" y="340" width="12" height="60" rx="3" fill="#D97706" opacity="0.85" stroke="#78350F" stroke-width="1" />
          <!-- Visible 5.56mm Brass Rounds -->
          <ellipse cx="501" cy="350" rx="4" ry="2.5" fill="#FFE066" />
          <ellipse cx="499" cy="365" rx="4" ry="2.5" fill="#FFE066" />
          <ellipse cx="497" cy="380" rx="4" ry="2.5" fill="#FFE066" />
          <!-- Mag Baseplate with VYRA Insignia -->
          <polygon points="445,488 510,503 502,520 438,505" fill="#0D1117" stroke="#2D3748" stroke-width="2" />
          <text x="458" y="513" font-family="monospace" font-size="7" font-weight="900" fill="#145CFF" transform="rotate(13 458 513)">VYRA</text>
        </g>

        <!-- WEAPON BRANDING EMBLEM -->
        <text x="560" y="278" font-family="'Space Grotesk', sans-serif" font-size="9" font-weight="900" letter-spacing="1" fill="#94A3B8">VYRA V4-SPEC</text>
      </g>
    </g>
  `;

  return svg;
}

/**
 * Creates the entire FPS Gun Loading overlay element
 */
export function createGunLoaderElement() {
  const container = el("div", {
    className: "fps-loader-container",
    id: "fpsGunLoader",
    role: "progressbar",
    "aria-label": "Loading into the battle",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": "0"
  });

  // Dark atmospheric battle backdrop with tactical grid lines & particles
  const backdrop = el("div", { className: "fps-loader-backdrop" }, [
    el("div", { className: "fps-grid-overlay" }),
    el("div", { className: "fps-radial-vignette" }),
    el("div", { className: "fps-ambient-light" })
  ]);

  // Tactical Corner Brackets (Military HUD aesthetic)
  const brackets = el("div", { className: "fps-hud-brackets" }, [
    el("span", { className: "bracket top-left" }),
    el("span", { className: "bracket top-right" }),
    el("span", { className: "bracket bottom-left" }),
    el("span", { className: "bracket bottom-right" })
  ]);

  // Screen Flash overlay (triggers during recoil burst)
  const screenFlash = el("div", { className: "fps-screen-flash", id: "fpsScreenFlash" });

  // Tactical FPS Crosshair with dynamic range ticks and targeting ring
  const crosshair = el("div", { className: "fps-crosshair-wrap", id: "fpsCrosshair" }, [
    el("div", { className: "crosshair-circle" }),
    el("div", { className: "crosshair-dot" }),
    el("div", { className: "crosshair-line line-t" }),
    el("div", { className: "crosshair-line line-b" }),
    el("div", { className: "crosshair-line line-l" }),
    el("div", { className: "crosshair-line line-r" }),
    el("div", { className: "crosshair-target-tag" }, "TARGET ACQUIRED")
  ]);

  // Loading Telemetry HUD Text
  const telemetry = el("div", { className: "fps-telemetry-hud" }, [
    el("div", { className: "fps-status-badge" }, [
      el("span", { className: "radar-beacon" }),
      "CHAMPIONSHIP LOBBY PROTOCOL"
    ]),
    el("h2", { className: "fps-main-title" }, "LOADING INTO THE BATTLE..."),
    el("p", { className: "fps-status-readout", id: "fpsStatusReadout" }, "INITIALIZING WEAPON CALIBRATION..."),
    el("div", { className: "fps-progress-track" }, [
      el("div", { className: "fps-progress-bar", id: "fpsProgressBar" })
    ]),
    el("div", { className: "fps-telemetry-footer" }, [
      el("span", {}, "TICKET VERIFICATION: OK"),
      el("span", {}, "SERVER: ASIA-SOUTH-1"),
      el("span", { id: "fpsPercentLabel" }, "0%")
    ])
  ]);

  // Tactical Rifle SVG Assembly
  const rifleWrap = el("div", { className: "fps-rifle-viewport", id: "fpsRifleViewport" }, [
    createTacticalRifleSvg()
  ]);

  container.appendChild(backdrop);
  container.appendChild(brackets);
  container.appendChild(screenFlash);
  container.appendChild(crosshair);
  container.appendChild(telemetry);
  container.appendChild(rifleWrap);

  return container;
}

/**
 * Initializes and coordinates the FPS gun firing and reloading sequence.
 * Waits for genuine page readiness, coordinates all 4 phases, and cleanly dissolves.
 */
export function initGunLoader() {
  if (typeof document === "undefined") return;

  // Reduced motion preference check
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let loaderEl = document.getElementById("fpsGunLoader");
  if (!loaderEl) {
    loaderEl = createGunLoaderElement();
    document.body.appendChild(loaderEl);
  }

  // If user requested reduced motion, show simple minimal crosshair loader and resolve immediately
  if (prefersReducedMotion) {
    loaderEl.classList.add("reduced-motion-mode");
    const dismiss = () => {
      loaderEl.classList.add("is-finished");
      setTimeout(() => {
        if (loaderEl && loaderEl.parentNode) {
          loaderEl.parentNode.removeChild(loaderEl);
        }
      }, 300);
    };
    if (document.readyState === "complete") {
      setTimeout(dismiss, 350);
    } else {
      window.addEventListener("load", dismiss, { once: true });
    }
    return;
  }

  // Animation timeline coordination
  const recoilAssembly = document.getElementById("gunRecoilAssembly");
  const magazine = document.getElementById("gunMagazine");
  const bolt = document.getElementById("gunBolt");
  const muzzleFlash = document.getElementById("gunMuzzleFlash");
  const casings = [
    document.getElementById("casing1"),
    document.getElementById("casing2"),
    document.getElementById("casing3")
  ];
  const smoke = document.getElementById("gunSmokeGroup");
  const screenFlash = document.getElementById("fpsScreenFlash");
  const crosshair = document.getElementById("fpsCrosshair");
  const progressBar = document.getElementById("fpsProgressBar");
  const percentLabel = document.getElementById("fpsPercentLabel");
  const statusReadout = document.getElementById("fpsStatusReadout");

  let isPageReady = false;
  let animationSequenceFinished = false;

  // Track real page readiness
  const checkReadiness = () => {
    isPageReady = true;
    tryDissolve();
  };

  if (document.readyState === "complete") {
    isPageReady = true;
  } else {
    window.addEventListener("load", checkReadiness, { once: true });
  }

  // Safety fallback: Never trap the user, automatically dismiss after 3.2s
  const safetyTimeout = setTimeout(() => {
    isPageReady = true;
    animationSequenceFinished = true;
    tryDissolve();
  }, 3200);

  // Progressive progress bar updater
  let progress = 0;
  const progressTimer = setInterval(() => {
    if (progress < 95) {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress > 95) progress = 95;
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (percentLabel) percentLabel.textContent = `${progress}%`;
      if (loaderEl) loaderEl.setAttribute("aria-valuenow", String(progress));
    }
  }, 100);

  /**
   * Phase Sequence
   */
  // Phase 1: Weapon Enters (0.00s -> 0.45s)
  loaderEl.classList.add("phase-entry");
  if (statusReadout) statusReadout.textContent = "DEPLOYING TACTICAL LOADOUT...";

  // Phase 2: Reload Sequence (Magazine Out, Mag In, Bolt Rack) (0.50s -> 1.15s)
  setTimeout(() => {
    loaderEl.classList.remove("phase-entry");
    loaderEl.classList.add("phase-reload");
    if (statusReadout) statusReadout.textContent = "MAGAZINE RELEASE & RE-ENGAGEMENT...";
  }, 500);

  // Phase 2b: Rack charging handle / bolt (0.95s)
  setTimeout(() => {
    if (bolt) bolt.classList.add("is-racking");
    if (statusReadout) statusReadout.textContent = "CHAMBERING 5.56MM HIGH-VELOCITY ROUND...";
  }, 950);

  // Phase 3: Triple-Burst Fire & Recoil (1.20s -> 1.75s)
  setTimeout(() => {
    loaderEl.classList.remove("phase-reload");
    loaderEl.classList.add("phase-firing");
    if (statusReadout) statusReadout.textContent = "FIRE BURST: TARGET ENGAGED!";
    
    // Shot 1 (1.20s)
    fireShot(1);

    // Shot 2 (1.38s)
    setTimeout(() => fireShot(2), 180);

    // Shot 3 (1.56s)
    setTimeout(() => {
      fireShot(3);
      if (smoke) smoke.classList.add("is-smoking");
    }, 360);
  }, 1200);

  // Phase 4: Ready & Transition (1.85s)
  setTimeout(() => {
    loaderEl.classList.remove("phase-firing");
    loaderEl.classList.add("phase-ready");
    if (crosshair) crosshair.classList.add("is-locked");
    if (statusReadout) statusReadout.textContent = "SYSTEMS ONLINE · ENTERING ARENA";
    if (progressBar) progressBar.style.width = "100%";
    if (percentLabel) percentLabel.textContent = "100%";
    clearInterval(progressTimer);
    animationSequenceFinished = true;
    tryDissolve();
  }, 1850);

  function fireShot(shotIndex) {
    if (recoilAssembly) {
      recoilAssembly.classList.remove("shot-kick-1", "shot-kick-2", "shot-kick-3");
      // Force DOM reflow to re-trigger kick
      void recoilAssembly.offsetWidth;
      recoilAssembly.classList.add(`shot-kick-${shotIndex}`);
    }

    if (muzzleFlash) {
      muzzleFlash.classList.remove("is-flashing");
      void muzzleFlash.offsetWidth;
      muzzleFlash.classList.add("is-flashing");
    }

    if (screenFlash) {
      screenFlash.classList.remove("is-flashing");
      void screenFlash.offsetWidth;
      screenFlash.classList.add("is-flashing");
    }

    if (crosshair) {
      crosshair.classList.remove("is-kick");
      void crosshair.offsetWidth;
      crosshair.classList.add("is-kick");
    }

    const currentCasing = casings[shotIndex - 1];
    if (currentCasing) {
      currentCasing.classList.add("is-ejecting");
    }
  }

  function tryDissolve() {
    if (isPageReady && animationSequenceFinished) {
      clearTimeout(safetyTimeout);
      clearInterval(progressTimer);

      loaderEl.classList.add("is-dissolving");
      setTimeout(() => {
        if (loaderEl && loaderEl.parentNode) {
          loaderEl.parentNode.removeChild(loaderEl);
        }
      }, 450);
    }
  }
}
