import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '../types';
import { loginUser, registerUser } from '../services/api';
import type { UserCreate } from '../types';

interface AuthStore {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (credentials: UserCreate) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { access_token } = await loginUser(credentials);
          localStorage.setItem('privacycheck-token', access_token);
          set({ token: access_token, isAuthenticated: true, loading: false });
        } catch (err: any) {
          const message = err?.response?.data?.detail || 'Login failed';
          set({ error: message, loading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const user = await registerUser(data);
          // Auto-login after registering
          const { access_token } = await loginUser({ email: data.email, password: data.password });
          localStorage.setItem('privacycheck-token', access_token);
          set({ user, token: access_token, isAuthenticated: true, loading: false });
        } catch (err: any) {
          const message = err?.response?.data?.detail || 'Registration failed';
          set({ error: message, loading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('privacycheck-token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'privacycheck-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
