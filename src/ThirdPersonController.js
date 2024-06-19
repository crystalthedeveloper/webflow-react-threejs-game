// src/ThirdPersonController.js
import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CuboidCollider, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import useKeyboardControls from './hooks/useKeyboardControls';
import useGame from './hooks/useGame';

const ThirdPersonController = ({ onPlayerHit, onPlayerFall }) => {
  const { camera, scene } = useThree();
  const keys = useKeyboardControls();
  const playerRef = useRef();
  const { scene: playerScene, animations } = useGLTF('/playerModel.glb');
  const { actions } = useAnimations(animations, playerScene);
  const moveDirection = useRef(new THREE.Vector3(0, 0, 0));
  const cameraOffset = new THREE.Vector3(0, 1.6, 4); // Adjusted for better view

  const { rapier, world } = useRapier();
  const [grounded, setGrounded] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpCooldown, setJumpCooldown] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false); // Track Shift key state
  const [upPressed, setUpPressed] = useState(false); // Track Up Arrow key state
  const [isRunning, setIsRunning] = useState(false); // Track if the player is running
  const jumpStrength = 20;
  const jumpCooldownTime = 500;
  const [hitObjects, setHitObjects] = useState(new Set());
  const cameraPhase = useGame((state) => state.cameraPhase);
  const setCameraPhase = useGame((state) => state.setCameraPhase);
  const resetPlayerPosition = useGame((state) => state.resetPlayerPosition);

  const hitSound = new Audio('/sounds/hit.mp3');
  const redBoxSound = new Audio('/sounds/redBoxHit.mp3');
  const diedSound = new Audio('/sounds/died.mp3');

  useEffect(() => {
    camera.position.set(0, 1.6, 4); // Starting further away from the player
    camera.lookAt(new THREE.Vector3(0, 1, 0));

    playerScene.rotation.y = Math.PI;

    scene.add(playerScene);

    if (actions['idle']) {
      actions['idle'].play();
    }
  }, [camera, scene, playerScene, actions]);

  useEffect(() => {
    if (resetPlayerPosition && playerRef.current) {
      playerRef.current.setTranslation({ x: 0, y: 2, z: 0 }, true);
    }
  }, [resetPlayerPosition]);

  const checkGrounded = () => {
    if (!playerRef.current) return false;

    const origin = {
      x: playerRef.current.translation().x,
      y: playerRef.current.translation().y - 0.5,
      z: playerRef.current.translation().z,
    };

    const ray = new rapier.Ray(origin, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 1.1, true, (collider) => {
      return collider !== playerRef.current.collider();
    });

    if (hit && hit.collider) {
      const isGrounded = hit.toi >= 0 && hit.toi < 1.1;
      setGrounded(isGrounded);
      return isGrounded;
    }

    setGrounded(false);
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Shift') {
        console.log('Shift key down');
        setShiftPressed(true);
      }
      if (event.key === 'ArrowUp') {
        console.log('Up Arrow key down');
        setUpPressed(true);
      }

      if (event.key === ' ' && grounded && !isJumping && !jumpCooldown) {
        playerRef.current.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true);
        setIsJumping(true);
        setJumpCooldown(true);
        setTimeout(() => {
          setJumpCooldown(false);
        }, jumpCooldownTime);

        if (actions['jump']) {
          console.log('Playing jump animation');
          actions['jump'].reset().fadeIn(0.2).play();
          actions['jump'].loop = THREE.LoopOnce;
          actions['jump'].clampWhenFinished = true;
        }
        if (actions['idle']) {
          actions['idle'].fadeOut(0.2);
        }
        if (actions['walk']) {
          actions['walk'].fadeOut(0.2);
        }
        if (actions['run']) {
          actions['run'].fadeOut(0.2);
        }
        if (actions['backward']) {
          actions['backward'].fadeOut(0.2);
        }
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        console.log('Shift key up');
        setShiftPressed(false);
      }
      if (event.key === 'ArrowUp') {
        console.log('Up Arrow key up');
        setUpPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [grounded, isJumping, jumpCooldown, actions]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    if (cameraPhase === 'overview') {
      const elapsedTime = state.clock.getElapsedTime();
      const duration = 5;
      const angle = (elapsedTime / duration) * Math.PI * 1; // Full circle over duration

      const radius = 3; // Distance from the player
      const playerPosition = playerRef.current.translation();
      const x = playerPosition.x + radius * Math.cos(angle);
      const z = playerPosition.z + radius * Math.sin(angle);
      const y = playerPosition.y + 1; // Height of the camera

      camera.position.lerp(new THREE.Vector3(x, y, z), 0.05);
      camera.lookAt(playerPosition.x, playerPosition.y + 1, playerPosition.z);

      if (elapsedTime >= duration) {
        setCameraPhase('player');
      }
    } else if (cameraPhase === 'player') {
      moveDirection.current.set(0, 0, 0);

      const shouldRun = shiftPressed && upPressed;
      if (shouldRun !== isRunning) {
        setIsRunning(shouldRun);
        console.log('Running state changed:', shouldRun);
        if (shouldRun) {
          if (actions['walk'] && actions['walk'].isRunning()) {
            actions['walk'].fadeOut(0.2).stop();
          }
          if (actions['run'] && !actions['run'].isRunning()) {
            console.log('Playing run animation');
            actions['run'].reset().fadeIn(0.2).play();
          }
        } else {
          if (actions['run'] && actions['run'].isRunning()) {
            console.log('Stopping run animation');
            actions['run'].fadeOut(0.2).stop();
          }
        }
      }

      const moveSpeed = shouldRun ? 30 : 5;
      const cameraLerpFactor = shouldRun ? 0.1 : 0.05;

      if (keys.has('ArrowUp')) moveDirection.current.z -= 1;
      if (keys.has('ArrowDown')) moveDirection.current.z += 1;
      if (keys.has('ArrowLeft')) moveDirection.current.x -= 1;
      if (keys.has('ArrowRight')) moveDirection.current.x += 1;

      moveDirection.current.normalize().multiplyScalar(moveSpeed * delta);

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

      if (groundedStatus && isJumping) {
        setIsJumping(false);
      }

      if (groundedStatus && moveDirection.current.length() > 0) {
        if (shouldRun) {
          console.log('Running');
          if (actions['run'] && !actions['run'].isRunning()) {
            console.log('Playing run animation');
            actions['run'].reset().fadeIn(0.2).play();
          }
        } else if (keys.has('ArrowDown')) {
          console.log('Walking backward');
          if (actions['backward']) {
            actions['backward'].play();
          }
        } else {
          console.log('Walking');
          if (actions['walk'] && !actions['walk'].isRunning()) {
            console.log('Playing walk animation');
            actions['walk'].reset().fadeIn(0.2).play();
          }
        }
        if (actions['idle']) {
          actions['idle'].stop();
        }
      } else {
        if (actions['run'] && actions['run'].isRunning()) {
          actions['run'].stop();
        }
        if (actions['walk'] && actions['walk'].isRunning()) {
          actions['walk'].stop();
        }
        if (actions['backward']) {
          actions['backward'].stop();
        }
        if (actions['idle']) {
          actions['idle'].play();
        }
      }

      if (keys.has('ArrowLeft')) {
        playerScene.rotation.y += Math.PI * delta;
        playerRef.current.setRotation({ x: 0, y: playerScene.rotation.y, z: 0 });
      } else if (keys.has('ArrowRight')) {
        playerScene.rotation.y -= Math.PI * delta;
        playerRef.current.setRotation({ x: 0, y: playerScene.rotation.y, z: 0 });
      }

      const translation = playerRef.current.translation();
      const targetPosition = new THREE.Vector3(translation.x, translation.y, translation.z);
      const cameraPosition = targetPosition.clone().add(cameraOffset.clone().applyQuaternion(playerScene.quaternion));

      camera.position.lerp(cameraPosition, cameraLerpFactor);
      camera.lookAt(targetPosition.x, targetPosition.y + 1, targetPosition.z);

      playerScene.position.set(targetPosition.x, targetPosition.y, targetPosition.z);

      if (translation.y < -10) {
        diedSound.play(); // Play the fall sound
        onPlayerFall();
      }
    }
  });

  const handleCollision = ({ other }) => {
    const objectName = other.rigidBodyObject?.name || 'unknown';
    if (objectName === 'ground') {
      return; // Ignore collision with ground
    }
    let soundToPlay = hitSound;

    if (objectName === 'RedBox') {
      soundToPlay = redBoxSound;
    } else if (objectName === 'YellowBox') {
      onPlayerFall();
      soundToPlay = diedSound;
    }

    setHitObjects((prevHitObjects) => {
      const newHitObjects = new Set(prevHitObjects);
      newHitObjects.add(objectName);
      onPlayerHit(newHitObjects.size, objectName);
      soundToPlay.play();
      return newHitObjects;
    });
  };

  return (
    <RigidBody
      ref={(ref) => {
        if (ref) {
          playerRef.current = ref;
        }
      }}
      type="dynamic"
      position={[0, 2, 0]}
      colliders={false}
      enabledRotations={[false, true, false]}
      gravityScale={1}
      linearDamping={0}
      angularDamping={0}
      name="player"
      onCollisionEnter={handleCollision}
    >
      <primitive object={playerScene} />
      <CuboidCollider args={[0.5, 1, 0.5]} position={[0, 1, 0]} />
    </RigidBody>
  );
};

export default ThirdPersonController;