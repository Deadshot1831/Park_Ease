// Availability status helpers shared by map pins and cards
export const availabilityLevel = (available, total) => {
  if (!available || available <= 0) return 'full';
  if (total && available / total <= 0.25) return 'limited';
  return 'available';
};

export const availabilityColor = {
  available: '#16a34a',
  limited: '#f59e0b',
  full: '#dc2626',
};

export const availabilityLabel = {
  available: 'Available',
  limited: 'Few spots left',
  full: 'Full',
};

export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    amount || 0
  );

// Haversine distance in km between two [lat, lng] points
export const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const directionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export const AMENITY_LABELS = {
  cctv: 'CCTV',
  ev_charging: 'EV Charging',
  wheelchair: 'Wheelchair Access',
  '24x7': '24×7',
  security_guard: 'Security Guard',
  covered: 'Covered',
  valet: 'Valet',
  car_wash: 'Car Wash',
  restroom: 'Restroom',
  lighting: 'Well Lit',
};
