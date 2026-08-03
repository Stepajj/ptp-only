'use client';

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
  /**
   * Позже заменишь на реальные данные из authStore.
   */

  const user = {
    username: 'Артём К.',
    id: 48213,
    avatar: null,
  };

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.avatar}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            getInitials(user.username)
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.username}>
            {user.username}
          </div>

          <div className={styles.id}>
            ID {user.id}
          </div>
        </div>
      </div>

      <button
        className={styles.settings}
        type="button"
        aria-label="Настройки"
      >
        ⚙️
      </button>
    </div>
  );
}