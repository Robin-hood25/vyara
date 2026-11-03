import { sanitizeUrl } from "./security.js";

/**
 * Creates a DOM element with safe attributes and children.
 * Prevents HTML injection vulnerabilities.
 * @param {string} tag
 * @param {Object} [props]
 * @param {Array<Node|string>|Node|string} [children]
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, children = []) {
  const element = document.createElement(tag);

  for (const [key, val] of Object.entries(props)) {
    if (val === undefined || val === null) continue;

    if (key === "className") {
      element.className = val;
    } else if (key === "dataset" && typeof val === "object") {
      for (const [dKey, dVal] of Object.entries(val)) {
        element.dataset[dKey] = dVal;
      }
    } else if (key === "href") {
      element.setAttribute("href", sanitizeUrl(val));
    } else if (key === "on" && typeof val === "object") {
      for (const [evt, handler] of Object.entries(val)) {
        element.addEventListener(evt, handler);
      }
    } else if (key === "hidden") {
      element.hidden = Boolean(val);
    } else if (key === "required" || key === "novalidate") {
      if (val) element.setAttribute(key, "");
    } else {
      element.setAttribute(key, String(val));
    }
  }

  const childList = Array.isArray(children) ? children : [children];
  for (const child of childList) {
    if (child === undefined || child === null) continue;
    if (typeof child === "string" || typeof child === "number") {
      element.appendChild(document.createTextNode(String(child)));
    } else if ((typeof Node !== "undefined" && child instanceof Node) || (child && child.nodeType)) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Formats a number to Indian Rupee currency format (e.g. ₹10,000).
 * @param {number} n
 * @returns {string}
 */
export function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
