
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
    href: '/z22xc',
    icon: 'history', // icon is a serializable key resolved by the client
  },
   {
    title: 'Партнёрство',
    href: '/z222xc',
    icon: 'deals', // icon is a serializable key resolved by the client
  },
   {
    title: 'Поддержка',
    href: '/z44452xc',
    icon: 'support', // icon is a serializable key resolved by the client
  },
   {
    title: 'Профиль',
    href: '/z226565xc',
    icon: 'profile', // icon is a serializable key resolved by the client
  },
  
];
