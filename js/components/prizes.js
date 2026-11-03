import { el, formatINR } from "../utils/dom.js";
import { createTacticalRifleSvg } from "./gunLoader.js";

/**
 * VYRA ESPORTS — Realistic Frozen Prize Vault & Ballistic Breach Experience
 *
 * Core Experience:
 * 1. Initial State: The entire Prizes & Rewards section is locked under a realistic
 *    crystalline arctic ice sheet with frosted glass refraction, frost dendrites,
 *    and drifting snow/ice particles.
 * 2. Interactive Trigger: A tactical frozen breach HUD displays "CLICK HERE TO UNLOCK"
 *    with a targeting crosshair reticle.
 * 3. Ballistic Gunfire Sequence:
 *    - Real-time procedural audio synthesis (4-layer high-velocity gunshot thumps + mechanical action).
 *    - Tactical battle rifle sweeps into shooting position.
 *    - Rapid-fire 4-round burst with authentic weapon recoil kicks, muzzle flashes, and casing ejections.
 *    - High-velocity bullet tracer streaks punch directly into the ice sheet.
 *    - Multi-point ballistic entry craters punch through with chipped rims and radiating spiderweb fracture cracks.
 * 4. Catastrophic Ice Shatter:
 *    - 4th armor-piercing shot triggers seismic ice fracture sound + crystal glass explosion.
 *    - 70+ 3D-shaded crystalline ice shard polygons blast outward with realistic physics, rotation, and gravity.
 *    - Cryogenic frost vapor puff dissipates as the frost blur on the prizes cards dissolves.
 *    - Prize podium cards burst with a radiant gold victory pulse!
 * 5. Re-freeze capability: A discreet "❄️ Re-freeze Vault" button allows testing and replaying anytime.
 */

// Procedural Web Audio Synthesizer for Realistic Gunfire & Ice Shatter
function createVaultAudioEngine() {
  let ctx = null;

  const getContext = () => {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  const playGunshot = (isHeavy = false) => {
    const ac = getContext();
    if (!ac) return;
    const now = ac.currentTime;

    // 1. Supersonic bullet snap / transient crack (White noise through highpass)
    const crackSize = Math.floor(ac.sampleRate * 0.05);
    const crackBuffer = ac.createBuffer(1, crackSize, ac.sampleRate);
    const crackData = crackBuffer.getChannelData(0);
    for (let i = 0; i < crackSize; i++) {
      crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.012));
    }
    const crackSource = ac.createBufferSource();
    crackSource.buffer = crackBuffer;
    const crackFilter = ac.createBiquadFilter();
    crackFilter.type = "highpass";
    crackFilter.frequency.setValueAtTime(isHeavy ? 1000 : 1600, now);
    const crackGain = ac.createGain();
    crackGain.gain.setValueAtTime(1.1, now);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(ac.destination);
    crackSource.start(now);

    // 2. Chest-thumping acoustic sub-bass explosion
    const bassOsc = ac.createOscillator();
    const bassGain = ac.createGain();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(isHeavy ? 190 : 160, now);
    bassOsc.frequency.exponentialRampToValueAtTime(28, now + (isHeavy ? 0.28 : 0.22));

    bassGain.gain.setValueAtTime(isHeavy ? 1.4 : 1.1, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.3 : 0.24));

    bassOsc.connect(bassGain);
    bassGain.connect(ac.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.3);

    // 3. Chamber mechanical snap & punch (Bandpass filtered noise)
    const bodySize = Math.floor(ac.sampleRate * 0.32);
    const bodyBuffer = ac.createBuffer(1, bodySize, ac.sampleRate);
    const bodyData = bodyBuffer.getChannelData(0);
    for (let i = 0; i < bodySize; i++) {
      bodyData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.07));
    }
    const bodySource = ac.createBufferSource();
    bodySource.buffer = bodyBuffer;
    const bodyFilter = ac.createBiquadFilter();
    bodyFilter.type = "bandpass";
    bodyFilter.frequency.setValueAtTime(isHeavy ? 650 : 850, now);
    bodyFilter.Q.setValueAtTime(2.5, now);
    const bodyGain = ac.createGain();
    bodyGain.gain.setValueAtTime(0.9, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    bodySource.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(ac.destination);
    bodySource.start(now);
  };

  const playIceChip = () => {
    const ac = getContext();
    if (!ac) return;
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(3200 + Math.random() * 800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.07);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  };

  const playIceShatter = () => {
    const ac = getContext();
    if (!ac) return;
    const now = ac.currentTime;

    // Resonant crystalline ring harmonics
    const crystalFreqs = [1200, 1850, 2400, 3300, 4900, 6800];
    crystalFreqs.forEach((freq, idx) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      const startT = now + idx * 0.012;
      osc.frequency.setValueAtTime(freq, startT);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, startT + 0.55);

      gain.gain.setValueAtTime(0.35 / (idx + 1), startT);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.5);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(startT);
      osc.stop(startT + 0.55);
    });

    // Massive crunchy glass / ice shattering noise blast
    const blastSize = Math.floor(ac.sampleRate * 0.65);
    const blastBuffer = ac.createBuffer(1, blastSize, ac.sampleRate);
    const blastData = blastBuffer.getChannelData(0);
    for (let i = 0; i < blastSize; i++) {
      blastData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.16));
    }
    const blastSource = ac.createBufferSource();
    blastSource.buffer = blastBuffer;
    const blastFilter = ac.createBiquadFilter();
    blastFilter.type = "bandpass";
    blastFilter.frequency.setValueAtTime(2400, now);
    blastFilter.Q.setValueAtTime(1.4, now);
    const blastGain = ac.createGain();
    blastGain.gain.setValueAtTime(1.3, now);
    blastGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    blastSource.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(ac.destination);
    blastSource.start(now);
  };

  return { playGunshot, playIceChip, playIceShatter, getContext };
}

