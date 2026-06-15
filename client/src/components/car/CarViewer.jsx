import { Suspense, lazy, useState, useEffect } from 'react';

// Heavy three.js scene is split into its own async chunk — only loaded on the
// detail page, never in the main bundle.
const CarScene = lazy(() => import('./CarScene'));

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
};

function Shell({ children }) {
  return (
    <div className="relative h-52 w-full">
      {/* Glow + platform base, visible behind/around the car */}
      <div className="pointer-events-none absolute inset-x-6 bottom-3 h-10 rounded-[50%] bg-brand-600/30 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-10 bottom-4 h-4 rounded-[50%] border border-neon-400/40 bg-neon-500/10" />
      {children}
    </div>
  );
}

// Static fallback when WebGL is unavailable / still loading
function ImageFallback({ image }) {
  return (
    <Shell>
      {image && (
        <img src={image} alt="Parking spot" className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-80" />
      )}
    </Shell>
  );
}

export default function CarViewer({ fallbackImage }) {
  const [webgl, setWebgl] = useState(null);
  useEffect(() => setWebgl(hasWebGL()), []);

  if (webgl === false) return <ImageFallback image={fallbackImage} />;
  if (webgl === null) return <ImageFallback image={fallbackImage} />;

  return (
    <Shell>
      <Suspense fallback={null}>
        <CarScene />
      </Suspense>
    </Shell>
  );
}
