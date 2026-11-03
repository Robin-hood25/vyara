/**
 * Interactive 3D Card Tilt with Specular Glare & Parallax Depth Engine
 * Hardware-accelerated 3D perspective tilt across desktop mouse & mobile touch devices.
 */
export function initCardTilt() {
  if (typeof window === "undefined") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const tiltCards = document.querySelectorAll("[data-tilt]");

  tiltCards.forEach((card) => {
    // Avoid double-binding if already initialized
    if (card._tiltInitialized) return;
    card._tiltInitialized = true;

    // Specular glare reflection overlay
    let glare = card.querySelector(".tilt-glare");
    if (!glare) {
      glare = document.createElement("div");
      glare.className = "tilt-glare";
      card.appendChild(glare);
    }

    const getBaseTranslateY = () => {
      return card.classList.contains("p1") && window.innerWidth > 768 ? -16 : 0;
    };

    const handleTilt = (clientX, clientY) => {
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max 12 deg tilt for punchy, responsive 3D feel
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      const baseY = getBaseTranslateY();
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(${baseY - 6}px)`;
      card.style.transition = "transform 0.08s ease-out";

      // Move specular holographic glare
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0) 70%)`;
      glare.style.opacity = "1";
    };

    const resetTilt = () => {
      const baseY = getBaseTranslateY();
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(${baseY}px)`;
      card.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
      if (glare) glare.style.opacity = "0";
    };

    // 1. Mouse Tracking (Works on all desktops & laptops, including touchscreen laptops)
    card.addEventListener("mousemove", (e) => {
      handleTilt(e.clientX, e.clientY);
    }, { passive: true });

    card.addEventListener("mouseleave", resetTilt, { passive: true });

    // 2. Touch Tracking (Mobile & Tablet touch drag)
    card.addEventListener("touchmove", (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const rect = card.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        handleTilt(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    card.addEventListener("touchend", resetTilt, { passive: true });
    card.addEventListener("touchcancel", resetTilt, { passive: true });
  });
}
