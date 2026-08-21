import styles from "./DepositNotice.module.css";
import Image from 'next/image';

import Procent from '../assets/icons/procent.svg';

export function DepositNotice() {
  return (
    <div className={styles.notice}>
      <div className={styles.icon} aria-hidden="true">
        <Image src={Procent} alt=""/>
      </div>

      <div className={styles.content}>
        <div className={styles.title}>
          Пополнение через OnlyP2P
        </div>

        <div className={styles.description}>
          Адреса и ссылки на оплату загружаются из OnlyP2P. Фактический способ
          зачисления зависит от выбранного метода.
        </div>
      </div>
    </div>
  );
}
