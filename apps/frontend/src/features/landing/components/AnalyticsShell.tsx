'use client';

import type { ReactNode } from 'react';
import { AnalyticsConsentProvider } from './AnalyticsConsent';
import { PublicAnalytics } from './PublicAnalytics';

export function AnalyticsShell({ children }: { children: ReactNode }) {
  return <AnalyticsConsentProvider>
    <PublicAnalytics />
    {children}
  </AnalyticsConsentProvider>;
}
