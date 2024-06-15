// path: src/components/Menu.js
import React, { useState } from 'react';
import useGame from '../hooks/useGame';
import '../styles.css';

const Menu = () => {
  const start = useGame((state) => state.start);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  return (
    <div className="menu">
      <h1>Welcome to the Game</h1>
      {showInstructions && (
        <p className="instructions">
          Use the arrow keys to move and the spacebar to jump. Collect items and achieve the best time to win!<br/>
          1st place winner earns $$$<br/>
          Good luck!
        </p>
      )}
      <button onClick={start} className="menu-button">Play</button>
      <button onClick={handleShowInstructions} className="menu-button">
        Play Instructions
      </button>
    </div>
  );
};

export default Menu;