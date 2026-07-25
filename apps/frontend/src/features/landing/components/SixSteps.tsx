import { Container } from "@/components/Container/Container";

import styles from "./SixSteps.module.css";
import { SectionHeader } from "./SectionHeader";

const steps = [
  {
    number: "01",
    title: "Пополни баланс криптой",
    text: "BTC, LTC, USDT (TRC-20), CryptoBot или xRocket.",
  },
  {
    number: "02",
    title: "Подключи карту или СБП",
    text: "Добавь реквизит и задай лимиты по сумме заявки.",
  },
  {
    number: "03",
    title: "Принимай переводы",
    text: "Плательщики переводят деньги на твои реквизиты автоматически.",
  },
  {
    number: "04",
    title: "Подтверди получение",
    text: "Деньги пришли — жми «Получил», рублёвый баланс списывается.",
  },
  {
    number: "05",
    title: "Получи +7% к курсу",
    text: "Крипта конвертируется в рубли с премией — сразу на баланс.",
  },
  {
    number: "06",
    title: "PROFIT",
    text: "Забирай выгоду от продажи крипты по курсу с премией.",
    highlight: true,
  },
];

export function SixSteps() {
  return (
    <section className={styles.sixSteps}>
      <Container>
        <SectionHeader
          badge="КАК ЭТО РАБОТАЕТ"
          badgeStyle={{ border: "1px solid rgba(61, 128, 245, 0.3)" }}
        >
          <>
            Шесть шагов
            до прибыли
            <br />
          </>
        </SectionHeader>

        <div className={styles.grid}>
          {steps.map((step) => (
            <article
              key={step.number}
              className={`${styles.card} ${
                step.highlight ? styles.highlight : ""
              }`}
            >
              <div
                className={
                  step.highlight
                    ? styles.numberGradient
                    : styles.number
                }
              >
                {step.number}
              </div>

              <h3 className={styles.cardTitle}>
                {step.title}
              </h3>

              <p className={styles.cardText}>
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}