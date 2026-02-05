import { create } from 'zustand';
import type { SimMessage } from '../types/index.ts';

interface SimulatorState {
  messages: SimMessage[];
  isOpen: boolean;
  addMessage: (msg: SimMessage) => void;
  addMessages: (msgs: SimMessage[]) => void;
  clearMessages: () => void;
  setOpen: (open: boolean) => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  messages: [],
  isOpen: true,

  addMessage: (msg) => set({ messages: [...get().messages, msg] }),

  addMessages: (msgs) => set({ messages: [...get().messages, ...msgs] }),

  clearMessages: () => set({ messages: [] }),

  setOpen: (open) => set({ isOpen: open }),
}));
