'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRequisites, editRequisite, deleteRequisite } from '@/features/requisites/api/requisites.api';
import type { Requisite } from '@/features/requisites/api/requisites.api';
import Image from 'next/image';
import TBankIcon from '../../assets/icons/TBank.svg';
import SbpIcon from '../../assets/icons/sbp.svg';

function getBankIcon(bankName: string) {
  const normalized = bankName.toLowerCase();
  if (normalized.includes('т-банк') || normalized.includes('тинькофф')) return TBankIcon;
  if (normalized.includes('сбп')) return SbpIcon;
  return null;
}

function getRequisiteValue(requisite: Requisite): string {
  if (requisite.method === 'sbp' || (requisite.method === 'both' && requisite.phone !== '-')) {
    return requisite.phone === '-' ? 'СБП' : `СБП · ${requisite.phone}`;
  }
  const card = requisite.card.replace(/\s/g, '');
  return card.length >= 4 ? `•• ${card.slice(-4)}` : 'Карта';
}

import styles from './RequisiteSettings.module.css';

export default function RequisiteSettings({ requisiteId }: { requisiteId: string }) {
  const router = useRouter();
  const [requisite, setRequisite] = useState<Requisite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    status: 'on' as 'on' | 'off',
    minAmount: '',
    maxAmount: '',
    limitAmount: '',
    limitAmountMinutes: '',
    exactAmountOnly: false,
  });
useEffect(() => {
  async function loadRequisite() {
    try {
      setLoading(true);
      setError(null);

      const id = parseInt(requisiteId, 10);

      const requisites = await getRequisites();

      const found = requisites.find(
        (r) => r.requisiteId === id
      );

      if (!found) {
        setError('Реквизит не найден');
        return;
      }

      setRequisite(found);

      setFormData({
        status: found.status,
        minAmount: found.minAmount?.toString() ?? '',
        maxAmount: found.maxAmount?.toString() ?? '',
        limitAmount: found.limitAmount?.toString() ?? '',
        limitAmountMinutes:
          found.limitAmountMinutes?.toString() ?? '',
        exactAmountOnly: found.exactAmountOnly,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить реквизит'
      );
    } finally {
      setLoading(false);
    }
  }

  loadRequisite();
}, [requisiteId]);

  /*useEffect(() => {
    async function loadRequisite() {
      try {
        const requisites = await getRequisites();
        const found = requisites.find((r) => r.requisiteId === parseInt(requisiteId, 10));
        if (!found) {
          setError('Реквизит не найден');
          return;
        }
        setRequisite(found);
        setFormData({
          status: found.status,
          minAmount: found.minAmount?.toString() ?? '',
          maxAmount: found.maxAmount?.toString() ?? '',
          limitAmount: found.limitAmount?.toString() || '',
          limitAmountMinutes: found.limitAmountMinutes?.toString() || '',
          exactAmountOnly: found.exactAmountOnly,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить реквизит');
      } finally {
        setLoading(false);
      }
    }
    loadRequisite();
  }, [requisiteId]);*/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (Boolean(formData.limitAmount) !== Boolean(formData.limitAmountMinutes)) {
      setError('Укажите лимит и период лимита вместе');
      return;
    }

    try {
      setSaving(true);

      const input: Parameters<typeof editRequisite>[1] = {
        status: formData.status,
        exactAmountOnly: formData.exactAmountOnly,
      };

      if (formData.minAmount) {
        input.minAmount = parseInt(formData.minAmount, 10);
      }
      if (formData.maxAmount) {
        input.maxAmount = parseInt(formData.maxAmount, 10);
      }
      if (formData.limitAmount && formData.limitAmountMinutes) {
        input.limitAmount = parseInt(formData.limitAmount, 10);
        input.limitAmountMinutes = parseInt(formData.limitAmountMinutes, 10);
      }

      await editRequisite(parseInt(requisiteId, 10), input);
      router.push('/requisites');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить этот реквизит?')) return;
    try {
      setSaving(true);
      await deleteRequisite(parseInt(requisiteId, 10));
      router.push('/requisites');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить реквизит');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.card}>
        <div className={styles.loading}>Загрузка...</div>
      </section>
    );
  }

  if (error || !requisite) {
    return (
      <section className={styles.card}>
        <div className={styles.error}>{error || 'Реквизит не найден'}</div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.form}>
        <h2 className={styles.title}>Настройки реквизита</h2>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.info}>
          <div className={styles.bankIcon} aria-hidden="true">
            {getBankIcon(requisite.bank) ? <Image src={getBankIcon(requisite.bank)!} alt="" /> : requisite.bank.charAt(0)}
          </div>
          <div className={styles.infoContent}>
            <strong className={styles.infoTitle}>{requisite.bank} · {getRequisiteValue(requisite)}</strong>
            <span className={styles.infoSubtitle}>{requisite.status === 'on' ? 'Активен · подбор включён' : 'Выключен · подбор отключён'}</span>
          </div>
        </div>

        <div className={styles.statusRow}>
          <div>
            <strong className={styles.statusTitle}>Приём заявок</strong>
            <span className={styles.statusDescription}>Выключите, если отходите офлайн</span>
          </div>
          <button
            type="button"
            className={`${styles.switch} ${formData.status === 'on' ? styles.switchOn : ''}`}
            aria-label={formData.status === 'on' ? 'Выключить приём заявок' : 'Включить приём заявок'}
            aria-pressed={formData.status === 'on'}
            onClick={() => setFormData({ ...formData, status: formData.status === 'on' ? 'off' : 'on' })}
            disabled={saving}
          >
            <span className={styles.switchThumb} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="minAmount" className={styles.label}>
              Мин, ₽
            </label>
            <input
              id="minAmount"
              type="number"
              className={styles.input}
              value={formData.minAmount}
              onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
              disabled={saving}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="maxAmount" className={styles.label}>
              Макс, ₽
            </label>
            <input
              id="maxAmount"
              type="number"
              className={styles.input}
              value={formData.maxAmount}
              onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
              disabled={saving}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="limitAmount" className={styles.label}>
              В сутки, ₽
            </label>
            <input
              id="limitAmount"
              type="number"
              className={styles.input}
              value={formData.limitAmount}
              onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
              disabled={saving}
              placeholder="Не ограничен"
            />
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>

            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => void handleDelete()}
              disabled={saving}
            >
              Удалить
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
