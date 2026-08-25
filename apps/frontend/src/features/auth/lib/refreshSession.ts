import { useAuthStore } from '../model/auth.store';
import type { AuthUser } from '../api/auth.api';

const DEFAULT_API_URL = 'http://localhost:4000';

type RefreshPayload = {
  success: true;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};

let refreshPromise: Promise<string | null> | null = null;

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

async function parsePayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function performRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
    const payload = await parsePayload(response);

    if (
      !response.ok ||
      !payload ||
      typeof payload !== 'object' ||
      !('data' in payload)
    ) {
      useAuthStore.getState().clearSession();
      return null;
    }

    const data = (payload as Partial<RefreshPayload>).data;

    if (
      !data ||
      typeof data.accessToken !== 'string' ||
      !data.accessToken ||
      !data.user
    ) {
      useAuthStore.getState().clearSession();
      return null;
    }

    useAuthStore.getState().setSession({
      accessToken: data.accessToken,
      user: data.user,
    });

    return data.accessToken;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

export function refreshSession(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
