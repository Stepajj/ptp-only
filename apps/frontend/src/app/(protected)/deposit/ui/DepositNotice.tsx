import styles from "./DepositNotice.module.css";
import Image from 'next/image';

import Procent from '../../assets/icons/Procent.svg';

export function DepositNotice() {
  return (
    <div className={styles.notice}>
      <div className={styles.icon} aria-hidden="true">
        <Image src={Procent} alt=""/>
      </div>

      <div className={styles.content}>
        <div className={styles.title}>
          При пополнении вы сразу получаете +7% к биржевому курсу
        </div>

        <div className={styles.description}>
          Крипта конвертируется в рубли с премией — на балансе появляется
          фиксированная сумма.
        </div>
      </div>
    </div>
  );
}