// path: src/hooks/useKeyboardControls.js
import { useState, useEffect } from 'react';

const useKeyboardControls = () => {
  const [keys, setKeys] = useState(new Set());

  useEffect(() => {
    const handleKeyDown = (event) => {
      setKeys((prevKeys) => new Set(prevKeys).add(event.key));
    };

    const handleKeyUp = (event) => {
      setKeys((prevKeys) => {
        const newKeys = new Set(prevKeys);
        newKeys.delete(event.key);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};

export default useKeyboardControls;