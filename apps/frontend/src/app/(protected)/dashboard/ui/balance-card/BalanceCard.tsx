'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import BonusArrow from '../../assets/icons/bonusArrow.svg';
import { getBalance } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/model/auth.store';

import styles from './BalanceCard.module.css';

export default function BalanceCard() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let cancelled = false;

    const loadBalance = async () => {
      if (!accessToken) {
        console.error('[Balance] Access token отсутствует');
        return;
      }

      try {
        setLoading(true);
        const result = await getBalance(accessToken);

        if (!cancelled) {
          setBalance(result.data.balance);
          setLoading(false);
        }
      } catch (error) {
        console.error('[Balance] API error:', error);

        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBalance();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const formattedBalance =
    balance === null
      ? '—'
      : `${new Intl.NumberFormat('ru-RU').format(balance)}₽`;

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>ДОСТУПНЫЙ БАЛАНС</h2>

      <p className={styles.balance}>
        {loading ? 'Загрузка...' : formattedBalance}
      </p>

      <div className={styles.bonus}>
        <Image src={BonusArrow} alt="Bonus arrow"  />

        <span className={styles.bonusText}>
          7% к курсу при пополнении
        </span>
      </div>

      <button
        type="button"
        className={styles.button}
      >
        Пополнить криптой
      </button>
    </article>
  );
}
