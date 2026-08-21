'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getAuthAccessToken } from '@/features/auth/lib/getAuthAccessToken';
import { getBalance } from '@/features/auth/api/auth.api';

import styles from './CabinetHeader.module.css';

import  TestIcon from './icons/headerWallet.svg';
import  PlusIcon from './icons/headerPlus.svg';
import Image from 'next/image';
import logo from '../../../assets/images/logo.svg';

export function CabinetHeader() {
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const accessToken = getAuthAccessToken();

    if (!accessToken) {
      return;
    }

    async function loadBalance(token: string) {
      try {
        const response = await getBalance(token);
        setBalance(response.data.balance);
      } catch {
        setBalance(null);
      }
    }

    void loadBalance(accessToken);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.desktopContent}>
      <div className={styles.content}>
        <h1 className={styles.title}>{getPageHeader(pathname).title}</h1>
        <span className={styles.subtitle}>
          {getPageHeader(pathname).subtitle}
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.balanceButton} type="button">
          <Image src={TestIcon} alt="Wallet" />
          <span>{balance === null ? '— ₽' : formatRub(balance)}</span>
        </button>

        <Link href="/deposit" className={styles.depositButton}>
          <span>Пополнить</span>

          <Image src={PlusIcon} alt="Plus" />
        </Link>
      </div>
      </div>

      <div className={styles.mobileContent}>
        <Link href="/dashboard" className={styles.mobileLogo} aria-label="Кабинет">
          <Image src={logo} alt="ONLYP2P" width={103} height={27} priority />
        </Link>
        <button className={styles.balanceButton} type="button">
          <Image src={TestIcon} alt="Баланс" />
          <span>{balance === null ? '— ₽' : formatRub(balance)}</span>
        </button>
        <Link href="/deposit" className={styles.mobileDepositButton} aria-label="Пополнить">
          <Image src={PlusIcon} alt="" />
        </Link>
      </div>
    </header>
  );
}

function getPageHeader(pathname: string): { title: string; subtitle: string } {
  if (pathname.startsWith('/requests')) return { title: 'Приём заявок', subtitle: 'Входящие переводы от покупателей' };
  if (pathname.startsWith('/requisites')) return { title: 'Реквизиты', subtitle: 'Управление реквизитами для приёма платежей' };
  if (pathname.startsWith('/deposit')) return { title: 'Пополнение', subtitle: 'Пополните баланс через доступный способ' };
  if (pathname.startsWith('/history')) return { title: 'История', subtitle: 'Завершённые входящие заявки' };
  if (pathname.startsWith('/support')) return { title: 'Поддержка', subtitle: 'Свяжитесь с оператором' };
  if (pathname.startsWith('/profile')) return { title: 'Профиль', subtitle: 'Данные аккаунта и настройки' };
  return { title: 'Личный кабинет', subtitle: 'Обзор баланса активности' };
}

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}
