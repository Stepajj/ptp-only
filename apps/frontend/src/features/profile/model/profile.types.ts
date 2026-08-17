export interface ProfileStats {
  balance: number;
  frozen: number;
  totalProfit: number;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  telegram: string;
  registeredAt: string;
  avatar: string | null;
  stats: ProfileStats;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
  telegram: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data?: Profile;
  error?: string;
}