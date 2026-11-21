# seo-log — the SEO machine's log

Written only by the scheduled tasks: the weekly refresh (`NN-weekly-seo-refresh-YYYY-MM-DD.md`) and the merge gate (`NN-merge-gate-YYYY-MM-DD.md`). Karol's own journal is `docs/`, and the machine never writes there (`CLAUDE.md`). Manual sessions write to `docs/journal`.

Public repo: words and positions only. No Search Console clicks, impressions or CTR, and no App Store Connect or RevenueCat numbers. The numbers stay in the private reports outside the repo.

Append-only. The next number is the highest NN here plus 1. Corrections go in a new entry.

## Status (2026-11-21)
Pipeline healthy, not stalled. The merge gate quarantined p12 (the best-Muslim-app roundup refresh, tag `rejected/best-muslim-app-for-iphone-2026-e80b900`): `lint-facts --dist` failed social-proof on the four new competitor "rated 4.x by N people" lines. Everything else passed, and the ratings match the live listings. p12 stays pending, with a gate note telling the autopilot to drop the people counts and run `--dist` before pushing. No branch is waiting, so the autopilot runs again tomorrow. Karol has one lint decision in TODO-KAROL.md (whether competitor paragraphs should be exempt in `--dist`). The weekly refresh runs Monday 2026-11-23.

## Index
- [01 - Merge gate, 2026-11-18](01-merge-gate-2026-11-18.md): p9 comparison merged (`ed5cf7a`), all gates passed, 2:152 verified
- [02 - Merge gate, 2026-11-19](02-merge-gate-2026-11-19.md): p10 internal links merged (`e91af8d`), all gates passed, 17:78 CHECK resolved by hand
- [03 - Merge gate, 2026-11-20](03-merge-gate-2026-11-20.md): p11 answer-first passages on Home and /features merged (`da5c66e`), all gates passed, no verses touched
- [04 - Merge gate, 2026-11-21](04-merge-gate-2026-11-21.md): p12 roundup refresh quarantined (`lint-facts --dist` social-proof on competitor head counts), 13:28 verified, gate note added to p12
