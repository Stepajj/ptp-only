'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  getProfile,
  updateProfile,
} from '@/features/profile/api/profile.api';
import { TelegramLoginButton } from '@/components/auth/TelegramLoginButton/TelegramLoginButton';
import type { Profile } from '@/features/profile/model/profile.types';

import styles from './ProfilePage.module.css';

function formatRubles(value: number | null): string {
  return value === null ? '—' : `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setProfile(data);
        setDisplayName(data.name);
        setAvatarUrl(data.avatar ?? '');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (isLoading || !profile) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const initials = profile.name.trim().slice(0, 2).toUpperCase() || 'П';

  const saveProfile = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });
      setProfile(await getProfile());
      setIsEditingPhoto(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить профиль');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.profileCard}>
        <div className={styles.profileTop}>
          <div className={styles.identity}>
            <div className={styles.avatar}>
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt=""
                />
              ) : (
                initials
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
            onClick={() => setIsEditingPhoto((value) => !value)}
          >
            {isEditingPhoto ? 'Отмена' : 'Сменить фото'}
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
              onChange={(event) => setDisplayName(event.target.value)}
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

            {!profile.telegram && (
              <TelegramLoginButton mode="link" />
            )}
          </div>

          {isEditingPhoto && (
            <label className={styles.field}>
              <span className={styles.label}>Ссылка на фото (HTTPS)</span>
              <input
                className={styles.input}
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
              />
            </label>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.saveButton} type="button" onClick={saveProfile} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>

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
            Пароль и активные сессии
          </span>
        </div>

        <span className={styles.securityArrow}>
          ›
        </span>
      </Link>
    </main>
  );
}
