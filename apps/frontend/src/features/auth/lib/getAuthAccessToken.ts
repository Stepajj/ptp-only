import { useAuthStore } from "../model/auth.store";

export function getAuthAccessToken(): string | undefined {
  return useAuthStore.getState().accessToken ?? undefined;
}
