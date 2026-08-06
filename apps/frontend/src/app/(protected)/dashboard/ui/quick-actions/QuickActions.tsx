import Link from 'next/link';

import styles from './QuickActions.module.css';

const actions = [
  {
    href: '#',
    title: 'Пополнить баланс криптой',
    description: 'USDT, BTC, LTC, CryptoBot, xRocket',
    icon: '+',
    iconClassName: styles.depositIcon,
  },
  {
    href: '#',
    title: 'Добавить реквизит',
    description: 'Карта или СБП для приёма',
    icon: '◻',
    iconClassName: styles.requisitesIcon,
  },
  {
    href: '#',
    title: 'Приём заявок',
    description: '2 заявки ожидают подтверждения',
    icon: '✦',
    iconClassName: styles.ordersIcon,
  },
];

export default function QuickActions() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Быстрые действия</h2>

      <div className={styles.list}>
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={styles.item}
          >
            <div className={`${styles.icon} ${action.iconClassName}`}>
              {action.icon}
            </div>

            <div className={styles.content}>
              <span className={styles.itemTitle}>{action.title}</span>

              <span className={styles.itemDescription}>
                {action.description}
              </span>
            </div>

            <span className={styles.arrow}>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}