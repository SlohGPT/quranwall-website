# 06 - Weekly SEO refresh, 2026-11-23

Public repo: words and positions only. The numbers are in the local report (~/.claude/quranwall-gsc/weekly-report-2026-11-23.md).

## Ask
Scheduled task `quranwall-seo-refresh` (Mondays 11:45, local, the only part of the pipeline with Search Console access). It measures what the autopilot and Karol's manual posts did, checks indexing, facts and Google changes, runs the keyword engine and a research pass, and then re-aims the queue so that at least eight items are eligible.

## Found
- **Preconditions.** The repo was on `main`, clean and up to date. No weekly refresh had run in the last five days. The foundation files were present, and no `claude/*` autopilot branch was waiting, so there was no merge to simulate.
- **Search Console works. This run sets the baseline.** Access was granted on 2026-11-16. Google backfilled only from mid-November, so the 28-day window holds a few days of data and the earlier window is empty.
  - Only three pages show up: the home page near the top of the results, `/blog/best-islamic-lock-screen-app-iphone` around mid page 1, and `/blog/quran-verse-iphone-lock-screen` deep in the results.
  - No query rows are visible yet (Google hides rare queries), so the brand query cannot be read.
  - There are no Google Images rows.
  - All of it sits inside the November 2026 core update rollout. Nothing was re-ranked on it.
- **Indexing moved a lot in a week.** Most sitemap URLs are now indexed, including `/features`, `/support`, `/blog`, the About page and all three money posts. Most of those were unknown to Google or discovered-only on 2026-11-16.
  - `/blog/how-to-set-dhikr-reminders-iphone` went from unknown to crawled, not indexed. It is the only post in that state.
  - `/eula` is still discovered-only and `/privacy-policy` is still unknown. Both are legal pages with no search job.
  - The day-14 and day-28 reads of the one-time Request Indexing (from 2026-11-17) are due at the 2026-11-30 and 2026-12-14 runs. All four of those URLs are already indexed.
- **Effects.** No done item is 14 days old yet (the oldest closed on 2026-11-16), and a baseline run writes no effect notes. p9 can be read first, at the 2026-12-07 run.
- **Karol's manual posts.** None this week. The two `blog:` commits in the last eight days changed layout, not content. All eight published keywords are already blocked with `used_by`, so nothing needed reconciling and nothing was superseded.
- **Cannibalization.** Nothing can be read without query rows.
- **Fact drift.** `check-facts` shows the store name, minimum iOS and rating unchanged, so `facts.json` was not touched. The live listing matches the site on its name, iOS 15.0, free to download and the two ratings the roundups quote.
  - A grep for unconfirmed claims found only correct uses: iOS 16 is named only for the wallpaper and Lock Screen widgets, every Focus mention is Apple's own feature, and "premium" appears only in the Terms legal text, which is already in TODO-KAROL.md.
  - `lint-facts --all` and `--prompts` both report 0 FAIL and 0 WARN.
- **Keyword engine.**
  - `doctor`: OK.
  - `gsc` (re-run fresh): insufficient data, so no demand conclusion.
  - `geo-probe`: every AI search bot is allowed and robots.txt matches the repo.
  - Autocomplete within the allowance, written up in `keyword-research/2026-11-23-quranwall.md`.
- **Research pass.** Every Quran lock-screen, widget, daily-ayah and dhikr-reminder search shows only App Store listings, with no editorial answer. quranwall.com appears in none of them yet.
  - "Quran widget not updating" has no Quran-specific answer. The closest pages are help pages from non-Quran apps.
  - The competitor field of same-job widget apps is wider than the lock-screen roundup's six (for example Wird and nur).
  - Muslim Pro's help centre describes an updated Home and Lock Screen widget that can show an ayah, while its US listing still names only prayer widgets. What our roundups say stays true, because each statement is scoped to the listing. The next roundup pass re-reads it (p26).
  - A recurring ruling question ("is it allowed to have Quran verses as a wallpaper?") went to TODO-KAROL.md, not the queue.
- **Seasonal dates** (by web search, all expected): Ramadan 1448 begins about 8 February 2027, Laylat al-Qadr's 27th night falls about 5-6 March, Eid al-Fitr is 9 or 10 March, Rajab begins about 10 December 2026, Eid al-Adha is about 16-17 May 2027, and the Hijri new year 1449 is about 6 June 2027. p17's window still fits. No editorial guide to a Ramadan Lock Screen ranks.
- **Google watch.**
  - The upstream ledger has not changed since 2026-11-10. This is the first QuranWall marker, so every entry is recorded as known.
  - From Google's status feed: the November 2026 core update began on 2026-11-10 and was still rolling out today.
  - Google's help page says "Crawled - currently not indexed" is common and not necessarily a problem.
  - Nothing is urgent: the site does nothing that the spam or core guidance targets.

