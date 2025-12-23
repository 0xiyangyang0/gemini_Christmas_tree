import { create } from 'zustand';

interface TreeState {
  mode: 'CHAOS' | 'FORMED';
  setMode: (mode: 'CHAOS' | 'FORMED') => void;
  toggleMode: () => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  mode: 'FORMED',
  setMode: (mode) => set({ mode }),
  toggleMode: () => set((state) => ({ mode: state.mode === 'FORMED' ? 'CHAOS' : 'FORMED' })),
}));
