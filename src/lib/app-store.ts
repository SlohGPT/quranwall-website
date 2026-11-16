// App Store link builder with Apple campaign attribution.
// pt = Apple provider token (same developer account as NoteWall and FaithWall, verified 2026-11-16:
// all three listings share App Store artist id 1854170675), ct = campaign name.
// Downloads per campaign appear in App Store Connect -> Analytics -> Sources -> Campaigns.
// Every App Store link on the site goes through appStoreUrl(). Do not hard-code the URL elsewhere.
// (apps.apple.com/account/subscriptions in the Terms of Use is Apple's own page, not our listing: leave it alone.)
import facts from '../data/facts.json';

export const APP_STORE_ID = facts.appId;
export const APP_STORE_BASE = facts.storeUrl;
export const APPLE_PROVIDER_TOKEN = facts.providerToken;

/** Apple's campaign token limit (developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links). */
const MAX_CT_LENGTH = 30;

/**
 * Campaign names: a fixed list, never per post. Apple shows a campaign only with 5+ first-time downloads
 * in the date range, so tokens stay coarse. `blog` is an in-body markdown link to the app inside a post
 * (BlogRenderer rebuilds it in code); the install cards and the sticky bar carry their own placement token. scripts/lint-facts.mjs reads this list.
 */
export const CAMPAIGNS = {
  home: 'qw-web-home',
  nav: 'qw-web-nav',
  footer: 'qw-web-footer',
  blog: 'qw-web-blog',
  blogMid: 'qw-web-blog-mid',
  blogEnd: 'qw-web-blog-end',
  blogSticky: 'qw-web-blog-sticky',
  smartBanner: 'qw-web-smart-banner',
  handoff: 'qw-web-handoff',
  pillar: 'qw-web-pillar',
  compare: 'qw-web-compare',
  about: 'qw-web-about',
  features: 'qw-web-features',
  pricing: 'qw-web-pricing',
  // Machine-readable files cannot import this module; they carry the literal URL.
  // public/llms.txt uses `llms`; public/pricing.md shares `pricing` with the Pricing section.
  llms: 'qw-web-llms',
} as const;

/**
 * Short App Store link for the desktop handoff (QR code and "Copy link"). Apple answers it with a 301 to the
 * US listing and keeps pt and ct (checked 2026-11-16). The same URL is encoded in public/qr/web-handoff.svg.
 */
export const HANDOFF_URL = `https://apps.apple.com/app/id${APP_STORE_ID}?pt=${APPLE_PROVIDER_TOKEN}&ct=${CAMPAIGNS.handoff}&mt=8`;

/**
 * App Store URL tagged with a campaign token so installs can be attributed per page type and placement.
 * Pure and deterministic (safe for SSR). A token longer than 30 characters throws while building or
 * developing (so it is caught before shipping) and is cut to 30 in the browser.
 */
export function appStoreUrl(campaign: string): string {
  let ct = campaign
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  if (ct.length > MAX_CT_LENGTH) {
    if (import.meta.env.SSR || import.meta.env.DEV) {
      throw new Error(`App Store campaign token "${ct}" is longer than ${MAX_CT_LENGTH} characters`);
    }
    ct = ct.slice(0, MAX_CT_LENGTH).replace(/-+$/, '');
  }
  return `${APP_STORE_BASE}?pt=${APPLE_PROVIDER_TOKEN}&ct=${ct}&mt=8`;
}
