// src/hooks/useGeneratePositions.js
import { useState, useEffect } from 'react';
import * as THREE from 'three';

const generateRandomPosition = (existingPositions, minDistance, yRange) => {
  let position;
  let isOverlapping;
  do {
    position = {
      x: Math.random() * 400 - 200,
      y: Math.random() * (yRange[1] - yRange[0]) + yRange[0],
      z: Math.random() * 400 - 200,
    };
    isOverlapping = existingPositions.some(
      (pos) => Math.sqrt((pos.x - position.x) ** 2 + (pos.z - position.z) ** 2) < minDistance
    );
  } while (isOverlapping);
  return position;
};

const generatePositions = (numPositions, minDistance, existingPositions, yRange) => {
  const positions = [];
  for (let i = 0; i < numPositions; i++) {
    const position = generateRandomPosition([...existingPositions, ...positions], minDistance, yRange);
    positions.push(position);
  }
  return positions;
};

const useGeneratePositions = (cloudCount, whiteBoxCount, yellowBoxCount) => {
  const [cloudPositions, setCloudPositions] = useState([]);
  const [whiteBoxPositions, setWhiteBoxPositions] = useState([]);
  const [yellowBoxPositions, setYellowBoxPositions] = useState([]);

  useEffect(() => {
    const generatedCloudPositions = generatePositions(cloudCount, 50, [], [10, 30]);
    setCloudPositions(generatedCloudPositions);

    const generatedWhiteBoxPositions = generatePositions(whiteBoxCount, 50, generatedCloudPositions, [-10, -8]);
    setWhiteBoxPositions(generatedWhiteBoxPositions);

    const generatedYellowBoxPositions = generatePositions(yellowBoxCount, 50, [...generatedCloudPositions, ...generatedWhiteBoxPositions], [5, 10]);
    setYellowBoxPositions(generatedYellowBoxPositions);
  }, [cloudCount, whiteBoxCount, yellowBoxCount]);

  return { cloudPositions, whiteBoxPositions, yellowBoxPositions };
};

export default useGeneratePositions;