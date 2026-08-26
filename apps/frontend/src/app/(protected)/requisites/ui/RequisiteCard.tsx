import RequisiteActions from './RequisiteActions';
import type { Requisite } from '@/features/requisites/api/requisites.api';
import Image, { type StaticImageData } from 'next/image';
import TBankIcon from '../assets/icons/TBank.svg';
import SbpIcon from '../assets/icons/sbp.svg';

import styles from './RequisiteCard.module.css';
import { UI_MOCK_BADGE } from '@/shared/testing/ui-mocks';

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

  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <div className={styles.bankIcon} aria-hidden="true">
          {getBankIcon(requisite.bank) ? (
            <Image src={getBankIcon(requisite.bank) as StaticImageData} alt="" />
          ) : (
            requisite.bank.charAt(0).toUpperCase()
          )}
        </div>

        <div className={styles.content}>
          <p className={styles.title}>
            {requisite.bank} · {type} · {value}
            {requisite.uiMock ? ` · ${UI_MOCK_BADGE}` : null}
          </p>

          <p className={styles.description}>
            {requisite.fio}
          </p>

          <p className={styles.limits}>
            Лимит сегодня: {formatLimit(requisite.limitAmount)}
          </p>
        </div>

        <div
          className={styles.progress}
          role="progressbar"
          aria-label={requisite.limitAmount === null ? 'Лимит не задан' : `Лимит до ${formatLimit(requisite.limitAmount)}`}
          aria-valuemin={0}
          aria-valuemax={requisite.limitAmount ?? undefined}
          aria-valuenow={0}
          title="Текущий расход не предоставляется API OnlyP2P"
        >
          <span className={styles.progressValue} />
        </div>

        <RequisiteActions
          requisiteId={requisite.requisiteId.toString()}
          isActive={isActive}
          onStatusChange={(newStatus) => onStatusChange?.(requisite.requisiteId, newStatus)}
          disabled={requisite.uiMock === true}
        />
      </div>
    </article>
  );
}

function formatLimit(value: number | null): string {
  return value === null ? '—' : `${value.toLocaleString('ru-RU')} ₽`;
}
