'use client';

import Link from 'next/link';
import { useState } from 'react';
import { editRequisite, deleteRequisite } from '@/features/requisites/api/requisites.api';

import styles from './RequisiteActions.module.css';

type RequisiteActionsProps = {
  requisiteId: string;
  isActive: boolean;
  onStatusChange?: (newStatus: boolean) => void;
};

export default function RequisiteActions({
  requisiteId,
  isActive,
  onStatusChange,
}: RequisiteActionsProps) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const newStatus = active ? 'off' : 'on';
      await editRequisite(parseInt(requisiteId, 10), { status: newStatus });
      setActive(newStatus === 'on');
      onStatusChange?.(newStatus === 'on');
    } catch (error) {
      console.error('Failed to toggle requisite:', error);
      alert('Не удалось изменить статус реквизита');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот реквизит?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteRequisite(parseInt(requisiteId, 10));
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete requisite:', error);
      alert('Не удалось удалить реквизит');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <span
        className={`${styles.status} ${
          active ? styles.statusActive : styles.statusInactive
        }`}
      >
        {active ? 'Активен' : 'Выключен'}
      </span>

      <button
        type="button"
        className={`${styles.toggle} ${
          active ? styles.toggleActive : styles.toggleInactive
        }`}
        aria-pressed={active}
        aria-label={active ? 'Выключить реквизит' : 'Включить реквизит'}
        onClick={handleToggle}
        disabled={loading}
      >
        <span className={styles.toggleThumb} />
      </button>

      <Link
        href={`/requisites/${requisiteId}`}
        className={styles.actionButton}
        aria-label="Настройки реквизита"
        onClick={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <span aria-hidden="true">⚙</span>
      </Link>

      <button
        type="button"
        className={`${styles.actionButton} ${styles.deleteButton}`}
        aria-label="Удалить реквизит"
        onClick={handleDelete}
        disabled={loading}
      >
        <span aria-hidden="true">♧</span>
      </button>
    </div>
  );
}