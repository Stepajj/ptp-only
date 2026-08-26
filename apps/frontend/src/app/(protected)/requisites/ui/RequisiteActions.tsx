'use client';

import Link from 'next/link';
import Image from 'next/image';
import SettingsIcon from '../assets/icons/settings.svg';
import DeletesIcon from '../assets/icons/trash.svg';
import { useState } from 'react';
import { editRequisite, deleteRequisite } from '@/features/requisites/api/requisites.api';

import styles from './RequisiteActions.module.css';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

type RequisiteActionsProps = {
  requisiteId: string;
  isActive: boolean;
  onStatusChange?: (newStatus: boolean) => void;
  disabled?: boolean;
};

export default function RequisiteActions({
  requisiteId,
  isActive,
  onStatusChange,
  disabled = false,
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
      alert(getErrorMessage(error, 'Не удалось изменить статус реквизита'));
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
      alert(getErrorMessage(error, 'Не удалось удалить реквизит'));
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
        disabled={loading || disabled}
      >
        <span className={styles.toggleThumb} />
      </button>

      <Link
        href={`/requisites/${requisiteId}`}
        className={styles.actionButton}
        aria-label="Настройки реквизита"
        onClick={(e) => {
          if (loading || disabled) {
            e.preventDefault();
          }
        }}
      >
        <span aria-hidden="true">
          <Image src={SettingsIcon} alt="" />
        </span>
      </Link>

      <button
        type="button"
        className={`${styles.actionButton} ${styles.deleteButton}`}
        aria-label="Удалить реквизит"
        onClick={handleDelete}
        disabled={loading || disabled}
      >
        <span aria-hidden="true">
          <Image src={DeletesIcon} alt="" />
        </span>
      </button>
    </div>
  );
}
