# docs — QuranWall site working notes

Public repo: qualitative only, never raw Search Console numbers.

## Status (2026-11-16)
The SEO machine was set up today (journal 01), ported from FaithWall and NoteWall:
- `quranwall-seo-autopilot-local` (daily 07:30) works `src/data/seo-priorities.json`
- `quranwall-merge-bot` (daily 11:15) verifies and merges `claude/*` branches
- `quranwall-seo-refresh` (Monday 11:45) pulls Search Console and re-ranks the queue

Direction lives in `SEO-STRATEGY.md` and human-only tasks in `TODO-KAROL.md`.
- **Search Console and Bing are connected (2026-11-16):** `sc-domain:quranwall.com` is verified by a TXT record at Porkbun (keep it), the service account reads it, and the sitemap is submitted to both Google and Bing. Data starts after Google's backfill. Monday 2026-11-23 is the first refresh with data, and it sets the baseline. Until then the queue is ranked on site, listing and SERP research.
- **Queue:** strategy v3 (2026-11-16, applying the FaithWall review). Done by hand on 2026-11-16: verse accuracy, stats, listing facts site-wide, one structured-data source, a real 404 and home links to the money pages (p1–p4, p6, p7). p5, the social proof, waits until 2026-11-23 for Karol's answer. Outreach is retired, and p17 (Ramadan readiness) is eligible from 2026-12-15. Then depth passes and internal links.
- **Indexing:** only the home page is indexed so far. `npm run gsc-inspect` checks every sitemap URL, and the Monday refresh reads it. Request Indexing for the money posts is in `TODO-KAROL.md`.
- **Install attribution:** every App Store link carries `ct=qw-web-<type>`. The fixed list lives in `src/lib/app-store.ts`, capped at 30 characters; posts add the `-mid`, `-end` and `-sticky` placements, and there are `smart-banner` and `handoff` tokens. Karol reads Campaigns monthly in App Store Connect.
- **Facts and gates (2026-11-16):** product facts live in `src/data/facts.json`. `npm run lint-facts` (`--diff`, `--dist`, `--prompts`, `--all`) and `npm run check-facts` guard them, and the merge bot blocks on a FAIL.
- **Homepage redesign (2026-11-16, journal 02):** on branch `design/homepage-v2` (worktree `../quranwall-website-home`), not merged: coded phone mockups with the app's real Lock Screen UI in the hero, a features bento, and a design pass on the other home sections. Verses in mockups come only from `src/data/showcaseVerses.ts` (checked on quran.com).

## Journal
Append-only, one entry per session, merge gate or weekly refresh; next number = highest + 1.

- [01 — SEO machine setup, 2026-11-16](journal/01-seo-machine-setup-2026-11-16.md): ported the FaithWall/NoteWall pipeline (strategy, queue, Search Console script, campaign tokens, three scheduled tasks); Search Console and Bing connected the same day; the FaithWall review applied in the evening (`46b9109`, `961cfdc`) and its install cards and fact gates at night (`26a756a`); the product-fact answers are with Karol.
- [02 — Homepage redesign, 2026-11-16](journal/02-homepage-redesign-2026-11-16.md): hero phone mockup built in code (Lock Screen + widget), six-tile features bento, section pass; verses from quran.com, fonts from the app; waits for merge.
