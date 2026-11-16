/**
 * Compares src/data/facts.json with the live US App Store listing (iTunes lookup API, public data).
 * Ported from the FaithWall gate; the QuranWall facts are the ones in src/data/facts.json.
 *
 *   node scripts/check-facts.mjs     print a short diff, and rewrite facts.json rating.* when, and only when,
 *                                    the 1-decimal rating value or rating.show flips
 *
 * Writes rating.* only (value as a 1-decimal string, count, asOf, show = value >= 4.5 && count >= 20).
 * Never touches storeName, minIOS or anything else: copy depends on those, so a human decides.
 *
 * Exit codes: 0 = in sync (or only the rating moved), 1 = lookup failed or has no averageUserRating,
 *             2 = trackName differs from storeName or minimumOsVersion differs from minIOS.
 *
 * No dependencies. Node 18+.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FACTS_PATH = process.env.FACTS_PATH || join(dirname(fileURLToPath(import.meta.url)), '..', 'src/data/facts.json');
const facts = JSON.parse(readFileSync(FACTS_PATH, 'utf8'));

const country = facts.rating?.storefront || 'us';
const url = `https://itunes.apple.com/lookup?id=${facts.appId}&country=${country}`;

let app;
try {
  const res = await fetch(url, { headers: { 'User-Agent': 'quranwall-check-facts' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  app = (await res.json()).results?.[0];
  if (!app) throw new Error('no result for this app id/storefront');
} catch (e) {
  console.error(`check-facts: lookup failed (${e.message})`);
  process.exit(1);
}

// averageUserRating is absent until the listing has ratings; Number(undefined) is NaN, which must never be written.
const rawRating = app.averageUserRating;
if (rawRating === undefined || rawRating === null || !Number.isFinite(Number(rawRating))) {
  console.error('check-facts: lookup returned no averageUserRating (nothing written)');
  process.exit(1);
}

const liveValue = (Math.round(Number(rawRating) * 10) / 10).toFixed(1);
const liveCount = Number(app.userRatingCount) || 0;
const liveShow = Number(liveValue) >= 4.5 && liveCount >= 20;

const rows = [
  ['storeName', facts.storeName, app.trackName, 'human'],
  ['minIOS', facts.minIOS, app.minimumOsVersion, 'human'],
  ['rating.value', facts.rating.value, liveValue, 'rating'],
  ['rating.count', String(facts.rating.count), String(liveCount), 'info'],
  ['rating.show', String(facts.rating.show), String(liveShow), 'rating'],
];

let needsHuman = false;
let ratingFlipped = false;
const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad('field', 14)} ${pad('facts.json', 26)} ${pad('App Store (' + country + ')', 26)} status`);
for (const [field, ours, live, kind] of rows) {
  let status = 'ok';
  if (ours !== live) {
    if (kind === 'human') { status = 'DIFFERS (needs a human)'; needsHuman = true; }
    else if (kind === 'rating') { status = 'DIFFERS (rating flipped)'; ratingFlipped = true; }
    else status = 'moved (no rewrite)';
  }
  console.log(`${pad(field, 14)} ${pad(ours, 26)} ${pad(live, 26)} ${status}`);
}

if (ratingFlipped) {
  facts.rating.value = liveValue;
  facts.rating.count = liveCount;
  facts.rating.asOf = new Date().toISOString().slice(0, 10);
  facts.rating.show = liveShow;
  writeFileSync(FACTS_PATH, JSON.stringify(facts, null, 2) + '\n');
  console.log('\nfacts.json rating.* rewritten (value, count, asOf, show).');
} else {
  console.log('\nRating value and show unchanged: facts.json not touched.');
}

if (needsHuman) {
  console.log('\nstoreName or minIOS differ from the live listing: copy depends on them, so a human decides.');
  process.exit(2);
}
