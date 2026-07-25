import { Container } from "@/components/Container/Container";

import styles from "./Faq.module.css";
import { SectionHeader } from "./SectionHeader";
import { Accordion } from "./Accordion";

export function FAQ() {
  return (
    <section className={styles.faq}>
      <Container>
        <div className={styles.content}>
          <SectionHeader badge="FAQ">
            <>
              Частые вопросы
            </>
          </SectionHeader>

          <Accordion />
        </div>
      </Container>
    </section>
  );
}