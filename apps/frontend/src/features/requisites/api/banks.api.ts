import { requestJson } from '@/shared/api/http';
import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';

export interface Bank {
  id: number;
  name: string;
  tier1: boolean;
}

export async function getBanks(): Promise<Bank[]> {
  const response = await requestJson<{ success: true; data: Bank[] }>('/banks', {
    accessToken: getAuthAccessToken(),
  });
  return response.data;
}
