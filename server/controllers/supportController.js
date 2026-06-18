const SupportTicket = require('../models/SupportTicket');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../services/emailService');

const SUBJECT_LABELS = {
  booking: 'Booking issue',
  payment: 'Payment & refunds',
  owner: 'Owner / listing',
  technical: 'Technical problem',
  other: 'General enquiry',
};

// @route   POST /api/support
// Public contact form. Saves the ticket and notifies the support inbox; sends
// the user an acknowledgement. Email is best-effort (no-ops if SMTP unset).
const createTicket = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const ticket = await SupportTicket.create({
    name,
    email,
    phone,
    subject: SUBJECT_LABELS[subject] ? subject : 'other',
    message,
    user: req.user?._id,
  });

  const supportInbox = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
  const label = SUBJECT_LABELS[ticket.subject];

  // Notify the support team
  if (supportInbox) {
    sendEmail({
      to: supportInbox,
      subject: `[ParkEase Support] ${label} — ${name}`,
      html: `
        <h3>New support request</h3>
        <p><strong>From:</strong> ${name} (${email})${phone ? ` · ${phone}` : ''}</p>
        <p><strong>Topic:</strong> ${label}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, '<br>')}</p>
        <p style="color:#888">Ticket ${ticket._id}</p>`,
    }).catch(() => {});
  }

  // Acknowledge the sender
  sendEmail({
    to: email,
    subject: 'We’ve received your message — ParkEase Support',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#7c3aed;">Thanks, ${name}!</h2>
        <p>Our team has received your message about <strong>${label}</strong> and will get back to you shortly.</p>
        <p>Need urgent help? Call our 24/7 helpline at <strong>+91 1800 123 4567</strong>.</p>
        <p>— Team ParkEase</p>
      </div>`,
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Your message has been received. Our team will get back to you shortly.',
    ticketId: ticket._id,
  });
});

module.exports = { createTicket };
