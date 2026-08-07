import Link from 'next/link';

import RecentOrderItem, {
  type RecentOrderItemData,
} from './recent-order-item/RecentOrderItem';

import styles from './RecentOrders.module.css';

const orders: RecentOrderItemData[] = [
  {
    id: '1',
    amount: '+24 000₽',
    orderNumber: 'Заявка #10501',
    time: 'Несколько минут назад',
    status: 'completed',
  },
  {
    id: '2',
    amount: '+24 000₽',
    orderNumber: 'Заявка #10501',
    time: 'Несколько минут назад',
    status: 'pending',
  },
  {
    id: '3',
    amount: '+24 000₽',
    orderNumber: 'Заявка #10501',
    time: 'Несколько минут назад',
    status: 'pending',
  },
  {
    id: '4',
    amount: '+24 000₽',
    orderNumber: 'Заявка #10501',
    time: 'Несколько минут назад',
    status: 'pending',
  },
];

export default function RecentOrders() {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Последние заявки</h2>

        <Link href="#" className={styles.historyLink}>
          Вся история
        </Link>
      </div>

      <div className={styles.list}>
        {orders.map((order) => (
          <RecentOrderItem
            key={order.id}
            order={order}
          />
        ))}
      </div>
    </section>
  );
}