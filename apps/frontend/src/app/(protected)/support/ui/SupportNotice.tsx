import styles from "./SupportNotice.module.css";

export function SupportNotice() {
  return (
    <div className={styles.notice}>
      <div className={styles.icon}>
        💡
      </div>

      <p className={styles.text}>
        Поддержка работает только в текстовом формате.
        Оператор отвечает в этом же диалоге — ответ
        придёт сюда, отдельных уведомлений в Telegram
        не будет.
      </p>
    </div>
  );
}