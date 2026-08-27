'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

import styles from './SidebarItem.module.css';
import { ICONS, IconName } from './icons';
import { getIncomingRequests } from '@/features/requests/api/requests.api';
import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';

type Props = {
  href: string;
  title: string;
  icon: IconName;
};

export function SidebarItem({ href, title, icon }: Props) {
  const pathname = usePathname();

  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const Icon = ICONS[icon] ?? null;
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    if (href !== '/requests') return;
    const load = async () => {
      if (!getAuthAccessToken()) return;
      try {
        const data = await getIncomingRequests('waiting');
        setWaitingCount(data.length);
      } catch {
        // Sidebar badge must not make navigation fail.
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, [href]);

  return (
    <Link href={href} className={clsx(styles.item, isActive && styles.active)}>
      {Icon ? <Icon className={styles.icon} /> : null}

      <span className={styles.label}>{title}</span>
      {href === '/requests' && waitingCount > 0 ? <span className={styles.badge}>{waitingCount}</span> : null}
    </Link>
  );
}
