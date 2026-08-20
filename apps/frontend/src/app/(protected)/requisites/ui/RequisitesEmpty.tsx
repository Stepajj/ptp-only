import Link from 'next/link';

import styles from './RequisitesEmpty.module.css';

export default function RequisitesEmpty() {
  return (
    <div className={styles.container}>
      
      <h2 className={styles.title}>Нет реквизитов</h2>
      <p className={styles.description}>
        Добавьте карту или СБП для начала работы
      </p>
      <Link href="/requisites/new" className={styles.button}>
        Добавить реквизит
      </Link>
    </div>
  );
}
