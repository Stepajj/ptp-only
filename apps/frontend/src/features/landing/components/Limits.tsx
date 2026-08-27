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
    label: "Начисляем  ",
    value: "+7%",
    text: "При пополнении баланса",
  },
  {
    label: "Мин. сумма заявки",
    value: "1 000₽",
    text: "нижний порог",
  },
  {
    label: "Макс. сумма заявки",
    value: "50 000₽",
    text: "на одну заявку",
  },
  {
    label: "Лимит в сутки",
    value: "100 000₽",
    text: "на один реквизит",
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
                без скрытых комиссий
              </>
            </SectionHeader>
          </StaggerItem>

          <StaggerItem>
            <div className={styles.content}>
              <div className={styles.info}>
                <h3 className={styles.infoTitle}>ВАША ВЫГОДА</h3>

                <div className={styles.percent}>+7%</div>

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
                  Сервис работает поверх готовой инфраструктуры — вы получаете такой же
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
