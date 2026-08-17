import type { Profile } from '../model/profile.types';

export const profileMock: Profile = {
  id: 48213,
  name: 'Артём К.',
  email: 'artem@mail.ru',
  telegram: '@artem_k',
  registeredAt: '2020',
  avatar: null,
  stats: {
    balance: 148320,
    frozen: 20000,
    totalProfit: 5400,
  },
};