import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useCarClone } from './carUtils';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LED = '#a855f7';

function Car({ color }) {
  const model = useCarClone(color);
  return <primitive object={model} />;
}

// The car slowly rotates on the spot; the bay around it stays put.
function RotatingCar({ color, speed }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current && !prefersReducedMotion) ref.current.rotation.y += delta * speed;
  });
  return (
    <group ref={ref} position-y={-0.15}>
      <Car color={color} />
    </group>
  );
}

// Bespoke ParkEase smart-parking bay: glowing LED outline, floor wordmark,
// and a pulsing holographic "reserved" ring — all drawn in code, no assets.
function ParkEaseBay() {
  // Floor wordmark "ParkEase" via a canvas texture (no font files needed)
  const logoTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 640; c.height = 160;
    const x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    x.font = 'bold 96px Arial, sans-serif';
    x.textBaseline = 'middle';
    const park = 'Park', ease = 'Ease';
    const wPark = x.measureText(park).width;
    const wEase = x.measureText(ease).width;
    let sx = (c.width - (wPark + wEase)) / 2;
    x.fillStyle = '#f3f0ff'; x.fillText(park, sx, 86);
    x.fillStyle = '#c084fc'; x.fillText(ease, sx + wPark, 86);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }, []);

  const ring = useRef();
  useFrame((s) => {
    if (!ring.current) return;
    const t = s.clock.elapsedTime;
    const k = prefersReducedMotion ? 1 : 1 + Math.sin(t * 2) * 0.06;
    ring.current.scale.set(k, k, k);
    ring.current.material.opacity = prefersReducedMotion ? 0.55 : 0.4 + Math.sin(t * 2) * 0.22;
  });

  const bayL = 5.8, bayW = 3.2, th = 0.13, y = 0.02;
  const bars = [
    { position: [0, y, bayW / 2], args: [bayL, th] },
    { position: [0, y, -bayW / 2], args: [bayL, th] },
    { position: [bayL / 2, y, 0], args: [th, bayW] },
    { position: [-bayL / 2, y, 0], args: [th, bayW] },
  ];

  return (
    <group>
      {/* Reflective garage floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#0b0a13" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* LED bay outline */}
      {bars.map((b, i) => (
        <mesh key={i} position={b.position} rotation-x={-Math.PI / 2}>
          <planeGeometry args={b.args} />
          <meshBasicMaterial color={LED} toneMapped={false} />
        </mesh>
      ))}

      {/* Soft violet wash inside the bay */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <planeGeometry args={[bayL, bayW]} />
        <meshBasicMaterial color={LED} transparent opacity={0.08} toneMapped={false} />
      </mesh>

      {/* Pulsing holographic "reserved" ring beneath the car */}
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.03}>
        <ringGeometry args={[2.25, 2.5, 72]} />
        <meshBasicMaterial color="#d946ef" transparent opacity={0.55} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Floor wordmark at the front edge of the bay, reading toward the camera */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.025, 2.15]}>
        <planeGeometry args={[2.7, 0.66]} />
        <meshBasicMaterial map={logoTex} transparent toneMapped={false} />
      </mesh>

      <pointLight position={[0, 0.5, 0]} intensity={7} color={LED} distance={9} />
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

export default function CarScene({ color = '#dfe3ec', rotateSpeed = 0.45 }) {
  const isMobile =
    typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent);

  return (
    <Canvas
      shadows
      dpr={isMobile ? 1 : [1, 2]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: [4.4, 2.0, 5.6], fov: 34 }}
      performance={{ min: 0.5 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-5, 3, -4]} intensity={40} color="#a855f7" />
      <pointLight position={[5, 2, -5]} intensity={28} color="#d946ef" />

      <Suspense fallback={<SpinnerFallback />}>
        <ParkEaseBay />
        <RotatingCar color={color} speed={rotateSpeed} />
        <Environment preset="night" />
      </Suspense>

      <ContactShadows position={[0, 0.05, 0]} opacity={0.5} scale={11} blur={2.6} far={4} color="#000000" />
    </Canvas>
  );
}
