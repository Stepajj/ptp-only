import type { DepositMethod } from "../model/deposit.types";

export const depositMethods: DepositMethod[] = [
  {
    id: "usdt-trc20",
    title: "USDT • TRC-20",
    details: ["Сеть Tron", "зачисление 1-3 мин"],
    icon: "₮",
    variant: "usdt",
    href: "/deposit/usdt-trc20",
  },
  {
    id: "bitcoin",
    title: "Bitcoin",
    details: ["Сеть BTC", "1 подтверждение"],
    icon: "₿",
    variant: "bitcoin",
    href: "/deposit/bitcoin",
  },
  {
    id: "litecoin",
    title: "Litecoin",
    details: ["Сеть LTC", "быстрое зачисление"],
    icon: "Ł",
    variant: "litecoin",
    href: "/deposit/litecoin",
  },
  {
    id: "cryptobot",
    title: "CryptoBot",
    details: ["Инвойс-ссылка в Telegram"],
    icon: "",
    variant: "cryptobot",
    href: "/deposit/cryptobot",
  },
  {
    id: "xrocket",
    title: "xRocket",
    details: ["Инвойс-ссылка в Telegram Tron"],
    icon: "",
    variant: "xrocket",
    href: "/deposit/xrocket",
  },
];