// path: src/components/RedBox.js
import React, { useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Box } from '@react-three/drei';

const RedBox = ({ position, onRedBoxHit }) => {
  const [isAwake, setIsAwake] = useState(false);

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
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial attach="material" color={isAwake ? "red" : "white"} />
      </Box>
    </RigidBody>
  );
};

export default RedBox;