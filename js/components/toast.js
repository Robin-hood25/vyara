import { el } from "../utils/dom.js";

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = el("div", {
      id: "toastContainer",
      role: "region",
      "aria-live": "polite",
      className: "toast-container"
    });
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Displays a sleek, glassmorphic toast notification
 * @param {string} message
 * @param {'success'|'info'|'warning'} type
 * @param {number} duration
 */
export function showToast(message, type = "success", duration = 3000) {
  const container = getToastContainer();

  const iconMap = {
    success: "✓",
    info: "ℹ",
    warning: "⚠"
  };

  const icon = el("span", { className: "toast-icon" }, iconMap[type] || "✓");
  const text = el("span", { className: "toast-text" }, message);
  const toast = el("div", { className: `toast toast-${type}` }, [icon, text]);

  container.appendChild(toast);

  // Trigger smooth enter animation
  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
    toast.addEventListener(
      "transitionend",
      () => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      },
      { once: true }
    );
  }, duration);
}

