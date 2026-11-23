# seo-log — the SEO machine's log

Written only by the scheduled tasks: the weekly refresh (`NN-weekly-seo-refresh-YYYY-MM-DD.md`) and the merge gate (`NN-merge-gate-YYYY-MM-DD.md`). Karol's own journal is `docs/`, and the machine never writes there (`CLAUDE.md`). Manual sessions write to `docs/journal`.

Public repo: words and positions only. No Search Console clicks, impressions or CTR, and no App Store Connect or RevenueCat numbers. The numbers stay in the private reports outside the repo.

Append-only. The next number is the highest NN here plus 1. Corrections go in a new entry.

## Status (2026-11-23)
The weekly refresh set the Search Console baseline. The data is thin and arrived during the November 2026 core update, so nothing was re-ranked on it. Most sitemap URLs are now indexed, including /features and the money posts; the dhikr-reminders post is crawled but not indexed, and p25 is queued for it. Seven new items (p20-p26) were queued and p16/p19 pulled forward, so eight items are eligible. Pipeline healthy; the next refresh runs Monday 2026-11-30.

## Index
- [01 - Merge gate, 2026-11-18](01-merge-gate-2026-11-18.md): p9 comparison merged (`ed5cf7a`), all gates passed, 2:152 verified
- [02 - Merge gate, 2026-11-19](02-merge-gate-2026-11-19.md): p10 internal links merged (`e91af8d`), all gates passed, 17:78 CHECK resolved by hand
- [03 - Merge gate, 2026-11-20](03-merge-gate-2026-11-20.md): p11 answer-first passages on Home and /features merged (`da5c66e`), all gates passed, no verses touched
- [04 - Merge gate, 2026-11-21](04-merge-gate-2026-11-21.md): p12 roundup refresh quarantined (`lint-facts --dist` social-proof on competitor head counts), 13:28 verified, gate note added to p12
- [05 - Merge gate, 2026-11-22](05-merge-gate-2026-11-22.md): p12 roundup refresh merged on the second attempt (`b212dfe`), all gates passed, 13:28 verified, listings re-checked
- [06 - Weekly SEO refresh, 2026-11-23](06-weekly-seo-refresh-2026-11-23.md): Search Console baseline set (thin, inside the core update), indexing mostly done, p20-p26 queued, 8 eligible
