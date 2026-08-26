'use client'

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BonusArrow from '../../assets/icons/bonusArrow.svg';
import { getBalance } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/model/auth.store';

import styles from './BalanceCard.module.css';

export default function BalanceCard() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const hasBalanceRef = useRef(false);

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
        if (!cancelled && !hasBalanceRef.current) setLoading(true);
        const result = await getBalance(accessToken);

        if (!cancelled) {
          setBalance(result.data.balance);
          hasBalanceRef.current = true;
          setBalanceError(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('[Balance] API error:', error);

        if (!cancelled) {
          setBalanceError(error instanceof Error ? error.message : 'Не удалось загрузить баланс');
          setLoading(false);
        }
      }
    };

    void loadBalance();
    const intervalId = window.setInterval(() => void loadBalance(), 15000);
    const handleFocus = () => void loadBalance();
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [accessToken]);

  const formattedBalance =
    balance === null
      ? balanceError ? 'Ошибка' : '—'
      : `${new Intl.NumberFormat('ru-RU').format(balance)}₽`;

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>ДОСТУПНЫЙ БАЛАНС</h2>

      <p className={styles.balance} aria-live="polite" title={balanceError ?? undefined}>
        {loading ? 'Загрузка...' : formattedBalance}
      </p>

      {balanceError && <p className={styles.error} role="alert">{balanceError}</p>}

      <div className={styles.bonus}>
        <Image src={BonusArrow} alt="Bonus arrow"  />

        <span className={styles.bonusText}>
          7% к курсу при пополнении
        </span>
      </div>

      <Link
        href="/deposit"
        className={styles.button}
      >
        Пополнить криптой
      </Link>
    </article>
  );
}
