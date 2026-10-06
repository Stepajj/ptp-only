import referralConfig from '@/config/website-referrals.json';

export type RefKey = (typeof referralConfig.entries)[number]['key'];
export const referralUrls = Object.fromEntries(referralConfig.entries.map((entry) => [entry.key, entry.url])) as Record<RefKey, string>;
export const fallbackReferralUrl = referralUrls[referralConfig.default_key];
