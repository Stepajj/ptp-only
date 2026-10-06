'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { bootstrapAuth } from '@/features/auth/lib/bootstrapAuth';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { UserAvatar } from './UserAvatar';
import styles from './Header.module.css';

let publicAuthBootstrap: Promise<void> | null = null;

function ensurePublicAuthBootstrap() {
  if (!publicAuthBootstrap) publicAuthBootstrap = bootstrapAuth();
  return publicAuthBootstrap;
}

export function HeaderActions({ compact = false }: { compact?: boolean }) {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!useAuthStore.getState().user) void ensurePublicAuthBootstrap().catch(() => undefined);
  }, []);

  if (compact) {
    return user ? <><Link href="/deposit">Пополнить</Link><Link href="/profile">Профиль</Link></> : <><Link href="/login">Войти</Link><Link href="/register" data-cta-destination="web" data-cta-placement="header">Создать аккаунт</Link></>;
  }

  return user ? (
    <div className={styles.actions}>
      <Link href="/deposit" className={`${styles.actionLink} ${styles.registerButton}`}>Пополнить</Link>
      <UserAvatar />
    </div>
  ) : (
    <div className={styles.actions}>
      <Link href="/login" className={`${styles.actionLink} ${styles.loginButton}`}>Войти</Link>
      <Link href="/register" data-cta-destination="web" data-cta-placement="header" className={`${styles.actionLink} ${styles.registerButton}`}>Создать аккаунт</Link>
    </div>
  );
}
