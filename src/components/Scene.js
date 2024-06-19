// src/components/Scene.js
import React, { useEffect, useState, useMemo } from 'react';
import { OrbitControls, Environment, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import PhysicsWorld from './PhysicsWorld';
import WhiteBox from './WhiteBox';
import YellowBox from './YellowBox';
import CustomText3DTotalItems from './CustomText3DTotalItems';
import Ground from './Ground';
import useGame from '../hooks/useGame';

const generateRandomPosition = (existingPositions, minDistance, yRange = [1, 1]) => {
  let position;
  let isOverlapping;
  do {
    position = {
      x: Math.random() * 400 - 200,
      y: Math.random() * (yRange[1] - yRange[0]) + yRange[0], // Random y position within the specified range
      z: Math.random() * 400 - 200,
    };
    isOverlapping = existingPositions.some(
      (pos) => Math.sqrt((pos.x - position.x) ** 2 + (pos.z - position.z) ** 2) < minDistance
    );
  } while (isOverlapping);
  return position;
};

const generatePositions = (numPositions, minDistance, existingPositions, yRange = [1, 1]) => {
  const positions = [];
  for (let i = 0; i < numPositions; i++) {
    const position = generateRandomPosition([...existingPositions, ...positions], minDistance, yRange);
    positions.push(position);
  }
  return positions;
};

const StaticCloud = ({ position, scale }) => {
  const cloudGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const cloudMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 'white',
    opacity: 0.2,
    transparent: true
  }), []);

  return (
    <mesh position={position} scale={scale} geometry={cloudGeometry} material={cloudMaterial} />
  );
};

const Scene = ({ onItemsLoaded, updateProgress, onPlayerFall }) => {
  const [cloudPositions, setCloudPositions] = useState([]);
  const [whiteBoxPositions, setWhiteBoxPositions] = useState([]);
  const [yellowBoxPositions, setYellowBoxPositions] = useState([]);
  const { active, progress, errors, item, loaded, total } = useProgress();

  useEffect(() => {
    const cloudPositions = generatePositions(10, 50, [], [10, 30]);
    setCloudPositions(cloudPositions);

    const whiteBoxPositions = generatePositions(10, 20, cloudPositions, [-10, -8]);
    setWhiteBoxPositions(whiteBoxPositions);

    const yellowBoxPositions = generatePositions(10, 20, [...cloudPositions, ...whiteBoxPositions], [5, 10]);
    setYellowBoxPositions(yellowBoxPositions);
  }, []);

  const cloudElements = useMemo(() =>
    cloudPositions.map((pos, index) => (
      <StaticCloud key={index} position={[pos.x, pos.y, pos.z]} scale={[10, 10, 10]} />
    )),
    [cloudPositions]
  );

  const whiteBoxElements = useMemo(() =>
    whiteBoxPositions.map((pos, index) => (
      <WhiteBox key={index} position={[pos.x, pos.y, pos.z]} scale={[5, 5, 5]} />
    )),
    [whiteBoxPositions]
  );

  const yellowBoxElements = useMemo(() =>
    yellowBoxPositions.map((pos, index) => (
      <YellowBox key={index} position={[pos.x, pos.y, pos.z]} scale={[5, 5, 5]} />
    )),
    [yellowBoxPositions]
  );

  return (
    <>
      <Environment files="/skybox/kloofendal_48d_partly_cloudy_puresky_4k.hdr" background />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <PhysicsWorld updateProgress={updateProgress} onPlayerFall={onPlayerFall} yellowBoxPositions={yellowBoxPositions} />
      <CustomText3DTotalItems onItemsLoaded={onItemsLoaded} updateProgress={updateProgress} />
      {cloudElements}
      {whiteBoxElements}
      {yellowBoxElements}
      <Ground position={[0, 0, 0]} />
      <OrbitControls />
    </>
  );
};

export default Scene;