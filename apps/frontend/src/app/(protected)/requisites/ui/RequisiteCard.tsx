import RequisiteActions from './RequisiteActions';
import type { Requisite } from '@/features/requisites/api/requisites.api';
import Image, { type StaticImageData } from 'next/image';
import TBankIcon from '../assets/icons/TBank.svg';
import SbpIcon from '../assets/icons/sbp.svg';

import styles from './RequisiteCard.module.css';

type RequisiteCardProps = {
  requisite: Requisite;
  onStatusChange?: (requisiteId: number, newStatus: boolean) => void;
};

function formatCardNumber(card: string): string {
  if (card === '-') return '—';
  const cleaned = card.replace(/\s/g, '');
  if (cleaned.length >= 4) {
    return `••• ${cleaned.slice(-4)}`;
  }
  return card;
}

function formatPhoneNumber(phone: string): string {
  if (phone === '-') return '—';
  return phone;
}

function getBankIcon(bankName: string): StaticImageData | null {
  const normalized = bankName.toLowerCase();
  if (normalized.includes('т-банк') || normalized.includes('тинькофф')) return TBankIcon;
  if (normalized.includes('сбп')) return SbpIcon;
  return null;
}

function getDisplayInfo(requisite: Requisite): { type: string; value: string } {
  if (requisite.method === 'sbp' || (requisite.method === 'both' && requisite.phone !== '-')) {
    return {
      type: 'СБП',
      value: formatPhoneNumber(requisite.phone),
    };
  }
  return {
    type: 'Карта',
    value: formatCardNumber(requisite.card),
  };
}

export default function RequisiteCard({
  requisite,
  onStatusChange,
}: RequisiteCardProps) {
  const { type, value } = getDisplayInfo(requisite);
  const isActive = requisite.status === 'on';
  const bankIcon = getBankIcon(requisite.bank);

  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <div className={styles.bankIcon} aria-hidden="true">
          {bankIcon ? (
            <Image src={bankIcon} alt="" />
          ) : (
            requisite.bank.charAt(0).toUpperCase()
          )}
        </div>

        <div className={styles.content}>
          <p className={styles.title}>
            {requisite.bank} · {type} · {value}
          </p>

          <p className={styles.description}>
            {requisite.fio}
          </p>

          <p className={styles.limits}>
            Лимит сегодня: {formatLimit(requisite.limitAmount)}
          </p>
        </div>

      </div>
      <div className={styles.actions}>
        <RequisiteActions
          requisiteId={requisite.requisiteId.toString()}
          isActive={isActive}
          onStatusChange={(newStatus) => onStatusChange?.(requisite.requisiteId, newStatus)}
        />
      </div>
    </article>
  );
}

function formatLimit(value: number | null): string {
  return value === null ? '—' : `${value.toLocaleString('ru-RU')} ₽`;
}
