'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AuthTabs.module.css';


const tabs = [
  {
    href: '/register',
    label: 'Регистрация',
  },
  {
    href: '/login',
    label: 'Вход',
  },
];

export function AuthTabs() {

  
  const pathname = usePathname();

  const activeIndex = tabs.findIndex(tab => pathname.startsWith(tab.href));

  return (
    <div className={styles.tabs}>
      <div
        className={styles.slider}
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {tabs.map((tab, index) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`${styles.tab} ${
            activeIndex === index ? styles.active : ''
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}