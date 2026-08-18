import styles from './Dashboard.module.css';
import ActiveOrdersCard from './active-orders-card/ActiveOrdersCard';

import TodayIncomeCard from './TodayIncomeCard/TodayIncomeCard';
import BalanceCard from './balance-card/BalanceCard';
import QuickActions from './quick-actions/QuickActions';
import RecentOrders from './recent-orders/RecentOrders';

export default function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <h1 className={styles.title}>
  Здравствуйте, пользователь 👋
</h1>

<p className={styles.subtitle}>
  <span className={styles.subtitleBold}>2 реквизита</span>
  <span className={styles.dot} />
  <span>система подбирает переводы</span>
</p>
      <div className={styles.statsGrid}>
    <BalanceCard />

    <ActiveOrdersCard />

    <TodayIncomeCard />
</div>
      <div className={styles.contentGrid}>
        <QuickActions /> 

        <RecentOrders />
      </div>
    </section>
  );
}