'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRequisites, editRequisite } from '@/features/requisites/api/requisites.api';
import type { Requisite } from '@/features/requisites/api/requisites.api';

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
  }, [requisiteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

  const handleResetLimits = async () => {
    if (!confirm('Сбросить все лимиты?')) {
      return;
    }

    try {
      setSaving(true);
      await editRequisite(parseInt(requisiteId, 10), { resetLimits: true });
      const requisites = await getRequisites();
      const found = requisites.find((r) => r.requisiteId === parseInt(requisiteId, 10));
      if (found) {
        setRequisite(found);
        setFormData({
          ...formData,
          limitAmount: found.limitAmount?.toString() || '',
          limitAmountMinutes: found.limitAmountMinutes?.toString() || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сбросить лимиты');
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
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Банк:</span>
            <span className={styles.infoValue}>{requisite.bank}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Карта:</span>
            <span className={styles.infoValue}>{requisite.card}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Телефон:</span>
            <span className={styles.infoValue}>{requisite.phone}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>ФИО:</span>
            <span className={styles.infoValue}>{requisite.fio}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Статус</label>
            <div className={styles.statusToggle}>
              <button
                type="button"
                className={`${styles.statusButton} ${
                  formData.status === 'on' ? styles.statusButtonActive : ''
                }`}
                onClick={() => setFormData({ ...formData, status: 'on' })}
                disabled={saving}
              >
                Включен
              </button>
              <button
                type="button"
                className={`${styles.statusButton} ${
                  formData.status === 'off' ? styles.statusButtonActive : ''
                }`}
                onClick={() => setFormData({ ...formData, status: 'off' })}
                disabled={saving}
              >
                Выключен
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="minAmount" className={styles.label}>
              Минимальная сумма заявки, ₽
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
              Максимальная сумма заявки, ₽
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
              Лимит суммы заявок, ₽
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

          <div className={styles.field}>
            <label htmlFor="limitAmountMinutes" className={styles.label}>
              Период лимита, минут
            </label>
            <input
              id="limitAmountMinutes"
              type="number"
              className={styles.input}
              value={formData.limitAmountMinutes}
              onChange={(e) => setFormData({ ...formData, limitAmountMinutes: e.target.value })}
              disabled={saving}
              placeholder="Не ограничен"
            />
          </div>

          <button
            type="button"
            className={styles.resetButton}
            onClick={handleResetLimits}
            disabled={saving}
          >
            Сбросить лимиты
          </button>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.exactAmountOnly}
                onChange={(e) => setFormData({ ...formData, exactAmountOnly: e.target.checked })}
                disabled={saving}
              />
              <span>Принимать только точную сумму</span>
            </label>
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
              className={styles.cancelButton}
              onClick={() => router.push('/requisites')}
              disabled={saving}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
