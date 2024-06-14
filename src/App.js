// path: src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import NavigationBar from './components/NavigationBar';
import Scene from './components/Scene';
import Popup from './components/Popup';
import useGame from './hooks/useGame';
import { Physics } from '@react-three/rapier';

const App = () => {
  const [progress, setProgress] = useState(0); // Initialize progress to 0
  const [timer, setTimer] = useState(0); // Timer state
  const [totalItems, setTotalItems] = useState(0); // Total Text3DItem components
  const [collectedItems, setCollectedItems] = useState(0); // Collected items
  const [showPopup, setShowPopup] = useState(false); // State for showing popup
  const intervalRef = useRef(null); // Ref for storing the interval ID
  const [popupMessage, setPopupMessage] = useState(''); // State for popup message

  const phase = useGame((state) => state.phase);
  const start = useGame((state) => state.start);
  const restart = useGame((state) => state.restart);

  useEffect(() => {
    if (phase === 'playing') {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (phase === 'ready') {
      setTimer(0);
      setCollectedItems(0);
      setProgress(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  useEffect(() => {
    if (totalItems > 0) {
      const newProgress = collectedItems / totalItems;
      setProgress(newProgress);
    }
  }, [collectedItems, totalItems]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const updateProgress = (newCollectedItems, itemName) => {
    setCollectedItems(newCollectedItems);
    if (newCollectedItems >= 2) { // Update this to match your winning condition
      const formattedTime = formatTime(timer);
      setPopupMessage(`Congrats, you won!<br />Your time: ${formattedTime}`);
      setShowPopup(true);
      clearInterval(intervalRef.current); // Stop the timer
    }
  };

  const handleItemsLoaded = (itemsCount) => {
    setTotalItems(itemsCount);
  };

  const saveGame = () => {
    // Save the game with the player's time
    setShowPopup(false); // Hide popup after saving
  };

  const handlePlayerFall = () => {
    const formattedTime = formatTime(timer);
    setPopupMessage(`Sorry, you died.<br />Your time: ${formattedTime}`);
    setShowPopup(true);
    clearInterval(intervalRef.current); // Stop the timer
  };

  const handleRestart = () => {
    window.location.reload(); // Reload the page
  };

  return (
    <>
      <NavigationBar progress={progress} timer={timer} totalItems={totalItems} />
      <Canvas className="canvas" onCreated={() => start()}>
        <Physics gravity={[0, -9.81, 0]}>
          {phase === 'playing' && (
            <Scene
              onItemsLoaded={handleItemsLoaded}
              updateProgress={updateProgress}
              onPlayerFall={handlePlayerFall}
            />
          )}
        </Physics>
      </Canvas>
      {showPopup && (
        <Popup message={popupMessage}>
          <button onClick={handleRestart} className="popup-button">Restart Game</button>
          <button onClick={saveGame} className="popup-button">Save Game</button>
        </Popup>
      )}
      {phase === 'ready' && (
        <button onClick={start} className="start-button">
          Start Game
        </button>
      )}
    </>
  );
};

export default App;