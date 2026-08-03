import { CardsIcon } from './cardsIcon';
import { DashboardIcon } from './dashBoardIcon';
import { PlusIcon } from './plusIcon';
import { TestIcon } from './testIcon';
import { HistoryIcon } from './historyIcon';
import { DealsIcon } from './dealsIcon';
import { SupportIcon } from './supportIcon';
import { ProfileIcon } from './profileIcon';

export const ICONS = {
  test: TestIcon,
  dashboard: DashboardIcon,
  cards: CardsIcon,
  plus: PlusIcon,
  history: HistoryIcon,
  deals: DealsIcon,
  support: SupportIcon,
  profile: ProfileIcon,
} as const;

export type IconName = keyof typeof ICONS;

export default ICONS;
