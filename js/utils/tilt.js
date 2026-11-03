/**
 * Interactive 3D Card Tilt with Specular Glare Effect
 * Applies smooth 3D perspective tilt to elements with [data-tilt]
 */
export function initCardTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return; // Skip on mobile touch devices

  const tiltCards = document.querySelectorAll("[data-tilt]");

  tiltCards.forEach((card) => {
    // Add specular glare overlay
    let glare = card.querySelector(".tilt-glare");
    if (!glare) {
      glare = document.createElement("div");
      glare.className = "tilt-glare";
      card.style.position = "relative";
      card.style.overflow = "hidden";
      card.appendChild(glare);
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      card.style.transition = "transform 0.1s ease-out";

      // Move specular glare
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)`;
      glare.style.opacity = "1";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      card.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
      if (glare) glare.style.opacity = "0";
    });
  });
}

