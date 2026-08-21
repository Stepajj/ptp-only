import type { DepositMethod } from "./deposit.types";

import Tether from '../../../app/(protected)/deposit/assets/icons/Tether.svg';
import Bitcoin from '../../../app/(protected)/deposit/assets/icons/Bitcoin.svg';
import Litecoin from '../../../app/(protected)/deposit/assets/icons/Litecoin.svg';
import BotLogo from '../../../app/(protected)/deposit/assets/icons/BotLogo.svg';

export const depositMethods: DepositMethod[] = [
  {
    id: "usdt-trc20",
    apiMethod: "usdt",
    title: "USDT • TRC-20",
    details: ["Сеть Tron", "адрес OnlyP2P"],
    icon: Tether,
    variant: "usdt",
    href: "/deposit/usdt-trc20",
  },
  {
    id: "bitcoin",
    apiMethod: "btc",
    title: "Bitcoin",
    details: ["Сеть BTC", "адрес OnlyP2P"],
    icon: Bitcoin,
    variant: "bitcoin",
    href: "/deposit/bitcoin",
  },
  {
    id: "litecoin",
    apiMethod: "ltc",
    title: "Litecoin",
    details: ["Сеть LTC", "адрес OnlyP2P"],
    icon: Litecoin,
    variant: "litecoin",
    href: "/deposit/litecoin",
  },
  {
    id: "cryptobot",
    apiMethod: "cb",
    title: "CryptoBot",
    details: ["Инвойс-ссылка в Telegram"],
    icon: BotLogo,
    variant: "cryptobot",
    href: "/deposit/cryptobot",
  },
  {
    id: "xrocket",
    apiMethod: "xr",
    title: "xRocket",
    details: ["Инвойс OnlyP2P"],
    icon: BotLogo,
    variant: "xrocket",
    href: "/deposit/xrocket",
  },
];

export function getDepositMethod(methodId: string): DepositMethod | undefined {
  return depositMethods.find((method) => method.id === methodId);
}
