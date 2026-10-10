'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { AnalyticsConsentProvider } from './AnalyticsConsent';
import { PublicAnalytics } from './PublicAnalytics';

export function AnalyticsShell({ children }: { children: ReactNode }) {
  return <AnalyticsConsentProvider>
    <Suspense fallback={null}><PublicAnalytics /></Suspense>
    {children}
  </AnalyticsConsentProvider>;
}
