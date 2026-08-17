'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

import {
  getProfile,
  updateProfile,
} from '@/features/profile/api/profile.api';
import type { Profile } from '@/features/profile/model/profile.types';

import styles from './ProfilePage.module.css';

function formatRubles(value: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setProfile(data);
        setName(data.name);
        setEmail(data.email);
        setTelegram(data.telegram);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateProfile({
        name,
        email,
        telegram,
      });

      if (!response.success || !response.data) {
        return;
      }

      setProfile(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
      setTelegram(response.data.telegram);
    } finally {
      setIsSaving(false);
    }
  };

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
                <img
                  src={profile.avatar}
                  alt=""
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
              +{formatRubles(profile.stats.totalProfit)}
            </strong>
          </div>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label className={styles.field}>
            <span className={styles.label}>Отображаемое имя</span>

            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <div className={styles.fieldsRow}>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>

              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Telegram</span>

              <input
                className={styles.input}
                type="text"
                value={telegram}
                onChange={(event) => setTelegram(event.target.value)}
              />
            </label>
          </div>

          <button
            className={styles.saveButton}
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
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