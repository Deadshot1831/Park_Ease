import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionLink = motion(Link);

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0, 0, 1] } },
};

export default function ClosingCTA() {
  return (
    <section className="lux-section" style={{ textAlign: 'center', position: 'relative' }}>
      {/* Radial glow behind the button */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '4rem',
          width: 'min(700px, 90vw)',
          height: 360,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(200,169,110,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}
      >
        <motion.span variants={item} className="lux-label">Yours to Command</motion.span>
        <motion.h2 variants={item} className="lux-display" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', margin: '1.2rem 0 1.4rem' }}>
          A century of mastery.<br />
          <span style={{ fontStyle: 'italic', color: '#E5E5E5' }}>One expression of it.</span>
        </motion.h2>
        <motion.p variants={item} style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: '#E5E5E5', maxWidth: 480, margin: '0 auto 2.4rem', lineHeight: 1.7 }}>
          The Meridian GT is built to order, in limited number. When it arrives, give it a place worthy of the journey — reserved, secured, and waiting.
        </motion.p>
        <motion.div variants={item}>
          <MotionLink
            to="/search"
            className="lux-btn lux-btn-outline"
            whileHover={{ scale: 1.035 }}
            whileTap={{ scale: 0.98 }}
          >
            Reserve Premium Parking
          </MotionLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
