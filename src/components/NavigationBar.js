// path: src/components/NavigationBar.js
import React from 'react';
import '../styles.css';

const NavigationBar = ({ progress, timer, totalItems }) => {
  const progressPercentage = progress * 100;

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
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </div>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>
      <div className="total-items">
        Total Items: {totalItems}
      </div>
    </nav>
  );
};

export default NavigationBar;