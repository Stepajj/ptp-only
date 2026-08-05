import styles from './BalanceCard.module.css';

export default function BalanceCard() {
  return (
    <article className={styles.card}>
      <h1 className={styles.header}>
        <h2 className={styles.title}>ДОСТУПНЫЙ БАЛАНС</h2>   
      </h1>

      <p className={styles.balance}>
        148&nbsp;320₽
      </p>

      <div className={styles.bonus}>
        <span className={styles.bonusIcon}>▲</span>

        <span className={styles.bonusText}>
          7% к курсу при пополнении
        </span>
      </div>

      <button
        type="button"
        className={styles.button}
      >
        Пополнить криптой
      </button>
    </article>
  );
}