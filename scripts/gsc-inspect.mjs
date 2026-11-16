// URL Inspection for every URL in the live sitemap: is Google indexing quranwall.com's pages?
// Usage: npm run gsc-inspect -- ~/.claude/quranwall-gsc/inspect-YYYY-MM-DD.csv
// Property defaults to sc-domain:quranwall.com; override with GSC_PROPERTY.
// Output is a local CSV for the weekly refresh, written ONLY to the path given (default: today's file under
// ~/.claude/quranwall-gsc/). It refuses a path inside the repo: this repo is public, never commit it.
// A non-JSON or error reply for a URL becomes an ERR row (coverageState = "ERR:<message>") instead of a crash;
// the exit code is 1 when every row is an ERR row. The key file's contents are never printed, and no
// click or impression numbers are fetched or printed.
// The API allows about 2,000 inspections a day per property; this uses one per sitemap URL.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { homedir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  '/Users/carly/GITHUB REPOS/karchi/scripts/service-account-key.json';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const PROPERTY = process.env.GSC_PROPERTY ?? 'sc-domain:quranwall.com';
const SITEMAP = process.env.SITEMAP_URL ?? 'https://quranwall.com/sitemap.xml';
const today = new Date().toISOString().slice(0, 10);
const OUT = resolve(process.argv[2] ?? join(homedir(), '.claude', 'quranwall-gsc', `inspect-${today}.csv`));

if (OUT === ROOT || OUT.startsWith(ROOT + sep)) {
  console.error('gsc-inspect: refusing to write inside the repo (public). Pass a path under ~/.claude/quranwall-gsc/.');
  process.exit(1);
}
if (!existsSync(dirname(OUT))) {
  console.error(`gsc-inspect: output directory does not exist: ${dirname(OUT)}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Parse a fetch Response as JSON; a non-JSON body becomes an error object instead of a throw. */
async function jsonOrErr(res) {
  try {
    return await res.json();
  } catch {
    return { error: { code: res.status, message: `non-JSON response (HTTP ${res.status})` } };
  }
}

// ---- auth (service account JWT; nothing from the key file is ever printed)
let access_token;
try {
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
  const tok = await jsonOrErr(tokRes);
  access_token = tok.access_token;
  if (!access_token) {
    console.error(`gsc-inspect: token error: ${tok.error_description || tok.error?.message || tok.error || 'no access_token'}`);
    process.exit(1);
  }
} catch (e) {
  console.error(`gsc-inspect: auth failed (${e.code || e.name}); key file ${existsSync(KEY_PATH) ? 'found but unusable' : 'not found'}`);
  process.exit(1);
}

let xml;
try {
  const sm = await fetch(SITEMAP);
  if (!sm.ok) throw new Error(`HTTP ${sm.status}`);
  xml = await sm.text();
} catch (e) {
  console.error(`gsc-inspect: cannot fetch ${SITEMAP} (${e.message})`);
  process.exit(1);
}
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!urls.length) {
  console.error(`gsc-inspect: no <loc> entries in ${SITEMAP}`);
  process.exit(1);
}

const cols = ['url', 'coverageState', 'verdict', 'indexingState', 'pageFetchState', 'robotsTxtState', 'lastCrawlTime', 'googleCanonical', 'userCanonical'];
const csv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows = [cols.join(',')];
const tally = {};
let errRows = 0;
for (const url of urls) {
  let j;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY }),
      });
      j = await jsonOrErr(r);
      if (!j.error && !r.ok) j = { error: { code: r.status, message: `HTTP ${r.status}` } };
    } catch (e) {
      j = { error: { code: 0, message: `request failed (${e.name})` } };
    }
    const code = j.error?.code;
    if (j.error && (code === 429 || code >= 500) && attempt < 2) { await sleep(5000); continue; }
    break;
  }
  const x = j.inspectionResult?.indexStatusResult;
  if (j.error || !x) {
    errRows += 1;
    const msg = (j.error?.message || 'no inspection result').replace(/\s+/g, ' ').slice(0, 160);
    const state = `ERR:${msg}`;
    rows.push([url, state, '', '', '', '', '', '', ''].map(csv).join(','));
    tally[state] = (tally[state] ?? 0) + 1;
    continue;
  }
  rows.push([url, x.coverageState, x.verdict, x.indexingState, x.pageFetchState, x.robotsTxtState, x.lastCrawlTime, x.googleCanonical, x.userCanonical].map(csv).join(','));
  tally[x.coverageState ?? 'unknown'] = (tally[x.coverageState ?? 'unknown'] ?? 0) + 1;
}
writeFileSync(OUT, rows.join('\n') + '\n');
console.log(`inspected ${urls.length} URLs -> ${OUT}`);
for (const [state, n] of Object.entries(tally)) console.log(`  ${n}  ${state}`);
if (errRows === urls.length) {
  console.error('gsc-inspect: every row is an ERR row (see coverageState in the CSV); exiting 1.');
  process.exit(1);
}
