'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getIncomingRequests, type IncomingRequest } from '@/features/requests/api/requests.api';

import RecentOrderItem, {
  type RecentOrderItemData,
} from './recent-order-item/RecentOrderItem';

import styles from './RecentOrders.module.css';

export default function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrderItemData[] | null>(null);

  useEffect(() => {
    queueMicrotask(() => void getIncomingRequests().then((requests) => {
      setOrders(requests.slice().sort((a, b) => Date.parse(b.created) - Date.parse(a.created)).slice(0, 4).map(toRecentOrder));
    }).catch(() => setOrders(null)));
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Последние заявки</h2>

        <Link href="/history" className={styles.historyLink}>
          Вся история
        </Link>
      </div>

      <div className={styles.list}>
        {orders?.map((order) => (
          <RecentOrderItem
            key={order.id}
            order={order}
          />
        ))}
      </div>
    </section>
  );
}

function toRecentOrder(request: IncomingRequest): RecentOrderItemData {
  return {
    id: request.id,
    amount: `+${(request.receivedRubAmount ?? request.amountRub).toLocaleString('ru-RU')}₽`,
    orderNumber: `Заявка #${request.id}`,
    time: new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(request.created)),
    status: request.status === 'finished' ? 'completed' : 'pending',
  };
}
