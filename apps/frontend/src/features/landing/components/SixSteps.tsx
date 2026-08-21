import { Container } from "@/components/Container/Container";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import {
  StaggerContainer,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion/StaggerContainer";

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
    title: "Заверши заявку",
    text: "После подтверждения получения данные операции обновляются в сервисе.",
  },
  {
    number: "06",
    title: "PROFIT",
    text: "Контролируй операции, баланс и историю в личном кабинете.",
    highlight: true,
  },
];

export function SixSteps() {
  return (
    <section id="how-it-works" className={styles.sixSteps}>
      <Container>
        <StaggerContainer variant="section">
          <StaggerItem>
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
          </StaggerItem>

          <StaggerGroup className={styles.grid}>
            {steps.map((step) => (
              <AnimatedCard
                key={step.number}
                className={`${styles.card} ${
                  step.highlight ? styles.highlight : ""
                }`}
              >
                <div
                  className={
                    step.highlight ? styles.numberGradient : styles.number
                  }
                >
                  {step.number}
                </div>

                <h3 className={styles.cardTitle}>{step.title}</h3>

                <p className={styles.cardText}>{step.text}</p>
              </AnimatedCard>
            ))}
          </StaggerGroup>
        </StaggerContainer>
      </Container>
    </section>
  );
}
