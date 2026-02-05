import { create } from 'zustand';
import type { BotInfo } from '../types/index.ts';

interface BotState {
  token: string | null;
  botInfo: BotInfo | null;
  isConnected: boolean;
  isConnecting: boolean;
  isDeployed: boolean;
  error: string | null;
  pollingActive: boolean;
  setToken: (token: string) => void;
  setBotInfo: (info: BotInfo) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setDeployed: (deployed: boolean) => void;
  setError: (error: string | null) => void;
  setPollingActive: (active: boolean) => void;
  disconnect: () => void;
}

export const useBotStore = create<BotState>((set) => ({
  token: null,
  botInfo: null,
  isConnected: false,
  isConnecting: false,
  isDeployed: false,
  error: null,
  pollingActive: false,
  setToken: (token) => set({ token }),
  setBotInfo: (info) => set({ botInfo: info }),
  setConnected: (connected) => set({ isConnected: connected }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setDeployed: (deployed) => set({ isDeployed: deployed }),
  setError: (error) => set({ error }),
  setPollingActive: (active) => set({ pollingActive: active }),
  disconnect: () =>
    set({
      token: null,
      botInfo: null,
      isConnected: false,
      isConnecting: false,
      isDeployed: false,
      pollingActive: false,
      error: null,
    }),
}));