/**
 * Initializes the procedural Crystalline Ice Frost & Drifting Snow Canvas
 */
function initIceCanvas(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext ? canvas.getContext("2d") : null;
  if (!ctx) return () => {};

  let animId = null;
  let width = 0;
  let height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // 35 drifting arctic snowflakes & icy mist specks
  const particles = Array.from({ length: 35 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: Math.random() * 2.2 + 0.8,
    speedY: Math.random() * 0.0007 + 0.0003,
    speedX: (Math.random() - 0.5) * 0.0004,
    opacity: Math.random() * 0.55 + 0.25,
    swayOffset: Math.random() * Math.PI * 2
  }));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 800;
    height = rect.height || 500;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Draws procedural crystalline frost dendrite branches in the corners
  function drawFrostVines() {
    ctx.save();
    ctx.strokeStyle = "rgba(220, 245, 255, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";

    // Corner crystal anchors
    const corners = [
      { x: 0, y: 0, angle: Math.PI / 4, len: Math.min(width, height) * 0.28 },
      { x: width, y: 0, angle: (3 * Math.PI) / 4, len: Math.min(width, height) * 0.28 },
      { x: 0, y: height, angle: -Math.PI / 4, len: Math.min(width, height) * 0.25 },
      { x: width, y: height, angle: (-3 * Math.PI) / 4, len: Math.min(width, height) * 0.25 }
    ];

    corners.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      const endX = c.x + Math.cos(c.angle) * c.len;
      const endY = c.y + Math.sin(c.angle) * c.len;
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Sub-branches
      for (let i = 1; i <= 4; i++) {
        const t = (i / 5) * c.len;
        const px = c.x + Math.cos(c.angle) * t;
        const py = c.y + Math.sin(c.angle) * t;
        const bLen = (c.len - t) * 0.45;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(c.angle + 0.65) * bLen, py + Math.sin(c.angle + 0.65) * bLen);
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(c.angle - 0.65) * bLen, py + Math.sin(c.angle - 0.65) * bLen);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  let time = 0;
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Drifting arctic frost particles
    time += 0.02;
    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += Math.sin(time + p.swayOffset) * p.speedX;
      if (p.y > 1) {
        p.y = -0.05;
        p.x = Math.random();
      }
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;

      const px = p.x * width;
      const py = p.y * height;

      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 248, 255, ${p.opacity})`;
      ctx.shadowColor = "rgba(180, 235, 255, 0.8)";
      ctx.shadowBlur = 4;
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    drawFrostVines();
    animId = requestAnimationFrame(render);
  }

  render();

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
  };
}

/**
 * Executes the Catastrophic Ice Shatter Particle Explosion on Canvas
 */
function triggerIceShatterCanvas(canvas, onComplete, blastOriginX, blastOriginY) {
  if (!canvas) return onComplete && onComplete();
  const ctx = canvas.getContext ? canvas.getContext("2d") : null;
  if (!ctx) return onComplete && onComplete();

  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 800;
  const height = rect.height || 500;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.scale(dpr, dpr);

  const centerX = blastOriginX != null ? blastOriginX : width * 0.5;
  const centerY = blastOriginY != null ? blastOriginY : height * 0.45;

  // Generate 75 realistic 3D crystalline ice shard polygons
  const shards = Array.from({ length: 75 }, () => {
    // Start distributed around the epicenter
    const originX = centerX + (Math.random() - 0.5) * (Math.min(width, 360) * 0.7);
    const originY = centerY + (Math.random() - 0.5) * (Math.min(height, 280) * 0.6);

    const angle = Math.atan2(originY - centerY, originX - centerX) + (Math.random() - 0.5) * 0.7;
    const speed = Math.random() * 650 + 250;

    const numPoints = Math.floor(Math.random() * 3) + 3; // 3 to 5 vertices
    const radius = Math.random() * 22 + 10;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const a = (i / numPoints) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const r = radius * (Math.random() * 0.5 + 0.6);
      points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }

    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 200, // Initial upward blast
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 14,
      points,
      opacity: 1,
      scale: Math.random() * 0.6 + 0.8
    };
  });

  // Frost vapor clouds (cold smoke burst)
  const vapors = Array.from({ length: 30 }, () => ({
    x: centerX + (Math.random() - 0.5) * 200,
    y: centerY + (Math.random() - 0.5) * 140,
    vx: (Math.random() - 0.5) * 350,
    vy: (Math.random() - 0.5) * 300,
    radius: Math.random() * 25 + 20,
    grow: Math.random() * 60 + 40,
    opacity: 0.65
  }));

  let lastTime = performance.now();
  let animId = null;

  function loop(currentTime) {
    const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
    lastTime = currentTime;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Expanding Frost Vapor Puffs
    vapors.forEach((v) => {
      v.x += v.vx * dt;
      v.y += v.vy * dt;
      v.radius += v.grow * dt;
      v.opacity -= dt * 0.7;

      if (v.opacity > 0) {
        ctx.beginPath();
        const radGrad = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, v.radius);
        radGrad.addColorStop(0, `rgba(235, 250, 255, ${Math.max(0, v.opacity * 0.7)})`);
        radGrad.addColorStop(0.5, `rgba(180, 230, 255, ${Math.max(0, v.opacity * 0.3)})`);
        radGrad.addColorStop(1, "rgba(20, 80, 160, 0)");
        ctx.fillStyle = radGrad;
        ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 2. Draw Realistic 3D Crystalline Ice Shards
    let activeShards = 0;
    shards.forEach((s) => {
      // Physics: gravity + air drag
      s.vx *= 0.985;
      s.vy += 950 * dt; // Gravity
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot += s.vRot * dt;

      if (s.y > height * 0.7) {
        s.opacity -= dt * 1.8;
      }

      if (s.opacity > 0 && s.y < height + 80) {
        activeShards++;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.scale(s.scale, s.scale);

        // Specular Crystalline Ice Shader
        ctx.beginPath();
        s.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        const grad = ctx.createLinearGradient(-15, -15, 15, 15);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity * 0.95})`);
        grad.addColorStop(0.35, `rgba(190, 240, 255, ${s.opacity * 0.75})`);
        grad.addColorStop(0.8, `rgba(30, 110, 220, ${s.opacity * 0.55})`);
        grad.addColorStop(1, `rgba(10, 30, 70, ${s.opacity * 0.4})`);

        ctx.fillStyle = grad;
        ctx.fill();

        // Crystalline sharp faceted edge
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity * 0.9})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
    });

    if (activeShards > 0 || vapors.some((v) => v.opacity > 0)) {
      animId = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, width, height);
      if (onComplete) onComplete();
    }
  }

  animId = requestAnimationFrame(loop);
}

