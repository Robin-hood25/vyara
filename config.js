// ====== SITE CONFIGURATION ======
export const SITE = {
  companyName: "VYRA Esports",
  tagline: "Drop in. Outlast everyone. Take home ₹10,000.",
  eventName: "Free Fire Championship",
  city: "India / Global",
  eventDate: "", // Flexible countdown target
  eventDateText: "Tournament Date: TBA",
  tournamentDate: "TBA",
  venue: "Custom Battle Royale Rooms (Mobile Only)",
  whatsapp: "919876543210", // Tournament Admin WhatsApp
  upiId: "vyaraesports@upi", // Official Tournament UPI ID
  instagram: "https://www.instagram.com/vyara.digital?utm_source=ig_web_button_share_sheet&srtk=ZDNlZDc0MzIxNw==",
  entryFee: 1200, // Squad entry fee in INR
  entryFeeSolo: 350, // Solo entry fee (1 Player: ₹350 - SOLD OUT)
  entryFeeSquad: 1200, // Squad entry fee (1 Squad: ₹1,200 - AVAILABLE)
  entryFees: {
    solo: 350,
    squad: 1200
  },
  entryAvailability: {
    solo: false, // SOLD OUT - Registrations permanently closed
    squad: true  // ACTIVE - Open for registrations
  },
  commissionPerReferral: 50, // Rupees a referrer earns per paid registration
  prizes: {
    first: 10000, // 1st Prize: ₹10,000
    second: 5000, // 2nd Prize: ₹5,000
    luckyDraw: 10000 // Lucky Pool: ₹10,000 — Pre-bookings Only
  }
};

if (typeof window !== "undefined") {
  window.SITE = SITE;
}

export default SITE;
