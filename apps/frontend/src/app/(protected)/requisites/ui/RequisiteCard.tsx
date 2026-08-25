import RequisiteActions from './RequisiteActions';
import type { Requisite } from '@/features/requisites/api/requisites.api';

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

function getBankIcon(bankName: string): string {
  return bankName.charAt(0).toUpperCase();
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

  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <div className={styles.bankIcon} aria-hidden="true">
          {getBankIcon(requisite.bank)}
        </div>

        <div className={styles.content}>
          <p className={styles.title}>
            {requisite.bank} · {type} · {value}
          </p>

          <p className={styles.description}>
            {requisite.fio}
          </p>

          <p className={styles.limits}>
            Мин: {formatLimit(requisite.minAmount)} · Макс: {formatLimit(requisite.maxAmount)}
          </p>
        </div>

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
