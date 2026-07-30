'use client';

import { forwardRef, useState } from 'react';
import { AuthInput } from '../AuthInput/AuthInput';
import styles from './PasswordInput.module.css';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ error, className, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className={styles.wrapper}>
        <AuthInput
          {...props}
          ref={ref}
          error={error}
          type={visible ? 'text' : 'password'}
          className={[styles.input, className ?? ''].filter(Boolean).join(' ')}
        />

        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
        >
          👁
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';