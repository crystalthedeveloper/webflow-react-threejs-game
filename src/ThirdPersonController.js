// path: src/ThirdPersonController.js
import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import useKeyboardControls from './hooks/useKeyboardControls';

const ThirdPersonController = () => {
  const { camera, scene } = useThree();
  const keys = useKeyboardControls();
  const playerRef = useRef();
  const { scene: playerScene, animations } = useGLTF('/playerModel.glb');
  const { actions } = useAnimations(animations, playerScene);
  const moveDirection = useRef(new THREE.Vector3(0, 0, 0));
  const cameraOffset = new THREE.Vector3(0, 2, -5);

  const raycaster = useRef(new THREE.Raycaster());
  const [grounded, setGrounded] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpCooldown, setJumpCooldown] = useState(false);
  const jumpStrength = 20;
  const jumpCooldownTime = 500; // Cooldown period in milliseconds

  useEffect(() => {
    camera.position.set(0, 2, 5);
    camera.lookAt(new THREE.Vector3(0, 1, 0));
    
    // Rotate the player model so the back faces the camera
    playerScene.rotation.y = Math.PI; // Rotate 180 degrees around the Y axis
    
    scene.add(playerScene);

    if (actions['idle']) {
      actions['idle'].play();
    }
  }, [camera, scene, playerScene, actions]);

  const checkGrounded = () => {
    if (!playerRef.current) return false;

    const origin = new THREE.Vector3(
      playerRef.current.translation().x,
      playerRef.current.translation().y,
      playerRef.current.translation().z
    );
    raycaster.current.set(origin, new THREE.Vector3(0, -1, 0));

    const intersects = raycaster.current.intersectObjects(scene.children, true);
    return intersects.length > 0 && intersects[0].distance < 1.1;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ' && grounded && !isJumping && !jumpCooldown) {
        playerRef.current.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true);
        setIsJumping(true);
        setJumpCooldown(true);
        setTimeout(() => setJumpCooldown(false), jumpCooldownTime);

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

    moveDirection.current.set(0, 0, 0);

    if (keys.has('ArrowUp')) moveDirection.current.z += 1;
    if (keys.has('ArrowDown')) moveDirection.current.z -= 1;
    if (keys.has('ArrowLeft')) moveDirection.current.x -= 1;
    if (keys.has('ArrowRight')) moveDirection.current.x += 1;

    const moveSpeed = keys.has('Shift') ? 10 : 5;
    moveDirection.current.normalize().multiplyScalar(moveSpeed * delta);

    const currentTranslation = playerRef.current.translation();
    const forwardVector = new THREE.Vector3(0, 0, 1).applyQuaternion(playerRef.current.rotation());
    const leftVector = new THREE.Vector3(-1, 0, 0).applyQuaternion(playerRef.current.rotation());

    const newTranslation = {
      x: currentTranslation.x + moveDirection.current.x * leftVector.x + moveDirection.current.z * forwardVector.x,
      y: currentTranslation.y,
      z: currentTranslation.z + moveDirection.current.z * forwardVector.z + moveDirection.current.x * leftVector.z,
    };

    playerRef.current.setTranslation(newTranslation, true);

    const groundedStatus = checkGrounded();
    setGrounded(groundedStatus);

    if (groundedStatus && isJumping) {
      setIsJumping(false);

      if (moveDirection.current.length() > 0) {
        if (actions['walk']) {
          actions['walk'].play();
        }
      } else {
        if (actions['idle']) {
          actions['idle'].play();
        }
      }
    }

    const translation = playerRef.current.translation();
    const targetPosition = new THREE.Vector3(translation.x, translation.y, translation.z);
    const cameraTarget = targetPosition.clone().add(cameraOffset);

    camera.position.lerp(cameraTarget, 0.1);
    camera.lookAt(targetPosition.x, targetPosition.y + 1, targetPosition.z);

    playerScene.position.set(targetPosition.x, targetPosition.y, targetPosition.z);

    if (moveDirection.current.length() > 0) {
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
  });

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
    >
      <primitive object={playerScene} />
      <CuboidCollider args={[0.5, 1, 0.5]} position={[0, 1, 0]} />
    </RigidBody>
  );
};

export default ThirdPersonController;