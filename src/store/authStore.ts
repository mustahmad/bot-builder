import { create } from 'zustand';
import * as api from '../services/api.ts';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login(email, password);
      api.setToken(data.token);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Ошибка входа',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.register(email, password);
      api.setToken(data.token);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Ошибка регистрации',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    api.clearToken();
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    if (!api.hasToken()) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const data = await api.getMe();
      set({ user: { id: data.user.id, email: data.user.email }, isAuthenticated: true, isLoading: false });
    } catch {
      api.clearToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
