'use client';

import Link from 'next/link';
import { useState } from 'react';

import styles from './RequisiteActions.module.css';

type RequisiteActionsProps = {
  requisiteId: string;
  isActive: boolean;
};

export default function RequisiteActions({
  requisiteId,
  isActive,
}: RequisiteActionsProps) {
  const [active, setActive] = useState(isActive);

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
        onClick={() => setActive((current) => !current)}
      >
        <span className={styles.toggleThumb} />
      </button>

      <Link
        href={`/requisites/${requisiteId}`}
        className={styles.actionButton}
        aria-label="Настройки реквизита"
      >
        <span aria-hidden="true">⚙</span>
      </Link>

      <button
        type="button"
        className={`${styles.actionButton} ${styles.deleteButton}`}
        aria-label="Удалить реквизит"
      >
        <span aria-hidden="true">♧</span>
      </button>
    </div>
  );
}