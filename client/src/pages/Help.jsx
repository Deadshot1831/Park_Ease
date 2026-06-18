import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaHeadset, FaPhoneAlt, FaEnvelope, FaClock, FaWhatsapp,
  FaChevronDown, FaCheckCircle,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { submitContact } from '../services/supportService';

const HELPLINE = '+91 1800 123 4567';
const HELPLINE_TEL = '+911800123456';
const EMAIL = 'support@parkease.app';
const WHATSAPP = '+919000000000';

const SUBJECTS = [
  { v: 'booking', t: 'Booking issue' },
  { v: 'payment', t: 'Payment & refunds' },
  { v: 'owner', t: 'Owner / listing' },
  { v: 'technical', t: 'Technical problem' },
  { v: 'other', t: 'General enquiry' },
];

const FAQS = [
  { q: 'How do I cancel a booking and get a refund?', a: 'Open My Bookings, choose the booking and tap Cancel. Paid bookings are refunded automatically to your original payment method, and the spot is released instantly.' },
  { q: 'My payment failed but the spot looks booked — what now?', a: 'If a payment didn’t complete, the booking stays “pending” and the spot isn’t held. You can retry payment from My Bookings, or contact us and we’ll confirm the status for you.' },
  { q: 'How do I list my own parking space?', a: 'Create an account as an owner (or switch roles), then use the Owner Dashboard → Add Spot to publish your location, pricing and photos in a few minutes.' },
  { q: 'Is my vehicle monitored while parked?', a: 'Monitored lots stream CCTV and impact alerts to the Park.Guard dashboard. You’ll be notified of any activity related to your booking.' },
];

const ContactCard = ({ icon: Icon, label, value, href, sub }) => (
  <a
    href={href}
    target={href.startsWith('http') ? '_blank' : undefined}
    rel="noreferrer"
    className="card card-hover flex items-center gap-4 p-5"
  >
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
      <Icon className="text-lg" />
    </span>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="truncate font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  </a>
);

export default function Help() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: 'booking',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { message } = await submitContact(form);
      setSent(true);
      toast.success(message || 'Message sent!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      {/* Header */}
      <div className="text-center">
        <span className="badge mx-auto mb-3 border border-white/10 bg-white/5 text-brand-200">
          <FaHeadset className="text-neon-400" /> 24/7 Customer Support
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          How can we <span className="gradient-text">help?</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-400">
          Reach our helpline any time, or send us a message and we’ll get back to you shortly.
        </p>
      </div>

      {/* Helpline channels */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ContactCard icon={FaPhoneAlt} label="Call helpline" value={HELPLINE} href={`tel:${HELPLINE_TEL}`} sub="Toll-free · 24/7" />
        <ContactCard icon={FaEnvelope} label="Email us" value={EMAIL} href={`mailto:${EMAIL}`} sub="Replies within 24h" />
        <ContactCard icon={FaWhatsapp} label="WhatsApp" value="Chat with us" href={`https://wa.me/${WHATSAPP.replace('+', '')}`} sub="Mon–Sun, 8am–10pm" />
        <ContactCard icon={FaClock} label="Support hours" value="Always open" href="#contact" sub="Round the clock" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Contact form */}
        <div id="contact" className="card p-6">
          <h2 className="text-lg font-semibold text-white">Send us a message</h2>
          <p className="mt-1 text-sm text-slate-400">We typically respond within a few hours.</p>

          {sent ? (
            <div className="mt-8 flex flex-col items-center gap-3 py-8 text-center animate-fade-in">
              <FaCheckCircle className="text-4xl text-emerald-400" />
              <p className="text-lg font-semibold text-white">Message received</p>
              <p className="max-w-sm text-sm text-slate-400">
                Thanks, {form.name.split(' ')[0] || 'there'}! Our team will get back to you at {form.email}. For anything urgent, call {HELPLINE}.
              </p>
              <button onClick={() => { setSent(false); setForm((f) => ({ ...f, message: '' })); }} className="btn-secondary mt-2">
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Name</label>
                  <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Phone (optional)</label>
                  <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91…" />
                </div>
                <div>
                  <label className="label">Topic</label>
                  <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    {SUBJECTS.map((s) => <option key={s.v} value={s.v} className="bg-ink-850">{s.t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input" rows={5} required minLength={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>

        {/* FAQ */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Frequently asked</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left"
                  >
                    <span className="font-medium text-white">{f.q}</span>
                    <FaChevronDown className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && <p className="px-4 pb-4 text-sm leading-relaxed text-slate-400">{f.a}</p>}
                </div>
              );
            })}
          </div>

          <div className="card mt-6 flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow-brand">
              <FaPhoneAlt />
            </span>
            <div>
              <p className="font-semibold text-white">Still need help?</p>
              <p className="text-sm text-slate-400">
                Call <a href={`tel:${HELPLINE_TEL}`} className="text-brand-300 hover:text-brand-200">{HELPLINE}</a> — we’re available 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
