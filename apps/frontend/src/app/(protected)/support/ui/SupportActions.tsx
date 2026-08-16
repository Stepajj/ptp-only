import Link from "next/link";

import styles from "./SupportActions.module.css";

export function SupportActions() {
  return (
    <div className={styles.actions}>
      <Link
        href="/support/chat"
        className={`${styles.button} ${styles.primary}`}
      >
        Написать в поддержку
      </Link>

      <Link
        href="/support/history"
        className={`${styles.button} ${styles.secondary}`}
      >
        История обращений
      </Link>
    </div>
  );
}