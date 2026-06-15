import { Suspense, lazy, useState, useEffect } from 'react';

// Heavy three.js scene is split into its own async chunk — only loaded where a
// car is actually shown, never in the main bundle.
const CarScene = lazy(() => import('./CarScene'));

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
};

function Shell({ height, children }) {
  return (
    <div className={`relative w-full ${height}`}>
      {/* Glow + platform base, visible behind/around the car */}
      <div className="pointer-events-none absolute inset-x-6 bottom-3 h-10 rounded-[50%] bg-brand-600/30 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-10 bottom-4 h-4 rounded-[50%] border border-neon-400/40 bg-neon-500/10" />
      {children}
    </div>
  );
}

// Static fallback when WebGL is unavailable / still loading
function ImageFallback({ image, height }) {
  return (
    <Shell height={height}>
      {image && (
        <img src={image} alt="Parking spot" className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-80" />
      )}
    </Shell>
  );
}

export default function CarViewer({ fallbackImage, height = 'h-52' }) {
  const [webgl, setWebgl] = useState(null);
  useEffect(() => setWebgl(hasWebGL()), []);

  if (webgl !== true) return <ImageFallback image={fallbackImage} height={height} />;

  return (
    <Shell height={height}>
      <Suspense fallback={null}>
        <CarScene />
      </Suspense>
    </Shell>
  );
}
