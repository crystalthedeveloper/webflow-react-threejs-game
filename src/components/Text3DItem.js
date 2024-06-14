// path: src/components/Text3DItem.js
import React, { useRef, useEffect, useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text3D } from '@react-three/drei';
import CinzelExtraBoldRegular from '../assets/Cinzel_ExtraBold_Regular.json';

const Text3DItem = ({ position, name, index, isAwake, onHit }) => {
  const rigidBodyRef = useRef();
  const [color, setColor] = useState('white');
  const [rotation, setRotation] = useState([0, Math.random() * Math.PI * 2, 0]); // Random rotation around Y axis

  useEffect(() => {
    if (isAwake) {
      setColor('blue');
    }
  }, [isAwake]);

  const handleCollision = ({ other }) => {
    if (other.userData?.type === 'player' && !isAwake) {
      onHit(index, name);
    }
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      onCollisionEnter={handleCollision}
      name={`Text3DItem-${index}-${name}`}
      userData={{ type: 'text3d', index, name }}
      position={position}
      rotation={rotation} // Apply random rotation
      type="dynamic" // Ensure it is a dynamic body for collisions
      colliders="cuboid" // Ensure appropriate collider shape
      scale={[1.2, 1.2, 1.2]} // Scale the collider slightly larger
    >
      <Text3D
        font={CinzelExtraBoldRegular}
        size={0.8}
        height={0.1}
        anchorX="center"
        anchorY="middle"
      >
        {name || 'Unnamed'}
        <meshStandardMaterial attach="material" color={color} />
      </Text3D>
    </RigidBody>
  );
};

export default Text3DItem;