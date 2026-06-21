const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

// Generic send helper — no-ops (with a log) when SMTP isn't configured
const sendEmail = async ({ to, subject, html, text, attachments }) => {
  const t = getTransporter();
  if (!t) {
    const att = attachments?.length ? ` (+${attachments.length} attachment)` : '';
    console.log(`✉️  [email skipped — SMTP not configured] to=${to} subject="${subject}"${att}`);
    return { skipped: true };
  }
  return t.sendMail({
    from: `"ParkEase" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
};

const sendBookingConfirmation = async (user, booking, spot, attachments) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#7c3aed;">🅿️ Booking Confirmed!</h2>
      <p>Hi ${user.name},</p>
      <p>Your parking spot at <strong>${spot.name}</strong> is booked.</p>
      <ul>
        <li><strong>From:</strong> ${new Date(booking.startTime).toLocaleString()}</li>
        <li><strong>To:</strong> ${new Date(booking.endTime).toLocaleString()}</li>
        <li><strong>Vehicle:</strong> ${booking.vehicle.number}</li>
        <li><strong>Amount:</strong> ₹${booking.amount}</li>
      </ul>
      <p>Your receipt is attached as a PDF. Show the QR code in your booking history at the entrance.</p>
      <p>— Team ParkEase</p>
    </div>`;
  return sendEmail({ to: user.email, subject: 'Your ParkEase booking is confirmed', html, attachments });
};

const sendPasswordReset = async (user, resetUrl) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#7c3aed;">Reset your password</h2>
      <p>Hi ${user.name}, click the link below to reset your password. It expires in 30 minutes.</p>
      <p><a href="${resetUrl}" style="color:#7c3aed;">${resetUrl}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    </div>`;
  return sendEmail({ to: user.email, subject: 'Reset your ParkEase password', html });
};

module.exports = { sendEmail, sendBookingConfirmation, sendPasswordReset };