/**
 * Creates an SVG Ballistic Impact Crater with Spiderweb Fracture Cracks
 */
function createBallisticImpactCrater(x, y, radius = 35, numBranches = 7) {
  const container = document.createElement("div");
  container.className = "ice-bullet-impact-entry";
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const size = radius * 4.5;
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("width", `${size}`);
  svg.setAttribute("height", `${size}`);
  svg.style.marginLeft = `${-size / 2}px`;
  svg.style.marginTop = `${-size / 2}px`;
  svg.setAttribute("class", "ice-impact-svg");

  const cx = size / 2;
  const cy = size / 2;

  // Generate jagged spiderweb crystalline crack paths radiating outward
  let pathsHtml = "";
  for (let b = 0; b < numBranches; b++) {
    const baseAngle = (b / numBranches) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const maxLen = radius * 1.8 + Math.random() * (radius * 1.2);
    let curX = cx;
    let curY = cy;
    let d = `M ${curX} ${curY}`;

    const segments = Math.floor(Math.random() * 3) + 3;
    for (let s = 1; s <= segments; s++) {
      const segLen = (maxLen / segments) * (Math.random() * 0.4 + 0.8);
      const angle = baseAngle + (Math.random() - 0.5) * 0.5;
      curX += Math.cos(angle) * segLen;
      curY += Math.sin(angle) * segLen;
      d += ` L ${curX.toFixed(1)} ${curY.toFixed(1)}`;

      // Sub-splinter branch
      if (Math.random() > 0.45) {
        const subAngle = angle + (Math.random() > 0.5 ? 0.7 : -0.7);
        const subLen = segLen * 0.75;
        const subX = curX + Math.cos(subAngle) * subLen;
        const subY = curY + Math.sin(subAngle) * subLen;
        pathsHtml += `<path d="M ${curX.toFixed(1)} ${curY.toFixed(1)} L ${subX.toFixed(1)} ${subY.toFixed(1)}" stroke="rgba(255,255,255,0.85)" stroke-width="1.2" stroke-linecap="round" />`;
      }
    }

    pathsHtml += `<path d="${d}" stroke="rgba(255,255,255,0.95)" stroke-width="1.8" stroke-linecap="round" filter="drop-shadow(0 0 3px rgba(140,225,255,0.8))" />`;
  }

  svg.innerHTML = `
    <defs>
      <!-- Crater bevel gradient -->
      <radialGradient id="craterIceRim" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#020712" stop-opacity="0.95" />
        <stop offset="35%" stop-color="#081E3D" stop-opacity="0.85" />
        <stop offset="65%" stop-color="#3A82EE" stop-opacity="0.6" />
        <stop offset="85%" stop-color="#FFFFFF" stop-opacity="0.9" />
        <stop offset="100%" stop-color="rgba(180,240,255,0)" />
      </radialGradient>
    </defs>
    <!-- Cyan fracture glow halo -->
    <circle cx="${cx}" cy="${cy}" r="${radius * 1.3}" fill="rgba(80, 200, 255, 0.22)" filter="blur(6px)" />
    <!-- Radiating crystalline crack vectors -->
    ${pathsHtml}
    <!-- Center ballistic puncture hole and chipped crystal crater -->
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.42}" fill="url(#craterIceRim)" stroke="rgba(255,255,255,0.9)" stroke-width="1.5" />
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.18}" fill="#040810" />
  `;

  container.appendChild(svg);
  return container;
}

