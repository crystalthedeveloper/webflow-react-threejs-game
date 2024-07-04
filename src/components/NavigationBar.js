// path: src/components/NavigationBar.js
import React from 'react';
import '../styles.css';

const NavigationBar = ({ progress, timer, totalItems, active }) => {
  const progressPercentage = progress * 100;

  if (active) return null;

  // Calculate minutes and seconds
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  // Format timer display
  const formattedTimer = minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}`;

  return (
    <nav className="nav">
      <div className="logo">
        <a href="https://www.crystalthedeveloper.ca" target="_blank" rel="noopener noreferrer">
          <img src="/gold.png" alt="Logo" className="logo-image" />
        </a>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-timer-wrap">
          <div className="timer">
            {formattedTimer}
          </div>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="total-items">
            {totalItems}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;