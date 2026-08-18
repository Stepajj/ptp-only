import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';
import { getBalance, me } from '@/features/auth/api/auth.api';

import type {
  Profile,
} from '../model/profile.types';

export async function getProfile(): Promise<Profile> {
  const accessToken = getAuthAccessToken();
  if (!accessToken) throw new Error('Authentication required');
  const [userResponse, balanceResponse] = await Promise.all([
    me(accessToken),
    getBalance(accessToken),
  ]);
  const user = userResponse.data.user;
  return {
    id: user.id,
    name: user.displayName,
    email: user.identifier ?? '—',
    telegram: user.telegramUsername ? `@${user.telegramUsername.replace(/^@/, '')}` : null,
    registeredAt: new Date(user.createdAt).getFullYear().toString(),
    avatar: user.telegramPhotoUrl,
    stats: balanceResponse.data,
  };
}
