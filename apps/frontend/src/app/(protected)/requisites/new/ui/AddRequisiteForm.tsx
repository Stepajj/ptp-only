'use client';

import { useState } from 'react';

import styles from './AddRequisiteForm.module.css';

type RequisiteType = 'card' | 'sbp';

export default function AddRequisiteForm() {
  const [type, setType] = useState<RequisiteType>('card');

  return (
    <section className={styles.card}>
      <div className={styles.fieldGroup}>
        <span className={styles.label}>Тип реквизита</span>

        <div className={styles.typeSwitcher}>
          <button
            type="button"
            className={`${styles.typeButton} ${
              type === 'card' ? styles.typeButtonActive : ''
            }`}
            onClick={() => setType('card')}
          >
            <span>▭</span>
            <span>Карта</span>
          </button>

          <button
            type="button"
            className={`${styles.typeButton} ${
              type === 'sbp' ? styles.typeButtonActive : ''
            }`}
            onClick={() => setType('sbp')}
          >
            <span>▶</span>
            <span>СБП</span>
          </button>
        </div>
      </div>

      {type === 'card' && (
        <>
          <div className={styles.fieldGroup}>
            <label
              htmlFor="bank"
              className={styles.label}
            >
              Банк
            </label>

            <select
              id="bank"
              className={styles.input}
              defaultValue=""
            >
              <option value="" disabled>
                Выберите свой банк
              </option>

              <option value="tbank">Т-Банк</option>
              <option value="sberbank">Сбербанк</option>
              <option value="alfa">Альфа-Банк</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label
              htmlFor="cardNumber"
              className={styles.label}
            >
              Номер карты
            </label>

            <input
              id="cardNumber"
              type="text"
              className={styles.input}
              placeholder="0000 0000 0000 0000"
            />
          </div>

          <div className={styles.limits}>
            <div className={styles.fieldGroup}>
              <label
                htmlFor="minLimit"
                className={styles.label}
              >
                Мин, ₽
              </label>

              <input
                id="minLimit"
                type="number"
                className={styles.input}
                defaultValue="5000"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label
                htmlFor="maxLimit"
                className={styles.label}
              >
                Макс, ₽
              </label>

              <input
                id="maxLimit"
                type="number"
                className={styles.input}
                defaultValue="50000"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label
                htmlFor="dailyLimit"
                className={styles.label}
              >
                В сутки, ₽
              </label>

              <input
                id="dailyLimit"
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
          Форма СБП будет добавлена отдельно.
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
    </section>
  );
}