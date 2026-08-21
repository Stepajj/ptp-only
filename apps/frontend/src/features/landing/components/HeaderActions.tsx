'use client';

import Link from 'next/link';

import { MotionButton } from '@/components/motion/MotionButton';
import { useAuthStore } from '@/features/auth/model/auth.store';

import { UserAvatar } from './UserAvatar';

import styles from './Header.module.css';

export function HeaderActions() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className={styles.actions}>
        <Link href="/login" className={styles.actionLink}>
          <MotionButton
            type="button"
            className={styles.loginButton}
          >
            Войти
          </MotionButton>
        </Link>

        <Link href="/register" className={styles.actionLink}>
          <MotionButton
            type="button"
            className={styles.registerButton}
          >
            Создать аккаунт
          </MotionButton>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <Link href="/deposit" className={styles.actionLink}>
        <MotionButton type="button" className={styles.registerButton}>
          Пополнить
        </MotionButton>
      </Link>

      <UserAvatar />
    </div>
  );
}
