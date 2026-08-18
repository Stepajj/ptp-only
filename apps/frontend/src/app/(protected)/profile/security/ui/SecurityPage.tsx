'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { changePassword, getSessions, revokeSession, setCredentials, type AuthSession } from '@/features/auth/api/auth.api';
import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';
import { useAuthStore } from '@/features/auth/model/auth.store';

import styles from './SecurityPage.module.css';

export default function SecurityPage() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    const accessToken = getAuthAccessToken();
    if (!accessToken) return;
    queueMicrotask(() => void getSessions(accessToken).then((response) => {
      setSessions(response.data);
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Не удалось загрузить сессии');
    }).finally(() => setLoading(false)));
  }, []);

  const handleRevoke = async (session: AuthSession) => {
    const accessToken = getAuthAccessToken();
    if (!accessToken) return;
    try {
      await revokeSession(session.id, accessToken);
      if (session.current) {
        clearSession();
        router.replace('/login');
        return;
      }
      setSessions((current) => current.filter((item) => item.id !== session.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось завершить сессию');
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const accessToken = getAuthAccessToken();
    if (!accessToken) return;
    if (newPassword.length < 12) {
      setError('Новый пароль должен содержать минимум 12 символов');
      return;
    }
    try {
      setChanging(true);
      setError(null);
      if (user?.identifier) {
        await changePassword({ currentPassword, newPassword }, accessToken);
        clearSession();
        router.replace('/login');
      } else {
        if (!identifier.trim()) {
          setError('Укажите email или логин');
          return;
        }
        const response = await setCredentials({ identifier, password: newPassword }, accessToken);
        useAuthStore.getState().setUser(response.data.user);
        setIdentifier('');
        setNewPassword('');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось изменить пароль');
    } finally {
      setChanging(false);
    }
  };

  return (
    <main className={styles.page}>
      <Link href="/profile" className={styles.back}>← Настройки профиля</Link>
      <section className={styles.card}>
        <div className={styles.row}><div><strong>Приём заявок</strong><span>Включается через настройки реквизита</span></div><span className={styles.external}>Реквизиты</span></div>
        <div className={styles.row}><div><strong>PIN для подтверждения заявок</strong><span>В текущем backend-контракте PIN не реализован</span></div><span className={styles.unavailable}>Недоступно</span></div>
        <form className={styles.password} onSubmit={(event) => void handlePasswordChange(event)}>
          <strong>{user?.identifier ? 'Пароль' : 'Добавить вход по email и паролю'}</strong>
          <span>{user?.identifier ? 'Изменение пароля завершает все активные сессии' : 'После сохранения можно будет входить через email и пароль'}</span>
          {!user?.identifier && <input type="email" autoComplete="username" placeholder="Email" value={identifier} onChange={(event) => setIdentifier(event.target.value)} disabled={changing} required />}
          {user?.identifier && <input type="password" autoComplete="current-password" placeholder="Текущий пароль" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={changing} required />}
          <input type="password" autoComplete="new-password" placeholder="Новый пароль" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={changing} required />
          <button type="submit" disabled={changing}>{changing ? 'Сохранение...' : user?.identifier ? 'Сменить пароль' : 'Добавить пароль'}</button>
        </form>
        <div className={styles.sessions}>
          <strong>Активные сессии</strong>
          {loading && <span>Загрузка...</span>}
          {!loading && sessions.length === 0 && <span>Активных сессий нет</span>}
          {sessions.map((session) => (
            <div className={styles.session} key={session.id}>
              <div><b>{session.device}</b><span>{session.ipAddress ?? 'IP не определён'} · {formatDate(session.lastUsedAt)}</span></div>
              <button type="button" onClick={() => void handleRevoke(session)}>{session.current ? 'Выйти' : 'Завершить'}</button>
            </div>
          ))}
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
