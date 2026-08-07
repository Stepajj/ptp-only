import Link from 'next/link';

import Image from 'next/image';

import styles from './QuickActions.module.css';

import ArrowRightIcon from '../../assets/icons/rightArrow.svg';
import PlusIcon from '../../assets/icons/ActionPlus.svg';

const actions = [
  {
    href: '#',
    title: 'Пополнить баланс криптой',
    description: 'USDT, BTC, LTC, CryptoBot, xRocket',
    icon: <Image src={PlusIcon} alt="Plus" />,
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
            <Image src={ArrowRightIcon} alt="Arrow Right" className={styles.arrow} />
            {/* <ArrowRightIcon className={styles.arrow} /> */}
          </Link>
        ))}
      </div>
    </section>
  );
}