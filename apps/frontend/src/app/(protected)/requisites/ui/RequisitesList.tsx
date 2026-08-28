'use client';

import { useCallback, useEffect, useState } from 'react';
import RequisiteCard from './RequisiteCard';
import RequisiteCardSkeleton from './RequisiteCardSkeleton';
import RequisitesEmpty from './RequisitesEmpty';
import RequisitesError from './RequisitesError';
import { getRequisites } from '@/features/requisites/api/requisites.api';
import type { Requisite } from '@/features/requisites/api/requisites.api';
import { ApiError } from '@/shared/api/http';

import styles from './RequisitesList.module.css';


export default function RequisitesList() {
  const [requisites, setRequisites] = useState<Requisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequisites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRequisites(await getRequisites());
    } catch (err) {
      setError(getRequisitesErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => { void loadRequisites(); });
  }, [loadRequisites]);

  const handleStatusChange = (requisiteId: number, newStatus: boolean) => {
    setRequisites((prev) =>
      prev.map((req) =>
        req.requisiteId === requisiteId
          ? { ...req, status: newStatus ? 'on' : 'off' }
          : req
      )
    );
  };

  const handleDelete = (requisiteId: number) => {
    setRequisites((current) => current.filter((requisite) => requisite.requisiteId !== requisiteId));
  };

  if (loading) {
    return (
      <section className={styles.list}>
        <RequisiteCardSkeleton />
        <RequisiteCardSkeleton />
        <RequisiteCardSkeleton />
      </section>
    );
  }

  if (error) {
    return <RequisitesError onRetry={() => void loadRequisites()} message={error} />;
  }

  if (requisites.length === 0) {
    return <RequisitesEmpty />;
  }

  return (
    <section className={styles.list}>
      {requisites.map((requisite) => (
        <RequisiteCard
          key={requisite.requisiteId}
          requisite={requisite}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ))}
    </section>
  );
}

function getRequisitesErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Сессия истекла. Войдите в аккаунт снова.';
    }

    if (error.code === 'ONLY_P2P_INVALID_RESPONSE') {
      return 'Партнёр временно вернул неполные данные реквизита. Повторите загрузку позже.';
    }

    return error.message;
  }

  return error instanceof Error ? error.message : 'Не удалось загрузить список реквизитов';
}
