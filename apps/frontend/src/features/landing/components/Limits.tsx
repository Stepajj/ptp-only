import { Container } from "@/components/Container/Container";

import styles from "./Limits.module.css";
import { SectionHeader } from "./SectionHeader";

const cards = [
  {
    label: "Комиссия сети",
    value: "200₽",
    text: "при зачислении на карту",
  },
  {
    label: "Мин. сумма заявки",
    value: "1 000₽",
    text: "нижний порог",
  },
  {
    label: "Макс. сумма заявки",
    value: "50 000₽",
    text: "на одну заявку",
  },
  {
    label: "Лимит в сутки",
    value: "100 000₽",
    text: "на один реквизит",
  },
];

export function Limits() {
  return (
    <section className={styles.limits}>
      <Container>
        <SectionHeader badge="ТАРИФЫ И ЛИМИТЫ">
          <>
            Прозрачные условия,
            <br />
            никаких скрытых комиссий
          </>
        </SectionHeader>

        <div className={styles.content}>
          <div className={styles.info}>
            <h3 className={styles.infoTitle}>ВАША ВЫГОДА</h3>

            <div className={styles.percent}>+7%</div>

            <p className={styles.infoText}>
              к биржевому курсу при пополнении — ваша
              <br />
              выгода на каждой продаже крипты.
            </p>
          </div>

          <div className={styles.grid}>
            {cards.map((card) => (
              <article
                key={card.label}
                className={styles.card}
              >
                <span className={styles.cardLabel}>
                  {card.label}
                </span>

                <strong className={styles.cardValue}>
                  {card.value}
                </strong>

                <p className={styles.cardText}>
                  {card.text}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.partnerBanner}>
          <div className={styles.partnerContent}>
            <span className={styles.partnerBadge}>
              WHITE LABEL
            </span>

            <h3 className={styles.partnerTitle}>
              Запустите собственный
              <br />
              P2P-обменник под своим брендом
            </h3>

            <p className={styles.partnerText}>
              Crypto работает поверх готового API — вы получаете такой же сервис
              <br />
              со своим логотипом и доменом. Без разработки с нуля.
            </p>
          </div>

          <button
            type="button"
            className={styles.partnerButton}
          >
            Узнать про партнёрство
            {/* иконку вставишь сюда */}
          </button>
        </div>
      </Container>
    </section>
  );
}