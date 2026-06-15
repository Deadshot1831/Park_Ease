import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Html, Float } from '@react-three/drei';
import { useCarClone } from './carUtils';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Car({ color }) {
  const model = useCarClone(color);
  return <primitive object={model} />;
}

// Rotating turntable carrying the car + glowing platform
function Turntable({ color, speed }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current && !prefersReducedMotion) ref.current.rotation.y += delta * speed;
  });

  return (
    <group ref={ref}>
      <Car color={color} />
      {/* Glowing disc platform */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow>
        <circleGeometry args={[2.6, 64]} />
        <meshStandardMaterial color="#1a1330" emissive="#7c3aed" emissiveIntensity={0.35} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Neon rim ring */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01}>
        <ringGeometry args={[2.5, 2.62, 96]} />
        <meshBasicMaterial color="#d946ef" toneMapped={false} />
      </mesh>
    </group>
  );
}

function SpinnerFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
        <span className="text-xs">Loading 3D…</span>
      </div>
    </Html>
  );
}

export default function CarScene({ color, rotateSpeed = 0.35 }) {
  const isMobile =
    typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent);

  return (
    <Canvas
      shadows
      dpr={isMobile ? 1 : [1, 2]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: [4.3, 1.8, 5.2], fov: 34 }}
      performance={{ min: 0.5 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-5, 3, -4]} intensity={40} color="#a855f7" />
      <pointLight position={[5, 2, -5]} intensity={30} color="#d946ef" />

      <Suspense fallback={<SpinnerFallback />}>
        <Float speed={prefersReducedMotion ? 0 : 1.2} rotationIntensity={0} floatIntensity={0.4} floatingRange={[-0.04, 0.06]}>
          <Turntable color={color} speed={rotateSpeed} />
        </Float>
        <Environment preset="night" />
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={9} blur={2.6} far={4} color="#000000" />
    </Canvas>
  );
}
