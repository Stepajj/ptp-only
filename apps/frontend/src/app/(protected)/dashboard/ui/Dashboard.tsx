import styles from './Dashboard.module.css';
import ActiveOrdersCard from './active-orders-card/ActiveOrdersCard';

import BalanceCard from './balance-card/BalanceCard';

export default function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <div className={styles.statsGrid}>
    <BalanceCard />

    <ActiveOrdersCard />

    {/* IncomeCard */}
</div>
      <div className={styles.contentGrid}>
        {/* QuickActions */}

        {/* RecentOrders */}
      </div>
    </section>
  );
}