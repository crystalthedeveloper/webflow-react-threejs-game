// src/hooks/useGame.js
import create from 'zustand';

const useGame = create((set) => ({
  // Initial states
  phase: 'initialMenu',
  cameraPhase: 'overview',
  resetPlayerPosition: false,
  resetCameraPosition: false,
  cameraTransitionComplete: false,
  startTime: null,

  // Game phase control functions
  start: () => set((state) => {
    if (state.phase === 'initialMenu') {
      return { phase: 'loading' };
    }
    return {};
  }),

  loadComplete: () => set((state) => {
    if (state.phase === 'loading') {
      return { phase: 'ready' };
    }
    return {};
  }),

  beginPlaying: () => set((state) => {
    if (state.phase === 'ready') {
      return { phase: 'playing', cameraPhase: 'overview', cameraTransitionComplete: false, startTime: null };
    }
    return {};
  }),

  restart: () => set(() => {
    return { phase: 'ready', cameraPhase: 'overview', resetPlayerPosition: true, resetCameraPosition: true, startTime: null };
  }),

  resetPlayerPositionDone: () => set(() => {
    return { resetPlayerPosition: false };
  }),

  resetCameraPositionDone: () => set(() => {
    return { resetCameraPosition: false };
  }),

  playerDied: () => set((state) => {
    return { phase: 'dead' };
  }),

  setCameraPhase: (phase) => set(() => {
    return { cameraPhase: phase };
  }),

  startTimer: () => set(() => {
    const startTime = Date.now();
    return { startTime };
  }),

  setCameraTransitionComplete: (complete) => set(() => {
    return { cameraTransitionComplete: complete };
  })
}));

export default useGame;