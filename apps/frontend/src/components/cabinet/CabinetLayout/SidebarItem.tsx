'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import styles from './SidebarItem.module.css';
import { ICONS, IconName } from './icons';

type Props = {
  href: string;
  title: string;
  icon: IconName;
};

export function SidebarItem({ href, title, icon }: Props) {
  const pathname = usePathname();

  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const Icon = ICONS[icon] ?? null;

  return (
    <Link href={href} className={clsx(styles.item, isActive && styles.active)}>
      {Icon ? <Icon className={styles.icon} /> : null}

      <span className={styles.label}>{title}</span>
    </Link>
  );
}