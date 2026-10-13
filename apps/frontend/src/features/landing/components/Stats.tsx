import { Container } from "@/components/Container/Container";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

import styles from "./Stats.module.css";

const stats = [
  {
    value: "BTC · LTC",
    description: "Доступны для пополнения",
  },
  {
    value: "+7%",
    description: "Доплата при конвертации в рубли",
  },
  {
    value: "Карта · СБП",
    description: "Для получения рублей на подключённые реквизиты",
  },
];

export function Stats() {
  return (
    <section>
      <Container>
        <StaggerContainer className={styles.stats} variant="section">
          {stats.map((stat) => (
            <StaggerItem key={stat.value} className={styles.stat}>
              <h3 className={styles.value}>{stat.value}</h3>
              <p className={styles.description}>{stat.description}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  );
}
