const QRCode = require('qrcode');

// Produces a base64 data-URL QR code encoding the booking reference
const generateBookingQR = async (booking) => {
  const payload = JSON.stringify({
    bookingId: String(booking._id),
    spot: String(booking.parkingSpot),
    vehicle: booking.vehicle?.number,
    start: booking.startTime,
    end: booking.endTime,
  });
  return QRCode.toDataURL(payload, { width: 300, margin: 2 });
};

module.exports = { generateBookingQR };
