import type { ReactNode } from 'react';

import { CabinetHeader } from './CabinetHeader';
import { CabinetSidebar } from './CabinetSidebar';

import styles from './CabinetLayout.module.css';

type Props = {
  children: ReactNode;
};

export function CabinetLayout({ children }: Props) {
  return (
    <div className={styles.layout}>
      <CabinetSidebar />

      <div className={styles.content}>
        <CabinetHeader />

        <main className={styles.page}>
          {children}
        </main>
      </div>
    </div>
  );
}