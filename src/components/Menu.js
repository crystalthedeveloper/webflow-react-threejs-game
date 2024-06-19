// path: src/components/Menu.js
import React, { useState, useEffect } from 'react';
import useGame from '../hooks/useGame';
import '../styles.css';

const Menu = ({ setMenuOpen }) => {
  const start = useGame((state) => state.start);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  useEffect(() => {
    setMenuOpen(true); // Set menu as open when component mounts
    return () => setMenuOpen(false); // Set menu as closed when component unmounts
  }, [setMenuOpen]);

  return (
    <div className="menu">
      <h1>Welcome to the Game</h1>
      {showInstructions && (
        <p className="instructions">
          Use the arrow keys to move and the spacebar to jump.<br /> Collect items and achieve the best time to win!<br />
          1st place winner earns <span className="good-luck">$$$</span><br />
          <span className="good-luck">Good luck!</span>
        </p>
      )}
      <button onClick={start} className="menu-button">Play</button>
      <button onClick={handleShowInstructions} className="menu-button">
        Instructions
      </button>
      <p className="contact-info">
        Need a website? Contact <a href="mailto:crystalthedeveloper@gmail.com">crystalthedeveloper@gmail.com</a>
      </p>
    </div>
  );
};

export default Menu;