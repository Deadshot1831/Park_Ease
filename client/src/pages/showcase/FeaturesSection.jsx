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
    label: 'Naturally Aspirated V12',
    copy: 'A 6.5-litre twelve-cylinder heart, hand-assembled and signed, delivering linear power to a redline few will ever chase.',
    icon: <Icon d={<><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>} />,
  },
  {
    label: 'Everose Coachwork',
    copy: 'A proprietary rose-gold alloy lacquer, cured in fourteen passes, that holds its lustre against time and ultraviolet alike.',
    icon: <Icon d={<><path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5" /><path d="M5 17h14M6 13h12" /><circle cx="7.5" cy="17" r="1.6" /><circle cx="16.5" cy="17" r="1.6" /></>} />,
  },
  {
    label: 'Carbon Monocoque',
    copy: 'A single-piece carbon-fibre tub forms the spine of the car — rigid, weightless, and engineered to outlive its driver.',
    icon: <Icon d={<><path d="M4 7l8-4 8 4-8 4-8-4z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></>} />,
  },
  {
    label: 'Active Aerodynamics',
    copy: 'A deployable rear element and underbody channels read the road in real time, trading downforce for serenity at a whisper.',
    icon: <Icon d={<><path d="M3 8h13a4 4 0 1 1-4 4" /><path d="M3 12h9M3 16h13a3 3 0 1 0-3-3" /></>} />,
  },
  {
    label: 'Adaptive Magneride',
    copy: 'Magnetorheological dampers recalibrate a thousand times a second, dissolving the road beneath a flawless line of travel.',
    icon: <Icon d={<><path d="M3 17c3 0 3-8 6-8s3 8 6 8 3-6 6-6" /><circle cx="6" cy="17" r="1.4" /><circle cx="18" cy="11" r="1.4" /></>} />,
  },
  {
    label: 'Atelier Bespoke',
    copy: 'Every hide, stitch and veneer is specified in person — a commission, not a configuration, finished to a single owner’s hand.',
    icon: <Icon d={<><path d="M12 3l2.4 5 5.6.6-4.2 3.8 1.2 5.6L12 15.5 6.9 21l1.2-5.6L4 11.6 9.6 11 12 3z" /></>} />,
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
        <motion.span variants={item} className="lux-label">Crafted Without Compromise</motion.span>
        <motion.h2 variants={item} className="lux-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '1rem 0 3.5rem', maxWidth: '18ch' }}>
          Detail, pursued past the point of reason.
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
