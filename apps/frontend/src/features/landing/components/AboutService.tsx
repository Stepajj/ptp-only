import { Container } from "@/components/Container/Container";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

import styles from "./AboutService.module.css";
import { SectionHeader } from "./SectionHeader";

export function AboutService() {
  return (
    <Container>
      <StaggerContainer
        as="section"
        id="about-service"
        className={styles.aboutServiceSection}
        variant="section"
      >
        <StaggerItem className={styles.left}>
          <SectionHeader
            badge="УСЛОВИЯ ОПЕРАЦИИ"
            titleStyle={{ marginTop: "10px" }}
          >
            <>
              Условия и подтверждение оплаты
            </>
          </SectionHeader>
        </StaggerItem>

        <StaggerItem className={styles.right}>
          <p>Проверяйте сумму, реквизиты и время на ответ в каждой заявке. Подтверждение оплаты означает, что вы проверили поступление денег в своём банке. Если перевод не пришёл, сразу выполните порядок действий в заявке.</p>
          <p><a href="/security">Правила проверки перевода</a> · <a href="/terms">Условия использования</a></p>
        </StaggerItem>
      </StaggerContainer>
    </Container>
  );
}
