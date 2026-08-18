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
    authStore.clearSession();
  }
}
