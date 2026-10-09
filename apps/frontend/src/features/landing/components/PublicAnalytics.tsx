'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { referralUrls, type RefKey } from '@/features/content/referrals';
import { useAnalyticsConsent } from './AnalyticsConsent';

const productionMeasurementId = 'G-04SZWLQLH2';
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '';
const validMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId);
type Attribution = { key: RefKey; last_seen_ms: number };
declare global { interface Window { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void; __op2pReferral?: Attribution; __op2pGtagInitialized?: boolean } }

const hosts: Record<Exclude<RefKey, 'other'>, string[]> = {
  google_organic: ['google.com', 'www.google.com', 'google.ru', 'www.google.ru', 'google.co.uk', 'www.google.co.uk', 'google.de', 'www.google.de'],
  yandex_organic: ['yandex.ru', 'www.yandex.ru', 'yandex.com', 'www.yandex.com', 'ya.ru', 'www.ya.ru', 'yandex.by', 'www.yandex.by', 'yandex.kz', 'www.yandex.kz'],
  bing_organic: ['bing.com', 'www.bing.com', 'cn.bing.com'],
  ai_referral: ['chatgpt.com', 'www.chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'www.perplexity.ai', 'gemini.google.com', 'claude.ai', 'www.claude.ai', 'grok.com', 'www.grok.com', 'chat.deepseek.com'],
};
const aiCampaignSources = ['chatgpt', 'chatgpt.com', 'openai', 'perplexity', 'perplexity.ai', 'gemini', 'claude', 'grok', 'deepseek'];
const paidMediums = ['cpc', 'ppc', 'paid', 'paid_search', 'paidsearch', 'paid_social', 'paidsocial', 'cpm', 'display', 'retargeting', 'remarketing'];
const paidParams = ['gclid', 'dclid', 'gbraid', 'wbraid', 'yclid', 'msclkid'];
const attributionStorageKey = 'op2p_referral';
const attributionTtlMs = 30 * 60 * 1000;

function safeExternalOrigin(raw: string): string | undefined {
  try { const parsed = new URL(raw); return ['http:', 'https:'].includes(parsed.protocol) ? parsed.origin : undefined; } catch { return undefined; }
}
function removeAttribution() {
  delete window.__op2pReferral;
  try { sessionStorage.removeItem(attributionStorageKey); } catch { /* Storage may be unavailable. */ }
}
function readStoredAttribution(): Attribution | undefined {
  try {
    const value = JSON.parse(sessionStorage.getItem(attributionStorageKey) || 'null') as Attribution | null;
    if (value && Object.hasOwn(referralUrls, value.key) && Number.isFinite(value.last_seen_ms)) {
      if (Date.now() - value.last_seen_ms < attributionTtlMs) return value;
    }
    if (value) sessionStorage.removeItem(attributionStorageKey);
  } catch { /* Storage may be unavailable. */ }
  return undefined;
}
function classifySource(): RefKey {
  const params = new URLSearchParams(window.location.search);
  const source = (params.get('utm_source') || '').trim().toLowerCase();
  const medium = (params.get('utm_medium') || '').trim().toLowerCase();
  if (paidParams.some((key) => params.has(key)) || paidMediums.includes(medium)) return 'other';
  if ([...params.keys()].some((key) => key.toLowerCase().startsWith('utm_'))) {
    if (medium === 'organic' && ['google', 'google.com'].includes(source)) return 'google_organic';
    if (medium === 'organic' && ['yandex', 'yandex.ru', 'ya.ru'].includes(source)) return 'yandex_organic';
    if (medium === 'organic' && ['bing', 'bing.com'].includes(source)) return 'bing_organic';
    if (aiCampaignSources.includes(source) && ['', 'referral', 'ai', 'organic'].includes(medium)) return 'ai_referral';
    return 'other';
  }
  const origin = safeExternalOrigin(document.referrer);
  if (origin && new URL(origin).host !== window.location.host) {
    const host = new URL(origin).hostname;
    for (const key of Object.keys(hosts) as Array<Exclude<RefKey, 'other'>>) if (hosts[key].includes(host)) return key;
    return 'other';
  }
  return readStoredAttribution()?.key || 'other';
}
function touchAttribution(key: RefKey) {
  const value = { key, last_seen_ms: Date.now() };
  window.__op2pReferral = value;
  try { sessionStorage.setItem(attributionStorageKey, JSON.stringify(value)); } catch { /* Keep the selection in memory for this tab. */ }
  return value;
}
function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag(...args);
}
function pageLocation() { return `${window.location.origin}${window.location.pathname}`; }

