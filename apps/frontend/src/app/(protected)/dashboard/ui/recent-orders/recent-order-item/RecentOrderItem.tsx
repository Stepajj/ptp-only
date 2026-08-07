import styles from './RecentOrderItem.module.css';

export type RecentOrderStatus = 'completed' | 'pending';

export interface RecentOrderItemData {
  id: string;
  amount: string;
  orderNumber: string;
  time: string;
  status: RecentOrderStatus;
}

interface RecentOrderItemProps {
  order: RecentOrderItemData;
}

export default function RecentOrderItem({
  order,
}: RecentOrderItemProps) {
  const statusLabel =
    order.status === 'completed' ? 'Завершена' : 'Ожидает';

  return (
    <article className={styles.item}>
      <div className={styles.icon}>
        <span className={styles.iconPlaceholder}>▶</span>
      </div>

      <div className={styles.content}>
        <span className={styles.amount}>
          {order.amount}
        </span>

        <div className={styles.meta}>
          <span>{order.orderNumber}</span>

          <span className={styles.separator}>●</span>

          <span>{order.time}</span>
        </div>
      </div>

      <span
        className={`${styles.status} ${
          order.status === 'completed'
            ? styles.statusCompleted
            : styles.statusPending
        }`}
      >
        {statusLabel}
      </span>
    </article>
  );
}