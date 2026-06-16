import { Suspense, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useCarClone } from '../car/carUtils';

const RADIUS = 16.3; // matches the default [11,9,12]-ish framing

// Drives the orthographic camera from a shared control ref (yaw/pitch/zoom),
// so external D-pad / zoom buttons can move the camera smoothly.
function CameraController({ control }) {
  const { camera } = useThree();
  const tmp = useRef(new THREE.Vector3());
  useFrame(() => {
    const c = control?.current;
    if (!c) return;
    const x = RADIUS * Math.sin(c.yaw);
    const z = RADIUS * Math.cos(c.yaw);
    const y = c.pitch;
    tmp.current.set(x, y, z);
    camera.position.lerp(tmp.current, 0.18);
    camera.zoom += (c.zoom - camera.zoom) * 0.18;
    camera.lookAt(0, 0.4, 0);
    camera.updateProjectionMatrix();
  });
  return null;
}

function ParkedCar({ color, position, rotation = [0, 0, 0] }) {
  const model = useCarClone(color);
  return <primitive object={model} position={position} rotation={rotation} />;
}

function BayLines() {
  const xs = [-4.6, -1.6, 1.6, 4.6];
  return (
    <group>
      {xs.map((x, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[x, 0.02, 0]}>
          <planeGeometry args={[0.12, 9]} />
          <meshBasicMaterial color="#c9cede" transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function MonitoredLane() {
  return (
    <group>
      {[-1.55, 1.55].map((x, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[x, 0.03, 0.5]}>
          <planeGeometry args={[0.18, 7.5]} />
          <meshBasicMaterial color="#ff2d55" toneMapped={false} />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.025, 0.8]}>
        <planeGeometry args={[3, 7]} />
        <meshBasicMaterial color="#ff2d55" transparent opacity={0.12} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.2, 1]} intensity={12} color="#ff2d55" distance={9} />
    </group>
  );
}

function SceneContent() {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0c0c15" metalness={0.5} roughness={0.55} />
      </mesh>
      <mesh position={[0, 4, -7]} receiveShadow>
        <planeGeometry args={[60, 16]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.2} roughness={0.9} />
      </mesh>
      {[-9, -2.5, 9].map((x, i) => (
        <mesh key={i} position={[x, 3, -6.8]} castShadow>
          <boxGeometry args={[0.4, 8, 0.4]} />
          <meshStandardMaterial color="#15131f" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}

      <BayLines />
      <MonitoredLane />

      <ParkedCar color="#0f0e16" position={[-3.05, 0, -0.2]} rotation={[0, 0.06, 0]} />
      <ParkedCar color="#e9ebf2" position={[0, 0, 0.4]} rotation={[0, -0.04, 0]} />
      <ParkedCar color="#161320" position={[3.05, 0, -0.1]} rotation={[0, 0.12, 0]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 12, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[-6, 5, 4]} intensity={18} color="#6366f1" distance={20} />
      <spotLight position={[0, 10, 6]} angle={0.5} penumbra={0.6} intensity={20} color="#cbd5ff" />

      <ContactShadows position={[0, 0.04, 0]} opacity={0.6} scale={28} blur={2.4} far={6} color="#000000" />
      <Environment preset="night" />
    </>
  );
}

function Fallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
        <span className="text-xs">Loading garage…</span>
      </div>
    </Html>
  );
}

export default function GarageScene({ control }) {
  const isMobile =
    typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent);
  return (
    <Canvas
      shadows
      orthographic
      dpr={isMobile ? 1 : [1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [11, 9, 12], zoom: 46, near: -50, far: 100 }}
      performance={{ min: 0.5 }}
      style={{ background: 'transparent' }}
    >
      <CameraController control={control} />
      <Suspense fallback={<Fallback />}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
