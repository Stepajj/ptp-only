import styles from './Dashboard.module.css';
import ActiveOrdersCard from './active-orders-card/ActiveOrdersCard';
import TodayIncomeCard from './TodayIncomeCard/TodayIncomeCard';
import BalanceCard from './balance-card/BalanceCard';

export default function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <div className={styles.statsGrid}>
    <BalanceCard />

    <ActiveOrdersCard />

    <TodayIncomeCard />
</div>
      <div className={styles.contentGrid}>
        {/* QuickActions */}

        {/* RecentOrders */}
      </div>
    </section>
  );
}