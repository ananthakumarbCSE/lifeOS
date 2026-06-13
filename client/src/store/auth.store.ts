import { create } from 'zustand';
import { User } from '@/types/user.types';
import { apiClient } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user, isAuthenticated: true }),

  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true,
    });
  },

  register: async (email, password, displayName) => {
    const { data } = await apiClient.post('/auth/register', { email, password, displayName });
    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    apiClient.post('/auth/logout').catch(() => {});
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      // Try to refresh the token using the HttpOnly cookie
      const { data: refreshData } = await apiClient.post('/auth/refresh');
      set({ accessToken: refreshData.accessToken });

      // Fetch user data
      const { data: userData } = await apiClient.get('/auth/me');
      set({
        user: userData.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