export function PublicAnalytics() {
  const pathname = usePathname();
  const { consent } = useAnalyticsConsent();
  const previousLocation = useRef<string | null>(null);
  const [tagEnabled, setTagEnabled] = useState(false);
  const isProtectedRoute = ['/admin', '/dashboard', '/deposit', '/history', '/partnership', '/preview', '/profile', '/requests', '/requisites', '/support', '/zxc', '/transactions'].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  useEffect(() => {
    if (isProtectedRoute) {
      setTagEnabled(false);
      previousLocation.current = null;
      if (window.__op2pGtagInitialized) gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      return;
    }
    if (consent !== 'granted' || !validMeasurementId) {
      setTagEnabled(false);
      if (consent === 'denied') {
        removeAttribution();
        document.querySelectorAll<HTMLAnchorElement>('a[data-cta-destination="bot"]').forEach((anchor) => { anchor.href = referralUrls.other; });
        if (window.__op2pGtagInitialized) gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      }
      previousLocation.current = null;
      return;
    }

    const host = window.location.hostname.toLowerCase();
    const isProductionHost = host === 'p2pru.com' || host === 'www.p2pru.com';
    const idMatchesHost = isProductionHost ? measurementId === productionMeasurementId : measurementId !== productionMeasurementId;
    if (!idMatchesHost) return;

    if (!window.__op2pGtagInitialized) {
      gtag('js', new Date());
      gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      // Public routes emit one sanitized page_view below. Browser-history pageviews
      // must also be disabled in this GA4 stream to avoid Enhanced Measurement duplicates.
      gtag('config', measurementId, { send_page_view: false });
      window.__op2pGtagInitialized = true;
    } else {
      gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    }
    setTagEnabled(true);
  }, [consent, isProtectedRoute]);

  useEffect(() => {
    if (consent !== 'granted' || isProtectedRoute) return;
    let referral = readStoredAttribution()?.key;
    if (!referral) referral = classifySource();
    touchAttribution(referral);
    document.querySelectorAll<HTMLAnchorElement>('a[data-cta-destination="bot"]').forEach((anchor) => { anchor.href = referralUrls[referral]; });
  }, [pathname, consent, isProtectedRoute]);

  useEffect(() => {
    if (consent !== 'granted' || isProtectedRoute) return;
    let lastTouchMs = 0;
    const touch = () => {
      const now = Date.now();
      if (now - lastTouchMs < 60_000) return;
      lastTouchMs = now;
      const current = readStoredAttribution() || window.__op2pReferral;
      if (!current || now - current.last_seen_ms >= attributionTtlMs) {
        removeAttribution();
        return;
      }
      touchAttribution(current.key);
    };
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    for (const eventName of events) window.addEventListener(eventName, touch, { passive: true });
    return () => { for (const eventName of events) window.removeEventListener(eventName, touch); };
  }, [consent, isProtectedRoute]);

  useEffect(() => {
    if (consent !== 'granted' || !tagEnabled || isProtectedRoute) return;
    const sendPageView = (force = false) => {
      const location = pageLocation();
      if (!force && previousLocation.current === location) return;
      const referrer = previousLocation.current || safeExternalOrigin(document.referrer) || '';
      gtag('set', { page_location: location, page_referrer: referrer });
      gtag('event', 'page_view', { page_location: location, page_title: document.title, page_referrer: referrer, ref_key: window.__op2pReferral?.key || 'other' });
      previousLocation.current = location;
    };
    sendPageView();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) sendPageView(true);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [pathname, consent, tagEnabled, isProtectedRoute]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[data-cta-destination]');
      if (!anchor) return;
      const destinationType = anchor.dataset.ctaDestination;
      const placement = anchor.dataset.ctaPlacement;
      if (!['web', 'bot'].includes(destinationType || '') || !['header', 'footer', 'article', 'faq', 'hero', 'methods', 'auth'].includes(placement || '')) return;
      if (isProtectedRoute) return;

      if (consent !== 'granted') {
        if (destinationType === 'bot') anchor.href = referralUrls.other;
        return;
      }
      const referral = readStoredAttribution()?.key || classifySource();
      touchAttribution(referral);
      if (destinationType === 'bot') anchor.href = referralUrls[referral];
      if (!tagEnabled) return;
      const pageId = window.location.pathname.replace(/[^a-z0-9_/-]/gi, '').slice(0, 100) || '/';
      const destinationPath = destinationType === 'bot'
        ? 'telegram'
        : anchor.origin === window.location.origin ? anchor.pathname : 'external';
      gtag('event', 'cta_click', {
        page_id: pageId,
        placement,
        destination_type: destinationType,
        destination_path: destinationPath,
        ref_key: referral,
        ...(destinationType === 'bot' ? { site_channel: referral } : {}),
      });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [consent, tagEnabled, isProtectedRoute]);

  return tagEnabled ? <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} /> : null;
}
