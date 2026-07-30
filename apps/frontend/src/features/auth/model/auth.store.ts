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

  setSession: ({ user, accessToken }) =>
    set({
      user,
      accessToken,
      status: 'authenticated',
    }),

  setUser: (user) =>
    set((state) => ({
      user,
      status: user && state.accessToken ? 'authenticated' : 'anonymous',
    })),

  setAccessToken: (accessToken) =>
    set((state) => ({
      accessToken,
      status: accessToken && state.user ? 'authenticated' : 'anonymous',
    })),

  clearSession: () =>
    set({
      user: null,
      accessToken: null,
      status: 'anonymous',
    }),

  setLoading: () =>
    set({
      status: 'loading',
    }),
}));