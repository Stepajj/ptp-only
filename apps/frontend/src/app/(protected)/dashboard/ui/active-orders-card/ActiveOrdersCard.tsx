import styles from './ActiveOrdersCard.module.css';
import Image from 'next/image';
import ArrowsActive from '../../assets/icons/rightArrow.svg';


export default function ActiveOrdersCard() {
  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        <Image src={ArrowsActive} alt="Arrow right" />
      </div>

      <p className={styles.count}>0</p>

      <p className={styles.label}>
        Активные заявки
      </p>

      <button
        type="button"
        className={styles.button}
      >
        Прием заявок
      </button>
    </article>
  );
}