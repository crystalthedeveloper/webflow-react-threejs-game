// path: src/components/CustomText3D.js
import React, { useEffect, useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text3D } from '@react-three/drei';
import CinzelExtraBoldRegular from '../assets/Cinzel_ExtraBold_Regular.json';
import fetchWebflowData from '../utils/fetchWebflowData';

const CustomText3D = () => {
  const [cmsData, setCmsData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchWebflowData();
      console.log('Fetched data:', data);
      setCmsData(data);
    };

    getData();
  }, []);

  return (
    <group>
      {cmsData.length > 0 ? (
        cmsData.map((item, index) => (
          <RigidBody key={index}>
            <Text3D 
              font={CinzelExtraBoldRegular} 
              size={0.5}  // Adjust the size here
              height={0.1}  // Adjust the height here
            >
              {item.name}
              <meshStandardMaterial attach="material" color="blue" />
            </Text3D>
          </RigidBody>
        ))
      ) : (
        <RigidBody>
          <Text3D 
            font={CinzelExtraBoldRegular} 
            size={0.5}  // Adjust the size here
            height={0.1}  // Adjust the height here
          >
            Loading
            <meshStandardMaterial attach="material" color="red" />
          </Text3D>
        </RigidBody>
      )}
    </group>
  );
};

export default CustomText3D;