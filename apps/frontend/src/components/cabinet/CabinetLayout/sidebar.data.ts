
import { IconName } from './icons';

export const sidebarItems: Array<{ href: string; title: string; icon: IconName }> = [
  {
    title: 'Кабинет',
    href: '/dashboard',
    icon: 'dashboard', // icon is a serializable key resolved by the client
  },
  {
    title: 'Приём заявок',
    href: '/requests',
    icon: 'test', // icon is a serializable key resolved by the client
  },
  {
    title: 'Реквизиты',
    href: '/requisites',
    icon: 'cards', // icon is a serializable key resolved by the client
  },
  {
    title: 'Пополнение',
    href: '/deposit',
    icon: 'plus', // icon is a serializable key resolved by the client
  },
  {
    title: 'История',
    href: '/history',
    icon: 'history', // icon is a serializable key resolved by the client
  },
   {
    title: 'Партнёрство',
    href: '/partnership',
    icon: 'deals', // icon is a serializable key resolved by the client
  },
   {
    title: 'Поддержка',
    href: '/support',
    icon: 'support', // icon is a serializable key resolved by the client
  },
   {
    title: 'Профиль',
    href: '/profile',
    icon: 'profile', // icon is a serializable key resolved by the client
  },
  
];
