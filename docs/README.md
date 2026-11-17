# docs — QuranWall site working notes

Public repo: qualitative only, never raw Search Console numbers.

## Status (2026-11-17)
**2026-11-17 (journal 04):** the internal-link and SEO/GEO pass is live (`3c7c459`):
- every post links the next 3 guides in cluster order, plus its `/blog` cluster;
- `/blog` lists all posts by cluster, and the footer links every post in cluster columns;
- breadcrumbs on every page;
- 3–4 in-body links per post and answer-first openings;
- titles of 65 characters or fewer;
- `llms.txt` Guides generated at build.

`node scripts/link-graph.mjs --dist dist --base https://quranwall.com` (shared tool, sha256 prefix `ba7513f71128`) must exit 0 before a push, and `--live` after.

**2026-11-17 (journal 03):** FaithWall's verified round-3 findings are live (`eeba4a2`, one push). The posts, install cards, manifest and nav now say what the iOS app does: Arabic *or* a translation, a wallpaper that changes only when you pick an ayah in the app, and a widget that rotates only after you turn on auto-rotate. The new lint rules `arabic-beside-translation` and `wallpaper-automatic` fail the old claims (self-test 192 cases). SEO-STRATEGY marks audio and the listing's claims "DISPUTED (TODO Q7)". The keyword engine is on 1.2.0. The autopilot's p8 depth pass was merged with it.

**Handover (session closed late 2026-11-16):** what is open, what waits on Karol and the dates to watch are in the last section of journal 01, "Handover".

The SEO machine was set up today (journal 01), ported from FaithWall and NoteWall:
- `quranwall-seo-autopilot-local` (daily 07:30) works `src/data/seo-priorities.json`
- `quranwall-merge-bot` (daily 11:15) verifies and merges `claude/*` branches
- `quranwall-seo-refresh` (Monday 11:45) pulls Search Console and re-ranks the queue

Direction lives in `SEO-STRATEGY.md` and human-only tasks in `TODO-KAROL.md`.
- **Search Console and Bing are connected (2026-11-16):** `sc-domain:quranwall.com` is verified by a TXT record at Porkbun (keep it), the service account reads it, and the sitemap is submitted to both Google and Bing. Data starts after Google's backfill. Monday 2026-11-23 is the first refresh with data, and it sets the baseline. Until then the queue is ranked on site, listing and SERP research.
- **Queue:** strategy v3 (2026-11-16, applying the FaithWall review). Done by hand on 2026-11-16: verse accuracy, stats, listing facts site-wide, one structured-data source, a real 404 and home links to the money pages (p1–p4, p6, p7). p5, the social proof, waits until 2026-11-23 for Karol's answer. Outreach is retired, and p17 (Ramadan readiness) is eligible from 2026-12-15. Then depth passes and internal links.
- **Indexing:** only the home page is indexed so far. `npm run gsc-inspect` checks every sitemap URL, and the Monday refresh reads it. Request Indexing for the money posts is in `TODO-KAROL.md`.
- **Install attribution:** every App Store link carries `ct=qw-web-<type>`. The fixed list lives in `src/lib/app-store.ts`, capped at 30 characters; posts add the `-mid`, `-end` and `-sticky` placements, and there are `smart-banner` and `handoff` tokens. Karol reads Campaigns monthly in App Store Connect.
- **Facts and gates (2026-11-16):** product facts live in `src/data/facts.json`. `npm run lint-facts` (`--diff`, `--dist`, `--prompts`, `--all`) and `npm run check-facts` guard them, and the merge bot blocks on a FAIL. Since late 2026-11-16 they also fail setup-time claims, "Premium" as a plan name, user counts (only "Downloaded <`downloadsFloor`> times" and "<`downloadsFloor`> downloads" pass) and any contact email that differs from `facts.json`; the live p5 social-proof strings are WARN until 2026-11-23 and FAIL from then. The round-2 check (`a34c536`) added counts written in words, any download count but the floor, "Premium Plan" and set-it-up phrasings. The round-3 check (2026-11-16, night) added k/m counts, install counts (all fail, the floor included), tens and hundreds in words, more setup and plan-name phrasings. `npm run lint-facts -- --self-test` (192 cases since 2026-11-17) must stay green. `public/llms.txt` follows the app (Arabic *or* a translation, no automatic wallpaper change) until Karol answers TODO question 7.
- **Homepage redesign (2026-11-16, journal 02):** merged to main and live the same night (`1eb4f88`, review fixes `6c7f69c`). Coded phone mockups, a features bento and a section pass; no pricing anywhere on the site (new `pricing-mention` lint rule; the machine files keep one factual line); a hero that fits the viewport and shows the real flow (pick an ayah, tap Make It Mine, the Shortcuts app sets the Lock Screen wallpaper). Read from the iOS source: the wallpaper never changes by itself (only the widget auto-rotates) and it shows Arabic *or* a translation, so the doctrine's "Arabic beside a translation" and "new ayah each day" claims need Karol's decision. The three scheduled-task prompts now carry the no-pricing wording (`lint-facts --prompts` 0 FAIL).
- **Keyword engine (2026-11-16, 1.2.0 since 2026-11-17, sha256 prefix `77ac7c15b5d1`):** `npm run kw` is the script shared with FaithWall and NoteWall, copied byte for byte. Its settings are in `src/data/kw-config.json`, the cluster map in `src/data/keyword-clusters.json`, and the rubric and run notes in `keyword-research/`. The Monday refresh runs it locally; autocomplete comes only through `kw expand`, at 15 requests a day.
- **Languages (2026-11-16):** English only. Turkish has a gate, not a date: queue item p18 is checked weekly from 2026-12-15 and goes when the indexing, reviewer and quote-policy conditions all hold; the pilot then runs by hand with Karol's reviewer. Translation rights in the app are a decision for Karol (`TODO-KAROL.md`).

