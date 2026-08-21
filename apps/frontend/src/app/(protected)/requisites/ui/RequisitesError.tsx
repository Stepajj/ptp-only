import styles from './RequisitesError.module.css';

type RequisitesErrorProps = {
  onRetry: () => void;
  message?: string;
};

export default function RequisitesError({ onRetry, message }: RequisitesErrorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>⚠️</div>
      <h2 className={styles.title}>Ошибка загрузки</h2>
      <p className={styles.description}>
        {message || 'Не удалось загрузить список реквизитов'}
      </p>
      <button onClick={onRetry} className={styles.button}>
        Попробовать снова
      </button>
    </div>
  );
}
