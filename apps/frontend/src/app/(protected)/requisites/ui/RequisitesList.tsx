'use client';

import { useEffect, useState } from 'react';
import RequisiteCard from './RequisiteCard';
import RequisiteCardSkeleton from './RequisiteCardSkeleton';
import RequisitesEmpty from './RequisitesEmpty';
import RequisitesError from './RequisitesError';
import { getRequisites } from '@/features/requisites/api/requisites.api';
import type { Requisite } from '@/features/requisites/api/requisites.api';
import { ApiError } from '@/shared/api/http';

import styles from './RequisitesList.module.css';


const demoRequisite: Requisite = {
  requisiteId: -900001,
  card: '0000000000000000',
  phone: '-',
  fio: 'Демо реквизит',
  bank: 'Визуальный пример',
  bankId: 1,
  tier1: false,
  status: 'off',
  method: 'card',
  minAmount: null,
  maxAmount: null,
  limitAmount: null,
  limitAmountMinutes: null,
  exactAmountOnly: false,
  uiMock: true,
};

export default function RequisitesList() {
  const [requisites, setRequisites] = useState<Requisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequisites() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRequisites();
       setRequisites([...data, demoRequisite]);
      } catch (err) {
        setError(getRequisitesErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadRequisites();
  }, []);

  const handleStatusChange = (requisiteId: number, newStatus: boolean) => {
    setRequisites((prev) =>
      prev.map((req) =>
        req.requisiteId === requisiteId
          ? { ...req, status: newStatus ? 'on' : 'off' }
          : req
      )
    );
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
    return <RequisitesError onRetry={() => window.location.reload()} message={error} />;
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
