// App Store link builder with Apple campaign attribution.
// pt = Apple provider token (same developer account as NoteWall and FaithWall, verified 2026-11-16:
// all three listings share App Store artist id 1854170675), ct = campaign name.
// Downloads per campaign appear in App Store Connect -> Analytics -> Sources -> Campaigns.
// Every App Store link on the site goes through appStoreUrl(). Do not hard-code the URL elsewhere.
// (apps.apple.com/account/subscriptions in the Terms of Use is Apple's own page, not our listing: leave it alone.)
export const APP_STORE_ID = '6781802080';
export const APP_STORE_BASE = `https://apps.apple.com/us/app/quran-verse-lock-screen/id${APP_STORE_ID}`;
export const APPLE_PROVIDER_TOKEN = '128303795';

/** Page-type campaign names. Keep every ct at 40 characters or fewer. */
export const CAMPAIGNS = {
  home: 'qw-web-home',
  nav: 'qw-web-nav',
  footer: 'qw-web-footer',
  blog: 'qw-web-blog',
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
 * App Store URL tagged with a campaign token so installs can be attributed per page type.
 * Pure and deterministic (safe for SSR).
 */
export function appStoreUrl(campaign: string): string {
  const ct = campaign
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return `${APP_STORE_BASE}?pt=${APPLE_PROVIDER_TOKEN}&ct=${ct}&mt=8`;
}
