import styles from './SupportChatHeader.module.css';

interface SupportChatHeaderProps {
  topic: string | null;
}

export default function SupportChatHeader({
  topic,
}: SupportChatHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.supportInfo}>
        <div className={styles.avatar} aria-hidden="true">
          P2P
        </div>

        <div className={styles.details}>
          <div className={styles.title}>Поддержка ONLYp2p</div>

          <div className={styles.status}>
            <span className={styles.statusDot} />
            <span>онлайн · отвечаем ~10 мин</span>
          </div>
        </div>
      </div>

      <div className={styles.ticket}>
        Обращение #10482
      </div>
    </header>
  );
}