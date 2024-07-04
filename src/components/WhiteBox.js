// path: src/components/WhiteBox.js
import React from 'react';
import { Box } from '@react-three/drei';

const WhiteBox = ({ position, scale = [1, 1, 1] }) => {
  return (
    <Box position={position} scale={scale}>
      <meshStandardMaterial color="#fff" />
    </Box>
  );
};

export default WhiteBox;