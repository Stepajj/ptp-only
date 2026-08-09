import styles from './RequisiteCard.module.css';

type Requisite = {
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
  const progress =
    (requisite.limitUsed / requisite.limitTotal) * 100;

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

        <div className={styles.actionsPlaceholder} aria-hidden="true">
          <span className={styles.statusPlaceholder}>
            {requisite.isActive ? 'Активен' : 'Выключен'}
          </span>

          <span className={styles.controlPlaceholder} />
          <span className={styles.controlPlaceholder} />
          <span className={styles.controlPlaceholder} />
        </div>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progress}
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  );
}