'use client';

import Link from 'next/link';

import { useAuthStore } from '@/features/auth/model/auth.store';

import styles from './Header.module.css';

export function UserAvatar() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const avatarUrl = user.avatarUrl ?? user.telegramPhotoUrl;
  const initials = (user.displayName || user.identifier || user.id)
    .trim()
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href="/profile"
      className={styles.avatarButton}
      aria-label="Профиль пользователя"
    >
      {avatarUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt="Аватар пользователя"
            className={styles.avatarImage}
          />
        </>
      ) : (
        <span className={styles.avatarInitials}>
          {initials}
        </span>
      )}
    </Link>
  );
}
