const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');

// Availability is derived from bookings, never stored as a running total.
// A booking holds a space from creation until it is cancelled or completed.
// 'pending' holds too — that is the checkout hold, released automatically by
// the TTL on Booking.expiresAt when the payment never lands.
const HOLD_STATUSES = ['pending', 'confirmed', 'active'];

// Spaces actually offered for booking (owners can take some out of service).
const capacityOf = (spot) => Math.max(0, spot.totalSpots - (spot.blockedSpots || 0));

// Bookings overlapping [start, end). Half-open, so a booking ending at 14:00
// does not clash with one starting at 14:00.
const holdFilter = (spotId, start, end) => ({
  parkingSpot: spotId,
  status: { $in: HOLD_STATUSES },
  startTime: { $lt: end },
  endTime: { $gt: start },
});

// Free spaces at `spot` for the window [start, end). Pass excludeId to ignore a
// booking's own hold when re-checking it. start === end asks "free right now".
const freeBetween = async (spot, start, end, excludeId) => {
  const filter = holdFilter(spot._id, start, end);
  if (excludeId) filter._id = { $ne: excludeId };
  return capacityOf(spot) - (await Booking.countDocuments(filter));
};

// Recompute and persist the cached `availableSpots` (= free right now) for one
// spot. Returns the spot so callers can emit the socket update.
const refreshSpot = async (spotId) => {
  const spot = await ParkingSpot.findById(spotId);
  if (!spot) return null;
  const now = new Date();
  spot.availableSpots = Math.max(0, await freeBetween(spot, now, now));
  await spot.save();
  return spot;
};

// Overwrite `availableSpots` on a page of results with the live count — one
// aggregate for the whole page. Every read path goes through here, so the
// stored field is only ever a cache and can never drift.
const applyLiveAvailability = async (spots) => {
  if (!spots || !spots.length) return spots;
  const now = new Date();

  const held = await Booking.aggregate([
    {
      $match: {
        parkingSpot: { $in: spots.map((s) => s._id) },
        status: { $in: HOLD_STATUSES },
        startTime: { $lt: now },
        endTime: { $gt: now },
      },
    },
    { $group: { _id: '$parkingSpot', held: { $sum: 1 } } },
  ]);

  const byId = new Map(held.map((h) => [String(h._id), h.held]));
  for (const spot of spots) {
    spot.availableSpots = Math.max(0, capacityOf(spot) - (byId.get(String(spot._id)) || 0));
  }
  return spots;
};

module.exports = { HOLD_STATUSES, capacityOf, freeBetween, refreshSpot, applyLiveAvailability };
