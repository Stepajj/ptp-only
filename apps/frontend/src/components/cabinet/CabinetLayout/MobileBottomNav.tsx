'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ICONS } from './icons';
import { sidebarItems } from './sidebar.data';
import styles from './MobileBottomNav.module.css';

export function MobileBottomNav() {
  const pathname = usePathname();
  return <nav className={styles.nav} aria-label="Основная навигация"><div className={styles.items}>
    {sidebarItems.slice(0, 5).map((item) => {
      const Icon = ICONS[item.icon];
      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
      return <Link key={item.href} href={item.href} className={clsx(styles.item, active && styles.active)}><Icon className={styles.icon} /><span>{item.title}</span></Link>;
    })}
  </div></nav>;
}
