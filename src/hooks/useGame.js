// path: src/hooks/useGame.js
import create from 'zustand';

const useGame = create((set) => ({
  // Initial state
  phase: 'ready',
  cameraPhase: 'overview', // initial state for camera phase
  // Game phase control functions
  start: () => set((state) => (state.phase === 'ready' ? { phase: 'playing', cameraPhase: 'overview' } : {})),
  restart: () => set((state) => (state.phase === 'playing' ? { phase: 'ready', cameraPhase: 'overview' } : {})),
  setCameraPhase: (phase) => set({ cameraPhase: phase }), // function to set camera phase
}));

export default useGame;