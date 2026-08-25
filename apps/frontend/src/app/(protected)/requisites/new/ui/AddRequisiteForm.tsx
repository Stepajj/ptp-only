'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBanks } from '@/features/requisites/api/banks.api';
import { createRequisite } from '@/features/requisites/api/requisites.api';
import type { Bank } from '@/features/requisites/api/banks.api';
import { ApiError } from '@/shared/api/http';

import styles from './AddRequisiteForm.module.css';

export default function AddRequisiteForm() {
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bankId: '',
    fio: '',
    card: '',
    phone: '',
    minAmount: '',
    maxAmount: '',
    limitAmount: '',
    limitAmountMinutes: '',
    exactAmountOnly: false,
  });

  useEffect(() => {
    async function loadBanks() {
      try {
        const data = await getBanks();
        setBanks(data);
      } catch (err) {
        setError(getRequisiteErrorMessage(err, 'Не удалось загрузить список банков'));
      }
    }
    loadBanks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.bankId) {
      setError('Выберите банк');
      return;
    }

    if (!formData.fio.trim()) {
      setError('Введите ФИО');
      return;
    }

    const hasCard = formData.card.replace(/\s/g, '').length > 0;
    const hasPhone = formData.phone.replace(/\D/g, '').length > 0;

    if (!hasCard && !hasPhone) {
      setError('Введите номер карты или телефона');
      return;
    }

    const minAmount = formData.minAmount ? Number(formData.minAmount) : undefined;
    const maxAmount = formData.maxAmount ? Number(formData.maxAmount) : undefined;
    const limitAmount = formData.limitAmount ? Number(formData.limitAmount) : undefined;
    const limitMinutes = formData.limitAmountMinutes ? Number(formData.limitAmountMinutes) : undefined;

    if ([minAmount, maxAmount, limitAmount, limitMinutes].some((value) => value !== undefined && (!Number.isInteger(value) || value <= 0))) {
      setError('Лимиты должны быть положительными целыми числами');
      return;
    }
    if (minAmount !== undefined && minAmount < 1000) {
      setError('Минимальная сумма не может быть меньше 1 000 ₽');
      return;
    }
    if (maxAmount !== undefined && maxAmount < 1000) {
      setError('Максимальная сумма не может быть меньше 1 000 ₽');
      return;
    }
    if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
      setError('Минимальная сумма не может быть больше максимальной');
      return;
    }
    if ((limitAmount === undefined) !== (limitMinutes === undefined)) {
      setError('Укажите лимит и период лимита вместе');
      return;
    }
    if (limitMinutes !== undefined && limitMinutes > 1440) {
      setError('Период лимита не может быть больше 1 440 минут');
      return;
    }

    try {
      setLoading(true);
      
      const input: Parameters<typeof createRequisite>[0] = {
        bankId: parseInt(formData.bankId, 10),
        fio: formData.fio.trim(),
        ...(hasCard ? { card: formData.card.replace(/\s/g, '') } : {}),
        ...(hasPhone ? { phone: formData.phone.replace(/\D/g, '') } : {}),
      };

      if (minAmount !== undefined) {
        input.minAmount = minAmount;
      }
      if (maxAmount !== undefined) {
        input.maxAmount = maxAmount;
      }
      if (limitAmount !== undefined && limitMinutes !== undefined) {
        input.limitAmount = limitAmount;
        input.limitAmountMinutes = limitMinutes;
      }
      if (formData.exactAmountOnly) {
        input.exactAmountOnly = true;
      }

      await createRequisite(input);
      router.push('/requisites');
    } catch (err) {
      setError(getRequisiteErrorMessage(err, 'Не удалось создать реквизит'));
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('7') || cleaned.startsWith('8')) {
      cleaned = cleaned.slice(1);
    }
    cleaned = cleaned.slice(0, 10);
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `+7 ${cleaned}`;
    if (cleaned.length <= 6) return `+7 ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `+7 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `+7 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  return (
    <section className={styles.card}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="bank" className={styles.label}>
            Банк
          </label>
          <select
            id="bank"
            name="bank"
            className={styles.select}
            value={formData.bankId}
            required
            onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
            disabled={loading}
          >
            <option value="" disabled>
              Выберите свой банк
            </option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="fio" className={styles.label}>
            ФИО владельца
          </label>
          <input
            id="fio"
            name="fio"
            type="text"
            className={styles.input}
            placeholder="Иванов Иван Иванович"
            value={formData.fio}
            required
            onChange={(e) => setFormData({ ...formData, fio: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="cardNumber" className={styles.label}>
            Номер карты (необязательно)
          </label>
          <input
            id="cardNumber"
            name="cardNumber"
            type="text"
            className={styles.input}
            placeholder="0000 0000 0000 0000"
            value={formData.card}
            onChange={(e) => setFormData({ ...formData, card: formatCardNumber(e.target.value) })}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="phoneNumber" className={styles.label}>
            Номер телефона (необязательно)
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            className={styles.input}
            placeholder="+7 900 123 45 67"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
            disabled={loading}
          />
        </div>

        <div className={styles.limits}>
          <div className={styles.field}>
            <label htmlFor="minLimit" className={styles.label}>
              Мин, ₽
            </label>
            <input
              id="minLimit"
              name="minLimit"
              type="number"
              className={styles.input}
              value={formData.minAmount}
              min="1000"
              step="1"
              onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
              disabled={loading}
              placeholder="5000"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="maxLimit" className={styles.label}>
              Макс, ₽
            </label>
            <input
              id="maxLimit"
              name="maxLimit"
              type="number"
              className={styles.input}
              value={formData.maxAmount}
              min="1000"
              step="1"
              onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
              disabled={loading}
              placeholder="50000"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="dailyLimit" className={styles.label}>
              Лимит, ₽
            </label>
            <input
              id="dailyLimit"
              name="dailyLimit"
              type="number"
              className={styles.input}
              value={formData.limitAmount}
              min="1000"
              max="100000000"
              step="1"
              onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
              disabled={loading}
              placeholder="100000"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="limitPeriod" className={styles.label}>
              Период, мин
            </label>
            <input
              id="limitPeriod"
              name="limitPeriod"
              type="number"
              className={styles.input}
              value={formData.limitAmountMinutes}
              min="1"
              max="1440"
              step="1"
              onChange={(e) => setFormData({ ...formData, limitAmountMinutes: e.target.value })}
              disabled={loading}
              placeholder="1440"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.exactAmountOnly}
              onChange={(e) => setFormData({ ...formData, exactAmountOnly: e.target.checked })}
              disabled={loading}
            />
            <span>Принимать только точную сумму</span>
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>

          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.push('/requisites')}
            disabled={loading}
          >
            Отмена
          </button>
        </div>
      </form>
    </section>
  );
}

function getRequisiteErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Сессия истекла. Войдите в аккаунт снова.';
    }

    return error.message;
  }

  return error instanceof Error ? error.message : fallback;
}
