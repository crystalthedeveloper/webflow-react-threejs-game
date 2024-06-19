// path: src/components/RedBox.js
import React, { useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';

const RedBox = ({ position, onRedBoxHit }) => {
  const [isAwake, setIsAwake] = useState(false);
  const { scene } = useGLTF('/Logo.glb'); // Update the path to your Logo.glb file

  const handleCollision = ({ other }) => {
    if (other.userData?.type === 'player') {
      setIsAwake(true);
      onRedBoxHit(1); // Assuming 1 item is collected for the RedBox
    }
  };

  return (
    <RigidBody
      type="dynamic"
      position={position}
      name="RedBox"
      onCollisionEnter={handleCollision}
    >
      <primitive object={scene} scale={isAwake ? [1.5, 1.5, 1.5] : [1, 1, 1]} />
    </RigidBody>
  );
};

export default RedBox;