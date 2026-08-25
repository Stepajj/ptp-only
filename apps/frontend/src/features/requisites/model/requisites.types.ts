import type { Requisite as ApiRequisite } from '../api/requisites.api';

export type RequisiteStatus = 'on' | 'off';

export type RequisiteType = 'both' | 'card' | 'sbp' | null;

export interface Requisite {
  requisiteId: number;
  card: string;
  phone: string;
  fio: string;
  bank: string;
  bankId: number;
  tier1: boolean;
  status: RequisiteStatus;
  method: RequisiteType;
  minAmount: number | null;
  maxAmount: number | null;
  limitAmount: number | null;
  limitAmountMinutes: number | null;
  exactAmountOnly: boolean;
}

export function fromApiRequisite(apiRequisite: ApiRequisite): Requisite {
  return apiRequisite;
}
