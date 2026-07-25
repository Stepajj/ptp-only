import { Container } from "@/components/Container/Container";

import { HeroContent } from "./HeroContent";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <Container>
        <HeroContent />
      </Container>
    </section>
  );
}