## Decided (and why)
- **Queued seven items (p20-p26).**
  - **p20 (refresh, correctness).** Remove the Unsplash photo credit from the five posts whose covers are now generated. The credit no longer matches the image. No date bump, because the change is not material.
  - **p21 (internal links).** Bring the product post back to the five-link cap by dropping the in-body About link, which AuthorBio already gives. Move the money-page link out of the roundup's first paragraph. Decision: rule 5's first-paragraph ban applies to every post.
  - **p22 (depth pass, product post).** Answer "why isn't my Quran widget or wallpaper changing?" with Apple-sourced causes and the app's real rotation behaviour, plus one line for "ayah of the day widget". Its SERP shares several results with the lock-screen SERP, so it goes on the same page.
  - **p24 (depth pass, dhikr roundup).** Add the section 5 roundup furniture and live-listing facts, and cover the zikr and counter phrasings honestly (QuranWall is not a counter).
  - **p23 (depth pass, morning routine).** Add a checklist section for the editorial checklist SERP instead of a new URL.
  - **p25 (depth pass, indexing fix).** Improve the crawled-but-not-indexed dhikr-reminders post. Its links are already in place, its SERP has no editorial how-to, and the dhikr-reminder phrasing shares most results with it.
  - **p26 (depth pass, lock-screen roundup, from 2026-12-08).** Add up to two verified same-job apps and re-read Muslim Pro's widget. It waits until the 2026-12-07 refresh has read p9's effect and the core update has finished, because it is the only page with a visible position.
- **Moved forward.**
  - **p16** (wallpaper post) moves from 2026-12-07 to today, because its gate (p1-p12 shipped) is met. It also gains the new Islamic-wallpaper evidence.
  - **p19** (transliteration post) moves from 2026-11-24 to today, because its cadence week began. Both still rank below every depth item.
- **Re-ranked.** The new order is correctness, then install-intent depth and links, then secondary depth and indexing, then new posts: p20, p21, p22, p24, p23, p25, p26, p17, p19, p16, then p18 (gated). Eight items are eligible today.
- **Not queued.**
  - No new URL beyond p16 and p19, and no ctr-fix, because no page has legible demand data.
  - No Ramadan post: there is no named demand yet, and p17 covers Ramadan on the existing pages.
  - No dua-widget or dhikr-counter page, because the app has neither.
  - No legal-page work.
- **Turkish gate (p18).** Not checked until 2026-12-15, as the item says.
- **TODO-KAROL.md.**
  - Deleted four resolved items: the CLAUDE.md line-21 item and the seven-questions item (both answered 2026-11-20), the social-proof item (answered 2026-11-17) and Request Indexing (all four URLs are indexed).
  - Moved the p12 lint decision out of "Blocks the machine", since it no longer blocks anything.
  - Added the ruling question.
- **SEO-STRATEGY.md.** The two "no baseline yet" passages now say the baseline was set, and the discovery read is in qualitative words.

## Built
- `src/data/seo-priorities.json`:
  - p20-p26 added.
  - p16, p17, p18 and p19 re-ranked and annotated.
  - The header note was refreshed and `updated` set to 2026-11-23.
- `src/data/seo-keywords.json`: eight new keywords, none blocked, each with the queue item that covers it and its SERP-overlap result.
- `src/data/keyword-clusters.json`:
  - Two new clusters (`best-dhikr-app`, `muslim-morning-routine`).
  - The widget cluster updated.
  - The wallpaper and transliteration clusters out of hold.
- `keyword-research/2026-11-23-quranwall.md`: the run note.
- `TODO-KAROL.md` and `SEO-STRATEGY.md`: as above.
- This entry and `seo-log/README.md`.

## Verified
- Every changed JSON file parses.
- The queue and keyword files round-trip byte for byte in their own formats: the queue escapes non-ASCII, and the keyword bank keeps one object per line.
- There are no duplicate item ids, and eight items are pending and eligible today.
- `kw check --staged`: 0 FAIL. Its warnings are older notes plus one direction word.
- `lint-facts --all` and `--prompts`: 0 FAIL.
- `git diff | grep` for clicks, impressions or CTR keys: nothing.
- No autopilot branch was waiting, so there was no merge to simulate.
- No gsc-data or report file is staged.

## Open
- **Karol.**
  - The ruling question (TODO-KAROL.md).
  - The monthly App Store Connect campaign review, first around 2026-12-16, after accepting Apple's updated agreement.
  - The earlier open items in TODO-KAROL.md.
- **Next refresh (2026-11-30).**
  - Read the day-14 indexing state of `/features` and the three money posts.
  - Check whether the dhikr-reminders post was indexed and p25's result.
  - Check whether query rows have started to appear.
  - Check whether the core update has finished.
  - Read the brand query once rows exist.
  - Defer a machine post if Karol publishes two manual posts that week.
