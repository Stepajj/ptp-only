import styles from './RequisiteCardSkeleton.module.css';

export default function RequisiteCardSkeleton() {
  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <div className={styles.bankIcon} />
        <div className={styles.content}>
          <div className={styles.title} />
          <div className={styles.description} />
          <div className={styles.limits} />
        </div>
        <div className={styles.actions} />
      </div>
    </article>
  );
}
