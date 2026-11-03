import { el, formatINR } from "../utils/dom.js";

export function createHero(site) {
  const soloFee = site.entryFees?.solo || site.entryFeeSolo || 350;

  // Live status badge & kicker
  const liveBadge = el("span", { className: "badge badge-live" }, [
    el("span", { className: "live-dot" }),
    "REGISTRATIONS ACTIVE"
  ]);

  const kicker = el("div", { className: "hero-kicker-row" }, [
    liveBadge,
    el("span", { className: "kicker-tag" }, "THE ULTIMATE GAMING SHOWDOWN")
  ]);

  // High-impact oversized esports headline
  const h1 = el("h1", { className: "hero-headline" }, [
    "DROP IN. OUTLAST EVERYONE.",
    el("br"),
    el("span", { className: "gradient-text" }, "₹25,000 TOTAL PRIZE POOL")
  ]);

  const ctaPrimary = el("div", { className: "cta-primary-group" }, [
    el("button", {
      className: "btn btn-glow btn-hero",
      type: "button",
      id: "heroPrebookBtn",
      "data-action": "open-prebook",
      "aria-label": "Pre-Book Your Squad"
    }, [
      el("span", { className: "btn-dot" }),
      "Pre-Book Your Squad"
    ]),
    el("span", { className: "btn-sold-out", "aria-disabled": "true", role: "status", title: "Solo player slots are completely filled" }, [
      el("span", { className: "badge-sold-out" }, "SOLD OUT"),
      `Solo (${formatINR(soloFee)})`
    ])
  ]);

  const ctaSecondary = el("div", { className: "cta-secondary-group" }, [
    el("a", { className: "btn btn-ghost", href: "#my-tickets" }, "My Tickets"),
    el("a", { className: "btn btn-ghost", href: "#prizes" }, "Prize Pool")
  ]);

  const ctaRow = el("div", { className: "cta-row" }, [ctaPrimary, ctaSecondary]);

  const heroText = el("div", { className: "hero-text" }, [kicker, h1, ctaRow]);

  // Live Tournament Capacity
  const slotsFilled = 38;
  const totalSlots = 48;
  const percent = Math.round((slotsFilled / totalSlots) * 100);

  const slotStatus = el("div", { className: "slot-status hero-slot-card", dataset: { tilt: "true" } }, [
    el("div", { className: "slot-label-row" }, [
      el("span", { className: "small" }, "Tournament Squad Capacity"),
      el("span", { className: "slot-count" }, `${slotsFilled} / ${totalSlots} Slots Filled`)
    ]),
    el("div", { className: "progress-bar" }, [
      el("div", { className: "progress-fill", style: `width: ${percent}%` })
    ]),
    el("p", { className: "slot-alert" }, "⚡ High Demand: Only 10 squad slots remaining in this bracket.")
  ]);

  // Full-bleed Background Video Player
  const bgVideo = el("video", {
    className: "hero-bg-video",
    autoplay: true,
    loop: true,
    muted: true,
    playsinline: true,
    "webkit-playsinline": "true",
    preload: "auto",
    "aria-hidden": "true"
  });

  bgVideo.loop = true;
  bgVideo.muted = true;
  bgVideo.autoplay = true;

  const sourceCinematic = el("source", { src: "/ff%20cinematic.mp4", type: "video/mp4" });
  const sourceCinematicJs = el("source", { src: "/js/ff%20cinematic.mp4", type: "video/mp4" });
  const sourceClean = el("source", { src: "/js/hero-trailer.mp4", type: "video/mp4" });
  bgVideo.appendChild(sourceCinematic);
  bgVideo.appendChild(sourceCinematicJs);
  bgVideo.appendChild(sourceClean);

  // Guarantee continuous looping playback without interruption
  const ensurePlaying = () => {
    if (bgVideo.paused) {
      bgVideo.play().catch(() => {});
    }
  };

  bgVideo.addEventListener("ended", () => {
    bgVideo.currentTime = 0;
    ensurePlaying();
  });
  bgVideo.addEventListener("pause", ensurePlaying);
  bgVideo.addEventListener("waiting", ensurePlaying);
  bgVideo.addEventListener("loadedmetadata", ensurePlaying);
  bgVideo.addEventListener("canplay", ensurePlaying);

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) ensurePlaying();
    });
    document.addEventListener("click", ensurePlaying, { once: true });
    document.addEventListener("touchstart", ensurePlaying, { once: true });
  }
  if (typeof window !== "undefined") {
    window.addEventListener("focus", ensurePlaying);
    // Continuous playback watchdog to prevent browser sleep / stalling
    setInterval(ensurePlaying, 1200);
  }

  // Light, transparent cinematic overlay that keeps the video 100% visible
  const videoOverlay = el("div", { className: "hero-video-backdrop-tint" });

  // Mobile 3:4 aspect ratio enforcement pinned at the top
  const applyMobileVideoAspect = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 992) {
      bgVideo.style.setProperty("position", "absolute", "important");
      bgVideo.style.setProperty("top", "0", "important");
      bgVideo.style.setProperty("left", "0", "important");
      bgVideo.style.setProperty("width", "100%", "important");
      bgVideo.style.setProperty("height", "auto", "important");
      bgVideo.style.setProperty("aspect-ratio", "3 / 4", "important");
      bgVideo.style.setProperty("max-height", "calc(100vw * 4 / 3)", "important");
      bgVideo.style.setProperty("object-fit", "cover", "important");
      bgVideo.style.setProperty("object-position", "center center", "important");

      videoOverlay.style.setProperty("position", "absolute", "important");
      videoOverlay.style.setProperty("top", "0", "important");
      videoOverlay.style.setProperty("left", "0", "important");
      videoOverlay.style.setProperty("width", "100%", "important");
      videoOverlay.style.setProperty("height", "auto", "important");
      videoOverlay.style.setProperty("aspect-ratio", "3 / 4", "important");
      videoOverlay.style.setProperty("max-height", "calc(100vw * 4 / 3)", "important");
    } else {
      bgVideo.style.removeProperty("position");
      bgVideo.style.removeProperty("top");
      bgVideo.style.removeProperty("left");
      bgVideo.style.removeProperty("width");
      bgVideo.style.removeProperty("height");
      bgVideo.style.removeProperty("aspect-ratio");
      bgVideo.style.removeProperty("max-height");
      bgVideo.style.removeProperty("object-fit");
      bgVideo.style.removeProperty("object-position");

      videoOverlay.style.removeProperty("position");
      videoOverlay.style.removeProperty("top");
      videoOverlay.style.removeProperty("left");
      videoOverlay.style.removeProperty("width");
      videoOverlay.style.removeProperty("height");
      videoOverlay.style.removeProperty("aspect-ratio");
      videoOverlay.style.removeProperty("max-height");
    }
  };

  if (typeof window !== "undefined") {
    applyMobileVideoAspect();
    window.addEventListener("resize", applyMobileVideoAspect, { passive: true });
    window.addEventListener("orientationchange", applyMobileVideoAspect, { passive: true });
  }

  // Floating Sound Toggle
  const soundBtn = el("button", {
    className: "hero-sound-toggle-btn",
    type: "button",
    title: "Toggle Video Audio",
    "aria-label": "Toggle Background Video Sound"
  }, [
    el("span", { className: "sound-icon" }, "🔇"),
    el("span", { className: "sound-text" }, "AUDIO")
  ]);

  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (bgVideo.muted) {
      bgVideo.muted = false;
      soundBtn.querySelector(".sound-icon").textContent = "🔊";
      soundBtn.querySelector(".sound-text").textContent = "ON";
      soundBtn.classList.add("is-active");
    } else {
      bgVideo.muted = true;
      soundBtn.querySelector(".sound-icon").textContent = "🔇";
      soundBtn.querySelector(".sound-text").textContent = "AUDIO";
      soundBtn.classList.remove("is-active");
    }
  });

  // Cinema Mode Toggle (Allows user to see the full unobstructed cinematic video anytime)
  const cinemaBtn = el("button", {
    className: "hero-cinema-btn",
    type: "button",
    title: "Toggle Cinema Mode to see full video",
    "aria-label": "Toggle Cinema Mode"
  }, [
    el("span", {}, "👁️"),
    el("span", { className: "cinema-text" }, "CINEMA VIEW")
  ]);

  cinemaBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      const isCinema = heroSection.classList.toggle("is-cinema-mode");
      cinemaBtn.querySelector(".cinema-text").textContent = isCinema ? "SHOW INFO" : "CINEMA VIEW";
      cinemaBtn.classList.toggle("is-active", isCinema);
    }
  });

  // Clean Hero Side Panel: Video Controls (Cinema View & Audio) + Tournament Squad Capacity
  const heroVideoControls = el("div", { className: "hero-ctrl-actions" }, [cinemaBtn, soundBtn]);
  const heroSidePanel = el("div", { className: "hero-side-panel" }, [
    heroVideoControls,
    slotStatus
  ]);

  // The hero content grid
  const heroGrid = el("div", { className: "hero-content-grid wrap", id: "heroContentGrid" }, [
    heroText,
    heroSidePanel
  ]);

  // Floating exit button when in cinema mode
  const exitCinemaBtn = el("button", {
    className: "cinema-exit-floating-btn",
    type: "button"
  }, "✕ Exit Cinema Mode");

  exitCinemaBtn.addEventListener("click", () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.classList.remove("is-cinema-mode");
      cinemaBtn.querySelector(".cinema-text").textContent = "CINEMA VIEW";
      cinemaBtn.classList.remove("is-active");
    }
  });

  return el("section", { className: "hero hero-video-section", id: "hero" }, [
    bgVideo,
    videoOverlay,
    heroGrid,
    exitCinemaBtn
  ]);
}

