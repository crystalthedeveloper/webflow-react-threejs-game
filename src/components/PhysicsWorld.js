// path: src/components/PhysicsWorld.js
import React from 'react';
import { Physics } from '@react-three/rapier';
import ThirdPersonController from '../ThirdPersonController';
import RedBox from './RedBox';
import CustomText3D from './CustomText3D';
import Ground from './Ground';

const PhysicsWorld = () => {
  return (
    <Physics gravity={[0, -9.81, 0]} debug>
      <ThirdPersonController />
      <RedBox position={[-2, 2, 0]} />
      <CustomText3D position={[2, 2, 0]} />
      <Ground position={[0, 0, 0]} /> {/* Ground positioned at y=0 */}
    </Physics>
  );
};

export default PhysicsWorld;