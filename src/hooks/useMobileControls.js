// src/hooks/useMobileControls.js
import { useState, useCallback } from 'react';

const useMobileControls = () => {
  const [mobileControls, setMobileControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const handleTouchStart = useCallback((direction) => {
    console.log(`Touch start: ${direction}`);
    setMobileControls((controls) => ({ ...controls, [direction]: true }));
  }, []);

  const handleTouchEnd = useCallback((direction) => {
    console.log(`Touch end: ${direction}`);
    setMobileControls((controls) => ({ ...controls, [direction]: false }));
  }, []);

  return {
    mobileControls,
    handleTouchStart,
    handleTouchEnd,
  };
};

export default useMobileControls;
