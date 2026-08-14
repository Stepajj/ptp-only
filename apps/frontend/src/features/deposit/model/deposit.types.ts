export type DepositMethodVariant =
  | "usdt"
  | "bitcoin"
  | "litecoin"
  | "cryptobot"
  | "xrocket";

export interface DepositMethod {
  id: string;
  title: string;
  details: string[];
  icon: string;
  variant: DepositMethodVariant;
  href: string;
}

export interface DepositDetails {
  methodId: string;
  address: string;
  minimum: string;
  crediting: string;
  networkLabel: string;
  badgeIcon: string;
}