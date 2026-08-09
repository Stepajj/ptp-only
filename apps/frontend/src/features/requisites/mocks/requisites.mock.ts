import type { Requisite } from '@/features/requisites/model/requisites.types';

export const mockRequisites: Requisite[] = [
  {
    id: 'requisite-1',
    type: 'card',
    bank: {
      name: 'Т-Банк',
      maskedNumber: '••• 4821',
    },
    limits: {
      current: 34000,
      daily: 100000,
    },
    status: 'active',
  },
  {
    id: 'requisite-2',
    type: 'card',
    bank: {
      name: 'Т-Банк',
      maskedNumber: '••• 4821',
    },
    limits: {
      current: 34000,
      daily: 100000,
    },
    status: 'active',
  },
  {
    id: 'requisite-3',
    type: 'card',
    bank: {
      name: 'Т-Банк',
      maskedNumber: '••• 4821',
    },
    limits: {
      current: 34000,
      daily: 100000,
    },
    status: 'active',
  },
  {
    id: 'requisite-4',
    type: 'card',
    bank: {
      name: 'Т-Банк',
      maskedNumber: '••• 4821',
    },
    limits: {
      current: 34000,
      daily: 100000,
    },
    status: 'off',
  },
];