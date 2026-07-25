import { Container } from "@/components/Container/Container";
import { HeroImage } from "./HeroImage";
import styles from "./Hero.module.css";


export function Hero() {
  return (
    <section className={styles.hero}>
      <Container>
       <div className={styles.container}>
            <div className={styles.item}>
                <span className={styles.dot}></span>
                <span className={styles.text}>БЕЗ КУС</span>
                <span className={`${styles.dot} ${styles.gray}`}></span>
            </div>

            <div className={styles.item}>
                
                <span className={styles.text}>БЕЗ ОЖИДАНИЯ</span>
            </div>
        </div>
        <h1 className={styles.title}> Cервис по продаже криптовалюты <br /> с доплатой <span>+7%</span> к курсу</h1>
        <p className={styles.subtitle}>Продавай USDT, BTC и LTC в один клик. Автоматический мэтчинг покупателей, честный курс и прозрачные параметры.</p>

        <div className={styles.actions}>
          <button type="button">Создать аккаунт</button>
          <button type="button">Подробнее о сервисе</button>
        </div>

        <p className={styles.note}>Мин. 1 000 ₽ · Макс. 50 000 ₽ · Минимум пополнения — эквивалент 10 USDT</p>
        <HeroImage />
      </Container>
    </section>
  );
}
