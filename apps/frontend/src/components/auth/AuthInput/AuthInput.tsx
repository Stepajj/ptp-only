'use client';

import { forwardRef } from 'react';
import styles from './AuthInput.module.css';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ error, className, ...props }, ref) {
    return (
      <div className={styles.wrapper}>
        <input
          ref={ref}
          {...props}
          aria-invalid={Boolean(error)}
          className={[
            styles.input,
            error ? styles.error : '',
            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  },
);

AuthInput.displayName = 'AuthInput';