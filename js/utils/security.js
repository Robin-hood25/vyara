/**
 * Security & Sanitization Utilities
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "upi:", "whatsapp:", "tel:", "mailto:"]);

/**
 * Strips dangerous control characters and trims text.
 * @param {string} input
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeText(input, maxLength = 200) {
  if (typeof input !== "string") return "";
  // Strip control characters (except newline and tab)
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Escapes characters for safe HTML inclusion.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validates and sanitizes a URL against allowed protocols.
 * Prevents javascript: and dangerous scheme injections.
 * @param {string} url
 * @param {Set<string>} [protocols]
 * @returns {string} Safe URL or '#'
 */
export function sanitizeUrl(url, protocols = ALLOWED_PROTOCOLS) {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();

  // Allow anchor hashes and relative root paths
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    if (/^[#/][a-zA-Z0-9_\-\/?&=#%]*$/.test(trimmed)) {
      return trimmed;
    }
  }

  try {
    const parsed = new URL(trimmed);
    if (protocols.has(parsed.protocol.toLowerCase())) {
      return trimmed;
    }
  } catch {
    // If not a standard URL, check custom schemes like upi:// or whatsapp://
    const match = trimmed.match(/^([a-zA-Z0-9+.-]+):/);
    if (match && protocols.has(match[1].toLowerCase() + ":")) {
      return trimmed;
    }
  }

  return "#";
}

/**
 * Sanitizes a referral code to alphanumeric characters up to 12 chars.
 * @param {string} code
 * @returns {string}
 */
export function sanitizeReferralCode(code) {
  if (typeof code !== "string") return "";
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

/**
 * Validates tournament registration fields.
 * @param {Object} data
 * @returns {{ isValid: boolean, error?: string, sanitized?: Object }}
 */
export function validateRegistrationData(data = {}) {
  const name = sanitizeText(data.name || "", 60);
  const phone = sanitizeText(data.phone || "", 15);
  const ign = sanitizeText(data.ign || "", 40);
  const uid = sanitizeText(data.uid || "", 20);
  const ref = sanitizeReferralCode(data.ref || "");

  const entryType = sanitizeText(data.entryType || "squad", 10).toLowerCase();

  // Enforce ticket availability: Solo is permanently SOLD OUT
  if (entryType === "solo") {
    return {
      isValid: false,
      error: "Solo Entry is SOLD OUT. Only Squad registrations are currently accepted."
    };
  }

  if (name.length < 2) {
    return { isValid: false, error: "Enter your full name (minimum 2 characters)." };
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { isValid: false, error: "Enter a valid 10-digit mobile number." };
  }
  if (ign.length < 2) {
    return { isValid: false, error: "Enter your Free Fire in-game name." };
  }
  if (!/^\d{6,15}$/.test(uid)) {
    return { isValid: false, error: "Free Fire ID should be 6 to 15 digits." };
  }

  return {
    isValid: true,
    sanitized: { name, phone, ign, uid, ref, entryType: "squad" }
  };
}

