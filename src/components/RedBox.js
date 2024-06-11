// path: src/components/RedBox.js
import React, { forwardRef } from 'react';
import { RigidBody } from '@react-three/rapier';

const RedBox = forwardRef((props, ref) => (
  <RigidBody ref={ref} {...props}>
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  </RigidBody>
));

export default RedBox;