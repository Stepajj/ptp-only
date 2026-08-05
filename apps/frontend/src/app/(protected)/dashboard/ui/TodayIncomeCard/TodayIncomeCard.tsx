import styles from './TodayIncomeCard.module.css';

export default function TodayIncomeCard() {
  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        →
      </div>

      <p className={styles.count}>39 500₽</p>

      <p className={styles.label}>
        Принято сегодня
      </p>

      <span className={styles.profitGreen}>+3 заявки <span className={styles.dot}></span> +2 480₽ выгода</span>
    </article>
  );
}