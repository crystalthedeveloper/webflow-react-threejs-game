// path: src/components/ProgressBar.js
import React from 'react';
import { Box } from '@react-three/drei';

const ProgressBar = ({ progress }) => {
  return (
    <Box args={[progress * 10, 1, 1]} material-color="white" />
  );
};

export default ProgressBar;

