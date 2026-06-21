const PDFDocument = require('pdfkit');

const BRAND = '#7c3aed';
const INK = '#0f0f1a';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

const HELPLINE = '+91 1800 123 4567';
const SUPPORT_EMAIL = 'support@parkease.app';

// Helvetica has no ₹ glyph, so use a safe "INR" prefix.
const inr = (n) =>
  'INR ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

// Builds a branded PDF receipt for a paid booking and resolves a Buffer.
function buildInvoicePdf({ booking, user, spot, payment }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const invoiceNo = `INV-${String(booking._id).slice(-8).toUpperCase()}`;
    const left = 50;
    const right = 545;

    // ---- Header band ----
    doc.rect(0, 0, doc.page.width, 110).fill(INK);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(22).text('ParkEase', left, 38);
    doc.fillColor('#c4b5fd').font('Helvetica').fontSize(9).text('Smart Parking · Reserved in advance', left, 66);
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('RECEIPT', right - 150, 40, { width: 150, align: 'right' });
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#c4b5fd')
      .text(invoiceNo, right - 150, 64, { width: 150, align: 'right' })
      .text(fmtDateTime(booking.createdAt || Date.now()), right - 150, 78, { width: 150, align: 'right' });

    doc.fillColor(INK);
    let y = 140;

    // ---- Billed to ----
    doc.font('Helvetica-Bold').fontSize(10).fillColor(MUTED).text('BILLED TO', left, y);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text(user?.name || 'Customer', left, y + 16);
    doc.font('Helvetica').fontSize(10).fillColor(MUTED);
    if (user?.email) doc.text(user.email, left, y + 34);
    if (user?.phone) doc.text(user.phone, left, y + 48);

    // ---- Status badge (right) ----
    const paid = ['confirmed', 'active', 'completed'].includes(booking.status);
    doc
      .roundedRect(right - 90, y, 90, 24, 6)
      .fill(paid ? '#16a34a' : '#f59e0b');
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(paid ? 'PAID' : (booking.status || '').toUpperCase(), right - 90, y + 7, { width: 90, align: 'center' });

    y += 84;

    // ---- Parking details ----
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(12).text('Parking details', left, y);
    y += 8;
    doc.moveTo(left, y + 12).lineTo(right, y + 12).strokeColor(LINE).stroke();
    y += 22;

    const row = (label, value) => {
      doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(label, left, y, { width: 150 });
      doc.font('Helvetica').fontSize(10).fillColor(INK).text(String(value), left + 160, y, { width: right - left - 160 });
      y += 20;
    };
    row('Location', spot?.name || 'Parking spot');
    if (spot?.address) {
      row('Address', spot.address.formatted || `${spot.address.street || ''}, ${spot.address.city || ''}`.trim());
    }
    row('From', fmtDateTime(booking.startTime));
    row('To', fmtDateTime(booking.endTime));
    row('Duration', `${booking.duration} hour${booking.duration === 1 ? '' : 's'}`);
    if (booking.vehicle?.number) row('Vehicle', `${booking.vehicle.number}${booking.vehicle.type ? ` (${booking.vehicle.type})` : ''}`);

    y += 10;

    // ---- Amount table ----
    doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text('Summary', left, y);
    y += 8;
    doc.moveTo(left, y + 12).lineTo(right, y + 12).strokeColor(LINE).stroke();
    y += 22;

    const lineItem = (desc, amount, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 12 : 10).fillColor(INK);
      doc.text(desc, left, y, { width: 360 });
      doc.text(inr(amount), left + 360, y, { width: right - left - 360, align: 'right' });
      y += bold ? 24 : 20;
    };
    lineItem(`Parking fee — ${spot?.name || 'spot'}`, booking.amount);
    doc.moveTo(left, y + 2).lineTo(right, y + 2).strokeColor(LINE).stroke();
    y += 12;
    lineItem('Total paid', booking.amount, true);

    y += 10;

    // ---- Payment info ----
    if (payment) {
      doc.font('Helvetica').fontSize(9).fillColor(MUTED);
      doc.text(`Payment ID: ${payment.razorpayPaymentId || payment._id}`, left, y);
      y += 14;
      doc.text(`Method: ${payment.method || 'Razorpay'}  ·  Status: ${payment.status || 'paid'}`, left, y);
      y += 14;
    }

    // ---- Footer ---- (kept within the bottom margin so it stays one page)
    const fy = 720;
    doc.moveTo(left, fy).lineTo(right, fy).strokeColor(LINE).stroke();
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text(`Thank you for choosing ParkEase.  Need help? ${HELPLINE} · ${SUPPORT_EMAIL}`, left, fy + 10, {
        width: right - left,
        align: 'center',
      });
    doc.fillColor(BRAND).fontSize(8).text('This is a computer-generated receipt.', left, fy + 26, { width: right - left, align: 'center' });

    doc.end();
  });
}

module.exports = { buildInvoicePdf };
