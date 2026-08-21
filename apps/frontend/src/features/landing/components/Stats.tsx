import { Container } from "@/components/Container/Container";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/StaggerContainer";

import styles from "./Stats.module.css";

const stats = [
  {
    value: "REST API",
    description: "интеграция через backend",
  },
  {
    value: "Pull",
    description: "получение событий через опрос",
  },
  {
    value: "OnlyP2P",
    description: "балансы и операции на стороне сервиса",
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
