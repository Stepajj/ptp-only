'use client'

import Link from 'next/link';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './QuickActions.module.css';
import { getIncomingRequests } from '@/features/requests/api/requests.api';
import ArrowRightIcon from '../../assets/icons/rightArrow.svg';
import PlusIcon from '../../assets/icons/ActionPlus.svg';
import CreditCard from '../../assets/icons/credit-card.svg';
import PinkArrows from '../../assets/icons/priority-arrows.svg';

const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => void getIncomingRequests().then((requests) => {
      setCount(requests.filter((request) => request.status === 'waiting' || (request.status === 'cancelled' && request.awaitingProof)).length);
    }).catch(() => setCount(null)));
  }, []);

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
    icon: <Image src={CreditCard} alt="Credit Card" />,
    iconClassName: styles.requisitesIcon,
  },
  {
    href: '#',
    title: 'Приём заявок',
    description: `${count} заявки ожидают подтверждения`,
    icon: <Image src={PinkArrows} alt="Pink Arrows" />,
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