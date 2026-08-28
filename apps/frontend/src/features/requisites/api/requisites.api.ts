import { requestJson } from '@/shared/api/http';
import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';

export interface Requisite {
  requisiteId: number;
  card: string;
  phone: string;
  fio: string;
  bank: string;
  bankId: number;
  tier1: boolean;
  status: 'on' | 'off';
  method: 'both' | 'card' | 'sbp' | null;
  minAmount: number | null;
  maxAmount: number | null;
  limitAmount: number | null;
  limitAmountMinutes: number | null;
  exactAmountOnly: boolean;
}

export interface CreateRequisiteInput {
  bankId: number;
  fio: string;
  card?: string;
  phone?: string;
  minAmount?: number;
  maxAmount?: number;
  limitAmount?: number;
  limitAmountMinutes?: number;
  exactAmountOnly?: boolean;
}

export interface EditRequisiteInput {
  status?: 'on' | 'off';
  minAmount?: number;
  maxAmount?: number;
  limitAmount?: number;
  limitAmountMinutes?: number;
  exactAmountOnly?: boolean;
  resetLimits?: boolean;
}

export async function getRequisites(): Promise<Requisite[]> {
  const response = await requestJson<{ success: true; data: Requisite[] }>('/requisites', {
    accessToken: getAuthAccessToken(),
  });
  return demoRequisite ? [...response.data, demoRequisite] : response.data;
}

// Temporary visual fixture for reviewing the settings screen. It is intentionally
// kept in this API adapter so it never changes the partner or database data.
let demoRequisite: Requisite | null = {
  requisiteId: -900001,
  card: '0000000000004242',
  phone: '-',
  fio: 'Демо пользователь',
  bank: 'Т-Банк',
  bankId: 1,
  tier1: false,
  status: 'off',
  method: 'card',
  minAmount: 5000,
  maxAmount: 50000,
  limitAmount: 100000,
  limitAmountMinutes: 1440,
  exactAmountOnly: false,
};

export async function createRequisite(input: CreateRequisiteInput): Promise<{ requisiteId: number }> {
  const response = await requestJson<{ success: true; data: { requisiteId: number } }>('/requisites', {
    method: 'POST',
    body: { ...input } as Record<string, unknown>,
    accessToken: getAuthAccessToken(),
  });
  return response.data;
}

export async function editRequisite(requisiteId: number, input: EditRequisiteInput): Promise<void> {
  if (requisiteId === -900001) {
    if (!demoRequisite) throw new Error('Реквизит не найден');
    demoRequisite = input.resetLimits
      ? { ...demoRequisite, limitAmount: null, limitAmountMinutes: null }
      : { ...demoRequisite, ...input };
    return;
  }
  await requestJson<{ success: true }>(`/requisites/${requisiteId}`, {
    method: 'PATCH',
    body: { ...input } as Record<string, unknown>,
    accessToken: getAuthAccessToken(),
  });
}

export async function deleteRequisite(requisiteId: number): Promise<void> {
  if (requisiteId === -900001) {
    demoRequisite = null;
    return;
  }
  await requestJson<{ success: true }>(`/requisites/${requisiteId}`, {
    method: 'DELETE',
    accessToken: getAuthAccessToken(),
  });
}
