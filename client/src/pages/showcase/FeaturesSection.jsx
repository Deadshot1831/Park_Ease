import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0, 0, 1] } },
};

const Icon = ({ d }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const FEATURES = [
  {
    label: 'Real-Time Availability',
    copy: 'Live spot counts update by the second over WebSockets, so the map always shows what’s actually open — never a wasted drive.',
    icon: <Icon d={<><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8z" /></>} />,
  },
  {
    label: 'Guaranteed Reservation',
    copy: 'Book ahead and your space is held — arrive to a spot that’s already yours, confirmed with a scannable QR pass.',
    icon: <Icon d={<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4M9 14l2 2 4-4" /></>} />,
  },
  {
    label: 'Secure Monitoring',
    copy: 'Every monitored lot streams CCTV and impact alerts to the Park.Guard dashboard, watching over your vehicle while you’re away.',
    icon: <Icon d={<><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" /><path d="M9.5 12l1.8 1.8 3.5-3.6" /></>} />,
  },
  {
    label: 'Instant Booking & Payment',
    copy: 'Select your time, see the full breakdown, and pay securely via Razorpay — UPI, cards or wallets — in under a minute.',
    icon: <Icon d={<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>} />,
  },
  {
    label: 'Verified Reviews',
    copy: 'Only drivers who actually booked can rate a spot, so ratings reflect real experiences — not noise.',
    icon: <Icon d={<><path d="M12 3l2.4 5 5.6.6-4.2 3.8 1.2 5.6L12 15.5 6.9 21l1.2-5.6L4 11.6 9.6 11 12 3z" /></>} />,
  },
  {
    label: 'List & Earn',
    copy: 'Own a lot or a driveway? List it in minutes, set your pricing, and track bookings and revenue from the owner dashboard.',
    icon: <Icon d={<><path d="M3 21h18M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6M9 11h.01M15 11h.01" /></>} />,
  },
];

export default function FeaturesSection() {
  return (
    <section className="lux-section">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.span variants={item} className="lux-label">Why ParkEase</motion.span>
        <motion.h2 variants={item} className="lux-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '1rem 0 3.5rem', maxWidth: '18ch' }}>
          Parking, <span className="lux-gradient">finally solved.</span>
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {FEATURES.map((f) => (
            <motion.div key={f.label} variants={item} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              {f.icon}
              <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1.05rem', margin: '1rem 0 0.6rem', color: '#fff' }}>
                {f.label}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: '#E5E5E5', lineHeight: 1.65, fontSize: '0.95rem' }}>
                {f.copy}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
