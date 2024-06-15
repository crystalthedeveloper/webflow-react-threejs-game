// path: src/hooks/useGame.js
import create from 'zustand';

const useGame = create((set) => ({
  // Initial state
  phase: 'initialMenu', // Starting with the initial menu phase
  cameraPhase: 'overview', // initial state for camera phase
  resetPlayerPosition: false,
  // Game phase control functions
  start: () => set((state) => {
    console.log('Game started');
    return state.phase === 'initialMenu' ? { phase: 'loading' } : {};
  }),
  loadComplete: () => set((state) => {
    console.log('Loading complete');
    return { phase: 'ready' };
  }),
  beginPlaying: () => set((state) => {
    console.log('Begin playing');
    return state.phase === 'ready' ? { phase: 'playing', cameraPhase: 'overview' } : {};
  }),
  restart: () => set((state) => {
    console.log('Game restarted');
    return state.phase !== 'playing' ? { phase: 'ready', cameraPhase: 'overview', resetPlayerPosition: true } : {};
  }),
  resetPlayerPositionDone: () => set((state) => ({ resetPlayerPosition: false })),
  playerDied: () => set((state) => {
    console.log('Player died');
    return { phase: 'dead' };
  }),
  setCameraPhase: (phase) => {
    console.log('Camera phase set to:', phase);
    set({ cameraPhase: phase });
  }, // function to set camera phase
}));

export default useGame;