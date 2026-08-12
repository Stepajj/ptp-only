'use client';

import { useEffect, useState } from 'react';
import RequisiteCard from './RequisiteCard';
import RequisiteCardSkeleton from './RequisiteCardSkeleton';
import RequisitesEmpty from './RequisitesEmpty';
import RequisitesError from './RequisitesError';
import { getRequisites } from '@/features/requisites/api/requisites.api';
import type { Requisite } from '@/features/requisites/api/requisites.api';

import styles from './RequisitesList.module.css';

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
        setRequisites(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load requisites');
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
    return <RequisitesError onRetry={() => window.location.reload()} />;
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