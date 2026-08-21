import styles from "./PartnershipPage.module.css";

export function PartnershipPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            White Label · Only P2P API
          </div>

          <h1 className={styles.heroTitle}>
            Запустите свой P2P-сервис
            <br />
            поверх нашего API
          </h1>

          <p className={styles.heroDescription}>
            Ваши пользователи работают с балансом, пополнением,
            реквизитами, заявками и поддержкой Only P2P через REST-API.
            Вся обработка и балансы — на нашей стороне,
            вы зарабатываете на наценке к курсу.
          </p>
        </div>
      </section>

      <section className={styles.infoGrid}>
        <article className={styles.infoCard}>
          <h2 className={`${styles.infoTitle} ${styles.restTitle}`}>
            REST
          </h2>

          <h3 className={styles.infoSubtitle}>
            Готовый API
          </h3>

          <p className={styles.infoDescription}>
            клиенты, пополнение, заявки, поддержка
          </p>
        </article>

        <article className={styles.infoCard}>
          <h2 className={`${styles.infoTitle} ${styles.markupTitle}`}>
            Наценка
          </h2>

          <h3 className={styles.infoSubtitle}>
            Ваш заработок
          </h3>

          <p className={styles.infoDescription}>
            задаёте свою наценку к курсу пополнения
          </p>
        </article>

        <article className={styles.infoCard}>
          <h2 className={`${styles.infoTitle} ${styles.brandTitle}`}>
            Бренд
          </h2>

          <h3 className={styles.infoSubtitle}>
            Свой домен
          </h3>

          <p className={styles.infoDescription}>
            интерфейс и бренд полностью ваши
          </p>
        </article>
      </section>

      <nav className={styles.actions}>
        <a
          href="https://t.me/O_onlypays"
          target="_blank"
          rel="noreferrer"
          className={`${styles.action} ${styles.actionPrimary}`}
        >
          API-доступ и ключи
        </a>

        <a
          href="https://t.me/O_onlypays"
          target="_blank"
          rel="noreferrer"
          className={styles.action}
        >
          Заявка на White Label
        </a>

      </nav>
    </main>
  );
}
