// Shared ParkEase knowledge used both as the Claude system prompt and as the
// basis for the no-API-key rule-based fallback responder.

const HELPLINE = '+91 1800 123 4567';

const KNOWLEDGE = `
ParkEase is a smart parking finder and booking platform. Drivers find parking on a
live map, compare spots, and reserve & pay in advance for a guaranteed space.
Owners list their lots/driveways and manage bookings and revenue.

Key facts:
- Finding parking: open the map (home page) or Search to see nearby spots with
  real-time availability (green = available, amber = few left, red = full).
  Filter by price, type, rating and amenities.
- Booking: open a spot, pick start/end time and your vehicle, then pay. You get a
  QR-code pass and the booking appears under "My Bookings".
- Payments: handled securely via Razorpay (UPI, cards, wallets, net banking).
- Cancellations & refunds: cancel from "My Bookings". Paid bookings are refunded
  automatically to the original payment method and the spot is released.
- Failed payment: the booking stays "pending" and the spot is NOT held; retry
  payment from "My Bookings".
- Reviews: only drivers who actually booked a spot can rate it.
- Owners: register/switch to an owner account, then use the Owner Dashboard →
  Add Spot to list a location with pricing and photos, and track bookings/revenue.
- Monitoring: the Park.Guard dashboard shows live CCTV and impact alerts for an
  active booking.
- Accounts: sign up with email or Google. Manage profile and vehicles under Profile.
- Support: 24/7 helpline ${HELPLINE}, or the Help page contact form.
`.trim();

const SYSTEM_PROMPT = `You are the ParkEase Assistant, a friendly, concise support chatbot for the ParkEase smart-parking app.

Use ONLY the following product knowledge to answer. If a question is outside ParkEase or you are unsure, say so briefly and point the user to the Help page or the 24/7 helpline ${HELPLINE}. For account-specific actions (a particular booking, payment, or refund) you cannot access user data — guide them to the relevant page ("My Bookings", "Profile", the Help form) or the helpline.

Keep answers under ~120 words, plain and warm. Do not invent prices, policies, or features that aren't below. Never ask for passwords or card details.

PRODUCT KNOWLEDGE:
${KNOWLEDGE}`;

// Lightweight keyword responder for when no ANTHROPIC_API_KEY is configured.
// Ordered most-specific → most-generic so the right intent wins.
const RULES = [
  {
    test: /(refund|cancel|cancellation)/i,
    answer: `You can cancel from "My Bookings" — choose the booking and tap Cancel. Paid bookings are refunded automatically to your original payment method, and the spot is released right away.`,
  },
  {
    test: /(owner|list (my|a|your)|rent out|my (lot|space|driveway)|earn|host)/i,
    answer: `To list your space, use an owner account → Owner Dashboard → Add Spot. Set your address, pricing and photos, and track bookings and revenue from the dashboard.`,
  },
  {
    test: /(monitor|cctv|security|park.?guard|is.*safe)/i,
    answer: `Monitored lots stream live CCTV and impact alerts to the Park.Guard dashboard for your active booking, so you're notified of any activity.`,
  },
  {
    test: /(review|rating|rate)/i,
    answer: `Only drivers who actually booked a spot can review it, so ratings reflect real experiences. Add a review from the spot's details page after your booking.`,
  },
  {
    test: /(price|pricing|cost|charge|how much|fee)/i,
    answer: `Each spot sets its own pricing (hourly/daily/monthly), shown on the spot and during booking with a full cost breakdown before you pay.`,
  },
  {
    test: /(pay|payment|razorpay|upi|card|wallet|fail)/i,
    answer: `Payments are handled securely via Razorpay (UPI, cards, wallets, net banking). If a payment fails, the booking stays "pending" and the spot isn't held — just retry payment from "My Bookings".`,
  },
  {
    test: /(account|sign ?up|register|login|profile|vehicle)/i,
    answer: `Sign up with email or Google. You can manage your profile and saved vehicles under Profile, and view trips under "My Bookings".`,
  },
  {
    test: /(book|reserve|reservation|find.*park|where.*park|how.*park)/i,
    answer: `Open the map on the home page or use Search to find nearby spots with live availability. Pick a spot, choose your time and vehicle, then pay — you'll get a QR-code pass under "My Bookings".`,
  },
  {
    test: /(help|support|contact|phone|call|number|talk)/i,
    answer: `Our 24/7 helpline is ${HELPLINE}. You can also use the contact form on the Help page and we'll get back to you shortly.`,
  },
  {
    test: /^(hi|hello|hey|thanks|thank you|yo|hii)\b/i,
    answer: `Hi! I'm the ParkEase assistant. Ask me about finding parking, booking, payments, refunds, listing your space, or anything else about ParkEase.`,
  },
];

const FALLBACK = `I'm not sure about that one. I can help with finding parking, booking, payments, refunds, listing a space, or monitoring. For anything else, visit the Help page or call our 24/7 helpline ${HELPLINE}.`;

const ruleReply = (message = '') => {
  const text = String(message);
  const hit = RULES.find((r) => r.test.test(text));
  return hit ? hit.answer : FALLBACK;
};

module.exports = { KNOWLEDGE, SYSTEM_PROMPT, ruleReply, HELPLINE };
