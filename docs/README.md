# docs — QuranWall site working notes

Public repo: qualitative only, never raw Search Console numbers.

## Status (2026-11-16)
The SEO machine was set up today (journal 01), ported from FaithWall and NoteWall:
- `quranwall-seo-autopilot-local` (daily 07:30) works `src/data/seo-priorities.json`
- `quranwall-merge-bot` (daily 11:15) verifies and merges `claude/*` branches
- `quranwall-seo-refresh` (Monday 11:45) pulls Search Console and re-ranks the queue

Direction lives in `SEO-STRATEGY.md` and human-only tasks in `TODO-KAROL.md`.
- **Search Console and Bing are connected (2026-11-16):** `sc-domain:quranwall.com` is verified by a TXT record at Porkbun (keep it), the service account reads it, and the sitemap is submitted to both Google and Bing. Data starts after Google's backfill. Monday 2026-11-23 is the first refresh with data, and it sets the baseline. Until then the queue is ranked on site, listing and SERP research.
- **Queue:** correctness items first. p1 makes verse quotes match a named translation and p2 fixes stats. p3–p5 cover the "free" wording and unverifiable social proof; they wait until 2026-11-23 for Karol's answers. Then depth passes, internal links and off-site work.
- **Install attribution:** every App Store link carries `ct=qw-web-<type>`. Read it monthly in App Store Connect.

## Journal
Append-only, one entry per session, merge gate or weekly refresh; next number = highest + 1.

- [01 — SEO machine setup, 2026-11-16](journal/01-seo-machine-setup-2026-11-16.md): ported the FaithWall/NoteWall pipeline (strategy, queue, Search Console script, campaign tokens, three scheduled tasks); Search Console and Bing connected the same day; the product-fact answers are with Karol.
