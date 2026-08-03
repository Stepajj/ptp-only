import styles from './CabinetSidebar.module.css';
import Image from 'next/image';
import logo from '../../../assets/images/logo.svg';

import { SidebarItem } from './SidebarItem';
import { sidebarItems } from './sidebar.data';
import { SidebarProfileCard } from './SidebarProfileCard';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Image src={logo} alt="Логотип" width={109} height={29} />
      </div>

      <div className={styles.menuHeader}>МЕНЮ</div>

      <div className={styles.menu}>
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            title={item.title}
            icon={item.icon}
          />
        ))}
      </div>
      <SidebarProfileCard />
    </aside>
  );
}