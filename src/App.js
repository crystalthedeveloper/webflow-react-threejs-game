// path: src/App.js
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhysicsWorld from './components/PhysicsWorld';

const Scene = ({ progress }) => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <PhysicsWorld />
      <OrbitControls />
    </>
  );
};

const NavigationBar = ({ progress }) => {
  return (
    <nav className="nav">
      <div className="logo">
        <img src="/gold.png" alt="Logo" className="logo-image" />
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-image-wrap">
          <img src="/green.png" alt="Logo" className="progress-bar-image" />
          <div className="progress-bar">
            <div className="progress-bar-inner" id="progressBar"></div>
          </div>
        </div>
        <div className="progress-bar-image-wrap">
          <img src="/pink.png" alt="Logo" className="progress-bar-image" />
          <div className="progress-bar">
            <div className="progress-bar-inner" id="progressBar"></div>
          </div>
        </div>
        <div className="progress-bar-image-wrap">
          <img src="/blue.png" alt="Logo" className="progress-bar-image" />
          <div className="progress-bar">
            <div className="progress-bar-inner" id="progressBar"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  const [progress, setProgress] = useState(0.5); // Example progress state
  const [isInitialized, setIsInitialized] = useState(false); // Track Three.js initialization

  useEffect(() => {
  }, [isInitialized]);

  return (
    <>
      <NavigationBar progress={progress} />
      <Canvas className="canvas" onCreated={() => setIsInitialized(true)}>
        {isInitialized && <Scene progress={progress} />}
      </Canvas>
    </>
  );
};

export default App;