import { Container } from "@/components/Container/Container";

import styles from "./Stats.module.css";

export function Stats() {
  return (
    <section>
    <Container>
    <div className={styles.stats}>
  <div className={styles.stat}>
    <h3 className={styles.value}>6 лет</h3>
    <p className={styles.description}>
      стабильно работы на рынке
    </p>
  </div>

  <div className={styles.stat}>
    <h3 className={styles.value}>73 000</h3>
    <p className={styles.description}>
      активных пользователей
    </p>
  </div>

  <div className={styles.stat}>
    <h3 className={styles.value}>+7%</h3>
    <p className={styles.description}>
      к биржевому курсу при пополнении
    </p>
  </div>
</div>
</Container>
</section>
  );
}
