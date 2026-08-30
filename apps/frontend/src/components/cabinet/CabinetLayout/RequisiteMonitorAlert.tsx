'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { answerRequisiteMonitoring, getRequisiteMonitoringPrompts, type RequisiteMonitoringPrompt } from '@/features/requisites/api/requisites.api';

import styles from './RequisiteMonitorAlert.module.css';

export function RequisiteMonitorAlert() {
  const [prompts, setPrompts] = useState<RequisiteMonitoringPrompt[]>([]);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seen = useRef(new Set<number>());

  const load = useCallback(async () => {
    try {
      const next = await getRequisiteMonitoringPrompts();
      setPrompts(next);
      if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
        for (const prompt of next) {
          if (seen.current.has(prompt.requisiteId)) continue;
          seen.current.add(prompt.requisiteId);
          new Notification(prompt.state === 'auto_disabled' ? 'Реквизит отключён' : 'Реквизит давно не получает заявки', { body: prompt.state === 'auto_disabled' ? 'Он был отключён после отсутствия ответа.' : 'Оставить его включённым?' });
        }
      }
    } catch {
      // A monitoring banner must never block cabinet navigation.
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const answer = async (requisiteId: number, keepEnabled: boolean) => {
    try {
      setWorkingId(requisiteId);
      setError(null);
      await answerRequisiteMonitoring(requisiteId, keepEnabled);
      setPrompts((current) => current.filter((prompt) => prompt.requisiteId !== requisiteId));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить решение');
    } finally {
      setWorkingId(null);
    }
  };

  if (prompts.length === 0) return null;

  return (
    <aside className={styles.alert} role="status">
      {error && <div className={styles.error} role="alert">{error}</div>}
      {prompts.map((prompt) => (
        <div className={styles.item} key={prompt.requisiteId}>
          <div>
            <strong>{prompt.state === 'auto_disabled' ? 'Реквизит отключён автоматически' : 'Реквизит не получает заявки 30 минут'}</strong>
            <p>{prompt.state === 'auto_disabled' ? 'Реквизит отключён после отсутствия ответа на предупреждение.' : 'Оставить его включённым? Если не ответить в течение 10 минут, реквизит будет отключён.'}</p>
          </div>
          <div className={styles.actions}>
            {prompt.state === 'waiting_response' && <button type="button" onClick={() => void answer(prompt.requisiteId, true)} disabled={workingId === prompt.requisiteId}>Оставить включённым</button>}
            {prompt.state === 'waiting_response' && <button type="button" onClick={() => void answer(prompt.requisiteId, false)} disabled={workingId === prompt.requisiteId}>Выключить</button>}
            <Link href={`/requisites/${prompt.requisiteId}`}>Настройки</Link>
          </div>
        </div>
      ))}
    </aside>
  );
}