## Journal
Append-only, one entry per manual session; next number = highest + 1. The SEO machine (merge gate, weekly refresh) logs to `seo-log/` instead and never writes in `docs/` (CLAUDE.md); its status and index are in `seo-log/README.md`.

- [01 — SEO machine setup, 2026-11-16](journal/01-seo-machine-setup-2026-11-16.md): ported the FaithWall/NoteWall pipeline (strategy, queue, Search Console script, campaign tokens, three scheduled tasks); Search Console and Bing connected the same day; the FaithWall review applied in the evening (`46b9109`, `961cfdc`); its install cards and fact gates at night (`26a756a`); the FaithWall verification round late at night (`3640fca`, `dde8b62`: setup-time and Premium copy out, tighter gates, the Turkish gate); its review (`2cf47e8`: the EULA describes QuranWall, four more lint gaps closed); the round-2 check (`a34c536`: five more lint gaps, `--self-test`); the round-3 check (`1f28292`: more lint gaps, llms.txt follows the app, TODO question 7 and the website-quotes licence line); the shared keyword engine (`8eeff78`); the product-fact answers are with Karol.
- [02 — Homepage redesign, 2026-11-16](journal/02-homepage-redesign-2026-11-16.md): hero phone mockup built in code, six-tile features bento, section pass (round 1); no pricing on the site, viewport-fit hero, How it works (round 2); the app's real flow and limits read from the iOS source, hero and copy made truthful, dry-run merge with main (round 3); merged after an 8-agent review, live, prompts updated.
- [03 — Verified fixes and keyword engine 1.2.0, 2026-11-17](journal/03-verified-fixes-engine-120-2026-11-17.md): the wallpaper and translation copy fixed on six posts, their install cards, the manifest and the nav (`e91e8e5`); new lint rules (`a9f8a3e`); doctrine and TODO question 7 (`c582e3c`); engine 1.2.0 (`a7eb67d`); regex families (`c29e20b`); p8 merged (`558ef9f`); live as `eeba4a2`. Includes the iOS caller trace (file:line) and the corrections to journal 01.
- [04 — Internal links and SEO/GEO pass, 2026-11-17](journal/04-internal-links-geo-pass-2026-11-17.md): link-graph 1.0.0; related block, hub, footer cluster columns, breadcrumbs, in-body links, answer-first openings, shorter titles, generated llms.txt Guides (`f9e9b6c`, live as `3c7c459`); before/after table; the footer-template caveat on the median.
