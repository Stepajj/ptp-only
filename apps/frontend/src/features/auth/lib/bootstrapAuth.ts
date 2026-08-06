import { refresh, me } from '../api/auth.api';
import { useAuthStore } from '../model/auth.store';

export async function bootstrapAuth() {
  const authStore = useAuthStore.getState();

  authStore.setLoading();

  try {
    const refreshResponse = await refresh();

    const accessToken = refreshResponse.data.accessToken;

    const meResponse = await me(accessToken);

    authStore.setSession({
      accessToken,
      user: meResponse.data.user,
    });
  } catch {
    // Если refresh не сработал — попробуем восстановить сессию из localStorage (фолбэк)
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('auth.session');
        if (raw) {
          const parsed = JSON.parse(raw) as { accessToken?: string; user?: unknown };
          if (parsed?.accessToken) {
            try {
              const meResponse = await me(parsed.accessToken);
              authStore.setSession({
                accessToken: parsed.accessToken,
                user: meResponse.data.user,
              });
              return;
            } catch {
              // ignore and fall through to clear
            }
          }
        }
      }
    } catch {
      // ignore parsing/storage errors
    }

    authStore.clearSession();
  }
}