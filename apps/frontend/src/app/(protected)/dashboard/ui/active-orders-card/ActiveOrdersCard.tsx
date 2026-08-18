'use client';

import styles from './ActiveOrdersCard.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getIncomingRequests } from '@/features/requests/api/requests.api';
import ArrowsActive from '../../assets/icons/active-arrows.svg';


export default function ActiveOrdersCard() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => void getIncomingRequests().then((requests) => {
      setCount(requests.filter((request) => request.status === 'waiting' || (request.status === 'cancelled' && request.awaitingProof)).length);
    }).catch(() => setCount(null)));
  }, []);

  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        <Image src={ArrowsActive} alt="Arrow right" />
      </div>

      <p className={styles.count}>{count === null ? '—' : count}</p>

      <p className={styles.label}>
        Активные заявки
      </p>

      <Link href="/requests" className={styles.button}>
        Прием заявок
      </Link>
    </article>
  );
}
