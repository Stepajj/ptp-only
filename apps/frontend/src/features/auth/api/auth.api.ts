import { requestJson } from '@/shared/api/http';

export type AuthUser = {
  id: string;
  status: string;
  language: string;
  createdAt: string;
  displayName: string;
  identifier: string | null;
  telegramUsername: string | null;
  telegramPhotoUrl: string | null;
  avatarUrl: string | null;
};

export type AuthSessionResponse = {
  success: true;
  data: {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    user: AuthUser;
  };
};

export type MeResponse = {
  success: true;
  data: {
    user: AuthUser;
  };
};

export type AuthCredentials = {
  identifier: string;
  password: string;
};

export type TelegramAuthPayload = {
  id_token: string;
};

export type RegisterPayload = AuthCredentials & {
  language?: string;
  telegram?: TelegramAuthPayload;
};

export async function register(payload: RegisterPayload) {
  const body: Record<string, unknown> = {
    identifier: payload.identifier,
    password: payload.password,
  };

  if (payload.language) {
    body.language = payload.language;
  }

  if (payload.telegram) {
    body.telegram = payload.telegram;
  }

  return requestJson<AuthSessionResponse>('/auth/register', {
    method: 'POST',
    body,
  });
}

export async function login(payload: AuthCredentials) {
  return requestJson<AuthSessionResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}
export async function telegramLogin(payload: TelegramAuthPayload) {
  return requestJson<AuthSessionResponse>("/auth/telegram", {
    method: "POST",
    body: payload,
  });
}

export async function linkTelegram(payload: TelegramAuthPayload, accessToken: string) {
  return requestJson<MeResponse>("/auth/link-telegram", {
    method: "POST",
    body: payload,
    accessToken,
  });
}
export async function refresh() {
  return requestJson<AuthSessionResponse>('/auth/refresh', {
    method: 'POST',
  });
}

export async function logout() {
  return requestJson<{ success: true }>('/auth/logout', {
    method: 'POST',
  });
}

export async function me(accessToken: string) {
  return requestJson<MeResponse>('/me', {
    method: 'GET',
    accessToken,
  });
}
export type BalanceResponse = {
  success: true;
  data: {
    balance: number;
    frozen: number;
    totalProfit: number;
  };
};

export async function getBalance(accessToken: string) {
  return requestJson<BalanceResponse>('/auth/balance', {
    method: 'GET',
    accessToken,
  });
}

export type AuthSession = {
  id: string;
  device: string;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  current: boolean;
};

export async function getSessions(accessToken: string) {
  return requestJson<{ success: true; data: AuthSession[] }>('/auth/sessions', {
    accessToken,
  });
}

export async function revokeSession(sessionId: string, accessToken: string) {
  return requestJson<null>(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function changePassword(input: { currentPassword: string; newPassword: string }, accessToken: string) {
  return requestJson<null>('/auth/password', {
    method: 'POST',
    body: input,
    accessToken,
  });
}

export async function updateProfile(
  input: { displayName?: string; avatarUrl?: string | null },
  accessToken: string,
) {
  return requestJson<MeResponse>('/auth/profile', {
    method: 'PATCH',
    body: input,
    accessToken,
  });
}