/**
 * Creates the complete Prizes Section with the Realistic Frozen Vault & Breach
 */
export function createPrizesSection(site) {
  const p2 = el("article", { className: "p2", dataset: { tilt: "true" } }, [
    el("div", { className: "podium-icon" }, "🥈"),
    el("h3", {}, "2nd Place"),
    el("strong", {}, formatINR(site.prizes.second)),
    el("p", {}, "Runner-up squad + Silver Medals & Official Certificates"),
    el("span", { className: "badge badge-muted" }, "Instant UPI Payout")
  ]);

  const p1 = el("article", { className: "p1", dataset: { tilt: "true" } }, [
    el("div", { className: "podium-icon crown" }, "👑"),
    el("div", { className: "champion-ribbon" }, "CHAMPION SQUAD"),
    el("h3", {}, "1st Place"),
    el("strong", {}, formatINR(site.prizes.first)),
    el("p", {}, "Champion Trophy + Winner Certificates + Direct Cash Transfer"),
    el("span", { className: "badge badge-flame" }, "Verified Cash Transfer")
  ]);

  const p3 = el("article", { className: "p3", dataset: { tilt: "true" } }, [
    el("div", { className: "podium-icon" }, "🎁"),
    el("h3", {}, "Lucky Pool"),
    el("strong", {}, formatINR(site.prizes.luckyDraw || 10000)),
    el("p", {}, "Exclusively for eligible pre-bookings — drawn live for pre-registered participants"),
    el("span", { className: "badge badge-flame" }, "Pre-bookings Only")
  ]);

  const podium = el("div", { className: "podium" }, [p2, p1, p3]);

  const giftCard = el("div", { className: "gift-card", dataset: { tilt: "true" } }, [
    el("span", { className: "gift-icon" }, "🎖️"),
    el("div", {}, [
      el("strong", {}, "Guaranteed Participation Perks"),
      el("p", { className: "small" }, "Every registered squad receives digital player certificates & priority entry to future championship scrims.")
    ])
  ]);

  // Protected Vault Content Wrapper (contains podium and perks card)
  const vaultContent = el("div", { className: "podium-vault-content", id: "podiumVaultContent" }, [
    podium,
    giftCard
  ]);

  // =========================================================================
  // FROZEN ICE OVERLAY & BREACH MECHANISM
  // =========================================================================
  const frostCanvas = el("canvas", { className: "ice-frost-canvas", id: "iceFrostCanvas" });
  const shardsCanvas = el("canvas", { className: "ice-shards-canvas", id: "iceShardsCanvas" });
  const cracksOverlay = el("div", { className: "ice-cracks-overlay", id: "iceCracksOverlay" });

  // Interactive Target HUD ("CLICK HERE TO UNLOCK")
  const unlockBtn = el("button", {
    className: "ice-unlock-trigger",
    id: "iceUnlockTrigger",
    type: "button",
    "aria-label": "Click to unlock and breach the frozen prizes vault"
  }, [
    el("div", { className: "ice-badge-glow" }),
    el("div", { className: "ice-lock-icon" }, "❄️"),
    el("div", { className: "ice-lock-text-group" }, [
      el("span", { className: "ice-lock-main-text" }, "CLICK HERE TO UNLOCK"),
      el("span", { className: "ice-lock-sub-text" }, "TAP TO BREACH FROZEN PRIZE VAULT")
    ]),
    el("div", { className: "ice-targeting-reticle" }, [
      el("div", { className: "reticle-crosshair ch-top" }),
      el("div", { className: "reticle-crosshair ch-bot" }),
      el("div", { className: "reticle-crosshair ch-lft" }),
      el("div", { className: "reticle-crosshair ch-rgt" }),
      el("div", { className: "reticle-center-dot" })
    ])
  ]);

  const unlockHud = el("div", { className: "ice-unlock-hud", id: "iceUnlockHud" }, [unlockBtn]);

  // Frozen Ice Overlay Root Container
  const iceOverlay = el("div", { className: "ice-vault-overlay", id: "iceVaultOverlay" }, [
    el("div", { className: "ice-frosted-glass-backdrop" }),
    el("div", { className: "ice-crystalline-pattern-layer" }),
    frostCanvas,
    cracksOverlay,
    shardsCanvas,
    unlockHud
  ]);

  // Tactical Rifle Assembly Rig for Breach Animation
  const weaponWrap = el("div", { className: "prizes-weapon-wrapper", id: "prizesWeaponWrap" }, [
    createTacticalRifleSvg()
  ]);

  const muzzleFlash = el("div", { className: "prizes-muzzle-flare", id: "prizesMuzzleFlare" });
  const weaponRig = el("div", { className: "prizes-weapon-rig", id: "prizesWeaponRig" }, [
    muzzleFlash,
    weaponWrap
  ]);

  // Bullet tracer line canvas for high-speed projectile rounds
  const tracerCanvas = el("canvas", { className: "prizes-tracer-canvas", id: "prizesTracerCanvas" });

  // Complete Vault Stage
  const vaultStage = el("div", { className: "prizes-vault-stage is-locked", id: "prizesVaultStage" }, [
    vaultContent,
    iceOverlay,
    tracerCanvas,
    weaponRig
  ]);

  // Subtle Header Action to Re-freeze for Replay / Demo
  const refreezeBtn = el("button", {
    className: "btn-refreeze-vault",
    id: "btnRefreezeVault",
    type: "button",
    style: "display: none;"
  }, "❄️ Re-freeze Vault");

  const sectionHead = el("div", { className: "section-head text-center-mobile" }, [
    el("div", { className: "head-title-row-flex" }, [
      el("div", {}, [
        el("p", { className: "kicker" }, "Cash Rewards"),
        el("h2", {}, "Prizes & Rewards")
      ]),
      refreezeBtn
    ]),
    el("p", { className: "sub" }, "Official prize distribution paid directly via UPI within 48 hours of match completion.")
  ]);

  // =========================================================================
  // INTERACTIVE BALLISTIC BREACH COORDINATOR & SCROLL-FOLLOWING HUD
  // =========================================================================
  const audio = createVaultAudioEngine();
  let stopFrostAnim = null;
  let isBreaching = false;
  let scrollRafId = null;

  // Initialize Frost Canvas when mounted
  setTimeout(() => {
    stopFrostAnim = initIceCanvas(frostCanvas);
  }, 100);

  // Dynamic Scroll-Following HUD:
  // When user enters the Prizes & Rewards section, the unlock button is positioned near the top.
  // As the user scrolls down through the section, the button smoothly follows their scroll
  // within the user's viewport, clamped cleanly inside the section boundaries.
  function updateScrollTracking() {
    if (!vaultStage || vaultStage.classList.contains("is-unlocked") || isBreaching) return;

    const overlayRect = iceOverlay.getBoundingClientRect();
    if (!overlayRect || overlayRect.height === 0) return;

    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const btnH = unlockHud.offsetHeight || 120;

    // Desired vertical center of the button relative to the viewport:
    // Floating comfortably in the upper-mid viewport (~40% from top of screen)
    const desiredViewportY = Math.max(70, vh * 0.40 - btnH / 2);

    // Natural stage Y coordinate:
    // When section top is at screen top, overlayRect.top = 0 -> naturalStageY = desiredViewportY
    // When scrolling down, overlayRect.top is negative -> naturalStageY increases
    const naturalStageY = desiredViewportY - overlayRect.top;

    // Clamping boundaries within the ice overlay
    const pad = window.innerWidth <= 768 ? 24 : 35;
    const minY = pad;
    const maxY = Math.max(minY, overlayRect.height - btnH - pad);

    const clampedY = Math.max(minY, Math.min(maxY, naturalStageY));
    unlockHud.style.transform = `translate3d(0, ${Math.round(clampedY)}px, 0)`;
  }

  const handleScrollOrResize = () => {
    if (scrollRafId) return;
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = null;
      updateScrollTracking();
    });
  };

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    window.addEventListener("orientationchange", handleScrollOrResize, { passive: true });
    // Initial tracking updates after render
    setTimeout(updateScrollTracking, 150);
    setTimeout(updateScrollTracking, 600);

    // Mouse reticle tracking over the ice sheet
    iceOverlay.addEventListener("mousemove", (e) => {
      if (vaultStage.classList.contains("is-unlocked") || isBreaching) return;
      const rect = iceOverlay.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      unlockBtn.style.setProperty("--cursor-x", `${relX}px`);
      unlockBtn.style.setProperty("--cursor-y", `${relY}px`);
    }, { passive: true });
  }

  // Draw High-Velocity Tracer Round from Weapon Barrel to Impact Target
  function fireTracer(fromX, fromY, toX, toY, onImpact) {
    const tCtx = tracerCanvas.getContext("2d");
    if (!tCtx) {
      if (onImpact) onImpact();
      return;
    }

    const tRect = tracerCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    tracerCanvas.width = Math.floor(tRect.width * dpr);
    tracerCanvas.height = Math.floor(tRect.height * dpr);
    tCtx.scale(dpr, dpr);

    const startTime = performance.now();
    const duration = 80; // 80ms supersonic travel speed

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      tCtx.clearRect(0, 0, tRect.width, tRect.height);

      // Interpolate projectile position
      const headX = fromX + (toX - fromX) * progress;
      const headY = fromY + (toY - fromY) * progress;
      const tailProgress = Math.max(0, progress - 0.45);
      const tailX = fromX + (toX - fromX) * tailProgress;
      const tailY = fromY + (toY - fromY) * tailProgress;

      tCtx.beginPath();
      tCtx.moveTo(tailX, tailY);
      tCtx.lineTo(headX, headY);
      const grad = tCtx.createLinearGradient(tailX, tailY, headX, headY);
      grad.addColorStop(0, "rgba(255, 120, 40, 0)");
      grad.addColorStop(0.4, "rgba(255, 200, 70, 0.7)");
      grad.addColorStop(1, "rgba(255, 255, 255, 1)");
      tCtx.strokeStyle = grad;
      tCtx.lineWidth = 4;
      tCtx.lineCap = "round";
      tCtx.shadowColor = "rgba(255, 180, 50, 0.9)";
      tCtx.shadowBlur = 8;
      tCtx.stroke();
      tCtx.shadowBlur = 0;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        tCtx.clearRect(0, 0, tRect.width, tRect.height);
        if (onImpact) onImpact();
      }
    }

    requestAnimationFrame(step);
  }

  // Tactical Gunfire & Shatter Sequence
  const performBreachSequence = () => {
    if (isBreaching || vaultStage.classList.contains("is-unlocked")) return;
    isBreaching = true;

    // Trigger audio context unlock
    audio.getContext();

    // 1. Enter Breach State: HUD locks on target
    vaultStage.classList.add("is-breaching");
    unlockBtn.classList.add("is-locked-on");
    unlockBtn.querySelector(".ice-lock-main-text").textContent = "TARGET LOCKED — ENGAGING FIRE";

    const vaultRect = vaultStage.getBoundingClientRect();
    const btnRect = unlockBtn.getBoundingClientRect();
    const stageW = vaultRect.width || 800;
    const stageH = vaultRect.height || 500;

    // Pinpoint button center relative to the vault stage at moment of engagement
    const targetCenterX = Math.round((btnRect.left + btnRect.width / 2) - vaultRect.left);
    const targetCenterY = Math.round((btnRect.top + btnRect.height / 2) - vaultRect.top);

    const isMobile = window.innerWidth <= 768;

    // Dynamic weapon positioning:
    // On mobile or vertically scrolled stages, position the weapon rig in the current visible area
    if (isMobile || stageH > 650) {
      const rigH = weaponRig.offsetHeight || 260;
      const desiredRigTop = targetCenterY - 40;
      const clampedRigTop = Math.max(10, Math.min(stageH - rigH - 10, desiredRigTop));
      weaponRig.style.top = `${Math.round(clampedRigTop)}px`;
      weaponRig.style.bottom = "auto";
    } else {
      weaponRig.style.top = "";
      weaponRig.style.bottom = "-60px";
    }

    // Weapon slides up into shooting position
    weaponRig.classList.add("is-aiming");

    // Dynamic origin of rifle barrel (from weapon rig in stage coordinates)
    const rigRect = weaponRig.getBoundingClientRect();
    let barrelX = (rigRect.left + rigRect.width * 0.20) - vaultRect.left;
    let barrelY = (rigRect.top + rigRect.height * 0.32) - vaultRect.top;

    if (!barrelX || isNaN(barrelX) || barrelX < 0) {
      barrelX = stageW * 0.78;
      barrelY = targetCenterY + 80;
    }

    // 4 Tactical Impact Target Points centered around current target button
    const targetPoints = [
      {
        x: Math.max(30, targetCenterX - (isMobile ? 90 : 200)),
        y: Math.max(30, targetCenterY - (isMobile ? 35 : 45)),
        delay: 280,
        heavy: false
      },
      {
        x: Math.min(stageW - 30, targetCenterX + (isMobile ? 90 : 200)),
        y: Math.min(stageH - 30, targetCenterY + (isMobile ? 35 : 45)),
        delay: 480,
        heavy: false
      },
      {
        x: targetCenterX,
        y: Math.max(30, targetCenterY - (isMobile ? 60 : 90)),
        delay: 680,
        heavy: false
      },
      {
        x: targetCenterX,
        y: targetCenterY,
        delay: 920,
        heavy: true // Final armor-piercing shot!
      }
    ];

    targetPoints.forEach((pt, shotIdx) => {
      setTimeout(() => {
        // Fire audio
        audio.playGunshot(pt.heavy);

        // Weapon recoil kick
        weaponWrap.classList.remove("recoil-kick");
        void weaponWrap.offsetWidth;
        weaponWrap.classList.add("recoil-kick");

        // Dynamic Muzzle Flash
        muzzleFlash.classList.add("is-flashing");
        setTimeout(() => muzzleFlash.classList.remove("is-flashing"), 75);

        // Bullet Tracer Streak
        fireTracer(barrelX, barrelY, pt.x, pt.y, () => {
          // Impact Point Action
          audio.playIceChip();

          // Camera / Stage recoil vibration
          vaultStage.classList.remove("screen-shake");
          void vaultStage.offsetWidth;
          vaultStage.classList.add("screen-shake");

          // Render Ballistic Crater & Spiderweb Cracks
          const crater = createBallisticImpactCrater(pt.x, pt.y, pt.heavy ? 44 : 32, pt.heavy ? 10 : 7);
          cracksOverlay.appendChild(crater);

          // If this is the final shot (Round 4): CATASTROPHIC SHATTER EXPLOSION!
          if (pt.heavy) {
            setTimeout(() => {
              // Sound: Seismic fracture + multi-frequency glass/ice explosion
              audio.playIceShatter();

              // Big Screen Flash
              vaultStage.classList.add("screen-flash-white");
              setTimeout(() => vaultStage.classList.remove("screen-flash-white"), 80);

              // Shard explosion on canvas (epicenter at button center)
              triggerIceShatterCanvas(shardsCanvas, () => {
                if (stopFrostAnim) stopFrostAnim();
              }, targetCenterX, targetCenterY);

              // Dissolve frost overlay & unlock stage
              iceOverlay.classList.add("is-dissolving");
              vaultStage.classList.remove("is-locked", "is-breaching");
              vaultStage.classList.add("is-unlocked");

              // Podium cards victory gold pulse
              vaultContent.classList.add("podium-victory-shine");

              // Retract weapon rig smoothly
              setTimeout(() => {
                weaponRig.classList.remove("is-aiming");
                refreezeBtn.style.display = "inline-flex";
                isBreaching = false;
              }, 600);
            }, 50);
          }
        });
      }, pt.delay);
    });
  };

  unlockBtn.addEventListener("click", (e) => {
    e.preventDefault();
    performBreachSequence();
  });

  // Re-freeze action handler (for repeat demo/testing)
  refreezeBtn.addEventListener("click", () => {
    if (isBreaching) return;
    refreezeBtn.style.display = "none";
    vaultStage.classList.remove("is-unlocked");
    vaultStage.classList.add("is-locked");
    iceOverlay.classList.remove("is-dissolving");
    unlockBtn.classList.remove("is-locked-on");
    unlockBtn.querySelector(".ice-lock-main-text").textContent = "CLICK HERE TO UNLOCK";
    cracksOverlay.innerHTML = "";
    vaultContent.classList.remove("podium-victory-shine");
    if (stopFrostAnim) stopFrostAnim();
    stopFrostAnim = initIceCanvas(frostCanvas);
    isBreaching = false;
    updateScrollTracking();
  });

  return el("section", { className: "wrap", id: "prizes" }, [
    sectionHead,
    vaultStage
  ]);
}