/**
 * Lightweight, hardware-accelerated Canvas 3D Precision Core Engine
 * Renders an interactive 3D metallic-glass geometric form with orbital Electric Blue rings and Signal Red beacon
 */
function initHero3DEngine(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext ? canvas.getContext("2d") : null;
  if (!ctx) return;

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let width = 0;
  let height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 320;
    height = rect.height || 220;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  // 3D Polyhedron Geometries: Octahedron + Inset Core
  const baseVertices = [
    [0, 1.3, 0],   // Top
    [1.1, 0, 0],   // Right
    [0, 0, 1.1],   // Front
    [-1.1, 0, 0],  // Left
    [0, 0, -1.1],  // Back
    [0, -1.3, 0]   // Bottom
  ];

  const faces = [
    [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], // Top pyramid
    [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]  // Bottom pyramid
  ];

  let rotX = 0.3;
  let rotY = 0.5;
  let targetRotX = 0.3;
  let targetRotY = 0.5;
  let isRunning = true;
  let animId = null;

  // Pointer-responsive rotation
  window.addEventListener("mousemove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetRotY = ((e.clientX - cx) / cx) * 0.9;
    targetRotX = ((e.clientY - cy) / cy) * 0.7 + 0.2;
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
    } else {
      isRunning = true;
      lastTime = performance.now();
      loop(lastTime);
    }
  });

  let lastTime = performance.now();

  function loop(now) {
    if (!isRunning) return;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Smooth inertia rotation
    rotX += (targetRotX - rotX) * (dt * 3.5);
    rotY += (targetRotY - rotY) * (dt * 3.5) + (dt * 0.45); // Constant subtle spin

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.36;
    const fl = 4.0;

    // Transform vertices
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

    const projected = baseVertices.map(([x, y, z]) => {
      // Rotate Y
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      // Rotate X
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const pScale = fl / (fl + z2 + 2.5);
      return {
        px: cx + x1 * scale * pScale,
        py: cy + y2 * scale * pScale,
        z: z2
      };
    });

    // Render 3D faces sorted by average Z (Painter's algorithm)
    const faceData = faces.map((indices) => {
      const v0 = projected[indices[0]];
      const v1 = projected[indices[1]];
      const v2 = projected[indices[2]];
      const avgZ = (v0.z + v1.z + v2.z) / 3;

      // Surface normal for lighting
      const ux = v1.px - v0.px, uy = v1.py - v0.py;
      const vx = v2.px - v0.px, vy = v2.py - v0.py;
      const normalZ = ux * vy - uy * vx;

      return { indices, avgZ, normalZ, v0, v1, v2 };
    });

    faceData.sort((a, b) => b.avgZ - a.avgZ);

    faceData.forEach(f => {
      if (f.normalZ < 0) return; // Backface culling

      // Calculate directional lighting from top-right Electric Blue emitter
      const lightFactor = Math.max(0.12, Math.min(0.9, 0.4 + (f.avgZ * 0.25)));

      ctx.beginPath();
      ctx.moveTo(f.v0.px, f.v0.py);
      ctx.lineTo(f.v1.px, f.v1.py);
      ctx.lineTo(f.v2.px, f.v2.py);
      ctx.closePath();

      // Obsidian Black surface with Electric Blue specular tone
      const r = Math.floor(8 + 12 * lightFactor);
      const g = Math.floor(10 + 82 * lightFactor);
      const b = Math.floor(15 + 240 * lightFactor);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.72)`;
      ctx.fill();

      // Precision Electric Blue Wireframe Edges
      ctx.strokeStyle = `rgba(20, 92, 255, ${0.35 + lightFactor * 0.55})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    });

    // Orbital Electric Blue Telemetry Ring
    ctx.save();
    ctx.translate(cx, cy);
    const ringRadius = scale * 1.35;
    ctx.scale(1, 0.38);
    ctx.rotate(rotY * 0.8);

    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(20, 92, 255, 0.32)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Orbiting Signal Red Telemetry Beacon Node
    const nodeAngle = now * 0.002;
    const nx = Math.cos(nodeAngle) * ringRadius;
    const ny = Math.sin(nodeAngle) * ringRadius;
    ctx.beginPath();
    ctx.arc(nx, ny, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = "#FF303B";
    ctx.shadowColor = "#FF303B";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);
}
