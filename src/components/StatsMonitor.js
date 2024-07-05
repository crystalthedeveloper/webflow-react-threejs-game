// src/components/StatsMonitor.js
import React, { useRef, useEffect } from 'react';
import Stats from 'stats.js';

const StatsMonitor = () => {
  const statsRef = useRef(null);

  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms/frame, 2: memory
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    document.body.appendChild(stats.dom);
    statsRef.current = stats;

    const animate = () => {
      statsRef.current.begin();
      statsRef.current.end();
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      document.body.removeChild(stats.dom);
    };
  }, []);

  return null;
};

export default StatsMonitor;