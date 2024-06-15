// path: src/ThirdPersonController.js
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
  const cameraOffset = new THREE.Vector3(0, 1.6, 5); // Adjusted for better view

  const { rapier, world } = useRapier(); // Get the rapier world object
  const [grounded, setGrounded] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpCooldown, setJumpCooldown] = useState(false);
  const jumpStrength = 20;
  const jumpCooldownTime = 500;
  const [hitObjects, setHitObjects] = useState(new Set());
  const cameraPhase = useGame((state) => state.cameraPhase);
  const setCameraPhase = useGame((state) => state.setCameraPhase);
  const resetPlayerPosition = useGame((state) => state.resetPlayerPosition);

  useEffect(() => {
    camera.position.set(0, 2, 10); // Starting further away from the player
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
      y: playerRef.current.translation().y - 0.5, // small offset to avoid starting inside the player's collider
      z: playerRef.current.translation().z,
    };

    const ray = new rapier.Ray(origin, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 1.1, true, (collider) => {
      return collider !== playerRef.current.collider();
    });

    if (hit && hit.collider) {
      const isGrounded = hit.toi >= 0 && hit.toi < 1.1; // Adjust condition to include toi of 0
      setGrounded(isGrounded);
      return isGrounded;
    }

    setGrounded(false);
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ' && grounded && !isJumping && !jumpCooldown) {
        playerRef.current.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true);
        setIsJumping(true);
        setJumpCooldown(true);
        setTimeout(() => {
          setJumpCooldown(false);
        }, jumpCooldownTime);

        if (actions['jump']) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [grounded, isJumping, jumpCooldown, actions]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    if (cameraPhase === 'overview') {
      // Cinematic camera movement from front to back of the player
      const elapsedTime = state.clock.getElapsedTime();
      const duration = 5; // Duration of the cinematic view (5 seconds)
      const t = Math.min(elapsedTime / duration, 1); // Normalized time between 0 and 1

      const startPosition = new THREE.Vector3(0, 2, 20); // Start position further in front of the player
      const endPosition = new THREE.Vector3(0, 2, -10); // End position behind the player

      const playerPosition = playerRef.current.translation();
      const cinematicPosition = new THREE.Vector3(
        THREE.MathUtils.lerp(startPosition.x, endPosition.x, t),
        THREE.MathUtils.lerp(startPosition.y, endPosition.y, t),
        THREE.MathUtils.lerp(startPosition.z, endPosition.z, t)
      ).add(playerPosition);

      camera.position.lerp(cinematicPosition, 0.05); // Adjust the lerp factor for smoothness
      camera.lookAt(playerPosition);

      // Transition to player's camera view after the cinematic view ends
      if (t >= 1) {
        setCameraPhase('player');
      }
    } else if (cameraPhase === 'player') {
      moveDirection.current.set(0, 0, 0);

      if (keys.has('ArrowUp')) moveDirection.current.z -= 1;
      if (keys.has('ArrowDown')) moveDirection.current.z += 1;

      const moveSpeed = keys.has('Shift') ? 30 : 5;
      moveDirection.current.normalize().multiplyScalar(moveSpeed * delta);

      if (keys.has('ArrowLeft')) {
        playerScene.rotation.y += Math.PI * delta;
        playerRef.current.setRotation({ x: 0, y: playerScene.rotation.y, z: 0 });
      }
      if (keys.has('ArrowRight')) {
        playerScene.rotation.y -= Math.PI * delta;
        playerRef.current.setRotation({ x: 0, y: playerScene.rotation.y, z: 0 });
      }

      const currentTranslation = playerRef.current.translation();
      const forwardVector = new THREE.Vector3(0, 0, 1).applyQuaternion(playerScene.quaternion);

      const newTranslation = {
        x: currentTranslation.x + moveDirection.current.z * forwardVector.x,
        y: currentTranslation.y,
        z: currentTranslation.z + moveDirection.current.z * forwardVector.z,
      };

      playerRef.current.setTranslation(newTranslation, true);

      const groundedStatus = checkGrounded();
      setGrounded(groundedStatus);

      if (groundedStatus && isJumping) {
        setIsJumping(false);
      }

      if (groundedStatus && moveDirection.current.length() > 0) {
        if (actions['walk']) {
          actions['walk'].play();
        }
        if (actions['idle']) {
          actions['idle'].stop();
        }
      } else {
        if (actions['walk']) {
          actions['walk'].stop();
        }
        if (actions['idle']) {
          actions['idle'].play();
        }
      }

      const translation = playerRef.current.translation();
      const targetPosition = new THREE.Vector3(translation.x, translation.y, translation.z);
      const cameraPosition = targetPosition.clone().add(cameraOffset.clone().applyQuaternion(playerScene.quaternion));

      camera.position.lerp(cameraPosition, 0.05); // Lowering the factor for smoother interpolation
      camera.lookAt(targetPosition.x, targetPosition.y + 1, targetPosition.z);

      playerScene.position.set(targetPosition.x, targetPosition.y, targetPosition.z);

      // Check if player has fallen off the ground
      if (translation.y < -10) {
        onPlayerFall();
        // No restart here, handle in App.js
      }
    }
  });

  const handleCollision = ({ other }) => {
    const objectName = other.rigidBodyObject?.name || 'unknown';
    if (objectName === 'YellowBox') {
      onPlayerFall();
    } else if (objectName !== 'ground') {
      setHitObjects((prevHitObjects) => {
        const newHitObjects = new Set(prevHitObjects);
        newHitObjects.add(objectName);
        onPlayerHit(newHitObjects.size, objectName); // Update progress based on the number of unique objects hit
        return newHitObjects;
      });
    }
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