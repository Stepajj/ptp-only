import { Container } from "@/components/Container/Container";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/StaggerContainer";

import styles from "./Stats.module.css";

const stats = [
  {
    value: "6 лет",
    description: "стабильной работы на рынке",
  },
  {
    value: "73 000",
    description: "активных пользователей",
  },
  {
    value: "+7%",
    description: "к биржевому курсу при пополнении",
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
