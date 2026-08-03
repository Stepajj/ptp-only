import styles from './CabinetHeader.module.css';

import  TestIcon from './icons/headerWallet.svg';
import  PlusIcon from './icons/headerPlus.svg';
import Image from 'next/image';

export function CabinetHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <h1 className={styles.title}>Личный кабинет</h1>
        <span className={styles.subtitle}>
          Обзор баланса активности
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.balanceButton}>
          <Image src={TestIcon} alt="Wallet" />
          <span>148 320 ₽</span>
        </button>

        <button className={styles.depositButton}>
          <span>Пополнить</span>

          <Image src={PlusIcon} alt="Plus" />
        </button>
      </div>
    </header>
  );
}