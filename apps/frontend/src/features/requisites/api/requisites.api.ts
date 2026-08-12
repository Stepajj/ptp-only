import { requestJson } from '@/shared/api/http';

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
  minAmount: number;
  maxAmount: number;
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
  const response = await requestJson<{ success: true; data: Requisite[] }>('/requisites');
  return response.data;
}

export async function createRequisite(input: CreateRequisiteInput): Promise<{ requisiteId: number }> {
  const response = await requestJson<{ success: true; data: { requisiteId: number } }>('/requisites', {
    method: 'POST',
    body: { ...input } as Record<string, unknown>,
  });
  return response.data;
}

export async function editRequisite(requisiteId: number, input: EditRequisiteInput): Promise<void> {
  await requestJson<{ success: true }>(`/requisites/${requisiteId}`, {
    method: 'PATCH',
    body: { ...input } as Record<string, unknown>,
  });
}

export async function deleteRequisite(requisiteId: number): Promise<void> {
  await requestJson<{ success: true }>(`/requisites/${requisiteId}`, {
    method: 'DELETE',
  });
}