import { Container } from "@/components/Container/Container";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import Image from "next/image";
import Arrow from "@/assets/images/arrow.svg";
import {
  StaggerContainer,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion/StaggerContainer";


import styles from "./Limits.module.css";
import { SectionHeader } from "./SectionHeader";

const cards = [
  {
    label: "Баланс",
    value: "OnlyP2P",
    text: "данные загружаются из внешнего сервиса",
  },
  {
    label: "Мин. сумма заявки",
    value: "API",
    text: "значение задаётся правилами OnlyP2P",
  },
  {
    label: "Макс. сумма заявки",
    value: "API",
    text: "значение задаётся правилами OnlyP2P",
  },
  {
    label: "Поддержка",
    value: "Pull",
    text: "сообщения получаются через опрос API",
  },
];

export function Limits() {
  return (
    <section id="limits" className={styles.limits}>
      <Container>
        <StaggerContainer variant="section">
          <StaggerItem>
            <SectionHeader badge="ТАРИФЫ И ЛИМИТЫ">
              <>
                Прозрачные условия,
                <br />
                никаких скрытых комиссий
              </>
            </SectionHeader>
          </StaggerItem>

          <StaggerItem>
            <div className={styles.content}>
              <div className={styles.info}>
                <h3 className={styles.infoTitle}>ВАША ВЫГОДА</h3>

                <div className={styles.percent}>OnlyP2P</div>

                <p className={styles.infoText}>
                  Баланс, пополнение, реквизиты и заявки
                  <br />
                  работают через официальный API сервиса.
                </p>
              </div>

              <StaggerGroup className={styles.grid}>
                {cards.map((card) => (
                  <AnimatedCard key={card.label} className={styles.card}>
                    <span className={styles.cardLabel}>{card.label}</span>

                    <strong className={styles.cardValue}>{card.value}</strong>

                    <p className={styles.cardText}>{card.text}</p>
                  </AnimatedCard>
                ))}
              </StaggerGroup>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className={styles.partnerBanner}>
              <div className={styles.partnerContent}>
                <span className={styles.partnerBadge}>WHITE LABEL</span>

                <h3 className={styles.partnerTitle}>
                  Запустите собственный
                  <br />
                  P2P-обменник под своим брендом
                </h3>

                <p className={styles.partnerText}>
                  Crypto работает поверх готового API — вы получаете такой же
                  сервис
                  <br />
                  со своим логотипом и доменом. Без разработки с нуля.
                </p>
              </div>

              <a href="https://t.me/O_onlypays" target="_blank" rel="noreferrer" className={styles.partnerButton}>
                Узнать про партнёрство <Image alt="Arrow icon" src={Arrow}/>
              </a>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </Container>
    </section>
  );
}
