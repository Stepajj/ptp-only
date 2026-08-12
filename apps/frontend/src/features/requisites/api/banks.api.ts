import { requestJson } from '@/shared/api/http';

export interface Bank {
  id: number;
  name: string;
  tier1: boolean;
}

export async function getBanks(): Promise<Bank[]> {
  const response = await requestJson<{ success: true; data: Bank[] }>('/banks');
  return response.data;
}