const ParkingSpot = require('../models/ParkingSpot');
const { asyncHandler } = require('../middleware/errorHandler');
const { emitAvailabilityUpdate } = require('../services/socketService');
const { applyLiveAvailability, refreshSpot } = require('../utils/availability');

// Build a Mongo filter object from query params shared by search & list
const buildFilters = (query) => {
  const filter = { isActive: true, isApproved: true };

  if (query.type) filter.type = query.type;
  if (query.parkingType) filter.parkingType = query.parkingType;
  if (query.minRating) filter.averageRating = { $gte: Number(query.minRating) };

  if (query.maxPrice) {
    filter['pricing.hourly'] = { $lte: Number(query.maxPrice) };
  }

  if (query.amenities) {
    const list = Array.isArray(query.amenities) ? query.amenities : String(query.amenities).split(',');
    filter.amenities = { $all: list };
  }

  // NB: availableOnly is NOT a DB filter — availableSpots in Mongo is a stale
  // cache. It is applied after applyLiveAvailability() on the result set.
  return filter;
};

const filterAvailable = (spots, query) =>
  query.availableOnly === 'true' ? spots.filter((s) => s.availableSpots > 0) : spots;

// @route   GET /api/spots/nearby?lat=&lng=&radius=
const getNearbySpots = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('lat and lng query params are required');
  }

  const filter = buildFilters(req.query);
  filter.location = {
    $near: {
      $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
      $maxDistance: Number(radius), // metres
    },
  };

  const found = filterAvailable(await applyLiveAvailability(await ParkingSpot.find(filter).limit(100)), req.query);
  res.json({ success: true, count: found.length, spots: found });
});

// @route   GET /api/spots/search?q=&...filters
const searchSpots = asyncHandler(async (req, res) => {
  const { q, sort = 'distance', lat, lng } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);

  const filter = buildFilters(req.query);

  // Geo-sorted search via aggregation ($geoNear must be the first stage).
  // Note: $geoNear's query cannot contain $text, so we only take this path
  // when there's no free-text query — text searches use the find() path below.
  if (sort === 'distance' && lat && lng && !q) {
    const spots = await ParkingSpot.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          distanceField: 'distance',
          spherical: true,
          query: filter,
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
    const found = filterAvailable(await applyLiveAvailability(spots), req.query);
    return res.json({ success: true, count: found.length, page, spots: found });
  }

  if (q) filter.$text = { $search: q };

  let queryBuilder = ParkingSpot.find(filter);
  if (sort === 'price') queryBuilder = queryBuilder.sort({ 'pricing.hourly': 1 });
  else if (sort === 'rating') queryBuilder = queryBuilder.sort({ averageRating: -1 });
  else queryBuilder = queryBuilder.sort({ createdAt: -1 });

  const spots = await queryBuilder.skip((page - 1) * limit).limit(limit);
  const total = await ParkingSpot.countDocuments(filter);
  // ponytail: availableOnly trims the current page only, so `total` ignores it.
  // Move to an aggregation with a $lookup on bookings if exact counts matter.
  const found = filterAvailable(await applyLiveAvailability(spots), req.query);
  res.json({ success: true, count: found.length, total, page, spots: found });
});

// @route   GET /api/spots/:id
const getSpot = asyncHandler(async (req, res) => {
  const spot = await ParkingSpot.findById(req.params.id)
    .populate('owner', 'name avatar')
    .populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 }, limit: 10 },
      populate: { path: 'user', select: 'name avatar' },
    });

  if (!spot) {
    res.status(404);
    throw new Error('Parking spot not found');
  }
  await applyLiveAvailability([spot]);
  res.json({ success: true, spot });
});

// Only these fields may be set by an owner — prevents mass assignment of
// owner, isApproved, averageRating, totalReviews, etc.
const OWNER_EDITABLE = [
  'name', 'description', 'address', 'location', 'type', 'parkingType',
  'totalSpots', 'blockedSpots', 'pricing', 'amenities', 'operatingHours',
  'images', 'isActive',
];
const pickEditable = (body) => {
  const out = {};
  for (const key of OWNER_EDITABLE) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
};

// @route   POST /api/spots  (owner)
const createSpot = asyncHandler(async (req, res) => {
  const data = { ...pickEditable(req.body), owner: req.user._id };
  if (data.availableSpots === undefined) data.availableSpots = data.totalSpots;
  const spot = await ParkingSpot.create(data);
  res.status(201).json({ success: true, spot });
});

// @route   GET /api/spots/owner/mine  (owner)
const getMySpots = asyncHandler(async (req, res) => {
  const spots = await applyLiveAvailability(
    await ParkingSpot.find({ owner: req.user._id }).sort({ createdAt: -1 })
  );
  res.json({ success: true, count: spots.length, spots });
});

const ensureOwnership = (spot, user) => {
  if (!spot) {
    const err = new Error('Parking spot not found');
    err.statusCode = 404;
    throw err;
  }
  if (String(spot.owner) !== String(user._id) && user.role !== 'admin') {
    const err = new Error('Not authorized to modify this spot');
    err.statusCode = 403;
    throw err;
  }
};

// @route   PUT /api/spots/:id  (owner)
const updateSpot = asyncHandler(async (req, res) => {
  const spot = await ParkingSpot.findById(req.params.id);
  try {
    ensureOwnership(spot, req.user);
  } catch (e) {
    res.status(e.statusCode || 400);
    throw e;
  }

  Object.assign(spot, pickEditable(req.body));
  await spot.save();
  res.json({ success: true, spot });
});

// @route   DELETE /api/spots/:id  (owner)
const deleteSpot = asyncHandler(async (req, res) => {
  const spot = await ParkingSpot.findById(req.params.id);
  try {
    ensureOwnership(spot, req.user);
  } catch (e) {
    res.status(e.statusCode || 400);
    throw e;
  }
  await spot.deleteOne();
  res.json({ success: true, message: 'Parking spot deleted' });
});

// @route   PUT /api/spots/:id/availability  (owner)
// The owner declares how many spaces are open for business; live bookings are
// subtracted from that, so this sets blockedSpots rather than availableSpots.
const updateAvailability = asyncHandler(async (req, res) => {
  const { availableSpots } = req.body;
  const spot = await ParkingSpot.findById(req.params.id);
  try {
    ensureOwnership(spot, req.user);
  } catch (e) {
    res.status(e.statusCode || 400);
    throw e;
  }

  const open = Math.max(0, Math.min(Number(availableSpots) || 0, spot.totalSpots));
  spot.blockedSpots = spot.totalSpots - open;
  await spot.save();

  const updated = await refreshSpot(spot._id);
  emitAvailabilityUpdate(updated._id, updated.availableSpots, updated.totalSpots);
  res.json({ success: true, spot: updated });
});

module.exports = {
  getNearbySpots,
  searchSpots,
  getSpot,
  createSpot,
  getMySpots,
  updateSpot,
  deleteSpot,
  updateAvailability,
};
