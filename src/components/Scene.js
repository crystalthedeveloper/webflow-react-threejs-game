// src/components/Scene.js
import React, { useMemo } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import WhiteBox from './WhiteBox';
import YellowBox from './YellowBox';
import CustomText3DTotalItems from './CustomText3DTotalItems';
import Ground from './Ground';
import useGeneratePositions from '../hooks/useGeneratePositions';
import ThirdPersonController from '../ThirdPersonController';
import Text3DItem from './Text3DItem';
import Billboard from './Billboard';
import Logo from './Logo';

const CLOUD_COUNT = 10;
const WHITE_BOX_COUNT = 10;
const YELLOW_BOX_COUNT = 30;
const LOGO_COUNT = 1;

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

const Scene = ({ onItemsLoaded, updateProgress, onPlayerFall, mobileControls }) => {
  const { cloudPositions, whiteBoxPositions, yellowBoxPositions, logoPositions } = useGeneratePositions(CLOUD_COUNT, WHITE_BOX_COUNT, YELLOW_BOX_COUNT, LOGO_COUNT);

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

  const logoElements = useMemo(() =>
    logoPositions.map((pos, index) => (
      <Logo key={index} position={[pos.x, pos.y, pos.z]} />
    )),
    [logoPositions]
  );

  return (
    <>
      <Environment files="/skybox/kloofendal_48d_partly_cloudy_puresky_4k.hdr"/>
      <Environment files="/skybox/Darkkloofendal_48d_partly_cloudy_puresky_4k.hdr" background="only" />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <CustomText3DTotalItems onItemsLoaded={onItemsLoaded} updateProgress={updateProgress} />
      {cloudElements}
      {whiteBoxElements}
      {yellowBoxElements}
      {logoElements}
      <Ground position={[0, 0, 0]} />
      <OrbitControls />
      <Billboard position={[-6, 1, -20]} message="Need a Website?" />
      <Text3DItem updateProgress={updateProgress} />
      <ThirdPersonController
        onPlayerHit={updateProgress}
        onPlayerFall={onPlayerFall}
        mobileControls={mobileControls} // Pass mobile controls here
      />
    </>
  );
};

export default Scene;