'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { referralUrls, type RefKey } from '@/features/content/referrals';

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
const storageAllowed = process.env.NEXT_PUBLIC_ANALYTICS_STORAGE_ALLOWED === 'true';

function safeExternalOrigin(raw: string): string | undefined {
  try { const parsed = new URL(raw); return ['http:', 'https:'].includes(parsed.protocol) ? parsed.origin : undefined; } catch { return undefined; }
}
function classifySource(includeReferrer = true, includeCampaign = true): RefKey {
  const params = new URLSearchParams(window.location.search);
  const source = (params.get('utm_source') || '').trim().toLowerCase();
  const medium = (params.get('utm_medium') || '').trim().toLowerCase();
  if (includeCampaign && (paidParams.some((key) => params.has(key)) || paidMediums.includes(medium))) return 'other';
  if (includeCampaign && [...params.keys()].some((key) => key.toLowerCase().startsWith('utm_'))) {
    if (medium === 'organic' && ['google', 'google.com'].includes(source)) return 'google_organic';
    if (medium === 'organic' && ['yandex', 'yandex.ru', 'ya.ru'].includes(source)) return 'yandex_organic';
    if (medium === 'organic' && ['bing', 'bing.com'].includes(source)) return 'bing_organic';
    if (aiCampaignSources.includes(source) && ['', 'referral', 'ai', 'organic'].includes(medium)) return 'ai_referral';
    return 'other';
  }
  if (includeReferrer) {
    const origin = safeExternalOrigin(document.referrer);
    if (origin && new URL(origin).host !== window.location.host) {
      const host = new URL(origin).hostname;
      for (const key of Object.keys(hosts) as Array<Exclude<RefKey, 'other'>>) if (hosts[key].includes(host)) return key;
      return 'other';
    }
  }
  const previous = window.__op2pReferral || readStoredAttribution();
  if (previous && Date.now() - previous.last_seen_ms < 30 * 60 * 1000) return previous.key;
  return 'other';
}
function readStoredAttribution(): Attribution | undefined {
  if (!storageAllowed) return undefined;
  try {
    const value = JSON.parse(sessionStorage.getItem('op2p_referral') || 'null') as Attribution | null;
    if (value && Object.hasOwn(referralUrls, value.key) && Number.isFinite(value.last_seen_ms) && Date.now() - value.last_seen_ms < 30 * 60 * 1000) return value;
  } catch { /* Storage may be unavailable. */ }
  return undefined;
}
function rememberAttribution(key: RefKey) {
  const value = { key, last_seen_ms: Date.now() };
  window.__op2pReferral = value;
  if (storageAllowed) try { sessionStorage.setItem('op2p_referral', JSON.stringify(value)); } catch { /* Keep the in-memory selection. */ }
}
function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function (...items: unknown[]) { window.dataLayer.push(items); };
  window.gtag(...args);
}
function pageLocation() { return `${window.location.origin}${window.location.pathname}`; }

export function PublicAnalytics() {
  const pathname = usePathname();
  const attributionInitialized = useRef(false);
  const previousLocation = useRef<string | null>(null);
  const [tagEnabled, setTagEnabled] = useState(false);

  useEffect(() => {
    if (!validMeasurementId) return;
    const host = window.location.hostname.toLowerCase();
    const isProductionHost = host === 'p2pru.com' || host === 'www.p2pru.com';
    const idMatchesHost = isProductionHost
      ? measurementId === productionMeasurementId
      : measurementId !== productionMeasurementId;
    setTagEnabled(idMatchesHost);
  }, []);

  useEffect(() => {
    if (!attributionInitialized.current) {
      const referral = classifySource();
      rememberAttribution(referral);
      attributionInitialized.current = true;
    }
    const previous = window.__op2pReferral;
    const expired = previous && Date.now() - previous.last_seen_ms >= 30 * 60 * 1000;
    const referral = expired ? classifySource(false, false) : (previous?.key || 'other');
    rememberAttribution(referral);
    document.querySelectorAll<HTMLAnchorElement>('[data-cta-destination="bot"]').forEach((anchor) => { anchor.href = referralUrls[referral]; });
    const location = pageLocation();
    const referrer = previousLocation.current || safeExternalOrigin(document.referrer) || '';
    if (!tagEnabled) return;
    if (!window.__op2pGtagInitialized) {
      gtag('js', new Date());
      gtag('config', measurementId, { send_page_view: false, page_location: location, page_referrer: referrer });
      window.__op2pGtagInitialized = true;
    }
    if (previousLocation.current !== location) {
      gtag('set', { page_location: location, page_referrer: referrer });
      gtag('event', 'page_view', { page_location: location, page_title: document.title, page_referrer: referrer, send_to: measurementId });
    }
    previousLocation.current = location;
  }, [pathname, tagEnabled]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[data-cta-destination]');
      if (!anchor) return;
      const destinationType = anchor.dataset.ctaDestination;
      const placement = anchor.dataset.ctaPlacement;
      if (!['web', 'bot'].includes(destinationType || '') || !['header', 'footer', 'article', 'faq', 'hero', 'methods'].includes(placement || '')) return;
      const previous = window.__op2pReferral;
      const expired = previous && Date.now() - previous.last_seen_ms >= 30 * 60 * 1000;
      const referral = destinationType === 'bot' ? (expired ? classifySource(false, false) : (previous?.key || 'other')) : undefined;
      if (referral) { rememberAttribution(referral); anchor.href = referralUrls[referral]; }
      if (!tagEnabled) return;
      const pageId = window.location.pathname.replace(/[^a-z0-9_/-]/gi, '').slice(0, 100) || '/';
      const parameters = { page_id: pageId, placement, destination_type: destinationType, send_to: measurementId, ...(referral ? { site_channel: referral, ref_key: referral } : {}) };
      gtag('event', 'cta_click', parameters);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [tagEnabled]);

  return tagEnabled ? <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} /> : null;
}
