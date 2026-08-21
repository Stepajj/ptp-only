'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ICONS } from './icons';
import { sidebarItems } from './sidebar.data';
import styles from './MobileBottomNav.module.css';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
  {menuOpen && <button className={styles.backdrop} aria-label="Закрыть меню" onClick={() => setMenuOpen(false)} />}
  <nav className={styles.nav} aria-label="Основная навигация"><div className={styles.items}>
    {sidebarItems.slice(0, 3).map((item) => {
      const Icon = ICONS[item.icon];
      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
      return <Link key={item.href} href={item.href} className={clsx(styles.item, active && styles.active)}><Icon className={styles.icon} /><span>{item.title === 'Приём заявок' ? 'Заявки' : item.title}</span></Link>;
    })}
    <button type="button" className={clsx(styles.item, menuOpen && styles.active)} onClick={() => setMenuOpen((open) => !open)}><span className={styles.menuGlyph} aria-hidden="true"><i /><i /><i /></span><span>Меню</span></button>
  </div></nav>
  {menuOpen && <div className={styles.menuPanel} role="menu">{sidebarItems.slice(3).map((item) => { const Icon = ICONS[item.icon]; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={clsx(styles.menuLink, active && styles.menuLinkActive)} onClick={() => setMenuOpen(false)}><Icon className={styles.menuIcon} /><span>{item.title}</span></Link>; })}</div>}
  </>;
}
