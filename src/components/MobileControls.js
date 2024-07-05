// src/components/MobileControls.js
import React from 'react';

const MobileControls = ({ handleTouchStart, handleTouchEnd }) => {
  return (
    <div className="mobile-controls">
      <button
        className="control-button up"
        onTouchStart={() => handleTouchStart('up')}
        onTouchEnd={() => handleTouchEnd('up')}
      />
      <button
        className="control-button down"
        onTouchStart={() => handleTouchStart('down')}
        onTouchEnd={() => handleTouchEnd('down')}
      />
      <button
        className="control-button left"
        onTouchStart={() => handleTouchStart('left')}
        onTouchEnd={() => handleTouchEnd('left')}
      />
      <button
        className="control-button right"
        onTouchStart={() => handleTouchStart('right')}
        onTouchEnd={() => handleTouchEnd('right')}
      />
    </div>
  );
};

export default MobileControls;