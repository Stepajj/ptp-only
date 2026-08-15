import type { DepositMethod } from "./deposit.types";

export const depositMethods: DepositMethod[] = [
  {
    id: "usdt-trc20",
    apiMethod: "usdt",
    title: "USDT • TRC-20",
    details: ["Сеть Tron", "зачисление 1-3 мин"],
    icon: "₮",
    variant: "usdt",
    href: "/deposit/usdt-trc20",
  },
  {
    id: "bitcoin",
    apiMethod: "btc",
    title: "Bitcoin",
    details: ["Сеть BTC", "1 подтверждение"],
    icon: "₿",
    variant: "bitcoin",
    href: "/deposit/bitcoin",
  },
  {
    id: "litecoin",
    apiMethod: "ltc",
    title: "Litecoin",
    details: ["Сеть LTC", "быстрое зачисление"],
    icon: "Ł",
    variant: "litecoin",
    href: "/deposit/litecoin",
  },
  {
    id: "cryptobot",
    apiMethod: "cb",
    title: "CryptoBot",
    details: ["Инвойс-ссылка в Telegram"],
    icon: "",
    variant: "cryptobot",
    href: "/deposit/cryptobot",
  },
  {
    id: "xrocket",
    apiMethod: "xr",
    title: "xRocket",
    details: ["Инвойс-ссылка в Telegram"],
    icon: "",
    variant: "xrocket",
    href: "/deposit/xrocket",
  },
];

export function getDepositMethod(methodId: string): DepositMethod | undefined {
  return depositMethods.find((method) => method.id === methodId);
}
