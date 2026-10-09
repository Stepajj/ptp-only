'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './AnalyticsConsent.module.css';

type Consent = 'granted' | 'denied' | null;
type ConsentContextValue = { consent: Consent; choose: (choice: Exclude<Consent, null>) => void; manage: () => void };
const consentKey = 'op2p_analytics_consent';
const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useAnalyticsConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useAnalyticsConsent must be used inside AnalyticsConsentProvider');
  return context;
}

export function AnalyticsConsentProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [manageRequested, setManageRequested] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(consentKey);
      if (saved === 'granted' || saved === 'denied') setConsent(saved);
      else setManageRequested(true);
    } catch {
      // If browser storage is unavailable, ask again on each visit and keep the choice in memory.
      setManageRequested(true);
    }
  }, []);

  const choose = useCallback((choice: Exclude<Consent, null>) => {
    setConsent(choice);
    setManageRequested(false);
    try { localStorage.setItem(consentKey, choice); } catch { /* The choice still applies for this page view. */ }
  }, []);
  const manage = useCallback(() => setManageRequested(true), []);
  const value = useMemo(() => ({ consent, choose, manage }), [consent, choose, manage]);
  const isProtectedRoute = ['/admin', '/dashboard', '/deposit', '/history', '/partnership', '/preview', '/profile', '/requests', '/requisites', '/support', '/zxc', '/transactions'].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {!isProtectedRoute && manageRequested && (
        <aside className={styles.banner} aria-label="Настройки аналитики" aria-live="polite">
          <div className={styles.copy}>
            <strong>Разрешить сбор аналитики?</strong>
            <p>Аналитика помогает понять, какие страницы и кнопки полезны. До вашего выбора GA4 не загружается, а категория источника не сохраняется.</p>
            <Link href="/privacy" className={styles.policy}>Политика конфиденциальности</Link>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.accept} onClick={() => choose('granted')}>Разрешить аналитику</button>
            <button type="button" className={styles.reject} onClick={() => choose('denied')}>Отклонить</button>
          </div>
        </aside>
      )}
      {!isProtectedRoute && !manageRequested && (
        <button type="button" className={styles.manage} onClick={manage}>
          Настройки аналитики{consent === 'granted' ? ': разрешена' : consent === 'denied' ? ': отклонена' : ''}
        </button>
      )}
    </ConsentContext.Provider>
  );
}
