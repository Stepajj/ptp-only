export type DepositMethodVariant =
  | "usdt"
  | "bitcoin"
  | "litecoin"
  | "cryptobot"
  | "xrocket";

export type DepositApiMethod = "btc" | "ltc" | "usdt" | "cb" | "xr";

export interface DepositMethod {
  id: string;
  apiMethod: DepositApiMethod;
  title: string;
  details: string[];
  icon: string;
  variant: DepositMethodVariant;
  href: string;
}

export interface DepositDetails {
  methodId: string;
  address: string;
  addressLabel: string;
  minimum: string;
  crediting: string;
  networkLabel: string;
  badgeIcon: string;
  waitingText: string;
}
