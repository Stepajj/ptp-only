import { me } from '../api/auth.api';
import { useAuthStore } from '../model/auth.store';
import { refreshSession } from './refreshSession';

let bootstrapPromise: Promise<void> | null = null;

async function performBootstrapAuth(): Promise<void> {
  const authStore = useAuthStore.getState();

  authStore.setLoading();

  try {
    const accessToken = await refreshSession();

    if (!accessToken) {
      return;
    }

    const meResponse = await me(accessToken);

    authStore.setSession({
      accessToken,
      user: meResponse.data.user,
    });
  } catch {
    authStore.clearSession();
  }
}

export function bootstrapAuth(): Promise<void> {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = performBootstrapAuth().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}
