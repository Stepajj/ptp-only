export type RequisiteStatus = 'active' | 'off';

export type RequisiteType = 'card' | 'sbp';

export interface Requisite {
  id: string;

  type: RequisiteType;

  bank: {
    name: string;
    maskedNumber: string;
  };

  limits: {
    current: number;
    daily: number;
  };

  status: RequisiteStatus;
}