// src/hooks/useGame.js
import create from 'zustand';

const useGame = create((set) => ({
  // Initial state
  phase: 'initialMenu', // Starting with the initial menu phase
  cameraPhase: 'overview', // initial state for camera phase
  resetPlayerPosition: false,
  // Game phase control functions
  start: () => set((state) => {
    return state.phase === 'initialMenu' ? { phase: 'loading' } : {};
  }),
  loadComplete: () => set((state) => {
    return { phase: 'ready' };
  }),
  beginPlaying: () => set((state) => {
    return state.phase === 'ready' ? { phase: 'playing', cameraPhase: 'overview' } : {};
  }),
  restart: () => set((state) => {
    return state.phase !== 'playing' ? { phase: 'ready', cameraPhase: 'overview', resetPlayerPosition: true } : {};
  }),
  resetPlayerPositionDone: () => set((state) => ({ resetPlayerPosition: false })),
  playerDied: () => set((state) => {
    return { phase: 'dead' };
  }),
  setCameraPhase: (phase) => {
    set({ cameraPhase: phase });
  }, // function to set camera phase
}));

export default useGame;