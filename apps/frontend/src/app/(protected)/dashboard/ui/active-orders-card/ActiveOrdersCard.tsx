import styles from './ActiveOrdersCard.module.css';

export default function ActiveOrdersCard() {
  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        →
      </div>

      <p className={styles.count}>0</p>

      <p className={styles.label}>
        Активные заявки
      </p>

      <button
        type="button"
        className={styles.button}
      >
        Прием заявок
      </button>
    </article>
  );
}