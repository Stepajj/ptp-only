'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import {
  getProfile,
} from '@/features/profile/api/profile.api';
import type { Profile } from '@/features/profile/model/profile.types';

import styles from './ProfilePage.module.css';

function formatRubles(value: number | null): string {
  return value === null ? '—' : `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setProfile(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (isLoading || !profile) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.profileCard}>
        <div className={styles.profileTop}>
          <div className={styles.identity}>
            <div className={styles.avatar}>
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt=""
                  width={56}
                  height={56}
                />
              ) : (
                'AK'
              )}
            </div>

            <div className={styles.identityInfo}>
              <h1 className={styles.name}>{profile.name}</h1>

              <p className={styles.meta}>
                user_id: {profile.id} · на сервисе с {profile.registeredAt} года
              </p>
            </div>
          </div>

          <button
            className={styles.changePhotoButton}
            type="button"
          >
            Сменить фото
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Баланс</span>
            <strong className={styles.statValue}>
              {formatRubles(profile.stats.balance)}
            </strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Заморожено</span>
            <strong className={`${styles.statValue} ${styles.statValueWarning}`}>
              {formatRubles(profile.stats.frozen)}
            </strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Профит с пополнений</span>
            <strong className={`${styles.statValue} ${styles.statValueSuccess}`}>
              {profile.stats.totalProfit === null ? '—' : `+${formatRubles(profile.stats.totalProfit)}`}
            </strong>
          </div>
        </div>

        <div
          className={styles.form}
        >
          <label className={styles.field}>
            <span className={styles.label}>Отображаемое имя</span>

            <input
              className={styles.input}
              type="text"
              value={profile.name}
              readOnly
            />
          </label>

          <div className={styles.fieldsRow}>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>

              <input
                className={styles.input}
                type="email"
              value={profile.email}
              readOnly
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Telegram</span>

              <input
                className={styles.input}
                type="text"
              value={profile.telegram ?? 'Не привязан'}
              readOnly
              />
            </label>
          </div>

        </div>
      </section>

      <Link
        href="/profile/security"
        className={styles.securityCard}
      >
        <div className={styles.securityIcon}>
          ♢
        </div>

        <div className={styles.securityContent}>
          <span className={styles.securityTitle}>
            Безопасность
          </span>

          <span className={styles.securityDescription}>
            2FA, пароль, PIN для подтверждения, сессии
          </span>
        </div>

        <span className={styles.securityArrow}>
          ›
        </span>
      </Link>
    </main>
  );
}
