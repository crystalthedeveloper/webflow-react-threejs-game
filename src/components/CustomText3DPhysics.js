// path: src/components/CustomText3DPhysics.js
import React, { useEffect, useState } from 'react';
import Text3DItem from './Text3DItem';
import fetchWebflowData from '../utils/fetchWebflowData';

const CustomText3DPhysics = ({ updateProgress }) => {
  const [cmsData, setCmsData] = useState([]);
  const [randomPositions, setRandomPositions] = useState([]);
  const [awakeStates, setAwakeStates] = useState({});
  const [collectedItems, setCollectedItems] = useState(0);

  const playerInitialPosition = { x: 0, y: 2, z: 0 };
  const minDistanceFromPlayer = 10;

  useEffect(() => {
    const getData = async () => {
      const data = await fetchWebflowData();
      if (data.length === 0) return;
      setCmsData(data);

      let positions = data.map(() => {
        let pos;
        do {
          pos = {
            x: Math.random() * 400 - 200,
            y: 1.1,
            z: Math.random() * 400 - 200,
          };
        } while (
          Math.sqrt(
            (pos.x - playerInitialPosition.x) ** 2 +
            (pos.z - playerInitialPosition.z) ** 2
          ) < minDistanceFromPlayer
        );
        return pos;
      });

      positions = adjustPositionsToAvoidOverlap(positions);
      setRandomPositions(positions);

      const initialAwakeStates = data.reduce((acc, item, index) => {
        acc[index] = false;
        return acc;
      }, {});
      setAwakeStates(initialAwakeStates);
    };

    getData();
  }, []);

  const adjustPositionsToAvoidOverlap = (positions) => {
    const minDistance = 5;

    const isOverlapping = (pos1, pos2) => {
      const distance = Math.sqrt(
        (pos1.x - pos2.x) ** 2 + (pos1.z - pos2.z) ** 2
      );
      return distance < minDistance;
    };

    for (let i = 0; i < positions.length; i++) {
      for (let j = 0; j < positions.length; j++) {
        if (i !== j && isOverlapping(positions[i], positions[j])) {
          positions[i].x += (Math.random() - 0.5) * minDistance;
          positions[i].z += (Math.random() - 0.5) * minDistance;
          i = -1;
          break;
        }
      }
    }
    return positions;
  };

  const handleHit = (index, name) => {
    setAwakeStates((prevStates) => ({
      ...prevStates,
      [index]: true,
    }));
    const newCollectedItems = collectedItems + 1;
    setCollectedItems(newCollectedItems);
    updateProgress(newCollectedItems, name); // Update progress with the number of items collected
  };

  return (
    <group>
      {cmsData.length > 0 &&
        randomPositions.length > 0 &&
        cmsData.map((item, index) => (
          <Text3DItem
            key={index}
            position={[
              randomPositions[index]?.x || 0,
              randomPositions[index]?.y || 0,
              randomPositions[index]?.z || 0,
            ]}
            name={item.fieldData?.name}
            index={index}
            isAwake={awakeStates[index]}
            onHit={handleHit}
          />
        ))}
    </group>
  );
};

export default CustomText3DPhysics;