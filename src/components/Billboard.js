// path: src/components/Billboard.js
import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text3D, useTexture } from '@react-three/drei';
import CinzelExtraBoldRegular from '../assets/Cinzel_ExtraBold_Regular.json';

const Billboard = ({ position, message }) => {
  const matcapTexture = useTexture('/matcap/E6BF3C_5A4719_977726_FCFC82-512px.png'); // Load the MatCap texture

  const handleClick = () => {
    window.location.href = 'mailto:crystalthedeveloper@gmail.com';
  };

  return (
    <RigidBody
      name="Billboard"
      type="fixed"
      position={[position[0], position[1] + 1, position[2]]}
      onClick={handleClick}
      onPointerDown={handleClick}
    >
      <Text3D
        position={[0, 0, 0]} // Keep the text centered within the RigidBody
        rotation={[0, 0, 0]} // No rotation needed
        font={CinzelExtraBoldRegular}
        size={1} // Adjusted to size instead of fontSize
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.03}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        {message}
        <meshMatcapMaterial attach="material" matcap={matcapTexture} /> {/* Use MatCap material */}
      </Text3D>
    </RigidBody>
  );
};

export default Billboard;