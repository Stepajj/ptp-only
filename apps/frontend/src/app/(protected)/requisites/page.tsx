import RequisitesHeader from './ui/RequisitesHeader';
import RequisitesNotice from './ui/RequisitesNotice';
import RequisitesList from './ui/RequisitesList';

import styles from './ui/RequisitesPage.module.css';

export default function RequisitesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <RequisitesHeader />
        <RequisitesNotice />
        <RequisitesList />
      </div>
    </main>
  );
}