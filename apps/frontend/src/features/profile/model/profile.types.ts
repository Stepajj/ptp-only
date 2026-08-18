export interface ProfileStats {
  balance: number | null;
  frozen: number | null;
  totalProfit: number | null;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  telegram: string | null;
  registeredAt: string;
  avatar: string | null;
  stats: ProfileStats;
}
