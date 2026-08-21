import styles from './CabinetLayout.module.css';

import { Sidebar } from './CabinetSidebar';
import { CabinetHeader } from './CabinetHeader';
import { MobileBottomNav } from './MobileBottomNav';

type Props = {
  children: React.ReactNode;
};

export function CabinetLayout({ children }: Props) {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.content}>
        <CabinetHeader />
        <div className={styles.contentWrapper}>
            {children}
        </div>
        <MobileBottomNav />
        
      </div>
    </div>
  );
}
