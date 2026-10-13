import { Container } from "@/components/Container/Container";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import { StaggerContainer, StaggerGroup, StaggerItem } from "@/components/motion/StaggerContainer";
import Link from "next/link";
import styles from "./Limits.module.css";
import { SectionHeader } from "./SectionHeader";

const cards = [
  {
    label: "Криптовалюта",
    value: "BTC · LTC",
    text: "Способы пополнения баланса",
  },
  {
    label: "Криптовалюта",
    value: "USDT TRC20",
    text: "Проверьте сеть перед отправкой",
  },
  {
    label: "Сторонний сервис",
    value: "CryptoBot",
    text: "Доступный способ пополнения",
  },
  {
    label: "Сторонний сервис",
    value: "xRocket",
    text: "Доступный способ пополнения",
  },
];

export function Limits() {
  return (
    <section id="limits" className={styles.limits}>
      <Container>
        <StaggerContainer variant="section">
          <StaggerItem>
            <SectionHeader badge="УСЛОВИЯ КОНВЕРТАЦИИ">
              <>Способы пополнения и получения рублей</>
            </SectionHeader>
          </StaggerItem>
          <StaggerItem>
            <div className={styles.content}>
              <div className={styles.info}>
                <h3 className={styles.infoTitle}>ЧТО ОЗНАЧАЕТ ДОПЛАТА</h3>

                <div className={styles.percent}>+7%</div>

                <p className={styles.infoText}>
                  Доплата применяется при продаже криптовалюты с зачислением рублей на баланс OnlyP2P. Рубли на балансе и деньги, полученные на карту, — разные этапы операции.
                </p>
                <Link className={styles.moreLink} href="/blog/doplata-7-procentov">Подробнее о доплате +7%</Link>
              </div>

              <StaggerGroup className={styles.grid}>
                {cards.map((card) => (
                  <AnimatedCard key={card.value} className={styles.card}>
                    <span className={styles.cardLabel}>{card.label}</span>

                    <strong className={styles.cardValue}>{card.value}</strong>

                    <p className={styles.cardText}>{card.text}</p>
                  </AnimatedCard>
                ))}
              </StaggerGroup>
            </div>
          </StaggerItem>

          <StaggerItem>
            <p className={styles.methodsNote}>
              Рубли можно получать на подключённые банковские реквизиты — карту или СБП. Перед операцией проверьте доступность выбранного способа в своём интерфейсе.{' '}
              <Link href="/methods">Способы пополнения и получения рублей</Link>
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className={styles.partnerBanner}>
              <div className={styles.partnerContent}>
                <span className={styles.partnerBadge}>НАЧАЛО РАБОТЫ</span>

                <h3 className={styles.partnerTitle}>
                  Начните с условий вашей операции
                </h3>

                <p className={styles.partnerText}>
                  Посмотрите способы пополнения и порядок получения рублей. Для работы с балансом и заявками создайте аккаунт или войдите в личный кабинет.
                </p>
              </div>

              <div className={styles.partnerActions}>
                <Link href="/register" className={styles.partnerButton}>Создать аккаунт</Link>
                <Link href="/login" className={styles.partnerSecondaryButton}>Войти</Link>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </Container>
    </section>
  );
}
