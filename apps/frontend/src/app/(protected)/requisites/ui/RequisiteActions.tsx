'use client';

import Link from 'next/link';
import Image from 'next/image';
import SettingsIcon from '../assets/icons/settings.svg';
import DeletesIcon from '../assets/icons/trash.svg';
import { useState } from 'react';
import { editRequisite, deleteRequisite } from '@/features/requisites/api/requisites.api';

import styles from './RequisiteActions.module.css';

const ACTIVATION_NOTICE_KEY = 'only-p2p-requisite-activation-notice-accepted';
const ONLY_P2P_RULES_URL = process.env.NEXT_PUBLIC_ONLY_P2P_RULES_URL;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

type RequisiteActionsProps = {
  requisiteId: string;
  isActive: boolean;
  onStatusChange?: (newStatus: boolean) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export default function RequisiteActions({
  requisiteId,
  isActive,
  onStatusChange,
  onDelete,
  disabled = false,
}: RequisiteActionsProps) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);
  const [activationNoticeOpen, setActivationNoticeOpen] = useState(false);

  const changeStatus = async (rememberActivationNotice = false) => {
    if (rememberActivationNotice) {
      window.localStorage.setItem(ACTIVATION_NOTICE_KEY, '1');
    }

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

  const handleToggle = () => {
    if (active) {
      void changeStatus();
      return;
    }

    if (window.localStorage.getItem(ACTIVATION_NOTICE_KEY) === '1') {
      void changeStatus();
      return;
    }

    setActivationNoticeOpen(true);
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот реквизит?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteRequisite(parseInt(requisiteId, 10));
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete requisite:', error);
      alert(getErrorMessage(error, 'Не удалось удалить реквизит'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
      onClick={() => void handleDelete()}
        disabled={loading || disabled}
      >
        <span aria-hidden="true">
          <Image src={DeletesIcon} alt="" />
        </span>
      </button>
    </div>
    {activationNoticeOpen && (
      <div className={styles.modalBackdrop} role="presentation">
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="activation-notice-title">
          <h2 id="activation-notice-title">Перед включением реквизита</h2>
          <p>Вы должны быть на связи и иметь доступ к карте. Заранее выключайте реквизит, если не сможете проверить поступление.</p>
          {ONLY_P2P_RULES_URL ? (
            <a href={ONLY_P2P_RULES_URL} className={styles.rulesLink} target="_blank" rel="noreferrer">
              Правила использования OnlyP2P
            </a>
          ) : (
            <span className={styles.rulesUnavailable}>Правила использования OnlyP2P</span>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalCancel} onClick={() => setActivationNoticeOpen(false)} disabled={loading}>Отмена</button>
            <button type="button" className={styles.modalAgree} onClick={() => { setActivationNoticeOpen(false); void changeStatus(); }} disabled={loading}>Согласен</button>
            <button type="button" className={styles.modalAgree} onClick={() => { setActivationNoticeOpen(false); void changeStatus(true); }} disabled={loading}>Согласен и больше не показывать</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
