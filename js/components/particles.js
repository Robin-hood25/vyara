/**
 * Interactive Cyber / Battle-Royale Fire Embers Particle Canvas
 * Lightweight, hardware accelerated, automatically throttled when hidden
 */
export function initParticleCanvas() {
  if (typeof document === "undefined" || !document.body) return;

  // Don't re-create if already present
  if (document.getElementById("particleCanvas")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "particleCanvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "0";
  canvas.style.opacity = "0.7";

  if (document.body.prepend) {
    document.body.prepend(canvas);
  } else if (document.body.firstChild) {
    document.body.insertBefore(canvas, document.body.firstChild);
  } else {
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext ? canvas.getContext("2d") : null;
  if (!ctx) return;

  // Check reduced motion
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let width = (canvas.width = window.innerWidth || 1080);
  let height = (canvas.height = window.innerHeight || 800);

  const particles = [];
  const PARTICLE_COUNT = Math.min(45, Math.floor(width / 30));

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 0.8;
      this.speedY = Math.random() * 0.45 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.4 + 0.15;
      this.fade = Math.random() * 0.003 + 0.001;
      // Electric Blue (#145CFF, hue ~221) dominant with rare Signal Red (#FF303B, hue ~357) spark
      const isRed = Math.random() < 0.15;
      this.hue = isRed ? 357 : 221;
      this.lightness = isRed ? 59 : 54;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.opacity -= this.fade;

      if (this.opacity <= 0 || this.y < -10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.lightness}%, ${this.opacity})`;
      ctx.shadowBlur = this.size * 4;
      ctx.shadowColor = `hsla(${this.hue}, 100%, ${this.lightness}%, 0.6)`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  let animationFrameId;
  let isRunning = true;

  function render() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    animationFrameId = requestAnimationFrame(render);
  }

  render();

  function onResize() {
    width = canvas.width = window.innerWidth || 1080;
    height = canvas.height = window.innerHeight || 800;
  }

  window.addEventListener("resize", onResize, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isRunning = false;
      if (typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(animationFrameId);
      }
    } else {
      isRunning = true;
      render();
    }
  });
}
