import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL = '/models/car.glb';
const DRACO = '/draco/';

// Returns a fresh clone of the car, optionally recoloured. Cloning lets us place
// the same model multiple times (garage scene) with different paint colours.
export function useCarClone(bodyColor) {
  const { scene } = useGLTF(MODEL, DRACO);
  return useMemo(() => {
    const clone = scene.clone(true);
    if (bodyColor) {
      // The three.js Ferrari model names its paint mesh "body"
      const body = clone.getObjectByName('body');
      if (body && body.material) {
        body.material = body.material.clone();
        body.material.color = new THREE.Color(bodyColor);
      } else {
        // Fallback: tint the largest mesh (most likely the body shell)
        let biggest = null;
        let maxVol = 0;
        clone.traverse((o) => {
          if (o.isMesh && o.geometry) {
            o.geometry.computeBoundingBox?.();
            const b = o.geometry.boundingBox;
            if (b) {
              const v = (b.max.x - b.min.x) * (b.max.y - b.min.y) * (b.max.z - b.min.z);
              if (v > maxVol) { maxVol = v; biggest = o; }
            }
          }
        });
        if (biggest) {
          biggest.material = biggest.material.clone();
          biggest.material.color = new THREE.Color(bodyColor);
        }
      }
    }
    clone.traverse((o) => {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });
    return clone;
  }, [scene, bodyColor]);
}

useGLTF.preload(MODEL, DRACO);
