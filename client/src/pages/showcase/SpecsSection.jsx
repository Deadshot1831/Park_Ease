import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0, 0, 1] } },
};

const SPECS = [
  ['Reference', 'MRD-12 · Everose'],
  ['Engine', '6.5L naturally aspirated V12'],
  ['Maximum power', '602 kW (819 hp) @ 9,250 rpm'],
  ['Peak torque', '720 Nm @ 7,000 rpm'],
  ['0–100 km/h', '2.9 seconds'],
  ['Top speed', '340 km/h (electronically governed)'],
  ['Transmission', '8-speed dual-clutch, rear-mounted'],
  ['Chassis', 'Carbon-fibre monocoque'],
  ['Kerb weight', '1,485 kg (dry)'],
  ['Wheels', 'Forged 21" front · 22" rear, Everose finish'],
];

export default function SpecsSection() {
  return (
    <section id="specs" className="lux-section">
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.span variants={item} className="lux-label">Technical Specifications</motion.span>
        <motion.h2 variants={item} className="lux-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '1rem 0 3rem' }}>
          The architecture of precision.
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
