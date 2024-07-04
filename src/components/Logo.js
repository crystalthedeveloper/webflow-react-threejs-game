// path: src/components/Logo.js
import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Logo = ({ position }) => {
  const { scene } = useGLTF('/Logo.glb'); // Update the path to your Logo.glb file
  const logoRef = useRef();
  const clockRef = useRef(new THREE.Clock());

  useFrame(() => {
    if (logoRef.current) {
      const elapsedTime = clockRef.current.getElapsedTime();
      logoRef.current.setNextKinematicTranslation({
        x: position[0],
        y: position[1] + Math.sin(elapsedTime) * 0.5, // Adjust speed and amplitude
        z: position[2],
      });
    }
  });

  return (
    <RigidBody
      ref={logoRef}
      type="kinematicPosition"
      position={position}
      name="Logo"
    >
      <primitive object={scene} />
    </RigidBody>
  );
};

export default Logo;