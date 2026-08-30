'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getIncomingRequests } from '@/features/requests/api/requests.api';
import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';

import styles from './RequestAlert.module.css';

export function RequestAlert() {
  const [waitingCount, setWaitingCount] = useState(0);
  const knownWaitingIds = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    if (!getAuthAccessToken()) return;

    try {
      const requests = await getIncomingRequests();
      const waiting = requests.filter((request) => request.status === 'waiting');
      const waitingIds = new Set(waiting.map((request) => request.id));
      const previousIds = knownWaitingIds.current;

      setWaitingCount(waiting.length);
      knownWaitingIds.current = waitingIds;

      if (!previousIds || waiting.length === 0 || typeof window === 'undefined') return;

      const hasNewRequest = waiting.some((request) => !previousIds.has(request.id));
      if (!hasNewRequest || document.visibilityState !== 'hidden') return;

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Новая заявка', {
          body: 'Проверьте поступление денег и выберите действие до окончания таймера.',
        });
      }
    } catch {
      // A global alert must never make a protected page unusable.
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
    const intervalId = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(intervalId);
  }, [load]);

  if (waitingCount === 0) return null;

  return (
    <aside className={styles.alert} role="alert">
      <span>Ожидают обработки: {waitingCount}</span>
      <Link href="/requests">Открыть заявки</Link>
    </aside>
  );
}
