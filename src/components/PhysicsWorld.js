// path: src/components/PhysicsWorld.js
import React from 'react';
import { Physics } from '@react-three/rapier';
import ThirdPersonController from '../ThirdPersonController';
import RedBox from './RedBox';
import Ground from './Ground';
import CustomText3DPhysics from './CustomText3DPhysics';
import YellowBox from './YellowBox';

const PhysicsWorld = ({ updateProgress, onPlayerFall, yellowBoxPositions }) => {
  return (
    <Physics gravity={[0, -9.81, 0]} debug>
      <ThirdPersonController onPlayerHit={updateProgress} onPlayerFall={onPlayerFall} />
      <CustomText3DPhysics updateProgress={updateProgress} />
      {yellowBoxPositions.map((pos, index) => (
        <YellowBox key={index} position={[pos.x, pos.y, pos.z]} scale={[5, 5, 5]} />
      ))}
      <RedBox position={[-2, 2, 0]} onCollisionEnter={({ other }) => {
        if (other.userData?.type === 'player') {
          updateProgress(prev => prev + 1, 'RedBox');
        }
      }} />
      <Ground position={[0, 0, 0]} />
    </Physics>
  );
};

export default PhysicsWorld;