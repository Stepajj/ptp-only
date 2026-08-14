import type {
  DepositDetails,
  DepositMethod,
} from "../model/deposit.types";

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

export const depositDetails: Record<string, DepositDetails> = {
  "usdt-trc20": {
    methodId: "usdt-trc20",
    address: "TEaeekJj2c8gnVYIGUVTwX2rcve9abPTe",
    minimum: "≈ 500 ₽ (эквивалент)",
    crediting: "1-3 минуты • +7% к курсу",
    networkLabel: "USDT • Сеть Tron",
    badgeIcon: "₮",
  },

  bitcoin: {
    methodId: "bitcoin",
    address: "bc1qexamplemockdepositaddress",
    minimum: "≈ 500 ₽ (эквивалент)",
    crediting: "После 1 подтверждения • +7% к курсу",
    networkLabel: "Bitcoin • Сеть BTC",
    badgeIcon: "₿",
  },

  litecoin: {
    methodId: "litecoin",
    address: "ltc1examplemockdepositaddress",
    minimum: "≈ 500 ₽ (эквивалент)",
    crediting: "Быстрое зачисление • +7% к курсу",
    networkLabel: "Litecoin • Сеть LTC",
    badgeIcon: "Ł",
  },

  cryptobot: {
    methodId: "cryptobot",
    address: "https://t.me/CryptoBot?start=mock_invoice",
    minimum: "≈ 500 ₽ (эквивалент)",
    crediting: "После оплаты инвойса • +7% к курсу",
    networkLabel: "CryptoBot • Telegram",
    badgeIcon: "",
  },

  xrocket: {
    methodId: "xrocket",
    address: "https://t.me/xrocket?start=mock_invoice",
    minimum: "≈ 500 ₽ (эквивалент)",
    crediting: "После оплаты инвойса • +7% к курсу",
    networkLabel: "xRocket • Telegram Tron",
    badgeIcon: "",
  },
};