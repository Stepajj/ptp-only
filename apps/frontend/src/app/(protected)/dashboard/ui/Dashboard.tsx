'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { getRequisites } from '@/features/requisites/api/requisites.api';
import styles from './Dashboard.module.css';
import ActiveOrdersCard from './active-orders-card/ActiveOrdersCard';

import TodayIncomeCard from './TodayIncomeCard/TodayIncomeCard';
import BalanceCard from './balance-card/BalanceCard';
import QuickActions from './quick-actions/QuickActions';
import RecentOrders from './recent-orders/RecentOrders';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [activeRequisites, setActiveRequisites] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    void getRequisites()
      .then((requisites) => {
        if (mounted) setActiveRequisites(requisites.filter((requisite) => requisite.status === 'on').length);
      })
      .catch(() => {
        if (mounted) setActiveRequisites(null);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <section className={styles.dashboard}>
   <h1 className={styles.title}>Здравствуйте, {user?.displayName ?? 'пользователь'} 👋</h1>

<p className={styles.subtitle}>
  <span>Сегодня активны</span>
  <span className={styles.bold}>{activeRequisites === null ? '—' : `${activeRequisites} ${getRequisiteForm(activeRequisites)}`}</span>
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

function getRequisiteForm(count: number): string {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return 'реквизитов';
  const last = count % 10;
  if (last === 1) return 'реквизит';
  if (last >= 2 && last <= 4) return 'реквизита';
  return 'реквизитов';
}
