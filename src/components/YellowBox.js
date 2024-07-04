// path: src/components/YellowBox.js
import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Box } from '@react-three/drei';

const YellowBox = ({ position, scale }) => {
  return (
    <RigidBody type="dynamic" colliders="cuboid" position={position} name="YellowBox">
      <Box args={scale}>
        <meshStandardMaterial color="#fff" />
      </Box>
    </RigidBody>
  );
};

export default YellowBox;