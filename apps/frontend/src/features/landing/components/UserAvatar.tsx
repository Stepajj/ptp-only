'use client';

import Image from 'next/image';

import { useAuthStore } from '@/features/auth/model/auth.store';

import styles from './Header.module.css';

export function UserAvatar() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  /**
   * Пока backend не умеет отдавать аватар.
   * Позже просто заменим null на user.avatarUrl.
   */
  const avatarUrl: string | null = null;

  /**
   * Берём первую букву.
   * Позже backend сможет отдавать firstName/lastName,
   * тогда логика останется прежней.
   */
  const initials =
    user.id.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      className={styles.avatarButton}
      aria-label="Профиль пользователя"
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Аватар пользователя"
          fill
          className={styles.avatarImage}
        />
      ) : (
        <span className={styles.avatarInitials}>
          {initials}
        </span>
      )}
    </button>
  );
}