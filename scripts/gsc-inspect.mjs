// URL Inspection for every URL in the live sitemap: is Google indexing quranwall.com's pages?
// Usage: npm run gsc-inspect -- ~/.claude/quranwall-gsc/inspect-YYYY-MM-DD.csv
// Property defaults to sc-domain:quranwall.com; override with GSC_PROPERTY.
// Output is a local CSV for the weekly refresh. Never commit it (this repo is public).
// The API allows about 2,000 inspections a day per property; this uses one per sitemap URL.
import { readFileSync, writeFileSync } from 'node:fs';
import { createSign } from 'node:crypto';

const KEY_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  '/Users/carly/GITHUB REPOS/karchi/scripts/service-account-key.json';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const OUT = process.argv[2] ?? 'gsc-inspect.csv';
const PROPERTY = process.env.GSC_PROPERTY ?? 'sc-domain:quranwall.com';
const SITEMAP = process.env.SITEMAP_URL ?? 'https://quranwall.com/sitemap.xml';

const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = b64url({ alg: 'RS256', typ: 'JWT' });
const claims = b64url({ iss: key.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
const s = createSign('RSA-SHA256');
s.update(`${header}.${claims}`);
const jwt = `${header}.${claims}.${s.sign(key.private_key).toString('base64url')}`;
const tokRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
});
const { access_token } = await tokRes.json();
if (!access_token) throw new Error('no token');

const xml = await (await fetch(SITEMAP)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!urls.length) throw new Error(`no <loc> entries in ${SITEMAP}`);

const cols = ['url', 'coverageState', 'verdict', 'indexingState', 'pageFetchState', 'robotsTxtState', 'lastCrawlTime', 'googleCanonical', 'userCanonical'];
const csv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows = [cols.join(',')];
const tally = {};
for (const url of urls) {
  const r = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`inspect ${url}: HTTP ${r.status} ${j.error?.message ?? ''}`);
  const x = j.inspectionResult?.indexStatusResult ?? {};
  rows.push([url, x.coverageState, x.verdict, x.indexingState, x.pageFetchState, x.robotsTxtState, x.lastCrawlTime, x.googleCanonical, x.userCanonical].map(csv).join(','));
  tally[x.coverageState ?? 'unknown'] = (tally[x.coverageState ?? 'unknown'] ?? 0) + 1;
}
writeFileSync(OUT, rows.join('\n') + '\n');
console.log(`inspected ${urls.length} URLs -> ${OUT}`);
for (const [state, n] of Object.entries(tally)) console.log(`  ${n}  ${state}`);
