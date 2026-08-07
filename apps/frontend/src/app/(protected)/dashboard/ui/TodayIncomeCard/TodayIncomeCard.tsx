import styles from './TodayIncomeCard.module.css';
import Image from 'next/image';
import todayStats from '../../assets/icons/rightArrow.svg';


export default function TodayIncomeCard() {
  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        <Image src={todayStats} alt="Arrow right" />
      </div>

      <p className={styles.count}>39 500₽</p>

      <p className={styles.label}>
        Принято сегодня
      </p>

      <span className={styles.profitGreen}>+3 заявки <span className={styles.dot}></span> +2 480₽ выгода</span>
    </article>
  );
}