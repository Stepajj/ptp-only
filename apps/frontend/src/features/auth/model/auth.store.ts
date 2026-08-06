import { create } from 'zustand';

import type { AuthUser } from '../api/auth.api';

type AuthStatus = 'anonymous' | 'authenticated' | 'loading';

type AuthSession = {
  user: AuthUser;
  accessToken: string;
};

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;

  setSession: (session: AuthSession) => void;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  clearSession: () => void;
  setLoading: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'anonymous',

  // Persist session to localStorage as a fallback when cookies/refresh token aren't available
  setSession: ({ user, accessToken }) =>
    set(() => {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'auth.session',
            JSON.stringify({ user, accessToken }),
          );
        }
      } catch {
        // ignore storage errors
      }

      return {
        user,
        accessToken,
        status: 'authenticated',
      };
    }),

  setUser: (user) =>
    set((state) => {
      try {
        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem('auth.session');
          const parsed = raw ? JSON.parse(raw) : {};
          parsed.user = user;
          window.localStorage.setItem('auth.session', JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }

      return {
        user,
        status: user && state.accessToken ? 'authenticated' : 'anonymous',
      };
    }),

  setAccessToken: (accessToken) =>
    set((state) => {
      try {
        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem('auth.session');
          const parsed = raw ? JSON.parse(raw) : {};
          parsed.accessToken = accessToken;
          window.localStorage.setItem('auth.session', JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }

      return {
        accessToken,
        status: accessToken && state.user ? 'authenticated' : 'anonymous',
      };
    }),

  clearSession: () =>
    set(() => {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('auth.session');
        }
      } catch {
        // ignore
      }

      return {
        user: null,
        accessToken: null,
        status: 'anonymous',
      };
    }),

  setLoading: () =>
    set({
      status: 'loading',
    }),
}));