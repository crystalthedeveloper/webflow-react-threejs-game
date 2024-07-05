// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, useProgress } from '@react-three/drei';
import NavigationBar from './components/NavigationBar';
import Scene from './components/Scene';
import Popup from './components/Popup';
import Menu from './components/Menu';
import useGame from './hooks/useGame';
import useMobileControls from './hooks/useMobileControls';
import MobileControls from './components/MobileControls';
import { Physics } from '@react-three/rapier';
import StatsMonitor from './components/StatsMonitor';

const App = () => {
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  const [totalItems, setTotalItems] = useState(36);
  const [collectedItems, setCollectedItems] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const intervalRef = useRef(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { mobileControls, handleTouchStart, handleTouchEnd } = useMobileControls();

  const phase = useGame((state) => state.phase);
  const cameraTransitionComplete = useGame((state) => state.cameraTransitionComplete);
  const start = useGame((state) => state.start);
  const loadComplete = useGame((state) => state.loadComplete);
  const beginPlaying = useGame((state) => state.beginPlaying);
  const restart = useGame((state) => state.restart);
  const playerDied = useGame((state) => state.playerDied);
  const resetPlayerPosition = useGame((state) => state.resetPlayerPosition);
  const resetPlayerPositionDone = useGame((state) => state.resetPlayerPositionDone);
  const setCameraPhase = useGame((state) => state.setCameraPhase);
  const startTimer = useGame((state) => state.startTimer);
  const startTime = useGame((state) => state.startTime);

  const { active, progress: loadingProgress } = useProgress();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (phase === 'playing' && cameraTransitionComplete && !intervalRef.current) {
      startTimer();
      intervalRef.current = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, cameraTransitionComplete, startTime, startTimer]);

  useEffect(() => {
    if (totalItems > 0) {
      const newProgress = collectedItems / totalItems;
      setProgress(newProgress);
    }
  }, [collectedItems, totalItems]);

  useEffect(() => {
    if (resetPlayerPosition) {
      resetPlayerPositionDone();
    }
  }, [resetPlayerPosition, resetPlayerPositionDone]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const updateProgress = (newCollectedItems, itemName) => {
    setCollectedItems(newCollectedItems);
    if (newCollectedItems >= totalItems) {
      const formattedTime = formatTime(timer);
      setPopupMessage(`Congrats, you won!<br />You collected ${newCollectedItems} items.<br />Your time: ${formattedTime}`);
      setShowPopup(true);
      clearInterval(intervalRef.current);
    }
  };

  const handleItemsLoaded = (itemsCount) => {
    setTotalItems(itemsCount + 1);
  };

  const saveGame = () => {
    setShowPopup(false);
  };

  const handlePlayerFall = () => {
    const formattedTime = formatTime(timer);
    setPopupMessage(`Sorry, you died.<br />You collected ${collectedItems} items.<br />Your time: ${formattedTime}`);
    setShowPopup(true);
    clearInterval(intervalRef.current);
    playerDied();
  };

  const handleRestart = () => {
    setCollectedItems(0);
    setProgress(0);
    setTimer(0);
    restart();
    setShowPopup(false);
  };

  useEffect(() => {
    if (phase === 'loading' && !active) {
      loadComplete();
    }
  }, [phase, active, loadComplete]);

  useEffect(() => {
    if (phase === 'ready' && !active) {
      setCameraPhase('overview');
      beginPlaying();
    }
  }, [phase, active, beginPlaying, setCameraPhase]);

  return (
    <>
      {!menuOpen && !active && <NavigationBar progress={progress} timer={timer} totalItems={totalItems} />}
      <Canvas className="canvas">
        <Physics gravity={[0, -9.81, 0]}>
          {phase === 'playing' && (
            <Scene
              onItemsLoaded={handleItemsLoaded}
              updateProgress={updateProgress}
              onPlayerFall={handlePlayerFall}
              mobileControls={mobileControls}
            />
          )}
        </Physics>
      </Canvas>
      {isMobile && cameraTransitionComplete && phase !== 'dead' && (
        <MobileControls handleTouchStart={handleTouchStart} handleTouchEnd={handleTouchEnd} />
      )}
      {active && (
        <Loader containerStyles={{
          backgroundColor: 'rgba(0, 0, 0, 1)',
          zIndex: 1000,
        }}>
          <div style={{ color: '#fff', marginTop: '20px' }}>
            Loading: {loadingProgress.toFixed(2)}%
          </div>
        </Loader>
      )}
      {!active && phase === 'initialMenu' && <Menu setMenuOpen={setMenuOpen} />}
      {!active && phase === 'ready' && <button onClick={beginPlaying} className="start-button">Start Game</button>}
      {showPopup && (
        <Popup message={popupMessage}>
          <button onClick={handleRestart} className="popup-button">Restart Game</button>
          <button onClick={saveGame} className="popup-button">Save Game</button>
        </Popup>
      )}
    </>
  );
};

export default App;