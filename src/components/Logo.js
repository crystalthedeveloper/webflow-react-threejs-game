// path: src/components/Logo.js
import React, { useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Logo = ({ position }) => {
  const { scene } = useGLTF('/Logo.glb');
  const logoRef = useRef();
  const clockRef = useRef(new THREE.Clock());
  const matcapTexture = useTexture('/matcap/E6BF3C_5A4719_977726_FCFC82-512px.png'); // Load the MatCap texture

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
      }
    });
  }, [scene, matcapTexture]);

  useFrame(() => {
    if (logoRef.current) {
      const elapsedTime = clockRef.current.getElapsedTime();
      logoRef.current.setNextKinematicTranslation({
        x: position[0],
        y: Math.max(2, position[1] + Math.sin(elapsedTime) * 0.5), // Ensure y position is at least 2
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
      <primitive object={scene} scale={[6, 6, 8]} />
    </RigidBody>
  );
};

export default Logo;