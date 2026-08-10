'use client';

import { useState } from 'react';

import styles from './AddRequisiteForm.module.css';

type RequisiteType = 'card' | 'sbp';

type Bank = {
  id: string;
  name: string;
};

const banks: Bank[] = [
  {
    id: 'tbank',
    name: 'Т-Банк',
  },
  {
    id: 'sberbank',
    name: 'Сбербанк',
  },
  {
    id: 'alfa',
    name: 'Альфа-Банк',
  },
];

export default function AddRequisiteForm() {
  const [type, setType] = useState<RequisiteType>('card');

  return (
    <section className={styles.card}>
      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.label}>Тип реквизита</span>

          <div className={styles.typeButtons}>
            <button
              type="button"
              className={`${styles.typeButton} ${
                type === 'card' ? styles.typeButtonActive : ''
              }`}
              onClick={() => setType('card')}
            >
              <span className={styles.typeIcon}>▭</span>

              <span>Карта</span>
            </button>

            <button
              type="button"
              className={`${styles.typeButton} ${
                type === 'sbp' ? styles.typeButtonActive : ''
              }`}
              onClick={() => setType('sbp')}
            >
              <span className={styles.typeIcon}>▶</span>

              <span>СБП</span>
            </button>
          </div>
        </div>

        {type === 'card' && (
          <>
            <div className={styles.field}>
              <label
                htmlFor="bank"
                className={styles.label}
              >
                Банк
              </label>

              <select
                id="bank"
                name="bank"
                className={styles.select}
                defaultValue=""
              >
                <option
                  value=""
                  disabled
                >
                  Выберите свой банк
                </option>

                {banks.map((bank) => (
                  <option
                    key={bank.id}
                    value={bank.id}
                  >
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label
                htmlFor="cardNumber"
                className={styles.label}
              >
                Номер карты
              </label>

              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                className={styles.input}
                placeholder="0000 0000 0000 0000"
              />
            </div>

            <div className={styles.limits}>
              <div className={styles.field}>
                <label
                  htmlFor="minLimit"
                  className={styles.label}
                >
                  Мин, ₽
                </label>

                <input
                  id="minLimit"
                  name="minLimit"
                  type="number"
                  className={styles.input}
                  defaultValue="5000"
                />
              </div>

              <div className={styles.field}>
                <label
                  htmlFor="maxLimit"
                  className={styles.label}
                >
                  Макс, ₽
                </label>

                <input
                  id="maxLimit"
                  name="maxLimit"
                  type="number"
                  className={styles.input}
                  defaultValue="50000"
                />
              </div>

              <div className={styles.field}>
                <label
                  htmlFor="dailyLimit"
                  className={styles.label}
                >
                  В сутки, ₽
                </label>

                <input
                  id="dailyLimit"
                  name="dailyLimit"
                  type="number"
                  className={styles.input}
                  defaultValue="100000"
                />
              </div>
            </div>
          </>
        )}

        {type === 'sbp' && (
          <div className={styles.sbpPlaceholder}>
            Форма добавления СБП будет добавлена отдельно.
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.submitButton}
          >
            Сохранить
          </button>

          <button
            type="button"
            className={styles.cancelButton}
          >
            Отмена
          </button>
        </div>
      </div>
    </section>
  );
}