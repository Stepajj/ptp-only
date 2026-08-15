interface HistorySummaryCardProps {
  title: string;
  value: string;
  variant?: "dark" | "light";
}

import styles from "./HistorySummaryCard.module.css";

export function HistorySummaryCard({
  title,
  value,
  variant = "light",
}: HistorySummaryCardProps) {
  return (
    <article
      className={`${styles.card} ${styles[variant]}`}
    >
      <div className={styles.title}>
        {title}
      </div>

      <div className={styles.value}>
        {value}
      </div>
    </article>
  );
}