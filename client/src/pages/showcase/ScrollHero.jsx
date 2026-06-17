import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const FRAME_COUNT = 48;
const framePath = (i) => `/frames/frame_${String(i + 1).padStart(4, '0')}.jpg`;

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.8 + i * 0.12, duration: 0.8, ease: 'easeOut' } }),
};

export default function ScrollHero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    const images = [];
    let currentIdx = -1;
    let raf = 0;

    // Cover-fit draw: scale to fill, center, black behind
    const draw = (idx) => {
      const img = images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const w = iw * scale;
      const h = ih * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      currentIdx = idx;
    };

    const sizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const idx = currentIdx < 0 ? 0 : currentIdx;
      draw(idx);
    };

    // Preload every frame
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        if (i === 0) { sizeCanvas(); draw(0); }
      };
      images[i] = img;
    }
    sizeCanvas();

    // rAF scrub loop — no scroll listener
    const tick = () => {
      const top = container.getBoundingClientRect().top;
      const scrollable = container.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -top / scrollable));
      const target = Math.round(progress * (FRAME_COUNT - 1));
      if (target !== currentIdx && images[target]?.complete) draw(target);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('resize', sizeCanvas);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', sizeCanvas);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

        {/* Gradient + overlay content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 'clamp(1.5rem, 6vw, 6rem)',
            paddingBottom: 'clamp(3rem, 10vh, 8rem)',
            pointerEvents: 'none',
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)',
          }}
        >
          <motion.span custom={0} variants={fade} initial="hidden" animate="show" className="lux-label">
            Bespoke · Everose Edition
          </motion.span>
          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="lux-display"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)', margin: '1rem 0 0.6rem', maxWidth: '14ch' }}
          >
            The Meridian GT
          </motion.h1>
          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: '#E5E5E5', maxWidth: 460, lineHeight: 1.6 }}
          >
            A grand tourer machined from a single conviction — that motion, at its finest, should feel inevitable.
          </motion.p>
          <motion.a
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            href="#specs"
            className="lux-btn"
            style={{ marginTop: '2rem', pointerEvents: 'auto', alignSelf: 'flex-start' }}
          >
            Explore Collection
          </motion.a>
        </div>
      </div>
    </div>
  );
}
