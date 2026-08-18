'use client';

import styles from './TodayIncomeCard.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getIncomingRequests } from '@/features/requests/api/requests.api';
import todayStats from '../../assets/icons/todayStats.svg';


export default function TodayIncomeCard() {
  const [income, setIncome] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => void getIncomingRequests('finished').then((requests) => {
      const today = new Date();
      const todayRequests = requests.filter((request) => {
        const date = new Date(request.dateFinished ?? request.created);
        return date.toDateString() === today.toDateString();
      });
      setIncome(todayRequests.reduce((total, request) => total + (request.receivedRubAmount ?? request.amountRub), 0));
      setCount(todayRequests.length);
    }).catch(() => { setIncome(null); setCount(null); }));
  }, []);

  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        <Image src={todayStats} alt="Arrow right" />
      </div>

      <p className={styles.count}>{income === null ? '—' : `${income.toLocaleString('ru-RU')}₽`}</p>

      <p className={styles.label}>
        Принято сегодня
      </p>

      <span className={styles.profitGreen}>{count === null ? '—' : `${count} ${count === 1 ? 'заявка' : 'заявок'}`} <span className={styles.dot}></span> профит не передаётся API</span>
    </article>
  );
}
