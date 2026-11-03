/**
 * VYRA Esports — Booking & Demo Payment Store
 * Handles client-side storage, local caching, and server API synchronization.
 */

const STORAGE_KEYS = {
  TICKETS: "vyara_demo_tickets",
  BOOKINGS: "vyara_demo_bookings",
  USER_PHONE: "vyara_active_user_phone"
};

/**
 * Masks Indian mobile number (e.g., +91 98*** **210)
 * @param {string} phone
 * @returns {string}
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return "+91 98*** **000";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 10) {
    const p = cleaned.slice(-10);
    return `+91 ${p.slice(0, 2)}*** **${p.slice(-3)}`;
  }
  return phone;
}

/**
 * Retrieves all stored demo tickets from local storage
 * @param {string} [phone]
 * @returns {Array<Object>}
 */
export function getLocalTickets(phone) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    const tickets = raw ? JSON.parse(raw) : [];
    if (phone) {
      return tickets.filter((t) => t.phone === phone);
    }
    return tickets;
  } catch {
    return [];
  }
}

/**
 * Saves a verified demo ticket to local storage
 * @param {Object} ticket
 */
export function saveLocalTicket(ticket) {
  if (!ticket || !ticket.ticketId) return;
  try {
    const existing = getLocalTickets();
    const index = existing.findIndex((t) => t.ticketId === ticket.ticketId);
    if (index >= 0) {
      existing[index] = ticket;
    } else {
      existing.unshift(ticket);
    }
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(existing));
    if (ticket.phone) {
      localStorage.setItem(STORAGE_KEYS.USER_PHONE, ticket.phone);
    }
  } catch {
    // LocalStorage fallback
  }
}

/**
 * Requests a demo OTP from backend
 * @param {string} phone
 * @returns {Promise<{ success: boolean, demoOtp?: string, error?: string }>}
 */
export async function sendDemoOtp(phone) {
  try {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    return data;
  } catch {
    // Fallback in case of network issue
    return { success: true, demoOtp: "123456", message: "Demo OTP: 123456" };
  }
}

/**
 * Verifies the demo OTP with backend
 * @param {string} phone
 * @param {string} otp
 * @returns {Promise<{ success: boolean, verified?: boolean, error?: string }>}
 */
export async function verifyDemoOtp(phone, otp) {
  try {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    return data;
  } catch {
    if (otp === "123456") return { success: true, verified: true };
    return { success: false, error: "Incorrect OTP. Please enter 123456." };
  }
}

/**
 * Fetches authoritative ticket availability and pricing from server
 * @returns {Promise<Object>}
 */
export async function fetchTicketAvailability() {
  try {
    const res = await fetch("/api/tickets");
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    solo: {
      category: "SOLO",
      title: "SOLO PASS",
      available: false,
      status: "SOLD OUT",
      originalPrice: 500,
      price: 350,
      savings: 150,
      badge: "SOLD OUT",
      supportingText: "Solo registrations are currently sold out.",
      offerNote: "₹350 offer applies to pre-bookings only."
    },
    squad: {
      category: "SQUAD",
      title: "SQUAD PASS",
      available: true,
      status: "AVAILABLE",
      originalPrice: 2000,
      price: 1200,
      savings: 800,
      badge: "PRE-BOOKING OFFER",
      supportingText: "Offer valid for pre-bookings only.",
      offerNote: "Pre-booking offer active."
    }
  };
}

/**
 * Creates a pre-booking record on the server (Amount is strictly ₹1,200)
 * @param {Object} bookingData
 * @returns {Promise<{ success: boolean, booking?: Object, error?: string }>}
 */
export async function createPreBooking(bookingData) {
  try {
    const res = await fetch("/api/bookings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bookingData,
        category: "squad",
        entryType: "squad" // Strictly Squad
      })
    });
    const data = await res.json();
    return data;
  } catch {
    // Client fallback
    const bookingId = "VYRA-BK-" + Date.now().toString(36).toUpperCase();
    return {
      success: true,
      booking: {
        bookingId,
        holderName: bookingData.name,
        phone: bookingData.phone,
        ign: bookingData.ign,
        uid: bookingData.uid,
        amount: 1200,
        category: "SQUAD",
        originalPrice: 2000,
        savings: 800,
        offerCondition: "PRE-BOOKING OFFER ONLY",
        entryType: "squad",
        ticketType: "Squad Pre-Booking",
        bookingStatus: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        tournamentDate: "TBA"
      }
    };
  }
}

/**
 * Submits demo payment verification
 * @param {Object} payload { bookingId, demoUtr, phone, name, ign, uid }
 * @returns {Promise<{ success: boolean, ticket?: Object, error?: string }>}
 */
export async function verifyDemoPayment(payload) {
  try {
    const res = await fetch("/api/bookings/verify-demo-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success && data.ticket) {
      saveLocalTicket(data.ticket);
    }
    return data;
  } catch (err) {
    return { success: false, error: "Payment verification failed: " + err.message };
  }
}

/**
 * Retrieves all digital tickets from server & local storage for a specific phone number
 * @param {string} phone
 * @returns {Promise<Array<Object>>}
 */
export async function fetchMyTickets(phone) {
  if (!phone) return [];
  const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
  if (cleanPhone.length !== 10) return [];

  const local = getLocalTickets(cleanPhone);
  try {
    const url = `/api/bookings/my-tickets?phone=${encodeURIComponent(cleanPhone)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        // Merge without duplicates
        const map = new Map();
        local.forEach((t) => map.set(t.ticketId, t));
        data.tickets.forEach((t) => map.set(t.ticketId, t));
        return Array.from(map.values());
      }
    } else {
      throw new Error(`Server error: ${res.status}`);
    }
  } catch (err) {
    if (local.length > 0) return local;
    throw err;
  }
  return local;
}
