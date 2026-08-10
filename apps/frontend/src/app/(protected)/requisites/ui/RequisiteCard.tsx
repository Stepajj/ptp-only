import RequisiteActions from './RequisiteActions';

import styles from './RequisiteCard.module.css';

export type Requisite = {
  id: string;
  bankName: string;
  lastDigits: string;
  limitUsed: number;
  limitTotal: number;
  isActive: boolean;
};

type RequisiteCardProps = {
  requisite: Requisite;
};

export default function RequisiteCard({
  requisite,
}: RequisiteCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <div className={styles.bankIcon} aria-hidden="true">
          T
        </div>

        <div className={styles.content}>
          <p className={styles.title}>
            {requisite.bankName} · ••• {requisite.lastDigits}
          </p>

          <p className={styles.description}>
            Лимит сегодня: {requisite.limitUsed.toLocaleString('ru-RU')} /{' '}
            {requisite.limitTotal.toLocaleString('ru-RU')} ₽
          </p>
        </div>

        <RequisiteActions
          requisiteId={requisite.id}
          isActive={requisite.isActive}
        />
      </div>

      <progress
        className={styles.progress}
        value={requisite.limitUsed}
        max={requisite.limitTotal}
        aria-label={`Использовано ${requisite.limitUsed} из ${requisite.limitTotal}`}
      />
    </article>
  );
}