import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './GradientButton.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function GradientButton({ children, className, ...props }: Props) {
  return (
    <button
      {...props}
      className={[styles.btn, className ?? ''].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}