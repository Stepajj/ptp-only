import { Container } from "@/components/Container/Container";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/StaggerContainer";

import styles from "./Faq.module.css";
import { SectionHeader } from "./SectionHeader";
import { Accordion } from "./Accordion";

export function FAQ() {
  return (
    <section className={styles.faq}>
      <Container>
        <StaggerContainer className={styles.content} variant="section">
          <StaggerItem id="faq">
            <SectionHeader badge="FAQ">
              <>Частые вопросы</>
            </SectionHeader>
          </StaggerItem>

          <StaggerItem>
            <Accordion />
          </StaggerItem>
        </StaggerContainer>
      </Container>
    </section>
  );
}
