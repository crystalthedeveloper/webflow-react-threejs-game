// src/ThirdPersonController.js
import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CuboidCollider, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import useKeyboardControls from './hooks/useKeyboardControls';
import useGame from './hooks/useGame';

const ThirdPersonController = ({ onPlayerHit, onPlayerFall, mobileControls = { up: false, down: false, left: false, right: false } }) => {
  const { camera, scene } = useThree();
  const keys = useKeyboardControls();
  const playerRef = useRef();
  const colliderRef = useRef();
  const { scene: playerScene, animations } = useGLTF('/playerModel.glb');
  const { actions } = useAnimations(animations, playerScene);
  const moveDirection = useRef(new THREE.Vector3(0, 0, 0));
  const cameraOffsetFront = new THREE.Vector3(0, 1.6, 3); 
  const cameraOffsetBack = new THREE.Vector3(0, 1.6, 3);
  const currentAction = useRef(null);

  const { rapier, world } = useRapier();
  const [grounded, setGrounded] = useState(false);
  const [hitObjects, setHitObjects] = useState(new Set());
  const [lastBillboardClick, setLastBillboardClick] = useState(0); // Track last billboard click time
  const cameraPhase = useGame((state) => state.cameraPhase);
  const setCameraPhase = useGame((state) => state.setCameraPhase);
  const resetPlayerPosition = useGame((state) => state.resetPlayerPosition);
  const setCameraTransitionComplete = useGame((state) => state.setCameraTransitionComplete);

  // Ensure multiple audio formats for cross-browser compatibility
  const sounds = {
    hit: new Audio('/sounds/hit.mp3'),
    died: new Audio('/sounds/died.mp3'),
    logo: new Audio('/sounds/LogoHit.mp3'),
  };

  useEffect(() => {
    Object.values(sounds).forEach(sound => {
      sound.onerror = (error) => {
        console.error(`Audio playback failed for ${sound.src}:`, error);
      };
    });

    initializePlayer();
    if (resetPlayerPosition && playerRef.current) {
      playerRef.current.setTranslation({ x: 0, y: 1, z: 0 }, true);
    }
  }, [resetPlayerPosition]);

  const initializePlayer = () => {
    camera.position.set(cameraOffsetFront.x, cameraOffsetFront.y, cameraOffsetFront.z);
    camera.lookAt(new THREE.Vector3(0, 1, 0));
    camera.far = 100;
    camera.updateProjectionMatrix();
    playerScene.rotation.y = Math.PI;
    scene.add(playerScene);
    playAction('idle');
  };

  const checkGrounded = () => {
    if (!playerRef.current) return false;
    const origin = {
      x: playerRef.current.translation().x,
      y: playerRef.current.translation().y - 0.6,
      z: playerRef.current.translation().z,
    };
    const ray = new rapier.Ray(origin, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 1.1, true, (collider) => collider !== playerRef.current.collider());

    const isGrounded = hit && hit.toi >= 0 && hit.toi < 1.1;
    setGrounded(isGrounded);
    return isGrounded;
  };

  const playAction = (actionName) => {
    if (currentAction.current === actionName) return;

    Object.values(actions).forEach((action) => {
      if (action.isRunning() && action.getClip().name !== actionName) {
        action.fadeOut(0.2);
      }
    });
    if (actions[actionName]) {
      actions[actionName].reset().fadeIn(0.2).play();
      currentAction.current = actionName;
    }
  };

  useFrame((state, delta) => {
    if (!playerRef.current || !colliderRef.current) return;

    if (cameraPhase === 'overview') {
      handleCameraOverview(state);
    } else if (cameraPhase === 'player') {
      handlePlayerMovement(delta);
      handlePlayerFallDetection();
      updateCameraPosition();
    }
  });

  const handleCameraOverview = (state) => {
    const elapsedTime = state.clock.getElapsedTime();
    const duration = 5; // Duration of the transition
    const playerPosition = playerRef.current.translation();
    const delay = 1; // Delay in seconds

    if (elapsedTime < delay) {
      return;
    }

    const adjustedElapsedTime = elapsedTime - delay;
    const angle = (adjustedElapsedTime / duration) * Math.PI; // Half circle
    const radius = 3; // Radius of the circular path

    const x = playerPosition.x + radius * Math.cos(angle);
    const z = playerPosition.z + radius * Math.sin(angle);
    const y = playerPosition.y + 1.6; // Adjust height if needed

    const cameraPosition = new THREE.Vector3(x, y, z);

    camera.position.lerp(cameraPosition, 0.1); // Smoothly interpolate camera position
    camera.lookAt(playerPosition.x, playerPosition.y + 1, playerPosition.z);

    if (adjustedElapsedTime >= duration) {
      setCameraPhase('player');
      setCameraTransitionComplete(true);
    }
  };

  const handlePlayerMovement = (delta) => {
    moveDirection.current.set(0, 0, 0);
    const moveSpeed = 40;
    const lateralMoveSpeed = 5;
    const cameraLerpFactor = keys.has('ArrowDown') ? 0.1 : 0.05;

    if (keys.has('ArrowUp') || mobileControls.up) moveDirection.current.z -= 1;
    if (keys.has('ArrowDown') || mobileControls.down) moveDirection.current.z += 1;
    if (keys.has('ArrowLeft') || mobileControls.left) moveDirection.current.x -= 1;
    if (keys.has('ArrowRight') || mobileControls.right) moveDirection.current.x += 1;

    moveDirection.current.z *= moveSpeed * delta;
    moveDirection.current.x *= lateralMoveSpeed * delta;

    const currentTranslation = playerRef.current.translation();
    const forwardVector = new THREE.Vector3(0, 0, 1).applyQuaternion(playerScene.quaternion);
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(playerScene.quaternion);

    const newTranslation = {
      x: currentTranslation.x + moveDirection.current.z * forwardVector.x + moveDirection.current.x * rightVector.x,
      y: currentTranslation.y,
      z: currentTranslation.z + moveDirection.current.z * forwardVector.z + moveDirection.current.x * rightVector.z,
    };

    playerRef.current.setTranslation(newTranslation, true);

    const groundedStatus = checkGrounded();
    setGrounded(groundedStatus);

    handleAnimations(keys, groundedStatus, moveDirection.current.length() > 0);
    handlePlayerRotation(keys, delta);
    handleCameraPositioning(currentTranslation, cameraLerpFactor);
  };

  const handlePlayerFallDetection = () => {
    const translation = playerRef.current.translation();
    if (translation.y < -10) {
      playSound(sounds.died);
      onPlayerFall();
    }
  };

  const handleAnimations = (keys, groundedStatus, isMoving) => {
    if (groundedStatus && isMoving) {
      if (keys.has('ArrowUp') || mobileControls.up) {
        playAction('run');
      } else if (keys.has('ArrowDown') || mobileControls.down) {
        playAction('backward');
      } else if (keys.has('ArrowLeft') || keys.has('ArrowRight') || mobileControls.left || mobileControls.right) {
        playAction('run');
      }
    } else {
      playAction('idle');
    }
  };

  const handlePlayerRotation = (keys, delta) => {
    if (keys.has('ArrowLeft') || mobileControls.left) {
      playerScene.rotation.y += Math.PI * delta;
      playerRef.current.setRotation({ x: 0, y: playerScene.rotation.y, z: 0 });
    } else if (keys.has('ArrowRight') || mobileControls.right) {
      playerScene.rotation.y -= Math.PI * delta;
      playerRef.current.setRotation({ x: 0, y: playerScene.rotation.y, z: 0 });
    }
  };

  const handleCameraPositioning = (currentTranslation, cameraLerpFactor) => {
    const targetPosition = new THREE.Vector3(currentTranslation.x, currentTranslation.y, currentTranslation.z);
    const offset = cameraOffsetBack.clone().applyQuaternion(playerScene.quaternion); // Use back offset for positioning

    const cameraPosition = targetPosition.clone().add(offset);

    camera.position.lerp(cameraPosition, cameraLerpFactor);
    camera.lookAt(targetPosition.x, targetPosition.y + 1, targetPosition.z);

    playerScene.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
  };

  const updateCameraPosition = () => {
    const currentTranslation = playerRef.current.translation();
    const targetPosition = new THREE.Vector3(currentTranslation.x, currentTranslation.y, currentTranslation.z);
    const offset = cameraOffsetBack.clone().applyQuaternion(playerScene.quaternion); // Use back offset for positioning

    const cameraPosition = targetPosition.clone().add(offset);

    camera.position.copy(cameraPosition);
    camera.lookAt(targetPosition.x, targetPosition.y + 1, targetPosition.z);
  };

  const handleCollision = ({ other }) => {
    const objectName = other.rigidBodyObject?.name || 'unknown';
    if (objectName === 'ground') return;
    if (objectName === 'YellowBox') {
      onPlayerFall();
      playSound(sounds.died);
    } else if (objectName === 'Logo' || objectName.startsWith('Text3DItem')) {
      if (hitObjects.has(objectName)) return;

      setHitObjects((prevHitObjects) => {
        const newHitObjects = new Set(prevHitObjects);
        newHitObjects.add(objectName);
        onPlayerHit(newHitObjects.size, objectName);
        if (objectName === 'Logo') {
          playSound(sounds.logo);
        } else {
          playSound(sounds.hit);
        }
        return newHitObjects;
      });
    } else {
      setHitObjects((prevHitObjects) => {
        const newHitObjects = new Set(prevHitObjects);
        newHitObjects.add(objectName);
        onPlayerHit(newHitObjects.size, objectName);
        playSound(sounds.hit);
        return newHitObjects;
      });
    }

    if (objectName === 'YellowBox') {
      onPlayerFall();
      playSound(sounds.died);
    } else if (objectName === 'Billboard') {
      const now = Date.now();
      const delay = 2000; // 2 seconds delay
      if (now - lastBillboardClick > delay) {
        window.location.href = 'mailto:crystalthedeveloper@gmail.com';
        setLastBillboardClick(now); // Update the last click time
      }
    }
  };

  const playSound = (sound) => {
    try {
      sound.play().catch(error => {
        console.error(`Audio playback failed for ${sound.src}:`, error);
      });
    } catch (error) {
      console.error(`Audio playback failed for ${sound.src}:`, error);
    }
  };

  return (
    <RigidBody
      ref={playerRef}
      type="dynamic"
      position={[0, 1, 0]}
      colliders={false}
      enabledRotations={[false, true, false]}
      gravityScale={1}
      linearDamping={0}
      angularDamping={0}
      name="player"
      onCollisionEnter={handleCollision}
    >
      <primitive object={playerScene} position={[0, 0.5, 0]} />
      <CuboidCollider ref={colliderRef} args={[0.5, 1, 0.5]} position={[0, 1, 0]} />
    </RigidBody>
  );
};

export default ThirdPersonController;