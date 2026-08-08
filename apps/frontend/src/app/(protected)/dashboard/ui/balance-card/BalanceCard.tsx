'use client'

import { useEffect, useState } from 'react';

import { getBalance } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/model/auth.store';

import styles from './BalanceCard.module.css';

export default function BalanceCard() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

   const loadBalance = async () => {
  if (!accessToken) {
    console.error('[Balance] Access token отсутствует');
    return;
  }

  try {
    const result = await getBalance(accessToken);

    console.log('[Balance] API response:', result);
  } catch (error) {
    console.error('[Balance] API error:', error);
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
    <article>
      <h2>ДОСТУПНЫЙ БАЛАНС</h2>

      <p className={styles.balance}>
        {loading ? 'Загрузка...' : formattedBalance}
      </p>

      <div className={styles.bonus}>
        <span className={styles.bonusIcon}>▲</span>

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