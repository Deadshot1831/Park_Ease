import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0, 0, 1] } },
};

const SPECS = [
  ['Parking spots', '12,000+ and growing'],
  ['Cities covered', '40 across the region'],
  ['Avg. time saved', '17 minutes per trip'],
  ['Booking time', 'Under 60 seconds'],
  ['Availability updates', 'Real-time (WebSocket)'],
  ['Payments', 'Razorpay — UPI, cards, wallets'],
  ['Confirmation', 'Instant QR pass'],
  ['Monitoring', 'CCTV + impact alerts'],
  ['Driver rating', '4.8 / 5 average'],
  ['Support', '24/7 assistance'],
];

export default function SpecsSection() {
  return (
    <section id="specs" className="lux-section">
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.span variants={item} className="lux-label">By the Numbers</motion.span>
        <motion.h2 variants={item} className="lux-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '1rem 0 3rem' }}>
          The platform, <span className="lux-gradient">in numbers.</span>
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', columnGap: '4rem' }}>
          {[SPECS.slice(0, 5), SPECS.slice(5)].map((col, ci) => (
            <div key={ci}>
              {col.map(([label, value]) => (
                <motion.div
                  key={label}
                  variants={item}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    padding: '1.1rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.9rem', letterSpacing: '0.02em' }}>
                    {label}
                  </span>
                  <span style={{ color: '#E5E5E5', fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.95rem', textAlign: 'right' }}>
                    {value}
                  </span>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
