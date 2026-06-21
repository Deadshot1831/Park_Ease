// Escape user-supplied text before interpolating into HTML email bodies,
// preventing HTML/script injection (phishing, content spoofing) in inboxes.
const escapeHtml = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

module.exports = { escapeHtml };
