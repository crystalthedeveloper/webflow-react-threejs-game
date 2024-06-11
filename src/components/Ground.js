// path: src/components/Ground.js
import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Box } from '@react-three/drei';

const Ground = (props) => {
  return (
    <RigidBody type="fixed">
      <Box args={[100, 1, 100]} {...props}>
        <meshStandardMaterial color="green" />
      </Box>
    </RigidBody>
  );
};

export default Ground;