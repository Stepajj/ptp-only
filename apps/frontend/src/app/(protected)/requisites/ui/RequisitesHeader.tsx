import Link from 'next/link';

import styles from './RequisitesHeader.module.css';

export default function RequisitesHeader() {
  return (
    <div className={styles.container}>
      <p className={styles.description}>
        Карты и СБП, на которые вы принимаете переводы
      </p>

      <Link href="/requisites/new" className={styles.addButton}>
        <span className={styles.icon} aria-hidden="true">
          +
        </span>

        <span>Добавить реквизит</span>
      </Link>
    </div>
  );
}