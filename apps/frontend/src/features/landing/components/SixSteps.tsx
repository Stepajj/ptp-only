import { Container } from "@/components/Container/Container";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import { StaggerContainer, StaggerGroup, StaggerItem } from "@/components/motion/StaggerContainer";
import Link from "next/link";

import styles from "./SixSteps.module.css";
import { SectionHeader } from "./SectionHeader";

const steps = [
  {
    number: "01",
    title: "Пополните баланс",
    text: "Выберите доступный способ и проверьте реквизиты перед отправкой.",
  },
  {
    number: "02",
    title: "Подключите карту или СБП",
    text: "Добавьте реквизиты для получения рублей и настройте доступные лимиты.",
  },
  {
    number: "03",
    title: "Следите за заявками",
    text: "Проверяйте сумму и срок ответа в личном кабинете.",
  },
  {
    number: "04",
    title: "Подтвердите поступление",
    text: "После зачисления денег в банке подтвердите оплату в заявке. Соответствующая сумма списывается с рублёвого баланса OnlyP2P.",
  },
];

export function SixSteps({ showDetailedGuideLink = false }: { showDetailedGuideLink?: boolean }) {
  return (
    <section id="how-it-works" className={styles.sixSteps}>
      <Container>
        <StaggerContainer variant="section">
          <StaggerItem>
            <SectionHeader
              badge="КАК ЭТО РАБОТАЕТ"
              badgeStyle={{ border: "1px solid rgba(61, 128, 245, 0.3)" }}
            >
              <>От криптовалюты к рублям на карте</>
            </SectionHeader>
          </StaggerItem>
          <StaggerGroup className={styles.grid}>
            {steps.map((step) => (
              <AnimatedCard
                key={step.number}
                className={styles.card}
              >
                <div className={styles.number}>
                  {step.number}
                </div>

                <h3 className={styles.cardTitle}>{step.title}</h3>

                <p className={styles.cardText}>{step.text}</p>
              </AnimatedCard>
            ))}
          </StaggerGroup>
          {showDetailedGuideLink && (
            <StaggerItem>
              <Link href="/how-it-works" className={styles.detailedLink}>
                Подробная инструкция «Как это работает»
              </Link>
            </StaggerItem>
          )}
        </StaggerContainer>
      </Container>
    </section>
  );
}
