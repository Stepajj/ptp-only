'use client';

import { useAuthStore } from '@/features/auth/model/auth.store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SettingsIcon from './icons/settings.svg';
import styles from './SidebarProfileCard.module.css';

function getInitials(name?: string) {
  if (!name) return '?';

  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

export function SidebarProfileCard() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const username =
    user?.displayName ?? user?.identifier ?? 'Пользователь';

  const shortId = user?.id ? user.id.slice(0, 8) : '—';

  const handleSettingsClick = () => {
    router.push('/profile');
  };

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.avatar}>
          {user?.avatarUrl || user?.telegramPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl ?? user.telegramPhotoUrl ?? ''}
              alt="Аватар пользователя"
            />
          ) : (
            getInitials(username)
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.username}>
            {username}
          </div>

          <div className={styles.id}>
            ID {shortId}
          </div>
        </div>
      </div>

      <button
        className={styles.settings}
        type="button"
        aria-label="Настройки"
        onClick={handleSettingsClick}
      >
        <Image
          src={SettingsIcon}
          alt=""
        />
      </button>
    </div>
  );
}