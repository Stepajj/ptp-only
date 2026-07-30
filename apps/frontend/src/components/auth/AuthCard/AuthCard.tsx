import type { ReactNode } from 'react';
import styles from './AuthCard.module.css';

interface Props {
  children: ReactNode;
}

export function AuthCard({ children }: Props) {
  return <section className={styles.card}>{children}</section>;
}