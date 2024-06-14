// path: src/components/Ground.js
import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Box } from '@react-three/drei';

const Ground = (props) => {
  return (
    <RigidBody type="fixed" name='ground' colliders="cuboid">
      <Box args={[500, 1, 500]} {...props}>
        <meshStandardMaterial color="black" opacity={0.1} transparent={true}/>
      </Box>
    </RigidBody>
  );
};

export default Ground;