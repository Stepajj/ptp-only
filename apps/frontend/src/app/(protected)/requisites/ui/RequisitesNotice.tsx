import styles from './RequisitesNotice.module.css';

import Image from 'next/image';
import Light from "../assets/icons/light.svg";

export default function RequisitesNotice() {
  return (
    <section className={styles.container}>
      <div className={styles.icon} aria-hidden="true">
        <Image src={Light} alt="" />
      </div>

      <p className={styles.text}>
        Если вы отходите от устройства — выключайте реквизит. Система не будет
        назначать вам новые заявки, пока вы офлайн.
      </p>
    </section>
  );
}   