'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';
import { getBalance } from '@/features/auth/api/auth.api';

import styles from './CabinetHeader.module.css';

import  TestIcon from './icons/headerWallet.svg';
import  PlusIcon from './icons/headerPlus.svg';
import Image from 'next/image';

export function CabinetHeader() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const accessToken = getAuthAccessToken();

    if (!accessToken) {
      return;
    }

    async function loadBalance(token: string) {
      try {
        const response = await getBalance(token);
        setBalance(response.data.balance);
      } catch {
        setBalance(null);
      }
    }

    void loadBalance(accessToken);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <h1 className={styles.title}>Личный кабинет</h1>
        <span className={styles.subtitle}>
          Обзор баланса активности
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.balanceButton} type="button">
          <Image src={TestIcon} alt="Wallet" />
          <span>{balance === null ? '— ₽' : formatRub(balance)}</span>
        </button>

        <Link href="/deposit" className={styles.depositButton}>
          <span>Пополнить</span>

          <Image src={PlusIcon} alt="Plus" />
        </Link>
      </div>
    </header>
  );
}

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}
