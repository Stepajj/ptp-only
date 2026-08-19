'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { getIncomingRequests } from '@/features/requests/api/requests.api';
import PlusIcon from '../../assets/icons/ActionPlus.svg';
import CreditCard from '../../assets/icons/credit-card.svg';
import PinkArrows from '../../assets/icons/priority-arrows.svg';
import ArrowRightIcon from '../../assets/icons/rightArrow.svg';
import styles from './QuickActions.module.css';

export default function QuickActions() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    getIncomingRequests()
      .then((requests) => {
        if (!isMounted) return;
        const waitingCount = requests.filter(
          (request) =>
            request.status === 'waiting' ||
            (request.status === 'cancelled' && request.awaitingProof),
        ).length;
        setCount(waitingCount);
      })
      .catch(() => {
        if (isMounted) setCount(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingText =
    count === null
      ? 'Загрузка...'
      : `${count} ${getNounForm(count, 'заявка', 'заявки', 'заявок')} ${count === 1 ? 'ожидает' : 'ожидают'} подтверждения`;

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
      href: '/requests',
      title: 'Приём заявок',
      description: pendingText,
      icon: <Image src={PinkArrows} alt="Pink Arrows" />,
      iconClassName: styles.ordersIcon,
    },
  ];

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Быстрые действия</h2>

      <div className={styles.list}>
        {actions.map((action) => (
          <Link key={action.title} href={action.href} className={styles.item}>
            <div className={`${styles.icon} ${action.iconClassName}`}>
              {action.icon}
            </div>

            <div className={styles.content}>
              <span className={styles.itemTitle}>{action.title}</span>
              <span className={styles.itemDescription}>
                {action.description}
              </span>
            </div>

            <Image
              src={ArrowRightIcon}
              alt="Arrow Right"
              className={styles.arrow}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

// Вспомогательная функция для правильного склонения слов (1 заявка, 2 заявки, 5 заявок)
function getNounForm(
  number: number,
  one: string,
  two: string,
  five: string,
): string {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) return five;
  n %= 10;
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return two;
  return five;
}