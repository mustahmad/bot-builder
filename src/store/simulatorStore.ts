import { create } from 'zustand';
import type { SimMessage } from '../types/index.ts';

interface SimulatorState {
  messages: SimMessage[];
  isOpen: boolean;
  pendingInputNodeId: string | null;
  variables: Record<string, string>;
  addMessage: (msg: SimMessage) => void;
  addMessages: (msgs: SimMessage[]) => void;
  clearMessages: () => void;
  setOpen: (open: boolean) => void;
  setPendingInput: (nodeId: string | null) => void;
  setVariable: (name: string, value: string) => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  messages: [],
  isOpen: true,
  pendingInputNodeId: null,
  variables: {},

  addMessage: (msg) => set({ messages: [...get().messages, msg] }),

  addMessages: (msgs) => set({ messages: [...get().messages, ...msgs] }),

  clearMessages: () => set({ messages: [], pendingInputNodeId: null, variables: {} }),

  setOpen: (open) => set({ isOpen: open }),

  setPendingInput: (nodeId) => set({ pendingInputNodeId: nodeId }),

  setVariable: (name, value) =>
    set({ variables: { ...get().variables, [name]: value } }),
}));
